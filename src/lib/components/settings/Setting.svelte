<script lang="ts">
	import TextInput from './../core/inputs/TextInput.svelte';
	import NumberInput from '../core/inputs/NumberInput.svelte';
	import Checkbox from './../core/inputs/Checkbox.svelte';
	import Button from './../core/Button.svelte';
    
    export let value: any;
    export let placeholder: string = '';
    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;
    export let buttonLabel: string = '';
    export let manageInput: boolean = false;
    export let label: string;
    export let description: string = '';
</script>

<div class="setting">
    <div class="info">
        <p class="label">{label}</p>
        {#if description}
            <p class="description">{description}</p>
        {/if}
    </div>
    {#if typeof value == 'boolean'}
        <Checkbox bind:value />
    {:else if typeof value == 'string'}
        <TextInput bind:value bind:minLength={min} bind:maxLength={max} bind:placeholder bind:manageInput />
    {:else if typeof value == 'number'}
        <NumberInput bind:value bind:min bind:max bind:placeholder bind:manageInput />
    {:else if typeof value == 'function'}
        <Button onClick={value} style='default'>{buttonLabel}</Button>
    {/if}
</div>

<style>
    .setting {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
        width: 100%;
        gap: 40px;
        margin-bottom: 50px;
    }

    .info {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: space-between;
        gap: 5px;
        width: 400px;
    }

    .info .label {
        font-size: 40px;
        font-weight: 600;
        letter-spacing: 1px;
        color: var(--color-text);
    }

    .info .description {
        font-size: 27.5px;
        font-weight: 400;
        color: var(--color-text);
        line-height: 15px;
    }
</style>