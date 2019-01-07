import Pay from 'src/module/order/common/self_help_pay_info';

/*
 *   旧版积分商城
 */
const Detail = () =>
	import( /* webpackChunkName: 'detail' */ 'src/module/integral_mall/old/detail');
const intergralMall = () =>
	import( /* webpackChunkName: 'intergral_mall' */ 'src/module/integral_mall/old/intergral_mall');
const Recond = () =>
	import( /* webpackChunkName: 'record' */ 'src/module/integral_mall/old/record');
const Exchange = () =>
	import( /* webpackChunkName: 'exchange' */ 'src/module/integral_mall/old/exchange');


/* 新版积分商城 */

const NewIntegralMall = () =>
	import( /* webpackChunkName: 'new_integral_mall' */ 'src/module/integral_mall/new/new_integral_mall');
const exchangeRecord = () =>
	import( /* webpackChunkName: 'exchange_record' */ 'src/module/integral_mall/common/exchange_record');
const mallGoodsDetail = () =>
	import( /* webpackChunkName: 'mall_goods_detail' */ 'src/module/integral_mall/new/mall_goods_detail');
const exchangeCode = () =>
	import( /* webpackChunkName: 'exchange_code' */ 'src/module/integral_mall/common/exchange_code');
const mallRegister = () =>
	import( /* webpackChunkName: 'mall_register' */ 'src/module/integral_mall/new/mall_register');
const exchangeSuccess = () =>
	import( /* webpackChunkName: 'exchange_success' */ 'src/module/integral_mall/common/exchange_success');



/* 点单 */
const tableSelect = () =>
	import( /* webpackChunkName: 'table_select' */ 'src/module/order/common/table_select');
const Order = () =>
	import( /* webpackChunkName: 'order' */ 'src/module/order/old/order');
const Search = () =>
	import( /* webpackChunkName: 'search' */ 'src/module/order/old/search');
const ShopSelect = () =>
	import( /* webpackChunkName: 'shop_select' */ 'src/module/order/common/shop_select');
const addAddress = () =>
	import( /* webpackChunkName: 'add_address' */ 'src/module/order/common/address/add_address');
const addAddressSearch = () =>
	import( /* webpackChunkName: 'add_address_search' */ 'src/module/order/common/address/add_address_search');
const choseAddress = () =>
	import( /* webpackChunkName: 'chose_address' */ 'src/module/order/common/address/chose_address');
const addBill = () =>
	import( /* webpackChunkName: 'add_bill' */ 'src/module/order/common/add_bill');
const choseBill = () =>
	import( /* webpackChunkName: 'chose_bill' */ 'src/module/order/common/chose_bill');
const chooseCoupon = () =>
	import( /* webpackChunkName: 'choose_coupon' */ 'src/module/order/common/choose_coupon');
const orderPackage = () =>
	import( /* webpackChunkName: 'orderPackage' */ 'src/module/order/old/package');
const oSuccess = () =>
	import( /* webpackChunkName: 'osuccess' */ 'src/module/order/common/osuccess');
const selfPayDetail = () =>
	import( /* webpackChunkName: 'self_pay_detail' */ 'src/module/order/common/self_pay_detail');

//评价系统
const evaluate = () =>
	import( /* webpackChunkName: 'evaluate' */ 'src/module/order/common/evaluate');
//支付宝付款
const alipay = () =>
	import( /* webpackChunkName: 'alipay' */ 'src/module/order/common/alipay');


/* 优惠券 */
const Coupon = () =>
	import( /* webpackChunkName: 'coupon' */ 'src/module/coupon/coupon');
const couponDetail = () =>
	import( /* webpackChunkName: 'coupon_detail' */ 'src/module/coupon/coupon_detail');
const applicationStore = () =>
	import( /* webpackChunkName: 'application_store' */ 'src/module/coupon/application_store');
const applicationStoreDetail = () =>
	import( /* webpackChunkName: 'applicationStoreDetail' */ 'src/module/coupon/application_store_detail');
const GetCoupon = () =>
	import( /* webpackChunkName: 'get_coupon' */ 'src/module/coupon/get_coupon');


