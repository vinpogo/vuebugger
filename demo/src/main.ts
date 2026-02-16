import Vuebugger from '@vingy/vuebugger'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia()).use(Vuebugger)

app.mount('#app')
