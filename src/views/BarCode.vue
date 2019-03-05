<template>
    <div v-loading="loading"
         element-loading-text="请稍后..." >
        <el-row>
            <el-col :span="24">
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
                              placeholder="请输入卡号" @keydown.enter.native="set" @blur="setPoint" id="cardID">
                    </el-input>
                </div>
                <el-input-number v-model="barcodeSize" :min="100" size="small" v-if="false"></el-input-number>
            </el-col>
        </el-row>

        <el-dialog title="" :visible.sync="dialogTablebarCode" size="large" :close-on-click-modal="false"
                   top="2vh">
            <div style="text-align:center;margin-bottom: 12px">
                <span style="font-size:28px" v-if="!seeCCWhs">请用微信扫码充值<br>Please scan via wechat to recharge your card</span>
                <span style="font-size:28px" v-if="seeCCWhs">二维码</span>
            </div>
            <div style="margin:0 auto;text-align: center" v-if="this.photoUrl.length>0">
                <img :src="this.photoUrl" height="420" width="420" id = "wxPic" />
            </div>
            <div v-else>
                <!--<span>无法正常读取二维码</span>-->
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {
        GetCompanySite,
        OfficalAccountQRCode
    } from '../api/api'
    import {isNullOrWhiteSpace } from '../assets/js/common';

    import config from '../api/config'

    export default {
        watch:{
            '$route'(){
                if(this.$route.path.substr(this.$route.path.lastIndexOf('/')+1,10)=='withnoCard'){
                    this.seeCCWhs=true;
                } else {
                    this.seeCCWhs=false;
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
                site: '',
                selectCCWhs: '',
                siteGuid:'',
                paramType:'',
                ccWhsOption: [],
                cardno:'',
                barcodeSize:420,
                photoUrl:'',
                dialogTablebarCode:false,
                guid:'',
                websock: null,
                seeCCWhs:false

            }
        },
        created(){
            if(this.$route.path.substr(this.$route.path.lastIndexOf('/')+1,10)=='withnoCard'){
                this.seeCCWhs=true;
            }
        },

        methods:{
            // 取得CostCenter下拉框选项
            // GetCCWhs() {
            //     let defaultCostCenter ='120DW201';
            //     this.selectCCWhs = window.location.href.substr(window.location.href.indexOf('?')+1,
            //         (window.location.href.lastIndexOf('&')-window.location.href.indexOf('?')-1)) ;
            //     if(this.selectCCWhs!==null && this.selectCCWhs.length>0){
            //         this.initWebSocket(this.selectCCWhs);
            //     } else{
            //         this.initWebSocket(defaultCostCenter);
            //     }
            // },

            // 获得成本中心详情
            GetCCOptions(cardno){
                this.loading = true;
                // 获取成本中心代码
                this.selectCCWhs = window.location.href.substr(window.location.href.indexOf('?')+1,
                    (window.location.href.lastIndexOf('&')-window.location.href.indexOf('?')-1)) ;
                // 获取程序类型参数
                this.paramType = window.location.href.substr(window.location.href.lastIndexOf('&')+1);
                //赋值guid
                const date = new Date();
                this.guid=date.getHours().toString()+date.getMinutes().toString()
                    +date.getSeconds().toString()+date.getMilliseconds().toString()
                    +((Math.random()*900)+100).toString().substring(0,3);
                //沟通webSocket
                if(this.selectCCWhs!==null && this.selectCCWhs.length>0){
                    this.initWebSocket(this.selectCCWhs);
                }

                GetCompanySite({
                    action:'wechatBarCode',
                    userGuid:'None'
                }).then(data =>{
                    if(data && data.code==='200'){
                        this.ccWhsOption = data.content;
                        for(let row of this.ccWhsOption){
                            if(row.siteList.length === 0)
                                continue;
                             for(let line of row.siteList){
                                if(line.costCenterCode.indexOf(this.selectCCWhs)===-1)
                                    continue;
                                this.siteGuid = line.siteGuid
                             }
                        }
                        if(this.paramType === 'OfficialAccount'){
                            this.site = this.siteGuid;
                            var xurl = "http://mall.adenchina.net/jc/api/officalaccountqrcode.ashx?siteGuid="+this.site+"&cardno="
                                + cardno + "&guid=" + this.guid;

                            OfficalAccountQRCode(xurl).then(data => {
                                this.photoUrl = data;
                            });
                            this.dialogTablebarCode=true;
                        }
                        else if(this.paramType === "MiniProgram"){
                            this.site = this.selectCCWhs;
                            this.photoUrl = config.baseURL+"/WeChatPay/WechatBarCode/adenservices/?"+ (Math.random()*1000)
                                +"&data={appName:'Recharge',guid:'"
                                + this.guid+"',costCenterCode:'"+this.selectCCWhs+"',cardno:'"+cardno+"',barCodeSize:"+this.barcodeSize+"}";

                            this.dialogTablebarCode=true;
                        }

                    }
                    this.loading = false;
                }).catch(()=>{
                    this.loading = false;
                });
            },

            //生成有卡号的二维码
            set(){
               this.GetCCOptions(this.cardno);
            },

            //生成没有卡号的二维码
            reset(){
                this.GetCCOptions('');
            },
            //光标设置
            setPoint(){
                window.document.getElementById('cardID').focus();
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

            isNullOrWhiteSpace(str) {
                return isNullOrWhiteSpace(str);
            },
        }
    }
</script>