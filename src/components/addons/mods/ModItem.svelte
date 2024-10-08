<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher()

    export let mod;
    export let enabled = mod?.value?.enabled ?? null;
    export let text;
    export let type;

    const name = typeof mod == 'string' ? mod : mod?.title ?? mod?.value?.name;
</script>

<div class="mod-item-wrapper" class:blacklisted={mod?.blacklisted}>
    <div class="image-text-wrapper">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        {#if type != 'CUSTOM'}
            <div class="icon-fallback">
                <img class="icon" src={mod.icon_url ?? mod.image_url} alt=" " onerror="this.style.display='none'">
            </div>
        {:else}
            <div class="custom-mod-icon">📦</div>
        {/if}
        <div class="text-item-wrapper" style={type != "INSTALLED" && type != "CUSTOM" ? 'height: 95px;' : ''}>
            <div class="href-wrapper">
                {#if type != 'CUSTOM'}
                    <div class="name-div">
                        <a class="mod-title" href={`https://modrinth.com/mod/${mod.slug ?? mod.value.source.artifact.split(":")[1]}`} target="_blank" title={name}>
                            {name.length > 20 ? name.substring(0, 20) + '...' : name}
                        </a>
                        {#if mod?.featured}
                            <p title="Featured">⭐️</p>
                        {/if}
                    </div>
                {:else}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a class="mod-title">{mod.replace('.jar', '').replace('.disabled', '')}</a>
                {/if}
                {#if mod?.author != undefined && mod?.author != null}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <p class="author">by {mod.author ?? mod.value.author}</p>
                {/if}
            </div>
            {#if mod?.description != undefined && mod?.description != null}
                <p class="description">{mod.description.length > 85 ? mod.description.substring(0, 85) + '...' : mod.description}</p>
            {/if}
        </div>
    </div>
    <div class="buttons">
        {#if mod?.loading ?? false}
            <h1 class="required-button primary-text">
                LOADING
            </h1>
        {:else if text === "INSTALL"}
            {#if mod?.featured}
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <h1 class="featured-label" style="margin-bottom: 15px;">
                        FEATURED
                    </h1>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="install-button green-text" on:click={() => dispatch("install")}>
                        INSTALL
                    </h1>
                </div>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <h1 class="install-button green-text" on:click={() => dispatch("install")}>
                    INSTALL
                </h1>
            {/if}
        {:else if text === "RECOMENDED"}
            <div style="display: flex; flex-direction: column; align-items: center;">
                <h1 class="required-button primary-text" style="margin-bottom: 15px;">
                    RECOMENDED
                </h1>
                {#if enabled}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="red-text-clickable delete-button" on:click={() => dispatch("disable")}>
                        DISABLE
                    </h1>
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="green-text-clickable install-button" on:click={() => dispatch("enable")}>
                        ENABLE
                    </h1>
                {/if}
            </div>
        {:else if text === "INSTALLED"}
            {#if type == "RESULT"}
                <div style="display: flex; flex-direction: column; align-items: center;">
                    {#if mod?.featured}
                        <h1 class="featured-label" style="margin-bottom: 15px;">
                            FEATURED
                        </h1>
                    {/if}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="red-text-clickable delete-button" style={type != "RESULT" ? "margin-top: 15px;" : ""} on:click={() => dispatch("delete")}>
                        DELETE
                    </h1>
                </div>
            {:else}
                {#if enabled}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="red-text-clickable delete-button" on:click={() => dispatch("toggle")}>
                        DISABLE
                    </h1>
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h1 class="green-text-clickable install-button" on:click={() => dispatch("toggle")}>
                        ENABLE
                    </h1>
                {/if}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <h1 class="red-text-clickable delete-button" style={type != "RESULT" ? "margin-top: 15px;" : ""} on:click={() => dispatch("delete")}>
                    DELETE
                </h1>
            {/if}
        {:else if text === "REQUIRED"}
            <h1 class="required-button primary-text">
                REQUIRED
            </h1>
        {:else if type == "CUSTOM"}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            {#if enabled}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <h1 class="red-text-clickable delete-button" on:click={() => dispatch("toggle")}>
                    DISABLE
                </h1>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <h1 class="green-text-clickable install-button" on:click={() => dispatch("toggle")}>
                    ENABLE
                </h1>
            {/if}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <h1 class="red-text-clickable delete-button" style="margin-top: 15px;" on:click={() => dispatch("delete")}>
                DELETE
            </h1>
        {/if}
    </div>
</div>

<style>
    .mod-item-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--background-contrast-color);
        height: 120px;
        border-radius: 10px;
        padding: 1em;
        margin-bottom: 10px;
        gap: 1em;
        margin-top: 0.3em;
    }

    .blacklisted {
        border: 3.5px solid red;
    }

    .buttons {
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .image-text-wrapper {
        justify-content: center;
        align-items: center;
        display: flex;
        gap: 1em;
    }
    
    .image-text-wrapper img {
        border-radius: 5px;
    }
    
    .custom-mod-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 45px;
        width: 90px;
        height: 90px;
        border-radius: 5px;
        background: var(--background-color);
        box-shadow: 3px 3px 1px rgba(0, 0, 0, 0.5);
    }

    .href-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        color: var(--font-color);
        gap: 0.3em;
    }
    
    .href-wrapper .name-div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.3em;
    }

    .href-wrapper .author {
        white-space: nowrap;
        font-family: 'Press Start 2P', serif;
        font-size: 9px;
        margin-top: 0.7em;
    }

    .text-item-wrapper {
        max-width: 400px;
        overflow: hidden;
    }

    .icon {
        width: 90px;
        height: 90px;
        object-fit: contain;
        background: var(--background-contrast-color);
        box-shadow: 3px 3px 1px rgba(0, 0, 0, 0.5);
    }

    .icon-fallback {
        background-image: url("https://docs.modrinth.com/img/logo.svg");
        min-width: 90px; 
        min-height: 90px;
        background-position: center center;
        background-size: 90%;
        background-repeat: no-repeat;
    }

    .mod-title {
        text-decoration-thickness: 0.1em;
        text-decoration: underline;
        font-family: 'Press Start 2P', serif;
        line-break: anywhere;
        font-size: 16px;
        cursor: pointer;
    }

    .description {
        font-family: 'Press Start 2P', serif;
        font-size: 9px;
        line-height: 1.2em;
        padding-top: 2em;
        cursor: default;
        text-shadow: 1px 1px var(--font-color-text-shadow);
    }

    .install-button {
        font-family: 'Press Start 2P', serif;
        font-size: 17px;
        cursor: pointer;
        transition: transform 0.3s;
    }

    .required-button {
        font-family: 'Press Start 2P', serif;
        font-size: 17px;
        cursor: default;
    }

    .featured-label {
        font-family: 'Press Start 2P', serif;
        font-size: 17px;
        color: #f0c91a;
        text-shadow: 1.5px 1.5px var(--hover-color-text-shadow);
        cursor: default;
    }

    .delete-button {
        font-family: 'Press Start 2P', serif;
        font-size: 17px;
        cursor: pointer;
        transition: transform 0.3s;
    }

    .delete-button:hover {
        transform: scale(1.2);
    }

    .install-button:hover {
        transform: scale(1.2);
    }
</style>