/* 微店首页 */
// const WechatIndex = () =>
//     import ( /* webpackChunkName: 'wechat_index' */ 'src/module/wechat_index/wechat_index');

/* 会员模块 */
const MemberRegister = () =>
	import( /* webpackChunkName: 'member_register' */ 'src/module/member/member_register');
const MembershipJoin = () =>
	import( /* webpackChunkName: 'membership_join' */ 'src/module/member/membership_join');
const MembershipInfo = () =>
	import( /* webpackChunkName: 'membership_info' */ 'src/module/member/membership_info');
const MemberIntegral = () =>
	import( /* webpackChunkName: 'member_integral' */ 'src/module/member/member_integral');
const memberCards = () =>
	import( /* webpackChunkName: 'member_cards' */ 'src/module/member/member_cards');
const personalInfo = () =>
	import( /* webpackChunkName: 'personal_info' */ 'src/module/member/personal_info');
const MemberStrategy = () =>
	import( /* webpackChunkName: 'member_strategy' */ 'src/module/member/member_strategy');
/* 会员权益 */
const Recharge = () =>


	import( /* webpackChunkName: 'recharge' */ 'src/module/recharge/recharge');
const RechargeDetail = () =>
	import( /* webpackChunkName: 'recharge_detail' */ 'src/module/recharge/recharge_detail');



/* 会员中心 */
const memberCenter = () =>
	import( /* webpackChunkName: 'member_center' */ 'src/module/member_center/member_center');
const memberCenterOrderData = () =>
	import( /* webpackChunkName: 'member_center_orderlist' */ 'src/module/member_center/member_center_orderlist');
const memberCenterOrderSince = () =>
	import( /* webpackChunkName: 'member_center_order_since' */ 'src/module/member_center/member_center_order_since');
const memberCenterOrderDetail = () =>
	import( /* webpackChunkName: 'member_center_order_detail' */ 'src/module/member_center/member_center_order_detail');
const memberCenterOrderCancel = () =>
	import( /* webpackChunkName: 'member_center_order_cancel' */ 'src/module/member_center/member_center_order_cancel');


/* 预约 */
/* eslint-disable */
const BespeakGen = () =>
	import( /* webpackChunkName: 'bespeak_gen' */ 'src/module/bespeak_system/bespeak_gen');
const bespeakShoplist = () =>
	import( /* webpackChunkName: 'bespeak_shoplist' */ 'src/module/bespeak_system/bespeak_shoplist');
const BespeakMap = () =>
	import( /* webpackChunkName: 'bespeak_map' */ 'src/module/bespeak_system/bespeak_map');
const BespeakList = () =>
	import( /* webpackChunkName: 'bespeak_list' */ 'src/module/bespeak_system/bespeak_list');
const BespeakDetail = () =>
	import( /* webpackChunkName: 'bespeak_detail' */ 'src/module/bespeak_system/bespeak_detail');



/* 闪店微信错误监控系统 */
const testError = () =>
	import( /* webpackChunkName: 'test_error_index' */ 'src/module/test_error/test_error_index');

/* 品牌 */
const brandList = () =>
	import( /* webpackChunkName: 'brand_list' */ 'src/module/brand/brand_list');
const brandDetail = () =>
	import( /* webpackChunkName: 'brand_detail' */ 'src/module/brand/brand_detail');

let orderView = {
	template: `<div style='height:100%'><router-view name='header'></router-view><router-view name='default'></router-view><router-view name='footer'></router-view></div>`
}

/* 支付系统 */

const wechatPay = () =>
	import( /* webpackChunkName: 'wechat_pay' */ 'src/module/order/common/table_pay_info')
const payDetails = () =>
	import( /* webpackChunkName: 'pay_details' */ 'src/module/order/common/self_help_pay_details');

/* 绑定兑换权限 */
const staff = () =>
	import( /* webpackChunkName: 'staff' */ 'src/module/staff/staff');
/* 闪店卖手 */
const sellerIndex = () =>
	import( /* webpackChunkName: 'seller_index' */ 'src/module/seller_assis/seller_index');
