<script>
    import {invoke} from "@tauri-apps/api";
    import NameIconSubdomainTab from "./create/NameIconSubdomainTab.svelte";
    import VersionTab from "./create/VersionTab.svelte";
    import LoaderVersionTab from "./create/LoaderVersionTab.svelte";
    import TypeTab from "./create/TypeTab.svelte";
    import EulaTab from "./create/EulaTab.svelte";
    import VanillaIcon from "../../../images/custom-servers/vanilla.png";
    import ForgeDarkIcon from "../../../images/custom-servers/forge_dark.png";
    import ForgeWhiteIcon from "../../../images/custom-servers/forge_white.png";
    import NeoForgeIcon from "../../../images/custom-servers/neo_forge.png";
    import FabricIcon from "../../../images/custom-servers/fabric.png";
    import QuiltIcon from "../../../images/custom-servers/quilt.png";
    import PaperIcon from "../../../images/custom-servers/paper.png";
    import FoliaIcon from "../../../images/custom-servers/folia.png";
    import PurpurIcon from "../../../images/custom-servers/purpur.png";
    import BukkitIcon from "../../../images/custom-servers/bukkit.png";
    import SpigotIcon from "../../../images/custom-servers/spigot.png";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher()

    export let options;
    export let customServerProgress;
    export let baseDomain;

    let createdServer;

    /**
     * Flow: Server Name & Icon & Subdomain -> Server Type -> Mc Version -> ggf Loader Version -> Info -> [Details]
     */
    let currentTab = "NAME_ICON_SUBDOMAIN";
    let name = "";
    let subdomain = "";
    let icon = null;
    let type = "";
    let mcVersion = "";
    let majorVersion = "";
    let loaderVersion = null;
    let eula = false;

    let availableTypes = {
        "VANILLA": {
            "name": "Vanilla",
            "type": "VANILLA",
            "iconUrl": VanillaIcon,
            "downloadHash": "",
            "requiresLoader": false,
            "versions": []
        },
        "FABRIC": {
            "name": "Fabric",
            "type": "FABRIC",
            "iconUrl": FabricIcon,
            "requiresLoader": true,
            "versions": [],
            "loaderVersions": []
        },
        "QUILT": {
            "name": "Quilt",
            "type": "QUILT",
            "iconUrl": QuiltIcon,
            "requiresLoader": true,
            "versions": [],
            "loaderVersions": []
        },
        "FORGE": {
            "name": "Forge",
            "type": "FORGE",
            "iconUrl": options.theme == "DARK" ? ForgeWhiteIcon : ForgeDarkIcon,
            "requiresLoader": true,
            "versions": [],
            "loaderVersions": []
        },
        "NEO_FORGE": {
            "name": "Neo Forge",
            "type": "NEO_FORGE",
            "iconUrl": NeoForgeIcon,
            "requiresLoader": true,
            "versions": [],
            "loaderVersions": []
        },
        "PAPER": {
            "name": "Paper",
            "type": "PAPER",
            "iconUrl": PaperIcon,
            "requiresLoader": false,
            "versions": []
        },
        "FOLIA": {
            "name": "Folia",
            "type": "FOLIA",
            "iconUrl": FoliaIcon,
            "requiresLoader": false,
            "versions": []
        },
        "PURPUR": {
            "name": "Purpur",
            "type": "PURPUR",
            "iconUrl": PurpurIcon,
            "requiresLoader": false,
            "versions": []
        },
        "SPIGOT": {
            "name": "Spigot",
            "type": "SPIGOT",
            "iconUrl": SpigotIcon,
            "requiresLoader": false,
            "versions": []
        },
        "BUKKIT": {
            "name": "Bukkit",
            "type": "BUKKIT",
            "iconUrl": BukkitIcon,
            "requiresLoader": false,
            "versions": []
        }
    };

    async function createServer() {
        const loginData = options.accounts.find(obj => obj.uuid === options.currentUuid);
        const server = {
            name: name,
            subdomain: subdomain,
            icon: icon,
            type: type,
            mcVersion: mcVersion,
            loaderVersion: loaderVersion,
            eula: eula
        };
        await invoke("create_custom_server", {
            mcVersion: server.mcVersion,
            loaderVersion: server.loaderVersion,
            type: server.type,
            subdomain: server.subdomain,
            token: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
            uuid: options.currentUuid,
        }).then(async (newServer) => {
            console.log('Created Server:', newServer);
            createdServer = newServer;
            customServerProgress[newServer._id] = { label: "Initializing...", progress: 0, max: 0 };
            
            let additionalData = null;
            if (newServer.type == "VANILLA") {
                additionalData = availableTypes[type].downloadHash;
            }
            
            currentTab = "INITIALIZING";

            await invoke("initialize_custom_server", {
                customServer: newServer,
                additionalData: additionalData,
                token: options.experimentalMode ? loginData.experimentalToken : loginData.noriskToken,
            }).then(() => {
                console.log('Initialized Server:', newServer);
                currentTab = "COMPLETED";
                // delete customServerProgress[newServer._id];
            }).catch((error) => {
                console.error(error);
                dispatch("back");
                alert(error);
            });
        }).catch((error) => {
            console.error(error);
            dispatch("back");
            alert(error);
        });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<h1 class="home-button" style="left: 220px;" on:click={createdServer != null ? () => dispatch("backAndUpdate") : () => dispatch("back")}>[BACK]</h1>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<h1 class="home-button" style="right: 220px;" on:click={() => dispatch("home")}>[HOME]</h1>
<div class="create-server-wrapper">
    {#if currentTab === "NAME_ICON_SUBDOMAIN"}
        <NameIconSubdomainTab bind:options={options} bind:name={name} bind:icon={icon} bind:subdomain={subdomain} baseDomain={baseDomain} on:next={() => currentTab = "TYPE"}/>
    {:else if currentTab === "TYPE"}
        <TypeTab bind:type={type} bind:version={mcVersion} bind:majorVersion={majorVersion} bind:loaderVersion={loaderVersion} bind:availableTypes={availableTypes} on:back={() => currentTab = "NAME_ICON_SUBDOMAIN"} on:next={() => currentTab = "VERSIONS"}/>
    {:else if currentTab === "VERSIONS"}
        <VersionTab bind:type={type} bind:availableTypes={availableTypes} bind:version={mcVersion} bind:majorVersion={majorVersion} on:back={() => currentTab = "TYPE"} on:next={() => currentTab = availableTypes[type].requiresLoader ? "LOADER_VERSIONS" : "INFO"}/>
    {:else if currentTab === "LOADER_VERSIONS"}
        <LoaderVersionTab bind:type={type} bind:availableTypes={availableTypes} bind:version={mcVersion} bind:loaderVersion={loaderVersion} on:back={() => currentTab = "VERSIONS"} on:next={() => currentTab = "INFO"}/>
    {:else if currentTab === "INFO"}
        <EulaTab bind:eula={eula} on:back={() => currentTab = availableTypes[type].requiresLoader ? "LOADER_VERSIONS" : "VERSIONS"} on:next={createServer} />
    {:else if currentTab === "INITIALIZING"}
        <div class="center">
            <h1>{customServerProgress[createdServer._id] ? customServerProgress[createdServer._id].label : 'Initializing...'}</h1>
        </div>
    {:else if currentTab = "COMPLETED"}
        <div class="center">
            <h1>Server successfully created!</h1>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <h1 class="details" on:click={() => dispatch('details', createdServer)}>Open Details Page</h1>
        </div>
    {/if}
</div>

<style>
    .create-server-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.7em;
    }

    .home-button {
        position: absolute;
        bottom: 1em; /* Abstand vom oberen Rand anpassen */
        transition: transform 0.3s;
        font-size: 20px;
        color: #e8e8e8;
        text-shadow: 2px 2px #7a7777;
        font-family: 'Press Start 2P', serif;
        cursor: pointer;
    }

    h1 {
        font-family: 'Press Start 2P', serif;
        font-size: 20px;
    }

    .home-button:hover {
        transform: scale(1.2);
    }

    .details {
        font-family: 'Press Start 2P', serif;
        font-size: 20px;
        color: var(--primary-color);
        text-shadow: 2px 2px var(--primary-color-text-shadow);
        cursor: pointer;
        transition: transform 0.3s;
    }

    .center {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
