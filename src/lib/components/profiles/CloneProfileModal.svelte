<script lang="ts">
    import { translations } from '$lib/utils/translationUtils';
    import Modal from './../core/Modal.svelte';

    export let show: boolean;
    export let onClose: () => void;

    $: lang = $translations;
</script>

<Modal title={lang.profiles.modal.cloneProfile.title} bind:show onClose={onClose}>
  
</Modal>