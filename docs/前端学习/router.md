# router路由

## 使用方式
1. 提供一个路由配置表，不同URL对应不同组件的配置
2. 初始化路由实例new VueRouter()
3. 挂载到Vue实例上
4. 提供一个路由占位，用来挂载URL匹配到的组件

## 编写代码方式
1. 安装vue-router pnpm install vue-router --save
1. 编写router.js
2. main.js中导入router.js
3. 在组件中进行使用router

## Vue3使用路由
### 编写router.js
```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            component: () => import('../components/MyLogin.vue')
        }
    ]
})

export default router
```

### mian.js中导入router.js

```javascript

import { createApp } from 'vue'
import router from './router/router.js'
import App from './App.vue'

const app = createApp(App)
//挂载路由模块
app.use(router)
app.mount("#app")

```

### 在组件中进行使用router

```vue
<template>
  <div>
    <router-link to="/login">login</router-link>
    <button @click="$router.push("/login")"></button>
    <router-view></router-view>
  </div>
</template>
```

参考链接：https://router.vuejs.org/zh/