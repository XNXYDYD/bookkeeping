<template>
  <div class="main">
    <div class="sum">总支出：{{paySum | momneySuffix}}</div>
    <van-button type="primary" class="main-btn" @click="showAddPopup">记一笔</van-button>
    <div id="list_container">      
      <van-row  class="record_list" v-for="item in recordList" :key="item.id">
        <van-col span="10">{{item.date | formatDate}}</van-col>
        <van-col span="8">{{item.item}}</van-col>
        <van-col span="6">{{item.pay | momneySuffix}}</van-col>
      </van-row>
    <p @click="nextPage" style="margin:1rem 0; text-align:center; padding-bottom:1.2rem;" v-show="!listQuery.isFinish" >加载更多</p>
    </div>
    <!-- 记一笔 -->
    <van-popup v-model="showAdd" :close-on-click-overlay="false" style="width:100%; height:100%;" position="right">
      <van-nav-bar
        title="记一笔"
        left-text="返回"
        right-text="完成"
        left-arrow
        @click-left="addRecordBack"
        @click-right="saveRecord"
      />
      
      <div style="padding: 0 5%;">
        <div class="item_sum" @click="toshowNumKB">
          {{showSum}}
        </div>
        <p style="text-align:left; margin:.5rem 0;">分类</p>
        <van-row>
          <van-col span="8" class="rc_category">
            <span style="float:left; width:7rem;" @click="showDate">{{currentDate | formatDate}}</span>
          </van-col>
          <van-col span="2" class="rc_category">
            <van-icon name="arrow" style="float:left; height:1.5rem; line-height:1.5rem;" />
          </van-col>
          <van-col span="8"  class="rc_category">
              <span @click="showCategories">{{recordItem}}</span>
          </van-col>
        </van-row>
      </div>


      <!-- 数字键 -->
      <van-number-keyboard
        :show="showNumKB"
        extra-key="."
        theme="custom"
        close-button-text="完成"
        @input="onInput"
        @delete="onDelete"
        @close="showNumKB=false"
        @blur="showNumKB=false"
      />
      <!-- 消费类别 -->
    </van-popup>
    <van-popup v-model="showType" overlay-class="cotegory_mask"  position="bottom" style="width:100%;">
      <div style="width:100%;">
        <van-picker
          show-toolbar
          title="请选择类型"
          :columns="columns"
          @cancel="onCancel"
          @confirm="onConfirm"
        />
      </div>
    </van-popup>
    
    <!-- 时间选择 -->
    <van-popup v-model="showTimeSelect" overlay-class="time_mask"  position="bottom" style="width:100%;">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        @confirm="getDate"
      />
    </van-popup>
  </div>
</template>

