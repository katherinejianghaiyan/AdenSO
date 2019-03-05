
<template>
    <div v-loading="loading"
         element-loading-text="请稍后..." @click="TargetDiv()">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <template v-if="seeCCWhs||ccWhsOption.length>1">
                    <el-select v-model="selectCCWhs" size="small" filterable
                               style="width:330px">
                        <el-option v-for="item in ccWhsOption"
                                   :key="item.costCenterCode"
                                   :label="item.costCenterCode+'-'+item.costCenterName_ZH"
                                   :value="item.costCenterCode">
                        </el-option>
                    </el-select>
                    <el-button type="success" size="small" @click.native="reset" v-if="seeCCWhs||ccWhsOption.length>1">生成二维码</el-button>
                </template>
                   <div  v-if="!seeCCWhs">
                        <el-input size="small" style="width:230px;margin-right:10px; border: none;opacity: 0" v-model="cardno" autofocus="true"
                                  placeholder="请输入卡号" @keydown.enter.native="set" @blur="setPoint" @focus="TargetDiv()" id="cardID">
                        </el-input>
                   </div>
                <el-input-number v-model="barcodeSize" :min="100" size="small" v-if="false"></el-input-number>
            </el-col>
            <div v-if="!seeCCWhs">
            <div id="img" @blur="blurDiv">
                <table id="tbl">
                    <tr>
                        <td><!--style="border:solid 2px red"-->
                            <img :src="this.scan" height="330" width="351" id="img1"/>
                        </td>
                        <td>
                            <img :src="this.nextStep" height="30" width="61" style="margin-top:2px"/>
                        </td>
                        <td>
                            <img :src="this.wechatCharge" height="330" width="361" id="img2" />
                        </td>
                    </tr>
                </table>
            </div>
            </div>
            <el-col>

            </el-col>
        </el-row>


        <el-dialog title="" :visible.sync="dialogTablebarCode" size="large" :close-on-click-modal="false"
                   top="2vh">
            <div style="text-align:center;margin-bottom: 12px">
                <span style="font-size:28px" v-if="!seeCCWhs">请扫码充值</span>
                <span style="font-size:28px" v-if="seeCCWhs">二维码</span>
            </div>
            <div style="margin:0 auto;text-align: center" v-if="this.photoUrl.length>0">
                <img :src="this.photoUrl" height="420" width="420" />
            </div>
            <div v-else>
                <span>无法正常读取二维码</span>
            </div>
        </el-dialog>
    </div>
</template>

