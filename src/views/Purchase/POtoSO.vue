<template>
    <div style="background-color: #F3F3F4">
        <section v-loading="loading"
                 element-loading-text="请稍候...">
            <el-row>
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true" style="width:100%">
                        <el-form-item style="margin-right: 60%">
                            <el-radio-group v-model="mode"
                                            size="small"
                                            style="float:left;"
                                            @change="ChangeMode">
                                <el-radio-button label="0">按营运点分组</el-radio-button>
                                <el-radio-button label="1">按产品分组</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item>
                            <el-button size="small" type="success" @click="">保存</el-button>
                            <el-button size="small" type="primary" @click="showdialogFormVisible">添加供应商</el-button>
                        </el-form-item>
                    </el-form>

                    <div>
                        <el-table :data="tblData"
                                  :span-method="arraySpanMethod"
                                  :height="tableHeight"
                                  style="width:100%">
                            <el-table-column label="明细" type="expand" v-if="mode==='1'" fixed="left" width="100">
                                <template slot-scope="scope">
                                    <el-table :data="scope.row.costCenter" border stripe>
                                        <el-table-column label="成本中心">
                                            <template slot-scope="scope">
                                                <span>{{scope.row.costCenter}}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="单位">
                                            <template slot-scope="scope">
                                                <span>{{scope.row.unit}}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="价格">
                                            <template slot-scope="scope">
                                                <span>{{scope.row.price}}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="数量">
                                            <template slot-scope="scope">
                                                <span>{{scope.row.qty}}</span>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </template>
                            </el-table-column>
                            <el-table-column :label="mode==='0'?'成本中心':'产品'" :width="colWidth">
                                <template slot-scope="scope">
                                    <span v-if="mode==='0'">{{scope.row.costCenter}}</span>
                                    <span v-if="mode==='1'">{{scope.row.itemCode}}</span><br>
                                    <span v-if="mode==='1'">{{scope.row.itemdescription}}</span>
                                </template>
                            </el-table-column>


                            <el-table-column :label="mode==='0'?'产品':'成本中心'"  v-if="showCol">
                                <template slot-scope="scope">
                                    <span v-if="mode==='0'">{{scope.row.itemCode +' / '+scope.row.itemdescription}}</span><br>
                                    <div v-if="mode==='1'" v-for="item in scope.row.costCenter" :key="item.costCenter">
                                     <span>{{item.costCenter}}</span><br>
                                    </div>
                                </template>
                            </el-table-column>


                            <el-table-column label="单位" width="50" :resizable="false">
                                <template slot-scope="scope">
                                    <span>{{scope.row.unit}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="价格" width="50" :resizable="false">
                                <template slot-scope="scope">
                                    <span>{{float(scope.row.price,2)}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="数量" width="50" :resizable="false">
                                <template slot-scope="scope">
                                    <span>{{float(scope.row.qty,2)}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="库存" width="50" :resizable="false">
                                <template slot-scope="scope">
                                    <span>{{float(scope.row.stockQty)}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column width="100" :resizable="false" header-align="center" align="center"
                                    v-for="item in supplierList_bak" :key="item.supplierCode" :label="item.supplierCode+' '+item.supplierName" v-if="item.status">
                                    <template slot-scope="scope">
                                        <el-radio size="small" type="danger" v-model="scope.row.radio"
                                                  :label="item.supplierCode"  style="color: white;"><span></span>
                                        </el-radio>
                                    </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-col>
            </el-row>
            <el-dialog title="供应商"  :visible.sync="dialogFormVisible">
                <el-table :data="supplierList_bak" height="350">
                    <el-table-column label="供应商代码" style="widht:70%">
                        <template slot-scope="scope">
                            <span>{{scope.row.supplierCode +' / '+scope.row.supplierName}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="有效">
                        <template slot-scope="scope">
                            <el-checkbox v-model="scope.row.status" :disabled="scope.row.disabled" @change="refreshtbl"></el-checkbox>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
        </section>
    </div>
</template>

<script>
  import{float} from '../../assets/js/common';

  export default{

      created(){
        this.load();
        this.generatesupplierList_bak();

        this.ChangeMode();
      },
      data(){
          return{
            mode:'0',
            loading:false,
            supplierList:[],
            supplierList_bak:[],
            tableData:[],
            tableDataOrderbyItem:[],
            tblData:[],
            dialogFormVisible:false,
            pageSize: 10,
            Options: [
                  {
                      value: 10,
                      label: '10'
                      //label: '10条/页'
                  },
                  {
                      value: 20,
                      label: '20'
                      //label: '50条/页'
                  },
                  {
                      value: 30,
                      label: '30'
                      //label: '100条/页'
                  },
            ],
           tableHeight:window.innerHeight-200,
           showCol:false,
           colWidth:100
          }
      },
      methods:{
          changeSize(){},
          refreshtbl(){
              this.ChangeMode();
              this.tableHeight = window.innerHeight-200;
          },
          arraySpanMethod({ row, column, rowIndex, columnIndex }) {
              var rowspan = 0;
              if(this.mode==="0"){
                  if (columnIndex === 0) {
                      rowspan = this.tblData[rowIndex].rowspan;
                      if (rowspan > 0) {
                          return {
                              rowspan: rowspan,
                              colspan: 1
                          };
                      } else {
                          return {
                              rowspan: 0,
                              colspan: 0
                          };
                      }
                  }
              }
              else if(this.mode==="1") {
                 if (columnIndex === -1) {
                      rowspan = this.tblData[rowIndex].rowspan;
                      if (rowspan > 0) {
                          return {
                              //rowspan: rowspan,
                              //colspan: 1
                              rowspan: 0,
                              colspan: 1
                          };
                      } else {
                          return {
                              rowspan: 0,
                              colspan: 0
                          };
                      }
                  }
              }
          },
          showdialogFormVisible(){
              this.generatesupplierList_bak();

              this.dialogFormVisible=true
          },
          generatesupplierList_bak(){
              this.supplierList_bak=[]; //添加供应商列表
              var arr=[];
              var supplierObj=null;
              for(var i=0;i<this.supplierList.length;i++){
                  for(var j=0;j<this.tableData.length;j++){
                      supplierObj=this.tableData[j];
                      if(supplierObj.radio===this.supplierList[i].supplierCode){
                          //所有被勾选关联的供应商
                          arr.push({
                              supplierCode:this.supplierList[i].supplierCode,
                              supplierName:this.supplierList[i].supplierName,
                              status:true,
                              disabled:true
                          });
                      }
                  }
                  if(arr.length>0){
                      for(var k=0;k<arr.length;k++){
                          if(arr[k].supplierCode===this.supplierList[i].supplierCode) continue;
                          //所有未被勾选关联的供应商
                          arr.push({
                              supplierCode:this.supplierList[i].supplierCode,
                              supplierName:this.supplierList[i].supplierName,
                              status:false,
                              disabled:false
                          });
                      }
                  }
              }
              if(arr.length>0){
                  for(var a=0;a<arr.length;a++){
                      //去重
                      if(a>0 && arr[a].supplierCode===arr[a-1].supplierCode) continue;
                      this.supplierList_bak.push({
                          supplierCode:arr[a].supplierCode,
                          supplierName:arr[a].supplierName,
                          status:arr[a].status,
                          disabled:arr[a].disabled
                      })
                  }
              }
          },
          Mode1(){
              var menuObj=null;
              var arr=[];
              this.tblData=[];
              for(let i=0;i<this.tableData.length;i++){
                  menuObj=this.tableData[i];
                  var a=0;
                  for(let j=0;j<this.tableData.length;j++){
                      if(menuObj.costCenter===this.tableData[j].costCenter){
                          a++;
                      }
                  }
                  menuObj.rowspan=a;
                  //arr.push(this.tableData[j]);
                  arr.push(menuObj);
              }
              for(let a=0;a<arr.length;a++){
                  if(a>0 && arr[a].costCenter===arr[a-1].costCenter){
                      arr[a].rowspan=0;
                  }
              }
              this.tblData=arr;
          },
          Mode2(){
              var menuObj=null;
              var arr=[];
              this.tblData=[];
              for(let i=0;i<this.tableDataOrderbyItem.length;i++){
                  menuObj=this.tableDataOrderbyItem[i];
                  var a=0;
                  for(let j=0;j<this.tableDataOrderbyItem.length;j++){
                      if(menuObj.itemCode===this.tableDataOrderbyItem[j].itemCode){
                          a++;
                      }
                  }
                  menuObj.rowspan=a;
                  //arr.push(this.tableData[j]);
                  arr.push(menuObj);
              }
              for(let a=0;a<arr.length;a++){
                  if(a>0 && arr[a].itemCode===arr[a-1].itemCode){
                      arr[a].rowspan=0;
                  }
              }
              this.tblData=arr;

          },
          ChangeMode(){
             if(this.mode==="0"){
                 this.showCol=true;
                 this.colWidth=120;
                 this.Mode1();
             } else if(this.mode==="1"){
                 this.showCol=false;
                 this.colWidth='';
                 this.Mode2();
             }
          },
          load(){
           //已经被DC维护的有效供应商
           this.supplierList= [
              {
                  supplierCode:'111998',
                  supplierName:'埃顿华东区配送中心',
                  status:true
              },
              {
                  supplierCode:'211998',
                  supplierName:'美的食品商贸有限公司',
                  status:true
              },
              {
                      supplierCode:'221658',
                  supplierName:'嘉实美味有限公司',
                  status:true
              },
           ];

           //site下的PO单明细
           this.tableData=[
              {costCenter:'110HO201',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'5.000',stockQty:10,radio:this.supplierList[0].supplierCode},
              {costCenter:'110HO201',itemCode:'1000101180',itemdescription:'DC 巴比牌香菇菜包 24*85g/包',unit:'PC',price:'21.9300',qty:'3.000',stockQty:5,radio:this.supplierList[0].supplierCode},
              {costCenter:'110HO201',itemCode:'1000101184',itemdescription:'DC 巴比牌豆沙包24*85g/包',unit:'PC',price:'21.9300',qty:'4.000',stockQty:15,radio:this.supplierList[0].supplierCode},
              {costCenter:'110HO201',itemCode:'1000101500',itemdescription:'DC 巴比牌烧麦50个*68g/包',unit:'PC',price:'34.2700',qty:'4.000',stockQty:25,radio:this.supplierList[0].supplierCode},
              {costCenter:'110HO201',itemCode:'1000200721',itemdescription:'DC 百事可乐24*330ml/箱',unit:'PC',price:'39.2200',qty:'1.000',stockQty:55,radio:this.supplierList[0].supplierCode},
              {costCenter:'110HO201',itemCode:'1000200725',itemdescription:'DC 可口可乐24*330ml/箱',unit:'PC',price:'39.2200',qty:'1.000',stockQty:10,radio:this.supplierList[0].supplierCode},
              {costCenter:'110PHL01',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'4.000',stockQty:35,radio:this.supplierList[0].supplierCode},
              {costCenter:'110PHL01',itemCode:'1000101180',itemdescription:'DC 巴比牌香菇菜包 24*85g/包',unit:'PC',price:'21.9300',qty:'4.000',stockQty:85,radio:this.supplierList[0].supplierCode},
              {costCenter:'110SOY01',itemCode:'1020100561',itemdescription:'DC 东北御贡长粒香24.5kg/包',unit:'PC',price:'135.4500',qty:'1.000',stockQty:95,radio:this.supplierList[0].supplierCode},
              {costCenter:'110SOY01',itemCode:'1040500387',itemdescription:'DC 泰森牌冷冻鸡全腿10kg/箱（约3只/kg）',unit:'PC',price:'156.3600',qty:'5.000',stockQty:105,radio:this.supplierList[0].supplierCode},
              {costCenter:'110WLG01',itemCode:'1030400277',itemdescription:'达能牌碧悠原味酸奶(16*100g*6/箱）',unit:'PC',price:'134.9000',qty:'3.000',stockQty:95,radio:this.supplierList[0].supplierCode},
              {costCenter:'110WLS01',itemCode:'1030400277',itemdescription:'达能牌碧悠原味酸奶(16*100g*6/箱）',unit:'PC',price:'134.9000',qty:'10.000',stockQty:18,radio:this.supplierList[0].supplierCode},
              {costCenter:'110WLS01',itemCode:'1040500385',itemdescription:'DC 泰森牌冷冻去皮鸡胸10kg/箱',unit:'PC',price:'165.4500',qty:'5.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110WLS01',itemCode:'1041100037',itemdescription:'DC 鸡蛋15kg/箱（要求鸡蛋62g±3g/枚）',unit:'PC',price:'156.7500',qty:'5.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZE201',itemCode:'1000200723',itemdescription:'DC 统一牌冰红茶24*250ml/箱',unit:'PC',price:'22.8400',qty:'1.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZEI01',itemCode:'1040500385',itemdescription:'DC 泰森牌冷冻去皮鸡胸10kg/箱',unit:'PC',price:'165.4500',qty:'1.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZEI01',itemCode:'1041100037',itemdescription:'DC 鸡蛋15kg/箱（要求鸡蛋62g±3g/枚）',unit:'PC',price:'156.7500',qty:'1.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZFC01',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'3.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZFC01',itemCode:'1000101181',itemdescription:'DC 巴比牌香辣粉丝包24*80g/包',unit:'PC',price:'21.9300',qty:'2.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZFC01',itemCode:'1000101183',itemdescription:'DC 巴比牌梅干菜24*85g/包',unit:'PC',price:'24.1200',qty:'2.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZFC01',itemCode:'1000101503',itemdescription:'DC 巴比牌手撕红糖馒头12个*90g/包',unit:'PC',price:'10.9700',qty:'2.000',stockQty:66,radio:this.supplierList[0].supplierCode},
              {costCenter:'110ZFC01',itemCode:'1030400469',itemdescription:'DC 光明牌原味酸奶100g*48杯/箱',unit:'PC',price:'51.7200',qty:'15.000',stockQty:66,radio:this.supplierList[0].supplierCode}
           ];
           this.tableDataOrderbyItem=[
               {costCenter:[{costCenter:'110HO201',unit:'PC',price:'14.1300',qty:'1.000'},
                            {costCenter:'110PHL01',unit:'PC',price:'22.1300',qty:'1.000'},
                            {costCenter:'110ZFC01',unit:'PC',price:'24.1300',qty:'1.000'},
                            {costCenter:'113MIC01',unit:'PC',price:'25.2300',qty:'2.000'}],
                   itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'5.000',stockQty:58,radio:this.supplierList[0].supplierCode},
               //{costCenter:'110PHL01',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'4.000',stockQty:12,radio:this.supplierList[0].supplierCode},
               //{costCenter:'110ZFC01',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'3.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               //{costCenter:'113MIC01',itemCode:'1000101179',itemdescription:'DC 巴比牌鲜肉包24*85g/包',unit:'PC',price:'24.1300',qty:'20.000',stockQty:12,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110HO201',unit:'PC',price:'23.1300',qty:'1.000'},
                            {costCenter:'110PHL01',unit:'PC',price:'22.1300',qty:'1.000'},
                            {costCenter:'113MIC01',unit:'PC',price:'21.1300',qty:'1.000'}],
                   itemCode:'1000101180',itemdescription:'DC 巴比牌香菇菜包 24*85g/包',unit:'PC',price:'21.9300',qty:'3.000',stockQty:36,radio:this.supplierList[0].supplierCode},
               //{costCenter:'110PHL01',itemCode:'1000101180',itemdescription:'DC 巴比牌香菇菜包 24*85g/包',unit:'PC',price:'21.9300',qty:'3.000',stockQty:12,radio:this.supplierList[0].supplierCode},
               //{costCenter:'113MIC01',itemCode:'1000101180',itemdescription:'DC 巴比牌香菇菜包 24*85g/包',unit:'PC',price:'21.9300',qty:'20.000',stockQty:12,radio:this.supplierList[0].supplierCode},

               {costCenter:[{costCenter:'110PHL01',unit:'PC',price:'24.1300',qty:'1.000'},
                            {costCenter:'110ZFC01',unit:'PC',price:'24.1300',qty:'1.000'}],
                   itemCode:'1000101181',itemdescription:'DC 巴比牌香辣粉丝包24*80g/包',unit:'PC',price:'21.9300',qty:'2.000',stockQty:24,radio:this.supplierList[0].supplierCode},
               //{costCenter:'110ZFC01',itemCode:'1000101181',itemdescription:'DC 巴比牌香辣粉丝包24*80g/包',unit:'PC',price:'21.9300',qty:'2.000',stockQty:12,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110ZFC01',unit:'PC',price:'24.1200',qty:'2.000'}],itemCode:'1000101183',itemdescription:'DC 巴比牌梅干菜24*85g/包',unit:'PC',price:'24.1200',qty:'2.000',stockQty:12,radio:this.supplierList[0].supplierCode},

               {costCenter:[{costCenter:'110HO201',unit:'PC',price:'24.1300',qty:'1.000'},
                            {costCenter:'110PHL01',unit:'PC',price:'25.1300',qty:'1.000'},
                            {costCenter:'113MIC01',unit:'PC',price:'23.1300',qty:'2.000'}],
                   itemCode:'1000101184',itemdescription:'DC 巴比牌豆沙包24*85g/包',unit:'PC',price:'21.9300',qty:'4.000',stockQty:56,radio:this.supplierList[0].supplierCode},
               //{costCenter:'110PHL01',itemCode:'1000101184',itemdescription:'DC 巴比牌豆沙包24*85g/包',unit:'PC',price:'21.9300',qty:'2.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               //{costCenter:'113MIC01',itemCode:'1000101184',itemdescription:'DC 巴比牌豆沙包24*85g/包',unit:'PC',price:'21.9300',qty:'20.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110HO201',unit:'PC',price:'14.1300',qty:'2.000'},
                            {costCenter:'113MIC01',unit:'PC',price:'34.1300',qty:'2.000'}],
                   itemCode:'1000101500',itemdescription:'DC 巴比牌烧麦50个*68g/包',unit:'PC',price:'34.2700',qty:'4.000',stockQty:44,radio:this.supplierList[0].supplierCode},
               //{costCenter:'113MIC01',itemCode:'1000101500',itemdescription:'DC 巴比牌烧麦50个*68g/包',unit:'PC',price:'34.2700',qty:'18.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110PHL01',unit:'PC',price:'9.6300',qty:'2.000'}],
                   itemCode:'1000101502',itemdescription:'DC 巴比牌刀切馒头16个*90g/包',unit:'PC',price:'9.6300',qty:'2.000',stockQty:22,radio:this.supplierList[0].supplierCode},

               {costCenter:[{costCenter:'110ZFC01',unit:'PC',price:'12.9700',qty:'1.000'},
                            {costCenter:'113MIC01',unit:'PC',price:'8.9700',qty:'1.000'}],
                   itemCode:'1000101503',itemdescription:'DC 巴比牌手撕红糖馒头12个*90g/包',unit:'PC',price:'10.9700',qty:'2.000',stockQty:42,radio:this.supplierList[0].supplierCode},
               //{costCenter:'113MIC01',itemCode:'1000101503',itemdescription:'DC 巴比牌手撕红糖馒头12个*90g/包',unit:'PC',price:'10.9700',qty:'20.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110PHL01',unit:'PC',price:'9.0700',qty:'2.000'}],itemCode:'1000101564',itemdescription:'DC 巴比牌葱油花卷(16个*90g/袋)',unit:'PC',price:'9.0700',qty:'2.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'112HON01',unit:'PC',price:'14.6600',qty:'60.000'}],itemCode:'1000200669',itemdescription:'冰露牌包装饮用水24瓶*550ml/箱',unit:'PC',price:'14.6600',qty:'60.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110HO201',unit:'PC',price:'39.2200',qty:'1.000'}],itemCode:'1000200721',itemdescription:'DC 百事可乐24*330ml/箱',unit:'PC',price:'39.2200',qty:'1.000',stockQty:22,radio:this.supplierList[0].supplierCode},
               {costCenter:[{costCenter:'110PHL01',unit:'PC',price:'22.8400',qty:'4.000'}],itemCode:'1000200723',itemdescription:'DC 统一牌冰红茶24*250ml/箱',unit:'PC',price:'22.8400',qty:'4.000',stockQty:22,radio:this.supplierList[0].supplierCode},
           ];
        },
        float(price, fix) {
            return float(price, fix);
        },
      }
  }
</script>

<style>
    @import '../../assets/css/common.css';
</style>