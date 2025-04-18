<script>
	import { open } from '@tauri-apps/plugin-dialog';
  import { invoke } from "@tauri-apps/api/core";
  import { fade } from "svelte/transition";
  import { createEventDispatcher, onMount } from "svelte";
  import { defaultUser } from "../../stores/credentialsStore.js";
  import { getNoRiskToken, noriskLog } from "../../utils/noriskUtils.js";
  import { addNotification } from "../../stores/notificationStore.js";
  import CapePlayer from "./CapePlayer.svelte";
  import { translations } from '../../utils/translationUtils.js';
    
  /** @type {{ [key: string]: any }} */
  $: lang = $translations;

  const dispatch = createEventDispatcher();

  export let capeHash = null;
  export let previewLocation = null;

  onMount(() => {
    dispatch("fetchNoRiskUser");
  });

  async function handlePreviewCape() {
    try {
      const location = await open({
        defaultPath: "/",
        multiple: false,
        directory: false,
        filters: [{ name: "Cape", extensions: ["png"] }],
      });
      if (!location) return;
      const content = await invoke("read_local_skin_file", { location });
      const result = await invoke("check_cape_resolution", { imageData: content });
      if (!result) {
        addNotification("Wrong Cape Resolution! Please use the template!");
        return;
      }
      dispatch("preview", `data:image/png;base64,${content}`);
      previewLocation = location;
    } catch (error) {
      addNotification(lang.cape.notification.failedToLoadCapeFile.replace("{error}", error));
    }
  }

  async function unequipCape() {
    if ($defaultUser) {
      await invoke("unequip_cape", {
        noriskToken: getNoRiskToken(),
        uuid: $defaultUser.id,
      }).then(() => {
        addNotification(lang.capes.notification.unequip.success, "INFO");
        capeHash = null;
        dispatch("fetchNoRiskUser");
      }).catch(error => {
        addNotification(lang.capes.notification.unequip.error.replace("{error}", error));
      });
    }
  }

  async function downloadTemplate() {
    await invoke("download_template_and_open_explorer").then(() => {
      noriskLog("Downloaded Template Cape...");
      addNotification(lang.capes.notification.downloadTemplate.success.info, "INFO", lang.capes.notification.downloadTemplate.success.details, 5000);
    }).catch(error => {
      addNotification(lang.capes.notification.downloadTemplate.error.replace("{error}", error));
    });
  }
</script>

<div in:fade={{ duration: 400 }} class="wrapper">
  {#if capeHash !== null}
    <h1 class="header-text">{lang.capes.yourCape}</h1>
    <CapePlayer cape={capeHash} data={null} />
  {:else}
    <div class="empty-text-wrapper">
      <h1 class="red-text empty-text">[{lang.capes.noCapeUploaded}]</h1>
    </div>
  {/if}
  <div class="button-wrapper">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h1 on:click={handlePreviewCape}>{lang.capes.button.upload}</h1>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h1 on:click={downloadTemplate}>{lang.capes.button.template}</h1>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h1 class="red-text-clickable" on:click={unequipCape}>{lang.capes.button.unequip}</h1>
  </div>
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        align-items: center;
        height: 100%;
        width: 100vw;
    }

    .header-text {
        font-size: 12.5px;
        margin-bottom: 3em;
        cursor: default;
    }

    .empty-text-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
    }

    .empty-text {
        font-size: 20px;
        cursor: default;
    }

    .button-wrapper {
        display: flex;
        gap: 4em;
    }

    .button-wrapper h1 {
        font-size: 17.5px;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .button-wrapper h1:first-child {
        color: #1cc009;
        text-shadow: 2px 2px #114609;
    }

    .button-wrapper h1:nth-child(2) {
        color: var(--primary-color);
        text-shadow: 2px 2px var(--primary-color-text-shadow);
    }

    .button-wrapper h1:hover {
        transform: scale(1.5);
    }
</style>
