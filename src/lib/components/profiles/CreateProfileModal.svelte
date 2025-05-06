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
        loader: 'forge',
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

    let newProfile: Profile = EMPTY_PROFILE;

    let STEPS: string[] = [];
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
            lang.profiles.modal.createProfile.step.general,
            lang.profiles.modal.createProfile.step.version,
            lang.profiles.modal.createProfile.step.loader,
            lang.profiles.modal.createProfile.step.advanced,
            lang.profiles.modal.createProfile.step.finished
        ];
    });
</script>

<Modal title={lang.profiles.modal.createProfile.title} bind:show onClose={close}>
    <div class="create-profile-modal-content-wrapper">
        <SetupProgressBar bind:step steps={STEPS} lineWidth='100px' />
        <div class="step-wrapper">
            {#if step === 0}
                <div class="general-wrapper">
                    <TextInput bind:value={newProfile.name} label={lang.profiles.modal.createProfile.input.name.label} width='99%' />
                    <TextInput bind:value={newProfile.description!} label={lang.profiles.modal.createProfile.input.description.label} width='99%' />
                    <TextInput bind:value={newProfile.group!} label={lang.profiles.modal.createProfile.input.group.label} width='99%' />
                </div>
            {:else if step === 1}
            {:else if step === 2}
            {:else if step === 3}
            {:else if step === 4}
            {/if}
        </div>
        <div class="button-wrapper">
            <Button onClick={() => step--} style='red' height='30px' width='80px'>{lang.profiles.modal.createProfile.button.back}</Button>
            {#if step < STEPS.length - 1}
                <Button onClick={() => step++} style='default' height='30px' width='80px'>{lang.profiles.modal.createProfile.button.next}</Button>
            {:else}
                <Button onClick={() => create()} style='green' height='30px' width='80px'>{lang.profiles.modal.createProfile.button.finish}</Button>
            {/if}
        </div>
    </div>
</Modal>

<style>
    .create-profile-modal-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 700px;
        height: 500px;
    }

    .step-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0 20px;
        overflow-y: auto;
    }

    .general-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
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
        padding: 0 20px 20px 20px;
    }
</style>