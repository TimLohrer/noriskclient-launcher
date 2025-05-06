<script lang="ts">
    export let value: string;
    export let label: string = '';
    export let minLength: number = 0;
    export let maxLength: number = Number.MAX_SAFE_INTEGER;
    export let width: string = 'auto';
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
    <p class="label">{label}</p>
    <!-- svelte-ignore a11y_autofocus -->
    <input
        type="text"
        class="text-input"
        style={`width: ${width}; height: ${height};`}
        bind:value={value}
        minlength={minLength}
        maxlength={maxLength}
        onchange={onChange}
    />
</div>

<style>
    .text-input-wrapper {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 5px;
    }

    .text-input-wrapper .label {
        font-size: 27.5px;
        font-weight: 600;
        color: var(--color-text);
    }

    .text-input {
        background-color: var(--color-background);
        color: var(--text-color);
        font-size: 30px;
        padding-left: 10px;
        padding-bottom: 2.5px;
        border: 3px solid var(--font-color);
        outline: none;
        transition-duration: 100ms;
    }

    .text-input:focus {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
</style>