import global from 'src/manager/global';

let host = global.host;

try {
	//php环境中
	host = httpDomain.host;
} catch (e) {
	// console.log(e);
}


let httpConfig = {
	'getUserInfo': {
		url: host + 'Shop/getUserInfo'
	},
	'getListByWeixin': {
		url: host + 'Activity/getListByWeixin'
	},
	'getListByMid': {
		url: host + 'Activity/getListByMid'
	},
	'getDetail': {
		url: host + 'Activity/getDetail'
	},
	'getExchange': {
		url: host + 'Activity/getExchange'
	},
	'saveStatusByScan': {
		url: host + 'Status/saveStatusByScan',
		method: 'post'
	},
	'goodsExchange': {
		url: host + 'Activity/goodsExchange'
	},
	'addExchange': {
		url: host + 'Activity/addExchange',
		method: 'post'
	},
	'getExchangeQR': {
		url: host + 'Activity/getExchangeQR'
	},
	'Login': {
		url: host + 'weixin/loginWechat'
	},
	'getInventory': {
		url: host + 'GoodsConfig/getInventory',
		method: 'post'
	},
	'getGoodsList': {
		url: host + 'GoodsConfig/getGoodsList'
	},
	'getOtherList': {
		url: host + 'GoodsConfig/getOtherList'
	},
	'newWechatOrder': {
		url: host + 'order/newWechatOrder',
		method: 'post'
	},
	'wechatOrder': {
		url: host + 'order/wechatOrder',
		method: 'post'
	},
	'getVerCode': {
		url: host + 'GoodsConfig/getVerCode'
	},
	'checkTable': {
		url: host + 'Order/checkTable',
		method: 'post'
	},
	'areaAndTableList': {
		url: host + 'Order/areaAndTableList'
	},
	'getHomePageConfig': {
		url: host + 'HomePage/getHomePageConfig'
	},
	'getReserveList': {
		url: host + 'Reserve/getReserveList'
	},
	'sendSMS': {
		url: host + 'member/sendSMS'
	},
	'registerMember': {
		url: host + 'member/registerMember',
		method: 'post'
	},
	'getMemberQrCode': {
		url: host + 'Member/getMemberQrCode'
	},
	'getConsumeList': {
		url: host + 'Member/getConsumeList'
	},
	'getRechargeConfig': {
		url: host + 'Recharge/getRechargeConfig'
	},
	'wechatRecharge': {
		url: host + 'Recharge/wechatRecharge',
		method: 'post'
	},
	'getCouponByIds': {
		url: host + 'Coupon/getCouponByIds'
	},
	'getWechatOrderList': {
		url: host + 'Order/getWechatOrderList'
	},
	'showOrderDetail': {
		url: host + 'Order/showOrderDetail'
	},
	'showOrderDetailPost': {
		url: host + 'Order/showOrderDetail',
		method: 'post'
	},
	'cancelUnpaidOrder': {
		url: host + 'Order/cancelUnpaidOrder',
		method: 'get'
	},
	'wechatFastPay': {
		url: host + 'Order/wechatFastPay',
		method: 'post'
	},
	'getOpenId': {
		url: host + 'Weixin/getOpenId'
	},
	'getPointConfig': {
		url: host + 'order/getPointConfig'
	},
	'getSelfHelpConfig': {
		url: host + 'SelfHelpConfig/getSelfHelpConfig'
	},
	'getCouponList': { //获取优惠券列表
		url: host + 'Coupon/getCouponList'
	},
	'getStatus': {
		url: host + 'Status/getStatus',
		method: 'post'
	},
	'deleteStatus': {
		url: host + 'Status/deleteStatus',
		method: 'post'
	},
	'getReserveConf': {
		url: host + 'Reserve/getReserveConf'
	},
	'getReserveDetail': {
		url: host + 'Reserve/getReserveDetail',
		method: 'post'
	},
	'getGoodsInfoByCouponId': {
		url: host + 'GoodsConfig/getGoodsInfoByCouponId'
	},
	'getActivityCouponList': {
		url: host + 'Coupon/getActivityCouponList'
	},
	'getCoupon': {
		url: host + 'Coupon/getCoupon'
	},
	'choiceShop': {
		url: host + 'Shop/choiceShop'
	},
	'addInvoice': {
		url: host + 'Invoice/addInvoice',
		method: 'post'
	},
	'deleteInvoice': {
		url: host + 'Invoice/deleteInvoice',
		method: 'post'
	},
	'validationRandKey': {
		url: host + 'order/validationRandKey'
	},
	'log': {
		url: host + 'Weixin/printLog'
	},
	'addAddress': {
		url: host + 'Address/addAddress',
		method: 'post'
	},
	'editAddress': {
		url: host + 'Address/editAddress',
		method: 'post'
	},
	'get': {
		url: host + 'Activitybrand/get',
		method: 'post'
	},
	'brandDetail': {
		url: host + 'Activitybrand/brandDetail'
	},
	'deleteReserve': {
		url: host + 'Reserve/deleteReserve'
	},
	'createOrderReserve': {
		url: host + 'Reserve/createOrderReserve',
		method: 'post'
	},
	'orderDetailPay': {
		url: host + 'Order/orderDetailPay'
	},
	'preComputing': {
		url: host + 'order/preComputing'
	},
	'weChatOnlinePay': {
		url: host + 'order/weChatOnlinePay',
		method: 'post'
	},
	'getAreaAndTableList': {
		url: host + 'Selfhelpconfig/getAreaAndTableList'
	},
	'getUserGoodsInfo': {
		url: host + 'GoodsConfig/getUserInfo'
	},
	'getAddressList': {
		url: host + 'Address/getAddressList'
	},
	'getInvoiceList': {
		url: host + 'Invoice/getInvoiceList',
		method: 'post'
	},
	'Order/wechatFastPay': {
		url: host + 'Order/wechatFastPay',
		method: 'post'
	},
	'setAddressDefault': {
		url: host + 'Address/setAddressDefault'
	},
	'getAddressDetail': {
		url: host + 'Address/getAddressDetail'
	},
	'getMemberCardAndCouponList': {
		url: host + 'Coupon/getMemberCardAndCouponList'
	},
	'updateMemberInfo': {
		url: host + 'Member/updateMemberInfo',
		method: 'post'
	},
	'getTableDetail': {
		url: host + 'Order/getTableDetail'
	},
	'deleteAddress': {
		url: host + 'Address/deleteAddress',
		method: 'post'
	},
	'cancelReserve': {
		url: host + 'Reserve/cancelReserve'
	},
	'addStaffInfo': {
		url: host + 'Activity/addStaffInfo'
	},
	'budgetPrice': {
		url: host + 'order/budgetPrice',
		method: 'post'
	},
	'paySwOrder': {
		url: host + 'Order/paySwOrder',
		method: 'post'
	},
	'getActivityShopGoodsList': {
		url: host + 'Assistant/getActivityShopGoodsList',
	},
	'myGuide': {
		url: host + 'Assistant/myGuide',
		method: 'post'
	},
	'getActivityShopList': {
		url: host + 'Assistant/getActivityShopList',
		method: 'post'
	},
	'getSlideShowList': {
		url: host + 'weixin/getSlideShowList'
	},
	'myPointCardList': {
		url: host + 'Assistant/myPointCardList',
		method: 'post'
	},
	'getCommentList': {
		url: host + 'Assistant/getCommentList',
	},
	'myStaffList': {
		url: host + 'Assistant/myStaffList',
		method: 'post'
	},
	'selectStaff': {
		url: host + 'Assistant/selectStaff',
		method: 'post'
	},
	'clickTag': {
		url: host + 'Assistant/clickTag',
		method: 'post'
	},
	'staffTag': {
		url: host + 'assistantstaffcenter/clickTag'
	},
	'getStaffInfo': {
		url: host + 'Assistantstaffcenter/getStaffInfo'
	},
	'myQrCode': {
		url: host + 'Assistantstaffcenter/myQrCode'
	},
	'staffRanking': {
		url: host + 'Assistantstaffcenter/staffRanking'
	},
	'releaseComment': {
		url: host + 'Assistant/releaseComment',
		method: 'post'
	},
	'getStaffDetail': {
		url: host + 'Assistantstaffcenter/getStaffDetail'
	},
	'myCustomer': {
		url: host + 'Assistantstaffcenter/myCustomer'
	},
	'grabGoods': {
		url: host + 'Assistant/grabGoods',
		method: 'post'
	},
	'payWaitOrder': {
		url: host + 'Assistant/payWaitOrder',
		method: 'post'
	},
	'enchashment': {
		url: host + 'Assistant/enchashment',
		method: 'post'
	},
	'assisGetCouponList': {
		url: host + 'assistantstaffcenter/getCouponList'
	},
	'getMyCouponList': {
		url: host + 'assistantstaffcenter/getMyCouponList'
	},
	'distributionCouponToStaff': {
		url: host + 'assistantstaffcenter/distributionCouponToStaff'
	},
	'getStaffList': {
		url: host + 'assistantstaffcenter/getStaffList'
	},
	'getCouponByStaffId': {
		url: host + 'assistantstaffcenter/getCouponByStaffId'
	},
	'distributionCoupon': {
		url: host + 'assistantstaffcenter/distributionCoupon'
	},
	'customerDetail': {
		url: host + 'Assistantstaffcenter/customerDetail'
	},
	'crazyOrderList': {
		url: host + 'Assistant/crazyOrderList',
		method: 'post'
	},
	'couponVerificationSheet': {
		url: host + 'Coupon/couponVerificationSheet'
	},
	'getShopInfoAndQrcode': {
		url: host + 'Assistant/getShopInfoAndQrcode',
		method: 'post'
	},
	'getUnreadMsg': {
		url: host + 'assistantstaffcenter/getUnreadMsg'
	},
	'getUserConsumInfo': {
		url: host + 'Assistant/getUserConsumInfo'
	},
	'confirmUserConsum': {
		url: host + 'Assistant/confirmUserConsum',
		method: 'post'
	},
	'queryOrder': {
		url: host + 'Assistant/queryOrder',
		method: 'post'
	},
	'userCenter': {
		url: host + 'Assistant/userCenter',
		method: 'post'
	},
	'usePointCard': {
		url: host + 'Assistant/usePointCard',
		method: 'post'
	},
	'crazyOrderVerificationSheet': {
		url: host + 'Assistant/crazyOrderVerificationSheet',
		method: 'post'
	},
	'userQrcode': {
		url: host + 'Assistant/userQrcode',
		method: 'post'
	},
	'getVerbalTrick': {
		url: host + 'Assistantstaffcenter/getVerbalTrick'
	},
	'crazyGoodsSubscribe': {
		url: host + 'Assistant/crazyGoodsSubscribe',
		method: 'post'
	},
	'getHomePage': {
		url: host + 'Assistant/getHomePage'
	},
	'getProfitList': {
		url: host + 'Assistant/getProfitList',
		method: 'post'
	},
	'getConsumeVerifyList': {
		url: host + 'assistantStaffCenter/getConsumeVerifyList'
	},
	'getConsumeVerifyDetail': {
		url: host + 'assistantStaffCenter/getConsumeVerifyDetail'
	},
	'confirmSubmitConsume': {
		url: host + 'assistantStaffCenter/confirmSubmitConsume'
	},
	'getHistoryMsg': {
		url: host + 'assistantstaffcenter/getHistoryMsg'
	},
	'sendCoupon': {
		url: host + 'assistantstaffcenter/sendCoupon'
	},
	'addPayComment': {
		url: host + 'paycomment/addPayComment',
		method: 'post'
	},
	'getJsSign': {
		url: host + 'weixin/getJsSign'
	},
	'sendMenuPath': {
		url: host + 'assistantstaffcenter/sendMenuPath'
	},
	'getTaskList': {
		url: host + 'Task/getTaskList'
	},
	'customVerbalTrick': {
		url: host + 'Assistantstaffcenter/customVerbalTrick',
		method: 'post'
	},
	'getMemberCard': {
		url: host + 'MemberCard/getMemberCard',
		method: 'post'
	},
	'myTask': {
		url: host + 'Task/myTask'
	},
	'receiveTask': {
		url: host + 'Task/receiveTask'
	},
	'taskVerificationSheet': {
		url: host + 'Task/taskVerificationSheet'
	},
	'shareTask': {
		url: host + 'Task/shareTask'
	},
	'preComputingPriceAndPoint': {
		url: host + 'Order/preComputingPriceAndPoint',
		method: 'post'
	},
	'getCouponListNew': {
		url: host + 'Coupon/getCouponListNew'
	},
	'scanPay': {
		url: host + 'Order/scanPay',
		method: 'post'
	},
	'aliPay': {
		url: host + 'Shop/aliPayTest',
		method: 'post'
	},
	'aliPayOrderQuery': {
		url: host + 'Order/aliPayOrderQuery',
		method: 'post'
	},
	'urgeOrder': {
		url: host + 'Order/urgeOrder'
	},
	'cancelOrder': {
		url: host + 'Order/cancelOrder'
	},
	'getRechargePayType': {
		url: host + 'Recharge/getRechargePayType'
	},
	'createCallUp': {
		url: host + 'Assistantstaffcenter/createCallUp',
		method: 'post'
	},
	'upload': {
		url: host + 'image/uploadImg',
		type: 'upload'
	},
	'getCallUpList': {
		url: host + 'Assistantstaffcenter/getCallUpList'
	},
	'pushCallUp': {
		url: host + 'Assistantstaffcenter/pushCallUp',
		method: 'post'
	},
	'getCallUpDetail': {
		url: host + 'Assistant/getCallUpDetail'
	},
	'shopTaskList': {
		url: host + 'Task/shopTaskList'
	},
	'getGoodsStock': {
		url: host + 'activity/getGoodsStock'
	},
	'analysis': {
		url: host + 'Assistantstaffcenter/analysis'
	},
	'getReduceActivity': {
		url: host + 'Order/getReduceActivity'
	},
	'updateCustomerRemarks': {
		url: host + 'Assistantstaffcenter/updateCustomerRemarks',
		method: 'post'
	},
	'getTemplateStyle': {
		url: host + 'shop/getTemplateStyle',
		method: 'get'
	},
	'getChannelList': {
		url: host + 'goodsconfig/getChannelList'
	},
	'getActivityList': {
		url: host + 'Activity/getActivityCouponList'
	},
	'getActCoupon': {
		url: host + 'Activity/getCoupon'
	},
	'getCouponUserList': {
		url: host + 'Assistantstaffcenter/getCouponUserList'
	},
	'getStaffDetailList': {
		url: host + 'Assistantstaffcenter/getStaffDetailList'
	},
	'getDistributionList': {
		url: host + 'Assistantstaffcenter/getDistributionList'
	},
	'getMoveFee': {
		url: host + 'order/getMoveFee'
	},
	'getStatusByOid': {
		url: host + 'Order/getStatusByOid'
	},
	'memberInstructions': {
		url: host + 'Shop/memberInstructions'
	},
	'diyTag': {
		url: host + 'Assistantstaffcenter/diyTag'
	},
	'getTxt': {
		url: 'http://www.mcrspace.com:3000/log/getTxt',
		type: 'text'
	},
	'createReserve': {
		url: host + 'Reserve/createReserve',
		method: 'post'
	}
};

export default httpConfig;