/* 社群召集令 */
const communityList = () =>
	import( /* webpackChunkName: 'community_list' */ 'src/module/seller_assis/com_con_order/community_list');
const communityAdd = () =>
	import( /* webpackChunkName: 'community_add' */ 'src/module/seller_assis/com_con_order/community_add');
const communityLable = () =>
	import( /* webpackChunkName: 'community_lable' */ 'src/module/seller_assis/com_con_order/community_lable');
const communityQRcode = () =>
	import( /* webpackChunkName: 'community_qrcode' */ 'src/module/seller_assis/com_con_order/community_qrcode');
const dataAnalysis = () =>
	import( /* webpackChunkName: 'dataAnalysis' */ 'src/module/seller_assis/data_analysis/analysis');


//积分卡
const interCard = () =>
	import( /* webpackChunkName: 'inter_card' */ 'src/module/seller_assis/inter_card/inter_card');
const interCardDetail = () =>
	import( /* webpackChunkName: 'inter_detail' */ 'src/module/seller_assis/inter_card/inter_detail');

/*店长分配优惠券*/
const addCoupon = () =>
	import( /* webpackChunkName: 'add_coupon' */ 'src/module/seller_assis/inter_card/add_coupon');
const allotCoupon = () =>
	import( /* webpackChunkName: 'allot_coupon' */ 'src/module/seller_assis/inter_card/allot_coupon');

/*批量发放优惠券*/

const sendCoupon = () =>
	import( /* webpackChunkName: 'send_coupon' */ 'src/module/seller_assis/inter_card/send_coupon');

const userCoupon = () =>
	import( /* webpackChunkName: 'user_coupon' */ 'src/module/seller_assis/inter_card/user_coupon');

/*提现*/
const withdrawals = () =>
	import( /* webpackChunkName: 'withdrawals' */ 'src/module/seller_assis/withdrawals/withdrawals');
const revenueRecord = () =>
	import( /* webpackChunkName: 'revenue_record' */ 'src/module/seller_assis/withdrawals/revenue_record');
/* 我的订单 */
const myOrder = () =>
	import( /* webpackChunkName: 'my_order' */ 'src/module/seller_assis/inter_card/my_order');
const receiveQrcode = () =>
	import( /* webpackChunkName: 'receive_qrcode' */ 'src/module/seller_assis/inter_card/receive_qrcode');
const distriCard = () =>
	import( /* webpackChunkName: 'distri_card' */ 'src/module/seller_assis/inter_card/distri_card');
/* 核销疯抢商品 */
const writeOffGoods = () =>
	import( /* webpackChunkName: 'write_off_goods' */ 'src/module/seller_assis/inter_card/write_off_goods');
/* 核销优惠券 */
const writeOffCoupon = () =>
	import( /* webpackChunkName: 'write_off_coupon' */ 'src/module/seller_assis/inter_card/write_off_coupon');

/* 用户中心 */
const userCenter = () =>
	import( /* webpackChunkName: 'inter_card' */ 'src/module/seller_assis/user_center/user_center');
const assCenter = () =>
	import( /* webpackChunkName: 'inter_card' */ 'src/module/seller_assis/user_center/ass_center');

/* 我的专属导购 */
const shoppingGuide = () =>
	import( /* webpackChunkName:'shoppingGuide' */ 'src/module/seller_assis/shopping_guide/shopping_guide')
/* 我的点评 */
const myComments = () =>
	import( /* webpackChunkName:'myComments' */ 'src/module/seller_assis/shopping_guide/my_comments')
const rankList = () =>
	import( /* webpackChunkName:'ass_rank_list' */ 'src/module/seller_assis/user_center/ass_rank_list')
/* 没有专属客服 */
const notHaveShoppingGuide = () =>
	import( /* webpackChunkName:'notHaveShoppingGuide' */ 'src/module/seller_assis/shopping_guide/not_have_shopping_guide')
/* 店员信息 */
const shopAssistantInfo = () =>
	import( /* webpackChunkName:'shopAssistantInfo' */ 'src/module/seller_assis/shopping_guide/shop_assistant_info')
