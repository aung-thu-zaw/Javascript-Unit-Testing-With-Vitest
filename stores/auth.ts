import { defineStore } from 'pinia'
import { useToken } from '~/composables/useToken'
import type {
  RegisterForm,
  LoginForm,
  ChangePasswordForm,
  ResetPasswordForm,
  User,
  Error
} from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<User | null>(null)
  const errors = ref<Error | null>(null)
  const status = ref<string>(null)
  const isAuthenticated = ref<boolean>(false)
  const { generateCsrfToken, generateCaptchaToken } = useToken()
  const { $axios, $toast } = useNuxtApp()

  const forgotPassword = async (email: string): void => {
    try {
      await generateCsrfToken()

      const captchaToken = await generateCaptchaToken('forgot_password')

      const response = await $axios.post('/forgot-password', {
        email,
        captcha_token: captchaToken
      })

      if (!response) throw new Error('Response Not Found!')

      status.value = response.data.status
    } catch (error) {
      errors.value = error.response?.data?.errors
    }
  }

  const resetPassword = async (form: ResetPasswordForm): void => {
    try {
      form.captcha_token = await generateCaptchaToken('reset_password')

      const response = await $axios.post('/reset-password', { ...form })

      if (!response) throw new Error('Response Not Found!')

      status.value = response.data.status

      router.push({ path: '/auth/sign-in' })
    } catch (error) {
      errors.value = error.response?.data?.errors
    }
  }

  const changePassword = async (form: ChangePasswordForm): void => {
    try {
      form.captcha_token = await generateCaptchaToken('change_password')
      const response = await $axios.put('/password', { ...form })

      if (!response) throw new Error('Response Not Found!')

      $toast.success(response.data?.message, { autoClose: 2000 })
    } catch (error) {
      if (error?.response?.status === 422) {
        errors.value = error.response?.data?.errors
      }
    }
  }

  const sendVerificationEmail = async (): void => {
    try {
      const response = await $axios.post('/email/verification-notification')

      if (!response) throw new Error('Response Not Found!')

      status.value = response.data.status
    } catch (error) {
      if (error?.response?.status === 422) {
        errors.value = error.response?.data?.errors
      }
    }
  }

  const getAuthenticatedUser = async (): void => {
    try {
      await generateCsrfToken()
      const { data } = await $axios.get('api/v1/user')

      if (data.permissions.length > 0) {
        const permissionNames = data.permissions.map((permission) => permission.name)

        user.value = { ...data, permissions: permissionNames }
      } else {
        user.value = data
      }

      isAuthenticated.value = true
    } catch (error) {
      console.error('Failed to get authenticated user:', error)
    }
  }

  const performAuthAction = async (
    action: string,
    endpoint: string,
    form: RegisterForm | LoginForm
  ): void => {
    try {
      await generateCsrfToken()

      form.captcha_token = await generateCaptchaToken('authenticate')

      const { data } = await $axios[action](endpoint, { ...form })

      if (!data) throw new Error('Response Data Not Found!')

      isAuthenticated.value = true

      router.push({ path: '/' })
    } catch (error) {
      errors.value = error.response?.data?.errors
    }
  }

  const register = async (form: RegisterForm): void => {
    await performAuthAction('post', '/register', { ...form })

    isAuthenticated.value = true
  }

  const login = async (form: LoginForm): void => {
    await performAuthAction('post', '/login', { ...form })

    isAuthenticated.value = true
  }

  const logout = async (): void => {
    await $axios.post('/logout')
    user.value = null
    isAuthenticated.value = false
    router.push({ path: '/' })
  }

  const authenticateWithSocial = (service: string) => {
    const { backendBaseUrl } = useRuntimeConfig().public

    window.location.href = `${backendBaseUrl}/auth/redirect/${service}`
  }

  return {
    user,
    isAuthenticated,
    errors,
    status,
    forgotPassword,
    resetPassword,
    changePassword,
    sendVerificationEmail,
    getAuthenticatedUser,
    authenticateWithSocial,
    register,
    login,
    logout
  }
})
