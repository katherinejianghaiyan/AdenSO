<template>
    <div v-loading="loading"
         loading-element-text="数据加载，请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <el-select style="width:150px;" size="small" v-model="company" placeholder="请选择公司" v-if="companyOptions.length>0">
                    <el-option v-for="item in companyOptions"
                               :key="item.companyCode"
                               :value="item.companyCode"
                               :label="item.companyCode +' / '+item.companyName_ZH">
                    </el-option>
                </el-select>

                <el-select
                        v-if="companyOptions.length==0"
                        v-model="selectCCWhs"
                        filterable
                        separator="/"
                        size="small">
                    <el-option v-for="item in ccWhsOption"
                               :key="item.costCenterCode"
                               :value="item.costCenterCode"
                               :label="item.costCenterCode">
                    </el-option>
                </el-select>

                <el-date-picker
                        size="small"
                        v-model="reportDate"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :picker-options="pickOptions">
                </el-date-picker>

                <el-button size="small" type="primary" @click.native="exportxls" :disabled="company.length==0 && selectCCWhs.length==0 ">
                    导出报告
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>

    import { GetCCWhs, GetCompanyInAuth,ShowExcel } from '../../api/api'
    export default {
        data(){
            return{
                loading:false,
                user:'',
                company:'',
                companyOptions:[],
                selectCCWhs:'',
                ccWhsOption: [],
                reportDate:'',
                pickOptions:{
                    shortcuts:[{
                        text:'最近一周',
                        onClick(picker){
                            const end=new Date();
                            const start=new Date();
                            start.setTime(start.getTime()-3600*1000*24*7);
                            picker.$emit('pick',[start,end]);
                        }
                    },{
                        text:'最近一个月',
                        onClick(picker){
                            const end=new Date();
                            const start=new Date();
                            start.setTime(start.getTime()-3600*1000*24*30);
                            picker.$emit('pick',[start,end]);
                        }
                    },{
                        text:'最近三个月',
                        onClick(picker){
                            const end=new Date();
                            const start=new Date();
                            start.setTime(start.getTime()-3600*1000*24*90);
                            picker.$emit('pick',[start,end]);
                        }
                    }]
                }
            }
        },
        created(){
            //获取公司列表
            this.setCompany();
            this.GetCCWhs();
            const start=new Date();
            start.setTime(start.getTime());
            const end=new Date();
            this.reportDate=[start,end];
        },
        methods:{
            getUser(){
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
            },
            //获取公司列表
            setCompany(){
                this.getUser();
                GetCompanyInAuth({
                    action: 'wechat-rechargexls',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.companyOptions = data.content;
                        this.company=this.companyOptions[0].companyCode;
                    }
                    else this.companyOptions = [];
                });
            },

            // 取得CostCenter下拉框选项
            GetCCWhs() {
                this.loading = true;
                this.getUser();
                GetCCWhs({
                    action: "wechat-rechargexls",
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        this.selectCCWhs=this.ccWhsOption[0].costCenterCode;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            },

            //导出Excel报告
            exportxls(){
                //开始日期
                const sDate = new Date();
                //结束日期
                const eDate = new Date();
                if(this.reportDate.length>0){
                    sDate.setFullYear(this.reportDate[0].getFullYear());
                    sDate.setMonth(this.reportDate[0].getMonth());
                    sDate.setDate(this.reportDate[0].getDate());

                    eDate.setFullYear(this.reportDate[1].getFullYear());
                    eDate.setMonth(this.reportDate[1].getMonth());
                    eDate.setDate(this.reportDate[1].getDate());
                }

                ShowExcel({
                    companyCode: this.company,
                    costCenterCode:this.selectCCWhs,
                    startDate:this.reportDate.length>0? sDate:'',
                    endDate:this.reportDate.length>0? eDate: '',
                    reportType: 'wxRechargeReport'
                });
            }
        }
    }

</script>