<script lang="ts">
    export let step: number;
    export let steps: string[];
    export let inactive: string[] = [];
    export let lineWidth: string = '75px';
</script>

<div class="setup-progress-bar">
    {#each steps as stepName, index}
        <div class="step-dot" class:active={index <= step} class:inactive={inactive.includes(stepName)}>
            <p class="step-name" class:active={index === step} class:inactive={inactive.includes(stepName)}>{stepName}</p>
        </div>
        {#if index < steps.length - 1}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <div class="step-line" class:current={step === index} class:active={step - 1 >= index} style={`width: ${lineWidth};`} />
        {/if}
    {/each}
</div>

<style>
    .setup-progress-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        height: 50px;
        margin-top: 20px;
    }

    .step-dot {
        display: flex;
        justify-content: center;
        width: 15px;
        height: 15px;
        border-radius: 1px;
        font-size: 12px;
        background-color: var(--font-color);
    }

    .step-dot.inactive {
        width: 11.5px;
        height: 11.5px;
    }

    .step-dot.active {
        background-color: var(--primary-color);
    }

    .step-line {
        height: 7.5px;
        background-color: var(--font-color);
    }

    .step-line.current {
        background: linear-gradient(
            to right,
            var(--primary-color) 2%,
            var(--font-color) 5%
        );
    }

    .step-line.active {
        background-color: var(--primary-color);
    }

    .step-name {
        position: absolute;
        font-size: 25px;
        margin-top: -27.5px;
        color: var(--font-color);
    }

    .step-name.inactive {
        margin-top: -30px;
        opacity: 0.5;
    }

    .step-name.active {
        color: var(--primary-color);
    }
</style>