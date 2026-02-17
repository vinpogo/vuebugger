import Vuebugger from '@vingy/vuebugger'
import { tooltipPlugin } from '@vingy/vueltip'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import Tooltip from './Tooltip.vue'

const app = createApp(App)

app.use(createPinia()).use(Vuebugger).use(tooltipPlugin, {
  component: Tooltip,
  handleDialogModals: true,
})

app.mount('#app')
