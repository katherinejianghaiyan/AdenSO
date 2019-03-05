<template>
    <div>
        <el-dialog title="直接采购清单"
                   :visible.sync="isShowDialog"
                   :close-on-click-modal="closeModal"
                   @close="closeDialog"
                   width="1300px"
                   top="30px">
            <transition>
                <div v-loading="loading"
                     element-loading-text="请稍后...">
                    <el-row>
                        <el-col :span="24" class="toolbar">
                            <el-form :inline="true">
                                <el-button type="primary"
                                           size="small"
                                           :disabled="disabled"
                                           @click="SaveMenuOrderPurchase"><i class="fa fa-save" aria-hidden="true"></i> 保存</el-button>
                                <el-tag type="info">
                                    营运点: {{ costCenterCode + " - " + costCenterName }}
                                </el-tag>
                                <el-tag type="info">
                                    日期: {{ orderDateWork + GetDateDesc(orderDateWork)}}
                                </el-tag>
                                <el-tag type="primary">
                                    总金额: {{ r_totalAmt }}
                                </el-tag>
                                <el-radio-group v-model="orderDateWork"
                                                style="float: right"
                                                @change="ChangeDate"
                                                size="small">
                                    <el-radio-button v-for="(dateObj, index) in weekData"
                                                     :label="dateObj.date"
                                                     :key="dateObj.date">
                                        {{dateObj.desc}}
                                    </el-radio-button>
                                </el-radio-group>
                            </el-form>
                        </el-col>
                        <el-col :span="24">
                            <el-tabs type="border-card" v-model="tabValue">
                                <el-tab-pane name="1">
                                    <span slot="label"><i class="fa fa-align-justify"></i> 菜单部分</span>
                                    <el-table :data="menulineData"
                                              ref="menuTable"
                                              v-if="tabValue == '1'"
                                              :cell-class-name="cellClassName"
                                              border
                                              :height="this.fullHeight<200?300:this.fullHeight-40">
                                        <el-table-column label="原料"
                                                         header-align="center"
                                                         :resizable="true"
                                                         width="300"
                                                         prop="itemCode"
                                                         sortable
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-text"
                                                      v-if="!CheckItem(scope.row.itemCode) ||
                                                            scope.row.requiredQty == scope.row.adjRequiredQty">
                                                    {{ scope.row.itemCode + ' / ' + scope.row.itemName }}
                                                </span>
                                                <el-badge is-dot
                                                          class="item"
                                                          v-else>
                                                    <span class="item-text">
                                                        {{ scope.row.itemCode + ' / ' + scope.row.itemName }}
                                                    </span>
                                                </el-badge>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="备注/说明"
                                                         header-align="center"
                                                         :resizable="true"
                                                         width="150"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.remark"
                                                          :disabled="isNullOrWhiteSpace(scope.row.itemCode)"
                                                          size="small"
                                                          style="width: 100%"
                                                          placeholder="请输入说明信息"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="供应商"
                                                         align="center"
                                                         :resizable="false"
                                                         width="320"
                                                         prop="supplierCode"
                                                         sortable
                                                         fixed
                                                         :filters="[{ text: '全部记录', value: '0' }, { text: '仅多个供应商', value: '1' }]"
                                                         :filter-method="filterSupplier">
                                            <template slot-scope="scope">
                                                <el-select v-model="scope.row.supplierCode"
                                                           size="small"
                                                           style="width: 100%"
                                                           placeholder="请选择供应商"
                                                           filterable
                                                           @change="ChangeSupplier(scope.row)">
                                                    <el-option
                                                            v-for="spObj in scope.row.suppliers"
                                                            :key="spObj.supplierCode"
                                                            :label="spObj.supplierCode + ' / ' + spObj.supplierName"
                                                            :value="spObj.supplierCode">
                                                        <span style="float: left">{{ spObj.supplierCode }}</span>
                                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ spObj.supplierName }}</span>
                                                    </el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="单价（元）"
                                                         header-align="center"
                                                         align="right"
                                                         :resizable="true"
                                                         width="100"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-number">
                                                    {{ GetPrice(scope.row) }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="计划数量"
                                                         header-align="center"
                                                         align="right"
                                                         :resizable="true"
                                                         width="100"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-number">
                                                    {{ scope.row.requiredQty }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="采购数量"
                                                         align="center"
                                                         :resizable="false"
                                                         width="100"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <el-input-number size="small"
                                                                 style="width: 100%"
                                                                 :min="0"
                                                                 :controls="false"
                                                                 v-model="scope.row.adjRequiredQty">
                                                </el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="单位"
                                                         align="center"
                                                         :resizable="false"
                                                         width="50"
                                                         fixed>
                                            <template slot-scope="scope">
                                                {{ scope.row.purchaseUnit }}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="金额（元）"
                                                         header-align="center"
                                                         align="right"
                                                         :resizable="false"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-number2">
                                                    {{ GetAmt(scope.row) }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                                <el-tab-pane name="2">
                                    <span slot="label"><i class="fa fa-cart-plus"></i> 直接采购</span>
                                    <el-table :data="orderlineData"
                                              v-if="tabValue == '2'"
                                              border
                                              stripe
                                              :height="this.fullHeight<200?300:this.fullHeight-40"
                                              @sort-change="sortChange">
                                        <el-table-column label="原料"
                                                         align="center"
                                                         :resizable="false"
                                                         prop="itemCode"
                                                         sortable="custom"
                                                         width="300"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <el-select v-model="scope.row.itemCode"
                                                           :disabled="!isNullOrWhiteSpace(scope.row.lineGuid)"
                                                           size="small"
                                                           style="width: 100%"
                                                           placeholder="请选择原料"
                                                           filterable
                                                           @change="SelectItem(scope.row, scope.$index)">
                                                    <el-option
                                                            v-for="item in !isNullOrWhiteSpace(scope.row.lineGuid)?scope.row.itemData: itemData"
                                                            :key="item.itemCode"
                                                            :label="item.itemCode + ' / ' + item.itemName_ZH"
                                                            :value="item.itemCode"
                                                            :disabled="item.disabled">
                                                        <span style="float: left">{{ item.itemCode }}</span>
                                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.itemName_ZH }}</span>
                                                    </el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="备注/说明"
                                                         align="center"
                                                         :resizable="false"
                                                         width="150"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.remark"
                                                          :disabled="isNullOrWhiteSpace(scope.row.itemCode)"
                                                          size="small"
                                                          style="width: 100%"
                                                          placeholder="请输入说明信息"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="供应商"
                                                         align="center"
                                                         :resizable="false"
                                                         fixed
                                                         width="300"
                                                         prop="supplierCode"
                                                         sortable="custom">
                                            <template slot-scope="scope">
                                                <el-select v-model="scope.row.supplierCode"
                                                           :disabled="isNullOrWhiteSpace(scope.row.itemCode)"
                                                           size="small"
                                                           style="width: 100%"
                                                           placeholder="请选择供应商"
                                                           filterable
                                                           @change="ChangeSupplier(scope.row)">
                                                    <el-option
                                                            v-for="spObj in scope.row.suppliers"
                                                            :key="spObj.supplierCode"
                                                            :label="spObj.supplierCode + ' / ' + spObj.supplierName"
                                                            :value="spObj.supplierCode">
                                                        <span style="float: left">{{ spObj.supplierCode }}</span>
                                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ spObj.supplierName }}</span>
                                                    </el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="单价（元）"
                                                         header-align="center"
                                                         align="right"
                                                         :resizable="false"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-number">
                                                    {{ GetPrice(scope.row) }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="采购数量"
                                                         align="center"
                                                         :resizable="false"
                                                         width="120"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <el-input-number size="small"
                                                                 :controls="false"
                                                                 style="width: 100%"
                                                                 :disabled="isNullOrWhiteSpace(scope.row.itemCode)"
                                                                 v-model="scope.row.requiredQty"></el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="单位"
                                                         align="center"
                                                         :resizable="false"
                                                         width="50"
                                                         fixed>
                                            <template slot-scope="scope">
                                                {{ scope.row.purchaseUnit }}
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="金额（元）"
                                                         header-align="center"
                                                         align="right"
                                                         :resizable="false"
                                                         fixed>
                                            <template slot-scope="scope">
                                                <span class="item-number">
                                                    {{ GetAmt(scope.row) }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" align="center" width="70" :resizable="false" fixed="right">
                                            <template slot-scope="scope">
                                                <el-button type="danger" size="small"
                                                           @click="DeleteItem(scope.$index)"
                                                           :disabled="!isNullOrWhiteSpace(scope.row.lineGuid) ||
                                                           scope.$index == orderlineData.length - 1">
                                                    删除
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                            </el-tabs>
                        </el-col>
                    </el-row>
                </div>
            </transition>
        </el-dialog>
    </div>
    </transition>
</template>
<script>
    /***Json结构引用***/
    import m_menuOrderHead from '../../static/menuOrder.json';
    import m_menuOrderLine from '../../static/bomObj.json';
    import m_purchaseOrderHead from '../../static/PurchaseOrder/purchaseOrderHead.json';
    import m_purchaseOrderLine from '../../static/PurchaseOrder/purchaseOrderLine.json';

    import {
        getRowFromArray,
        arraySearch,
        isNullOrWhiteSpace,
        deepCopy,
        float,
        createFilter
    } from '../assets/js/common';

    import {
        itemSource,
        SaveMenuOrderPurchase,
        GetMenuOrderPurchase
    } from '../api/api';


    export default{
        components: {
//            'number-input':NumberInput
        },
        props: [
            "showDialog",
            "orderDate",
            "dbCode",
            "costCenterCode",
            "costCenterName",
            "isWeekly",
            "checkItemString",
            "disabled"
        ],
        watch: {
            showDialog(val){
                this.isShowDialog = val;

                if(this.isShowDialog){
                    var reg = new RegExp( '/' , "g" )
                    this.orderDateWork = this.orderDate.replace( reg , '-' ) + "";

                    if(this.isWeekly)
                        this.SetWeekDate(new Date(this.orderDateWork));
                    else
                        this.BackuporderDateWork();
                    this.loading = true;
                    this.orderlineData = [];
                    this.GetItemSource(this.GetMenuOrderPurchase);
                    this.user = JSON.parse(sessionStorage.getItem('user'));
                }
            },
            isShowDialog(val){
                this.$emit("onShowDialog",val);
            }
        },
        computed: {
            // 总金额
            r_totalAmt: function() {
                var totalAmt = 0;
                var amt = 0;
//                var fieldName = "";
//                var workData = [];

//                if(this.tabValue == 1) {
//                    workData = this.menulineData;
//                    fieldName = "adjRequiredQty";
//                }
//                else if(this.tabValue == 2) {
//                    workData = this.orderlineData;
//                    fieldName = "requiredQty";
//                }

                for(var row of this.menulineData) {
                    amt = row.purchasePrice * (1 + row.purchaseTax) * row.adjRequiredQty;
                    amt = isNaN(amt)? 0: amt;
                    totalAmt = totalAmt + amt * 1;
                }
                for(var row of this.orderlineData) {
                    amt = row.purchasePrice * (1 + row.purchaseTax) * row.requiredQty;
                    amt = isNaN(amt)? 0: amt;
                    totalAmt = totalAmt + amt * 1;
                }
                return float(totalAmt, 6);
            }
        },
        data(){
            return {
                user: {},
                orderlineData: [],
                menulineData: [],
                itemDataAll: [],
                itemData: [],
                isShowDialog: this.showDialog,
                loading: false,
                closeModal: false,
                fullHeight: window.innerHeight-298,
                menuOrderHead: {},
                menuLines: [],
                purchaseLines: [],
                tabValue: "1",
                orderDateWork: "",
                orderDateWork_bak: "",
                weekData: [],
            }
        },
        created(){

        },
        methods: {
            closeDialog() {
                if(typeof($refs) != "undefined")
                    this.$refs.menuTable.clearFilter();
                this.$message.closeAll();
                this.CheckSave();

                // 检查是否有需要保存的资料
                if(this.menuLines.length != 0 || this.purchaseLines.length != 0) {
                    this.isShowDialog = true;
                    this.$confirm('有修改未保存，确认关闭吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$emit('closeDialog', this.orderDateWork);
                        this.isShowDialog = false;
                    });
                } else {
                    this.$emit('closeDialog', this.orderDateWork);
                }
            },
            // 保存直接采购清单
            SaveMenuOrderPurchase() {
                // 保存前的检查方法
                this.CheckSave();

                // 检查是否有需要保存的资料
                if(this.menuLines.length == 0 && this.purchaseLines.length == 0) {
                    this.$message.warning("没有需要保存的原料");
                    return;
                }
                var message = "确定保存吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    // 菜单部分
                    var menuObj = deepCopy(m_menuOrderHead);
                    // 直接采购部分
                    var purchaseObj = deepCopy(m_menuOrderHead);

                    if(this.menuLines.length > 0) {
                        menuObj.requiredDate = this.orderDateWork;
                        menuObj.costCenterCode = this.costCenterCode;
                        menuObj.createUser = this.user.account;
                        menuObj.lstMenuOrderLine = this.menuLines;
                    }
                    if(this.purchaseLines.length > 0) {
                        purchaseObj.requiredDate = this.orderDateWork;
                        purchaseObj.costCenterCode = this.costCenterCode;
                        purchaseObj.createUser = this.user.account;
                        purchaseObj.lstMenuOrderLine = this.purchaseLines;
                    }
                    // 参数设定
                    var param = {
                        menuPart: menuObj,
                        purchasePart: purchaseObj
                    }
                    SaveMenuOrderPurchase(param).then(data => {
                        if(data && data.code == "200") {
                            this.$message.success("保存成功");
                            this.GetMenuOrderPurchase("refresh");
                        } else {
                            this.$message.error("保存失败");
                            this.loading = false;
                        }
                    }).catch(()=>{
                    this.loading = false;
                    this.$message.error("保存失败");
                    });
                }).catch(()=>{
                    this.loading = false;
                });
            },
            // 保存前的检查方法
            CheckSave() {
                this.$message.closeAll();
                this.menuOrderHead = {};
                this.menuLines = [];
                this.purchaseLines = [];

                /***菜单部分Check***/
                for(var row of this.menulineData) {
                    // 判断修改(仅供应商和数量两项可修改)
                    if(row.adjRequiredQty != row.adjRequiredQty_bak ||
                       row.supplierCode != row.supplierCode_bak ||
                       row.remark != row.remark_bak) {
                        this.menuLines.push(row);
                        continue;
                    }
                }

                /***直接采购部分Check***/
                for(var row of this.orderlineData) {
                    // Item Code为空说明是空行，直接跳过
                    if(isNullOrWhiteSpace(row.itemCode))
                        continue;
                    // 判断新增
                    if(isNullOrWhiteSpace(row.lineGuid) && !isNullOrWhiteSpace(row.itemCode)) {
                        this.purchaseLines.push(row);
                        continue;
                    }
                    // 判断修改(仅供应商和数量两项可修改)
                    if(row.requiredQty != row.requiredQty_bak ||
                       row.supplierCode != row.supplierCode_bak ||
                       row.remark != row.remark_bak) {
                        this.purchaseLines.push(row);
                        continue;
                    }
                }
            },
            // 获取可选原料列表
            GetItemSource(cb) {
                // directBuy:true
                var JsonString = JSON.stringify({
                    dbName: this.dbCode,
                    requiredDate: this.orderDateWork,
                    costCenterCode: this.costCenterCode,
                    DynamicFieldsGUID: "400C974E-1A08-4824-BCFB-806B3FCDEFEB"
                })
                var param = {
                    "": JsonString
                }
                itemSource(param).then(data => {
                    if(data && data.code == "200") {
                        this.itemDataAll = data.content;
                        for(var itemObj of this.itemDataAll) {
                            itemObj.disabled = false;
                        }
                        cb();
                    } else {
                        this.loading = false;
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 取得采购订单数据
            GetMenuOrderPurchase(refresh) {
                this.orderlineData = [];

                var param = {
                    requiredDate: this.orderDateWork,
                    costCenterCode: this.costCenterCode
                }
                GetMenuOrderPurchase(param).then(data => {
                    if(data && data.code == "200") {
                        if(data.content.lstMenuPart != null) {
                            this.menulineData = data.content.lstMenuPart;

                            for(var line of this.menulineData) {
                                line.itemData = arraySearch(line.itemCode, this.itemDataAll, "itemCode");
                                if(typeof(line.itemData[0]) != "undefined")
                                    line.suppliers = line.itemData[0].suppliers;
                            }
                        }
                        if(data.content.lstPurchasePart != null) {
                            this.orderlineData = data.content.lstPurchasePart;

                            for(var line of this.orderlineData) {
                                    line.itemData = arraySearch(line.itemCode, this.itemDataAll, "itemCode");
                                if(typeof(line.itemData[0]) != "undefined")
                                    line.suppliers = line.itemData[0].suppliers;
                            }
                        }
                        if(isNullOrWhiteSpace(refresh)) {
                            this.ItemSourceFormat();
                            if(!isNullOrWhiteSpace(this.checkItemString))
                                this.$message.info({
                                    message: "请将带小红点的原料的【采购数量】调整成与【计划数量】一致",
                                    duration: 15000,
                                    showClose: true
                                });
                        }
                    } else {
                        this.menulineData = [];
                        this.orderlineData = [];
                    }
                    this.orderlineData.push(this.NewRow());
                    this.SetDisableItem();
                    this.loading = false;
                });
            },
            ItemSourceFormat() {
                var aryTemp = [];
                this.itemData = [];

                for(var i = 0; i < this.itemDataAll.length; i++) {
                    if(this.itemDataAll[i].directBuy) {
//                        this.itemData.push(this.itemDataAll[i]);
                        aryTemp  = arraySearch(this.itemDataAll[i].itemCode, this.menulineData, "itemCode");

                        if(aryTemp.length == 0)
                            this.itemData.push(this.itemDataAll[i]);
                    }
                }
            },
            // 将被选择过的Item在可寻列表中置灰
            SetDisableItem() {
                for(var itemObj of this.itemData) {
                    itemObj.disabled = false;

                    for(var line of this.orderlineData) {
                        if(itemObj.itemCode == line.itemCode) {
                            itemObj.disabled = true;
                            break;
                        }
                    }
                }
            },
            // New一个新行
            NewRow() {
                var row = deepCopy(m_menuOrderLine);
                row.requiredQty = "1";
                return row;
            },
            // 计算金额
            GetAmt(row) {
                var fieldName = "";

                if(this.tabValue == "1")
                    fieldName = "adjRequiredQty";
                else if(this.tabValue == "2")
                    fieldName = "requiredQty";

                var amt = row.purchasePrice * (1 + row.purchaseTax) * row[fieldName];
                var result = isNaN(amt)? 0: float(amt, 6);
                return result;
            },
            // 计算金额
            GetPrice(row) {
                var fieldName = "";
                var amt = row.purchasePrice * (1 + row.purchaseTax);
                var result = isNaN(amt)? 0: float(amt, 6);
                return result;
            },

            // 选择Item
            SelectItem(row, index) {
                var itemObj = getRowFromArray(row.itemCode, this.itemData, "itemCode");

                row.itemName = itemObj.itemName_ZH;
                row.itemType = itemObj.itemType;
                row.conversionUnit = itemObj.conversionUnit;
                row.conversionRate = itemObj.conversionRate;
                row.purchasePrice = itemObj.purchasePrice;
                row.purchaseUnit = itemObj.purchaseUnitcode;
                row.purchaseTax = itemObj.tax;
                row.supplierCode = itemObj.supplierCode;
                row.supplierName = itemObj.supplierName;
                row.suppliers = itemObj.suppliers;

                if(index == this.orderlineData.length - 1)
                    this.orderlineData.push(this.NewRow());
                // 设置不可选择的Item项
                this.SetDisableItem();
            },
            ChangeSupplier(row) {
                var supplierObj = getRowFromArray(row.supplierCode, row.suppliers, "supplierCode");
                var anotherTbl = this.tabValue == "1"? this.orderlineData: this.menulineData;
                var anotherName = this.tabValue == "1"? "【直接采购】": "【菜单部分】";
                var anotherRow = getRowFromArray(row.itemCode, anotherTbl, "itemCode");

                if(anotherRow != null) {
                    this.$confirm(anotherName + '部分的相同原料的供应商也将一起修改，继续吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        row.supplierName = supplierObj.supplierName;
                        row.purchasePrice = supplierObj.purchasePrice;
                        row.purchaseTax = supplierObj.tax;

                        anotherRow.supplierCode = row.supplierCode;
                        anotherRow.supplierName = supplierObj.supplierName;
                        anotherRow.purchasePrice = supplierObj.purchasePrice;
                        anotherRow.purchaseTax = supplierObj.tax;
                    }).catch(() => {
                        row.supplierCode = row.supplierCode_bak;
                        return;
                    });
                } else {
                    row.supplierName = supplierObj.supplierName;
                    row.purchasePrice = supplierObj.purchasePrice;
                    row.purchaseTax = supplierObj.tax;
                }


            },
            // 删除Item(仅限于还未保存的记录)
            DeleteItem(index) {
                this.orderlineData.splice(index, 1);
            },
            // 数量调整行背景色
            cellClassName({row, column, rowIndex, columnIndex}) {
                if(row.requiredQty != row.adjRequiredQty) {
                    return "adjColor";
                }
            },
            // 设置一周日期
            SetWeekDate(date) {
                this.weekData = [];

                date = this.getFirstDayOfWeek(date);

                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周一"
                });
                if(isNullOrWhiteSpace(this.orderDateWork))
                    this.orderDateWork = this.weekData[0].date;
                this.BackuporderDateWork();
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周二"
                });
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周三"
                });
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周四"
                });
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周五"
                });
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周六"
                });
                date.add("d",1);
                this.weekData.push({
                    date: date.format("yyyy-MM-dd"),
                    desc: "周日"
                });
            },
            // 取得日期所属周的第一天
            getFirstDayOfWeek (date) {
                var day = date.getDay() || 7;
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
            },
            // 备份日期
            BackuporderDateWork() {
                this.orderDateWork_bak = this.orderDateWork + "";
            },
            // 取得星期几
            GetDateDesc(date) {
                var dateObj;
                if(this.weekData.length == 0)
                    return "";
                if(this.isWeekly) {
                    dateObj = getRowFromArray(date, this.weekData, "date");
                    return " " + dateObj.desc;
                }
                return "";
            },
            // 日期变更
            ChangeDate() {
                // 检查是否有变更的记录
                this.CheckSave();

                // 检查是否有需要保存的资料
                if(this.menuLines.length != 0 || this.purchaseLines.length != 0) {
                    this.$confirm('切换日期将放弃当前的修改，继续吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.loading = true;
                        this.GetMenuOrderPurchase("refresh");
                    }).catch(() => {
                        this.orderDateWork = this.orderDateWork_bak + "";
                    });
                } else {
                    this.loading = true;
                    this.GetMenuOrderPurchase("refresh");
                }
            },
            CheckItem(itemCode) {
                if(isNullOrWhiteSpace(this.checkItemString))
                    return false;
                return this.checkItemString.indexOf(itemCode) > -1;
            },
            filterSupplier(value, row) {
                if(value == "1" && row.suppliers.length <= 1)
                    return false;
                return true;
            },
            // 排序监听
            sortChange(col) {
                if(this.orderlineData.length == 0)
                    return;
                this.orderlineData = this.sortData(this.orderlineData,col.column);
            },
            sortData(d,col) {
                if(d.length == 0 ) return d;

                return d.sort(function(row1,row2) {
                    var x = 1;
                    if(col.order == "descending")
                        x = -1;
                    if(isNullOrWhiteSpace(row1[col.property]))
                        return 1;
                    if(isNullOrWhiteSpace(row2[col.property]))
                        return -1;
                    else {
                        if (row1[col.property] > row2[col.property])
                            return x;
                        if (row1[col.property] == row2[col.property])
                            return 1;
                    }
                    return -1*x;
                })
            },
            // 检查字符串是否为空
            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            },
        }
    }
</script>

<style>
    @import '../assets/css/common.css';

    .el-table td, .el-table th {
        padding-top: 3px ;
        padding-bottom: 3px;
    }
    .my-autocomplete li {
        line-height: normal;
        padding: 7px;
    }
    .my-autocomplete li .name {
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .my-autocomplete li .code {
        font-size: 13px;
        color: #b4b4b4;
    }
    .my-autocomplete li .highlighted .addr {
        color: #ddd;
    }
    .item-text {
        padding-left: 6px;
        font-size: 13px;
        width:100%;
        display:block;/*内联对象需加*/
        word-break:keep-all;/* 不换行 */
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .item-number {
        padding-right: 6px;
        font-size: 13px;
        width:93%;
        display:block;/*内联对象需加*/
        word-break:keep-all;/* 不换行 */
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .item-number2 {
        padding-right: 6px;
        font-size: 13px;
        width:83%;
        display:block;/*内联对象需加*/
        word-break:keep-all;/* 不换行 */
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .adjColor {
        background: #ffdcd8;
    }
    .item {
        margin-top: 5px;
        margin-right: 40px;
    }
</style>
