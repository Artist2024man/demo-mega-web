<template>
  <div class="account-detail">
    <!-- 全局Loading -->
    <div v-if="loading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">載入中...</p>
      </div>
    </div>
    
    <div v-else class="container">
      <!-- 策略資訊卡片 -->
      <div v-if="accountInfo" class="card">
        <h2 class="card-title">策略資訊</h2>
        <div class="info-grid">
          <div class="info-item info-item-with-edit">
            <span class="label">帳號名稱</span>
            <span class="value">{{ accountInfo.name || '-' }}</span>
            <button 
              @click="handleSwitchAccount"
              class="btn-edit-strategy-inline"
              :disabled="actionLoading"
              title="切換帳號"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L8 8L12 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 8H8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 20L16 16L12 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 16H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="info-item">
            <span class="label">平台/交易對</span>
            <span class="value value-ellipsis">{{ accountInfo.exchange || '-' }} / {{ accountInfo.symbol || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">帳戶淨值</span>
            <span class="value highlight">{{ formatPrice(accountInfo.curEquity) }} {{ accountInfo.equityCoin || 'USDT' }}</span>
          </div>
          <div class="info-item info-item-with-edit">
            <span class="label">槓桿倍數</span>
            <span class="value" :class="getLeverageClass(accountInfo.leverage)">{{ accountInfo.leverage || '-' }}</span>
            <button 
              @click="handleEditLeverage"
              class="btn-edit-strategy-inline"
              :disabled="actionLoading"
              title="編輯槓桿倍數"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="info-item info-item-with-edit">
            <span class="label">策略名稱</span>
            <span class="value">{{ accountInfo.strategyInstanceName || '-' }}</span>
            <button 
              @click="handleEditStrategy"
              class="btn-edit-strategy-inline"
              :disabled="actionLoading"
              title="切換策略"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L8 8L12 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 8H8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 20L16 16L12 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 16H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="info-item" :class="{ 'has-mock-data': accountInfo.mockData === 1 }">
            <span class="label">策略状态</span>
            <span class="value status" :class="accountInfo.strategyStatus === 1 ? 'running' : 'stopped'">
              {{ accountInfo.strategyStatus === 1 ? '運行中' : '已停止' }}
              <span v-if="accountInfo.mockData === 1" class="mock-label">(实盘模拟)</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">總盈虧/今日盈虧</span>
            <span class="value">
              <span :class="getPnlClass(closePnlAfterFee)">
                {{ closePnlAfterFee !== null ? formatPrice(closePnlAfterFee) : '-' }}
              </span>
              <span class="value-separator"> / </span>
              <span :class="getPnlClass(todayClosePnlAfterFee)">
                {{ todayClosePnlAfterFee !== null ? formatPrice(todayClosePnlAfterFee) : '-' }}
              </span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">總手續費/今日手續費</span>
            <span class="value fee-value">
              <span>{{ totalFee !== null ? formatPrice(totalFee) : '-' }}</span>
              <span class="value-separator"> / </span>
              <span>{{ todayFee !== null ? formatPrice(todayFee) : '-' }}</span>
            </span>
          </div>
        </div>

        <!-- 策略操作按钮 -->
        <div class="action-buttons">
          <button 
            v-if="accountInfo.strategyStatus === 0" 
            @click="handleStartStrategy"
            :disabled="actionLoading"
            class="btn btn-primary"
          >
            <span v-if="actionLoading">處理中...</span>
            <span v-else>开始策略</span>
          </button>
          <button 
            v-if="accountInfo.strategyStatus === 1" 
            @click="handleStopStrategy"
            :disabled="actionLoading"
            class="btn btn-danger"
          >
            <span v-if="actionLoading">處理中...</span>
            <span v-else>
              停止策略
              <template v-if="accountInfo.strategyMinPrice != null || accountInfo.strategyMaxPrice != null">
                <span class="price-range">
                  ({{ accountInfo.strategyMinPrice != null ? formatPrice(accountInfo.strategyMinPrice) : '-' }}-{{ accountInfo.strategyMaxPrice != null ? formatPrice(accountInfo.strategyMaxPrice) : '-' }})
                </span>
              </template>
            </span>
          </button>
        </div>
      </div>


      <!-- 運行会话卡片 -->
      <div v-if="accountInfo" class="card">
        <div class="card-title-with-price">
          <div class="title-left">
            <h2 class="card-title">當前持倉</h2>
            <template v-if="firstPosition && firstPosition.session">
              <template v-if="getOpenPosition(firstPosition.session.bizParam)">
                <span class="title-tag position-tag" :class="getOpenPosition(firstPosition.session.bizParam) === 'LONG' ? 'position-long' : 'position-short'">
                  {{ getOpenPosition(firstPosition.session.bizParam) === 'LONG' ? '做多' : '做空' }}
                </span>
              </template>
              <template v-if="firstPosition.session && firstPosition.session.bizStatus">
                <span 
                  v-if="firstPosition.session.bizStatus === 3" 
                  class="title-tag status-tag status-opened"
                >
                  已開倉
                </span>
                <span 
                  v-else-if="firstPosition.session.bizStatus === 5" 
                  class="title-tag status-tag status-added"
                >
                  已加倉
                </span>
                <span 
                  v-else-if="firstPosition.session.bizStatus === 6" 
                  class="title-tag status-tag status-hedged"
                >
                  已對沖
                </span>
              </template>
              <span v-if="firstPosition.session.createTime" class="title-time">{{ formatTime(firstPosition.session.createTime) }}</span>
            </template>
          </div>
          <div v-if="symbolPrice !== null" class="symbol-price">
            <span class="price-value" :class="getPriceChangeClass()">{{ formatPrice(symbolPrice) }}</span>
          </div>
        </div>
        <!-- 策略开启时，显示 runningPositionsList（从 positions 字段提取） -->
        <div v-if="accountInfo.strategyStatus === 1 && runningPositionsList && runningPositionsList.length > 0" class="session-list">
          <div 
            v-for="(position, index) in runningPositionsList" 
            :key="`position-${position.sessionId}-${index}`" 
            class="session-item"
            :class="{ 'has-mock-data': position.session && position.session.mockData === 1 }"
          >
            <div class="session-content">
              <template v-if="position.positionSide">
                <span class="session-value position-tag" :class="position.positionSide === 'LONG' ? 'position-long' : 'position-short'">
                  {{ position.positionSide === 'LONG' ? '做多' : '做空' }}
                </span>
                <span class="session-separator">|</span>
              </template>
              <span class="session-label">數量/均價</span>
              <span class="session-value">{{ formatNumber(Math.abs(position.positionAmt)) }} / {{ formatPrice(position.entryPrice) }}</span>
              <span class="session-separator">|</span>
              <span class="session-label session-label-spaced">平倉價</span>
              <span class="session-value">
                <span class="price-profit">{{ position.takeProfitPrice ? formatPrice(position.takeProfitPrice) : '-' }}</span>
              </span>
              <span class="session-separator">|</span>
              <span class="session-label session-label-spaced">止盈/止損</span>
              <span class="session-value">
                <span class="price-profit">{{ position.algoTakeProfitPrice ? formatPrice(position.algoTakeProfitPrice) : '-' }}</span> / <span class="price-loss">{{ position.algoStopLossPrice ? formatPrice(position.algoStopLossPrice) : '-' }}</span>
              </span>
              <span v-if="position.unRealizedProfit !== null && position.unRealizedProfit !== undefined" class="session-separator">|</span>
              <span v-if="position.unRealizedProfit !== null && position.unRealizedProfit !== undefined" class="session-value pnl-value" :class="getPnlClass(position.unRealizedProfit)">
                <span v-if="position.unRealizedProfit > 0" class="arrow-up">↑</span>
                <span v-if="position.unRealizedProfit < 0" class="arrow-down">↓</span>
                {{ formatPrice(position.unRealizedProfit) }}
              </span>
            </div>
            <div class="session-actions">
              <button 
                v-if="accountInfo.strategyStatus !== 1"
                @click="handleAddPosition(position.sessionId)"
                :disabled="actionLoading"
                class="btn btn-action btn-add-position"
              >
                加倉
              </button>
              <button 
                v-if="accountInfo.strategyStatus === 1"
                disabled
                class="btn btn-action btn-add-position btn-disabled"
              >
                加倉
              </button>
              <button 
                v-if="position.positionSide === 'LONG'"
                @click="handleCloseLong(position.sessionId)"
                :disabled="actionLoading"
                class="btn btn-action btn-close-long"
              >
                <span v-if="actionLoading">處理中...</span>
                <span v-else>平多</span>
              </button>
              <button 
                v-if="position.positionSide === 'SHORT'"
                @click="handleCloseShort(position.sessionId)"
                :disabled="actionLoading"
                class="btn btn-action btn-close-short"
              >
                <span v-if="actionLoading">處理中...</span>
                <span v-else>平空</span>
              </button>
              <button 
                @click="handleSetStopLossTakeProfit(position)"
                :disabled="accountInfo.strategyStatus === 1 || actionLoading"
                class="btn btn-action btn-stop-loss-take-profit"
              >
                止盈/止損
              </button>
            </div>
          </div>
        </div>
        <!-- 策略未开启时，显示 positionRiskList -->
        <div v-else-if="accountInfo.strategyStatus !== 1 && positionRiskList && positionRiskList.length > 0" class="session-list">
          <div 
            v-for="(position, index) in positionRiskList" 
            :key="`position-${index}`" 
            class="session-item"
            :class="{ 'has-mock-data': position.mockData === 1 }"
          >
            <div class="session-content">
              <span class="session-value position-tag" :class="position.positionSide === 'LONG' ? 'position-long' : 'position-short'">
                {{ position.positionSide === 'LONG' ? '做多' : '做空' }}
              </span>
              <span v-if="position.createTime" class="session-time">{{ formatTime(position.createTime) }}</span>
              <span class="session-separator">|</span>
              <span class="session-label">數量/均價</span>
              <span class="session-value">{{ formatNumber(Math.abs(position.positionAmt)) }} / {{ formatPrice(position.entryPrice) }}</span>
              <span class="session-separator">|</span>
              <span class="session-label session-label-spaced">平倉價</span>
              <span class="session-value">
                <span class="price-profit">{{ position.takeProfitPrice ? formatPrice(position.takeProfitPrice) : '-' }}</span>
              </span>
              <span class="session-separator">|</span>
              <span class="session-label session-label-spaced">止盈/止損</span>
              <span class="session-value">
                <span class="price-profit">{{ position.algoTakeProfitPrice ? formatPrice(position.algoTakeProfitPrice) : '-' }}</span> / <span class="price-loss">{{ position.algoStopLossPrice ? formatPrice(position.algoStopLossPrice) : '-' }}</span>
              </span>
              <span v-if="position.unRealizedProfit !== null && position.unRealizedProfit !== undefined" class="session-separator">|</span>
              <span v-if="position.unRealizedProfit !== null && position.unRealizedProfit !== undefined" class="session-value pnl-value" :class="getPnlClass(position.unRealizedProfit)">
                <span v-if="position.unRealizedProfit > 0" class="arrow-up">↑</span>
                <span v-if="position.unRealizedProfit < 0" class="arrow-down">↓</span>
                {{ formatPrice(position.unRealizedProfit) }}
              </span>
            </div>
            <div class="session-actions">
              <button 
                @click="handleAddPosition(null, index)"
                :disabled="actionLoading"
                class="btn btn-action btn-add-position"
              >
                加倉
              </button>
              <button 
                v-if="position.positionSide === 'LONG'"
                @click="handleCloseLong(position.sessionId)"
                :disabled="actionLoading"
                class="btn btn-action btn-close-long"
              >
                <span v-if="actionLoading">處理中...</span>
                <span v-else>平多</span>
              </button>
              <button 
                v-if="position.positionSide === 'SHORT'"
                @click="handleCloseShort(position.sessionId)"
                :disabled="actionLoading"
                class="btn btn-action btn-close-short"
              >
                <span v-if="actionLoading">處理中...</span>
                <span v-else>平空</span>
              </button>
              <button 
                @click="handleSetStopLossTakeProfit(position)"
                :disabled="accountInfo.strategyStatus === 1 || actionLoading"
                class="btn btn-action btn-stop-loss-take-profit"
              >
                止盈/止損
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-session">
          <div v-if="accountInfo.strategyStatus === 1" class="session-loading-spinner"></div>
          <span v-if="accountInfo.strategyStatus === 1" class="session-loading-text">
            策略正在盡全力幫您計算進場位置...
          </span>
          <template v-if="accountInfo.strategyStatus !== 1">
            <button 
              @click="handleOpenPosition"
              :disabled="actionLoading"
              class="btn btn-action btn-open-position"
            >
              手動開倉
            </button>
            <span class="empty-hint">沒有任何倉位資訊</span>
          </template>
        </div>
      </div>

      <!-- 歷史倉位卡片 -->
      <div v-if="historySessionList && historySessionList.length > 0" class="card">
        <h2 class="card-title">歷史倉位</h2>
        <div class="session-list">
          <div 
            v-for="session in historySessionList" 
            :key="session.id" 
            class="session-item"
            :class="{ 'has-mock-data': session.mockData === 1 }"
          >
            <div class="session-content">
              <template v-if="getOpenPosition(session.bizParam)">
                <span class="session-value position-tag" :class="getOpenPosition(session.bizParam) === 'LONG' ? 'position-long' : 'position-short'">
                  {{ getOpenPosition(session.bizParam) === 'LONG' ? '做多' : '做空' }}
                </span>
                <span class="session-separator">|</span>
              </template>
              <span class="session-label">數量/均價</span>
              <span class="session-value">{{ formatNumber(session.holdQty) }} / {{ formatPrice(session.holdAvePrice) }}</span>
              <span v-if="session.takeProfitPrice" class="session-separator">|</span>
              <span v-if="session.takeProfitPrice" class="session-label session-label-spaced">平倉價</span>
              <span v-if="session.takeProfitPrice" class="session-value">
                <span class="price-profit">{{ session.takeProfitPrice ? formatPrice(session.takeProfitPrice) : '-' }}</span>
              </span>
              <span v-if="session.closePnl !== null && session.closePnl !== undefined" class="session-separator">|</span>
              <span v-if="session.createTime || session.updateTime" class="session-time">
                <span v-if="session.createTime">{{ formatTime(session.createTime) }}</span>
                <span v-if="session.createTime && session.updateTime"> - </span>
                <span v-if="session.updateTime">{{ formatTimeMinus2Seconds(session.updateTime) }}</span>
              </span>
              <span v-if="(session.createTime || session.updateTime) && session.closePnl !== null && session.closePnl !== undefined" class="session-separator">|</span>
              <span v-if="session.closePnl !== null && session.closePnl !== undefined" class="session-value pnl-value" :class="getPnlClass(session.closePnl)">
                <span v-if="session.closePnl > 0" class="arrow-up">↑</span>
                <span v-if="session.closePnl < 0" class="arrow-down">↓</span>
                {{ formatPrice(session.closePnl) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast提示 -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>

    <!-- 確認弹窗 -->
    <Transition name="dialog">
      <div v-if="showConfirmDialog" class="confirm-overlay" @click.self="handleCancelConfirm">
        <div class="confirm-dialog">
        <div class="confirm-title">確認操作</div>
        <div class="confirm-content">{{ confirmMessage }}</div>
        <div class="confirm-buttons">
          <button class="btn btn-cancel" @click="handleCancelConfirm">取消</button>
          <button class="btn btn-confirm" @click="handleConfirm">確認</button>
        </div>
      </div>
    </div>
    </Transition>

        <!-- 加倉输入弹窗 -->
        <Transition name="dialog">
        <div v-if="showAddPositionDialog" class="confirm-overlay" @click.self="handleCancelAddPosition">
          <div class="confirm-dialog add-position-dialog">
            <div class="confirm-title">加倉</div>
            <div class="add-position-form">
              <div class="form-item">
                <label>方向</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input
                      type="radio"
                      v-model="addPositionDirection"
                      value="LONG"
                      :disabled="actionLoading"
                    />
                    <span>開多</span>
                  </label>
                  <label class="radio-option">
                    <input
                      type="radio"
                      v-model="addPositionDirection"
                      value="SHORT"
                      :disabled="actionLoading"
                    />
                    <span>開空</span>
                  </label>
                </div>
              </div>
              <div class="form-item">
                <label for="addAmount">加倉數量 ({{ accountInfo?.symbol || '' }})</label>
                <div class="input-with-clear">
                  <input
                    id="addAmount"
                    v-model="addPositionAmount"
                    type="number"
                    step="any"
                    placeholder="請輸入加倉數量"
                    required
                    :disabled="actionLoading"
                    @keyup.enter="handleSubmitAddPosition"
                  />
                  <button
                    v-if="addPositionAmount"
                    type="button"
                    class="input-clear-btn"
                    @click="addPositionAmount = ''"
                    :disabled="actionLoading"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div v-if="addPositionError" class="error-message">
                {{ addPositionError }}
              </div>
              <div class="confirm-buttons">
                <button type="button" class="btn btn-cancel" @click="handleCancelAddPosition" :disabled="actionLoading">
                  取消
                </button>
                <button type="button" class="btn btn-confirm" @click="handleSubmitAddPosition" :disabled="actionLoading">
                  <span v-if="actionLoading">處理中...</span>
                  <span v-else>確認</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </Transition>

    <!-- 開倉输入弹窗 -->
    <Transition name="dialog">
    <div v-if="showOpenPositionDialog" class="confirm-overlay" @click.self="handleCancelOpenPosition">
      <div class="confirm-dialog add-position-dialog">
        <div class="confirm-title">手動開倉</div>
        <div class="add-position-form">
          <div class="form-item">
            <label>方向</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="openPositionDirection"
                  value="LONG"
                  :disabled="actionLoading"
                />
                <span>開多</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="openPositionDirection"
                  value="SHORT"
                  :disabled="actionLoading"
                />
                <span>開空</span>
              </label>
            </div>
          </div>
          <div class="form-item">
            <label for="openAmount">開倉數量 ({{ accountInfo?.symbol || '' }})</label>
            <div class="input-with-clear">
              <input
                id="openAmount"
                v-model="openPositionAmount"
                type="number"
                step="any"
                placeholder="請輸入開倉數量"
                required
                :disabled="actionLoading"
                @keyup.enter="handleSubmitOpenPosition"
              />
              <button
                v-if="openPositionAmount"
                type="button"
                class="input-clear-btn"
                @click="openPositionAmount = ''"
                :disabled="actionLoading"
              >
                ×
              </button>
            </div>
          </div>
          <div v-if="openPositionError" class="error-message">
            {{ openPositionError }}
          </div>
          <div class="confirm-buttons">
            <button type="button" class="btn btn-cancel" @click="handleCancelOpenPosition" :disabled="actionLoading">
              取消
            </button>
            <button type="button" class="btn btn-confirm" @click="handleSubmitOpenPosition" :disabled="actionLoading">
              <span v-if="actionLoading">處理中...</span>
              <span v-else>確認</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 止盈/止損弹窗 -->
    <Transition name="dialog">
    <div v-if="showStopLossTakeProfitDialog" class="confirm-overlay" @click.self="handleCancelStopLossTakeProfit">
      <div class="confirm-dialog add-position-dialog">
        <div class="confirm-title-with-price">
          <div class="confirm-title">止盈/止損</div>
          <div v-if="symbolPrice !== null" class="symbol-price">
            <span class="price-value" :class="getPriceChangeClass()">{{ formatPrice(symbolPrice) }}</span>
          </div>
        </div>
        <div class="add-position-form">
          <!-- 显示当前信息 -->
          <div class="form-item">
            <div class="session-content session-content-dialog">
              <template v-if="currentStopLossTakeProfit?.positionSide">
                <span class="session-value position-tag" :class="currentStopLossTakeProfit?.positionSide === 'LONG' ? 'position-long' : 'position-short'">
                  {{ currentStopLossTakeProfit?.positionSide === 'LONG' ? '做多' : '做空' }}
                </span>
                <span class="session-separator">|</span>
              </template>
              <span class="session-label">數量/均價</span>
              <span class="session-value">{{ formatNumber(Math.abs(currentStopLossTakeProfit?.positionAmt || 0)) }} / {{ formatPrice(currentStopLossTakeProfit?.entryPrice || 0) }}</span>
              <span v-if="currentPositionRealTimePnl !== null && currentPositionRealTimePnl !== undefined" class="session-separator">|</span>
              <span v-if="currentPositionRealTimePnl !== null && currentPositionRealTimePnl !== undefined" class="session-value pnl-value" :class="getPnlClass(currentPositionRealTimePnl)">
                <span v-if="currentPositionRealTimePnl > 0" class="arrow-up">↑</span>
                <span v-if="currentPositionRealTimePnl < 0" class="arrow-down">↓</span>
                {{ formatPrice(currentPositionRealTimePnl) }}
              </span>
            </div>
          </div>

          <!-- 止盈价格 -->
          <div class="form-item">
            <label for="takeProfitPrice">止盈價格</label>
            <div class="input-with-pnl">
              <div class="input-with-clear">
                <input
                  id="takeProfitPrice"
                  v-model="takeProfitPrice"
                  type="number"
                  step="any"
                  placeholder="請輸入止盈價格"
                  :disabled="actionLoading"
                />
                <button
                  v-if="takeProfitPrice"
                  type="button"
                  class="input-clear-btn"
                  @click="takeProfitPrice = ''"
                  :disabled="actionLoading"
                >
                  ×
                </button>
              </div>
              <span class="pnl-display" :class="getPnlClass(calculatedTakeProfitPnl)">
                {{ calculatedTakeProfitPnl !== null ? (calculatedTakeProfitPnl > 0 ? '+' : '') + formatPrice(calculatedTakeProfitPnl) : '-' }}
              </span>
            </div>
          </div>

          <!-- 止损价格 -->
          <div class="form-item">
            <label for="stopLossPrice">止損價格</label>
            <div class="input-with-pnl">
              <div class="input-with-clear">
                <input
                  id="stopLossPrice"
                  v-model="stopLossPrice"
                  type="number"
                  step="any"
                  placeholder="請輸入止損價格"
                  :disabled="actionLoading"
                />
                <button
                  v-if="stopLossPrice"
                  type="button"
                  class="input-clear-btn"
                  @click="stopLossPrice = ''"
                  :disabled="actionLoading"
                >
                  ×
                </button>
              </div>
              <span class="pnl-display" :class="getPnlClass(calculatedStopLossPnl)">
                {{ calculatedStopLossPnl !== null ? (calculatedStopLossPnl > 0 ? '+' : '') + formatPrice(calculatedStopLossPnl) : '-' }}
              </span>
            </div>
          </div>

          <div v-if="stopLossTakeProfitError" class="error-message">
            {{ stopLossTakeProfitError }}
          </div>
          <div class="confirm-buttons">
            <button type="button" class="btn btn-cancel" @click="handleCancelStopLossTakeProfit" :disabled="actionLoading">
              取消
            </button>
            <button type="button" class="btn btn-confirm" @click="handleSubmitStopLossTakeProfit" :disabled="actionLoading">
              <span v-if="actionLoading">處理中...</span>
              <span v-else>確認</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 开始策略弹窗 -->
    <Transition name="dialog">
    <div v-if="showStartStrategyDialog" class="confirm-overlay" @click.self="handleCancelStartStrategy">
      <div class="confirm-dialog add-position-dialog">
        <div class="confirm-title-with-price">
          <div class="confirm-title">開始策略</div>
          <div v-if="symbolPrice !== null" class="symbol-price">
            <span class="price-value" :class="getPriceChangeClass()">{{ formatPrice(symbolPrice) }}</span>
          </div>
        </div>
        <div class="add-position-form">
          <!-- 运行价格区间 -->
          <div class="form-item">
            <label for="minStrategyPrice">最小價格（可選）</label>
            <div class="input-with-clear">
              <input
                id="minStrategyPrice"
                v-model="minStrategyPrice"
                type="number"
                step="any"
                placeholder="請輸入最小價格"
                :disabled="actionLoading"
              />
              <button
                v-if="minStrategyPrice"
                type="button"
                class="input-clear-btn"
                @click="minStrategyPrice = ''"
                :disabled="actionLoading"
              >
                ×
              </button>
            </div>
          </div>

          <div class="form-item">
            <label for="maxStrategyPrice">最大價格（可選）</label>
            <div class="input-with-clear">
              <input
                id="maxStrategyPrice"
                v-model="maxStrategyPrice"
                type="number"
                step="any"
                placeholder="請輸入最大價格"
                :disabled="actionLoading"
              />
              <button
                v-if="maxStrategyPrice"
                type="button"
                class="input-clear-btn"
                @click="maxStrategyPrice = ''"
                :disabled="actionLoading"
              >
                ×
              </button>
            </div>
          </div>

          <!-- 说明文案 -->
          <div class="form-item">
            <div class="info-tip">
              設置範圍後，在價格超過範圍後，策略會自動停止(如果有運行的倉位，策略會完成最後一個倉位的持倉流程)
            </div>
          </div>

          <div v-if="startStrategyError" class="error-message">
            {{ startStrategyError }}
          </div>
          <div class="confirm-buttons">
            <button type="button" class="btn btn-cancel" @click="handleCancelStartStrategy" :disabled="actionLoading">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="handleSubmitStartStrategy" :disabled="actionLoading">
              <span v-if="actionLoading">處理中...</span>
              <span v-else>確認</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 杠杆倍数编辑弹窗 -->
    <Transition name="dialog">
    <div v-if="showEditLeverageDialog" class="confirm-overlay" @click.self="handleCancelEditLeverage">
      <div class="confirm-dialog add-position-dialog">
        <div class="confirm-title">編輯槓桿倍數</div>
        <div class="add-position-form">
          <!-- 杠杆倍数输入 -->
          <div class="form-item">
            <label for="leverageInput">槓桿倍數</label>
            <div class="input-with-clear">
              <input
                id="leverageInput"
                v-model="leverageInput"
                type="number"
                step="1"
                min="1"
                max="125"
                placeholder="請輸入槓桿倍數"
                :disabled="actionLoading"
              />
              <button
                v-if="leverageInput"
                type="button"
                class="input-clear-btn"
                @click="leverageInput = ''"
                :disabled="actionLoading"
              >
                ×
              </button>
            </div>
          </div>

          <!-- 说明文案 -->
          <div class="form-item">
            <div class="info-tip">
              槓桿倍數只支持 1 - 125 之間的整數
            </div>
          </div>

          <div v-if="editLeverageError" class="error-message">
            {{ editLeverageError }}
          </div>
          <div class="confirm-buttons">
            <button type="button" class="btn btn-cancel" @click="handleCancelEditLeverage" :disabled="actionLoading">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="handleSubmitEditLeverage" :disabled="actionLoading">
              <span v-if="actionLoading">處理中...</span>
              <span v-else>確認</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 账号列表弹窗 -->
    <Transition name="dialog">
    <div v-if="showAccountListDialog" class="confirm-overlay" @click.self="handleCloseAccountList">
      <div class="confirm-dialog account-list-dialog">
        <div class="confirm-title">切換帳號</div>
        
        <div class="account-list-content">
          <!-- Loading状态 -->
          <div v-if="accountListLoading" class="account-list-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">載入中...</div>
          </div>
          <!-- 账号列表 -->
          <div 
            v-else-if="accountList && accountList.length > 0"
            class="account-list-items"
          >
            <div 
              v-for="account in accountList" 
              :key="account.id"
              class="account-list-item"
              :class="{ 'active': String(account.id) === String(accountId) }"
              @click="goToAccountDetail(account.id)"
            >
              <div class="account-item-header">
                <span class="account-item-name">{{ account.name || '-' }}</span>
                <span v-if="String(account.id) === String(accountId)" class="account-item-current">當前</span>
              </div>
              <div class="account-item-info">
                <span class="account-item-tag">{{ account.exchange || '-' }}</span>
                <span class="account-item-separator">|</span>
                <span class="account-item-tag">{{ account.symbol || '-' }}</span>
                <span class="account-item-separator">|</span>
                <span class="account-item-value">{{ formatPrice(account.curEquity) }} {{ account.equityCoin || 'USDT' }}</span>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <div v-else class="account-list-empty">
            暫無帳號
          </div>
        </div>
        
        <div class="confirm-buttons">
          <button type="button" class="btn btn-cancel" @click="handleCloseAccountList">
            關閉
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 策略列表弹窗 -->
    <Transition name="dialog">
    <div v-if="showStrategyListDialog" class="confirm-overlay" @click.self="handleCloseStrategyList">
      <div class="confirm-dialog strategy-list-dialog">
        <div class="strategy-title-with-filter">
          <div class="confirm-title">更換策略</div>
          <!-- 筛选条件 -->
          <div class="strategy-filter-inline">
            <div class="custom-select-inline" :class="{ 'disabled': strategyListLoading }" @click="!strategyListLoading && toggleSymbolSelect()" ref="symbolSelectRef">
              <div class="select-display-inline">
                <span>{{ getSymbolText(strategySearchSymbol) }}</span>
                <span class="select-arrow-inline" :class="{ 'arrow-up': showSymbolSelect }">▼</span>
              </div>
              <div v-if="showSymbolSelect" class="select-options-inline">
                <div 
                  class="select-option" 
                  :class="{ 'selected': strategySearchSymbol === '' }"
                  @click.stop="selectSymbol('')"
                >
                  全部交易對
                </div>
                <div 
                  v-for="symbol in availableSymbols" 
                  :key="symbol"
                  class="select-option" 
                  :class="{ 'selected': strategySearchSymbol === symbol }"
                  @click.stop="selectSymbol(symbol)"
                >
                  {{ symbol }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="strategy-list-content">
          <!-- Loading状态 -->
          <div v-if="strategyListLoading" class="strategy-list-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">載入中...</div>
          </div>
          <!-- 策略列表 -->
          <div 
            v-else-if="filteredStrategyList && filteredStrategyList.length > 0"
            class="strategy-list"
          >
            <div 
              v-for="strategy in filteredStrategyList" 
              :key="strategy.id || strategy.strategyInstanceId"
              class="strategy-list-item"
              :class="{ 'active': (strategy.id || strategy.strategyInstanceId) === selectedStrategyId }"
              @click="selectedStrategyId = (strategy.id || strategy.strategyInstanceId)"
            >
              <div class="strategy-item-content">
                <span class="strategy-item-name">{{ strategy.name || strategy.strategyInstanceName || '-' }}</span>
                <span class="strategy-item-separator">|</span>
                <span class="strategy-item-tag">{{ strategy.exchange || '-' }}</span>
                <span class="strategy-item-separator">|</span>
                <span class="strategy-item-tag">{{ strategy.symbol || '-' }}</span>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <div v-else class="strategy-list-empty">
            {{ strategyList && strategyList.length > 0 ? '暫無符合條件的策略' : '暫無策略' }}
          </div>
        </div>
        <div class="confirm-buttons">
          <button type="button" class="btn btn-cancel" @click="handleCloseStrategyList" :disabled="actionLoading">
            取消
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSelectStrategy()" 
            :disabled="actionLoading || !selectedStrategyId"
          >
            <span v-if="actionLoading">處理中...</span>
            <span v-else>切換</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../utils/request'

const route = useRoute()
const router = useRouter()

const accountId = ref(null)
const accountList = ref([]) // 账号列表
const accountListLoading = ref(false) // 账号列表加载状态
const showAccountListDialog = ref(false) // 账号列表弹窗显示状态
const loading = ref(false)
const actionLoading = ref(false)
const accountInfo = ref(null)
const strategyList = ref([]) // 策略列表
const strategyListLoading = ref(false) // 策略列表加载状态
const selectedStrategyId = ref(null) // 当前选中的策略ID
const strategySearchName = ref('') // 策略名称搜索
const strategySearchSymbol = ref('') // 交易对搜索
const showSymbolSelect = ref(false) // 交易对下拉框显示状态
const symbolSelectRef = ref(null) // 交易对下拉框引用
const positionList = ref([])
const runningSessionList = ref([])
const historySessionList = ref([])
const positionRiskList = ref([]) // 策略未开启时的持倉数据
const runningPositionsList = ref([]) // 策略开启时的持倉数据（从 positions 字段提取）
const toastMessage = ref('')
const toastType = ref('info')
const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const confirmCallback = ref(null)
const showAddPositionDialog = ref(false)
const addPositionAmount = ref('')
const addPositionDirection = ref('LONG') // 加倉方向：LONG 或 SHORT
const addPositionError = ref('')
const currentAddPosition = ref(null) // 當前要加倉的持倉資訊
const showOpenPositionDialog = ref(false)
const openPositionAmount = ref('')
const openPositionDirection = ref('LONG') // 開倉方向：LONG 或 SHORT
const openPositionError = ref('')
const showStopLossTakeProfitDialog = ref(false)
const currentStopLossTakeProfit = ref(null) // 當前要設置止盈止損的持倉資訊
const takeProfitPrice = ref('')
const stopLossPrice = ref('')
const stopLossTakeProfitError = ref('')
const showStartStrategyDialog = ref(false)
const minStrategyPrice = ref('')
const maxStrategyPrice = ref('')
const startStrategyError = ref('')
const showEditLeverageDialog = ref(false)
const leverageInput = ref('')
const editLeverageError = ref('')
const showStrategyListDialog = ref(false)
const runningSessionTimer = ref(null) // 统一使用 runningSession 接口的定时器
const symbolPrice = ref(null) // 交易對价格
const previousSymbolPrice = ref(null) // 上一次的交易對价格
const symbolPriceTimer = ref(null) // 价格定时器

// 計算全仓未实现盈虧（求和所有持倉的 crossUnPnl）
const crossUnPnl = computed(() => {
  if (positionList.value && positionList.value.length > 0) {
    return positionList.value.reduce((sum, position) => {
      const value = position.crossUnPnl
      return sum + (value !== null && value !== undefined ? Number(value) : 0)
    }, 0)
  }
  return null
})

// 計算總計手續費（closeFee + openFee）
const totalFee = computed(() => {
  if (!accountInfo.value) return null
  const openFee = accountInfo.value.openFee !== null && accountInfo.value.openFee !== undefined ? Number(accountInfo.value.openFee) : 0
  const closeFee = accountInfo.value.closeFee !== null && accountInfo.value.closeFee !== undefined ? Number(accountInfo.value.closeFee) : 0
  return openFee + closeFee
})

// 計算今日手續費（todayOpenFee + todayCloseFee）
const todayFee = computed(() => {
  if (!accountInfo.value) return null
  const todayOpenFee = accountInfo.value.todayOpenFee !== null && accountInfo.value.todayOpenFee !== undefined ? Number(accountInfo.value.todayOpenFee) : 0
  const todayCloseFee = accountInfo.value.todayCloseFee !== null && accountInfo.value.todayCloseFee !== undefined ? Number(accountInfo.value.todayCloseFee) : 0
  return todayOpenFee + todayCloseFee
})

// 計算累計盈虧(扣除手續費) = closePnl - totalFee
const closePnlAfterFee = computed(() => {
  if (!accountInfo.value) return null
  const closePnl = accountInfo.value.closePnl !== null && accountInfo.value.closePnl !== undefined ? Number(accountInfo.value.closePnl) : 0
  const fee = totalFee.value !== null ? totalFee.value : 0
  return closePnl - fee
})

// 計算今日盈虧(扣除手續費) = todayClosePnl - todayFee
const todayClosePnlAfterFee = computed(() => {
  if (!accountInfo.value) return null
  const todayClosePnl = accountInfo.value.todayClosePnl !== null && accountInfo.value.todayClosePnl !== undefined ? Number(accountInfo.value.todayClosePnl) : 0
  const fee = todayFee.value !== null ? todayFee.value : 0
  return todayClosePnl - fee
})

// 获取第一个持倉的資訊（用于标题显示）
const firstPosition = computed(() => {
  if (accountInfo.value && accountInfo.value.strategyStatus === 1 && runningPositionsList.value && runningPositionsList.value.length > 0) {
    return runningPositionsList.value[0]
  }
  return null
})

// 計算當前持倉的實時盈虧（用於止盈止損彈窗）
const currentPositionRealTimePnl = computed(() => {
  if (!currentStopLossTakeProfit.value || !symbolPrice.value) {
    return null
  }
  
  const entryPrice = Number(currentStopLossTakeProfit.value.entryPrice || 0)
  const positionAmt = Math.abs(Number(currentStopLossTakeProfit.value.positionAmt || 0))
  const positionSide = currentStopLossTakeProfit.value.positionSide
  const currentPrice = Number(symbolPrice.value)
  
  if (!entryPrice || !positionAmt || !positionSide || !currentPrice) {
    return null
  }
  
  let pnl = 0
  if (positionSide === 'LONG') {
    // 做多：盈虧 = (當前价格 - 持仓均价) * 持仓数量
    pnl = (currentPrice - entryPrice) * positionAmt
  } else if (positionSide === 'SHORT') {
    // 做空：盈虧 = (持仓均价 - 當前价格) * 持仓数量
    pnl = (entryPrice - currentPrice) * positionAmt
  }
  
  return pnl
})

// 获取当前选中的策略信息
const currentStrategy = computed(() => {
  if (!selectedStrategyId.value || !strategyList.value || strategyList.value.length === 0) {
    return null
  }
  return strategyList.value.find(strategy => 
    (strategy.id && strategy.id === selectedStrategyId.value) || 
    (strategy.strategyInstanceId && strategy.strategyInstanceId === selectedStrategyId.value)
  ) || null
})

// 可用的交易对列表（从策略列表中提取）
const availableSymbols = computed(() => {
  if (!strategyList.value || strategyList.value.length === 0) {
    return []
  }
  const symbols = new Set()
  strategyList.value.forEach(strategy => {
    if (strategy.symbol) {
      symbols.add(strategy.symbol)
    }
  })
  return Array.from(symbols).sort()
})

// 过滤后的策略列表
const filteredStrategyList = computed(() => {
  if (!strategyList.value || strategyList.value.length === 0) {
    return []
  }
  
  let filtered = strategyList.value
  
  // 按交易对筛选（精确匹配）
  if (strategySearchSymbol.value && strategySearchSymbol.value.trim()) {
    const searchSymbol = strategySearchSymbol.value.trim()
    filtered = filtered.filter(strategy => {
      return strategy.symbol === searchSymbol
    })
  }
  
  return filtered
})

// 計算止盈盈虧（動態計算，當價格變化時自動更新）
const calculatedTakeProfitPnl = computed(() => {
  if (!currentStopLossTakeProfit.value || !takeProfitPrice.value) {
    return null
  }
  
  const price = parseFloat(takeProfitPrice.value)
  if (isNaN(price)) {
    return null
  }
  
  const entryPrice = Number(currentStopLossTakeProfit.value.entryPrice || 0)
  const positionAmt = Math.abs(Number(currentStopLossTakeProfit.value.positionAmt || 0))
  const positionSide = currentStopLossTakeProfit.value.positionSide
  
  if (!entryPrice || !positionAmt || !positionSide) {
    return null
  }
  
  let pnl = 0
  if (positionSide === 'LONG') {
    // 做多：盈虧 = (止盈价格 - 持仓均价) * 持仓数量
    pnl = (price - entryPrice) * positionAmt
  } else if (positionSide === 'SHORT') {
    // 做空：盈虧 = (持仓均价 - 止盈价格) * 持仓数量
    pnl = (entryPrice - price) * positionAmt
  }
  
  return pnl
})

// 計算止損盈虧（動態計算，當價格變化時自動更新）
const calculatedStopLossPnl = computed(() => {
  if (!currentStopLossTakeProfit.value || !stopLossPrice.value) {
    return null
  }
  
  const price = parseFloat(stopLossPrice.value)
  if (isNaN(price)) {
    return null
  }
  
  const entryPrice = Number(currentStopLossTakeProfit.value.entryPrice || 0)
  const positionAmt = Math.abs(Number(currentStopLossTakeProfit.value.positionAmt || 0))
  const positionSide = currentStopLossTakeProfit.value.positionSide
  
  if (!entryPrice || !positionAmt || !positionSide) {
    return null
  }
  
  let pnl = 0
  if (positionSide === 'LONG') {
    // 做多：盈虧 = (止損价格 - 持仓均价) * 持仓数量
    pnl = (price - entryPrice) * positionAmt
  } else if (positionSide === 'SHORT') {
    // 做空：盈虧 = (持仓均价 - 止損价格) * 持仓数量
    pnl = (entryPrice - price) * positionAmt
  }
  
  return pnl
})

// 判断单个持倉项是否显示"平多"按钮
// 条件：openPosition为LONG
const shouldShowCloseLongForSession = (bizParam) => {
  const parsed = parseBizParam(bizParam)
  if (!parsed) return false
  const openPosition = parsed?.open?.position
  return openPosition === 'LONG'
}

// 判断单个持倉项是否显示"平空"按钮
// 条件：openPosition为SHORT
const shouldShowCloseShortForSession = (bizParam) => {
  const parsed = parseBizParam(bizParam)
  if (!parsed) return false
  const openPosition = parsed?.open?.position
  return openPosition === 'SHORT'
}

// 显示Toast提示
const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  })
}

// 格式化价格（仅保留两位小数）
const formatPrice = (num) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取盈虧样式类
const getPnlClass = (value) => {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (num > 0) return 'pnl-profit'
  if (num < 0) return 'pnl-loss'
  return 'pnl-zero'
}

// 获取杠杆倍数颜色类
const getLeverageClass = (value) => {
  if (value === null || value === undefined || value === '-') return ''
  const num = Number(value)
  if (num < 15) return 'leverage-low' // 小于15倍：白色（默认）
  if (num >= 20 && num <= 40) return 'leverage-medium' // 20-40倍：绿色
  if (num > 40) return 'leverage-high' // 超过40倍：红色
  return '' // 15-20之间：默认白色
}

// 格式化时间 HH:mm:ss
const formatTime = (time) => {
  if (!time) return ''
  let date
  // 如果是时间戳（毫秒）
  if (typeof time === 'number') {
    date = new Date(time)
  } else if (typeof time === 'string') {
    // 如果是字符串，尝试解析
    date = new Date(time)
  } else {
    return ''
  }
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 格式化时间并减去2秒 HH:mm:ss
const formatTimeMinus2Seconds = (time) => {
  if (!time) return ''
  let date
  // 如果是时间戳（毫秒）
  if (typeof time === 'number') {
    date = new Date(time)
  } else if (typeof time === 'string') {
    // 如果是字符串，尝试解析
    date = new Date(time)
  } else {
    return ''
  }
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  // 减去2秒（2000毫秒）
  date.setTime(date.getTime() - 2000)
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 解析 bizParam
const parseBizParam = (bizParam) => {
  if (!bizParam) {
    return null
  }
  
  try {
    let parsed
    if (typeof bizParam === 'string') {
      // 如果是字符串，尝试解析
      if (bizParam.trim() === '') return null
      parsed = JSON.parse(bizParam)
    } else if (typeof bizParam === 'object' && bizParam !== null) {
      // 如果已經是对象，直接使用
      parsed = bizParam
    } else {
      return null
    }
    return parsed
  } catch (error) {
    console.warn('解析 bizParam 失敗:', error, '原始值:', bizParam)
    return null
  }
}

// 解析 bizParam 并获取 openPosition
const getOpenPosition = (bizParam) => {
  const parsed = parseBizParam(bizParam)
  if (!parsed) return null
  
  const openPosition = parsed?.open?.position
  // 确保返回值是 LONG 或 SHORT
  if (openPosition === 'LONG' || openPosition === 'SHORT') {
    return openPosition
  }
  return null
}

// 获取状态显示文字
const getStatusText = (bizParam) => {
  const parsed = parseBizParam(bizParam)
  if (!parsed) return null
  
  const status = parsed?.status
  if (status === 3) return '已開倉'
  if (status === 5) return '已加倉'
  if (status === 6) return '已對沖'
  return null
}

// 获取状态样式类
const getStatusClass = (bizParam) => {
  const parsed = parseBizParam(bizParam)
  if (!parsed) return ''
  
  const status = parsed?.status
  if (status === 3) return 'status-opened'
  if (status === 5) return 'status-added'
  if (status === 6) return 'status-hedged'
  return ''
}

// 获取帳號資訊
const fetchAccountInfo = async () => {
  try {
    const data = await request.get(`/api/app/accountInfo/${accountId.value}`)
    accountInfo.value = data
    // 获取帳號資訊后，如果有symbol，立即获取价格
    if (data && data.symbol) {
      await fetchSymbolPrice()
    }
  } catch (error) {
    showToast(error.message || '获取帳號資訊失敗', 'error')
  }
}

// 获取策略列表
const fetchStrategyList = async () => {
  if (!accountId.value) return
  strategyListLoading.value = true
  try {
    const data = await request.get(`/api/app/strategy/list/${accountId.value}`)
    strategyList.value = Array.isArray(data) ? data : []
    
    // 如果策略列表不为空，且没有选中策略，则默认选中第一个
    if (strategyList.value.length > 0 && !selectedStrategyId.value) {
      selectedStrategyId.value = strategyList.value[0].id || strategyList.value[0].strategyInstanceId
    }
    
    // 如果有选中的策略，将其移动到第一个位置
    if (strategyList.value.length > 0 && selectedStrategyId.value) {
      const selectedIndex = strategyList.value.findIndex(strategy => 
        (strategy.id && strategy.id === selectedStrategyId.value) || 
        (strategy.strategyInstanceId && strategy.strategyInstanceId === selectedStrategyId.value)
      )
      
      if (selectedIndex > 0) {
        // 找到选中的策略，移动到第一个位置
        const selectedStrategy = strategyList.value.splice(selectedIndex, 1)[0]
        strategyList.value.unshift(selectedStrategy)
      }
    }
  } catch (error) {
    showToast(error.message || '获取策略列表失敗', 'error')
    strategyList.value = []
  } finally {
    strategyListLoading.value = false
  }
}

// 計算持倉盈虧
const calculatePositionPnl = () => {
  if (!symbolPrice.value) return
  
  const currentPrice = Number(symbolPrice.value)
  
  // 計算策略开启时的持倉盈虧
  if (runningPositionsList.value && runningPositionsList.value.length > 0) {
    runningPositionsList.value.forEach(position => {
      if (position.entryPrice !== null && position.entryPrice !== undefined && 
          position.positionAmt !== null && position.positionAmt !== undefined) {
        const entryPrice = Number(position.entryPrice)
        const quantity = Math.abs(Number(position.positionAmt))
        const positionSide = position.positionSide
        
        // 做多：盈虧 = (當前价格 - 均價) * 數量
        // 做空：盈虧 = (均價 - 當前价格) * 數量
        let pnl = 0
        if (positionSide === 'LONG') {
          pnl = (currentPrice - entryPrice) * quantity
        } else if (positionSide === 'SHORT') {
          pnl = (entryPrice - currentPrice) * quantity
        }
        
        // 更新盈虧
        position.unRealizedProfit = pnl
      }
    })
  }
  
  // 計算策略未开启时的持倉盈虧
  if (positionRiskList.value && positionRiskList.value.length > 0) {
    positionRiskList.value.forEach(position => {
      if (position.entryPrice !== null && position.entryPrice !== undefined && 
          position.positionAmt !== null && position.positionAmt !== undefined) {
        const entryPrice = Number(position.entryPrice)
        const quantity = Math.abs(Number(position.positionAmt))
        const positionSide = position.positionSide
        
        // 做多：盈虧 = (當前价格 - 均價) * 數量
        // 做空：盈虧 = (均價 - 當前价格) * 數量
        let pnl = 0
        if (positionSide === 'LONG') {
          pnl = (currentPrice - entryPrice) * quantity
        } else if (positionSide === 'SHORT') {
          pnl = (entryPrice - currentPrice) * quantity
        }
        
        // 更新盈虧
        position.unRealizedProfit = pnl
      }
    })
  }
}

// 获取交易對价格
const fetchSymbolPrice = async (silent = false) => {
  if (!accountInfo.value || !accountInfo.value.symbol) return
  
  try {
    const data = await request.get(`/api/app/symbol/price/${accountInfo.value.symbol}`)
    // 更新上一次的价格
    previousSymbolPrice.value = symbolPrice.value
    // 更新當前价格
    symbolPrice.value = data
    // 計算持倉盈虧
    calculatePositionPnl()
  } catch (error) {
    // 定时刷新时不显示錯誤提示
    if (!silent) {
      showToast(error.message || '获取价格失敗', 'error')
    }
  }
}

// 获取价格变化样式类
const getPriceChangeClass = () => {
  if (symbolPrice.value === null || previousSymbolPrice.value === null) {
    return 'price-neutral'
  }
  
  const current = Number(symbolPrice.value)
  const previous = Number(previousSymbolPrice.value)
  
  if (current > previous) {
    return 'price-up'
  } else if (current < previous) {
    return 'price-down'
  } else {
    return 'price-neutral'
  }
}


// 从 algoOrders 中提取止盈止损价格
const extractStopLossTakeProfitFromAlgoOrders = (position, algoOrders) => {
  if (!algoOrders || !Array.isArray(algoOrders) || !position || !position.positionSide) {
    return {
      takeProfitPrice: null,
      stopLossPrice: null
    }
  }
  
  let takeProfitPrice = null
  let stopLossPrice = null
  
  // 遍历 algoOrders，找到与持仓 positionSide 相同的订单
  algoOrders.forEach(order => {
    if (order && order.positionSide === position.positionSide) {
      // 确保 triggerPrice 存在且有效
      const triggerPrice = order.triggerPrice
      if (triggerPrice !== null && triggerPrice !== undefined && triggerPrice !== '') {
        if (order.orderType === 'TAKE_PROFIT_MARKET') {
          // 止盈单
          takeProfitPrice = Number(triggerPrice)
        } else if (order.orderType === 'STOP_MARKET') {
          // 止损单
          stopLossPrice = Number(triggerPrice)
        }
      }
    }
  })
  
  return {
    takeProfitPrice: takeProfitPrice !== null && !isNaN(takeProfitPrice) ? takeProfitPrice : null,
    stopLossPrice: stopLossPrice !== null && !isNaN(stopLossPrice) ? stopLossPrice : null
  }
}

// 获取運行中的会话（统一接口，无论策略是否开启）
const fetchRunningSession = async (silent = false) => {
  try {
    const data = await request.get(`/api/app/runningSession/${accountId.value}`)
    // 如果返回的是单个对象，转换为数组；如果已經是数组，直接使用
    const newList = data ? (Array.isArray(data) ? data : [data]) : []
    
    // 提取 positions 数组，并合并 session 資訊
    const positionsList = []
    newList.forEach(session => {
      if (session.positions && Array.isArray(session.positions)) {
        session.positions.forEach(position => {
          // 从 algoOrders 中提取止盈止损价格（用于显示止盈/止损字段）
          const stopLossTakeProfit = extractStopLossTakeProfitFromAlgoOrders(
            position,
            session.algoOrders
          )
          
          positionsList.push({
            ...position,
            sessionId: session.id,
            session: {
              ...session,
              // 保留 session 中的原始止盈止损价格（用于平仓价显示）
              takeProfitPrice: session.takeProfitPrice || null,
              stopLossPrice: session.stopLossPrice || null,
              // algoOrders 单独保存，用于止盈/止损功能
              algoOrders: session.algoOrders || []
            }, // 保留完整的 session 資訊，用于获取 bizParam、止盈止損等
            // 使用 positions 中的数据覆盖 session 的数据
            positionSide: position.positionSide,
            positionAmt: position.positionAmt,
            entryPrice: position.entryPrice,
            unRealizedProfit: position.unRealizedProfit,
            // 平仓价直接从 session.takeProfitPrice 获取，与 algoOrders 无关
            takeProfitPrice: session.takeProfitPrice || null,
            // algoOrders 单独保存，用于止盈/止损按钮功能
            algoOrders: session.algoOrders || [],
            // 从 algoOrders 中提取的止盈止损价格（用于显示）
            algoTakeProfitPrice: stopLossTakeProfit.takeProfitPrice,
            algoStopLossPrice: stopLossTakeProfit.stopLossPrice
          })
        })
      }
    })
    
    // 根据策略状态更新相应的列表
    const isStrategyRunning = accountInfo.value && accountInfo.value.strategyStatus === 1
    
    // 检查是否有变化
    if (!silent) {
      // 非静默模式，直接更新
      runningSessionList.value = newList
      if (isStrategyRunning) {
        // 策略开启时，更新 runningPositionsList
        runningPositionsList.value = positionsList
      } else {
        // 策略未开启时，更新 positionRiskList（从 positions 提取，添加 mockData 等字段）
        positionRiskList.value = positionsList.map(position => ({
          ...position,
          mockData: position.session?.mockData || position.mockData,
          createTime: position.session?.createTime || position.createTime
        }))
      }
      // 更新持倉后，重新計算盈虧
      calculatePositionPnl()
    } else {
      // 静默模式，比较是否有变化
      const currentListStr = JSON.stringify(runningSessionList.value.map(s => s.id).sort())
      const newListStr = JSON.stringify(newList.map(s => s.id).sort())
      const hasChanged = currentListStr !== newListStr
      
      if (hasChanged) {
        // 如果有变化，更新當前倉位并刷新歷史倉位
        runningSessionList.value = newList
        if (isStrategyRunning) {
          runningPositionsList.value = positionsList
        } else {
          positionRiskList.value = positionsList.map(position => ({
            ...position,
            mockData: position.session?.mockData || position.mockData,
            createTime: position.session?.createTime || position.createTime
          }))
        }
        // 更新持倉后，重新計算盈虧
        calculatePositionPnl()
        // 刷新歷史倉位列表
        await fetchHistoryList()
      } else {
        // 即使 session 列表没变，positions 数据可能更新了，也需要更新
        if (isStrategyRunning) {
          runningPositionsList.value = positionsList
        } else {
          positionRiskList.value = positionsList.map(position => ({
            ...position,
            mockData: position.session?.mockData || position.mockData,
            createTime: position.session?.createTime || position.createTime
          }))
        }
        // 更新持倉后，重新計算盈虧
        calculatePositionPnl()
      }
    }
  } catch (error) {
    // 如果沒有運行中的会话，可能返回錯誤，这里不显示錯誤提示
    if (!silent) {
      runningSessionList.value = []
      runningPositionsList.value = []
      positionRiskList.value = []
    }
  }
}

// 获取歷史倉位
const fetchHistoryList = async () => {
  try {
    const data = await request.get(`/api/app/historyList/${accountId.value}`)
    // 如果返回的是单个对象，转换为数组；如果已經是数组，直接使用
    if (data) {
      historySessionList.value = Array.isArray(data) ? data : [data]
    } else {
      historySessionList.value = []
    }
  } catch (error) {
    // 如果获取歷史倉位失敗，不显示錯誤提示
    historySessionList.value = []
  }
}

// 编辑策略（显示策略列表弹窗）
const handleEditStrategy = async () => {
  if (actionLoading.value) return
  
  // 清空筛选条件
  strategySearchSymbol.value = ''
  
  // 先显示弹窗
  showStrategyListDialog.value = true
  
  // 先初始化选中当前账号的策略ID（在加载数据前设置，这样加载后可以自动移动到第一个）
  if (accountInfo.value && accountInfo.value.strategyInstanceId) {
    selectedStrategyId.value = accountInfo.value.strategyInstanceId
  }
  
  // 然后加载策略列表数据
  await fetchStrategyList()
  
  // 如果没有设置选中策略，默认选中第一个
  if (!selectedStrategyId.value && strategyList.value.length > 0) {
    selectedStrategyId.value = strategyList.value[0].id || strategyList.value[0].strategyInstanceId
  }
  
  // 确保选中的策略在第一个位置（如果还没有的话）
  if (strategyList.value.length > 0 && selectedStrategyId.value) {
    const selectedIndex = strategyList.value.findIndex(strategy => 
      (strategy.id && strategy.id === selectedStrategyId.value) || 
      (strategy.strategyInstanceId && strategy.strategyInstanceId === selectedStrategyId.value)
    )
    
    if (selectedIndex > 0) {
      // 找到选中的策略，移动到第一个位置
      const selectedStrategy = strategyList.value.splice(selectedIndex, 1)[0]
      strategyList.value.unshift(selectedStrategy)
    }
  }
}

// 关闭策略列表弹窗
const handleCloseStrategyList = () => {
  showStrategyListDialog.value = false
  // 清空筛选条件
  strategySearchSymbol.value = ''
  // 关闭下拉框
  showSymbolSelect.value = false
}

// 获取账号列表
const fetchAccountList = async () => {
  accountListLoading.value = true
  try {
    const data = await request.post('/api/account/pageList', {
      page: 1,
      pageSize: 100
    })
    
    // 處理返回的數據，从 data.records 中读取帳戶列表
    let list = []
    if (data && Array.isArray(data.records)) {
      list = data.records
    } else if (Array.isArray(data)) {
      list = data
    } else if (data && Array.isArray(data.list)) {
      list = data.list
    }
    
    // 如果有当前账号ID，将当前账号移动到第一个位置
    if (list.length > 0 && accountId.value) {
      const currentAccountId = String(accountId.value) // 转换为字符串进行比较
      const currentIndex = list.findIndex(account => String(account.id) === currentAccountId)
      
      if (currentIndex > 0) {
        // 找到当前账号，移动到第一个位置
        const currentAccount = list.splice(currentIndex, 1)[0]
        list.unshift(currentAccount)
      }
    }
    
    accountList.value = list
  } catch (error) {
    console.error('获取帳戶列表失败:', error)
    accountList.value = []
    showToast(error.message || '获取帳戶列表失敗', 'error')
  } finally {
    accountListLoading.value = false
  }
}

// 点击切换账号按钮显示账号列表
const handleSwitchAccount = async () => {
  // 先显示弹窗
  showAccountListDialog.value = true
  // 然后加载账号列表数据
  await fetchAccountList()
}

// 关闭账号列表弹窗
const handleCloseAccountList = () => {
  showAccountListDialog.value = false
}

// 跳转到账号详情
const goToAccountDetail = async (id) => {
  // 如果切换的是同一个账号，直接关闭弹窗
  if (String(id) === String(accountId.value)) {
    showAccountListDialog.value = false
    return
  }
  
  // 关闭弹窗
  showAccountListDialog.value = false
  
  // 设置loading状态
  loading.value = true
  
  // 先更新 accountId，确保后续逻辑使用新的 ID
  accountId.value = id
  
  // 跳转路由并等待完成
  await router.push({
    path: '/account-detail',
    query: { accountId: id }
  })
  
  // 等待路由完全更新后，重新初始化数据
  await nextTick()
  await initData()
}

// 策略筛选变化处理（用于触发某些操作，如果需要的话）
const handleStrategyFilterChange = () => {
  // 计算属性会自动更新，这里可以添加其他逻辑
  // 如果筛选后没有选中项，可以自动选中第一个
  if (filteredStrategyList.value.length > 0 && selectedStrategyId.value) {
    const isSelectedStillVisible = filteredStrategyList.value.some(strategy => 
      (strategy.id || strategy.strategyInstanceId) === selectedStrategyId.value
    )
    if (!isSelectedStillVisible) {
      // 如果当前选中的策略不在过滤后的列表中，选中第一个
      selectedStrategyId.value = filteredStrategyList.value[0].id || filteredStrategyList.value[0].strategyInstanceId
    }
  }
}

// 获取交易对显示文本
const getSymbolText = (value) => {
  if (!value || value === '') return '全部交易對'
  return value
}

// 切换交易对下拉框
const toggleSymbolSelect = () => {
  showSymbolSelect.value = !showSymbolSelect.value
}

// 选择交易对
const selectSymbol = (value) => {
  strategySearchSymbol.value = value
  showSymbolSelect.value = false
  handleStrategyFilterChange()
}

// 选择策略（切换策略）
const handleSelectStrategy = async () => {
  if (actionLoading.value || !selectedStrategyId.value || !accountId.value) return
  
  actionLoading.value = true
  try {
    // 调用切换策略接口
    await request.post('/api/app/update/strategy', {
      id: accountId.value,
      strategyInstanceId: selectedStrategyId.value
    })
    
    // 关闭弹窗
    showStrategyListDialog.value = false
    
    showToast('策略已切換', 'success')
    
    // 刷新账号信息
    await fetchAccountInfo()
  } catch (error) {
    showToast(error.message || '切換策略失敗', 'error')
  } finally {
    actionLoading.value = false
  }
}

// 编辑杠杆倍数（显示弹窗）
const handleEditLeverage = () => {
  if (actionLoading.value) return
  
  // 设置初始值为当前杠杆倍数
  leverageInput.value = accountInfo.value?.leverage ? String(accountInfo.value.leverage) : ''
  editLeverageError.value = ''
  
  // 显示弹窗
  showEditLeverageDialog.value = true
}

// 取消编辑杠杆倍数
const handleCancelEditLeverage = () => {
  showEditLeverageDialog.value = false
  leverageInput.value = ''
  editLeverageError.value = ''
}

// 提交编辑杠杆倍数
const handleSubmitEditLeverage = async () => {
  if (actionLoading.value || !accountId.value) return
  
  editLeverageError.value = ''
  
  // 验证输入 - 先转换为字符串
  const inputValue = String(leverageInput.value || '').trim()
  
  if (!inputValue) {
    editLeverageError.value = '請輸入槓桿倍數'
    return
  }
  
  const leverage = parseInt(inputValue)
  
  if (isNaN(leverage) || leverage < 1 || leverage > 125) {
    editLeverageError.value = '槓桿倍數只支持 1 - 125 之間的整數'
    return
  }
  
  if (leverage !== parseFloat(inputValue)) {
    editLeverageError.value = '槓桿倍數必須是整數'
    return
  }
  
  actionLoading.value = true
  try {
    // 调用更新策略接口
    await request.post('/api/app/update/strategy', {
      id: accountId.value,
      leverage: leverage
    })
    
    // 关闭弹窗
    showEditLeverageDialog.value = false
    
    showToast('槓桿倍數已更新', 'success')
    
    // 刷新账号信息
    await fetchAccountInfo()
  } catch (error) {
    editLeverageError.value = error.message || '更新槓桿倍數失敗'
    showToast(error.message || '更新槓桿倍數失敗', 'error')
  } finally {
    actionLoading.value = false
  }
}

// 开始策略（显示弹窗）
const handleStartStrategy = () => {
  if (actionLoading.value) return
  
  // 重置表单
  minStrategyPrice.value = ''
  maxStrategyPrice.value = ''
  startStrategyError.value = ''
  
  // 显示弹窗
  showStartStrategyDialog.value = true
}

// 取消开始策略
const handleCancelStartStrategy = () => {
  showStartStrategyDialog.value = false
  minStrategyPrice.value = ''
  maxStrategyPrice.value = ''
  startStrategyError.value = ''
}

// 提交开始策略
const handleSubmitStartStrategy = async () => {
  if (actionLoading.value || !accountId.value) return
  
  startStrategyError.value = ''
  
  // 验证输入
  const minPrice = minStrategyPrice.value ? parseFloat(minStrategyPrice.value) : null
  const maxPrice = maxStrategyPrice.value ? parseFloat(maxStrategyPrice.value) : null
  
  if (minPrice !== null && (isNaN(minPrice) || minPrice <= 0)) {
    startStrategyError.value = '請輸入有效的最小價格'
    return
  }
  
  if (maxPrice !== null && (isNaN(maxPrice) || maxPrice <= 0)) {
    startStrategyError.value = '請輸入有效的最大價格'
    return
  }
  
  // 如果两个价格都输入了，验证最小价格不能大于最大价格
  if (minPrice !== null && maxPrice !== null && minPrice >= maxPrice) {
    startStrategyError.value = '最小價格必須小於最大價格'
    return
  }
  
  actionLoading.value = true
  try {
    // 构建请求参数
    const params = []
    if (minPrice !== null) {
      params.push(`minStrategyPrice=${minPrice}`)
    }
    if (maxPrice !== null) {
      params.push(`maxStrategyPrice=${maxPrice}`)
    }
    
    let url = `/api/app/startStrategy/${accountId.value}`
    if (params.length > 0) {
      url += '?' + params.join('&')
    }
    
    await request.get(url)
    
    // 关闭弹窗
    showStartStrategyDialog.value = false
    minStrategyPrice.value = ''
    maxStrategyPrice.value = ''
    startStrategyError.value = ''
    
    // 重新获取帳號資訊以更新状态（包括最小价格和最大价格）
    await fetchAccountInfo()
    
    // 调用 runningSession 接口获取當前持倉相关資訊
    await fetchRunningSession()
    // 启动定时器，每10秒刷新一次
    startRunningSessionTimer()
    
    showToast('策略已开始', 'success')
  } catch (error) {
    startStrategyError.value = error.message || '开始策略失敗'
  } finally {
    actionLoading.value = false
  }
}

// 显示確認弹窗
const showConfirm = (message, callback) => {
  confirmMessage.value = message
  confirmCallback.value = callback
  showConfirmDialog.value = true
}

// 確認操作
const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  showConfirmDialog.value = false
  confirmCallback.value = null
}

// 取消確認
const handleCancelConfirm = () => {
  showConfirmDialog.value = false
  confirmCallback.value = null
}

// 停止策略
const handleStopStrategy = async () => {
  if (actionLoading.value) return
  
  // 二次確認
  showConfirm('確定要停止策略嗎？', async () => {
    actionLoading.value = true
    try {
      await request.get(`/api/app/stopStrategy/${accountId.value}`)
      showToast('策略已停止', 'success')
      // 重新获取帳號資訊
      await fetchAccountInfo()
      // 调用 runningSession 接口获取持倉資訊
      await fetchRunningSession()
      // 启动定时器，每10秒刷新一次
      startRunningSessionTimer()
    } catch (error) {
      showToast(error.message || '停止策略失敗', 'error')
    } finally {
      actionLoading.value = false
    }
  })
}

// 停止会话
const handleStopSession = async (sessionId) => {
  if (actionLoading.value || !sessionId) return
  
  // 二次確認
  showConfirm('確定要停止當前持倉嗎？', async () => {
    actionLoading.value = true
    try {
      await request.get(`/api/app/stopSession/${sessionId}`)
      showToast('会话已停止', 'success')
      // 重新获取会话資訊
      await fetchRunningSession()
    } catch (error) {
      showToast(error.message || '停止会话失敗', 'error')
    } finally {
      actionLoading.value = false
    }
  })
}

// 加倉
const handleAddPosition = async (sessionId, index = null) => {
  if (actionLoading.value || !accountId.value) return
  
  // 找到对应的持倉資訊
  let position = null
  let positionSide = null
  
  if (accountInfo.value && accountInfo.value.strategyStatus === 1) {
    // 策略开启时，从 runningPositionsList 查找
    if (sessionId) {
      position = runningPositionsList.value.find(p => p.sessionId === sessionId)
    } else {
      // 如果沒有 sessionId，可能是从策略停止时的持倉列表点击的
      position = runningPositionsList.value.length > 0 ? runningPositionsList.value[0] : null
    }
    if (position) {
      positionSide = position.positionSide || (position.session ? getOpenPosition(position.session.bizParam) : null)
    }
  } else {
    // 策略停止时，从 positionRiskList 查找
    if (index !== null && index >= 0 && index < positionRiskList.value.length) {
      // 如果有索引，使用索引查找对应的持倉
      position = positionRiskList.value[index]
    } else {
      // 如果沒有索引，取第一个（兼容旧邏輯）
      position = positionRiskList.value.length > 0 ? positionRiskList.value[0] : null
    }
    if (position) {
      positionSide = position.positionSide
    }
  }
  
  if (!position || !positionSide) {
    showToast('未找到对应的持倉資訊', 'error')
    return
  }
  
  // 保存當前持倉資訊
  currentAddPosition.value = {
    sessionId: sessionId || null,
    positionSide
  }
  
  // 重置表单，默认方向为當前持倉方向
  addPositionAmount.value = ''
  addPositionDirection.value = positionSide || 'LONG'
  addPositionError.value = ''
  showAddPositionDialog.value = true
}

// 取消加倉
const handleCancelAddPosition = () => {
  showAddPositionDialog.value = false
  addPositionAmount.value = ''
  addPositionDirection.value = 'LONG'
  addPositionError.value = ''
  currentAddPosition.value = null
}

// 開倉
const handleOpenPosition = () => {
  if (actionLoading.value || !accountId.value) return
  
  // 重置表单
  openPositionAmount.value = ''
  openPositionDirection.value = 'LONG'
  openPositionError.value = ''
  showOpenPositionDialog.value = true
}

// 取消開倉
const handleCancelOpenPosition = () => {
  showOpenPositionDialog.value = false
  openPositionAmount.value = ''
  openPositionDirection.value = 'LONG'
  openPositionError.value = ''
}

// 提交開倉
const handleSubmitOpenPosition = async () => {
  if (actionLoading.value || !accountId.value) return
  
  openPositionError.value = ''
  
  // 验证方向
  if (!openPositionDirection.value || (openPositionDirection.value !== 'LONG' && openPositionDirection.value !== 'SHORT')) {
    openPositionError.value = '請選擇開倉方向'
    return
  }
  
  // 验证输入
  const amount = parseFloat(openPositionAmount.value)
  if (isNaN(amount) || amount <= 0) {
    openPositionError.value = '請輸入有效的開倉數量'
    return
  }
  
  actionLoading.value = true
  try {
    const url = `/api/app/open/${accountId.value}/${openPositionDirection.value}?amount=${amount}`
    await request.get(url)
    showToast('開倉成功', 'success')
    
    // 关闭弹窗
    showOpenPositionDialog.value = false
    openPositionAmount.value = ''
    openPositionDirection.value = 'LONG'
    openPositionError.value = ''
    
    // 刷新持倉資訊
    await Promise.all([
      fetchRunningSession(),
      fetchHistoryList()
    ])
  } catch (error) {
    openPositionError.value = error.message || '開倉失敗'
  } finally {
    actionLoading.value = false
  }
}

// 提交加倉
const handleSubmitAddPosition = async () => {
  if (actionLoading.value || !accountId.value) return
  
  addPositionError.value = ''
  
  // 验证方向
  if (!addPositionDirection.value || (addPositionDirection.value !== 'LONG' && addPositionDirection.value !== 'SHORT')) {
    addPositionError.value = '請選擇加倉方向'
    return
  }
  
  // 验证输入
  const amount = parseFloat(addPositionAmount.value)
  if (isNaN(amount) || amount <= 0) {
    addPositionError.value = '請輸入有效的加倉數量'
    return
  }
  
  actionLoading.value = true
  try {
    const url = `/api/app/open/${accountId.value}/${addPositionDirection.value}?amount=${amount}`
    await request.get(url)
    showToast('加倉成功', 'success')
    
    // 关闭弹窗
    showAddPositionDialog.value = false
    addPositionAmount.value = ''
    addPositionDirection.value = 'LONG'
    addPositionError.value = ''
    currentAddPosition.value = null
    
    // 根据策略状态刷新相应的数据
    if (accountInfo.value && accountInfo.value.strategyStatus === 1) {
      // 策略开启时，刷新運行中的会话
      await Promise.all([
        fetchRunningSession(),
        fetchHistoryList()
      ])
    } else {
      // 策略未开启时，刷新持倉資訊
      await Promise.all([
        fetchRunningSession(),
        fetchHistoryList()
      ])
    }
  } catch (error) {
    addPositionError.value = error.message || '加倉失敗'
  } finally {
    actionLoading.value = false
  }
}

// 平多
const handleCloseLong = async (sessionId) => {
  if (actionLoading.value || !accountId.value) return
  
  showConfirm('確定要平多嗎？', async () => {
    actionLoading.value = true
    try {
      const url = sessionId 
        ? `/api/app/close/${accountId.value}/LONG?sessionId=${sessionId}`
        : `/api/app/close/${accountId.value}/LONG`
      await request.get(url)
      showToast('平多成功', 'success')
      // 统一使用 runningSession 接口刷新持倉資訊
      await Promise.all([
        fetchRunningSession(),
        fetchHistoryList()
      ])
    } catch (error) {
      showToast(error.message || '平多失敗', 'error')
    } finally {
      actionLoading.value = false
    }
  })
}

// 平空
const handleCloseShort = async (sessionId) => {
  if (actionLoading.value || !accountId.value) return
  
  showConfirm('確定要平空嗎？', async () => {
    actionLoading.value = true
    try {
      const url = sessionId 
        ? `/api/app/close/${accountId.value}/SHORT?sessionId=${sessionId}`
        : `/api/app/close/${accountId.value}/SHORT`
      await request.get(url)
      showToast('平空成功', 'success')
      // 统一使用 runningSession 接口刷新持倉資訊
      await Promise.all([
        fetchRunningSession(),
        fetchHistoryList()
      ])
    } catch (error) {
      showToast(error.message || '平空失敗', 'error')
    } finally {
      actionLoading.value = false
    }
  })
}

// 設置止盈/止損
const handleSetStopLossTakeProfit = (position) => {
  if (actionLoading.value || !position) return
  
  // 保存當前持倉資訊
  currentStopLossTakeProfit.value = position
  
  // 从 algoOrders 中提取止盈止损价格（用于止盈/止损功能）
  const algoOrders = position.algoOrders || position.session?.algoOrders || []
  const stopLossTakeProfit = extractStopLossTakeProfitFromAlgoOrders(position, algoOrders)
  
  // 初始化表单，使用从 algoOrders 中提取的止盈止损价格
  takeProfitPrice.value = stopLossTakeProfit.takeProfitPrice ? String(stopLossTakeProfit.takeProfitPrice) : ''
  stopLossPrice.value = stopLossTakeProfit.stopLossPrice ? String(stopLossTakeProfit.stopLossPrice) : ''
  
  // 重置錯誤
  stopLossTakeProfitError.value = ''
  
  showStopLossTakeProfitDialog.value = true
}

// 取消設置止盈/止損
const handleCancelStopLossTakeProfit = () => {
  showStopLossTakeProfitDialog.value = false
  takeProfitPrice.value = ''
  stopLossPrice.value = ''
  stopLossTakeProfitError.value = ''
  currentStopLossTakeProfit.value = null
}

// 提交止盈/止損
const handleSubmitStopLossTakeProfit = async () => {
  if (actionLoading.value || !accountId.value || !currentStopLossTakeProfit.value) return
  
  stopLossTakeProfitError.value = ''
  
  // 验证输入
  const takeProfit = takeProfitPrice.value ? parseFloat(takeProfitPrice.value) : null
  const stopLoss = stopLossPrice.value ? parseFloat(stopLossPrice.value) : null
  
  if (takeProfit !== null && (isNaN(takeProfit) || takeProfit <= 0)) {
    stopLossTakeProfitError.value = '請輸入有效的止盈價格'
    return
  }
  
  if (stopLoss !== null && (isNaN(stopLoss) || stopLoss <= 0)) {
    stopLossTakeProfitError.value = '請輸入有效的止損價格'
    return
  }
  
  actionLoading.value = true
  try {
    const sessionId = currentStopLossTakeProfit.value.sessionId
    const positionSide = currentStopLossTakeProfit.value.positionSide
    
    // 构建请求参数
    const requestData = {
      accountId: accountId.value,
      sessionId: sessionId || null,
      positionSide: positionSide,
      takeProfitPrice: takeProfit !== null ? takeProfit : null,
      stopLossPrice: stopLoss !== null ? stopLoss : null
    }
    
    await request.post('/api/app/algo/order', requestData)
    showToast('設置止盈/止損成功', 'success')
    
    // 关闭弹窗
    showStopLossTakeProfitDialog.value = false
    takeProfitPrice.value = ''
    stopLossPrice.value = ''
    stopLossTakeProfitError.value = ''
    currentStopLossTakeProfit.value = null
    
    // 刷新持倉資訊
    await Promise.all([
      fetchRunningSession(),
      fetchHistoryList()
    ])
  } catch (error) {
    stopLossTakeProfitError.value = error.message || '設置止盈/止損失敗'
  } finally {
    actionLoading.value = false
  }
}

// 初始化数据
const initData = async () => {
  // 优先使用已设置的 accountId.value，如果没有则从路由获取
  if (!accountId.value && route.query.accountId) {
    accountId.value = route.query.accountId
  }
  if (!accountId.value) {
    showToast('缺少accountId参数', 'error')
    return
  }

  loading.value = true
  try {
    // 先获取帳號資訊，以判断策略状态
    await fetchAccountInfo()
    
    // 获取策略列表
    await fetchStrategyList()
    
    // 统一使用 runningSession 接口获取持倉資訊
    await fetchRunningSession()
    // 启动定时器，每10秒刷新一次
    startRunningSessionTimer()
    
    // 获取歷史倉位
    await fetchHistoryList()
  } finally {
    loading.value = false
  }
}

// 启动定时刷新運行中的会话（统一接口，无论策略是否开启）
const startRunningSessionTimer = () => {
  // 清除已存在的定时器
  if (runningSessionTimer.value) {
    clearInterval(runningSessionTimer.value)
    runningSessionTimer.value = null
  }
  
  // 每10秒刷新一次
  runningSessionTimer.value = setInterval(() => {
    if (accountId.value && !loading.value && !actionLoading.value) {
      fetchRunningSession(true) // silent模式，不显示錯誤提示
    }
  }, 10000)
}

// 停止定时刷新運行中的会话
const stopRunningSessionTimer = () => {
  if (runningSessionTimer.value) {
    clearInterval(runningSessionTimer.value)
    runningSessionTimer.value = null
  }
}

// 启动价格定时器
const startSymbolPriceTimer = () => {
  // 清除已存在的定时器
  if (symbolPriceTimer.value) {
    clearInterval(symbolPriceTimer.value)
    symbolPriceTimer.value = null
  }
  
  // 如果有symbol，启动定时器
  if (accountInfo.value && accountInfo.value.symbol) {
    // 每3秒刷新一次
    symbolPriceTimer.value = setInterval(() => {
      if (accountId.value && !loading.value && !actionLoading.value) {
        fetchSymbolPrice(true) // silent模式，不显示錯誤提示
      }
    }, 2000)
  }
}

// 停止价格定时器
const stopSymbolPriceTimer = () => {
  if (symbolPriceTimer.value) {
    clearInterval(symbolPriceTimer.value)
    symbolPriceTimer.value = null
  }
}

// 监听账号信息和策略列表，自动选中对应的策略
watch([accountInfo, strategyList], () => {
  if (accountInfo.value && strategyList.value && strategyList.value.length > 0) {
    const strategyInstanceId = accountInfo.value.strategyInstanceId
    if (strategyInstanceId && !selectedStrategyId.value) {
      // 查找匹配的策略
      const matchedStrategy = strategyList.value.find(strategy => 
        (strategy.id && strategy.id === strategyInstanceId) || 
        (strategy.strategyInstanceId && strategy.strategyInstanceId === strategyInstanceId) ||
        (strategy.name === strategyInstanceId) ||
        (strategy.strategyInstanceName === strategyInstanceId)
      )
      if (matchedStrategy) {
        selectedStrategyId.value = matchedStrategy.id || matchedStrategy.strategyInstanceId
      }
    }
  }
}, { immediate: true })

// 点击外部关闭交易对下拉框
const handleClickOutsideSymbolSelect = (event) => {
  if (symbolSelectRef.value && !symbolSelectRef.value.contains(event.target)) {
    showSymbolSelect.value = false
  }
}

onMounted(async () => {
  await initData()
  // 初始化完成后启动价格定时器
  startSymbolPriceTimer()
  // 添加点击外部关闭下拉框的事件监听
  document.addEventListener('click', handleClickOutsideSymbolSelect)
})

onUnmounted(() => {
  // 组件卸载时清除所有定时器
  stopRunningSessionTimer()
  stopSymbolPriceTimer()
  // 移除事件监听
  document.removeEventListener('click', handleClickOutsideSymbolSelect)
})
</script>

<style scoped>
.account-detail {
  min-height: 100vh;
  padding: 24px;
  background-color: var(--bg-primary);
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  text-align: center;
}

.global-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.global-loading .loading-spinner {
  text-align: center;
}

.global-loading .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.global-loading .loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.card-title-with-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  gap: 16px;
}

.card-title-with-actions .card-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
  flex: 1;
}

.card-title-with-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title-with-price .card-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.card-title-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  gap: 12px;
}

