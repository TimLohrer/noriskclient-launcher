<script lang="ts">
    import { translations } from '$lib/utils/translationUtils';
    import Modal from './../core/Modal.svelte';

    export let show: boolean;

    $: lang = $translations;
</script>

<Modal title={lang.profiles.modal.createProfile.title} bind:show>

</Modal>