import axios from 'axios';
import config from './config';
import configPhoto from './configPhoto';

let base = '';
const token = "adenservices";

// 取得语言列表
export const getLang = () => {
    return axios.get('/socommon/language/' + token, config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

// 取得语言字典
export const GetLangMast = type => {
    return axios.get('/socommon/GetlangMast/' + token + '?type=' + type, config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

// 保存语言字典
export const SaveLangMast = params =>{
    return axios.post('/socommon/SavelangMast/'+token, params, config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

// 取得配置信息
export const GetConfig = type => {
    return axios.get('/socommon/GetConfigValue/' + token + '?type=' + type, config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

// 取得登录人相关信息
export const getUser = params => {
    return axios.post('/soaccount/loginuser/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
};

export const SOcc = params =>{
    return axios.post('salesorder/SOcc/'+token, params, config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

// 取得符合条件的Company列表
export const GetCompany = params => {
    return axios.post('/somast/GetCompany/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 根据权限取得Company列表
export const GetCompanyInAuth = params => {
    return axios.post('/somast/GetCompanyInAuth/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得客户主数据
export const getCustom = params => {
    return axios.post('/somast/custom/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

// 取得币别主数据
export const getCurr = params => {
    return axios.post('/somast/curr/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得付款方式主数据
export const getPayment = params => {
    return axios.post('/somast/payment/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得成本中心主数据
export const getCostCenter = params => {
    return axios.post('/somast/costcenter/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得税主数据
export const getTax = params => {
    return axios.post('/somast/tax/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得产品主数据
export const getProduct = () => {
    return axios.get('/somast/product/' + token, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得价格单位主数据
export const getPriceUnit = () => {
    return axios.get('/somast/priceunit/' + token, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 取得SO状态主数据
export const getStatus = (type) => {
    return axios.get('/somast/status/' + token + '/?type=' + type, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 新建合同订单
export const createSO = params => {
    return axios.post('/salesorder/createso/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 修改合同订单
export const editSO = params => {
    return axios.post('/salesorder/editso/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
};

export const SetSalesInvoice = params =>{
    return axios.post('/salesinvoice/setsalesinvoice/' + token,params,config).then(res => res.data).catch(error=>{
        console.log(error);
    })
};

export const SaveSalesInvoice = params =>{
    return axios.post('/salesinvoice/SaveSalesInvoice/' + token,params,config).then(res => res.data).catch(error=>{
        console.log(error);
    })
};

export const SplitInvoice = params =>{
    return axios.post('/salesinvoice/SplitInvoice/' + token,params,config).then(res => res.data).catch(error=>{
        console.log(error);
    })
};

export const CloseSalesInvoice = params =>{
    return axios.post('/salesinvoice/CloseSalesInvoice/' + token,params,config).then(res => res.data).catch(error=>{
        console.log(error);
    })
};

export const UpdatePeriodStatus = params =>{
    return axios.post('/salesinvoice/UpdatePeriodStatus/' + token,params,config).then(res => res.data).catch(error=>{
        console.log(error);
    })
}

export const SetSalesPeriod = params =>{
    return axios.post('/salesinvoice/SetSalesPeriod/'+token,params,config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

export const ReadyToImportErp = params =>{
    return axios.post('/salesinvoice/ReadyToImportErp/'+token,params,config).then(res => res.data).catch(error => {
        console.log(error);
    });
};

// 检查合同号是否存在
export const checkContract = contract => {
    return axios.get('/salesorder/checkcontract/' + token + '/?contract=' + contract, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 根据Guid取得合同SO
export const getSO = guid => {
    return axios.get('/salesorder/getso/' + token + '/?guid=' + guid, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// TOOD: 根据条件查询SO列表
export const querySO = () => {
    return axios.get('/salesorder/queryso/' + token,config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

export const getCompany2 = (userguid,action) => {
    return axios.get('/somast/company2/' + token+'/?userguid='+userguid+'&action='+action, config).then(res => res.data).catch(error => {
        console.log(error);
    })
};

export const SearchSO = (db, sDate, eDate) => {
    return axios.get('/salesorder/searchso/'+token+ '/?db=' + db + '&sDate=' + sDate + '&eDate=' + eDate,config)
        .then(res=>res.data).catch(error=>{
            console.log(error);
        });
};

export const SODetail = company =>{
    return axios.get('/salesorder/SODetail/'+token+ '/?company=' +company,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const MenuAction= params =>{
    return axios.get('/salesorder/MenuAction/'+token+'/?userGuid='+params.userGuid+'&company='+params.company+'&action='+params.action ,config).then(res => res.data).catch(error=>{
        console.log(error);
    });
};

export const SearchPeriod= params => {
    return axios.get('/salesinvoice/SearchPeriod/'+ token+'/?company=' + params.company + '&sDate=' + params.sDate +
        '&eDate=' + params.eDate, config).then(res => res.data).catch(error=>{
        console.log(error);
    })
};

export const CostCenterMatch = params=>{
    return axios.post('salesorder/CostCenterMatch/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const SearchCostCenterMatch = params=>{
    return axios.post('salesorder/SearchCostCenterMatch/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const dtCompany = params=>{
    return axios.post('salesorder/dtCompany/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
};

export const HD = params=>{
    return axios.post('salesorder/HD/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const updateCompany = params=>{
    return axios.post('salesorder/updateCompany/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
};

export const checkSupplier = params=>{
    return axios.post('salesorder/CheckSupplierCode/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
};

// 取得SDK交易错误日志
export const GetTransLog = params => {
    return axios.post('/salesinvoice/getTransLog/' + token, params, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 根据ItemGuid取得SalesInvoice的最大EndDate
export const GetSalesInvoiceMaxDate = itemGuid => {
    return axios.get('/salesinvoice/GetSalesInvoiceMaxDate/' + token + '/?itemGuid=' + itemGuid, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 根据传入的HeadGuid取得生成SalesPeriod的最大EndDate
export const GetSalesPeriodMaxDate = headGuid => {
    return axios.get('/salesinvoice/GetSalesPeriodMaxDate/' + token + '/?headGuid=' + headGuid, config).then(res => res.data).catch(error => {
        console.log(error);
    })
}

// 根据传入的EmployeeID取得头像
export const GetPhoto = employeeID => {
    return axios.get('/hr/userphoto/?employeeid=' + employeeID, configPhoto).then(res=>res.data).catch(error=> {
        console.log(error);
    })
};

export const itemSequence = params =>{
    return axios.post('/menudata/itemSequence/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetMenu = params =>{
    return axios.post('/menudata/GetMenu/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetCCWhs = params => {
    return axios.post('/MenuOrder/GetCCWhs/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetMealTypeList = params => {
    return axios.post('/MenuOrder/GetMealTypeList/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetMenuOrder = params => {
    return axios.post('/MenuOrder/GetMenuOrder/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetMenuOrder_SUZHYC = params => {
    return axios.post('/MenuOrder/GetMenuOrder_SUZHYC/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetMenuOrderPurchase = params => {
    return axios.post('/MenuOrder/GetMenuOrderPurchase/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const SaveMenuOrder = params => {
    return axios.post('/MenuOrder/SaveMenuOrder/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const SaveMenuOrderPurchase = params => {
    return axios.post('/MenuOrder/SaveMenuOrderPurchase/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const showPDF = (rpt,params) => {
    var tmp = "ReportName="+rpt;
    tmp += "&data=" + JSON.stringify(params);
    window.open(config.baseURL + '/Reports/ShowPDF/'+ token + '/?' + tmp);
};

export const GetCClassSupplierData = params => {
    return axios.post('/MastData/GetCClassSupplierData/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const SaveCClassSupplier = params => {
    return axios.post('/MastData/SaveCClassSupplier/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const SavePurchaseOrder = params => {
    return axios.post('/PurchaseOrder/SavePurchaseOrder/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetPurchaseOrder = params => {
    return axios.post('/PurchaseOrder/GetPurchaseOrder/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const GetItemClassMaintainData = params => {
    return axios.post('/MastData/GetItemClassMaintainData/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
}

export const SaveItemClassMaintainData = params => {
    return axios.post('/MastData/SaveItemClassMaintainData/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetActCostCenter = params => {
    return axios.post('/SalesOrder/GetActCostCenter/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const ChangeRecipientsofWeeklyMenu = params => {
    return axios.post('/MenuOrder/ChangeRecipientsofWeeklyMenu/'+token,params,config).then(res=>res.data).catch(error=>{
       console.log(error);
    });
};

export const GetToNextWorkingDay = params => {
    return axios.post('/MastData/GetToNextWorkingDay/' + token, params, config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
}

export const requestLogin = params => {
    return axios.post(`${base}/login`, params).then(res => res.data);
};

export const getUserList = params => {
    return axios.get(`${base}/user/list`, {params: params});
};

export const getUserListPage = params => {
    return axios.get(`${base}/user/listpage`, {params: params});
};

export const removeUser = params => {
    return axios.get(`${base}/user/remove`, {params: params});
};

export const batchRemoveUser = params => {
    return axios.get(`${base}/user/batchremove`, {params: params});
};

export const editUser = params => {
    return axios.get(`${base}/user/edit`, {params: params});
};

export const addUser = params => {
    return axios.get(`${base}/user/add`, {params: params});
};

export const menuClass = params =>{
    return axios.post('/menudata/menuClass/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
};
export const setMenuItem = params =>{
    return axios.post('/menudata/setMenuItem/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const searchItem = params =>{
    return axios.post('/menudata/searchItem/' + token, params, config).then(res => res.data).catch(error=>{
        console.log(error);
    });
};


export const recipe = params =>{
    return axios.post('/menudata/recipe/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const itemSource = params =>{
    return axios.post('/menudata/itemSource/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetPOItems = params =>{
  return axios.post('/menuorder/GetPOItems/'+token,params,config).then(res=>res.data).catch(error=>{
      console.log(error);
  })
};

export const ChangeSupplier= params=>{
    return axios.post('/menuorder/ChangeSupplier/'+token,params,config).then(res=>res.data).catch(error=> {
        console.log(error);
    })
};

export const AssignRights= params=>{
    return axios.post('/assignrights/AssignUserRights/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    })
};

export const CCandMealType= params =>{
    return axios.post('/RightsData/GetItems/'+ token ,params, config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetUserCompany= params =>{
    return axios.post('/RightsData/GetUserCompany/'+ token ,params, config).then(res=>res.data).catch(error=> {
        console.log(error);
    });
};

export const NewCCWindowMeal= params =>{
  return axios.post('/RightsData/NewCCWindowMeal/'+ token ,params, config).then(res=>res.data).catch(error=>{
     console.log(error);
  });
};


export const ShowExcel= (params) => {
    //var tmp = "ReportName="+rpt;
    var tmp = "&data=" + JSON.stringify(params);
    window.open(config.baseURL +'/Reports/ExcelReport/'+token+ '/?' + tmp);
};


export const WechatBarCode=(params)=>{
    var tmp = "&data=" + JSON.stringify(params);
    //window.open(config.baseURL +'/WeChatPay/WechatBarCode/'+token+ '/?' + tmp);
    return axios.get(config.baseURL +'/WeChatPay/WechatBarCode/'+token+ '/?' + tmp).then(res=>res.data).catch(error=>{
        console.log(error)});
};

export const SendExcel= (params) => {
    //var tmp = "ReportName="+rpt;
    var tmp = "&data=" + JSON.stringify(params);
    return axios.get('/Reports/SendExcel/'+token+ '/?' + tmp,config).then(res => res.data).catch(error => {
        console.log(error);
    });;
};


export const SaveMenuOrder_SUZHYC = params => {
    return axios.post('/MenuOrder/SaveMenuOrder_SUZHYC/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetCCWhs_SUZHYC = params => {
    return axios.post('/MenuOrder/GetCCWhs_SUZHYC/'+token,params,config).then(res=>res.data).catch(error=>{
        console.log(error);
    });
};

export const GetCompanySite = params=>{
   return axios.post('/SiteDIY/GetCompanySite/'+token,params,config).then(res=>res.data).catch(error=>{
      console.log(error);
   });
};

export const GetPriceList = params=>{
    return axios.post('/SiteDIY/GetPriceList/'+token,params,config).then(res=>res.data).catch(error=> {
       console.log(error);
    });
};

export const UpdateFGItemPrice = params=>{
    return axios.post('/SiteDIY/UpdateFGItemPrice/'+token,params,config).then(res=>res.data).catch(error=> {
        console.log(error);
    });
};

export const SiteSurvey= params=>{
    return axios.post('/SiteDIY/SiteSurvey/'+token,params,config).then(res=>res.data).catch(error=>{
       console.log(error);
    });
};

export const GetSitePosts= params =>{
    return axios.post('/SiteDIY/GetSitePosts/'+token,params,config).then(res=>res.data).catch(error=>{
       console.log(error);
    });
};

export const OfficalAccountQRCode = url =>{
    return axios.get(url, config).then(res => res.data).catch(error=>{
        console.log(error);
    });
}



