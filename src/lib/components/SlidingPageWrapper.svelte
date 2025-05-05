<script lang="ts">
    import { launcherStartCompleted } from "$lib/utils/missilaniousUtils";
    import { closeTabDirection, resetCloseTabDirection } from "$lib/utils/navigationUtils";
    import { onMount } from "svelte";

    export let page: string;
    export let allowOverflow: boolean = false;

    closeTabDirection.subscribe((direction) => {
        if (!direction) return;
        const root = document.getElementById(`${page}-root`);
        if (root) {
            const oldAllowOverflow = allowOverflow;
            allowOverflow = false;
            root.animate(
                [
                    { transform: 'translateX(0)' },
                    { transform: `translateX(${direction == 'left' ? '-100%' : '100%'})` }
                ],
                {
                    duration: 100,
                    easing: 'ease-in',
                    fill: 'forwards'
                }
            );
            setTimeout(() => {
                allowOverflow = oldAllowOverflow;
            }, 100);
        }
    });

    onMount(() => {
        const root = document.getElementById(`${page}-root`);
        if (root) {
            const oldAllowOverflow = allowOverflow;
            allowOverflow = false;
            if (!$launcherStartCompleted) {
                return root.animate(
                    [
                        { transform: 'translateX(0)' }
                    ],
                    {
                        duration: 1,
                        easing: 'ease-out',
                        fill: 'forwards'
                    }
                );
            };
            root.animate(
                [
                    { transform: `translateX(${$closeTabDirection == 'right' ? '-100%' : '100%'})` },
                    { transform: 'translateX(0)' }
                ],
                {
                    duration: 150,
                    easing: 'ease-out',
                    fill: 'forwards'
                }
            );
            resetCloseTabDirection();
            setTimeout(() => {
                allowOverflow = oldAllowOverflow;
            }, 150);
        }
    });
</script>

<div class="active-sliding-page-root" class:allow-overflow={allowOverflow} id={`${page}-root`}>
    <slot />
</div>

<style>
    .active-sliding-page-root {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transition-duration: 0.2s;
    }

    .active-sliding-page-root.allow-overflow {
        overflow-y: scroll;
    }
</style>