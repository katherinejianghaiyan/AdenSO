<template>
    <div v-loading="loading"
         element-loading-text="请稍后">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <el-select size="small" v-model="costCenter">
                    <el-option v-for="item in costCenterOptions"
                               :key="item.value"
                               :value="item.value"
                               :label="item.value+ ' / '+ item.name">
                    </el-option>
                </el-select>

                <el-select size="small" v-model="status" style="width:100px">
                    <el-option v-for="item in statusOptions"
                               :key="item.value"
                               :value="item.value"
                               :label="item.name">
                    </el-option>
                </el-select>

                <el-date-picker size="small"
                                v-model="datePick"
                                type="date"
                                placeholder="选择日期"
                                style="width:150px">
                </el-date-picker>
                <el-button size="small" type="primary">确定</el-button>
            </el-col>
            <el-col :span="24">

                <el-table :date="tblData">
                    <el-table-column label="订单号">
                    </el-table-column>
                    <el-table-column label="姓名">
                    </el-table-column>
                    <el-table-column label="手机">
                    </el-table-column>
                    <el-table-column label="部门">
                    </el-table-column>
                    <el-table-column label="科室">
                    </el-table-column>
                    <el-table-column label="需求日期">
                    </el-table-column>
                    <el-table-column label="订单金额">
                    </el-table-column>
                    <el-table-column label="支付方式">
                    </el-table-column>
                    <el-table-column label="发货" align="center">
                        <el-table-column label="地址" align="center">
                        </el-table-column>
                        <el-table-column label="时间" align="center">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="备注">
                    </el-table-column>
                    <el-table-column label="明细">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>
<script>

    import {GetCCWhs} from '../../api/api'

  export default{
      data(){
          return{
              loading:false,
              costCenter:'',
              costCenterOptions:[],
              status:'',
              statusOptions:[],
              datePick:'',
              tblData:[]
          }
      },
      created(){
          this.load();
          this.GetCCWhs();
      },
      methods:{
          getUserInfo() {
              var userInfo = sessionStorage.getItem('user');
              if (userInfo) {
                  userInfo = JSON.parse(userInfo);
                  this.user = userInfo;
              }
          },
          GetCCWhs() {
              this.getUserInfo();
              console.log(this.user);
              GetCCWhs({
                  action: "sales-so",
                  userGuid: this.user.userGuid
              }).then(data => {
                  if(data && data.code == "200") {
                      this.ccWhsOption = data.content;
                      //for(var cw of this.ccWhsOption) {
                      //    cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                      //}
                      alert(this.ccWhsOption);
                  }
                  this.loading = false;
              }).catch(()=>{
                  this.loading = false;
              })
          },

          load(){
              this.costCenterOptions=[{
                  value:'110YFP01',
                  name:'延锋彼欧'
              }];
              this.costCenter=this.costCenterOptions[0].value;
              this.statusOptions=[{
                  value:'',
                  name:'所有状态'
              },{
                  value:'1',
                  name:'已发货'
              },{
                  value:'2',
                  name:'未发货'
              }];
              this.status=this.statusOptions[0].value;
          }
      }
  }
</script>

<style>
    @import '../../assets/css/common.css';
</style>