.card-title-with-action .card-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
  flex: 1;
}

.btn-edit-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-edit-strategy:hover:not(:disabled) {
  background-color: rgba(240, 185, 11, 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 2px 6px rgba(240, 185, 11, 0.2);
  transform: translateY(-1px);
}

.btn-edit-strategy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 策略名称内联编辑按钮 */
.info-item-with-edit {
  position: relative;
  padding-right: 30px;
}

.info-item-with-edit .value {
  margin-right: 0;
}

.btn-edit-strategy-inline {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(14, 203, 129, 0.3);
  border-radius: 4px;
  color: var(--accent-success);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}

.btn-edit-strategy-inline:hover:not(:disabled) {
  background-color: rgba(14, 203, 129, 0.15);
  border-color: rgba(14, 203, 129, 0.5);
  color: var(--accent-success);
  opacity: 1;
}

.btn-edit-strategy-inline:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-edit-strategy-inline svg {
  width: 14px;
  height: 14px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.title-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.title-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.symbol-price {
  display: flex;
  align-items: center;
}

.price-value {
  font-size: 14px;
  font-weight: 700;
}

.price-value.price-up {
  color: #52c41a;
}

.price-value.price-down {
  color: #ff4d4f;
}

.price-value.price-neutral {
  color: #999;
}

.price-value-right {
  margin-left: auto;
}

.position-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.btn-action {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-close-long {
  background-color: var(--accent-success);
  color: white;
}

.btn-close-long:hover:not(:disabled) {
  background-color: #1ed690;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(14, 203, 129, 0.3);
}

.btn-close-short {
  background-color: var(--accent-danger);
  color: white;
}

.btn-close-short:hover:not(:disabled) {
  background-color: #ff6b7a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(246, 70, 93, 0.3);
}

.btn-add-position {
  background-color: var(--accent-info);
  color: white;
}

.btn-add-position:hover:not(:disabled) {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.btn-add-position.btn-disabled,
.btn-add-position:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-add-position.btn-disabled:hover,
.btn-add-position:disabled:hover {
  background-color: var(--bg-tertiary);
  transform: none;
  box-shadow: none;
}

.btn-stop-loss-take-profit {
  background-color: #fa8c16;
  color: white;
}

.btn-stop-loss-take-profit:hover:not(:disabled) {
  background-color: #ffa940;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(250, 140, 22, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  overflow: visible;
  min-width: 0;
}

.info-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
}

/* 策略状态 - 模拟交易标签 - 红色三角形（右上角） */
.info-item.has-mock-data::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background-color: #ff4d4f;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  z-index: 10;
  border-radius: 0 6px 0 0;
}

.mock-label {
  font-size: 11px;
  color: #ff4d4f;
  margin-left: 6px;
  font-weight: 400;
}

.label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.5;
}

.value.highlight {
  font-size: 15px;
  color: var(--accent-info);
  font-weight: 700;
}

.value.value-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
  min-width: 0;
  flex-shrink: 1;
}

