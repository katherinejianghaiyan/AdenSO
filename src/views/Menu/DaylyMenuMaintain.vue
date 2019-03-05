<template>
    <!--<el-tabs v-model="activeName" @tab-click="jsonChange">-->
    <div>
        <el-row>
            <el-col :span="24" class="toolbar">
                <el-button type="primary" size="small"><i class="fa fa-save" aria-hidden="true"></i> 保存菜单</el-button>
                <!--<el-radio-group v-model="radioType" size="small" style="float:right" @change="jsonChange">-->
                    <!--<el-radio-button label="Breakfast">&nbsp;&nbsp;早餐&nbsp;&nbsp;</el-radio-button>-->
                    <!--<el-radio-button label="Lunch">&nbsp;&nbsp;中餐&nbsp;&nbsp;</el-radio-button>-->
                    <!--<el-radio-button label="Dinner">&nbsp;&nbsp;晚餐&nbsp;&nbsp;</el-radio-button>-->
                <!--</el-radio-group>-->
                <el-tag type="info" style="margin-left: 250px">&nbsp;
                    <i class="fa fa-calendar-plus-o" aria-hidden="true"></i>&nbsp;&nbsp;2018-01-31&nbsp;</el-tag>
                <el-tag type="info" style="margin-left: 5px">&nbsp;星期三&nbsp;</el-tag>
                <el-button type="primary" size="small" @click="showPODialog"
                           style="margin-left: 5px"><i class="fa fa-cart-plus" aria-hidden="true"></i>&nbsp;&nbsp;采购清单</el-button>

            </el-col>
        </el-row>

        <el-collapse v-model="activeCollapse">
            <el-collapse-item v-for="(cb, index) in allCookBook" :name="cb.name">
                <template slot="title">
                    &nbsp;&nbsp;{{ cb.name_zh }}
                </template>
                <el-button type="success" size="small" @click="showDialog(cb.name)">
                    <i class="fa fa-plus" aria-hidden="true"></i> 增加菜
                </el-button>

                <div v-for="(type, index) in cb.cookBook">
                    <el-col :span="24" class="toolbar">
                        {{type.name}}
                    </el-col>
                    <el-col :span="screen == '1'? '4': '6' " v-for="(m, index) in type.meal">
                        <el-card :body-style="{ padding: '2px' }" style="width:164px;margin-bottom: 10px" class="card-background">
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
            </el-collapse-item>
        </el-collapse>

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
                        :default-sort="{prop:'type',order: 'descending'}"
                        size="mini">
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
            <el-row style="margin-bottom: 0px">
                <el-col :span="24" class="toolbar">
                    <el-button type="primary" size="small" @click="saveList"><i class="fa fa-save" aria-hidden="true"></i> 保存</el-button>
                    <el-button type="primary" size="small" style="margin-left: 2px" icon="plus"
                        @click="appendRow">追加原料</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-table
                        :data="materialList"
                        ref="multipleTable"
                        stripe
                        border
                        size="small">
                    <el-table-column label="原料代码" width="210" header-align="center">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.code" size="small"
                                       filterable placeholder="请选择原料" :disabled="scope.row.disabled"
                                       @change="materChange(scope.row)">
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
                            <el-row>
                                <el-col :span="11" v-if="scope.row.disabled">
                                    <number-input size="small" type="text" v-model="scope.row.weight"
                                                validType="decimal"
                                                disabled></number-input>
                                </el-col>
                                <el-col :span="scope.row.disabled ? 12: 24" :class="scope.row.disabled ? 'add-input' : ''">
                                    <number-input size="small" type="text" v-model="scope.row.weight2"
                                                validType="decimal"></number-input>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="加工影响（%）" header-align="center" prop="effect" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="11" v-if="scope.row.disabled">
                                    <number-input size="small" type="text" v-model="scope.row.effect"
                                                validType="decimal" disabled></number-input>
                                </el-col>
                                <el-col :span="scope.row.disabled ? 12: 24" :class="scope.row.disabled ? 'add-input' : ''">
                                    <number-input size="small" type="text" v-model="scope.row.effect2"
                                                validType="decimal"></number-input>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-dialog>

        <el-dialog title="采购清单"
                   :visible.sync="dialogPOVisibleLog"
                    size="small">
            <el-tabs type="border-card">
                <el-tab-pane>
                    <span slot="label"><i class="fa fa-address-card-o" aria-hidden="true"></i> 汇总</span>
                    <el-row style="margin-bottom: 5px;">
                            <el-select v-model="supplierCode" size="small"
                                       filterable placeholder="请选择供应商"
                                       @change="supplierChange"
                                        style="width:270px">
                                <el-option
                                        v-for="supplier in supplierData"
                                        :key="supplier.code"
                                        :label="supplier.code + ' / ' + supplier.name"
                                        :value="supplier.code">
                                    <span style="float: left">{{ supplier.code }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ supplier.name }}</span>
                                </el-option>
                            </el-select>
                            <el-button type="primary" size="small" style="margin-left: 2px" icon="plus"
                                       @click="addProduct">追加</el-button>
                            <el-button type="primary" size="small" style="margin-left: 2px">
                                <i class="fa fa-save" aria-hidden="true"></i> 提交</el-button>
                    </el-row>
                    <el-row>
                        <el-table
                                :data="productList"
                                ref="multipleTable"
                                stripe
                                border
                                :height="350"
                                style="width: 100%"
                                size="mini">
                            <el-table-column label="产品" width="200" header-align="center" prop="code" sortable>
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.code" size="small"
                                               filterable placeholder="请选择产品"
                                               @change="productChange(scope.row)"
                                               :disabled="scope.row.supplierCode != '' ? true: false ">
                                        <el-option
                                                v-for="pro in productFilterData"
                                                :key="pro.code"
                                                :label="pro.code + ' / ' + pro.name"
                                                :value="pro.code">
                                            <span style="float: left">{{ pro.code }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 13px">{{ pro.name }}</span>
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="订购数量/调整" width="145" header-align="center" prop="qty" sortable>
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col :span="11">
                                            <number-input size="small" type="text" v-model="scope.row.qty"
                                                          v-if="scope.row.supplierCode != ''"
                                                          validType="decimal" disabled></number-input>
                                        </el-col>
                                        <el-col :span="scope.row.supplierCode != '' ? 12: 24" :class="scope.row.supplierCode ? 'add-input' : ''">
                                            <number-input size="small" type="text" v-model="scope.row.adjQty"
                                                          validType="decimal"></number-input>
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="单位" width="55" header-align="center">
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ scope.row.unit }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="含税价" header-align="center" prop="price" sortable>
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ scope.row.price }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="总金额" header-align="center">
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ getTotalAmt(scope.row) }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label"><i class="fa fa-address-book-o" aria-hidden="true"></i> 按供应商</span>
                    <el-row style="margin-bottom: 5px">
                        <el-button type="primary" size="small" style="margin-left: 2px" icon="plus">追加</el-button>
                        <el-button type="primary" size="small" style="margin-left: 2px">
                            <i class="fa fa-save" aria-hidden="true"></i> 提交</el-button>
                    </el-row>
                    <el-row>
                        <el-table
                                :data="productListAll"
                                ref="multipleTable"
                                stripe
                                border
                                :height="350"
                                style="width: 100%"
                                size="mini">
                            <el-table-column label="供应商" width="200" header-align="center">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.supplierCode" size="small"
                                               filterable placeholder="请选择供应商">
                                        <el-option
                                                v-for="sp in supplierData"
                                                :key="sp.code"
                                                :label="sp.code + ' / ' + sp.name"
                                                :value="sp.code">
                                            <span style="float: left">{{ sp.code }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 13px">{{ sp.name }}</span>
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="产品" width="150" header-align="center" prop="code" sortable>
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.code" size="small"
                                               filterable placeholder="请选择产品"
                                               @change="productChange(scope.row)">
                                        <el-option
                                                v-for="pro in productData"
                                                :key="pro.code"
                                                :label="pro.code + ' / ' + pro.name"
                                                :value="pro.code">
                                            <span style="float: left">{{ pro.code }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 13px">{{ pro.name }}</span>
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!--productCascaderData-->
                            <!--<el-table-column label="产品" width="305" header-align="center">-->
                                <!--<template slot-scope="scope">-->
                                    <!--<el-cascader-->
                                            <!--:options="productCascaderData"-->
                                            <!--v-model="scope.row.bindCode"-->
                                            <!--style="width: 100%"-->
                                            <!--placeholder="请选择分类，也可输入关键词"-->
                                            <!--filterable-->
                                            <!--separator="/"-->
                                            <!--:value="code"-->
                                            <!--:label="name"-->
                                            <!--clearable-->
                                            <!--expand-trigger="hover"-->
                                            <!--size="small">-->
                                    <!--</el-cascader>-->
                                <!--</template>-->
                            <!--</el-table-column>-->
                            <el-table-column label="订购数量/调整" width="150" header-align="center" prop="qty" sortable>
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col :span="11">
                                            <number-input size="small" type="text" v-model="scope.row.qty"
                                                          v-if="scope.row.supplierCode != ''"
                                                          validType="decimal" disabled></number-input>
                                        </el-col>
                                        <el-col :span="scope.row.supplierCode != '' ? 12: 24" :class="scope.row.supplierCode ? 'add-input' : ''">
                                            <number-input size="small" type="text" v-model="scope.row.adjQty"
                                                          validType="decimal"></number-input>
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="单位" width="55" header-align="center">
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ scope.row.unit }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="含税价" header-align="center">
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ scope.row.price }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                            <el-table-column label="总金额" header-align="center">
                                <template slot-scope="scope">
                                    <el-row>
                                        <el-col class="item-text">
                                            {{ getTotalAmt(scope.row) }}
                                        </el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
    </div>
    <!--</el-tabs>-->


