<script>
	import { translations } from './../../utils/translationUtils.js';
  import { fade } from "svelte/transition";
  import { noriskError, noriskWarning, noriskLog } from "../../utils/noriskUtils.js";
  import { openErrorPopup, openInfoPopup } from "../../utils/popupUtils.js";
  import { notifications, removeNotification } from "../../stores/notificationStore.js";

  export let id = "0";
  export let type = "ERROR";
  export let message = "";
  export let details = null;

  /** @type {{ [key: string]: any }} */
  $: lang = $translations;

  function open() {
    if (!$notifications.find(n => n.id == id)) { return; }
    if (type === "ERROR") {
      noriskError(message);
      openErrorPopup({ title: lang.notification.error.title, content: details ?? message, contentFontSize: message.length > 100 ? "12.5px" : "15px", onClose: () => removeNotification(id) });
    } else if (type === "WARNING") {
      noriskWarning(message);
      openErrorPopup({ title: lang.notification.warning.title, content: details ?? message, closeButton: "OK", onClose: () => removeNotification(id) });
    } else {
      noriskLog(message);
      openInfoPopup({ title: lang.notification.info.title, content: details ?? message, onClose: () => removeNotification(id) });
    }
    removeNotification(id);
  }
</script>

<style>
    .notification {
        font-size: 14px;
        padding: 16px;
        margin: 8px 0;
        position: relative;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        text-shadow: none;
        cursor: pointer;
    }

    .notification.error {
        background-color: #ff5252;
        color: var(--background-contrast-color);
    }

    .notification.info {
        background-color: var(--primary-color);
        color: var(--background-contrast-color);
    }

    .notification.warning {
        background-color: #ff9800;
        color: var(--background-contrast-color);
    }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="notification" class:error={type == "ERROR"} class:info={type == "INFO"} class:warning={type == "WARNING"} id={id} on:click={open} transition:fade>
  {type == "ERROR" ? lang.notification.error.defaultText : type == "WARNING" ? lang.notification.warning.defaultText : message}
</div>
