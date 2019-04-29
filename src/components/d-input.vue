<template>
  <div class="d-main">
    <span v-if="label" class="label">{{label}}</span>
    <input 
      :value="currentValue" 
      @change="onChange"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
      @keyup.enter="onEnter"
      :placeholder="placeholder"
      type="text" class="d_input"
      :style="label?'width:10rem;float:right;':''"
    >
  </div>
</template>
<script>
  export default {
    name:'d-input',
    props:{
      value: {
        type:[String, Number],
        default:''
      },
      placeholder:{
        type:String
      },
      label:{
        type:String
      }
    },
    data(){
      return {
        currentValue: ''
      }
    },
    methods:{
      onInput (event) {
        let { value } = event.target;
        if (this.number) {
          value = isNaN(+value) ? value : +value;
        }
        this.$emit('input', value);
        this.setCurrentValue(value);
        this.$emit('change', value);
      },
      onFocus (event) {
        this.$emit('focus', event);
      },
      onEnter (event) {
        this.$emit('enter', event);
      },
      onBlur (event) {
        this.$emit('blur', event);
      },
      onChange (event) {
        const { value } = event.target;
        this.$emit('change', value);
      },
      setCurrentValue (value) {
        if (value === this.currentValue) {
          return;
        }
        this.currentValue = value;
      }
    }
  }
</script>
<style scoped>
  .d-main{
    overflow: hidden;
  }
  .d_input{
    height: 1.28rem;
    width: 15rem;
    padding: 0 .5rem;
    outline: none;
    border:none;
  }
  .label{
    height: 1.28rem;
    width: 4rem;
    line-height: 1.28rem;
    display: block;
    float: left;
    font-size:.6rem;
  }
</style>