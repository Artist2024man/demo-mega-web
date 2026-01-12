<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav v-if="showNavbar" class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <h1 class="navbar-logo" @click="goToHome">MegaAI</h1>
        </div>
        <div class="navbar-right">
          <div class="user-info" @click="toggleUserMenu" ref="userInfoRef">
            <div class="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                <path d="M12.0002 14.5C7.99019 14.5 4.75019 16.57 3.00019 19.58C2.65019 20.07 2.96019 20.75 3.55019 20.75H20.4502C21.0402 20.75 21.3502 20.08 21.0002 19.58C19.2502 16.57 16.0102 14.5 12.0002 14.5Z" fill="currentColor"/>
              </svg>
            </div>
            <span class="username">{{ userInfo?.username || '用戶' }}</span>
            <span class="dropdown-icon">▼</span>
          </div>
          <div v-if="showUserMenu" class="user-menu">
            <button @click="handleChangePassword" class="menu-item">修改密碼</button>
            <button @click="handleLogout" class="logout-btn">退出</button>
          </div>
        </div>
      </div>
    </nav>
    <router-view />
    
    <!-- 修改密碼弹窗 -->
    <div v-if="showChangePasswordDialog" class="change-password-overlay" @click.self="handleCancelChangePassword">
      <div class="change-password-dialog">
        <div class="dialog-title">修改密碼</div>
        <form @submit.prevent="handleSubmitChangePassword" class="change-password-form">
          <div class="form-item">
            <label for="oldPwd">旧密碼</label>
            <input
              id="oldPwd"
              v-model="changePasswordForm.oldPwd"
              type="password"
              placeholder="請輸入旧密碼"
              required
              :disabled="changePasswordLoading"
            />
          </div>
          <div class="form-item">
            <label for="newPwd">新密碼</label>
            <input
              id="newPwd"
              v-model="changePasswordForm.newPwd"
              type="password"
              placeholder="請輸入新密碼"
              required
              :disabled="changePasswordLoading"
            />
          </div>
          <div class="form-item">
            <label for="checkPwd">密碼確認</label>
            <input
              id="checkPwd"
              v-model="changePasswordForm.checkPwd"
              type="password"
              placeholder="請再次输入新密碼"
              required
              :disabled="changePasswordLoading"
            />
          </div>
          <div v-if="changePasswordError" class="error-message">
            {{ changePasswordError }}
          </div>
          <div class="dialog-buttons">
            <button type="button" @click="handleCancelChangePassword" class="btn btn-cancel" :disabled="changePasswordLoading">
              取消
            </button>
            <button type="submit" class="btn btn-confirm" :disabled="changePasswordLoading">
              <span v-if="changePasswordLoading">處理中...</span>
              <span v-else>確認</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isAuthenticated, getUserInfo, removeToken, removeUserInfo } from './utils/auth'
import request from './utils/request'

const router = useRouter()
const route = useRoute()

const showUserMenu = ref(false)
const userInfoRef = ref(null)
const userInfo = ref(null)
const accountName = ref('') // 账号名称
const showChangePasswordDialog = ref(false)
const changePasswordLoading = ref(false)
const changePasswordError = ref('')
const changePasswordForm = ref({
  oldPwd: '',
  newPwd: '',
  checkPwd: ''
})

