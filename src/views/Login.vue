<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title"></h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-item">
          <label for="username">用戶名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="請輸入用戶名"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-item">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
            required
            :disabled="loading"
          />
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登錄中...' : '登錄' }}
        </button>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { setToken, setUserInfo } from '../utils/auth'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const data = await request.post('/api/user/login', {
      username: form.value.username,
      password: form.value.password
    })

    // 保存token和用戶信息
    if (data && data.token) {
      setToken(data.token)
      // 保存用戶信息（如果有）
      if (data.user || data.username) {
        setUserInfo(data.user || { username: data.username })
      }
      // 跳转到主页
      router.push('/')
    } else {
      errorMessage.value = '登錄失败：未返回token'
    }
  } catch (error) {
    errorMessage.value = error.message || '登錄失败，请检查用戶名和密碼'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(240, 185, 11, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(24, 144, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 48px;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
}

.login-title::after {
  content: 'MegaAI';
  display: block;
  font-size: 36px;
  background: linear-gradient(135deg, #f0b90b 0%, #f8d33a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 0;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-item input {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
}

.form-item input::placeholder {
  color: var(--text-tertiary);
}

.form-item input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.form-item input:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.login-button {
  padding: 14px 24px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  background: #f8d33a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 185, 11, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-radius: 8px;
  color: var(--accent-danger);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 24px;
  }
}
</style>

