<template>
    <el-form :inline="true" style="margin-right:0">
        <el-form-item style="margin-right:0">
            <div class="el-form-item__content">
                <div class="el-autocomplete code">
                    <div class="el-input" :class="size===''?'el-input--small':'el-input--'+size">
                        <i class="el-input__icon el-icon-edit" v-show="isEmpty"></i>
                        <i class="el-input__icon el-icon-close" v-show="isDirty" @click="reset"></i>
                        <input :data-index="focusIndex"
                               type="text"
                               :tabindex="tabindex"
                               class="el-input__inner code"
                               :placeholder="codePlaceholder"
                               autocomplete="off"
                               v-model="queryString"
                               @keydown.down.prevent="down"
                               @keydown.up.prevent="up"
                               @keydown.enter="set"
                               @keydown.esc="reset"
                               @focus="focus"
                               @blur="leave"
                               @input="update">
                    </div>
                </div>
                <transition name="list">
                    <ul v-show="hasItems" style="position: absolute">
                        <!--<ul>-->
                        <li v-for="(item, index) in items" :class="activeClass(index)" @click="click"
                            @mousemove="setActive(index)" class="li-position">
                            <div class="item">
                                <span class="name" v-text="item[code]+' / '+item[name]"></span>
                            </div>
                        </li>
                    </ul>
                </transition>
            </div>
        </el-form-item>
        <!--<el-form-item style="margin-right:0">-->
        <!--<el-input class="description" :placeholder="namePlaceholder" :size="size" :readonly="true"-->
        <!--v-model="selectedItem.name"></el-input>-->
        <!--</el-form-item>-->
    </el-form>
</template>

<script>
    export default {
        props: {
            itemData: {
                type: Array,
                required: true
            },
            codePlaceholder: {
                type: String
            },
            namePlaceholder: {
                type: String
            },
            size: {
                type: String
            },
            limit: {
                type: Number,
                default: 5
            },
            focusIndex: {
                type: String
            },
            tabindex: {
                type: String
            },
            code: {
                type: String,
                default: 'code'
            },
            name: {
                type: String,
                default: 'name'
            }
        },
        data () {
            return {
                items: [],
                minChars: 1,
                selectFirst: false,
                current: -1,
                queryString: '',
                selectedItem: {}
            }
        },
        computed: {
            hasItems(){
                return this.items.length > 0;
            },
            isEmpty(){
                return !this.queryString;
            },
            isDirty(){
                return !!this.queryString;
            }
        },
        methods: {
            update(){
                if (!this.queryString) return this.reset();
                if (this.minChars && this.queryString.length < this.minChars) return;
                this.searchItem();
                if (this.selectFirst) this.down();
            },
            searchItem(){
                this.items = [];
                for (let item of this.itemData) {
                    if (this.items.length > 5) break;
                    if(item[this.name]) {
                        if (item[this.code].indexOf(this.queryString) > -1 || item[this.name].indexOf(this.queryString) > -1) {
                            this.items.push(item);
                        }
                    }
                }
            },
            set(){
                if (this.items.length > 0 && this.current !== -1) {
                    this.queryString = this.items[this.current][this.code] + ' / ' + this.items[this.current][this.name];
                    this.selectedItem = this.items[this.current];
                    this.$emit('result', this.selectedItem);
                }
                this.items = [];
                this.current = -1;
            },
            reset(){
                this.items = [];
                this.queryString = '';
                this.selectedItem = [];
                this.$emit('result', this.selectedItem);
            },
            setActive(index){
                this.current = index;
            },
            activeClass(index){
                return {
                    active: this.current === index
                }
            },
            leave(){
                this.set();
                if(this.selectedItem[this.code]) {
                    var codeLength = this.selectedItem[this.code].length;
                    if (!this.selectedItem[this.code]) this.queryString = '';
                    else if (this.queryString !== this.selectedItem[this.code].substr(0, codeLength)) {
                        this.queryString = this.selectedItem[this.code] + ' / ' + this.selectedItem[this.name];
                    }
                }
                this.$emit('blur');
            },
            click(){
                this.$emit('click');
            },
            up(){
                if (this.current > 0) {
                    this.current--;
                }
                else if (this.current === -1) {
                    this.current = this.items.length - 1;
                } else {
                    this.current = -1;
                }
            },
            down(){
                if (this.current < this.items.length - 1) {
                    this.current++
                } else {
                    this.current = -1;
                }
            },
            focus(){
                this.$emit('focus');
            }
        }
    }
</script>


<style lang="scss" scoped>
    .code {
        width: 230px;
    }

    .description {
        width: 230px;
    }

    ul {
        position: relative;
        padding: 0;
        margin: 5px 0;
        height: 180px;
        background-color: #fff;
        list-style: none;
        overflow: auto;
        border-radius: 2px;
        border: 1px solid #d1dbe5;
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, .04), 0 2px 4px 0 rgba(0, 0, 0, .12);
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        z-index: 99999;
    }

    li {
        padding: 0 10px;
        font-size: 14px;
        white-space: nowrap;
        line-height: 28px;
        text-overflow: ellipsis;
        color: #48576a;
        cursor: pointer;

    .item {

    .name {
        font-size: 14px;
        padding-right: 5px;
    }

    .detail {
        font-size: 8px;
        color: #b4b4b4;
    }

    }
    }
    .active {
        background-color: #58B7FF;
    }

    .active span {
        color: white;
    }

    .list-enter-active, .list-leave-active {
        transition: height .3s ease;
    }

    .list-enter, .list-leave-active {
        height: 0;
    }
    .li-position {
        z-index:99999;
    }
    .el-form-item {
        margin-bottom: 0px;
    }
</style>