.value.fee-value {
  color: var(--accent-danger);
  font-weight: 600;
}

.value-separator {
  color: var(--text-tertiary);
  margin: 0 4px;
  font-weight: 400;
}

/* 策略下拉框样式 */
.strategy-select-item {
  grid-column: 1 / -1;
}

.strategy-select-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.strategy-select {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
}

.strategy-select:hover:not(:disabled) {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.strategy-select:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.strategy-select:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.strategy-status-wrapper {
  flex-shrink: 0;
}

.value.status.running {
  color: var(--accent-success);
  font-weight: 600;
}

.value.status.stopped {
  color: var(--accent-danger);
  font-weight: 600;
}

.status.running {
  color: var(--accent-success);
}

.status.stopped {
  color: var(--accent-danger);
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: #f8d33a;
}

.btn-danger {
  background-color: var(--accent-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #ff6b7a;
}

.btn-small {
  padding: 6px 16px;
  font-size: 13px;
  min-width: 60px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-session {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.session-loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.session-loading-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  display: inline-block;
  vertical-align: middle;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;
  gap: 10px;
  position: relative;
  overflow: visible;
}

.session-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
}

/* 模拟交易标签 - 红色三角形（右上角） */
.session-item.has-mock-data::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background-color: #ff4d4f;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  z-index: 10;
  border-radius: 0 6px 0 0;
}

.session-content {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.session-separator {
  color: var(--text-tertiary);
  font-size: 11px;
  margin: 0 3px;
}

.session-time {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.session-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
  white-space: nowrap;
}

.session-label-spaced {
  margin-left: 10px;
}

.session-value {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
}

.position-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.position-long {
  background-color: rgba(24, 144, 255, 0.1);
  color: var(--accent-info);
  border-color: rgba(24, 144, 255, 0.3);
}

.position-short {
  background-color: rgba(246, 70, 93, 0.1);
  color: var(--accent-danger);
  border-color: rgba(246, 70, 93, 0.3);
}

.status-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.status-opened {
  background-color: rgba(14, 203, 129, 0.1);
  color: var(--accent-success);
  border-color: rgba(14, 203, 129, 0.3);
}

.status-added {
  background-color: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
  border-color: rgba(250, 140, 22, 0.3);
}

.status-hedged {
  background-color: rgba(246, 70, 93, 0.1);
  color: var(--accent-danger);
  border-color: rgba(246, 70, 93, 0.3);
}

/* 策略标签样式 */
.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.strategy-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.strategy-status-tag.status-running {
  background-color: rgba(14, 203, 129, 0.1);
  color: var(--accent-success);
  border-color: rgba(14, 203, 129, 0.3);
}

.strategy-status-tag.status-stopped {
  background-color: rgba(246, 70, 93, 0.1);
  color: var(--accent-danger);
  border-color: rgba(246, 70, 93, 0.3);
}

.price-profit {
  color: var(--accent-success);
  font-weight: 600;
}

.price-loss {
  color: var(--accent-danger);
  font-weight: 600;
}

.pnl-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}

.pnl-profit {
  color: var(--accent-success);
  font-weight: 600;
}

.leverage-low {
  color: var(--text-primary); /* 白色（默认文本颜色） */
}

.leverage-medium {
  color: var(--accent-success); /* 绿色 */
  font-weight: 600;
}

.leverage-high {
  color: var(--accent-danger); /* 红色 */
  font-weight: 600;
}

.pnl-loss {
  color: var(--accent-danger);
  font-weight: 600;
}

.pnl-zero {
  color: var(--text-secondary);
  font-weight: 600;
}

.arrow-up {
  color: var(--accent-success);
  font-size: 12px;
  line-height: 1;
}

.arrow-down {
  color: var(--accent-danger);
  font-size: 12px;
  line-height: 1;
}

.position-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.position-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.position-asset {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.position-alias {
  font-size: 12px;
  color: #999;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.position-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.highlight {
  font-weight: 600;
  color: #333;
}

.profit {
  color: #52c41a;
}

.loss {
  color: #ff4d4f;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

.toast.info {
  background-color: var(--accent-info);
  color: white;
}

.toast.success {
  background-color: var(--accent-success);
  color: white;
}

.toast.error {
  background-color: var(--accent-danger);
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 確認弹窗 */
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
  padding: 24px;
  min-width: 320px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
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
  margin-bottom: 16px;
}

.confirm-title-with-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.confirm-title-with-price .confirm-title {
  margin-bottom: 0;
}

.confirm-content {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-cancel:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.1);
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--accent-danger);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #ff6b7a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(246, 70, 93, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加倉弹窗样式 */
.add-position-dialog {
  min-width: 400px;
}

/* 開倉按钮样式 */
.btn-open-position {
  background-color: var(--accent-success);
  color: white;
}

/* 空状态提示文字 */
.empty-hint {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 8px;
}

.btn-open-position:hover:not(:disabled) {
  background-color: #52c41a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.btn-open-position:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 单选按钮组样式 */
.radio-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.radio-option span {
  font-size: 14px;
  color: var(--text-primary);
}

.radio-option:hover span {
  color: var(--accent-primary);
}

.add-position-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-position-form .form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-position-form .form-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.add-position-form .form-item input {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
}

.add-position-form .form-item input::placeholder {
  color: var(--text-tertiary);
}

.add-position-form .form-item input:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.add-position-form .form-item input:disabled {
  background-color: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 输入框带清理按钮样式 */
.input-with-clear {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-clear input {
  flex: 1;
  padding-right: 32px;
}

.input-clear-btn {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  z-index: 1;
}

.input-clear-btn:hover:not(:disabled) {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.input-clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-position-form .error-message {
  padding: 10px 12px;
  background-color: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-radius: 6px;
  color: var(--accent-danger);
  font-size: 13px;
}

/* 止盈/止損弹窗样式 */
.session-content-dialog {
  padding: 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 8px;
}

.input-with-pnl {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-with-pnl .input-with-clear {
  flex: 1;
}

.input-with-pnl input {
  flex: 1;
}

.pnl-display {
  font-size: 13px;
  font-weight: 600;
  min-width: 100px;
  text-align: right;
  padding: 8px 12px;
  background-color: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.pnl-display.pnl-profit {
  color: var(--accent-success);
  border-color: rgba(14, 203, 129, 0.3);
  background-color: rgba(14, 203, 129, 0.1);
}

.pnl-display.pnl-loss {
  color: var(--accent-danger);
  border-color: rgba(246, 70, 93, 0.3);
  background-color: rgba(246, 70, 93, 0.1);
}

.pnl-display.pnl-zero {
  color: var(--text-secondary);
}

/* 开始策略弹窗样式 */
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}

.info-tip {
  padding: 12px;
  background-color: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 6px;
  color: var(--accent-info);
  font-size: 13px;
  line-height: 1.6;
  margin-top: 8px;
}

/* 策略列表弹窗样式 */
.strategy-list-dialog {
  min-width: 400px;
  max-width: 600px;
}

/* 策略标题和筛选条件同一行 */
.strategy-title-with-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.strategy-title-with-filter .confirm-title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
  flex-shrink: 0;
}

.strategy-filter-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 0;
}

.filter-input-inline {
  width: 100px;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
  height: 32px;
  box-sizing: border-box;
}

.filter-input-inline:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 0 2px rgba(240, 185, 11, 0.1);
}

.filter-input-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.filter-input-inline::placeholder {
  color: var(--text-tertiary);
  font-size: 11px;
}

.custom-select-inline {
  position: relative;
  width: 135px;
  flex-shrink: 0;
}

.select-display-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  height: 32px;
  box-sizing: border-box;
}

.custom-select-inline:hover .select-display-inline {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.custom-select-inline.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.custom-select-inline.disabled .select-display-inline {
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.select-arrow-inline {
  font-size: 9px;
  color: var(--text-secondary);
  transition: transform 0.2s;
  margin-left: 6px;
}

.select-arrow-inline.arrow-up {
  transform: rotate(180deg);
}

.select-options-inline {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
  animation: slideDown 0.2s ease;
  min-width: 120px;
  max-height: 200px;
  overflow-y: auto;
}

/* 筛选条件样式（参考账号列表） */
.filter-card {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
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

.filter-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.filter-input::placeholder {
  color: var(--text-tertiary);
}

/* 自定义下拉选择框 */
.custom-select {
  position: relative;
  width: 160px;
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

.custom-select.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.custom-select.disabled .select-display {
  cursor: not-allowed;
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
  max-height: 200px;
  overflow-y: auto;
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
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.strategy-list-content {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategy-list-item {
  padding: 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.strategy-list-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
}

.strategy-list-item.active {
  background-color: rgba(240, 185, 11, 0.1);
  border-color: var(--accent-primary);
}

.strategy-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.strategy-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.strategy-item-separator {
  color: var(--text-tertiary);
  font-size: 12px;
}

.strategy-item-tag {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.strategy-list-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.strategy-list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.strategy-list-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.strategy-list-loading .loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

/* 账号列表弹窗样式 */
.account-list-dialog {
  min-width: 400px;
  max-width: 600px;
}

.account-list-content {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.account-list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.account-list-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.account-list-loading .loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.account-list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-list-item {
  padding: 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.account-list-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-primary);
}

.account-list-item.active {
  background-color: rgba(240, 185, 11, 0.1);
  border-color: var(--accent-primary);
}

.account-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.account-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.account-item-current {
  font-size: 11px;
  color: var(--accent-primary);
  background-color: rgba(240, 185, 11, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  flex-shrink: 0;
}

.account-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.account-item-tag {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.account-item-separator {
  color: var(--text-tertiary);
  font-size: 11px;
}

.account-item-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-left: auto;
  white-space: nowrap;
}

.account-list-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 手机端适配 */
@media (max-width: 768px) {
  .account-detail {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .position-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .btn-action {
    flex: 1;
    min-width: calc(33.333% - 6px);
  }

  .info-grid {
    gap: 10px;
  }
  
  .info-item {
    padding: 12px 14px;
  }
  
  .label {
    font-size: 10px;
  }
  
  .value {
    font-size: 12px;
  }
  
  .value.highlight {
    font-size: 14px;
  }

  .session-item {
    flex-wrap: wrap;
    gap: 8px;
  }

  .session-content {
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }

  .session-actions {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
    justify-content: flex-start;
  }

  .session-separator {
    display: none;
  }

  .pnl-value {
    margin-right: 0;
    justify-content: flex-end;
  }

  .btn-small {
    width: 100%;
    margin-top: 8px;
  }

  .position-details {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .toast {
    left: 12px;
    right: 12px;
    transform: none;
    max-width: calc(100% - 24px);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 策略列表弹窗手机端适配 */
  .strategy-list-dialog {
    min-width: auto !important;
    max-width: calc(100vw - 40px) !important;
    width: calc(100vw - 40px) !important;
    margin: 0 20px;
    padding: 16px;
  }

  /* 策略标题和筛选条件手机端适配 */
  .strategy-title-with-filter {
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  .strategy-title-with-filter .confirm-title {
    font-size: 14px;
    margin-bottom: 0;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .strategy-filter-inline {
    gap: 6px;
    flex: 0 0 auto;
  }

  .filter-input-inline {
    width: 70px;
    padding: 5px 6px;
    font-size: 11px;
    height: 28px;
  }

  .filter-input-inline::placeholder {
    font-size: 10px;
  }

  .custom-select-inline {
    width: 105px;
  }

  .select-display-inline {
    padding: 5px 6px;
    font-size: 11px;
    height: 28px;
  }

  .select-arrow-inline {
    font-size: 8px;
    margin-left: 4px;
  }

  .select-options-inline {
    min-width: 100px;
    max-height: 150px;
  }

  .strategy-list-content {
    max-height: 300px;
    margin-bottom: 12px;
  }

  .confirm-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .confirm-buttons .btn {
    width: 100%;
  }

  /* 账号列表弹窗手机端适配 */
  .account-list-dialog {
    min-width: auto !important;
    max-width: calc(100vw - 40px) !important;
    width: calc(100vw - 40px) !important;
    margin: 0 20px;
    padding: 16px;
  }

  .account-list-content {
    max-height: 400px;
    margin-bottom: 12px;
  }

  .account-item-info {
    flex-wrap: wrap;
    gap: 4px;
  }

  .account-item-value {
    margin-left: 0;
    width: 100%;
    margin-top: 4px;
  }

  /* 确认弹窗手机端适配 */
  .confirm-dialog {
    min-width: auto !important;
    max-width: calc(100vw - 40px) !important;
    width: calc(100vw - 40px) !important;
    margin: 0 20px;
    padding: 16px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
  }

  /* 加仓/开仓/止盈止损/开始策略弹窗手机端适配 */
  .add-position-dialog {
    min-width: auto !important;
    max-width: calc(100vw - 40px) !important;
    width: calc(100vw - 40px) !important;
    margin: 0 20px;
    padding: 16px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
  }

  /* 弹窗内容区域手机端适配 */
  .confirm-dialog .input,
  .add-position-dialog .input {
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  /* 弹窗按钮组手机端适配 */
  .confirm-dialog .confirm-buttons,
  .add-position-dialog .confirm-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .confirm-dialog .confirm-buttons .btn,
  .add-position-dialog .confirm-buttons .btn {
    width: 100%;
  }

  /* 弹窗表单元素手机端适配 */
  .add-position-form .form-item {
    margin-bottom: 16px;
  }

  .add-position-form .form-item label {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .radio-group {
    flex-direction: column;
    gap: 8px;
  }

  .radio-group .radio-option {
    width: 100%;
  }

  /* 弹窗内容区域适配 */
  .session-content-dialog {
    gap: 8px;
  }

  .info-row {
    flex-wrap: wrap;
    gap: 6px;
  }
}

</style>


