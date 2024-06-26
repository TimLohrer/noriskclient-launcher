<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api";
  import { appWindow } from "@tauri-apps/api/window";
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { listen } from "@tauri-apps/api/event";
  import SkinButton from "./SkinButton.svelte";
  import LoadingScreen from "../loading/LoadingScreen.svelte";
  import SettingsModal from "../config/ConfigModal.svelte";
  import McRealAppModal from "../mcRealApp/McRealAppModal.svelte";
  import ProfilesScreen from "../profiles/ProfilesScreen.svelte";
  import SkinScreen from "../skin/SkinScreen.svelte";
  import CapeScreen from "../cape/CapeScreen.svelte";
  import AddonsScreen from "../addons/AddonsScreen.svelte";
  import InvitePopup from "../invite/InvitePopup.svelte";
  import ServersScreen from "../servers/ServersScreen.svelte";
  import ClientLog from "../log/LogPopup.svelte";
  import NoRiskLogoColor from "../../images/norisk_logo_color.png";

  export let options;
  let branches = [];
  let launcherProfiles = {};
  let featureWhitelist = [];
  let friendInviteSlots = {};
  let discordLinked = false;
  let currentBranchIndex = 0;
  let clientRunning;
  let fakeClientRunning = false;
  let refreshingAccount = false;
  let forceServer = null;

  let progressBarMax = 0;
  let progressBarProgress = 0;
  let progressBarLabel = "";
  let settingsShown = false;
  let mcRealQrCodeShown = false;
  let clientLogShown = false;
  let showProfilesScreen = false;
  let showProfilesScreenHack = false;
  let showSkinScreen = false;
  let showSkinScreenHack = false;
  let showCapeScreen = false;
  let showCapeScreenHack = false;
  let showAddonsScreen = false;
  let showAddonsScreenHack = false;
  let showInvitePopup = false;
  let showServersScreen = false;
  let showServersScreenHack = false;
  let log = [];
  let customServerProgress = {};
  let customServerLogs = {};

  listen("process-output", event => {
    log = [...log, event.payload];
  });

  listen("progress-update", event => {
    let progressUpdate = event.payload;

    switch (progressUpdate.type) {
      case "max": {
        progressBarMax = progressUpdate.value;
        break;
      }
      case "progress": {
        progressBarProgress = progressUpdate.value;
        break;
      }
      case "label": {
        progressBarLabel = progressUpdate.value;
        break;
      }
    }
  });

  listen("custom-server-process-output", event => {
    console.log(event.payload);
    if (customServerLogs[event.payload.server_id] == null) {
      customServerLogs[event.payload.server_id] = [];
    }
    customServerLogs[event.payload.server_id] = [...customServerLogs[event.payload.server_id], event.payload.data];
  });

  listen("custom-server-progress-update", event => {
    let progressUpdate = event.payload.data;

    if (customServerProgress[event.payload.server_id] == null) {
      customServerProgress[event.payload.server_id] = {label: '', progress: 0, max: 0};
    }

    switch (progressUpdate.type) {
      case "max": {
        customServerProgress[event.payload.server_id]["max"] = progressUpdate.value;
        break;
      }
      case "progress": {
        customServerProgress[event.payload.server_id]["progress"] = progressUpdate.value;
        break;
      }
      case "label": {
        customServerProgress[event.payload.server_id]["label"] = progressUpdate.value;
        break;
      }
    }
  });

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

  function handleSwitchBranch(isLeft) {
    const totalBranches = branches.length;

    if (isLeft) {
      currentBranchIndex = (currentBranchIndex - 1 + totalBranches) % totalBranches;
    } else {
      currentBranchIndex = (currentBranchIndex + 1) % totalBranches;
    }
  }

  async function requestBranches() {
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    console.log(options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken);
    await invoke("request_norisk_branches", {
      noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
      uuid: options.currentUuid
    })
      .then((result) => {
        const latestBranch = options.experimentalMode ? options.latestDevBranch : options.latestBranch;
        console.debug("Received Branches Latest Branch: " + latestBranch, result);
        branches = result;
        branches.sort(function(a, b) {
          if (a === latestBranch) {
            return -1;
          } else if (b === latestBranch) {
            return 1;
          } else {
            return a.localeCompare(b);
          }
        });
      })
      .catch((reason) => {
        alert(reason);
        console.error(reason);
      });

    await invoke("get_launcher_profiles").then((profiles) => {
      console.info(`Loaded launcher profiles: `, profiles);
      branches.forEach(branch => {
        if (options.experimentalMode) {
          const branchProfile = profiles.experimentalProfiles.find(p => p.branch == branch);
          if (!branchProfile) {
            const profileId = uuidv4();
            profiles.experimentalProfiles.push({
              id: profileId,
              branch: branch,
              name: `${branch} - Default`,
              mods: []
            });
            profiles.selectedExperimentalProfiles[branch] = profileId;
          }
        } else {
          const branchProfile = profiles.mainProfiles.find(p => p.branch == branch);
          if (!branchProfile) {
            const profileId = uuidv4();
            profiles.mainProfiles.push({
              id: profileId,
              branch: branch,
              name: `${branch} - Default`,
              mods: []
            });
            profiles.selectedMainProfiles[branch] = profileId;
          }
        }
        const branchAddons = profiles.addons[branch];
        if (!branchAddons) {
          profiles.addons[branch] = {
            shaders: [],
            resourcePacks: [],
            datapacks: []
          };
        }
      });

      profiles.store = function() {
        console.debug("storing launcher profiles", profiles);
        console.log(profiles)
        invoke("store_launcher_profiles", { launcherProfiles: profiles }).catch(e => console.error(e));
      }

      profiles.store();

      launcherProfiles = profiles;
    }).catch((err) => {
      console.error(`Failed to load launcher profiles: ${err}`);
      alert(`Failed to load launcher profiles: ${err}`);
    })
  }

  async function checkFeatureWhitelist(feature) {
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    await invoke("check_feature_whitelist", {
      feature: feature,
      noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
      uuid: options.currentUuid
    }).then((result) => {
      console.debug(feature + ":", result);
      if (!result) return;
      featureWhitelist.push(feature.toUpperCase().replaceAll(" ", "_"));
    }).catch((reason) => {
      console.error(reason);
      featureWhitelist = [];
    });
  }

  async function loadFriendInvites() {
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    await invoke("get_whitelist_slots", {
      noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
      uuid: options.currentUuid
    }).then((result) => {
      console.debug("Received Whitelist Slots", result);
      friendInviteSlots = result;
    }).catch((reason) => {
      alert(reason);
      console.error(reason);
      friendInviteSlots = {};
    });
  }

  async function loadAllData() {
    await requestBranches();
    featureWhitelist = [];
    await checkFeatureWhitelist("INVITE_FRIENDS");
    await checkFeatureWhitelist("CUSTOM_SERVERS");
    await checkFeatureWhitelist("MCREAL_APP");
    if (featureWhitelist.includes("INVITE_FRIENDS")) {
      await loadFriendInvites();
    }
    await check_discord_link();
  }

  onMount(() => {
    loadAllData();
  });

  listen("client-exited", () => {
    clientRunning = false;
    fakeClientRunning = false;
    progressBarLabel = null;
    progressBarProgress = 0;
    progressBarMax = null;
    forceServer = null;
  });
  
  listen("client-error", (e) => {
    clientLogShown = true;
    console.error(e.payload);
    forceServer = null;
  });

  export async function runClient() {
    if (clientRunning) {
      return;
    }
    if (refreshingAccount) {
      console.error("Refreshing Account...");
      return;
    }

    refreshingAccount = true;
    await invoke("refresh_via_norisk", { loginData: options.accounts.find(obj => obj.uuid === options.currentUuid) })
      .then((account) => {
        console.debug("Current UUID", options.currentUuid);
        console.debug("Account UUID", account.uuid);
        // Index des vorhandenen Objekts mit derselben UUID suchen
        let existingIndex = options.accounts.findIndex(obj => obj.uuid === account.uuid);
        if (existingIndex !== -1) {
          console.debug("###Replaced Refreshed  Account");
          options.accounts[existingIndex] = account;
        } else {
          console.debug("###Added Refreshed Account");
          options.accounts.push(account);
        }

        options.store();
      })
      //TODO also aktueller stand ist dass das hier manchmal failen kann und deswegen kann man nicht refreshen haha einfach hoffen lol...
      .catch(e => console.error("###" + e));
    refreshingAccount = false;

    console.log("Client started");
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    let launchManifest = {};
    let branch = branches[currentBranchIndex];
    let installedMods = [];
    log = [];
    clientRunning = true;
    fakeClientRunning = true;

    await invoke("get_launch_manifest", {
        branch: branch,
        noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
        uuid: options.currentUuid
    }).then((result) => {
        console.debug("Launch Manifest", result);
        launchManifest = result;
    }).catch((err) => {
        console.error(err);
    });

    if (options.experimentalMode) {
      options.latestDevBranch = branch;
    } else {
      options.latestBranch = branch;
    }

    options.store();

    let launcherProfile;
    if (options.experimentalMode) {
      const activeProfileId = launcherProfiles.selectedExperimentalProfiles[branch];
      launcherProfile = launcherProfiles.experimentalProfiles.find(p => p.id == activeProfileId);
    } else {
      const activeProfileId = launcherProfiles.selectedMainProfiles[branch];
      launcherProfile = launcherProfiles.mainProfiles.find(p => p.id == activeProfileId);
    }

    launcherProfile.mods.forEach(mod => {
      installedMods.push(mod.value);
      mod.dependencies.forEach((dependency) => {
        installedMods.push(dependency.value);
      });
    });

    home();

    console.debug("Running Branch", branch);
    console.log(forceServer);
    await invoke("run_client", {
      branch: branch,
      loginData: loginData,
      options: options,
      forceServer: forceServer != null ? forceServer : launchManifest.server?.length > 0 ? launchManifest.server : null,
      mods: installedMods,
      shaders: launcherProfiles.addons[branch].shaders,
      resourcepacks: launcherProfiles.addons[branch].resourcePacks,
      datapacks: launcherProfiles.addons[branch].datapacks
    });

    forceServer = `${forceServer}:LAUNCHED`;
  }

  let dataFolderPath;
  invoke("default_data_folder_path").then(result => {
    dataFolderPath = result;
  }).catch(e => {
    alert("Failed to get data folder: " + e);
    console.error(e);
  });

  function preventSelection(event) {
    event.preventDefault();
  }

  function handleShowInvitePopup() {
    showInvitePopup = true;
  }

  function handleOpenProfilesScreen() {
    showProfilesScreenHack = true;
    setTimeout(() => {
      showProfilesScreen = true;
    }, 300);
  }

  function handleOpenSkinScreen() {
    showSkinScreenHack = true;
    setTimeout(() => {
      showSkinScreen = true;
    }, 300);
  }

  function handleOpenCapeScreen() {
    showCapeScreenHack = true;
    setTimeout(() => {
      showCapeScreen = true;
    }, 300);
  }
  
  function handleOpenAddonsScreen() {
    showAddonsScreenHack = true;
    setTimeout(() => {
      showAddonsScreen = true;
    }, 300);
  }
  
  function handleOpenServersScreen() {
    showServersScreenHack = true;
    setTimeout(() => {
      showServersScreen = true;
    }, 300);
  }

  function home() {
    showInvitePopup = false;
    showProfilesScreen = false;
    showProfilesScreenHack = false;
    showSkinScreen = false;
    showSkinScreenHack = false;
    showCapeScreen = false;
    showCapeScreenHack = false;
    showAddonsScreen = false;
    showAddonsScreenHack = false;
    showServersScreen = false;
    showServersScreenHack = false;
  }

  function homeWhileClientRunning() {
    clientRunning = false;
    fakeClientRunning = true;
  }

  function backToLoadingScreen() {
    fakeClientRunning = false;
    setTimeout(() => {
      home()
      clientRunning = true;
    }, 100);
  }

  async function connect_discord_intigration() {
    if ((await check_discord_link()) === true) {
					discordLinked = true;
					return;
				}
				const loginData = options.accounts.find(
					(obj) => obj.uuid === options.currentUuid,
				);
				await invoke("connect_discord_intigration", { options, loginData })
					.then(() => {
						console.log("Connected to Discord Intigration");
					})
					.catch((err) => {
						console.error(err);
						alert(err);
					});
  }
  
  async function check_discord_link() {
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    let linked;
    await invoke("check_discord_intigration", {
      noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
      uuid: options.currentUuid
    }).then((result) => {
      discordLinked = result;
      linked = result;
    }).catch(err => {
      console.error(err);
      alert(err);
      linked = false;
    });
    return linked ?? false;
  }

  async function unlink_discord() {
    const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
    await invoke("unlink_discord_intigration", {
      noriskToken: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
      uuid: options.currentUuid
    }).then(() => {
      alert("Discord unlinked successfully!");
      check_discord_link();
    }).catch(async err => {
      console.error(err);
      const still_linked = await check_discord_link();
      if (still_linked) return;
      alert("Discord unlinked successfully!");
    });
  }

  function closeWindow() {
    appWindow.close();
  }
