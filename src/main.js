import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'

const app = createApp(App)
installElementPlus(app)

// Import Element Plus Icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// Register each icon component globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app')