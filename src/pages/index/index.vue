<template>
  <div class="main">
    <div class="hearder">
      <div class="serach_date" @click="showSearchDate">
        月份：{{SearchDate}}
        <van-icon name="arrow-down" class="date_arr_dowm"/>
      </div>
      <div class="sum">
        总支出：{{paySum | momneySuffix}}
      </div>
    </div>
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

    <!-- 查询总金额开始时间 -->
    <van-popup v-model="showSumDate" overlay-class="time_mask"  position="bottom" style="width:100%;">
      <van-datetime-picker
        v-model="tempSearchDate"
        type="year-month"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="getSumSearchDate"
        :formatter="formatter"
      />
    </van-popup>
  </div>
</template>

<script>
// import {Toast, Search} from 'vant';
import moment from 'moment';
import calculate from './calculate';
let ready = false;
let currentDateTime = new Date();
let currentYear = currentDateTime.getFullYear();
let currentMonth = (currentDateTime.getMonth()+1);
let stringMonth = (currentMonth > 9  ? currentMonth : '0' + currentMonth);
let lastDate = new Date(currentYear,currentMonth,0).getDate();
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
      minDate: new Date('2019/03/01 00:00:00'),
      maxDate: new Date(`2019/${stringMonth}/${lastDate} 23:59:59`),
      // 查询总金额
      tempSearchDate: currentYear + '-' + stringMonth,
      SearchDate: currentYear + '-' + stringMonth,
      paySum:'0.00',
      showSumDate:false,
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
    // 总金额时间
    getSumSearchDate(value){
      console.log('value', value)
      let _year = value.getFullYear();
      let _month = value.getMonth() + 1;
      this.SearchDate = _year+ '-' + (_month>9 ? _month : '0'+_month);
      this.showSumDate = false;
      this.listQuery.page = 1;
      this.$nextTick(()=>{
        this.getPaySum();
        this.getList();
      });
    },
    // 显示搜索月份选择器
    showSearchDate(){
      this.showSumDate = true;
    },
    // 格式化获取金额汇总
    formatter(type,value){
      return value;
    },
    // 设置cookies
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
          me.$toast('保存成功');
          me.listQuery.page = 1;
          me.listQuery.isFinish = false;
          me.initData();
        }else{
          me.$toast(`保存失败`);
        }
      }).catch(res => {
        me.$toast(`请求错误，请稍后再试`);
      });
      // this.showAdd = false;
    },
    /* 修改记录信息 */
    async updateRecord(param){
      let me = this;
      let data = await me.$http.post('http://localhost:2019/upadteRecord',param);
      console.log('update', data);
      if(data.data.msg == '成功'){
        me.$toast(`修改成功`);
        me.initData();
      }else{
        me.$toast(`修改记录失败，请稍后再试`);
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
      let date = this.SearchDate || (currentYear + '-' + stringMonth);
      let params = {pageSize:q.pageSize,page:q.page,date};
      me.$http.get('http://localhost:2019/getRecord', params).then(data => {
        if(data.data && Object.prototype.toString.call(data.data)=='[object Array]'){
          me.recordList = isMore ? me.recordList.concat(...data.data) : data.data;
          if(data.data.length < 10){
            me.listQuery.isFinish = true;
          }else{
            me.listQuery.isFinish = false;
          }
        }else{
          me.$toast('获取记录失败');
        }
      }).catch(res => {
        me.$toast(`请求错误，刷新页面重试`);
        console.log('getList error', res);
      });
    },
    /* 下一页 */
    nextPage(){
      if( this.listQuery.isFinish ){
        me.$toast('没有更多啦');
        return;
      }
      this.listQuery.page = this.listQuery.page*1 + 1;
      this.getList(true);
    },
    /* 获取总支出 */
    getPaySum(){
      let me = this;
      let date = this.SearchDate || (currentYear + '-' + (currentMonth>9?currentMonth:'0'+currentMonth));
      me.$http.get('http://localhost:2019/getSum', {date}).then(data => {
        if(data.data){
          me.paySum = data.data;
        }else{
          me.$toast('请求失败');
        }
      }).catch(res => {
        me.$toast(`请求错误，刷新页面重试.`+res);
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
.hearder{
   font-size:1.2rem;
   height: 1rem;
   line-height: 1rem;
   overflow: hidden;
   padding: .75rem 1.5rem;
}
.sum{
  float: right;
}
.serach_date{
  float: left;
  overflow: hidden;
}
.date_arr_dowm{
  font-size: 1rem;
}
.main-btn{
  width:90%;
  margin-top: .75rem;
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
