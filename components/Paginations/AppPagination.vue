<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useQueryGenerator } from '~/composables/useQueryGenerator'
import axios from 'axios'
import { useToken } from '~/composables/useToken'

defineProps<{ data: any }>()

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updatedData'])
const { getParameter } = useQueryGenerator()
const { generateCsrfToken } = useToken()

const fetchData = async (url: string) => {
  try {
    await generateCsrfToken()

    const currentPage = getParameter(url, 'page') || 1

    const response = await axios.get(url, {
      withCredentials: true,
      withXSRFToken: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    if (!response) throw new Error('Response Not Found!')

    router.push({ query: { ...route.query, page: currentPage } })

    emit('updatedData', response.data)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="flex items-center justify-center w-full">
    <div v-if="data?.meta?.links?.length > 3">
      <div class="flex flex-wrap -mb-1 space-x-1.5">
        <template v-for="(link, p) in data?.meta?.links" :key="p">
          <button
            v-if="link.url === null"
            type="button"
            class="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 font-medium"
            v-html="link.label"
          ></button>

          <div v-else class="flex items-center">
            <button
              type="button"
              class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none font-medium"
              :class="{
                'bg-yellow-500 text-white': Number(link.label) === data?.meta?.current_page
              }"
              :href="link?.url"
              @click="fetchData(link.url)"
              v-html="link.label"
            ></button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
