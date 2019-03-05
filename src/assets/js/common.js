/**
 * Created by chris.cao on 7/24/2017.
 */
import {GetLangMast} from '../../api/api';

export const lan = (number) => {
    var lan = JSON.parse(localStorage.getItem("lan"));
    if(lan == null) {
        // 取得语言字典
        GetLangMast('').then(data => {
            if(data && data.code == "200") {
                localStorage.setItem("lan", JSON.stringify(data.content));
                return lanPlus(number, data.content);
            } else {
                return "unknown";
            }
        }).catch(()=>{
            return "unknown";
        });
    } else {
        return lanPlus(number, lan);
    }
}
function lanPlus(number, lan) {
    var language = isNullOrWhiteSpace(localStorage.getItem("language")) ? "zh": localStorage.getItem("language").toLowerCase();
    var row = getRowFromArray(number, lan, "number");
    var text = typeof(row) == "undefined" ? "unknown" : getRowFromArray(number, lan, "number")[language];
    return text;
}

// 通过code从array中找到对应的Object
export const getRowFromArray = (code, data, codeName) => {
    var array = arraySearch(code, data, codeName);
    return array[0];
}

// 从Json数组中过滤出符合条件的集合
export const arraySearch = (queryString, arrayJson, codeName, mode) => {
    if (isNullOrWhiteSpace(codeName)) {
        codeName = "code";
    }
    var aryJson = arrayJson;
    var result = queryString ? aryJson.filter(createFilter(queryString, codeName, mode)) : aryJson;
    return result;
}

// 参数1：查询字段，参数2：Code名称，参数3：过滤模式（为空时为字符串相等，“contain”时为包含）
export const createFilter = (queryString, codeName, mode) => {
    return (row) => {
        if(typeof(row[codeName]) == "undefined")
            return null;
        if (mode == "contain") {
            return (row[codeName].toUpperCase().indexOf(queryString.toUpperCase()) > -1)
        } else {
            return (row[codeName].toUpperCase() === queryString.toUpperCase());
        }
    }
}

export const isNullOrWhiteSpace = (strTemp) => {
    if(typeof(strTemp) == "undefined" || strTemp == null || strTemp == "") {
        return true;
    }
    return false;
}

export const chGMT = (gmtDate, yyyyMMdd) => {
    var mydate = new Date(gmtDate);
    mydate.setHours(mydate.getHours() + 8);
    return mydate.format(yyyyMMdd);
}

export const toGMT = (date) => {
    let myDate = new Date(date);
    let gmt = myDate.format('yyyy/MM/dd');
    gmt = new Date(Date.parse(gmt.replace(/-/g,"/")));
    return gmt;
}

// 日期转换处理
Date.prototype.format = function(format)
{
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format))
        format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

/**
 *js中更改日期
 * y年， m月， d日， h小时， n分钟，s秒
 */
Date.prototype.add = function (part, value) {
    value *= 1;
    if (isNaN(value)) {
        value = 0;
    }
    switch (part) {
        case "y":
            this.setFullYear(this.getFullYear() + value);
            break;
        case "m":
            this.setMonth(this.getMonth() + value);
            break;
        case "d":
            this.setDate(this.getDate() + value);
            break;
        case "h":
            this.setHours(this.getHours() + value);
            break;
        case "n":
            this.setMinutes(this.getMinutes() + value);
            break;
        case "s":
            this.setSeconds(this.getSeconds() + value);
            break;
        default:

    }
}
/* 取得所属月第一天的日期 */
Date.prototype.firstDateInMonth = function () {
    return this.setDate(1);
}

/* 取得所属月最后一天的日期 */
Date.prototype.lastDateInMonth = function () {
    var month = this.getMonth();
    var nextMonth = ++month;
    var nextMonthFirstDay = new Date(this.getFullYear(), nextMonth, 1);
    var oneDay = 1000*60*60*24;
    return new Date(nextMonthFirstDay - oneDay);
}
/**/
/***秒转成时分秒***/
export const formatSeconds = function(value) {
    var theTime = parseInt(value);// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
// alert(theTime);
    if(theTime > 60) {
        theTime1 = parseInt(theTime/60);
        theTime = parseInt(theTime%60);
// alert(theTime1+"-"+theTime);
        if(theTime1 > 60) {
            theTime2 = parseInt(theTime1/60);
            theTime1 = parseInt(theTime1%60);
        }
    }
    var result = ""+parseInt(theTime)+"秒";
    if(theTime1 > 0) {
        result = ""+parseInt(theTime1)+"分"+result;
    }
    if(theTime2 > 0) {
        result = ""+parseInt(theTime2)+"小时"+result;
    }
    return result;
}

