<template>
    <div v-loading="loading"
         element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <el-select v-model="companyCode"
                           size="small"
                           placeholder="请选择公司"
                           style="width:127px"
                           @change="ChangeCompany">
                    <el-option
                            v-for="company in companyAuthData"
                            :key="company.companyCode"
                            :label="company.companyCode + ' / ' + company.companyName_ZH"
                            :value="company.companyCode"
                            style="width: 157px">
                        <span style="float: left">{{ company.companyCode }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ company.companyName_ZH }}</span>
                    </el-option>
                </el-select>
                <el-button type="primary" size="small"
                           :disabled="isNullOrWhiteSpace(companyCode)"
                           @click="DoSave"
                           style="margin-left: 2px">
                    <i class="fa fa-save" aria-hidden="true"></i> 保存
                </el-button>
                <el-radio-group v-model="mode"
                                style="float: right"
                                @change="ChangeMode"
                                size="small">
                    <el-radio-button label="0">
                        运营点-供应商
                    </el-radio-button>
                    <el-radio-button label="1">
                        原料类型匹配
                    </el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>

        <div v-if="mode == '0'">
            <el-table
                    v-if="tblData.length > 0"
                    :data="tblData"
                    :height="this.fullHeight<200?300:this.fullHeight-40"
                    border
                    style="font-size:12px"
                    size="mini">
                <el-table-column label="成本中心"
                                 width="130"
                                 :resizable="true"
                                 align="center"
                                 fixed="left">
                    <template slot-scope="scope">
                        <div v-if="isNullOrWhiteSpace(scope.row.costCenterCode)">
                            <span class="default">全部成本中心</span>
                        </div>
                        <div v-if="!isNullOrWhiteSpace(scope.row.costCenterCode)">
                            <span class="code">{{ scope.row.costCenterCode }}</span>
                            <div :class="ShowFutCard(scope.row)? 'name3': 'name'">{{ scope.row.costCenterName }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column v-for="(item,index) in itemClassData"
                                 :key="item.guid"
                                 :label="item.name"
                                 :resizable="true"
                                 align="center"
                                 width="160">
                    <template slot-scope="scope">
                        <div v-for="(i, index) in GetMaxIndex(scope.$index)">
                            <el-card :body-style="{ padding: '5px' }"
                                     style="width:100%;cursor:pointer;margin-top: 0px"
                                     :class="GetBGColor(scope.row.costCenterCode, index)"
                                     @click.native="ShowSupplier(scope.$index, item)">
                                <el-row style="line-height:15px">
                                    <div v-if="scope.row['suppliers' + item.sort].length < i">
                                        <el-col class="empty-line" :span="24">&nbsp;</el-col>
                                    </div>
                                    <div v-else>
                                        <el-col class="name2" :span="24" style="text-align: left">
                                            {{ scope.row['suppliers' + item.sort][i - 1].supplierCode }} / {{ GetSupplierName(scope.row['suppliers' + item.sort][i - 1].supplierCode) }}
                                        </el-col>
                                        <el-col class="span-text" :span="24" style="text-align: center">
                                            <div style="white-space:nowrap;overflow:auto">
                                                <div style="display:inline-block;">
                                                    {{ formatShowDate(scope.row['suppliers' + item.sort][i - 1].startDate) }} ~
                                                </div>
                                                <div style="display:inline-block;width:52px"
                                                     v-if="isNullOrWhiteSpace(scope.row['suppliers' + item.sort][i - 1].endDate)">&nbsp;
                                                </div>
                                                <div style="display:inline-block;"
                                                     v-else>
                                                    {{ formatShowDate(scope.row['suppliers' + item.sort][i - 1].endDate) }}
                                                </div>
                                            </div>
                                        </el-col>
                                    </div>
                                </el-row>
                            </el-card>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="mode == '1'">
            <ItemClassMaintainDialog
                    ref="ItemClassMaintain"
                    :dbCode="companyCode"
                    :userId="user.account"
                    @EndLoading="EndLoading">
            </ItemClassMaintainDialog>
        </div>
        <el-dialog title="供应商排程设置"
                   :visible.sync="dialogSupplierParam.dialogSupplierSelect"
                   v-loading="dialogSupplierParam.supplierLoading"
                   :close-on-click-modal="clickModal"
                   width="920px">
            <el-col :span="24" class="toolbar">
                <el-form :inline="true">
                    <el-button size="small" type="primary"
                               @click="CloseSupplier">
                        <i class="el-icon-edit"></i> 更新</el-button>
                    <el-button size="small" type="danger"
                               :disabled="r_updateBtn"
                               style="margin-left: 0px "
                               @click="AppendNextRow">
                        <i class="el-icon-plus"></i> 添加</el-button>
                    <el-tag type="info">
                        <div v-if="isNullOrWhiteSpace(dialogSupplierParam.costCenterName)">
                            全部成本中心
                        </div>
                        <div v-if="!isNullOrWhiteSpace(dialogSupplierParam.costCenterName)">
                            成本中心: {{ dialogSupplierParam.costCenterName }}
                        </div>
                    </el-tag>
                    <el-tag type="info">产品分类: {{ dialogSupplierParam.itemClassName }}</el-tag>
                </el-form>
            </el-col>
            <el-table :data="dialogSupplierParam.supplierSelectData"
                      border stripe>
                <el-table-column label="#"
                                 align="center"
                                 :resizable="false"
                                 width="65"
                                 fixed>
                    <template slot-scope="scope">
                        <el-tag :type="GetClass(SetType(scope.row))">{{ SetType(scope.row) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="供应商"
                                 header-align="center"
                                 :resizable="false"
                                 width="380"
                                 fixed>
                    <template slot-scope="scope">
                        <el-select
                                size="small"
                                v-model="scope.row.supplierCode"
                                filterable
                                style="width:100%"
                                placeholder="请输入关键词"
                                @change="ChangeSupplier">
                            <el-option
                                    v-for="item in dialogSupplierParam.supplierFilterOption"
                                    :key="item.code"
                                    :label="item.value"
                                    :value="item.code"
                                    :disabled="item.disabled"
                                    style="width: 350px">
                                <span style="float: left">{{ item.code }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="默认"
                                 align="center"
                                 :resizable="false"
                                 width="50"
                                 fixed>
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.defaultSupplier"
                                     @change="SetDefaultSupplier(scope.$index)"></el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="开始日期"
                                 header-align="center"
                                 :resizable="false"
                                 fixed>
                    <template slot-scope="scope">
                        <el-date-picker
                                :disabled="isNullOrWhiteSpace(scope.row.supplierCode)"
                                size="small"
                                v-model="scope.row.startDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                style="width:150px"
                                placeholder="选择日期"
                                :editable="editable"
                                :clearable="clearable"
                                >
                                <!--Angel删除-->
                                <!-- @focus="FocusStartDate(scope.$index, 's')"-->
                                <!--:picker-options="pickerStartDateOption"-->
                                <!--@change="StartDateChange(scope.$index)"-->
                        </el-date-picker>
                    </template>
                </el-table-column>
                <el-table-column label="结束日期"
                                 header-align="center"
                                 :resizable="false"
                                 fixed>
                    <template slot-scope="scope">
                        <el-date-picker
                                :disabled="isNullOrWhiteSpace(scope.row.startDate) ||
                                           isNullOrWhiteSpace(scope.row.supplierCode)"
                                size="small"
                                v-model="scope.row.endDate"
                                type="date"
                                style="width:150px"
                                value-format="yyyy-MM-dd"
                                placeholder="不选则永久有效"
                                :editable="editable"
                                @focus="FocusEndDate(scope.$index, 'e')"
                                :picker-options="pickerEndDateOption">
                        </el-date-picker>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="66" :resizable="false" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="danger" size="small"
                                   :disabled="scope.$index == 0 &&
                                              dialogSupplierParam.supplierSelectData.length == 1 &&
                                              isNullOrWhiteSpace(scope.row.supplierCode)"
                                   @click="DeleteItem(scope.$index)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
    var user = JSON.parse(sessionStorage.getItem('user'));
    import optionData from '../../../static/Common/optionData.json';
    import supplierSelectData from '../../../static/MealTypeMaintain/supplierSelectData.json';
    /***Component import***/
    import ItemClassMaintainDialog from './ItemClassMaintain.vue';

    import {
        isNullOrWhiteSpace,
        deepCopy,
        deepClone,
        createFilter,
        getRowFromArray,
        arraySearch,
        chGMT
    } from '../../assets/js/common';

    import {
        GetCompanyInAuth,
        GetCClassSupplierData,
        SaveCClassSupplier,
    } from '../../api/api';

    export default {
        components: {
            "ItemClassMaintainDialog": ItemClassMaintainDialog
        },
        created() {
            this.loading = true;
            this.GetCompany();
        },
        data() {
            return {
                mode: "0",
                clickModal: false,
                editable: false,
                clearable: false,
                fullHeight: window.innerHeight - 151,
                loading: false,
                supplierLoading: false,
                keyWord: "",
                companyCode: "",
                companyAuthData: [],
                action: "menu-weekly",
                itemClassData: [],
                tblData: [],
                tblData_back: [],
                supplierOption: [],
                content: "",
                costCenterData: [],
                dialogSupplierParam: {
                    supplierSelectData: [],
                    supplierFilterOption: [],
                    dialogSupplierSelect: false,
                    supplierLoading: false,
                    index: -1,
                    type: "",
                    focusIndex: -1,
                    sort: "",
                    costCenterName: "",
                    itemClassName: ""
                },
                dialogItemClassParam: {
                    dbCode: ""
                },
                pickerStartDateOption: this.StartDate(),
                pickerEndDateOption: this.EndDate()
            }
        },
        computed: {
            r_updateBtn: function() {
                var workTable = this.dialogSupplierParam.supplierSelectData;
                if(workTable != null &&
                   typeof(workTable) != "undefined" &&
                   workTable.length > 0 &&
                   !isNullOrWhiteSpace(workTable[0].supplierCode) &&
                   !isNullOrWhiteSpace(workTable[0].startDate)) {
                    return false;
                }
                return true;
            }
        },
        methods: {
            // 根据权限取得Company列表
            GetCompany() {
                if (user) {
                    this.user = user;

                    if (isNullOrWhiteSpace(this.action))
                        return;

                    GetCompanyInAuth({
                        action: this.action,
                        userGuid: user.userGuid
                    }).then(data => {
                        if (data && data.code == "200") {
                            this.companyAuthData = data.content;
                            // 给用户权限所关联的公司附初值
                            if (isNullOrWhiteSpace(this.companyCode) && this.withDefault) {
                                 this.companyCode = this.companyAuthData[0].companyCode;
                            }
                        }
                        this.loading = false;
                    }).catch(() => {
                        this.loading = false;
                    });
                }
            },
            // 取得画面Table主数据
            GetCClassSupplierData(saveFlag) {
                GetCClassSupplierData({
                    code: this.companyCode
                }).then(data => {
                    this.tblData = [];
                    this.supplierOption = [];
                    this.content = [];

                    if (data && data.code == "200") {
                        var row;
                        for(var obj of data.content.lstSupplierOption) {
                            row = deepCopy(optionData);
                            row.code = obj.SupplierCode;
                            row.name = obj.SupplierName;
                            row.value = obj.SupplierCode + " / " + obj.SupplierName;
                            row.guid = obj.ClassGUID;
                            row.disabled = obj.Status == 0? true: false;
                            this.supplierOption.push(row);
                        }
                        this.content = data.content.lstCClassSupplier;
                        this.itemClassData = data.content.lstItemClass;
                        this.formatData();
                        if(isNullOrWhiteSpace(saveFlag)) {
                            this.$message.success("当前有" + this.tblData.length + "个成本中心");
                        }
                    } else {
                        this.$message.error("没有查询到符合条件的成本中心");
                    }
                    this.loading = false;
                });
//                    .catch(() => {
//                     this.tblData = [];
//                     this.supplierOption = [];
//                     this.content = [];
//                     this.loading = false;
//                     this.$message.error("查询成本中心失败");
//                });
            },
            // 画面Table格式化
            formatData() {
                var key = "";
                var sup = {};
                var tempName = "";
                var sDate = "";
                var eDate = "";

                this.tblData = [];
                this.tblData_back = [];
                var arySupplier = [];

                for(var obj of this.content) {
                    var row = this.NewRow();

                    /***Current Obj***/
                    row.costCenterCode = obj.costCenterCode;
                    row.costCenterName = obj.costCenterName;
                    row.supplierDetail = obj.lstSupplierCode;

                    for (var itemObj of this.itemClassData) {
                        if(typeof(obj.lstSupplierCode) == "undefined" || obj.lstSupplierCode.isEmpty()) {
                            row["suppliers" + itemObj.sort] = [];
                            continue;
                        }
                        /***取得itemClass对应的供应商设置记录***/
                        /***Current Obj***/
                        arySupplier = arraySearch(itemObj.guid, obj.lstSupplierCode, "classGuid");
                        row["suppliers" + itemObj.sort] = this.DoSort(arySupplier);
                    }
                    this.tblData.push(row);
                }

                this.tblData_back = JSON.parse(JSON.stringify(this.tblData));
            },
            // 公司选择事件
            ChangeCompany() {
                this.loading = true;
                if(this.mode == "0") {
                    this.GetCClassSupplierData();
                }
            },
            // 从Json数组过滤符合条件的集合
            querySearchSupplier(queryString, cb) {
                var aryJson = this.supplierOption;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            isNullOrWhiteSpace(string) {
                return isNullOrWhiteSpace(string);
            },
            // 打开供应商设置弹窗
            ShowSupplier(index, itemObj) {
                var sort = itemObj.sort;

                /***初始化**/
                this.dialogSupplierParam.supplierSelectData = [];
                this.dialogSupplierParam.supplierFilterOption = [];
                // 根据Index取得行Obj
                var row = this.tblData[index];
                // 成本中心名称
                var costCenterName = row.costCenterName;
                // 分类名称
                var itemClassName = itemObj.name;

                // 有即存数据时进行追加
                if(row["suppliers" + itemObj.sort] != null &&
                   row["suppliers" + itemObj.sort].length > 0) {
                    this.dialogSupplierParam.supplierSelectData = JSON.parse(JSON.stringify(row["suppliers" + itemObj.sort]));
                } else {
                    // 无即存数据时追加一个空行
                    if(this.dialogSupplierParam.supplierSelectData.length == 0)
                        // 无即存数据时追加一个空行
                        this.AppendDefaultRow();
                }
                this.dialogSupplierParam.index = index;
                this.dialogSupplierParam.focusIndex = 0;
                this.dialogSupplierParam.sort = sort;
                this.dialogSupplierParam.costCenterName = costCenterName;
                this.dialogSupplierParam.itemClassName = itemClassName;
                // 根据ItemClassGuid过滤供应商待选列表
                this.dialogSupplierParam.supplierFilterOption = arraySearch(itemObj.guid, this.supplierOption,
                    "guid");

                /***打开弹窗***/
                this.dialogSupplierParam.dialogSupplierSelect = true;
            },
            // 设置Type
            SetType(line) {
                if(isNullOrWhiteSpace(line.supplierCode_bak))
                    return "未保存";

                if(line.supplierCode != line.supplierCode_bak ||
                   line.startDate != line.startDate_bak ||
                   line.endDate != line.endDate_bak) {
                    return "未保存"
                }
                var dateStr = this.formatDate(new Date());
                var date = new Date(dateStr);
                var sDate = new Date(line.startDate);
                var eDate = new Date(isNullOrWhiteSpace(line.endDate)? "2999-12-31": line.endDate);
                if(date >= sDate && date <= eDate)
                    return "生效中";
                else
                    return "待生效";
            },
            // 关闭供应商设置弹窗
            CloseSupplier() {
                var index = this.dialogSupplierParam.index;
                var sort = this.dialogSupplierParam.sort;
                var key = "";
                var suppliers = this.dialogSupplierParam.supplierSelectData;
                var sup;

                for(var i = 0; i < suppliers.length; i++) {
                    sup = suppliers[i];
                    if(!isNullOrWhiteSpace(sup.supplierCode) &&
                       !isNullOrWhiteSpace(sup.startDate))
                        continue;
                    else
                        suppliers.splice(i, 1);
                }
                this.tblData[index]["suppliers" + sort] = this.DoSort(suppliers);
                this.dialogSupplierParam.dialogSupplierSelect = false;
            },
            GetClass(type) {
                if(type == "生效中") {
                    return "success";
                }
                if(type == "待生效") {
                    return "warning";
                }
                if(type == "未保存") {
                    return "danger";
                }
            },
            FocusStartDate(index, type) {
                this.dialogSupplierParam.focusIndex = index;
                this.dialogSupplierParam.type = type;
            },
            FocusEndDate(index, type) {
                this.dialogSupplierParam.focusIndex = index;
                this.dialogSupplierParam.type = type;
            },
            AppendNextRow(){
                var index = this.dialogSupplierParam.supplierSelectData.length - 1;
                var lastRow = this.dialogSupplierParam.supplierSelectData[index];

                if (isNullOrWhiteSpace(lastRow.supplierCode)) {
                    this.$message({
                        type: 'warning',
                        message: "请先输入供应商"
                    });
                    return;
                }
                this.AppendDefaultRow();
            },
            DeleteItem(index) {
                var lastRow = this.dialogSupplierParam.supplierSelectData[index];

                if(!isNullOrWhiteSpace(lastRow.supplierCode)) {
                    this.$confirm("确定删除吗？", '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.dialogSupplierParam.supplierSelectData.splice(index, 1);
                        // 无即存数据时追加一个空行
                        if(this.dialogSupplierParam.supplierSelectData.length == 0)
                            this.AppendDefaultRow();
                    });
                } else {
                    this.dialogSupplierParam.supplierSelectData.splice(index, 1);
                    // 无即存数据时追加一个空行
                    if(this.dialogSupplierParam.supplierSelectData.length == 0)
                        this.AppendDefaultRow();
                }
            },
            StartDateChange(index) {
                // 第二行时，如果StartDate有变更，则第一行的EndDate自动更改为日期-1天
                if(index == 1) {
                    var tempDate = new Date(this.dialogSupplierParam.supplierSelectData[1].startDate);
                    tempDate.add("d", -1);
                    this.dialogSupplierParam.supplierSelectData[0].endDate = this.formatDate(tempDate);
                }
            },
            // 格式化显示日期
            formatShowDate(strDate) {
                if(isNullOrWhiteSpace(strDate)) {
                    strDate = "2099-12-31";
                }
                return strDate;
            },
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
            // 开始日期过滤
            StartDate() {
                let that = this;
                return {
                    disabledDate(time) {
                        if (that.dialogSupplierParam.focusIndex == 1 && that.dialogSupplierParam.type == "s") {
                            var wkEndDate = that.dialogSupplierParam.supplierSelectData
                                [that.dialogSupplierParam.focusIndex].endDate;
                            if(isNullOrWhiteSpace(wkEndDate))
                                wkEndDate = "";
                            return time.getTime() <= new Date(that.dialogSupplierParam.supplierSelectData
                                    [0].endDate) || time.getTime() >= new Date(wkEndDate);
                        } else {
                            var wkEndDate = that.dialogSupplierParam.supplierSelectData
                                [that.dialogSupplierParam.focusIndex].endDate;
                            if(isNullOrWhiteSpace(wkEndDate))
                                wkEndDate = "";
                            return time.getTime() >= new Date(wkEndDate)
                        }
                    }
                }
            },
            // 结束日期过滤
            EndDate() {
                let that = this;
                return {
                    disabledDate(time) {
                        if(typeof(that.dialogSupplierParam.supplierSelectData
                                [that.dialogSupplierParam.focusIndex]) == "undefined")
                            return;
                        var wkSDate = that.dialogSupplierParam.supplierSelectData
                            [that.dialogSupplierParam.focusIndex].startDate;
                        wkSDate = isNullOrWhiteSpace(wkSDate) ? "" : wkSDate;
                        var tempDate = new Date(wkSDate);
                        var nowDate = new Date();
                        tempDate.add("d", -1);
                        nowDate.add("d", -1);


                        if(that.dialogSupplierParam.type == "e" && !isNullOrWhiteSpace(wkSDate)) {
                            return time.getTime() <= tempDate || time.getTime() <= nowDate;
                        }
                    },
                }
            },
            // 保存按钮方法
            DoSave() {
                if(this.mode == "0")
                    this.SaveCClassSupplier();
                else if(this.mode == "1")
                    this.$refs.ItemClassMaintain.SaveChange();
            },
            // 保存营运点-供应商
            SaveCClassSupplier() {
                var row;
                var row_back;
                var lstCClassSupplier = [];

                for(var i = 0; i < this.tblData.length; i++) {
                    row = this.tblData[i];
                    row_back = this.tblData_back[i];

                    for(var itemObj of this.itemClassData) {
                        /***检查是否有修改***/
                        if(this.CheckObjChange(row, row_back, itemObj)) {
                            /***追加到待修改***/
                            var lstWork = this.ConvertToCClassSupplier(row, itemObj);
                            if(lstWork != null && lstWork.length > 0)
                                lstCClassSupplier = lstCClassSupplier.concat(lstWork);
                        }
                    }
                }
                /***必要性检查***/
                if(lstCClassSupplier == null || lstCClassSupplier.length == 0) {
                    this.$message({
                        type: 'warning',
                        message: "没有需要保存的记录"
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
                    /***生成参数***/
                    var param = {
                        userId: this.user.account,
                        dbName: this.companyCode,
                        lstCClassSupplier: lstCClassSupplier
                    }
                    /***执行保存操作***/
                    SaveCClassSupplier(param).then(data => {
                        if (data && data.code == "200") {
                            this.$message({
                                type: 'success',
                                message: '保存成功！'
                            });
                            this.GetCClassSupplierData("1");
                        } else {
                            this.$message({
                                type: 'error',
                                message: '保存失败！'
                            });
                        }
                    });
                }).catch(()=>{
                    this.loading = false;
                });
            },
            // 检查是否有修改
            CheckObjChange(row1, row2, itemObj) {
                var suppliers1 = row1["suppliers" + itemObj.sort];
                var suppliers2 = row2["suppliers" + itemObj.sort];

                if(suppliers1.length != suppliers2.length)
                    return true;

                for(var i = 0; i < suppliers1.length; i++) {
                    if (suppliers1[i]["supplierCode"] != suppliers2[i]["supplierCode"] ||
                        suppliers1[i]["startDate"] != suppliers2[i]["startDate"] ||
                        suppliers1[i]["endDate"] != suppliers2[i]["endDate"] ||
                        suppliers1[i]["defaultSupplier"] != suppliers2[i]["defaultSupplier"])
                        return true;
                }
                return false;
            },
            // 将单元格转换成CClassSupplier对象
            ConvertToCClassSupplier(row, itemObj) {
                var changeList = [];

                for(var sup of row["suppliers" + itemObj.sort]) {
                    var ccsObj = this.NewRow();

                    // 供应商代码不存在时返回null
                    if (isNullOrWhiteSpace(sup["supplierCode"]))
                        continue;

                    // 成本中心
                    ccsObj.costCenterCode = row.costCenterCode;
                    // ItemClass GUID
                    ccsObj.classGuid = itemObj.guid;
                    // 供应商代码
                    ccsObj.supplierCode = sup["supplierCode"];
                    // 开始日期
                    ccsObj.startDate = sup["startDate"];
                    // 结束日期
                    ccsObj.endDate = sup["endDate"];
//                  // 默认
                    ccsObj.defaultSupplier = sup["defaultSupplier"];
                    // 修改标志
                    ccsObj.changeFlag = "1";

                    changeList.push(ccsObj);
                }

                return changeList;
            },
            // 是否显示计划行
            ShowFutCard(row) {
                for(var itemObj of this.itemClassData) {
                    if(!isNullOrWhiteSpace(row["supplierCode_Fut_" + itemObj.sort]))
                        return true;
                }
                return false;
            },
            // new一个新列Object
            NewRow() {
                var row = {};
                // 成本中心代码
                row.costCenterCode = "";
                // 成本中心名称
                row.costCenterName = "";
                /***动态生成列***/
                for (var it of this.itemClassData) {
                    row["suppliers" + it.sort] = [];
                }
                // ItemClass GUID
                row.classGuid = "";
                // 供应商代码
                row.supplierCode = "";
                // 开始日期
                row.startDate = "";
                // 结束日期
                row.endDate = "";
                // 修改标志
                row.changeFlag = "";

                return row;
            },
            // 数据维护界面切换
            ChangeMode() {
                if(isNullOrWhiteSpace(this.companyCode))
                    return;
                this.loading = true;

                if(this.mode == "0")
                    this.GetCClassSupplierData();
                if(this.mode == "1")
                    this.$refs.ItemClassMaintain.GetData();
            },
            // 子组件loading完毕
            EndLoading() {
                this.loading = false;
            },
            // 默认供应商单选控制
            SetDefaultSupplier(index) {
                var ary = this.dialogSupplierParam.supplierSelectData;
                var check = ary[index].defaultSupplier;

                if(!check) {
                    ary[index].defaultSupplier = true;
                    return;
                }

                if(check) {
                    for(var i = 0; i < ary.length; i++) {
                        if(i == index)
                            continue;
                        ary[i].defaultSupplier = false;
                    }
                }
            },
            ChangeSupplier() {
                var ary = this.dialogSupplierParam.supplierSelectData;

                if(ary.length == 1 && !ary[0].defaultSupplier)
                    ary[0].defaultSupplier = true;
            },
            AppendDefaultRow() {
                var line = deepCopy(supplierSelectData);
                line.startDate = this.formatDate(new Date());
                this.dialogSupplierParam.supplierSelectData.push(line);
            },
            // Suppliers排序
            // 排序方法
            DoSort(suppliers) {
                suppliers = suppliers.sort(function(x,y){
                    var res = null;

                    if(x.defaultSupplier)
                        res = -1;
                    else
                        res = 1;
                    return res;
                });
                return suppliers;
            },
            // 取得供应商名称
            GetSupplierName(supplierCode) {
                var supObj = getRowFromArray(supplierCode, this.supplierOption, "code");

                return supObj == null? "（原料类型匹配未维护）": supObj.name;
            },
            GetBGColor(costCenterCode, index) {
                if(isNullOrWhiteSpace(costCenterCode)){
                    if(index == 0)
                        return 'card-war-background';
                    else
                        return 'card-del-background';
                } else {
                    if(index == 0)
                        return 'card-background';
                    else
                        return 'card-del-background';
                }
            },
            GetMaxIndex(index) {
                var row = this.tblData[index];
                var maxIndex = -1;
                var currIndex = -1;

                for (var it of this.itemClassData) {
                    currIndex = row["suppliers" + it.sort].length;
                    if(currIndex > maxIndex)
                        maxIndex = currIndex;
                }
                // 赋默认值
                if(maxIndex < 1)
                    maxIndex = 1;

                return maxIndex;
            }
        },
        mounted() {

        }
    }
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
    .code {
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .name {
        font-size: 12px;
        color: #b4b4b4;
        width:100%;
        display:block;/*内联对象需加*/
        word-break:keep-all;/* 不换行 */
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .name2 {
        font-size: 12px;
        width:100%;
        display:block;/*内联对象需加*/
        word-break:keep-all;/* 不换行 */
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .name3 {
        font-size: 12px;
        color: #b4b4b4;
        width:100%;
        display:block;/*内联对象需加*/
        /*word-break:keep-all;!* 不换行 *!*/
        /*white-space:nowrap;!* 不换行 *!*/
        /*overflow:hidden;!* 内容超出宽度时隐藏超出部分的内容 *!*/
        /*text-overflow:ellipsis;!* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*!*/
    }
    .default {
        font-size: 13px;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight:bold;
    }
    .el-table td, .el-table th {
        padding-top: 3px ;
        padding-bottom: 3px;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button{
        -webkit-appearance: none !important;
        margin: 0;
    }
    .span-text {
        color: #929292;
        font-size: 10.5px;
    }
    .empty-line {
        height: 30px;
    }
</style>