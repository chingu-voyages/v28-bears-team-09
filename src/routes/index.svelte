<script>
  import Button from "$lib/Button.svelte";
  import ModalBox from "$lib/ModalBox.svelte";
  import AuthForm from "$lib/AuthForm.svelte";
  import { authStore } from "$stores/auth";
  import Hero from "$lib/Hero.svelte";

  let open = false;
  let login = false;
  let clickOutside = true;
  $: if (open == true && typeof login)
    !(clickOutside = false) && setTimeout(() => (clickOutside = true));
</script>

<header class="flex row items-center justify-between px-4 lg:px-20">
  <div class="flex items-center">
    <img src="/images/logo.webp" alt="DShift logo" class="h-16" />
    <h2 class="justify-self-start font-logo text-2xl font-medium">DShift</h2>
  </div>
  <nav>
    <Button on:click={() => (open = true) && (login = true)}>Login</Button>
    <Button on:click={() => (open = true) && (login = false)} variant="outline"
      >Register</Button
    >
  </nav>
</header>

<main>
  <Hero />
  <ModalBox {clickOutside} bind:open>
    <AuthForm bind:login />
  </ModalBox>
</main>

{#if $authStore?.secret}
  <div style="display:none;">
    {(location.pathname = "/schedule")}
  </div>
{/if}
