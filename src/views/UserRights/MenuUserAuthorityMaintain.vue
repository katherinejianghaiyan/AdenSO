<template>
    <div style="background-color: #F3F3F4">
    <section v-loading="v_loading"
             element-loading-text="请稍后..."
             style="background-color: #F3F3F4">
        <br>
        <el-row style="margin-left:25%">
            <el-col :span="24">
                <span>用户名：</span>
                <el-input size="small" style="width:33%" v-model="keyWord">
                  <el-button slot="append" size="small" type="primary" @click="searchUserMenu">确定</el-button>
                </el-input>
            </el-col>
        </el-row>

         <el-form :inline="true" style="margin-top: 2%;margin-left:20%" class="demo-form-inline" v-if="showForm">
             <el-form-item>
                <el-card style="min-width:200px;min-height:460px">
                    <div>
                        <span>菜单</span>
                        <el-button style="float:right;" type="text"><span style="font-size:12px">保存</span></el-button> &nbsp;&nbsp;
                        <el-button style="float:right;" type="text"><span style="font-size:12px" @click="newUserMenu">修改</span></el-button>
                    </div>
                    <div v-for="o in userMenu">
                        <el-checkbox @change="setCompany(o)" v-model="o.check">{{o.menuName}}</el-checkbox>
                    </div>
                </el-card>
             </el-form-item>
             <el-form-item>
                <el-card style="min-width:200px;min-height:460px">
                    <div>
                        <span>公司</span>
                        <el-button style="float:right;" type="text"><span style="font-size:12px" v-if="validMenu">保存</span></el-button>
                        <el-button style="float:right;" type="text"><span style="font-size:12px" @click="newUserCompany" v-if="validMenu">修改</span></el-button>
                    </div>
                    <div v-for="o in userCompany">
                        <el-checkbox @change="setSite(o)" v-model="o.check">{{o.companyName}}</el-checkbox>
                    </div>
                </el-card>
             </el-form-item>
             <el-form-item>
                 <el-card style="min-width:200px;min-height: 460px">
                     <div>
                         <span>营运点</span>
                         <el-button style="float:right;" type="text"><span style="font-size:12px" v-if="">保存</span></el-button>
                         <el-button style="float:right;" type="text"><span style="font-size:12px" @click="" v-if="">修改</span></el-button>
                     </div>
                     <div>

                     </div>
                 </el-card>
             </el-form-item>
         </el-form>

        <el-dialog
            title="权限设置"
            :visible.sync="dialogVisible">
            <el-transfer
                    style="min-height: 90%"
                    v-if="transferbox==='1'"
                    filterable
                    :titles="['所有菜单权限', '已有菜单权限']"
                    :filter-method="filterMethod"
                    filter-placeholder="请输入菜单名称"
                    v-model="value1"
                    :data="data1">
            </el-transfer>
            <el-transfer
                    style="min-height: 90%"
                    v-if="transferbox==='2'"
                    filterable
                    :titles="['所有公司权限', '已有公司权限']"
                    :filter-method="filterMethod"
                    filter-placeholder="请输入公司名称"
                    v-model="value2"
                    :data="data2">
            </el-transfer>
            <el-button type="primary" @click="confirm(transferbox)">操作</el-button>
        </el-dialog>
    </section>
    </div>
</template>

