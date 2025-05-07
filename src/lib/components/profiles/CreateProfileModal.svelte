<script lang="ts">
	import Button from './../core/Button.svelte';
	import TextInput from './../core/inputs/TextInput.svelte';
	import SetupProgressBar from './../core/SetupProgressBar.svelte';
    import { translations } from '$lib/utils/translationUtils';
    import Modal from './../core/Modal.svelte';
    import { onMount } from 'svelte';
    import type { Profile } from '$lib/types/profile';
    
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
        source_standard_profile_id: '',
        is_standard_version: false,
        last_played: '',
        mods: [],
        norisk_information: {
            is_experimental: false,
            keep_local_assets: false,
        },
        selected_norisk_pack_id: '',
        banner: null,
        settings: {
            custom_jvm_args: '',
            extra_game_args: [],
            fullscreen: false,
            resolution: {
                width: 1920,
                height: 1080,
            },
            java_path: '',
            memory: {
                min: 2048,
                max: 4096,
            },
            use_custom_java_path: false,
        }
    };

    interface Step {
        name: string;
        skippable: boolean;
        isComlete: () => boolean;
        isActive?: () => boolean;
    }

    let newProfile: Profile = EMPTY_PROFILE;

    let STEPS: Step[] = [];

    let step = 0;

    function close() {
        show = false;
        step = 0;
        newProfile = EMPTY_PROFILE;
    }

    function create() {
        close();
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
                isComlete: () => true
            },
            {
                name: lang.profiles.modal.createProfile.step.loaderVersion,
                skippable: true,
                isComlete: () => true,
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
                        <TextInput bind:value={newProfile.name} label={lang.profiles.modal.createProfile.input.name.label} width='98%' required />
                        <TextInput bind:value={newProfile.description!} label={lang.profiles.modal.createProfile.input.description.label} width='98%' height='125px' multiline />
                        <TextInput bind:value={newProfile.group!} label={lang.profiles.modal.createProfile.input.group.label} width='98%' />
                    </div>
                {:else if step === 1}
                {:else if step === 2}
                {:else if step === 3}
                {:else if step === 4}
                {/if}
            </div>
            <div class="button-wrapper">
                <Button onClick={STEPS[step - 1]?.isActive !== undefined && !STEPS[step - 1].isActive!() ? () => step -= 2 : () => step--} disabled={step == 0} style='red' height='30px' width='80px'>{lang.profiles.modal.createProfile.button.back}</Button>
                {#if step < STEPS.length - 1}
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

    .button-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding: 0 20px 10px 20px;
    }
</style>