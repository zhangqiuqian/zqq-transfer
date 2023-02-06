import Vue from 'vue'
import zqqTransfer from './index.vue'

// 组件的 name 作为组件调用名
zqqTransfer.install = () => Vue.component(zqqTransfer.name, zqqTransfer)

export default zqqTransfer
