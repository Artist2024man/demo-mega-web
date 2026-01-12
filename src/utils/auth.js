// Token管理工具

const TOKEN_KEY = 'wimegatoken'
const USER_INFO_KEY = 'userInfo'

// 获取token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// 移除token
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getToken()
}

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

// 设置用户信息
export const setUserInfo = (userInfo) => {
  if (userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } else {
    localStorage.removeItem(USER_INFO_KEY)
  }
}

// 移除用户信息
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