// 判断两个Object是否相同
export const dateAdd = function(date, part, value) {
    return date.add(part, value);
}

Array.prototype.isEmpty = function() {
    if(this == null || typeof(this) == "undefined" || this.length == 0) {
        return true;
    }
    return false;
}

// 比较两个Array内容是否相同
// Array.prototype.equals = function (array) {
//     // if the other array is a falsy value, return
//     if (!array)
//         return false;
//     // compare lengths - can save a lot of time
//     if (this.length != array.length)
//         return false;
//     for (var i = 0, l = this.length; i < l; i++) {
//         // Check if we have nested arrays
//         if (this[i] instanceof Array && array[i] instanceof Array) {
//             // recurse into the nested arrays
//             if (!this[i].equals(array[i]))
//                 return false;
//         }
//         else if (this[i] != array[i]) {
//             // Warning - two different object instances will never be equal: {x:20} != {x:20}
//             return false;
//         }
//     }
//     return true;
// }

/***判断字符串是否相等（NULL和undefined当成空字符串处理）***/
String.prototype.equals = function(str){
    return (isNullOrWhiteSpace(this) ? "": this.trim()) == (isNullOrWhiteSpace(str) ? "" : str.trim()) ;
}

export const isObjectEqual = function(object1, object2) {
    //For the first loop, we only check for types
    for (var propName in object1) {
        //Check for inherited methods and properties - like .equals itself
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //Return false if the return value is different
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        //Check instance type
        else if (typeof object1[propName] != typeof object2[propName]) {
            //Different types => not equal
            return false;
        }
    }
    //Now a deeper check using other objects property names
    for(propName in object2) {
        //We must check instances anyway, there may be a property that only exists in object2
        //I wonder, if remembering the checked values from the first loop would be faster or not
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        else if (typeof object1[propName] != typeof object2[propName]) {
            return false;
        }
        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
        if(!object1.hasOwnProperty(propName))
            continue;

        //Now the detail check and recursion

        //This returns the script back to the array comparing
        /**REQUIRES Array.equals**/
        if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
            // recurse into the nested arrays
            if (!object1[propName].equals(object2[propName]))
                return false;
        }
        else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
            // recurse into another objects
            //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
            if (!object1[propName].equals(object2[propName]))
                return false;
        }
        //Normal value comparison for strings and numbers
        else if(object1[propName] != object2[propName]) {
            return false;
        }
    }
    //If everything passed, let's say YES
    return true;
}

export const getMonthDiff = function(date1 , date2){
    //用-分成数组
    date1 = date1.split("-");
    date2 = date2.split("-");
    //获取年,月数
    var year1 = parseInt(date1[0]) ,
        month1 = parseInt(date1[1]) ,
        year2 = parseInt(date2[0]) ,
        month2 = parseInt(date2[1]) ,
        //通过年,月差计算月份差
        months = (year2 - year1) * 12 + (month2-month1) + 1;
    return months;
}

export const getDateDiff = function(startDate, endDate)
{
    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();
    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
    var dates = Math.abs((startTime - endTime))/(1000*60*60*24);
    return Math.floor(dates);
}

// 判断两个Object是否相同
export const isObjectValueEqual = function(a, b) {
    if(typeof a == 'number' && typeof b == 'number'){
        return a == b
    }

    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if(typeof(a[propName]) == "object" || typeof(a[propName]) == "__ob__") {
            continue;
        }
        if(Object.prototype.toString(a[propName]) == '[Object Object]'||Object.prototype.toString(b[propName]) == '[Object Object]'){
            isObjectValueEqual(a[propName],b[propName])
        }
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}

