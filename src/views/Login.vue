<template>
    <div class="login" v-loading.fullscreen.lock="loading">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px"
                 class="demo-ruleForm login-container">
            <div class="login-logo">
                <p>ADEN Services</p>
            </div>
            <el-form-item prop="account">
                <el-input type="text" v-model="ruleForm.account" auto-complete="off" placeholder="账号">
                    <i slot="suffix" class="el-input__icon fa fa-user"></i>
                </el-input>
            </el-form-item>
            <el-form-item prop="checkPass">
                <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off" placeholder="密码">
                    <i slot="suffix" class="el-input__icon fa fa-lock"></i>
                </el-input>
            </el-form-item>
            <el-checkbox v-model="checked" checked class="remember" style="margin: 8px 0px 25px 0px">记住密码</el-checkbox>
            <div style="float: right">
                <el-select v-model="lang" placeholder="请选择" style="width: 150px">
                    <el-option
                            v-for="item in langOption"
                            :key="item.code"
                            :label="item.langName"
                            :value="item.code">
                    </el-option>
                </el-select>
            </div>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="login" :loading="logining">登录
                </el-button>
                <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    //    import {requestLogin} from '../api/api';
    import {getLang, getUser} from '../api/api';
    import {
        lan
    } from '../assets/js/common';

    //import NProgress from 'nprogress'
    export default {
        created() {
            /***CHECK LAN EXIST***/
            var checkLan = JSON.parse(localStorage.getItem("lan"));
            if(checkLan == null) {
                lan("T000001");
            }
            this.getLangCode();
            this.getLoginUser();
        },
        data() {
            return {
                langOption: [],
                lang: '',
                logining: false,
                ruleForm: {
                    account: '',
                    checkPass: ''
                },
                rules: {
                    account: [
                        {required: true, message: ' ', trigger: 'blur'},
                        //{ validator: validaePass }
                    ],
                    checkPass: [
                        {required: true, message: ' ', trigger: 'blur'},
                        //{ validator: validaePass2 }
                    ]
                },
                checked: false
            };
        },
        methods: {
            handleReset2() {
                this.$refs.ruleForm.resetFields();
            },
            login() {
                sessionStorage.removeItem("user");
                this.$refs['ruleForm'].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        getUser({
                            userName: this.ruleForm.account,
                            passWord: this.ruleForm.checkPass,
                            langCode: this.lang
                        }).then(data => {
                            this.loading = false;
                            if(data) {
                                if(data.code != "200") {
                                    this.$message.error("用户名或密码不正确");
                                }else {
                                    sessionStorage.setItem("user", JSON.stringify(data.content));

                                    if(this.checked) {
                                        // 保存到localstorage
                                        var userJson = {
                                            username: this.ruleForm.account,
                                            password: this.ruleForm.checkPass,
                                            checked: this.checked
                                        }

                                        localStorage.setItem("loginUser", JSON.stringify(userJson));
                                    } else {
                                        localStorage.removeItem("loginUser");
                                    }

                                    this.$router.push('/main');
                                }
                            }
                        }).catch(()=>{
                            this.$message.error("请求服务器连接失败");
                            this.loading = false;
                        });
                    }
                })
            },
            getLangCode() {
                this.loading = true;

                getLang().then(data => {
                    if (data && data.code == "200") {
                        this.langOption = data.content;
                        this.lang = this.langOption[0].code;
                        this.loading = false;
                    }
                }).catch(()=>{
                });
            },
            getLoginUser() {
                var loginUser = localStorage.getItem("loginUser");

                if(loginUser != null && typeof(loginUser) != "undefined") {
                    var userJson = JSON.parse(loginUser);

                    this.checked = userJson.checked;
                    this.ruleForm.account = userJson.username;
                    this.ruleForm.checkPass = userJson.password;
                }
            }
        },
    }

</script>

<style lang="scss">
    .login {
        position: absolute;
        width: 100%;
        height: 100%;
        background: url('../../static/images/login-bk.png') no-repeat center;
        background-size: cover;
    }
    .login-container {
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 0px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        filter:alpha(opacity=92);
        -moz-opacity:0.92;
        -khtml-opacity: 0.92;
        opacity: 0.92;
    .login-logo {
        font-size: 25px;
        text-align: center;
        font-weight: 300;
        margin-bottom: 10px;
        p {
            color: #b82837;
        }
    }
    .title {
        margin: 0px auto 40px auto;
        text-align: center;
        color: #505458;
    }

    .remember {
        margin: 0px 0px 35px 0px;
    }

    }
    .el-form-item {
        margin-bottom: 5px;
    }
</style>