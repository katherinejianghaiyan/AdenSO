<template>
    <section v-loading="loading" element-loading-text="请稍候...">
        <el-row style="margin-bottom:-10px;background-color: #F3F3F4">
            <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                <!--<el-button size="small" type="primary" @click="addNewPriceList">新增</el-button>-->
                <el-select v-model="companySite" size="small" filterable @change="getPriceList">
                    <el-option v-for="item of companyOptions"
                               :key="item.value"
                               :value="item.value" :label="item.label"
                    ></el-option>
                </el-select>
                <el-input size="small" placeholder="代码/名称" v-model="keyWord" style="width: 40%;" @change="getPriceList"></el-input>
                <el-button size="small" type="success" style="float:right" @click="savePriceList">保存</el-button>
            </el-col>
            <el-table
                    :data="priceList"
                    stripe
                    border
                    :height="450"
                    size="mini">
            <el-table-column type="index" align="center" width="80">
            </el-table-column>
            <el-table-column label="代码" width="100" align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <span>{{scope.row.itemCode}}</span>
                </template>
            </el-table-column>
            <el-table-column label="中文名称" align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <span>{{scope.row.itemName_ZH}}</span>
                </template>
            </el-table-column>
            <el-table-column label="英文名称" align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <span>{{scope.row.itemName_EN}}</span>
                </template>
            </el-table-column>
             <el-table-column label="图片" align="center">
                 <template slot-scope="scope">
                    <img :src="scope.row.itemImage" width="100" height="50" />
                 </template>
             </el-table-column>
             <el-table-column label="容器" align="center" width="100" :show-overflow-tooltip="true">
                 <template slot-scope="scope">
                     <span>{{scope.row.container}}</span>
                 </template>
             </el-table-column>
             <el-table-column label="重量/单份" align="center" width="80" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <span>{{scope.row.itemWeight}}</span>
                    </template>
             </el-table-column>
            <el-table-column label="单价(CNY)" align="center" width="100" >
                <template slot-scope="scope">
                    <number-input v-model="scope.row.itemPrice" size="small" validType="+decimal" @change.native="resetPrice(scope.row)"
                                  @keydown.tab.native="setFocus(scope.$index)"
                    ></number-input>
                </template>
            </el-table-column>
            <el-table-column label="开始日期" align="center" width="140">
                <template slot-scope="scope">
                    <el-date-picker type="date" placeholder="选择日期" v-model="scope.row.startDate" size="small" style="width:100%"
                                    :editable="false"></el-date-picker>
                </template>
            </el-table-column>
            <!--<el-table-column label="结束日期" align="center" width="140">-->
                <!--<template slot-scope="scope">-->
                    <!--<el-date-picker type="date" placeholder="选择日期" v-model="scope.row.endDate" size="small" style="width:100%"-->
                                    <!--:editable="false" :clearable="false"></el-date-picker>-->
                <!--</template>-->
            <!--</el-table-column>-->
        </el-table>
        </el-row>

    </section>
</template>

