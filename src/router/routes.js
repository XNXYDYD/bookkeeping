import Vue from 'vue'
import Router from 'vue-router'
// import { resolve } from 'path';
// import index from '../pages/index/index.vue'
// import record from '../pages/record/record.vue'
// import test from '../pages/test/test.vue'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'index',
      component: resolve => require(['../pages/index/index.vue'],resolve)
    },
    {
      path: '/record',
      name: 'record',
      component: resolve => require(['../pages/record/record.vue'],resolve)
    },
    {
      path: '/test',
      name: 'test',
      component: resolve => require(['../pages/test/test.vue'],resolve)
    },
  ]
})
