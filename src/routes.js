import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Page6 from './views/Company/subjectMaintenance.vue'
import WechatbarCode from './views/BarCode.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/WechatbarCode',
        component: WechatbarCode,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: 'M000001', // 销售合同
        iconCls: 'el-icon-edit-outline',//图标样式class
        action: 'so',
        hidden: true,
        children: [
            {
                path: '/main',
                component: Main,
                name: 'M000008', // 主页
                hidden: true
            },
            {
                path: '/create/',
                component: resolve=> require(['./views/SalesOrder/Create.vue'], resolve),
                name: 'M000005', // 合同新建
                iconCls: 'el-icon-tickets',
                action: 'so-create',
                hidden: true
            },
            {
                path: '/query',
                component: resolve=> require(['./views/SalesOrder/QueryEdit.vue'], resolve),
                name: 'M000006', // 合同查询/修改
                iconCls: 'el-icon-search',
                action: 'so-search',
                hidden: true,
                children: [{
                    path: '',
                    component: resolve=> require(['./views/SalesOrder/Search.vue'], resolve),
                    name: 'M000009', // 合同查询
                    iconCls: 'el-icon-edit',
                }, {
                    path: 'edit',
                    component: resolve=> require(['./views/SalesOrder/Create.vue'], resolve),
                    name: 'M000010', // 合同修改
                    iconCls: 'el-icon-edit',
                }]
            }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000002', // 发票管理
        iconCls: 'el-icon-document',//图标样式class
        action: 'inv',
        hidden: true,
        children: [
            {
                path: '/main',
                component: Main,
                name: 'M000008', // 主页
                hidden: true
            },
            {
                path: '/invoice',
                component: resolve => require(['./views/Invoice/Invoice.vue'], resolve),
                name: 'M000007', // 销售开票
                iconCls: 'el-icon-document',
                action: 'inv-invoice',
                hidden: true,
            }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000011', // 菜谱管理
        iconCls: 'el-icon-menu',//图标样式class
        action: 'menu',
        hidden: true,
        children: [
            {
                path: '/main',
                component: Main,
                name: 'M000008', // 主页
                hidden: true
            },
            {
                path: '/menu',
                component: resolve => require(['./views/Menu/MenuMaintain.vue'], resolve),
                name: 'M000012', // 菜单数据
                iconCls: 'fa fa-list-alt',
                action: 'menu-data',
                hidden: true,
            },
            {
                path: '/weeklyMenu',
                component: resolve => require(['./views/Menu/WeeklyMenuMaintain_new.vue'], resolve),
                name: 'M000015', // 周菜单维护
                iconCls: 'fa fa-align-justify',
                action: 'menu-weekly',
                hidden: true,
            },
            {
                path: '/daylyMenu',
                component: resolve => require(['./views/Menu/DaylyMenuMaintain_new.vue'], resolve),
                name: 'M000016', // 日菜单维护
                iconCls: 'fa fa-indent',
                action: 'menu-dayly',
                hidden: true,
            },
            {
                path: '/cClassSupplier',
                component: resolve => require(['./views/Menu/CClassSupplierMaintain.vue'], resolve),
                name: 'M000018', // 营运点-供应商
                iconCls: 'fa fa-user-circle-o',
                action: 'menu-ccsuplier',
                hidden: true,
            },
            {
                path:'/CCvsMealType',
                component:resolve => require(['./views/Menu/CCvsMealType.vue'],resolve),
                name:'M000021',
                iconCls:'el-icon-document',
                action:'menu-ccvsmt',
                hidden:true
            },
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000031',
        iconCls: 'fa fa-address-card',
        //leaf: true,//只有一个节点
        action: 'site',
        hidden: true,
        children: [
            {
                path: '/weeklyMenu-V2',
                component: resolve => require(['./views/Site/WeeklyMenuMaintain_v2.vue'], resolve),
                name: 'M000030', // 周菜单维护
                iconCls: 'fa fa-align-justify',
                action: 'menu-weekly',
                hidden: true,
            },
            {
                path: '/SitePost',
                component: resolve => require(['./views/Site/SitePosts.vue'], resolve),
                name: 'M000032', // 营运点海报
                iconCls: 'fa fa-align-justify',
                action: 'site-posts',
                hidden: true,
            },
            {
                path: '/SitePriceList',
                component: resolve => require(['./views/Site/FGItemPriceMaintain.vue'], resolve),
                name: 'M000033', // 销售价目表
                iconCls: 'fa fa-align-justify',
                    action: 'site-pricelist',
                hidden: true,
            },
            {
                path: '/SiteSurveyAnalysis',
                component: resolve => require(['./views/Site/SurveyAnalysis.vue'], resolve),
                name: 'M000034', // 销售价目表
                iconCls: 'fa fa-align-justify',
                action: 'site-SurveyAnalysis',
                hidden: true,
            },
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000003', // 公司维护
        iconCls: 'fa fa-address-card',
        //leaf: true,//只有一个节点
        action: 'comp',
        hidden: true,
        children: [
            {
                path: '/subjectMaintenance',
                component: Page6,
                name: 'M000013', // 会计科目维护
                iconCls: 'el-icon-document',
                action: 'comp-journal',
                hidden: true,
            }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000026',
        iconCls: 'fa fa-address-card',
        //leaf: true,//只有一个节点
        action: 'wechat',
        hidden: true,
        children: [
            {
                path: '/CCvsBarCode/withCard',
                component: resolve => require(['./views/WechatProgram/CCvsBarCode.vue'], resolve),
                name: 'M000027',
                iconCls: 'fa fa-list-alt',
                action: 'wechat-ccvsbc',
                hidden: true,
            },
            {
                path: '/CCvsBarCode/withnoCard',
                component: resolve => require(['./views/WechatProgram/CCvsBarCode.vue'], resolve),
                name: 'M000029',
                iconCls: 'fa fa-list-alt',
                action: 'wechat-ccvsbcwithnocard',
                hidden: true,
            },
            {
                path:'/Rechargexls',
                component: resolve => require(['./views/WechatProgram/Rechargexls.vue'],resolve),
                name:'M000028',
                iconCls:'fa fa-list-alt',
                action:'wechat-rechargexls',
                hidden:true
            }
        ]
    },

    {
        path: '/',
        component: Home,
        name: 'M000020', // 用户权限
        iconCls: 'fa fa-language',
        action: 'rights',
        //leaf: true,//只有一个节点
        hidden: true,
        children: [
            {
                path:'/UserRights',
                component:resolve => require(['./views/UserRights/MenuUserAuthorityMaintain.vue'],resolve),
                name:'M000019',
                iconCls:'el-icon-menu',
                action:'rights-user',
                hidden:true
            }
        ]
    },
    {
        path:'/',
        component:Home,
        name:'M000023',
        iconCls:'fa fa-language',
        action:'purchase',
        hidden:true,
        children:[
            {
                path:'/POtoSO',
                component:resolve=>require(['./views/Purchase/POtoSO.vue'],resolve),
                name:'M000022',
                iconCls:'el-icon-menu',
                action:'purchase-poso',
                hidden:true
            }
        ]
    },
    {
        path:'/',
        component:Home,
        name:'M000024',
        iconCls:'fa fa-language',
        action: 'sales',
        hidden:true,
        children:[
            {
                path:'/SalesOrder',
                component:resolve=>require(['./views/SalesManagement/SalesOrder.vue'],resolve),
                name:'M000025',
                iconCls:'el-icon-menu',
                action:'sales-so',
                hidden:true
            }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'M000004', // 语言相关
        iconCls: 'fa fa-language',
        action: 'menu',
        //leaf: true,//只有一个节点
        hidden: true,
        children: [
            {
                path: '/langMaintenance',
                component: resolve => require(['./views/Language/LangMaintain.vue'], resolve),
                name: 'M000014', // 字典维护
                iconCls: 'fa fa-language',
                action: 'comp-journal',
                hidden: true,
            }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: {path: '/404'}
    }
];

export default routes;