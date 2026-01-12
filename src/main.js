import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import AccountDetail from './views/AccountDetail.vue'
import Login from './views/Login.vue'
import { isAuthenticated } from './utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/account-detail',
    name: 'AccountDetail',
    component: AccountDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false
  const authenticated = isAuthenticated()

  if (requiresAuth && !authenticated) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && authenticated) {
    // 已登录但访问登录页，跳转到主页
    next('/')
  } else {
    next()
  }
})

createApp(App).use(router).mount('#app')

