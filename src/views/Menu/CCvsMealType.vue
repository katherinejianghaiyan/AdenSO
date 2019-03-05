<template>
    <div style="background-color: #F3F3F4">
    <section v-loading="v_loading"
            element-loading-text="请稍后...">
        <el-row>
            <el-form :inline="true">
                <el-form-item label="公司">
                    <el-select size="small" v-model="company" @change="GetCostCenter">
                        <el-option v-for="item in companyOption" :label="item.label" :value="item.value" :key="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="成本中心">
                    <el-select size="small" v-model="costCenterCode" @change="setWindow" :disabled="costCenterCode===''">
                        <el-option v-for="item in ccOption" :label="item.label" :value="item.value" :key="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item style="margin-right:3%">
                    <el-button size="small" type="primary" @click="addWindow">添加档口</el-button> <!--:disabled="item.length===0"-->
                </el-form-item>
                <el-form-item>
                    <el-button size="small" type="success" @click="save" :disabled="item.length===0">保存</el-button>
                </el-form-item>
            </el-form>
            <el-tag v-if="item.length===0">无档口信息</el-tag>
        </el-row>
        <div>
            <el-table :data="item" v-if="item.length>0" stripe>
                <el-table-column label="档口" width="200" :resizable="false" text-align="center" header-align="center">
                    <template slot-scope="scope">
                        <el-autocomplete
                           style="width:100%"
                           class="inline-input" v-model="scope.row.windowName"
                           :trigger-on-focus="true"
                           :fetch-suggestions="querySearch"
                           placeholder="请输入内容"
                           @select="refreshWindow(scope.row)"
                           @change.native="updateWindow(scope.row)"
                           @click.native="$event.target.select()"
                           :disabled="scope.row.windowGuid!==''&& typeof(scope.row.windowGuid)!=='undefined'">
                        </el-autocomplete>
                    </template>
                </el-table-column>
                <el-table-column label="排序" width="80" :resizable="false" header-align="center" align="center">
                    <template slot-scope="scope">
                        <number-input validType="+int" v-model="scope.row.sort"></number-input>
                    </template>
                </el-table-column>
                <el-table-column label="windowGuid" v-if="false">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.windowGuid"></el-input>
                    </template>
                </el-table-column>
                <el-table-column v-for="a in colMealType" :key="a.productDesc" :label="a.productDesc" :prop="a.productDesc" align="center">
                    <template slot-scope="scope">
                        <el-checkbox v-for="row in scope.row.db" :key="row.productDesc" v-if="row.productDesc===a.productDesc" v-model="row.status"></el-checkbox><!--v-if="row.productDesc===a.productDesc"-->
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </section>
   </div>
</template>

