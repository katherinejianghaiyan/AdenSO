<template>
    <div>
        <el-dialog :title="'请选择添加 '+ this.dialogTitle"
                   :visible.sync="isShowDialog" size="large" width="83%" top="2%"
                   :close-on-click-modal="false">
            <el-row style="margin-bottom:20px">
                <el-col :span="24">
                    <!--<span>{{content}}</span>-->
                    <el-form :inline="true" :model="ruleForm" class="container">
                        <div>
                            <el-form-item style="margin-right: 1%">
                                <span>菜谱分类</span>
                                <el-cascader
                                        style="width:150px"
                                        v-model="itemClass"
                                        :options="options"
                                        change-on-select
                                        size="small"
                                        filterable
                                        @change="setcookwaysClass">
                                </el-cascader>
                            </el-form-item>
                            <el-form-item style="margin-right: 1%">
                                <span>形状</span>
                                <el-select v-model="ItemShapeClass" size="small" @change="setcookwaysClass" style="width:80px">
                                    <el-option key="" value="" :label="langData.All"></el-option>
                                    <el-option v-for="item in ItemShapeOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-right: 1%">
                                <span>烹饪方法</span>
                                <el-select v-model="cookwaysClass" size="small" @change="setcookwaysClass" style="width:90px">
                                    <el-option key="" value="" :label="langData.All"></el-option>
                                    <el-option v-for="item in cookOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-right: 1%">
                                <el-input v-model="keyword" size="small" placeholder="关键词" style="width:120px" @change.native="filterData"></el-input>
                            </el-form-item>
                            <el-form-item style="margin-right: 1%">
                                <span>价格</span>
                                <number-input v-model="price_minimum" size="small" validType="+decimal" style="width:50px" @change.native="filterData"></number-input>
                                <span>-</span>
                                <number-input v-model="price_maximum"  size="small" validType="+decimal" style="width:50px" @change.native="filterData"></number-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="small" type="success" @click="searchDialogData">搜索</el-button>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="small" type="primary" @click="addDialogData">添加</el-button>
                            </el-form-item>
                        </div>
                    </el-form>
                </el-col>
            </el-row>
            <transition>
                <div v-loading="loadingMenu"
                     element-loading-text="Data Loading...">
                    <el-row>
                        <el-col :span="24" style="padding-bottom: 10px;">
                            <div :inline="true">
                                    <span class="demonstration" >
                                    <el-select v-model="pageSize"
                                               size="small"
                                               style="width:10%;vertical-align:center;float:left"
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
                                        :total= this.DB.length
                                        :page-size="this.pageSize"
                                        background
                                        :page-sizes="[20,50,100]">
                                </el-pagination>
                                <el-switch v-model="itemStatus" active-text="有供应商" inactive-text="全部"
                                           @change="checkitemStatus">
                                </el-switch>
                            </div>
                            <el-table
                                    ref="multipleTable"
                                    :data="filterItemData"
                                    stripe
                                    border
                                    style="width: 100%;font-size:12px"
                                    :height="this.fullHeight<300?300:this.fullHeight"
                                    @sort-change="sortCol"
                                    :row-class-name="setClassName">
                                <!--@expand-change="expandRow"-->
                                <el-table-column type="expand">
                                    <template slot-scope="scope">
                                        <table style="width:100%;margin-top:0px">
                                        <tr style="text-align: center">
                                            <td style="border:none">
                                                <span v-if="scope.row.ItemBOM.length>0">
                                                    <el-tag v-if="scope.row.ItemBOM[0].costCenterCode!==null"><b>专用菜谱</b></el-tag>
                                                    <el-tag v-else><b>公用菜谱</b></el-tag>
                                                </span>
                                            </td>
                                            <td>原料</td><td>说明</td><td>供应商</td>
                                            <td>标准生重（克）</td><td>实际生重（克）</td>
                                            <td>采购价格</td>
                                        </tr>
                                        <tr v-for="item in scope.row.ItemBOM">
                                            <td style="border: none"></td>
                                            <td :class="item.supplierCode===null||item.supplierCode===''? 'deleteOption': ''">{{item.itemCode +' / '+item.itemName}}</td>
                                            <td :class="item.supplierCode===null||item.supplierCode===''? 'deleteOption': ''">{{item.itemDesc}}</td>
                                            <td>{{item.supplierCode===null||item.supplierCode===''?'': item.supplierCode +' / '+item.supplierName}}</td>
                                            <td>{{item.supplierCode===null||item.supplierCode===''?'': float(item.bomQty,3)}}</td>
                                            <td>{{item.supplierCode===null||item.supplierCode===''?'': float(item.actQty,3)}}</td>
                                            <td>{{item.supplierCode===null||item.supplierCode===''?'': item.purchasePrice+' / '+item.purchaseUnit}}</td>
                                        </tr>
                                        </table>
                                    </template>
                                </el-table-column>
                                <el-table-column type="index" width="40" :resizable="false">
                                </el-table-column>
                                <el-table-column  width="40" :resizable="false" label="选择" show-overflow-tooltip>
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row.checked" v-if="!(scope.row.selected || scope.row.itemValidity==='invalid' || scope.row.ItemBOM.length===0)" @change="checkedItem(scope.row)"><!--scope.row.ItemBOM.length===0-->
                                        </el-checkbox>
                                        <!--<el-checkbox v-model="scope.row.checked" v-if="!(scope.row.selected)" @change="checkedItem(scope.row)">&lt;!&ndash;scope.row.ItemBOM.length===0&ndash;&gt;-->
                                        <!--</el-checkbox>-->
                                    </template>
                                </el-table-column>
                                <el-table-column label="代码" prop="itemCode" sortable="custom" width="100" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.itemCode}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="名称" width="220" :resizable="false" prop="itemName_ZH" sortable="custom" :show-overflow-tooltip="true"
                                                 align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.itemName_ZH}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="菜谱分类" width="220" :resizable="false" prop="rmClass" sortable="custom"
                                                 :show-overflow-tooltip="true" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <span v-if="false">{{scope.row.nationGuid}}</span>
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.nation}}</span>

                                        <span v-if="scope.row.menuClassGuid!==''&& scope.row.menuClassGuid!==null">/</span>

                                        <span v-if="false">{{scope.row.menuClassGuid}}</span>
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.menuClass}}</span>
                                        <span v-if="scope.row.rmClass!==''&& scope.row.rmClass!==null">/</span>
                                        <span v-if="false">{{scope.row.rmClassGuid}}</span>
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.rmClass}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="颜色" width="100" :resizable="false" prop="itemColor" sortable="custom"
                                                 :show-overflow-tooltip="true" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <div :style="BGColor(scope.row.itemColor)" v-if="scope.row.itemColor!==null && scope.row.itemColor!==''"><br></div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="口味" width="100" :resizable="false" prop="itemTaste" sortable="custom"
                                                 :show-overflow-tooltip="true" header-align="center" align="center">
                                    <template slot-scope="scope">
                                        <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''">{{scope.row.itemTaste}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="单份数量" width="100" :resizable="false" prop="weight" sortable="custom"
                                                 :show-overflow-tooltip="true" align="center" header-align="center">
                                    <template slot-scope="scope">

                                            <span>{{scope.row.weight}}</span>
                                            &nbsp;
                                            <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''" v-if="scope.row.conversionUnit===null ? false :scope.row.conversionUnit.toLowerCase()=='kg'">g</span>
                                            <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''" v-if="scope.row.conversionUnit===null ? false :scope.row.conversionUnit.toLowerCase()=='l'">ml</span>
                                            <span :class="scope.row.itemValidity==='invalid'? 'deleteOption': ''" v-if="scope.row.conversionUnit===null ? false :(scope.row.conversionUnit.toLowerCase()!=='kg'&& scope.row.conversionUnit.toLowerCase()!=='l')">
                                                    {{scope.row.conversionUnit.length==0 ? false :scope.row.conversionUnit.toLowerCase()}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="单份成本" width="85" :resizable="false" prop="itemCostperDish" sortable="custom"
                                                 :show-overflow-tooltip="true" align="center" header-align="center">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.itemGuid===null||scope.row.itemGuid===''?scope.row.itemCostperDish+' / '+scope.row.purchaseUnitcode:scope.row.itemCostperDish}}</span>
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
    import {  GetCompanyInAuth,menuClass,setMenuItem,searchItem,recipe,itemSource,itemSequence,GetMenu,getCustom } from '../api/api'
    import { toGMT, chGMT, isNullOrWhiteSpace, arraySearch, getRowFromArray, createFilter,sortData,float,getRequiredQty} from '../assets/js/common';

    import NumberInput from '../components/NumberInput.vue'

    export default{
        components: {
            'number-input':NumberInput
        },
        props:['ShowSearchItemsDialog','DBName','RequiredDate','RequiredQty','costCenterCode','WeekDay','MealName', 'Items'],
        created(){
            this.Language();
            this.load();
        },
        data(){
            return{
                dialogTitle: '',
                price_minimum:'',
                price_maximum:'',
                isShowDialog : this.ShowSearchItemsDialog,
                db:this.DBName,
                RMorFlavor:'',
                fullHeight: window.innerHeight-300,
                ruleForm:{},
                newMenu:'',
                Class:'',
                status:'',
                statusOption:[],
                keyword:'',
                search:'',
                loadingMenu:false,
                filterItemData:[],
                DB:[],
                dataSource:[],
                dialogTableVisible:false,
                activeName:'first',
                company:'',
                companyOptions:[],
                mainData:{
                    code:'',
                    name_cn:'',
                    name_en:'',
                    status:'',
                    nation:'',
                    checked:true,
                    weightpershare:'',
                    itemType:'',
                    mainClass:'',
                    rmClass:'',
                    cookClass:'',
                    ItemShapeClass:'',
                    seasonClass:'',
                    color:'',
                    taste:'',
                    customerType:'',
                    protein:'',
                    vitamine:'',
                    mineral:'',
                    carbohydrate:'',
                    fat:'',
                    energy:'',
                    cookMethods:'',
                    sellingpoint:'',
                    nationOption:[],
                    mainClassOption:[],
                    rmClassOption:[],
                    cookClassOption:[],
                    seasonClassOption:[],
                    itemTypeOption:[],
                    shareQty:'100',
                },
                dialogTableVisible2:false,
                BOMForm:{
                    rm:'',
                    rmName:'',
                    itemDesc:'',
                    rmPercent:'0',
                    effect:'0',
                    flavor:'',
                    flavorName:'',
                    flavorweight:'0',
                    cost:'',
                    specification:''
                },
                BOMTable:[],
                subBOMTable:[],
                rmOptions:[],
                rmOptions1:[],
                flavorOptions:[],
                filter:{
                    nation:'',
                    mainClass:'',
                    rmClass:'',
                    cookClass:'',
                    cookClassOption:[]
                },
                mainClassTable:[],
                rmClassTable:[],
                cookClassTable:[],
                langData:[],
                CookMethodsTable:[],
                MenuPointTable:[],
                menuData:[],
                rmData:[],
                cookwayData:[],
                ItemShape:[],
                allData:[],
                inputGuid:'',
                seeNew:false,
                seeEdit:false,
                oldData:[],
                params:[],
                itemType:[],
                vShow:true,
                edit:'',
                checkmainClass:true,
                checknation:true,
                checkrmClass:true,
                checkcookClass:true,
                options:[],
                itemClass:[],
                cookwaysClass:'',
                cookOption:[],
                ItemShapeClass:'',
                ItemShapeOption:[],
                NewItem:[],
                DisableNewItem:false,
                newFlavor:false,
                newRM:false,
                currentPage2: 1,
                page: 1,
                pageSize: 20,
                pageLines: [],
                PageNum: '20',
                Options: [
                    {
                        value: 20,
                        label: '20条/页'
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
                itemStatus:true,
                checkedItems:[],
                totalTime:0,
                content:0,
            }
        },
        watch: {
            ShowSearchItemsDialog(val){
                //标题上显示日期和餐次
                this.dialogTitle = "";
                if(typeof(this.WeekDay) != "undefined")
                    this.dialogTitle = this.WeekDay;
                if(typeof(this.MealName) != "undefined") {
                    if(this.dialogTitle != "")
                        this.dialogTitle += " / ";
                    this.dialogTitle += this.MealName;
                }
                if(this.dialogTitle != "")
                    this.dialogTitle = "(" + this.dialogTitle + ")";

                this.isShowDialog = val;
                if(!this.isShowDialog) return;
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                this.GetMenuClass();
                this.GetMenu(this.user.langCode,"FG&RM");

                this.SearchItem(this.DBName,this.RequiredDate,this.RequiredQty,this.costCenterCode);
                this.checkedItems=[];
            },
            isShowDialog(val){
                this.$emit("onShowSearchItemsDialog",val);
            },

        },
        computed: {
            r_addButton: function() {
                if(this.mealFilterData.length == 0) {
                    return true;
                } else {
                    for(var meal of this.mealFilterData) {
                        if(meal.select) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        },
        methods:{
            setClassName({row, index}){
                // 通过自己的逻辑返回一个class或者空
                return row.itemValidity==='invalid' ? 'expand' : '';
            },
            searchDialogData(){
              this.filterData();
            },
            checkitemStatus(){
              this.filterData();
            },
            sortCol(col) {
                if(this.dataSource.length===0) return;
                this.dataSource = sortData(this.dataSource,col);
                this.filterData();
            },
            changeSize(){
                this.currentPage2 = 1;
                this.handleCurrentChange(1);
            },
            handleSizeChange(val) {},
            handleCurrentChange(val) {
                this.page = val;
                this.filterItemData = this.DB.filter((u, index) => index < this.pageSize * this.page && index >= this.pageSize * (this.page - 1));
            },
            checkedItem(row){
              if(row.checked===true) {
                  if(this.checkedItems.length===0) {
                      this.checkedItems.push(getRowFromArray(row.itemCode, this.DB, "itemCode"));
                  }
                  else if (this.checkedItems.length>0){
                      var a=0;
                      for(let line of this.checkedItems){
                          if(row.itemCode===line.itemCode)
                              a++;
                      }
                      if(a===0){
                          this.checkedItems.push(getRowFromArray(row.itemCode,this.DB,"itemCode"));
                      }
                  }
              } else if(row.checked===false){
                  for(let line of this.checkedItems){
                      if(row.itemCode===line.itemCode)
                            line.checked=false;
                  }
              }
            },
            addDialogData(){
                var data=[];
                for(let line of this.checkedItems){    //this.DB
                    if(line.checked===false){
                        continue;
                    }
                    data.push({
                        itemGuid:line.itemGuid,
                        itemCode:line.itemCode,
                        itemType:line.itemType,
                        itemName_ZH:line.itemName_ZH,
                        itemColor: line.itemColor,
                        nationGuid:line.nationGuid,
                        nation:line.nation,
                        menuClassGuid:line.menuClassGuid,
                        menuClass:line.menuClass,
                        categoriesClassGUID:line.rmClassGuid,
                        itemCost: float(line.itemCostperDish,6),
                        shareQty:line.shareQty,
                        conversionUnit:line.ItemBOM.length===0? "g": line.ItemBOM[0].conversionUnit,
                        purchaseUnitcode: line.ItemBOM.length===0?"":line.ItemBOM[0].purchaseUnit,
                        itemUnitCode:(line.ItemBOM.length===0||line.itemType==='FG')?"PC":line.ItemBOM[0].purchaseUnit,
                        ItemBOM:line.ItemBOM,
                        otherCost:line.otherCost,
                        classSort:line.classSort
                    });
                }
                console.log(data);
                this.$emit('getItemsData',data );
                this.isShowDialog=false;
            },
            load(){
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                GetCompanyInAuth({
                    action: 'menu-data',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.companyOptions = data.content;
                        this.company=this.companyOptions[0].companyCode;
                    }
                    else this.companyOptions = [];
                });
                this.statusOption=[
                    {value:'active',label:this.langData.Valid,key:'active'},
                    {value:'inactive',label:this.langData.Invalid,key:'inactive'},
                ];
                this.status=this.statusOption[0].value;
                this.mainData.itemTypeOption=[{
                        code:'FG',
                        name:this.langData.FG
                    },
                    {
                        code:'RM',
                        name:this.langData.RM
                    }];
                this.mainData.itemType=this.mainData.itemTypeOption[0].code;
            },
            GetMenu(langCode,itemType){
                if(this.options.length>0) return;
                this.loadingMenu=true;
                GetMenu({
                    "":JSON.stringify({
                        langCode:langCode,
                        company:this.DBName,
                        itemType:itemType,
                        costCenterCode: this.costCenterCode,
                        requiredDate: this.RequiredDate
                    })
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.options=[{
                            value:"",
                            label:this.langData.All,
                        }];
                        for(let line of data.content){
                            this.options.push({
                                value:line.value,
                                label:line.label,
                                children:line.children
                            });
                        }
                        if(this.options.length>0){
                            this.itemClass[0]='';
                        }
                    }
                }).catch(()=>{});
            },
            GetMenuClass(){
                if( this.mainData.nationOption.length>0) return;

                this.mainClassTable=[];
                this.cookClassTable=[];
                this.mainData.mainClassOption=[];
                menuClass({
                    langCode:this.user.langCode,
                    itemType:'FG&RM'
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.allData=data.content;
                        this.mainData.nationOption=[];
                        for(let line of data.content){
                            if(line.nationClass.length>0){
                                this.mainData.nationOption=line.nationClass;
                                this.mainData.nation=this.mainData.nationOption[0].guid;
                            }
                            if(line.seasonClass.length>0){
                                this.mainData.seasonClassOption=line.seasonClass;
                                this.mainData.seasonClass=this.mainData.seasonClassOption[0].guid;
                            }
                            if(line.cookwayClass.length>0){
                                this.cookwayData=line.cookwayClass;
                                this.mainData.cookClassOption=line.cookwayClass;
                                this.mainData.cookClass=this.mainData.cookClassOption[0].guid;
                                this.cookClassTable=line.cookwayClass;
                            }
                            if(line.ItemShape.length>0){
                                this.ItemShape=line.ItemShape;
                            }
                            if(line.menuClass.length>0){
                                this.menuData=line.menuClass;
                            }
                            if(line.rmClass.length>0){
                                this.rmData=line.rmClass;
                            }
                        }
                    }
                }).catch(()=>{});
            },
            setcookwaysClass(){
                var disable=true;
                this.cookOption=[];
                this.ItemShapeOption=[];
                this.vShow=true;

                for(let line of this.ItemShape){
                    if(line.pguid===this.itemClass[0]){
                        this.ItemShapeOption.push({guid:line.guid,name:line.name})
                    }
                }
                if(this.ItemShapeOption.length===0){
                    this.ItemShapeClass='';
                } else {
                    var obj=arraySearch(this.ItemShapeClass,this.ItemShapeOption,"guid");
                    if(typeof(obj)=='undefined'||obj.length==0){
                        this.ItemShapeClass='';
                    }
                }

                for(let line of this.cookwayData){
                    if(line.pguid===this.itemClass[0]){
                        this.cookOption.push({guid:line.guid,name:line.name});
                    }
                }
                if(this.cookOption.length===0){
                    this.cookwaysClass='';
                } else {
                    var obj=arraySearch(this.cookwaysClass,this.cookOption,"guid");
                    if(typeof(obj)=='undefined'||obj.length==0){
                        this.cookwaysClass='';
                    }
                }
                if(this.itemClass.length>0){
                    var obj=getRowFromArray(this.itemClass[0],this.options,"value");
                    if(typeof(obj)=='undefined'||obj.length==0){}
                    else{
                        if(this.itemClass.length>1){
                            var obj=getRowFromArray(this.itemClass[this.itemClass.length-1],obj.children,"value");

                            if(typeof(obj)=='undefined'||obj.length==0){
                                disable=false;
                            } else{
                                if(obj.children==null){
                                    disable=false;
                                }
                            }
                            if(disable===false){
                                if(this.cookOption.length===0 && this.ItemShapeOption.length===0){
                                    this.vShow=false;
                                } else if(this.cookOption.length>0 && this.ItemShapeOption.length>0){
                                    if(this.cookwaysClass!=='' && this.ItemShapeClass!==''){
                                        this.vShow=false;
                                    }
                                }
                            }
                        }
                    }
                    this.filterData();
                }
            },
            SearchItem(dbName,requiredDate,requiredQty,costCenterCode){
                this.loadingMenu=true;
                searchItem({
                    "": JSON.stringify({
                        dbName: dbName,
                        requiredDate: requiredDate,
                        requiredQty: requiredQty,
                        costCenterCode: costCenterCode,
                        DynamicFieldsGUID:'0FA83AF6-AFF5-40C2-A30A-936A1BCED945'
                    })
                }).then((data)=>{
                    if(data && data.code==='200'){
                        // Angel 修改：计时
                        //this.getSecond();
                        this.dataSource=data.content;
                        this.filterData();
                        this.loadingMenu=false;
                        // Angel 修改：计时
                        //this.getSecond();
                    }
                }).catch(()=>{
                    console.log('Fail01');
                });
            },
            // Angel 修改：计时
            // getSecond(){
            //     this.content=0;
            //     let clock = window.setInterval(()=>{
            //         this.totalTime++;
            //         this.content = this.totalTime;
            //         if(this.loadingMenu===false){
            //             window.clearInterval(clock);
            //         }
            //      },1000);
            // },

            //筛选dataSource,得到数据列表
            filterData(){
                console.log(this.dataSource);
                if(this.dataSource.length===0){
                    var user = sessionStorage.getItem('user');
                    if (user) {
                        user = JSON.parse(user);
                        this.user = user;
                    }
                    this.GetMenu(this.user.langCode,"FG&RM");
                }
                if(this.dataSource.length===0) {
                    this.$message.error("数据读取有误！请联系系统管理员！");
                    return;
                }
                this.DB=[];
                for(let line of this.dataSource){
                    if(this.itemClass.length > 0 && this.itemClass[this.itemClass.length-1].length>0
                        && this.itemClass[this.itemClass.length-1] != line.categoriesClassGUID
                        && this.itemClass[this.itemClass.length-1] != line.menuClassGUID
                        && this.itemClass[this.itemClass.length-1] != line.nationGUID)
                        continue;
                    if(this.ItemShapeClass.length>0 && this.ItemShapeClass != line.itemShapeGUID)
                        continue;
                    if(this.cookwaysClass.length>0 && this.cookwaysClass != line.cookwayClassGUID)
                        continue;
                    if(this.keyword.trim() != ""
                        && line.itemCode.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1
                        && line.itemName_ZH.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1
                        && line.itemName_EN.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1)
                        continue;
                    if((this.price_minimum.length>0 && line.itemCostperDish-this.price_minimum<0)||(this.price_maximum.length>0 && line.itemCostperDish-this.price_maximum>0))
                        continue;
                    if(this.itemStatus===true && line.itemValidity==='invalid') continue;

                    this.resultfilter(line);
                }
                //分页显示
                this.handleCurrentChange(1);
                this.pageSize = 20;
                this.currentPage2 = 1;
            },
            resultfilter(line){
                var checkeditem=false;
                if(this.checkedItems.length>0){
                    for(let row of this.checkedItems){
                        if(row.itemCode===line.itemCode && row.checked===true)
                            checkeditem=row.checked;
                    }
                }
                var bomVoid=[
                    {
                        actQty:"0.000",
                        bomQty:"0.000",
                        conversionRate:1,
                        conversionUnit:"KG",
                        itemCode:"unKnown",
                        itemCost:"0.000",
                        itemGuid:'CC7B9276-C975-4B7C-96AE-FD66D2C882E6',
                        itemName:"unKnown",
                        itemType:"RM",
                        productGuid:'CC7B9276-C975-4B7C-96AE-FD66D2C882E6',
                        purchasePolicy:"OnDemand",
                        purchasePrice:0,
                        purchaseUnit:"kg",
                        supplierCode:'000000',
                        supplierName:"unKnown",
                        tax:0
                    }
                ];
                this.DB.push({
                    checked:checkeditem,   //false,
                    selected: this.Items.filter((item)=>
                    (typeof(item.itemGuid) == "undefined" || item.itemGuid===line.itemGuid) && item.itemCode===line.itemCode).length > 0,
                    itemGuid:line.itemGuid==null?"":line.itemGuid,
                    itemCode: line.itemCode,
                    itemName_ZH: line.itemName_ZH,
                    itemName_EN: line.itemName_EN,
                    itemType:line.itemType,
                    nation: line.nation,
                    nationGuid: line.nationGUID,
                    menuClass: line.menuClassName,
                    menuClassGuid: line.menuClassGUID,
                    rmClass: line.categoriesClass,
                    rmClassGuid: line.categoriesClassGUID,
                    itemColor: line.itemColor,
                    itemTaste: line.itemTaste,
                    weight: line.weight,
                    itemCostperDish:float(line.itemCostperDish,6),
                    seasonClassGUID: line.seasonClassGUID,
                    conversionUnit:line.ItemBOM.length===0? "g": line.ItemBOM[0].conversionUnit,
                    purchaseUnitcode: line.ItemBOM.length===0?"":line.ItemBOM[0].purchaseUnit,
                    ItemBOM:line.ItemBOM.length===0?bomVoid:line.ItemBOM,
                    otherCost:line.otherCost,
                    itemValidity:line.itemValidity,
                    classSort:line.classSort
                });
            },
            Language(){
                if(JSON.parse(sessionStorage.getItem('user')).langCode==='ZH'){
                    this.langData.selectcompany="请选择公司";
                    this.langData.company="公司";
                    this.langData.keyWord="关键词";
                    this.langData.New="新增";
                    this.langData.Add="添加";
                    this.langData.Categorize="分类";
                    this.langData.Category="类别";
                    this.langData.Search="搜索";
                    this.langData.Valid="有效";
                    this.langData.Invalid="禁用";
                    this.langData.sort="排序";
                    this.langData.Code="代码";
                    this.langData.Brand="品牌"
                    this.langData.Name_ZH="中文名称";
                    this.langData.Name_EN="英文名称";
                    this.langData.specification="规格";
                    this.langData.PurchaseUnit="采购单位";
                    this.langData.PurchasePrice="采购价格";
                    this.langData.conversionUnit="转换单位";
                    this.langData.conversionRate="转换系数";
                    this.langData.Remark="说明";
                    this.langData.Nation="菜式";
                    this.langData.KeyRM="主要原料";
                    this.langData.CookMethods="烹饪方法";
                    this.langData.CookMethods_en="烹饪方法(英语)";
                    this.langData.KeyColor="主要颜色";
                    this.langData.Taste="菜品口味";
                    this.langData.weightperServe="单份重量/克";
                    this.langData.Edit="编辑";
                    this.langData.Revise="修改";
                    this.langData.ChineseMeal="中餐";
                    this.langData.WesternMeal="西餐";
                    this.langData.version="版本";
                    this.langData.MenuClass="菜谱分类";
                    this.langData.MenuClass_en="菜谱分类(英语)";
                    this.langData.NewMenu="新增菜品";
                    this.langData.Chef="厨师";
                    this.langData.City="城市";
                    this.langData.Department="事业部";
                    this.langData.rmClass="主要原料";
                    this.langData.rmClass_en="主要原料(英语)";
                    this.langData.seasonClass="备注属性";
                    this.langData.customerType="消费者类型";
                    this.langData.nutritionDes="营养元素";
                    this.langData.Protein="蛋白质";
                    this.langData.carbohydrate="碳水化合物";
                    this.langData.vitamine="维生素";
                    this.langData.mineral="矿物质元素";
                    this.langData.fat="脂肪含量";
                    this.langData.energy="热量";
                    this.langData.compulsory="必须";
                    this.langData.ClassAndNutrition="分类及营养描述";
                    this.langData.CookingMethodology="烹饪步骤";
                    this.langData.MenuPoint="菜品售卖要点";
                    this.langData.PutIn="请输入";
                    this.langData.picture="图片";
                    this.langData.RM="原料";
                    this.langData.RMOfficialName="菜谱成分";
                    this.langData.RMPercent="原料比例 (%) ";
                    this.langData.effect="加工影响 (%)";
                    this.langData.supplier="供应商";
                    this.langData.RMCode="原料代码";
                    this.langData.RMName="原料名称";
                    this.langData.Recipe="食谱";
                    this.langData.Save="保存";
                    this.langData.BigMeet="大荤";
                    this.langData.SmallMeet="小荤";
                    this.langData.Vegitable="素菜";
                    this.langData.Soup="汤";
                    this.langData.Pork="猪肉";
                    this.langData.Fish="水产";
                    this.langData.poultry="禽类";
                    this.langData.cattlesheep="牛羊畜";
                    this.langData.egg="蛋类";
                    this.langData.leafVegetable="叶菜类";
                    this.langData.StemStemFruit="茎、根、果菜类";
                    this.langData.BeanProduct="豆制品类";
                    this.langData.VegetableSoup="菜汤类";
                    this.langData.ZhenZhuKou="蒸，煮，扣";
                    this.langData.ShaoMen="烧,焖";
                    this.langData.Fry="煎，炸";
                    this.langData.Toast="烤";
                    this.langData.DragUpload="将文件拖到此处，或";
                    this.langData.ClickUpload="点击上传";
                    this.langData.PicFormatSize="只能上传jpg/png文件，且不超过500kb";
                    this.langData.Red="红色";
                    this.langData.Salty="咸鲜";
                    this.langData.weightPerServe="单份重量(克）";
                    this.langData.RMweight="重量";
                    this.langData.MeatPaste="肉酱";
                    this.langData.DicedLotus="藕末";
                    this.langData.NewClass="新增分类";
                    this.langData.NewItem="新建食材";
                    this.langData.NewFlavor="新建调味品";
                    this.langData.flavoring="调味品";
                    this.langData.Practise="操作";
                    this.langData.Delete="删除";
                    this.langData.incompleteInfo="信息不全，无法添加";
                    this.langData.flavorweight="重量（克）";
                    this.langData.overZero="必须大于0";
                    this.langData.underHundred="百分比必须小于100%";
                    this.langData.betweenMandPHundred="百分比必修介于-100%到100%之间";
                    this.langData.noduplicateCodeinRecipe="食谱中不能有相同的原料";
                    this.langData.noduplicateCodeinFlavor="调味品中不能有相同的原料";
                    this.langData.table="列表";
                    this.langData.noblank="不能为空";
                    this.langData.FG="成品";
                    this.langData.Type="类型";
                    this.langData.Creator="创建者";
                    this.langData.CreatTime="创建时间";
                    this.langData.shareQty="份数";
                    this.langData.All="(所有)";
                    this.langData.Price="采购价格";
                    this.langData.purchase="采购";
                    this.langData.or="或者";
                    this.langData.itemCost="成本";
                    this.langData.ItemShape="主料形状";
                    this.langData.Qty="数量";
                    this.langData.purchaseQty="采购数量";
                    this.langData.purchaseUnitcode="采购单位";
                    this.langData.Unitcode="单位";
                    this.langData.Note="备注";
                    this.langData.InputRuleforRM="食谱原料生重的输入基数为： ";
                    this.langData.perShareweight="每份重量";
                    this.langData.perShare="每份例";
                    this.langData.totalShareQty="总份数为";
                    this.langData.InputRuleforFlavor="调味品数量的输入基数为： ";
                    this.langData.share="份";
                    this.langData.CostPerServe="单份成本";
                }
                else{
                    this.langData.selectcompany="Please select company";
                    this.langData.company="Site";
                    this.langData.keyWord="Key Word";
                    this.langData.New="Add";
                    this.langData.Add="Add";
                    this.langData.Categorize="Classify";
                    this.langData.Search="Search";
                    this.langData.Valid="Active";
                    this.langData.Invalid="inactive";
                    this.langData.sort="sort";
                    this.langData.Code="Code";
                    this.langData.Brand="Brand";
                    this.langData.Name_ZH="Chinese Name";
                    this.langData.Name_EN="English Name";
                    this.langData.specification="specification";
                    this.langData.PurchaseUnit="Purchase Unit";
                    this.langData.PurchasePrice="Purchase Price";
                    this.langData.conversionUnit="Conversion Unit";
                    this.langData.conversionRate="Conversion Rate";
                    this.langData.Remark="Remark";
                    this.langData.Nation="Nation";
                    this.langData.KeyRM="Main RM";
                    this.langData.CookMethods="Cooking Methods";
                    this.langData.CookMethods_en="Cooking Methods(English)";
                    this.langData.KeyColor="Color";
                    this.langData.Taste="Taste";
                    this.langData.weightperServe="weight Per Dish/g";
                    this.langData.Edit="Edit";
                    this.langData.Revise="Revise";
                    this.langData.ChineseMeal="Chinese";
                    this.langData.WesternMeal="Western";
                    this.langData.version="version";
                    this.langData.MenuClass="Menu Class";
                    this.langData.MenuClass_en="Menu Class(English)"
                    this.langData.NewMenu="Add New Menu";
                    this.langData.Chef="Chef";
                    this.langData.City="City";
                    this.langData.Department="Department";
                    this.langData.rmClass="Raw Material Class";
                    this.langData.rmClass_en="Main RM(English)";
                    this.langData.seasonClass="Remark";
                    this.langData.customerType="Customer Type";
                    this.langData.nutritionDes="Nutrition";
                    this.langData.Protein="Protein";
                    this.langData.carbohydrate="Carbohydrate";
                    this.langData.vitamine="Vitamine";
                    this.langData.mineral="Mineral Materials";
                    this.langData.fat="Fat";
                    this.langData.energy="Energy";
                    this.langData.compulsory="Compulsory";
                    this.langData.ClassAndNutrition="Classification and Nutrition";
                    this.langData.CookingMethodology="Cooking Methodology";
                    this.langData.MenuPoint="Making & Selling Points";
                    this.langData.PutIn="Please fulfill ";
                    this.langData.picture="Picture";
                    this.langData.RM="Raw Material ";
                    this.langData.RMOfficialName="Official RM Name";
                    this.langData.RMPercent="RM (%)";
                    this.langData.effect="Process Effect (%)";
                    this.langData.supplier="Supplier";
                    this.langData.RMCode="RM Code";
                    this.langData.RMName="RM Name";
                    this.langData.Recipe="Recipe";
                    this.langData.Save="Save";
                    this.langData.BigMeet="Meat";
                    this.langData.SmallMeet="Half Meet,half Vegetable";
                    this.langData.Vegitable="Vegetable";
                    this.langData.Soup="Soup";
                    this.langData.Pork="Pork";
                    this.langData.Fish="Aquatic Product";
                    this.langData.poultry="Poultry";
                    this.langData.cattlesheep="Cattle & Sheep";
                    this.langData.egg="Egg";
                    this.langData.leafVegetable="Leaf Vegetable";
                    this.langData.StemStemFruit="Stem,root & Fruit";
                    this.langData.BeanProduct="Bean Products";
                    this.langData.VegetableSoup="Vegetable Soup";
                    this.langData.ZhenZhuKou="Steam & Boiled";
                    this.langData.ShaoMen="Braise";
                    this.langData.Fry="Fry";
                    this.langData.Toast="Toast";
                    this.langData.DragUpload="Drog File here or ";
                    this.langData.ClickUpload="click to Upload";
                    this.langData.PicFormatSize="jpg or png only with maximum size of 500kb";
                    this.langData.Red="Red";
                    this.langData.Salty="Salty";
                    this.langData.weightPerServe="weight (g)";
                    this.langData.RMweight="weight of RM";
                    this.langData.MeatPaste="Meat Paste";
                    this.langData.DicedLotus="Louts Root";
                    this.langData.NewClass="Edit Class";
                    this.langData.NewItem="New RM";
                    this.langData.NewFlavor="New Flavor";
                    this.langData.flavoring="Flavoring ";
                    this.langData.Practise="Action";
                    this.langData.Delete="Delete";
                    this.langData.incompleteInfo="No item added due to incomplete information";
                    this.langData.flavorweight="weight of Flavor (g) ";
                    this.langData.overZero=" must be more than zero";
                    this.langData.underHundred=" percentage must be less than 100%";
                    this.langData.betweenMandPHundred="Percentage must be over than -100% and less than 100%";
                    this.langData.noduplicateCodeinRecipe="No duplicated ingredients in one recipe";
                    this.langData.noduplicateCodeinFlavor="No duplicated ingredients in one recipe's flavor";
                    this.langData.table="Table";
                    this.langData.noblank=" cannot be zero";
                    this.langData.FG="Finished Goods";
                    this.langData.Type="Type";
                    this.langData.Creator="Creator Name";
                    this.langData.CreatTime="Creat Time";
                    this.langData.shareQty="Share Qty";
                    this.langData.All="(All)";
                    this.langData.Price="Purchase Price";
                    this.langData.purchase="Purchase";
                    this.langData.or="or";
                    this.langData.itemCost="Cost";
                    this.langData.ItemShape="Item Shape";
                    this.langData.Qty="Quantity";
                    this.langData.purchaseQty="Purchase Quantity";
                    this.langData.purchaseUnitcode="Purchase Unit";
                    this.langData.Unitcode="Unit";
                    this.langData.Note="Note";
                    this.langData.InputRuleforRM="Please input weight for each raw materical in this recipe according to the baseline of ";
                    this.langData.perShare="per dish";
                    this.langData.totalShareQty=" with total dish quantities of ";
                    this.langData.InputRuleforFlavor="Please input weight for each flavor in this recipe according to the baseline of ";
                    this.langData.dish=" dishes";
                    this.langData.CostPerServe="Cost Per Share";
                }
            },
            float(price, fix) {
                return float(price, fix);
            },
            BGColor(row){
                return "background-color:"+row
            },

        }
    }
</script>

<style>
    /*由Angel修改*/
    .deleteOption {
        text-decoration:line-through
    }

    .expand .el-table__expand-column .cell {
        display: none;
    }
</style>