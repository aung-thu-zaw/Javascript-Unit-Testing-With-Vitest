<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const search = ref<string | undefined>(route.query?.query as string | undefined)
const emit = defineEmits(['updatedSearch'])
const localePath = useLocalePath()

const handleSearch = () => {
  if (search.value) {
    router.push({ path: localePath('/blogs/search'), query: { page: 1, query: search.value } })
  } else {
    router.push({ path: localePath('/blogs') })
  }
  emit('updatedSearch')
}
</script>

<template>
  <form @submit.prevent="handleSearch">
    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only"
      >Search</label
    >
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
        <svg
          class="w-4 h-4 text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <input
        v-model="search"
        type="text"
        class="block w-full p-5 pl-10 text-sm text-gray-800 font-semibold border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:outline-none focus:border-gray-300"
        :placeholder="$t('What do you want to learn about?')"
        autocomplete="off"
      />
      <button
        type="submit"
        class="text-white absolute right-2.5 bottom-2 bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-200 font-medium rounded-lg text-sm px-5 py-3 duration-200 active:animate-press"
      >
        {{ $t('Search') }}
      </button>
    </div>
  </form>
</template>
