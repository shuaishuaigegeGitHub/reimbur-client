import axios from 'axios';
import store from '../store';
import { getToken, removeToken } from '@/utils/auth';
import { Message } from 'element-ui';
import config from '../config';

const service = axios.create({
  baseURL: config.baseUrl,
  timeout: 60000
});

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken();
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (response.status === 200) {
      if (res.code != 1000) {
        if (res.code === 401) {
          // 401表示登录失效，直接清除token
          Message({
            message: res.msg,
            type: 'error'
          });
          removeToken();
          window.location.href = config.loginUrl;
        } else {
          Message({
            message: res.msg,
            type: 'error'
          });
          return Promise.reject(res);
        }
      } else {
        return res;
      }
    } else {
      return Promise.reject(res);
    }
  },
  error => {
    console.log(error);
    const status = error.response.status;
    Message({
      message: error.response.data,
      type: 'error'
    });
    return Promise.reject(error);
  }
);

export default service;
