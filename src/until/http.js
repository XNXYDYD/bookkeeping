import axios from 'axios';

let http = axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  },
  transformRequest: [function (data) {
    let newData = '';
    for (let k in data) {
      if (data.hasOwnProperty(k) === true) {
        newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
      }
    }
    return newData;
  }],
});

// 添加请求拦截器
// http.interceptors.request.use(function (config) {
//   // 在发送请求之前做些什么
//   console.log('config', config)
//   return config;
// }, function (error) {
//   // 对请求错误做些什么
//   console.log('error', error)
//   return Promise.reject(error);
// });

function apiAxios(method, url, params, response) {
  return new Promise((pres,prej) => {
    http({
      method: method,
      url: url,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
    }).then(function (res) {
      response && response(res);
      pres(res);
    }).catch(function (err) {
      response && response(err);
      prej(err);
    })
  });
}

export default {
  get: function (url, params, response) {
    return apiAxios('GET', url, params, response)
  },
  post: function (url, params, response) {
    return apiAxios('POST', url, params, response)
  },
  put: function (url, params, response) {
    return apiAxios('PUT', url, params, response)
  },
  delete: function (url, params, response) {
    return apiAxios('DELETE', url, params, response)
  }
}