<template>
    <div class="el-form-item__content" :class="inputClass">
        <div class="el-input" :class="size===''?'el-input--small':'el-input--'+size">
            <!--<i class="el-input__icon el-icon-edit" v-show="isEmpty && iconShow"></i>-->
            <!--<i class="el-input__icon el-icon-close" v-show="isDirty && iconShow" @click="reset"></i>-->
            <input type="text"
                   :style="iconShow?'':'padding-right:4px'"
                   :tabindex="tabindex"
                   :data-index="focusIndex"
                   class="el-input__inner ipt"
                   :class="{ 'input-disabled': disabled }"
                   ref="numberInput"
                   :value="value"
                   :disabled="disabled"
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
                this.$refs.numberInput.value = result;
                this.$emit('input', result);
            },
            validValue(){
                if (this.value.length === 1 && this.value === '-') {
                    this.$refs.numberInput.value = '';
                    this.$emit('input', '');
                } else {
                    if (this.value === '' || Number.isNaN(this.value)) {
                        this.$refs.numberInput.value = '';
                        this.$emit('input', '');
                    } else {
                        if (this.validType === 'decimal' || this.validType === '+decimal') {
                            let number = Number.parseFloat(this.value).toString();
                            this.$refs.numberInput.value = number;
                            this.$emit('input', number);
                        } else {
                            let number = Number.parseInt(this.value).toString();
                            this.$refs.numberInput.value = number;
                            this.$emit('input', number);
                        }
                    }
                }
            },
            validator(value){
                let express = '';
                let res = "";

                if (this.validType === 'int' || this.validType === '+int') {
                    if (value.length > 1 && value.substr(0, 1) == '0') {
                        value = value.substr(1, res.substr.length - 1);
                    }
                }
                switch (this.validType) {
                    case 'decimal':
                        express = /^-?(\d+\.\d{0,6}|\d*)$/;
                        break;
                    case '+decimal':
                        express = /^(\d+\.\d{0,6}|\d*)$/;
                        break;
                    case 'int':
                        express = /^-?\d*$/;
                        break;
                    case '+int':
                        express = /^\d*$/;
                    default:
                        break;
                }
                if (express === '' || express.test(value)) {
                    res = value;
                }
                else res = this.value;

                if (res === '' && (this.validType === 'int' || this.validType === '+int')) {
                    res = '0'
                }
                if (this.validType === 'decimal' || this.validType === '+decimal') {
                    if (res.length > 1 && res.substr(0, 1) == '0') {
                        if (res.substr(1, 1) != '.') {
                            res = res.substr(1, res.length - 1);
                        }
                    }
                }

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
            focus(event){
                this.selectAll(event);
                this.$emit('focus');
            },
            reset(){
                this.$refs.numberInput.value = '';
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
        color: #949494;
        background-color: #fff
    }
</style>