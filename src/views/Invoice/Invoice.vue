<template>
    <section v-loading="loading"
             element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar" style="padding-bottom:0px">
                <el-form :inline="true">
                    <div style="height:40px">
                        <el-form-item style="width:12%">
                            <el-select v-model="company"
                                       size="small"
                                       placeholder="选择公司"
                                       @change="setCompany">
                                <el-option v-for="item in Options"
                                           :key="item.value"
                                           :value="item.value"
                                           :label="item.value +' / '+ item.label">
                                    <span style="float: left">{{ item.value }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.label }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-date-picker
                                    size="small"
                                    v-model="searchDateRange"
                                    align="right"
                                    type="daterange"
                                    placeholder="期间起止日期"
                                    :editable="false"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    :picker-options="pickerOptions0">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size="small" icon="el-icon-date"
                                       :disabled="r_createPeriod"
                                       @click="newPeriod">生成开票期间</el-button>
                        </el-form-item>
                        <el-form-item style="float:right">
                            <el-button type="primary" size="small"
                                       :disabled="r_refreshData"
                                       @click="refresh"><i class="fa fa-refresh" aria-hidden="true"></i>  刷新</el-button>
                        </el-form-item>
                    </div>
                    <div>
                    <el-form-item style="width:8%">
                        <el-select v-model="status" size="small" @change="setStatus" pa>
                            <el-option v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-input size="small" placeholder="关键词查询" v-model="keyWord"
                                  @focus="$event.target.select()">
                            <i slot="suffix" class="el-input__icon fa fa-key"></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="small" icon="el-icon-search" @click="DoSearchPeriod">查询</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="small" icon="el-icon-document"
                                   :disabled="r_selectPeriod"
                                   @click="ReadyToImportErp('Invoice')">开票</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="small" icon="el-icon-document"
                                   :disabled="r_selectPeriod || r_onlyEstimated"
                                   @click="ReadyToImportErp('EstimationEntry')">暂估</el-button>
                    </el-form-item>
                    </div>
                </el-form>
            </el-col>
            <el-col v-show="show">
                <div class="block" :inline="true">
                    <span class="demonstration">
                        <el-select v-model="pageSize"
                                   size="small"
                                   style="width:15%;vertical-align:center;float:left"
                                   @change="changeSize">
                            <el-option v-for="item in pageOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
                        </el-select>
                    </span>
                    <pre style="float:left">  </pre>
                    <el-pagination
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page.sync="currentPage2"
                            layout="prev, pager, next"
                            :total= "this.periodDataFilter.length"
                            background
                            :page-size="this.pageSize"
                            :page-sizes="[10,50,100]">
                    </el-pagination>
                </div>
                <el-table
                        :data="periodData"
                        ref="multipleTable"
                        border
                        :height="this.fullHeight<300?400:this.fullHeight"
                        :default-sort="{prop:'customCode',order: 'descending'}"
                        size="mini"
                        @row-dblclick="dsplayInvoice"
                        :cell-class-name="cellClassNamePeriod"
                        @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="40" align="center" fixed="left">
                        <template slot-scope="scope">
                            <el-checkbox v-model="scope.row.checkBox" :disabled="scope.row.tobeInvoiced != '1'">
                            </el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label="客户" width="270" :resizable="false" header-align="center" prop="customCode" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="24" class="item-text">
                                    <span>{{isNullOrWhiteSpace(scope.row.cmpCode) ? scope.row.customCode: scope.row.cmpCode}} / {{scope.row.customName}}</span>
                                    <span v-if="!isNullOrWhiteSpace(scope.row.groupGuid)"
                                          style="color:red;font-weight:bolder">【拆】</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="主合同号" header-align="center" width="200" :resizable="false" prop="contract" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="24" class="item-text">
                                    <span>{{scope.row.contract}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="成本中心" align="center" width="150" :resizable="false" prop="costCenter" sortable>
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :span="12"
                                        v-for="costCenterCode in scope.row.costCenterData"
                                        :key="costCenterCode">
                                    <span>{{costCenterCode}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="开始日期" align="center" width="100" :resizable="false" prop="startDate" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.startDate}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="结束日期" align="center" width="100" :resizable="false" prop="endDate" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.endDate}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作"
                                     align="center"
                                     width="70"
                                     fixed="right">
                        <template slot-scope="scope">
                            <el-button :type="scope.row.changeType == '1'? 'primary':'success'" size="small"
                                       @click="modify(scope.row,false)">{{scope.row.changeType == "1" ? "编辑":"查看"}}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="实际金额" align="center" width="90" :resizable="false" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.totalAmount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" align="center" width="65" :resizable="false" prop="status" sortable>
                        <template slot-scope="scope">
                            <el-button size="small" type="text"
                                       @click="GetTransLog(scope.row.periodGuid)"
                                       v-if="scope.row.withLog == '1'" class="error-log-icon">
                                <i class="el-icon-circle-close"></i> {{setStatusDesc(scope.row)}}</el-button>
                            <span v-if="typeof(scope.row.withLog) == 'undefined' ||
                                        scope.row.withLog != '1'">
                                {{setStatusDesc(scope.row)}}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <el-dialog :visible.sync="dialogTableVisible"
                           width="96%"
                           top="50px"
                           @close="DialogClose">
                    <el-row style="margin-bottom:-100px">
                        <!--工具条-->
                        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                            <el-form :inline="true">
                                <el-form-item v-if="demandAccess">
                                    <el-button type="primary" size="small" icon="el-icon-document"
                                               @click="Edit"
                                               :disabled="r_saveButton || r_ingRecordExist || invoiceDspMode">
                                        保存
                                    </el-button>
                                    <span v-model="reportDate0" v-show="false">{{reportDate0}}</span>
                                </el-form-item>
                                <el-form-item>
                                    <el-tag type="info">客户名称: {{ customerCode + ' / ' + customerName }}</el-tag>
                                </el-form-item>
                                <el-form-item>
                                    <el-tag type="info">开票金额: {{ totalAmount }}</el-tag>
                                </el-form-item>
                                <el-form-item>
                                    <el-tag type="info">开票期间：{{bDate}} / {{fDate}}</el-tag>
                                </el-form-item>
                                <el-form-item v-if="invCompanyCode != srvCompanyCode">
                                    <el-checkbox v-model="crossCompInv" checked disabled></el-checkbox>
                                    <label> 公司间开票</label>
                                </el-form-item>
                                <el-form-item>
                                    <el-button-group style="margin-left: 10px">
                                        <el-button type="danger" size="small" icon="el-icon-arrow-left"
                                                   :disabled="!r_cancelSplit"
                                                   @click="CancelSplit()">撤销
                                        </el-button>
                                        <el-button type="primary" size="small"
                                                   :disabled="!r_split"
                                                   @click="SplitInvoice">分拆<i class="el-icon-arrow-right el-icon--right"></i>
                                        </el-button>
                                    </el-button-group>
                                </el-form-item>
                                <div style="float:right"
                                     v-if="v_reportDate">
                                    <el-form-item label="报告日期">
                                        <el-date-picker type="date"
                                                        size="small"
                                                        v-model="reportDate"
                                                        :editable="false"
                                                        @change="proof"
                                                        :disabled="r_saveButton || r_ingRecordExist || invoiceDspMode">
                                        </el-date-picker>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </el-col>
                    </el-row>
                    <el-table
                            :data="itemData"
                            :height="this.fullHeight<200?300:this.fullHeight-40"
                            border
                            style="font-size:12px"
                            size="mini"
                            :cell-class-name = "cellClassNameInvoice"
                            @row-dblclick="showEstimationInfo"
                            v-loading="itemLoading">
                        <el-table-column label="开票" align="center" width="50" :resizable="false" fixed>
                            <template slot-scope="scope">
                                <el-checkbox size="small"
                                             :disabled="(scope.row.status != '0' &&
                                                          scope.row.status != 'estimated') ||
                                                         r_ingRecordExist || invoiceDspMode"
                                             v-model="scope.row.tobeInvoiced"
                                             @change="selectInvoice(scope.row)"></el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column label="报告日期"
                                         width="80"
                                         :resizable="false"
                                         align="center"
                                         v-if="!v_reportDate">
                            <template slot-scope="scope">
                                {{scope.row.reportDate}}
                            </template>
                        </el-table-column>
                        <el-table-column label="合同号" width="200" align="center" :resizable="false">
                            <template slot-scope="scope">
                                {{scope.row.contract}}
                            </template>
                        </el-table-column>
                        <el-table-column label="成本中心" width="200" align="center" :resizable="false" fit>
                            <template slot-scope="scope">
                                {{scope.row.costCenterDesc}}
                            </template>
                        </el-table-column>
                        <el-table-column label="销售产品" width="80" align="center" :resizable="false" fit>
                            <template slot-scope="scope">
                                {{scope.row.productDesc}}
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" width="100" align="center" :resizable="false">
                            <template slot-scope="scope">
                                <number-input size="small" type="text" v-model="scope.row.qty"
                                              :disabled="scope.row.status != '0' ||
                                                         r_ingRecordExist || invoiceDspMode"
                                              validType="decimal"
                                              @keyup.native="selectRow(scope.row)"></number-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="单价" width="120" :resizable="false" align="center">
                            <template slot-scope="scope">
                                {{formatAmount(scope.row.price, 6)}}
                            </template>
                        </el-table-column>
                        <el-table-column label="单位" width="60" :resizable="false" align="center">
                            <template slot-scope="scope">
                                {{scope.row.unitDesc}}
                            </template>
                        </el-table-column>
                        <el-table-column label="金额" width="80" :resizable="false" align="center">
                            <template slot-scope="scope">
                                {{formatAmount(scope.row.price * (isNaN(scope.row.qty) ? 0 : scope.row.qty))}}
                            </template>
                        </el-table-column>
                        <el-table-column label="调整金额" align="center" width="100" :resizable="false">
                            <template slot-scope="scope">
                                <number-input size="small" type="text" v-model="scope.row.adjAmt"
                                              :disabled="(scope.row.status != '0' &&
                                                          scope.row.status != 'estimated') ||
                                                         r_ingRecordExist || invoiceDspMode"
                                              placeholder="请输入"
                                              validType="decimal"
                                              @keyup.native="selectRow(scope.row)"></number-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="实际金额" align="center" width="80" :resizable="false">
                            <template slot-scope="scope">
                                {{formatAmount(scope.row.price*(isNaN(scope.row.qty) ? 0 : scope.row.qty) + 1 * (isNaN(parseInt(scope.row.adjAmt)) ? 0 : scope.row.adjAmt))}}
                            </template>
                        </el-table-column>
                        <el-table-column label="税率" width="70" :resizable="false" align="center">
                            <template slot-scope="scope">
                                {{scope.row.taxDesc}}
                            </template>
                        </el-table-column>
                        <el-table-column label="有效期间" width="150" :resizable="false" align="center">
                            <template slot-scope="scope">
                                {{scope.row.startDate}} - {{scope.row.endDate}}
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="60" :resizable="false" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.statusDesc}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="70" :resizable="false" fixed="right"
                                         v-if="!invoiceDspMode">
                            <template slot-scope="scope">
                                <el-button type="danger" size="small"
                                           @click="Close(scope.$index,scope.row)"
                                           :disabled="scope.row.status != '0' ||
                                                      r_ingRecordExist">
                                    终止
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-dialog>
                <el-dialog title="相关信息"
                           :visible.sync="dialogEstimationVisibleLog"
                           width="80%"
                           top="10%">
                    <el-row>
                        <el-col :span="24"
                                class="toolbar"
                                v-if="estimationInfo.length > 0  &&
                                      (estimationInfo[0].status == 'estimated' ||
                                       estimationInfo[0].status == 'reverseestimating' ||
                                       estimationInfo[0].status == 'reverseestimated') ">
                            暂估信息
                        </el-col>
                        <el-table
                                :data="estimationInfo"
                                border
                                style="font-size:12px"
                                size="mini"
                                v-if="estimationInfo.length > 0  &&
                                      (estimationInfo[0].status == 'estimated' ||
                                       estimationInfo[0].status == 'reverseestimating' ||
                                       estimationInfo[0].status == 'reverseestimated') ">
                            <el-table-column label="暂估调整金额" align="center" :resizable="false">
                                <template slot-scope="scope">
                                    {{scope.row.estAdjAmt}}
                                </template>
                            </el-table-column>
                            <el-table-column label="暂估实际金额" align="center" :resizable="false">
                                <template slot-scope="scope">
                                    {{scope.row.estTotalAmt}}
                                </template>
                            </el-table-column>
                            <el-table-column label="暂估报告日期" align="center" :resizable="false">
                                <template slot-scope="scope">
                                    {{scope.row.estimatedReportDate}}
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-col :span="24" class="toolbar">
                            流水号信息
                        </el-col>
                        <el-table
                                :data="numberInfo"
                                border
                                style="font-size:12px"
                                size="mini">
                            <el-table-column label="InvoiceGuid" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].invoiceGuid)">
                                <template slot-scope="scope">
                                    {{scope.row.invoiceGuid}}
                                </template>
                            </el-table-column>
                            <el-table-column label="InvoiceNumber" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].invoiceNumber)">
                                <template slot-scope="scope">
                                    {{scope.row.invoiceNumber}}
                                </template>
                            </el-table-column>
                            <el-table-column label="EstimationGuid" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].estimationGuid)">
                                <template slot-scope="scope">
                                    {{scope.row.estimationGuid}}
                                </template>
                            </el-table-column>
                            <el-table-column label="EstimationNumber" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].estimationNumber)">
                                <template slot-scope="scope">
                                    {{scope.row.estimationNumber}}
                                </template>
                            </el-table-column>
                            <el-table-column label="ReverseEstimationGuid" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].reverseEstimationGuid)">
                                <template slot-scope="scope">
                                    {{scope.row.reverseEstimationGuid}}
                                </template>
                            </el-table-column>
                            <el-table-column label="ReverseEstimationNumber" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].reverseEstimationNumber)">
                                <template slot-scope="scope">
                                    {{scope.row.reverseEstimationNumber}}
                                </template>
                            </el-table-column>
                            <el-table-column label="InterSalesARGuid" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].interSalesARGuid)">
                                <template slot-scope="scope">
                                    {{scope.row.interSalesARGuid}}
                                </template>
                            </el-table-column>
                            <el-table-column label="InterSalesARNumber" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].interSalesARNumber)">
                                <template slot-scope="scope">
                                    {{scope.row.interSalesARNumber}}
                                </template>
                            </el-table-column>
                            <el-table-column label="InterSalesAPGuid" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].interSalesAPGuid)">
                                <template slot-scope="scope">
                                    {{scope.row.interSalesAPGuid}}
                                </template>
                            </el-table-column>
                            <el-table-column label="InterSalesAPNumber" align="center" :resizable="false"
                                             v-if="numberInfo.length > 0 && !isNullOrWhiteSpace(numberInfo[0].interSalesAPNumber)">
                                <template slot-scope="scope">
                                    {{scope.row.interSalesAPNumber}}
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </el-dialog>
                <el-dialog title="SDK调用报错日志"
                           :visible.sync="dialogTableVisibleLog"
                           width="90%"
                           v-loading="logLoading">
                    <el-table :data="transLogData"
                              :height="this.fullHeight<200?300:this.fullHeight-40"
                              border
                              stripe
                              size="mini"
                              width="100%">
                        <el-table-column
                                align="center"
                                label="#"
                                width="40">
                            <template slot-scope="scope">
                                {{scope.$index + 1}}
                            </template>
                        </el-table-column>
                        <el-table-column label="标识NO."
                                         header-align="center"
                                         width="300">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col class="item-text">
                                        <span>{{scope.row.guid}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="错误信息"
                                         header-align="center"
                                         width="550">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col class="item-text">
                                        <span>{{scope.row.errorMessage}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="方法名称"
                                         align="center">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col class="item-text">
                                        <span>{{scope.row.funcName}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作时间" align="center">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col>
                                        <span>{{scope.row.dateTime}}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-dialog>
            </el-col>
        </el-row>
    </section>
</template>

<script>
    var user = JSON.parse(sessionStorage.getItem('user'));
    import {
        arraySearch,
        isNullOrWhiteSpace,
        chGMT,
        toGMT,
        formatAmount,
        dateAdd,
        formatMoney
    } from '../../assets/js/common';

    import {
        GetCompanyInAuth,
        SearchPeriod,
        SetSalesPeriod,
        SetSalesInvoice,
        SaveSalesInvoice,
        CloseSalesInvoice,
        UpdatePeriodStatus,
        ReadyToImportErp,
        SOcc,
        getTax,
        getPriceUnit,
        getCostCenter,
        getStatus,
        GetTransLog,
        GetConfig,
        SplitInvoice
    } from '../../api/api'
    import NumberInput from '../../components/NumberInput.vue'
    export default{
        components:{
            'number-input':NumberInput
        },
        created(){
            // 取得最小开票区间起始日期
            this.GetInvoiceDate();
            this.load();
        },
        computed:{
            // 金额加总
            totalAmount() {
                if(this.itemData.length === 0) return '';
                let amount=0;
                let adjWork;
                for(let item of this.itemData) {
                    adjWork = item.adjAmt == "-" ? 0 : item.adjAmt;
                    // 只计算打勾以及状态为ing结尾的记录
                    if (this.CheckEdStatus(item.itemStatus) ||
                        (item.tobeInvoiced && item.status != "9") ||
                        this.CheckIngStatus(item.itemStatus)) {
                        let qty = Number.parseFloat(item.qty);
                        let price = Number.parseFloat(item.price);
                        if (adjWork === '')
                            var adj = 0;
                        else if (adjWork !== '')
                            var adj = Number.parseFloat(adjWork);
                        if (!Number.isNaN(qty) && !Number.isNaN(price)) {
                            amount += qty * price - (-adj);
                        }
                    }
                }
                return this.formatAmount(amount);
            },
            // 控制保存按钮是否可用
            r_saveButton() {
                var showFlag = true;

                for(var item of this.itemData) {
                    if(item.tobeInvoiced || item.status == "0" || item.status == "estimated" || this.CheckIngStatus(item.status)) {
                        showFlag = false;
                        break;
                    }
                }
                return showFlag;
            },
            // 判断报告日期的呈现方式
            v_reportDate() {
                var showFlag = true;

                for(var item of this.itemData) {
                    if(item.status != "estimated" && (this.CheckEdStatus(item.status)) || this.CheckIngStatus(item.status)) {
                        showFlag = false;
                        break;
                    }
                }
                return showFlag;
            },
            // 判断项次中是否有ing状态的记录
            r_ingRecordExist() {
                var r_flag = false;

                for(var item of this.itemData) {
                    if(this.CheckIngStatus(item.status)) {
                        r_flag = true;
                        break;
                    }
                }
                return r_flag;
            },
            // 开票/暂估按钮是否可用
            r_selectPeriod() {
                var result = true;

                for(var row of this.periodData) {
                    if(row.checkBox){
                        result = false;
                        break;
                    }
                }
                return result;
            },
            // 检查勾选记录中是否只含有暂估记录
            r_onlyEstimated() {
                var estimatedFlag = false;
                var othterFlag = false;
                var result = false;

                for(var row of this.periodData) {
                    if(row.checkBox) {
                        if(estimatedFlag && othterFlag) {
                            break;
                        }
                        if(row.status == "estimated") {
                            estimatedFlag = true;
                        }
                        if(row.status == "0") {
                            othterFlag = true;
                        }
                    }
                }
                if(estimatedFlag && !othterFlag) {
                    result = true;
                }
                return result;
            },
            // 生成区间按钮只读控制
            r_createPeriod() {
                var result = true;

                if(this.searchDateRange && this.searchDateRange.length == 2 && this.searchDateRange[0] != null) {
                    result = false;
                }
                return result;
            },
            r_refreshData() {
                if(!isNullOrWhiteSpace(this.company))
                    return false;
                else
                    return true;
            },
            // 当存在被选中的项次时，拆分按钮可用
            r_split() {
                for(var item of this.itemData) {
                    if(item.tobeInvoiced)
                        return true
                }
                return false;
            },
            // 当存在GroupGuid不为空的项次时，撤销按钮可用
            r_cancelSplit() {
                for(var item of this.itemData) {
                    if(!isNullOrWhiteSpace(item.groupGuid))
                        return true;
                }
                return false;
            }
        },
        data(){
            let that = this;
            return{
                itemDemand:true,
                //fullHeight:document.documentElement.clientHeight-260,
                fullHeight: window.innerHeight-260,
                pickerOptions0: {
//                    disabledDate(time) {
//                        return time.getTime() < Date.now() - 8.64e7*30*6;
//                    },
                    shortcuts: [{
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '最近半年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '未来一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '未来三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '未来半年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 180);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }, {
                        text: '未来一年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 365);
                            picker.$emit('pick', [start.firstDateInMonth(), end.lastDateInMonth()]);
                        }
                    }]
                },
                loading:false,
                logLoading:false,
                status:'0',
                company:'',
                Options:[],
                statusOptions:[],
                searchDateRange:[],
                periodData:[],
                periodDataFilter:[],
                periodDBData:[],
                saveFlag: false,
                noRecFlag: false,
                dialogTableVisible: false,
                dialogTableVisibleLog: false,
                dialogEstimationVisibleLog: false,
                customName:'',
                itemData:[],
                itemDataFilter:[],
                keyWord:'',
                page:1,
                pageSize:10,
                currentPage2:1,
                companyObj: {},
                companyData: [],
                taxData: [],
                priceUnitData: [],
                costCenterData: [],
                statusData: [],
                transLogData: [],
                pageOptions:[
                    {
                        value:10,
                        label:'10条/页'
                    },
                    {
                        value:50,
                        label:'50条/页'
                    },
                    {
                        value:100,
                        label:'100条/页'
                    },
                ],
                cc:'',
                customerCode:'',
                customerName:'',
                bDate:'',
                fDate:'',
                reportDate0:'',
                reportDate:'',
                itemIndex:'',
                periodguid:'',
                periodrow:'',
                itemRows:'',
                demandAccess:true,
                unissued:false,
                Go:true,
                rev:'',
                confirmAmount:'',
                show:false,
                ccPool:[],
                itemLoading:false,
                crossCompInv:false,
                srvCompanyCode:"",
                invCompanyCode:"",
                newRecordCreated: false,
                sDateBackup: "",
                eDateBackup: "",
                invoiceDate: "",
                invoiceDspMode: true,
                estimationInfo: [],
                numberInfo: [],
                currRow: {},
            }
        },

        methods: {
            changeSize(){
                this.currentPage2 = 1;
                this.handleCurrentChange(1);
            },
            handleSizeChange(val) {
            },
            handleCurrentChange(val) {
                this.page = val;
                this.periodData = this.periodDataFilter.filter((u, index) => index < this.pageSize * this.page && index >= this.pageSize * (this.page - 1));
            },
            load(){
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                    GetCompanyInAuth({
                        action: 'inv',
                        userGuid: user.userGuid
                    }).then(data => {
                        if (data && data.code === '200') {
                            // 取得Company集合
                            this.companyData = data.content;
                            this.Options = [];
                            for (let line of data.content) {
                                this.Options.push({
                                    value: line.companyCode,
                                    label: line.companyName_ZH
                                })
                            }
                        }
                    })
                }
                // 取得价格单位主数据
                this.getPriceUnit();
                // 取得状态主数据
                this.getStatus();
                this.periodData = [];
                this.Options = [];
                this.statusOptions = [];
//                this.filter();

                this.statusOptions.push(
                    {value: '0', label: '待处理'},
                    {value: 'tobeinvoiced', label: '待开票'},
                    {value: 'estimating', label: '暂估中'},
                    {value: 'invoicing', label: '开票中'},
                    {value: 'estimated', label: '已暂估'},
                    {value: 'invoiced', label: '已开票'},
                    {value: '9', label: '终止'},
                    {value: '', label: '全部'})
            },
            // 全选按钮
            handleSelectionChange(val) {
                var action = val.length > 0 ? true : false;

                for(var row of this.periodData) {
                    if(row.tobeInvoiced == "1") {
                        row.checkBox = action;
                    }
                }
            },
            DoSearchPeriod() {
                // 必输检查
                if (isNullOrWhiteSpace(this.company)) {
                    this.$message.error("请选择公司！");
                    return;
                }
                // 必输检查
                if (!this.searchDateRange || this.searchDateRange.length < 2 || this.searchDateRange[0] == null) {
                    this.$message.error("请输入开票区间范围！");
                    return;
                }

                var sDate = this.formatDate(this.searchDateRange[0]);
                var eDate = this.formatDate(this.searchDateRange[1]);

                if(this.sDateBackup != sDate || this.eDateBackup != eDate) {
                    this.SearchPeriod(this.filter);
                } else {
                    this.filter();
                }
            },
            // 根据画面输入条件过滤Period数据集
            filter(){
                // 下拉框条件匹配通过Flag
                let checkFlag = false;
                // 日期条件匹配通过Flag
                let checkFlagDate = false;
                // 关键字匹配通过Flag
                let checkFlagKeyword = false;
                let startDate = "";
                let endDate = "";
                this.periodDataFilter = [];

                if (typeof(this.periodDBData) != "undefined" && this.periodDBData.length != 0) {
                    // 下拉框过滤条件 & 日期过滤
                    if(this.searchDateRange && this.searchDateRange.length == 2 && this.searchDateRange[0] != null) {
                        startDate = this.formatDate(this.searchDateRange[0]);
                        endDate = this.formatDate(this.searchDateRange[1]);
                    }
                    // 每一行的CostCenter集合
                    var aryCostCenter = new Array();
                    // 数据集生成
                    for (let line of this.periodDBData) {
                        checkFlag = false;
                        checkFlagDate = false;
                        checkFlagKeyword = false;

                        // 日期条件筛选
                        if (!isNullOrWhiteSpace(startDate) && !isNullOrWhiteSpace(endDate)) {
                            if (startDate <= line.endDate && endDate >= line.startDate) {
                                checkFlagDate = true;
                            }
                        } else {
                            checkFlagDate = true;
                        }
                        // 下拉框条件筛选
                        if (checkFlagDate) {
                            if (this.status == "") {
                                checkFlag = true;
                            }
                            else if (this.status == "tobeinvoiced" && line.tobeInvoiced == "1") {
                                checkFlag = true;
                            }
                            else if (this.status == line.status) {
                                checkFlag = true;
                            }
                        }
                        // 关键字匹配检查
                        if (checkFlag) {
                            this.keyWord = this.keyWord.trim();

                            if(isNullOrWhiteSpace(this.keyWord) ||
                                line.customCode.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                                line.costCenterCode.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                                line.customName_ZH.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1 ||
                                line.contract.toLowerCase().indexOf(this.keyWord.toLowerCase()) > -1) {
                                checkFlagKeyword = true;
                            }
                        }

                        if (checkFlagKeyword) {
                            aryCostCenter = line.costCenterCode.split(",");

                            this.periodDataFilter.push({
                                checkBox: false,
                                headGuid: line.headGuid,
                                company: line.companyCode,
                                invCompany: line.invCompanyCode,
                                date: line.createDate,
                                periodGuid: line.periodGuid,
                                companyName: line.companyName_ZH,
                                cmpCode: line.cmpCode,
                                customCode: line.customCode,
                                customName: line.customName_ZH,
                                contract: line.contract,
                                costCenter: line.costCenterCode,
                                startDate: line.startDate,
                                endDate: line.endDate,
                                reportDate: line.reportDate,
                                status: line.status,
                                complete: line.complete,
                                remark: line.remark,
                                crossCompInv: line.crossCompInv == "1" ? true : false,
                                changeType: line.changeType,
                                tobeInvoiced: line.tobeInvoiced,
                                totalAmount: this.formatAmount(line.totalAmount + ""),
                                withLog: line.withLog,
                                costCenterData: aryCostCenter,
                                groupGuid: line.groupGuid
                            });
                        }
                    }
                    this.handleCurrentChange(1);
                }
                else {
                    this.periodData = [];
                    this.periodDataFilter = [];
                }
            },
            // 选择公司下拉框值变化时调用
            setCompany(){
                // 设置默认日期范围
                this.initDateRange();
                // 检索数据集
                this.SearchPeriod(this.filter);

                // 主数据取得
                this.status = '';
                this.keyWord = '';
                this.currentPage2 = 1;
                this.pageSize = 10;
                this.show = true;
                // 取得当前选择的Company Object
                this.companyObj = arraySearch(this.company, this.companyData, "companyCode")[0];
                // 取得税率主数据
                this.getTax(this.companyObj);
                // 取得CostCenter主数据
                this.getCostCenter(this.companyObj);
            },
            setStatus(){
                this.filter();
                this.currentPage2 = 1;
                this.pageSize = 10;
            },
            newPeriod(){
                if(isNullOrWhiteSpace(this.company)){
                    this.$message.error("请选择公司");
                    return;
                }
                else if (this.searchDateRange[0] !== null || this.searchDateRange[0] !== undefined) {
                    if(this.invoiceDate && this.formatDate(this.searchDateRange[0]) < this.invoiceDate) {
                        this.$message.error("起始日期不能小于" + this.invoiceDate);
                        return;
                    }
                    var tempDate = new Date();
                    tempDate.add("m", -1);
                    var mon = tempDate.getMonth() + 1;
                    tempDate.firstDateInMonth();
                    tempDate = tempDate.format('yyyy-MM-dd');

                    if(tempDate && this.formatDate(this.searchDateRange[0]) > tempDate) {
                        this.$message.error("为保证区间连贯性，起始日期不能晚于" + mon + "月1号");
                        return;
                    }

                    // 确认框
                    this.$confirm("确定要生成开票区间吗？", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "question"
                    }).then(() => {
                        this.loading = true;

                        var sDate = this.formatDate(this.searchDateRange[0]);
                        var eDate = this.formatDate(this.searchDateRange[1]);

                        SetSalesPeriod({
                            companyCode: this.company,
                            startDate: sDate,
                            endDate: eDate,
                            userGuid: this.user.userGuid,
                            userID: this.user.fullName,
                        }).then(() => {
                            this.keyWord = '';
                            // 查询DB+过滤
                            this.SearchPeriod(this.filter,"nomessage");
                            this.$message.success("开票区间生成完毕");
                            this.loading = false;
                        }).catch(() => {
                            this.loading = false;
                        });
                    }).catch(() => {
                        this.loading = false;
                    });
                }
            },
            setItemData(row, message){
                var company = row.company;
                this.itemLoading = true;
                SetSalesInvoice({
                    periodGuid: this.periodguid,
                    userGuid: this.user.userGuid,
                    userID: this.user.fullName,
                    status: row.status,
                    groupGuid: row.groupGuid
                }).then(data => {
                    if (data && data.code === '200') {
                        this.itemData = [];
                        var costCenterDesc = "";
                        var unitDesc = "";
                        var taxDesc = "";
                        var statusDesc = "";
                        var adj = "";
                        var estAdj = "";
                        var tempCostCenterObj;
                        var tempEstimationNumber = "";
                        var sameEstimationNumber = false;
                        for (let line of data.content) {
                            if(line.status == "estimated" && !sameEstimationNumber && !this.invoiceDspMode) {
                                if(isNullOrWhiteSpace(tempEstimationNumber))
                                    tempEstimationNumber = line.estimationNumber;
                                else {
                                    if(tempEstimationNumber == line.estimationNumber) {
                                        sameEstimationNumber = true;
                                    } else {
                                        tempEstimationNumber = line.estimationNumber;
                                    }
                                }
                            }
                            // 成本中心
                            if(isNullOrWhiteSpace(line.costCenterCode.trim())) {
                                costCenterDesc = "";
                            } else {
                                tempCostCenterObj = arraySearch(line.costCenterCode.trim(), this.costCenterData, "value", "contain");
                                if(tempCostCenterObj && tempCostCenterObj.length > 0) {
                                    costCenterDesc = tempCostCenterObj[0].value;
                                } else {
                                    costCenterDesc = line.costCenterCode.trim();
                                }
                            }
                            //costCenterDesc = isNullOrWhiteSpace(line.costCenterCode.trim())? "" : arraySearch(line.costCenterCode.trim(), this.costCenterData, "value", "contain")[0].value;
                            // 价格单位
                            unitDesc = arraySearch(line.priceUnitCode.trim(), this.priceUnitData, "priceUnitCode")[0].priceUnitName_ZH;
                            // 税率描述
                            taxDesc = arraySearch(line.taxCode.trim(), this.taxData, "taxCode")[0].taxName;
                            // 状态描述
                            statusDesc = arraySearch(line.status, this.statusData, "status")[0].name_ZH;
                            // 调整金额
                            adj = line.status == "estimated" || line.status == "reverseestimated" || line.status == "reverseestimating" ? line.finAdjAmt: line.adjAmt;
                            adj = adj + "";
                            // 暂估调整金额（仅用于显示）
                            estAdj = line.adjAmt + "";

                            this.itemData.push({
                                tobeInvoiced: line.tobeInvoiced,
                                periodGuid: line.periodGuid,
                                processGuid: line.processGuid,
                                groupGuid: line.groupGuid,
                                costCenter: line.costCenterCode,
                                costCenterDesc: costCenterDesc,
                                company: company,
                                contract: line.contract,
                                productCode: line.productCode,
                                productDesc: line.productDesc,
                                qty: line.qty + "",
                                price: line.price,
                                currency: line.currCode,
                                unit: line.priceUnitCode,
                                unitDesc: unitDesc,
                                tax: line.taxCode,
                                taxDesc: taxDesc,
                                startDate: line.startDate,
                                endDate: line.endDate,
                                itemStatus: line.status,
                                adjAmt: adj,
                                finAdjAmt: line.finAdjAmt,
                                tobeInvoiced: line.tobeInvoiced,
                                status: line.status,
                                statusDesc: statusDesc,
                                estAdjAmt: line.adjAmt,
                                estimatedReportDate: line.estimatedReportDate,
                                invoiceNumber: line.invoiceNumber,
                                estimationNumber: line.estimationNumber,
                                reverseEstimationNumber: line.reverseEstimationNumber,
                                interSalesARNumber: line.interSalesARNumber,
                                interSalesAPNumber: line.interSalesAPNumber,
                                invoiceGuid: line.invoiceGuid,
                                estimationGuid: line.estimationGuid,
                                reverseEstimationGuid: line.reverseEstimationGuid,
                                interSalesARGuid: line.interSalesARGuid,
                                interSalesAPGuid: line.interSalesAPGuid,
                                reportDate: line.reportDate
                            });
                        }
                        this.customerCode = row.customCode;
                        this.customerName = row.customName;
                        this.srvCompanyCode = row.company;
                        this.invCompanyCode = row.invCompany;
                        this.bDate = row.startDate;
                        this.fDate = row.endDate;
                        this.reportDate = isNullOrWhiteSpace(row.reportDate)?row.endDate:row.reportDate;
                        this.reportDate0 = row.reportDate;
                        this.itemLoading = false;
                        this.crossCompInv = row.crossCompInv;

                        // 此时说明有新的SalesInvoice记录被生成
                        if(data.message == "new record created") {
                            this.newRecordCreated = true;
                        }

                        if(sameEstimationNumber) {
                            // 如果存在相同的estimationNumber时报提示信息
                            this.$notify({
                                title: '提示',
                                duration: 10000,
                                message: '同一组的已暂估记录，勾选其中一条时其他已暂估记录将会一起被勾选'
                            });
                        }
                        if(!isNullOrWhiteSpace(message))
                            this.$message.success(message);
                    }
                    else {
                        this.$message.warning("没有符合条件的记录，关闭当前页面将为你更新数据");
                        this.noRecFlag = true;
                        this.itemLoading = false;
                    }
                });
//                ).catch(() => {
//                    this.$message.error("API执行出错！");
//                    this.itemLoading = false;
//                })
            },
            dsplayInvoice(row) {
                this.modify(row, true);
            },
            modify: function (row, isDspPlay) {
                this.invoiceDspMode = isDspPlay;
                this.unissued = false;
                this.demandAccess = true;
                this.itemDemand = false;
                this.dialogTableVisible = true;
                this.periodguid = row.periodGuid;
                this.periodrow = JSON.stringify(row);
                this.srvCompanyCode = row.company;
                this.invCompanyCode = row.invCompany;
                this.newRecordCreated = false;
                this.rev = '0';
                this.saveFlag = false;
                this.noRecFlag = false;
                this.currRow = row;
                this.setItemData(row);
            },
            Edit(){
                // 检查总金额是否大于0
//                if(this.totalAmount.replace(",","") + 0 < 0) {
//                    this.$message.error("总金额不能小于0");
//                    return;
//                }
                // 常规Check
                if(!this.checkInput()) {
                    return;
                }
                else {
                    this.$confirm('是否确认修改', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.itemLoading = true;
                        // 保存Item行项
                        this.SaveSalesInvoice(this.UpdatePeriodInfo);
                    });
                }
            },
            // 分拆开票行项
            SplitInvoice() {
                var count = 0;
                for(var row of this.itemData) {
                    if(row.tobeInvoiced)
                        count = count + 1;
                }
                this.$confirm(count + '个开票行将被分拆成一个独立开票区间，确定吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.itemLoading = true;
                    // 保存Item行项
                    this.DoSplitInvoice();
                });
            },
            // 执行分拆开票行项
            DoSplitInvoice() {
                let items = [];
                for (let line of this.itemData) {
                    if(!line.tobeInvoiced)
                        continue;
                    items.push({
                        processGuid: line.processGuid
                    });
                }
                // 传入参数设定
                var param = {
                    userGuid: this.user.userGuid,
                    userID: this.user.fullName,
                    split: true,
                    lines: items
                };
                // 执行分拆
                SplitInvoice(param).then(data => {
                    if (data && data.code === '200') {
                        this.setItemData(this.currRow, "分拆成功，可关闭当前画面进行查看");
                        this.saveFlag = true;
                    } else {
                        this.$alert('分拆执行失败', '提示', {
                            confirmButtonText: '确定',
                            type: 'error'
                        });
                        this.itemLoading = false;
                    }
                }).catch(() => {
                    this.$alert('分拆执行异常', '提示', {
                        confirmButtonText: '确定',
                        type: 'error'
                    });
                    this.itemLoading = false;
                });
            },
            // 取消分拆开票行项
            CancelSplit() {
                this.$confirm('撤销分拆后将关闭当前对话框，确定吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.itemLoading = true;
                    // 保存Item行项
                    this.DoCancelSplit();
                });
            },
            // 执行撤销分拆开票行项
            DoCancelSplit() {
                let items = [];
                for (let line of this.itemData) {
                    if(isNullOrWhiteSpace(line.groupGuid))
                        continue;
                    items.push({
                        processGuid: line.processGuid
                    });
                }
                // 传入参数设定
                var param = {
                    userGuid: this.user.userGuid,
                    userID: this.user.fullName,
                    split: false,
                    lines: items
                };
                // 执行分拆
                SplitInvoice(param).then(data => {
                    if (data && data.code === '200') {
                        this.saveFlag = true;
                        this.dialogTableVisible = false;
                    } else {
                        this.$alert('撤销操作执行失败', '提示', {
                            confirmButtonText: '确定',
                            type: 'error'
                        });
                    }
                    this.itemLoading = false;
                }).catch(() => {
                    this.$alert('撤销操作执行异常', '提示', {
                        confirmButtonText: '确定',
                        type: 'error'
                    });
                    this.itemLoading = false;
                });
            },
            checkQty: function (index, row) {
                var Qty = row.price * row.qty - (-row.adj);
                if (Qty <= 0) {
                    this.$message.error("实际金额必须大于0");
                    row.adj = '';
                }
//                if(Qty>0){
//                    row.itemAction=true;
//                }
//                if(row.adj===''){
//                    row.itemAction=false;
//                    row.adj=''
//                }
//                else if(row.adj>0) row.itemAction=true;
            },
            checkQtyFin: function () {
                var Qty = 0;
                var row;

                for (var index in this.itemData) {
                    row = this.itemData[index];
                    Qty = row.price * row.qty - (-row.adj);
                    if (Qty <= 0) {
                        row.adj = "";
                        this.$message.error("实际金额必须大于0");
                        return false;
                    }
                }
                return true;
            },
            proof(){
                if (this.reportDate === '') {
                    this.reportDate = this.reportDate0;
                }
            },
            Close: function (index, row) {
                this.$confirm('终止后不可恢复，确定吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'question'
                }).then(() => {
                    // 设置终止Flag
                    row.tobeInvoiced = true;
                    row.status = "9";
                    this.$message({
                        type: 'success',
                        message: '已设置成待终止！'
                    })
                }).catch(() => {
                });
            },
            // 取得开票公司成本中心主数据
            getCostCenter(companyObj) {
                // 参数
                var parameters = {
                    erpCode: companyObj.dbName,
                    ip: companyObj.ip
                };

                getCostCenter(parameters).then(data => {
                    if (data && data.code == "200") {
                        var costCenter;
                        var name = "";

                        this.costCenterData = [];
                        for (var i = 0; i < data.content.length; i++) {
                            costCenter = {"value": ""};
                            name = data.content[i].costCenterName_ZH;
                            if (isNullOrWhiteSpace(name)) {
                                name = "";
                            }
                            costCenter.value = data.content[i].costCenterCode + " / " + name;

                            this.costCenterData.push(costCenter);
                        }
                    } else {
                        this.costCenterData = [];
                    }
                });
            },
            // 取得税主数据
            getTax(compObj) {
                getTax({
                    erpCode: compObj.dbName,
                    ip: compObj.ip
                }).then(data => {
                    if (data && data.code == "200") {
                        this.taxData = data.content;
                    } else {
                        this.taxData = [];
                    }
                });
            },
            getStatus() {
                getStatus("invoice").then(data => {
                    if (data && data.code == "200") {
                        this.statusData = data.content;
                    } else {
                        this.statusData = [];
                    }
                });
            },
            // 取得价格单位主数据
            getPriceUnit() {
                getPriceUnit().then(data => {
                    if (data && data.code == "200") {
                        this.priceUnitData = data.content;
                    } else {
                        this.priceUnitData = [];
                    }
                });
            },
            // 日期格式化
            formatDate(date) {
                return chGMT(date, 'yyyy-MM-dd');
            },
            // 保存前的必要检查
            checkInput() {
                var selectFlag = true;    // result

                if (this.itemData.length === 0 || this.itemData === []) {
                    this.$message.error('没有数据可被保存!');
                    selectFlag = false;
                }
                else if (!this.checkQtyFin()) {
                    selectFlag = false;
                }
//                else if (this.itemData.length > 0) {
//                    for (let line of this.itemData) {
//                        if (line.tobeInvoiced) {
//                            selectFlag = true;
//                            break;
//                        }
//                    }
//                    if (!selectFlag) this.$message.error("请勾选要保存的数据");
//                }
                return selectFlag;
            },
            // 保存方法
            SaveSalesInvoice(callBack)
            {
                var param = {};
                let items = [];
                // Item行项设置
                for (let line of this.itemData) {
                    items.push({
                        processGuid: line.processGuid,
                        adjAmt: line.adjAmt,
                        finAdjAmt: line.adjAmt,
                        reportDate: this.formatDate(this.reportDate),
                        tobeInvoiced: line.tobeInvoiced,
                        status: line.status,
                        qty: isNullOrWhiteSpace(line.qty) ? 0: line.qty
                    });
                }
                // 传入参数设定
                param = {
                    userGuid: this.user.userGuid,
                    userID: this.user.fullName,
                    lines: items
                };
                // 执行保存
                SaveSalesInvoice(param).then(data => {
                    if (data && data.code === '200') {
                        // 检查是否有终止并打勾的记录，有则去掉打勾
                        for(var item of this.itemData) {
                            if(item.status == "9" && item.tobeInvoiced) {
                                item.tobeInvoiced = false;
                                item.adjAmt = "0";
                                item.finAdjAmt = "0";
                                item.reportDate = "";
                                item.statusDesc = arraySearch(item.status,this.statusData,"status")[0].name_ZH;
                            }
                        }
                        // 保存标志置为true
                        this.saveFlag = true;
                        // 回调方法
                        callBack();
                    } else {
                        this.$alert('没有需要保存的记录', '提示', {
                            confirmButtonText: '确定',
                            type: 'success'
                        });
                    }
                    this.itemLoading = false;
                }).catch(() => {
                    this.$alert('保存执行异常', '提示', {
                        confirmButtonText: '确定',
                        type: 'error'
                    });
                    this.itemLoading = false;
                });
            },
            // 更新区间的ReportDate
            UpdatePeriodInfo(){
                UpdatePeriodStatus({
                    status: '2',
                    reportDate: this.formatDate(this.reportDate),
                    periodGuid: this.periodguid
                }).then(data => {
                    if (data && data.code === '200') {
                        this.$alert('数据保存成功', '提示', {
                            confirmButtonText: '确定',
                            type: 'success'
                        });
                    }
                    this.itemLoading = false;
                }).catch(() => {
                    this.itemLoading = false;
                });
            },
            // 检查status是否以ing结尾
            CheckIngStatus(status) {
                if(!isNullOrWhiteSpace(status) && status.length > 3 && status.substr(status.length - 3) == "ing") {
                    return true;
                }
                return false;
            },
            // 检查status是否以ed结尾
            CheckEdStatus(status) {
                if(!isNullOrWhiteSpace(status) && status.length > 2 && status.substr(status.length - 2) == "ed") {
                    return true;
                }
                return false;
            },
            cellClassNamePeriod({row, column, rowIndex, columnIndex}) {
                if(row.status == "0") {
                    return "";
                }
                if(this.CheckIngStatus(row.status) && columnIndex == 7) {
                    return "ing-row";
                }
                if(this.CheckEdStatus(row.status) && columnIndex == 7) {
                    return "ed-row";
                }
            },
            cellClassNameInvoice({row, column, rowIndex, columnIndex}) {
                if(this.CheckIngStatus(row.status) && columnIndex == 1) {
                    return "ing-row";
                }
                if(this.CheckEdStatus(row.status) && columnIndex == 1) {
                    return "ed-row";
                }
            },
            // 区间的状态描述
            setStatusDesc(row) {
                var statusDesc = "";
                statusDesc = arraySearch(row.status, this.statusData, "status")[0].name_ZH;
                return statusDesc;
            },
            // 执行开票/暂估操作
            ReadyToImportErp(processType) {
                var processDesc = "";
                var periodLine = [];
                var count = 0;

                if(processType.toLowerCase() == "invoice")
                    processDesc = "开票";
                else
                    processDesc = "暂估";

                for(var row of this.periodData) {
                    if(!row.checkBox)
                        continue;
                    periodLine.push({
                        periodGuid: row.periodGuid
                    });
                    count ++;
                }
                if(count == 0) {
                    this.$message.error('没有需要操作的记录，或数据库已更新！')
                    return;
                }
                // 确认框
                this.$confirm("您选择了" + count + "个开票区间，确定要执行" + processDesc + "操作吗？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "question"
                }).then(() => {
                    // 打开loading
                    this.loading = true;
                    // 参数作成
                    var param = {
                        processType: processType,
                        userGuid: this.user.userGuid,
                        userID: this.user.fullName,
                        periodLine: periodLine
                    }
                    // 执行开票/暂估API
                    ReadyToImportErp(param).then(data => {
                        if (data && data.code == "200") {
                            if(data.content == 0) {
                                this.$message.error("没有记录被执行操作");
                            } else {
                                this.$message.success(count + "个开票区间，共计" + data.content + "个项次被执行" + processDesc);
                            }
                            // 读取DB+筛选
                            this.SearchPeriod(this.filter, "nomessage");
                        } else {
                            this.$message.error("开票/暂估API执行失败!");
                            this.loading = false;
                        }
                    });
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 查询开票区间
            SearchPeriod(callBack, messageFlag) {
                // 公司为空时return
                if(isNullOrWhiteSpace(this.company)) {
                    return;
                }
                this.loading = true;

                var sDate = this.formatDate(this.searchDateRange[0]);
                var eDate = this.formatDate(this.searchDateRange[1]);

                // 备份查询日期
                this.sDateBackup = sDate;
                this.eDateBackup = eDate;

                // 查找区间数据
                SearchPeriod({
                    company: this.company,
                    sDate: sDate,
                    eDate: eDate
                }).then(data => {
                    if (data && data.code === '200') {
                        if(isNullOrWhiteSpace(messageFlag)) {
                            this.$message.success("当前画面数据已刷新！");
                        }
                        // 取得Period对应的CostCenter集合
//                        this.SetCostCetnerPool();
                        this.periodDBData = data.content;
                        callBack();
                        this.loading = false;
                    } else {
                        if(isNullOrWhiteSpace(messageFlag)) {
                            this.$message.success("没有符合条件的开票区间！");
                        }
                        this.periodDBData = [];
                        this.periodData = [];
                        this.periodDataFilter = [];
                        this.loading = false;
                    }
                }).catch(() => {
                    this.loading = false;
                })
            },
            // 格式化金额（Item用）
            formatAmount(amount, decimals) {
//                return formatMoney(amount, 6);
                if(isNullOrWhiteSpace(decimals)) {
                    decimals = 2;
                }
                decimals = decimals + 0;
                return formatMoney(amount, decimals, ".", ",", "round");
            },
            // 输入框keyup时自动勾选该行
            selectRow(row) {
                if (!row.tobeInvoiced)
                    row.tobeInvoiced = true;
            },
            refresh() {
                this.loading = true;
                this.SearchPeriod(this.filter);
            },
            // 取得SDK交易错误日志
            GetTransLog(periodGuid) {
                this.dialogTableVisibleLog = true;
                this.logLoading = true;
                this.transLogData = [];

                GetTransLog({
                    periodGuid: periodGuid
                }).then(data => {
                    if (data && data.code === '200') {
                        this.transLogData = data.content;
                    } else {
                        this.transLogData = [];
                    }
                    this.logLoading = false;
                }).catch(() => {
                    this.transLogData = [];
                    this.logLoading = false;
                });
            },
            // 窗口关闭按钮
            DialogClose() {
                // 判断保存成功过时，刷新开票区间数据
                if(this.saveFlag || this.noRecFlag || this.newRecordCreated) {
                    this.SearchPeriod(this.filter);
                }
            },
            initDateRange() {
                if(this.searchDateRange && this.searchDateRange.length == 2 && this.searchDateRange[0] != null) {
                    return;
                }
                var myDate = new Date();
                myDate.add("m",1);
                var eDate = myDate.format('yyyy/MM/dd');
                myDate.add("m",-4);
                var sDate = myDate.format('yyyy/MM/dd');
                this.searchDateRange = [];
                this.searchDateRange.push(toGMT(sDate).firstDateInMonth());
                this.searchDateRange.push(toGMT(eDate).lastDateInMonth());
            },
            // 取得最小开票区间起始日期
            GetInvoiceDate() {
                // 执行保存
                GetConfig("InvoiceDate").then(data => {
                    if (data && data.code === '200') {
                        this.invoiceDate = data.content;
                    }
                });
            },
            showEstimationInfo(row) {
                if(row.status == "0" || row.status == "9") {
                    this.$message.error("暂无相关信息");
                    return;
                }
                // 暂估相关信息
                this.estimationInfo = [];
                this.estimationInfo.push({
                    status: row.status,
                    estAdjAmt: row.estAdjAmt,
                    estTotalAmt: this.formatAmount(row.price*(isNaN(row.qty) ? 0 : row.qty) + 1 * (isNaN(parseInt(row.estAdjAmt)) ? 0 : row.estAdjAmt)),
                    estimatedReportDate: row.estimatedReportDate
                });

                // 其他相关信息
                this.numberInfo = [];
                this.numberInfo.push({
                    invoiceNumber: row.invoiceNumber,
                    estimationNumber: row.estimationNumber,
                    reverseEstimationNumber: row.reverseEstimationNumber,
                    interSalesARNumber: row.interSalesARNumber,
                    interSalesAPNumber: row.interSalesAPNumber,
                    invoiceGuid: row.invoiceGuid,
                    estimationGuid: row.estimationGuid,
                    reverseEstimationGuid: row.reverseEstimationGuid,
                    interSalesARGuid: row.interSalesARGuid,
                    interSalesAPGuid: row.interSalesAPGuid
                });

                this.dialogEstimationVisibleLog = true;
            },
            selectInvoice(row) {
                if(row.status != "estimated" || isNullOrWhiteSpace(row.estimationNumber))
                    return;

                for(var item of this.itemData) {
                    if(item.processGuid == row.processGuid ||
                        item.tobeInvoiced == row.tobeInvoiced ||
                        item.status != "estimated")
                        continue;
                    if(item.estimationNumber == row.estimationNumber)
                        item.tobeInvoiced = row.tobeInvoiced;
                }
            },
            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            }
        }
    }
</script>

<style>
    @import '../../assets/css/common.css';
    .el-table .ing-row {
        background-color: #fbf8a5;
    }
    .el-table .ed-row {
        background-color: #bbfbc2;
    }
    .item-text {
        padding-left: 6px;
    }
    .error-log-icon {
        color: red;
    }
    .error-log-font {
        color: red;
        font-weight: bold;
    }
</style>