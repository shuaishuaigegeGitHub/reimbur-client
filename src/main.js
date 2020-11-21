import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/element-variables.scss';
import ElementUI from 'element-ui';
import service from './utils/request.js';
import filters from './utils/filter.js';
import 'cnchar';
import './permission'; // 权限验证

Vue.prototype.$axios = service;

Vue.config.productionTip = false;

Vue.use(ElementUI, {
  size: 'medium'
});

for (const key in filters) {
  if (Object.prototype.hasOwnProperty.call(filters, key)) {
    const element = filters[key];
    Vue.filter(key, element);
  }
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
