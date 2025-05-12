<script lang="ts">
    import { translations } from '$lib/utils/translationUtils';
    import { onMount } from 'svelte';
    import Modal from './../core/Modal.svelte';

    export let show: boolean;
    export let onClose: () => void;

    $: lang = $translations;

    let activeTabIndex = 0;
    let TABS: Tab[] = [];

    interface Tab {
        name: string;
        isEnabled: () => boolean
    }

    function close() {
        activeTabIndex = 0;
        onClose();
    }

    onMount(() => {
        TABS = [
            {
                name: lang.profiles.modal.profileSettings.sidebar.general,
                isEnabled: () => true
            },
            {
                name: lang.profiles.modal.profileSettings.sidebar.installation,
                isEnabled: () => true
            },
            {
                name: lang.profiles.modal.profileSettings.sidebar.addons,
                isEnabled: () => true
            },
            {
                name: lang.profiles.modal.profileSettings.sidebar.advanced,
                isEnabled: () => true
            }
        ]
    });
</script>

<Modal title={lang.profiles.modal.profileSettings.title} bind:show onClose={close}>
    <div class="profile-settings-modal-wrapper">
        <div class="sidebar">
            {#each TABS as tab, index}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                    class="tab"
                    class:active={activeTabIndex === index}
                    class:disabled={!tab.isEnabled()}
                    onclick={() => activeTabIndex = index}
                >
                    <p class="tab-name">{tab.name}</p>
                </div>
            {/each}
        </div>
    </div>
</Modal>

<style>
    .profile-settings-modal-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        height: 400px;
        width: 850px;
    }

    .profile-settings-modal-wrapper .sidebar {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        width: 175px;
    }

    .profile-settings-modal-wrapper .sidebar .tab {
        display: flex;
        align-items: center;
        justify-content: start;
        padding: 10px;
        width: 100%;
        height: 50px;
        backdrop-filter: blur(5px);
        border: 3px solid var(--background-contrast-color);
        cursor: pointer;
    }

    .profile-settings-modal-wrapper .sidebar .tab.active {
        border-color: var(--primary-color);
    }
    
    .profile-settings-modal-wrapper .sidebar .tab.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .tab .tab-name {
        font-size: 35px;
    }

</style>