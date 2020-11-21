import router from './router';
import store from './store';
import { getToken, removeToken } from '@/utils/auth';
import config from './config';

router.beforeEach((to, from, next) => {
  if (getToken()) {
    if (store.state.permission.routes.length === 0) {
      store
        .dispatch('GenerateRoutes')
        .then(accessRoutes => {
          router.addRoutes(accessRoutes);
          next({ ...to, replace: true });
        })
        .catch(err => {
          removeToken();
          window.location.href = config.loginUrl;
        });
    } else {
      next();
    }
  } else {
    window.location.href = config.loginUrl;
  }
});