const myConsumer = () =>
	import( /* webpackChunkName:'shopAssistantInfo' */ 'src/module/seller_assis/shopping_guide/my_consumer')
/* 聊天页面 */
const chatPage = () =>
	import( /* webpackChunkName:'chatPage' */ 'src/module/seller_assis/chat/chat_page')
/* 疯抢专栏 */
const crazyRobbery = () =>
	import( /* webpackChunkName:'crazyRobbery' */ 'src/module/seller_assis/crazy_robbery/crazy_robbery')
const goodsDetail = () =>
	import( /* webpackChunkName:'goods_detail' */ 'src/module/seller_assis/crazy_robbery/goods_detail')
/* 消息中心 */
const messageCenter = () =>
	import( /* webpackChunkName:'messageCenter' */ 'src/module/seller_assis/chat/message_center')
/* 消费审核 */
const auditList = () =>
	import( /* webpackChunkName:'auditList' */ 'src/module/seller_assis/audit/audit_list')
/* 审核详情 */
const auditDetails = () =>
	import( /* webpackChunkName:'audit_details' */ 'src/module/seller_assis/audit/audit_details')

/* 客户列表 */
const customerList = () =>
	import( /* webpackChunkName:'customer_list' */ 'src/module/seller_assis/customer/customer_list')
/* 选择门店 */
const chooseShop = () =>
	import( /* webpackChunkName:'chooseShop' */ 'src/module/seller_assis/choose_shop/chooseshop')
/* 附近门店 */
const nearbyStore = () =>
	import( /* webpackChunkName:'nearby_store' */ 'src/module/seller_assis/choose_shop/nearby_store')
/* 常去门店 */
const oftenStore = () =>
	import( /* webpackChunkName:'nearby_store' */ 'src/module/seller_assis/choose_shop/often_store')
/* 附近门店详情 */
const nearbyStoreDetail = () =>
	import( /* webpackChunkName:'nearby_store_detail' */ 'src/module/seller_assis/choose_shop/nearby_store_detail')
// /* 地图 */
// const mapCompent = () =>
//     import( /* webpackChunkName:'map_compent' */ 'src/module/seller_assis/choose_shop/map_compent')
/* 店长二维码 */
const guideRcode = () =>
	import( /* webpackChunkName:'guide_rcode' */ 'src/module/seller_assis/shopping_guide/guide_rcode')
const consumeQrcode = () =>
	import( /* webpackChunkName:'consume_qrcode' */ 'src/module/seller_assis/customer/consume_qrcode')
const userConsume = () =>
	import( /*webpackChunkName: 'user_consume'*/ 'src/module/seller_assis/user_consume/user_consume')

/* 任务系统 */
const taskList = () =>
	import( /*webpackChunkName: 'task_list'*/ 'src/module/task_system/task_list')
/* 任务选择门店*/
const chooseTaskStore = () =>
	import( /*webpackChunkName: 'choose_task_store'*/ 'src/module/task_system/choose_task_store')
/* 商品选择门店*/
const chooseGoodsStore = () =>
	import( /*webpackChunkName: 'choose_goods_store'*/ 'src/module/task_system/choose_goods_store')
/* 商品选择门店*/
const chooseGoodsStoreSs = () =>
	import( /*webpackChunkName: 'choose_goods_store_ss'*/ 'src/module/task_system/choose_goods_store_ss')
// 我的任务
const myTask = () =>
	import( /*webpackChunkName: 'my_task'*/ 'src/module/task_system/my_task')
// 任务详情
// const taskDetail = () =>
//     import(  /*webpackChunkName: 'task_detail'*/ 'src/module/task_system/task_detail')
const taskDetails = () =>
	import( /*webpackChunkName: 'task_detail_s'*/ 'src/module/task_system/task_detail_s');
// 任务核销
const taskAudit = () =>
	import( /*webpackChunkName: 'taskAudit'*/ 'src/module/task_system/task_audit')
// 扫码点餐的我的订单详情
const orderQrcodeDetail = () =>
	import( /*webpackChunkName: 'order_qrcode_detail'*/ 'src/module/member_center/order_qrcode_detail')

