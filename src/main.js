import Vue from 'vue'
import http from './until/http';
// import axios from 'axios';
import App from './App.vue'
import Vant from 'vant';
import router from './router/routes.js';
import 'vant/lib/index.css';

Vue.use(Vant);

Vue.prototype.$http = http;
Vue.prototype.$islog = true;
Vue.prototype.$log = (...arg) =>{
  islog&&console.log(...arg)
};
// Vue.prototype.$http = axios;
// Vue.use(axios);

Vue.config.productionTip = false

const app = new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
