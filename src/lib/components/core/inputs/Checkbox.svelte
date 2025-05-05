<script lang="ts">
    import Check from '$lib/images/settings/check.png';

    export let value: boolean;
</script>

<div class="checkbox-wrapper">
    <input type="checkbox" bind:checked={value} class="checkbox" onclick={() => value = !value} />
    <img src={Check} alt="check" class="check" class:hidden={!value} />
</div>

<style>
    .checkbox {
        width: 35px;
        height: 35px;
        cursor: pointer;
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        border: 3px solid var(--font-color);
        transition-duration: 100ms;
    }

    .checkbox:checked {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .check {
        position: absolute;
        margin-top: 10px;
        margin-left: -25px;
        transform: scale(1.1);
        transition-duration: 100ms;
    }

    .check.hidden {
        opacity: 0;
        transform: scale(1);
    }
</style>