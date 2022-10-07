import Vue from 'vue'
import Vue2EditorEsm from "vue2-editor";
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(Vue2EditorEsm);

new Vue({
  render: h => h(App),
}).$mount('#app')
