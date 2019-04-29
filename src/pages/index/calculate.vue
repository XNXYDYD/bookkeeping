<template>
<div id="c-main">
    <!-- 导航 -->
    <van-popup v-model="value" :close-on-click-overlay="false" style="width:100%; height:100%;" position="right">
      <van-nav-bar
        :title="title"
        left-text="返回"
        right-text="完成"
        left-arrow
        @click-left="onBack"
        @click-right="onFinish"
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
            <van-icon name="arrow" style="float:left; height:1.5rem; line-height:1rem;" />
          </van-col>
          <van-col span="8"  class="rc_category">
              <span @click="showCategories">{{category_name}}</span>
          </van-col>
        </van-row>
        <van-row>
           <van-field v-model="note" placeholder="请输入备注" style="border:1px solid #efefef; margin-top:15px; padding:6px 10px;"/>
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
          value-key="category_name"
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
import moment from 'moment';
import {Toast} from 'vant';
export default {
  props:{
    value:Boolean,
    data: Object,
    title: String
  },
  data(){
    return {
      // title:'',
      currentVal:false,
      /* 输入的金额 */
      itemSum:{
        integer:'0',//整数部分
        isPoint:false,//是否按了小数点
        suffix1:'0', //小数点第一位
        suffix1IsFill:false, //小数点第一位是否填写
        suffix2:'0',//小数点第二位
      },
      /*  */
      showAdd:false,
      showType:false,
      showNumKB:false,
      columns: ['早餐'],
      
      showTimeSelect:false,
      /* 记录数据 */
      category_name:'早餐',
      id:'',
      currentDate: new Date(), //时间
      note:'', //备注
      parent_code:'', //父类
      code:'', //子类
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    init(){
      // this.processData();
      this.getCategories();
    },
    /* 导航操作 */
    onFinish(){
      let me = this;
      this.$emit('complete',{
        pay: me.showSum,
        category_name: me.category_name,
        date: me.currentDate,
        id: me.id,
        note: me.note,
        parent_code: me.parent_code,
        code: me.code
      });
    },
    onBack(){
      this.inputPaidInit();
      this.$emit('input',false);
    },
    /* 处理接收的参数 */
    processData(){
      console.log('process',this.data);
      if(this.data && Object.keys(this.data).length > 0){
        // this.title = '修改记录';
        this.data.pay && this.transformPaySum(this.data.pay);
        this.currentDate = this.data.date ? new Date(this.data.date) :  new Date();
        this.category_name = this.data.category_name || '早餐';
        this.id = this.data.ID || '';
        this.note = this.data.note || '';
        this.parent_code = this.data.parent_code || '';
        this.code = this.data.code || '';
      }else{
        // this.title = '记一笔';
        this.category_name = '早餐';
        this.id='';
        this.currentDate= new Date(); //时间
        this.note=''; //备注
        this.parent_code=''; //父类
        this.code=''; //子类
      }
    },
    /* 时间 */
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
    onDelete(){
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
          me.itemSum.integer = arr.slice(0,-1).join('');
        }else{
          me.itemSum.integer = '0';
        }
      }
    },
    // 显示数字键
    toshowNumKB(){
      this.showNumKB = !this.showNumKB;
    },

    // 初始化输入金额
    inputPaidInit(){
      console.log('init');
      let me = this;
      me.$nextTick(()=>{
        me.itemSum = {
          integer:'0',//整数部分
          isPoint:false,//是否按了小数点
          suffix1:'0', //小数点第一位
          suffix1IsFill:false, //小数点第一位是否填写
          suffix2:'0',//小数点第二位
        }
      });
    },
    // 转化传入一个金额
    transformPaySum(paid){
      let _paid = (paid*1).toFixed(2).split('.');
      let afterPoint = _paid[1].split('');
      this.itemSum = {
        integer: _paid[0],//整数部分
        isPoint: _paid[1] > 0 ? true : false,//是否按了小数点
        suffix1: afterPoint[0], //小数点第一位
        suffix1IsFill: afterPoint[0] > 0 ? true : false, //小数点第一位是否填写
        suffix2: afterPoint[1],//小数点第二位
      }
    },
    // 隐藏添加记录
    addRecordBack(){
      this.showAdd = false;
    },
    /* 获取类别 */
    getCategories() {
      let me = this;
      me.$http.get('http://localhost:2019/categories', {text:me.text}).then(data => {
        if(data.data && data.data.length > 0){
          // me.columns = data.data.map(item => item.category_name);
          me.columns = data.data;
        }else{
          Toast('请求失败');
        }
      }).catch(res => {
        Toast(`请求错误，刷新页面重试`);
      });
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
      this.category_name = value.category_name;
      this.parent_code = value.parent_code;
      this.code = value.code;
    },
    // 隐藏消费类型
    onCancel(){
    this.showType = false;
    },
  },
  watch:{
    'value':function(val){
      this.processData();
    }
  },
  computed:{
    showSum(){
      let me = this;
      return me.itemSum.integer + '.' + me.itemSum.suffix1 + me.itemSum.suffix2
    },
    showNote(){
      return;
    }
  },
  filters:{
    formatDate: function (value) {
      if (!value) return '';
      return moment(value).format('YYYY-MM-DD');
    }
  }
}
</script>

<style scoped>

</style>