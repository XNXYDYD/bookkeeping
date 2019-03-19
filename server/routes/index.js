import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/main.vue'
import Goods from './views/goods/goods.vue'
import Comments from './views/comment/comment.vue'
import Shop from './views/shop/shop.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
      children:[
        {
          path: '/goods',
          name: 'goods',
          component: Goods,
        },
        {
          path: '/shop',
          name: 'shop',
          component: Shop,
        },
        {
          path: '/comment',
          name: 'comment',
          component: Comments,
        }
      ]
    }
  ]
})
