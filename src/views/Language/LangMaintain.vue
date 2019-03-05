<template>
    <section v-loading="v_loading"
             element-loading-text="请稍后...">
        <el-row style="background-color: #F3F3F4">
            <el-col :span="24" class="toolbar">
                <div style="height:40px">
                    <el-select v-model="langType"
                               placeholder="请选择类别"
                               size="small"
                               style="width: 100px"
                               @change="Filter">
                        <el-option
                                v-for="type in typeOption"
                                :key="type.code"
                                :label="type.typeName"
                                :value="type.code">
                        </el-option>
                    </el-select>
                    <el-select v-model="langSelect"
                               multiple
                               placeholder="请选择语言"
                               size="small"
                               style="width: 300px">
                        <el-option
                                v-for="lang in langOption"
                                :key="lang.code"
                                :label="lang.langName"
                                :value="lang.code">
                        </el-option>
                    </el-select>
                    <el-button size="small" type="primary" icon="el-icon-plus" @click="AddLang">增加</el-button>
                    <el-button size="small" type="primary" icon="el-icon-document" @click="Save" style="margin-left: 0px">保存</el-button>
                </div>
                <el-input v-model="keyWord"
                          placeholder="请输入关键字"
                          size="small"
                          style="width: 404px">
                </el-input>
                <el-button size="small" type="primary" icon="el-icon-search" @click="Filter">查找</el-button>
            </el-col>
        </el-row>

        <el-table
                :data="langData"
                border
                style="font-size:12px">
            <el-table-column label="编码" align="center" width="80">
                <template slot-scope="scope">
                    {{ scope.row.number }}
                </template>
            </el-table-column>
            <el-table-column label="中文（ZH）" align="center" :resizable="false"
                             v-if="DspCol('zh')">
                <template slot-scope="scope">
                    <el-input size="small"
                              v-model="scope.row.zh"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="英文（EN）" align="center" :resizable="false"
                             v-if="DspCol('en')">
                <template slot-scope="scope">
                    <el-input size="small"
                              v-model="scope.row.en"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="日语（JP）" align="center" :resizable="false"
                             v-if="DspCol('ja')">
                <template slot-scope="scope">
                    <el-input size="small"
                              v-model="scope.row.ja"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="越南语（VI）" align="center" :resizable="false"
                             v-if="DspCol('vi')">
                <template slot-scope="scope">
                    <el-input size="small"
                              v-model="scope.row.vi"></el-input>
                </template>
            </el-table-column>
        </el-table>
    </section>
</template>

