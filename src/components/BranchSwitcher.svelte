<script>
  import { preventSelection } from "../utils/svelteUtils.js";
  import { defaultUser } from "../stores/credentialsStore.js";
  import { quintOut } from "svelte/easing";
  import { branches, currentBranchIndex, switchBranch } from "../stores/branchesStore.js";
  import { scale } from "svelte/transition";
  import { isCheckingForUpdates } from "../utils/noriskUtils.js";
  import Updater from "./v2/Updater.svelte";
  import SignInOutput from "./home/widgets/SignInOutput.svelte";
</script>

<div class="branch-wrapper">
  {#if $branches.length > 0}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
        on:selectstart={preventSelection} style="cursor: pointer"
        on:mousedown={preventSelection} class="branch-font switch primary-text"
        on:click={() => switchBranch(true)}
        style:opacity={($defaultUser == null || $isCheckingForUpdates)? 0 : 100}>
      &lt;</h1>
  {/if}
  <section style="display:flex;justify-content:center">

    {#if $isCheckingForUpdates}
      <Updater />
    {:else if !$defaultUser}
      <SignInOutput />
    {:else}
      {#if $branches.length > 0}
        {#each $branches as branch, i}
          {#if $currentBranchIndex === i}
            <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
                class="branch-font primary-text branch-effect"
                style="position:absolute"
                on:selectstart={preventSelection}
                on:mousedown={preventSelection}
            > {branch.toUpperCase()} VERSION</h1>
          {/if}
        {/each}
      {:else}
        <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
            class="branch-font primary-text"
            style="position:absolute"
            on:selectstart={preventSelection}
            on:mousedown={preventSelection}
        > NOT WHITELISTED</h1>
      {/if}
    {/if}
  </section>
  {#if $branches.length > 0}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h1 transition:scale={{ x: 15, duration: 300, easing: quintOut }}
        on:selectstart={preventSelection}
        style="cursor: pointer" on:mousedown={preventSelection}
        class="branch-font primary-text switch" on:click={() => switchBranch(false)}
        style:opacity={($defaultUser == null || $isCheckingForUpdates) ? 0 : 100}>
      &gt;</h1>
  {/if}
</div>

<style>
    .branch-wrapper {
        display: flex;
        align-content: space-evenly;
        flex-direction: row;
        gap: 200px;
    }

    .branch-font {
        font-family: 'Press Start 2P', serif;
        font-size: 18px;
        margin: 0;
        cursor: default;
  }
  
    .switch:hover {
        color: var(--hover-color);
        text-shadow: 2px 2px var(--hover-color-text-shadow);
    }
  
    .branch-effect{
        -webkit-mask:linear-gradient(-60deg,#fff 40%,#0005 50%,#fff 60%) right/275% 100%;
        animation: effect 4.5s;
    }

    @keyframes effect {
   100% {-webkit-mask-position:left}
    }

</style>