<script>
    import NumberInput from '../../components/NumberInput.vue'
    import {isNullOrWhiteSpace,getRowFromArray} from '../../assets/js/common';
    import { GetCompanySite,GetPriceList,UpdateFGItemPrice } from '../../api/api'
    export default {
        components:{
            'number-input': NumberInput,
        },
        data(){
            return{
                fullHeight: document.documentElement.clientHeight || document.body.clientHeight-260,
                loading:false,
                companySite:'',
                companyOptions:[],
                keyWord:'',
                priceList:[],
                priceList_bak:[],
                dialogVisible:false,
                dialogTitle:'',

                newFG:'',
                newFGOption:[],
                newPrice:'0.0',
                newStartDate:'',
                focusCtrl:0,
                currentFocusIndex:0
            }
        },
        created(){
          //获取公司列表
          this.setCompany();
        },
        methods:{
            //获取登录人信息
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
                this.loading=true;
                GetCompanySite({
                    action: 'site-pricelist',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.companyOptions=[];
                        for(let line of data.content){
                            if(isNullOrWhiteSpace(line.dbName)){
                                for(let row of line.siteList){
                                    this.companyOptions.push({
                                        value:row.siteGuid,
                                        label:row.companyCode+' - '+row.costCenterCode,
                                        note:"siteguid"
                                    });
                                }
                            } else if(!isNullOrWhiteSpace(line.dbName)){
                                this.companyOptions.push({
                                    value:line.companyGuid,
                                    label:line.dbName+' / '+line.companyName_ZH,
                                    note:"buguid"
                                });
                                for(let row of line.siteList){
                                    this.companyOptions.push({
                                        value:row.siteGuid,
                                        label:row.companyCode+' - '+row.costCenterCode,
                                        note:"siteguid"
                                    })
                                }
                            }
                        }
                        if(this.companyOptions.length>0){
                            this.companySite=this.companyOptions[0].value;
                        }
                        this.getPriceList();
                    }
                    else {
                        this.loading=false;
                    }
                }).catch(()=>{
                    this.loading=false;
                    console.log('Fail getSite');
                });
            },

            //获取价目表
            getPriceList(){
              this.loading=true;

              if(this.companySite.length==0){
                  this.loading=false;
                  return;
               }
               GetPriceList({
                    "":JSON.stringify({
                        addr:this.companySite,
                        keyWord:this.keyWord,
                        mark:'PriceList'
                    })
               }).then(data=>{
                    if(data && data.code==='200'){
                        //var reg = new RegExp('\', "g");
                        this.priceList=data.content;
                        for(let line of this.priceList){
                            //初始价格
                            line.itemPrice=line.itemPrice===0?'':line.itemPrice+'';
                            //备份价格
                            line.itemPrice_bak=line.itemPrice;
                            //初始化开始日期
                            line.startDate=line.itemPrice===''? '':line.startDate;
                            //备份开始日期
                            line.startDate_bak=line.itemPrice===''? '':line.startDate;
                            //备份结束日期
                           //line.endDate_bak=line.endDate;
                            //图片样式
                            line.itemImage=line.itemImage.replace('\\', '\/').replace('\\', '\/');
                        }
                        //备份价目表数据源
                        this.priceList_bak=this.priceList;
                        this.loading=false;
                    } else{
                        this.loading=false;
                        this.priceList=[];
                        this.priceList_bak=[];
                    }
                }).catch(()=>{
                    console.log('Fail');
                    this.loading=false;
                });
            },
            setFocus(index){
                this.focusCtrl=index;
                this.currentFocusIndex=index;
            },

            //保存修改过的销售价目表
            savePriceList(){
                var revisedItem=[];
                for(let line of this.priceList){
                    //if(line.itemPrice-line.itemPrice_bak===0 && line.startDate_bak===line.startDate && line.endDate_bak===line.endDate)

                    if(line.itemPrice-line.itemPrice_bak===0 &&
                        (line.startDate_bak===line.startDate || new Date(new Date(line.startDate_bak).getFullYear(),new Date(line.startDate_bak).getMonth(),new Date(line.startDate_bak).getDate()) -
                        new Date(new Date(line.startDate).getFullYear(),new Date(line.startDate).getMonth(),new Date(line.startDate).getDate())===0)){
                        continue;
                    }

                    //var eDate=line.endDate;
                    var sDate=line.startDate;
                    var oldDate=line.startDate_bak;

                    if(sDate===null){
                        this.$message.error("修改项的开始日期不可为空");
                        return;
                    }
                    revisedItem.push({
                        itemGuid:line.itemGUID,
                        itemPrice:line.itemPrice,
                        oldStartDate:oldDate===null?null:typeof(oldDate.length)==="undefined"? (oldDate.getFullYear()+'-'+ ((oldDate.getMonth()+1)<10?'0'+(oldDate.getMonth()+1):(oldDate.getMonth()+1))+'-'+
                            (oldDate.getDate()<10?'0'+oldDate.getDate():(oldDate.getDate()))) :oldDate,
                        startDate: sDate===null?null:typeof(sDate.length)==="undefined"? (sDate.getFullYear()+'-'+ ((sDate.getMonth()+1)<10?'0'+(sDate.getMonth()+1):(sDate.getMonth()+1))+'-'+
                            (sDate.getDate()<10?'0'+sDate.getDate():(sDate.getDate()))) :sDate,
                        // endDate: typeof(eDate.length)==="undefined"? (eDate.getFullYear()+'-'+ ((eDate.getMonth()+1)<10?'0'+(eDate.getMonth()+1):(eDate.getMonth()+1))+'-'+
                        // (eDate.getDate()<10?'0'+eDate.getDate():(eDate.getDate()))) :eDate,
                    });

                }
                if (revisedItem.length===0){
                    this.$message.info("没有修改项");
                    return;
                } else{
                    UpdateFGItemPrice({
                        "":JSON.stringify({
                            data:revisedItem,
                            addr:this.companySite,
                            changeFlag:'update',
                            note:getRowFromArray(this.companySite,this.companyOptions,"value").note
                        })
                    }).then(data=>{
                        if(data && data.code==="200"){
                            this.keyWord='';
                            this.getPriceList();
                            this.$message.success("销售价目表已经修改")
                        }
                    }).catch(()=>{
                        console.log("Fail");
                    });
                }
            },

            //调整价格时，开始日期默认为明天
            resetPrice(row){
                let today=new Date();
                let tomorrow=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
                if((row.itemPrice_bak===0||row.itemPrice_bak==='') && row.itemPrice>0){
                    row.startDate= today;
                }
                else if (row.itemPrice_bak>0 && row.itemPrice>0){
                    row.startDate= tomorrow;
                }
            }
        }
    }
</script>

<style>
    @import '../../assets/css/common.css';
</style>