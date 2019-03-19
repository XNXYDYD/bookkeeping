<template>
  <div id="app">
    <router-view/>
    <!-- tabbar -->
    <div>
      <van-tabbar v-model="current">
        <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
        <van-tabbar-item icon="search" to="./record">我的分析</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>

export default {
  name: 'app',
  data(){
    return {
      /* tabbar current */
      current:0
    }
  },
  beforeCreate(){
    let setRem = () => {
      let _;(_ = function(){document.querySelector('html').style.fontSize = 0.0625*(750<=document.documentElement.clientWidth?750:document.documentElement.clientWidth)+"px";})();window.onresize = _;
    }
    // setRem();
  }
}
</script>

<style>
@import './common/css/cssreset.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body{
  font-size:16px;
}
</style>
