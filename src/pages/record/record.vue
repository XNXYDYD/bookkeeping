<template>
  <div class="hello">
    <!-- <d-input type="text" v-model="text" placeholder="请输入查询条件" label=""></d-input> -->
    <button @click="show = true">showCalculate</button>
    <button @click="submit">submit</button>
    <calculate v-model="show" @complete="finish" :data="recordItemData"></calculate>
      <div>
        <van-picker
          show-toolbar
          title="请选择类型"
          :columns="columns"
          value-key="category_name"
          @cancel="onCancel"
          @confirm="onConfirm"
          @change="onChange"
        />
      </div>
  </div>
</template>

<script>
import dInput from '../../components/d-input.vue'
import calculate from '../index/calculate.vue'
const citys = {
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州']
};
const cotegories = {
  '餐饮日常': [{"parent_code":"1000","code":"1000","category_name":"餐饮日常"},{"parent_code":"1000","code":"1010","category_name":"早餐"},{"parent_code":"1000","code":"1020","category_name":"午餐"},{"parent_code":"1000","code":"1030","category_name":"晚餐"},{"parent_code":"1000","code":"1040","category_name":"食材调料"}],
  '家庭日常': [{"parent_code":"2000","code":"2000","category_name":"家庭日常"},{"parent_code":"2000","code":"2010","category_name":"房租"},{"parent_code":"2000","code":"2020","category_name":"水费"},{"parent_code":"2000","code":"2030","category_name":"管理费"},{"parent_code":"2000","code":"2040","category_name":"电费"},{"parent_code":"2000","code":"2050","category_name":"煤气费"},{"parent_code":"2000","code":"2060","category_name":"日用品"},{"parent_code":"2000","code":"2070","category_name":"话费宽带"},{"parent_code":"2000","code":"2080","category_name":"公交车费"},{"parent_code":"2000","code":"2090","category_name":"其他"}]
};

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
      },

      columns: [
        // {
        //   values: Object.keys(cotegories),
        //   className: 'column1'
        // },
        // {
        //   values: cotegories['餐饮日常'],
        //   className: 'column2',
        //   defaultIndex: 2
        // }
      ]
    }
  },
  methods:{
    /* 选中消费你类型 */
    onConfirm(value, index) {
      console.log('value', value)
      // this.showType = false;
      // this.category_name = value.category_name;
      // this.parent_code = value.parent_code;
      // this.code = value.code;
    },
    // 隐藏消费类型
    onCancel(){
    // this.showType = false;
    },
    onChange(picker, values) {
      picker.setColumnValues(1, cotegories[values[0]]);
    },
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
