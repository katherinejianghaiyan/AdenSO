<template>
    <div>
        <el-table :data="tblData"
                  :span-method="SpanMethod"
                  ref="tblData"
                  v-if="tblData.length > 0"
                  border
                  :cell-class-name="cellClassName"
                  :height="this.fullHeight<200?300:this.fullHeight-40">
            <el-table-column label="父阶层"
                             width="150"
                             :resizable="true"
                             align="center"
                             fixed="left">
                <template slot-scope="scope">
                    <div v-if="!isNullOrWhiteSpace(scope.row.p_code)">
                        <span class="code">{{ scope.row.p_code }}</span>
                        <div class="name3">{{ scope.row.p_name }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="子阶层"
                             width="150"
                             :resizable="true"
                             align="center"
                             fixed="left">
                <template slot-scope="scope">
                    <div v-if="!isNullOrWhiteSpace(scope.row.c_code)">
                        <span class="code" v-if="scope.row.c_code != 'all'">{{ scope.row.c_code }}</span>
                        <div :class="scope.row.c_code != 'all'? 'name3': 'name-white'">{{ scope.row.c_name }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column v-for="(item, index) in this.itemClassData"
                             :key=item.sort
                             :label="item.name"
                             width="90"
                             :resizable="true"
                             align="center">
                <template slot-scope="scope">
                    <el-radio v-model="scope.row.radio" :label="item.sort"
                              @click.native="ClearRadio(scope.$index)"
                              @change="RadioChange(scope.$index)"
                              style="padding-left: 15px">{{ '' }}</el-radio>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import tblDataMappingModel from '../../../static/MealTypeMaintain/tblDataMapping.json';

    import {
        isNullOrWhiteSpace,
        deepCopy,
        deepClone,
        getRowFromArray,
        arraySearch,
        chGMT
    } from '../../assets/js/common';

    import {
        GetItemClassMaintainData,
        SaveItemClassMaintainData
    } from '../../api/api';

    export default {
        components: {
        },
        props: [
            "dbCode",
            "userId"
        ],
        watch: {
            dbCode(val) {
                this.dbCode = val;
                this.GetData();
            }
        },
        created() {
        },
        data() {
            return {
                fullHeight: window.innerHeight-151,
                tblData: [],
                tblData_back: [],
                itemClassData: [],
                mappingData: [],
                tblDataMapping: [],
                companyCode: "",
                p_count: 0,
                c_count: 0,
            }
        },
        methods: {
            GetData(refresh) {
                this.tblData = [];
                GetItemClassMaintainData({
                    code: this.dbCode
                }).then(data => {
                    if (data && data.code == "200") {
                        this.mappingData = data.content.lstTblDataMapping == null? []: data.content.lstTblDataMapping;
                        this.itemClassData = data.content.lstItemClass_y;
                        this.FormatTblData(data.content.lstItemClass_x);
                    }
                    if(isNullOrWhiteSpace(refresh))
                        this.$message({
                            type: "success",
                            message: "共" + this.p_count + "个大分类，" + this.c_count + "个小分类",
                            duration: 5000
                        });
                    this.$emit("EndLoading");
                }).catch(() => {
                    this.$emit("EndLoading");
                });
            },
            // 格式化画面Data
            FormatTblData(table) {
                this.p_count = 0;
                this.c_count = 0;

                for(var row of table) {
                    var line = {
                        p_code: row.p_code,
                        p_name: row.p_name,
                        c_code: row.c_code,
                        c_name: row.c_name,
                        rowSpan: row.rowSpan,
                        radio: "",
                        disabled: false
                    }
                    this.tblData.push(line);

                    if(row.c_code == "all")
                        this.p_count = this.p_count + 1;
                    else
                        this.c_count = this.c_count + 1;
                }

                for(var mappingObj of this.mappingData) {
                    // 判断父级
                    if(mappingObj.code2.length == 4) {
                        var ary = arraySearch(mappingObj.code2, this.tblData, "p_code");

                        if(ary.isEmpty())
                            continue;

                        for(var row of ary) {
                            row.radio = mappingObj.sort;
                        }
                    } else {
                        var row = getRowFromArray(mappingObj.code2, this.tblData, "c_code");

                        if(row != null)
                            row.radio = mappingObj.sort;
                    }
                }
                //比较数据备份
                this.tblData_back = JSON.parse(JSON.stringify(this.tblData));
            },
            SpanMethod({ row, column, rowIndex, columnIndex }) {
                // 第一列合并
                var rowspan = 0;
                if (columnIndex === 0) {
                    rowspan = this.tblData[rowIndex].rowSpan;
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
            // 数量调整行背景色
            cellClassName({row, column, rowIndex, columnIndex}) {
                if(columnIndex != 0 && row.c_code == "all") {
                    return "allColor";
                }
                if(columnIndex == 1 && row.c_code != "all" && isNullOrWhiteSpace(row.radio)) {
                    return "noSelColor"
                }
            },
            // 单选框值变化
            RadioChange(index) {
                var p_code = this.tblData[index].p_code;
                var c_code = this.tblData[index].c_code;
                var radio = this.tblData[index].radio;

                for(var row of this.tblData) {
                    if(p_code != row.p_code)
                        continue;

                    if(c_code == row.c_code)
                        continue;

                    if(c_code == "all")
                        row.radio = radio;
                    else if(c_code != "all" && row.c_code == "all") {
                        var ary = arraySearch(p_code, this.tblData, "p_code");
                        for(var line of ary) {
                            if(line.c_code != "all" && line.radio != radio) {
                                row.radio = "";
                                break;
                            }
                            row.radio = radio;
                        }
                    }
                }
            },
            // 清除单选框
            ClearRadio(index) {
                if(isNullOrWhiteSpace(this.tblData[index].radio))
                    return;
                this.tblData[index].radio = "";
                var p_code = this.tblData[index].p_code;
                var c_code = this.tblData[index].c_code;

                for(var row of this.tblData) {
                    if(c_code != "all") {
                        if (row.p_code == p_code && row.c_code == "all") {
                            row.radio = "";
                            break;
                        }
                    } else {
                        if (row.p_code == p_code && row.c_code != "all") {
                            row.radio = "";
                        }
                    }
                }
            },
            // 保存方法
            SaveChange() {
                // 检查是否有记录需要保存
                this.CheckChange();

                if(this.tblDataMapping.length == 0) {
                    this.$message.warning("没有需要保存的记录");
                    return;
                }

                var message = "确定保存吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var param = {
                        userId: this.userId,
                        dbCode: this.dbCode,
                        lstTalDataMapping: this.tblDataMapping
                    }
                    SaveItemClassMaintainData(param).then(data => {
                        if (data && data.code == "200") {
                            this.$message.success("保存成功");
                            this.GetData("refresh");
                        } else {
                            this.$message.error("保存失败");
                        }
                        this.$emit("EndLoading");
                    }).catch(() => {
                        this.$emit("EndLoading");
                    });
                    this.$emit("EndLoading");
                }).catch(()=>{
                    this.$emit("EndLoading");
                });
            },
            // 检查需要保存的记录
            CheckChange() {
                this.tblDataMapping = [];
                var tblParents = this.tblData.distinct(["p_code"]);

                for(var parent of tblParents) {
                    var aryC = arraySearch(parent.p_code, this.tblData, "p_code");
                    var aryT = arraySearch(parent.p_code, this.tblData_back, "p_code");

                    for(var i = 0; i < aryC.length; i++) {
                        if(aryC[i].radio != aryT[i].radio) {
                            this.tblDataMapping = this.tblDataMapping.concat(this.ConvertToTblMappingData(aryC));
                            break;
                        }
                    }
                }
            },
            // 转换成保存的格式
            ConvertToTblMappingData(ary) {
                var resultAry = [];

                for(var line of ary) {
                    if(isNullOrWhiteSpace(line.radio))
                        continue;
                    var saveRow = deepCopy(tblDataMappingModel);
                    var itemObj = getRowFromArray(line.radio, this.itemClassData, "sort");

                    saveRow.type = "RMClassMapping";
                    saveRow.code1 = itemObj.guid;
                    saveRow.name1 = itemObj.name;
                    saveRow.code2 = line.c_code == "all" ? line.p_code : line.c_code;
                    saveRow.name2 = line.c_code == "all" ? line.p_name : line.c_name;
                    saveRow.p_code = line.p_code;

                    resultAry.push(saveRow);

                    // 如果全选行被选中则只追加全选行
                    if(line.c_code == "all")
                        break;
                }
                if(resultAry.length == 0) {
                    var line = ary[0];
                    var saveRow = deepCopy(tblDataMappingModel);

                    saveRow.type = "RMClassMapping";
                    saveRow.code1 = "";
                    saveRow.name1 = "";
                    saveRow.code2 = line.c_code == "all" ? line.p_code : line.c_code;
                    saveRow.name2 = line.c_code == "all" ? line.p_name : line.c_name;
                    saveRow.p_code = line.p_code;
                    saveRow.delFlag = "del";

                    resultAry.push(saveRow);
                }

                return resultAry;
            },
            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            }
        }
    }
</script>
<style>
    @import '../../assets/css/common.css';

    .el-table td, .el-table th {
        padding-top: 3px ;
        padding-bottom: 3px;
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
        word-break:keep-all;/* 不换行 *//
        white-space:nowrap;/* 不换行 */
        overflow:hidden;/* 内容超出宽度时隐藏超出部分的内容 */
        text-overflow:ellipsis;/* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
    }
    .name-white {
        font-size: 12px;
        font-weight: bold;
        color: #ffffff;
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
        line-height: 15px;
    }
    .allColor {
        background: #84afc1;
    }
    .noSelColor {
        background: #fffab7;
    }
    .whiteColor {
        color: #ffffff;
    }
</style>