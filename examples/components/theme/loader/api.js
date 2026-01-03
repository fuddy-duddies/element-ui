import Element from 'main/index.js';
import { post, get } from './ajax';

const { version } = Element;

const hostList = {
  local: 'http://localhost:8086/api/',
  production: 'http://localhost:8086/api/'
};

const host = hostList[process.env.FAAS_ENV] || hostList.production;

export const getVars = () => {
  return get(`${host}get-theme-variables?version=${version}`);
};

export const updateVars = (themeName, data, cb) => {
  return post(`${host}update-theme-variables?version=${version}&name=${themeName}`, data, cb);
};
