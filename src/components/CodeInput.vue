<template>
    <div class="el-form-item__content" :class="inputClass">
        <div class="el-input" :class="size===''?'el-input--small':'el-input--'+size">
            <i class="el-input__icon el-icon-edit" v-show="iconShow"></i>
            <input type="text"
                   :style="iconShow?'':'padding-right:4px'"
                   :tabindex="tabindex"
                   :data-index="focusIndex"
                   class="el-input__inner"
                   :class="{ 'input-disabled': disabled }"
                   ref="codeInput"
                   :value="value"
                   :disabled="disabled"
                   @input="updateValue($event.target.value)"
                   @focus="focus"
                   @blur="blur"
                   @change="change"
                   @keydown.enter="enter"
                   :placeholder="placeholder">
        </div>
    </div>
</template>

<script>
    export default{
        mounted(){
            this.validValue();
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            validType: {
                type: String,
                required: true
            },
            placeholder: {
                type: String
            },
            size: {
                type: String
            },
            focusIndex: {
                type: String
            },
            iconShow: {
                type: Boolean,
                default: true
            },
            inputClass: {
                type: String
            },
            tabindex: {
                type: String
            },
            disabled: {
                type: Boolean
            }
        },
        computed: {
            isEmpty(){
                return !this.value;
            },
            isDirty(){
                return !!this.value;
            }
        },
        methods: {
            updateValue(value){
                let result = this.validator(value);
                this.$refs.codeInput.value = result;
                this.$emit('input', result);
            },
            validValue(){
                if (this.value.length === 1 && this.value === '-') {
                    this.$refs.codeInput.value = '';
                    this.$emit('input', '');
                }
            },
            validator(value){
                let express = '';
                let res = "";

                if (value === "") {
                    return value;
                }
                switch (this.validType) {
                    case 'code':
                        express = /^[A-Za-z0-9]+$/;
                        break;
                    default:
                        break;
                }
                if (express === '' || express.test(value)) {
                    res = value;
                }
                else res = this.value;

                return res;
            },
            selectAll(event){
                setTimeout(function () {
                    event.target.select();
                }, 0);
            },
            enter(){
                this.$emit('enter');
            },
            blur(){
                this.validValue();
                this.$emit('blur');
            },
            change(){
                this.$emit('change');
            },
            focus(event){
                this.selectAll(event);
                this.$emit('focus');
            },
            reset(){
                this.$refs.codeInput.value = '';
                this.$emit('input', '');
            }
        }
    }
</script>
<style lang="scss" scoped>
    .ipt {
        text-align: right;
    }
    .input-disabled {
        border-color: #d1dbe5;
        color: #bbb;
        background-color: #eef1f6
    }
</style>