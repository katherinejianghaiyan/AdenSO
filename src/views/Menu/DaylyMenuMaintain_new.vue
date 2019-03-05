<template>
    <div v-loading="loading"
         element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <template>
                    <el-cascader
                            :options="ccWhsOption"
                            v-model="selectCCWhs"
                            style="width:330px"
                            placeholder="请选择成本中心，也可输入关键词"
                            filterable
                            separator="/"
                            expand-trigger="hover"
                            size="small"
                            :props="ccWhsProps"
                            @change="CreateEdit">
                    </el-cascader>
                </template>
                <el-button type="primary"
                           size="small"
                           :disabled="menuData.length == 0 || r_disabled"
                           @click="SaveMenuOrder"><i class="fa fa-save" aria-hidden="true"></i> 保存</el-button>
                <el-button type="danger"
                           size="small"
                           :disabled="menuData.length == 0 || r_disabled"
                           style="margin-left: 0px"
                           @click="CancelEdit"><i class="fa fa-refresh" aria-hidden="true"></i> 取消</el-button>
                <el-dropdown trigger="click" style="margin-left: 0px">
                    <el-button type="warning" size="small" :disabled="menuData.length == 0">
                        <i class="fa fa-gear" aria-hidden="true"></i> 操作
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="DailyPO">打印采购单</el-dropdown-item>
                        <el-dropdown-item @click.native="DailyMenu">打印日单</el-dropdown-item>
                        <el-dropdown-item @click.native="showDialogPurchaseOrder" :disabled="r_disabled">修改供应商</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-select v-model="nextWorkingDay"
                           size="small"
                           placeholder="请选择日期"
                           v-if="workingDays.length > 0"
                           style="margin-left: 5px;width:170px"
                           @change="ChangeDate">
                    <el-option
                            v-for="dayObj in workingDays"
                            :key="dayObj.date"
                            :label="dayObj.date + '  ' + dayObj.weekDay"
                            :value="dayObj.date"
                            style="width: 157px">
                        <span style="float: left">{{ dayObj.date }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ dayObj.weekDay }}</span>
                    </el-option>
                </el-select>
                <el-checkbox v-model="otherCost"
                             label="含调味品成本"
                             border size="small"
                             style="margin-left:0px"></el-checkbox>
                <el-tag :type="r_disabled ? 'danger': 'success'"
                        style="float:right"
                        v-if="selectCCWhs.length > 0">
                    {{ r_disabled ? ('截止时间：' + formatDate(expiryTime, 'yyyy-MM-dd hh:mm:ss')):
                        expiryTime == null || nowTime == null ? "": "离截止时间还剩：" + formatSeconds(lessTime / 1000) }}
                </el-tag>
            </el-col>
        </el-row>
        <div :class="r_disabled? 'table-area': ''">
            <div :class="r_disabled? 'disabled-area': ''"></div>
            <el-table
                    :data="menuDataFomat"
                    :span-method="objectSpanMethod"
                    border
                    :height="this.fullHeight<300?300:this.fullHeight"
                    :cell-class-name="cellClassName"
                    style="width: 100%">
                <el-table-column
                        align="center"
                        label="餐次"
                        width="60">
                    <template slot-scope="scope">
                        {{ scope.row.mealType }}
                    </template>
                </el-table-column>
                <el-table-column
                        prop="menuType"
                        align="center"
                        label="类别"
                        width="88">
                    <template slot-scope="scope">
                        {{ scope.row.menuType }}
                    </template>
                </el-table-column>

                <el-table-column v-for="(col, index) in colData" :key="col">
                    <template slot-scope="scope">
                        <el-card :body-style="{ padding: '5px' }"
                                 :style="{'border-left-color': isNullOrWhiteSpace(scope.row[col + '_itemColor'])? '': scope.row[col + '_itemColor']}"
                                 :class="BGColor(scope.row, col)"
                                 v-if="!scope.row.isTool && !isNullOrWhiteSpace(scope.row[col + '_itemName'])">
                            <div class="adjArea"
                                 v-if="!isNullOrWhiteSpace(scope.row[col + '_hasAdj']) &&
                                       !r_disabled"
                                 @click="GoPurchaseNewItemDialog(scope.row[col + '_itemBOM'])"></div>
                            <div class="touchArea"
                                 v-if="scope.row[col + '_itemType'] == 'FG' &&
                                       isNullOrWhiteSpace(scope.row[col + '_hasAdj']) &&
                                       !r_disabled"
                                 @click="showDialogRM(scope.row.origIndex, col)"></div>
                            <el-row style="line-height:15px">
                                <el-col :span="20">
                                    <span :class="cardItemName(scope.row, col)">{{scope.row[col + '_itemName']}}</span>
                                    <span class="new-item"
                                          v-if="isNullOrWhiteSpace(scope.row[col + '_headGuid'])">new!</span>
                                </el-col>
                                <el-col :span="4">
                                    <el-button type="danger"
                                               class="button card-del"
                                               v-if="isNullOrWhiteSpace(scope.row[col + '_hasAdj'])"
                                               @click="deleteItem(scope.row.origIndex, col)">
                                        <i :class="scope.row[col + '_deleteFlag'] == '1' ? 'fa fa-undo': 'el-icon-minus'"></i></el-button>
                                    <span class="card-lock"
                                          v-else>
                                        <i class="fa fa-lock"></i>
                                    </span>
                                </el-col>
                            </el-row>
                            <div style="float:right;margin-top:5px">
                                <!--下划线输入框-->
                                <input type="text" name="name" size="12"
                                       v-model="scope.row[col + '_itemQty']"
                                       @input="handleInput(scope.row, col)"
                                       @blur="UpdateQty(scope.row, col, scope.$index)"
                                       class="card-input"/>
                                <span class="itemUnitCode">{{ scope.row[col + '_itemUnitCode'] }}</span>
                            </div>
                            <div class="bottom clearfix">
                                <time class="time">PC: {{ CostDisp(scope.row, col) }}元</time>
                            </div>
                        </el-card>
                        <div v-if="scope.row.isTool && col == '1'">
                            <el-button type="primary"
                                       size="mini"
                                       class="tool_button"
                                       plain
                                       @click="showDialog(scope.row.soItemGuid, scope.row.mealType, col)">
                                <i class="el-icon-plus" aria-hidden="true"> 加菜</i>
                            </el-button>
                            <el-tag size="small"
                                    class="tool_tag"
                                    type="info">{{"【" + scope.row.mealType + "】" + "成本合计: "}}{{scope.row.isTool ? totalAmtByType(scope.row.mealType): ""}} 元
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 菜选择共用画面 -->
        <NewDish :ShowSearchItemsDialog="ShowSearchItemsDialog"
                 :DBName="dialogParam.dbName"
                 :RequiredDate="dialogParam.requiredDate"
                 :RequiredQty="dialogParam.requiredQty"
                 :costCenterCode="dialogParam.costCenterCode"
                 :Items="selItems"
                 :MealName="dialogParam.mealName"
                 @onShowSearchItemsDialog = "onShowSearchItemsDialog"
                 @getItemsData="closeDialog">
        </NewDish>
        <NewRM :ShowRMItemDialog="ShowRMItemDialog"
               :DBName="dialogParam.dbName"
               :RequiredDate="dialogParam.requiredDate"
               :RequiredQty="dialogParam.requiredQty"
               :costCenterCode="dialogParam.costCenterCode"
               :itemBOM="dialogParam.itemBOM"
               :itemName_ZH="dialogParam.itemName"
               @onShowRMItemDialog="onShowRMItemDialog"
               @getItemsData="closeDialogRM">
        </NewRM>
        <PurchaseNewItemDialog
                :showDialog="ShowPurchaseNewItemDialog"
                :orderDate="nextWorkingDay"
                :dbCode="dialogParam.dbName"
                :costCenterCode="dialogParam.costCenterCode"
                :costCenterName="dialogParam.costCenterName"
                :checkItemString="dialogParam.checkItemString"
                :isWeekly="false"
                @onShowDialog="onShowPurchaseNewItemDialog"
                @closeDialog="closePurchaseNewItemDialog">
        </PurchaseNewItemDialog>
    </div>
</template>

