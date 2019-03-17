<template>
    <div v-loading="loading"
         element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <el-select
                        :options="ccWhsOption"
                        v-model="selectCCWhs"
                        style="width:340px"
                        placeholder="请选择成本中心，也可输入关键词"
                        filterable
                        expand-trigger="hover"
                        size="small"
                        @change="CreateEdit">
                    <el-option v-for="item in ccWhsOption" :key="item.siteGuid" :value="item.siteGuid" :label="item.costCenterCode+' / '+item.costCenterName_ZH">
                    </el-option>
                </el-select>

                <el-button type="primary"
                           size="small"
                           :disabled="r_week || menuDataFomat.length == 0"
                           @click="SaveMenuOrder"><i class="fa fa-save" aria-hidden="true"></i> 保存
                </el-button>

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

                <el-button type="primary" size="small" v-if="item_copy" @click="copyItem">复制
                </el-button>

                <el-button type="success" size="small" v-if="item_paste" @click="pasteItem">粘贴
                </el-button>
            </el-col>
        </el-row>

        <el-table
                ref="docTable"
                :data="menuDataFomat"
                border
                :height="this.fullHeight<300?300:this.fullHeight"
                style="width: 100%">
            <el-table-column
                    align="center"
                    label="餐次"
                    width="80">
                <template slot-scope="scope">
                    <el-select v-model="scope.row.mealCode" size="small" @change="pushNewRow(scope.$index)">
                        <el-option v-for="item in mealType" :key="item.value" :value="item.value" :label="item.label"></el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                    prop="menuType"
                    align="center"
                    label="类别"
                    width="88">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.windowType" size="small" @change.native="pushNewRow(scope.$index)" placeholder="中文内容"></el-input>
                    <el-input v-model="scope.row.windowType_en" size="small" placeholder="English Input">
                    </el-input>
                </template>
            </el-table-column>
            <el-table-column
                    v-for="(item, index) in weekNameData"
                    :key="item.day"
                    header-align="center"
                    :label="item.name + ' ' + weekData[item.day + '_date'].substr(5,10)">
                <template slot-scope="scope">
                    <el-autocomplete v-model="scope.row[item.day + '_foodNames']" class="inline-input" placeholder="中文内容" size="small"
                                     :fetch-suggestions="querySearch" @change.native="pushNewRow(scope.$index)"
                                     @select="pushNewRow(scope.$index)"
                    ></el-autocomplete><br>
                    <el-input v-model="scope.row[item.day + '_foodNames_en']" size="small" placeholder="English Input">
                    </el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="80">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" width="50" @click.native="addRow(scope.$index,scope.row)">插入</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    var user = JSON.parse(sessionStorage.getItem('user'));
    import {
        isNullOrWhiteSpace,
        getRowFromArray,
        chGMT,
        deepCopy,
    } from '../../assets/js/common';

    import {
        searchItem,
        GetCCWhs_SUZHYC,
        SaveMenuOrder_SUZHYC,
        GetMenuOrder_SUZHYC,
        GetConfig,
    } from '../../api/api'

    /***Object Json模板***/
    import menuModel from '../../../static/menuObj_SUZHYC.json';
    import menuOrderModel from '../../../static/menuHeadObj_SUZHYC.json';

    export default {
        data() {
            return {
                sDate: "",
                loading: false,
                isLocal: false,
                user: "",
                menuData: [],
                ccWhs: [],
                fullHeight: window.innerHeight - 192,
                menuDataFomat: [],
                selectCCWhs: [],
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
                ccWhsOption: [],
                thisMonday: "",
                menuOrderHead: [],
                mealType:[
                    {
                        value:'41',
                        label:'早餐'
                    },{
                        value:'42',
                        label:'午餐'
                    },{
                        value:'43',
                        label:'晚餐'
                    },{
                        value:'44',
                        label:'夜宵'
                    },{
                        value:'45',
                        label:'深夜餐'
                    }],
                itemOption:[],
                oldMenuDataFomat:[],
            };
        },
        computed: {
            // 判断日期是否小于下周
            r_week: function() {
                if(this.thisMonday > this.weekData.mon_date)
                    return true;
                else
                    return false;
            },
            //复制时显示按钮
            item_copy:function () {
                var i=0;
                for(let line of this.menuDataFomat){
                    if(!isNullOrWhiteSpace(line.mealCode))
                        i++;
                }
                if(this.thisMonday >= this.weekData.mon_date && i>0)
                    return true;
                else
                    return false;
            },
            //粘贴时显示按钮
            item_paste:function(){
                var i=0;
                for(let line of this.menuDataFomat){
                    if(!isNullOrWhiteSpace(line.mealCode))
                        i++;
                }
                if(this.thisMonday < this.weekData.mon_date && i===0 && this.oldMenuDataFomat.length>0)
                    return true;
                else
                    return false;
            }
        },

        methods: {
            copyItem(){
                this.oldMenuDataFomat=[];

                this.oldMenuDataFomat=this.menuDataFomat
                if(this.oldMenuDataFomat.length>0){
                    this.$message.success("数据已经被复制！")
                }
            },
            pasteItem(){
                this.menuDataFomat=this.oldMenuDataFomat;
            },
            pushNewRow(index){
                if(index+1===this.menuDataFomat.length){
                    this.pushRow();
                }
            },
            querySearch(queryString, cb) {
                var options=this.itemOption;
                var results=queryString ? options.filter(this.createFilter(queryString)) : options;
                cb(results);
            },
            createFilter(queryString) {
                return (option) => {
                    return (option.value.toLowerCase().indexOf(queryString.toLowerCase())>= 0);
                };
            },
            loadAll() {
                searchItem({
                    "": JSON.stringify({
                        dbName: getRowFromArray(this.selectCCWhs, this.ccWhsOption, "siteGuid").dbName,
                        requiredDate: this.weekData.sun_date,
                        requiredQty: 0,
                        costCenterCode:getRowFromArray(this.selectCCWhs, this.ccWhsOption, "siteGuid").costCenterCode,
                        DynamicFieldsGUID:'0FA83AF6-AFF5-40C2-A30A-936A1BCED945'
                    })
                }).then(data => {
                        if (data && data.code === '200') {
                            this.itemOption=[];
                            for(let line of data.content){
                                this.itemOption.push({
                                    value:line.itemName_ZH
                                });
                            }
                        }
                    }).catch(() => {});
            },

            //删除行
            delRow(index,row){
                var menuTemp = [];

                for (var item of this.weekNameData) {
                    row[item.day + '_deleteFlag'] = '1';
                }

                var message = "确定删除吗？";
                menuTemp.push(row);
                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    // 设置RFC参数
                    var param = {
                        createUser: this.user.account,
                        menuOrderHeadObj: menuTemp
                    };
                    //this.loading = false;
                    // 调用RFC进行保存
                    SaveMenuOrder_SUZHYC(param).then(data => {
                        if (data && data.code == "200") {
                            this.menuDataFomat.splice(index,1);
                            this.GetMenuOrder();
                            this.$message({
                                type: 'success',
                                message: '周单删除成功！'
                            });
                        } else {
                            this.$message({
                                type: 'error',
                                message: '周单删除失败！'
                            });
                        }
                    });
                }).catch(() => {
                    this.loading = false;
                });
            },
            //添加行
            addRow(index,row){
                var menuTemp = deepCopy(menuModel);
                menuTemp.mealCode = row.mealCode;
                menuTemp.mealType_bak = '';

                menuTemp.windowType = row.windowType;
                menuTemp.windowType_bak = '';

                for (var item of this.weekNameData) {
                    menuTemp[item.day + '_mealCode'] = row[item.day + '_mealCode'];
                    menuTemp[item.day + '_windowType'] = row[item.day + '_windowType'];
                    menuTemp[item.day + '_foodNames'] = '';
                    menuTemp[item.day + '_foodNames_bak'] = '';
                    // menuTemp[item.day + '_siteGuid'] = row[item.day + '_siteGuid'];
                    menuTemp[item.day + '_classSort'] = row.classSort*1-1+'.1';
                    menuTemp[item.day + '_minRequiredDate'] = row[item.day + '_minRequiredDate'];
                }
                this.menuDataFomat.splice(index,0,menuTemp);
            },

            //表后添加行
            pushRow(){
                var mealCode = this.menuDataFomat[this.menuDataFomat.length-1].mealCode;
                var windowType = this.menuDataFomat[this.menuDataFomat.length-1].windowType;

                this.menuDataFomat.push(this.NewMenuDataRow(mealCode, windowType))
            },

            // New一个MenuData的新行
            NewMenuDataRow(mealCode, windowType) {
                var menuTemp = deepCopy(menuModel);

                menuTemp.mealCode = mealCode;
                menuTemp.windowType = windowType;

                return menuTemp;
            },

            // 取得登录者信息
            getUserInfo() {
                var userInfo = sessionStorage.getItem('user');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                    this.user = userInfo;
                }
            },
            isNullOrWhiteSpace(string){
                return isNullOrWhiteSpace(string);
            },
            // 取得CostCenter下拉框选项
            GetCCWhs_SUZCHY() {
                this.loading = true;
                GetCCWhs_SUZHYC({
                    action: "menu-weekly-v2",
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        for (var cw of this.ccWhsOption) {
                            cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                        }
                        if(this.ccWhsOption.length===1){
                            this.selectCCWhs=this.ccWhsOption[0].siteGuid;
                        }
                        this.GetMenuOrder();
                    }
                }).catch(() => {
                    this.loading = false;
                })
            },
            // CostCenter、档口选择事件
            CreateEdit() {
                if (this.selectCCWhs.length == 0)
                    return;

                this.loading = true;
                // 先从数据库取MenuOrder
                this.GetMenuOrder();
                //清空剪切板
                this.oldMenuDataFomat=[]
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
            },
            // 读取MenuOrder
            GetMenuOrder() {
                var site = this.selectCCWhs;

                var param = {
                    siteGuid: site,    // 成本中心
                    startDate: this.weekData.mon_date, // 一周开始日期
                };

                GetMenuOrder_SUZHYC(param).then(data => {
                    if (data && data.code == "200") {
                        this.SetMenuData(data.content);

                        this.isLocal = false;
                    } else {
                        this.menuDataFomat = [];
                        //this.formatMenuData();
                        this.isLocal = true;
                        this.loading = false;
                    }
                    this.loadAll();
                    this.menuDataFomat.push(this.NewMenuDataRow('', ''));
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 将MenuOrderHead转成用于显示的MenuData
            SetMenuData(lstMenuOrderHead) {
                this.menuData = [];
                this.menuDataFomat = [];

                for (var mos of lstMenuOrderHead) {
                    //console.log(mos);
                    this.menuDataFomat.push({
                        mealCode:mos.mealCode,
                        windowType:mos.windowType,
                        windowType_en:mos.windowType_en,
                        mon_foodNames:mos.foodNames1,
                        tue_foodNames:mos.foodNames2,
                        wed_foodNames:mos.foodNames3,
                        thu_foodNames:mos.foodNames4,
                        fri_foodNames:mos.foodNames5,
                        sat_foodNames:mos.foodNames6,
                        sun_foodNames:mos.foodNames7,

                        mon_foodNames_en:mos.foodNames_en1,
                        tue_foodNames_en:mos.foodNames_en2,
                        wed_foodNames_en:mos.foodNames_en3,
                        thu_foodNames_en:mos.foodNames_en4,
                        fri_foodNames_en:mos.foodNames_en5,
                        sat_foodNames_en:mos.foodNames_en6,
                        sun_foodNames_en:mos.foodNames_en7,
                    });
                }
                // console.log(this.menuDataFomat);
                this.loading = false;
            },
            // 保存MenuOrder
            SaveMenuOrder() {
                var message = "确定提交吗？";

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;

                    var menuOrderHeadObj=[];

                    var param = deepCopy(menuOrderModel);
                    param.siteGuid=this.selectCCWhs;
                    param.createUser=this.user.account;
                    param.startDate=this.weekData.mon_date;

                    for(let line of this.menuDataFomat){
                        menuOrderHeadObj.push({
                            mealCode:line.mealCode,
                            windowType:line.windowType,
                            windowType_en:line.windowType_en,
                            foodNames1:line["mon_foodNames"],
                            foodNames2:line["tue_foodNames"],
                            foodNames3:line["wed_foodNames"],
                            foodNames4:line["thu_foodNames"],
                            foodNames5:line["fri_foodNames"],
                            foodNames6:line["sat_foodNames"],
                            foodNames7:line["sun_foodNames"],

                            foodNames_en1:line["mon_foodNames_en"],
                            foodNames_en2:line["tue_foodNames_en"],
                            foodNames_en3:line["wed_foodNames_en"],
                            foodNames_en4:line["thu_foodNames_en"],
                            foodNames_en5:line["fri_foodNames_en"],
                            foodNames_en6:line["sat_foodNames_en"],
                            foodNames_en7:line["sun_foodNames_en"],
                        });
                    }
                    param.menuOrderHeadObj=menuOrderHeadObj;

                    this.loading = false;

                    // 调用RFC进行保存
                    SaveMenuOrder_SUZHYC(param).then(data => {
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
            // 取得开始日期（测试用）
            GetStartDate() {
                // 执行保存
                GetConfig("WeeklySDate").then(data => {
                    let wkDate;
                    let flag = "";
                    let thisMonday=new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+1-new Date().getDay());
                    if (data && data.code === '200') {
                        this.sDate = data.content;
                        if(new Date(this.sDate)-thisMonday<0)
                            wkDate=thisMonday;
                        else
                            wkDate = new Date(this.sDate);
                    } else {
                        this.sDate = "";
                        wkDate = new Date();
                        flag = "+";
                    }
                    this.getUserInfo();
                    this.SetWeekDate(wkDate, flag, "y");
                    this.GetCCWhs_SUZCHY();
                });
            },

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

    .el-table td, .el-table th {
        padding-top: 3px;
        padding-bottom: 3px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }


</style>