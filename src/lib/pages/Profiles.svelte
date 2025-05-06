<script lang="ts">
	import Button from './../components/core/Button.svelte';
	import CreateProfileModal from './../components/profiles/CreateProfileModal.svelte';
	import ProfileSettingsModal from './../components/profiles/ProfileSettingsModal.svelte';
	import CloneProfileModal from './../components/profiles/CloneProfileModal.svelte';
	import VersionBackground from '$lib/images/versions/1.21.webp';
	import type { Profile } from '$lib/types/profile';
	import SlidingPageWrapper from '$lib/components/SlidingPageWrapper.svelte';
    import { profiles, selectProfile } from '$lib/utils/profileUtils';
    import { onMount } from 'svelte';
    import VanillaIcon from '$lib/images/custom-servers/vanilla.png';
    import FabricIcon from '$lib/images/custom-servers/fabric.png';
    import ForgeIconLight from '$lib/images/custom-servers/forge_white.png';
    import ForgeIconDark from '$lib/images/custom-servers/forge_dark.png';
    import QuiltIcon from '$lib/images/custom-servers/quilt.png';
    import NeoForgeIcon from '$lib/images/custom-servers/neoforge.png';
    import { teatimeConfig } from '$lib/utils/teatimeConfigUtils';
    import { translations } from '$lib/utils/translationUtils';
    import { launchProfile } from '$lib/api/profiles';
    import { selectTab } from '$lib/utils/navigationUtils';
    import { currentEvent } from '$lib/utils/eventUtils';

    $: lang = $translations;

    $: profileRows = (() => {
        let rows: Profile[][] = [];
        for (let i = 0; i < $profiles.length / 3; i++) {
            rows.push($profiles.slice(i * 3, (i + 1) * 3));
        }
        return rows;
    })();

    let cloneModalProfile: Profile | null = null;
    let settingsModalProfile: Profile | null = null;
    let showCreateProfileModal = false;

    async function play(profile: Profile) {
        selectProfile(profile.id);
        selectTab('play');
        await launchProfile(profile.id);
        currentEvent.set({
            target_id: '1',
            event_id: '1',
            event_type: 'launching_minecraft',
            message: lang.play.button.launching,
            progress: 0,
            error: '',
        });
    }
</script>

<CloneProfileModal show={cloneModalProfile != null} profile={cloneModalProfile} onClose={() => cloneModalProfile = null} />
<ProfileSettingsModal show={settingsModalProfile != null} onClose={() => settingsModalProfile = null} />
<CreateProfileModal bind:show={showCreateProfileModal} />
<SlidingPageWrapper page="profiles" allowOverflow>
    <div class="profiles-wrapper">
        <div class="header">
            <Button onClick={() => showCreateProfileModal = true} style='default' width='170px' height='35px'>{lang.profiles.button.create}</Button>
        </div>
        <div class="profile-list-root">
            {#each profileRows as profileRow, i}
                <div class="profile-list-row" style={i == profileRows.length - 1 ? "margin-bottom: 20px" : ""}>
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    {#each profileRow as profile}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div class="profile-list-item">
                            <div class="name">{profile.name.length > 17 ? profile.name.toLowerCase().substring(0,17) + '...' : profile.name.toLowerCase()}</div>
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
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <div class="hover-buttons-wrapper">
                                {#if profile.is_standard_version}
                                    <Button onClick={() => cloneModalProfile = profile} style='default'>{lang.profiles.profileItem.button.clone}</Button>
                                {:else}
                                    <Button onClick={() => settingsModalProfile = profile} style='default'>{lang.profiles.profileItem.button.settings}</Button>
                                {/if}
                                <Button onClick={() => play(profile)} style='green'>{lang.profiles.profileItem.button.play}</Button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
        <div class="spacer"></div>
    </div>
</SlidingPageWrapper>

<style>
    .profiles-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
        width: 90%;
        padding: 20px;
        margin-bottom: 30px;
    }

    .profile-list-root {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        width: 90%;
        height: 100%;
    }

    .spacer {
        height: 500px;
    }

    .profile-list-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 90px;
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
        overflow: hidden;
    }

    .profile-list-item {
        transition-duration: 150ms;
    }

    .profile-list-item .background {
        image-rendering: optimizeSpeed;
        position: absolute;
        width: 325px;
        min-height: 200px;
        object-fit: cover;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0.15) 65%);
        z-index: 1;
    }

    .profile-list-item:hover .background {
        filter: blur(2px);
        opacity: 0.3;
    }

    .profile-list-item:hover .hover-buttons-wrapper {
        display: flex;
        opacity: 1;
        transform: translateY(0);
    }

    .profile-list-item .loader-icon {
        position: absolute;
        width: 30px;
        height: 30px;
        padding: 10px;
        margin-left: 270px;
        z-index: 2;
    }

    .profile-list-item .name {
        color: var(--primary-color);
        font-size: 45px;
        margin-left: 10px;
        margin-bottom: -5px;
        z-index: 2;
    }
    
    .profile-list-item .version {
        font-size: 40px;
        padding: 0 0 10px 10px;
        margin-bottom: -55px;
        color: var(--font-color);
        z-index: 2;
    }

    .profile-list-item:hover .name, .profile-list-item:hover .version {
        transform: translateY(-120px);
    }

    .profile-list-item:hover .loader-icon {
        transform: translateY(-150px);
    }

    .profile-list-item .hover-buttons-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: calc(100% - 20px);
        padding: 0 10px 10px 10px;
        transform: translateY(200%);
    }
</style>