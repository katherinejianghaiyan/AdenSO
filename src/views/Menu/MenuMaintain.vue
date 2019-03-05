<template>
    <div style="background-color: #F3F3F4">
    <section v-loading.fullscreen.lock="loading"
             element-loading-text="Data Loading"><br>
        <div class="container">
            <el-row>
                <el-col :span="4">
                    <el-select style="width:150px;height:30px;font-family: SC-Medium;font-size: 16; color: #4A4A4A" size="small" v-model="company" :placeholder="langData.selectcompany" @change="setCompany">
                            <el-option v-for="item in companyOptions"
                                :key="item.companyCode"
                                :value="item.companyCode"
                                :label="item.companyCode +' / '+item.companyName_ZH">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-cascader
                            v-model="itemClass"
                            :options="options"
                            change-on-select
                            size="small"
                            filterable
                            @change="setcookwaysClass"
                            style="width:150px;height:30px;font-family: SC-Medium;font-size: 16; color: #4A4A4A">
                    </el-cascader>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="ItemShapeClass" size="small" @change="setcookwaysClass"
                            style="width:150px;height:30px;font-family: SC-Medium;font-size: 16; color: #4A4A4A;">
                        <el-option key="" value="" :label="langData.ItemShape"></el-option>
                        <el-option v-for="item in ItemShapeOption"
                                :key="item.guid"
                                :value="item.guid"
                                :label="item.name">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="cookwaysClass" size="small" @change="setcookwaysClass"
                            style="width:150px;height:30px;font-family: SC-Medium;font-size: 16; color: #4A4A4A;">
                        <el-option key="" value="" :label="langData.CookMethods"></el-option>
                        <el-option v-for="item in cookOption"
                                :key="item.guid"
                                :value="item.guid"
                                :label="item.name">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-button plain style="background-color:#E8380D;color: white;" size="small" @click.native="addMenu" :disabled="this.vShow || !canChange">{{langData.New}}</el-button>
                </el-col>
            </el-row>
            <el-row style="margin-top:10px">
                <el-col :span="24">
                    <el-input v-model="keyword" size="small" :placeholder="langData.keyWord" style="width:370px;height:30px">
                        <el-button size="small" slot="append" @click="filterData" icon="el-icon-search" style="border:none"></el-button>
                    </el-input>

                </el-col>
            </el-row>
        </div><br>

        <transition>
            <div v-loading="loadingMenu"
                 element-loading-text="Data Loading..." id="itemstable">
                <el-row v-if="seeTable">
                    <el-col :span="24">
                        <div style="height:50px;background-color: #D8D8D8;border-radius: 10px 10px 0px 0px;">
                            &nbsp;&nbsp;
                                <span style="margin-top:15px;font-family: Avenir-Regular">Show</span>&nbsp;&nbsp;
                                <select v-model="pageSize"
                                           size="small"
                                           style="width:5%;vertical-align:center; margin-top:15px;background-color: #D8D8D8;
                                           border-top:none;border-right: none;border-left: none;"
                                           @change="changeSize">
                                    <option v-for="item in Options" :key="item.value" :value="item.value" :label="item.label">
                                    </option>
                                </select>&nbsp;&nbsp;
                                <span style="margin-top:14px;font-family: Avenir-Regular">entries</span>
                        </div>
                        <el-table
                                :header-row-style="this.objHeaderRow"
                                :data="filterMenuData"
                                @sort-change="sortCol"
                                stripe
                                style="width: 100%;font-size:12px"
                                :height="this.fullHeight<300?300:this.fullHeight">
                            <el-table-column type="index" width="40" :resizable="false">
                            </el-table-column>
                            <el-table-column v-if="false">
                                <template slot-scope="scope">
                                    <span>{{scope.row.GUID}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.sort" v-if="false" prop="sort" sortable="custom">
                                <template slot-scope="scope">
                                    <span>{{scope.row.sort}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Code" prop="itemCode" sortable="custom"
                                             width="100" :resizable="false" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span>{{scope.row.itemCode}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Name_ZH" width="180" :resizable="false" prop="itemName_ZH" sortable="custom" :show-overflow-tooltip="true"
                                             align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.itemName_ZH}}</span><br>
                                    <span style="font-family:Avenir-Regular;font-size:16; color:#4A4A4A">{{scope.row.itemName_EN}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.MenuClass" width="180" :resizable="false"
                                             prop="itemCode" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span v-if="false">{{scope.row.nationGuid}}</span>
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.nation}}</span>

                                    <span v-if="scope.row.menuClassGuid!==''">/</span>

                                    <span v-if="false">{{scope.row.menuClassGuid}}</span>
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.menuClass}}</span>

                                    <span v-if="scope.row.rmClass.length !== 0">/</span>
                                    <span v-if="false">{{scope.row.rmClassGuid}}</span>
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.rmClass}}</span>

                                    <span v-if="scope.row.ItemShapeClass.length !== 0">/</span>
                                    <span v-if="false">{{scope.row.itemShapeGUID}}</span>
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.ItemShapeClass}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.KeyColor" width="80" :resizable="false" prop="itemColor" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <div :style=BGColor(scope.row.itemColor)>&nbsp;
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Taste" width="80" :resizable="false" prop="itemTaste" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.itemTaste}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.weightperServe" width="120" :resizable="false" prop="weight" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.weight}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.CostPerServe" width="90" :resizable="false" prop="weight" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.itemCostperDish}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Creator" width="80" :resizable="false" prop="createUserName" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.createUserName}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.CreatTime" width="120" :resizable="false" prop="createTime" sortable="custom"
                                             :show-overflow-tooltip="true" align="center" header-align="center">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.createTime}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="false">
                                <template slot-scope="scope">
                                    <span style="font-family:SC-Medium;font-size:16; color:#4A4A4A">{{scope.row.version}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="false">
                                <template slot-scope="scope">
                                    <span>{{scope.row.seasonClassGUID}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="false">
                                <template slot-scope="scope">
                                    <span>{{scope.row.itemStatus}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Edit" fixed="right">
                                <template slot-scope="scope">
                                    <el-button style="border:none" size="small" v-model="scope.row.Edit" @click="Edit(scope.row)">
                                        <img src="../../../static/images/icon01.png" height="20" width="15"/></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div style="float:left;margin-top:1%">
                            <span style="font-family: Avenir-Regular;">Showing</span>
                            <span>{{this.pageSize*(this.page-1)+1}}</span> <span style="font-family: Avenir-Regular;">to</span>
                            <span>{{this.pageSize*(this.page)+1}}</span> <span style="font-family: Avenir-Regular;">of</span>
                            <span>{{this.DB.length}}</span> <span style="font-family: Avenir-Regular;">entries</span>
                        </div>
                        <div style="float: right;margin-top:1%">
                            <el-pagination
                                    @size-change="handleSizeChange"
                                    @current-change="handleCurrentChange"
                                    :current-page.sync="currentPage2"
                                    layout="prev, pager, next"
                                    :total="this.DB.length"
                                    :page-size="this.pageSize"
                                    :page-sizes="[10,50,100]">
                            </el-pagination>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </transition>

        <el-dialog :title="this.langData.NewMenu" :visible.sync="dialogTableVisible" size="large" width="90%" top="2%" v-loading="loadingRecipe">
            <el-input v-model="inputGuid" v-if="false"></el-input>
            <div>
                <el-form :model="mainData" :inline="true" ref="mainData">
                    <el-form-item :label="this.langData.Code" style="margin-right:2%;" prop="code">
                        <el-input size="small" v-model="mainData.code" placeholder="" style="width:140px" disabled></el-input>
                    </el-form-item>
                    <el-form-item :label="langData.Name_ZH" style="margin-right:2%" prop="name_cn">
                        <el-input size="small" v-model="mainData.name_cn" placeholder=""></el-input>
                    </el-form-item>
                    <el-form-item :label="langData.Name_EN" style="margin-right:2%" prop="name_en">
                        <el-input size="small" v-model="mainData.name_en" placeholder=""></el-input>
                    </el-form-item>
                    <el-form-item :label="langData.version" style="margin-right:2%" prop="version">
                        <el-input size="small" v-model="mainData.version" style="width:153px"></el-input>
                    </el-form-item>
                    <div>
                        <el-form-item :label="langData.weightPerServe" style="margin-right:2%" prop="weight">
                            <number-input size="small" v-model="weightpershare" placeholder="" validType="+int" style="width:80px" v-if="false"></number-input>
                            <el-tag>{{weightpershare}}</el-tag>
                        </el-form-item>

                        <el-form-item :label="langData.CostPerServe" style="margin-right:2%" prop="weight">
                            <el-tag>{{CostPerServe}}</el-tag>
                        </el-form-item>

                        <el-form-item :label="langData.shareQty" style="margin-right:2%" prop="weight">
                            <number-input size="small" v-model="mainData.shareQty" placeholder="" validType="+int" style="width:80px"></number-input>
                        </el-form-item>
                        <el-form-item :label="langData.sort" style="margin-right:2%" prop="sort">
                            <el-input size="small" v-model="mainData.sort" style="width:140px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox v-model="mainData.checked">{{langData.Valid}}</el-checkbox>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size="small" @click="reviseMenu" v-if="seeNew" style="margin-left: 80%">{{langData.Save}}</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size="small" @click.native="reviseMenu" v-if="seeEdit" style="margin-left: 80%" :disabled="!canChange">
                                {{langData.Save}}
`                           </el-button>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
            <el-tabs v-model="activeName" type="border-card">
                <el-tab-pane :label="langData.Categorize" name="first">
                    <div style="height:300px">
                        <el-form :model="mainData" :inline="true" ref="mainData">
                            <el-form-item :label="langData.Nation" style="margin-right:2%" prop="nation">
                                <el-select v-model="mainData.nation" size="small" filterable style="width:140px" @change="setmenuClass" :disabled="checknation">
                                    <el-option v-for="item in mainData.nationOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langData.MenuClass" style="margin-right:2%" prop="mainClass">
                                <el-select v-model="mainData.mainClass" size="small" style="width:120px"
                                           filterable @change="setrmClass" :disabled="checkmainClass">
                                    <el-option v-for="item in mainData.mainClassOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langData.rmClass" style="margin-right:2%" prop="rmClass">
                                <el-select v-model="mainData.rmClass" size="small" style="width:120px" filterable :disabled="checkrmClass">
                                    <el-option v-for="item in mainData.rmClassOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item :label="langData.ItemShape" style="margin-right:2%" prop="cookClass">
                                <el-select v-model="mainData.ItemShapeClass" size="small" style="width:100px" disabled>
                                    <el-option key="" value="" :label="langData.All"></el-option>
                                    <el-option v-for="item in ItemShapeOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item :label="langData.CookMethods" style="margin-right:2%" prop="cookClass">
                                <el-select v-model="mainData.cookClass" size="small" style="width:180px" filterable :disabled="checkcookClass">
                                    <el-option key="" value="" :label="langData.All"></el-option>
                                    <el-option v-for="item in mainData.cookClassOption"
                                               :key="item.guid"
                                               :value="item.guid"
                                               :label="item.name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <div>
                                <el-form-item :label="langData.KeyColor" style="margin-right:2%;" prop="color">
                                    <el-select size="small" filterable v-model="mainData.color" style="width:140px">
                                        <el-option v-for="item in mainData.itemColorOption"
                                                   :key="item.name_en"
                                                   :value="item.name_en"
                                                   :label="item.name">
                                            <i style="float:left">{{item.name}}</i>&nbsp;&nbsp;
                                            <i :style=BGColor(item.name_en)>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="langData.Taste" style="margin-right:2%" prop="taste">
                                    <el-input v-model="mainData.taste" size="small" style="width:120px"></el-input>
                                </el-form-item>
                                <el-form-item :label="langData.Spicy" style="margin-right:2%" prop="spicy">
                                    <el-select size="small" filterable v-model="mainData.spicy" style="width:140px">
                                        <el-option v-for="item in spicyOptions" :value="item.value" :label="item.label" :key="item.value"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="langData.seasonClass" style="margin-right:2%" prop="seasonClass">
                                    <el-select v-model="mainData.seasonClass" size="small" style="width:180px" filterable>
                                        <el-option v-for="item in mainData.seasonClassOption"
                                                   :key="item.guid"
                                                   :value="item.guid"
                                                   :label="item.name">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane :label="langData.Recipe" name="second">
                    <el-table :data="BOMTable"
                              style="width:100%"
                              stripe
                              border
                              :height="fullHeight2+50">
                        <el-table-column type="index" label="#" width="50" :resizable="false">
                        </el-table-column>
                        <el-table-column :label="langData.RMCode" width="280" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <el-autocomplete class="inline-input" v-model="scope.row.rmCode" :fetch-suggestions="querySearchRMCode"
                                                 :trigger-on-focus="true"
                                                 style="width:250px"
                                                 @select = "checkrmCode(scope.$index,scope.row)"
                                                 @change.native = "validityCheck(scope.$index,scope.row)"
                                                 @click.native="$event.target.select()">
                                </el-autocomplete>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.RMOfficialName" width="150" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.itemDesc" placeholder=""></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.RMweight+'(g/'+mainData.shareQty+langData.share+')'" width="120" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <number-input v-model="scope.row.weight" validType="+decimal"></number-input>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.Unitcode" width="50" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                    <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='KG'">g</span>
                                    <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='L'">ml</span>
                                    <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='G'">g</span>
                                    <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='ML'">ml</span>
                                </div>
                            </template>
                        </el-table-column>
                        <!--非所有价格-->
                        <el-table-column :label="langData.Latest" :width="!showAllPrice? 100:1" :resizable="false" align="left" header-align="center">
                            <template slot="header" slot-scope="scope" v-if="!showAllPrice">
                                <el-dropdown @command="priceColHandler">
                                    <span class="el-dropdown-link">
                                        {{ showLatestPrice?langData.latestPrice:langData.validPrice }}
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="all">所有</el-dropdown-item>
                                        <el-dropdown-item command="valid">有效</el-dropdown-item>
                                        <el-dropdown-item command="latest">最新</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <template slot-scope="scope" v-if="!showAllPrice">
                                <div v-if="showLatestPrice">
                                    <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                        <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                             {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                        / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                        </span>
                                    </div>
                                    <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                        <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                    </div>
                                </div>
                                <div v-if="!showLatestPrice">
                                        <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                            <!--有效的采购价格-->
                                            <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B' &&
                                            getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus ==='A'">
                                            {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                            / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                        </span>
                                        <!--无效的采购价格为0-->
                                            <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B' &&
                                            getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus ==='B'">
                                            {{0}}
                                        </span>

                                        </div>
                                            <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                            <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                        </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!--所有价格-->
                        <el-table-column header-align="center" width="120" v-if="showAllPrice">
                            <template slot="header" slot-scope="scope" v-if="showAllPrice">
                                <el-dropdown @command="priceColHandler">
                                    <span class="el-dropdown-link">
                                        {{langData.Price}}
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <!--<el-dropdown-item command="valid">有效</el-dropdown-item>-->
                                        <el-dropdown-item command="all">所有</el-dropdown-item>
                                        <el-dropdown-item command="valid">有效</el-dropdown-item>
                                        <el-dropdown-item command="latest">最新</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <!--所有价格: 有效-->
                            <el-table-column :label="langData.Valid" width="100" :resizable="false" align="left" header-align="center" v-if="showAllPrice">
                                <template slot-scope="scope">
                                    <div>
                                        <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                            <!--有效的采购价格-->
                                            <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B' &&
                                                getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus ==='A'">
                                             {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                        / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                        </span>
                                            <!--无效的采购价格为0-->
                                            <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B' &&
                                                getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus ==='B'">
                                             {{0}}
                                        </span>
                                        </div>
                                        <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                            <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <!--所有价格: 最新-->
                            <el-table-column :label="langData.Latest" width="100" :resizable="false" align="left" header-align="center" v-if="showAllPrice">
                                <template slot-scope="scope">
                                    <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                    <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                         {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                    / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                    </span>
                                    </div>
                                    <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                        <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        <el-table-column :label="langData.PurchaseUnit" width="80" :resizable="false" v-if="true" align="left" header-align="center">
                            <template slot-scope="scope">
                                <span v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                    {{getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toLowerCase()}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.itemCost" width="100" :resizable="false" prop="itemCost" align="left" header-align="center">
                            <template slot-scope="scope">
                                <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                        {{getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toUpperCase()==='KG'
                                ||getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toUpperCase()==='L'?
                                    float(((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                    / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate)/1000
                                    * scope.row.weight),6):'0.00'}}
                                 </span>
                                </div>
                                <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                    {{(scope.row.extraItemPrice * scope.row.weight)}}
                                 </div>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.effect" width="120" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <number-input v-model="scope.row.effect" validType="decimal" @blur="checkeffect(scope.row)"></number-input>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.purchase" width="60" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <el-checkbox v-model="scope.row.purchasePolicy"></el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column :label="langData.Practise" width="80" :resizable="false" align="left" header-align="center">
                            <template slot-scope="scope">
                                <el-button type="danger" @click="deleteBOMitem(scope.$index,scope.row)">{{langData.Delete}}</el-button>
                                <!--<el-checkbox v-model="scope.$index">{{langData.Delete}}</el-checkbox>-->
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-form :inline="true" :model="BOMForm" ref="BOMForm">
                        <el-form-item style="margin-right:2%">
                            <el-button size="small" type="primary" @click="addBOMItem">{{langData.Add}}</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button size="small" type="primary" @click="addNewItem(true)">{{langData.NewItem}}</el-button>
                        </el-form-item>

                    </el-form>
                </el-tab-pane>
                <el-tab-pane :label="langData.flavoring" name="third">
                    <el-form :inline="true" :model="BOMForm" ref="BOM">
                        <div>
                            <el-table :data="subBOMTable"
                                      border
                                      stripe
                                      :height="fullHeight2+50"
                                      style="width:100%">
                                <el-table-column type="index" label="#" width="50" :resizable="false">
                                </el-table-column>
                                <el-table-column :label="langData.RMCode" width="280" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-autocomplete class="inline-input" v-model="scope.row.rmCode" :fetch-suggestions="querySearchRMCode"
                                                         :trigger-on-focus="true"
                                                         style="width:250px"
                                                         @select = "checkflavorCode(scope.$index,scope.row)"
                                                         @change.native = "validityCheck(scope.$index,scope.row)"
                                                         @click.native="$event.target.select()">
                                        </el-autocomplete>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.RMOfficialName" width="150" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-input v-model="scope.row.itemDesc" ></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.Qty+'('+mainData.shareQty+langData.share+')'" width="100" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <number-input v-model="scope.row.weight"  validType="decimal"></number-input>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.Unitcode" width="50" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <div v-if="scope.row.rmCode!==''&& typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                            <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='KG'">g</span>
                                            <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='L'">ml</span>
                                            <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='G'">g</span>
                                            <span v-if="getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').conversionUnit.toUpperCase()==='ML'">ml</span>
                                        </div>
                                    </template>
                                </el-table-column>
                                <!--非所有价格-->
                                <el-table-column :width="!showAllPrice? 100:1" :resizable="false" align="left" header-align="center">
                                    <template slot="header" slot-scope="scope" v-if="!showAllPrice">
                                        <el-dropdown @command="priceColHandler">
                                    <span class="el-dropdown-link">
                                        {{ showLatestPrice?langData.latestPrice:langData.validPrice }}
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item command="all">所有</el-dropdown-item>
                                                <el-dropdown-item command="valid">{{langData.Valid}}</el-dropdown-item>
                                                <el-dropdown-item command="latest">{{langData.Latest}}</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </template>
                                    <template slot-scope="scope" v-if="!showAllPrice">
                                        <!--最新价格-->
                                        <div v-if="showLatestPrice">
                                            <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                                    {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                                / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                                </span>
                                            </div>
                                            <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                                <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                            </div>
                                        </div>
                                        <!--有效价格-->
                                        <div v-if="!showLatestPrice">
                                            <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                                <!--有效的配料采购价格-->
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'
                                                && getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus==='A'">
                                                {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                            / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                            </span>
                                                <!--无效的配料采购价格为0-->
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'
                                                && getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus === 'B'">
                                                {{0}}
                                            </span>
                                            </div>
                                            <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                                <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>

                                <!--所有价格-->
                                <el-table-column :label="langData.Price" header-align="center" v-if="showAllPrice">
                                    <template slot="header" slot-scope="scope" v-if="showAllPrice">
                                        <el-dropdown @command="priceColHandler">
                                            <span class="el-dropdown-link">
                                                {{langData.Price}}
                                                <i class="el-icon-arrow-down el-icon--right"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item command="all">{{langData.All}}</el-dropdown-item>
                                                <el-dropdown-item command="valid">{{langData.Valid}}</el-dropdown-item>
                                                <el-dropdown-item command="latest">{{langData.Latest}}</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </template>
                                    <!--所有价格: 有效-->
                                    <el-table-column :label="langData.Valid" width="80" :resizable="false" align="left" header-align="center"  v-if="showAllPrice">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                                <!--有效的配料采购价格-->
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'
                                                    && getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus==='A'">
                                                    {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                                    / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                                </span>
                                                <!--无效的配料采购价格为0-->
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'
                                                    && getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode').itemStatus === 'B'">
                                                    {{0}}
                                                </span>
                                            </div>
                                            <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                                <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <!--所有价格: 最新-->
                                    <el-table-column :label="langData.Latest" width="80" :resizable="false" align="left" header-align="center"  v-if="showAllPrice">
                                        <template slot-scope="scope">
                                            <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                                <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                                    {{float((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                                / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate),6)}}
                                                </span>
                                            </div>
                                            <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                                <number-input v-model="scope.row.extraItemPrice" validType="+decimal"></number-input>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table-column>

                                <el-table-column :label="langData.PurchaseUnit" width="80" :resizable="false" v-if="true" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                            {{getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toLowerCase()}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.itemCost" width="100" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <div v-if="scope.row.rmCode!=='' && typeof(getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,'itemCode'))!=='undefined'">
                                            <span v-if="scope.row.rmCode.substring(0,1)!=='A' && scope.row.rmCode.substring(0,1)!=='B'">
                                            {{getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toUpperCase()==='KG'
                                            ||getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionUnit.toUpperCase()==='L'?
                                                float(((getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").Price
                                                / getRowFromArray(scope.row.rmCode.substring(0,scope.row.rmCode.indexOf('/')-1), rmOptions,"itemCode").conversionRate)/1000
                                                * scope.row.weight),6):'0.00'}}
                                            </span>
                                        </div>
                                        <div v-if="scope.row.rmCode!=='' && (scope.row.rmCode.substring(0,1)==='A' || scope.row.rmCode.substring(0,1)==='B')">
                                            {{(scope.row.extraItemPrice * scope.row.weight)}}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.purchase" width="60" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row.purchasePolicy"></el-checkbox>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="langData.Practise" width="80" :resizable="false" align="left" header-align="center">
                                    <template slot-scope="scope">
                                        <el-button type="danger" @click="deleteFlavor(scope.$index,scope.row)">{{langData.Delete}}</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <el-form-item>
                            <el-button size="small" type="primary" @click="addsubBOMItem">{{langData.Add}}</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button size="small" type="primary" @click="addNewItem(false)">{{langData.NewFlavor}}</el-button>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane :label="langData.CookingMethodology" name="fourth">
                    <div>
                        <el-table :data="CookMethodsTable"
                                  border
                                  stripe
                                  style="width:100%"
                                  :height="fullHeight2+50">
                            <el-table-column label="#" type="index" width="80" :resizable="false"></el-table-column>
                            <el-table-column :label="langData.CookingMethodology" width="950" :resizable="false">
                                <template slot-scope="scope">
                                    <el-input style="width:100%"
                                              type="textarea"
                                              :rows="2"
                                              v-model="scope.row.cookMethods"
                                              :placeholder="langData.PutIn + langData.CookingMethodology">
                                    </el-input>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Practise" width="110" :resizable="false">
                                <template slot-scope="scope">
                                    <el-button type="danger" size="small" @click="deleteCookstep(scope.$index)">{{langData.Delete}}</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <el-button type="primary" size="small" @click="AddToCookMethods">添加步骤</el-button>
                </el-tab-pane>
                <el-tab-pane :label="langData.MenuPoint"  name="fifth">
                    <div>
                        <el-table :data="MenuPointTable"
                                  border
                                  stripe
                                  style="width:100%"
                                  :height="fullHeight2+50">
                            <el-table-column label="#" type="index" width="80" :resizable="false">
                            </el-table-column>
                            <el-table-column :label="langData.MenuPoint" width="950" :resizable="false">
                                <template slot-scope="scope">
                                    <el-input style="width:100%"
                                              type="textarea"
                                              :rows="2"
                                              v-model="scope.row.sellingpoint"
                                              :placeholder="langData.PutIn + langData.MenuPoint">
                                    </el-input>
                                </template>
                            </el-table-column>
                            <el-table-column :label="langData.Practise" width="110" :resizable="false">
                                <template slot-scope="scope">
                                    <el-button type="danger" size="small" @click="deleteMenuPoint(scope.$index)">{{langData.Delete}}</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <el-button type="primary" size="small" @click="AddToMenuPointTable">添加步骤</el-button>
                </el-tab-pane>
                <el-tab-pane :label="langData.picture" name="sixth">
                    <div style="height:300px">
                        <el-upload
                                class="upload-demo"
                                drag
                                action="https://jsonplaceholder.typicode.com/posts/"
                                multiple>
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">{{this.langData.DragUpload}}<em>{{this.langData.ClickUpload}}</em></div>
                            <div class="el-upload__tip" slot="tip">{{this.langData.PicFormatSize}}</div>
                        </el-upload>
                    </div>
                </el-tab-pane>
                <el-tab-pane :label="langData.nutritionDes" name="seventh">
                    <div style="height:300px">
                        <el-form :model="mainData" :inline="true">
                            <el-form-item :label="langData.Protein+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.protein" size="small" validType="+decimal"></number-input>
                            </el-form-item>
                            <el-form-item :label="langData.carbohydrate+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.carbohydrate" size="small" validType="+decimal"></number-input>
                            </el-form-item><br>
                            <el-form-item :label="langData.vitamine+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.vitamine" size="small" validType="+decimal"></number-input>
                            </el-form-item>
                            <el-form-item :label="langData.mineral+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.mineral" size="small" validType="+decimal"></number-input>
                            </el-form-item><br>
                            <el-form-item :label="langData.fat+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.fat" size="small" validType="+decimal"></number-input>
                            </el-form-item>
                            <el-form-item :label="langData.energy+'%'" style="margin-right:2%">
                                <number-input v-model="mainData.energy" size="small" validType="+decimal"></number-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>

        <el-dialog :title="RMorFlavor" :visible.sync="dialogTableVisible2" width="80%">
            <el-table :data="NewItem"
                      stripe
                      :height="fullHeight2+50"
                      style="width:100%">
                <el-table-column :label="langData.Category" width="120" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.ItemClass" size="small" style="width:100px" filterable :disabled="scope.row.D"
                                   @change="newItem(scope.$index,scope.row)">
                            <el-option value="A001" key="A001" label="中餐" v-if="newRM"></el-option>
                            <el-option value="A002" key="A002" label="西餐" v-if="newRM"></el-option>
                            <el-option value="B001" key="B001" label="中餐" v-if="newFlavor"></el-option>
                            <el-option value="B002" key="B002" label="西餐" v-if="newFlavor"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column v-if="false">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.GUID" size="small" disabled></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.Code" width="110" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.itemCode" size="small" disabled></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.Brand" width="110" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.itemBrand" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.Name_ZH" width="110" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.itemName_ZH" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.Name_EN" width="110" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.itemName_EN" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.specification" width="80" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.specification" size="small"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.PurchaseUnit" width="80" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.purchaseUnitcode" size="small">
                            <el-option value="PC" key="PC" label="PC"></el-option>
                            <el-option value="KG" key="KG" label="kg"></el-option>
                            <el-option value="L" key="L" label="l"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column width="20" :resizable="false">
                    <template slot-scope="scope">
                        <span>=</span>
                    </template>
                </el-table-column>

                <el-table-column :label="langData.conversionRate" width="80" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <number-input v-model="scope.row.conversionRate" size="small" validType="+decimal"></number-input>
                    </template>
                </el-table-column>
                <el-table-column :label="langData.conversionUnit" width="80" :resizable="false"
                                 :show-overflow-tooltip="true" align="left" header-align="center">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.conversionUnit" size="small">
                            <el-option value="G" key="G" label="g"></el-option>
                            <el-option value="ML" key="ML" label="ml"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <div>
                <el-button size="small" type="primary" style="margin-left:90%" @click="saveNewItem">{{langData.Save}}</el-button>
            </div>
        </el-dialog>
    </section>
    </div>
</template>

<script>
    import{ GetCompanyInAuth,menuClass,setMenuItem,searchItem,recipe,itemSource,itemSequence,GetMenu,MenuAction} from '../../api/api'
    import {
        arraySearch,
        getRowFromArray,
        createFilter,
        sortData,
        float
    } from '../../assets/js/common';

    import NumberInput from '../../components/NumberInput.vue'
    import ShowSearchItemsDialog from '../../components/ItemsSearchDialog.vue';
    import ChangeItemSupplierDialog from '../../components/ChangeSupplierofItem.vue';

    export default{
        components: {
            'number-input': NumberInput,
            'NewDish': ShowSearchItemsDialog,
            'NewRM':ChangeItemSupplierDialog
        },
        computed:{
            weightpershare(){
                let amount=0;
                for(let a of this.BOMTable){
                    amount-=(-a.weight);
                }
                return (amount/this.mainData.shareQty).toFixed(2);
            },
            CostPerServe(){
                let amount=0;
                for(let a of this.BOMTable){

                    var obj=getRowFromArray(a.rmCode.substring(0,a.rmCode.indexOf('/')-1), this.rmOptions,"itemCode");

                    if(typeof(obj)!=='undefined'){
                        amount-=-(obj.Price / obj.conversionRate)/1000 * a.weight;
                    }
                    if(a.extraItemPrice>0){
                        amount-=-(a.extraItemPrice * a.weight)
                    }
                }

                for(let b of this.subBOMTable){

                    var obj=getRowFromArray(b.rmCode.substring(0,b.rmCode.indexOf('/')-1), this.rmOptions,"itemCode");

                    if(typeof(obj)!=='undefined'){
                        amount-=-(obj.Price / obj.conversionRate)/1000 *  b.weight;
                    }
                    if(b.extraItemPrice>0){
                        amount-=-(b.extraItemPrice * b.weight);
                    }
                }
                return (amount/this.mainData.shareQty).toFixed(2);
            }
        },
        created(){
            this.Language();
            this.load();

        },
        data(){
            return{
                objHeaderRow:{
                    "font-family": "SC-Medium",
                    "font-size": "16",
                    "color": "#9B9B9B"
                },
                canChange:false,
                ShowItemDialog:false,
                ShowRMDialog:false,
                DBName:'',
                Items:[],
                sDate:'',
                eDate:'',
                RequiredDate:'',
                RequiredQty:'',
                costCenterCode:"",
                itemBOM:[],
                type:'',
                RMorFlavor:'',
                fullHeight: window.innerHeight-230,
                fullHeight2:window.innerHeight-450,
                loading:false,
                seeTable:false,
                ruleForm:{},
                newMenu:'',
                Class:'',
                status:'',
                statusOption:[],
                keyword:'',
                search:'',
                loadingMenu:false,
                loadingRecipe:false,
                filterMenuData:[],
                dialogTableVisible:false,
                activeName:'first',
                company:'',
                companyOptions:[],
                mainData:{
                    code:'',
                    name_cn:'',
                    name_en:'',
                    status:'',
                    nation:'',
                    version:'',
                    sort:'',
                    checked:true,
                    weightpershare:'',
                    itemType:'',
                    mainClass:'',
                    rmClass:'',
                    cookClass:'',
                    ItemShapeClass:'',
                    seasonClass:'',
                    color:'',
                    taste:'',
                    customerType:'',
                    protein:'',
                    vitamine:'',
                    mineral:'',
                    carbohydrate:'',
                    fat:'',
                    energy:'',
                    cookMethods:'',
                    sellingpoint:'',
                    nationOption:[],
                    mainClassOption:[],
                    rmClassOption:[],
                    cookClassOption:[],
                    seasonClassOption:[],
                    itemTypeOption:[],
                    itemColorOption:[],
                    shareQty:'100',
                    comp0:'',
                    spicy:''
                },
                dialogTableVisible2:false,
                BOMForm:{
                    rm:'',
                    rmName:'',
                    weight:'0',
                    effect:'0',
                    flavor:'',
                    flavorName:'',
                    itemDesc:'',
                    flavorweight:'0',
                    cost:'',
                    specification:''
                },
                BOMTable:[],
                subBOMTable:[],
                rmOptions:[],
                rmOptions1:[],
                flavorOptions:[],
                filter:{
                    nation:'',
                    mainClass:'',
                    rmClass:'',
                    cookClass:'',
                    cookClassOption:[]
                },
                mainClassTable:[],
                rmClassTable:[],
                cookClassTable:[],
                langData:[],
                CookMethodsTable:[],
                MenuPointTable:[],
                menuData:[],
                rmData:[],
                cookwayData:[],
                ItemShape:[],
                allData:[],
                inputGuid:'',
                seeNew:false,
                seeEdit:false,
                oldData:[],
                params:[],
                itemType:[],
                vShow:true,
                edit:'',
                checkmainClass:true,
                checknation:true,
                checkrmClass:true,
                checkcookClass:true,
                options:[],
                itemClass:[],
                cookwaysClass:'',
                cookOption:[],
                ItemShapeClass:'',
                ItemShapeOption:[],
                NewItem:[],
                DisableNewItem:false,
                newFlavor:false,
                newRM:false,
                DB:[],
                currentPage2: 1,
                page: 1,
                pageSize: 10,
                pageLines: [],
                PageNum: '5',
                Options: [
                    {
                        value: 10,
                        label: '10'
                        //label: '10条/页'
                    },
                    {
                        value: 50,
                        label: '50'
                        //label: '50条/页'
                    },
                    {
                        value: 100,
                        label: '100'
                        //label: '100条/页'
                    },
                ],
                dataSource:[],
                spicyOptions:[
                    {
                        value:0,
                        label:"无辣"
                    },
                    {
                        value:1,
                        label:"微辣"
                    },
                    {
                        value:2,
                        label:"中辣"
                    },
                    {
                        value:3,
                        label:"高辣"
                    },
                ],
                //显示采购价格类型：有效、最新
                showAllPrice:true,
                showLatestPrice:false,
                //编辑菜品是保存行记录
                editRow:[]
            }
        },
        methods:{
            //控制显示最新、有效采购价格
            priceColHandler(command){
                //this.showPriceType=command;
                if(command==='all'){
                    this.showAllPrice=true;
                    this.showLatestPrice=false;
                }
                else if(command==='latest'){
                    this.showAllPrice=false;
                    this.showLatestPrice=true;
                }
                else if(command==='valid'){
                    this.showAllPrice=false;
                    this.showLatestPrice=false;
                }
            },
            //主表行排序
            sortCol(col) {
                if(this.dataSource.length===0) return;
                this.dataSource = sortData(this.dataSource,col);
                this.filterData();
            },
            // 选择分页页面的行数
            changeSize(){
                this.currentPage2 = 1;
                this.handleCurrentChange(1);
            },
            handleSizeChange(val) {},
            handleCurrentChange(val) {
                this.page = val;
                this.filterMenuData = this.DB.filter((u, index) => index < this.pageSize * this.page && index >= this.pageSize * (this.page - 1));
            },

            saveNewItem(){
                var paramsNewItem=[];
                var menu=[];

                for(let line of this.NewItem){
                    if(line.purchaseUnitcode.length===0|| line.conversionUnit.length===0 || line.conversionRate==0){
                        this.$message.error("类别、名称、采购单位、转换系数和转换单位不能为空，目前没有数据需要保存");
                        return;
                    }

                    else if(line.itemCode.length>0 && (line.itemName_ZH.length>0 || line.itemName_EN.length>0) && line.purchaseUnitcode.length>0
                        && line.conversionUnit.length>0 && line.conversionRate>0){
                        paramsNewItem.push({
                            GUID:line.GUID,
                            oldGUID:line.oldGUID,
                            company: this.company,
                            itemCode:line.itemCode,
                            itemName_ZH:line.itemName_ZH,
                            itemName_EN:line.itemName_EN,
                            itemType:line.itemCode.substring(0,4)==='A001'||line.itemCode.substring(0,4)==='A002'?'RM':'Flavor',
                            itemStatus:'active',
                            toBuy:'1',
                            toSell:'0',
                            createUserGUID:this.user.userGuid,
                            changeFlag:'update',
                            itemBrand:line.itemBrand,
                            specification:line.specification,
                            purchaseUnitcode:line.purchaseUnitcode,
                            conversionUnit:line.conversionUnit,
                            conversionRate:line.conversionRate===''?'0.0000':line.conversionRate,
                        });
                    }
                }
                if(paramsNewItem.length>0){
                    menu.item= paramsNewItem;
                    menu.itemGuid=paramsNewItem[0].GUID;
                    menu.paramType=[{item: true, bom: false, cookway: false, menuPoint: false, nutrition: false}];
                    var obj=menu.item[0].itemType;
                    if(obj==='RM'){
                        this.newMenuItem(menu,true,true)
                    } else{
                        this.newMenuItem(menu,true,false);
                    }
                }

            },
            //加载
            load(){
                var user = sessionStorage.getItem('user');
                if (user) {
                    user = JSON.parse(user);
                    this.user = user;
                }
                //加载公司选项
                GetCompanyInAuth({
                    action: 'menu-data',
                    userGuid: this.user.userGuid
                }).then(data => {
                    if (data && data.code === "200") {
                        this.companyOptions = data.content;
                        this.company=this.companyOptions[0].companyCode;
                    }
                    else this.companyOptions = [];
                });
                //加载对话框中菜品分类
                this.GetMenuClass();

                this.statusOption=[
                    {value:'active',label:this.langData.Valid,key:'active'},
                    {value:'inactive',label:this.langData.Invalid,key:'inactive'},
                ];
                this.status=this.statusOption[0].value;
                this.mainData.itemTypeOption=[{
                        code:'FG',
                        name:this.langData.FG
                    },
                    {
                        code:'RM',
                        name:this.langData.RM
                    }];
                this.mainData.itemType=this.mainData.itemTypeOption[0].code;
                //加载主界面菜品分类
                this.GetMenu(this.user.langCode)

            },
            //加载主界面菜品分类
            GetMenu(langCode){
                GetMenu({
                   "":JSON.stringify({
                       langCode:langCode
                   })
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.options=[{
                            value:"",
                            label:this.langData.MenuClass
                        }];
                        for(let line of data.content){
                            this.options.push({
                                value:line.value,
                                label:line.label,
                                children:line.children
                            })
                        }
                        if(this.options.length>0){
                            this.itemClass[0]='';
                        }
                    }
                }).catch(()=>{});
            },
            // 主界面烹饪方法分类
            setcookwaysClass(){
                // 判断新增按钮可选性
                var disable=true;
                this.cookOption=[];
                this.ItemShapeOption=[];
                this.vShow=true;
                // 根据菜品分类设置菜品外形
                for(let line of this.ItemShape){
                    if(line.pguid===this.itemClass[0]){
                        this.ItemShapeOption.push({guid:line.guid,name:line.name})
                    }
                }
                if(this.ItemShapeOption.length===0){
                    this.ItemShapeClass='';
                } else {
                    var obj=arraySearch(this.ItemShapeClass,this.ItemShapeOption,"guid");
                    if(typeof(obj)=='undefined'||obj.length==0){
                        this.ItemShapeClass='';
                    }
                }
                // 根据菜品分类设置烹饪方法选项
                for(let line of this.cookwayData){
                    if(line.pguid===this.itemClass[0]){
                        this.cookOption.push({guid:line.guid,name:line.name});
                    }
                }
                if(this.cookOption.length===0){
                    this.cookwaysClass='';
                } else {
                    var obj=arraySearch(this.cookwaysClass,this.cookOption,"guid");
                    if(typeof(obj)=='undefined'||obj.length==0){
                        this.cookwaysClass='';
                    }
                }

                if(this.itemClass.length>0){
                    var obj=getRowFromArray(this.itemClass[0],this.options,"value");
                    if(typeof(obj)=='undefined'||obj.length==0){}
                    else{
                        if(this.itemClass.length>1){
                            var obj=getRowFromArray(this.itemClass[this.itemClass.length-1],obj.children,"value");

                            if(typeof(obj)=='undefined'||obj.length==0){
                                disable=false;
                            } else{

                                if(obj.children==null){
                                    disable=false;
                                }
                            }
                            // 如果烹饪方法和菜品形状未选，则新增按钮不可选
                            if(disable===false){
                                if(this.cookOption.length===0 && this.ItemShapeOption.length===0){
                                    this.vShow=false;
                                } else if(this.cookOption.length>0 && this.ItemShapeOption.length>0){
                                    if(this.cookwaysClass!=='' && this.ItemShapeClass!==''){
                                        this.vShow=false;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // 限制加工影响的有效区间
            checkeffect(row){
                if(row.effect>100 || row.effect<-100){
                    this.$message.error(this.langData.effect+this.langData.betweenMandPHundred);
                    row.effect='';
                }
            },
            // autocomplete选择调味品 - select：如果无重复项，自动加行，否则清空当前单元格项
            checkflavorCode(index,row){
                var a=0;
                for(let line of this.subBOMTable){
                    if(line.rmCode===row.rmCode){
                        a++;
                    }
                }
                if(a>1){
                    this.$message.error(this.langData.noduplicateCodeinFlavor);
                    row.rmCode='';
                } else {
                    if(index+1===this.subBOMTable.length && row.rmCode.length>0){
                        //新增调味品行项
                        this.addsubBOMItem();
                    }
                }
            },
            // autocomplete根据输入自动搜索原材料
            querySearchRMCode(queryString, cb) {
                var aryJson = this.rmOptions1;
                var result = queryString ? aryJson.filter(createFilter(queryString, "value", "contain")) : aryJson;
                cb(result);
            },
            // autocomplete判断输入是否有效：如果有效，自动加行，否则清空当前单元格项
            validityCheck(index,row){
                if(this.rmOptions1.length>0){
                    var array=arraySearch(row.rmCode,this.rmOptions1,"value");
                    if(typeof(array)==="undefined" || array.length===0){
                        row.rmCode="";
                    } else {
                        if(index+1===this.BOMTable.length && row.rmCode.length>0){
                            this.addBOMItem();
                        }
                    }
                }
            },
            // autocomplete选择BOM - select：如果无重复项，自动加行，否则清空当前单元格项
            checkrmCode(index,row){
                var a=0;
                for(let line of this.BOMTable){
                    if(line.rmCode===row.rmCode){
                        a++;
                    }
                }
                if(a>1){
                    this.$message.error(this.langData.noduplicateCodeinRecipe);
                    row.rmCode='';
                } else {

                    if(index+1===this.BOMTable.length && row.rmCode.length>0){
                        this.addBOMItem();
                    }
                }
            },
            //新增菜品根据菜品分类、形状、和烹饪方法自动生成序列号
            itemSequence(Code,row){
                itemSequence({
                    Code:Code,
                    itemType:'itemCode'
                }).then(data=>{
                    if(data && data.code==='200'){
                        for(let line of data.content){
                            var obj=line.Code + 10000 -(- line.NextNbr*1);
                            var obj1=line.Code += 10000 -(- line.NextNbr*1);

                            if(obj>0){
                                this.mainData.code=obj;
                                this.inputGuid = line.NextGUID;
                            }
                            if(obj1.length>0 && obj1!==''&& obj1!=='undefined'){
                                row.itemCode=obj1;
                                row.GUID = line.NextGUID;
                            }
                        }
                    }
                })
            },
            // 读取调味品和食材的选项列表
            itemSource:function(supplierCode){
                this.rmOptions=[];
                this.flavorOptions=[];
                this.rmOptions1=[];
                itemSource({
                 "" : JSON.stringify({
                    dbName:this.company,
                    supplierCode:supplierCode
                    })
                }).then(data=>{
                    if(data && data.code=='200'){
                        this.rmOptions=[];
                        this.flavorOptions=[];
                        var rm;
                        this.rmOptions=[];
                        this.rmOptions1=[];
                        for(let line of data.content){
                            rm = { "value": "" };

                            rm.value = line.itemCode + " / " + line.itemName_ZH;
                            this.rmOptions.push({
                                itemCode:line.itemCode,
                                name:line.itemName_ZH,Price:line.purchasePrice * (1+line.tax),
                                unitcode:line.unitcode,
                                conversionRate:line.conversionRate,
                                conversionUnit:line.conversionUnit,
                                itemStatus: line.itemStatus
                            });
                            // 加载autocomplete 控件change和querySearch事项的选项列表
                            this.rmOptions1.push(rm);
                        }
                    }
                }).catch(()=>{});
            },
            // 点击搜索后得到主表
            SearchItem(dbName){
                this.dataSource=[];
                this.loadingMenu=true;
                searchItem({
                    "": JSON.stringify({
                        dbName: dbName
                    })
                }).then((data)=>{
                    if(data && data.code==='200'){
                        this.dataSource=data.content;
                        if(this.dataSource.length>0) this.filterData(); //根据条件筛选数据
                        else if(this.dataSource.length===0){
                            this.DB=[];
                            this.filterMenuData=[];
                            this.loadingMenu=false;
                            this.$message.error("无数据");
                            var userInfo = sessionStorage.getItem('user');
                            if (userInfo) {
                                userInfo = JSON.parse(userInfo);
                                this.user = userInfo;
                            }
                        }
                    } else if(data && data.code==='500'){
                        this.DB=[];
                        this.filterMenuData=[];
                        this.loadingMenu=false;
                        this.$message.error("无数据");
                    }
                }).catch(()=>{
                    console.log('Fail01');
                });
            },
            //是否可以保存
            MenuAction(){
                MenuAction({
                    userGuid: this.user.userGuid,
                    company: this.company,
                    action: "menu-data"
                }).then(data => {
                    if (data && data.code === "200") {
                        this.canChange = data.content.CanChange;
                    }
                });
            },
            //筛选主数据
            filterData(){
                if(this.dataSource.length===0){
                    this.SearchItem(this.company);
                }
                this.DB=[];
                for(let line of this.dataSource){
                    if(this.itemClass.length > 0 && this.itemClass[this.itemClass.length-1].length>0
                        && this.itemClass[this.itemClass.length-1] != line.categoriesClassGUID
                        && this.itemClass[this.itemClass.length-1] != line.menuClassGUID
                        && this.itemClass[this.itemClass.length-1] != line.nationGUID)
                        continue;
                    if(this.ItemShapeClass.length>0 && this.ItemShapeClass != line.itemShapeGUID)
                        continue;
                    if(this.cookwaysClass.length>0 && this.cookwaysClass != line.cookwayClassGUID)
                        continue;
                    if(this.keyword.trim() != ""
                        && line.itemCode.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1
                        && line.itemName_ZH.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1
                        && line.itemName_EN.toUpperCase().indexOf(this.keyword.trim().toUpperCase()) == -1
                        && line.createUserName.toUpperCase().indexOf(this.keyword.trim().toUpperCase())==-1
                      )
                        continue;
                    this.resultfilter(line);
                }

                this.handleCurrentChange(1);
                this.pageSize = 10;
                this.currentPage2 = 1;

                if(this.DB.length>0){
                    this.seeTable=true;
                    this.loadingMenu=false;
                    this.MenuAction();
                } else {
                    this.seeTable=false;
                }
            },
            //最后一次筛选主数据
            resultfilter(line){
                var cookClass=''; var ItemShapeName='';
                if(line.cookwayClassGUID.length>0 && line.cookwayClassGUID!==''){
                    cookClass = typeof(arraySearch(line.cookwayClassGUID, this.mainData.cookClassOption, "guid")) == "undefined" ? "" : arraySearch(line.cookwayClassGUID, this.mainData.cookClassOption, "guid")[0].name;
                }
                if(line.itemShapeGUID.length>0 && line.itemShapeGUID!==''){
                    ItemShapeName = typeof(arraySearch(line.itemShapeGUID, this.ItemShape, "guid")) == "undefined" ? "" : arraySearch(line.itemShapeGUID, this.ItemShape, "guid")[0].name;
                }
                this.DB.push({
                    GUID: line.itemGuid,
                    sort: line.sort,
                    itemCode: line.itemCode,
                    itemName_ZH: line.itemName_ZH,
                    itemName_EN: line.itemName_EN,
                    nation: line.nation,
                    nationGuid: line.nationGUID,
                    menuClass: line.menuClassName,
                    menuClassGuid: line.menuClassGUID,
                    rmClass: line.categoriesClass,
                    rmClassGuid: line.categoriesClassGUID,
                    itemShapeGUID:line.itemShapeGUID,
                    ItemShapeClass:ItemShapeName,
                    cookClassGuid: line.cookwayClassGUID,
                    cookClass: cookClass,
                    itemColor: line.itemColor,
                    itemTaste: line.itemTaste,
                    itemSpicy:line.itemSpicy,
                    weight: line.weight,
                    itemCostperDish:line.itemCostperDish,
                    version: line.version,
                    seasonClassGUID: line.seasonClassGUID,
                    createUserName: line.createUserName,
                    shareQty: line.shareQty,
                    itemStatus: line.itemStatus,
                    createTime:line.createTime
                });
            },
            setCompany(){
                this.SearchItem(this.company);
                this.itemSource();
                this.initDateRange();
                this.pageSize = 10;
                this.currentPage2 = 1;
                this.MenuAction();
            },
            initDateRange(f,nation,mainClass,rmClass,cookClass,ItemShapeClass){
                this.mainData.name_cn='',
                    this.mainData.name_en='',
                    this.mainData.version='',
                    this.mainData.sort='',
                    this.mainData.color='',
                    this.mainData.taste='',
                    this.mainData.spicy="",
                    this.mainData.nation=nation,
                    this.mainData.mainClass=mainClass,
                    this.mainData.rmClass=rmClass,
                    this.mainData.cookClass=cookClass,
                    this.mainData.ItemShapeClass=ItemShapeClass,
                    this.BOMForm.rm='',
                    this.BOMForm.cost='',
                    this.BOMForm.rmName='',
                    this.BOMForm.itemDesc='',
                    this.BOMForm.weight='',
                    this.BOMForm.effect='',
                    this.BOMForm.flavor='',
                    this.BOMForm.flavorName='',
                    this.BOMForm.itemDesc='',
                    this.BOMForm.flavorweight='',
                    this.BOMTable=[],
                    this.subBOMTable=[],
                    this.CookMethodsTable=[],
                    this.MenuPointTable=[],
                    this.mainData.protein="",
                    this.mainData.carbohydrate="",
                    this.mainData.fat="",
                    this.mainData.energy="",
                    this.mainData.vitamine="",
                    this.mainData.mineral="",
                    this.mainData.checked=true;
            },
            //新增菜品，生成菜品序列号，向对话框传值
            addMenu(){
                var a='0';var b='0';var c='0';var d='0';var e='0';var s='0';
                var arrayA=arraySearch(this.itemClass[0], this.mainData.nationOption, "guid");
                if(typeof(arrayA) !== "undefined" && arrayA.length !== 0) {
                    a= arrayA[0].itemCodeId;
                }
                var arrayB=arraySearch(this.itemClass[1], this.menuData, "guid");
                if(typeof(arrayB) !== "undefined" && arrayB.length !== 0) {
                    b= arrayB[0].itemCodeId;
                }

                var arrayC=arraySearch(this.itemClass[this.itemClass.length-1], this.rmData, "guid");
                if(typeof(arrayC) !== "undefined" && arrayC.length !== 0) {
                    c= arrayC[0].itemCodeId;
                }
                var arrayD=arraySearch(this.cookwaysClass,this.cookwayData,"guid");
                if(typeof(arrayD) !== "undefined" && arrayD.length !== 0) {
                    d= arrayD[0].itemCodeId;
                }
                var arrayS=arraySearch(this.ItemShapeClass,this.ItemShape,"guid");
                if(typeof(arrayS) !=="undefined" && arrayS.length!==0){
                    s = arrayS[0].itemCodeId;
                }
                var f=a+b+c+d+s;
                //生成新的序列号
                this.itemSequence(f,[]);

                this.mainData.mainClassOption=[];this.mainData.mainClass='';
                this.mainData.rmClassOption=[];this.mainData.cookClassOption=[];
                for(let line of this.menuData){
                    if(line.pguid===this.itemClass[0]  && line.type==='Categories'){
                        this.mainData.mainClassOption.push({guid:line.guid,name:line.name});
                    }
                }
                for(let line of this.rmData){
                    if(line.pguid===this.itemClass[1]){
                        this.mainData.rmClassOption.push({guid:line.guid,name:line.name});
                    }
                }
                if(this.mainData.rmClassOption.length===0){
                    var obj = getRowFromArray(this.itemClass[1],this.mainData.mainClassOption,"guid");
                    this.mainData.rmClassOption.push({guid:obj.guid,name:obj.name});
                }

                for(let line of this.cookClassTable){
                    if(line.pguid===this.itemClass[0]){
                        this.mainData.cookClassOption.push({guid:line.guid,name:line.name});
                    }
                }

                this.mainData.rmClass=this.itemClass[this.itemClass.length-1];

                this.initDateRange(f,this.itemClass[0],this.itemClass[1],this.itemClass[this.itemClass.length-1],this.cookwaysClass,this.ItemShapeClass);
                this.seeNew=true;
                this.seeEdit=false;

                this.checkmainClass=true;
                this.checknation=true;
                this.checkrmClass=true;
                this.checkcookClass=true;

                this.dialogTableVisible=true;

                this.itemSource();
                this.addBOMItem();
                //新增调味品行项
                this.addsubBOMItem();
                this.AddToCookMethods();
                this.AddToMenuPointTable();

            },

            filterflavorName(){
                for(let line of this.flavorOptions){
                    if(line.itemCode===this.BOMForm.flavor){
                        this.BOMForm.flavorName=line.name;
                    }
                }
            },
            addBOMItem(){
                this.BOMTable.push({
                    step:this.BOMTable.length+1,
                    rmCode:'',
                    itemCost:'0.000',
                    extraItemPrice:'0.000',
                    rmName:'',
                    itemDesc:'',
                    effect:'',
                    weight:'',
                    purchasePolicy:true,
                    conversionUnit:'',
                    Price:'',
                    conversionRate:'',
                });
            },

            addNewItem:function(data){
                this.newRM=false;
                this.newFlavor=false;
                if(data){
                    this.newRM=true;
                    //mark='RM';
                    this.RMorFlavor=this.langData.NewItem;
                } else if(!data) {
                    this.newFlavor=true;
                    this.RMorFlavor = this.langData.NewFlavor;
                }
                this.dialogTableVisible2=true;
                this.NewItem=[];

                //  新增原材料对话框 - 新增行项
                this.addtoNewItemTable();
            },
            // 新增原材料对话框中选择原材料 / 调味品种类
            newItem(index,row){
                if(row.ItemClass.length>0){
                    this.itemSequence(row.ItemClass,row);
                }

            },
            //  新增原材料对话框 - 新增行项
            addtoNewItemTable(){
                this.NewItem.push({
                    GUID:'',
                    oldGUID:'',
                    D:false,
                    ItemClass:'',
                    itemCode:'',
                    company: this.company,
                    preitemCode:'',
                    itemType:'',
                    itemBrand:'',
                    preitemBrand:'',
                    itemName_ZH:'',
                    preitemName_ZH:'',
                    itemName_EN:'',
                    preitemName_EN:'',
                    itemStatus:'active',
                    preitemStatus:'active',
                    specification:'',
                    prespecification:'',
                    purchaseUnitcode:'',
                    prepurchaseUnitcode:'',
                    conversionUnit:'',
                    preconversionUnit:'',
                    conversionRate:'',
                    preconversionRate:''
                });
            },
            //新增调味品行项
            addsubBOMItem(){
                this.subBOMTable.push({
                    step:this.subBOMTable.length+1,
                    rmCode:'',
                    itemCost:'0.000',
                    extraItemPrice:'0.000',
                    flavorName:'',
                    itemDesc:'',
                    weight:'',
                    purchasePolicy:false,
                    conversionUnit:'',
                    Price:'',
                    conversionRate:'',
                });
            },
            //加载对话框中菜的分类
            GetMenuClass(){
                this.mainClassTable=[];
                this.cookClassTable=[];
                this.mainData.mainClassOption=[];
                menuClass({
                    langCode:this.user.langCode
                }).then(data=>{
                    if(data && data.code==='200'){
                        this.allData=data.content;
                        this.mainData.nationOption=[];
                        for(let line of data.content){
                            if(line.nationClass.length>0){
                                this.mainData.nationOption=line.nationClass;
                                this.mainData.nation=this.mainData.nationOption[0].guid;
                            }
                            if(line.seasonClass.length>0){
                                this.mainData.seasonClassOption=line.seasonClass;
                                this.mainData.seasonClass=this.mainData.seasonClassOption[0].guid;
                            }
                            if(line.cookwayClass.length>0){
                                this.cookwayData=line.cookwayClass;
                                this.mainData.cookClassOption=line.cookwayClass;
                                this.mainData.cookClass=this.mainData.cookClassOption[0].guid;
                                this.cookClassTable=line.cookwayClass;
                            }
                            if(line.ItemShape.length>0){
                                this.ItemShape=line.ItemShape;
                            }
                            if(line.menuClass.length>0){
                                this.menuData=line.menuClass;
                            }
                            if(line.rmClass.length>0){
                                this.rmData=line.rmClass;
                            }
                            if(line.itemColorOption.length>0){
                                this.mainData.itemColorOption=line.itemColorOption;
                            }
                            this.setmenuClass();
                            this.setrmClass();
                        }
                    }
                }).catch(()=>{});
            },
            // 主数据 - 编辑
            Edit(row){
                this.editRow = row;
                this.loading=true;
                this.edit='edit';
                this.checkmainClass=true;
                this.checknation=true;
                this.checkrmClass=true;
                this.checkcookClass=true;
                this.mainData.protein='';
                this.mainData.carbohydrate='';
                this.mainData.vitamine='';
                this.mainData.mineral='';
                this.mainData.fat="";
                this.mainData.energy="";
                this.oldData=[];
                this.seeEdit=true;
                this.seeNew=false;
                this.inputGuid=row.GUID;
                this.mainData.code=row.itemCode;
                this.mainData.name_cn=row.itemName_ZH;
                this.mainData.name_en=row.itemName_EN;
                this.mainData.version=row.version;
                this.mainData.sort=row.sort;
                this.mainData.color=row.itemColor;
                this.mainData.taste=row.itemTaste;
                this.mainData.spicy=row.itemSpicy;
                this.mainData.nation=row.nationGuid;
                this.mainData.mainClass=row.menuClassGuid;
                this.mainData.rmClass=row.rmClassGuid;
                this.mainData.cookClass=row.cookClassGuid;
                this.mainData.ItemShapeClass=row.itemShapeGUID;
                this.mainData.seasonClass=row.seasonClassGUID;
                this.mainData.shareQty=row.shareQty;
                this.mainData.mainClass=row.menuClassGuid;
                this.mainData.rmClass=row.rmClassGuid;
                this.ItemShapeOption=[];

                if(this.rmOptions.length===0){
                    this.itemSource();
                }
                if(this.ItemShape.length>0){
                    for(let line of this.ItemShape){
                        if(line.pguid===this.mainData.nation){
                            this.ItemShapeOption.push({guid:line.guid,name:line.name})
                        }
                    }
                }
                var x=0;
                for(let line of this.rmData){
                    if(line.guid===row.rmClassGuid) {
                        x++;
                    }
                }
                if(x>0){
                    this.mainData.rmClassOption=[];
                    this.mainData.mainClassOption=[];
                    for(let line of this.rmData){
                        if(line.pguid===row.menuClassGuid){
                            this.mainData.rmClassOption.push({guid:line.guid,name:line.name});
                        }
                    }
                    for(let line of this.menuData){
                        if(line.pguid===this.mainData.nation){
                            this.mainData.mainClassOption.push({guid:line.guid,name:line.name});
                        }
                    }
                } else if(x===0){
                    this.mainData.rmClassOption=[];
                    this.mainData.mainClassOption=[];
                    for(let line of this.menuData){
                        if(line.guid===this.mainData.mainClass){
                            this.mainData.rmClassOption.push({guid:line.guid,name:line.name});
                        }
                        if(line.pguid===this.mainData.nation){
                            this.mainData.mainClassOption.push({guid:line.guid,name:line.name});
                        }
                    }
                }
                // 生成每个菜的BOM和调味品列表
                recipe({
                    itemGuid:this.inputGuid,
                    company:this.company,
                }).then(data=>{
                    if(data && data.code=='200'){
                        this.BOMTable=[];
                        this.subBOMTable=[];
                        this.CookMethodsTable=[];
                        this.MenuPointTable=[];
                        var BOM=[];
                        var subBOM=[];
                        if(data.content.ItemBOM!==null){
                            for(let line of data.content.ItemBOM){
                                var obj=arraySearch(line.itemCode,this.rmOptions,"itemCode");
                                if(typeof(obj)==="undefined" || obj.length===0){
                                    var Price="";
                                } else{
                                    var Price= obj[0].Price;
                                    var extraitemprice='0.0';
                                    if(obj[0].Price>0 && (obj[0].itemCode.substring(0,1)==='A'||obj[0].itemCode.substring(0,1)==='B')){
                                        var extraitemprice=obj[0].Price+' ';
                                    }
                                }
                                if(line.itemType=="RM"){
                                    BOM.push({
                                        step:line.step,
                                        rmCode:line.itemCode + " / " + line.itemName,
                                        rmName:line.itemName,
                                        itemDesc:line.itemDesc,
                                        Price:Price,
                                        extraItemPrice:extraitemprice,
                                        preextraItemPrice:extraitemprice,
                                        weight:line.bomQty,
                                        effect:line.effectPercent,
                                        purchasePolicy:line.purchasePolicy==='OnDemand'?true:false
                                    });
                                } else if(line.itemType=="Flavor"){
                                    subBOM.push({
                                        step:line.step,
                                        rmCode:line.itemCode + " / " + line.itemName,
                                        flavorName:line.itemName,
                                        itemDesc:line.itemDesc,
                                        Price:Price,
                                        extraItemPrice:extraitemprice,
                                        preextraItemPrice:extraitemprice,
                                        weight:line.bomQty,
                                        purchasePolicy:line.purchasePolicy==='OnDemand'?true:false
                                    });
                                }
                            }
                            this.BOMTable=BOM;
                            this.subBOMTable=subBOM;
                        }
                        if(data.content.ItemProcess!==null){
                            for(let line of data.content.ItemProcess){
                                if(line.itemType=='cookway'){
                                    this.CookMethodsTable.push({
                                        cookMethods: line.Content,
                                    });
                                }
                                else if(line.itemType=="menuPoint"){
                                    this.MenuPointTable.push({
                                        sellingpoint: line.Content,
                                    });
                                }
                            }
                        }
                        if(data.content.nutrition!==null){
                            for(let line of data.content.nutrition){
                                if(line.Name==="protein") {
                                    this.mainData.protein=line.Qty;
                                } else if(line.Name==="carbohydrate"){
                                    this.mainData.carbohydrate=line.Qty;
                                } else if(line.Name==="vitamine"){
                                    this.mainData.vitamine=line.Qty;
                                } else if(line.Name==="mineral"){
                                    this.mainData.mineral=line.Qty;
                                } else if(line.Name==="fat"){
                                    this.mainData.fat=line.Qty;
                                } else if(line.Name==="energy"){
                                    this.mainData.energy=line.Qty;
                                }
                            }
                        }
                        this.loading=false;
                    }
                    this.addBOMItem();
                    this.addsubBOMItem();
                    this.AddToCookMethods();
                    this.AddToMenuPointTable();
                }).catch(()=>{console.log('Fail');});

                this.dialogTableVisible=true;
            },

            AddToCookMethods(){
                this.CookMethodsTable.push({
                    cookMethods:''
                });
            },
            AddToMenuPointTable(){
                this.MenuPointTable.push({
                    sellingpoint:''
                })
            },
            setmenuClass(){
                this.mainData.mainClassOption=[];this.mainData.cookClassOption=[];
                this.mainClassTable=[];
                this.filter.mainClass='';this.filter.rmClass='';this.filter.cookClass='';
                this.filter.mainClassOption=[];this.filter.cookClassOption=[];

                for(let line of this.menuData){
                    if(line.pguid===this.mainData.nation  && line.type==='Categories'){
                        this.mainData.mainClassOption.push({guid:line.guid,name:line.name});
                        //this.mainData.mainClass='';
                    }
                    if(line.pguid===this.filter.nation  && line.type==='Categories'){
                        this.filter.mainClassOption.push({guid:line.guid,name:line.name});
                        //this.filter.mainClass='';
                    }
                }
                var cookfilter=[];var cookMain=[];
                for(let line of this.cookwayData){
                    if(line.pguid===this.filter.nation){
                        cookfilter.push({guid:line.guid,name:line.name});
                    }
                    if(line.pguid===this.mainData.nation){
                        cookMain.push({guid:line.guid,name:line.name});
                    }
                }
                this.filter.cookClassOption=cookfilter;
                this.mainData.cookClassOption=cookMain;
            },
            setrmClass(){
                this.mainData.rmClassOption=[];
                this.rmClassTable=[];
                this.filter.rmClassOption=[];
                this.filter.rmClass='';

                for(let line of this.rmData) {
                    if(line.pguid===this.filter.mainClass){
                        this.filter.rmClassOption.push({guid: line.guid, name: line.name});
                    }
                }
                for(let line of this.rmData){
                    if(line.pguid===this.mainData.mainClass){
                        this.mainData.rmClassOption.push({guid:line.guid,name:line.name});
                    }
                }
                if(this.mainData.rmClassOption.length===0){
                    var obj = getRowFromArray(this.mainData.mainClass,this.mainData.mainClassOption,"guid");
                    if(typeof(obj)!=='undefined'){
                        this.mainData.rmClassOption.push({guid:obj.guid,name:obj.name});
                    }
                }
            },
            deleteCookstep:function(index){
                this.CookMethodsTable.splice(index,1);
            },
            deleteBOMitem:function(index,row){
                this.BOMTable.splice(index,1);
                // 删除食材项
                this.reviseMenu(row);

            },
            deleteFlavor:function(index,row){
                this.subBOMTable.splice(index,1);
                // 删除配料项
                this.reviseMenu(row);
            },
            deleteMenuPoint:function(index){
                this.MenuPointTable.splice(index,1);
            },
            deleteNewItem:function(index,row){
                row.itemStatus='inactive';
                this.NewItem.splice(index,1);

                var paramsNewItem=[];
                var menu=[];
                paramsNewItem.push({
                    oldGUID:row.oldGUID,
                    itemStatus:row.itemStatus,
                    itemType:row.itemType,
                    changeFlag:'update',
                    createUserGUID:this.user.userGuid
                });

                if(paramsNewItem.length>0){
                    menu.item= paramsNewItem;
                    menu.paramType=[{item: true, bom: false, cookway: false, menuPoint: false, nutrition: false}];
                    var obj=menu.item[0].itemType;
                    if(obj==='RM'){
                        this.newMenuItem(menu,true,true)
                    } else{
                        this.newMenuItem(menu,true,false);
                    }
                }
            },
            reviseMenu:function (delRow) {
                if(this.checkInput(false)) {
                    var changeFlag=false;
                    var item = false;
                    var itemA=false;
                    var itemB=false;
                    var bom = false;
                    var cookway=false;
                    var menuPoint=false;
                    var nutrition=false;
                    this.itemType = [];
                    this.oldData=[];
                    recipe({
                        itemGuid:this.inputGuid,
                        company:this.company,
                    }).then(data => {
                        if (data && data.code === '200') {
                            this.oldData = data.content;
                            if (this.oldData!==null) {
                                if (this.mainData.code !== this.oldData.itemCode
                                    || this.mainData.name_cn !== this.oldData.itemName_ZH
                                    || this.mainData.name_en !== this.oldData.itemName_EN
                                    || this.weightpershare - this.oldData.weight !== 0
                                    || this.mainData.version !== this.oldData.version || this.mainData.sort !== this.oldData.sort
                                    || this.mainData.color !== this.oldData.itemColor || this.mainData.taste !== this.oldData.itemTaste
                                    || this.mainData.spicy !== this.oldData.itemSpicy
                                    || this.mainData.seasonClass !== this.oldData.seasonClassGUID
                                    || this.mainData.shareQty - this.oldData.shareQty!==0 ||this.oldData.itemCostperDish-this.CostPerServe!==0
                                ) {
                                    changeFlag = true;
                                    itemA = true;
                                }
                                var check = false;
                                if (this.oldData.itemStatus === 'active') {
                                    check = true;
                                }
                                if (this.mainData.checked !== check) {
                                    changeFlag = true;
                                    itemB = true;
                                }

                                if (itemA === true || itemB === true) {
                                    changeFlag = true;
                                    item = true;
                                } else {
                                    item = false;
                                }

                                var i = 0;
                                var j = 0;
                                var k = 0;

                                for (var a = 0; a < this.BOMTable.length; a++) {
                                    if (this.BOMTable[a].rmCode.length > 0) {
                                        k++
                                    }
                                }
                                for (var a = 0; a < this.subBOMTable.length; a++) {
                                    if (this.subBOMTable[a].rmCode.length > 0) {
                                        k++
                                    }
                                }

                                if(this.oldData.ItemBOM!==null){
                                    j=this.oldData.ItemBOM.length;
                                    for (let line of this.oldData.ItemBOM) {
                                        if (this.subBOMTable !== [] && line.itemType === 'Flavor') {
                                            if (line.itemCode === this.subBOMTable[line.step - 1].rmCode.substring(0,this.subBOMTable[line.step - 1].rmCode.indexOf('/')-1)
                                                && line.itemDesc === this.subBOMTable[line.step - 1].itemDesc
                                                && line.bomQty - this.subBOMTable[line.step - 1].weight === 0
                                                && this.subBOMTable[line.step - 1].preextraItemPrice-this.subBOMTable[line.step - 1].extraItemPrice===0) {
                                                if (this.subBOMTable[line.step - 1].purchasePolicy === false) {
                                                    var checkpurchasePolicy = 'NotDemand';
                                                } else if (this.subBOMTable[line.step - 1].purchasePolicy === true) {
                                                    var checkpurchasePolicy = 'OnDemand';
                                                }
                                                if (line.purchasePolicy === checkpurchasePolicy) {
                                                    i++;
                                                }
                                            }
                                        }
                                        if (this.BOMTable !== [] && line.itemType === 'RM') {
                                            if (line.itemCode === this.BOMTable[line.step - 1].rmCode.substring(0,this.BOMTable[line.step - 1].rmCode.indexOf('/')-1)
                                                && line.itemDesc === this.BOMTable[line.step - 1].itemDesc
                                                && line.bomQty - this.BOMTable[line.step - 1].weight === 0 && this.BOMTable[line.step - 1].preextraItemPrice-this.BOMTable[line.step - 1].extraItemPrice===0
                                                && line.effectPercent - this.BOMTable[line.step - 1].effect === 0) {
                                                if (this.BOMTable[line.step - 1].purchasePolicy === false) {
                                                    var checkpurchasePolicy = 'NotDemand';
                                                } else if (this.BOMTable[line.step - 1].purchasePolicy === true) {
                                                    var checkpurchasePolicy = 'OnDemand';
                                                }
                                                if (line.purchasePolicy === checkpurchasePolicy) {
                                                    i++;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (i !== j||j!==k || delRow!== null) {
                                    changeFlag = true;
                                    bom = true;
                                } else {
                                    bom = false;
                                }

                                var a1 = 0;
                                for (var i = 0; i < this.CookMethodsTable.length; i++) {
                                    if (this.CookMethodsTable[i].cookMethods.length > 0) {
                                        a1++;
                                    }
                                }

                                var b1 = 0;
                                for (var i = 0; i < this.MenuPointTable.length; i++) {
                                    if (this.MenuPointTable[i].sellingpoint.length > 0) {
                                        b1++;
                                    }
                                }
                                var c = 0;
                                var a = 0;
                                var b = 0;
                                if(this.oldData.ItemProcess!==null){
                                    for (let line of this.oldData.ItemProcess) {
                                        if (line.itemType === "cookway" && line.Content === this.CookMethodsTable[line.step - 1].cookMethods) {
                                            a++;
                                        } else if (line.itemType === "menuPoint" && line.Content === this.MenuPointTable[line.step - 1].sellingpoint) {
                                            b++;
                                        }
                                    }
                                }
                                if(this.oldData.nutrition!==null){
                                    for(let line of this.oldData.nutrition){
                                        if(line.Name==='protein'){
                                            var c1=line.Qty-this.mainData.protein;
                                        } else if(line.Name==='carbohydrate'){
                                            var c2=line.Qty-this.mainData.carbohydrate
                                        } else if(line.Name==='vitamine'){
                                            var c3=line.Qty-this.mainData.vitamine;
                                        } else if(line.Name==='mineral'){
                                            var c4=line.Qty-this.mainData.mineral;
                                        } else if(line.Name==='fat'){
                                            var c5=line.Qty-this.mainData.fat;
                                        } else if(line.Name==='energy'){
                                            var c6=line.Qty-this.mainData.energy;
                                        }
                                        c=c1+c2+c3+c4+c5+c6;
                                    }
                                } else {
                                    if (this.mainData.protein.length > 0 || this.mainData.carbohydrate.length > 0 || this.mainData.vitamine.length > 0
                                        || this.mainData.mineral.length > 0 || this.mainData.fat.length>0 || this.mainData.energy.length>0) {
                                        c++;
                                    }
                                }

                                if (a !== a1) {
                                    changeFlag = true;
                                    cookway = true;
                                } else {
                                    cookway = false;
                                }

                                if (b !== b1) {
                                    changeFlag = true;
                                    menuPoint = true;
                                } else {
                                    menuPoint = false;
                                }
                                if (c !==0) {
                                    changeFlag = true;
                                    nutrition = true;
                                } else {
                                    nutrition = false;
                                }

                                if (changeFlag === false) {
                                    this.$message.error("没有数据需要保存");
                                } else if (changeFlag === true) {
                                    this.itemType=[{
                                        item: item,
                                        bom: bom,
                                        cookway: cookway,
                                        menuPoint: menuPoint,
                                        nutrition: nutrition
                                    }];
                                }

                                if(this.itemType.length>0){
                                    this.doSave(changeFlag,delRow);
                                }
                            }
                        } else if(data.code==='500') {

                            var bom = false;
                            var cookway = false;
                            var menuPoint = false;
                            var nutrition = false;
                            var item = false;
                            var a = '';
                            var b = '';
                            var c = '';
                            var d = '';
                            var e = '';
                            var f = '';
                            var g = '';

                            g += this.mainData.name_cn + this.mainData.name_en;
                            if (g.length > 0) {
                                item = true;
                            }
                            for (let line of this.BOMTable) {
                                a += line.rmCode;
                            }
                            for (let line of this.subBOMTable) {
                                b += line.rmCode;
                            }
                            c = a + b;
                            if (c.length > 0) {
                                bom = true;
                            }
                            for (let line of this.CookMethodsTable) {
                                d += line.cookMethods;
                            }
                            if (d.length > 0) {
                                cookway = true;
                            }
                            for (let line of this.MenuPointTable) {
                                e += line.sellingpoint;
                            }
                            if (e.length > 0) {
                                menuPoint = true;
                            }

                            f += this.mainData.protein + this.mainData.carbohydrate + this.mainData.vitamine + this.mainData.mineral + this.mainData.fat + this.mainData.energy;
                            if (f.length > 0) {
                                nutrition = true;
                            }
                            this.itemType=[{
                                item: item,
                                bom: bom,
                                cookway: cookway,
                                menuPoint: menuPoint,
                                nutrition: nutrition
                            }];
                            if(this.itemType.length>0){
                                this.doSave(changeFlag, delRow);
                            }
                        }
                    }).catch(() => {});
                }
            },
            doSave:function(existFlag, delRow){
                    if (!existFlag) {
                        if (this.checkInput(false)) {
                            this.$confirm('确认要新建菜谱吗？', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'question'
                            }).then(() => {
                                this.setMenuList(existFlag,delRow);
                                if (this.params !== []) {
                                    this.params.itemGuid = this.inputGuid;
                                    this.loadingRecipe = true;
                                    this.newMenuItem(this.params, '', '');
                                }
                            }).catch(() => {
                                console.log('Cancel')
                            });
                        }
                    } else if (existFlag) {
                        if (this.checkInput(false)) {
                            this.$confirm('确认要修改保存菜单吗？', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'question'
                            }).then(() => {
                                this.setMenuList(existFlag,delRow);
                                if (this.params !== []) {
                                    this.params.itemGuid = this.inputGuid;
                                    this.loadingRecipe = true;
                                    this.newMenuItem(this.params, '', '');
                                }
                            }).catch(() => {
                                if(delRow!==null) {
                                    // 如果取消删除BOM行项，刷新界面
                                    this.Edit(this.editRow);
                                }
                                console.log('Cancel')
                            });
                        }
                    }
            },
            //设置待保存数据
            setMenuList(data, delRow){
                var menu=[];
                var process=[];
                var menuPoint=[];
                var BOM=[];

                menu.item = [{
                    company: this.company,
                    itemCode: this.mainData.code,
                    itemName_ZH: this.mainData.name_cn,
                    itemName_EN: this.mainData.name_en,
                    itemType:this.mainData.itemType,
                    weight:this.weightpershare,
                    itemCostperDish:this.CostPerServe,
                    version: this.mainData.version,
                    sort: this.mainData.sort,
                    itemStatus: this.mainData.checked === true ? 'active' : 'inactive',
                    categoriesClassGUID: this.mainData.rmClass,
                    cookwayClassGUID: this.mainData.cookClass,
                    seasonClassGUID: this.mainData.seasonClass,
                    itemShapeGUID:this.mainData.ItemShapeClass,
                    itemColor: this.mainData.color,
                    itemTaste: this.mainData.taste,
                    itemSpicy: this.mainData.spicy,
                    toBuy:this.mainData.itemType==='RM'?'1':'0',
                    toSell:this.mainData.itemType==='FG'?'1':'0',
                    purUOMGUID:this.mainData.itemType==='RM'?'g':'',
                    saleUOMGUID:this.mainData.itemType==='FG'?'g':'',
                    createUserGUID:this.user.userGuid,
                    shareQty:this.mainData.shareQty,
                    changeFlag:data===false?'new':'update'
                }];
                menu.nutrition = [{
                    Name: 'protein',
                    Qty: this.mainData.protein===''? 0:this.mainData.protein,
                }, {
                    Name: 'carbohydrate',
                    Qty: this.mainData.carbohydrate===''? 0:this.mainData.carbohydrate,
                }, {
                    Name: 'vitamine',
                    Qty: this.mainData.vitamine===''? 0:this.mainData.vitamine,
                },{
                    Name:'mineral',
                    Qty: this.mainData.mineral===''? 0:this.mainData.mineral
                },{
                    Name:'fat',
                    Qty:this.mainData.fat===''? 0:this.mainData.fat
                },{
                    Name:'energy',
                    Qty:this.mainData.energy===''? 0:this.mainData.energy
                }];
                for (var i = 0; i < this.CookMethodsTable.length; i++) {
                    if(this.CookMethodsTable[i].cookMethods.length>0){
                        process.push({
                            step: i + 1,
                            Content: this.CookMethodsTable[i].cookMethods,
                            itemType: 'cookway',
                            itemStatus: 'active'
                        });
                    }
                };
                for (var i = 0; i < this.MenuPointTable.length; i++) {
                    if(this.MenuPointTable[i].sellingpoint.length>0){
                        process.push({
                            step: i + 1,
                            Content: this.MenuPointTable[i].sellingpoint,
                            itemType: 'menuPoint',
                            itemStatus: 'active'
                        });
                    }
                };
                menu.ItemProcess = process;
                for (let line of this.BOMTable) {
                    if(line.rmCode.length>0){
                        var obj=getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,'itemCode');
                        var price='0.00';
                        if(line.rmCode.substring(0,1)==='A' || line.rmCode.substring(0,1)==='B'){
                            price=line.extraItemPrice;
                        } else{
                            if(typeof(obj)!=="undefined"){
                                price=getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,"itemCode").Price;
                            }
                        }
                        BOM.push({
                            itemCode: line.rmCode.substring(0,line.rmCode.indexOf('/')-1),
                            itemName: line.rmCode.substring(line.rmCode.indexOf('/')+2,100),
                            conversionUnit:typeof(obj)=="undefined"?'':getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,'itemCode').conversionUnit,
                            conversionRate:typeof(obj)=="undefined"?'0':getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,"itemCode").conversionRate,
                            purchasePrice:price,
                            itemCost:line.itemCost,
                            bomQty: line.weight,
                            effectPercent: line.effect,
                            uomGuid:'g',
                            itemDesc:line.itemDesc,
                            itemType:'RM',
                            purchasePolicy:line.purchasePolicy===true?'OnDemand':'NotDemand',
                        });
                    }
                }
                for (let line of this.subBOMTable) {
                    if(line.rmCode.length>0){
                        var obj=getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,'itemCode');
                        var price='0.00';
                        if(line.rmCode.substring(0,1)==='A' || line.rmCode.substring(0,1)==='B'){
                            price=line.extraItemPrice;
                        } else{
                            if(typeof(obj)!=="undefined"){
                                price=getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,"itemCode").Price;
                            }
                        }

                        BOM.push({
                            itemCode: line.rmCode.substring(0,line.rmCode.indexOf('/')-1),
                            itemName: line.rmCode.substring(line.rmCode.indexOf('/')+2,100),
                            conversionUnit:typeof(obj)=="undefined"?'':getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,'itemCode').conversionUnit,
                            conversionRate:typeof(obj)=="undefined"?'0':getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,"itemCode").conversionRate,
                            purchasePrice:typeof(obj)=="undefined"? '0':getRowFromArray(line.rmCode.substring(0,line.rmCode.indexOf('/')-1), this.rmOptions,"itemCode").Price,
                            itemCost:line.itemCost,
                            bomQty: line.weight,
                            effectPercent: '0',
                            uomGuid:'g',
                            itemDesc:line.itemDesc,
                            itemType:'Flavor',
                            purchasePolicy:line.purchasePolicy===true?'OnDemand':'NotDemand',
                        });
                    }
                };

                // 删除食配料（BOM）中的行 （行数>1)
                if(BOM.length>0){
                    menu.ItemBOM = BOM;
                }
                // 删除食配料（BOM）中的最后一行
                else if(BOM.length===0){
                    if(delRow!==null){
                            if (delRow.rmCode.length > 0) {
                                var obj = getRowFromArray(delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1), this.rmOptions, 'itemCode');
                                var price = '0.00';
                                if (delRow.rmCode.substring(0, 1) === 'A' || delRow.rmCode.substring(0, 1) === 'B') {
                                    price = delRow.extraItemPrice;
                                } else {
                                    if (typeof(obj) !== "undefined") {
                                        price = getRowFromArray(delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1), this.rmOptions, "itemCode").Price;
                                    }
                                }
                                BOM.push({
                                    itemCode: delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1),
                                    itemName: delRow.rmCode.substring(delRow.rmCode.indexOf('/') + 2, 100),
                                    conversionUnit: typeof(obj) == "undefined" ? '' : getRowFromArray(delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1), this.rmOptions, 'itemCode').conversionUnit,
                                    conversionRate: typeof(obj) == "undefined" ? '0' : getRowFromArray(delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1), this.rmOptions, "itemCode").conversionRate,
                                    purchasePrice: typeof(obj) == "undefined" ? '0' : getRowFromArray(delRow.rmCode.substring(0, delRow.rmCode.indexOf('/') - 1), this.rmOptions, "itemCode").Price,
                                    itemCost: delRow.itemCost,
                                    bomQty: delRow.weight,
                                    effectPercent: '0',
                                    uomGuid: 'g',
                                    itemDesc: delRow.itemDesc,
                                    itemType: 'Flavor',
                                    purchasePolicy: delRow.purchasePolicy === true ? 'OnDemand' : 'NotDemand',
                                });

                            }

                    }
                }
                menu.ItemBOM = BOM;
                menu.paramType=this.itemType;
                this.params=menu;
            },
            //保存
            newMenuItem(menu,check,RM){
                setMenuItem(menu).then(data=>{
                    if(data && data.code==='200'){
                        this.loadingRecipe=false;
                        this.oldData=[];
                        this.$confirm('数据已经保存，请继续','提示',{
                            confirmButtonText:'确定',
                            //cancelButtonText:'取消',
                            type:'success'
                        }).then(()=>{
                            console.log('Success');
                            this.dataSource=[];
                            if(check===true){
                                this.addNewItem(RM);
                                this.dialogTableVisible2=false;
                            }
                            this.filterData();
                            this.itemSource();
                        }).catch(()=>{
                            console.log('Cancel');
                        });
                    } else {
                        this.$message.error("数据保存失败，请重新输入");
                        this.loadingRecipe=false;
                    }
                }).catch(()=>{
                    console.log('Fail');
                    this.$message.error("数据保存失败，请重新输入");
                    this.loadingRecipe=false;
                });
            },
            checkInput(resultFlag){
                var result = true;
                var message = "";

                if(!this.mainData.code || this.mainData.code===''){
                    message =this.langData.PutIn+" 【"+ this.langData.Code +"】";
                    result=false;
                    this.activeName='first';
                } else if((!this.mainData.name_cn || this.mainData.name_cn==='')&&(!this.mainData.name_en || this.mainData.name_en==='')) {
                    message =this.langData.PutIn+" 【"+ this.langData.Name_ZH +"】" +this.langData.or+" 【"+ this.langData.Name_EN +"】";
                    result=false;
                    this.activeName='first';
                }
                if (!result) {
                    this.$message({
                        type: 'error',
                        message: message,
                        duration: 5000
                    });
                }
                return result;
            },

            getRowFromArray(value, array, code) {
                return getRowFromArray(value, array, code);
            },
            Language(){
                if(JSON.parse(sessionStorage.getItem('user')).langCode==='ZH'){
                    this.langData.selectcompany="请选择公司";
                    this.langData.company="公司";
                    this.langData.keyWord="关键词";
                    this.langData.New="新增";
                    this.langData.Add="添加";
                    this.langData.Categorize="分类";
                    this.langData.Category="类别";
                    this.langData.Search="搜索";
                    this.langData.Valid="有效";
                    this.langData.Invalid="禁用";
                    this.langData.sort="排序";
                    this.langData.Code="代码";
                    this.langData.Brand="品牌"
                    this.langData.Name_ZH="中文名称";
                    this.langData.Name_EN="英文名称";
                    this.langData.specification="规格";
                    this.langData.PurchaseUnit="采购单位";
                    this.langData.PurchasePrice="最新价格";
                    this.langData.conversionUnit="转换单位";
                    this.langData.conversionRate="转换系数";
                    this.langData.Remark="说明";
                    this.langData.Nation="菜式";
                    this.langData.KeyRM="主要原料";
                    this.langData.CookMethods="烹饪方法";
                    this.langData.CookMethods_en="烹饪方法(英语)";
                    this.langData.KeyColor="颜色";
                    this.langData.Taste="口味";
                    this.langData.Spicy="辣度";
                    this.langData.weightperServe="单份重量/克";
                    this.langData.Edit="编辑";
                    this.langData.Revise="修改";
                    this.langData.ChineseMeal="中餐";
                    this.langData.WesternMeal="西餐";
                    this.langData.version="版本";
                    this.langData.MenuClass="菜谱分类";
                    this.langData.MenuClass_en="菜谱分类(英语)";
                    this.langData.NewMenu="新增菜品";
                    this.langData.Chef="厨师";
                    this.langData.City="城市";
                    this.langData.Department="事业部";
                    this.langData.rmClass="主要原料";
                    this.langData.rmClass_en="主要原料(英语)";
                    this.langData.seasonClass="备注属性";
                    this.langData.customerType="消费者类型";
                    this.langData.nutritionDes="营养元素";
                    this.langData.Protein="蛋白质";
                    this.langData.carbohydrate="碳水化合物";
                    this.langData.vitamine="维生素";
                    this.langData.mineral="矿物质元素";
                    this.langData.fat="脂肪含量";
                    this.langData.energy="热量";
                    this.langData.compulsory="必须";
                    this.langData.ClassAndNutrition="分类及营养描述";
                    this.langData.CookingMethodology="烹饪步骤";
                    this.langData.MenuPoint="菜品售卖要点";
                    this.langData.PutIn="请输入";
                    this.langData.picture="图片";
                    this.langData.RM="原料";
                    this.langData.RMOfficialName="菜谱成分";
                    this.langData.RMPercent="原料比例 (%) ";
                    this.langData.effect="加工影响 (%)";
                    this.langData.supplier="供应商";
                    this.langData.RMCode="原料代码";
                    this.langData.RMName="原料名称";
                    this.langData.Recipe="食谱";
                    this.langData.Save="保存";
                    this.langData.BigMeet="大荤";
                    this.langData.SmallMeet="小荤";
                    this.langData.Vegitable="素菜";
                    this.langData.Soup="汤";
                    this.langData.Pork="猪肉";
                    this.langData.Fish="水产";
                    this.langData.poultry="禽类";
                    this.langData.cattlesheep="牛羊畜";
                    this.langData.egg="蛋类";
                    this.langData.leafVegetable="叶菜类";
                    this.langData.StemStemFruit="茎、根、果菜类";
                    this.langData.BeanProduct="豆制品类";
                    this.langData.VegetableSoup="菜汤类";
                    this.langData.ZhenZhuKou="蒸，煮，扣";
                    this.langData.ShaoMen="烧,焖";
                    this.langData.Fry="煎，炸";
                    this.langData.Toast="烤";
                    this.langData.DragUpload="将文件拖到此处，或";
                    this.langData.ClickUpload="点击上传";
                    this.langData.PicFormatSize="只能上传jpg/png文件，且不超过500kb";
                    this.langData.Red="红色";
                    this.langData.Salty="咸鲜";
                    this.langData.weightPerServe="单份重量(克）";
                    this.langData.RMweight="重量";
                    this.langData.MeatPaste="肉酱";
                    this.langData.DicedLotus="藕末";
                    this.langData.NewClass="新增分类";
                    this.langData.NewItem="新建食材";
                    this.langData.NewFlavor="新建调味品";
                    this.langData.flavoring="调味品";
                    this.langData.Practise="操作";
                    this.langData.Delete="删除";
                    this.langData.incompleteInfo="信息不全，无法添加";
                    this.langData.flavorweight="重量（克）";
                    this.langData.overZero="必须大于0";
                    this.langData.underHundred="百分比必须小于100%";
                    this.langData.betweenMandPHundred="百分比必修介于-100%到100%之间";
                    this.langData.noduplicateCodeinRecipe="食谱中不能有相同的原料";
                    this.langData.noduplicateCodeinFlavor="调味品中不能有相同的原料";
                    this.langData.table="列表";
                    this.langData.noblank="不能为空";
                    this.langData.FG="成品";
                    this.langData.Type="类型";
                    this.langData.Creator="创建者";
                    this.langData.CreatTime="创建时间";
                    this.langData.shareQty="份数";
                    this.langData.All="(所有)";
                    this.langData.Latest="最新";
                    this.langData.Price="采购价格";
                    this.langData.validPrice = "有效价格";
                    this.langData.latestPrice = "最新价格";
                    this.langData.purchase="采购";
                    this.langData.or="或者";
                    this.langData.itemCost="成本";
                    this.langData.ItemShape="主料形状";
                    this.langData.Qty="数量";
                    this.langData.purchaseQty="采购数量";
                    this.langData.purchaseUnitcode="采购单位";
                    this.langData.Unitcode="单位";
                    this.langData.Note="备注";
                    this.langData.InputRuleforRM="食谱原料生重的输入基数为： ";
                    this.langData.perShareweight="每份重量";
                    this.langData.perShare="每份例";
                    this.langData.totalShareQty="总份数为";
                    this.langData.InputRuleforFlavor="调味品数量的输入基数为： ";
                    this.langData.share="份";
                    this.langData.CostPerServe="单份成本";
                    this.langData.barCode="二维码";
                    this.langData.costCenter="成本中心";
                    this.langData.cardno="卡号";
                    this.langData.ok="确定";
                    this.langData.barcodeSize="二维码尺寸";
                }
                else{
                    this.langData.selectcompany="Please select company";
                    this.langData.company="Site";
                    this.langData.keyWord="Key Word";
                    this.langData.New="Add";
                    this.langData.Add="Add";
                    this.langData.Categorize="Classify";
                    this.langData.Search="Search";
                    this.langData.Valid="Active";
                    this.langData.Invalid="inactive";
                    this.langData.sort="sort";
                    this.langData.Code="Code";
                    this.langData.Brand="Brand";
                    this.langData.Name_ZH="Chinese Name";
                    this.langData.Name_EN="English Name";
                    this.langData.specification="specification";
                    this.langData.PurchaseUnit="Purchase Unit";
                    this.langData.PurchasePrice="Purchase Price";
                    this.langData.conversionUnit="Conversion Unit";
                    this.langData.conversionRate="Conversion Rate";
                    this.langData.Remark="Remark";
                    this.langData.Nation="Nation";
                    this.langData.KeyRM="Main RM";
                    this.langData.CookMethods="Cooking Methods";
                    this.langData.CookMethods_en="Cooking Methods(English)";
                    this.langData.KeyColor="Color";
                    this.langData.Taste="Taste";
                    this.langData.Spicy="Spicy Scale";
                    this.langData.weightperServe="weight Per Dish/g";
                    this.langData.Edit="Edit";
                    this.langData.Revise="Revise";
                    this.langData.ChineseMeal="Chinese";
                    this.langData.WesternMeal="Western";
                    this.langData.version="version";
                    this.langData.MenuClass="Menu Class";
                    this.langData.MenuClass_en="Menu Class(English)"
                    this.langData.NewMenu="Add New Menu";
                    this.langData.Chef="Chef";
                    this.langData.City="City";
                    this.langData.Department="Department";
                    this.langData.rmClass="Raw Material Class";
                    this.langData.rmClass_en="Main RM(English)";
                    this.langData.seasonClass="Remark";
                    this.langData.customerType="Customer Type";
                    this.langData.nutritionDes="Nutrition";
                    this.langData.Protein="Protein";
                    this.langData.carbohydrate="Carbohydrate";
                    this.langData.vitamine="Vitamine";
                    this.langData.mineral="Mineral Materials";
                    this.langData.fat="Fat";
                    this.langData.energy="Energy";
                    this.langData.compulsory="Compulsory";
                    this.langData.ClassAndNutrition="Classification and Nutrition";
                    this.langData.CookingMethodology="Cooking Methodology";
                    this.langData.MenuPoint="Making & Selling Points";
                    this.langData.PutIn="Please fulfill ";
                    this.langData.picture="Picture";
                    this.langData.RM="Raw Material ";
                    this.langData.RMOfficialName="Official RM Name";
                    this.langData.RMPercent="RM (%)";
                    this.langData.effect="Process Effect (%)";
                    this.langData.supplier="Supplier";
                    this.langData.RMCode="RM Code";
                    this.langData.RMName="RM Name";
                    this.langData.Recipe="Recipe";
                    this.langData.Save="Save";
                    this.langData.BigMeet="Meat";
                    this.langData.SmallMeet="Half Meet,half Vegetable";
                    this.langData.Vegitable="Vegetable";
                    this.langData.Soup="Soup";
                    this.langData.Pork="Pork";
                    this.langData.Fish="Aquatic Product";
                    this.langData.poultry="Poultry";
                    this.langData.cattlesheep="Cattle & Sheep";
                    this.langData.egg="Egg";
                    this.langData.leafVegetable="Leaf Vegetable";
                    this.langData.StemStemFruit="Stem,root & Fruit";
                    this.langData.BeanProduct="Bean Products";
                    this.langData.VegetableSoup="Vegetable Soup";
                    this.langData.ZhenZhuKou="Steam & Boiled";
                    this.langData.ShaoMen="Braise";
                    this.langData.Fry="Fry";
                    this.langData.Toast="Toast";
                    this.langData.DragUpload="Drog File here or ";
                    this.langData.ClickUpload="click to Upload";
                    this.langData.PicFormatSize="jpg or png only with maximum size of 500kb";
                    this.langData.Red="Red";
                    this.langData.Salty="Salty";
                    this.langData.weightPerServe="weight (g)";
                    this.langData.RMweight="weight of RM";
                    this.langData.MeatPaste="Meat Paste";
                    this.langData.DicedLotus="Louts Root";
                    this.langData.NewClass="Edit Class";
                    this.langData.NewItem="New RM";
                    this.langData.NewFlavor="New Flavor";
                    this.langData.flavoring="Flavoring ";
                    this.langData.Practise="Action";
                    this.langData.Delete="Delete";
                    this.langData.incompleteInfo="No item added due to incomplete information";
                    this.langData.flavorweight="weight of Flavor (g) ";
                    this.langData.overZero=" must be more than zero";
                    this.langData.underHundred=" percentage must be less than 100%";
                    this.langData.betweenMandPHundred="Percentage must be over than -100% and less than 100%";
                    this.langData.noduplicateCodeinRecipe="No duplicated ingredients in one recipe";
                    this.langData.noduplicateCodeinFlavor="No duplicated ingredients in one recipe's flavor";
                    this.langData.table="Table";
                    this.langData.noblank=" cannot be zero";
                    this.langData.FG="Finished Goods";
                    this.langData.Type="Type";
                    this.langData.Creator="Creator Name";
                    this.langData.CreatTime="Creat Time";
                    this.langData.shareQty="Share Qty";
                    this.langData.All="(All)";
                    this.langData.Latest ="Latest";
                    this.langData.Price="Purchase Price";
                    this.langData.validPrice = "Valid Price";
                    this.langData.latestPrice = "Latest Price"
                    this.langData.purchase="Purchase";
                    this.langData.or="or";
                    this.langData.itemCost="Cost";
                    this.langData.ItemShape="Item Shape";
                    this.langData.Qty="Quantity";
                    this.langData.purchaseQty="Purchase Quantity";
                    this.langData.purchaseUnitcode="Purchase Unit";
                    this.langData.Unitcode="Unit";
                    this.langData.Note="Note";
                    this.langData.InputRuleforRM="Please input weight for each raw materical in this recipe according to the baseline of ";
                    this.langData.perShare="per dish";
                    this.langData.totalShareQty=" with total dish quantities of ";
                    this.langData.InputRuleforFlavor="Please input weight for each flavor in this recipe according to the baseline of ";
                    this.langData.dish=" dishes";
                    this.langData.CostPerServe="Cost Per Share";
                    this.langData.barCode="BarCode";
                    this.langData.costCenter="Cost Center";
                    this.langData.cardno="Card Number";
                    this.langData.ok="OK";
                    this.langData.barcodeSize="BarCode Size";
                }
            },
            // 小数类型保留小数位数
            float(price, fix) {
                return float(price, fix);
            },
            BGColor(row) {
               return "background-color:"+row;
            },
        }
    }
</script>

<style lang="scss">
     @import '../../assets/css/common.css';

    .container{}
    .el-table .cell, .el-table th>div {
        padding-left: 3px;
        padding-right: 3px;
    }
</style>