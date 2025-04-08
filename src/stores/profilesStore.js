import { get, writable } from "svelte/store";
import { invoke } from "@tauri-apps/api";
import { addNotification } from "./notificationStore.js";
import { launcherOptions } from "./optionsStore.js";
import { v4 as uuidv4 } from "uuid";
import { branches } from "./branchesStore.js";
import { noriskLog, version } from "../utils/noriskUtils.js";

export const profiles = writable();

export async function fetchProfiles() {
  await invoke("get_launcher_profiles").then((result) => {
    console.info(`Loaded launcher profiles: `, result);
    get(branches).forEach(branch => {
      if (get(launcherOptions).experimentalMode) {
        const branchProfile = result.experimentalProfiles.find(p => p.branch === branch);
        if (!branchProfile) {
          const profileId = uuidv4();
          result.experimentalProfiles.push({
            id: profileId,
            branch: branch,
            name: `${branch} - Default`,
            mods: [],
          });
          result.selectedExperimentalProfiles[branch] = profileId;
        }
      } else {
        const branchProfile = result.mainProfiles.find(p => p.branch === branch);
        if (!branchProfile) {
          const profileId = uuidv4();
          result.mainProfiles.push({
            id: profileId,
            branch: branch,
            name: `${branch} - Default`,
            mods: [],
          });
          result.selectedMainProfiles[branch] = profileId;
        }
      }
      const branchAddons = result.addons[branch];
      if (!branchAddons) {
        result.addons[branch] = {
          shaders: [],
          resourcePacks: [],
          datapacks: [],
        };
      }
    });

    result.store = function() {
      console.debug("Storing Launcher Profiles: ", result);
      noriskLog("Storing Launcher Profiles...");
      invoke("store_launcher_profiles", { launcherProfiles: result }).catch(e => addNotification(e));
    };

    result.store();
    profiles.set(result);
  }).catch((error) => {
    addNotification("Failed to load launcher profiles: " + error);
  });

  // Custom mods bug migration
  if (parseInt(get(version).split(".")[2] ?? "-1") >= 12) {
    const launcherProfiles = get(profiles);
    const todo = [launcherProfiles.mainProfiles, launcherProfiles.experimentalProfiles];

    // Check if any mod actually needs migration before proceeding
    let needsMigration = false;
    for (const profileList of todo) {
      for (const profile of profileList) {
        for (const mod of profile.mods) {
          const artifact_data = mod.value.source.artifact.split(":");
          if (artifact_data[0] === "CUSTOM" && artifact_data[1] === profile.name) {
            needsMigration = true;
            break; // Found one, no need to check further in this profile
          }
        }
        if (needsMigration) break; // Found one, no need to check further in this list
      }
      if (needsMigration) break; // Found one, no need to check further
    }

    if (needsMigration) {
      noriskLog("Performing custom mod migration...");
      let migrationOccurred = false; // Track if any mod was actually migrated in this run
      await Promise.all(
        todo.map(async profiles => {
          await Promise.all(
            profiles.map(async profile => {
              await Promise.all(
                profile.mods.map(async mod => {
                  const artifact_data = mod.value.source.artifact.split(":");
                  if (artifact_data[0] === "CUSTOM" && artifact_data[1] === profile.name) {
                    // Update to new format
                    const oldArtifact = mod.value.source.artifact;
                    mod.value.source.artifact = `CUSTOM:${profile.id}:${artifact_data[2]}`;
                    migrationOccurred = true; // Mark that a migration happened
                    noriskLog(`Updating mod artifact from ${oldArtifact} to ${mod.value.source.artifact}`);

                    // Copy to new location
                    const options = get(launcherOptions);
                    const dataPath = options.dataPath;
                    let splitter = "";
                    if (dataPath.split("/")[0] == "") {
                      splitter = "/";
                    } else {
                      splitter = "\\";
                    }

                    const oldLocation = [dataPath, "mod_cache", "CUSTOM", profile.name, artifact_data[2]].join(splitter);
                    noriskLog(`Attempting to migrate custom mod ${artifact_data[2]} from ${oldLocation}`);

                    await invoke("save_custom_mod_to_folder", {
                      options: get(launcherOptions),
                      profileId: profile.id,
                      file: { name: artifact_data[2], location: oldLocation },
                    }).then(() => {
                      noriskLog(`Successfully migrated custom mod ${artifact_data[2]} to new location for profile ${profile.id}`);
                    }).catch((error) => {
                      // Don't halt everything, but log the error
                      addNotification(`Failed to migrate custom mod ${artifact_data[2]} from ${oldLocation}: ${error}`);
                      noriskLog(`Failed to migrate custom mod ${artifact_data[2]} from ${oldLocation}: ${error}`);
                      // Revert artifact change if copy failed
                      mod.value.source.artifact = oldArtifact;
                      migrationOccurred = false; // Revert migration status for this mod
                      noriskLog(`Reverted artifact change for ${artifact_data[2]} due to copy failure.`);
                    });
                  }
                })
              );
            })
          );
        })
      );
      // Only save if a migration actually occurred successfully
      if (migrationOccurred) {
        noriskLog("Custom mod migration complete, saving updated profiles.");
        launcherProfiles.store();
      } else {
        noriskLog("Custom mod migration check complete, no changes needed or migration failed.");
      }
    } else {
      noriskLog("Skipping custom mod migration check: No mods in old format found.");
    }
  }
}
