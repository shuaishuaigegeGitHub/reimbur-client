import router from './router';
import { getToken } from '@/utils/auth';
import config from './config';

router.beforeEach((to, from, next) => {
  if (getToken()) {
    next();
  } else {
    window.location.href = config.loginUrl;
  }
});
