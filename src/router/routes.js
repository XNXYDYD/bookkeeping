import Vue from 'vue'
import Router from 'vue-router'
import index from '../pages/index/index.vue'
import record from '../pages/record/record.vue'
import test from '../pages/test/test.vue'


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/record',
      name: 'record',
      component: record
    },
    {
      path: '/test',
      name: 'test',
      component: test
    },
  ]
})