// 对象的复制
export const deepCopy = function(source) {
    var result={};
    for (var key in source) {
        result[key] = source[key] == null? null: (typeof source[key]==='object'? deepCopy(source[key]): source[key]);
    }
    return result;
}

//深度克隆
export const deepClone = function(obj) {
    var proto=Object.getPrototypeOf(obj);
    return Object.assign({},Object.create(proto),obj);
}

/***Object数组按Key值去重复***/
//将对象元素转换成字符串以作比较
function obj2key(obj, keys){
    var n = keys.length,
        key = [];
    while(n--){
        key.push(obj[keys[n]]);
    }
    return key.join('|');
}

//去重复操作
Array.prototype.distinct = function(keys) {
    var arr = [];
    var hash = {};
    for (var i = 0, j = this.length; i < j; i++) {
        var k = obj2key(this[i], keys);
        if (!(k in hash)) {
            hash[k] = true;
            arr.push(this[i]);
        }
    }
    return arr;
}

// 金额格式化
export const formatAmount = function (n) {
    n = Number.parseFloat(n).toFixed(2);
    var ary = (n + "").split(".");
    var backupString = "";
    if(ary.length == 2)
        backupString = ary[1];

    var b = parseInt(n).toString();
    var len = b.length;
    if(len<=3)
        return n;
    var r = len % 3;
    var result = r>0?b.slice(0,r)+","+b.slice(r,len).match(/\d{3}/g).join(","):b.slice(r,len).match(/\d{3}/g).join(",");

    if(!isNullOrWhiteSpace(backupString))
        result = result + "." + backupString;
    return result;
}

export const formatMoney = function(number, decimals, dec_point, thousands_sep,roundtag) {
    /*
     * 参数说明：
     * number：要格式化的数字
     * decimals：保留几位小数
     * dec_point：小数点符号
     * thousands_sep：千分位符号
     * roundtag:舍入参数，默认 "ceil" 向上取,"floor"向下取,"round" 四舍五入
     * */
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    roundtag = roundtag || "ceil"; //"ceil","floor","round"
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {

            var k = Math.pow(10, prec);
            console.log();

            return '' + parseFloat(Math[roundtag](parseFloat((n * k).toFixed(prec*2))).toFixed(prec*2)) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

/***将Object数组中的某个属性拼接成以xx符号分隔的字符串***/
export const arrayToString = function(aryObj, fieldName, separator) {
    var strTemp = "";

    if(aryObj == null)
        return strTemp;

    if(isNullOrWhiteSpace(separator))
        separator = ",";

    for(var obj of aryObj) {
        strTemp = strTemp + obj[fieldName] + separator;
    }
    if(!isNullOrWhiteSpace(strTemp))
        strTemp = strTemp.substr(0,strTemp.length - 1);

    return strTemp;
}

/***计算Item BOM中的RequiredQty***/
export const getRequiredQty = function(itemQty, actQty, conversionUnit, conversionRate) {
    var tempVar = 1;
    if(conversionRate == 0)
        return 0;
    if(conversionUnit.toLowerCase() == "kg"
        || conversionUnit.toLowerCase() == "l")
        tempVar = 1000;
    return parseFloat((actQty * itemQty / tempVar / conversionRate).toFixed(6));
}

/***小数格式化***/
export const float = function(price, fix) {
    if(isNullOrWhiteSpace(price) || isNaN(price))
        return "0";
    if(isNullOrWhiteSpace(fix))
        fix = 2;
    return parseFloat((price * 1).toFixed(fix)) + "";
}

/***Array排序方法***/
/***当函数返回值为1的时候就交换两个数组项的顺序，否则就不交换***/
export const sortData = function(d,col) {
    if(d.length == 0 ) return d;

    return d.sort(function(row1,row2) {
        var x = 1;
        if(col.order == "descending")
            x = -1;
        if(row1[col.prop]  > row2[col.prop])
            return x;
        if(row1[col.prop] == row2[col.prop])
            return 1;
        return -1*x;
    })
}

// 判断数组中是否存在某值
export const IsInArray = function(arr,val){
    var testStr=','+arr.join(",")+",";
    return testStr.indexOf(","+val+",")!=-1;
}