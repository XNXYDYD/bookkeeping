<template>
  <div class="hello">
    <!-- <d-input type="text" v-model="text" placeholder="请输入查询条件" label=""></d-input> -->
    <button @click="show = true">showCalculate</button>
    <button @click="submit">submit</button>
    <calculate v-model="show" @complete="finish" :data="recordItemData"></calculate>
  </div>
</template>

<script>
import dInput from '../../components/d-input.vue'
import calculate from '../index/calculate.vue'

export default {
  name: 'record',
  props: {
    msg: String
  },
  components:{
    dInput,
    calculate
  },
  data(){
    return {
      text: '',
      show:false,
      recordItemData:{
        pay:'5.5',
        date: '2019-03-24',
        item: '早餐'
      }
    }
  },
  methods:{
    /* 计算组件完成输入 */
    finish(val){
      console.log(val)
    },
    getData() {
      let me = this;
      me.$http.get('http://localhost:2019/getRecord', {text:me.text}).then(data => {
        console.log(data)
      }).catch(res => {
        console.log('error:', res);
      });
    },
    getCategories() {
      let me = this;
      me.$http.get('http://localhost:2019/categories').then(data => {
        console.log(data)
      }).catch(res => {
        console.log('error:', res);
      });
    },
    submit() {
      let me = this;
      me.$http.post('http://localhost:2019/add', {text:me.text}) .then(data => {
        console.log(data);
      }).catch(res => {
         console.log('error:', res);
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