<script>
import {Toast} from 'vant';
import moment from 'moment';
let ready = false;
export default {
  name: 'index',
  props: {
    msg: String
  },
  data(){
    return {
      paySum:'0.00',
      value: '',
      itemSum:{
        integer:'0',//整数部分
        isPoint:false,//是否按了小数点
        suffix1:'0', //小数点第一位
        suffix1IsFill:false, //小数点第一位是否填写
        suffix2:'0',//小数点第二位
      },
      
      recordItem:'早餐',
      showAdd:false,
      showType:false,
      showNumKB:false,
      columns: ['早餐'],
      recordList:[],
      /* 时间 */
      showTimeSelect:false,
      currentDate: new Date(),
      /* 分页查询条件 */
      listQuery:{
        page:1,
        pageSize:10,
        isFinish:false
      }
    }
  },
  mounted(){
    if(ready)return;
    let me = this;
    me.getList();
    me.getCategories();
    me.getPaySum();
  },
  methods:{
    /* 时间 */
    // 显示时间选择器
    showDate(){
      this.showTimeSelect = true;
    },
    // 获取选中时间
    getDate(value){
      this.currentDate = value;
      this.showTimeSelect = false;
    },
    /* 数字键 */
    // 数字键输入
    onInput(val){
      let me = this;
      let currenSum = me.itemSum.integer;
      // 如果已经按了小数点
      if(me.itemSum.isPoint || val === '.'){
        me.itemSum.isPoint = true;
        if(val == '.'){
          return;
        }

        if( me.itemSum.suffix1 =='0' && !me.itemSum.suffix1IsFill){
          me.itemSum.suffix1 = val;
          me.itemSum.suffix1IsFill = true;
        }else if(me.itemSum.suffix2 =='0'){
          me.itemSum.suffix2 = val;
        }

      }else{
        if(currenSum=='0'){
          me.itemSum.integer = val;
        }else{
          me.itemSum.integer += (val+'');
        }
      }
    },
    // 数字键删除
    onDelete(val){
      let me = this;
      // 如果已经按了小数点
      if(me.itemSum.suffix2 !='0'){
        me.itemSum.suffix2 ='0';
      }else if(me.itemSum.suffix1 !='0'){
        me.itemSum.suffix1 ='0';
        me.itemSum.suffix1IsFill = false;
      }else{
        let integer = me.itemSum.integer;
        me.itemSum.suffix1IsFill = false;
        me.itemSum.isPoint = false;
        if(integer.length > 1 && integer != '0'){
          let arr = integer.split('');
              // arr.pop();
          me.itemSum.integer = arr.slice(0,-1).join('');
        }else{
          me.itemSum.integer = '0';
        }
      }
    },
    // 显示数字键
    toshowNumKB(){
      this.showNumKB = true;
    },

    /* 获取类别 */
    getCategories() {
      let me = this;
      me.$http.get('http://localhost:2019/categories', {text:me.text}).then(data => {
        if(data.data && data.data.length > 0){
          me.columns = data.data.map(item => item.category_name);
        }else{
          Toast('请求失败');
        }
      }).catch(res => {
        Toast(`请求错误，刷新页面重试`);
      });
    },
    /* 导航相关方法 */
    // 保存记录
    saveRecord(){
      let me = this;
      let param = {
        pay: me.showSum,
        date: moment(me.currentDate).format('YYYY-MM-DD'),
        saveTime: new Date().getTime(),
        item: me.recordItem
      }
       me.$http.post('http://localhost:2019/addRecord',param ).then(data => {
        console.log('addRecord', data);
        if(data.data.code === 0 && data.data.msg == '成功'){
          Toast(`保存成功`);
          me.listQuery.page = 1;
          me.listQuery.isFinish = false;
          me.getList();
          me.getPaySum();
          this.showAdd = false;
          me.inputPaidInit();
        }else{
          Toast(`保存失败`);
        }
      }).catch(res => {
        Toast(`请求错误，请稍后再试`);
      });
      this.showAdd = false;
    },
    // 初始化输入金额
    inputPaidInit(){
      let me = this;
      me.itemSum = {
        integer:'0',//整数部分
        isPoint:false,//是否按了小数点
        suffix1:'0', //小数点第一位
        suffix1IsFill:false, //小数点第一位是否填写
        suffix2:'0',//小数点第二位
      }
    },
    // 隐藏添加记录
    addRecordBack(){
      this.showAdd = false;
    },
    // 显示天界记录界面
    showAddPopup(){
      this.showAdd = true;
    },
    /* 显示类别 */
    showCategories(){
      this.showType = true;
    },
    /* 选中消费你类型 */
    onConfirm(value, index) {
      console.log('value', value)
      this.showType = false;
      this.recordItem = value;
    },
    // 隐藏消费类型
    onCancel(){
     this.showType = false;
    },
    /* 获取账目数据列表 */
    getList(isMore = false){
      let me = this;
      let q = me.listQuery;
      let params = {pageSize:q.pageSize,page:q.page};
      me.$http.get('http://localhost:2019/get', params).then(data => {
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
      me.$http.get('http://localhost:2019/getSum', {text:me.text}).then(data => {
        if(data.data){
          me.paySum = data.data;
        }else{
          Toast('请求失败');
        }
      }).catch(res => {
        Toast(`请求错误，刷新页面重试`);
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
  computed:{
    showSum(){
      let me = this;
      return me.itemSum.integer + '.' + me.itemSum.suffix1 + me.itemSum.suffix2
    }
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