<script>
    import{ AssignRights } from '../../api/api'
    export default{
        created(){
           this.AssignUserRights();
        },
        data(){
            //设置穿梭框数据
            const generateData1=_=>{
                this.load();
                const data=[];
                const items=[];
                for(let line of this.menuSource){
                    items.push({
                        menuName: line.menuName,
                        menuGuid:line.menuGuid
                    });
                }
                const userMenu=items;
                userMenu.forEach((item)=>{
                    data.push({
                        label:item.menuName,
                        key:item.menuGuid
                    });
                });
                return data;
            };
             const generateData2=_=>{
                 this.load();
                 const data=[];
                 const items=[];
                 for(let line of this.compSource){
                     items.push({
                         companyCode: line.companyCode,
                         companyName:line.companyName
                     });
                 }
                 const userMenu=items;
                 userMenu.forEach((item)=>{
                     data.push({
                         label:item.companyName,
                         key:item.companyCode
                     });
                 });
                 return data;
             };
            return{
                keyWord:'',
                v_loading:false,
                data1: generateData1(),
                value1:[],
                data2: generateData2(),
                value2:[],
                transferbox:'',
                filterMethod(query,item){
                    return item.label.indexOf(query)>-1;
                },
                userMenu:[],
                userCompany:[],
                dialogVisible:false,
                menuSource:[],
                compSource:[],
                showForm:false,
                preuserMenu:'',
                preuserCompany:''
            }
        },
        computed:{
            validMenu(){
                var i=0;
                if(this.userMenu.length===0) return false;
                for(let line of this.userMenu){
                    if(line.check===false) continue;
                    i++;
                }
                if(i>0)
                    return true;
            },
        },
        methods:{
             load(){
                 this.compSource=[
                     {
                         companyCode:'120',
                         companyName:'上海',
                         check:false
                     },
                     {
                         companyCode:'100',
                         companyName:'北京',
                         check:false
                     }
                 ];
                 this.menuSource=[
                     {
                         userName:'steve.weng',
                         userGuid:'002',
                         menuGuid:'001',
                         menuName:'客户信息',
                         userComp:[
                             {
                                 companyCode:'120',
                                 companyName:'上海',
                                 check:false
                             }
                         ],
                         check:false
                     },
                     {
                         userName:'steve.weng',
                         userGuid:'002',
                         menuGuid:'002',
                         menuName:'公司信息',
                         userComp:[
                             {
                                 companyCode:'100',
                                 companyName:'北京',
                                 check:false
                             }
                         ],
                         check:false
                     },
                     {
                         userName:'steve.weng',
                         userGuid:'002',
                         menuGuid:'003',
                         menuName:'财务-售后活动',
                         userComp:[
                             {
                                 companyCode:'100',
                                 companyName:'北京',
                                 check:false
                             },
                             {
                                 companyCode:'120',
                                 companyName:'上海',
                                 check:false
                             }
                         ],
                         check:false,
                     }
                 ];
                 this.userMenu=[];
                 this.userMenu.change=false;
                 this.userCompany=[];
                 this.userCompany.change=false;
             },

             //搜索用户菜单权限
            searchUserMenu(){
                this.userMenu=[];
                this.userCompany=[];
                this.showForm=false;
                if(this.keyWord===''||this.keyWord.length===0) return;

                for(let line of this.menuSource){
                    if(line.userName.toUpperCase().indexOf(this.keyWord.toUpperCase()) > -1){
                       line.check=false;
                       this.userMenu.push(line);
                    }
                }
                if(this.userMenu.length===0){
                    this.$confirm('用户不存在，是否想要添加新的用户权限？','提示',{
                        confirmButtonText:'确定',
                        cancelButtonText:'取消',
                        type:'question'
                    }).then(()=>{
                        this.showForm=true;
                    }).catch(()=>{
                        return;
                    })
                } else{
                    this.showForm=true;
                }
            },
            //搜索用户菜单下的公司权限
            setCompany(o){
               this.userCompany=[];
               if(o.check===true) this.userCompany=o.userComp;

               for(let line of this.userMenu){
                   if(line.menuGuid!==o.menuGuid) {
                       line.check=false;
                   }
               }
            },
            //搜索用户公司下的营运点权限
            setSite(o){},
            //修改用户菜单权限
            newUserMenu(){
               this.dialogVisible=true;
               this.transferbox='1';
                if(this.userMenu.length===0){
                    this.value1=[];
                    return;
                }
                this.value1=[];
                for(let line of this.userMenu){
                    line.check=false;
                    this.value1.push(line.menuGuid);
                }
                this.preuserMenu=this.value1;
            },
            //修改用户菜单下的公司权限
            newUserCompany(){
                this.dialogVisible=true;
                this.transferbox='2';
                if(this.userCompany.length===0) {
                    this.value2=[];
                    return;
                }
                this.value2=[];
                for(let line of this.userCompany){
                    line.check=false;
                    this.value2.push(line.companyCode);
                }
                this.preuserCompany=this.value2;
            },
            //确认穿梭框内的权限修改
            confirm(transferbox){
                this.$confirm('确认要保存修改吗？','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type:'question'
                }).then(()=>{
                    if(transferbox==='1'){
                        var data=[];
                        this.userMenu=[];
                        if(this.value1.length===0) {
                            this.dialogVisible=false;
                            return;
                        }
                        for(let line of this.value1){
                            for(let row of this.menuSource){
                                if(line===row.menuGuid) {
                                    data.push(row);
                                }
                            }
                        }
                        this.userMenu=data;
                        if(this.preuserMenu===this.value1){
                            this.$message.error('没有数据需要保存！');
                            return
                        }
                    }
                    else if(transferbox==='2') {
                        var data2=[];
                        this.userCompany=[];
                        if(this.value2.length===0){
                            this.dialogVisible=false;
                            return;
                        }
                        for(let line of this.value2){
                            for(let row of this.compSource){
                                if(line===row.companyCode) {
                                    data2.push(row);
                                }
                            }
                        }
                        this.userCompany=data2;
                        if(this.preuserCompany=== this.value2){
                            this.$message.error('没有数据需要保存！');
                            return;
                        }
                    }
                    this.dialogVisible=false;
                }).catch(()=>{
                    this.dialogVisible=true;
                    console.log('Cancel');
                });
            },
            AssignUserRights(){
                var user=sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                this.load();
                //AssignUserRights({
                //    userGuid:this.user.userGuid
                //}).then(data=>{
                //    if(data && data.code==='200'){
                //        this.menuSource=data.content;
                //        console.log(this.menuSource);
                //    }
                //}).catch(()=>{
                //    console.log('Fail');
                //})
            },
        }
    }
</script>

<style>
    @import '../../assets/css/common.css';
</style>