<script>
    var user = JSON.parse(sessionStorage.getItem('user'));
    import {
        isNullOrWhiteSpace,
        getRowFromArray,
        chGMT,
        formatMoney,
        arrayToString,
        deepCopy,
        getRequiredQty,
        float,
        formatSeconds
    } from '../../assets/js/common';

    import {
        GetCCWhs,
        GetMealTypeList,
        SaveMenuOrder,
        GetMenuOrder,
        GetConfig,
        GetToNextWorkingDay,
        showPDF
    } from '../../api/api'

    /***Object Json模板***/
    import bomModel from '../../../static/bomObj.json';
    import menuModel from '../../../static/menuDalyObj.json';
    import menuOrderModel from '../../../static/menuOrder.json';
    /***Common View Import***/
    import ShowSearchItemsDialog from '../../components/ItemsSearchDialog.vue';
    import ShowRMItemDialog from '../../components/RMItemDialog.vue';
    import ChangeSupplierDialog from '../../components/ChangeSupplierofItem.vue';
    import PurchaseNewItemDialog from '../../components/PurchaseNewItem.vue';

    export default {
        data() {
            return {
                otherCost: false,
                lessTime: 0,
                sDate: "",
                loading:false,
                isLocal: false,
                user: "",
                menuData: [],
                ccWhs: [],
                lastColumn1Var: '',
                lastColumn2Var: '',
                fullHeight: window.innerHeight-192,
                menuDataFomat: [],
                mealTypeData: [],
                ShowSearchItemsDialog: false,
                ShowRMItemDialog: false,
                ShowChangeSupplierDialog: false,
                ShowPurchaseNewItemDialog: false,
                selectCCWhs: [],
                props: {
                    value: "value",
                    children: "children"
                },
                ccWhsProps: {
                    children: "lstCCWindows"
                },
                colData: ["1", "2", "3", "4", "5", "6", "7"],
                weekDay: {
                    "1": "星期一",
                    "2": "星期二",
                    "3": "星期三",
                    "4": "星期四",
                    "5": "星期五",
                    "6": "星期六",
                    "7": "星期七",
                },
                bgColorList: [{
                    className: "bg-1",
                    flag: false
                }, {
                    className: "bg-2",
                    flag: false
                }, {
                    className: "bg-3",
                    flag: false
                }, {
                    className: "bg-4",
                    flag: false
                }, {
                    className: "bg-5",
                    flag: false
                }],
                bgColorFlag: false,
                selSoItemGuid: "",
                selMealType: "",
                selWindowGuid: "",
                selCol: "",
                selIndex: -1,
                ccWhsOption: [],
                ccWhsObj: "",
                weekDateOption:[],
                thisMonday: "",
                selItems: [],
                menuOrderHead: [],
                dialogParam: {
                    dbName: "",
                    requiredDate: "",
                    requiredQty: "",
                    supplierCodes: "",
                    costCenterCode: "",
                    costCenterName: "",
                    itemBOM: "",
                    diologType: "",
                    mealName: "",
                    itemName: "",
                    checkItemString: "",
                },
                tempDate: "",
                workingDays: [],
                nextWorkingDay: "",
                nextWorkingDayDesc: "",
                nextWorkingDay_back: "",
                expiryTime: null,
                nowTime: null
            };
        },
        computed: {
            r_disabled: function() {
                if(this.expiryTime == null || this.nowTime == null)
                    return false;
                var date = new Date(this.sDate + " " + this.nowTime.format('hh:mm:ss'));
                date.add("d", 1);
                var nowTime = date.getTime();
                var result = nowTime >= this.expiryTime.getTime();
                this.lessTime = this.expiryTime.getTime() - nowTime;
                return result;
            }
        },
        components: {
            'NewDish': ShowSearchItemsDialog,
            'NewRM': ShowRMItemDialog,
            'ChangeSupplier': ChangeSupplierDialog,
            'PurchaseNewItemDialog': PurchaseNewItemDialog
        },
        methods: {
            //打印采购单
            DailyPO(){
                this.CheckHasChange();

                if(this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                //var windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");
                showPDF('POForm',{
                    RequiredDate: this.nextWorkingDay.substring(0,10),
                    CostCenter:ccObj.costCenterCode,
                });
            },

            //打印日单
            DailyMenu(){
                this.CheckHasChange();

                if(this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }
                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                //var windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");
                showPDF('DailyMenu',{
                    startDate: this.nextWorkingDay.substring(0,10),
                    CostCenter:ccObj.costCenterCode,
                });
            },
            // 取得登录者信息
            getUserInfo() {
                var userInfo = sessionStorage.getItem('user');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                    this.user = userInfo;
                }
            },
            onShowSearchItemsDialog(val){
                this.ShowSearchItemsDialog = val;
            },
            onShowRMItemDialog(val){
                this.ShowRMItemDialog = val;
            },
            onShowPurchaseNewItemDialog(val) {
                this.ShowPurchaseNewItemDialog = val;
            },
            isNullOrWhiteSpace(string){
                return isNullOrWhiteSpace(string);
            },
            objectSpanMethod({ row, column, rowIndex, columnIndex }) {
                // 第一列合并
                var rowspan = 0;
                if (columnIndex === 0) {
                    rowspan = this.menuDataFomat[rowIndex].rowspan1;
                    if (rowspan > 0) {
                        return {
                            rowspan: rowspan,
                            colspan: 1
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 0
                        };
                    }
                }
                // 第二列合并
                rowspan = 0;
                if (columnIndex === 1) {
                    rowspan = this.menuDataFomat[rowIndex].rowspan2;
                    if (rowspan > 0) {
                        return {
                            rowspan: rowspan,
                            colspan: 1
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 0
                        };
                    }
                }
                if (columnIndex === 2) {
                    if(this.menuDataFomat[rowIndex].isTool) {
                        return {
                            rowspan: 1,
                            colspan: 7
                        };
                    }
                }
            },
            // 检查首列的合并状况
            checkFirstColumn(rowIndex, fieldName) {
                if(rowIndex == 0)
                    this.lastColumn1Var = "";

                var val = this.menuData[rowIndex][fieldName];

                if(val == this.lastColumn1Var)
                    return 0;
                else
                    this.lastColumn1Var = val;

                for(var i=this.menuData.length - 1; i>=0; i--) {
                    if(this.menuData[i][fieldName] == val) {
                        return i - rowIndex + 1;
                    }
                }
            },
            // 检查第二列的合并状况
            checkSecondColumn(rowIndex, parentFieldName, childFieldName) {
                // 要循环两边，所以加上此判断（原因未知）
                if(rowIndex == 0)
                    this.lastColumn2Var = "";
                // 父列的值
                var valParent = this.menuData[rowIndex][parentFieldName];
                // 当前列的值
                var valChild = this.menuData[rowIndex][childFieldName];

                if(valChild == this.lastColumn2Var)
                    return 0;
                else
                    this.lastColumn2Var = valChild;

                for(var i=this.menuData.length - 1; i>=0; i--) {
                    if(this.menuData[i][parentFieldName] != valParent)
                        continue;
                    if(this.menuData[i][childFieldName] == valChild)
                        return i - rowIndex + 1;
                }
            },
            // 格式化菜单表
            formatMenuData() {
                // 设置当前MenuData原始顺讯Index
                this.SetMenuDataIndex();

                this.menuDataFomat = [];
                var menuTemp = null;
                var menuObj = null;
                var rowspan1 = 0;
                var rowspan2 = 0;
                var menuTypeCurr = "";
                var firstRowIndex1 = null;
                var firstRowIndex2 = null;

                for(var i = 0; i < this.mealTypeData.length; i++) {
                    if(!isNullOrWhiteSpace(firstRowIndex1) && firstRowIndex1 > 0) {
                        this.menuDataFomat[firstRowIndex1].rowspan1 = rowspan1;
                    }
                    if(!isNullOrWhiteSpace(firstRowIndex2) && firstRowIndex2 > 0) {
                        this.menuDataFomat[firstRowIndex2].rowspan2 = rowspan2;
                    }
                    firstRowIndex1 = null;
                    firstRowIndex2 = null;
                    menuTypeCurr = "";
                    rowspan1 = 1;
                    rowspan2 = 1;

                    /***Menu Object***/
                    menuTemp = deepCopy(menuModel);

                    menuTemp.soItemGuid = this.mealTypeData[i].itemGuid;
                    menuTemp.mealType = this.mealTypeData[i].productDesc;

                    menuTemp.rowspan1 = rowspan1;
                    menuTemp.rowspan2 = rowspan1;
                    menuTemp.isTool = true;
                    menuTemp.origIndex = -1;

                    this.menuDataFomat.push(menuTemp);

                    firstRowIndex1 = this.menuDataFomat.length - 1;
                    firstRowIndex2 = this.menuDataFomat.length - 1;

                    for(var j = 0; j < this.menuData.length; j++) {
                        menuObj = this.menuData[j];

                        if(menuObj.mealType == this.mealTypeData[i].productDesc) {
                            rowspan1 = rowspan1 + 1;

                            if(menuObj.menuType == menuTypeCurr || isNullOrWhiteSpace(menuTypeCurr)) {
                                rowspan2 = rowspan2 + 1;
                                if(isNullOrWhiteSpace(menuTypeCurr)) {
                                    menuTypeCurr = menuObj.menuType;
                                    this.menuDataFomat[firstRowIndex2].menuType = menuTypeCurr;
                                }
                            }
                            else {
                                this.menuDataFomat[firstRowIndex2].rowspan2 = rowspan2;

                                firstRowIndex2 = this.menuDataFomat.length;
                                menuTypeCurr = menuObj.menuType;
                                rowspan2 = 1;
                            }
                            menuTemp = deepCopy(menuModel);
                            menuTemp.soItemGuid = this.mealTypeData[i].itemGuid;
                            menuTemp.mealType = this.mealTypeData[i].productDesc;
                            menuTemp.menuType = menuObj.menuType;
                            for(var k = 1; k <= 7; k++) {
                                menuTemp[k + "_headGuid"] = menuObj[k + "_headGuid"];
                                menuTemp[k + "_changeFlag"] = menuObj[k + "_changeFlag"];
                                menuTemp[k + "_deleteFlag"] = menuObj[k + "_deleteFlag"];
                                menuTemp[k + "_itemGuid"] = menuObj[k + "_itemGuid"];
                                menuTemp[k + "_itemCode"] = menuObj[k + "_itemCode"];
                                menuTemp[k + "_itemType"] = menuObj[k + "_itemType"];
                                menuTemp[k + "_itemName"] = menuObj[k + "_itemName"];
                                menuTemp[k + "_itemCost"] = menuObj[k + "_itemCost"];
                                menuTemp[k + "_itemUnitCode"] = menuObj[k + "_itemUnitCode"];
                                menuTemp[k + "_itemColor"] = menuObj[k + "_itemColor"];
                                menuTemp[k + "_otherCost"] = menuObj[k + "_otherCost"];
                                menuTemp[k + "_itemQty"] = menuObj[k + "_itemQty"];
                                menuTemp[k + "_itemBOM"] = menuObj[k + "_itemBOM"];
                                menuTemp[k + "_hasAdj"] = menuObj[k + "_hasAdj"];
                            }
                            menuTemp.rowspan1 = 0;
                            menuTemp.rowspan2 = 0;
                            menuTemp.isTool = false;
                            menuTemp.origIndex = j;

                            this.menuDataFomat.push(menuTemp);
                        }
                    }
                    this.menuDataFomat[firstRowIndex1].rowspan1 = rowspan1;
                    this.menuDataFomat[firstRowIndex2].rowspan2 = rowspan2;
                }
                this.SetColor();
                this.nextWorkingDay_back = this.nextWorkingDay;
                this.SetExpiryTime();
                this.loading = false;
            },
            // 设置背景色
            SetColor() {
                var mealType = "";
                var row;

                for(var i = 0; i < this.menuDataFomat.length; i++) {
                    row = this.menuDataFomat[i];

                    if(row.mealType != mealType) {
                        mealType = row.mealType;

                        var flag;
                        if(this.bgColorFlag)
                            flag = true;
                        else
                            flag = false;

                        for(var j = 0; j < this.bgColorList.length; j++) {
                            if(this.bgColorList[j].flag == flag) {
                                this.bgColorList[j].flag = !flag;
                                row.bgColor = this.bgColorList[j].className;

                                if(j == this.bgColorList.length - 1)
                                    this.bgColorFlag = !flag;
                                break;
                            }
                        }
                    }
                }
            },
            /****打开Item对话框***/
            showDialog(soItemGuid, mealType, day) {
                this.selSoItemGuid = soItemGuid;
                this.selMealType = mealType;
                this.selCol = day;
                this.dialogParam.requiredDate = this.nextWorkingDay;
                this.dialogParam.requiredQty = 100;
                this.dialogParam.mealName = mealType;
                this.ShowSearchItemsDialog = true;
            },
            /***Item对话框关闭***/
            closeDialog(val) {
                this.appendMeal(val);
                this.ShowSearchItemsDialog = false;
                this.selMealType = "";
                this.selCol = "";
            },
            /****打开RMItem对话框***/
            showDialogRM(origIndex, col) {
                this.selIndex = origIndex;
                this.selCol = col;
                this.dialogParam.itemBOM = this.menuData[this.selIndex][this.selCol + "_itemBOM"];
                this.dialogParam.requiredDate = this.nextWorkingDay;
                this.dialogParam.requiredQty = this.menuData[this.selIndex][this.selCol + "_itemQty"];
                this.dialogParam.itemName = this.menuData[this.selIndex][this.selCol + "_itemName"];
                this.ShowRMItemDialog = true;
            },
            /***关闭RMItem对话框***/
            closeDialogRM(itemBOM) {
                var changeFlag = "";
                var message = "";
                var itemCost = 0;

                // itemCost更新 = actItemCost总和 + otherCost
                for(var bomObj of itemBOM) {
                    itemCost = itemCost + bomObj.actItemCost * 1;
                }

                itemCost = itemCost * 1 + this.menuData[this.selIndex][this.selCol + "_otherCost"] * 1;
                this.menuData[this.selIndex][this.selCol + "_itemCost"] = itemCost;

                changeFlag = this.CheckItemBOMChange(itemBOM);

                if(changeFlag == "1") {
                    message = "【" + this.menuData[this.selIndex][this.selCol + "_itemName"] + "】"
                        + "有原料信息标记为待修改";
                    this.$message({
                        type: 'warning',
                        message: message
                    });
                }
                this.menuData[this.selIndex][this.selCol + "_changeFlag"] = changeFlag;
                this.menuData[this.selIndex][this.selCol + "_itemBOM"] = itemBOM;
                this.formatMenuData();
            },
            /****打开菜单/直接采购对话框***/
            showDialogPurchaseOrder() {
                this.CheckHasChange();

                if(this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }
                this.ShowPurchaseNewItemDialog = true;
            },
            /***关闭菜单/直接采购对话框***/
            closePurchaseNewItemDialog() {
                this.dialogParam.checkItemString = "";
                this.loading = true;
                this.GetMenuOrder();
            },
            // MenuData按类别阶层排序
            SortMenuData() {
                var menuDataTemp = [];
                var menuDataWork = [];

                var mealType = "";

                for(var menuObj of this.menuData) {
                    if(mealType != menuObj.mealType) {
                        // 备份餐次和阶层
                        mealType = menuObj.mealType;
                        menuDataWork = menuDataWork.concat(this.DoSort(menuDataTemp));
                        menuDataTemp = [];
                    }
                    menuDataTemp.push(menuObj);
                }
                if(menuDataTemp.length > 0)
                    menuDataWork = menuDataWork.concat(this.DoSort(menuDataTemp));
                this.menuData = menuDataWork;
            },
            // 排序方法
            DoSort(menuDataTemp) {
                menuDataTemp = menuDataTemp.sort(function(x,y){
                    var res = null;

                    if(x.classSort > y.classSort)
                        res = 1;
                    else if(x.classSort < y.classSort)
                        res = -1;
                    else if(x.classSort == y.classSort) {
                        if(x.index > y.index && (x.index != -1 && y.index != -1))
                            res = 1;
                        else
                            res = -1;
                    }
                    return res;
                });
                return menuDataTemp;
            },
            // 设置BOM原料的需求数量
            setRequiredQty(itemQty, itemBOM) {
                if(itemBOM == null)
                    return;
                for(var bom of itemBOM) {
                    bom.requiredQty = getRequiredQty(itemQty, bom.actQty, bom.conversionUnit, bom.conversionRate);
                }
            },
            // 添加选择的菜
            appendMeal(val) {
                var productGuid = "";
                var purchasePolicy = "";

                for(var meal of val) {
                    // 设置RequiredQty
                    this.setRequiredQty(100, meal.ItemBOM);

                    productGuid = "";
                    purchasePolicy = "";

                    if(meal.ItemBOM != null && meal.ItemBOM.length > 0) {
                        productGuid = meal.ItemBOM[0].productGUID;
                        purchasePolicy = meal.ItemBOM[0].purchasePolicy;
                    }

                    this.appendMealPlus({
                        type: meal.itemType != "FG" ? "其他" : meal.nation + " / " + meal.menuClass,
                        itemGuid: meal.itemGuid,
                        itemCode: meal.itemCode,
                        itemType: meal.itemType,
                        itemCost: meal.itemCost,
                        itemUnitCode: meal.itemUnitCode,
                        itemColor: meal.itemColor,
                        otherCost: meal.otherCost,
                        itemName: meal.itemName_ZH,
                        classSort: meal.itemType != "FG" ? "9999999" : meal.classSort,
                        productGuid: productGuid,
                        purchasePolicy: purchasePolicy,
                        itemBOM : meal.ItemBOM
                    });
                }
                // 按类别阶层重新排序
                this.SortMenuData();

                // 格式化显示Data
                this.formatMenuData();
            },
            appendMealPlus(meal) {
                // 匹配到餐次+类别的最大Index
                var indexFoundLastMatchIndex = -1;
                // 找到的空白单元格行号
                var indexFoundRowIndex  = -1;
                // 找到的空白单元格列号
                var indexFoundColIndex = -1
                // work var
                var indexTemp = -1;
                // 存在Flag
                var isExist = false;
                // Menu Temp
                var menuTemp = null;

                if(isNullOrWhiteSpace(this.selMealType) ||
                    isNullOrWhiteSpace(this.selCol))
                    return;
                for(var i = 0; i < this.menuData.length; i++) {
                    if (this.menuData[i].mealType != this.selMealType &&
                        !this.menuData[i].isTool) {
                        continue;
                    }
                    if (this.menuData[i].menuType != meal.type) {
                        continue;
                    }
                    for (var j = 1; j <= 7; j++) {
                        if (this.menuData[i][j + "_itemCode"] == meal.itemCode) {
                            isExist = true;
                            break;
                        }
                        if(isNullOrWhiteSpace(this.menuData[i][j + "_itemCode"])) {
                            indexFoundColIndex = j;
                            break;
                        }
                    }
                    indexFoundLastMatchIndex = i;

                    if(indexFoundColIndex > -1)
                        indexFoundRowIndex = i;
                }
                if(isExist) {
                    return;
                }
                if(indexFoundColIndex > -1 && indexFoundRowIndex > -1) {
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemGuid"] = meal.itemGuid;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemCode"] = meal.itemCode;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemType"] = meal.itemType;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemName"] = meal.itemName;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemCost"] = meal.itemCost;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemUnitCode"] = meal.itemUnitCode;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemColor"] = meal.itemColor;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_otherCost"] = meal.otherCost;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemQty"] = "100";
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_itemBOM"] = meal.itemBOM;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_productGuid"] = meal.productGuid;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_purchasePolicy"] = meal.purchasePolicy;
                    this.menuData[indexFoundRowIndex][indexFoundColIndex + "_hasAdj"] = "";
                } else {
                    // 餐次+类别没找到的话取最大长度，反之当前匹配餐次+类别的最大Index + 1
                    indexTemp = (indexFoundLastMatchIndex == -1) ? this.menuData.length : indexFoundLastMatchIndex + 1;

                    // 插入一行
                    menuTemp = deepCopy(menuModel);
                    menuTemp.soItemGuid = this.selSoItemGuid;
                    menuTemp.mealType = this.selMealType;
                    menuTemp.menuType = meal.type;
                    menuTemp.classSort = meal.classSort;

                    this.menuData.splice(indexTemp, 0, menuTemp);
                    // 赋值
                    this.menuData[indexTemp][1 + "_itemGuid"] = meal.itemGuid;
                    this.menuData[indexTemp][1 + "_itemCode"] = meal.itemCode;
                    this.menuData[indexTemp][1 + "_itemType"] = meal.itemType;
                    this.menuData[indexTemp][1 + "_itemName"] = meal.itemName;
                    this.menuData[indexTemp][1 + "_itemCost"] = meal.itemCost;
                    this.menuData[indexTemp][1 + "_itemUnitCode"] = meal.itemUnitCode;
                    this.menuData[indexTemp][1 + "_itemColor"] = meal.itemColor;
                    this.menuData[indexTemp][1 + "_otherCost"] = meal.otherCost;
                    this.menuData[indexTemp][1 + "_itemQty"] = "100";
                    this.menuData[indexTemp][1 + "_itemBOM"] = meal.itemBOM;
                    this.menuData[indexTemp][1 + "_productGuid"] = meal.productGuid;
                    this.menuData[indexTemp][1 + "_purchasePolicy"] = meal.purchasePolicy;
                    this.menuData[indexTemp][1 + "_hasAdj"] = "";
                }
            },
            // 删除Item
            deleteItem(index, col) {
                if(!isNullOrWhiteSpace(this.menuData[index][col + "_headGuid"])) {
                    // 如果是来自数据库的记录时，打上删除标志
                    if(this.menuData[index][col + "_deleteFlag"] == "1") {
                        this.menuData[index][col + "_deleteFlag"] = "";
                        this.$message({
                            type: 'success',
                            message: "【" + this.menuData[index][col + "_itemName"] + "】" + "已撤销删除状态"
                        })
                    }
                    else {
                        this.menuData[index][col + "_deleteFlag"] = "1";
                        this.$message({
                            type: 'error',
                            message: "【" + this.menuData[index][col + "_itemName"] + "】" + "已标记为待删除"
                        })
                    }
                    // 格式化显示Data
                    this.formatMenuData();

                    return;
                }
                this.menuData[index][col + "_linkId"] = "";
                this.menuData[index][col + "_itemGuid"] = "";
                this.menuData[index][col + "_itemCode"] = "";
                this.menuData[index][col + "_itemType"] = "";
                this.menuData[index][col + "_itemName"] = "";
                this.menuData[index][col + "_itemCost"] = "";
                this.menuData[index][col + "_itemUnitCode"] = "";
                this.menuData[index][col + "_itemColor"] = "";
                this.menuData[index][col + "_otherCost"] = "";
                this.menuData[index][col + "_itemQty"] = "";
                this.menuData[index][col + "_itemBOM"] = null;
                this.menuData[index][col + "_productGuid"] = "";
                this.menuData[index][col + "_purchasePolicy"] = "";
                this.menuData[index][col + "_hasAdj"] = "";

                // 当该行的一周七天均没有菜时删除当前行
                if (isNullOrWhiteSpace(this.menuData[index]["1_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["2_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["3_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["4_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["5_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["6_itemName"]) &&
                    isNullOrWhiteSpace(this.menuData[index]["7_itemName"])) {
                    this.menuData.splice(index, 1);

                    // 格式化显示Data
                    this.formatMenuData();

                    return;
                }
                var mealType = this.menuData[index].mealType;
                var menuType = this.menuData[index].menuType;

                for(var i = index; i < this.menuData.length; i++) {
                    if(this.menuData[i].mealType != mealType ||
                       this.menuData[i].menuType != menuType) {
                        break;
                    }
                    // 当该行的一周七天均没有菜时删除当前行
                    if (isNullOrWhiteSpace(this.menuData[i]["1_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["2_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["3_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["4_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["5_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["6_itemCode"]) &&
                        isNullOrWhiteSpace(this.menuData[i]["7_itemCode"]))
                        this.menuData.splice(i, 1);
                    // 空单元格前移
                    for (var j = 1; j <= 7; j++) {
                        if(!isNullOrWhiteSpace(this.menuData[i][j + "_itemCode"]))
                            continue;
                        if (j < 7) {
                            this.menuData[i][j + "_linkId"] = this.menuData[i][j + 1 + "_linkId"];
                            this.menuData[i][j + "_itemGuid"] = this.menuData[i][j + 1 + "_itemGuid"];
                            this.menuData[i][j + "_itemCode"] = this.menuData[i][j + 1 + "_itemCode"];
                            this.menuData[i][j + "_itemType"] = this.menuData[i][j + 1 + "_itemType"]
                            this.menuData[i][j + "_itemName"] = this.menuData[i][j + 1 + "_itemName"];
                            this.menuData[i][j + "_itemCost"] = this.menuData[i][j + 1 + "_itemCost"];
                            this.menuData[i][j + "_itemUnitCode"] = this.menuData[i][j + 1 + "_itemUnitCode"];
                            this.menuData[i][j + "_itemColor"] = this.menuData[i][j + 1 + "_itemColor"];
                            this.menuData[i][j + "_otherCost"] = this.menuData[i][j + 1 + "_otherCost"];
                            this.menuData[i][j + "_itemQty"] = this.menuData[i][j + 1 + "_itemQty"];
                            this.menuData[i][j + "_itemBOM"] = this.menuData[i][j + 1 + "_itemBOM"];
                            this.menuData[i][j + "_productGuid"] = this.menuData[i][j + 1 + "_productGuid"];
                            this.menuData[i][j + "_purchasePolicy"] = this.menuData[i][j + 1 + "_purchasePolicy"];
                            this.menuData[i][j + "_hasAdj"] = this.menuData[i][j + 1 + "_hasAdj"];
                            this.menuData[i][j + 1 + "_linkId"] = "";
                            this.menuData[i][j + 1 + "_itemGuid"] = "";
                            this.menuData[i][j + 1 + "_itemCode"] = "";
                            this.menuData[i][j + 1 + "_itemType"] = "";
                            this.menuData[i][j + 1 + "_itemName"] = "";
                            this.menuData[i][j + 1 + "_itemCost"] = "";
                            this.menuData[i][j + 1 + "_itemUnitCode"] = "";
                            this.menuData[i][j + 1 + "_itemColor"] = "";
                            this.menuData[i][j + 1 + "_otherCost"] = "";
                            this.menuData[i][j + 1 + "_itemQty"] = "";
                            this.menuData[i][j + 1 + "_itemBOM"] = null;
                            this.menuData[i][j + 1 + "_productGuid"] = "";
                            this.menuData[i][j + 1 + "_purchasePolicy"] = "";
                            this.menuData[i][j + 1 + "_hasAdj"] = "";
                        } else {
                            if(i == this.menuData.length - 1 ||
                                this.menuData[i + 1].mealType != mealType ||
                                this.menuData[i + 1].menuType != menuType)
                                break;
                            this.menuData[i][j + "_linkId"] = this.menuData[i + 1][1 + "_linkId"];
                            this.menuData[i][j + "_itemGuid"] = this.menuData[i + 1][1 + "_itemGuid"];
                            this.menuData[i][j + "_itemCode"] = this.menuData[i + 1][1 + "_itemCode"];
                            this.menuData[i][j + "_itemType"] = this.menuData[i + 1][1 + "_itemType"];
                            this.menuData[i][j + "_itemName"] = this.menuData[i + 1][1 + "_itemName"];
                            this.menuData[i][j + "_itemCost"] = this.menuData[i + 1][1 + "_itemCost"];
                            this.menuData[i][j + "_itemUnitCode"] = this.menuData[i + 1][1 + "_itemUnitCode"];
                            this.menuData[i][j + "_itemColor"] = this.menuData[i + 1][1 + "_itemColor"];
                            this.menuData[i][j + "_otherCost"] = this.menuData[i + 1][1 + "_otherCost"];
                            this.menuData[i][j + "_itemQty"] = this.menuData[i + 1][1 + "_itemQty"];
                            this.menuData[i][j + "_itemBOM"] = this.menuData[i + 1][1 + "_itemBOM"];
                            this.menuData[i][j + "_productGuid"] = this.menuData[i + 1][1 + "_productGuid"];
                            this.menuData[i][j + "_purchasePolicy"] = this.menuData[i + 1][1 + "_purchasePolicy"];
                            this.menuData[i][j + "_hasAdj"] = this.menuData[i + 1][1 + "_hasAdj"];
                            this.menuData[i + 1][1 + "_linkId"] = "";
                            this.menuData[i + 1][1 + "_itemGuid"] = "";
                            this.menuData[i + 1][1 + "_itemCode"] = "";
                            this.menuData[i + 1][1 + "_itemType"] = "";
                            this.menuData[i + 1][1 + "_itemName"] = "";
                            this.menuData[i + 1][1 + "_itemCost"] = "";
                            this.menuData[i + 1][1 + "_itemUnitCode"] = "";
                            this.menuData[i + 1][1 + "_itemColor"] = "";
                            this.menuData[i + 1][1 + "_otherCost"] = "";
                            this.menuData[i + 1][1 + "_itemQty"] = "";
                            this.menuData[i + 1][1 + "_itemBOM"] = null;
                            this.menuData[i + 1][1 + "_productGuid"] = "";
                            this.menuData[i + 1][1 + "_purchasePolicy"] = "";
                            this.menuData[i + 1][1 + "_hasAdj"] = "";
                        }
                    }
                }
                // 格式化显示Data
                this.formatMenuData();
            },
            // 价格合计
            totalAmtByType(mealType) {
                var result = 0;
                var itemCost;
                var otherCost;
                var tempCost;

                for(var menu of this.menuDataFomat) {
                    if(menu.isTool ||
                       menu.mealType != mealType)
                        continue;
                    for(var i = 1; i <= 7; i++) {
                        if(isNullOrWhiteSpace(menu[i + "_itemCode"]) ||
                           isNullOrWhiteSpace(menu[i + "_itemName"]))
                            break;
                        itemCost = menu[i + "_itemCost"] * 1;
                        otherCost = menu[i + "_otherCost"] * 1;
                        tempCost = this.otherCost? itemCost: (itemCost - otherCost);
                        result = result + (tempCost * (isNullOrWhiteSpace(menu[i + "_itemQty"]) ? 0
                                : menu[i + "_itemQty"] * 1));
                    }
                }
                return this.formatAmount(result + "");
            },
            // 格式化金额（Item用）
            formatAmount(amount, decimals) {
                if(isNullOrWhiteSpace(decimals)) {
                    decimals = 2;
                }
                decimals = decimals + 0;
                var itemCost = formatMoney(amount, decimals, ".", ",", "round");

                if(itemCost.substr(itemCost.length - 3, 3) == ".00") {
                    itemCost = itemCost.substr(0, itemCost.length - 3);
                }
                return itemCost;
            },
            // 取得CostCenter下拉框选项
            GetCCWhs() {
                this.loading = true;
                GetCCWhs({
                    action: "menu-weekly",
                    userGuid: this.user.userGuid
                }).then(data => {
                    if(data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        for(var cw of this.ccWhsOption) {
                            cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                        }
                    }
                    this.loading = false;
                }).catch(()=>{
                    this.loading = false;
                })
            },
            // CostCenter、档口选择事件
            CreateEdit() {
                if(this.selectCCWhs.length == 0)
                    return;
                // 设置选中的CCWhs对象
                this.ccWhsObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                // 设置dbName(共用画面传值用)
                this.dialogParam.dbName = this.ccWhsObj.dbName;
                // 设置供应商代码(共用画面传值用)
//                this.dialogParam.supplierCodes = arrayToString(this.ccWhsObj.lstCCSuppliers, "supplierCode");
                // 设置成本中心(共用画面传值用)
                this.dialogParam.costCenterCode = this.ccWhsObj.costCenterCode;
                // 设置成本中心名称(共用画面传值用)
                this.dialogParam.costCenterName = this.ccWhsObj.costCenterName_ZH;
                // 设置WindowGUID
                if(this.selectCCWhs.length > 1)
                    this.selWindowGuid = this.selectCCWhs[1].trim();
                else
                    this.selWindowGuid = "";
                this.loading = true;
                // 先从数据库取MenuOrder
                this.GetToNextWorkingDay(this.GetMealTypeList);
            },
            // 取得至下个工作日前的所有日期+weekDay中文
            GetToNextWorkingDay(cb) {
                var date = "";
                if(!isNullOrWhiteSpace(this.sDate))
                    date = this.sDate;
                else
                    date = this.formatDate(new Date());
                GetToNextWorkingDay({
                    date: date,
                    costCenterCode: this.ccWhsObj.costCenterCode,
                    lang: "cn",
                    formatString: "dddd"
                }).then(data => {
                    if(data && data.code == "200") {
                        this.workingDays = data.content;
                        this.nextWorkingDay = this.workingDays[0].date;
                        this.nextWorkingDayDesc = this.workingDays[0].weekDay;
                        this.nextWorkingDay_back = this.workingDays[0].date;
                        cb();
                    }
                });
            },
            // 取得分类信息
            GetMealTypeList() {
                var param = {
                    costCenterCode: this.selectCCWhs[0].trim(),
                    startDate: this.nextWorkingDay,   //
                    endDate: this.nextWorkingDay,
                    lstItemGuid: this.GetItemGuidList()
                }
                // 取得分类信息
                GetMealTypeList(param).then(data => {
                    if(data && data.code == "200") {
                        this.mealTypeData = data.content;
                        this.menuData = [];
                        this.menuDataFomat = [];
                        this.GetMenuOrder();
                    } else {
                        this.mealTypeData = [];
                        this.menuData = [];
                        this.menuDataFomat = [];
                        this.$message.error("没有找到对应的餐次信息！");
                        this.loading = false;
                    }
                });
            },
            // 根据档口Guid取得ItemGuid
            GetItemGuidList() {
                var aryItemGuid = [];

                if(this.selectCCWhs.length < 2)
                    return aryItemGuid;

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                var windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");

                if(typeof(windowObj) == "undefined" ||
                    typeof(windowObj.lstCCWindowMeals) == "undefined" ||
                    windowObj.lstCCWindowMeals == null ||
                    windowObj.lstCCWindowMeals.length == 0)
                    return aryItemGuid;

                for(var wms of windowObj.lstCCWindowMeals) {
                    aryItemGuid.push({
                        itemGuid: wms.soItemGuid
                    });
                }
                return aryItemGuid;
            },
            // 日期格式化
            // 一般日期格式化
            formatDate(date, formatString) {
                var tempDate = date;
                if(isNullOrWhiteSpace(tempDate))
                    return "";
                if(typeof(tempDate) == "string")
                    tempDate = new Date(tempDate);
                if(isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";
                return tempDate.format(formatString);
            },
            getFirstDayOfWeek (date) {
                var day = date.getDay() || 7;
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
            },
            // 读取MenuOrder
            GetMenuOrder() {
                var costCenterCode = this.selectCCWhs[0].trim();
                var windowGuid = isNullOrWhiteSpace(this.selectCCWhs[1]) ? "": this.selectCCWhs[1].trim();

                var param = {
                    dbName: this.dialogParam.dbName,
                    costCenterCode: costCenterCode,    // 成本中心
                    windowGuid: windowGuid,            // 档口Guid
                    startDate: this.nextWorkingDay,      // 一周开始日期
                    endDate: this.nextWorkingDay         // 一周结束日期
                }
                GetMenuOrder(param).then(data => {
                    if(data && data.code == "200") {
                        this.SetMenuData(data.content);
                        this.isLocal = false;
                    } else {
                        this.menuData = [];
                        this.formatMenuData();
                        this.isLocal = true;
                    }
                }).catch(()=>{
                    this.loading = false;
                });
            },
            // 将MenuOrderHead转成用于显示的MenuData
            SetMenuData(lstMenuOrderHead) {
                this.menuData = [];
                this.menuDataFomat = [];

                var menuDataTemp = [];
                var wkMealType =  "";
                var wkMenuType = "";
                var wkClassSort = "";
                var menuObj;
                var foundRowIndex = -1;
                var foundColIndex = -1;

                for(var mos of lstMenuOrderHead) {
                    /***找到空单元格行标***/
                    foundRowIndex = -1;
                    /***找到空单元格列表***/
                    foundColIndex = -1;

                    // 当餐次或类别阶层与上一行不同时
                    if(mos.productDesc != wkMealType ||
                       (mos.itemType != "FG" ? "其他" : mos.nation + " / " + mos.menuClassName) != wkMenuType) {
                        /***备份餐次***/
                        wkMealType = mos.productDesc;
                        /***备份类别阶层***/
                        wkMenuType = mos.itemType != "FG" ? "其他" : mos.nation + " / " + mos.menuClassName;
                        /***排序字段***/
                        wkClassSort = mos.classSort;
                        /***临时表不为空时追加到MenuData***/
                        if(menuDataTemp.length > 0)
                            this.menuData = this.menuData.concat(menuDataTemp);
                        /***临时表清空***/
                        menuDataTemp = [];
                        /***追加一空行***/
                        menuDataTemp.push(this.NewMenuDataRow(mos.soItemGuid, wkMealType, wkMenuType, wkClassSort));
                    }
                    for(var i = 0; i < menuDataTemp.length; i++) {
                        menuObj = menuDataTemp[i];

                        for(var j = 1; j <= 7; j++) {
                            if(isNullOrWhiteSpace(menuObj[j + "_itemName"]) &&
                               isNullOrWhiteSpace(menuObj[j + "_itemGuid"]) &&
                               isNullOrWhiteSpace(menuObj[j + "_itemCode"])) {
                                foundRowIndex = i;
                                foundColIndex = j;
                                break;
                            }
                        }
                        if(foundRowIndex > -1 && foundColIndex > -1)
                            break;
                    }
                    /***当没有找到时***/
                    if(foundRowIndex == -1 || foundColIndex == -1) {
                        /***追加一空行***/
                        menuDataTemp.push(this.NewMenuDataRow(mos.soItemGuid, wkMealType, wkMenuType, wkClassSort));
                        /***Index设置为临时表最大Index***/
                        foundRowIndex = menuDataTemp.length - 1;
                        foundColIndex = 1;
                    }
                    /***将内容写入单元格***/
                    menuDataTemp[foundRowIndex][foundColIndex + "_headGuid"] = mos.headGuid;
                    menuDataTemp[foundRowIndex][foundColIndex + "_linkId"] = mos.linkId;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemGuid"] = mos.itemGuid;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemCode"] = mos.itemCode;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemType"] = mos.itemType;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemName"] = mos.itemName_ZH;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemCost"] = mos.itemCost + "";
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemCost_bak"] = mos.itemCost + "";
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemUnitCode"] = mos.itemUnitCode;
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemColor"] = isNullOrWhiteSpace(mos.itemColor)? "":mos.itemColor;
                    menuDataTemp[foundRowIndex][foundColIndex + "_otherCost"] = mos.otherCost + "";
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemQty"] = mos.requiredQty + "";
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemQty_bak"] = mos.requiredQty + "";
                    menuDataTemp[foundRowIndex][foundColIndex + "_itemBOM"] = this.ConvertToBOM(mos.lstMenuOrderLine);
                    menuDataTemp[foundRowIndex][foundColIndex + "_productGuid"] = mos.productGuid;
                    menuDataTemp[foundRowIndex][foundColIndex + "_purchasePolicy"] = mos.purchasePolicy;
                    menuDataTemp[foundRowIndex][foundColIndex + "_hasAdj"] = mos.hasAdj;
                    menuDataTemp[foundRowIndex][foundColIndex + "_minRequiredDate"] = mos.requiredDate;
                }
                if(menuDataTemp.length > 0)
                    this.menuData = this.menuData.concat(menuDataTemp);
                // 转换成画面显示的Data
                this.formatMenuData();
            },
            // New一个MenuData的新行
            NewMenuDataRow(soItemGuid, mealType, menuType, classSort) {
                var menuTemp = deepCopy(menuModel);

                menuTemp.index = -1;
                menuTemp.soItemGuid = soItemGuid;
                menuTemp.mealType = mealType;
                menuTemp.menuType = menuType;
                menuTemp.classSort = classSort;

                return menuTemp;
            },
            SetMenuDataIndex() {
                for(var i = 0; i < this.menuData.length; i++){
                    this.menuData[i].index = i;
                }
            },
            // 保存MenuOrder
            SaveMenuOrder() {
                // 检查是否有记录被修改
                this.CheckHasChange();
                // 保存前Check
                if(this.menuOrderHead.length == 0) {
                    this.$message({
                        type: 'error',
                        message: '没有需要保存的记录'
                    });
                    return;
                }

                var message = "确定提交吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    // 设置RFC参数
                    var param = {
                        userId: this.user.account,
                        lstMenuOrderHead: this.menuOrderHead
                    }
                    // 调用RFC进行保存
                    SaveMenuOrder(param).then(data => {
                        if(data && data.code == "200") {
                            this.GetMenuOrder();
                            this.$message({
                                type: 'success',
                                message: '日单保存成功！'
                            });
                        } else {
                            this.$message({
                                type: 'error',
                                message: '日单保存失败！'
                            });
                            this.loading = false;
                        }
                    });
                }).catch(()=>{
                    this.loading = false;
                });
            },
            // 检查是否有修改过的记录
            CheckHasChange() {
                var row;

                this.menuOrderHead = [];

                for(var i = 0; i < this.menuData.length; i++) {
                    row = this.menuData[i];

                    for(var j = 1; j <= 7; j++)
                        this.ConvertToMenuOrder(row, j);
                }
            },
            // 将数据库中的BOM对象转换成前端使用的BOM对象
            ConvertToBOM(lstBOM) {
                var itemBOM = [];

                for(var bomObj of lstBOM) {
                    var bom = deepCopy(bomModel);

                    bom.headGuid = bomObj.headGuid;
                    bom.lineGuid = bomObj.lineGuid;
                    bom.itemCode = bomObj.itemCode;
                    bom.itemCode_bak = bomObj.itemCode;
                    bom.itemName = bomObj.itemName;
                    bom.itemDesc = bomObj.itemDesc;
                    bom.itemDesc_bak = bomObj.itemDesc;
                    bom.itemType = bomObj.itemType;
                    bom.bomQty = bomObj.bomQty + "";
                    bom.actQty = bomObj.actQty + "";
                    bom.actQty_bak = bomObj.actQty + "";
                    bom.supplierCode = bomObj.supplierCode;
                    bom.supplierName = bomObj.supplierName;
                    bom.conversionUnit = bomObj.conversionUnit;
                    bom.conversionRate = bomObj.conversionRate;
                    bom.purchasePrice = bomObj.purchasePrice;
                    bom.purchaseUnit = bomObj.purchaseUnit;
                    bom.tax = bomObj.tax;
                    bom.requiredQty = bomObj.requiredQty;
                    bom.requiredQty_bak = bomObj.requiredQty;
                    bom.createUser = bomObj.createUser;
                    bom.createTime = bomObj.createTime;
                    bom.deleteUser = bomObj.deleteUser;
                    bom.deleteTime = bomObj.deleteTime;
//                    bom.changeFlag = bomObj.changeFlag;
                    bom.sortId = bomObj.sortId;
                    bom.productGUID = bomObj.productGUID;
                    bom.purchasePolicy = bomObj.purchasePolicy;
                    bom.hasAdj = bomObj.hasAdj;
                    bom.requiredDate = bomObj.requiredDate;

                    itemBOM.push(bom);
                }

                return itemBOM;
            },
            // 将Column转换成MenuOrder
            ConvertToMenuOrder(row, col) {
                // 是否提交后台Flag
                var result = false;

                // MenuOrderHead提交Json格式
                var menuOrderObj = deepCopy(menuOrderModel);

                // 判断是否追加
                if(this.CheckSubmit(row, col))
                    result = true;

                /******将单元格转换成MenuOrder******/
                // HeadGuid
                menuOrderObj.headGuid = row[col + "_headGuid"];
                // 成本中心
                menuOrderObj.costCenterCode = this.ccWhsObj.costCenterCode;
                // 档口Guid
                menuOrderObj.windowGuid = this.selWindowGuid;
                // 日期
                menuOrderObj.requiredDate = this.nextWorkingDay;
                // 合同行项Guid
                menuOrderObj.soItemGuid = row.soItemGuid;
                // 成品Guid
                menuOrderObj.itemGuid = row[col + "_itemGuid"];
                // 成品Code
                menuOrderObj.itemCode = row[col + "_itemCode"];
                // 成品/原料类别编码
                menuOrderObj.itemType = row[col + "_itemType"];
                // 成品名称(中文)
                menuOrderObj.itemName_ZH = row[col + "_itemName"];
                // 成品名称(英文)
                menuOrderObj.itemName_EN = "";
                // 需求数量
                menuOrderObj.requiredQty = row[col + "_itemQty"] * 1;
                // 成本
                menuOrderObj.itemCost = row[col + "_itemCost"] * 1;
                // 成本单位
                menuOrderObj.itemUnitCode = row[col + "_itemUnitCode"];
                // 成品颜色
                menuOrderObj.itemColor = row[col + "_itemColor"];
                // 其他成本
                menuOrderObj.otherCost = row[col + "_otherCost"];
                // 修改标志
                menuOrderObj.changeFlag = isNullOrWhiteSpace(row[col + "_headGuid"]) ? "0" : "1";
                // 删除用户
                menuOrderObj.deleteUser = row[col + "_deleteFlag"] == "1" ? this.user.account: "";
                // 关联Id
                menuOrderObj.linkId = row[col + "_linkId"];
                // 产品Guid
                menuOrderObj.productGuid = row[col + "_productGuid"];
                // 采购类型
                menuOrderObj.purchasePolicy = row[col + "_purchasePolicy"];

                var lstMenuOrderLine = [];

                if(!isNullOrWhiteSpace(menuOrderObj.itemCode) && row[col + "_itemBOM"] != null) {
                    for (var bom of row[col + "_itemBOM"]) {
                        /***初始化Line Object***/
                        var menuOrderLine = deepCopy(bomModel);

                        // 判断是否追加
                        if (this.CheckSubmitLine(bom, true)) {
                            result = true;
                            // HeadGuid
                            menuOrderLine.headGuid = bom.headGuid;
                            // LineGuid
                            menuOrderLine.lineGuid = bom.lineGuid;
                            // 原料Code
                            menuOrderLine.itemCode = bom.itemCode;
                            // 原料名称
                            menuOrderLine.itemName = bom.itemName;
                            // 原料别名
                            menuOrderLine.itemDesc = bom.itemDesc;
                            // 原料类别
                            menuOrderLine.itemType = bom.itemType;
                            // 原料数量
                            menuOrderLine.bomQty = bom.bomQty * 1;
                            // 原料实际数量
                            menuOrderLine.actQty = bom.actQty * 1;
                            // 供应商代码
                            menuOrderLine.supplierCode = bom.supplierCode;
                            // 供应商名称
                            menuOrderLine.supplierName = bom.supplierName;
                            // 转换单位
                            menuOrderLine.conversionUnit = bom.conversionUnit;
                            // 转换率
                            menuOrderLine.conversionRate = bom.conversionRate * 1;
                            // 采购单价
                            menuOrderLine.purchasePrice = bom.purchasePrice * 1;
                            // 采购单位
                            menuOrderLine.purchaseUnit = bom.purchaseUnit;
                            // 采购税率
                            menuOrderLine.purchaseTax = bom.tax;
                            // 需求数量
                            menuOrderLine.requiredQty = bom.requiredQty * 1;
                            // 排序Id
                            menuOrderLine.sortId = bom.sortId;
                            // 修改标志
                            menuOrderLine.changeFlag = (isNullOrWhiteSpace(bom.lineGuid) ||
                            isNullOrWhiteSpace(bom.headGuid)) ? "0" : "1";

                            lstMenuOrderLine.push(menuOrderLine);
                        }
                    }
                    menuOrderObj.lstMenuOrderLine = lstMenuOrderLine;
                } else {
                    result = false;
                }

                // 确认需要追加时，再追加
                if(result) {
                    // 追加MenuOrder
                    this.menuOrderHead.push(menuOrderObj);
                }
            },
            // 判断是否要提交到后台(Head)
            CheckSubmit(row, col) {
                // ItemCode为空时,不做追加
                if(isNullOrWhiteSpace(row[col + "_itemCode"]))
                    return false;
                // SysGUID不为空，且没有任何修改时，且删除标志为空时不做追加
                if(!isNullOrWhiteSpace(row[col + "_headGuid"]) &&
                    row[col + "_itemQty"] == row[col + "_itemQty_bak"] &&
                    row[col + "_itemCost"] == row[col + "_itemCost_bak"] &&
                    isNullOrWhiteSpace(row[col + "_deleteFlag"])) {
                    return false;
                }
                // 其余情况全部追加
                return true;
            },
            // 判断是否要提交到后台(Item)
            CheckSubmitLine(bomObj, saveFlag) {
                // HeadGuid和LineGuid有一个为空时，则不做判断
                if(isNullOrWhiteSpace(bomObj.headGuid) ||
                    isNullOrWhiteSpace(bomObj.lineGuid)) {
                    if(saveFlag)
                        return true;
                    else
                        return false;
                }

                // HeadGuid和LineGuid都不为空，且没有任何修改时不做追加
                if(bomObj.itemDesc == bomObj.itemDesc_bak &&
                    bomObj.actQty * 1 == bomObj.actQty_bak * 1 &&
                    bomObj.requiredQty * 1 == bomObj.requiredQty_bak * 1 &&
                    bomObj.itemCode == bomObj.itemCode_bak) {
                    return false;
                }
                // 其余情况全部追加
                return true;
            },
            // 判断Item BOM是否有修改
            CheckItemBOMChange(itemBOM) {
                var changeFlag = "";

                for(var bomObj of itemBOM) {
                    if(this.CheckSubmitLine(bomObj, false)) {
                        changeFlag = "1";
                        break;
                    }
                }
                return changeFlag;
            },
            // 限制输入数字和小数
            handleInput(row, day) {
                row[day + "_itemQty"] = row[day + "_itemQty"].replace(/[^\d]/g,'');
            },
            // 失去焦点时更新MenuData的数量
            UpdateQty(row, day){
                var changeFlag = "";
                var message = "";

                // 输入内容为空或0时，更新为最小值1
                if(isNullOrWhiteSpace(row[day + "_itemQty"]) || row[day + "_itemQty"] == 0) {
                    row[day + "_itemQty"] = "1";
                }
                // 更新BOM的RequiredQty
                this.setRequiredQty(row[day + "_itemQty"] * 1, row[day + "_itemBOM"]);

                // 检查原料是否有修改
                row[day + "_changeFlag"] = this.CheckItemBOMChange(row[day + "_itemBOM"]);

                if(row[day + "_changeFlag"] == "1") {
                    message = "【" + row[day + "_itemName"] + "】"
                        + "有原料信息标记为待修改";
                    this.$message({
                        type: 'warning',
                        message: message
                    });
                }
                // 更新MenuData
                for(var i = 0; i < this.menuData.length; i++) {
                    if(this.menuData[i].mealType == row.mealType &&
                        this.menuData[i].menuType == row.menuType &&
                        this.menuData[i][day + "_itemCode"] == row[day + "_itemCode"]) {
                        this.menuData[i][day + "_itemQty"] = row[day + "_itemQty"];
                        this.menuData[i][day + "_itemBOM"] = row[day + "_itemBOM"];
                        this.menuData[i][day + "_changeFlag"] = row[day + "_changeFlag"];
                        break;
                    }
                }
            },
            // 背景色设置
            BGColor(row, col) {
                var cssStr = "";

                if(row[col + "_deleteFlag"] == "1")
                    cssStr = "card-del-background";
                else if(row[col + "_changeFlag"] == "1")
                    cssStr = "card-war-background";
                else {
                    if(row[col + "_itemType"] != "FG")
                        cssStr = "card-rm-background";
                    else
                    cssStr = "card-background";
                }
                if(!isNullOrWhiteSpace(row[col + "_itemColor"]))
                    cssStr = cssStr + " " + "card-border-color";

                return cssStr;
            },
            // 将画面的显示用JSON暂存到本地
            SaveMenuDataLocal() {
                /***检查是否要暂存***/
                var checkFlag = false;

                for(var menuObj of this.menuData) {
                    // 检查是否有新追加的记录
                    if((!isNullOrWhiteSpace(menuObj["1_itemName"]) && isNullOrWhiteSpace(menuObj["1_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["2_itemName"]) && isNullOrWhiteSpace(menuObj["2_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["3_itemName"]) && isNullOrWhiteSpace(menuObj["3_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["4_itemName"]) && isNullOrWhiteSpace(menuObj["4_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["5_itemName"]) && isNullOrWhiteSpace(menuObj["5_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["6_itemName"]) && isNullOrWhiteSpace(menuObj["6_headGuid"])) ||
                       (!isNullOrWhiteSpace(menuObj["7_itemName"]) && isNullOrWhiteSpace(menuObj["7_headGuid"]))) {
                        checkFlag = true;
                        break;
                    }
                    // 检查是否有数量修改的记录
                    if((!isNullOrWhiteSpace(menuObj["1_itemQty_bak"]) && menuObj["1_itemQty"] != menuObj["1_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["2_itemQty_bak"]) && menuObj["2_itemQty"] != menuObj["2_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["3_itemQty_bak"]) && menuObj["3_itemQty"] != menuObj["3_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["4_itemQty_bak"]) && menuObj["4_itemQty"] != menuObj["4_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["5_itemQty_bak"]) && menuObj["5_itemQty"] != menuObj["5_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["6_itemQty_bak"]) && menuObj["6_itemQty"] != menuObj["6_itemQty_bak"]) ||
                       (!isNullOrWhiteSpace(menuObj["7_itemQty_bak"]) && menuObj["7_itemQty"] != menuObj["7_itemQty_bak"])) {
                        checkFlag = true;
                        break;
                    }
                    // 检查是否有待删除记录
                    if(menuObj["1_deleteFlag"] == "1" ||
                       menuObj["2_deleteFlag"] == "1" ||
                       menuObj["3_deleteFlag"] == "1" ||
                       menuObj["4_deleteFlag"] == "1" ||
                       menuObj["5_deleteFlag"] == "1" ||
                       menuObj["6_deleteFlag"] == "1" ||
                       menuObj["7_deleteFlag"] == "1") {
                        checkFlag = true;
                        break;
                    }
                    if(checkFlag) {
                        /***保存Json***/
                    } else {
                        /***删除Json***/
                    }
                }
            },
            // 设置ItemName字体大小
            cardItemName(row, day) {
                if(row[day + "_itemName"].length > 6) {
                    return "card-itemName-small";
                } else
                    return "card-itemName";
            },
            // 小数类型保留小数位数
            float(price, fix) {
                return float(price, fix);
            },
            // 取得开始日期（测试用）
            GetStartDate() {
                // 执行保存
                GetConfig("DaylySDate").then(data => {
                    if (data && data.code === '200') {
                        this.sDate = data.content;
                    } else {
                        this.sDate = this.formatDate((new Date()), 'yyyy-MM-dd');
                    }
                    this.getUserInfo();
                    this.GetCCWhs();
                });
            },
            // 首列背景色
            cellClassName({row, column, rowIndex, columnIndex}) {
                if(columnIndex == 0) {
                    return row.bgColor;
                }
            },
            // 询问是否打开采购数量调整画面
            GoPurchaseNewItemDialog(bom) {
                this.$confirm('当前菜中含有调整过采购数量的原料，是否前往删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    for(var bomObj of bom) {
                        if(!isNullOrWhiteSpace(bomObj.hasAdj))
                            this.dialogParam.checkItemString = this.dialogParam.checkItemString + bomObj.itemCode + ",";
                    }
                    this.showDialogPurchaseOrder();
                });
            },
            // 日期变更
            ChangeDate() {
                // 检查是否有记录被修改
                this.CheckHasChange();
                // 保存前Check
                if(this.menuOrderHead.length == 0) {
                    this.GetMealTypeList();
                    return;
                }
                var message = "有修改尚未保存，要继续吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 重新获取画面数据
                    this.GetMealTypeList();
                }).catch(() => {
                    this.nextWorkingDay = this.nextWorkingDay_back;
                });
            },
            // 设置终止时间
            SetExpiryTime() {
                var tempDate = this.nextWorkingDay + " " + this.ccWhsObj.catPOEndTime + ":00";
//                var tempDate = "2018-05-10 17:22:00";

                this.expiryTime = new Date(tempDate);
            },
            // 距离截止时间计算
            formatSeconds(val) {
                return formatSeconds(val);
            },
            // 取消编辑
            CancelEdit() {
                var message = "确定取消所有修改吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    this.GetMenuOrder();
                }).catch(()=>{
                    this.loading = false;
                });
            },
            CostDisp(row, col) {
                var itemCost = row[col + '_itemCost'] * 1;
                var otherCost = row[col + '_otherCost'] * 1;
                var result = float(this.otherCost? itemCost: (itemCost - otherCost), 2);

                return result;
            }
        },
        created() {
            this.GetStartDate();
//            this.SetNextWorkingDay();
//            this.getUserInfo();
//            this.GetCCWhs();
        },
        //el挂载到实例上后调用，一般我们的第一个业务逻辑会在这里开始
        mounted:function () {
            var _this = this;  //声明一个变量指向Vue实例this，保证作用域一致
            this.timer = setInterval(function(){
                _this.nowTime = new Date();  //修改数据date
            },1000)
        },
        //实例销毁之前调用。主要解绑一些使用addEventListener监听的事件等
        beforeDestroy:function(){
            if(this.timer){
                clearInterval(this.timer);  //在Vue实例销毁前，清除我们的定时器
            }
        }
    };
</script>

<style>
    @import '../../assets/css/common.css';

    .card-background {
        background-image: linear-gradient( 135deg, #eaffeb 10%, #adfcea 100%);
    }
    .card-rm-background {
        background-image: linear-gradient( 135deg, #ffffd8 10%, #feffb0 100%);
    }
    .card-del-background {
        background-image: linear-gradient( 135deg, #fff2ed 10%, #ffd9cc 100%);
    }
    .card-war-background {
        background-image: linear-gradient( 135deg, #f8f8f8 10%, #e1e1e1 100%);
    }

    .bg-1 {
        background: #e7fff3;
    }
    .bg-2 {
        background: #feffeb;
    }
    .bg-3 {
        background: #e6f5ff;
    }
    .bg-4 {
        background: #eaebff;
    }
    .bg-5 {
        background: #f5ecff;
    }

    .time {
        font-size: 11px;
        color: #999;
    }
    .button {
        padding: 0;
        float: right;
    }
    .tool_button {
        padding: 5px 4px 5px 2px;
    }
    .tool_tag {
        margin-left: 2px;
        padding-left: 5px;
        padding-right: 5px;
    }
    .el-table td, .el-table th {
        padding-top: 3px ;
        padding-bottom: 3px;
    }
    .bottom {
        margin-top: 10px;
        line-height: 12px;
    }
    .icon {
        font-size: 40px;
        font-weight: bold;
        color: #c8c8c8;
        line-height: 147px;
        height: 147px;
    }
    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button{
        -webkit-appearance: none !important;
        margin: 0;
    }

    .touchArea {
        width: 50%;
        height: 85%;
        position: absolute;
        /*filter: alpha(opacity = 60);*/
        opacity: 0;
        z-index: 700;
        cursor:pointer;
    }
    .adjArea {
        width: 88%;
        height: 82%;
        position: absolute;
        /*filter: alpha(opacity = 60);*/
        opacity: 0;
        z-index: 600;
        cursor:pointer;
    }
    .card-input {
        border-color: #b6b6b6;
        border-style: solid;
        border-top-width: 0px;
        border-right-width: 0px;
        border-bottom-width: 1px;
        border-left-width: 0px;
        width:30px;
        background-color: transparent;
        text-align: center
    }
    .card-del {
        float:right;
        margin-top: 3px
    }
    .card-lock {
        float:right;
        margin-top: 0px;
        color: #afafaf;
        font-size: 18px;
    }
    .card-itemName {
        font-size: 14px;
        margin-top:10px;
        color: #636363
    }
    .card-itemName-small {
        font-size: 12px;
        margin-top:10px;
        color: #636363
    }
    .new-item {
        color:red;
        font-size:12px;
        font-style:italic;
        white-space: nowrap;
    }
    .itemUnitCode {
        font-size: 12px;
    }

    .table-area {
        position: relative;
    }

    .table-area:before {
        z-index:900;
        content: "  日单已截止  ";
        font-size: 21pt;

        position: absolute;
        top: 20%;
        left: 50%;
        margin-left: -80px;

        /*background-color: rgba(255, 255, 0, 0.7);*/
        background-image: linear-gradient( 135deg, #fcffc6 10%, #FFFF00 100%);
        color: #777777;
        border-radius: 5px;
        border-style:solid;
        border-width:2px;
        border-color:#777777;
        -webkit-transform:rotate(-40deg);
        opacity: 0.75;
    }
    .disabled-area {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index:800;
        background-color: #f7f7f7;
        opacity: 0.4;
    }
    .card-border-color {
        border-left:4px solid;
    }
</style>