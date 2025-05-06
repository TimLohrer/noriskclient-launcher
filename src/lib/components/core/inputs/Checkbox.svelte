<script lang="ts">
    import Check from '$lib/images/settings/check.png';
    import { hexToRGB } from '$lib/utils/colorUtils';
    import { teatimeConfig } from '$lib/utils/teatimeConfigUtils';

    export let value: boolean;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="checkbox-wrapper"
    style="background-color: rgba({($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05);"
    onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB('var(--primary-color)').join(',')}, 0.2)`)}
    onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
>
    <input type="checkbox" bind:checked={value} class="checkbox" onclick={() => value = !value} />
    <img src={Check} alt="check" class="check" class:hidden={!value} />
</div>

<style>
    .checkbox-wrapper {
        height: 35px;
        width: 35px;
    }

    .checkbox {
        width: 35px;
        height: 35px;
        cursor: pointer;
        border: 3px solid var(--font-color);
        transition-duration: 100ms;
    }

    .checkbox:hover {
        border-color: var(--primary-color);
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