<template>
    <section v-loading="viewCtrl.v_loading"
             element-loading-text="读取中...">
        <el-tooltip content="返回上一页" placement="left" v-if="backBtn" effect="light">
            <div class="his-back" @click="hisBack"><i class="el-icon-arrow-left"></i></div>
        </el-tooltip>
        <el-row style="margin-bottom:-10px;background-color: #F3F3F4">
            <!--工具条-->
            <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                <el-form :inline="true" :model="headData">
                    <el-form-item style="margin-right: 0px">
                        <el-select v-model="companyCode" size="small"
                                   filterable placeholder="请选择公司"
                                   style="width:127px"
                                   :disabled="viewCtrl.r_selCompany">
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
                    </el-form-item>
                    <el-form-item style="margin-right: 0px">
                        <div v-show="!viewCtrl.v_btn && !mode">
                            <el-button type="primary" size="small" icon="el-icon-document" @click="showHead"
                                       :loading="viewCtrl.v_loadingCreat">新增表头
                            </el-button>
                        </div>
                        <div v-show="viewCtrl.v_btn && mode != '2' && mode != '3'">
                            <el-button type="primary" size="small" icon="el-icon-document" @click="handleSave"
                                       :disabled="r_alwaysEnable">保存
                            </el-button>
                        </div>
                        <div v-show="viewCtrl.v_btn && mode == '2'">
                            <el-button type="primary" size="small" icon="el-icon-document" @click="handleSave"
                                       :disabled="r_alwaysEnable">续签
                            </el-button>
                        </div>
                        <div v-show="viewCtrl.v_btn && mode == '3'">
                            <el-button type="primary" size="small" icon="el-icon-document" @click="handleSave"
                                       :disabled="r_alwaysEnable">延续
                            </el-button>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <div v-show="mode == '1'">
                            <el-button type="danger" size="small" @click="headClose" :disabled="r_alwaysEnable">终止
                            </el-button>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="headData.contract">
                        <el-tag type="info">合同号：{{ headData.contract }}</el-tag>
                    </el-form-item>
                    <el-form-item v-if="headData.companyCode">
                        <el-tag type="info">开票公司：{{ companyTitle }}</el-tag>
                    </el-form-item>
                    <el-form-item v-if="headData.customCode">
                        <el-tag type="info">客户：{{ customerTitle }}</el-tag>
                    </el-form-item>
                    <el-form-item v-if="headData.date_range && headData.date_range[0] != null">
                        <el-tag type="info">有效期：{{ formatDate_range }}</el-tag>
                    </el-form-item>
                    <div style="float:right">
                        <el-form-item v-show="viewCtrl.v_head">
                            <el-badge is-dot hidden>
                                <el-button type="primary" size="small" icon="el-icon-arrow-down"
                                           @click="viewCtrl.v_head = !viewCtrl.v_head"></el-button>
                            </el-badge>
                        </el-form-item>
                        <el-form-item v-show="!viewCtrl.v_head">
                            <el-badge is-dot :hidden="viewCtrl.r_tray || !autoHidden">
                                <el-button type="primary" size="small" icon="el-icon-arrow-right"
                                           @click="viewCtrl.v_head = !viewCtrl.v_head; autoHidden = false;"
                                           :disabled="viewCtrl.r_tray"></el-button>
                            </el-badge>
                        </el-form-item>
                    </div>
                </el-form>
            </el-col>
        </el-row>

        <transition name="el-zoom-in-top">
            <div v-show="viewCtrl.v_head" style="background: #FAFAFA">
                <el-form :model="headData" :rules="headRules" ref="headData" :inline="true">
                    <el-row>
                        <el-col :span="12" class="min-column col-left">
                            <el-form-item label="开票公司" prop="companyCode">
                                <el-select v-model="headData.companyCode" size="small"
                                           filterable plaeholder="请选择公司"
                                           style="width:157px"
                                           :disabled="r_afterInvoice"
                                           @change="reload">
                                    <el-option
                                            v-for="company in companyData"
                                            :key="company.companyCode"
                                            :label="company.companyCode + ' / ' + company.companyName_ZH"
                                            :value="company.companyCode"
                                            style="width:200px">
                                        <span style="float: left">{{ company.companyCode }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ company.companyName_ZH }}</span>
                                    </el-option>
                                </el-select>
                                <el-select v-model="headData.customCode" size="small"
                                           filterable placeholder="请选择客户"
                                           style="width:260px"
                                           :disabled="r_afterInvoice"
                                           @change="custChange">
                                    <el-option
                                            v-for="custom in customData"
                                            :key="custom.customCode"
                                            :label="isNullOrWhiteSpace(custom.cmpCode) ? custom.customCode : custom.cmpCode
                                                    + ' / ' + custom.customName_ZH"
                                            :value="custom.customCode"
                                            style="width:350px">
                                        <span style="float: left">{{ isNullOrWhiteSpace(custom.cmpCode) ? custom.customCode: custom.cmpCode }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ custom.customName_ZH }}</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="min-column col-left-no_require">
                            <el-form-item label="续签次数">
                                <el-input-number size="small" :min="0" :max="999"
                                                 v-model="headData.signCount"
                                                 :disabled="r_alwaysEnable"
                                                 :tabIndex="-1"></el-input-number>
                                <span class="number-unit">（次）</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12" class="min-column col-left_3">
                            <el-form-item label="合同号" prop="contract">
                                <el-input class="input-style customer-width" v-model="headData.contract"
                                          placeholder="请输入合同号"
                                          size="small" icon="el-icon-edit"
                                          :disabled="r_afterInvoice && mode != '2'"
                                          :autofocus="autoFocus"
                                          validType="code" @blur="checkExist(headData.contract)">
                                </el-input>
                            </el-form-item>
                            <el-form-item label="收到合同" style="padding-left:15px">
                                <el-checkbox v-model="headData.received" :disabled="r_receivedContract"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="公司间开票" v-if="this.headData.companyCode!==this.companyCode">
                                <el-checkbox v-model="headData.crossCompInv"
                                             :disabled="true"></el-checkbox>
                                <!--:disabled="r_afterInvoiceWithoutItemCheck"></el-checkbox>-->
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="min-column" style="padding-left: 9px">
                            <el-form-item label="币别选择">
                                <el-select class="el_short" v-model="headData.currCode" size="small"
                                           filterable placeholder="请选择币别"
                                           :disabled="r_afterInvoice">
                                    <el-option
                                            v-for="curr in currData"
                                            :key="curr.currCode"
                                            :label="curr.currCode + ' / ' + curr.currName_ZH"
                                            :value="curr.currCode"
                                            style="width: 150px">
                                        <span style="float: left">{{ curr.currCode }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ curr.currName_ZH }}</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12" class="min-column col-left">
                            <el-form-item label="付款方式" prop="paymentCode">
                                <el-select class="long-size" v-model="headData.paymentCode" size="small"
                                           filterable placeholder="请选择付款方式"
                                           style="width: 230px"
                                           :disabled="r_afterInvoice">
                                    <el-option
                                            v-for="payment in paymentData"
                                            :key="payment.paymentCode"
                                            :label="payment.paymentName_ZH"
                                            :value="payment.paymentCode">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="12" class="min-column" style="padding-left: 23px">
                            <el-form-item label="截止日">
                                <el-input-number size="small" :min="1" :max="31"
                                                 v-model="headData.deadline"
                                                 :disabled="r_afterInvoiceWithoutItemCheck"
                                                 :editable="false"></el-input-number>
                                <span class="number-unit">（号）（注：若指月底请填 “31”）</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12" class="min-column col-left">
                            <el-form-item label="有效日期" prop="date_range">
                                <el-date-picker
                                        v-model="headData.date_range"
                                        type="daterange"
                                        align="right"
                                        size="small"
                                        placeholder="有效日期范围"
                                        :picker-options="pickerOptions2"
                                        :disabled="r_afterInvoice && mode != '2'"
                                        :editable="false"
                                        range-separator="至"
                                        start-placeholder="开始日期"
                                        end-placeholder="结束日期"
                                        style="width:290px"
                                        @change="dateRangeChange">
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary"
                                           size="small"
                                           v-if="mode && mode == '3'"
                                           @click="setEndDate"
                                           icon="el-icon-date">调整结束日期</el-button>
                            </el-form-item>
                        </el-col>

                        <el-col :span="12" class="min-column">
                            <el-form-item label="生效日期" prop="validDate">
                                <el-date-picker
                                        v-model="headData.validDate"
                                        :disabled="(hasDateRange || r_afterInvoice) && mode != '2'"
                                        type="date"
                                        placeholder="生效日期"
                                        size="small"
                                        :picker-options="pickerOptions0"
                                        :editable="false"
                                        :default-value="headData.startDate">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item class="col-left col-4words-left" label="备注信息" style="padding-bottom: 10px">
                        <el-input type="textarea" v-model="headData.remark" style="width:703px"
                                  placeholder="请输入备注信息" :disabled="r_alwaysEnable"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </transition>

        <transition name="el-zoom-in-center">
            <div>
                <el-row>
                    <!--工具条-->
                    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                        <el-form :inline="true">
                            <el-form-item>
                                <el-button type="primary" size="small" icon="el-icon-plus"
                                           @click="handleAdd"
                                           v-if="(mode && mode != '3' && mode != '0') || !mode"
                                           :disabled="!showItemFlag || r_alwaysEnable">新增行项
                                </el-button>
                            </el-form-item>
                            <div style="float: right">
                                <el-form-item>
                                    <el-tooltip content="列编辑开关"
                                                placement="top"
                                                effect="light"
                                                v-if="mode && mode != '3' && mode != '0'">
                                        <el-switch
                                                v-model="colEditFlag"
                                                on-text=""
                                                off-text=""
                                                :disabled="viewCtrl.r_col || viewCtrl.r_item || r_alwaysEnable"
                                                @change="changeColEdit">
                                        </el-switch>
                                    </el-tooltip>
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-col>
                </el-row>
            </div>
        </transition>

        <transition name="el-zoom-in-center">
            <div v-loading="viewCtrl.loadingItem"
                 element-loading-text="项次部分加载中..." v-show="showItemFlag">
                <el-row>
                    <el-col :span="24" style="padding-bottom: 10px;">
                        <el-table
                                :data="filterItemData"
                                stripe
                                border
                                size="mini"
                                :height="this.fullHeight<300?300:this.fullHeight">
                            <el-table-column
                                    align="center"
                                    label="#"
                                    width="40">
                                <template slot-scope="scope">
                                    {{scope.$index + 1}}
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="contract"
                                    align="center"
                                    label="合同号"
                                    width="180">
                                <template slot-scope="scope">
                                    <el-input size="small" type="text" v-model="scope.row.contract"
                                              :disabled="r_column(scope.row.status)"
                                              placeholder="请输入"
                                              @focus="activeColEdit" @change="colEdit('contract', scope.row.itemIndex)"
                                              validType="code" :iconShow="viewCtrl.v_iconShow"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="成本中心"
                                    width="184">
                                <template slot-scope="scope">
                                    <el-autocomplete class="inline-input" size="small" v-model="scope.row.costCenterCode" :fetch-suggestions="querySearchCostCenter"
                                                     placeholder="请输入成本中心" :trigger-on-focus="true"
                                                     :disabled="r_column(scope.row.status)"
                                                     @change.native = "costCenterChange(scope.row.itemIndex)"
                                                     @click.native="$event.target.select()"></el-autocomplete>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="成本中心（开票公司）"
                                    width="184"
                                    v-if="companyCode != headData.companyCode">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.invCostCenterCode" readonly
                                              :disabled="r_column(scope.row.status)"
                                              placeholder="请点击进行匹配"
                                              @focus="modelCostCenterMatch(scope.row.itemIndex)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="销售产品"
                                    width="226">
                                <template slot-scope="scope">
                                    <el-select class="" v-model="scope.row.productCode" size="small"
                                               filterable placeholder="请选择"
                                               :disabled="r_column(scope.row.status)"
                                               style="width:100px"
                                               @change="prdChange(scope.row.itemIndex)"
                                               @visible-change="inactiveColEdit">
                                        <el-option
                                                v-for="product in productData"
                                                :key="product.productCode"
                                                :label="product.productName_ZH"
                                                :value="product.productCode"
                                                :disabled = "product.status=='0'">
                                        </el-option>
                                    </el-select>
                                    <el-input size="small" type="text" v-model="scope.row.productDesc"
                                              :disabled="r_column(scope.row.status)"
                                              style="width:115px"
                                              placeholder="产品描述"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="数量"
                                    width="70">
                                <template slot-scope="scope">
                                    <number-input size="small" type="text" v-model="scope.row.qty"
                                                  :disabled="r_column(scope.row.status)"
                                                  @focus="inactiveColEdit"
                                                  validType="decimal"></number-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="单价"
                                    width="87">
                                <template slot-scope="scope">
                                    <number-input size="small" type="text" v-model="scope.row.price"
                                                  :disabled="r_column(scope.row.status)"
                                                  placeholder="请输入"
                                                  style="width:80px" @focus="inactiveColEdit"
                                                  validType="decimal"></number-input>
                                </template>
                            </el-table-column>

                            <el-table-column
                                    align="center"
                                    label="价格种类"
                                    width="97">
                                <template slot-scope="scope">
                                    <el-select class="" v-model="scope.row.priceUnitCode" size="small"
                                               filterable placeholder="请选择"
                                               :disabled="r_column(scope.row.status)"
                                               style="width:90px" @visible-change="inactiveColEdit">
                                        <el-option
                                                v-for="priceUnit in scope.row.priceUnitOption"
                                                :key="priceUnit.priceUnitCode"
                                                :label="priceUnit.priceUnitName_ZH"
                                                :value="priceUnit.priceUnitCode">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="税率"
                                    width="106">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.taxCode" size="small"
                                               filterable placeholder="请选择"
                                               :disabled="r_column(scope.row.status)"
                                               style="width:99px" @visible-change="inactiveColEdit">
                                        <el-option
                                                v-for="tax in taxData"
                                                :key="tax.taxCode"
                                                :label="tax.taxName"
                                                :value="tax.taxCode">
                                            <span style="float: right; color: #8492a6; font-size: 13px">{{ tax.taxName }}</span>
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="有效期"
                                    width="218">
                                <template slot-scope="scope">
                                    <el-date-picker
                                            class="customer-width"
                                            v-model="scope.row.date_range"
                                            :disabled="r_column(scope.row.status)"
                                            type="daterange"
                                            placeholder="选择日期范围"
                                            size="small"
                                            style="width:210px"
                                            :picker-options="pickerOptions0"
                                            :editable="false"
                                            range-separator="至"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期"
                                            @focus="inactiveColEdit">
                                    </el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    prop="remark"
                                    label="备注信息"
                                    width="146">
                                <template slot-scope="scope">
                                    <el-input size="small" type="text" v-model="scope.row.remark"
                                              :disabled="r_column(scope.row.status)"
                                              placeholder="请输入" @focus="activeColEdit"
                                              @change="colEdit('remark', scope.row.itemIndex)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    fixed="right"
                                    label="操作"
                                    v-if="!mode || mode == '1' || mode == '2'"
                                    width="68">
                                <template slot-scope="scope">
                                    <el-button type="danger" size="small"
                                               v-if="scope.row.status == '1' "
                                               :disabled = "headData.status == '9' || scope.row.status == '9'"
                                               @click="handleDel(scope.row.itemIndex)">删除</el-button>
                                    <el-button type="danger" size="small"
                                               v-if="scope.row.status != '1' "
                                               :disabled = "headData.status == '9' || scope.row.status == '9'"
                                               @click="itemClose(scope.row.itemIndex)">终止</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
            </div>
        </transition>

        <el-dialog title="多公司成本中心匹配"
                   :visible.sync="dialogCostCenterMatch"
                   width="940px"
                    >
            <p><el-button size="small" type="primary" icon="el-icon-plus" @click="updateCostCenterMatch">确认更新</el-button></p>
            <el-table :data="costCenterMatchData"
                      border
            size="mini">
                <el-table-column label="合同公司" width="150" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.srvCompanyCode" :readonly="true" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="合同公司成本中心" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.srvCostCenterCode" :readonly="true" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="开票公司" width="150" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.invCompanyCode" :readonly="true" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="开票公司成本中心" align="center">
                    <template slot-scope="scope">
                        <el-autocomplete class="inline-input" size="small" v-model="scope.row.invCostCenterCode"
                                         :fetch-suggestions="querySearchInvCostCenter"
                                         placeholder="请输入成本中心"
                                         :trigger-on-focus="true"
                                         style="width:290px"
                                         @change.native = "invCostCenterChange(scope.$index)"
                                         @click.native="$event.target.select()">
                        </el-autocomplete>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog
                :title="titleExpiryDate"
                :visible.sync="dialogExpiryDate"
                size="tiny"
                width="330px">
            <el-form :model="formExpiryDate">
                <el-form-item label="终止日期">
                    <el-date-picker
                            v-model="formExpiryDate.expiryDate"
                            type="date"
                            placeholder="请选择终止日期"
                            size="small"
                            :picker-options="pickerOptionsExpiryDate"
                            :editable="false"
                            :default-value="formExpiryDate.defaultDate">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogExpiryDate = false">取 消</el-button>
                <el-button type="primary" @click="doClose">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog
                :title="titleEndDate"
                :visible.sync="dialogEndDate"
                size="tiny"
                width="330px">
            <el-form :model="formEndDate">
                <el-form-item label="结束日期">
                    <el-date-picker
                            v-model="formEndDate.endDate"
                            type="date"
                            placeholder="请选择结束日期"
                            size="small"
                            :picker-options="pickerOptionsEndDate"
                            :editable="false"
                            :default-value="formEndDate.defaultDate">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEndDate = false">取 消</el-button>
                <el-button type="primary"
                           @click="doSetEndDate"
                           :disabled="r_endDate">确 定</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import CodeInput from '../../components/CodeInput.vue';
    import AutoCompleteInput from '../../components/AutoCompleteInput.vue';
    import NumberInput from '../../components/NumberInput.vue';
    import salesOrder from '../../../static/SalesOrder.json';
    import salesOrderItem from '../../../static/SalesOrderItem.json';

    import {
        GetCompanyInAuth,
        GetCompany,
        getCustom,
        getCurr,
        getPayment,
        getCostCenter,
        getTax,
        getProduct,
        getPriceUnit,
        getStatus,
        createSO,
        editSO,
        checkContract,
        getSO,
        CostCenterMatch,
        SearchCostCenterMatch,
        checkSupplier,
        GetSalesInvoiceMaxDate,
        GetSalesPeriodMaxDate
    } from '../../api/api';

    import {
        getRowFromArray,
        arraySearch,
        createFilter,
        chGMT,
        toGMT,
        deepCopy,
        isObjectValueEqual,
        isNullOrWhiteSpace,
        getDateDiff
    } from '../../assets/js/common';

    export default {
        components: {
//            'base-input': BaseInput,
            'codeInput': CodeInput,
            'autoCompleteInput': AutoCompleteInput,
            'numberInput': NumberInput
        },
        data() {
            let that = this;
            return {
                //fullHeight: document.documentElement.clientHeight-260,  // 获取ITEM高度
                fullHeight: document.documentElement.clientHeight || document.body.clientHeight - 260,
                mode: "",                             // '':新建 '0':显示 '1':修改
                headGuid: "",                         // 显示、修改模式中传入的so head guid
                mastDataDealCount: 0,                 // 来自ERP的各主数据的处理完成计数器
                headObj: "",                          // 表头对象
                colEditFlag: false,                   // 列编辑可用标志
                addRowFlag: false,                    // 新增项次标志
                autoAddRowFlag: false,                // 自动加行标志
                companyCode_backup: '',               // 开票公司备份
                customCode_backup: '',                // 客户备份
                company_cancel: false,                // 开票公司弹窗cancel操作标志
                companyCode: '',                      // 最顶部的开票公司
                user: '',
                dspModeHead: '',                      // 显示或编辑画面自动带出动作FLAG
                // 画面控制
                viewCtrl: {
                    v_loading: false,                 // 整个画面loading
                    v_loadingItem: false,             // item项的loading
                    v_loadingHead: false,             // head画面的loading
                    v_loadingCreat: false,            // 新建按钮的loading
                    v_btn: false,                     // 新建/保存按钮显示控制
                    v_head: false,                    // Head部分的显示控制
                    r_selCompany: false,              // 顶部公司SELECT只读控制
                    r_tray: true,                     // 折叠控件的按钮只读控制
                    r_head: false,                    // Head部分的只读控制
                    r_head_except: false,             // Head部分的只读控制（除外部分）
                    r_item: false,                    // Item部分的只读控制
                    r_col: true,                      // 列编辑开关的只读控制
                    v_iconShow: false,                // Item部分合同号显示ICON控制
                    r_toolbar: false,                 // 工具栏只读控制
                    r_received: false,                // 收到合同
                },
                companyAuthData: [],                  // 个人权限对应的公司列表
                companyData: [],                      // 开票公司主数据
                customData: [],                       // 客户主数据
                costCenterData: [],                   // 成本中心主数据
                invCostCenterData: [],                // 开票公司成本中心主数据
                currData: [],                         // 币别主数据
                paymentData: [],                      // 付款方式主数据
                productData: [],                      // 产品主数据
                priceUnitData: [],                    // 价格种类主数据
                priceUnitOrgData: [],                 // 价格种类主数据（未过滤）
                statusData: [],                       // SO状态主数据
                taxData: [],                          // 税主数据
                currentCustomCode: "",                // 当前选中的客户信息
                headData: {},                         // 表头Data
                headDataBackup: {},                   // 表头Data备份
                costCenterOptions: [],                // 成本中心下拉框值
                invCostCenterOptions: [],             // 开票公司成本中心下拉框值
                headRules: {
                    companyCode: [{required: true, message: ' ', trigger: 'blur'}],
                    customCode: [{required: true, message: ' ', trigger: 'change'}],
                    contract: [{required: true, message: ' ', trigger: 'blur'}],
                    date_range: [{
                        type: 'array', required: true, message: ' ', trigger: 'blur'
                    }],
                    validDate: [{type: 'date', required: true, message: ' ', trigger: 'blur'}],
                    paymentCode: [{required: true, message: ' ', trigger: 'blur'}],
                },
                itemData: [],                         // 表身Data
                itemDataBackup: [],                   // 表身Data备份
                // 新增界面部分
                addFormVisible: false,                // 新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                pickerOptionsExpiryDate: {
                    disabledDate(time) {
                        return time.getTime() > new Date(that.formExpiryDate.endDate) ||
                            time.getTime() <= new Date(that.formExpiryDate.startDate).getTime();
                    }
                },
                pickerOptionsEndDate: {
                    disabledDate(time) {
                        return time.getTime() <= new Date(that.headObj.endDate);
                    }
                },
                pickerOptions0: {
                    disabledDate(time) {
                        // 生效日期必须小于等于有效日期范围
                        return time.getTime() > new Date(that.headData.endDate) ||
                            time.getTime() < new Date(that.headData.startDate).getTime();
                    }
                },
                pickerOptions2: {
                    disabledDate(time) {
                        if(that.mode == "2") {
                            return time.getTime() <= new Date(that.dateLimit);
                        }
                    },
                    shortcuts: [{
                        text: '未来一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '未来三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '未来半年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 180);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '未来一年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 365);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '未来两年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 730);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '未来三年',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 1095);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                dialogCostCenterMatch:false,
                dialogExpiryDate: false,
                dialogEndDate: false,
                form:[],
                costCenterMatchData:[],
                costCenterData2:[],
                costCenterOptions2:[],
                compAddr:[],
                companyAllData:[],
                thesupplierCode:'',
                companyCodeInput:'',
                comp:'',
                crossComp:false,
                selectCostCenter:'',
                autoHidden:false,
                titleExpiryDate: '',
                expiryDateMode: '',
                formExpiryDate: {
                    defaultDate: '',
                    expiryDate: '',
                    startDate: '',
                    endDate: '',
                    itemIndex: ''
                },
                titleEndDate: '',
                formEndDate: {
                    defaultDate: '',
                    endDate: '',
                },
                dateLimit: '',
                autoFocus: false,
                backBtn: false
            }
        },
        watch: {
            mastDataDealCount: function () {
                var count = 5;

                if(!isNullOrWhiteSpace(this.headData.companyCode) && this.companyCode != this.headData.companyCode)
                    count = 6;

                if (!isNullOrWhiteSpace(this.mode) && this.mastDataDealCount == count) {
                    this.setHead();
                    this.viewCtrl.v_head = true;
                }
            }
        },
        computed: {
            // 开票后不可编辑
            r_afterInvoice: function () {
                var flag = false;
                flag = (!isNullOrWhiteSpace(this.mode) && this.mode == "0") ||
                    (!isNullOrWhiteSpace(this.headData.status)) && this.headData.status != '1' ||
                    this.hasValidItem;
                return flag;
            },
            // 开票后不可编辑且不受行项有无影响
            r_afterInvoiceWithoutItemCheck: function () {
                var flag = false;
                flag = (!isNullOrWhiteSpace(this.mode) && this.mode == "0") ||
                    (!isNullOrWhiteSpace(this.headData.status)) && this.headData.status != '1';
                return flag;
            },
            // 一直可编辑
            r_alwaysEnable: function () {
                var flag = false;
                flag = (!isNullOrWhiteSpace(this.mode) && this.mode == "0") ||
                    (!isNullOrWhiteSpace(this.headData.status) && this.headData.status == '9');
                return flag;
            },
            // 收到合同专用
            r_receivedContract: function () {
                var flag = false;
                flag = (!isNullOrWhiteSpace(this.mode) && this.mode == "0") ||
                    (!isNullOrWhiteSpace(this.headData.status) && this.headData.status == '9') ||
                    this.viewCtrl.r_received;

                return flag;
            },
            // 结束日期设置确认按钮
            r_endDate: function () {
                var flag = true;
                if(!isNullOrWhiteSpace(this.formEndDate.endDate))
                    flag = false;
                return flag;
            },
            filterItemData() {
                return this.itemData.filter(item => item.status != "0")
            },
            hasDateRange: function () {
                var result = true;
                var dateRange = this.headData.date_range;

                if (dateRange != null && typeof(dateRange) != "undefined" && dateRange.length == 2 && dateRange[0] != null) {
                    result = false;
                }
                return result;
            },
            formatDate_range: function () {
                var sdate;
                var edate;

                sdate = this.formatDate(this.headData.date_range[0]);
                edate = this.formatDate(this.headData.date_range[1]);

                // 开始结束日期设定
                this.headData.startDate = this.headData.date_range[0];
                this.headData.endDate = this.headData.date_range[1];

                return sdate + " / " + edate;
            },
            showItemFlag: function () {
                // 当Head中的必输项都有值时，显示Item项目
                if (this.headData.companyCode && this.headData.customCode && this.headData.contract
                    && this.headData.date_range && this.headData.validDate && this.headData.paymentCode && this.headData.contract_chk) {
                    if (this.itemData.length == 0) {
                        // 计算属性在Event之前被执行，如果客户最后一个被选择时会导致客户信息为空，此时要先取得客户信息
                        if (this.currentCustomCode == "") {
                            this.currentCustomCode = arraySearch(this.headData.customCode, this.customData);
                        }
                        // 为Item项添加一行
                        if(this.autoAddRowFlag) {
//                            this.addRow();
                            this.autoAddRowFlag = false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            },
            companyTitle: function () {
                var array = arraySearch(this.headData.companyCode, this.companyAllData, "companyCode");
                return array[0].companyCode + " / " + array[0].companyName_ZH;
            },
            customerTitle: function () {
                var array = arraySearch(this.headData.customCode, this.customData, "customCode");
                if(typeof(array) == "undefined" || array.length == 0) {
                    return null;
                }
                return isNullOrWhiteSpace(array[0].cmpCode) ? array[0].customCode: array[0].cmpCode + " / " + array[0].customName_ZH;

            },
            hasValidItem: function() {
                var validItems = this.itemData.filter(item => item.status != "0")

                if(validItems.length > 0)
                    return true;
                else {
                    return false;
                }
            }
        },
        methods: {
            showHead() {
                this.newCompany();
                // 新建按钮loading中
                this.viewCtrl.v_loadingCreat = true;
            },
            headViewCtrl() {
                /* 画面显示控制 */
                this.viewCtrl.v_btn = true;
                this.viewCtrl.v_head = true;
                this.viewCtrl.r_tray = false;

                this.viewCtrl.r_selCompany = true; //这句用在控件的disabled属性会报错的

                this.viewCtrl.v_loadingCreat = false;
                this.initHead();
                // 预设head中的开票公司默认值
                this.headData.companyCode = this.companyCode;
                this.reload();
                // 取得当前开票公司的Object
                var compObj = arraySearch(this.headData.companyCode, this.companyData, "companyCode")[0];
                // 根据当前公司取得各主数据
                this.getMastData(compObj);
            },
            initHead() {
                this.headData = {
                    companyCode: '',
                    companyName: '',
                    signCount: '0',
                    received: false,
                    crossCompInv: true, // 因OR、OP用Super Order做，故不同公司默认为开票且不可修改
                    customCode: '',
                    contract: '',
                    contract_chk: false,
                    date_range: '',
                    startDate: '',
                    endDate: '',
                    deadline: '31',
                    validDate: '',
                    currCode: 'CNY',
                    paymentCode: '',
                    remark: ''
                }
            },
            setHead() {
                var dateRange = new Array();
                var headObj = this.headObj;
                // 有效期开始
                var sdate = headObj.startDate;
                // 有效期结束
                var edate = headObj.endDate;

                var days = getDateDiff(sdate, edate);

                if(this.mode == "2") {
                    var myDate = new Date(edate);
                    this.dateLimit = edate;
                    myDate.add("d", 1);
                    sdate = myDate.format('yyyy/MM/dd');
                    myDate.add("d", days);
                    edate = myDate.format('yyyy/MM/dd');
                }

                // 设置起始时间
                dateRange.push(toGMT(sdate));
                // 设置结束时间
                dateRange.push(toGMT(edate));

                // 顶部公司
                this.companyCode = headObj.ownerCompanyCode;

                if(headObj.received) {
                    this.viewCtrl.r_received = true;
                }

                this.headData = {
                    headGuid: this.mode != "2" ? headObj.headGuid : "",
                    version: this.mode != "2" ? headObj.version : "",
                    ownerCompanyCode: headObj.ownerCompanyCode,
                    companyCode: headObj.companyCode,
                    companyName: headObj.companyName_ZH,
                    signCount: this.mode != "2" ? headObj.signCount : headObj.signCount + 1,
                    received: headObj.received,
                    crossCompInv: headObj.crossCompInv == "1" ? true : false,
                    customCode: headObj.customCode,
                    contract: this.mode != "2" ? headObj.contract : "",
                    contract_chk: true,
                    date_range: dateRange,
                    startDate: headObj.startDate,
                    endDate: headObj.endDate,
                    deadline: headObj.deadline,
                    validDate: this.mode != "2" ? headObj.validDate : sdate,
                    currCode: headObj.currCode,
                    paymentCode: headObj.paymentCode,
                    remark: headObj.remark,
                    createDate: headObj.createDate,
                    userGuid: headObj.userGuid,
                    userID: headObj.userID,
                    expiryDate: headObj.expiryDate,
                    status: this.mode != 2 ? headObj.status: "1",
                };

                // 表头数据备份
                this.headDataBackup = deepCopy(this.headData);
                this.headDataBackup.startDate = this.formatDate(this.headDataBackup.startDate);
                this.headDataBackup.endDate = this.formatDate(this.headDataBackup.endDate);
                this.dspModeHead = "1";

                var item = "";
                this.itemData = [];
                this.itemDataBackup = [];

                days = days + 1;

                for (var i = 0; i < headObj.items.length; i++) {
                    item = headObj.items[i];
                    dateRange = new Array();
                    // 有效期开始
                    sdate = item.startDate;
                    // 有效期结束
                    edate = item.endDate;

                    if(this.mode == "2") {
                        myDate = new Date(sdate);
                        myDate.add("d", days);
                        sdate = myDate.format('yyyy/MM/dd');
                        myDate = new Date(edate);
                        myDate.add("d", days);
                        edate = myDate.format('yyyy/MM/dd');
                    }

                    // 设置起始时间
                    dateRange.push(toGMT(sdate));
                    // 设置结束时间
                    dateRange.push(toGMT(edate));

                    var costCenter = arraySearch(item.costCenterCode, this.costCenterOptions, "value", "contain");
                    var costCenterOption = arraySearch(item.costCenterCode, this.costCenterData, "costCenterCode");
                    var invCostCenter = isNullOrWhiteSpace(item.invoiceCostCenterCode) ? "" :
                        arraySearch(item.invoiceCostCenterCode, this.invCostCenterOptions, "value", "contain")[0].value;
                    var prdInfo = arraySearch(item.productCode, this.productData, "productCode");
                    var prdType = prdInfo[0].productType;
                    var priceUnitOption = new Array();
                    priceUnitOption = this.getPriceUnitOption(prdType);

                    // 判断餐次行的起始日期是否小于当前日期 Angel Jiang
                    let lineStatus=(prdType==="SalesMeals" && ((toGMT(sdate))-(toGMT(new Date())))<0);

                    this.itemData.push({
                        itemIndex: i,            // scope.$index并非真正的数据源Index，所以在此设置数据源Index
                        itemGuid: this.mode != "2" ? item.itemGuid : "",
                        headGuid: this.mode != "2" ? item.headGuid : "",
                        itemNo: this.mode != "2" ? item.itemNo : "",
                        version: this.mode != "2" ? item.version : "",
                        contract: this.mode != "2" ? item.contract : "",
                        contract_chk: true,
                        costCenterCode: costCenter[0]?costCenter[0].value:item.costCenterCode,
                        costCenterData: costCenterOption,
                        invCostCenterCode: invCostCenter,
                        productCode: item.productCode,
                        productDesc: item.productDesc,
                        qty: item.qty + '',                     // 转成stringc
                        price: item.price + '',                 // 转成string
                        priceUnitCode: item.priceUnitCode,
                        priceUnitOption: priceUnitOption,
                        taxCode: item.taxCode,
                        date_range: dateRange,
                        remark: item.remark,
                        createDate: item.createDate,
                        userGuid: item.userGuid,
                        userID: item.userID,
                        expiryDate: item.expiryDate,
                        status: this.mode != "2" ? (lineStatus ? "3":item.status): "1",   // Angel Jiang
                        gladisID: item.gladisID
                    });

                    this.itemDataBackup.push({
                        itemIndex: i,
                        itemGuid: this.mode != "2" ? item.itemGuid : "",
                        headGuid: this.mode != "2" ? item.headGuid : "",
                        itemNo: this.mode != "2" ? item.itemNo : "",
                        version: this.mode != "2" ? item.version : "",
                        contract: item.contract,
                        contract_chk: true,
                        costCenterCode: costCenter[0]?costCenter[0].value:item.costCenterCode,
                        costCenterData: costCenterOption,
                        invCostCenterCode: invCostCenter,
                        productCode: item.productCode,
                        productDesc: item.productDesc,
                        qty: item.qty + '',                     // 转成stringc
                        price: item.price + '',                 // 转成string
                        priceUnitCode: item.priceUnitCode,
                        priceUnitOption: priceUnitOption,
                        taxCode: item.taxCode,
                        date_range: dateRange,
                        remark: item.remark,
                        createDate: item.createDate,
                        userGuid: item.userGuid,
                        userID: item.userID,
                        expiryDate: item.expiryDate,
                        status: this.mode != "2" ? (lineStatus ? "3":item.status) : "1", // Angel Jiang
                        gladisID: item.gladisID
                    })
                }

                if (this.mode == "0") {
                    this.viewCtrl.r_head = true;           // head置灰
                    this.viewCtrl.r_toolbar = true;        // 工具栏置灰
                    this.viewCtrl.r_item = true;           // item置灰
                    this.viewCtrl.r_head_except = true;    // 除外部分置灰
                } else if (this.mode == "1") {
                    // 如果Head状态为已开票时，只能修改备注信息
                    if(this.headData.status == "2") {
                        this.viewCtrl.r_head = true;
                    } else {
                        for (var index in this.itemData) {
                            if (this.itemData[index].status == "2") {
                                this.viewCtrl.r_head = true;
                                break;
                            }
                        }
                    }
                }
                this.viewCtrl.v_head = false;
                this.viewCtrl.v_loading = false;

                if(this.mode == "2") {
                    this.$notify.info({
                        title: '操作提示',
                        message: '请先维护合同号'
                    });
                    this.autoFocus = true;
                } else if(this.mode == "3") {
                    this.$notify.info({
                        title: '操作提示',
                        message: '请点击【调整结束日期】按钮进行设置'
                    });
                }
            },
            formatDate(date) {
                return chGMT(date, 'yyyy-MM-dd');
            },
            dateRangeChange() {
                var dateRange = this.headData.date_range;
                if(typeof(dateRange) == "undefined" || dateRange.length != 2 || dateRange == null) {
                    this.headData.validDate = "";
                    return;
                }
                var startDate = this.formatDate(dateRange[0]);
                var endDate = this.formatDate(dateRange[1]);
                var dr_temp = [];

                // 当为续签的情况时
                if(this.mode == "2") {
                    for(var i = 0; i < this.itemData.length; i++) {
                        dr_temp = [];

                        if(this.itemData[i].date_range[0] < dateRange[0])
                            dr_temp.push(dateRange[0]);
                        else {
                            dr_temp.push(this.itemData[i].date_range[0]);
                        }
                        if(this.itemData[i].date_range[1] > dateRange[1])
                            dr_temp.push(dateRange[1]);
                        else {
                            dr_temp.push(this.itemData[i].date_range[1]);
                        }

                        this.itemData[i].date_range = dr_temp;
                    }
                }

                // 取得CostCenterData
                if(typeof(this.costCenterData) == "undefined" || this.costCenterData.length == 0) {
                    this.getCostCenter(this.companyCode, startDate, endDate);
                }
                // 生效日期为空时，
                if(isNullOrWhiteSpace(this.headData.validDate)) {
                    this.headData.validDate = startDate;
                }
                else {
                    if (this.hasDateRange) {
                        this.headData.validDate = "";
                    } else if (this.headData.validDate < startDate || this.headData.validDate > endDate) {
                        this.$confirm('生效日期超出范围，是否要调整为有效开始日期？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.headData.validDate = startDate;
                            return;
                        })
                        this.headData.validDate = "";
                    }
                }
            },
            // TODO 更改客户时 [写法需改进]
            custChange() {
                if (this.customCode_backup == "") {
                    if (this.headData.customCode != "") {
                        // 备份当前客户
                        this.customerCode_backup = this.headData.customCode;
                        this.currentCustomCode = arraySearch(this.headData.customCode, this.customData, "customCode");

                        // 设置当前客户的默认币别和付款方式
                        if (typeof(this.currentCustomCode) != "" && this.currentCustomCode.length == 1) {
                            if (this.dspModeHead != "1") {
                                this.headData.currCode = this.currentCustomCode[0].currCode;
                                this.headData.paymentCode = this.currentCustomCode[0].paymentCode;
                            } else {
                                this.dspModeHead = "";
                            }
                        }
                    }
                    return;
                }
                // 备份当前客户
                this.customCode_backup = this.headData.customCode;
                this.currentCustomCode = arraySearch(this.headData.customCode, this.customData, "customCode");

                // 设置当前客户的默认币别和付款方式
                if (typeof(this.currentCustomCode) != "" && this.currentCustomCode.length == 1) {
                    this.headData.currCode = this.currentCustomCode[0].currCode;
                    this.headData.paymentCode = this.currentCustomCode[0].paymentCode;

                    this.$notify.info({
                        title: '提示',
                        duration: 3000,
                        message: '已更新默认【币别】和【付款方式】'
                    });
                }
            },
            prdChange(index) {
                if (this.addRowFlag) {
                    return;
                }
                var productCode = this.itemData[index].productCode;
                var prdInfo = arraySearch(productCode, this.productData, "productCode");
                var prdType = "";
                var wkArray = [];
                var wkPriceUnit = "";

                this.itemData[index].productDesc = prdInfo[0].productName_ZH;

                if (typeof(prdInfo) != "" && prdInfo.length == 1) {
                    // 取得对应的Product TYPE
                    prdType = prdInfo[0].productType;

                    // 根据Product Type取得可用的Price Unit待选项
                    this.itemData[index].priceUnitOption = this.getPriceUnitOption(prdType);

                    // 当前行的价格单位
                    wkPriceUnit = this.itemData[index].priceUnitCode;

                    // 当价格单位不为空时
                    if (wkPriceUnit != null && wkPriceUnit != "") {
                        // 检查过滤后的OPTION选项中是否包含当前的价格单位
                        wkArray = arraySearch(wkPriceUnit, this.itemData[index].priceUnitOption, "priceUnitCode");
                        // 若不包含时做清空处理
                        if (wkArray.length == 0) {
                            this.itemData[index].priceUnitCode = "";
                        }
                    }
                }
                if (this.itemData[index].priceUnitCode == "" || this.itemData[index].priceUnitCode == "0") {
                    this.itemData[index].priceUnitCode = this.itemData[index].priceUnitOption[0].priceUnitCode;
                }
            },
            // 根据Product Type取得可用的Price Unit待选项
            getPriceUnitOption(prdType) {
                return arraySearch(prdType, this.priceUnitOrgData, "productType", "contain");
            },
            handleAdd: function () {
                // 行新增前检查正确性
                if (!this.headData.contract_chk || !this.checkInput(true)) {
                    return;
                }

                this.addRowFlag = true;
                this.addRow();
                if(this.viewCtrl.v_head) {
                    this.viewCtrl.v_head = false;
                    this.autoHidden = true;
                }
//                // 计算属性在EVENT之前执行，所以第一行必然是由计算属性新增，避免出现一次新增两行的情况
//                if (this.itemData.length > 0) {
//
//                }
            },
            handleDel: function (index) {
                this.$confirm('确定要删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var message = "";
                    // 如果itemGuid存在的话设置把状态设置为删除
                    if (typeof(this.itemData[index].itemGuid) != "undefined" && this.itemData[index].itemGuid != "") {
                        this.itemData[index].status = '0';
                        message = "已设置成待删除！";
                    } else {
                        //反之则直接删除该行对象
                        this.itemData.splice(index, 1);
                        message = "行项删除成功！";
                        // 重新排序行项Index
                        for(var i=0;i<this.itemData.length;i++){
                            this.itemData[i].itemIndex = i;
                        }
                    }
                    this.$message({
                        type: 'success',
                        message: message
                    })
                    // 当Item中没有无效行时自动展开Head部分
                    if(!this.hasValidItem) {
                        this.viewCtrl.v_head = true;
                    }
                })
            },
            handleItemClose: function (index) {
                this.$confirm('确定要终止该行项吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 如果itemGuid存在的话设置把状态设置为终止
                    if (typeof(this.itemData[index].itemGuid) != "undefined" && this.itemData[index].itemGuid != "") {
                        this.itemData[index].status = '9';
                        this.itemData[index].expiryDate = this.formExpiryDate.expiryDate;
                    }
                    this.$message({
                        type: 'success',
                        message: '已设置成待终止！'
                    })
                })
            },
            // 执行保存或修改
            handleSave: function () {
                this.doSave();
            },
            // 执行终止
            handleClose: function () {
                this.doSave("1");
            },
            // 保存订单方法
            doSave: function (closeFlag) {
                var message = "";

                if (!closeFlag) {
                    if (!this.headData.contract_chk) {
                        var message = "";

                        if (this.headData.contract == "" || this.headData.contract == null) {
                            message = "请填写【合同号】";
                        } else {
                            message = "表头【合同号】：" + this.headData.contract + "已存在";
                        }
                        this.$message({
                            type: 'error',
                            message: message,
                            duration: 5000
                        });
                        return;
                    }

                    if (!this.checkInput(false)) {
                        return;
                    }
                }

                if (!closeFlag) {
                    message = '确定提交吗？'
                } else {
                    message = '终止后不可恢复，确定要终止合同吗？'
                }

                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if(closeFlag) {
                        // 状态
                        this.headData.status = "9";
                        // 终止日期
                        this.headData.expiryDate = this.formatDate(this.formExpiryDate.expiryDate);
                    }

                    this.viewCtrl.v_loading = true;

                    setTimeout(() => {
                        if (isNullOrWhiteSpace(this.mode) || this.mode == "2") {
                            // 建立SO
                            this.createSO();
                        } else {
                            // 修改SO
                            this.editSO();
                        }
                    }, 500);
                }).catch(()=>{});
            },
            // 检查合同号是否存在
            checkExist(contract, line){
                // 为空时不检查
                if (contract == null || contract == "") {
                    return;
                }
                // 编辑时如果内容没有修不检查
                if (this.mode == '1' && contract == this.headDataBackup.contract) {
                    return;
                }
                checkContract(contract).then(data => {
                    if (data) {
                        if (data.code === '200') {
                            if (!data.content) {
                                var msg = "";

                                if (line == null) {
                                    msg = "表头【合同号】：" + this.headData.contract + "已存在";
                                    this.headData.contract_chk = false;
                                } else {
                                    msg = "行项" + line + "的【合同号】：" + this.headData.contract + "已存在"
                                    this.itemData[line].contract_chk = false;
                                }
                                this.$message({
                                    type: 'error',
                                    message: msg,
                                    duration: 5000
                                })
                            } else {
                                if (line == null) {
                                    this.headData.contract_chk = true;
                                    // 当为续签模式时
                                    if(this.mode == "2") {
                                        this.$confirm('是否将该合同号设置为行项的默认合同号？', '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                        }).then(() => {
                                            for(var i = 0; i < this.itemData.length; i++) {
                                                this.itemData[i].contract = contract;
                                            }
                                        }).catch(() => {
                                        })
                                    }

                                } else {
                                    this.itemData[line].contract_chk = true;
                                }
                            }
                        }
                    }
                })
            },
            changeColEdit() {
                if (!this.colEditFlag) {
                    this.$notify({
                        title: '注意',
                        message: '列编辑模式打开中，可对行项中的【合同】和【备注】栏进行列编辑',
                        type: 'warning',
                        duration: 5000
                    });
                }
            },

            load(){
                // 取得传入参数
                // '1':编辑 '0':显示
                this.mode = this.$route.query.mode;

                // 取得是否显示返回按钮
                this.backBtn = this.$route.query.backBtn;

                // 取得登录用户信息
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }

                // 取得开票公司主数据
                this.getCompany(this.setHeadViewCtrl);
            },
            setHeadViewCtrl() {
                // 取得本地主数据
                this.getMastDataLocal();

                // SO Guid
                this.headGuid = this.$route.query.headGuid;

                this.comp=this.$route.query.comp;

                if (typeof(this.headGuid) != "undefined") {
                    // 设置开票公司选择只读
                    this.viewCtrl.r_selCompany = true;
                    // 折叠按钮只读
                    this.viewCtrl.r_tray = false;

                    var _this = this;
                    // 根据Head Guid取得合同SO
                    getSO(this.headGuid).then(data => {
                        if (data && data.code == "200") {
                            this.headObj = data.content;
                            // 取得当前Head 开票公司的Object
                            var ownerCompObj = arraySearch(this.headObj.ownerCompanyCode, this.companyAllData, "companyCode")[0];
                            // 取得当前开票公司的Object
                            var compObj = arraySearch(this.headObj.companyCode, this.companyAllData, "companyCode")[0];
                            // 根据当前公司取得各主数据
                            this.getMastData(compObj);
                            // 取得成本中心主数据
                            this.getCostCenter(this.headObj.ownerCompanyCode, this.headObj.startDate,this.headObj.endDate);
                            // 如果服务公司和开票公司不同时取得开票公司的CostCenter集合
                            if(this.headObj.ownerCompanyCode != this.headObj.companyCode) {
                                this.getInvCostCenter(this.headObj.companyCode);
                            }
                            var erpCode='';
                            var ip='';
                            for(let line of this.companyAllData){
                                if(line.companyCode===this.headObj.companyCode){
                                    erpCode=line.dbName;
                                    ip=line.ip;
                                }
                            }
                            this.GetERPCompany(erpCode);
                            // 显示保存按钮
                            this.viewCtrl.v_btn = true;

                            if(this.comp.indexOf(compObj.companyCode)>-1){
                                this.crossComp=false;
                            }
                            else if(this.comp.indexOf(compObj.companyCode)==-1){
                                this.crossComp=true;
                            }
                        } else {
                            this.$message({
                                type: 'error',
                                message: '订单获取失败'
                            });
                            this.viewCtrl.v_loading = false;
                            this.$router.push({path: '/query/'});

                        }
                    });
                } else {
                    this.autoAddRowFlag = true;
                    // 关闭loading...
                    this.viewCtrl.v_loading = false;
                }
            },
            // 新建SO方法
            createSO() {
                var so = salesOrder;
                var itemTemplate;
                var item;
                var items = [];
                var row = "";
                var obj = "";
                var startDateBak = "";
                var endDateBak = ""

                /* 设置Head信息 */
                // 合同号
                so.contract = this.headData.contract;
                // 版本
                so.version = "1";
                // 收到合同标志
                so.received = this.headData.received;
                // 续签次数
                so.signCount = this.headData.signCount;
                // 主公司代码
                so.ownerCompanyCode = this.companyCode;

                obj = getRowFromArray(this.companyCode,this.companyData, "companyCode");
                // 主公司名称（中文）
                so.ownerCompanyName_ZH = obj.companyName_ZH;
                // 主公司名称（英文）
                so.ownerCompanyName_EN = obj.companyName_EN;

                // 开票公司代码
                so.companyCode = this.headData.companyCode;

                obj = getRowFromArray(this.headData.companyCode, this.companyData, "companyCode");
                // 开票公司名称（中文）
                so.companyName_ZH = obj.companyName_ZH;
                // 开票公司名称（英文）
                so.companyName_EN = obj.companyName_EN;
                // 客户代码
                so.customCode = this.headData.customCode;

                obj = getRowFromArray(this.headData.customCode, this.customData, "customCode");

                console.log(obj)
                // 客户代码（显示用）
                so.cmpCode = isNullOrWhiteSpace(obj.cmpCode) ? this.headData.customCode: obj.cmpCode;
                // 客户名称（中文）
                so.customName_ZH = typeof(obj.customName_ZH) == "undefined"?"":obj.customName_ZH;
                // 客户名称（英文）
                so.customName_EN = typeof(obj.customName_EN) == "undefined"?"":obj.customName_EN;
                // 币别代码
                so.currCode = this.headData.currCode;

                obj = getRowFromArray(this.headData.currCode, this.currData, "currCode");
                // 币别名称（中文）
                so.currName_ZH = obj.currName_ZH;
                // 币别名称（英文）
                so.currName_EN = obj.currName_EN;
                // 付款方式代码
                so.paymentCode = this.headData.paymentCode;

                obj = getRowFromArray(this.headData.paymentCode, this.paymentData, "paymentCode");
                // 付款方式（中文）
                so.paymentName_ZH = obj.paymentName_ZH;
                // 付款方式（英文）
                so.paymentName_EN = obj.paymentName_EN;
                // 终止日
                so.deadline = this.headData.deadline;
                // 有效日期【开始】
                so.startDate = this.formatDate(this.headData.startDate);
                // 有效日期【结束】
                so.endDate = this.formatDate(this.headData.endDate);
                // 生效日
                so.validDate = this.formatDate(this.headData.validDate);
                // 备注信息
                so.remark = this.headData.remark;
                // 用户Guid
                so.userGuid = this.user.userGuid;
                // 用户账号
                so.userID = this.user.account;
//                so.createData = "";
//                so.changeData = "";
                //公司间开票
                if(this.companyCode != this.headData.companyCode) {
                    so.crossCompInv = this.headData.crossCompInv ? "1" : "0";
                } else {
                    so.crossCompInv = "";
                }
                // 状态 1：新建
                so.status = "1";
                // 如果是续签模式的话设置rebuildHead
                if(this.mode == "2") {
                    so.rebuildGuid = this.headObj.headGuid;
                }

                /* 设置Item信息 */
                for (var i = 0; i < this.itemData.length; i++) {
                    // 项次参数对象
                    item = {
                        itemGuid: "",
                        headGuid: "",
                        itemNo: "",
                        version: "",
                        contract: "",
                        costCenter: "",
                        productCode: "",
                        productDesc: "",
                        qty: "",
                        price: "",
                        priceUnitCode: "",
                        taxCode: "",
                        taxRate: "",
                        startData: "",
                        endData: "",
                        remark: "",
                        changeDate: "",
                        expiryDate: "",
                        status: "",
                        changeFlag: ""
                    };
                    // 画面项次对象
                    row = this.itemData[i];
                    // 项次号
                    item.itemNo = "";
                    // 版本
                    item.version = "1";
                    // 合同号
                    item.contract = row.contract;
                    // 成本中心
                    item.costCenterCode = this.getCostCenterString(row.costCenterCode);
                    // 成本中心（开票公司）
                    if(this.companyCode != this.headData.companyCode) {
                        item.invoiceCostCenterCode = this.getCostCenterString(row.invCostCenterCode);
                    } else {
                        item.invoiceCostCenterCode = "";
                    }
                    // 产品代码
                    item.productCode = row.productCode;
                    // 产品说明
                    item.productDesc = row.productDesc;
                    // 数量
                    item.qty = row.qty;
                    // 价格
                    item.price = row.price;
                    // 价格单位
                    item.priceUnitCode = row.priceUnitCode;
                    // 税代码
                    item.taxCode = row.taxCode;
                    // 税率值
                    item.taxRate = arraySearch(row.taxCode, this.taxData, "taxCode")[0].taxValue;
                    // 有效日期【开始】
                    item.startDate = this.formatDate(row.date_range[0]);
                    // 有效日期【结束】
                    item.endDate = this.formatDate(row.date_range[1]);
                    // 备注信息
                    item.remark = row.remark;
                    // 创建日期
                    item.createDate = row.createDate;
                    // 建立用户GUID
                    item.userGuid = this.user.userGuid;
                    // 建立用户ID
                    item.userID = this.user.account;

                    items.push(item);
                }

                // 将项次信息追加至SO
                so.items = items;
                //console.log(so);
                createSO(so).then(res => {
                    if (res.code == "200") {
                        this.viewCtrl.v_loading = false;       // loading关闭
                        // 收到合同如果勾选的话置灰
                        if(this.headData.received) {
                            this.viewCtrl.r_received = true;
                        }

                        this.headGuid = res.content;

                        this.$message({
                            type: 'success',
                            message: '订单提交成功'
                        });

                        this.$router.push({path: '/query/edit',
                            query: {
                                mode: 1,
                                headGuid: res.content,
                                comp:this.companyCode,
                                backBtn: false
                            }});
                        this.load();

                    } else if (res.code == "500") {
                        this.$message({
                            type: 'danger',
                            message: '订单提交失败(' + res.message + ')'
                        })
                    }
                });
            },
            // 编辑SO方法
            editSO: function () {
                var so = salesOrder;
                var item;
                var items = [];
                var row = "";
                var wkItem = "";
                var obj = "";

                /* 设置Head信息 */
                so.headGuid = this.headData.headGuid;
                // 合同号
                so.contract = this.headData.contract;
                // 版本
                so.version = this.headDataBackup.version;
                // 收到合同标志
                so.received = this.headData.received;
                // 续签次数
                so.signCount = this.headData.signCount;
                // 主公司代码
                so.ownerCompanyCode = this.companyCode;

                obj = getRowFromArray(this.companyCode,this.companyData, "companyCode");
                // 主公司名称（中文）
                so.ownerCompanyName_ZH = obj.companyName_ZH;

                // 主公司名称（英文）
                so.ownerCompanyName_EN = obj.companyName_EN;

                // 开票公司代码
                so.companyCode = this.headData.companyCode;

                obj = getRowFromArray(this.headData.companyCode, this.companyData, "companyCode");
                // 开票公司名称（中文）
                so.companyName_ZH = obj.companyName_ZH;
                // 开票公司名称（英文）
                so.companyName_EN = obj.companyName_EN;
                // 客户代码
                so.customCode = this.headData.customCode;

                obj = getRowFromArray(this.headData.customCode, this.customData, "customCode");
                // 客户代码（显示用）
                so.cmpCode = isNullOrWhiteSpace(obj.cmpCode) ? this.headData.customCode: obj.cmpCode;
                // 客户名称（中文）
                so.customName_ZH = typeof(obj.customName_ZH) == "undefined"?"":obj.customName_ZH;
                // 客户名称（英文）
                so.customName_EN = typeof(obj.customName_EN) == "undefined"?"":obj.customName_EN;
                // 币别代码
                so.currCode = this.headData.currCode;

                obj = getRowFromArray(this.headData.currCode, this.currData, "currCode");
                // 币别名称（中文）
                so.currName_ZH = obj.currName_ZH;
                // 币别名称（英文）
                so.currName_EN = obj.currName_EN;
                // 付款方式代码
                so.paymentCode = this.headData.paymentCode;

                obj = getRowFromArray(this.headData.paymentCode, this.paymentData, "paymentCode");
                // 付款方式（中文）
                so.paymentName_ZH = obj.paymentName_ZH;
                // 付款方式（英文）
                so.paymentName_EN = obj.paymentName_EN;
                // 终止日
                so.deadline = this.headData.deadline;
                // 有效日期【开始】
                so.startDate = this.formatDate(this.headData.startDate);
                this.headData.startDate = so.startDate;
                // 有效日期【结束】
                so.endDate = this.formatDate(this.headData.endDate);
                this.headData.endDate = so.endDate;
                // 生效日
                so.validDate = this.formatDate(this.headData.validDate);
                // 备注信息
                so.remark = this.headData.remark;
                // 建立时间
                so.createDate = this.headData.createDate;
                // 用户Guid
                so.userGuid = this.headData.userGuid;
                // 用户账号
                so.userID = this.headData.userID;
                //公司间开票
                if(this.companyCode != this.headData.companyCode) {
                    so.crossCompInv = this.headData.crossCompInv ? "1" : "0";
                } else {
                    so.crossCompInv = "";
                }
                // 状态 1:新建 2:开票 0:删除
                so.status = this.headData.status;
                // 终止日期
                so.expiryDate = this.headData.expiryDate;
                // 修改标志
                so.changeFlag = "";

                if(this.headData.startDate != this.headDataBackup.startDate ||
                    this.headData.endDate != this.headDataBackup.endDate ||
                    !isObjectValueEqual(this.headData, this.headDataBackup)) {
                    so.changeFlag = "1";
                    // 修改用户Guid
                    so.changeUserGuid = this.user.userGuid;
                    // 修改用户ID
                    so.changeUserID = this.user.account;
                }
                so.rebuildGuid = this.headObj.rebuildGuid;
                so.gladisID = this.headObj.gladisID;

                /* 设置Item信息 */
                for (var i = 0; i < this.itemData.length; i++) {
                    // 项次参数对象
                    item = {
                        itemGuid: "",
                        headGuid: "",
                        itemNo: "",
                        version: "",
                        contract: "",
                        costCenter: "",
                        productCode: "",
                        productDesc: "",
                        qty: "",
                        price: "",
                        priceUnitCode: "",
                        taxCode: "",
                        taxRate: "",
                        startData: "",
                        endData: "",
                        remark: "",
                        createDate: "",
                        userGuid: "",
                        userID: "",
                        changeDate: "",
                        changeUserGuid: "",
                        changeUserID: "",
                        expiryDate: "",
                        status: "",
                        changeFlag: "",
                        gladisID: ""
                    };
                    // 画面项次对象
                    row = this.itemData[i];

                    // Item Guid
                    item.itemGuid = typeof(row.itemGuid) == "undefined" ? "" : row.itemGuid;
                    // Head Guid
                    item.headGuid = typeof(row.headGuid) == "undefined" ? "" : row.headGuid;
                    // Item Number
                    item.itemNo = row.itemNo;
                    // 版本
                    if (item.itemGuid != "") {
                        item.version = row.version;
                    } else {
                        item.version = "1";
                    }
                    // 合同号
                    item.contract = row.contract;
                    // 成本中心
                    item.costCenterCode = row.costCenterCode;
                    // 成本中心（开票公司）
                    if(this.companyCode != this.headData.companyCode) {
                        item.invoiceCostCenterCode = this.getCostCenterString(row.invCostCenterCode);
                    } else {
                        item.invoiceCostCenterCode = "";
                    }
                    // 产品代码
                    item.productCode = row.productCode;
                    // 产品说明
                    item.productDesc = row.productDesc;
                    // 数量
                    item.qty = row.qty;
                    // 价格
                    item.price = row.price;
                    // 价格单位
                    item.priceUnitCode = row.priceUnitCode;
                    // 税代码
                    item.taxCode = row.taxCode;
                    // 税率值
                    item.taxRate = arraySearch(row.taxCode, this.taxData, "taxCode")[0].taxValue;
                    // 有效日期【开始】
                    item.startDate = this.formatDate(row.date_range[0]);
                    // 有效日期【结束】
                    item.endDate = this.formatDate(row.date_range[1]);
                    // 备注信息
                    item.remark = row.remark;
                    // 建立日期
                    item.createDate = row.createDate;
                    // 建立用户Guid
                    item.userGuid = typeof(row.userGuid) == "undefined" ? this.user.userGuid : this.headData.userGuid;
                    // 建立用户ID
                    item.userID = typeof(row.userID) == "undefined" ? this.user.account : this.headData.userID;
                    // 终止日期
                    item.expiryDate = row.expiryDate;
                    // 状态
                    item.status = typeof(row.status) == "undefined" ? "1" : row.status;

                    if (item.itemGuid != "") {
                        wkItem = getRowFromArray(item.itemGuid, this.itemDataBackup, "itemGuid");

                        if (this.formatDate(row.date_range[0]) != this.formatDate(wkItem.date_range[0]) ||
                            this.formatDate(row.date_range[1]) != this.formatDate(wkItem.date_range[1]) ||
                            !isObjectValueEqual(row, wkItem)) {
                            item.changeFlag = "1";
                            // 修改用户Guid
                            item.changeUserGuid = this.user.userGuid;
                            // 修改用户ID
                            item.changeUserID = this.user.account;
                        }
                    }
                    // 成本中心格式化
                    item.costCenterCode = this.getCostCenterString(item.costCenterCode);
                    item.gladisID = row.gladisID;

                    items.push(item);
                }

                // 将项次信息追加至SO
                so.items = items;

                editSO(so).then(res => {
                    if (res.code == "200") {
                        this.viewCtrl.v_loading = false;         // loading关闭

                        if(this.headData.received) {
                            this.viewCtrl.r_received = true;
                        }
                        this.$message({
                            type: 'success',
                            message: '订单修改成功'
                        })
                        this.mastDataDealCount = 0;
//                        this.$router.push({path: '/query/edit',
//                            query: {mode: 1, headGuid: this.headGuid, comp:this.companyCode}});
                        this.load();
                    } else if (res.code == "500") {
                        this.$message({
                            type: 'danger',
                            message: '订单修改失败(' + res.message + ')'
                        });
                    }
                });
            },
            addRow() {
                // 检查Head合同号正确性
                if (!this.headData.contract_chk) {
                    this.$message({
                        type: 'error',
                        message: "表头【合同号】：" + this.headData.contract + "已存在",
                        duration: 5000
                    })
                    return;
                }
                var length = this.itemData.length;
                var custom = arraySearch(this.headData.customCode, this.customData, "customCode");

                if (length == 0) {
                    this.itemData.push({
                        itemIndex: this.itemData.length,
                        itemGuid: '',
                        headGuid: '',
                        itemNo: '',
                        version: '',
                        contract: this.headData.contract,
                        contract_chk: false,
                        costCenterCode: '',
                        costCenterData: this.costCenterData,
                        invCostCenterCode: '',
                        productCode: '',
                        productDesc: '',
                        qty: "1",
                        price: '',
                        priceUnitCode: '',
                        priceUnitOption: [],
                        taxCode: custom[0].taxCode,
                        date_range: this.headData.date_range,
                        remark: '',
                        expiryDate: '',
                        status: '1'
                    })
                } else if (length > 0) {
                    // 新增项次永远在末尾，所有复制行取当前行项最后一条非待删除记录
                    var row = this.itemData[this.itemData.length - 1];
                    var costCenterData = [];

                    if(!isNullOrWhiteSpace(row.costCenterCode)) {
                        costCenterData = arraySearch(row.costCenterCode,this.costCenterData,"costCenterCode");
                    } else {
                        costCenterData = this.costCenterData;
                    }

                    this.itemData.push({
                        itemIndex: this.itemData.length,
                        itemGuid: '',
                        headGuid: '',
                        itemNo: '',
                        version: '',
                        contract: row.contract,
                        contract_chk: false,
                        costCenterCode: row.costCenterCode,
                        costCenterData: costCenterData,
                        invCostCenterCode: row.invCostCenterCode,
                        productCode: '',
                        productDesc: '',
                        qty: "1",
                        price: '',
                        priceUnitCode: '',
                        priceUnitOption: [],
                        taxCode: row.taxCode,
                        date_range: row.date_range,
                        remark: '',
                        expiryDate: '',
                        status: '1'
                    })
                }
            },
            reload() {
                this.checkSupplier(this.reloadForm);
            },
            // 清空画面输入
            reloadForm() {
                var _headData = this.headData;
                var _this = this;

                // 判断是否为首次进入时
                if (this.companyCode_backup == "") {
                    // 如果是首次进入画面备份当前开票公司
                    this.companyCode_backup = this.companyCode;
                    return;
                }

                // 点击变更弹窗取消按钮时
                if (this.company_cancel) {
                    // 不做处理返回
                    this.company_cancel = false;
                    return;
                }

                this.$confirm('当前画面将被重置，确定吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.initHead();
                    this.itemData = [];

                    this.headData.contract = _headData.contract;
                    this.headData.contract_chk = _headData.contract_chk;
                    this.headData.signCount = _headData.signCount;
                    this.headData.received = _headData.received;
                    this.headData.companyCode = _headData.companyCode;
                    this.headData.ownerCompanyCode = _this.companyCode;

                    // 取得当前公司的Object
                    var compObj = arraySearch(this.headData.companyCode, this.companyData, "companyCode")[0];

                    // 根据当前公司取得各主数据
                    this.getMastData(compObj);

                    // 当选择公司和开票公司不同时，取得开票公司的CostCenter集合
                    if(this.companyCode != this.headData.companyCode) {
                        this.getInvCostCenter(this.headData.companyCode);
                    }
                }).catch(() => {
                    this.headData.companyCode = this.companyCode_backup;
                    this.company_cancel = true;
                })
            },
            // 检查服务公司的供应商代码在开票公司的供应商列表中是否存在
            checkSupplier(cb) {
                //
                if(this.companyCode == this.headData.companyCode) {
                    cb();
                    return;
                }
                var invCompanyInfo = arraySearch(this.headData.companyCode, this.companyAllData, "companyCode")[0];
                var srvCompanyInfo = arraySearch(this.companyCode, this.companyAllData, "companyCode")[0];
                var message = "";
                var jsonCheckInfo = {
                    dbName : invCompanyInfo.dbName,
                    ip : invCompanyInfo.ip,
                    supplierCode : srvCompanyInfo.supplierCode
                };

                checkSupplier(jsonCheckInfo).then(data => {
                    if (data && data.code == "200") {
                        if(data.content) {
                            this.company_cancel = false;
                            cb();
                        } else {
                            message = "【" + srvCompanyInfo.companyName_ZH + "】不是所选公司【"
                                + invCompanyInfo.companyName_ZH + "】的供应商";
                            this.$message({
                                type: "error" ,
                                message: message,
                                duration: 5000
                            })
                            this.headData.companyCode = this.companyCode_backup;
                            this.company_cancel = true;
                        }
                    } else {
                        message = "供应商检查失败！";
                        this.$message({
                            type: "error" ,
                            message: message,
                            duration: 5000
                        })
                        this.headData.companyCode = this.companyCode_backup;
                        this.company_cancel = true;
                    }
                });
            },
            // 检查输入正确性
            checkInput(addRowFlag) {
                // head部分
                var result = true;
                var message = "";
                if (!this.headData.contract || this.headData.contract == "") {
                    result = false;
                    message = '请填写【合同号】';
                }
                else if (!this.headData.companyCode || this.headData.companyCode == "") {
                    result = false;
                    message = '请选择【开票公司】';
                }
                else if (!this.headData.customCode || this.headData.customCode == "") {
                    result = false;
                    message = '请选择【客户】';
                } else if (!this.headData.currCode || this.headData.currCode == "") {
                    result = false;
                    message = '请选择【币别】';
                } else if (!this.headData.paymentCode || this.headData.paymentCode == "") {
                    result = false;
                    message = '请选择【付款方式】';
                } else if (!this.headData.date_range || this.headData.date_range[0] == null) {
                    result = false;
                    message = '请设置【有效日期】';
                } else if (!this.headData.validDate || this.headData.validDate == "") {
                    result = false;
                    message = '请设置【生效日期】';
                }

                if (!result) {
                    this.$message({
                        type: 'error',
                        message: message,
                        duration: 5000
                    })

                    return result;
                }

                // item部分
                if(!addRowFlag && !this.hasValidItem) {
                    this.$message({
                        type: 'error',
                        message: '请至少添加一个行项',
                        duration: 5000
                    })
                    return false;
                }

                var item = "";
                var strNumber = "";

                if (this.itemData.length == 0) {
                    result = true;
                } else {
                    for (var i = 0; i < this.itemData.length; i++) {
                        item = this.itemData[i];

                        strNumber = i + 1;

                        if (!item.contract) {
                            result = false;
                            message = "请填写行项目" + strNumber + "的【合同号】";
                        }
                        else if (!item.costCenterCode) {
                            result = false;
                            message = "请选择行项目" + strNumber + "的【成本中心】";
                        }
                        else if (!addRowFlag && this.companyCode != this.headData.companyCode &&
                            !item.invCostCenterCode) {
                            result = false;
                            message = "请选择行项目" + strNumber + "的【成本中心（开票公司）】"
                        }
                        else if (!item.productCode) {
                            result = false;
                            message = "请选择行项目" + strNumber + "的【销售产品】";
                        } else if (!item.price) {
                            result = false;
                            message = "请填写行项目" + strNumber + "的【单价】";
                        } else if (!item.priceUnitCode) {
                            result = false;
                            message = "请选择行项目" + strNumber + "的【价格种类】";
                        } else if (!item.taxCode) {
                            result = false;
                            message = "请填写行项目" + strNumber + "的【税率】";
                        } else if (!item.date_range || item.date_range[0] == null) {
                            result = false;
                            message = "请设置行项目" + strNumber + "的【有效期】";
                        }
                    }
                }
                if (!result) {
                    this.$message({
                        type: 'error',
                        message: message,
                        duration: 5000
                    })
                }

                return result;
            },
            activeColEdit() {
                this.viewCtrl.r_col = false;
            },
            inactiveColEdit() {
                this.addRowFlag = false;
                this.colEditFlag = false;
                this.viewCtrl.r_col = true;
            },
            // 列编辑方法
            colEdit(fieldName, index) {
                if (this.itemData.length < 2 || !this.colEditFlag) {
                    return;
                }

                var value = this.itemData[index][fieldName];
                var item = "";

                for (var i = 0; i < this.itemData.length; i++) {
                    if(this.itemData[i].status != "1")
                        continue;
                    this.itemData[i][fieldName] = value;
                }
            },
            newCompany(){
                this.compAddr=[];
                for(let line of this.companyAuthData){
                    if(line.companyCode===this.companyCode){
                        this.companyCodeInput = line.companyCode + ' / ' + line.companyName_ZH;
                    }
                }

                var the=arraySearch(this.companyCode,this.companyAuthData,"companyCode");

                this.thesupplierCode=the[0].supplierCode;

                if(this.thesupplierCode == null || this.thesupplierCode.length===0){
                    this.companyData=[];
                    for(let line of this.companyAllData){
                        if(line.companyCode===this.companyCode){
                            this.companyData.push({
                                companyGuid:line.companyGuid,
                                companyCode:line.companyCode,
                                companyName_ZH:line.companyName_ZH,
                                companyName_EN:line.companyName_EN,
                                ip:line.ip,
                                dbName:line.dbName,
                                interBranchOP:line.interBranchOP,
                                interBranchOR:line.interBranchOR,
                                interBranchAP:line.interBranchAP,
                                interBranchAR:line.interBranchAR,
                                interBranchCost:line.interBranchCost,
                                interBranchRevenue:line.interBranchRevenue,
                                interCompanyOP:line.interCompanyOP,
                                interCompanyOR:line.interCompanyOR,
                                interCompanyAP:line.interCompanyAP,
                                interCompanyAR:line.interCompanyAR,
                                interCompanyCost:line.interCompanyCost,
                                interCompanyRevenue:line.interCompanyRevenue,
                                companyGroup:line.companyGroup,
                                supplierCode:line.supplierCode,
                                customerCode:line.customerCode,
                                status:line.status
                            });
                        }
                    }

                    this.headViewCtrl();
                }
                else if(this.thesupplierCode.length>0){
                    var erpCode='';
                    var ip='';
                    for(let line of this.companyAllData){
                        if(line.companyCode===this.companyCode){
                            erpCode=line.dbName,
                                ip=line.ip
                        }
                    }
                    this.GetERPCompany(erpCode, this.headViewCtrl)
                }
            },

            GetERPCompany(erpCode, cb){
                GetCompany({
                    srvCompanyCode: erpCode
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.companyData=[];
                        for(let line of data.content){
                            this.companyData.push({
                                companyGuid:line.companyGuid,
                                companyCode:line.companyCode,
                                companyName_ZH:line.companyName_ZH,
                                companyName_EN:line.companyName_EN,
                                ip:line.ip,
                                dbName:line.dbName,
                                interBranchOP:line.interBranchOP,
                                interBranchOR:line.interBranchOR,
                                interBranchAP:line.interBranchAP,
                                interBranchAR:line.interBranchAR,
                                interBranchCost:line.interBranchCost,
                                interBranchRevenue:line.interBranchRevenue,
                                interCompanyOP:line.interCompanyOP,
                                interCompanyOR:line.interCompanyOR,
                                interCompanyAP:line.interCompanyAP,
                                interCompanyAR:line.interCompanyAR,
                                interCompanyCost:line.interCompanyCost,
                                interCompanyRevenue:line.interCompanyRevenue,
                                companyGroup:line.companyGroup,
                                supplierCode:line.supplierCode,
                                customerCode:line.customerCode,
                                status:line.status
                            });
                        }
                        cb();
                    }
                }).catch(()=>{});
            },
            getCompany(cb) {
                // 默认Create权限
                var action = "so-create";
                // 当为查看或编辑时跟着查询画面的权限跑
                if(this.mode && (this.mode == "0" || this.mode == "1" || this.mode == "2" || this.mode == "3")) {
                    action = "so-search";
                }
                GetCompanyInAuth({
                    action: action,
                    userGuid: this.user.userGuid,
                    isSupplier: "1"
                }).then(data => {
                    if (data && data.code == "200") {
                        //this.companyData=data.content;
                        this.companyAuthData = data.content;
                        // 给用户权限所关联的公司附初值
                        if(isNullOrWhiteSpace(this.companyCode) && !this.mode) {
                            this.companyCode = this.companyAuthData[0].companyCode;
                        }
                        for(let line of this.companyAuthData){
                            if(line.companyCode===this.comp){
                                this.companyCodeInput = line.companyCode + ' / ' + line.companyName_ZH;
                            }
                        }

                        GetCompany({
                            srvCompanyCode: ""
                        }).then(data => {
                            if (data && data.code == "200") {
                                //this.companyData=data.content;
                                this.companyAllData = data.content;
                            }
                            cb()
                        }).catch(() => {});
                    }
                }).catch(() => {});
            },
            // 主数据取得（各公司ERP数据库）
            getMastData(compObj) {
                // 取得客户主数据
                this.getCustom(compObj);
                // 取得币别主数据
                this.getCurr(compObj);
                // 取得付款方式主数据
                this.getPayment(compObj);
                // 取得税主数据
                this.getTax(compObj);
            },
            // 主数据取得（local）
            getMastDataLocal() {
                // 取得产品主数据
                this.getProduct();
                // 取得价格单位主数据
                this.getPriceUnit();
                // 取得SO状态主数据
                this.getStatus();
            },
            // 取得客户主数据
            getCustom(compObj) {
                getCustom({
                    erpCode: compObj.dbName,
                    ip: compObj.ip
                }).then(data => {
                    if (data && data.code == "200") {
                        this.customData = data.content;
                    } else {
                        this.customData = [];
                    }
                    this.mastDataDealCount = this.mastDataDealCount + 1;
                });
            },
            // 取得币别主数据
            getCurr(compObj) {
                getCurr({
                    erpCode: compObj.dbName,
                    ip: compObj.ip
                }).then(data => {
                    if (data && data.code == "200") {
                        this.currData = data.content;
                    } else {
                        this.currData = []
                    }
                    this.mastDataDealCount = this.mastDataDealCount + 1;
                });
            },
            // 取得付款方式主数据
            getPayment(compObj) {
                getPayment({
                    erpCode: compObj.dbName,
                    ip: compObj.ip
                }).then(data => {
                    if (data && data.code == "200") {
                        this.paymentData = data.content;
                    } else {
                        this.paymentData = [];
                    }
                    this.mastDataDealCount = this.mastDataDealCount + 1;
                });
            },
            // 取得成本中心主数据
            getCostCenter(companyCode,startDate,endDate) {
                // 取得头上公司的Object
                var srvCompanyInfo
                if(this.companyData.length > 0)
                    srvCompanyInfo = arraySearch(companyCode, this.companyData, "companyCode")[0];
                else
                    srvCompanyInfo = arraySearch(companyCode, this.companyAllData, "companyCode")[0];
                var para = {
                    StartDate:startDate,
                    EndDate:endDate,
                    SOHeadGUID: typeof(this.headObj.headGuid) == "undefined" ? "" : this.headObj.headGuid
                };
                // 参数
                var parameters = {
                    erpCode: srvCompanyInfo.dbName,
                    ip: srvCompanyInfo.ip,
                    parameters: JSON.stringify(para)};

                getCostCenter(parameters).then(data => {
                    if (data && data.code == "200") {
                        this.costCenterData = data.content;
                        var costCenter;
                        var name = "";

                        this.costCenterOptions = [];
                        for(var i=0; i<this.costCenterData.length; i++) {
                            costCenter = { "value": "" };
                            name = this.costCenterData[i].costCenterName_ZH;
                            if(typeof(name)=="undefined") {
                                name = "";
                            }
                            costCenter.value = this.costCenterData[i].costCenterCode + " / " + name;

                            this.costCenterOptions.push(costCenter);
                        }
                    } else {
                        this.costCenterData = [];
                    }
                    this.mastDataDealCount = this.mastDataDealCount + 1;
                });
            },
            // 取得开票公司成本中心主数据
            getInvCostCenter(companyCode) {
                // 取得头上公司的Object
                var invCompanyInfo
                if(this.companyData.length > 0)
                    invCompanyInfo = arraySearch(companyCode, this.companyData, "companyCode")[0];
                else
                    invCompanyInfo = arraySearch(companyCode, this.companyAllData, "companyCode")[0];
                // 参数
                var parameters = {
                    erpCode: invCompanyInfo.dbName,
                    ip: invCompanyInfo.ip
                };

                getCostCenter(parameters).then(data => {
                    if (data && data.code == "200") {
                        this.invCostCenterData = data.content;
                        var costCenter;
                        var name = "";

                        this.invCostCenterOptions = [];
                        for(var i = 0; i < this.invCostCenterData.length; i++) {
                            costCenter = { "value": "" };
                            name = this.invCostCenterData[i].costCenterName_ZH;
                            if(isNullOrWhiteSpace(name)) {
                                name = "";
                            }
                            costCenter.value = this.invCostCenterData[i].costCenterCode + " / " + name;

                            this.invCostCenterOptions.push(costCenter);
                        }
                    } else {
                        this.invCostCenterData = [];
                    }
                    this.mastDataDealCount = this.mastDataDealCount + 1;
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
                    this.mastDataDealCount = this.mastDataDealCount + 1;
                });
            },
            // 取得产品主数据
            getProduct() {
                getProduct().then(data => {
                    if (data && data.code == "200") {
                        this.productData = data.content;
                    } else {
                        this.productData = [];
                    }
                });
            },
            // 取得价格单位主数据
            getPriceUnit() {
                getPriceUnit().then(data => {
                    if (data && data.code == "200") {
                        this.priceUnitOrgData = data.content;
                    } else {
                        this.priceUnitOrgData = [];
                    }
                });
            },
            // 取得SO状态主数据
            getStatus() {
                getStatus("order").then(data => {
                    if (data && data.code == "200") {
                        this.statusData = data.content;
                    } else {
                        this.statusData = [];
                    }
                });
            },
            // 根据status取得status描述
            setStatus(status) {
                if (typeof(status) == "undefined") {
                    status = "";
                }
                var row = arraySearch(status, this.statusData, "status");
                return row[0].name_ZH;
            },
            // 从Json数组过滤符合条件的集合（CostCenter专用）
            querySearchCostCenter(queryString, cb) {
                var aryJson = this.costCenterOptions;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            // 从Json数组过滤符合条件的集合（invCostCenter专用）
            querySearchInvCostCenter(queryString, cb) {
                var aryJson = this.invCostCenterOptions;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            // 分割字符串取得成本中心
            getCostCenterString(dspCostCenter) {
                var strs = new Array();
                strs = dspCostCenter.split("/");
                return strs[0].replace(/\s/ig,'');
            },
            // 给CostCenter下拉框绑定数据集
            setCostCenterData(itemIndex, mode) {
                if(mode == "0") {
                    this.itemData[itemIndex].costCenterData = this.costCenterData;
                }else if(mode == "1") {
                    var costCenterOption = arraySearch(this.itemData[itemIndex].costCenterCode, this.costCenterData,"costCenterCode")
                    this.itemData[itemIndex].costCenterData = costCenterOption;
                }
            },
            costCenterChange(itemIndex) {
                if(isNullOrWhiteSpace(this.itemData[itemIndex].costCenterCode)){
                    this.itemData[itemIndex].invCostCenterCode = "";
                    return;
                }
                var costCenterCode = this.getCostCenterString(this.itemData[itemIndex].costCenterCode);
                var costCenterOption = arraySearch(costCenterCode,this.costCenterData, "costCenterCode");

                if(typeof(costCenterOption) == "undefined" || costCenterOption.length == 0) {
                    this.itemData[itemIndex].costCenterCode = "";
                    this.itemData[itemIndex].invCostCenterCode = "";
                }
            },
            invCostCenterChange(rowIndex) {
                var invCostCenterCode = this.getCostCenterString(this.costCenterMatchData[rowIndex].invCostCenterCode);
                var invCostCenterOption = arraySearch(invCostCenterCode,this.invCostCenterData, "costCenterCode");

                if(typeof(invCostCenterOption) == "undefined" || invCostCenterOption.length == 0) {
                    this.costCenterMatchData[rowIndex].invCostCenterCode = "";
                }
            },
            sort(array, fieldName) {
                array.sort(function(x,y) {
                    return x[fieldName] > y[fieldName] ? 1:-1;
                });
            },
            // 多公司成本中心匹配维护弹窗
            modelCostCenterMatch(itemIndex) {
                var aryCostCenter = new Array();
                var checkEmpty = false;
                var srvCompanyInfo = arraySearch(this.companyCode, this.companyAllData, "companyCode")[0];
                var invCompanyInfo = arraySearch(this.headData.companyCode, this.companyAllData, "companyCode")[0];
                var srvCompanyCode = srvCompanyInfo.companyCode + ' / ' + srvCompanyInfo.companyName_ZH;
                var invCompanyCode = invCompanyInfo.companyCode + ' / ' + invCompanyInfo.companyName_ZH;


                for(var i = 0; i < this.itemData.length; i++) {
                    if(isNullOrWhiteSpace(this.itemData[i].costCenterCode)) {
                        continue;
                    }
                    if(!isNullOrWhiteSpace(this.itemData[i].costCenterCode)) {
                        checkEmpty = true;
                    }
                    aryCostCenter.push({
                        srvCompanyCode: srvCompanyCode,
                        srvCostCenterCode: this.itemData[i].costCenterCode,
                        invCompanyCode: invCompanyCode,
                        invCostCenterCode: this.itemData[i].invCostCenterCode
                    });
                }

                aryCostCenter.sort(function(x,y) {
                    return x.invCostCenterCode > y.invCostCenterCode ? -1:1;
                });

                // 必要性Check
                if(!checkEmpty) {
                    this.$message.error("请至少维护一个成本中心");
                    return;
                }
                // Array去重
                aryCostCenter = aryCostCenter.distinct(["srvCostCenterCode"]);
                // 设置
                this.costCenterMatchData = aryCostCenter;
                this.selectCostCenter = this.itemData[itemIndex].costCenterCode;
                this.dialogCostCenterMatch = true;
            },
            // 更新多公司成本中心匹配
            updateCostCenterMatch() {
                var costCenterObj;
                for(var i = 0; i < this.itemData.length; i++) {
                    if(isNullOrWhiteSpace(this.itemData[i].costCenterCode)) {
                        continue;
                    }
                    costCenterObj = arraySearch(this.itemData[i].costCenterCode, this.costCenterMatchData, "srvCostCenterCode")[0];
                    if(typeof(costCenterObj) != "undefined" && costCenterObj.length != 0) {
                        this.itemData[i].invCostCenterCode = costCenterObj.invCostCenterCode;
                    }
                }
                this.dialogCostCenterMatch = false;
            },
            // 高亮CostCenter匹配行项
            tableRowClassName({row, rowIndex}) {
                if(isNullOrWhiteSpace(this.selectCostCenter))
                    return;
                var color = "";

                if(this.costCenterMatchData[rowIndex].srvCostCenterCode == this.selectCostCenter)
                    color = "select-row";

                return color;
            },
            // 行项终止按钮
            itemClose(index) {
                // Angel Jiang
                let date=new Date();
                var item = this.itemData[index];
                var startDate = this.formatDate(item.date_range[0]);
                var endDate = this.formatDate(item.date_range[1]);

                this.formExpiryDate.startDate = "";
                this.formExpiryDate.endDate = "";
                this.formExpiryDate.defaultDate = "";
                //默认终止日期 Angel Jiang
                this.formExpiryDate.expiryDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
                this.expiryDateMode = "item";
                this.formExpiryDate.itemIndex = index;

                GetSalesInvoiceMaxDate(item.itemGuid).then(data => {
                    if (data && data.code == "200") {
                        // 设置起始日期
                        this.formExpiryDate.startDate = isNullOrWhiteSpace(data.content) ?
                            startDate : data.content;
                        // 设置结束日期
                        this.formExpiryDate.endDate = endDate;
                        // 设置默认日期
                        var strDate = this.formExpiryDate.startDate.replace(/-/g,"/");
                        var workDate = new Date(strDate);
                        workDate.add("d",1)
                        this.formExpiryDate.defaultDate = workDate;
                    }
                    // 当SalesInvoice的最大结束日期等于item的结束日期时，不做处理
                    if(this.formExpiryDate.startDate == this.formExpiryDate.endDate) {
                        this.$message("当前行项的有效期内均已有开票记录，无需终止！");
                        return;
                    }
                    this.titleExpiryDate = "行项终止";
                    this.dialogExpiryDate = true;
                });
            },
            // 合同终止按钮
            headClose() {
                // Angel Jiang
                let date=new Date();
                var startDate = this.formatDate(this.headData.validDate);
                var endDate = this.formatDate(this.headData.date_range[1]);
                this.formExpiryDate.startDate = "";
                this.formExpiryDate.endDate = "";
                this.formExpiryDate.defaultDate = "";
                // Angel Jiang
                this.formExpiryDate.expiryDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
                this.expiryDateMode = "head";
                this.itemIndex = "";

                GetSalesPeriodMaxDate(this.headData.headGuid).then(data => {
                    if (data && data.code == "200") {
                        this.formExpiryDate.startDate = isNullOrWhiteSpace(data.content) ?
                            startDate : data.content;
                        this.formExpiryDate.endDate = endDate;
                        // 设置默认日期
                        var strDate = this.formExpiryDate.startDate.replace(/-/g,"/");
                        var workDate = new Date(strDate);
                        workDate.add("d",1)
                        this.formExpiryDate.defaultDate = workDate;
                    }
                    // 当SalesPeriod的最大结束日期等于head的结束日期时，不做处理
                    if(this.formExpiryDate.startDate == this.formExpiryDate.endDate) {
                        this.$message("当前合同的有效期内均已生成开票区间，不可终止！");
                        return;
                    }
                    this.titleExpiryDate = "合同终止";
                    this.dialogExpiryDate = true;
                });
            },
            // 执行终止确认
            doClose() {
                if(isNullOrWhiteSpace(this.formExpiryDate.expiryDate)){
                    this.$message.error("请输入终止日期");
                    return;
                }

                this.dialogExpiryDate = false;

                if (this.expiryDateMode == "head") {
                    this.handleClose();
                } else if (this.expiryDateMode == "item") {
                    this.handleItemClose(this.formExpiryDate.itemIndex);
                }
            },
            setEndDate() {
                this.titleEndDate = "合同结束日期调整";
                this.formEndDate.endDate = "";
                var myDate = new Date(this.headObj.endDate);
                myDate.add("d", 1);
                this.formEndDate.defaultDate = myDate;
                this.dialogEndDate = true;
            },
            doSetEndDate() {
                var date_range = [];
                var headEndDate = this.headData.date_range[1].format('yyyy/MM/dd');
                date_range.push(this.headData.date_range[0]);
                date_range.push(this.formEndDate.endDate);
                this.headData.date_range = date_range;
                this.dialogEndDate = false;
                var count = 0;

                for(var i = 0; i < this.itemData.length; i++) {
                    if(this.itemData[i].date_range[1].format('yyyy/MM/dd') == headEndDate) {
                        date_range = [];

                        date_range.push(this.itemData[i].date_range[0]);
                        date_range.push(this.formEndDate.endDate);
                        this.itemData[i].date_range = date_range;

                        count = count + 1;
                    }
                }

                this.$message({
                    type: 'success',
                    message: '结束日期已更新，' + count + '个行项的结束日期一起被更新'
                })

            },
            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            },
            // item单元格只读控制
            r_column(status) {
                var result = false;
                // Angel Jiang 2: 行已生成区间 3：开始日期小于今天的行餐次 9：终止行
                if(this.viewCtrl.r_item || status == '2'  || status == '9' || this.mode == "3") {
                    //|| status == '3'
                    result = true;
                }
                return result;
            },
            hisBack() {
                this.$router.push({path: '/query/',
                    query: {
                        hisBack: true
                    }});
            }
        },
        mounted() {
            this.load();
        },
        created(){
            // 打开loading...
            this.viewCtrl.v_loading = true;
        }
    }