// 扫码支付
const preferentialPay = () =>
	import( /*webpackChunkName: 'preferentialPay' */ 'src/module/order/common/preferential_pay')
const choseCard = () =>
	import( /*webpackChunkName: 'choseCard' */ 'src/module/order/common/chose_member_card')
const scanPayment = () =>
	import( /*webpackChunkName: 'scanPayment' */ 'src/module/order/common/scan_payment')

// 外卖详情
const takeoutDetails = () =>
	import( /*webpackChunkName: 'takeoutDetails' */ 'src/module/order/common/takeout_details')
const takeoutCancel = () =>
	import( /*webpackChunkName: 'takeoutCancel' */ 'src/module/order/common/takeout_order_cancel')
const cancellationReason = () =>
	import( /*webpackChunkName: 'cancellationReason' */ 'src/module/order/common/cancellation_reason')
const takeCancelSuccess = () =>
	import( /*webpackChunkName: 'takeCancelSuccess' */ 'src/module/order/common/take_cancel_success')
const ascanQRCode = () =>
	import( /*webpackChunkName: 'ascan_qr_code' */ 'src/module/order/common/ascan_qr_code')
const payMethod = () =>
	import( /*webpackChunkName: 'pay_method' */ 'src/module/common/pay_method')

//新点单
const orderContainer = () =>
	import( /*webpackChunkName: 'order_container' */ 'src/module/order/new/container')
const lO = () =>
	import( /*webpackChunkName: 'latest_order' */ 'src/module/order/new/order')
const lastestDetail = () =>
	import( /*webpackChunkName: 'latest_detail' */ 'src/module/order/new/order/good_detail')

//领取优惠券列表
const voucherList = () =>
	import( /*webpackChunkName: 'voucher_list' */ 'src/module/coupon/voucher_list')
// 多人点餐
const manyPeopleOrder = () =>
	import( /*webpackChunkName: 'many_people_order' */ 'src/module/order/common/many_people_order')

// 搜索菜品
const searchList = () =>
	import( /*webpackChunkName: 'search_list' */ 'src/module/order/new/order/search_list')
// 套餐
const goodsPackages = () =>
	import( /*webpackChunkName: 'goods_packages' */ 'src/module/order/new/order/goods_packages')
const complemente = () =>
	import( /*webpackChunkName: 'complemente' */ 'src/module/order/new/order/complemente')