</script>


<div class="black-bar" data-tauri-drag-region></div>
<div class="content">
  {#if showInvitePopup}
    <InvitePopup on:getInviteSlots={loadFriendInvites} bind:options bind:showModal={showInvitePopup} bind:friendInviteSlots />
  {/if}

  {#if showAddonsScreen}
    <AddonsScreen on:home={home} bind:options bind:launcherProfiles bind:currentBranch={branches[currentBranchIndex]} />
  {/if}

  {#if showServersScreen}
    <ServersScreen on:home={home} on:play={runClient} bind:options bind:featureWhitelist bind:currentBranch={branches[currentBranchIndex]} bind:forceServer={forceServer} bind:customServerLogs={customServerLogs} bind:customServerProgress={customServerProgress} />
  {/if}

  {#if showProfilesScreen}
    <ProfilesScreen on:home={home} bind:options bind:allLauncherProfiles={launcherProfiles} branches={branches} currentBranchIndex={currentBranchIndex}></ProfilesScreen>
  {/if}

  {#if showSkinScreen}
    <SkinScreen on:home={home} bind:options></SkinScreen>
  {/if}

  {#if showCapeScreen}
    <CapeScreen on:home={home} bind:options></CapeScreen>
  {/if}

  {#if settingsShown}
    <SettingsModal on:requestBranches={() => { loadAllData(); }} bind:options bind:showModal={settingsShown} bind:featureWhitelist bind:showMcRealAppModal={mcRealQrCodeShown} />
  {/if}
  
  {#if mcRealQrCodeShown}
    <McRealAppModal bind:options bind:showModal={mcRealQrCodeShown}></McRealAppModal>
  {/if}

  {#if clientLogShown}
    <ClientLog messages={log} on:hideClientLog={() => clientLogShown = false} />
  {/if}

  {#if clientRunning}
    <LoadingScreen bind:log progressBarMax={progressBarMax} progressBarProgress={progressBarProgress} progressBarLabel={progressBarLabel} on:home={homeWhileClientRunning} />
  {/if}

  {#if (!showProfilesScreenHack && !showSkinScreenHack && !showCapeScreenHack && !showAddonsScreenHack && !showServersScreenHack) && !clientRunning && !clientLogShown}
    {#if fakeClientRunning}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <h1 class="back-to-loading-button" on:click={() => backToLoadingScreen()}>[BACK TO RUNNING GAME]</h1>
    {/if}
    <div transition:scale={{ x: 15, duration: 300, easing: quintOut }} class="left-settings-button-wrapper">
      {#if options.accounts.length > 0 && branches.length > 0 && options.currentUuid != null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={() => discordLinked ? unlink_discord() : connect_discord_intigration()}>{#if discordLinked}UN{/if}LINK DISCORD</h1>
      {/if}
    </div>
    <div transition:scale={{ x: 15, duration: 300, easing: quintOut }} class="settings-button-wrapper">
      {#if options.accounts.length > 0 && branches.length > 0 && options.currentUuid != null && featureWhitelist.includes("INVITE_FRIENDS") && (friendInviteSlots.availableSlots != -1 && friendInviteSlots.availableSlots > friendInviteSlots.previousInvites)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 class="invite-button" on:click={handleShowInvitePopup}><p>✨</p>Invite</h1>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <h1 on:click={() => settingsShown = true}>SETTINGS</h1>
      {#if options.accounts.length > 0 && branches.length > 0 && options.currentUuid != null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={handleOpenProfilesScreen}>PROFILES</h1>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={handleOpenServersScreen}>SERVERS</h1>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={handleOpenAddonsScreen}>ADDONS</h1>
        {#if featureWhitelist.includes("INVITE_FRIENDS") && friendInviteSlots.availableSlots == -1}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <h1 on:click={handleShowInvitePopup}>INVITE</h1>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={handleOpenCapeScreen}>CAPES</h1>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h1 on:click={handleOpenSkinScreen}>SKIN</h1>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <h1 class="quit" on:click={closeWindow}>QUIT</h1>
    </div>
    <img transition:scale={{ x: 15, duration: 300, easing: quintOut }}
      class="pokemon-title"
      src={NoRiskLogoColor}
      alt="Pokemon Title">
    <div class="branch-wrapper">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
      on:selectstart={preventSelection} style="cursor: pointer"
          on:mousedown={preventSelection} class="nes-font switch"
          on:click={() => handleSwitchBranch(true)}
          style:opacity={branches.length < 2 || options.currentUuid == null ? 0 : 100}>
        &lt;</h1>
      <section style="display:flex;justify-content:center">
        {#if refreshingAccount}
          <h1 class="nes-font" transition:scale={{ x: 15, duration: 300, easing: quintOut }} style="position:absolute">
            Loading Account...</h1>
        {:else if branches.length < 1 || options.currentUuid == null}
          <h1 class="nes-font" transition:scale={{ x: 15, duration: 300, easing: quintOut }}>
            Sign in...</h1>
        {:else}
          {#each branches as branch, i}
            {#if currentBranchIndex === i}
              <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
                  class="nes-font"
                  style="position:absolute"
                  on:selectstart={preventSelection}
                  on:mousedown={preventSelection}
              > {branch.toUpperCase()} VERSION</h1>
            {/if}
          {/each}
        {/if}
      </section>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
          on:selectstart={preventSelection}
          style="cursor: pointer" on:mousedown={preventSelection}
          class="nes-font switch" on:click={() => handleSwitchBranch(false)}
          style:opacity={branches.length < 2 || options.currentUuid == null ? 0 : 100}>
        &gt;</h1>
    </div>
    <SkinButton on:launch={runClient} on:requestBranches={() => loadAllData()} bind:options={options} bind:branches={branches} />
    <div transition:scale={{ x: 15, duration: 300, easing: quintOut }} on:selectstart={preventSelection}
        on:mousedown={preventSelection} class="copyright">
      © 2000-{new Date().getFullYear()} HGLabor/Friends Inc. v0.4.8
    </div>
  {/if}
</div>
<div class="black-bar" data-tauri-drag-region=""></div>

<style>
    .black-bar {
        width: 100%;
        height: 10vh;
        background-color: #151515;
    }

    .switch:hover {
        color: var(--hover-color);
        text-shadow: 2px 2px var(--hover-color-text-shadow);
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 80vh;
        gap: 20px;
        padding: 20px; /* Innenabstand für den Schlagschatten */
    }

    .branch-wrapper {
        display: flex;
        align-content: space-evenly;
        flex-direction: row;
        gap: 200px;
    }

    .pokemon-title {
        width: 80%;
        max-width: 400px;
        margin-bottom: 20px;
        image-rendering: pixelated;
    }

    .nes-font {
        font-family: 'Press Start 2P', serif;
        font-size: 18px;
        margin: 0;
        color: var(--primary-color);
        text-shadow: 2px 2px var(--primary-color-text-shadow);
        cursor: default;
    }

    .copyright {
        font-family: 'Press Start 2P', serif;
        font-size: 10px;
        margin-top: 0.3em;
        text-shadow: 1px 1px var(--hover-color-text-shadow);
        color: var(--hover-color);
        cursor: default;
    }

    .left-settings-button-wrapper {
        position: absolute;
        top: 5em;
        left: 2.5px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .left-settings-button-wrapper h1 {
        font-size: 11px;
        font-family: 'Press Start 2P', serif;
        margin-bottom: 1em;
        cursor: pointer;
        color: var(--secondary-color);
        text-shadow: 1px 1px var(--secondary-color-text-shadow);
        transition: transform 0.3s, color 0.25s, text-shadow 0.25s;
    }

    .left-settings-button-wrapper h1:hover {
        color: var(--hover-color);
        text-shadow: 1px 1px var(--hover-color-text-shadow);
        transform: scale(1.2);
    }
    
    .settings-button-wrapper {
        position: absolute;
        top: 5em;
        right: 0;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: end;
    }

    .settings-button-wrapper h1 {
        font-size: 11px;
        font-family: 'Press Start 2P', serif;
        margin-bottom: 1em;
        cursor: pointer;
        color: var(--secondary-color);
        text-shadow: 1px 1px var(--secondary-color-text-shadow);
        transition: transform 0.3s, color 0.25s, text-shadow 0.25s;
    }

    .settings-button-wrapper h1:hover {
        color: var(--hover-color);
        text-shadow: 1px 1px var(--hover-color-text-shadow);
        transform: scale(1.2);
    }
    
    .settings-button-wrapper h1.quit:hover {
        color: red;
        text-shadow: 1px 1px #460000;
        transform: scale(1.2);
    }

    .settings-button-wrapper h1.invite-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 12.5px;
    }

    .settings-button-wrapper h1.invite-button p {
      margin-bottom: 5px;
      padding-right: 5px;
      font-size: 15px;
    }

    .back-to-loading-button {
        position: absolute;
        bottom: 1em; /* Abstand vom oberen Rand anpassen */
        transition: transform 0.3s;
        font-size: 20px;
        color: #e8e8e8;
        text-shadow: 2px 2px #7a7777;
        font-family: 'Press Start 2P', serif;
        cursor: pointer;
    }

    .back-to-loading-button:hover {
        transform: scale(1.2);
    }
</style>
