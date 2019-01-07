import http from 'src/manager/http';
import utils from 'src/verdor/utils';
import {
	store
} from 'src/manager/store';
import storage from 'src/verdor/storage';
import global from 'src/manager/global';

let orderHttp = {};


let code = utils.getQueryString('code') || 'test';

//获取店铺的基本信息
orderHttp.getOpenId = async function(type = 1, key = 'wechatShop') {

	let userDate = storage.session(key);
	if (userDate) {
		return userDate;
	}
	try {

		let userData = await http.getUserInfo({
			data: {
				shopId: global.getShopId(),
				type: type,
				from: 0
			}
		});

		let users = storage.session('login');
		Object.assign(userData, users);

		let sessionName = key == 'wechatShop' ? 'wechatShop' : 'memberInfo';
		storage.session(sessionName, userData);

		return userData;
	} catch (e) {
		console.log(e);
	}
};


/**
 * 获取商品库存
 * 
 * @param {Function} callback
 * @param {v} failback
 */
orderHttp.getInventoryList = async function() {
	let data = await http.getInventory({
		data: {
			shopId: global.getShopId(),
			code: code
		},
		timeout: 30000
	});
	return {
		type: 'parserInventory',
		data
	};
};
/**
 * 分页获取店铺的商品列表
 */
orderHttp.getGoodsList = async function() {
	// 分页获取商品信息缓存
	orderHttp.goods = [];
	// 获取商品信息分页缓存
	let total = 1;
	let data = await http.getGoodsList({
		data: {
			page: 1,
			shopId: global.getShopId(),
			code: code
		}
	});

	if (data.list.length > 0) {
		orderHttp.goods = data.list;
		total = (data.total == undefined || data.total == 0) ? total : data.total;
		let load = [];
		for (let i = 1; i < total; i++) {
			let obj = {};
			obj.httpId = 'getGoodsList';
			obj.data = {
				page: i + 1,
				shopId: global.getShopId()
			};
			obj.timeout = 15000;
			load.push(obj);
		}

		let dataAll = await http.All(load);
		dataAll.forEach((item) => {
			orderHttp.goods = orderHttp.goods.concat(item.data.list);
		});

		return {
			type: 'parserGood',
			data: orderHttp.goods
		};

	} else {
		return {
			type: 'parserGood',
			data: []
		};
	}
};

orderHttp.categoryArr = null;
// 获取店铺的所有信息(区域、桌台、分类、套餐、口味、退菜原因、支付方式、活动(暂无数据))
orderHttp.getOtherList = async function() {
	let data = await http.getOtherList({
		data: {
			shopId: global.getShopId(),
			code: code
		},
		timeout: 30000
	});

	// fn(data);
	await storage.localData('otherList_' + global.getShopId(), data);

	return {
		type: 'parserOther',
		data
	};

};

/**
 * 加菜
 * 
 * @param {Number} oid 订单oid
 * @param {String} fid 微信会员id
 * @param {String} detail  提交的数据格式
 * @param {Function} callback
 * @param {Function} failback
 * string $_POST['oid'] //
 */
/* eslint-disable-next-line */
orderHttp.newWechatOrder = async function(sendInfo, callback = () => {}, failback = () => {}) {

	try {
		let data = await http.newWechatOrder({
			data: sendInfo,
			shopId: global.getShopId(),
			code: code
		}, true, true);
		callback(data);
	} catch (e) {
		console.log(e);
		if (e.status == 200) {
			store.commit('setWin', {
				title: '订单提交返回数据异常:',
				content: e.message
			});
		} else {
			store.commit('setWin', {
				title: '操作超时，请联系服务员，防止多次下单！',
				content: e.message
			});
		}
		failback(e);
	}


};
/*
 * @param {Function} callback
 * @param {Function} failback
 */
orderHttp.getVerCode = async function() {

	try {
		let data = await http.getVerCode({
			data: {
				shopId: global.getShopId()
			}
		});
		return data;
	} catch (e) {
		return Promise.reject(e);
	}

};

/**
 * @param {String} type // 0为在线点餐，1为自助点餐，2为外卖，3为自提，4为快递 5为在线预约
 * @param {Object} getType // 根据type获取后端需要传递的值
 */
orderHttp.getChannelList = async function() {

	// 获取渠道菜和必点商品
	let type = storage.session('channelType') || (storage.session('selectPayWay') ? storage.session('selectPayWay').type : '5');

	const getType = {
		'0': '7',
		'1': '8',
		'2': '9',
		'3': '10',
		'4': '11',
		'5':'12'
	};


	let data = await http.getChannelList({
		data: {
			shopId: global.getShopId(),
			channel: getType[type] || 7
		}
	});

	return {
		type: 'parserChannelList',
		data: data
	};

};

export default orderHttp;