</script>

<style>
    @import '../../assets/css/common.css';
    .el-form-item {
        margin-bottom: 5px;
    }

    .el-date-editor--daterange.el-input {
        width: 193px;
    }

    .customer-width {
        width: 193px;
    }

    .col-left {
        padding-left: 30px;
    }

    .col-left_3 {
        padding-left: 44px;
    }

    .col-left-no_require {
        padding-left: 9px
    }

    .col-4words-left {
        padding-left: 39px;
    }

    .el_short {
        width: 130px;
    }

    .el-input.is-disabled .el-input__inner {
        background-color: #FFF;
    }

    .number-unit {
        color: #a7a7a7;
    }
    .select-row {
        background: #dbebfb;
    }
    .tb-toolbar {
        position:fixed;
        z-index:100000020;
        width:35px;
        border-left:1px solid #ddd;
        border-right:1px solid #ddd;
        right:50px;
        top: 40%;
        /*top:0;*/
        /*bottom:0;*/
        background-color:#eee;
        -webkit-transform:translate3d(0,0,0);
        font-family:tahoma,arial,'Hiragino Sans GB',simsun,sans-serif;
        font-size:0
    }
    .his-back {
        background-color: #58B7FF;
        position:fixed;
        right: 100px;
        top: 40%;
        width: 35px;
        height: 35px;
        border-radius: 25px;
        cursor: pointer;
        opacity: .3;
        transition: .3s;
        z-index: 99999;
    }
    .his-back:hover {
        opacity: 1;
    }
    .his-back i {
        color: #fff;
        display: block;
        line-height: 35px;
        text-align: center;
        font-size: 18px;
        padding-right: 6%;
    }
</style>