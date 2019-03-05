<template>
    <div v-loading="loading"
         element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <el-cascader
                        :options="ccWhsOption"
                        v-model="selectCCWhs"
                        style="width:340px"
                        placeholder="请选择成本中心，也可输入关键词"
                        filterable
                        separator="/"
                        expand-trigger="hover"
                        size="small"
                        :props="ccWhsProps"
                        @change="CreateEdit">
                </el-cascader>
                <el-button type="primary"
                           size="small"
                           :disabled="r_week || menuData.length == 0"
                           @click="SaveMenuOrder"><i class="fa fa-save" aria-hidden="true"></i> 保存
                </el-button>
                <el-button type="danger"
                           size="small"
                           style="margin-left: 0px"
                           :disabled="r_week || menuData.length == 0"
                           @click="CancelEdit"><i class="fa fa-refresh" aria-hidden="true"></i> 取消
                </el-button>
                <el-dropdown trigger="click">
                    <el-button type="warning" size="small"
                               :disabled="menuData.length == 0 && !showCopy">
                        <i class="fa fa-gear" aria-hidden="true"></i> 操作
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="WeeklyPO"
                                          :disabled="menuData.length == 0">打印周采购单
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="PrintWeeklyMenu"
                                          :disabled="menuData.length == 0">打印周单
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="MenuProcess"
                                          :disabled="menuData.length == 0">打印工艺单
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="MailWeeklyMenu('display')"
                                          :disabled="menuData.length == 0">邮件周单
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="showDialogPurchaseOrder('')"
                                          :disabled="menuData.length == 0">修改供应商
                        </el-dropdown-item>
                        <!--<el-dropdown-item @click.native="showCopyToolBar('')">{{showCopy?'隐藏':'显示'}}复制栏-->
                        <!--</el-dropdown-item>-->
                    </el-dropdown-menu>
                </el-dropdown>
                <el-button-group style="margin-left: 10px">
                    <el-button type="info" size="small" icon="el-icon-arrow-left"
                               :disabled="selectCCWhs.length == 0"
                               @click="WeekChange('-')">上一周
                    </el-button>
                    <el-button type="info" size="small"
                               :disabled="selectCCWhs.length == 0"
                               @click="WeekChange('+')">下一周<i class="el-icon-arrow-right el-icon--right"></i>
                    </el-button>
                </el-button-group>
                <div style="float:right">
                    <el-checkbox label="复制"
                                 v-model="copyChecked"
                                 border size="small"
                                 @change="CopyCheckBox()"></el-checkbox>
                    <el-checkbox v-model="otherCost"
                                 label="含调味品成本"
                                 style="margin-left:2px"
                                 border size="small"></el-checkbox>
                </div>
            </el-col>
        </el-row>
        <el-table :data="copyData"
                  border
                  :show-header="false"
                  style="width: 100%"
                  :cell-class-name="cellClassCopy"
                  v-if="showCopy">
            <el-table-column
                    align="left"
                    label="餐次"
                    width="148">
                <template slot-scope="scope">
                    <el-checkbox type="info"
                                 size="mini"
                                 border
                                 v-model="selAll"
                                 v-if="s_btnType == 'warning'"
                                 @change="select">全选
                    </el-checkbox>
                    <!--<el-button type="danger"-->
                               <!--size="mini"-->
                               <!--class="tool_button_copy"-->
                               <!--plain-->
                               <!--v-if="s_btnType == 'success'"-->
                               <!--@click="InitialClipper()">-->
                        <!--<i class="fa fa-undo"></i> 撤销-->
                    <!--</el-button>-->
                    <el-button :type="s_btnType"
                               size="mini"
                               class="tool_button_copy"
                               :disabled="r_copy"
                               plain
                               @click="Operate">
                        <i :class="s_btnType == 'warning'? 'fa fa-copy': 'fa fa-paste'"></i>
                        {{s_btnType == 'warning'?'复制':'粘贴'}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column
                    v-for="(item, index) in weekNameData"
                    :key="item.day"
                    header-align="center"
                    :width="$refs.docTable.columns[index + 2].realWidth">
                <template slot-scope="scope">
                    <el-checkbox type="info"
                                 size="mini"
                                 border
                                 :disabled="CheckWarDisabled_D(item.day) ||
                                            CheckSucDisabled_D(item.day) ||
                                            CheckSucCount_D(copyData[0][item.day])"
                                 v-model="copyData[0][item.day]">选择
                    </el-checkbox>
                </template>
            </el-table-column>
        </el-table>

        <el-table
                ref="docTable"
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
            <el-table-column
                    v-for="(item, index) in weekNameData"
                    :key="item.day"
                    header-align="center"
                    :label="item.name + ' ' + weekData[item.day + '_date'].substr(5,10)">
                <template slot-scope="scope">
                    <el-card :body-style="{ padding: '5px' }"
                             :style="{'border-left-color': isNullOrWhiteSpace(scope.row[item.day + '_itemColor'])? '': scope.row[item.day + '_itemColor']}"
                             :class="BGColor(scope.row, item.day)"
                             v-if="!scope.row.isTool && !isNullOrWhiteSpace(scope.row[item.day + '_itemName'])">
                        <div class="frozenArea"
                             v-if="CheckMinRequiredDate(scope.row[item.day + '_minRequiredDate'])"
                             @click="FrozenItem"></div>
                        <div class="adjArea"
                             v-if="!isNullOrWhiteSpace(scope.row[item.day + '_hasAdj'])"
                             @click="GoPurchaseNewItemDialog(scope.row[item.day + '_itemBOM'], item.day)"></div>
                        <div class="touchArea"
                             v-if="scope.row[item.day + '_itemType'] == 'FG' &&
                                   isNullOrWhiteSpace(scope.row[item.day + '_hasAdj'])"
                             @click="showDialogRM(scope.row.origIndex, item.day, scope.row.mealType,typeof(selectCCWhs[1])==='undefined'?'':selectCCWhs[1].trim(),item.name + ' ' + weekData[item.day + '_date'])"></div>
                        <el-row style="line-height:15px">
                            <el-col :span="20">
                                <span :class="cardItemName(scope.row, item.day)">{{ scope.row[item.day + '_itemName'] }}</span>
                                <span class="new-item"
                                      v-if="isNullOrWhiteSpace(scope.row[item.day + '_headGuid'])">new!</span>
                            </el-col>
                            <el-col :span="4">
                                <span class="frozen"
                                      v-if="CheckMinRequiredDate(scope.row[item.day + '_minRequiredDate'])">
                                    PO
                                </span>
                                <el-button type="danger"
                                           class="button card-del"
                                           v-else-if="isNullOrWhiteSpace(scope.row[item.day + '_hasAdj'])"
                                           @click="deleteItem(scope.row.origIndex, item.day)">
                                    <i :class="scope.row[item.day + '_deleteFlag'] == '1' ? 'fa fa-undo': 'el-icon-minus'"></i>
                                </el-button>
                                </el-button>
                                <span class="card-lock"
                                      v-else>
                                    <i class="fa fa-lock"></i>
                                </span>
                            </el-col>
                        </el-row>
                        <div style="float:right;margin-top:5px">
                            <!--下划线输入框-->
                            <input type="text" name="name" size="12"
                                   v-model="scope.row[item.day + '_itemQty']"
                                   :readonly="!isNullOrWhiteSpace(scope.row[item.day + '_hasAdj'])"
                                   @input="handleInput(scope.row, item.day)"
                                   @blur="UpdateQty(scope.row, item.day, scope.$index)"
                                   class="card-input"/>
                            <span class="itemUnitCode">{{ scope.row[item.day + '_itemUnitCode'] }}</span>
                        </div>
                        <div class="bottom clearfix">
                            <time class="time">
                                {{ CostDisp(scope.row, item.day) }}元
                            </time>
                        </div>
                    </el-card>
                    <div v-if="scope.row.isTool">
                        <el-checkbox type="info"
                                     size="mini"
                                     border
                                     v-if="showCopy"
                                     v-model="scope.row[item.day + '_checked']"
                                     :disabled="CheckWarDisabled_M(item.day) ||
                                                CheckSucDisabled_M(item.day, scope.row.mealType ) ||
                                                CheckSucCount_M(item.day, scope.row[item.day + '_checked'])">
                        </el-checkbox>
                        <el-button type="primary"
                                   size="mini"
                                   class="tool_button"
                                   plain
                                   v-if="!showCopy"
                                   @click="showDialog(scope.row.soItemGuid, scope.row.mealType, item.day)">
                            <i class="el-icon-plus" aria-hidden="true"> 加菜</i>
                        </el-button>
                        <el-tag size="small"
                                class="tool_tag"
                                type="info">{{scope.row.isTool ? totalAmtByDay(item.day, scope.row.mealType): ""}} 元
                        </el-tag>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <!-- 菜选择共用画面 -->
        <NewDish :ShowSearchItemsDialog="ShowSearchItemsDialog"
                 :DBName="dialogParam.dbName"
                 :RequiredDate="dialogParam.requiredDate"
                 :RequiredQty="dialogParam.requiredQty"
                 :costCenterCode="dialogParam.costCenterCode"
                 :WeekDay="dialogParam.weekDay"
                 :MealName="dialogParam.mealName"
                 :Items="selItems"
                 @onShowSearchItemsDialog="onShowSearchItemsDialog"
                 @getItemsData="closeDialog">
        </NewDish>
        <NewRM :ShowRMItemDialog="ShowRMItemDialog"
               :DBName="dialogParam.dbName"
               :RequiredDate="dialogParam.requiredDate"
               :RequiredQty="dialogParam.requiredQty"
               :costCenterCode="dialogParam.costCenterCode"
               :itemBOM="dialogParam.itemBOM"
               :itemName_ZH="dialogParam.itemName"
               :mealType="dialogParam.mealType"
               :whs="dialogParam.whs"
               :weekDay="dialogParam.weekDay"
               @onShowRMItemDialog="onShowRMItemDialog"
               @getItemsData="closeDialogRM">
        </NewRM>
        <PurchaseNewItemDialog
                :showDialog="ShowPurchaseNewItemDialog"
                :orderDate="isNullOrWhiteSpace(dialogParam.orderDate)? weekData.mon_date: dialogParam.orderDate"
                :dbCode="dialogParam.dbName"
                :costCenterCode="dialogParam.costCenterCode"
                :costCenterName="dialogParam.costCenterName"
                :checkItemString="dialogParam.checkItemString"
                :isWeekly="true"
                :disabled="r_week"
                @onShowDialog="onShowPurchaseNewItemDialog"
                @closeDialog="closePurchaseNewItemDialog">
        </PurchaseNewItemDialog>
        <el-dialog title="发送邮件至联系人"
                   :visible.sync="MailRecipient"
                   width="30%"
                   top="50px">
            <el-row style="margin-top:0px">
                <el-tag>{{typeof(selectCCWhs[0])==='undefined'?'':selectCCWhs[0]}}</el-tag>
            </el-row>
            <el-row>
                <el-col>
                    <span>收件人邮箱：</span>
                    <el-input v-model="recipient" type="textarea" :rows="3"></el-input>
                </el-col>
                <el-col>
                    <span><i>联系人之间只能用分号（英文字符）隔开，不可用回车</i></span>
                    <br>
                    <el-button size="small" type="primary" @click="confirmMail('update')" style="width:100%">确定
                    </el-button>
                </el-col>
            </el-row>
        </el-dialog>
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
        IsInArray,
        arraySearch
    } from '../../assets/js/common';

    import {
        GetCCWhs,
        GetMealTypeList,
        SaveMenuOrder,
        GetMenuOrder,
        showPDF,
        MenuAction,
        GetConfig,
        ShowExcel,
        SendExcel,
        ChangeRecipientsofWeeklyMenu
    } from '../../api/api'

    /***Object Json模板***/
    import bomModel from '../../../static/bomObj.json';
    import menuModel from '../../../static/menuObj.json';
    import menuOrderModel from '../../../static/menuOrder.json';
    /***Common View Import***/
    import ShowSearchItemsDialog from '../../components/ItemsSearchDialog.vue';
    import ShowRMItemDialog from '../../components/RMItemDialog.vue';
    import PurchaseNewItemDialog from '../../components/PurchaseNewItem.vue';

    export default {
        data() {
            return {
                selAll: false,
                showCopy: false,
                copyData: [{
                    mon: false,
                    tue: false,
                    wed: false,
                    thu: false,
                    fri: false,
                    sat: false,
                    sun: false,
                    mon_disabled: false,
                    tue_disabled: false,
                    wed_disabled: false,
                    thu_disabled: false,
                    fri_disabled: false,
                    sat_disabled: false,
                    sun_disabled: false,
                }],
                testBorderColor: "#409eff63",
                otherCost: false,
                sDate: "",
                loading: false,
                isLocal: false,
                user: "",
                menuData: [],
                ccWhs: [],
                lastColumn1Var: '',
                lastColumn2Var: '',
                fullHeight: window.innerHeight - 192,
                menuDataFomat: [],
                clipper: {
                    pasteData: [],
                    copyDays: [],
                    pasteDays: [],
                    copyMealType: {
                        day: "",
                        date: "",
                        mealType: []
                    },
                    pasteMealTypes: []
                },
                mealTypeData: [],
                ShowSearchItemsDialog: false,
                ShowRMItemDialog: false,
                ShowPurchaseNewItemDialog: false,
                selectCCWhs: [],
                props: {
                    value: "value",
                    children: "children"
                },
                ccWhsProps: {
                    children: "lstCCWindows"
                },
                weekData: {
                    mon_date: '',
                    tue_date: '',
                    wed_date: '',
                    thu_date: '',
                    fri_date: '',
                    sat_date: '',
                    sun_date: '',
                },
                weekNameData: [{
                    day: "mon",
                    name: "周一",
                }, {
                    day: "tue",
                    name: "周二"
                }, {
                    day: "wed",
                    name: "周三"
                }, {
                    day: "thu",
                    name: "周四"
                }, {
                    day: "fri",
                    name: "周五"
                }, {
                    day: "sat",
                    name: "周六"
                }, {
                    day: "sun",
                    name: "周日"
                }],
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
                selDay: "",
                selIndex: -1,
                ccWhsOption: [],
                ccWhsObj: "",
                weekDateOption: [],
                thisMonday: "",
                selItems: [],
                menuOrderHead: [],
                dialogParam: {
                    dbName: "",
                    requiredDate: "",
                    orderDate: "",
                    requiredQty: "",
                    supplierCodes: "",
                    costCenterCode: "",
                    costCenterName: "",
                    itemBOM: "",
                    weekDay: "",
                    mealName: "",
                    itemName: "",
                    checkItemString: "",
                    mealType: "",
                    whs: ""
                },
                canChange: '',
                MailRecipient: false,
                recipient: '',
                tableName: "CCMast",
                fieldName: "recipientsofMenu",
                recordId: '',
                oldVal: '',
                newVal: '',
                copyChecked: false
            };
        },
        computed: {
            // 复制/粘贴按钮样式控制
            s_btnType: function () {
                if (this.clipper.copyDays.length > 0 || this.clipper.copyMealType.mealType.length > 0)
                    return 'success';
                return 'warning';
            },
            // 复制按钮是否可用
            r_copy: function () {
                for (var weekObj of this.weekNameData) {
                    if (this.copyData[0][weekObj.day])
                        return false
                }
                for (var row of this.menuDataFomat) {
                    for (var weekObj of this.weekNameData) {
                        if (row[weekObj.day + "_checked"])
                            return false;
                    }
                }
                return true;
            },
            // 判断日期是否小于下周
            r_week: function() {
                if(this.thisMonday > this.weekData.mon_date)
                    return true;
                else
                    return false;
            }
        },
        components: {
            'NewDish': ShowSearchItemsDialog,
            'NewRM': ShowRMItemDialog,
            'PurchaseNewItemDialog': PurchaseNewItemDialog,
        },
        methods: {
            //打印周采购单
            WeeklyPO(){
                this.CheckHasChange();

                if (this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                var reg = new RegExp('/', "g")
                showPDF('WeeklyPOForm', {
                    RequiredDateStart: this.weekData.mon_date.replace(reg, "-"),
                    RequiredDateEnd: this.weekData.sun_date.replace(reg, "-"),
                    CostCenter: ccObj.costCenterCode,
                });
            },

            //导出工艺单
            MenuProcess(){

                this.CheckHasChange();

                if (this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                var windowObj = null;
                var windowName = null;
                if (this.selectCCWhs.length > 1) {
                    windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");
                    windowName = windowObj.windowName;
                }

                ShowExcel({
                    windowName: windowName,
                    startDate: this.weekData.mon_date,
                    costCenterCode: ccObj.costCenterCode,
                    reportType: 'menuProcess'
                });
            },
            //打印周单
            PrintWeeklyMenu(){

                this.CheckHasChange();

                if (this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                var windowObj = null;
                var windowName = null;
                if (this.selectCCWhs.length > 1) {
                    windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");
                    windowName = windowObj.windowName;
                }

                ShowExcel({
                    costCenterName: typeof(getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode")) === 'undefined' ? "" : getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode").costCenterName_ZH,
                    windowName: windowName,
                    startDate: this.weekData.mon_date,
                    costCenterCode: ccObj.costCenterCode,
                    reportType: 'weeklyMenu'
                });
            },
            //邮件周单
            MailWeeklyMenu(action){
                this.dataLog = [];
                this.recipient = '';
                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                ChangeRecipientsofWeeklyMenu({
                    "": JSON.stringify({
                        costCenterCode: ccObj.costCenterCode,
                        mark: action,
                    })
                }).then((data) => {
                    if (data && data.code === '200') {

                        for (let line of data.content) {
                            this.recipient = line.recipientsofMenu;
                            this.recordId = line.id;
                            this.oldVal = line.recipientsofMenu;
                        }
                    }
                    this.MailRecipient = true;
                }).catch(() => console.log('Fail'));
            },
            confirmMail(action){
                if (this.recipient === null || typeof(this.recipient) === 'undefined') {
                    this.$message.info("请输入收件人邮箱");
                    return;
                }

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");

                this.newVal = this.recipient;

                //新旧值进行对比，如果不一致，更新表dataLog
                if (this.oldVal !== this.newVal) {
                    ChangeRecipientsofWeeklyMenu({
                        "": JSON.stringify({
                            costCenterCode: ccObj.costCenterCode,
                            mark: action,
                            tableName: this.tableName,
                            fieldName: this.fieldName,
                            recordId: this.recordId,
                            oldVal: this.oldVal === null || typeof(this.oldVal) === 'undefined' ? "" : this.oldVal,
                            newVal: this.newVal === null || typeof(this.newVal) === 'undefined' ? "" : this.newVal
                        })
                    }).then((data) => {
                        if (data && data.code === '200') {
                            for (let line of data.content) {
                                this.recipient = line.recipientsofMenu;
                                this.recordId = line.id;
                                this.oldVal = line.recipientsofMenu;
                            }
                            this.$message.success("收件人邮箱地址已更改！");
                        }
                    }).catch(() => {
                        console.log('Fail');
                    });
                }
                this.$confirm('确认要发送邮件吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'question'
                }).then(() => {
                    this.CheckHasChange();

                    if (this.menuOrderHead.length > 0) {
                        this.$message({
                            type: 'warning',
                            message: "请先【保存】或【取消】后再进行该操作!"
                        });
                        return;
                    }

                    var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                    var windowObj = null;
                    var windowName = null;
                    if (this.selectCCWhs.length > 1) {
                        windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");
                        windowName = windowObj.windowName;
                    }


                    SendExcel({
                        windowName: windowName,
                        startDate: this.weekData.mon_date,
                        costCenterCode: ccObj.costCenterCode,
                        reportType: 'mailweeklyMenu',
                        sendType: 'SendWeeklyMenu',
                        recipients: this.recipient
                    }).then(() => {
                        this.$message.success("邮件已经发送");
                    }).catch(() => {
                        this.$message.success("邮件发送失败");
                    }).finally(() => {
                        this.MailRecipient = false;
                    });

                }).catch(() => {
                    console.log('Fail');
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
            objectSpanMethod({row, column, rowIndex, columnIndex}) {
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
            },
            // 检查首列的合并状况
            checkFirstColumn(rowIndex, fieldName) {
                if (rowIndex == 0)
                    this.lastColumn1Var = "";

                var val = this.menuData[rowIndex][fieldName];

                if (val == this.lastColumn1Var)
                    return 0;
                else
                    this.lastColumn1Var = val;

                for (var i = this.menuData.length - 1; i >= 0; i--) {
                    if (this.menuData[i][fieldName] == val) {
                        return i - rowIndex + 1;
                    }
                }
            },
            // 检查第二列的合并状况
            checkSecondColumn(rowIndex, parentFieldName, childFieldName) {
                // 要循环两边，所以加上此判断（原因未知）
                if (rowIndex == 0)
                    this.lastColumn2Var = "";
                // 父列的值
                var valParent = this.menuData[rowIndex][parentFieldName];
                // 当前列的值
                var valChild = this.menuData[rowIndex][childFieldName];

                if (valChild == this.lastColumn2Var)
                    return 0;
                else
                    this.lastColumn2Var = valChild;

                for (var i = this.menuData.length - 1; i >= 0; i--) {
                    if (this.menuData[i][parentFieldName] != valParent)
                        continue;
                    if (this.menuData[i][childFieldName] == valChild)
                        return i - rowIndex + 1;
                }
            },
            // 格式化菜单表
            formatMenuData() {
                // 设置当前MenuData原始顺序Index
                this.SetMenuDataIndex();

                this.menuDataFomat = [];
                var menuObj = null;
                var rowspan1 = 0;
                var rowspan2 = 0;
                var menuTypeCurr = "";
                var firstRowIndex1 = null;
                var firstRowIndex2 = null;

                for (var i = 0; i < this.mealTypeData.length; i++) {
                    if (!isNullOrWhiteSpace(firstRowIndex1) && firstRowIndex1 > 0) {
                        this.menuDataFomat[firstRowIndex1].rowspan1 = rowspan1;
                    }
                    if (!isNullOrWhiteSpace(firstRowIndex2) && firstRowIndex2 > 0) {
                        this.menuDataFomat[firstRowIndex2].rowspan2 = rowspan2;
                    }
                    firstRowIndex1 = null;
                    firstRowIndex2 = null;
                    menuTypeCurr = "";
                    rowspan1 = 1;
                    rowspan2 = 1;

                    /***Menu Object***/
                    var menuTemp = deepCopy(menuModel);

                    menuTemp.soItemGuid = this.mealTypeData[i].itemGuid;
                    menuTemp.mealType = this.mealTypeData[i].productDesc;
                    menuTemp.rowspan1 = rowspan1;
                    menuTemp.rowspan2 = rowspan1;
                    menuTemp.isTool = true;
                    menuTemp.origIndex = -1;

                    this.menuDataFomat.push(menuTemp);

                    firstRowIndex1 = this.menuDataFomat.length - 1;
                    firstRowIndex2 = this.menuDataFomat.length - 1;

                    for (var j = 0; j < this.menuData.length; j++) {
                        menuObj = this.menuData[j];

                        if (menuObj.mealType == this.mealTypeData[i].productDesc) {
                            rowspan1 = rowspan1 + 1;

                            if (menuObj.menuType == menuTypeCurr || isNullOrWhiteSpace(menuTypeCurr)) {
                                rowspan2 = rowspan2 + 1;
                                if (isNullOrWhiteSpace(menuTypeCurr)) {
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
                            var menuTemp1 = deepCopy(menuModel);
                            menuTemp1.soItemGuid = this.mealTypeData[i].itemGuid;
                            menuTemp1.mealType = this.mealTypeData[i].productDesc;
                            menuTemp1.menuType = menuObj.menuType;
                            for (var item of this.weekNameData) {
                                menuTemp1[item.day + '_headGuid'] = menuObj[item.day + '_headGuid'];
                                menuTemp1[item.day + '_changeFlag'] = menuObj[item.day + '_changeFlag'];
                                menuTemp1[item.day + '_deleteFlag'] = menuObj[item.day + '_deleteFlag'];
                                menuTemp1[item.day + '_itemGuid'] = menuObj[item.day + '_itemGuid'];
                                menuTemp1[item.day + '_itemCode'] = menuObj[item.day + '_itemCode'];
                                menuTemp1[item.day + '_itemType'] = menuObj[item.day + '_itemType'];
                                menuTemp1[item.day + '_itemName'] = menuObj[item.day + '_itemName'];
                                menuTemp1[item.day + '_itemCost'] = menuObj[item.day + '_itemCost'];
                                menuTemp1[item.day + '_itemUnitCode'] = menuObj[item.day + '_itemUnitCode'];
                                menuTemp1[item.day + '_otherCost'] = menuObj[item.day + '_otherCost'];
                                menuTemp1[item.day + '_itemQty'] = menuObj[item.day + '_itemQty'];
                                menuTemp1[item.day + '_itemBOM'] = menuObj[item.day + '_itemBOM'];
                                menuTemp1[item.day + '_hasAdj'] = menuObj[item.day + '_hasAdj'];
                                menuTemp1[item.day + '_itemColor'] = menuObj[item.day + '_itemColor'];
                                menuTemp1[item.day + '_minRequiredDate'] = menuObj[item.day + '_minRequiredDate'];
                            }
                            menuTemp1.rowspan1 = 0;
                            menuTemp1.rowspan2 = 0;
                            menuTemp1.isTool = false;
                            menuTemp1.origIndex = j;

                            this.menuDataFomat.push(menuTemp1);
                        }
                    }
                    this.menuDataFomat[firstRowIndex1].rowspan1 = rowspan1;
                    this.menuDataFomat[firstRowIndex2].rowspan2 = rowspan2;
                }
                this.SetColor();
                this.loading = false;
            },
            SetColor() {
                var mealType = "";
                var row;

                for (var i = 0; i < this.menuDataFomat.length; i++) {
                    row = this.menuDataFomat[i];

                    if (row.mealType != mealType) {
                        mealType = row.mealType;

                        var flag;
                        if (this.bgColorFlag)
                            flag = true;
                        else
                            flag = false;

                        for (var j = 0; j < this.bgColorList.length; j++) {
                            if (this.bgColorList[j].flag == flag) {
                                this.bgColorList[j].flag = !flag;
                                row.bgColor = this.bgColorList[j].className;

                                if (j == this.bgColorList.length - 1)
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
                this.selDay = day;
                this.dialogParam.requiredDate = this.formatDate(this.weekData[day + "_date"]);
                this.dialogParam.requiredQty = 100;
                this.dialogParam.weekDay = getRowFromArray(day, this.weekNameData, "day").name;
                this.dialogParam.mealName = mealType;
                this.ShowSearchItemsDialog = true;
            },
            /***Item对话框关闭***/
            closeDialog(val) {
                this.appendMeal(val);
                this.ShowSearchItemsDialog = false;
                this.selMealType = "";
                this.selDay = "";
            },
            /****打开RMItem对话框***/
            showDialogRM(origIndex, day, mealType, whs, weekDay) {
                this.selIndex = origIndex;
                this.selDay = day;
                this.dialogParam.itemBOM = this.menuData[this.selIndex][this.selDay + "_itemBOM"];
                this.dialogParam.requiredDate = this.formatDate(this.weekData[day + "_date"]);
                this.dialogParam.requiredQty = this.menuData[this.selIndex][this.selDay + "_itemQty"];
                this.dialogParam.itemName = this.menuData[this.selIndex][this.selDay + "_itemName"];
                this.dialogParam.mealType = mealType;
                // Angel 修改 20190129
                this.dialogParam.whs = isNullOrWhiteSpace(whs)?"":typeof(getRowFromArray(whs, getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode").lstCCWindows, "windowGuid")) === "undefined" ? "" : getRowFromArray(whs, getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode").lstCCWindows, "windowGuid").windowName;
                this.dialogParam.weekDay = weekDay;
                this.ShowRMItemDialog = true;
            },
            /***关闭RMItem对话框***/
            closeDialogRM(itemBOM) {
                var changeFlag = "";
                var message = "";
                var itemCost = 0;

                // itemCost更新 = actItemCost总和 + otherCost
                for (var bomObj of itemBOM) {
                    itemCost = itemCost + bomObj.actItemCost * 1;
                }

                itemCost = itemCost * 1 + this.menuData[this.selIndex][this.selDay + "_otherCost"] * 1;
                this.menuData[this.selIndex][this.selDay + "_itemCost"] = itemCost;

                changeFlag = this.CheckItemBOMChange(itemBOM);

                if (changeFlag == "1") {
                    message = "【" + this.menuData[this.selIndex][this.selDay + "_itemName"] + "】"
                        + "有原料信息标记为待修改";
                    this.$message({
                        type: 'warning',
                        message: message
                    });
                }
                this.menuData[this.selIndex][this.selDay + "_changeFlag"] = changeFlag;
                this.menuData[this.selIndex][this.selDay + "_itemBOM"] = itemBOM;
                this.formatMenuData();
            },
            showDialogPurchaseOrder(orderDate) {
                this.CheckHasChange();

                if (this.menuOrderHead.length > 0) {
                    this.$message({
                        type: 'warning',
                        message: "请先【保存】或【取消】后再进行该操作!"
                    });
                    return;
                }
                if (isNullOrWhiteSpace(orderDate))
                    this.dialogParam.orderDate = this.formatDate(this.weekData["mon_date"]);
                else
                    this.dialogParam.orderDate = orderDate;
                this.ShowPurchaseNewItemDialog = true;
            },
            closePurchaseNewItemDialog(val) {
                this.dialogParam.orderDate = val;
                this.loading = true;
                this.dialogParam.checkItemString = "";
                this.GetMenuOrder();
            },
            // MenuData按类别阶层排序
            SortMenuData() {
                var menuDataTemp = [];
                var menuDataWork = [];

                var mealType = "";

                for (var menuObj of this.menuData) {
                    if (mealType != menuObj.mealType) {
                        // 备份餐次和阶层
                        mealType = menuObj.mealType;
                        menuDataWork = menuDataWork.concat(this.DoSort(menuDataTemp));
                        menuDataTemp = [];
                    }
                    menuDataTemp.push(menuObj);
                }
                if (menuDataTemp.length > 0)
                    menuDataWork = menuDataWork.concat(this.DoSort(menuDataTemp));
                this.menuData = menuDataWork;
            },
            // 排序方法
            DoSort(menuDataTemp) {
                menuDataTemp = menuDataTemp.sort(function (x, y) {
                    var res = null;

                    if (x.classSort > y.classSort)
                        res = 1;
                    else if (x.classSort < y.classSort)
                        res = -1;
                    else if (x.classSort == y.classSort) {
                        if (y.index == -1)
                            res = -1;
                        else if (x.index > y.index && (x.index != -1 && y.index != -1))
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
                if (itemBOM == null)
                    return;
                for (var bom of itemBOM) {
                    bom.requiredQty = getRequiredQty(itemQty, bom.actQty, bom.conversionUnit, bom.conversionRate);
                }
            },
            // 添加选择的菜
            appendMeal(val) {
                var productGuid = "";
                var purchasePolicy = "";
                for (var meal of val) {
                    // 设置RequiredQty
                    this.setRequiredQty(100, meal.ItemBOM);

                    productGuid = "";
                    purchasePolicy = "";

                    if (meal.ItemBOM != null && meal.ItemBOM.length > 0) {
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
                        itemBOM: meal.ItemBOM,
                        itemQty: ""
                    });
                }
                // 可能存在新增行的情况，重新设定Index
                this.SetMenuDataIndex();

                // 按类别阶层重新排序
                this.SortMenuData();

                // 格式化显示Data
                this.formatMenuData();
            },
            appendMealPlus(meal) {
                // 匹配到餐次的最大Index
                var indexFoundMealType = -1;
                // 匹配到餐次+类别的最大Index
                var indexFoundMenuType = -1
                // 匹配到餐次+类且Item为空的行的Index
                var indexFoundSpace = -1;
                // work var
                var indexTemp = -1;
                // 存在Flag
                var isExist = false;
                // Menu Temp
                var menuTemp = null;

                if (isNullOrWhiteSpace(this.selMealType) ||
                    isNullOrWhiteSpace(this.selDay))
                    return;
                for (var i = 0; i < this.menuData.length; i++) {
                    if (this.menuData[i].mealType != this.selMealType &&
                        !this.menuData[i].isTool) {
                        continue;
                    }

                    indexFoundMealType = i;

                    if (this.menuData[i].menuType != meal.type) {
                        continue;
                    }

                    if (this.menuData[i][this.selDay + "_itemCode"] == meal.itemCode) {
                        isExist = true;
                        break;
                    }

                    indexFoundMenuType = i;

                    if (isNullOrWhiteSpace(this.menuData[i][this.selDay + "_itemName"])) {
                        indexFoundSpace = i;
                        break;
                    }
                }
                if (isExist) {
                    return;
                }
                if (indexFoundSpace > -1) {
                    this.menuData[indexFoundSpace][this.selDay + "_itemGuid"] = meal.itemGuid;
                    this.menuData[indexFoundSpace][this.selDay + "_itemCode"] = meal.itemCode;
                    this.menuData[indexFoundSpace][this.selDay + "_itemType"] = meal.itemType;
                    this.menuData[indexFoundSpace][this.selDay + "_itemName"] = meal.itemName;
                    this.menuData[indexFoundSpace][this.selDay + "_itemCost"] = meal.itemCost;
                    this.menuData[indexFoundSpace][this.selDay + "_itemUnitCode"] = meal.itemUnitCode;
                    this.menuData[indexFoundSpace][this.selDay + "_itemColor"] = meal.itemColor;
                    this.menuData[indexFoundSpace][this.selDay + "_otherCost"] = meal.otherCost;
                    this.menuData[indexFoundSpace][this.selDay + "_itemQty"] = isNullOrWhiteSpace(meal.itemQty) ? '100' : meal.itemQty;
                    this.menuData[indexFoundSpace][this.selDay + "_itemBOM"] = meal.itemBOM;
                    this.menuData[indexFoundSpace][this.selDay + "_productGuid"] = meal.productGuid;
                    this.menuData[indexFoundSpace][this.selDay + "_purchasePolicy"] = meal.purchasePolicy;
                    this.menuData[indexFoundSpace][this.selDay + "_hasAdj"] = "";
                    this.menuData[indexFoundSpace][this.selDay + "_minRequiredDate"] = "";
                } else {
                    // MenuType没找到的话以MealType为准，反之以自身为准
                    indexTemp = (indexFoundMenuType == -1) ? indexFoundMealType : indexFoundMenuType;
                    // MealType没找到的话取最大长度，反之当前匹配到MealType的最大Index + 1
                    indexTemp = (indexTemp == -1) ? this.menuData.length : indexTemp + 1;

                    // 插入一行
                    menuTemp = deepCopy(menuModel);
                    menuTemp.soItemGuid = this.selSoItemGuid;
                    menuTemp.mealType = this.selMealType;
                    menuTemp.menuType = meal.type;
                    menuTemp.classSort = meal.classSort;

                    this.menuData.splice(indexTemp, 0, menuTemp);
                    // 赋值
                    this.menuData[indexTemp][this.selDay + "_itemGuid"] = meal.itemGuid;
                    this.menuData[indexTemp][this.selDay + "_itemCode"] = meal.itemCode;
                    this.menuData[indexTemp][this.selDay + "_itemType"] = meal.itemType;
                    this.menuData[indexTemp][this.selDay + "_itemName"] = meal.itemName;
                    this.menuData[indexTemp][this.selDay + "_itemCost"] = meal.itemCost;
                    this.menuData[indexTemp][this.selDay + "_itemUnitCode"] = meal.itemUnitCode;
                    this.menuData[indexTemp][this.selDay + "_itemColor"] = meal.itemColor;
                    this.menuData[indexTemp][this.selDay + "_otherCost"] = meal.otherCost;
                    this.menuData[indexTemp][this.selDay + "_itemQty"] = isNullOrWhiteSpace(meal.itemQty) ? '100' : meal.itemQty;
                    this.menuData[indexTemp][this.selDay + "_itemBOM"] = meal.itemBOM;
                    this.menuData[indexTemp][this.selDay + "_productGuid"] = meal.productGuid;
                    this.menuData[indexTemp][this.selDay + "_purchasePolicy"] = meal.purchasePolicy;
                    this.menuData[indexTemp][this.selDay + "_hasAdj"] = "";
                    this.menuData[indexTemp][this.selDay + "_minRequiredDate"] = "";
                }
            },
            // 删除Item
            deleteItem(index, day) {
                if (!isNullOrWhiteSpace(this.menuData[index][day + "_headGuid"])) {
                    // 如果是来自数据库的记录时，打上删除标志
                    if (this.menuData[index][day + "_deleteFlag"] == "1") {
                        this.menuData[index][day + "_deleteFlag"] = "";
                        this.$message({
                            type: 'success',
                            message: "【" + this.menuData[index][day + "_itemName"] + "】" + "已撤销删除状态"
                        })
                    }
                    else {
                        this.menuData[index][day + "_deleteFlag"] = "1";
                        this.$message({
                            type: 'error',
                            message: "【" + this.menuData[index][day + "_itemName"] + "】" + "已标记为待删除"
                        })
                    }
                    // 格式化显示Data
                    this.formatMenuData();

                    return;
                }
                this.menuData[index][day + "_linkId"] = "";
                this.menuData[index][day + "_itemGuid"] = "";
                this.menuData[index][day + "_itemCode"] = "";
                this.menuData[index][day + "_itemType"] = "";
                this.menuData[index][day + "_itemName"] = "";
                this.menuData[index][day + "_itemCost"] = "";
                this.menuData[index][day + "_itemUnitCode"] = "";
                this.menuData[index][day + "_itemColor"] = "";
                this.menuData[index][day + "_otherCost"] = "";
                this.menuData[index][day + "_itemQty"] = "";
                this.menuData[index][day + "_itemBOM"] = null;
                this.menuData[index][day + "_productGuid"] = "";
                this.menuData[index][day + "_purchasePolicy"] = "";
                this.menuData[index][day + "_hasAdj"] = "";
                this.menuData[index][day + "_minRequiredDate"] = "";

                // 当该行的一周七天均没有菜时删除当前行
                if (isNullOrWhiteSpace(this.menuData[index].mon_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].tue_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].wed_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].thu_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].fri_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].sat_itemName) &&
                    isNullOrWhiteSpace(this.menuData[index].sun_itemName)) {
                    this.menuData.splice(index, 1);

                    // 格式化显示Data
                    this.formatMenuData();

                    return;
                }

                var mealType = this.menuData[index].mealType;
                var menuType = this.menuData[index].menuType;

                for (var i = 0; i < this.menuData.length; i++) {
                    if (this.menuData[i].mealType != mealType)
                        continue;
                    if (this.menuData[i].menuType != menuType)
                        continue;
                    if (isNullOrWhiteSpace(this.menuData[i][day + "_itemName"])) {
                        if (i < this.menuData.length - 1) {
                            if (this.menuData[i + 1].mealType == mealType &&
                                this.menuData[i + 1].menuType == menuType &&
                                !isNullOrWhiteSpace(this.menuData[i + 1][day + "_itemName"])) {
                                this.menuData[i][day + "_linkId"] = this.menuData[i + 1][day + "_linkId"];
                                this.menuData[i][day + "_itemGuid"] = this.menuData[i + 1][day + "_itemGuid"];
                                this.menuData[i][day + "_itemCode"] = this.menuData[i + 1][day + "_itemCode"];
                                this.menuData[i][day + "_itemType"] = this.menuData[i + 1][day + "_itemType"];
                                this.menuData[i][day + "_itemName"] = this.menuData[i + 1][day + "_itemName"];
                                this.menuData[i][day + "_itemCost"] = this.menuData[i + 1][day + "_itemCost"];
                                this.menuData[i][day + "_itemUnitCode"] = this.menuData[i + 1][day + "_itemUnitCode"];
                                this.menuData[i][day + "_itemColor"] = this.menuData[i + 1][day + "_itemColor"];
                                this.menuData[i][day + "_otherCost"] = this.menuData[i + 1][day + "_otherCost"];
                                this.menuData[i][day + "_itemQty"] = this.menuData[i + 1][day + "_itemQty"];
                                this.menuData[i][day + "_itemBOM"] = this.menuData[i + 1][day + "_itemBOM"];
                                this.menuData[i][day + "_productGuid"] = this.menuData[i + 1][day + "_productGuid"];
                                this.menuData[i][day + "_purchasePolicy"] = this.menuData[i + 1][day + "_purchasePolicy"];
                                this.menuData[i][day + "_hasAdj"] = this.menuData[i + 1][day + "_hasAdj"];
                                this.menuData[i][day + "_minRequiredDate"] = this.menuData[i + 1][day + "_minRequiredDate"];
                                this.menuData[i + 1][day + "_linkId"] = "";
                                this.menuData[i + 1][day + "_itemGuid"] = "";
                                this.menuData[i + 1][day + "_itemCode"] = "";
                                this.menuData[i + 1][day + "_itemName"] = "";
                                this.menuData[i + 1][day + "_itemCost"] = "";
                                this.menuData[i + 1][day + "_itemUnitCode"] = "";
                                this.menuData[i + 1][day + "_itemColor"] = "";
                                this.menuData[i + 1][day + "_otherCost"] = "";
                                this.menuData[i + 1][day + "_itemQty"] = "";
                                this.menuData[i + 1][day + "_itemBOM"] = null;
                                this.menuData[i + 1][day + "_productGuid"] = "";
                                this.menuData[i + 1][day + "_purchasePolicy"] = "";
                                this.menuData[i + 1][day + "_hasAdj"] = "";
                                this.menuData[i + 1][day + "_minRequiredDate"] = "";
                            } else {
                                // 当该行的一周七天均没有菜时删除当前行
                                if (isNullOrWhiteSpace(this.menuData[index + 1].mon_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].tue_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].wed_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].thu_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].fri_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].sat_itemName) &&
                                    isNullOrWhiteSpace(this.menuData[index + 1].sun_itemName))
                                    this.menuData.splice(index + 1, 1);
                            }
                        } else {
                            // 当最后一行的情况
                            this.menuData[i][day + "_linkId"] = "";
                            this.menuData[i][day + "_itemGuid"] = "";
                            this.menuData[i][day + "_itemCode"] = "";
                            this.menuData[i][day + "_itemType"] = "";
                            this.menuData[i][day + "_itemName"] = "";
                            this.menuData[i][day + "_itemCost"] = "";
                            this.menuData[i][day + "_itemUnitCode"] = "";
                            this.menuData[i][day + "_itemColor"] = "";
                            this.menuData[i][day + "_otherCost"] = "";
                            this.menuData[i][day + "_itemQty"] = "";
                            this.menuData[i][day + "_itemBOM"] = null;
                            this.menuData[i][day + "_productGuid"] = "";
                            this.menuData[i][day + "_purchasePolicy"] = "";
                            this.menuData[i][day + "_hasAdj"] = "";
                            this.menuData[i][day + "_minRequiredDate"] = "";

                            // 当该行的一周七天均没有菜时删除当前行
                            if (isNullOrWhiteSpace(this.menuData[i].mon_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].tue_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].wed_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].thu_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].fri_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].sat_itemName) &&
                                isNullOrWhiteSpace(this.menuData[i].sun_itemName))
                                this.menuData.splice(i, 1);
                        }
                    }
                }
                // 格式化显示Data
                this.formatMenuData();
            },
            // 价格合计
            totalAmtByDay(day, mealType) {
                var result = 0;
                var itemCost;
                var otherCost;
                var tempCost;

                for (var menu of this.menuDataFomat) {
                    if (menu.isTool || menu.mealType != mealType)
                        continue;
                    itemCost = menu[day + "_itemCost"] * 1;
                    otherCost = menu[day + "_otherCost"] * 1;
                    tempCost = this.otherCost ? itemCost : (itemCost - otherCost);

                    result = result + (tempCost * (isNullOrWhiteSpace(menu[day + "_itemQty"]) ? 0
                            : menu[day + "_itemQty"] * 1));
                }
                return this.formatAmount(result + "");
            },
            // 格式化金额（Item用）
            formatAmount(amount, decimals) {
                if (isNullOrWhiteSpace(decimals)) {
                    decimals = 2;
                }
                decimals = decimals + 0;
                var itemCost = formatMoney(amount, decimals, ".", ",", "round");

                if (itemCost.substr(itemCost.length - 3, 3) == ".00") {
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
                    if (data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        for (var cw of this.ccWhsOption) {
                            cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                        }
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            },
            // CostCenter、档口选择事件
            CreateEdit() {
                if (this.selectCCWhs.length == 0)
                    return;
                // 设置选中的CCWhs对象
                this.ccWhsObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                // 设置dbName(共用画面传值用)
                this.dialogParam.dbName = this.ccWhsObj.dbName;
                // 设置供应商代码(共用画面传值用)
                //this.dialogParam.supplierCodes = "129003,129006,129013,129105,129114,129116,333002,333006,333059,333060,333064";
//                this.dialogParam.supplierCodes = arrayToString(this.ccWhsObj.lstCCSuppliers, "supplierCode");
                // 设置成本中心(共用画面传值用)
                this.dialogParam.costCenterCode = this.ccWhsObj.costCenterCode;
                // 设置成本中心名称(共用画面传值用)
                this.dialogParam.costCenterName = this.ccWhsObj.costCenterName_ZH;
                // 设置WindowGUID
                if (this.selectCCWhs.length > 1)
                    this.selWindowGuid = this.selectCCWhs[1].trim();
                else
                    this.selWindowGuid = "";
                this.loading = true;
                // 关闭复制栏
                this.showCopyToolBar("1");
                // 去掉复制多选框勾选
                this.copyChecked = false;
                // 先从数据库取MenuOrder
                this.GetMealTypeList(this.GetMenuOrder);
            },
            // 取得分类信息
            GetMealTypeList(cb) {
                var reg = new RegExp('/', "g")

                var param = {
                    costCenterCode: this.selectCCWhs[0].trim(),
                    startDate: this.weekData.mon_date.replace(reg, "-"),
                    lstItemGuid: this.GetItemGuidList()
                }

                // 取得分类信息
                GetMealTypeList(param).then(data => {
                    if (data && data.code == "200") {
                        this.mealTypeData = data.content;
                        this.menuData = [];
                        this.menuDataFomat = [];
                        cb();
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

                if (this.selectCCWhs.length < 2)
                    return aryItemGuid;

                var ccObj = getRowFromArray(this.selectCCWhs[0].trim(), this.ccWhsOption, "costCenterCode");
                var windowObj = getRowFromArray(this.selectCCWhs[1].trim(), ccObj.lstCCWindows, "windowGuid");

                if (typeof(windowObj) == "undefined" ||
                    typeof(windowObj.lstCCWindowMeals) == "undefined" ||
                    windowObj.lstCCWindowMeals == null ||
                    windowObj.lstCCWindowMeals.length == 0)
                    return aryItemGuid;

                for (var wms of windowObj.lstCCWindowMeals) {
                    aryItemGuid.push({
                        itemGuid: wms.soItemGuid
                    });
                }
                return aryItemGuid;
            },
            // 设置一周日期
            SetWeekDate(date, flag, initial) {
                var days = 0;
                if (flag == "+")
                    days = 7;
                else if (flag == "-")
                    days = -7;

                // 取得下周一的日期
                date.add("d", days);
                date = this.getFirstDayOfWeek(date);
                // 下周一到下周日日期赋值
                if (initial == "y")
                    this.thisMonday = this.formatDate(date, "yyyy/MM/dd");
                this.weekData.mon_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.tue_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.wed_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.thu_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.fri_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.sat_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d", 1);
                this.weekData.sun_date = this.formatDate(date, "yyyy/MM/dd");
            },
            // 日期格式化
            formatDate(date, formatString) {
                if (isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";

                return chGMT(date, formatString);
            },
            getFirstDayOfWeek (date) {
                var day = date.getDay() || 7;
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
            },
            // 上一页，下一页
            WeekChange(flag) {
                this.SetWeekDate(new Date(this.weekData.mon_date), flag);
                this.loading = true;
                this.GetMenuOrder();
//                this.SetSelDay();
                if (this.clipper.pasteData.length == 0)
                    this.showCopyToolBar("1");
            },
            // 读取MenuOrder
            GetMenuOrder() {
                var costCenterCode = this.selectCCWhs[0].trim();
                var windowGuid = isNullOrWhiteSpace(this.selectCCWhs[1]) ? "" : this.selectCCWhs[1].trim();

                var param = {
                    dbName: this.dialogParam.dbName,   // DB名称
                    costCenterCode: costCenterCode,    // 成本中心
                    windowGuid: windowGuid,            // 档口Guid
                    startDate: this.weekData.mon_date, // 一周开始日期
                    endDate: this.weekData.sun_date    // 一周结束日期
                }
                GetMenuOrder(param).then(data => {
                    if (data && data.code == "200") {
                        this.SetMenuData(data.content);
                        this.isLocal = false;
                    } else {
                        this.menuData = [];
                        this.formatMenuData();
                        this.isLocal = true;
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 将MenuOrderHead转成用于显示的MenuData
            SetMenuData(lstMenuOrderHead) {
                this.menuData = [];
                this.menuDataFomat = [];

                var menuDataTemp = [];
                var wkMealType = "";
                var wkMenuType = "";
                var wkClassSort = "";
                var menuObj;
                var day = "";
                var foundIndex = -1;

                for (var mos of lstMenuOrderHead) {
                    /***星期几***/
                    day = mos.dayOfWeek;
                    /***找到空单元格标志***/
                    foundIndex = -1;

                    // 当餐次或类别阶层与上一行不同时
                    if (mos.productDesc != wkMealType ||
                        (mos.itemType != "FG" ? "其他" : mos.nation + " / " + mos.menuClassName) != wkMenuType) {
                        /***备份餐次***/
                        wkMealType = mos.productDesc
                        /***备份类别阶层***/
                        wkMenuType = mos.itemType != "FG" ? "其他" : mos.nation + " / " + mos.menuClassName;
                        /***排序字段***/
                        wkClassSort = mos.classSort;
                        /***临时表不为空时追加到MenuData***/
                        if (menuDataTemp.length > 0)
                            this.menuData = this.menuData.concat(menuDataTemp);
                        /***临时表清空***/
                        menuDataTemp = [];
                        /***追加一空行***/
                        menuDataTemp.push(this.NewMenuDataRow(mos.soItemGuid, wkMealType, wkMenuType, wkClassSort));
                    }
                    for (var i = 0; i < menuDataTemp.length; i++) {
                        menuObj = menuDataTemp[i];

                        if (!isNullOrWhiteSpace(menuObj[day + "_itemName"]) ||
                            !isNullOrWhiteSpace(menuObj[day + "_itemGuid"]) ||
                            !isNullOrWhiteSpace(menuObj[day + "_itemCode"]))
                            continue;
                        /***找到空单元格时记录下Index***/
                        foundIndex = i;

                        break;
                    }
                    /***当没有找到时***/
                    if (foundIndex == -1) {
                        /***追加一空行***/
                        menuDataTemp.push(this.NewMenuDataRow(mos.soItemGuid, wkMealType, wkMenuType, wkClassSort));
                        /***Index设置为临时表最大Index***/
                        foundIndex = menuDataTemp.length - 1;
                    }
                    /***将内容写入单元格***/
                    menuDataTemp[foundIndex][day + "_headGuid"] = mos.headGuid;
                    menuDataTemp[foundIndex][day + "_linkId"] = mos.linkId;
                    menuDataTemp[foundIndex][day + "_itemGuid"] = mos.itemGuid;
                    menuDataTemp[foundIndex][day + "_itemCode"] = mos.itemCode;
                    menuDataTemp[foundIndex][day + "_itemType"] = mos.itemType;
                    menuDataTemp[foundIndex][day + "_itemName"] = mos.itemName_ZH;
                    menuDataTemp[foundIndex][day + "_itemCost"] = mos.itemCost + "";
                    menuDataTemp[foundIndex][day + "_itemCost_bak"] = mos.itemCost + "";
                    menuDataTemp[foundIndex][day + "_itemUnitCode"] = mos.itemUnitCode;
                    menuDataTemp[foundIndex][day + "_itemColor"] = isNullOrWhiteSpace(mos.itemColor) ? "" : mos.itemColor;
                    menuDataTemp[foundIndex][day + "_otherCost"] = mos.otherCost + "";
                    menuDataTemp[foundIndex][day + "_itemQty"] = mos.requiredQty + "";
                    menuDataTemp[foundIndex][day + "_itemQty_bak"] = mos.requiredQty + "";
                    menuDataTemp[foundIndex][day + "_itemBOM"] = this.ConvertToBOM(mos.lstMenuOrderLine);
                    menuDataTemp[foundIndex][day + "_productGuid"] = mos.productGuid;
                    menuDataTemp[foundIndex][day + "_purchasePolicy"] = mos.purchasePolicy;
                    menuDataTemp[foundIndex][day + "_hasAdj"] = mos.hasAdj;
                    menuDataTemp[foundIndex][day + "_minRequiredDate"] = mos.minRequiredDate;
                }
                console.log(menuDataTemp);
                if (menuDataTemp.length > 0)
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
                for (var i = 0; i < this.menuData.length; i++) {
                    this.menuData[i].index = i;
                }
            },
            // 保存MenuOrder
            SaveMenuOrder() {
                // 检查是否有记录被修改
                this.CheckHasChange();
                // 保存前Check
                if (this.menuOrderHead.length == 0) {
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
                        if (data && data.code == "200") {
                            this.GetMenuOrder();
                            this.$message({
                                type: 'success',
                                message: '周单保存成功！'
                            });
                        } else {
                            this.$message({
                                type: 'error',
                                message: '周单保存失败！'
                            });
                        }
                    });
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 检查是否有修改过的记录
            CheckHasChange() {
                var row;

                this.menuOrderHead = [];

                for (var i = 0; i < this.menuData.length; i++) {
                    row = this.menuData[i];

                    this.ConvertToMenuOrder(row, "mon");
                    this.ConvertToMenuOrder(row, "tue");
                    this.ConvertToMenuOrder(row, "wed");
                    this.ConvertToMenuOrder(row, "thu");
                    this.ConvertToMenuOrder(row, "fri");
                    this.ConvertToMenuOrder(row, "sat");
                    this.ConvertToMenuOrder(row, "sun");
                }
            },
            // 将数据库中的BOM对象转换成前端使用的BOM对象
            ConvertToBOM(lstBOM) {
                var itemBOM = [];

                for (var bomObj of lstBOM) {
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
                    bom.requiredDate_bak = bomObj.requiredDate;
                    bom.workRequiredDate = bomObj.workRequiredDate;

                    itemBOM.push(bom);
                }

                return itemBOM;
            },
            // 将Column转换成MenuOrder
            ConvertToMenuOrder(row, day) {
                // 是否提交后台Flag
                var result = false;

                // MenuOrderHead提交Json格式
                var menuOrderObj = deepCopy(menuOrderModel);

                // 判断是否追加
                if (this.CheckSubmit(row, day))
                    result = true;

                /******将单元格转换成MenuOrder******/
                // HeadGuid
                menuOrderObj.headGuid = row[day + "_headGuid"];
                // 成本中心
                menuOrderObj.costCenterCode = this.ccWhsObj.costCenterCode;
                // 档口Guid
                menuOrderObj.windowGuid = this.selWindowGuid;
                // 日期
                menuOrderObj.requiredDate = this.formatDate(this.weekData[day + "_date"]);
                // 合同行项Guid
                menuOrderObj.soItemGuid = row.soItemGuid;
                // 成品Guid
                menuOrderObj.itemGuid = row[day + "_itemGuid"];
                // 成品Code
                menuOrderObj.itemCode = row[day + "_itemCode"];
                // 成品/原料类别代码
                menuOrderObj.itemType = row[day + "_itemType"];
                // 成品名称(中文)
                menuOrderObj.itemName_ZH = row[day + "_itemName"];
                // 成品名称(英文)
                menuOrderObj.itemName_EN = "";
                // 需求数量
                menuOrderObj.requiredQty = row[day + "_itemQty"] * 1;
                // 成本
                menuOrderObj.itemCost = row[day + "_itemCost"] * 1;
                // 成品单位
                menuOrderObj.itemUnitCode = row[day + "_itemUnitCode"];
                // 成品颜色
                menuOrderObj.itemColor = row[day + "_itemColor"];
                // 成品单位
                menuOrderObj.otherCost = row[day + "_otherCost"];
                // 修改标志
                menuOrderObj.changeFlag = isNullOrWhiteSpace(row[day + "_headGuid"]) ? "0" : "1";
                // 删除用户
                menuOrderObj.deleteUser = row[day + "_deleteFlag"] == "1" ? this.user.account : "";
                // 关联Id
                menuOrderObj.linkId = row[day + "_linkId"];
                // 产品Guid
                menuOrderObj.productGuid = row[day + "_productGuid"];
                // 采购类型
                menuOrderObj.purchasePolicy = row[day + "_purchasePolicy"];

                var lstMenuOrderLine = [];

                if (!isNullOrWhiteSpace(menuOrderObj.itemCode) && row[day + "_itemBOM"] != null) {
                    for (var bom of row[day + "_itemBOM"]) {
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
                            // 调整日期
                            menuOrderLine.requiredDate = bom.requiredDate;
                            // 调整日期（备份）
                            menuOrderLine.requiredDate_bak = bom.requiredDate_bak;
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
                if (result) {
                    // 追加MenuOrder
                    this.menuOrderHead.push(menuOrderObj);
                }
            },
            // 判断是否要提交到后台(Head)
            CheckSubmit(row, day) {
                // ItemCode为空时,不做追加
                if (isNullOrWhiteSpace(row[day + "_itemCode"]))
                    return false;
                // SysGUID不为空，且没有任何修改时，且删除标志为空时不做追加
                if (!isNullOrWhiteSpace(row[day + "_headGuid"]) &&
                    row[day + "_itemQty"] == row[day + "_itemQty_bak"] &&
                    row[day + "_itemCost"] == row[day + "_itemCost_bak"] &&
                    isNullOrWhiteSpace(row[day + "_deleteFlag"])) {
                    return false;
                }
                // 其余情况全部追加
                return true;
            },
            // 判断是否要提交到后台(Item)
            CheckSubmitLine(bomObj, saveFlag) {
                // HeadGuid和LineGuid有一个为空时，则不做判断
                if (isNullOrWhiteSpace(bomObj.headGuid) ||
                    isNullOrWhiteSpace(bomObj.lineGuid)) {
                    if (saveFlag)
                        return true;
                    else
                        return false;
                }
                // HeadGuid和LineGuid都不为空，且没有任何修改时不做追加
                if (bomObj.itemDesc == bomObj.itemDesc_bak &&
                    bomObj.actQty * 1 == bomObj.actQty_bak * 1 &&
                    bomObj.requiredQty * 1 == bomObj.requiredQty_bak * 1 &&
                    bomObj.itemCode == bomObj.itemCode_bak &&
                    bomObj.requiredDate == bomObj.requiredDate_bak) {
                    return false;
                }
                // 其余情况全部追加
                return true;
            },
            // 判断Item BOM是否有修改
            CheckItemBOMChange(itemBOM) {
                var changeFlag = "";

                for (var bomObj of itemBOM) {
                    if (this.CheckSubmitLine(bomObj, false)) {
                        changeFlag = "1";
                        break;
                    }
                }
                return changeFlag;
            },
            // 限制输入数字和小数
            handleInput(row, day) {
                row[day + "_itemQty"] = row[day + "_itemQty"].replace(/[^\d]/g, '');
            },
            // 失去焦点时更新MenuData的数量
            UpdateQty(row, day){
                var message = "";

                // 输入内容为空或0时，更新为最小值1
                if (isNullOrWhiteSpace(row[day + "_itemQty"]) || row[day + "_itemQty"] == 0) {
                    row[day + "_itemQty"] = 1;
                }
                // 更新BOM的RequiredQty
                this.setRequiredQty(row[day + "_itemQty"] * 1, row[day + "_itemBOM"]);

                // 检查原料是否有修改
                row[day + "_changeFlag"] = this.CheckItemBOMChange(row[day + "_itemBOM"]);

                if (row[day + "_changeFlag"] == "1") {
                    message = "【" + row[day + "_itemName"] + "】"
                        + "有原料信息标记为待修改";
                    this.$message({
                        type: 'warning',
                        message: message
                    });
                }
                // 更新MenuData
                for (var i = 0; i < this.menuData.length; i++) {
                    if (this.menuData[i].mealType == row.mealType &&
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
            BGColor(row, day) {
                var cssStr = "";
                if (row[day + "_deleteFlag"] == "1")
                    cssStr = "card-del-background";
                else if (row[day + "_changeFlag"] == "1")
                    cssStr = "card-war-background";
                else {
                    if (row[day + "_itemType"] != "FG")
                        cssStr = "card-rm-background";
                    else
                        cssStr = "card-background";
                }

                if (!isNullOrWhiteSpace(row[day + "_itemColor"]))
                    cssStr = cssStr + " " + "card-border-color";

                return cssStr;
            },
            // 将画面的显示用JSON暂存到本地
            SaveMenuDataLocal() {
                /***检查是否要暂存***/
                var checkFlag = false;

                for (var menuObj of this.menuData) {
                    // 检查是否有新追加的记录
                    if ((!isNullOrWhiteSpace(menuObj.mon_itemName) && isNullOrWhiteSpace(menuObj.mon_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.tue_itemName) && isNullOrWhiteSpace(menuObj.tue_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.wed_itemName) && isNullOrWhiteSpace(menuObj.wed_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.thu_itemName) && isNullOrWhiteSpace(menuObj.thu_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.fri_itemName) && isNullOrWhiteSpace(menuObj.fri_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.sat_itemName) && isNullOrWhiteSpace(menuObj.sat_headGuid)) ||
                        (!isNullOrWhiteSpace(menuObj.sun_itemName) && isNullOrWhiteSpace(menuObj.sun_headGuid))) {
                        checkFlag = true;
                        break;
                    }
                    // 检查是否有数量修改的记录
                    if ((!isNullOrWhiteSpace(menuObj.mon_itemQty_bak) && menuObj.mon_itemQty != menuObj.mon_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.tue_itemQty_bak) && menuObj.tue_itemQty != menuObj.tue_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.wed_itemQty_bak) && menuObj.wed_itemQty != menuObj.wed_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.thu_itemQty_bak) && menuObj.thu_itemQty != menuObj.thu_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.fri_itemQty_bak) && menuObj.fri_itemQty != menuObj.fri_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.sat_itemQty_bak) && menuObj.sat_itemQty != menuObj.sat_itemQty_bak) ||
                        (!isNullOrWhiteSpace(menuObj.sun_itemQty_bak) && menuObj.sun_itemQty != menuObj.sun_itemQty_bak)) {
                        checkFlag = true;
                        break;
                    }
                    // 检查是否有待删除记录
                    if (menuObj.mon_deleteFlag == "1" ||
                        menuObj.tue_deleteFlag == "1" ||
                        menuObj.wed_deleteFlag == "1" ||
                        menuObj.thu_deleteFlag == "1" ||
                        menuObj.fri_deleteFlag == "1" ||
                        menuObj.sat_deleteFlag == "1" ||
                        menuObj.sun_deleteFlag == "1") {
                        checkFlag = true;
                        break;
                    }
                    if (checkFlag) {
                        /***保存Json***/
                    } else {
                        /***删除Json***/
                    }
                }
            },
            // 设置ItemName字体大小
            cardItemName(row, day) {
                if (row[day + "_itemName"].length > 6) {
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
                GetConfig("WeeklySDate").then(data => {
                    let wkDate;
                    let flag = "";
                    if (data && data.code === '200') {
                        this.sDate = data.content;
                        wkDate = new Date(this.sDate);
                    } else {
                        this.sDate = "";
                        wkDate = new Date();
                        flag = "+";
                    }
                    this.getUserInfo();
//                    this.SetWeekDate(new Date(this.sDate), "+", "y");
                    this.SetWeekDate(wkDate, flag, "y");
                    this.formatMenuData();
                    this.GetCCWhs();
                });
            },
            // 首列背景色
            cellClassName({row, column, rowIndex, columnIndex}) {
                if (columnIndex == 0) {
                    return row.bgColor;
                }
            },
            // 复制工具条背景色
            cellClassCopy({row, column, rowIndex, columnIndex}) {
                return 'copy-background';
            },
            // 询问是否打开采购数量调整画面
            GoPurchaseNewItemDialog(bom, day) {
                var that = this;
                this.$confirm('当前菜中含有调整过采购数量的原料，是否前往删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var orderDate = this.formatDate(that.weekData[day + "_date"]);
                    for (var bomObj of bom) {
                        if (!isNullOrWhiteSpace(bomObj.hasAdj)) {
                            that.dialogParam.checkItemString = that.dialogParam.checkItemString + bomObj.itemCode + ",";
                            if (!isNullOrWhiteSpace(bomObj.requiredDate))
                                orderDate = bomObj.requiredDate
                        }
                    }
                    that.showDialogPurchaseOrder(orderDate);
                });
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
                }).catch(() => {
                    this.loading = false;
                });
            },
            CostDisp(row, day) {
                let itemCost = row[day + '_itemCost'] * 1;
                let otherCost = row[day + '_otherCost'] * 1;
                let result = float(this.otherCost ? itemCost : (itemCost - otherCost), 2);
                return result;
            },
            showCopyToolBar(showFlag) {
                if (!isNullOrWhiteSpace(showFlag))
                    this.showCopy = false;
                else
                    this.showCopy = !this.showCopy;
                if (!this.showCopy) {
                    this.$notify.closeAll();
                    for (var weekObj of this.weekNameData) {
                        this.copyData[0][weekObj.day] = false;
                    }
                    this.InitialClipper();
                }
            },
            // 选择
            select(select) {
                if (this.s_btnType == "warning")
                    this.selectAll(select);
                else
                    this.selectAuto(select);
            },
            // 全选
            selectAll(select) {
                for (var weekObj of this.weekNameData) {
                    this.copyData[0][weekObj.day] = select;
                }
            },
            // 自动选
            selectAuto(select) {
                if (select) {
                    for (var day of this.clipper.copyDays) {
                        this.copyData[0][day] = select;
                    }
                } else {
                    for (var weekObj of this.weekNameData) {
                        this.copyData[0][weekObj.day] = false;
                    }
                }
            },
            // 操作(复制/粘贴)
            Operate() {
                if (this.s_btnType == "warning")
                    this.Copy();
                else
                    this.Paste();
            },
            // 复制
            Copy() {
                this.CopyToClipper();

                var count = 0;
                var message = "";
                for (var weekObj of this.weekNameData) {
                    if (this.copyData[0][weekObj.day])
                        count = count + 1;
                }
                if (count > 0) {
                    message = "已将" + count + "天的记录复制到剪贴板";
                } else {
                    message = "已将" + this.clipper.copyMealType.mealType.length + "个餐次复制到剪贴板";
                }

                this.$notify.closeAll();

                this.$notify({
                    title: '复制提醒',
                    message: message,
                    duration: 0,
                    type: 'info'
                });
                this.ClearAllCheckBox();
            },
            // 粘贴
            Paste() {
                if (this.CheckExist()) {
                    this.$message({
                        title: '错误提示',
                        message: '您选择的粘贴范围中已有记录存在，请先手动删除',
                        type: 'error'
                    });
                    return;
                }
                if (this.clipper.copyDays.length > 0)
                    this.PasteByDay();
                else
                    this.PasteByMealType();

                // 可能存在新增行的情况，重新设定Index
                this.SetMenuDataIndex();

                // 按类别阶层重新排序
                this.SortMenuData();

                // 格式化显示Data
                this.formatMenuData();

                // 初始化粘贴
                this.InitialPaste();

                // 粘贴成功后回退
                this.InitialClipper();
            },
            // 按天粘贴
            PasteByDay() {
                var cDay = "";   // 复制日期
                var pDay = "";   // 粘贴日期

                for (var i = 0; i < this.clipper.copyDays.length; i++) {
                    if ((i + 1) > this.clipper.pasteDays.length)
                        break;

                    // 取得复制日期
                    cDay = this.clipper.copyDays[i].day;
                    // 取得粘贴日期
                    pDay = this.clipper.pasteDays[i];
                    // 选择日期（共用方法需要）
                    this.selDay = pDay;

                    for (var row of this.clipper.pasteData) {
                        if (!isNullOrWhiteSpace(row[cDay + "_itemCode"])) {
                            this.selMealType = row.mealType;
                            this.selSoItemGuid = row.soItemGuid;
                            // 删除BOM中的headGuid和lineGuid
                            var itemBOM = row[cDay + "_itemBOM"];
                            for (var bomObj of itemBOM) {
                                bomObj.headGuid = "";
                                bomObj.lineGuid = "";
                                bomObj.requiredDate = null;
                                bomObj.requiredDate_bak = null;
                            }
                            this.appendMealPlus({
                                type: row.menuType,
                                itemGuid: row[cDay + "_itemGuid"],
                                itemCode: row[cDay + "_itemCode"],
                                itemType: row[cDay + "_itemType"],
                                itemCost: row[cDay + "_itemCost"],
                                itemUnitCode: row[cDay + "_itemUnitCode"],
                                itemColor: row[cDay + "_itemColor"],
                                otherCost: row[cDay + "_otherCost"],
                                itemName: row[cDay + "_itemName"],
                                classSort: row.classSort,
                                productGuid: row[cDay + "_productGuid"],
                                purchasePolicy: row[cDay + "_purchasePolicy"],
                                itemBOM: itemBOM,
                                itemQty: row[cDay + "_itemQty"]
                            });
                        }
                    }
                }
            },
            // 按天粘贴
            PasteByMealType() {
                // 被复制的星期X
                var cDay = this.clipper.copyMealType.day; // 复制日期
                var pDay = "";   // 粘贴日期
                var cMealType = "";  // 复制餐次
                var pMealType = "";  // 粘贴餐次
                var soItemGuid = "";

                for (var pasteObj of this.clipper.pasteMealTypes) {
                    for (var i = 0; i < this.clipper.copyMealType.mealType.length; i++) {
                        if ((i + 1) > pasteObj.mealType.length)
                            break;
                        var mt = pasteObj.mealType[i]
                        // 粘贴日期
                        pDay = pasteObj.day;
                        // 取得复制餐次
                        cMealType = this.clipper.copyMealType.mealType[i];
                        // 取得粘贴餐次
                        pMealType = mt;
                        // SoItemGuid
                        soItemGuid = arraySearch(pMealType, this.menuDataFomat, "mealType")[0].soItemGuid;

                        // 选择日期（共用方法需要）
                        this.selDay = pDay;

                        for (var row of this.clipper.pasteData) {
                            if (row.mealType != cMealType)
                                continue;
                            if (!isNullOrWhiteSpace(row[cDay + "_itemCode"])) {
                                this.selMealType = pMealType;
                                this.selSoItemGuid = soItemGuid;
                                // 删除BOM中的headGuid和lineGuid
                                var itemBOM = row[cDay + "_itemBOM"];
                                for (var bomObj of itemBOM) {
                                    bomObj.headGuid = "";
                                    bomObj.lineGuid = "";
                                    bomObj.requiredDate = null;
                                    bomObj.requiredDate_bak = null;
                                }
                                this.appendMealPlus({
                                    type: row.menuType,
                                    itemGuid: row[cDay + "_itemGuid"],
                                    itemCode: row[cDay + "_itemCode"],
                                    itemType: row[cDay + "_itemType"],
                                    itemCost: row[cDay + "_itemCost"],
                                    itemUnitCode: row[cDay + "_itemUnitCode"],
                                    itemColor: row[cDay + "_itemColor"],
                                    otherCost: row[cDay + "_otherCost"],
                                    itemName: row[cDay + "_itemName"],
                                    classSort: row.classSort,
                                    productGuid: row[cDay + "_productGuid"],
                                    purchasePolicy: row[cDay + "_purchasePolicy"],
                                    itemBOM: itemBOM,
                                    itemQty: row[cDay + "_itemQty"]
                                });
                            }
                        }
                    }
                }
            },
            // 检查是否记录已存在
            CheckExist() {
                this.clipper.pasteDays = [];
                this.clipper.pasteMealTypes = [];

                if (this.clipper.copyDays.length > 0) {
                    for (var weekObj of this.weekNameData) {
                        if (this.copyData[0][weekObj.day])
                            this.clipper.pasteDays.push(weekObj.day);
                    }
                    for (var row of this.menuData) {
                        for (var day of this.clipper.pasteDays) {
                            if (!isNullOrWhiteSpace(row[day + "_itemCode"]))
                                return true;
                        }
                    }
                }
                if (this.clipper.copyMealType.mealType.length > 0) {
                    for (var weekObj of this.weekNameData) {
                        var pasteObj = {
                            day: weekObj.day,
                            mealType: []
                        };
                        for (var row of this.menuDataFomat) {
                            if (row[weekObj.day + "_checked"])
                                pasteObj.mealType.push(row.mealType);
                        }
                        if (pasteObj.mealType.length > 0)
                            this.clipper.pasteMealTypes.push(pasteObj);
                    }
                    for (var row of this.menuData) {
                        for (var pmt of this.clipper.pasteMealTypes) {
                            if (IsInArray(pmt.mealType, row.mealType) &&
                                !isNullOrWhiteSpace(row[pmt.day + "_itemCode"]))
                                return true;
                        }
                    }
                }
                return false;
            },
            // 复制画面数据
            CopyToClipper() {
                this.InitialClipper();
                // 复制画面数据
                for (var row of this.menuData) {
                    var newRow = JSON.parse(JSON.stringify(row));
                    this.clipper.pasteData.push(newRow);
                }
                // 记录要复制的天或餐次
                for (var weekObj of this.weekNameData) {
                    if (this.copyData[0][weekObj.day])
                        this.clipper.copyDays.push({
                            day: weekObj.day,
                            date: this.weekData[weekObj.day + "_date"]
                        });
                }
                if (this.clipper.copyDays.length == 0) {
                    for (var row of this.menuDataFomat) {
                        for (var dayObj of this.weekNameData) {
                            if (row[dayObj.day + "_checked"]) {
                                this.clipper.copyMealType.day = dayObj.day;
                                this.clipper.copyMealType.date = this.weekData[dayObj.day + "_date"];
                                this.clipper.copyMealType.mealType.push(row.mealType);
                            }
                        }
                    }
                }
            },
            // 初始化剪切板
            InitialClipper() {
                this.clipper.pasteData = [];
                this.clipper.copyDays = [];
                this.clipper.pasteDays = [];
                this.clipper.copyMealType = {
                    day: "",
                    mealType: []
                };
                this.clipper.pasteMealTypes = [];
                this.$notify.closeAll();
            },
            ClearAllCheckBox() {
                for (var c of this.copyData) {
                    for (var weekObj of this.weekNameData) {
                        c[weekObj.day] = false;
                    }
                }
                for (var row of this.menuDataFomat) {
                    for (var weekObj of this.weekNameData) {
                        row[weekObj.day + "_checked"] = false;
                        row[weekObj.day + "_disabled"] = false;
                    }
                }
            },
            // 检查选中粘贴的数量是否超出复制的数量
            CheckSucCount_D(sel) {
                if (this.s_btnType != "success")
                    return false;
                var selCount = 0;
                for (var weekObj of this.weekNameData) {
                    if (this.copyData[0][weekObj.day])
                        selCount = selCount + 1;
                }
                if (selCount == this.clipper.copyDays.length && !sel)
                    return true;
                else
                    return false;
            },
            // 检查当前列中是否有餐次被复制
            CheckWarDisabled_D(day) {
                if (this.s_btnType != "warning")
                    return false;
                var tempDate = this.weekData[day + "_date"];

                for (var row of this.menuDataFomat) {
                    for (var weekObj of this.weekNameData) {
                        if (row[weekObj.day + "_checked"])
                            return true;
                    }
                }
                return false;
            },
            // 检查当前列是否是被复制的列
            CheckSucDisabled_D(day) {
                if (this.s_btnType != "success")
                    return false;
                var tempDate = this.weekData[day + "_date"];

                for (var c of this.clipper.copyDays) {
                    if (tempDate == c.date)
                        return true;
                }
                return false;
            },
            // 检查复制时MealType复选框是否可用
            CheckWarDisabled_M(day) {
                if (this.s_btnType != "warning")
                    return false;
                for (var weekObj of this.weekNameData) {
                    if (this.copyData[0][weekObj.day])
                        return true;
                }

                var selDay = "";
                for (var row of this.menuDataFomat) {
                    for (var weekObj of this.weekNameData) {
                        if (row[weekObj.day + "_checked"]) {
                            selDay = weekObj.day;
                            break;
                        }
                    }
                    if (!isNullOrWhiteSpace(selDay))
                        break;
                }
                if (!isNullOrWhiteSpace(selDay) && selDay != day)
                    return true;
                return false;
            },
            // 检查粘贴时MealType复选框是否可用
            CheckSucDisabled_M(day, mealType) {
                if (this.s_btnType != "success")
                    return false;
                if (this.clipper.copyDays.length > 0)
                    return true;
                if (this.weekData[day + "_date"] != this.clipper.copyMealType.date)
                    return false;
                else {
                    for (var m of this.clipper.copyMealType.mealType) {
                        if (m == mealType)
                            return true;
                    }
                }
                return false
            },
            // 检查粘贴时MealType勾选数量是否已达到上限
            CheckSucCount_M(day, sel) {
                if (this.s_btnType != "success")
                    return false;

                var selCount = 0;
                for (var row of this.menuDataFomat) {
                    if (row[day + "_checked"])
                        selCount = selCount + 1;
                }
                if (selCount == this.clipper.copyMealType.mealType.length && !sel)
                    return true;
                return false;
            },
            // 初始化粘贴部分
            InitialPaste() {
                for (var weekObj of this.weekNameData) {
                    this.copyData[0][weekObj.day] = false;
                }
                this.clipper.pasteDays = [];
            },
            // 判断MinDate是否小于明天
            CheckMinRequiredDate(requiredDate) {
                if (isNullOrWhiteSpace(requiredDate))
                    return false;
                var date = new Date();
                date.add("d", 1);

                var tommorrowDate = this.formatDate(date);
                return requiredDate < tommorrowDate
            },
            // 复制呈现控制
            CopyCheckBox() {
                this.showCopyToolBar(this.copyChecked? '': '1');
            },
            // 已冻结项（判断条件：BOM中的最小的调整日期小于明天时）
            FrozenItem() {
                this.$message({
                    type: 'info',
                    message: "冻结提示：当前菜中存在已经采购的原料，无法进行修改"
                });
                return;
            }
        },
        created() {
            this.GetStartDate();
        },
        beforeDestroy() {
            this.$notify.closeAll();
        }
    };
</script>

<style>
    @import '../../assets/css/common.css';

    .card-background {
        background-image: linear-gradient(135deg, #eaffeb 10%, #adfcea 100%);
    }

    .card-rm-background {
        background-image: linear-gradient(135deg, #ffffd8 10%, #feffb0 100%);
    }

    .card-del-background {
        background-image: linear-gradient(135deg, #fff2ed 10%, #ffd9cc 100%);
    }

    .card-war-background {
        background-image: linear-gradient(135deg, #f8f8f8 10%, #e1e1e1 100%);
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
        color: #7fd76a
    }

    .button {
        padding: 0;
        float: right;
    }

    .tool_button {
        padding: 5px 4px 5px 2px;
    }

    .tool_button_copy {
        padding: 6px 10px 8px 10px;
    }

    .tool_tag {
        margin-left: 2px;
        padding-left: 5px;
        padding-right: 5px;
    }

    .el-table td, .el-table th {
        padding-top: 3px;
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
    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    .touchArea {
        width: 50%;
        height: 85%;
        position: absolute;
        /*filter: alpha(opacity = 60);*/
        opacity: 0;
        z-index: 900;
        cursor: pointer;
    }

    .adjArea {
        width: 88%;
        height: 82%;
        position: absolute;
        /*filter: alpha(opacity = 60);*/
        opacity: 0;
        z-index: 990;
        cursor: pointer;
    }

    .frozenArea {
        width: 88%;
        height: 82%;
        position: absolute;
        /*filter: alpha(opacity = 60);*/
        opacity: 0;
        z-index: 991;
        cursor: pointer;
    }

    .card-input {
        border-color: #b6b6b6;
        border-style: solid;
        border-top-width: 0px;
        border-right-width: 0px;
        border-bottom-width: 1px;
        border-left-width: 0px;
        width: 30px;
        background-color: transparent;
        text-align: center
    }

    .card-del {
        float: right;
        margin-top: 3px
    }

    .card-lock {
        float: right;
        margin-top: 0px;
        color: #afafaf;
        font-size: 18px;
    }

    .frozen {
        float: right;
        margin-top: 0px;
        color: #9f9f9f;
        font-weight: bold;
        font-style: italic;
        font-size: 12px;
    }

    .card-itemName {
        font-size: 14px;
        margin-top: 10px;
        color: #636363;
    }

    .card-itemName-small {
        font-size: 12px;
        margin-top: 10px;
        color: #636363
    }

    .new-item {
        color: red;
        font-size: 12px;
        font-style: italic;
        white-space: nowrap;
    }

    .itemUnitCode {
        font-size: 12px;
        color: #636363
    }

    .card-border-color {
        border-left: 4px solid;
    }

    .copy-background {
        background: #FFFFFF;
    }
</style>