<script>
    import {
        getLang,
        GetLangMast,
        SaveLangMast
    } from '../../api/api';

    import {
        getRowFromArray,
        arraySearch,
        isNullOrWhiteSpace,
        isObjectValueEqual,
        deepCopy
    } from '../../assets/js/common';

    export default {
        data() {
            return {
                v_loading: false,
                langOption: [],
                langSelect: [],
                typeOption: [],
                langType: "",
                langMast: [],
                langData: [],
                langDataBackup: [],
                langDataSave: [],
                keyWord: ""
            }
        },
        methods: {
            // 取得语言列表
            SetLangOption(cb) {
                getLang().then(data => {
                    if (data && data.code == "200") {
                        this.langOption = data.content;
                        cb();
                    } else {
                        this.v_loading = false;
                    }
                }).catch(()=>{
                    this.v_loading = false;
                })
            },
            // 取得语言字典
            GetLangMast() {
                GetLangMast('').then(data => {
                    this.langData = [];

                    if(data && data.code == "200") {
                        this.langMast = data.content;
                    } else {
                        this.langMast = [];
                    }
                    this.Filter();
                }).catch(()=>{
                    this.langData = [];
                    this.v_loading = false;
                })
            },
            // 初始化选择语言
            InitialLang() {
                if(this.langSelect.length == 0 && this.langOption.length > 1) {
                    for(var i = 0; i < 2; i++) {
                        this.langSelect.push(this.langOption[i].code);
                    }
                }
                this.v_loading = false;
            },
            // 初始化语言字典类别
            InitialType() {
                this.typeOption.push({
                    code: "menu",
                    typeName: "Menu"
                },{
                    code: "label",
                    typeName: "Label"
                },{
                    code: "button",
                    typeName: "Button"
                },{
                    code: "text",
                    typeName: "Text"
                },{
                    code: "charge",
                    typeName: "Charge"
                });

                this.langType = this.typeOption[0].code;
            },
            // 过滤数据
            Filter() {
                this.langData = [];
                this.langDataBackup = [];
                var zh_flag = this.DspCol("zh");
                var en_flag = this.DspCol("en");
                var ja_flag = this.DspCol("ja");
                var vi_flag = this.DspCol("vi");;

                for(var lang of this.langMast) {
                    if(lang.type == this.langType) {
                        if(!isNullOrWhiteSpace(this.keyWord)) {
                            if((!zh_flag || lang.zh.toLowerCase().indexOf(this.keyWord.toLowerCase()) <= -1) &&
                               (!en_flag || lang.en.toLowerCase().indexOf(this.keyWord.toLowerCase()) <= -1) &&
                               (!ja_flag || lang.ja.toLowerCase().indexOf(this.keyWord.toLowerCase()) <= -1) &&
                               (!vi_flag || lang.vi.toLowerCase().indexOf(this.keyWord.toLowerCase()) <= -1)) {
                                continue;
                            }
                        }
                        this.langData.push(deepCopy(lang));
                        this.langDataBackup.push(deepCopy(lang));
                    }
                }
                this.v_loading = false;
            },
            // 是否显示行
            DspCol(col) {
                if(isNullOrWhiteSpace(col)) {
                    return false;
                }
                var result = false;

                for(var lang of this.langSelect) {
                    var wkString= lang;
                    if(col.toLowerCase() == wkString.toLowerCase()) {
                        result = true;
                        break;
                    }
                }
                return result;
            },
            // 增加
            AddLang() {
                var langObj = {
                    guid: "",
                    type: this.langType,
                    number: "",
                    zh: "",
                    en: "",
                    ja: "",
                    vi: "",
                    changeFlag: ""
                }
                this.langData.push(langObj);
            },
            // 保存
            Save() {
                this.langDataSave = [];

                // 将有变更的记录打上变更Flag
                for(var i = 0; i < this.langData.length; i++){
                    if(isNullOrWhiteSpace(this.langData[i].guid)){
                        if(!isNullOrWhiteSpace(this.langData[i].zh) ||
                            !isNullOrWhiteSpace(this.langData[i].en) ||
                            !isNullOrWhiteSpace(this.langData[i].ja) ||
                            !isNullOrWhiteSpace(this.langData[i].vi)) {
                            this.langDataSave.push(this.langData[i]);
                        }
                        continue;
                    }
                    if(this.langData[i].zh != this.langDataBackup[i].zh ||
                       this.langData[i].en != this.langDataBackup[i].en ||
                       this.langData[i].ja != this.langDataBackup[i].ja ||
                       this.langData[i].vi != this.langDataBackup[i].vi) {
                        this.langData[i].changeFlag = "1";
                        this.langDataSave.push(this.langData[i]);
                    }
                }
                if(this.langDataSave.length == 0) {
                    this.$message({
                        type: 'error',
                        message: "没有记录需要被保存",
                        duration: 5000
                    })
                    return;
                }

                SaveLangMast({
                    lstLangMast: this.langDataSave
                }).then(data => {
                    if(data && data.code == "200") {
                        this.$message({
                            type: 'success',
                            message: data.content + "条记录被保存",
                            duration: 5000
                        })
                    } else {
                        this.$message({
                            type: 'error',
                            message: "没有记录被保存",
                            duration: 5000
                        })
                    }
                    this.GetLangMast(false);
                }).catch(()=>{
                    this.langData = [];
                    this.v_loading = false;
                })
            }
        },
        mounted() {
            // 初始化语言字典类别
            this.InitialType();
            // 取得语言列表
            this.SetLangOption(this.InitialLang);
            // 取得语言字典
            this.GetLangMast();

        }
    }
</script>
<style>
    @import '../../assets/css/common.css';

    .el-table td, .el-table th {
        padding-top: 3px ;
        padding-bottom: 3px;
    }
</style>