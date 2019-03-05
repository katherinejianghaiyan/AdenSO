<template>
    <section v-loading="loading" element-loading-text="数据加载中...">
        <div style="background-color: #F3F3F4">
            <el-row>
                <el-col :span="10" class="toolbar">
                    <el-select v-model="companySite" size="small" filterable @change="getSiteSurveyResult(companySite)">
                        <el-option v-for="item of companyOptions"
                                   :key="item.value"
                                   :value="item.value" :label="item.label">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="14" class="toolbar">
                    <el-tag>选择日期</el-tag>
                    <el-date-picker type="daterange" size="small" v-model="surveyDate" range-seperator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期"
                                    @change="getSiteSurveyResult(companySite)">
                    </el-date-picker>
                </el-col>
            </el-row>
            <div>
                <el-table :data="tblSuveySummary" style="font-size: 12px" max-height="280" :show-summary="true" sum-text="有效反馈量">
                    <el-table-column label="选项" sortable prop="userAnswer">
                        <template slot-scope="scope">
                            <span>{{scope.row.userAnswer}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="小计" width="100" sortable prop="amount">
                        <template slot-scope="scope">
                            <span>{{scope.row.amount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="百分比" width="100" prop="percent">
                        <template slot-scope="scope">
                            <span>{{scope.row.percent}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div style="margin-top: 1%"  v-if="tblSuveySummary.length>0">
                <SurveyChart :LangOption="legendOption"
                             :SeriesData="seriesData">
                </SurveyChart>
            </div>
            <div style="margin-bottom: 1%">
                <p style="color: black">
                    <span><b>餐厅满意度评估表</b></span>
                </p>
                <p></p>
                <div v-if="resultData.length>0">
                    <p>
                    <el-tag>过滤数据</el-tag>
                    <el-input size="small" style="width:20%" v-model="keyWord" @change.native="filterSurveyDetails"></el-input>

                     <el-button size="small" @click="exportDetails">导出原始数据</el-button>

                     <el-pagination
                            style="float:right"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page.sync="currentPage"
                            :page-sizes="[5, 10, 20,50]"
                            :page-size="pageSize"
                            layout="sizes, prev, pager, next"
                            :total="resultData.length">
                    </el-pagination>
                    </p>
                </div>
                <el-table :data="tblSurveyDetails" style="font-size:12px" max-height="380">
                    <el-table-column label="用户明细" align="center" width="80">
                        <template slot-scope="scope">
                            <el-popover trigger="hover" placement="top">
                                <el-form :inline="true">
                                    <el-form-item v-for="item in scope.row.surveyDetails" v-if="item.displayZone==='userDialog'" :label="item.surveyItem">
                                        <el-tag class="text" v-html="item.userAnswer.replace(new RegExp(',','g'), '<br>')"></el-tag>
                                    </el-form-item>
                                </el-form>
                                <div slot="reference" class="name-wrapper">
                                    <i class="el-icon-view" v-if="CountDisplayZone(scope.row.surveyDetails,'userDialog')>0"></i>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="用户编号" width="90" align="center" prop="createUserID" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.createUserID}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="问卷提交时间" width="130" prop="createTime" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.createTime}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-for="item in surveyItems" :key="item.lineGuid" :label="item.surveyItem" :value="item.lineGuid" :show-overflow-tooltip="true"
                                     v-if="item.displayZone==='stdTable'" align="center">
                        <template slot-scope="scope">
                            <span v-for="arry in scope.row.surveyDetails"
                                  v-if="arry.createUserID===scope.row.createUserID
                                  & arry.headGuid===scope.row.headGuid && arry.lineGuid===item.lineGuid && arry.displayZone==='stdTable'">
                                {{arry.userAnswer}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label='更多' width="80" v-if="ShowCol(tblSurveyDetails,'othersDialog')>0" align="center">
                        <template slot-scope="scope">
                            <el-popover trigger="hover" placement="left">
                                <el-form v-if="typeof (scope.row.surveyDetails)!=='undefined'">
                                    <el-form-item v-for="item in scope.row.surveyDetails" v-if="item.displayZone==='othersDialog'">
                                        <span>{{item.surveyItem}}</span><br>
                                        <div><font color="blue"><span class="text" v-html="item.userAnswer.replace(new RegExp(',','g'), '，')"></span></font></div>
                                    </el-form-item>
                                </el-form>
                                <div slot="reference" class="name-wrapper">
                                    <i class="el-icon-more" v-if="CountDisplayZone(scope.row.surveyDetails,'othersDialog')>0"></i>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="照片" width="80" fixed="right" align="center" v-if="ShowCol(tblSurveyDetails,'complaintDialog')>0">
                        <template slot-scope="scope">
                            <el-popover trigger="hover" placement="left">
                                <table  v-if="typeof(scope.row.surveyDetails)!=='undefined'">
                                <tr :inline="true"
                                    :width="CountItemStyle(scope.row.surveyDetails,'image')===0? 200:200 * CountItemStyle(scope.row.surveyDetails,'image')">
                                    <td width="200" v-for="item in scope.row.surveyDetails"
                                                    v-if="item.displayZone==='complaintDialog' && item.itemStyle==='image'">
                                        <img height="200" width="200"
                                             :src=" picRoot + item.userAnswer.substr(item.userAnswer.lastIndexOf('\\')+1)" style="width:90%">
                                    </td>
                                </tr>
                                </table>
                                <div slot="reference" class="name-wrapper">
                                    <el-button type="danger" icon="el-icon-view" size="mini"
                                               v-if="CountDisplayZone(scope.row.surveyDetails,'complaintDialog')>0"
                                               @click="getRow(scope.row,'complaint')">
                                    </el-button>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="微信回复" fixed="right" width="60" v-if="ShowCol(tblSurveyDetails,'wechatMsg')">
                        <template slot-scope="scope">
                            <el-button
                                    v-if="CountDisplayZone(scope.row.surveyDetails,'loginTime')>0"
                                    type="success" icon="el-icon-edit" size="mini" @click="getRow(scope.row,'wechatMsg')">
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-if="BrTimeList.length>0 && FBTimeList.length>0">
                <SurveyCollectionChart
                             :BrTimeList="BrTimeList"
                             :FBTimeList="FBTimeList"
                             :brAmount="brAmount"
                             :fbAmount="fbAmount">
                </SurveyCollectionChart>
            </div>
        </div>

        <el-dialog :title="mark" :visible.sync="ShowDialog" width="35%">
            <div v-if="mark.indexOf('投诉建议')>-1">
                <el-row :inline="true">
                    <el-col v-if="picAddress.length>0" v-for="row in picAddress" :key="row.address" :value="row.address" :span="24">
                        <div>
                            <p><b>名称：</b><el-tag>{{row.address.substr(row.address.lastIndexOf('/')+1)}}</el-tag></p>
                            <img :src="row.address" style="width:100%">
                        </div>
                    </el-col>
                </el-row>
            </div>
            <div v-if="mark.indexOf('微信回复')>-1">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="wechatMsg">
                </el-input>
                <p>
                    <el-button style="width:100%" size="small" type="success" v-if="wechatMsg.length>0" @click="SendMsg">发送</el-button>
                </p>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import NumberInput from '../../components/NumberInput.vue'
    import {isNullOrWhiteSpace,chGMT,getRowFromArray} from '../../assets/js/common';
    import { GetCompanySite,SiteSurvey,ShowExcel,WechatMsg } from '../../api/api'
    /***Common View Import***/
    import SurveyAnalysisChart from '../../components/SurveyAnalysisChart.vue';
    import SurveyCollectionChart from '../../components/SurveyCollectionChart.vue';

    import axios from 'axios';

    export default {
        data(){
            return{
                loading:false,
                //公司或营运点选项框
                companySite:'',
                //公司或营运点选项列表
                companyOptions:[],
                //问卷调研汇总-表格
                tblSuveySummary:[],
                //问卷调研汇总-取数
                summaryData:[],
                //图标
                charts: '',
                legendOption:[],
                seriesData:[],
                //问卷调研中的具体问题
                surveyItems:[],
                //选择日期
                surveyDate:[],
                //分页当前页
                currentPage: 1,
                //分页当前页行数
                pageSize:5,
                //问卷调研明细-表格
                tblSurveyDetails:[],
                //问卷调研明细备份
                tblSurveyDetails_bak:[],
                //筛选分页后调研明细-表格
                resultData:[],
                //过滤数据
                keyWord:'',
                ShowDialog: false,
                //问卷浏览量
                BrTimeList:[],
                //问卷回收量
                FBTimeList:[],
                //对话框传入参数
                mark:'',
                //投诉建议对话框中图片
                picComment:'',
                //投诉建议对话框中图片列表
                picList:[],
                //投诉建议对话框中图片的地址
                picAddress:[],
                //投诉建议对话框中图片的数量
                picAmout:0,
                //微信回复对话栏
                wechatMsg:'',
                //用户微信账号
                weChatIds:[],
                //微信发送日期
                weChatOrderDate:"",
                picRoot:''
            }
        },
        created(){
            //获取公司列表
            this.setCompany();
            this.load();
        },
        components:{
            'SurveyChart': SurveyAnalysisChart,
            'SurveyCollectionChart':SurveyCollectionChart,
            'number-input':NumberInput
        },
        computed:{
          brAmount:function () {
            var count=0;
            if(this.BrTimeList.length>0){
                for(let line of this.BrTimeList){
                    count+=line.amount;
                }
            }
            return count
          },
          fbAmount:function () {
              var count=0;
              if(this.FBTimeList.length>0){
                  for(let line of this.FBTimeList){
                      count+=line.amount;
                  }
              }
              return count
          },
        },

        methods: {
            //获取登录人信息
            getUser() {
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
            },
            //获取公司列表
            setCompany() {
                this.picRoot = '';
                this.getUser();
                this.loading = true;
                GetCompanySite({
                    action: 'site-pricelist',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.companyOptions = [];
                        for (let line of data.content) {
                            if (isNullOrWhiteSpace(line.dbName)) {
                                for (let row of line.siteList) {
                                    this.companyOptions.push({
                                        value: row.siteGuid,
                                        label: row.companyCode + ' - ' + row.costCenterCode,
                                        note: "siteguid"
                                    });
                                }
                            } else if (!isNullOrWhiteSpace(line.dbName)) {
                                this.companyOptions.push({
                                    value: line.companyGuid,
                                    label: line.dbName + ' / ' + line.companyName_ZH,
                                    note: "buguid"
                                });
                                for (let row of line.siteList) {
                                    this.companyOptions.push({
                                        value: row.siteGuid,
                                        label: row.companyCode + ' - ' + row.costCenterCode,
                                        note: "siteguid"
                                    })
                                }
                            }
                        }
                        if (this.companyOptions.length > 0) {
                            this.companySite = this.companyOptions[0].value;
                        }
                        this.getSiteSurveyResult(this.companySite);
                        this.GetPicRoot();
                    }
                    else {
                        this.loading = false;
                        this.picRoot = '';
                    }
                }).catch(() => {
                    this.loading = false;
                    console.log('Fail getSite');
                });
            },
            //获取图片根目录
            GetPicRoot(){
                this.picRoot = '';
                if(typeof(getRowFromArray(this.companySite,this.companyOptions,"value")) !== "undefined")
                    var note = getRowFromArray(this.companySite,this.companyOptions,"value").label;
                if(typeof(note) !== "undefined" && !isNullOrWhiteSpace(note) && note.indexOf('-')>0)
                    this.picRoot = 'http://mall.adenchina.net/SiteSurveyPic/'+note.substr(note.indexOf('-')+2)+'/';
            },
            //读取问卷调研汇总及明细
            getSiteSurveyResult(siteGuid) {
                this.tblSuveySummary=[];
                this.legendOption=[];
                this.seriesData=[];
                this.summaryData=[];
                this.tblSurveyDetails=[];
                this.surveyItems=[];
                this.BrTimeList=[];
                this.FBTimeList=[];
                this.resultData=[];

                this.GetPicRoot();

                SiteSurvey({
                    "":JSON.stringify({
                        siteGuid: siteGuid,
                        pageName:"/Survey/SiteSurvey.aspx",
                        startDate:isNullOrWhiteSpace(this.surveyDate)?'2000-01-01': this.formatDate(this.surveyDate[0]),
                        endDate:isNullOrWhiteSpace(this.surveyDate)? '2099-12-31':this.formatDate(this.surveyDate[1]),
                    })
                }).then(data => {
                    if (data && data.code === "200") {
                        for(let line of data.content){
                            //问卷调研汇总数据
                            this.summaryData=line.surveySummary;
                            //问卷调研提问项
                            this.surveyItems=line.surveyItems;
                            //问卷调研明细
                            this.resultData=line.surveyDetails;
                            //问卷浏览量
                            this.BrTimeList=line.BrTimeList;
                            //问卷回收量
                            this.FBTimeList=line.FBTimeList;

                            if(this.resultData.length===0)
                                return;
                            for(let row of this.resultData){
                                row.createTime=row.createTime.
                                    substr(0,row.createTime.indexOf('.')===-1?row.createTime.length:row.createTime.indexOf('.')).replace(new RegExp("T","g"),' ');
                                for(let item of row.surveyDetails){
                                    item.createTime=item.createTime.
                                        substr(0,item.createTime.indexOf('.')===-1?item.createTime.length:item.createTime.indexOf('.')).replace(new RegExp("T","g"),' ');
                                }
                            }
                            this.tblSurveyDetails_bak=this.resultData;
                            //分页
                            this. handleCurrentChange(1);
                        }
                        var total=0;
                        if(this.summaryData.length===0)
                            return;
                        for(let row of this.summaryData){
                                total+=row.amount
                        }
                        for(let line of this.summaryData){
                                this.tblSuveySummary.push({
                                    userAnswer: line.userAnswer,
                                    amount: line.amount,
                                    percent: total===0?0: Math.round(line.amount / total*100)
                                });
                                this.legendOption.push(line.userAnswer);
                                this.seriesData.push({
                                    value: line.amount,
                                    name: line.userAnswer
                                });
                        }
                        this.loading = false
                    } else {
                        this.summaryData=[];
                        this.tblSuveySummary=[];
                        this.tblSurveyDetails=[];
                        this.surveyItems=[];
                        this.BrTimeList=[];
                        this.FBTimeList=[];
                        this.resultData=[];
                        this.loading = false
                    }

                }).catch(() => {
                    console.log('Fail2');
                    this.loading = false
                });
            },

            //加载数据
            load() {
                const startDate=new Date();
                const endDate=new Date();
                startDate.setTime(startDate.getTime()-3600*1000*24*30);
                this.surveyDate=[startDate,endDate];
            },
            //弹出对话框，显示投诉建议图片
            getRow(row,mark) {
                if (mark === 'complaint') {
                    this.mark = "投诉建议";
                //初始化照片列表
                this.picList = [];
                //初始化照片地址
                this.picAddress = [];
                //初始化照片数据库地址
                this.picComment = '';

                this.picAmout = this.CountItemStyle(row.surveyDetails, 'image');

                if (typeof (row.surveyDetails) === "undefined")
                    return false;
                row = row.surveyDetails;

                if (mark === 'complaint')
                    this.mark = "投诉建议";

                var complaintForm = [];
                for (let line of row) {
                    if (line.displayZone === "complaintDialog") {
                        complaintForm.push({
                            headGuid: line.headGuid,
                            lineGuid: line.lineGuid,
                            userAnswer: line.userAnswer,
                            itemStyle: line.itemStyle
                        })
                    }
                }

                for (let row of complaintForm) {
                    //附以照片
                    if (row.itemStyle === "image") {
                        this.picComment = row.userAnswer;
                        //填充图片列表
                        this.picList.push({
                            picComment: row.userAnswer
                        });
                    }
                }

                if (this.picList.length > 0) {
                    this.picAddress = [];
                     for (let row of this.picList) {
                        this.picAddress.push({
                            address: this.picRoot + row.picComment.substr(row.picComment.lastIndexOf("\\") + 1)
                        });
                     }
                   }
                 }
                 //跳出微信回复窗口
                 else if(mark ==='wechatMsg'){
                    this.wechatMsg='';
                    this.weChatIds = [];
                    this.weChatOrderDate = "";
                    this.mark = "微信回复";
                    this.weChatIds.push(row.wechatID);
                    this.weChatOrderDate = this.formatDate(new Date(),"yyyy-MM-dd") ;
                }
                this.ShowDialog = true;
            },
            SendMsg(){
                if(this.weChatIds===[]){
                    this.message.error("微信账号不全，无法发送");
                    return;
                }
                let config = {
                    headers: {
                        "Content-Type": "application/text"
                    }
                };
                axios.post("http://mall.adenchina.net/jc/api/WxMessage.ashx",
                    JSON.stringify({
                        WechatIDs: this.weChatIds,
                        msg: this.wechatMsg,
                        date: (new Date()).getFullYear()+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getDate()  //"2018-12-18"
                    }),config
                ).then(res => {
                    if(res.data === 'ok'){
                        this.$message.success("发送成功")
                    } else{
                        this.$message.error("发送失败")
                    }
                }).catch(error=>{
                    console.log(error);
                });
            },
            //关键词筛选调研明细-表格
            filterSurveyDetails(){
                if(this.tblSurveyDetails_bak.length===0)
                    return null;
                this.resultData=[];
                for(let line of this.tblSurveyDetails_bak){
                     if(line.createUserID.indexOf(this.keyWord)===-1
                         && (isNullOrWhiteSpace(line.createUserName) || line.createUserName.indexOf(this.keyWord)===-1)
                         && (isNullOrWhiteSpace(line.department) || line.department.indexOf(this.keyWord)===-1))
                         continue;
                    this.resultData.push(line);
                }
                //分页
                this. handleCurrentChange(1);
            },
            //问卷明细表分页-当前页行数
            handleSizeChange(val) {
                //console.log(`每页 ${val} 条`);
                this.pageSize = val;
                this. handleCurrentChange(1);
            },
            //问卷明细表分页-当前页页码
            handleCurrentChange(val) {
                //console.log(`当前页: ${val}`);
                this.tblSurveyDetails=this.resultData.filter((u,index)=>index<this.pageSize * val && index>=this.pageSize * (val-1));
            },
            //导出原始数据
            exportDetails(){
                if(this.summaryData.length===0)
                    return;
                if(isNullOrWhiteSpace(this.summaryData[0].siteGuid))
                    return;
                ShowExcel({
                    siteGuid: this.summaryData[0].siteGuid,
                    pageName:"/Survey/SiteSurvey.aspx",
                    startDate:isNullOrWhiteSpace(this.surveyDate)?'2000-01-01': this.formatDate(this.surveyDate[0]),
                    endDate:isNullOrWhiteSpace(this.surveyDate)? '2099-12-31':this.formatDate(this.surveyDate[1]),
                    reportType: 'SiteSurveyReport'
                });
            },
            //空字符串判断
            isNullOrWhiteSpace(string){
                return isNullOrWhiteSpace(string);
            },
            // 日期格式化
            formatDate(date, formatString) {
                if (isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";
                return chGMT(date, formatString);
            },

            //计算判断是否表格能显示当前列
            ShowCol(obj,data) {
                var count = 0;
                if(data === 'complaintDialog'|| data === 'othersDialog') {
                    if (typeof(obj) == "undefined")
                        return count;
                    for (let row of obj) {
                        for (let item of row.surveyDetails) {
                            if (item.displayZone === data) {
                                count++;
                            }
                        }
                    }
                }
                else if(data === 'wechatMsg'){
                    if (typeof(obj) == "undefined")
                        return count;
                    for(let row of obj){
                        //console.log(row.surveyDetails);
                        for (let item of row.surveyDetails) {
                            if (new Date(new Date().setTime((new Date(item.loginTime)).getTime() + 48 * 3600 * 1000)) - (new Date()).getTime() > 0)
                                count++;
                        }
                    }
                }
                return count;
            },
            //计算对象属性数量
            CountDisplayZone(obj,param) {
                var count = 0;
                if (typeof(obj) == "undefined" || isNullOrWhiteSpace(param))
                     count = 0;

                if (param !== 'loginTime') {
                count = 0;
                for (let item of obj) {
                    if (item.displayZone === param) {
                        count++;
                        }
                    }
                }
                else if(param === 'loginTime'){
                    count = 0;
                    for (let item of obj) {
                        if (new Date(new Date().setTime((new Date(item.loginTime)).getTime() + 48 * 3600 * 1000)) - (new Date()).getTime()>= 0) {
                            count++;
                        }
                    }
                }
                return count;
            },
            //计算每次问卷上传的照片数量
            CountItemStyle(obj,style){
                var count=0;
                if(typeof(obj)=="undefined")
                    return count;
                    for(let item of obj){
                        if(item.itemStyle===style){
                            count++;
                        }
                    }
                return count;
            }
        },

    }
</script>

<style>
    @import '../../assets/css/common.css';
</style>