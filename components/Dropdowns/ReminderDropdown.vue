<script setup lang="ts">
import ReminderModal from '~/components/Modals/ReminderModal.vue'
import type { Reminder } from '~/types/reminder'
import { useReminderStore } from '~/stores/user/reminder'

defineProps<{ reminder: Reminder }>()

const store = useReminderStore()
</script>

<template>
  <div class="hs-dropdown relative inline-flex [--placement:bottom-right]">
    <button
      :id="'hs-dropdown-' + reminder.id"
      type="button"
      class="hs-dropdown-toggle flex justify-center items-center size-7 text-sm font-semibold rounded-sm bg-white text-gray-800 disabled:opacity-50 disabled:pointer-events-none"
    >
      <svg
        class="flex-none size-4 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>

    <div
      class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-30 min-w-60 bg-white shadow-md rounded-lg p-2 mt-2 border"
      :aria-labelledby="'hs-dropdown-' + reminder.id"
    >
      <button
        type="button"
        class="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        @click="store.syncToGoogleCalendar(reminder?.id)"
      >
        <i class="fa-brands fa-google"></i>
        {{ $t('Sync Again') }}
      </button>

      <ReminderModal mode="edit" :reminder="reminder" />

      <button
        type="button"
        class="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        @click="store.deleteReminder(reminder?.id)"
      >
        <i class="fa-solid fa-trash-can"></i>
        {{ $t('Delete') }}
      </button>
    </div>
  </div>
</template>