<script>
    import NumberInput from '../../components/NumberInput.vue'
    import {isNullOrWhiteSpace, arraySearch, getRowFromArray, createFilter, deepCopy, sortData} from '../../assets/js/common';
    import {CCandMealType,GetUserCompany,NewCCWindowMeal,GetActCostCenter} from '../../api/api'

    export default{
        components: {
            'number-input': NumberInput,
        },
        created(){
            //加载公司列表
            this.GetUserCompany();
        },
        data(){
            return{
                v_loading:false,
                user:'',
                company:'',
                companyOption:[],
                costCenterCode:'',
                ccOption:[],
                colMealType:[],
                mealType:[],
                mealTypeOptions:[],
                windowOptions:[],
                item:[],
                item_back:[],
                checkRange:[],
                itemlength:0
            }
        },
        methods: {
            //根据所选公司，获取成本中心
            GetCostCenter(db){
                this.ccOption=[];
                GetActCostCenter({
                    code:db
                }).then(data=>{
                    if(data && data.code==='200'){
                        for(let item of data.content){
                            this.ccOption.push({
                                label: item.code +' / '+ item.name1,
                                value: item.code,
                            });
                        }
                    }
                    else if(data && data.code==='500'){
                        this.ccOption=[{label: '(None)', value: ''}];
                    }
                    this.costCenterCode=this.ccOption[0].value;
                    if(this.costCenterCode!==''){
                        //获取档口和餐次
                        this.setWindow();
                    } else {
                        this.item=[];
                    }
                }).catch(()=>{
                    console.log('error');
                });
            },
            //获取档口和餐次
            GetItems(data){
                this.v_loading=true;
                this.item=[];
                this.checkRange=[];
                this.item_back=[];
                this.colMealType=[];
                this.windowOptions=[];
                CCandMealType({
                    costCenterCode:data
                }).then(data=>{
                    if(data && data.code==='200'){
                        console.log(data.content);
                        //该成本中心下有效餐次选项列表
                        this.colMealType = data.content.productType;
                        //该成本中心下有效档口选项列表
                        this.windowOptions=data.content.windowOptions;

                        if(data.content.mealType!==null){
                            for(let line of data.content.mealType){

                                var db=[];
                                //已选窗口匹对
                                    for (let item of data.content.productType) {
                                        if(item.validwd===null) continue;
                                        if(typeof(this.getRowFromArray(line.windowGuid,item.validwd,"windowGuid"))==='undefined') continue;
                                        if(typeof(this.getRowFromArray(line.windowGuid,item.validwd,"windowGuid").windowGuid===line.windowGuid)) {
                                            db[0] = line.windowGuid;
                                            db.push({
                                                windowGuid:line.windowGuid,
                                                productDesc: item.productDesc,
                                                status: item.status,
                                                soItemGuid: item.soItemGuid
                                            });
                                        }
                                    line.db=db;
                                }
                                line.presort=line.sort+' ';
                                line.sort=line.sort+' ';
                                line.value=line.windowName;

                                this.item.push(line);
                            }

                            for(let row of data.content.productType){
                                for(let line of this.item){
                                    if(typeof(this.getRowFromArray(row.productDesc,line.db,"productDesc"))!=='undefined') continue;
                                        line.db.push({productDesc: row.productDesc,status:false,soItemGuid:row.soItemGuid}); //,itemGuid:row.itemGuid
                                    }
                            }
                        }
                        else if (data.content.mealType===null){
                            //对没有窗口的营运点添加餐次和窗口信息
                            this.addWindow();
                        }
                        if(this.item.length>0){
                            for(let row of this.item){
                                //备份
                                this.item_back.push(row.db);
                            }
                        }
                        this.v_loading=false;
                    }
                }).catch(()=>{
                    console.log('Fail');
                    this.v_loading=false;
                });
            },
            //获取用户的公司
            GetUserCompany(){
              this.companyOption=[];
              var user=sessionStorage.getItem('user');
              if(user){
                user=JSON.parse(user);
                this.user=user;
              }
              GetUserCompany({
                  userId:this.user.userGuid
                }).then(data=>{
                  if(data && data.code==='200'){
                      for(let line of data.content){
                          this.companyOption.push({
                              label: line.company +' / '+line.name_ZH,
                              value: line.company,
                          });
                      }
                      //默认显示公司列表中的第一个选项
                      this.company=this.companyOption[0].value;

                      if(this.companyCode!==null && this.companyCode!=="undefined"){
                          //加载成本中心列表
                          this.GetCostCenter(this.company);
                      }
                  }
              }).catch(()=>{
                  console.log('Fail');
              });
            },
            //获取档口和餐次
            setWindow(){
               if(this.costCenterCode===''||this.costCenterCode===null) return;
                this.GetItems(this.costCenterCode);
            },
            //排除录入相同的档口
            checkDouble(row){
                var a=0;
                for(let line of this.item){
                    if(line.windowName===row.windowName){
                        a++;
                    }
                }
                if(a>1){
                    this.$message.error('档口不可重复！');
                    row.value='';
                    row.windowGuid='';
                    row.windowName='';
                    this.GetItems(this.costCenterCode);
                }
            },
            //选择档口，刷新相应的餐次信息
            refreshWindow(row){
                row.value=row.windowName;
                row.costCenterCode=this.costCenterCode;
                row.db=[];

                for(let line of this.windowOptions){
                        if(line.value!==row.value) continue;
                        row.windowGuid=line.windowGuid;
                }


                for(let b of this.item_back){
                    if(row.windowGuid!==b[0]) continue;
                    row.db=b;
                }
                if(row.db.length===0){
                    for(let line of this.colMealType){
                        row.db[0]=row.windowGuid;
                        row.db.push({productDesc: line.productDesc,status:false,soItemGuid:line.soItemGuid}); //,itemGuid:line.itemGuid
                    }
                }
                this.checkDouble(row);
            },
            //输入查询档口，刷新餐次信息
            updateWindow(row){
                row.value='';
                row.windowGuid='';
                if(this.windowOptions!==null){
                    this.refreshWindow(row);
                }
                this.checkDouble(row);
            },
            querySearch(queryString, cb) {
                var windowOptions = this.windowOptions;
                var results = [];
                if(windowOptions!==null) {
                    results = queryString ? windowOptions.filter(createFilter(queryString, "value", "contain")) : windowOptions;
                }
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            //新增档口
            addWindow(){
                if(this.item!==[] && this.item!==null){
                    for(let line of this.item){
                        if(line.windowName.length>0) continue;
                        this.$message.error('有空行,请输入,,,');
                        return;
                    }
                }
                //新增档口
                this.item.push({
                    value:'',
                    costCenterCode: this.costCenterCode,
                    windowGuid: '',
                    prewindowGuid:'',
                    sort:'',
                    presort:'',
                    windowName:'',
                    checkedMealType: this.colMealType,  //['早餐','午餐','晚餐','夜宵','深夜餐','每日餐饮服务费'],
                    precheckedMealType:[],
                    db:[]
                 });

                for(let row of this.colMealType){
                    for(let line of this.item){
                        if(typeof(this.getRowFromArray(row.productDesc,line.db,"productDesc"))!=='undefined') continue;
                        line.db.push({productDesc: row.productDesc,status:false,soItemGuid:row.soItemGuid}); //,itemGuid:row.itemGuid
                    }
                }
            },
            save(){
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
               if(this.item.length===0) {
                   this.$message.error('没有数据可保存');
                   return;
               } else if(this.item.length>0){
                   //参数
                   var menu=[];
                   var windowOptions=[];
                   var ccwindowMeals=[];
                   for(let line of this.item){
                       if(line.windowName.length===0) continue;
                       var MealStatus=[];

                        windowOptions.push({
                            windowGuid:line.windowGuid,
                            windowName:line.windowName,
                            sort:line.sort
                        });
                       for(let row of line.db){
                           if(typeof(row.productDesc)==='undefined') continue;
                           var soItem=[];
                           for(let item of this.colMealType){
                               if(item.productDesc!==row.productDesc) continue;
                               for(let line of item.soItemGuid){
                                   soItem.push({itemGuid:line.itemGuid});
                               }
                           }

                           MealStatus.push({
                               productDesc:row.productDesc,
                               status:row.status,
                               validItem: soItem
                           });
                        }

                        ccwindowMeals.push({
                           windowName:line.windowName,
                           windowGuid: line.windowGuid,
                           sort:line.sort,
                           mealStatus:MealStatus
                        });
                   }

                   menu.userId=this.user.userGuid;
                   menu.costCenterCode=this.costCenterCode;
                   menu.windowOptions=windowOptions;
                   menu.ccWindowMeals=ccwindowMeals;

                   console.log(menu);
                   //存盘并刷新界面
                   this.v_loading=true;
                   NewCCWindowMeal(menu).then(data=>{
                       if(data && data.code==='200'){
                           this.setWindow();
                           this.$message.success("数据保存成功");
                       }
                       else{
                           this.$message.error("没有餐次数据需要保存");
                           this.GetItems(this.costCenterCode);
                           this.v_loading=false;
                       }
                   }).catch(()=>{
                       this.$message.error("数据保存失败");
                       this.v_loading=false;
                   });
               }
            },
            loadAll() {
                return this.windowOptions;
            },
            getRowFromArray(value, array, code) {
                return getRowFromArray(value, array, code);
            },
        },
        mounted() {
           this.windowOptions  = this.loadAll();
        }
    }
</script>

<style>
    @import '../../assets/css/common.css';
</style>