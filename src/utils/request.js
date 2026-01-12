import axios from 'axios'
import { getToken, removeToken } from './auth'

// 开发环境使用代理，生产环境使用实际的后端地址
const BASE_URL = import.meta.env.PROD ? 'https://mega.byeing.com' : ''

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

// 请求拦截器：添加token到请求头
instance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.wimegatoken = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { code, data } = response.data
    if (code === 200) {
      return data
    } else {
      // code不等于200时，显示data内容作为错误提示
      const errorMsg = typeof data === 'string' ? data : JSON.stringify(data)
      throw new Error(errorMsg)
    }
  },
  (error) => {
    // 处理401错误：未授权，跳转到登录页
    if (error.response && error.response.status === 401) {
      removeToken()
      // 使用window.location跳转，避免循环依赖
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(new Error('登錄已過期，請重新登錄'))
    }
    
    const errorMsg = error.response?.data?.data || error.message || '请求失败'
    throw new Error(errorMsg)
  }
)

export default instance

