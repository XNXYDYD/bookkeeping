<template>
  <div class="main">
    <div class="sum">总支出：{{paySum | momneySuffix}}</div>
    <van-button type="primary" class="main-btn" @click="showAddPopup(null)">记一笔</van-button>
    <div id="list_container">      
      <van-row  class="record_list"  v-for="item in recordList" :key="item.id">
        <div  @click="showAddPopup(item)">
          <van-col span="10">{{item.date | formatDate}}</van-col>
          <van-col span="8">{{item.category_name}}</van-col>
          <van-col span="6">{{item.pay | momneySuffix}}</van-col>
        </div>
      </van-row>
    <p @click="nextPage" style="margin:1rem 0; text-align:center; padding-bottom:1.2rem;" v-show="!listQuery.isFinish" >加载更多</p>
    </div>
    <!-- 记一笔 -->
    <calculate v-model="show" @complete="finish" ref="addition" :data="updateData" :title="calculateTitle"></calculate>
  </div>
</template>

<script>
import {Toast} from 'vant';
import moment from 'moment';
import calculate from './calculate';
let ready = false;
export default {
  name: 'index',
  props: {
    msg: String,
  },
  components:{
    calculate
  },
  data(){
    return {
      paySum:'0.00',
      calculateTitle:'',
      /* 分页查询条件 */
      listQuery:{
        page:1,
        pageSize:10,
        isFinish:false
      },
      recordList:[],
      show:false,
      /* 修改信息时的记录数据 */
      updateData:{},
      isUpdate:false
    }
  },
  mounted(){
    if(ready)return;
    let me = this;
    me.getList();
    // me.getCategories();
    me.getPaySum();
  },
  methods:{
    setC(name,value){
      var Days = 30;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days*24*60*60*1000);
      document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    },
    getC(name){
      var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
      if(arr=document.cookie.match(reg))
      return unescape(arr[2]);
      else
      return null;
    },
    /* 填写记录完成，新增记录和 */
    finish(val){
      let me = this;
      console.log('val', val);
      try {
        if(val && val.pay && val.pay!= '0.00'){
          let param = {
            pay: val.pay,
            date: moment(val.date).format('YYYY-MM-DD'),
            saveTime: new Date().getTime(),
            category_name: val.category_name,
            id: val.id,
            note: val.note || '',
            parent_code: val.parent_code, //父类
            code: val.code, //子类
          }
          if(this.isUpdate){
            this.updateRecord(param);
            this.isUpdate = false;
          }else{
            this.saveRecord(param);
          }
        }
      } catch (error) {
        console.log('error', error)
      }
    },
    // 保存和修改记录后，刷新数据
    initData(){
      let me = this;
      me.getList();
      me.getPaySum();
      this.show = false;
      this.updateData = {};
      me.$refs['addition'].inputPaidInit();
    },
    /* 导航相关方法 */
    // 保存记录
    async saveRecord(param){
      let me = this;
      me.$http.post('http://localhost:2019/addRecord',param ).then(data => {
        console.log('addRecord', data);
        if(data.data.code === 0 && data.data.msg == '成功'){
          Toast(`保存成功`);
          me.listQuery.page = 1;
          me.listQuery.isFinish = false;
          me.initData();
        }else{
          Toast(`保存失败`);
        }
      }).catch(res => {
        Toast(`请求错误，请稍后再试`);
      });
      // this.showAdd = false;
    },
    /* 修改记录信息 */
    async updateRecord(param){
      let me = this;
      let data = await me.$http.post('http://localhost:2019/upadteRecord',param);
      console.log('update', data);
      if(data.data.msg == '成功'){
        Toast(`修改成功`);
        me.initData();
      }else{
        Toast(`修改记录失败，请稍后再试`);
      }
    },
    // 显示添加和修改记录界面
    showAddPopup(data=null){
      console.log(data)
      if(data){
        this.isUpdate = true;
        this.updateData = data;
      }else{
        this.updateData = {};
      }
      this.show = true;
    },
    /* 获取账目数据列表 */
    getList(isMore = false){
      let me = this;
      let q = me.listQuery;
      let params = {pageSize:q.pageSize,page:q.page};
      me.$http.get('http://localhost:2019/getRecord', params).then(data => {
        if(data.data && data.data.length > 0){
          me.recordList = isMore ? me.recordList.concat(...data.data) : data.data;
          if(data.data.length < 10){
            me.listQuery.isFinish = true;
          }
        }else{
          Toast('请求失败');
        }
      }).catch(res => {
        Toast(`请求错误，刷新页面重试`);
        console.log('getList error', res);
      });
    },
    /* 下一页 */
    nextPage(){
      if( this.listQuery.isFinish ){
        Toast('没有更多啦');
        return;
      }
      this.listQuery.page = this.listQuery.page*1 + 1;
      this.getList(true);
    },
    /* 获取总支出 */
    getPaySum(){
      let me = this;
      let month = '5'
      me.$http.get('http://localhost:2019/getSum', {month}).then(data => {
        if(data.data){
          me.paySum = data.data;
        }else{
          Toast('请求失败');
        }
      }).catch(res => {
        Toast(`请求错误，刷新页面重试.`+res);
      });
    }
  },
  filters: {
    formatDate: function (value) {
      if (!value) return '';
      return moment(value).format('YYYY-MM-DD');
    },
    numberSuffix: function (value) {
      if (!value) return '';
      return moment(value).format('YYYY-MM-DD');
    },
    momneySuffix:function(val){
      if (!val) return '';
      return (val*1).toFixed(2);
    }
  },
  watch:{
    show(val){
      if(!val){
        this.updateData = {};
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main{
  padding: .5rem 0;
}
.sum{
  margin: .5rem 0 1rem 0;
  font-size:1.2rem;
}
.main-btn{
  width:90%;
}
.record_list{
  padding: .5rem 1rem;  
}
.record_list:active{
  background: #f9f9f9;
}
.record_list>div{
  text-align: left;
}
#list_container{
  max-height:33rem;
  overflow-y:auto; 
  margin-top:1rem;
}
.rc_category{
  line-height: 1.5rem;
  text-align: left;
}
</style>