<script>

    import {
        GetCCWhs,
        WechatBarCode
    } from '../../api/api'

    import config from '../../api/config'

    export default {
        watch:{
            '$route'(){
              if(this.$route.path.substr(this.$route.path.lastIndexOf('/')+1,10)=='withnoCard'){
                    this.seeCCWhs=true;
                    window.document.getElementById("tbl").style.setProperty('opacity',"0");
              } else {
                  this.seeCCWhs=false;
                  window.document.getElementById("tbl").style.removeProperty('opacity');
              }
            },
            dialogTablebarCode(val){
                let _this=this;
               if(val===true){
                   setTimeout(function () {
                       _this.dialogTablebarCode=false;
                       _this.cardno='';
                   },60000);
               }
               else if(val===false){
                   _this.cardno='';
                   _this.photoUrl='';
               }
            },
        },
        data(){
            return{
                loading:false,
                user: "",
                selectCCWhs: '',
                ccWhsOption: [],
                cardno:'',
                barcodeSize:420,
                photoUrl:'',
                dialogTablebarCode:false,
                guid:'',
                websock: null,
                scan:'./static/images/sancard2.png',
                nextStep:'./static/images/nextStep.png',
                wechatCharge:'./static/images/WechatCharge2.png',
                seeCCWhs:false

            }
        },
        created(){
            //成本中心列表
            this.GetCCWhs();
            const date = new Date();

            this.guid=date.getHours().toString()+date.getMinutes().toString()
                +date.getSeconds().toString()+date.getMilliseconds().toString()
                +((Math.random()*900)+100).toString().substring(0,3);

            if(this.$route.path.substr(this.$route.path.lastIndexOf('/')+1,10)=='withnoCard'){
                this.seeCCWhs=true;
            }
        },

        methods:{

            // 取得CostCenter下拉框选项
            GetCCWhs() {
                this.loading = true;
                var userInfo = sessionStorage.getItem('user');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                    this.user = userInfo;
                } else{
                    this.user='F36BB9DE-67F5-4DE9-8E9B-BFA1919B8531';
                }
                GetCCWhs({
                    action: "wechat-ccvsbc",
                    userGuid: this.user.userGuid
                }).then(data => {
                    if(data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        for(var cw of this.ccWhsOption) {
                            cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                        }
                    }
                    this.loading = false;

                    this.selectCCWhs=this.ccWhsOption[0].costCenterCode;
                    this.initWebSocket(this.selectCCWhs);

                }).catch(()=>{
                    this.loading = false;
                })
            },

            //生成有卡号的二维码
            set(){
                // this.photoUrl='';
                //
                //  WechatBarCode(
                //     {
                //         appName:'Recharge',
                //         guid:this.guid,
                //         costCenterCode:this.selectCCWhs,
                //         cardno:this.cardno,
                //         barCodeSize:this.barcodeSize
                //     }).then(()=>{
                //      this.photoUrl = config.baseURL+"/WeChatPay/WechatBarCode/adenservices/?"
                //          +"&data={appName:'Recharge',guid:'"
                //          + this.guid+"',costCenterCode:'"+this.selectCCWhs+"',cardno:'"+this.cardno+"',barCodeSize:"+this.barcodeSize+"}";
                //      this.dialogTablebarCode=true;
                //     });

                this.photoUrl = config.baseURL+"/WeChatPay/WechatBarCode/adenservices/?"+ (Math.random()*1000)
                     +"&data={appName:'Recharge',guid:'"
                     + this.guid+"',costCenterCode:'"+this.selectCCWhs+"',cardno:'"+this.cardno+"',barCodeSize:"+this.barcodeSize+"}";

                 this.dialogTablebarCode=true;
            },

            //生成没有卡号的二维码
            reset(){
                   this.photoUrl = config.baseURL+"/WeChatPay/WechatBarCode/adenservices/?"
                     +"&data={appName:'Recharge',guid:'"
                     + this.guid+"',costCenterCode:'"+this.selectCCWhs+"',cardno:'',barCodeSize:"+this.barcodeSize+"}";
                this.dialogTablebarCode=true;
            },
            //光标设置
            setPoint(){
                window.document.getElementById('cardID').focus();
                this.blurDiv();
            },

            //WebSocket
            initWebSocket(costCenter){ //初始化weosocket
                //ws地址
                const wsuri = "wss://crm.adenservices.com/WebSocketHandler/Handler.ashx?wskey="+costCenter+this.guid+"";

                this.websock = new WebSocket(wsuri);
                this.websock.onopen = this.websocketonopen;
                this.websock.onmessage = this.websocketonmessage;
                this.websock.onclose = this.websocketclose;
            },
            websocketonopen() {
                console.log("connect open...");
            },
            websocketonmessage(msg){ //数据接收
                const redata = msg.type;
                if(redata.length>0){
                    this.dialogTablebarCode=false;
                    this.cardno='';
                    this.photoUrl='';
                }
            },
            websocketclose(e){  //关闭
                console.log("connection closed (" + e.code + ")");
            },

            //input获取焦点时，点亮图片
            TargetDiv(){
                if(!this.seeCCWhs){
                    window.document.getElementById('img1').style.setProperty('border',"solid 3px black");
                    window.document.getElementById('img1').style.removeProperty('opacity');
                    window.document.getElementById('img2').style.setProperty('border',"solid 3px black");
                    window.document.getElementById('img2').style.removeProperty('opacity');
                }
            },

            //input失去焦点时，调暗图片
            blurDiv() {
                if(!this.seeCCWhs) {
                    window.document.getElementById('img1').style.removeProperty('border');
                    window.document.getElementById('img2').style.removeProperty('border');
                    window.document.getElementById('img1').style.setProperty('opacity', "0.3");
                    window.document.getElementById('img2').style.setProperty('opacity', "0.3");
                }
            },

        }
    }
</script>