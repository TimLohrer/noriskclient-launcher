<script lang="ts">
	import Capes from './../lib/pages/Capes.svelte';
	import Play from './../lib/pages/Play.svelte';
    import { activeTab, selectTab } from '$lib/utils/navigationUtils';
    import { onMount } from 'svelte';
    import { language, setLanguage, translations } from '$lib/utils/translationUtils';
    import TopNavigationBar from '$lib/components/TopNavigationBar.svelte';
    import { launcherStartCompleted } from '$lib/utils/missilaniousUtils';
    import { loadProfiles } from '$lib/utils/profileUtils';
    import { accounts, loadAccounts } from '$lib/utils/accountUtils';
    import Settings from '$lib/pages/Settings.svelte';
    import { listen } from '@tauri-apps/api/event';
    import type { EventPayload, TeaTimeConfig } from '$lib/types/core';
    import { currentEvent } from '$lib/utils/eventUtils';
    import { loadConfig } from '$lib/utils/configUtils';
    import { loadTeaTimeConfig, teatimeConfig } from '$lib/utils/teatimeConfigUtils';
    import Profiles from '$lib/pages/Profiles.svelte';

    $: lang = $translations;

    let unlistenFunction: (() => void) | null = null;

    const initializeListener = async () => {
        try {
            unlistenFunction = await listen<EventPayload>('state_event', (event) => {
                console.log('State Event Received:', event.payload); // Zum Debuggen
                currentEvent.set(event.payload);
            });
        } catch (error) {
            console.error("Failed to initialize event listener:", error);
        }
    }

    teatimeConfig.subscribe((config: TeaTimeConfig | null) => {
        if (config !== null) {
            setLanguage(config.language);
            document.body.classList.forEach((className) => {
                if (className.startsWith('theme-')) {
                    document.body.classList.remove(className);
                }
            });
            document.body.classList.add(`theme-${config.theme.toLowerCase()}`);
        }
    });
    
    onMount(() => {
        loadTeaTimeConfig();
        setLanguage($language);
        loadConfig();
        loadAccounts();
        loadProfiles();

        setTimeout(() => {
            launcherStartCompleted.set(true);
        }, 1000);

        initializeListener();
    	return () => {
			if (unlistenFunction) {
                console.log("Cleaning up state_event listener.");
				unlistenFunction();
			}
		};
    });
</script>

{#if lang?.dummy}
    <div class="window">
        <div class="drag-bar">
            <TopNavigationBar />
        </div>
        <div class="content">
            {#if $activeTab == 'play'}
                <Play />
            {:else if $activeTab == 'profiles'}
                <Profiles />
            {:else if $activeTab == 'cape'}
                <Capes />
            {:else if $activeTab == 'settings'}
                <Settings />
            {/if}
        </div>
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <div class="drag-bar" data-tauri-drag-region />
    </div>
{/if}

<style>
    .window {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 1200px;
        height: 800px;
        overflow: hidden;
    }

    .drag-bar {
        width: 100%;
        height: 8.5%;
        z-index: 1000;
        background-color: var(--background-contrast-color);
    }

    .content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 83%;
    }
</style>