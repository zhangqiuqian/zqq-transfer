import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import zqqCascader from './packages/cascader'
import zqqPaging from './packages/paging'

Vue.use(zqqCascader)
Vue.use(zqqPaging)

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
