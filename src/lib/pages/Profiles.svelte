<script lang="ts">
	import Profile from '$lib/components/profiles/Profile.svelte';
	import SlidingPageWrapper from '$lib/components/SlidingPageWrapper.svelte';
    import { profiles } from '$lib/utils/profileUtils';

</script>

<SlidingPageWrapper page="profiles" allowOverflow>
    <div class="profiles-wrapper">
        {#each $profiles as profile}
            <Profile profile={profile} />
        {/each}
    </div>
</SlidingPageWrapper>