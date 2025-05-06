<script lang="ts">
    import { hexToRGB } from "$lib/utils/colorUtils";
    import { teatimeConfig } from "$lib/utils/teatimeConfigUtils";

    export let onClick: () => void;
    export let disabled: boolean = false;
    export let style: 'default' | 'green' | 'red' | 'custom' = 'default';
    export let color: string = style == 'default' ? 'var(--primary-color)' : style === 'green' ? 'var(--green-text)' : style === 'red' ? 'var(--red-text)' : '';
    export let width: string = '80px';
    export let height: string = 'auto';
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="button"
    onclick={onClick}
    style="border: 3px solid {color}; color: {color}; width: {width}; height: {height}; background-color: rgba({($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05);"
    class:disabled={disabled}
    onmouseenter={(e) => (e.currentTarget.style.backgroundColor = `rgba(${hexToRGB(color).join(',')}, 0.2)`)}
    onmouseleave={(e) => (e.currentTarget.style.backgroundColor = `rgba(${($teatimeConfig?.theme.toLowerCase() == 'dark' ? [0,0,0] : [255,255,255]).join(',')}, 0.05)`)}
>
    <slot />
</div>

<style>
    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5px 20px 5px 20px;
        cursor: pointer;
        transition: 0.1s ease-in-out;
        backdrop-filter: blur(5px);
    }

    .button.disabled {
        pointer-events: none;
        opacity: 0.25;
    }

    .button:hover {
        backdrop-filter: blur(10px);
    }
</style>