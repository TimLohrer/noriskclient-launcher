<script>
  import TransitionWrapper from "./TransitionWrapper.svelte";
  import HomeScreen from "../components/home/HomeScreen.svelte";
</script>

<TransitionWrapper>
  <div class="home-transition-wrapper" id="home-scroll">
    <HomeScreen />
  </div>
</TransitionWrapper>

<style>
  .home-transition-wrapper {
    display: flex;
    justify-content: center;
    align-items: start;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>