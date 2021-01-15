import router from './router';
import { getToken } from '@/utils/auth';
import config from './config';

// 白名单，不需要登录就能访问的
const whiteList = ['/purchase/instance'];

router.beforeEach((to, from, next) => {
  if (getToken()) {
    next();
  } else {
    for (let url of whiteList) {
      if (url.startsWith(to.path)) {
        next();
        return;
      }
    }
    window.location.href = config.loginUrl;
  }
});
