<template>
    <section  v-loading="loading"
              element-loading-text="查询中,请稍后...">
        <el-row style="margin-bottom:0px">
            <el-col>
                <p align="center" style="padding-bottom: 1%;padding-top:1%;">
                    <el-button type="primary" style="width:8%;height:30px" @click="save">保存</el-button>
                </p>
                <el-table
                        :data="table"
                        border
                        :height="this.fullHeight<300?400:this.fullHeight">
                    <el-table-column label="公司代码" fixed="left" header-align="center">
                        <template slot-scope="scope">
                            <span>{{scope.row.companyCode}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="名称" width="220" :resizable="false" header-align="center" fixed="left">
                        <template slot-scope="scope">
                            <span style="float:left; width:40%;text-align: center">{{scope.row.companyName_EN}}</span>
                            <span style="float:right;width:60%;text-align: center">{{scope.row.companyName_ZH}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="独立公司组" width="80" :resizable="false" header-align="center">
                        <template slot-scope="scope">
                            <el-input size="small" v-model="scope.row.companyGroup"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="Inter-Company" header-align="center">
                        <!--<el-table-column label="应付" width="100" :resizable="false" header-align="center">
                            <template scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyAP"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="应收" width="100" :resizable="false" header-align="center">
                            <template scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyAR"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="成本" width="100" :resizable="false" header-align="center">
                            <template scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyCost"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="收入" width="100" :resizable="false" header-align="center">
                            <template scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyRevenue"></el-input>
                            </template>
                        </el-table-column>-->
                        <el-table-column label="其他应付" width="120" :resizable="false" header-align="center">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyOP"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="其他应收" width="120" :resizable="false" header-align="center">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.interCompanyOR"></el-input>
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="Inter-Branch" header-align="center">
                        <el-table-column label="其他应付" width="100" :resizable="false" header-align="center">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.interBranchOP"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="其他应收" width="100" :resizable="false" header-align="center">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.interBranchOR"></el-input>
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="供应商" header-align="center">
                        <template slot-scope="scope">
                            <el-input size="small" v-model="scope.row.supplierCode"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="客户" header-align="center">
                        <template slot-scope="scope">
                            <el-input size="small" v-model="scope.row.customerCode"></el-input>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import {dtCompany,updateCompany} from '../../api/api'
    export default{
        created(){
            this.load();
        },
        data(){
            return{
                table:[],
                loading:true,
                fullHeight: document.documentElement.clientHeight -210
                //fullHeight: window.innerHeight-260,
            }
        },
        methods:{
            save(){
                let updateLines=[];
                for(let line of this.table){
                    if(line.preinterBranchOP!==line.interBranchOP||line.preinterBranchOR!==line.interBranchOR||line.preinterCompanyOP!==line.interCompanyOP
                        ||line.preinterCompanyOR!==line.interCompanyOR||line.precompanyGroup!==line.companyGroup
                        ||line.presupplierCode!==line.supplierCode||line.precustomerCode!==line.customerCode){
                        updateLines.push({
                            companyCode:line.companyCode,
                            companyName_EN:line.companyName_EN,
                            companyName_ZH:line.companyName_ZH,
                            interBranchOP:line.interBranchOP,
                            interBranchOR:line.interBranchOR,
                            interCompanyOP:line.interCompanyOP,
                            interCompanyOR:line.interCompanyOR,
                            companyGroup:line.companyGroup,

                            supplierCode:line.supplierCode,
                            customerCode:line.customerCode,
                        });
                    }
                }
                if(updateLines.length>0){
                    updateCompany({
                        lines:updateLines
                    }).then(data=>{
                        if(data && data.code==='200'){
                            this.$message.success("数据保存成功");
                        }
                    }).catch(()=>{});
                }
                else if(updateLines.length===0){
                    this.$message.error("没有数据需要保存");
                }
            },
            load(){
                dtCompany().then(data=>{
                    if(data && data.code==='200'){
                        this.table=[];
                        for(let line of data.content){
                            this.table.push({
                                companyCode:line.companyCode,
                                companyName_EN:line.companyName_EN,
                                companyName_ZH:line.companyName_ZH,
                                interBranchOP:line.interBranchOP,
                                interBranchOR:line.interBranchOR,
                                interCompanyOP:line.interCompanyOP,
                                interCompanyOR:line.interCompanyOR,
                                companyGroup:line.companyGroup,

                                supplierCode:line.supplierCode,
                                customerCode:line.customerCode,

                                preinterBranchOP:line.interBranchOP,
                                preinterBranchOR:line.interBranchOR,
                                preinterCompanyOP:line.interCompanyOP,
                                preinterCompanyOR:line.interCompanyOR,
                                precompanyGroup:line.companyGroup,

                                presupplierCode:line.supplierCode,
                                precustomerCode:line.customerCode,
                            });
                        }
                    }
                    this.loading=false;
                }).catch(()=>{
                    this.$message.error("没有数据");
                    this.loading=false;
                });
            }
        }
    }
</script>