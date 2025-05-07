<script lang="ts">
    export let value: string;
    export let label: string = '';
    export let placeholder: string = '';
    export let minLength: number = 0;
    export let maxLength: number = Number.MAX_SAFE_INTEGER;
    export let required: boolean = false;
    export let multiline: boolean = false;
    export let width: string = '100%';
    export let height: string = '37.5px';
    export let manageInput: boolean = false;

    function onChange(event: Event) {
        if (!manageInput) return;
        const input = event.target as HTMLInputElement;
        const newValue = input.value;
        if (newValue.length >= minLength && newValue.length <= maxLength) {
            value = newValue.toLowerCase();
        } else {
            input.value = value.toLowerCase(); // Reset to the last valid value
        }
    }
</script>

<div class="text-input-wrapper" style={`width: ${width};`}>
    {#if label.length > 0}
        <p class="label">{label}<span class="required" class:hidden={!required}>*</span></p>
    {/if}
    {#if multiline}
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <textarea
            class="text-input"
            style={`height: ${height}; min-height: ${height};`}
            bind:value={value}
            placeholder={placeholder}
            minlength={minLength}
            maxlength={maxLength}
            onchange={onChange}
        />
    {:else}
        <input
            type="text"
            class="text-input"
            style={`height: ${height};`}
            placeholder={placeholder}
            bind:value={value}
            minlength={minLength}
            maxlength={maxLength}
            onchange={onChange}
        />
    {/if}
</div>

<style>
    .text-input-wrapper {
        display: flex;
        flex-direction: column;
        align-items: start;
        width: 100%;
        gap: 5px;
    }

    .text-input-wrapper .label {
        font-size: 27.5px;
        font-weight: 600;
        color: var(--color-text);
    }

    .text-input-wrapper .label .required {
        color: var(--red-text);
        font-size: 27.5px;
        margin-left: 5px;
        font-weight: 600;
    }

    .text-input-wrapper .label .required.hidden {
        display: none;
    }

    .text-input {
        background-color: var(--color-background);
        color: var(--text-color);
        font-size: 30px;
        padding-left: 10px;
        padding-bottom: 2.5px;
        min-width: calc(100% - 15px);
        max-width: calc(100% - 15px);
        border: 3px solid var(--font-color);
        outline: none;
        transition-duration: 100ms;
    }

    .text-input:focus {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .text-input::placeholder {
        color: var(--font-color);
        opacity: 0.5;
    }
</style>