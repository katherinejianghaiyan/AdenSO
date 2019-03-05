<template>
    <section v-loading="loading"
             element-loading-text="查询中...">
        <el-row>
            <el-col :span="24" class="toolbar" style="padding-bottom:0px">
                <el-form :inline="true">
                    <el-form-item style="width:12%">
                        <el-select v-model="company"
                                   size="small"
                                   placeholder="选择公司"
                                   filterable
                                   @change="setCompany">
                            <el-option v-for="item in options"
                                       :key="item.companyCode"
                                       :value="item.companyCode"
                                       :label="item.companyCode +' / ' + item.companyName_ZH">
                                <span style="float: left">{{ item.companyCode }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.companyName_ZH }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-date-picker
                                class="customer-width"
                                v-model="searchDateRange"
                                type="daterange"
                                placeholder="选择日期范围"
                                size="small"
                                :picker-options="pickerOptions2"
                                :editable="false"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                v-show="show">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item v-if="show">
                        <el-input v-model="keyWord" size="small" placeholder="输入关键词">
                            <i slot="suffix" class="el-input__icon fa fa-key"></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="show">
                        <el-button type="primary" size="small" icon="el-icon-search"
                                   :disabled = "r_searchSO"
                                   @click="DoSearchSO">查询</el-button>
                    </el-form-item>
                    <!--<el-form-item>-->
                    <!--<el-button type="primary" size="small" icon="date"-->
                    <!--v-show="show" @click="Export">EXCEL</el-button>-->
                    <!--</el-form-item>-->
                    <el-form-item  style="float:right">
                        <el-button type="primary" size="small"
                                   @click="ShowSearchHis"><i class="fa fa-history"></i> 查询日志</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24" style="padding-bottom: 10px;">
                <div class="block" :inline="true" v-show="show">
                    <span class="demonstration" >
                        <el-select v-model="pageSize"
                                   size="small"
                                   style="width:15%;vertical-align:center;float:left"
                                   @change="changeSize">
                        <el-option v-for="item in Options" :key="item.value" :value="item.value" :label="item.label">
                        </el-option>
                    </el-select>
                    </span>
                    <pre style="float:left">  </pre>
                    <el-pagination
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page.sync="currentPage2"
                            layout="prev, pager, next"
                            :total= this.itemDataFilter.length
                            :page-size="this.pageSize"
                            background
                            :page-sizes="[10,50,100]">
                    </el-pagination>
                </div>
                <div>
                    <el-table
                            v-show="show"
                            :data="itemDataDsp"
                            stripe
                            border
                            size="mini"
                            :height="this.fullHeight<300?420:this.fullHeight"
                            style="width: 100%;text-align: center;font-size:12px"
                            @row-dblclick="GoToView"
                            :default-sort = "{prop: 'customCode',order: 'descending'}">
                        <el-table-column label="编号" align="center" v-if="false" prop="keyindex">
                            <template slot-scope="scope">
                                <span>{{scope.$index+1}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="合同客户" header-align="center" align="left" width="260" :resizable="false" prop="customerno" sortable>
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col class="item-text">
                                        <span>{{isNullOrWhiteSpace(scope.row.cmpCode) ? scope.row.customCode: scope.row.cmpCode}} / {{scope.row.customName_ZH}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="合同号" header-align="center" align="left" width="200" :resizable="false" prop="contractno" sortable>
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col class="item-text">
                                        <span>{{scope.row.contract}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="成本中心" align="center" prop="customerCode" sortable width="150" :resizable="false">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col :span="12" v-for="costCenterObj in scope.row.costCenterData" :key="costCenterCode">
                                        <span>{{costCenterObj}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="有效期" width="180" :resizable="false" align="center" prop="endDate" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.startDate}} / {{scope.row.endDate}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="截止日" align="center" prop="deadline" sortable width="80" :resizable="false">
                            <template slot-scope="scope">
                                <span>{{scope.row.deadline}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="生效日" align="center" width="100" :resizable="false" prop="validDate" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.validDate}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="终止日期" align="center" prop="expiryDate" sortable width="90" :resizable="false">
                            <template slot-scope="scope">
                                <span>{{scope.row.expiryDate}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="付款方式" align="center" width="180" :resizable="false" prop="paymentName_ZH" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.paymentName_ZH}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="signCount" label="续签数" align="center" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.signCount}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="币种" align="center" prop="currCode" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.currCode}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" align="center" width="200" :resizable="false" prop="remark" sortable>
                            <template slot-scope="scope">
                                <span>{{scope.row.remark}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="false">
                            <div v-show="false">
                                <template slot-scope="scope">
                                    <span>{{scope.row.headGuid}}</span>
                                </template>
                            </div>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="196" :resizable="false" fixed="right"
                                         v-if="canChange">
                            <template slot-scope="scope">
                                <!--<el-button type="text" size="small" @click="goNextPage('0', scope.row.HeadGUID,this.company)" v-if="seeDelete">[查看]</el-button>-->
                                <el-button type="primary" size="mini" style="margin-left: 3px"
                                           @click="goNextPage('1', scope.row.headGuid,this.company)"
                                           :disabled="scope.row.status==='9'?true:false">编辑</el-button>
                                <el-button type="warning" size="mini" style="margin-left: 3px"
                                           @click="goNextPage('2', scope.row.headGuid,this.company)"
                                           :disabled="scope.row.status != '2' ||
                                                      (scope.row.rebuildGuid != null && scope.row.rebuildGuid != '') ? true : false">续签</el-button>
                                <el-button type="success" size="mini" style="margin-left: 3px"
                                           @click="goNextPage('3', scope.row.headGuid,this.company)"
                                           :disabled="scope.row.status=='9' || (scope.row.rebuildGuid != null && scope.row.rebuildGuid != '') ? true:false">延续</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>
        </el-row>

        <el-dialog
                title="查询日志"
                :visible.sync="dialogSearchHisVisible">
            <el-table
                    :data="searchHisData"
                    border
                    :row-class-name="tableRowClassName"
                    size="mini"
                    style="font-size:12px">
                <el-table-column label="公司" :resizable="false" align="center">
                    <template slot-scope="scope">
                        {{scope.row.company}} / {{getRowFromArray(scope.row.company, options, "companyCode").companyName_ZH}}
                    </template>
                </el-table-column>
                <el-table-column label="有效日期范围" :resizable="false" align="center">
                    <template slot-scope="scope">
                        {{scope.row.sDate}} - {{scope.row.eDate}}
                    </template>
                </el-table-column>
                <el-table-column label="关键字" :resizable="false" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.keyWord}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="134" :resizable="false">
                    <template slot-scope="scope">
                        <el-button :type="scope.row.lock? 'danger': 'primary'" size="mini" style="margin-left: 3px"
                                   @click="LockSearchHis(scope.row)">
                            {{scope.row.lock? '解锁': '锁定'}}
                        </el-button>
                        <el-button type="primary" size="mini" style="margin-left: 3px"
                                   @click="LoadSearchSO(scope.row)">
                            查询
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </section>
</template>

<script>
    import{ SearchSO, SODetail, GetCompanyInAuth, MenuAction, SOcc} from '../../api/api'
    import {
        toGMT,
        chGMT,
        isNullOrWhiteSpace,
        arraySearch,
        getRowFromArray
    } from '../../assets/js/common';

    export default{
        components: {
        },
        data(){
            return {
                //fullHeight:document.documentElement.clientHeight-260,
                fullHeight: window.innerHeight - 260,
                pguid: 'CE081D08-6F20-4B6E-9FA1-6006A2FC7A35',
                guid: '95568B94-A6B6-4B2A-A61C-7D5D61731166',

                Options: [
                    {
                        value: 10,
                        label: '10条/页'
                    },
                    {
                        value: 50,
                        label: '50条/页'
                    },
                    {
                        value: 100,
                        label: '100条/页'
                    },
                ],
                loading: false,
                company: '',
                keyWord: '',
                show: false,
                dialogTableVisible: false,
                options: [],
                searchDateRange: [],
                pickerOptions2: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近半年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                itemData: [],
                itemDataFilter: [],
                itemDataDsp: [],
                detailGUID: '',
                canDelete: false,
                canChange: false,
                currentPage2: 1,
                page: 1,
                pageSize: 5,
                pageLines: [],
                PageNum: '5',
                sDateBackup: "",
                eDateBackup: "",
                dialogSearchHisVisible: false,
                searchHisData: [],
                loadFlag: false,
                hisBack: false
            };
        },
        created(){
            this.load();
            const ExportUtil = require('../../common/js/ExportUtil');
        },
        computed: {
            // 生成区间按钮只读控制
            r_searchSO() {
                var result = true;

                if(this.searchDateRange && this.searchDateRange.length == 2 && this.searchDateRange[0] != null) {
                    result = false;
                }
                return result;
            },
        },
        methods: {
            GoToView(row){
                this.goNextPage('0', row.headGuid, this.company);
            },
            changeSize(){
                this.currentPage2 = 1;
                this.handleCurrentChange(1);
            },
            handleSizeChange(val) {
            },
            handleCurrentChange(val) {
                this.page = val;
                this.itemDataDsp = this.itemDataFilter.filter((u, index) => index < this.pageSize * this.page && index >= this.pageSize * (this.page - 1));
            },
            goNextPage: function (mode, guid, company) {
                var sDate = this.formatDate(this.searchDateRange[0]);    // 开始日期
                var eDate = this.formatDate(this.searchDateRange[1]);    // 开始日期

                var condition = {
                    company: this.company,
                    sDate: sDate,
                    eDate: eDate,
                    keyWord: this.keyWord,
                }
                localStorage.setItem("SearchSOCond-" + this.user.account, JSON.stringify(condition));

                this.$router.push({path: '/query/edit', query: {
                    mode: mode,
                    headGuid: guid,
                    comp: this.company,
                    backBtn: true
                }});
            },
            load(){
                // 取得传入参数
                // false:一般情况 true:明细页面的返回操作
                this.hisBack = isNullOrWhiteSpace(this.$route.query.hisBack)? false: this.$route.query.hisBack;
                this.loading = true;

                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                GetCompanyInAuth({
                    action: 'so-search',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.options = data.content;

                        if(this.hisBack) {
                            var condition = JSON.parse(localStorage.getItem("SearchSOCond-" + this.user.account));

                            this.searchDateRange = [];
                            this.searchDateRange.push(toGMT(condition.sDate));
                            this.searchDateRange.push(toGMT(condition.eDate));
                            this.keyWord = condition.keyWord;
                            this.company = condition.company;
                            this.loadFlag = true;
                            this.setCompany();
                        }
                        else {
                            this.loading = false;
                        }
                    }
                    else this.options = [];
                });
            },
            // 选择公司方法
            setCompany(){
                // 初始化查询日期范围
                if(this.searchDateRange.length == null || this.searchDateRange.length == 0) {
                    this.initDateRange();
                }
                this.pageSize = 10;
                this.currentPage2 = 1;
                if(!this.loadFlag) {
                    this.keyWord = '';
                }
                this.loadFlag = false;
                this.show = true;
                // 取得用户权限然后取得SO记录
                this.GetMenuAction(this.SearchSO);
            },
            Export(){
                ExportUtil.toExcel('tul');
            },
            initDateRange() {
                var myDate = new Date();
                var sDate = myDate.format('yyyy/MM/dd');
                myDate.add("m", -12);
                myDate.setDate(1);
                var eDate = myDate.format('yyyy/MM/dd');
                this.searchDateRange = [];
                this.searchDateRange.push(toGMT(eDate));
                this.searchDateRange.push(toGMT(sDate));
                // 备份StartDate和EndDate
                this.sDateBackup = sDate;
                this.eDateBackup = eDate;
            },
            formatDate(date) {
                return chGMT(date, 'yyyy-MM-dd');
            },
            // 查询SO
            SearchSO(isAction) {
                this.itemData = [];
                // 打开loading
                this.loading = true;

                var sDate = this.formatDate(this.searchDateRange[0]);
                var eDate = this.formatDate(this.searchDateRange[1]);

                // 备份查询日期
                this.sDateBackup = sDate;
                this.eDateBackup = eDate;

                // 查询SO信息
                SearchSO(this.company, sDate, eDate).then(data => {
                    if (data && data.code == "200") {
                        var aryCostCenter = new Array();
                        // 最大的Item数据集
                        for (let line of data.content) {
                            aryCostCenter = line.costCenterCode.split(",");

                            this.itemData.push({
                                companyCode: line.companyCode,
                                headGuid: line.headGuid,
                                signCount: line.signCount,
                                cmpCode: line.cmpCode,
                                customCode: line.customCode,
                                customName_ZH: line.customName_ZH,
                                customName_EN: line.customName_EN,
                                contract: line.contract,
                                startDate: line.startDate,
                                endDate: line.endDate,
                                expiryDate: line.expiryDate,
                                deadline: line.deadline,
                                currCode: line.currCode,
                                paymentCode: line.paymentCode,
                                validDate: line.validDate,
                                paymentName_ZH: line.paymentName_ZH,
                                paymentName_EN: line.paymentName_EN,
                                remark: line.remark,
                                status: line.status,
                                costCenterData: aryCostCenter,
                                rebuildGuid: line.rebuildGuid
                            });
                        }
                        // 回调方法
                        this.FilterItemData(isAction);
                    } else {
                        this.itemData = [];
                        this.itemDataFilter = [];
                        this.itemDataDsp = [];
                        this.$message.error("没有符合条件的订单！");
                        this.loading = false;
                        return;
                    }
                }).catch(() => {
                    this.itemData = [];
                    this.itemDataFilter = [];
                    this.itemDataDsp = [];
                    this.$message.error("查询失败！");
                    this.loading = false;
                });
            },
            // 关键字过滤
            FilterItemData(isAction) {
                this.itemDataFilter = [];
                var costCenterStr = "";

                for (let item of this.itemData) {
                    costCenterStr = "";

                    for(var i = 0; i < item.costCenterData.length; i++) {
                        costCenterStr = costCenterStr + " " + item.costCenterData[i];
                    }

                    this.keyWord = this.keyWord.trim();

                    if (isNullOrWhiteSpace(this.keyWord.trim()) ||
                        item.contract.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                        item.customCode.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                        item.customName_ZH.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                        item.paymentName_ZH.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                        costCenterStr.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                        item.remark.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1) {
                        this.itemDataFilter.push({
                            companyCode: item.companyCode,
                            headGuid: item.headGuid,
                            signCount: item.signCount,
                            cmpCode: item.cmpCode,
                            customCode: item.customCode,
                            customName_ZH: item.customName_ZH,
                            customName_EN: item.customName_EN,
                            contract: item.contract,
                            startDate: item.startDate,
                            endDate: item.endDate,
                            expiryDate: item.expiryDate,
                            deadline: item.deadline,
                            currCode: item.currCode,
                            paymentCode: item.paymentCode,
                            validDate: item.validDate,
                            paymentName_ZH: item.paymentName_ZH,
                            paymentName_EN: item.paymentName_EN,
                            remark: item.remark,
                            status: item.status,
                            costCenterData: item.costCenterData,
                            rebuildGuid: item.rebuildGuid
                        });
                    }
                }
                // 关闭Loading
                this.loading = false;
                // 分页显示
                this.handleCurrentChange(1);
                // 查询完毕Message
                this.$message.success("共查询到" + this.itemDataFilter.length + "个合同");
                // 如果是主动点击查询时保存查询历史
                if(!isNullOrWhiteSpace(isAction)) {
                    // 保存查询历史
                    this.SaveSearchHis();
                }
            },
            DoSearchSO() {
                // 必输检查
                if (!this.searchDateRange || this.searchDateRange.length < 2 || this.searchDateRange[0] == null) {
                    this.$message.error("请输入有效日期范围！");
                    return;
                }
                // 判断日期是否有变化
                var sDate = this.formatDate(this.searchDateRange[0]);    // 开始日期
                var eDate = this.formatDate(this.searchDateRange[1]);    // 结束日期

                if(this.sDateBackup != sDate || this.eDateBackup != eDate) {
                    this.SearchSO("1");
                } else {
                    this.FilterItemData("1");
                }
            },
            // 取得用户权限
            GetMenuAction(cb) {
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }

                var superiorCompany = arraySearch(this.company, this.options, "companyCode")[0].superiorCompany;

                MenuAction({
                    userGuid: user.userGuid,
                    company: this.company,
                    action: "so-search"
                }).then(data => {
                    if (data && data.code === "200") {
                        this.canChange = data.content.CanChange;
                        this.canDelete = data.content.CanDelete;
                        // 回调
                        cb();
                    } else {
                        this.itemData = [];
                        this.itemDataFilter = [];
                        this.itemDataDsp = [];
                        this.$message.error("权限获取失败！");
                        this.loading = false;
                    }
                });
            },
            // 保存当前查询条件
            SaveSearchHis(flag) {
                var company = this.company;
                var searchDateRange = this.searchDateRange;
                var sDate = this.formatDate(searchDateRange[0]);    // 开始日期
                var eDate = this.formatDate(searchDateRange[1]);    // 开始日期
                var keyWord = this.keyWord.trim();
                var workAry = new Array();
                var jsonTemp = localStorage.getItem("SearchSO-" + this.user.account);
                var arySearchHis = JSON.parse(jsonTemp);
                var limitCount = 8;
                var count = 0;
                var row;
                var isExist = false;

                arySearchHis = arySearchHis == null? []: arySearchHis;

                // 先添加被锁定的记录
                for(var i = 0; i < arySearchHis.length; i ++) {
                    row = arySearchHis[i];

                    if(company == row.company &&
                        sDate == row.sDate &&
                        eDate == row.eDate &&
                        keyWord == row.keyWord) {
                        isExist = true;
                    }
                    // 超过最高限制的话跳出
                    if(limitCount <= count) {
                        continue;
                    }
                    if(!row.lock) {
                        continue;
                    }
                    workAry.push({
                        company: row.company,
                        sDate: row.sDate,
                        eDate: row.eDate,
                        keyWord: row.keyWord,
                        lock: row.lock
                    });
                    count = count + 1;
                }
                // 如果记录数低于10的话则追加当前记录
                if(isNullOrWhiteSpace(flag) && count < limitCount && !isExist) {
                    workAry.push({
                        company: company,
                        sDate: sDate,
                        eDate: eDate,
                        keyWord: keyWord,
                        lock: false
                    });
                    count = count + 1;
                }
                // 如果记录数仍低于10的话则继续追加历史记录
                if(count < limitCount) {
                    for(var i = 0; i < arySearchHis.length; i ++) {
                        // 超过最高限制的话跳出
                        if(limitCount <= count) {
                            break;
                        }
                        row = arySearchHis[i];
                        if (row.lock) {
                            continue;
                        }
                        workAry.push({
                            company: row.company,
                            sDate: row.sDate,
                            eDate: row.eDate,
                            keyWord: row.keyWord,
                            lock: row.lock
                        });
                        count = count + 1;
                    }
                }
                localStorage.setItem("SearchSO-" + this.user.account, JSON.stringify(workAry));
            },
            // 读取当前查询条件
            LoadSearchHis() {
                this.searchHisData = JSON.parse(localStorage.getItem("SearchSO-" + this.user.account));
            },
            ShowSearchHis() {
                this.LoadSearchHis();
                this.dialogSearchHisVisible = true;
            },
            LoadSearchSO(row) {
                var diffCompany = true;
                this.searchDateRange = [];
                this.searchDateRange.push(toGMT(row.sDate));
                this.searchDateRange.push(toGMT(row.eDate));
                this.keyWord = row.keyWord;

                if(this.company == row.company) {
                    diffCompany = false;
                }
                this.company = row.company;
                this.dialogSearchHisVisible = false;
                this.loadFlag = true;

                if(!diffCompany) {
                    this.SearchSO();
                }
            },
            LockSearchHis(row) {
                row.lock = !row.lock;
                localStorage.setItem("SearchSO-" + this.user.account, JSON.stringify(this.searchHisData));
                this.SaveSearchHis("1");
                this.LoadSearchHis();
            },
            tableRowClassName(row, index) {
                if(row.lock) {
                    return "lock-row";
                }
                return '';
            },
            getRowFromArray(value, array, code) {
                return getRowFromArray(value, array, code);
            },
            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            }
        }
    }
</script>
<style>
    @import '../../assets/css/common.css';
    tr:hover{
        background-color:aliceblue;
    }
    .item-text {
        padding-left: 6px;
    }
    .el-table .lock-row {
        background-color: #fffdb5;
    }
</style>
