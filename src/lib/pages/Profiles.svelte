<script lang="ts">
	import VersionBackground from '$lib/images/versions/1.21.webp';
	import type { Profile } from '$lib/types/profile';
	import SlidingPageWrapper from '$lib/components/SlidingPageWrapper.svelte';
    import { profiles } from '$lib/utils/profileUtils';
    import { onMount } from 'svelte';
    import VanillaIcon from '$lib/images/custom-servers/vanilla.png';
    import FabricIcon from '$lib/images/custom-servers/fabric.png';
    import ForgeIconLight from '$lib/images/custom-servers/forge_white.png';
    import ForgeIconDark from '$lib/images/custom-servers/forge_dark.png';
    import QuiltIcon from '$lib/images/custom-servers/quilt.png';
    import NeoForgeIcon from '$lib/images/custom-servers/neoforge.png';
    import { teatimeConfig } from '$lib/utils/teatimeConfigUtils';
    import { translations } from '$lib/utils/translationUtils';

    $: lang = $translations;

    let profileRows: Profile[][] = [];

    onMount(async () => {
        for (let i = 0; i < $profiles.length / 4; i++) {
            profileRows.push($profiles.slice(i * 4, (i + 1) * 4));
        }
        profileRows = profileRows;
    });
</script>

<SlidingPageWrapper page="profiles" allowOverflow>
    <div class="profile-list-root">
        {#each profileRows as profileRow, i}
            <div class="profile-list-row" style={i == profileRows.length - 1 ? "margin-bottom: 20px" : ""}>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                {#each profileRow as profile}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div class="profile-list-item">
                        <div class="name" style={`font-size: ${profile.name.length > 10 ? 45 : 60}px`}>{profile.name.toLowerCase()}</div>
                        <img src={VersionBackground} alt="Profile Background" class="background" />
                        <div class="version">{profile.game_version.toLowerCase()}</div>
                        {#if profile.loader == 'vanilla'}
                            <img src={VanillaIcon} alt="Vanilla" class="loader-icon" />
                        {:else if profile.loader == 'fabric'}
                            <img src={FabricIcon} alt="Fabric" class="loader-icon" />
                        {:else if profile.loader == 'forge'}
                            <img src={$teatimeConfig!.theme.toLowerCase() == 'dark' ? ForgeIconLight : ForgeIconDark} alt="Forge" class="loader-icon" />
                        {:else if profile.loader == 'quilt'}
                            <img src={QuiltIcon} alt="Quilt" class="loader-icon" />
                        {:else if profile.loader == 'neoforge'}
                            <img src={NeoForgeIcon} alt="NeoForge" class="loader-icon" />
                        {/if}
                        <div class="hover-buttons-wrapper">
                            {#if profile.is_standard_version}
                                <p class="hover-button blue-button">{lang.profiles.profileItem.button.clone}</p>
                            {:else}
                                <p class="hover-button blue-button">{lang.profiles.profileItem.button.settings}</p>
                            {/if}
                            <p class="hover-button green-button">{lang.profiles.profileItem.button.play}</p>
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</SlidingPageWrapper>

<style>
    .profile-list-root {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        width: 90%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .profile-list-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: 50px;
        width: 100%;
        height: 150px;
    }
    
    .profile-list-item {
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: start;
        width: 325px;
        height: 200px;
        border: 4px solid var(--primary-color);
        cursor: pointer;
        overflow: hidden;
    }

    .profile-list-item .background {
        image-rendering: optimizeSpeed;
        position: absolute;
        width: 325px;
        min-height: 200px;
        object-fit: cover;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%);
        z-index: 1;
    }

    .profile-list-item:hover .background {
        filter: blur(1px);
    }

    .profile-list-item:hover .hover-buttons-wrapper {
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .profile-list-item .loader-icon {
        position: absolute;
        width: 30px;
        height: 30px;
        padding: 10px;
        margin-left: 270px;
        z-index: 2;
        transition: opacity 0.75s ease-in-out, transform 0.2s ease-in-out;
    }

    .profile-list-item .name {
        color: var(--primary-color);
        margin-left: 10px;
        z-index: 2;
    }
    
    .profile-list-item .version {
        font-size: 40px;
        padding: 0 0 10px 10px;
        color: var(--font-color);
        z-index: 2;
    }

    .profile-list-item:hover .name, .profile-list-item:hover .version, .profile-list-item:hover .loader-icon {
        transform: translateY(200%);
        opacity: 0;
    }

    .profile-list-item:hover .loader-icon {
        transition: opacity 0.1s ease-in-out, transform 0.2s ease-in-out;
    }

    .profile-list-item .hover-buttons-wrapper {
        display: none;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    }
</style>