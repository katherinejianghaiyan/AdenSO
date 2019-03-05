<template>
  <div class="el-form-item__content" :class="inputClass">
    <div class="el-input" :class="size===''?'el-input--small':'el-input--'+size">
      <i class="el-input__icon" :class="!icon?'':'el-icon-'+icon" v-show="isEmpty && iconShow"></i>
      <i class="el-input__icon el-icon-close" v-show="isDirty && iconShow" @click="reset"></i>
      <input type="text"
             :style="iconShow?'':'padding-right:0'"
             :tabindex="tabindex"
             :data-index="focusIndex"
             class="el-input__inner"
             ref="baseInput"
             :value="value"
             @input="updateValue($event.target.value)"
             @focus="focus"
             @blur="blur"
             @keydown.enter="enter"
             :placeholder="placeholder">
    </div>
  </div>
</template>

<script>
    export default{
        props:{
            value:{
                type: String,
                default:''
            },
            placeholder:{
                type: String
            },
            size:{
                type: String
            },
            focusIndex:{
                type:String
            },
            iconShow:{
                type: Boolean,
                default:true
            },
            icon:{
                type: String
            },
            inputClass:{
                type: String
            },
            tabindex:{
                type: String
            }
        },
        computed:{
            isEmpty(){
                return !this.value;
            },
            isDirty(){
                return !!this.value;
            }
        },
        methods:{
            updateValue(value){
                this.$emit('input', this.$refs.baseInput.value);
            },
            enter(){
                this.$emit('enter');
            },
            blur(){
                this.$emit('blur');
            },
            focus(event){
                this.selectAll(event);
                this.$emit('focus');
            },
            reset(){
                this.$refs.baseInput.value='';
                this.$emit('input','');
            },
            selectAll(event){
                setTimeout(function(){
                    event.target.select();
                },0);
            }
        }
    }
</script>