<script lang="ts">
	import Setting from './../settings/Setting.svelte';
	import Button from './../core/Button.svelte';
	import TextInput from './../core/inputs/TextInput.svelte';
	import SetupProgressBar from './../core/SetupProgressBar.svelte';
    import { translations } from '$lib/utils/translationUtils';
    import Modal from './../core/Modal.svelte';
    import { onMount } from 'svelte';
    import type { ModLoader, Profile } from '$lib/types/profile';
    import { clearLoaderVersions, fabricVersions, forgeVersions, loadLoaderVersions, neoforgeVersions, quiltVersions, vanillaVersions } from '$lib/utils/loaderUtils';
    import { hexToRGB } from '$lib/utils/colorUtils';
    import { teatimeConfig } from '$lib/utils/teatimeConfigUtils';
    import VanillaIcon from '$lib/images/loaders/vanilla.png';
    import FabricIcon from '$lib/images/loaders/fabric.png';
    import ForgeIconDark from '$lib/images/loaders/forge_dark.png';
    import ForgeIconWhite from '$lib/images/loaders/forge_white.png';
    import NeoForgeIcon from '$lib/images/loaders/neoforge.png';
    import QuiltIcon from '$lib/images/loaders/quilt.png';
    import { createProfile } from '$lib/utils/profileUtils';

    $: lang = $translations;
    
    export let show: boolean;

    const EMPTY_PROFILE: Profile = {
        id: '',
        name: '',
        description: '',
        game_version: '',
        loader: 'vanilla',
        loader_version: '',
        group: '',
        created: '',
        path: '',
        disabled_norisk_mods_detailed: [],
        state: 'not_installed',
        source_standard_profile_id: null,
        is_standard_version: false,
        last_played: null,
        mods: [],
        norisk_information: null,
        selected_norisk_pack_id: null,
        banner: null,
        settings: {
            extra_args: [],
            fullscreen: false,
            resolution: {
                width: 1920,
                height: 1080,
            },
            java_path: '',
            memory: {
                min: 2048,
                max: 4096,
            }
        }
    };

    interface Step {
        name: string;
        skippable: boolean;
        isComlete: () => boolean;
        isActive?: () => boolean;
    }

    let newProfile: Profile = EMPTY_PROFILE;
    let versionTabIndex = 0;
    let versionFilter: string = '';
    let isLoadingLoaderVersions = false;

    let STEPS: Step[] = [];

    let step = 0;

    function close() {
        show = false;
        step = 0;
        newProfile = EMPTY_PROFILE;
        versionTabIndex = 0;
        versionFilter = '';
        clearLoaderVersions();
    }

    function getLoaderColor(loader: ModLoader) {
        switch (loader) {
            case 'vanilla': 
                return [124, 179, 66];
            case 'fabric':
                return [224, 219, 172];
            case 'forge':
                return $teatimeConfig?.theme.toLowerCase() == 'dark' ? [104, 107, 105] : [193, 192, 192];
            case 'neoforge':
                return [239, 148, 56];
            case 'quilt':
                return [180, 117, 192];
        }
    }

    function doesLoaderExistForCurrentVersion(loader: ModLoader) {
        switch (loader) {
            case 'vanilla':
                return true;
            case 'fabric':
                return $fabricVersions.some(v => v.intermediary.version === newProfile.game_version);
            case 'forge':
                return $forgeVersions.some(v => v.game_version === newProfile.game_version);
            case 'neoforge':
                return $neoforgeVersions.length > 0;
            case 'quilt':
                return $quiltVersions.some(v => v.intermediary.version === newProfile.game_version);
        }
    }

    async function create() {
        step++;
        await createProfile(newProfile);
        setTimeout(() => {
            close();
        }, 1000);
    }

    onMount(() => {
        STEPS = [
            {
                name: lang.profiles.modal.createProfile.step.general,
                skippable: false,
                isComlete: () => newProfile.name.length > 0 && newProfile.name.length <= 40,
            },
            {
                name: lang.profiles.modal.createProfile.step.version,
                skippable: false,
                isComlete: () => newProfile.game_version !== ''
            },
            {
                name: lang.profiles.modal.createProfile.step.loader,
                skippable: false,
                isComlete: () => !isLoadingLoaderVersions,
            },
            {
                name: lang.profiles.modal.createProfile.step.loaderVersion,
                skippable: false,
                isComlete: () => newProfile.loader_version !== '',
                isActive: () => newProfile.loader !== 'vanilla'
            },
            {
                name: lang.profiles.modal.createProfile.step.advanced,
                skippable: true,
                isComlete: () => newProfile.settings != EMPTY_PROFILE.settings
            },
            {
                name: lang.profiles.modal.createProfile.step.finished,
                skippable: false,
                isComlete: () => true
            }
        ];        
    });
