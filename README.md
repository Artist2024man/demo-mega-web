# Mega Trading Web

一个基于 Vue 3 + Vite 构建的交易管理平台，支持 Web 和移动端（Android/iOS）。

## 📋 目录

- [项目介绍](#项目介绍)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [构建打包](#构建打包)
- [部署说明](#部署说明)
- [移动端打包](#移动端打包)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

## 🚀 项目介绍

Mega Trading Web 是一个功能完整的交易账户管理平台，支持：

- 账户管理（创建、查看、切换账户）
- 策略管理（策略列表、策略切换）
- 持仓管理（当前持仓、历史持仓）
- 实时数据展示（价格、盈亏、手续费等）
- 移动端支持（Android/iOS）

## 🛠 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **移动端**: Capacitor 8
- **图表库**: Lightweight Charts

## 📦 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **移动端开发**（可选）:
  - Android: Android Studio, JDK 11+
  - iOS: Xcode 14+, macOS

## 🏃 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd demo-mega-web
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

## 💻 开发指南

### 项目结构

```
demo-mega-web/
├── src/                    # 源代码目录
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页（账户列表）
│   │   ├── AccountDetail.vue  # 账户详情页
│   │   └── Login.vue      # 登录页
│   ├── utils/             # 工具函数
│   │   ├── auth.js        # 认证相关
│   │   └── request.js     # HTTP 请求封装
│   ├── App.vue            # 根组件
│   └── main.js             # 入口文件
├── public/                 # 静态资源
├── dist/                   # 构建输出目录
├── android/                # Android 项目
├── ios/                    # iOS 项目
├── vite.config.js          # Vite 配置
├── capacitor.config.json   # Capacitor 配置
└── package.json            # 项目配置
```

### 开发命令

```bash
# 启动开发服务器（带热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### API 配置

开发环境使用 Vite 代理，生产环境需要配置环境变量或修改 `src/utils/request.js` 中的 `BASE_URL`。

**开发环境代理配置** (`vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'https://mega.byeing.com',
    changeOrigin: true,
    secure: true
  }
}
```

## 📦 构建打包

### Web 版本

```bash
# 构建生产版本
npm run build
```

构建产物将输出到 `dist/` 目录。

### 构建产物说明

- `index.html` - 入口 HTML 文件
- `assets/` - 静态资源（JS、CSS）
  - `index-*.js` - 打包后的 JavaScript 文件
  - `index-*.css` - 打包后的样式文件

## 🚢 部署说明

### 方式一：Nginx 部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置 Nginx**

   复制 `nginx.conf.example` 并修改配置：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/your/dist;
       index index.html;

       # 处理前端路由（Hash 模式）
       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存
       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # API 代理（可选）
       location /api {
           proxy_pass https://mega.byeing.com;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **部署文件**

   ```bash
   # 将 dist 目录内容上传到服务器
   scp -r dist/* user@server:/path/to/nginx/root/
   ```

4. **重启 Nginx**

   ```bash
   sudo nginx -t  # 测试配置
   sudo nginx -s reload  # 重新加载配置
   ```

### 方式二：静态文件服务器

如果使用其他静态文件服务器（如 Apache、Caddy 等），确保：

1. 支持 SPA 路由（所有路由都返回 `index.html`）
2. 配置静态资源缓存
3. 配置 API 代理（如需要）

### 方式三：CDN 部署

1. 构建项目后，将 `dist/` 目录内容上传到 CDN
2. 配置 CDN 的默认首页为 `index.html`
3. 配置回源规则，确保所有路由都返回 `index.html`

### HTTPS 配置

生产环境建议使用 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # ... 其他配置
}
```

## 📱 移动端打包

### Android 打包

1. **同步 Capacitor**

   ```bash
   npx cap sync
   ```

2. **打开 Android Studio**

   ```bash
   npx cap open android
   ```

3. **在 Android Studio 中**

   - 等待 Gradle 同步完成
   - 连接设备或启动模拟器
   - 点击 `Run` 按钮或使用快捷键运行
   - 打包 APK: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`

4. **生成签名 APK**（发布版本）

   - `Build` → `Generate Signed Bundle / APK`
   - 选择 APK 或 AAB
   - 配置签名密钥
   - 选择构建类型（Release）

### iOS 打包

1. **同步 Capacitor**

   ```bash
   npx cap sync
   ```

2. **打开 Xcode**

   ```bash
   npx cap open ios
   ```

3. **在 Xcode 中**

   - 选择目标设备或模拟器
   - 点击运行按钮或使用快捷键 `Cmd + R`
   - 打包: `Product` → `Archive`
   - 上传到 App Store: `Window` → `Organizer` → 选择 Archive → `Distribute App`

### 移动端配置

修改 `capacitor.config.json`:

```json
{
  "appId": "com.mega.trading",
  "appName": "Mega Trading",
  "webDir": "dist",
  "server": {
    "url": "https://your-domain.com",
    "cleartext": false
  }
}
```

## ⚙️ 配置说明

### 环境变量

项目使用 `import.meta.env` 访问环境变量：

- `import.meta.env.PROD` - 是否为生产环境
- `import.meta.env.DEV` - 是否为开发环境

### API 地址配置

**开发环境**: 使用 Vite 代理（`vite.config.js`）

**生产环境**: 修改 `src/utils/request.js`:

```javascript
const BASE_URL = import.meta.env.PROD 
  ? 'https://mega.byeing.com'  // 生产环境 API 地址
  : ''  // 开发环境使用代理
```

### 路由模式

项目使用 Hash 路由模式（`createWebHashHistory`），适合静态部署和移动端。

## ❓ 常见问题

### 1. 构建后页面空白

**原因**: 可能是路由配置问题或资源路径错误。

**解决**:
- 检查 `vite.config.js` 中的 `base` 配置
- 确认使用 Hash 路由模式
- 检查浏览器控制台错误信息

### 2. API 请求失败

**原因**: 跨域问题或 API 地址配置错误。

**解决**:
- 开发环境：检查 Vite 代理配置
- 生产环境：检查 `BASE_URL` 配置
- 检查服务器 CORS 设置

### 3. 移动端无法访问

**原因**: Capacitor 配置或网络问题。

**解决**:
- 检查 `capacitor.config.json` 中的 `server.url`
- 确认移动设备可以访问服务器地址
- 检查 HTTPS 证书配置

### 4. 构建文件过大

**解决**:
- 使用代码分割
- 启用 Gzip 压缩
- 使用 CDN 加载第三方库

### 5. 路由刷新 404

**原因**: 服务器未配置 SPA 路由回退。

**解决**: 配置服务器将所有路由指向 `index.html`（参考 Nginx 配置）

## 📝 更新日志

### v1.0.0
- 初始版本
- 支持账户管理、策略管理、持仓管理
- 支持移动端（Android/iOS）

## 📄 许可证

[添加许可证信息]

## 👥 贡献

欢迎提交 Issue 和 Pull Request。

## 📧 联系方式

[添加联系方式]

---

**注意**: 部署前请确保：
1. ✅ 已构建生产版本
2. ✅ 已配置正确的 API 地址
3. ✅ 已配置 HTTPS（生产环境）
4. ✅ 已测试所有功能
5. ✅ 已配置错误监控和日志
