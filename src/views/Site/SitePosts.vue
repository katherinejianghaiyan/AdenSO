<template>
    <div v-loading="loading"
         element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="22" class="toolbar">
                <el-select
                        :options="ccWhsOption"
                        v-model="selectCCWhs"
                        style="width:340px"
                        placeholder="请选择成本中心，也可输入关键词"
                        filterable
                        expand-trigger="hover"
                        size="small"
                        @change="filterData">
                    <el-option v-for="item in ccWhsOption" :key="item.siteGuid" :value="item.siteGuid" :label="item.costCenterCode+' / '+item.costCenterName_ZH">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="2" class="toolbar">
                <el-button type="primary" size="small" style="margin-left:5%" @click="addNew" v-if="r_new">新增</el-button>
            </el-col>
        </el-row>
        <el-table
                :data="tblPost"
                border
                :height="fullHeight<300?300:fullHeight"
                style="width:100%">
            <el-table-column label="#" align="center" width="80" prop="sortName" sortable type="index">
            </el-table-column>
            <el-table-column label="成本中心" align="center" width="120" prop="costCenterCode" sortable>
                <template slot-scope="scope">
                    <span>{{scope.row.costCenterCode}}</span>
                </template>
            </el-table-column>
            <el-table-column label="图片类型" align="center" width="120" prop="imageType" sortable>
                <template slot-scope="scope">
                    <span>{{scope.row.imageType}}</span>
                </template>
            </el-table-column>
            <el-table-column label="文件名称" align="center" prop="picName" sortable>
                <template slot-scope="scope">
                    <span>{{scope.row.picName}}</span>
                </template>
            </el-table-column>
            <el-table-column label="开始日期" align="center" width="120" prop="startDate" sortable>
                <template slot-scope="scope">
                    <span>{{scope.row.startDate}}</span>
                </template>
            </el-table-column>
            <el-table-column label="有效性" align="center" width="100" prop="itemStatus" sortable>
                <template slot-scope="scope">
                    <span>{{scope.row.itemStatus===1?'有效':'无效'}}</span>
                </template>
            </el-table-column>
            <el-table-column label="编辑" align="center" width="80">
                <template slot-scope="scope">
                    <el-button size="small" type="primary" @click="setPost(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog
                :title=this.postSite
                :visible.sync="dialogPic"
                width="80%"
                :click-on-close-modal="false">
            <el-row>
                <el-col :span="8">
                    <span>类型</span>
                    <el-select size="mini" v-model="picType" @change="setVal1" style="width:50%">
                        <el-option v-for="item in picTypeOption" :key="item.businessType"
                                   :value="item.businessType"
                                   :label="item.imageType">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="8">
                    <span>开始日期</span>
                    <el-date-picker
                            size="mini"
                            style="width:50%"
                            v-model="picStartDate"
                            type="date"
                            placeholder="请选择日期">
                    </el-date-picker>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-checkbox v-model="checked">有效</el-checkbox>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-button type="success" size="mini" @click="saveImage" v-if="!isNullOrWhiteSpace(avatar)
                            && !isNullOrWhiteSpace(picStartDate) && !isNullOrWhiteSpace(picType)">保存</el-button>
                    </div>
                </el-col>
            </el-row>
            <el-row>
                <div>
                    <div>
                        <div><font color="red"><b>只能上传jpg或png文件</b></font></div>
                        <input type="file" name="avatar" id="uppic" accept="image/gif,image/jpeg,image/jpg,image/png" @change="changeImage($event)" ref="avatarInput">
                    </div><br>
                    <img :src="avatar" class="img-avatar" id="image">
                </div>
                <el-input size="mini" v-model="Val" :disabled="true" style="display:none;width:30%" ></el-input>
                <el-input size="mini" v-model="picVal1" :disabled="true" style="display:none;width:30%" ></el-input>
                <el-input size="mini" v-model="itemID" :disabled="true" style="display:none;width:30%"></el-input>
            </el-row>
        </el-dialog>
    </div>
