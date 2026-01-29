import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Vuebugger from '../../src'

const app = createApp(App)

app.use(createPinia()).use(Vuebugger)

app.mount('#app')
