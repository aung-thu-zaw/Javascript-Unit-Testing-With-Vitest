import { defineStore } from 'pinia'
import type { NavBannerPaginate, NavBanner, Form, Error } from '~/types/navBanner'
import { useQueryGenerator } from '~/composables/useQueryGenerator'
import { useToken } from '~/composables/useToken'
import { useURLQueryString } from '~/composables/useURLQueryString'

export const useNavBannerStore = defineStore('nav-banner', () => {
  const navBanners = ref<NavBannerPaginate | null>(null)
  const navBanner = ref<NavBanner | null>(null)
  const errors = ref<Error | null>(null)
  const { generateCaptchaToken } = useToken()
  const { $axiosApi, $swal, $router, $toast } = useNuxtApp()
  const { dashboardDefaultQueryString: queryString } = useURLQueryString()

  const getAllNavBanner = async (params) => {
    try {
      const { generateQueryParams } = useQueryGenerator()

      const { data } = await $axiosApi.get(`/admin/nav-banners?${generateQueryParams(params)}`)

      if (!data) throw new Error('Response Data Not Found!')

      navBanners.value = data
    } catch (error) {
      return showError({
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText,
        message: error.response?.data?.message
      })
    }
  }

  const getNavBanner = async (id: number) => {
    try {
      const { data } = await $axiosApi.get(`/admin/nav-banners/${id}`)

      if (!data) throw new Error('Response Data Not Found!')

      navBanner.value = data
    } catch (error) {
      return showError({
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText,
        message: error.response?.data?.message
      })
    }
  }

  const createNavBanner = async (form: Form, createAnother: boolean) => {
    try {
      form.captcha_token = await generateCaptchaToken('create_nav_banner')

      const response = await $axiosApi.post('/admin/nav-banners', { ...form })

      if (!response) throw new Error('Response Not Found!')

      if (!createAnother) {
        $router.push({ path: '/admin/nav-banners', query: { ...queryString.value } })

        $swal.fire({ icon: 'success', title: 'Nav banner created successfully!' })
      } else {
        $toast.success('Nav banner created successfully!')
      }
    } catch (error) {
      errors.value = error.response?.data?.errors
    }
  }

  const updateNavBanner = async (form: Form, id: number) => {
    try {
      form.captcha_token = await generateCaptchaToken('update_nav_banner')

      const response = await $axiosApi.patch(`/admin/nav-banners/${id}`, { ...form })

      if (!response) throw new Error('Response Not Found!')

      $router.push({ path: '/admin/nav-banners', query: { ...queryString.value } })

      $swal.fire({ icon: 'success', title: 'Nav banner updated successfully!' })
    } catch (error) {
      errors.value = error.response?.data?.errors
    }
  }

  const changeStatus = async (is_active: boolean, id: number) => {
    try {
      const response = await $axiosApi.put(`/admin/nav-banners/${id}/change-status`, {
        is_active
      })

      if (!response) throw new Error('Response Not Found!')

      const index = navBanners.value.data.findIndex((navBanner) => navBanner.id === id)

      const activeNavBanners = navBanners.value.data.filter(
        (navBanner) => navBanner.id !== id && is_active === true
      )

      activeNavBanners.forEach((activeBanner) => (activeBanner.is_active = false))

      navBanners.value.data[index] = { ...response.data }

      $toast.success('Nav banner status changed successfully!')
    } catch (error) {
      return showError({
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText,
        message: error.response?.data?.message
      })
    }
  }

  const deleteNavBanner = async (id: number) => {
    try {
      const result = await $swal.fire({
        icon: 'question',
        title: 'Delete Nav Banner',
        text: 'Are you sure you would like to do this?',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d52222',
        cancelButtonColor: '#626262',
        timer: 20000,
        timerProgressBar: true,
        reverseButtons: true
      })

      if (result.isConfirmed) {
        const response = await $axiosApi.delete(`/admin/nav-banners/${id}`)

        if (!response) throw new Error('Response Not Found!')

        const index = navBanners.value?.data?.findIndex((navBanner) => navBanner.id === id)

        if (index !== -1) {
          navBanners.value?.data.splice(index, 1)

          if (
            index >=
            navBanners.value?.meta?.current_page - 1 * navBanners.value?.meta?.per_page
          ) {
            await getAllNavBanner({ page: navBanners.value?.meta?.current_page })
          }
        }

        if (response.status === 204) {
          $swal.fire({ icon: 'success', title: 'Nav banner deleted successfully!' })
        }
      }
    } catch (error) {
      return showError({
        statusCode: error.response?.status,
        statusMessage: error.response?.statusText,
        message: error.response?.data?.message
      })
    }
  }

  return {
    navBanners,
    navBanner,
    errors,
    getAllNavBanner,
    getNavBanner,
    createNavBanner,
    updateNavBanner,
    changeStatus,
    deleteNavBanner
  }
})
