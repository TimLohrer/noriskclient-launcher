<script lang="ts">
    export let value: number;
    export let placeholder: string = '';
    export let label: string = '';
    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;
    export let width: string = '30px';
    export let height: string = '37.5px';
    export let manageInput: boolean = false;

    function onChange(event: Event) {
        if (!manageInput) return;
        const input = event.target as HTMLInputElement;
        const newValue = parseInt(input.value, 10);
        if (newValue >= min && newValue <= max) {
            value = newValue;
        } else {
            input.value = value.toString(); // Reset to the last valid value
        }
    }
</script>

<div class="number-input-wrapper">
    <p class="label">{label}</p>
    <input
        type="number"
        class="number-input"
        style={`width: ${width}; height: ${height};`}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onchange={onChange}
    />
</div>

<style>
    .number-input-wrapper {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 5px;
    }

    .number-input-wrapper .label {
        font-size: 40px;
        font-weight: 600;
        letter-spacing: 1px;
        color: var(--color-text);
    }

    .number-input {
        background-color: var(--color-background);
        color: var(--text-color);
        font-size: 30px;
        padding-left: 10px;
        padding-bottom: 2.5px;
        border: 3px solid var(--font-color);
        outline: none;
        transition-duration: 100ms;
    }

    .number-input:focus {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .number-input::placeholder {
        color: var(--background-contrast-color);
    }

    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
    }
</style>