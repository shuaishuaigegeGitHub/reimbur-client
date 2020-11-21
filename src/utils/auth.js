import Cookies from 'js-cookie';
import config from '../config';

const TokenKey = config.tokenKey;

export function getToken() {
  return Cookies.get(TokenKey);
}

export function removeToken() {
  return Cookies.remove(TokenKey, { path: '/', domain: process.env.VUE_APP_DOMAIN });
}