</template>
<script>
    import {GetCCWhs_SUZHYC,GetSitePosts} from '../../api/api'
    import {isNullOrWhiteSpace,getRowFromArray,chGMT} from '../../assets/js/common';

    import axios from 'axios';

    export default {
        data(){
            return{
                fullHeight:window.innerHeight-192,
                loading:false,
                selectCCWhs:'',
                ccWhsOption:[],
                user:'',
                //sDate:'',
                dataSource:[],
                tblPost:[],
                dialogVisible:false,
                fileList2:[],

                picType:'',
                picType_bak:'',
                picStartDate:'',
                picStartDate_bak:'',
                checked:false,
                checked_bak:false,
                Val:'',
                Val_bak:'',
                picVal1:'',
                picVal1_bak:'',
                avatar: '',
                avatar_bak:'',
                file:'',
                itemID:'',
                postSite: "",
                dialogPic: false,
                picTypeOption:[],
                picStream:[],
            }
        },
        created() {
            this.getUserInfo();
            this.GetStartData();
        },
        computed:{
          r_new:function () {
              var Count=0;
              for(let row of this.dataSource){
                  var checkout=getRowFromArray(row.businessType,this.tblPost,"businessType");
                  if(typeof(checkout)==="undefined")
                      Count++;
              }
              if(Count>0)
                  return true;
              else
                  return false;
          }
        },
        methods: {
            // 取得登录者信息
            getUserInfo() {
                var userInfo = sessionStorage.getItem('user');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                    this.user = userInfo;
                }
            },
            // 取得开始日期（测试用）
            GetStartData() {
                // 执行保存
                this.GetCCWhs_SUZCHY();
            },

            // 取得CostCenter下拉框选项
            GetCCWhs_SUZCHY() {
                this.loading = true;
                GetCCWhs_SUZHYC({
                    action: "site-posts",
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code == "200") {
                        this.ccWhsOption = data.content;
                        for (var cw of this.ccWhsOption) {
                            cw.label = cw.costCenterCode + " - " + cw.costCenterName_ZH;
                        }
                        if (this.ccWhsOption.length >= 1) {
                            this.selectCCWhs = this.ccWhsOption[0].siteGuid;
                        }
                        this.CreateEdit();
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            //更改营运点是的海报显示策略
            CreateEdit() {
                this.loading = true;
                GetSitePosts({
                    siteGuid: this.selectCCWhs,
                    dbName:typeof(getRowFromArray(this.selectCCWhs,this.ccWhsOption,"siteGuid").dbName)==='undefined'?''
                        :getRowFromArray(this.selectCCWhs,this.ccWhsOption,"siteGuid").dbName
                }).then(data => {
                    if (data && data.code === '200') {

                        this.dataSource = data.content;

                        this.filterData();

                        var obj = getRowFromArray(this.selectCCWhs, this.ccWhsOption, "siteGuid");
                        if (typeof (obj) != "undefined")
                            this.postSite = obj.costCenterCode + ' / ' + obj.costCenterName_ZH; //对话框标题
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    console.log('Fail');
                });
            },

            filterData() {
                this.tblPost = [];
                for (let line of this.dataSource) {
                    //图片上传地址
                    line.val1 = line.picAddress;
                    //图片名称
                    line.picName = line.postName.lastIndexOf('/') > 0 ? line.postName.substr(line.postName.lastIndexOf('/') + 1) : line.postName;

                    if (line.siteGuid !== this.selectCCWhs)
                        continue;

                    this.tblPost.push(line);

                }

                //设置新增新增图片默认开始日期
                // if (this.tblPost.length > 0)
                //     this.sDate = this.tblPost[0].startDate;

                this.setPicOption();
            },
            //编辑海报
            setPost(row) {
                this.avatar='';
                if (isNullOrWhiteSpace(row.val1)) {
                    this.$message.error("没有海报图片");
                    return;
                }
                //图片路径
                this.avatar='http://' + window.location.host.split(":")[0] + row.val1;
                this.avatar_bak='http://' + window.location.host.split(":")[0] + row.val1;

                //图片开始日期
                this.picStartDate=row.startDate;
                //图片上传地址
                this.Val = row.val1.lastIndexOf('/') > 0 ? row.val1.substr(0, row.val1.lastIndexOf('/') + 1) : row.val1;
                //图片在数据库中的val1
                this.picVal1=(row.postName.lastIndexOf('/') > 0 ? row.postName.substr(0, row.postName.lastIndexOf('/')) : row.postName).replace(/(^\/)|(\/$)/g, "");
                //图片再数据库中的ID
                this.itemID=row.id;
                //图片有效性
                this.checked=row.itemStatus===1?true:false;
                //修改图片类型
                this.picTypeOption=[];
                this.picTypeOption.push({businessType:row.businessType,imageType:row.imageType});
                this.picType=this.picTypeOption[0].businessType;

                //备份
                this.picType_bak=this.picTypeOption[0].businessType; //类型
                this.picStartDate_bak=row.startDate;                  //开始日期
                this.checked_bak=row.itemStatus===1?true:false;     //有效性
                this.Val_bak=this.Val;                              //图片在数据库中的Val1
                this.picVal1_bak=this.picVal1;                        //图片在数据库中的val1

                if (!isNullOrWhiteSpace(this.Val)) {
                    this.dialogPic=true;
                }
                else {
                    this.$message.error("图片无效，请联系管理员");
                }
            },
            //删除海报
            handleRemove(file, fileList) {
                //console.log(file, fileList);
            },
            //浏览海报
            handlePreview(file) {
                //console.log(file);
            },
            //上传图片
            uploadSectionFile: function (file) {
                var form = new FormData();
                    if(typeof (file)!=='undefined')
                        form.append('file', file.file);
                    else if(typeof(file)==='undefined')
                        form.append('file', '');

                    form.append("siteGuid", this.selectCCWhs);
                    form.append("id", this.itemID);
                    form.append('startDate', this.formatDate(this.picStartDate, ""));
                    form.append('businessType', this.picType);
                    form.append('check', this.checked);
                    form.append('picVal1',this.picVal1);
                    form.append('imageType', typeof(getRowFromArray(this.picType, this.picTypeOption, "businessType").imageType) === "undefined" ? ""
                        : getRowFromArray(this.picType, this.picTypeOption, "businessType").imageType);

                    let config = {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    };
                    axios.post('http://' + window.location.host.split(":")[0]
                        + '/AdenWebAPI' + '/SiteDIY/UploadSitePicture?pictureFile=' + this.Val.replace(/(^\/)|(\/$)/g, ""),
                        form, config).then(resp => {
                        if (resp.data.Status === "ok") {
                            this.avatar = 'http://' + window.location.host.split(":")[0] + this.Val + resp.data.FileName;
                            this.CreateEdit();
                            this.dialogPic = false;
                            this.$message.success('保存成功');
                        }
                        else {
                            this.avatar = '';
                            this.picStream = [];
                            this.$message.error("图片上传失败");
                        }
                    }).catch(() => {
                        console.log('error');
                        this.avatar = '';
                        this.picStream = [];
                        this.$message.error('图片上传失败');
                    });

            },

            //删除海报、特色菜图片
            delPost(row) {

            },
            //点击“新增”
            addNew() {
                this.picStartDate = new Date(); //this.sDate;
                this.checked=true;
                this.avatar = '';
                this.avatar_bak='';
                this.itemID = '';

                this.dialogPic = true;
                //设置图片类型
                this.setPicOption();
                //设置图片地址
                this.setVal1();

                //备份
                this.picStartDate_bak=new Date();//this.sDate;
                this.checked_bak=true;
            },
            //设置新增图片的类型选项
            setPicOption(){
                var data='';
                var obj=[];
                for(let row of this.dataSource){
                    data=getRowFromArray(row.businessType,this.tblPost,"businessType");
                    if(typeof(data)==="undefined"){
                        obj.push({businessType:row.businessType,imageType:row.imageType});
                    }
                }
                //类型选项去重
                this.picTypeOption=[];
                if(obj.length>0){
                    this.picTypeOption= obj.distinct(["businessType"]);
                }
                //设置新增图片默认类型
                if (this.picTypeOption.length > 0)
                    this.picType = this.picTypeOption[0].businessType;
                else
                    this.picType='';

                //备份
                this.picType_bak=this.picType;
            },
            //新增图片时，根据类型，得到图片的上传地址和在数据库中的Val1
            setVal1(){
                    this.Val='';
                    this.picVal1='';

                    //图片的上传地址
                    if(typeof(getRowFromArray(this.picType,this.dataSource,'businessType').val1)!=="undefined")
                        var obj=getRowFromArray(this.picType,this.dataSource,'businessType').val1;
                        this.Val= obj.substr(0,obj.lastIndexOf('/')+1);

                    //图片在数据库中的val1
                    if(typeof(getRowFromArray(this.picType,this.dataSource,'businessType').postName)!=="undefined")
                        var obj2=(getRowFromArray(this.picType,this.dataSource,'businessType').postName).replace(/(^\/)|(\/$)/g, "");
                    this.picVal1= obj2.lastIndexOf('/') > 0 ? obj2.substr(0, obj2.lastIndexOf('/')) : obj2;

                //备份
                this.Val_bak=this.Val;         //图片的上传地址
                this.picVal1_bak=this.picVal1  //图片在数据库中的val1
            },

            //显示新增图片
            changeImage(e) {
                this.picStream=[];
                var file = e.target.files[0];
                var reader = new FileReader();
                var that = this;
                this.picStream.push({file:file});

                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    that.avatar = this.result;
                };
            },
            //保存上传
            saveImage(){
                if(this.picType===this.picType_bak && this.formatDate(this.picStartDate) ===this.picStartDate_bak
                    && this.checked===this.checked_bak
                    && this.Val===this.Val_bak && this.avatar===this.avatar_bak){
                    this.$message.error("没有数据需要保存");
                    return false;
                }
                this.uploadSectionFile(this.picStream[0]);
            },
            //空字符串判断
            isNullOrWhiteSpace(string) {
                return isNullOrWhiteSpace(string);
            },
            // 日期格式化
            formatDate(date, formatString) {
                if (isNullOrWhiteSpace(formatString))
                    formatString = "yyyy-MM-dd";

                return chGMT(date, formatString);
            },
        }
    }
</script>


<style>
    @import '../../assets/css/common.css';
    .img-avatar {
        width:30%;

    }

</style>