<script lang="ts">
  import { selectedAccount } from "$lib/utils/accountUtils";
    import { activeTab, selectTab, tabs } from "$lib/utils/navigationUtils";
    import { translations } from "$lib/utils/translationUtils";
    import { onMount } from "svelte";

    $: lang = $translations;

    onMount(() => {
        tabs.set([
            {
                slug: 'settings',
                name: lang.navbar.settings,
                requiresAccount: false,
                onClick: () => selectTab('settings')
            },
            {
                slug: 'servers',
                name: lang.navbar.servers,
                requiresAccount: true,
                onClick: () => selectTab('servers')
            },
            {
                slug: 'cape',
                name: lang.navbar.cape,
                requiresAccount: true,
                onClick: () => selectTab('cape')
            },
            {
                slug: 'play',
                name: lang.navbar.play,
                requiresAccount: false,
                onClick: () => selectTab('play')
            },
            {
                slug: 'profiles',
                name: lang.navbar.profiles,
                requiresAccount: true,
                onClick: () => selectTab('profiles')
            },
            {
                slug: 'addons',
                name: lang.navbar.addons,
                requiresAccount: true,
                onClick: () => selectTab('addons')
            },
            {
                slug: 'quit',
                name: lang.navbar.quit,
                requiresAccount: false,
                onClick: () => {}
            }
        ]);
    });
</script>

<div class="top-navbar-root" data-tauri-drag-region>
    {#each $tabs as tab, i}
        <div class="tab">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <p
                class="name"
                on:click={tab.requiresAccount && $selectedAccount === null ? null : tab.onClick}
                class:quit={tab.slug == 'quit'}
                class:disabled={tab.requiresAccount && $selectedAccount === null}
                class:active={$activeTab == tab.slug}
            >{tab.name}</p>
            {#if i != $tabs.length - 1}
                <p class="seperator">|</p>
            {/if}
        </div>
    {/each}
</div>

<style>
    .top-navbar-root {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
    
    .tab {
        display: flex;
        flex-direction: row;
        height: 75%;
    }

    .tab .name {
        font-size: 47.5px;
        cursor: pointer;
        padding: 0 25px;
    }

    .tab .name:not(.disabled):not(.active):not(.quit):hover {
        color: var(--hover-color);
    }
    
    .tab .name.quit {
        color: var(--red-text);
    }

    .tab .name.quit:hover {
        transform: scale(0.95);
        transition-duration: 100ms;
    }

    .tab .name.disabled {
        opacity: 0.15;
        cursor: default;
    }

    .tab .name.active {
        color: var(--primary-color);
        text-shadow: var(--primary-color-text-shadow) 2px 2px;
        transform: scaleX(1.15);
    }
    
    .tab .seperator {
        font-size: 50px;
    }
</style>