// 是否显示导航栏（登录页面不显示）
const showNavbar = computed(() => {
  return route.path !== '/login' && isAuthenticated()
})

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 切换用戶菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (userInfoRef.value && !userInfoRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

// 打开修改密碼弹窗
const handleChangePassword = () => {
  showChangePasswordDialog.value = true
  showUserMenu.value = false
  changePasswordForm.value = {
    oldPwd: '',
    newPwd: '',
    checkPwd: ''
  }
  changePasswordError.value = ''
}

// 取消修改密碼
const handleCancelChangePassword = () => {
  showChangePasswordDialog.value = false
  changePasswordForm.value = {
    oldPwd: '',
    newPwd: '',
    checkPwd: ''
  }
  changePasswordError.value = ''
}

// 提交修改密碼
const handleSubmitChangePassword = async () => {
  changePasswordError.value = ''
  
  // 前端校验：新密碼和確認密碼是否相等
  if (changePasswordForm.value.newPwd !== changePasswordForm.value.checkPwd) {
    changePasswordError.value = '新密碼和確認密碼不一致'
    return
  }
  
  // 校验密碼長度等（可选）
  if (changePasswordForm.value.newPwd.length < 6) {
    changePasswordError.value = '新密碼長度至少为6位'
    return
  }
  
  changePasswordLoading.value = true
  try {
    await request.post('/api/user/changePwd', {
      oldPwd: changePasswordForm.value.oldPwd,
      newPwd: changePasswordForm.value.newPwd,
      checkPwd: changePasswordForm.value.checkPwd
    })
    
    // 修改成功，关闭弹窗
    showChangePasswordDialog.value = false
    changePasswordForm.value = {
      oldPwd: '',
      newPwd: '',
      checkPwd: ''
    }
    changePasswordError.value = ''
    
    // 显示成功提示
    const successMsg = document.createElement('div')
    successMsg.textContent = '密碼修改成功'
    successMsg.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      background: var(--accent-success);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 3000;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `
    document.body.appendChild(successMsg)
    setTimeout(() => {
      successMsg.style.animation = 'slideOutRight 0.3s ease-out'
      setTimeout(() => {
        document.body.removeChild(successMsg)
      }, 300)
    }, 2000)
  } catch (error) {
    changePasswordError.value = error.message || '修改密碼失败，请检查旧密碼是否正确'
  } finally {
    changePasswordLoading.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await request.post('/api/user/logout')
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 无论接口是否成功，都清除本地数据并跳转
    removeToken()
    removeUserInfo()
    showUserMenu.value = false
    router.push('/login')
  }
}

// 获取账号名称
const fetchAccountName = async (accountId) => {
  if (!accountId) {
    accountName.value = ''
    return
  }
  try {
    const data = await request.get(`/api/app/accountInfo/${accountId}`)
    accountName.value = data?.name || ''
  } catch (error) {
    console.error('获取账号信息失败:', error)
    accountName.value = ''
  }
}

// 监听路由变化，获取账号名称
watch(() => route.path, (newPath) => {
  if (newPath === '/account-detail' && route.query.accountId) {
    fetchAccountName(route.query.accountId)
  } else {
    accountName.value = ''
  }
}, { immediate: true })

// 监听查询参数变化
watch(() => route.query.accountId, (newAccountId) => {
  if (route.path === '/account-detail' && newAccountId) {
    fetchAccountName(newAccountId)
  } else {
    accountName.value = ''
  }
})

onMounted(() => {
  // 获取用戶信息
  userInfo.value = getUserInfo()
  // 监听点击事件，关闭菜单
  document.addEventListener('click', handleClickOutside)
  // 如果当前在账号详情页，获取账号名称
  if (route.path === '/account-detail' && route.query.accountId) {
    fetchAccountName(route.query.accountId)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* 交易所风格配色 - 专业浅色主题 */
  --bg-primary: #0b0e11;
  --bg-secondary: #1a1d29;
  --bg-tertiary: #252932;
  --bg-card: #1e222d;
  --bg-hover: #2a2e3e;
  --border-color: #2a2e3e;
  --text-primary: #eaecef;
  --text-secondary: #848e9c;
  --text-tertiary: #5e6673;
  --accent-primary: #f0b90b;
  --accent-success: #0ecb81;
  --accent-danger: #f6465d;
  --accent-info: #1890ff;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* 导航栏 - 交易所风格 */
.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.navbar-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  position: relative;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-logo {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #f0b90b 0%, #f8d33a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.navbar-logo:hover {
  opacity: 0.8;
  transform: scale(0.98);
}

.navbar-logo:active {
  transform: scale(0.95);
}

.navbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: 300px;
  text-align: center;
}

.account-name-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.navbar-right {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.user-info:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0b90b 0%, #f8d33a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.user-avatar svg {
  width: 18px;
  height: 18px;
}

.username {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.user-info:hover .dropdown-icon {
  color: var(--text-primary);
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  min-width: 140px;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}

.menu-item:hover {
  background-color: var(--bg-hover);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logout-btn {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: var(--accent-danger);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: rgba(246, 70, 93, 0.1);
}

/* 修改密碼弹窗 */
.change-password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.change-password-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease-out;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.change-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.change-password-form .form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-password-form .form-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.change-password-form .form-item input {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
}

.change-password-form .form-item input::placeholder {
  color: var(--text-tertiary);
}

.change-password-form .form-item input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.change-password-form .form-item input:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.change-password-form .error-message {
  padding: 10px 12px;
  background-color: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-radius: 6px;
  color: var(--accent-danger);
  font-size: 13px;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.dialog-buttons .btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.dialog-buttons .btn-cancel {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.dialog-buttons .btn-cancel:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.1);
}

.dialog-buttons .btn-confirm {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

.dialog-buttons .btn-confirm:hover:not(:disabled) {
  background-color: #f8d33a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(240, 185, 11, 0.3);
}

.dialog-buttons .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 手机端适配 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 12px;
  }

  .navbar-center {
    max-width: 150px;
    left: 50%;
    transform: translateX(-50%);
  }

  .account-name-text {
    font-size: 12px;
  }

  .navbar-logo {
    font-size: 18px;
  }
}
</style>

