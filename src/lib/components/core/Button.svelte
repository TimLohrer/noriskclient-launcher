<script lang="ts">
    export let onClick: () => void;
    export let label: string;
    export let color: string;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="button" onclick={onClick} style="border: 3px solid {color};">
    <p style="color: {color};">{label}</p>
</div>

<style>
    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5px 20px 5px 20px;
        cursor: pointer;
    }

    .button:hover {
        filter: brightness(0.8);
    }
</style>