export default [
	/*
	 *   旧版积分商城
	 */
	{
		path: '/detail',
		component: Detail
	},
	{
		path: '/intergralMall',
		component: intergralMall

	}, {
		path: '/record',
		component: Recond
	}, {
		path: '/exchange',
		component: Exchange
	},
	/* 点单 */
	{
		path: '/tableSelect',
		component: tableSelect
	},
	{
		path: '/order',
		component: Order,
		meta: {
			keepAlive: false
		}
	},
	{
		path: '/search',
		component: Search
	},
	{
		path: '*',
		component: ShopSelect
	},
	{
		path: '/shopSelect',
		component: ShopSelect
	}, {
		path: '/addAddress',
		component: addAddress
	},
	{
		path: '/addAddressSearch',
		component: addAddressSearch

	}, {
		path: '/choseAddress',
		component: choseAddress
	}, {
		path: '/addBill',
		component: addBill
	}, {
		path: '/choseBill',
		component: choseBill
	}, {
		path: '/chooseCoupon',
		component: chooseCoupon
	},

	{
		path: '/package',
		component: orderPackage
	}, {
		path: '/oSuccess',
		component: oSuccess

	}, {
		path: '/wechatPay',
		component: wechatPay
	},
	{
		path: '/selfPayDetail',
		component: selfPayDetail
	},
	{
		path: '/evaluate',
		component: evaluate
	},
	{
		path: '/alipay',
		component: alipay
	},
	/* 优惠券 */
	{
		path: '/voucherList',
		component: voucherList
	},
	{
		path: '/coupon',
		component: Coupon
	},
	{
		path: '/couponDetail',
		component: couponDetail
	},
	{
		path: '/applicationStore',
		component: applicationStore
	},
	{
		path: '/applicationStoreDetail',
		component: applicationStoreDetail
	},
	{
		path: '/getCoupon',
		component: GetCoupon
	},
	/* 微店首页 */
	// {
	//     path: '/wechatIndex',
	//     component:WechatIndex
	// },
	/* 会员模块 */
	{
		path: '/memberRegister',
		component: MemberRegister
	}, {
		path: '/memberShipJoin',
		component: MembershipJoin
	}, {
		path: '/memberShipInfo',
		component: MembershipInfo
	}, {
		path: '/memberIntegral',
		component: MemberIntegral
	}, {
		path: '/memberCards',
		component: memberCards
	}, {
		path: '/personalInfo',
		component: personalInfo
	}, {
		path: '/memberStrategy',
		component: MemberStrategy
	},
	/* 会员权益 */
	{
		path: '/recharge',
		component: Recharge
	}, {
		path: '/RechargeDetail',
		component: RechargeDetail
	},
	/* 会员中心 */
	{
		path: '/memberCenter',
		component: memberCenter
	},
	{
		path: '/memberCenterOrderData',
		component: memberCenterOrderData
	},
	{
		path: '/memberCenterOrderSince',
		component: memberCenterOrderSince
	},
	{
		path: '/memberCenterOrderDetail',
		component: memberCenterOrderDetail
	},
	{
		path: '/memberCenterOrderCancel',
		component: memberCenterOrderCancel
	},
	/* 预约 */
	{
		path: '/bespeak',
		component: BespeakMap,
		meta:{
			keepAlive:true
		}
	},
	{
		path: '/bespeakShoplist',
		component: bespeakShoplist
	},
	{
		path: '/bespeakGen',
		component: BespeakGen
	},
	{
		path: '/bespeakList',
		component: BespeakList
	}, {
		path: '/bespeakDetail',
		component: BespeakDetail
	},
	/* 新版积分商城 */
	{
		path: '/newIntegralMall',
		component: NewIntegralMall
	}, {
		path: '/exchangeRecord',
		component: exchangeRecord
	}, {
		path: '/exchangeCode',
		component: exchangeCode
	}, {
		path: '/mallGoodsDetail',
		component: mallGoodsDetail
	}, {
		path: '/mallRegister',
		component: mallRegister
	}, {
		path: '/exchangeSuccess',
		component: exchangeSuccess
	}, {
		path: '/testError',
		component: testError
	}, {
		path: '/brandList',
		component: brandList
	}, {
		path: '/brandDetail',
		component: brandDetail
	}, {
		path: '/Pay',
		component: Pay
	},
	{
		path: '/payDetails',
		component: payDetails
	},
	{
		path: '/staff',
		component: staff
	},
	/**
	 * 以下为老版本路由跳转
	 * 
	 */
	{
		path: '/intergralMall',
		component: intergralMall
	}, {
		path: '/membership-join',
		component: MembershipJoin
	},
	{
		path: '/choiceTable',
		component: tableSelect
	}, {
		path: '/choiceShop',
		component: ShopSelect
	}, {
		path: '/orderList',
		component: memberCenterOrderData
	}, {
		path: '/user-center',
		component: memberCenter
	},
	// {
	//     path: '/wechat-index',
	//     component: WechatIndex
	// },
	{
		path: '/brand-list',
		component: brandList
	},
	/**
	 * 闪店卖手
	 */
	{
		path: '/userCenter',
		component: userCenter
	}, {
		path: '/shoppingGuide',
		component: shoppingGuide
	},
	{
		path: '/sellerIndex',
		component: sellerIndex
	},
	{
		path: '/interCard',
		component: interCard
	},
	{
		path: '/interCardDetail',
		component: interCardDetail
	},
	{
		path: '/customerList',
		component: customerList
	}, {
		path: '/myComments',
		component: myComments
	}, {
		path: '/assCenter',
		component: assCenter
	}, {
		path: '/rankList',
		component: rankList
	}, {
		path: '/notHaveShoppingGuide',
		component: notHaveShoppingGuide
	}, {
		path: '/shopAssistantInfo',
		component: shopAssistantInfo
	}, {
		path: '/myConsumer',
		component: myConsumer
	}, {
		path: '/distriCard',
		component: distriCard
	}, {
		path: '/payMethod',
		component: payMethod
	}, {
		path: '/chatPage',
		component: chatPage
	}, {
		path: '/chooseShop',
		component: chooseShop
	}, {
		path: '/goodsDetail',
		component: goodsDetail
	}, {
		path: '/crazyRobbery',
		component: crazyRobbery
	},
	{
		path: '/guideRcode',
		component: guideRcode
	},
	{
		path: '/consumeQrcode',
		component: consumeQrcode
	}, {
		path: '/messageCenter',
		component: messageCenter
	}, {
		path: '/myOrder',
		component: myOrder
	}, {
		path: '/auditList',
		component: auditList
	}, {
		path: '/auditDetails',
		component: auditDetails
	}, {
		path: '/receiveQrcode',
		component: receiveQrcode
	}, {
		path: '/writeOffGoods',
		component: writeOffGoods
	}, {
		path: '/writeOffCoupon',
		component: writeOffCoupon
	}, {
		path: '/userConsume',
		component: userConsume
	},
	{
		path: '/allotCoupon',
		component: allotCoupon
	},
	{
		path: '/sendCoupon',
		component: sendCoupon
	},
	{
		path: '/userCoupon',
		component: userCoupon
	},
	{
		path: '/addCoupon',
		component: addCoupon
	},
	{
		path: '/withdrawals',
		component: withdrawals
	},
	{
		path: '/revenueRecord',
		component: revenueRecord
	},
	{
		path: '/taskList',
		component: taskList
	}, {
		path: '/myTask',
		component: myTask
	},
	// {
	//     path: '/taskDetail',
	//     component: taskDetail
	// },
	{
		path: '/taskDetails',
		component: taskDetails
	},
	{
		path: '/taskAudit',
		component: taskAudit
	},
	{
		path: '/nearbyStore',
		component: nearbyStore
	},
	{
		path: '/nearbyStoreDetail',
		component: nearbyStoreDetail
	},
	// {
	//     path:'/mapCompent',
	//     component:mapCompent
	// },
	{
		path: '/oftenStore',
		component: oftenStore
	},

	{
		path: '/orderQrcodeDetail',
		component: orderQrcodeDetail
	},
	{
		path: '/preferentialPay',
		component: preferentialPay,
		meta: {
			keepAlive: true
		}
	}, {
		path: '/choseCard',
		component: choseCard
	}, {
		path: '/scanPayment',
		component: scanPayment
	}, {
		path: '/takeoutDetails',
		component: takeoutDetails
	}, {
		path: '/takeoutCancel',
		component: takeoutCancel
	}, {
		path: '/cancellationReason',
		component: cancellationReason
	}, {
		path: '/takeCancelSuccess',
		component: takeCancelSuccess
	}, {
		path: '/ascanQRCode',
		component: ascanQRCode
	}, {
		path: '/communityList',
		component: communityList
	}, {
		path: '/communityAdd',
		component: communityAdd
	}, {
		path: '/communityLable',
		component: communityLable
	}, {
		path: '/communityQRcode',
		component: communityQRcode
	}, {
		path: '/chooseTaskStore',
		component: chooseTaskStore
	}, {
		path: '/chooseGoodsStore',
		component: chooseGoodsStore
	},
	{

		path: '/chooseGoodsStoreSs',
		component: chooseGoodsStoreSs
	}, {
		path: '/dataAnalysis',
		component: dataAnalysis
	},
	{
		path: '/latestOrder',
		component: orderContainer,
		children: [{
				path: '',
				component: lO
			},
			{
				path: 'detail',
				component: lastestDetail
			},
			{
				path: 'searchList',
				component: searchList
			},
			{
				path: 'complemente',
				component: complemente
			},
		]
	},
	{
		path: '/goodsPackages',
		component: goodsPackages
	},
	{
		path: '/manyPeopleOrder',
		component: manyPeopleOrder
	}
]