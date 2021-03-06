<script>
  import { clickOutside } from "$utils/actions";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  let className = "";
  export let open = false,
    label = "",
    selectedIndex = -1,
    options = [{ name: "Moo" }, { name: "Wee" }];
  export { className as class };

  let highlighted = 0;
  $: if (open) selectedIndex && (highlighted = selectedIndex); // highlight last selected item
  let outside = false;
  $: if (open) setTimeout(() => (outside = true));
  else outside = false;
  let listboxEl;
  const dispatch = createEventDispatcher();
  $: selectedIndex > -1 && selectEvent();
  function selectEvent() {
    dispatch("select", {
      option: options[selectedIndex],
    });
  }
</script>

<!-- @component
@slot default - Placeholder if none selected
@slot selected - Currently selected item
@slot item - Each select item
@slot area - specific slot for area opening button
@event select {option} - selection option
-->

<div class={className}>
  <div class="flex justify-between items-center">
    {#if label}
      <label
        id="listbox-label"
        for="listbox"
        class="block text-sm font-medium text-indigo-400"
      >
        {label}
      </label>
    {/if}
    <slot name="area" />
  </div>
  <div class="mt-1 relative" on:click={() => (open = !open)}>
    <button
      type="button"
      class="relative w-full transition-none focus:ring-offset-0 bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-labelledby="listbox-label"
      on:keydown={({ key }) => {
        if (open) {
          switch (key) {
            case "ArrowDown":
              highlighted == options.length - 1
                ? (highlighted = 0)
                : ++highlighted;
              break;
            case "ArrowUp":
              highlighted ? --highlighted : (highlighted = options.length - 1);
              break;
            case "Escape":
              open = !open;
              break;
            case "Enter":
              selectedIndex = highlighted;
              break;
            case "Home":
              highlighted = 0;
              break;
            case "End":
              highlighted = options.length - 1;
              break;
          }
        }
      }}
      bind:this={listboxEl}
    >
      <span class="flex items-center ">
        <!-- Currently shown item -->
        {#if selectedIndex >= 0}
          <slot name="selected">{options[selectedIndex].name}</slot>
        {:else}
          <slot {selectedIndex}>Select...</slot>
        {/if}
      </span>
      <span
        class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <!-- Heroicon name: solid/selector -->
        <svg
          class="h-5 w-5 text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    {#if open}
      <ul
        use:clickOutside={{ enabled: outside, cb: () => (open = false) }}
        on:click|stopPropagation={() => listboxEl.focus()}
        transition:fade={{ duration: 100 }}
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-28 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
        aria-activedescendant="listbox-option-3"
      >
        {#each options as option, i}
          <li
            class="{highlighted == i
              ? 'text-white bg-indigo-500'
              : 'text-indigo-500'} cursor-default select-none relative py-2 pl-3 pr-9"
            id="listbox-option-0"
            role="option"
            on:mouseenter={() => (highlighted = i)}
            on:click={() => {
              selectedIndex = i;
              open = false;
            }}
          >
            <div class="flex items-center">
              <slot name="item" {i} {option} />
            </div>

            {#if selectedIndex == i}
              <span
                class="{highlighted == i
                  ? 'text-white'
                  : 'text-indigo-500'} absolute inset-y-0 right-0 flex items-center pr-4"
              >
                <!-- Heroicon name: solid/check -->
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
