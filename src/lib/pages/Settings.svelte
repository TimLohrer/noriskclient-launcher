<script lang="ts">
	import SlidingPageWrapper from './../components/SlidingPageWrapper.svelte';
	import Setting from './../components/settings/Setting.svelte';
	import AccountsModal from '$lib/components/settings/AccountsModal.svelte';
    import { translations } from '$lib/utils/translationUtils';
    import { launcherConfig, launcherVersion } from '$lib/utils/configUtils';
    import { setConfig } from '$lib/api/config';
    import { teatimeConfig } from '$lib/utils/teatimeConfigUtils';
  import { setTeaTimeConfig } from '$lib/api/teatimeConfig';

    $: lang = $translations;

    let showAccountsModal = false;

    launcherConfig.subscribe((config) => {
        if (config !== null) {
            // auto save after 1 second
            setTimeout(() => {
                if ($launcherConfig === config) {
                    setConfig(config);
                }
            }, 1000);
        }
    });

    teatimeConfig.subscribe((config) => {
        if (config !== null) {
            // auto save after 1 second
            setTimeout(() => {
                if ($teatimeConfig === config) {
                    setTeaTimeConfig(config);
                }
            }, 1000);
        }
    });

    function toggleTheme() {
        if ($teatimeConfig!.theme.toLowerCase() === 'dark') {
            $teatimeConfig!.theme = 'LIGHT';
        } else {
            $teatimeConfig!.theme = 'DARK';
        }
    }
</script>

<AccountsModal bind:showAccountsModal />
<SlidingPageWrapper page="settings" allowOverflow>
    <div class="settings-wrapper">
        {#if $launcherConfig !== null && $teatimeConfig !== null}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <span class="spacer" />
            <Setting bind:value={$launcherConfig.auto_check_updates} bind:label={lang.settings.autoCheckUpdates.label} bind:description={lang.settings.autoCheckUpdates.description} />
            <Setting bind:value={$launcherConfig.enable_discord_presence} bind:label={lang.settings.enableDiscordPresence.label} bind:description={lang.settings.enableDiscordPresence.description} />
            <Setting bind:value={$launcherConfig.check_beta_channel} bind:label={lang.settings.checkBetaChannel.label} bind:description={lang.settings.checkBetaChannel.description} />
            <Setting bind:value={$launcherConfig.concurrent_downloads} min={1} max={10} bind:label={lang.settings.concurrentDownloads.label} bind:description={lang.settings.concurrentDownloads.description} />
            <Setting value={() => showAccountsModal = true} bind:label={lang.settings.accounts.label} bind:buttonLabel={lang.settings.accounts.buttonLabel} buttonColor={'var(--primary-color)'} />
            <Setting value={toggleTheme} bind:label={lang.settings.theme.label} buttonLabel={$teatimeConfig.theme.toLowerCase() === 'dark' ? lang.settings.theme.buttonLabelDark : lang.settings.theme.buttonLabelLight} buttonColor={'var(--primary-color)'} />
            <Setting bind:value={$launcherConfig.is_experimental} bind:label={lang.settings.experimentalMode.label} bind:description={lang.settings.experimentalMode.description} />
            <p class="version">{lang.settings.version.replace('{{LAUNCHER_VERSION}}', $launcherVersion).replace('{{CONFIG_VERSION}}', $launcherConfig.version)}</p>
        {:else}
            <p>loading settings...</p>
        {/if}
    </div>
</SlidingPageWrapper>

<style>
    .settings-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .spacer {
        height: 250px;
    }

    .version {
        font-size: 25px;
        color: var(--text-color);
        margin-bottom: 20px;
    }
</style>