</template>

<script>
    import NumberInput from '../../components/NumberInput.vue';
    import cookBook from '../../../static/cookBook.json';
    import mealTypeOptions from '../../../static/mealTypeData.json';
    import mealData from '../../../static/mealData.json';
    import materialData from '../../../static/materialData.json';
    import materialList from '../../../static/materialList.json';
    import supplierData from '../../../static/supplierData.json';
    import productData from '../../../static/productData.json';
    import productCascaderData from  '../../../static/productCascaderData.json';

    import {
        isNullOrWhiteSpace,
        getRowFromArray
    } from '../../assets/js/common';
    import ElButton from "../../../node_modules/element-ui/packages/button/src/button";


    export default {
        components: {
            ElButton, 'numberInput': NumberInput,
        },
        data() {
            return {
                radioType: 'Breakfast',
                cookBook: [],
                allCookBook: cookBook,
                dialogTableVisibleLog: false,
                dialogMaterialVisibleLog: false,
                dialogPOVisibleLog: false,
                mealTypeOptions: mealTypeOptions,
                mealData: [],
                mealFilterData: [],
                materialData: materialData,
                materialList: materialList,
                supplierCode: '',
                supplierData: supplierData,
                productData: productData,
                productCascaderData: productCascaderData,
                productFilterData: [],
                productList: [],
                productListAll: [],
                selectMealType: "",
                keyWord: "",
                activeName: "monday",
                activeCollapse: "",
                price_low: "",
                price_high: "",
                cbName:"",
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
                var cookBookObj;

                for(var cbObj of this.allCookBook) {
                    if(cbObj.name == this.cbName) {
                        cookBookObj = cbObj;
                        break;
                    }
                }

                var mealObj = {
                    code: meal.code,
                    name: meal.name,
                    count: 1,
                    price: meal.price,
                    material: []
                }

                for(var cb of cookBookObj.cookBook) {
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

                cookBookObj.cookBook.push(cbObj);
            },
            searchMeal() {
                this.mealData = mealData;
                this.filter();
            },
            showDialog(cbName) {
                this.cbName = cbName;
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
            appendRow(){
                this.materialList.push({
                    "code": "",
                    "name1": "",
                    "name2": "",
                    "weight": 0,
                    "weight2": 0,
                    "effect": 0,
                    "effect2": 0,
                    "disabled": false
                });
            },
            materChange(row) {
                var obj = getRowFromArray(row.code, materialData, "code");
                row.name2 = obj.name2;
                row.weight = obj.weight;
                row.effect = obj.effect;
            },
            setMaterList() {
                this.materialList = [];

                for(var m of materialList) {
                    this.materialList.push({
                        code: m.code,
                        name1: m.name1,
                        name2: m.name2,
                        weight: m.weight,
                        weight2: m.weight2,
                        effect: m.effect,
                        effect2: m.effect2,
                        disabled: m.disabled
                    });
                }
            },
            saveList(){
                this.$message.success("原材料明细保存成功！");
            },
            supplierChange() {
                this.productFilter();
            },
            productFilter() {
                this.productFilterData = [];
                this.productList = [];
                this.productListAll = [];
                var aryCode = [];

                for(var p of this.productData) {
                    if(p.supplierCode == this.supplierCode) {
                        this.productFilterData.push(p);
                        this.productList.push(p);
                    }
                    aryCode = [];
                    aryCode.push(p.supplierCode);
                    aryCode.push(p.code);

                    this.productListAll.push({
                        supplierCode: p.supplierCode,
                        code: p.code,
                        name: p.name,
                        unit: p.unit,
                        qty: p.qty,
                        adjQty: p.adjQty,
                        totalQty: p.totalQty,
                        price: p.price,
                        totalAmt: p.totalAmt,
                        bindCode: aryCode
                    });
                }
            },
            addProduct() {
                this.productList.push({
                    supplierCode: "",
                    code: "",
                    name: "",
                    unit: "",
                    qty: "0",
                    adjQty: 0,
                    totalQty: "0",
                    price: "0",
                    totalAmt: 0
                });
            },
            productChange(row) {
                var prdCode = row.code;
                var prdObj = getRowFromArray(prdCode, this.productFilterData, "code");

                row.unit = prdObj.unit;
                row.price = prdObj.price;
            },
            showPODialog() {
                this.supplierCode = this.supplierData[0].code;
                this.productFilter();
                this.dialogPOVisibleLog = true;
            },
            getTotalAmt(row) {
                var totalAmt = ((isNaN(row.qty) ? 0: row.qty * 1) + (isNaN(row.adjQty) ? 0: row.adjQty * 1)) * (isNaN(row.price) ? 0: row.price * 1);
                return totalAmt;
            },
            getScreenSize() {
                this.screen = localStorage.getItem("screen");

                if(isNullOrWhiteSpace(this.screen))
                    this.screen = "1";
            }
        },
        mounted() {
            this.activeCollapse = this.allCookBook[0].name;
            this.jsonChange();
            this.setMaterList();
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
    .add-input {
        margin-left: 5px;
    }
    /*.el-input.is-disabled .el-input__inner {*/
        /*color: #949494;*/
    /*}*/

</style>