</script>

<Modal title={lang.profiles.modal.createProfile.title} bind:show onClose={close}>
    {#if STEPS}
        <div class="create-profile-modal-content-wrapper">
            <SetupProgressBar bind:step steps={STEPS.map(s => s.name)} inactive={STEPS.filter(s => s.isActive !== undefined && !s.isActive()).map(s => s.name)} lineWidth='120px' />
            <div class="step-wrapper">
                {#if step === 0}
                    <div class="general-wrapper">
                        <TextInput bind:value={newProfile.name} label={lang.profiles.modal.createProfile.input.name.label} width='100%' required />
                        <TextInput bind:value={newProfile.description!} label={lang.profiles.modal.createProfile.input.description.label} width='100%' height='125px' multiline />
                        <TextInput bind:value={newProfile.group!} label={lang.profiles.modal.createProfile.input.group.label} width='100%' />
                    </div>
                {:else if step === 1}
                    <div class="version-wrapper">
                        <div class="header">
                            <TextInput bind:value={versionFilter} width='567.5px' placeholder={lang.profiles.modal.createProfile.input.searchVersions.placeholder} />
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <p
                                class="version-name"
                                style='font-size: 30px; background-color: {versionTabIndex == 1 ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                onclick={() => {
                                    versionTabIndex = versionTabIndex === 1 ? 0 : 1;
                                    versionFilter = '';
                                }}
                                class:active={versionTabIndex === 1}
                            >{versionTabIndex == 0 ? lang.profiles.modal.createProfile.button.snapshots : lang.profiles.modal.createProfile.button.releases}</p>
                        </div>
                        <div class="list-wrapper">
                            {#each $vanillaVersions!.versions.filter(v => ((versionTabIndex == 0 && v.id.startsWith('1.') && !v.id.includes('-')) || versionTabIndex == 1) && v.id.toLowerCase().includes(versionFilter.toLowerCase())) as version}
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                <p
                                    class="version-name"
                                    class:active={newProfile.game_version === version.id}
                                    style='width: {versionTabIndex === 0 ? 125 : 161.5}px; font-size: {version.id.length > 10 ? 25 : 35}px; background-color: {newProfile.game_version === version.id ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                    onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                    onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                    onclick={() => {
                                        isLoadingLoaderVersions = true;
                                        loadLoaderVersions(version.id).then(() => isLoadingLoaderVersions = false);
                                        newProfile.game_version = version.id;
                                        newProfile.loader = 'vanilla';
                                        newProfile.loader_version = '';
                                    }}
                                >{version.id}</p>
                            {/each}
                        </div>
                    </div>
                {:else if step === 2}
                    <div class="modloader-wrapper">
                        {#if isLoadingLoaderVersions}
                            <p style="font-size: 45px;">{lang.profiles.modal.createProfile.loadingLoaderVersions}</p>
                        {:else}
                            {#each ['vanilla', 'fabric', 'forge', 'neoforge', 'quilt'] as loader}
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <div
                                    class="loader"
                                    class:active={newProfile.loader === loader as ModLoader}
                                    style='border-color: rgb({newProfile.loader === loader as ModLoader ? getLoaderColor(loader as ModLoader).join(',') : hexToRGB('var(--font-color)')}); background-color: rgba({newProfile.loader === loader as ModLoader ? getLoaderColor(loader as ModLoader).join(',') + ',0.2' : '0,0,0,0'});'
                                    onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${getLoaderColor(loader as ModLoader).join(',')}, 0.2)`)}
                                    onmouseleave={(e) => newProfile.loader !== loader as ModLoader ? (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`) : null}
                                    onclick={() => {
                                        newProfile.loader = loader as ModLoader;
                                        newProfile.loader_version = '';
                                    }}
                                    class:disabled={!doesLoaderExistForCurrentVersion(loader as ModLoader)}
                                >
                                    {#if loader === 'vanilla'}
                                        <img class="loader-icon" src={VanillaIcon} alt='Vanilla' />
                                    {:else if loader === 'fabric'}
                                        <img class="loader-icon" src={FabricIcon} alt='Fabric' />
                                    {:else if loader === 'forge'}
                                        <img class="loader-icon" src={$teatimeConfig?.theme.toLowerCase() == 'dark' ? ForgeIconWhite : ForgeIconDark} alt='Forge' />
                                    {:else if loader === 'neoforge'}
                                        <img class="loader-icon" src={NeoForgeIcon} alt='NeoForge' />
                                    {:else if loader === 'quilt'}
                                        <img class="loader-icon" src={QuiltIcon} alt='Quilt' />
                                    {/if}
                                    <p class="loader-name" style='color: rgb({newProfile.loader === loader as ModLoader ? getLoaderColor(loader as ModLoader).join(',') : hexToRGB('var(--font-color)')});'>{loader}</p>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {:else if step === 3}
                    <div class="loader-version-wrapper">
                        <TextInput bind:value={versionFilter} width='100%' placeholder={lang.profiles.modal.createProfile.input.searchLoaderVersions.placeholder} />
                        <div class="list-wrapper">
                            {#if newProfile.loader === 'fabric'}
                                {#each $fabricVersions!.filter(v => v.intermediary.version === newProfile.game_version && v.loader.version.toLowerCase().includes(versionFilter.toLowerCase())).map(v => v.loader.version) as version}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <p
                                        class="version-name"
                                        class:active={newProfile.loader_version === version}
                                        style='width: 161.5px; font-size: {version.length > 10 ? 25 : 35}px; background-color: {newProfile.loader_version === version ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                        onclick={() => {
                                            newProfile.loader_version = version;
                                        }}
                                    >{version}</p>
                                {/each}
                            {:else if newProfile.loader === 'forge'}
                                {#each $forgeVersions!.filter(v => v.loader_version.toLowerCase().includes(versionFilter.toLowerCase())).map(v => v.loader_version) as version}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <p
                                        class="version-name"
                                        class:active={newProfile.loader_version === version}
                                        style='width: 161.5px; font-size: {version.length > 10 ? 25 : 35}px; background-color: {newProfile.loader_version === version ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                        onclick={() => {
                                            newProfile.loader_version = version;
                                        }}
                                    >{version}</p>
                                {/each}
                            {:else if newProfile.loader === 'neoforge'}
                                {#each $neoforgeVersions!.filter(v => v.toLowerCase().includes(versionFilter.toLowerCase())) as version}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <p
                                        class="version-name"
                                        class:active={newProfile.loader_version === version}
                                        style='width: 161.5px; font-size: {version.length > 10 ? 25 : 35}px; background-color: {newProfile.loader_version === version ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                        onclick={() => {
                                            newProfile.loader_version = version;
                                        }}
                                    >{version}</p>
                                {/each}
                            {:else if newProfile.loader === 'quilt'}
                                {#each $quiltVersions!.filter(v => v.intermediary.version === newProfile.game_version && v.loader.version.toLowerCase().includes(versionFilter.toLowerCase())).map(v => v.loader.version) as version}
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <p
                                        class="version-name"
                                        class:active={newProfile.loader_version === version}
                                        style='width: 161.5px; font-size: {version.length > 10 ? 25 : 35}px; background-color: {newProfile.loader_version === version ? `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)` : `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`};'
                                        onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
                                        onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
                                        onclick={() => {
                                            newProfile.loader_version = version;
                                        }}
                                    >{version}</p>
                                {/each}
                            {/if}
                        </div>
                    </div>
                {:else if step === 4}
                    <div class="advanced-wrapper">
                        <Setting bind:value={newProfile.settings.fullscreen} label={lang.profiles.modal.createProfile.advanced.inputs.fullscreen.label} />
                    </div>
                {:else if step === 5}
                    <div class="finished-wrapper">
                        <p style="font-size: 45px;">{lang.profiles.modal.createProfile.creatingProfile}</p>
                    </div>
                {/if}
            </div>
            {#if step < STEPS.length - 1}
                <div class="button-wrapper">
                    <Button onClick={STEPS[step - 1]?.isActive !== undefined && !STEPS[step - 1].isActive!() ? () => step -= 2 : () => step--} disabled={step == 0} style='red' height='30px' width='80px'>{lang.profiles.modal.createProfile.button.back}</Button>
                    {#if step < STEPS.length - 2}
                        {#if STEPS[step].skippable && !STEPS[step].isComlete()}
                            <Button
                                onClick={() => step++}
                                style='default'
                                height='30px'
                                width='80px'
                            >{lang.profiles.modal.createProfile.button.skip}</Button>
                        {:else}
                            <Button
                                onClick={STEPS[step + 1].isActive !== undefined && !STEPS[step + 1].isActive!() ? () => step += 2 : () => step++}
                                disabled={!STEPS[step].isComlete()}
                                style='default' 
                                height='30px' 
                                width='80px'
                            >{lang.profiles.modal.createProfile.button.next}</Button>
                        {/if}
                    {:else}
                        <Button
                            onClick={() => create()}
                            style='green'
                            height='30px'
                            width='80px'
                        >{lang.profiles.modal.createProfile.button.create}</Button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</Modal>

<style>
    .create-profile-modal-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 750px;
        height: 500px;
    }

    .step-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0 15px 15px 15px;
        margin-top: 20px;
        overflow-y: auto;
    }

    .general-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 15px;
    }

    .version-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        height: 100%;
        width: 100%;
        gap: 7.5px;
    }

    .version-wrapper .header {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        gap: 15px;
        width: 100%;
        height: 50px;
        padding: 0 15px;
        padding-bottom: 7.5px;
    }

    .version-wrapper .list-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
        flex-wrap: wrap;
        gap: 15px;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .version-wrapper .version-name {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 5px;
        height: 35px;   
        width: 125px;
        color: var(--font-color);
        border: 3px solid var(--font-color);
        backdrop-filter: blur(5px);
        font-size: 35px;
        overflow: hidden;
        white-space: nowrap;
        cursor: pointer;
    }

    .version-wrapper .list-wrapper .version-name.active {
        color: var(--primary-color);
        border-color: var(--primary-color);
        letter-spacing: 1px;
    }

    .version-wrapper .list-wrapper .version-name:hover {
        backdrop-filter: blur(10px);
        letter-spacing: 1px;
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .modloader-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        height: 100%;
        width: 100%;
        gap: 20px;
    }

    .modloader-wrapper .loader {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 165px;
        height: 165px;
        gap: 20px;
        cursor: pointer;
        border: 3px solid;
        backdrop-filter: blur(5px);
    }

    .modloader-wrapper .loader.active, .modloader-wrapper .loader:hover {
        backdrop-filter: blur(10px);
    }

    .modloader-wrapper .loader.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .modloader-wrapper .loader .loader-icon {
        width: 75px;
        height: 75px;
    }

    .modloader-wrapper .loader .loader-name {
        font-size: 40px;
        text-align: center;
        width: 100%;
        overflow: hidden;
    }

    .loader-version-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        height: 100%;
        width: 100%;
        gap: 15px;
    }

    .loader-version-wrapper .list-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
        flex-wrap: wrap;
        gap: 15px;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .loader-version-wrapper .list-wrapper .version-name {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 5px;
        height: 35px;   
        width: 161.5px;
        color: var(--font-color);
        border: 3px solid var(--font-color);
        backdrop-filter: blur(5px);
        font-size: 35px;
        overflow: hidden;
        white-space: nowrap;
        cursor: pointer;
    }

    .loader-version-wrapper .list-wrapper .version-name.active {
        color: var(--primary-color);
        border-color: var(--primary-color);
        letter-spacing: 1px;
    }

    .loader-version-wrapper .list-wrapper .version-name:hover {
        backdrop-filter: blur(10px);
        letter-spacing: 1px;
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .advanced-wrapper {
        display: flex;
        flex-direction: column;
        width: 70%;
        align-self: center;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }

    .finished-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    .button-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding: 0 15px 10px 15px;
    }
</style>