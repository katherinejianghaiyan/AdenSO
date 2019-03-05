<template>
    <el-tabs v-model="activeName" @tab-click="jsonChange">
        <el-row>
            <el-button type="primary" size="small"><i class="fa fa-save" aria-hidden="true"></i> 保存菜单</el-button>
            <el-button type="success" size="small" @click="showDialog"><i class="fa fa-plus" aria-hidden="true"></i> 增加菜</el-button>
            <el-radio-group v-model="radioType" size="small" style="float:right" @change="jsonChange">
                <el-radio-button label="Breakfast">&nbsp;&nbsp;早餐&nbsp;&nbsp;</el-radio-button>
                <el-radio-button label="Lunch">&nbsp;&nbsp;中餐&nbsp;&nbsp;</el-radio-button>
                <el-radio-button label="Dinner">&nbsp;&nbsp;晚餐&nbsp;&nbsp;</el-radio-button>
            </el-radio-group>
        </el-row>

        <div v-for="(type, index) in cookBook">
            <el-col :span="24" class="toolbar">
                {{type.name}}
            </el-col>
            <el-col :span="screen == '1'? '4': '6' " v-for="(m, index) in type.meal">
                <el-card :body-style="{ padding: '2px' }" style="width:170px;margin-bottom: 10px" class="card-background">
                    <div style="padding: 5px;" >
                        <span style="font-size: 14px;margin-top:10px;color: #636363">{{m.name}}</span>
                        <div style="float:right;margin-top:15px">
                            <!--下划线输入框-->
                            <input type="text" name="name" size="12"
                                   style="border-color: #b6b6b6;border-style: solid;border-top-width: 0px;
                                          border-right-width: 0px;border-bottom-width: 1px;border-left-width: 0px;
                                          width:40px;background-color: transparent;text-align: center" v-model="m.count"/> 份
                        </div>
                        <div class="bottom clearfix">
                            <time class="time" style="cursor:pointer" @click="add(m.name)">PC: {{m.price}}元<br>原材料</time>
                            <el-button type="danger" class="button" @click="deleteMeal(type.meal, index)"><i class="el-icon-minus"></i></el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </div>
        <el-tab-pane name="monday">
            <template slot="label">
                <p class="tab-line1">2018/02/05</p>
                <p class="tab-line2">星期一</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="tuesday">
            <template slot="label">
                <p class="tab-line1">2018/02/06</p>
                <p class="tab-line2">星期二</p>
                <p class="tab-line2"></p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="wednesday">
            <template slot="label">
                <p class="tab-line1">2018/02/07</p>
                <p class="tab-line2">星期三</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="thursday">
            <template slot="label">
                <p class="tab-line1">2018/02/08</p>
                <p class="tab-line2">星期四</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="friday">
            <template slot="label">
                <p class="tab-line1">2018/02/09</p>
                <p class="tab-line2">星期五</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="saturday">
            <template slot="label">
                <p class="tab-line1">2018/02/10</p>
                <p class="tab-line2">星期六</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>
        <el-tab-pane name="sunday">
            <template slot="label">
                <p class="tab-line1">2018/02/11</p>
                <p class="tab-line2">星期日</p>
                <p class="tab-line3">&nbsp;</p>
            </template>
        </el-tab-pane>

        <el-dialog title="请选择要追加的菜"
                   :visible.sync="dialogTableVisibleLog">
            <el-row style="margin-bottom: 10px">
                <el-col :span="24" class="toolbar" style="margin-bottom: 0px">
                    <el-cascader
                            :options="mealTypeOptions"
                            v-model="selectMealType"
                            style="width:300px"
                            placeholder="请选择分类，也可输入关键词"
                            filterable
                            separator="/"
                            clearable
                            change-on-select
                            size="small">
                    </el-cascader>
                    <el-input size="small"
                              placeholder="关键词搜索"
                              clearable
                              v-model="keyWord"
                              style="width:129px">
                    </el-input>
                    <el-input size="small"
                        placeholder="¥"
                        v-model="price_low"
                        style="width:45px;margin-left:5px">
                    </el-input>
                     -
                    <el-input size="small"
                        placeholder="¥"
                        v-model="price_high"
                        style="width:45px">
                    </el-input>
                    <el-button type="primary" size="small" icon="search" @click="searchMeal" style="margin-left:5px">搜索</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-table
                        :data="mealFilterData"
                        ref="multipleTable"
                        stripe
                        border
                        :height="280"
                        size="mini"
                        :default-sort="{prop:'type',order: 'descending'}">
                    <el-table-column label="#" align="center" width="40" :resizable="false" fixed>
                        <template slot-scope="scope">
                            <el-checkbox v-model="scope.row.select">
                            </el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label="类别" width="150" header-align="center" prop="type" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="24" class="item-text">
                                    <span>{{formatType(scope.row.type)}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="菜名" width="200" header-align="center" prop="name" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="24" class="item-text">
                                    <span>{{scope.row.name}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="价格" header-align="center" prop="price" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="24" class="item-text">
                                    <span>{{scope.row.price + '元'}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogTableVisibleLog = false">取 消</el-button>
                <el-button type="primary" :disabled="r_addButton" @click="closeDialog">添 加</el-button>
            </div>
        </el-dialog>

        <el-dialog title="原材料明细"
                   :visible.sync="dialogMaterialVisibleLog"
                   size="small">
            <el-row>
                <el-table
                        :data="materialList"
                        ref="multipleTable"
                        stripe
                        border
                        size="mini">
                    <el-table-column label="原料代码" width="210" header-align="center">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.code" size="small"
                                       filterable placeholder="请选择原料" :disabled="scope.row.disabled">
                                <el-option
                                        v-for="mater in materialData"
                                        :key="mater.code"
                                        :label="mater.code + ' / ' + mater.name1"
                                        :value="mater.code">
                                    <span style="float: left">{{ mater.code }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ mater.name1 }}</span>
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="菜谱成分" width="150" header-align="center" prop="name2" sortable>
                        <template slot-scope="scope">
                            <el-input :span="24"
                                      size="small"
                                      v-model="scope.row.name2" :disabled="scope.row.disabled"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="原料生重（克）" header-align="center" prop="weight" sortable>
                        <template slot-scope="scope">
                            <number-input size="small" type="text" v-model="scope.row.weight"
                                          validType="decimal"
                                          :disabled="scope.row.disabled"></number-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="加工影响（%）" header-align="center" prop="effect" sortable>
                        <template slot-scope="scope">
                            <number-input size="small" type="text" v-model="scope.row.effect"
                                          validType="decimal" :disabled="scope.row.disabled"></number-input>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-dialog>
    </el-tabs>
</template>

<script>
    import NumberInput from '../../components/NumberInput.vue';
    import cookBook from '../../../static/cookBook.json';
    import mealTypeOptions from '../../../static/mealTypeData.json';
    import mealData from '../../../static/mealData.json';
    import materialData from '../../../static/materialData.json';
    import materialList from '../../../static/materialList.json';

    import {
        isNullOrWhiteSpace
    } from '../../assets/js/common';

    export default {
        components: {
            'numberInput': NumberInput
        },
        data() {
            return {
                radioType: 'Breakfast',
                cookBook: [],
                allCookBook: cookBook,
                dialogTableVisibleLog: false,
                dialogMaterialVisibleLog: false,
                mealTypeOptions: mealTypeOptions,
                mealData: [],
                mealFilterData: [],
                materialData: materialData,
                materialList: materialList,
                selectMealType: "",
                keyWord: "",
                activeName: "monday",
                price_low: "",
                price_high: "",
                screen: "1",
            }
        },
        computed: {
            r_addButton: function() {
                if(this.mealFilterData.length == 0) {
                    return true;
                } else {
                    for(var meal of this.mealFilterData) {
                        if(meal.select) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        },
        methods: {
            add(name) {
                this.dialogMaterialVisibleLog = true;
            },
            closeDialog() {
                this.appendMeal();
                this.selectMealType = [];
                this.mealFilterData = [];
                this.mealData = [];
                this.dialogTableVisibleLog = false;
            },
            // 添加选择的菜
            appendMeal() {
                var arySelect = new Array();

                for(var meal of this.mealFilterData) {
                    if(!meal.select)
                        continue;

                    this.appendMealPlus(meal);
                }
            },
            appendMealPlus(meal) {
                var mealObj = {
                    code: meal.code,
                    name: meal.name,
                    count: 1,
                    price: meal.price,
                    material: []
                }

                for(var cb of this.cookBook) {
                    if(cb.code == meal.type) {
                        cb.meal.push(mealObj);
                        return;
                    }
                }
                var aryMealObj = new Array();
                aryMealObj.push(mealObj);

                var cbObj = {
                    code: meal.type,
                    name: this.formatType(meal.type),
                    meal: aryMealObj
                }

                this.cookBook.push(cbObj);
            },
            searchMeal() {
                this.mealData = mealData;
                this.filter();
            },
            showDialog() {
                this.price_low = "";
                this.price_high = "";
                this.mealData = [];
                this.mealFilterData = [];
                this.dialogTableVisibleLog = true;
            },
            filter() {
                this.mealFilterData = [];

                // 类型字符串拼接
                var type = "";

                if(this.selectMealType.length < 2) {
                    type = this.selectMealType[0];
                } else {
                    type = this.selectMealType[0] + "," + this.selectMealType[1];
                }
                for(var meal of this.mealData) {
                    if(isNullOrWhiteSpace(type) || meal.type.indexOf(type) > -1) {
                        if(isNullOrWhiteSpace(this.keyWord)) {
                            this.mealFilterData.push({
                                select: false,
                                code: meal.code,
                                type: meal.type,
                                name: meal.name,
                                price: meal.price
                            });
                        } else {
                            if(meal.name.indexOf(this.keyWord) > -1) {
                                this.mealFilterData.push({
                                    select: false,
                                    code: meal.code,
                                    type: meal.type,
                                    name: meal.name,
                                    price: meal.price
                                });
                            }
                        }
                    }
                }
            },
            // 格式化类型（code->name）
            formatType(type) {
                var aryType = type.split(",");
                var strResult = "";
                var strTypeName = "";

                for(type of aryType) {
                    strTypeName = this.getTypeName(type, this.mealTypeOptions);
                    if(isNullOrWhiteSpace(strResult))
                        strResult = strTypeName;
                    else
                        strResult = strResult + " / " + strTypeName;
                }
                return strResult
            },
            // 根据Type代码取得Type名称
            getTypeName(code, typeData) {
                var result = "";
                for(var type of typeData) {
                    if(type.value == code) {
                        result = type.label;
                        break;
                    }
                    if(typeof(type.children) != "undefined") {
                        result = this.getTypeName(code, type.children);
                        if(!isNullOrWhiteSpace(result)) {
                            break;
                        }
                    }
                }
                return result;
            },
            // 删除菜谱
            deleteMeal(meal, index) {
                meal.splice(index, 1);
            },
            // 早中晚餐选择
            jsonChange() {
                var jsonName = this.radioType + "_" + this.activeName;

                if(this.allCookBook.length == 0)
                    return;

                for(var row of this.allCookBook) {
                    if(row.name == jsonName) {
                        this.cookBook = row.cookBook;
                        return;
                    }
                }

                var jsonObj = {
                    name: jsonName,
                    cookBook: []
                }

                this.allCookBook.push(jsonObj);
                this.cookBook = jsonObj.cookBook;
            },
            getScreenSize() {
                this.screen = localStorage.getItem("screen");

                if(isNullOrWhiteSpace(this.screen))
                    this.screen = "1";
            }
        },
        mounted() {
            this.jsonChange();
            this.getScreenSize();
        }
    }
</script>
<style>
    @import '../../assets/css/common.css';
    .time {
        font-size: 11px;
        color: #999;
    }
    .bottom {
        margin-top: 13px;
        line-height: 12px;
    }
    .button {
        padding: 0px;
        float: right;
    }
    .image {
        width: 200px;
        height: 80px;
        display: block;
    }
    .icon {
        font-size: 40px;
        font-weight: bold;
        color: #c8c8c8;
        line-height: 147px;
        height: 147px;
    }
    .number {

    }
    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .card-background {
        background-image: linear-gradient( 135deg, #eaffeb 10%, #adfcea 100%);
        /*background-image: linear-gradient( 135deg, #f0eeee 10%, #c6c6c9 100%);*/
    }
    .item-text {
        padding-left: 6px;
    }
    .tab-line1 {
        line-height:10px
    }
    .tab-line2 {
        line-height:10px;
        text-align: center;
        font-size:13px;
    }
    .tab-line3 {
        line-height:0px;
        font-size: 0px;
    }
</style>