<template>
  <div class="home-container">
    <!-- 全局Loading -->
    <div v-if="loading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">載入中...</p>
      </div>
    </div>
    
    <div v-else class="container">
      <!-- 用戶總覽 -->
      <div v-if="accountList.length > 0" class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">總帳戶數</span>
              <span class="overview-value">{{ totalAccountCount }}</span>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">策略運行中</span>
              <span class="overview-value">{{ runningStrategyCount }}</span>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">总淨值</span>
              <span class="overview-value highlight">{{ formatPrice(totalEquity) }}</span>
            </div>
          </div>
          <div class="overview-item" :class="getPnlClass(totalPnl)">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14l5-5 5 5z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">總盈虧</span>
              <span class="overview-value" :class="getPnlClass(totalPnl)">
                {{ formatPrice(totalPnl) }}
              </span>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">總手續費</span>
              <span class="overview-value fee-value">{{ formatPrice(totalFee) }}</span>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            </div>
            <div class="overview-content">
              <span class="overview-label">盈虧手續費比</span>
              <span class="overview-value">{{ formatRatio(pnlFeeRatio) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 篩選條件 -->
      <div v-if="!loading && accountList.length > 0" class="filter-card">
        <input 
          v-model="filterAccountName" 
          type="text" 
          placeholder="请输入账号名稱"
          class="filter-input"
        />
        <div class="custom-select" @click="toggleStrategySelect" ref="strategySelectRef">
          <div class="select-display">
            <span>{{ getStrategyStatusText(filterStrategyStatus) }}</span>
            <span class="select-arrow" :class="{ 'arrow-up': showStrategySelect }">▼</span>
          </div>
          <div v-if="showStrategySelect" class="select-options">
            <div 
              class="select-option" 
              :class="{ 'selected': filterStrategyStatus === '' }"
              @click.stop="selectStrategyStatus('')"
            >
              全部
            </div>
            <div 
              class="select-option" 
              :class="{ 'selected': filterStrategyStatus === '1' }"
              @click.stop="selectStrategyStatus('1')"
            >
              運行中
            </div>
            <div 
              class="select-option" 
              :class="{ 'selected': filterStrategyStatus === '0' }"
              @click.stop="selectStrategyStatus('0')"
            >
              已停止
            </div>
          </div>
        </div>
        <button class="btn-create" @click="handleCreate">
          创建
        </button>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="loading">載入中...</div>
      
      <!-- 帳戶列表 -->
      <div v-else-if="filteredAccountList.length > 0" class="account-list">
        <div 
          v-for="account in filteredAccountList" 
          :key="account.id" 
          class="account-card"
          :class="{ 'has-mock-data': account.mockData === 1 }"
        >
          <div class="account-header">
            <h3 class="account-name">{{ account.name }}</h3>
            <span class="account-exchange">{{ account.exchange }}</span>
            <span class="account-symbol">{{ account.symbol }}</span>
            <span class="strategy-status" :class="account.strategyStatus === 1 ? 'status-running' : 'status-stopped'">
              {{ account.strategyStatus === 1 ? '運行中' : '已停止' }}
              <span v-if="account.mockData === 1" class="mock-label">(实盘模拟)</span>
            </span>
          </div>
          
          <div class="account-info">
            <div class="info-row">
              <span class="info-label">当前淨值</span>
              <span class="info-value highlight">
                {{ formatPrice(account.curEquity) }} {{ account.equityCoin }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">總盈虧/今日盈虧</span>
              <span class="info-value" :class="getPnlClass(account.closePnl)">
                {{ formatPrice(account.closePnl) }} / {{ formatPrice(account.todayClosePnl || 0) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">總手續費/今日手續費</span>
              <span class="info-value fee-value">
                {{ formatPrice(getTotalFee(account)) }} / {{ formatPrice(getTodayFee(account)) }}
              </span>
            </div>
          </div>
          
          <div class="account-footer">
            <button 
              @click="goToDetail(account.id)" 
              class="btn-detail"
            >
              查看詳情
            </button>
          </div>
        </div>
      </div>
      
      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <p>{{ accountList.length > 0 ? '沒有符合條件的帳戶' : '暫無帳戶數據' }}</p>
      </div>
    </div>

    <!-- 创建账号弹窗 -->
    <Transition name="dialog">
      <div v-if="showCreateAccountDialog" class="confirm-overlay" @click.self="handleCancelCreateAccount">
        <div class="confirm-dialog create-account-dialog">
          <div class="confirm-title">创建账号</div>
          <div class="create-account-form">
            <div class="form-item">
              <label for="accountName">名称</label>
              <input
                id="accountName"
                v-model="createAccountForm.name"
                type="text"
                placeholder="请输入账号名称"
                :disabled="createAccountLoading"
              />
            </div>
            <div class="form-item">
              <label for="exchange">平台</label>
              <div class="custom-select-form" @click="toggleExchangeSelect" ref="exchangeSelectRef">
                <div class="select-display">
                  <span>{{ createAccountForm.exchange || '请选择平台' }}</span>
                  <span class="select-arrow" :class="{ 'arrow-up': showExchangeSelect }">▼</span>
                </div>
                <div v-if="showExchangeSelect" class="select-options">
                  <div 
                    class="select-option" 
                    :class="{ 'selected': createAccountForm.exchange === 'BINANCE' }"
                    @click.stop="selectExchange('BINANCE')"
                  >
                    BINANCE
                  </div>
                </div>
              </div>
            </div>
            <div class="form-item">
              <label for="strategy">策略</label>
              <div class="custom-select-form" @click="toggleStrategyListSelect" ref="strategyListSelectRef">
                <div class="select-display">
                  <span>{{ getSelectedStrategyName() || '请选择策略' }}</span>
                  <span class="select-arrow" :class="{ 'arrow-up': showStrategyListSelect }">▼</span>
                </div>
                <div v-if="showStrategyListSelect" class="select-options">
                  <div v-if="strategyListLoading" class="select-option loading-option">
                    載入中...
                  </div>
                  <div 
                    v-else-if="strategyList.length === 0"
                    class="select-option empty-option"
                  >
                    暫無策略
                  </div>
                  <div 
                    v-else
                    v-for="strategy in strategyList" 
                    :key="strategy.id || strategy.strategyInstanceId"
                    class="select-option" 
                    :class="{ 'selected': createAccountForm.strategyInstanceId === (strategy.id || strategy.strategyInstanceId) }"
                    @click.stop="selectStrategy(strategy.id || strategy.strategyInstanceId)"
                  >
                    {{ getStrategyDisplayText(strategy) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form-item">
              <label for="apiKey">KEY</label>
              <input
                id="apiKey"
                v-model="createAccountForm.apiKey"
                type="text"
                placeholder="请输入API Key"
                :disabled="createAccountLoading"
              />
            </div>
            <div class="form-item">
              <label for="apiSecret">SECRET</label>
              <input
                id="apiSecret"
                v-model="createAccountForm.apiKeyPass"
                type="password"
                placeholder="请输入API Secret"
                :disabled="createAccountLoading"
              />
            </div>
            <div class="form-item">
              <label for="tradeType">交易模式</label>
              <div class="custom-select-form" @click="toggleTradeTypeSelect" ref="tradeTypeSelectRef">
                <div class="select-display">
                  <span>{{ getTradeTypeText(createAccountForm.tradeType) || '请选择交易模式' }}</span>
                  <span class="select-arrow" :class="{ 'arrow-up': showTradeTypeSelect }">▼</span>
                </div>
                <div v-if="showTradeTypeSelect" class="select-options">
                  <div 
                    class="select-option" 
                    :class="{ 'selected': createAccountForm.tradeType === 1 }"
                    @click.stop="selectTradeType(1)"
                  >
                    模拟
                  </div>
                  <div 
                    class="select-option" 
                    :class="{ 'selected': createAccountForm.tradeType === 2 }"
                    @click.stop="selectTradeType(2)"
                  >
                    实盘
                  </div>
                </div>
              </div>
            </div>
            <div class="form-item">
              <label for="leverage">杠杆倍数</label>
              <input
                id="leverage"
                v-model.number="createAccountForm.leverage"
                type="number"
                min="1"
                max="125"
                placeholder="请输入杠杆倍数 (1-125)"
                :disabled="createAccountLoading"
              />
            </div>
            <div v-if="createAccountError" class="error-message">
              {{ createAccountError }}
            </div>
            <div class="confirm-buttons">
              <button type="button" class="btn btn-cancel" @click="handleCancelCreateAccount" :disabled="createAccountLoading">
                取消
              </button>
              <button type="button" class="btn btn-confirm" @click="handleSubmitCreateAccount" :disabled="createAccountLoading">
                <span v-if="createAccountLoading">處理中...</span>
                <span v-else>確認</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()

const loading = ref(false)
const accountList = ref([])
const filterStrategyStatus = ref('')
const filterAccountName = ref('')
const showStrategySelect = ref(false)
const strategySelectRef = ref(null)

// 创建账号相关状态
const showCreateAccountDialog = ref(false)
const createAccountLoading = ref(false)
const createAccountError = ref('')
const createAccountForm = ref({
  name: '',
  apiKey: '',
  apiKeyPass: '',
  exchange: 'BINANCE',
  leverage: 20,
  strategyInstanceId: '',
  tradeType: 2 // 1=模拟, 2=实盘，默认实盘
})

// 策略列表相关状态
const strategyList = ref([])
const strategyListLoading = ref(false)
const showStrategyListSelect = ref(false)
const strategyListSelectRef = ref(null)

// 平台下拉框相关状态
const showExchangeSelect = ref(false)
const exchangeSelectRef = ref(null)

// 交易模式下拉框相关状态
const showTradeTypeSelect = ref(false)
const tradeTypeSelectRef = ref(null)

// 计算總帳戶數
const totalAccountCount = computed(() => {
  return accountList.value.length
})

// 计算策略運行中数量
const runningStrategyCount = computed(() => {
  return accountList.value.filter(account => account.strategyStatus === 1).length
})

// 计算总淨值（基於所有帳戶）
const totalEquity = computed(() => {
  return accountList.value.reduce((sum, account) => {
    return sum + Number(account.curEquity || 0)
  }, 0)
})

// 计算總盈虧（基於所有帳戶）
const totalPnl = computed(() => {
  return accountList.value.reduce((sum, account) => {
    return sum + Number(account.closePnl || 0)
  }, 0)
})

// 计算總手續費（基於所有帳戶）
const totalFee = computed(() => {
  return accountList.value.reduce((sum, account) => {
    const openFee = Number(account.openFee || 0)
    const closeFee = Number(account.closeFee || 0)
    return sum + openFee + closeFee
  }, 0)
})

// 计算盈虧手續費比
const pnlFeeRatio = computed(() => {
  if (totalFee.value === 0) {
    return totalPnl.value === 0 ? 0 : null // 如果手續費为0，返回null表示无法计算
  }
  return totalPnl.value / totalFee.value
})

// 筛选后的帳戶列表
const filteredAccountList = computed(() => {
  let filtered = accountList.value

  // 按策略狀態篩選
  if (filterStrategyStatus.value !== '') {
    const status = Number(filterStrategyStatus.value)
    filtered = filtered.filter(account => account.strategyStatus === status)
  }

  // 按帳號名稱篩選
  if (filterAccountName.value.trim()) {
    const keyword = filterAccountName.value.trim().toLowerCase()
    filtered = filtered.filter(account => 
      account.name && account.name.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 格式化数字（保留两位小数）
const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  const num = Number(value)
  if (isNaN(num)) {
    return '-'
  }
  return num.toFixed(2)
}

// 格式化比率（保留两位小数）
const formatRatio = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  const num = Number(value)
  if (isNaN(num)) {
    return '-'
  }
  return num.toFixed(2)
}

// 计算總手續費
const getTotalFee = (account) => {
  const openFee = Number(account.openFee || 0)
  const closeFee = Number(account.closeFee || 0)
  return openFee + closeFee
}

// 計算今日手續費
const getTodayFee = (account) => {
  const todayOpenFee = Number(account.todayOpenFee || 0)
  const todayCloseFee = Number(account.todayCloseFee || 0)
  return todayOpenFee + todayCloseFee
}

// 获取盈虧样式类
const getPnlClass = (value) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const num = Number(value)
  if (num > 0) {
    return 'pnl-positive'
  } else if (num < 0) {
    return 'pnl-negative'
  }
  return ''
}

// 获取帳戶列表
const fetchAccountList = async () => {
  loading.value = true
  try {
    const data = await request.post('/api/account/pageList', {
      page: 1,
      pageSize: 100
    })
    
    // 處理返回的數據，从 data.records 中读取帳戶列表
    if (data && Array.isArray(data.records)) {
      accountList.value = data.records
    } else if (Array.isArray(data)) {
      accountList.value = data
    } else if (data && Array.isArray(data.list)) {
      accountList.value = data.list
    } else {
      accountList.value = []
    }
  } catch (error) {
    console.error('获取帳戶列表失败:', error)
    accountList.value = []
  } finally {
    loading.value = false
  }
}

// 跳转到詳情页
const goToDetail = (accountId) => {
  router.push({
    path: '/account-detail',
    query: { accountId }
  })
}

// 获取策略狀態文本
const getStrategyStatusText = (value) => {
  if (value === '1') return '運行中'
  if (value === '0') return '已停止'
  return '全部'
}

// 处理创建按钮点击
const handleCreate = async () => {
  // 重置表单
  createAccountForm.value = {
    name: '',
    apiKey: '',
    apiKeyPass: '',
    exchange: 'BINANCE',
    leverage: 20,
    strategyInstanceId: '',
    tradeType: 2 // 1=模拟, 2=实盘，默认实盘
  }
  createAccountError.value = ''
  showCreateAccountDialog.value = true
  
  // 加载策略列表
  await fetchStrategyList()
}

// 获取策略列表
const fetchStrategyList = async () => {
  strategyListLoading.value = true
  try {
    // 使用通用策略列表接口（不带accountId）
    const data = await request.get('/api/app/strategy/list')
    strategyList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取策略列表失败:', error)
    strategyList.value = []
    // 如果是在创建账号弹窗中，显示错误信息
    if (showCreateAccountDialog.value) {
      createAccountError.value = error.message || '获取策略列表失败'
    }
  } finally {
    strategyListLoading.value = false
  }
}

// 获取选中的策略显示文本（交易对 - 策略名称）
const getSelectedStrategyName = () => {
  if (!createAccountForm.value.strategyInstanceId) return ''
  const strategy = strategyList.value.find(s => 
    (s.id && s.id === createAccountForm.value.strategyInstanceId) || 
    (s.strategyInstanceId && s.strategyInstanceId === createAccountForm.value.strategyInstanceId)
  )
  if (!strategy) return ''
  
  const symbol = strategy.symbol || '-'
  const name = strategy.name || strategy.strategyInstanceName || '-'
  return `${symbol} - ${name}`
}

// 获取策略显示文本（交易对 - 策略名称）
const getStrategyDisplayText = (strategy) => {
  if (!strategy) return '-'
  const symbol = strategy.symbol || '-'
  const name = strategy.name || strategy.strategyInstanceName || '-'
  return `${symbol} - ${name}`
}

// 切换平台下拉框
const toggleExchangeSelect = () => {
  showExchangeSelect.value = !showExchangeSelect.value
  if (showExchangeSelect.value) {
    showStrategyListSelect.value = false
    showTradeTypeSelect.value = false
  }
}

// 选择平台
const selectExchange = (value) => {
  createAccountForm.value.exchange = value
  showExchangeSelect.value = false
}

// 切换策略列表下拉框
const toggleStrategyListSelect = () => {
  showStrategyListSelect.value = !showStrategyListSelect.value
  if (showStrategyListSelect.value) {
    showExchangeSelect.value = false
    showTradeTypeSelect.value = false
  }
}

// 选择策略
const selectStrategy = (strategyId) => {
  createAccountForm.value.strategyInstanceId = strategyId
  showStrategyListSelect.value = false
}

// 获取交易模式文本
const getTradeTypeText = (value) => {
  if (value === 1) return '模拟'
  if (value === 2) return '实盘'
  return ''
}

// 切换交易模式下拉框
const toggleTradeTypeSelect = () => {
  showTradeTypeSelect.value = !showTradeTypeSelect.value
  if (showTradeTypeSelect.value) {
    showExchangeSelect.value = false
    showStrategyListSelect.value = false
  }
}

// 选择交易模式
const selectTradeType = (value) => {
  createAccountForm.value.tradeType = value
  showTradeTypeSelect.value = false
}

// 取消创建账号
const handleCancelCreateAccount = () => {
  showCreateAccountDialog.value = false
  createAccountForm.value = {
    name: '',
    apiKey: '',
    apiKeyPass: '',
    exchange: 'BINANCE',
    leverage: 20,
    strategyInstanceId: '',
    tradeType: 2 // 1=模拟, 2=实盘，默认实盘
  }
  createAccountError.value = ''
  showExchangeSelect.value = false
  showStrategyListSelect.value = false
  showTradeTypeSelect.value = false
}

// 提交创建账号
const handleSubmitCreateAccount = async () => {
  createAccountError.value = ''
  
  // 验证表单
  if (!createAccountForm.value.name || !createAccountForm.value.name.trim()) {
    createAccountError.value = '请输入账号名称'
    return
  }
  
  if (!createAccountForm.value.apiKey || !createAccountForm.value.apiKey.trim()) {
    createAccountError.value = '请输入API Key'
    return
  }
  
  if (!createAccountForm.value.apiKeyPass || !createAccountForm.value.apiKeyPass.trim()) {
    createAccountError.value = '请输入API Secret'
    return
  }
  
  if (!createAccountForm.value.exchange) {
    createAccountError.value = '请选择平台'
    return
  }
  
  if (!createAccountForm.value.leverage) {
    createAccountError.value = '请输入杠杆倍数'
    return
  }
  
  const leverage = Number(createAccountForm.value.leverage)
  if (isNaN(leverage) || leverage < 1 || leverage > 125 || !Number.isInteger(leverage)) {
    createAccountError.value = '杠杆倍数必须是1-125之间的整数'
    return
  }
  
  if (!createAccountForm.value.strategyInstanceId) {
    createAccountError.value = '请选择策略'
    return
  }
  
  if (!createAccountForm.value.tradeType) {
    createAccountError.value = '请选择交易模式'
    return
  }
  
  createAccountLoading.value = true
  try {
    await request.post('/api/app/create/account', {
      name: createAccountForm.value.name.trim(),
      apiKey: createAccountForm.value.apiKey.trim(),
      apiKeyPass: createAccountForm.value.apiKeyPass.trim(),
      exchange: createAccountForm.value.exchange,
      leverage: leverage,
      strategyInstanceId: createAccountForm.value.strategyInstanceId,
      tradeType: createAccountForm.value.tradeType
    })
    
    // 成功，关闭弹窗并刷新账号列表
    showCreateAccountDialog.value = false
    createAccountForm.value = {
      name: '',
      apiKey: '',
      apiKeyPass: '',
      exchange: 'BINANCE',
      leverage: 20,
      strategyInstanceId: '',
      tradeType: 2 // 1=模拟, 2=实盘，默认实盘
    }
    createAccountError.value = ''
    
    // 刷新账号列表
    await fetchAccountList()
  } catch (error) {
    createAccountError.value = error.message || '创建账号失败'
  } finally {
    createAccountLoading.value = false
  }
}

// 切换策略狀態下拉框
const toggleStrategySelect = () => {
  showStrategySelect.value = !showStrategySelect.value
}

// 选择策略狀態
const selectStrategyStatus = (value) => {
  filterStrategyStatus.value = value
  showStrategySelect.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (strategySelectRef.value && !strategySelectRef.value.contains(event.target)) {
    showStrategySelect.value = false
  }
  if (exchangeSelectRef.value && !exchangeSelectRef.value.contains(event.target)) {
    showExchangeSelect.value = false
  }
  if (strategyListSelectRef.value && !strategyListSelectRef.value.contains(event.target)) {
    showStrategyListSelect.value = false
  }
  if (tradeTypeSelectRef.value && !tradeTypeSelectRef.value.contains(event.target)) {
    showTradeTypeSelect.value = false
  }
}

onMounted(() => {
  fetchAccountList()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* CSS变量已在App.vue中定义，这里直接使用 */
.home-container {
  min-height: 100vh;
  padding: 24px;
  background-color: var(--bg-primary);
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.filter-card {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  flex-wrap: nowrap;
}

.filter-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
  min-width: 0;
  height: 36px;
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.filter-input::placeholder {
  color: var(--text-tertiary);
}

/* 自定义下拉选择框 */
.custom-select {
  position: relative;
  width: 85px;
  flex-shrink: 0;
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;
  box-sizing: border-box;
}

.custom-select:hover .select-display {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.select-arrow {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
  margin-left: 8px;
}

.select-arrow.arrow-up {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.select-option {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.select-option:hover {
  background: var(--bg-hover);
}

.select-option.selected {
  background: rgba(240, 185, 11, 0.1);
  color: var(--accent-primary);
  font-weight: 500;
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

.overview-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  box-sizing: border-box;
}

.overview-card .overview-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.overview-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.overview-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

.overview-item.pnl-positive:hover {
  border-color: var(--accent-success);
}

.overview-item.pnl-negative:hover {
  border-color: var(--accent-danger);
}

.overview-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.overview-item:nth-child(1) .overview-icon {
  background: rgba(24, 144, 255, 0.15);
  color: var(--accent-info);
}

.overview-item:nth-child(2) .overview-icon {
  background: rgba(14, 203, 129, 0.15);
  color: var(--accent-success);
}

.overview-item:nth-child(3) .overview-icon {
  background: rgba(24, 144, 255, 0.15);
  color: var(--accent-info);
}

.overview-item:nth-child(4).pnl-positive .overview-icon {
  background: rgba(14, 203, 129, 0.15);
  color: var(--accent-success);
}

.overview-item:nth-child(4).pnl-negative .overview-icon {
  background: rgba(246, 70, 93, 0.15);
  color: var(--accent-danger);
}

.overview-item:nth-child(5) .overview-icon {
  background: rgba(246, 70, 93, 0.15);
  color: var(--accent-danger);
}

.overview-item:nth-child(6) .overview-icon {
  background: rgba(240, 185, 11, 0.15);
  color: var(--accent-primary);
}

.overview-icon svg {
  width: 18px;
  height: 18px;
}

.overview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.overview-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
  white-space: nowrap;
}

.overview-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
}

.overview-value.highlight {
  color: var(--accent-info);
}

.overview-value.pnl-positive {
  color: var(--accent-success);
}

.overview-value.pnl-negative {
  color: var(--accent-danger);
}

.overview-value.fee-value {
  color: var(--accent-danger);
}

@media (max-width: 768px) {
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.global-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.account-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.account-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: visible;
}

.account-card:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 模拟交易标签 - 红色三角形（右上角） */
.account-card.has-mock-data::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background-color: #ff4d4f;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  z-index: 10;
  border-radius: 0 8px 0 0;
}

.mock-label {
  font-size: 10px;
  color: #ff4d4f;
  margin-left: 6px;
  font-weight: 400;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.account-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.account-exchange {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 3px 8px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.account-symbol {
  font-size: 11px;
  color: var(--accent-info);
  padding: 3px 8px;
  background-color: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 4px;
}

.strategy-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid;
}

.strategy-status.status-running {
  color: var(--accent-success);
  background-color: rgba(14, 203, 129, 0.1);
  border-color: rgba(14, 203, 129, 0.3);
}

.strategy-status.status-stopped {
  color: var(--text-tertiary);
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
}

.account-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.info-value.highlight {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-info);
}

.info-value.pnl-positive {
  color: var(--accent-success);
}

.info-value.pnl-negative {
  color: var(--accent-danger);
}

.info-value.fee-value {
  color: var(--accent-danger);
}

.account-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.btn-detail {
  width: 100%;
  padding: 8px 16px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #f8d33a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 185, 11, 0.4);
}

.btn-detail:active {
  transform: translateY(0);
}

.btn-create {
  padding: 0 16px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;
  box-sizing: border-box;
  flex-shrink: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-create:hover {
  background: #f8d33a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 185, 11, 0.4);
}

.btn-create:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .account-list {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}

/* 创建账号弹窗样式 */
.confirm-overlay {
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
}

.confirm-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
  min-width: 320px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
}

.create-account-dialog {
  min-width: 450px;
  max-width: 500px;
}

/* 弹窗动画效果 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .confirm-dialog,
.dialog-leave-active .confirm-dialog {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .confirm-dialog,
.dialog-leave-to .confirm-dialog {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.dialog-enter-to .confirm-dialog,
.dialog-leave-from .confirm-dialog {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.create-account-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.create-account-form .form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.create-account-form .form-item label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0;
  min-width: 80px;
  flex-shrink: 0;
}

.create-account-form .form-item input {
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
  height: 36px;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
}

.create-account-form .form-item input::placeholder {
  color: var(--text-tertiary);
}

.create-account-form .form-item input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
  outline: none;
}

.create-account-form .form-item input:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 单选按钮组样式 */
.radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  user-select: none;
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-primary);
  margin: 0;
}

.radio-option input[type="radio"]:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radio-option span {
  color: var(--text-primary);
}

.radio-option:has(input[type="radio"]:disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}

.custom-select-form {
  position: relative;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.custom-select-form .select-display {
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  height: 36px;
  box-sizing: border-box;
}

.custom-select-form .select-display:hover {
  border-color: var(--accent-primary);
}

.custom-select-form .select-display:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.custom-select-form .select-arrow {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.custom-select-form .select-arrow.arrow-up {
  transform: rotate(180deg);
}

.custom-select-form .select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  /* 限制最大高度，防止溢出屏幕 */
  max-height: min(200px, calc(100vh - 300px));
  overflow-y: auto;
  overflow-x: hidden;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-secondary);
}

.custom-select-form .select-option {
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.custom-select-form .select-option:hover {
  background-color: var(--bg-hover);
}

.custom-select-form .select-option.selected {
  background-color: rgba(240, 185, 11, 0.1);
  color: var(--accent-primary);
  font-weight: 500;
}

.custom-select-form .select-option.loading-option,
.custom-select-form .select-option.empty-option {
  color: var(--text-tertiary);
  cursor: default;
  text-align: center;
}

.error-message {
  padding: 8px 10px;
  background: rgba(246, 70, 93, 0.1);
  border: 1px solid var(--accent-danger);
  border-radius: 6px;
  color: var(--accent-danger);
  font-size: 12px;
  margin-top: -6px;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.1);
}

.btn-confirm {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

.btn-confirm:hover:not(:disabled) {
  background-color: #e6b00a;
  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-account-dialog {
    min-width: 90%;
    max-width: 90%;
  }
}
</style>

