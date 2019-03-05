<template>
    <div>
        <el-dialog :title="title"
                   :visible.sync="isShowDialog" size="large" :width="width" top="1%">
            <el-row>
                <el-col :span="24">
                    <el-form :inline="true">
                        <div>
                            <el-form-item>
                                <el-button size="small" type="primary" @click="submitRM">提交</el-button>
                            </el-form-item>
                        </div>
                    </el-form>
                </el-col>
            </el-row>
            <transition>
                <div v-loading="loadingRM"
                     element-loading-text="Data Loading...">
                    <el-row>
                        <el-form :inline="true" v-if="type==='po'">
                            <el-form-item label="供应商">
                                <el-select size="small" v-model="supplier" style="width:260px" @change="setSupplier">
                                    <el-option v-for="item in supplierList" :key="item.supplierCode"
                                               :value="item.supplierCode" :label="item.supplierCode +' / '+item.supplierName"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="采购类型">
                                <el-select size="small" v-model="purchaseType" style="width:100px" @change="setSupplier">
                                    <el-option value="" label="全部"></el-option>
                                    <el-option value="BOM" label="菜单"></el-option>
                                    <el-option value="new" label="直接采购"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="总金额">
                                <span><el-tag>{{TotalAmount}}</el-tag></span>
                            </el-form-item><br>
                            <el-form-item label="营运点">
                                <span><el-tag>{{costCenterCode}}</el-tag></span>
                            </el-form-item>
                            <el-form-item label="日期">
                                <span><el-tag>{{sDate}}</el-tag></span>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <el-row>
                        <el-col :span="24" style="padding-bottom: 10px;">
                            <el-table
                                    :data="filterRMData"
                                    stripe
                                    border
                                    style="width: 100%;font-size:12px"
                                    :height="this.fullHeight<300?300:this.fullHeight">
                                <el-table-column label="原料" width="280" :resizable="false" align="left" header-align="center" :show-overflow-tooltip="true">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.changeFlag!=='new'">{{scope.row.itemCode + ' / '+scope.row.itemName}}</span>
                                        <el-select v-if="scope.row.changeFlag==='new'" v-model="scope.row.itemCode" size="small" @change="setPrice(scope.row)" style="width:100%" filterable>
                                            <el-option v-for="item in rmOptions" v-if="item.supplierCode===supplier"
                                                       :key="item.itemCode" :value="item.itemCode" :label="item.itemCode +' / '+item.itemName"></el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="说明" width="100" :resizable="false" align="left" header-align="center" :show-overflow-tooltip="true">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.changeFlag!=='new'">{{scope.row.itemDesc}}</span>
                                        <el-input v-if="scope.row.changeFlag==='new'" v-model="scope.row.itemDesc" size="small"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="供应商" width="280" :resizable="false" align="left" header-align="center" v-if="type!=='po'">
                                    <template slot-scope="scope">
                                        <el-select v-model="scope.row.supplierCode" @change="changeSupplier(scope.row)" style="width:100%">
                                            <el-option  v-for="item in rmOptions"  v-if="item.itemCode===scope.row.itemCode"
                                                        :key="item.supplierCode" :value="item.supplierCode" :label="item.supplierCode+' / '+item.supplierName">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="单价" width="100" :resizable="false" align="center" header-align="center" :show-overflow-tooltip="true">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.purchasePrice!=='' && scope.row.purchaseUnit!==''">{{(scope.row.purchasePrice*1).toFixed(2) +' / '+scope.row.purchaseUnit}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="数量" width="100" :resizable="false" align="center" :show-overflow-tooltip="true" v-if="type==='changeSupplier' && sDate < eDate">
                                    <el-table-column :label="'周一 ' + weekData.mon_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.monQty*1>0">{{((scope.row.monQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周二 ' + weekData.tue_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.tueQty*1>0">{{((scope.row.tueQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周三 ' + weekData.wed_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.wedQty*1>0">{{((scope.row.wedQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周四 ' + weekData.thu_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.thuQty*1>0">{{((scope.row.thuQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周五 ' + weekData.fri_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.friQty*1>0">{{((scope.row.friQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周六 ' + weekData.sat_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.satQty*1>0">{{((scope.row.satQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="'周日 ' + weekData.sun_date.substr(5,10)"
                                                     width="80" :resizable="false" align="center" :show-overflow-tooltip="true">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.itemCode.length>0">
                                                <span v-if="scope.row.sunQty*1>0">{{((scope.row.sunQty)*1).toFixed(2)}}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                                <el-table-column label="数量" align="center" width="80" :resizable="false" :show-overflow-tooltip="true" v-if="type==='changeSupplier' && sDate===eDate">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.daylyQty!==0 && scope.row.daylyQty!==''">{{scope.row.daylyQty}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="数量" align="center" width="80" :resizable="false" :show-overflow-tooltip="true" v-if="type==='po'">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.daylyQty!=='' && (purchaseType==='BOM'||purchaseType==='')">
                                            {{float(scope.row.daylyQty*1)}}</span>
                                        <number-input v-if="scope.row.daylyQty==='' && purchaseType==='new'"
                                                      size="small" validType="+decimal" v-model="scope.row.requiredQty"></number-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="单位" align="center" width="80" :resizable="false" :show-overflow-tooltip="true" v-if="type==='po'">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.purchaseUnit}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="金额" align="center" width="80" :resizable="false" :show-overflow-tooltip="true" v-if="type==='po'">
                                    <template slot-scope="scope">
                                        <div v-if="scope.row.itemCode.length>0">
                                            <span>{{float(scope.row.requiredQty * scope.row.purchasePrice*1)}}</span>
                                        </div>
                                    </template>
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
    import {  GetCompanyInAuth,menuClass,setMenuItem,recipe,itemSource,itemSequence,GetMenu,getCustom,GetPOItems,ChangeSupplier } from '../api/api';
    import bomModel from '../../static/bomObj.json';


    export default{
        components: {
           'number-input':NumberInput
        },
        props:['ChangeItemSupplierDialog','DBName','sDate','eDate','costCenterCode','itemBOM','type'],
        watch: {
            ChangeItemSupplierDialog(val){
                this.isShowDialog = val;
                if(val){
                    this.itemSource();
                    this.SetWeekDate(new Date(this.sDate), "+", "y");
                    if(this.type==='changeSupplier' && this.sDate<this.eDate){
                        this.width = '100%';
                        this.title='修改原料供应商';
                    } else if(this.type==='changeSupplier'&& this.sDate===this.eDate){
                        this.width='64%';
                        this.title='修改原料供应商';
                    } else if(this.type==='po'){
                        this.width='56%';
                        this.supplier='';
                        this.purchaseType='';
                        this.title='采购单';
                        this.setSupplier();
                    }
                }
            },
            isShowDialog(val){
                this.$emit("onChangeItemSupplierDialog",val);
            }
        },
        computed:{
            TotalAmount(){
                let amount = 0;
                for (let a of this.filterRMData) {
                    amount -= (-a.requiredQty*a.purchasePrice*1);
                }
                return amount.toFixed(2);
            }
        },
        data(){
            return{
                supplier:'',
                purchaseType:'',
                width:'0.9',
                isShowDialog : this.ChangeItemSupplierDialog,
                loadingRM:false,
                filterRMData:[],
                fullHeight: window.innerHeight-240,
                DB:[],
                weekData: {
                    mon_date: '',
                    tue_date: '',
                    wed_date: '',
                    thu_date: '',
                    fri_date: '',
                    sat_date: '',
                    sun_date: '',
                },
                rmOptions:[],
                supplierList:[],
                user:'',
                title:''
            }
        },

        methods:{
            getFirstDayOfWeek (date) {
                var day = date.getDay() || 7;
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
            },
            // 设置一周日期
            SetWeekDate(date, flag, initial) {
                var days = 0;
                if(flag == "+")
                    days = 0;
                else if(flag == "-")
                    days = -7;

                // 取得下周一的日期
                date.add("d", days);
                date = this.getFirstDayOfWeek(date);
                // 下周一到下周日日期赋值
                if(initial == "y")
                this.thisMonday = this.formatDate(date, "yyyy/MM/dd");
                this.weekData.mon_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.tue_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.wed_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.thu_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.fri_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.sat_date = this.formatDate(date, "yyyy/MM/dd");
                date.add("d",1);
                this.weekData.sun_date = this.formatDate(date, "yyyy/MM/dd");
            },
            // 日期格式化
            formatDate(date, formatString) {
                if(isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";
                return chGMT(date, formatString);
            },
            querySearchRMCode(queryString, cb){
                var aryJson = this.rmOptions1;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            itemSource(){
                this.rmOptions=[];
                this.rmOptions1=[];
                itemSource({
                    "" : JSON.stringify({
                        dbName: this.DBName,
                        requiredDate: this.sDate,
                        costCenterCode: this.costCenterCode,
                        allSuppliersByItem:true
                    })
                }).then(data=>{
                    if(data && data.code=='200'){
                        var rm;
                        this.rmOptions=[];
                        this.rmOptions1=[];

                        for(let line of data.content){
                            rm = { "value": "" };
                            rm.value = line.itemCode + " / " + line.itemName_ZH;
                            this.rmOptions.push({itemCode:line.itemCode, itemName:line.itemName_ZH,totalPrice:line.purchasePrice,purchaseUnit:line.unitcode,conversionRate:line.conversionRate,conversionUnit:line.conversionUnit,supplierCode:line.supplierCode,supplierName:line.supplierName,tax:line.tax});
                            this.rmOptions1.push(rm);
                        }
                        var bom = deepCopy(this.bomModel);
                        this.filterRMData=[];

                        var user = sessionStorage.getItem('user');
                        if (user) {
                            user = JSON.parse(user);
                            this.user = user;
                        }
                        GetPOItems({
                            mode:this.type,
                            userId:this.user.account,
                            dbName:this.DBName,
                            costCenterCode:this.costCenterCode,
                            startDate:this.sDate,
                            endDate:this.eDate
                        }).then(data=>{
                            if(data && data.code==='200'){
                                this.DB=[];
                                var supp=[];
                                this.supplierList=[];
                                var a=0;
                                for(let row of data.content){
                                        this.DB.push({
                                            itemCode:row.itemCode,
                                            itemName:row.itemName,
                                            itemDesc:row.itemDesc,
                                            supplierCode:row.supplierCode,
                                            supplierCode_bak:row.supplierCode,
                                            supplierName:row.supplierName,
                                            conversionRate:row.conversionRate,
                                            conversionUnit:row.conversionUnit,
                                            purchasePrice:row.purchasePrice,
                                            purchaseUnit:row.purchaseUnit,
                                            changeFlag:"BOM",
                                            monQty:row.monQty,
                                            tueQty:row.tueQty,
                                            wedQty:row.wedQty,
                                            thuQty:row.thuQty,
                                            friQty:row.friQty,
                                            satQty:row.satQty,
                                            sunQty:row.sunQty,
                                            daylyQty:row.daylyQty,
                                            requiredQty:row.daylyQty,
                                        });
                                    supp.push({
                                         supplierCode:row.lstSuppliers[0].supplierCode,
                                         supplierName:row.lstSuppliers[0].supplierName,
                                         count:a++
                                    });
                                }
                                 for(let line of supp){
                                     var b=0;
                                     for(var a=0;a<line.count;a++){
                                         if(line.supplierCode===supp[a].supplierCode){
                                             b++;
                                         }
                                     }
                                     line.count=b;
                                 }

                                 for(let line of supp){
                                     if(line.count>0) continue;
                                     this.supplierList.push(line)
                                 }
                                 this.supplier=this.supplierList[0].supplierCode;
                                 this.setSupplier();
                                 //console.log(this.supplierList);
                            }
                        }).catch(()=>{console.log('Fail')});

                        this.filterRMData=this.DB;

                    }
                }).catch(()=>{});
            },
            changeSupplier(row){
                for(let line of this.rmOptions){
                    if(row.itemCode===line.itemCode && row.supplierCode===line.supplierCode){
                        row.purchasePrice=line.totalPrice;
                        row.purchaseUnit=line.purchaseUnit;
                        row.conversionRate=line.conversionRate;
                        row.conversionUnit=line.conversionUnit;
                        row.tax=line.tax;
                        row.supplierCode=line.supplierCode;
                        row.supplierName=line.supplierName;
                    }
                }
                if(row.supplierCode_bak-row.supplierCode!==0 && row.changeFlag!=='new'){
                    row.changeFlag="update";
                }
            },
            submitRM(){
                var dbFinal=[];
                for(let line of this.filterRMData){
                    if(line.itemCode!==''){
                        dbFinal.push(line);
                    }
                }
                ChangeSupplier({
                    mode:this.type,
                    userId:this.user.account,
                    dbName:this.DBName,
                    costCenterCode:this.costCenterCode,
                    startDate:this.sDate,
                    endDate:this.eDate,
                    lstChangeSupplier:dbFinal
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.$message.success("数据已保存！");
                    } else if(data.code==='500'){
                        var a=0;
                        for(let line of this.filterRMData){
                            if(line.changeFlag!=='BOM'&& line.itemCode.length>0){
                                a++
                            }
                        }
                        if(a>0){
                            this.$message.error("数据保存失败！");
                            this.$emit('getItemsData','error');
                        }
                        else{
                            this.$message.error("无数据需要保存！");
                        }
                    }
                }).catch(()=>{
                   console.log('Fail');
                });

                this.isShowDialog=false;

            },
            getRequiredQty1(RequiredQty, actQty, conversionUnit, conversionRate){
                return getRequiredQty(RequiredQty, actQty, conversionUnit, conversionRate);
            },
            float(price, fix){
                return float(price, fix);
            },
            setSupplier(){
                this.filterRMData=[];
                for(let line of this.DB){
                    if(this.supplier!=='' && this.purchaseType!==''){
                        if(line.supplierCode!==this.supplier || line.changeFlag!==this.purchaseType) continue;
                        this.filterRMData.push(line);
                    } else {
                        if(this.purchaseType==='' && this.supplier==='') this.filterRMData=this.DB;
                        else{
                            if(line.supplierCode!==this.supplier && line.changeFlag!==this.purchaseType) continue;
                            this.filterRMData.push(line);
                        }
                    }
                }
                var a=0;
                for(let line of this.filterRMData){
                    if(line.itemCode.length===0) a++;
                }
                if(this.purchaseType==='new' && a===0){
                    this.addnewRM();
                }
            },
            addnewRM(){
                this.filterRMData.push({
                    itemCode:'',
                    itemName:'',
                    itemDesc:'',
                    thuQty:'',
                    purchaseUnit:'',
                    purchasePrice:'',
                    conversionUnit:'',
                    conversionRate:'',
                    supplierCode:'',
                    supplierName:'',
                    requiredQty:'',
                    changeFlag:"new",
                    tax:'',
                    daylyQty:''
                });
            },
            setPrice(row){
                row.supplierCode=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").supplierCode;
                row.supplierName=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").supplierName;
                row.purchaseUnit=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").purchaseUnit;
                row.purchasePrice=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").totalPrice;
                row.conversionUnit=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").conversionUnit;
                row.conversionRate=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").conversionRate;
                row.tax=typeof((getRowFromArray(row.itemCode, this.rmOptions, "itemCode")))==='undefined'?"":
                    getRowFromArray(row.itemCode, this.rmOptions, "itemCode").tax;
                var a=0;
                for(let line of this.filterRMData){
                    if(line.itemCode==='') a++;
                }
                if(a===0) this.addnewRM();
            }
        }
    }
</script>
<style>

</style>