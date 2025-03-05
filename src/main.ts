import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import router from './router'


const app = createApp(App)

app.use(router)
app.use(Quasar, {
  plugins: {},
})

app.mount('#app')
