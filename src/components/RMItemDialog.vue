<template>
    <div>
        <el-dialog :title="'原材料明细'+' / '+this.itemName_ZH"
                   :visible.sync="isShowDialog" size="large" width="85%" top="1%" :close-on-click-modal="false">
            <el-row>
                <el-col :span="24">
                    <el-form :inline="true">
                        <div>
                            <el-form-item>
                                <el-button size="small" type="primary" @click="submitRM">提交</el-button>
                            </el-form-item>
                            <el-form-item>
                                <span>份数：</span><el-tag>{{RequiredQty}}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <span>单位成本：</span><el-tag>{{ItemCost2}}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <span>采购金额：</span><el-tag>{{PurchaseAmt}}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="small" type="success" @click="saveMenu">另存为食谱</el-button>
                            </el-form-item>
                            <el-form-item>
                                <el-tag v-if="typeof(mealType)!=='undefined'">{{mealType}}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <el-tag v-if="typeof(whs)!=='undefined'">{{whs}}</el-tag>
                            </el-form-item>
                            <el-form-item>
                                <el-tag v-if="typeof(weekDay)!=='undefined'">{{weekDay}}</el-tag>
                            </el-form-item>
                        </div>
                    </el-form>
                </el-col>
            </el-row>
            <transition>
                <div v-loading="loadingRM"
                     element-loading-text="Data Loading...">
                    <el-row>
                        <el-col :span="24" style="padding-bottom: 10px;">
                            <el-table
                                    :data="filterRMData"
                                    stripe
                                    border
                                    style="width: 100%;font-size:12px"
                                    :height="this.fullHeight<300?300:this.fullHeight">
                                <el-table-column v-if="false">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.productGUID}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column v-if="false">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.effectPercent}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="原料" width="230" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-autocomplete class="inline-input" v-model="scope.row.itemCodeName" :fetch-suggestions="querySearchRMCode"
                                                         style="width:230px"
                                                         :trigger-on-focus="true"
                                                         @select = "checkrmCode(scope.$index,scope.row)"
                                                         @change.native = "validityCheck(scope.$index,scope.row)"
                                                         @click.native="$event.target.select()"
                                                         :disabled="scope.row.changeFlag.length>0"></el-autocomplete>
                                    </template>
                                </el-table-column>
                                <!--<el-table-column label="菜谱成分" width="130" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-input v-model="scope.row.itemDesc" :disabled="scope.row.status"></el-input>
                                    </template>
                                </el-table-column>-->
                                <el-table-column label="供应商" width="220" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.supplierCode.length>0 && scope.row.changeFlag.length>0">{{scope.row.supplierCode +' / '+scope.row.supplierName}}</span>
                                        <el-select v-model="scope.row.supplierCode" v-if="scope.row.changeFlag.length===0" @change="changeSupplier(scope.row)">
                                            <el-option v-for="item in rmOptions" v-if="item.itemCode===scope.row.itemCodeName.substring(0,scope.row.itemCodeName.indexOf('/')-1)"
                                                       :key="item.supplierCode" :value="item.supplierCode" :label="item.supplierCode+' / '+item.supplierName">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="原料生重(单份)" width="120" :resizable="false" align="center" header-align="center">
                                    <el-table-column label="标准" width="60" :resizable="false" align="center" header-align="center">
                                        <template slot-scope="scope">
                                            <span v-if="scope.row.changeFlag.length>0">{{float(scope.row.bomQty,6)}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="实际" width="80" :resizable="false" align="center" header-align="center">
                                        <template slot-scope="scope">
                                             <number-input style="width:90%;" v-model="scope.row.actQty" validType="+decimal" @change.native="checkActItemCost(scope.row)" :disabled="scope.row.status"></number-input>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="单位" width="60" :resizable="false" align="center" header-align="center">
                                        <template slot-scope="scope">
                                            <span v-if="scope.row.conversionUnit.toUpperCase()==='KG'">g</span>
                                            <span v-if="scope.row.conversionUnit.toUpperCase()==='L'">ml</span>
                                            <span v-if="scope.row.conversionUnit.toUpperCase()!=='KG'&& scope.row.conversionUnit.toUpperCase()!=='L'">
                                                {{scope.row.conversionUnit.toLowerCase()}}</span>
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="采购" width="120" :resizable="false" align="center" header-align="center" prop="cost">
                                    <el-table-column label="价格" width="80" :resizable="false" align="center" header-align="center">
                                        <template slot-scope="scope">
                                            <span v-if="scope.row.purchasePrice!=='' && scope.row.purchaseUnit!==''">{{float((scope.row.purchasePrice*1),6) +' / '+scope.row.purchaseUnit}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="数量" width="60" :resizable="false" align="center">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCodeName.length>0">
                                                <span>{{(getRequiredQty1(RequiredQty, scope.row.actQty, scope.row.conversionUnit, scope.row.conversionRate))}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="金额" width="70" :resizable="false" align="center">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCodeName.length>0">
                                                <span>{{float((getRequiredQty1(RequiredQty, scope.row.actQty, scope.row.conversionUnit, scope.row.conversionRate) * scope.row.purchasePrice),2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="日期" width="130" :resizable="false" align="center">
                                        <template slot-scope="scope" align="center">
                                            <div v-if="scope.row.itemCodeName.length>0">
                                                <el-date-picker
                                                        :disabled="scope.row.status"
                                                        size="small"
                                                        v-model="scope.row.requiredDate"
                                                        type="date"
                                                        placeholder="选择日期"
                                                        :picker-options="pickerOptions1"
                                                         value-format="yyyy-MM-dd">
                                                </el-date-picker>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                </div>
            </transition>
        </el-dialog>
    </div>
</template>

<script>
    import NumberInput from '../components/NumberInput.vue'
    import { toGMT, chGMT, isNullOrWhiteSpace, arraySearch, getRowFromArray, createFilter, formatMoney, arrayToString, deepCopy, getRequiredQty,float} from '../assets/js/common';
    import {  GetCompanyInAuth,menuClass,setMenuItem,recipe,itemSource,itemSequence,GetMenu,getCustom } from '../api/api';
    import bomModel from '../../static/bomObj.json';

    export default{
        components: {
            'number-input':NumberInput
        },
        props:['ShowRMItemDialog','DBName','RequiredDate','RequiredQty','costCenterCode','itemBOM','itemName_ZH','mealType','whs','weekDay'],
        watch: {
            ShowRMItemDialog(val){
                this.isShowDialog = val;
                if(val){
                    this.itemSource();
                }
            },
            isShowDialog(val){
                this.$emit("onShowRMItemDialog",val);
            }
        },
        computed: {
            ItemCost2(){
                let amount = this.PurchaseAmt / this.RequiredQty;
                //for (let a of this.filterRMData) {
                //     amount -= (-a.actItemCost);
                // }
                return amount.toFixed(2);
            },
            PurchaseAmt(){
                let amount = 0;
                for(let a of this.filterRMData){
                    if(a.itemCodeName.length>0){
                        amount-=(-getRequiredQty(this.RequiredQty, a.actQty, a.conversionUnit, a.conversionRate) * a.purchasePrice);
                    }
                }
                return amount.toFixed(2);
            }
        },

        data(){
            return{
                user:'',
                isShowDialog : this.ShowRMItemDialog,
                loadingRM:false,
                filterRMData:[],
                fullHeight: window.innerHeight-240,
                rmOptions:[],
                DB:[],
                pickerOptions1:this.EndDate()
            }
        },
        methods:{
            //保存数据，插入表tblItemBOM
            saveMenu(){
                var menu = [];
                menu.paramType = [{item: false, bom: true, cookway: false, menuPoint: false, nutrition: false}];
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                var paramsNewItem = [];
                //this.itemBOM
                for (let line of this.filterRMData) {
                    if(line.itemCode.length==0) continue;
                    line.createUserGUID=this.user.userGuid;
                    line.costCenterCode=this.costCenterCode;
                    line.changeFlag = 'update';
                    line.itemCode=line.itemCodeName.substring(0,line.itemCodeName.indexOf('/')-1);
                    line.itemName=line.itemCodeName.substring(line.itemCodeName.indexOf('/')+1);
                    line.itemType="RM";
                    line.supplierCode=line.supplierCode;

                    paramsNewItem.push(line);
                }
               if (paramsNewItem.length > 0) {
                    menu.item=paramsNewItem;
                    
                    menu.ItemBOM = paramsNewItem;
                    menu.itemGuid=paramsNewItem[0].productGUID;
                    menu.costCenterCode=this.costCenterCode;

                    menu.paramType = [{item: false, bom: true, cookway: false, menuPoint: false, nutrition: false}];
                    setMenuItem(menu).then(data => {
                        if (data && data.code === '200') {
                            this.$confirm('数据已经保存，请继续', '提示', {
                                confirmButtonText: '确定',
                                type: 'success'
                            }).then(() => {
                                this.isShowDialog=true;
                            }).catch(() => {
                                this.isShowDialog=false;
                            });
                        }
                    }).catch(() => {
                        console.log('Fail')
                    });
               }
            },

            changeSupplier(row){
                for(let line of this.rmOptions){
                    if(row.itemCodeName.substring(0,row.itemCodeName.indexOf('/')-1)===line.itemCode && row.supplierCode===line.supplierCode){
                        row.purchasePrice=line.totalPrice;
                        row.purchaseUnit=line.purchaseUnit;
                        row.conversionRate=line.conversionRate;
                        row.conversionUnit=line.conversionUnit;
                        row.supplierCode=line.supplierCode;
                        row.supplierName=line.supplierName;
                        row.tax=line.tax;
                    }
                }
            },
            querySearchRMCode(queryString, cb){
                var aryJson = this.rmOptions1;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            //获取itemBOM，获取原料下列表
            itemSource(){
                this.filterRMData=[];
                this.DB=[];
                var bom = deepCopy(this.bomModel);
                for(let row of this.itemBOM) {
                    var num=1;
                    if(row.conversionUnit==='KG'|| row.conversionUnit==='L') num=1000;
                    bom=deepCopy(row);
                    bom.itemCodeName=row.itemCode+" / "+row.itemName;
                    bom.actItemCost=(row.purchasePrice / num /row.conversionRate * row.actQty)+'';
                    bom.changeFlag='update';
                    bom.actQty=float(row.actQty,3);
                    bom.requiredDate =row.requiredDate;
                    bom.status= this.DisabledItem(bom.requiredDate);

                    this.DB.push(bom);
                }
                this.filterRMData=this.DB;
                this.addBOMItem();

                this.rmOptions=[];
                this.rmOptions1=[];
                itemSource({
                    "": JSON.stringify({
                        dbName: this.DBName,
                        requiredDate: this.RequiredDate,
                        requiredQty: this.RequiredQty,
                        costCenterCode: this.costCenterCode
                    })
                }).then(data=>{
                    if(data && data.code=='200'){
                        var rm;
                        this.rmOptions=[];
                        this.rmOptions1=[];
                        for(let line of data.content){
                            rm = { "value": "" };
                            rm.value = line.itemCode + " / " + line.itemName_ZH;
                            this.rmOptions.push({itemCode:line.itemCode, itemName:line.itemName_ZH,totalPrice:line.purchasePrice * 1,purchaseUnit:line.unitcode,conversionRate:line.conversionRate,conversionUnit:line.conversionUnit,supplierCode:line.supplierCode,supplierName:line.supplierName,tax:line.tax});
                            this.rmOptions1.push(rm);
                        }
                    }
                }).catch(()=>{});
            },
            //原料有效输入检查
            validityCheck(index,row){
                if(this.rmOptions1.length>0){
                    var array=arraySearch(row.itemCodeName,this.rmOptions1,"value");
                    if(typeof(array)==="undefined" || array.length===0){
                        row.itemCodeName="";
                    } else {
                        if(index+1===this.filterRMData.length && row.itemCodeName.length>0){
                            this.addBOMItem();
                        }
                    }
                }
            },
            //新增行
            addBOMItem(){
                this.filterRMData.push({
                    actItemCost:'0',
                    actQty:'0',
                    actQty_bak:'0',
                    bomQty:'0',
                    changeFlag:'',
                    conversionRate:'',
                    conversionUnit:'',
                    createTime:'',
                    createUser:'',
                    deleteTime:'',
                    deleteUser:'',
                    headGuid:'',
                    itemCode:'',
                    itemCodeName:'',
                    itemCost:0,
                    itemDesc:'',
                    itemDesc_bak:'',
                    itemGuid:'',
                    itemName:'',
                    itemStatus:"new",
                    lineGuid:'',
                    purchasePolicy:'OnDemand',
                    purchasePrice:'',
                    purchaseUnit:'',
                    requiredQty:'',
                    requiredQty_bak:'',
                    sortId:'',
                    supplierCode:'',
                    supplierName:'',
                    tax:'',
                    tobePurchased:true,
                });
            },
            //标识新增修改项
            checkActItemCost(row){
                row.actItemCost=(row.purchasePrice /1000/row.conversionRate * row.actQty)+'';
                row.requiredQty=this.getRequiredQty1(this.RequiredQty, row.actQty, row.conversionUnit, row.conversionRate);
                if(row.itemStatus==="new") return;
                if(row.actItemCost-row.itemCost!==0){
                    row.itemStatus="update";
                }
            },
            //关闭对话框，传出值
            submitRM(){
                var dbFinal=[];
                for(let line of this.DB){
                    if(line.itemCodeName.length===0)
                    continue;
                    dbFinal.push(line);
                }
                this.$emit('getItemsData',dbFinal);
                this.isShowDialog=false;
                console.log(dbFinal);
            },
            //查重
            checkrmCode(index,row){
                var a=0;
                for(let line of this.filterRMData){
                    if(line.itemCodeName.substring(0,row.itemCodeName.indexOf('/')-1)===row.itemCodeName.substring(0,row.itemCodeName.indexOf('/')-1)){
                        a++;
                    }
                }
                if(a>1){
                    this.$message.error("不可重复输入相同的原料");
                    row.itemCodeName='';
                } else {
                    var array2=(getRowFromArray(row.itemCodeName.substring(0,row.itemCodeName.indexOf('/')-1),this.rmOptions,"itemCode"));
                    if(typeof(array2)!=='undefined'){
                        row.itemCode=row.itemCodeName.substring(0,row.itemCodeName.indexOf('/')-1);
                        row.itemName=row.itemCodeName.substring(row.itemCodeName.indexOf('/')+2,row.itemCodeName.length);
                        row.purchasePrice=array2.totalPrice;
                        row.purchaseUnit=array2.purchaseUnit;
                        row.conversionUnit=array2.conversionUnit;
                        row.conversionRate=array2.conversionRate;
                        row.tax=array2.tax;
                        row.supplierCode=array2.supplierCode;
                        row.supplierName=array2.supplierName;
                    }
                    if(index+1===this.filterRMData.length && row.itemCodeName.length>0){
                        this.addBOMItem();
                    }
                }
            },
            getRequiredQty1(RequiredQty, actQty, conversionUnit, conversionRate){
                return getRequiredQty(RequiredQty, actQty, conversionUnit, conversionRate);
            },
            // 小数类型保留小数位数
            float(price, fix) {
                return float(price, fix);
            },
            EndDate() {
                let that = this;
                return {
                    disabledDate(time) {
                        const start=new Date();
                        start.setFullYear(that.weekDay.substring(3,7)*1);
                        start.setMonth(that.weekDay.substring(8,10)*1-1);
                        start.setDate(that.weekDay.substring(11,13)*1);
                        if( Date.now()+3600 * 1000 * 24 < start.getTime())
                            return time.getTime() <= Date.now()+3600 * 1000 * 24 || time.getTime() > start.getTime();
                        else
                            return time.getTime() <= Date.now()+3600 * 1000 * 24;
                    },
                }
            },
            //订单日期小于明天,则不可改
            DisabledItem(date){
                var r=false;
                const rDate= new Date();
                if(typeof (date)!=='undefined' && date!==null && date!==''){
                    rDate.setFullYear(date.substring(0,4)*1);
                    rDate.setMonth(date.substring(5,7)*1-1);
                    rDate.setDate(date.substring(8,10)*1);
                    if(rDate<=new Date()+3600 * 1000 * 24) r=true;
                }
                return r;
            },
            // 日期格式化
            formatDate(date, formatString) {
                if(isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";
                return chGMT(date, formatString);
            },
        }
    }
</script>
<style lang="scss">
    @import '../assets/css/common.css';
    .el-table .cell, .el-table th>div {
        padding-left: 3px;
        padding-right: 3px;
    }
</style>

