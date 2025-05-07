<script lang="ts">
	import Button from './../core/Button.svelte';
	import TextInput from './../core/inputs/TextInput.svelte';
    import { translations } from '$lib/utils/translationUtils';
    import Modal from './../core/Modal.svelte';
    import { cloneProfile } from '$lib/utils/profileUtils';
    import type { Profile } from '$lib/types/profile';
    
    $: lang = $translations;

    export let show: boolean;
    export let onClose: () => void;
    export let profile: Profile | null = null;

    $: profileName = `${profile?.name} (copy)`;

    async function clone() {
        if (await cloneProfile(profile!.id, profileName)) {
            show = false;
            profileName = '';
            onClose();
        }
    }
</script>

<Modal title={lang.profiles.modal.cloneProfile.title} bind:show onClose={onClose}>
    <div class="clone-profile-modal-content-wrapper">
        <TextInput
            bind:value={profileName}
            bind:label={lang.profiles.modal.cloneProfile.input.profileName.label}
            required
        />
        <div class="button-wrapper">
            <Button
                onClick={() => {show = false; onClose();}}
                style='red'
            >{lang.profiles.modal.cloneProfile.button.cancel}</Button>
            <Button
                onClick={clone}
                disabled={profileName.length <= 0 || profileName.length > 40}
                style='green'
            >{lang.profiles.modal.cloneProfile.button.clone}</Button>
        </div>
    </div>
</Modal>

<style>
    .clone-profile-modal-content-wrapper {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        gap: 15px;
        width: 100%;
        height: 100%;
    }

    .button-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
</style>