<script lang="ts">
    export let value: number;
    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;

    function onChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const newValue = parseInt(input.value, 10);
        if (newValue >= min && newValue <= max) {
            value = newValue;
        } else {
            input.value = value.toString(); // Reset to the last valid value
        }
    }
</script>

<input type="number" value={value} min={min} max={max} class="number-input" placeholder="5" onchange={onChange} />

<style>
    .number-input {
        width: 30px;
        height: 37.5px;
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

    input[type=number] {
        -moz-appearance: textfield;
    }
</style>