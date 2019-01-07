import global,{SQB_WX,SQB_ALI} from 'src/manager/global';
import http from 'src/manager/http';
import storage from 'src/verdor/storage';
import utils from 'src/verdor/utils';
import {
	store
} from 'src/manager/store';


//适配器模式 用来兼容支付宝和微信的平台的API
let plat = window.navigator.userAgent.toLowerCase();
let context = 'pc';
if(plat.indexOf('alipay') > -1){
	context = 'ali';
}
else if(plat.indexOf('micromessenger') > -1){
	context = 'weixin';
}


class WX {

	/**
	 * 支付回调
	 * @param {Object} 支付所需信息
	 * @param {function} 回调函数
	 */

	// payType:{
	// 	1:现金,
	// 	2;  银联,
	// 	3;  微信,
	// 	4;  支付宝,
	// 	5;  会员卡,
	// 	6;  中信微信支付,
	// 	7;  中信支付宝支付,
	// 	10;  微信企业支付,
	// 	23;  上海中信微信,
	// 	24;  上海中信支付宝,
	// 	25;  收钱吧支付宝,
	// 	26;  收钱吧微信
	// }

	// static 
	static _platform(data, callback) {
		
		if (data.payType == '27' || data.payType == '28') {
			window.location.href = data.trade_no;
		} else {
			if (context == 'weixin') {
				/* eslint-disable-next-line*/
				WeixinJSBridge.invoke('getBrandWCPayRequest', data, function(res) {
					let payStatus = (res.err_msg == 'get_brand_wcpay_request:ok');
					callback(payStatus);
				});
			} else if(context == 'ali'){
				/* eslint-disable-next-line*/
				AlipayJSBridge.call('tradePay', {
					tradeNO: (typeof data == 'object') ? data.trade_no : data
				}, function(obj) {

					// 1. 支付成功：
					// ‘9000’：订单支付成功;

					// 2. 支付结果未知(可能已支付成功)：
					// ‘8000’：后台获取支付结果超时，暂时未拿到支付结果;
					// ‘6004’：支付过程中网络出错， 暂时未拿到支付结果;

					// 3. 支付失败或者支付中途退出：
					// ‘7001’：客户端-钱包中止快捷支付;
					// ‘6002’: 普通网络出错;
					// ‘6001’: 用户中途取消;
					// ‘4000’: 订单支付失败;
					// ‘99’: 用户点击忘记密码快捷界面退出(only iOS since 9.5);
					// 其他: 其他支付异常;
					callback(obj.resultCode == 9000 ? true : false);
				});
			}
		}


	}

	/**
	 * 支付调试兼容处理
	 */
	static _pay(data, fn) {

		if (typeof WeixinJSBridge == 'undefined' && context == 'weixin') {
			document.addEventListener('WeixinJSBridgeReady', () => {
				this._platform(data, fn);
			}, false);
		} else if (typeof AlipayJSBridge == 'undefined' && context == 'ali') {
			document.addEventListener('AlipayJSBridgeReady', () => {
				this._platform(data, fn);
			}, false);
		} else {
			this._platform(data, fn);
		}
	}

	/* 
	    payData 调支付接口所使用的数据  或者 当payLink不存在时 直接是调起支付所有的数据
	    payLink http_config中的http id
	    callBack 调支付接口的回调
	    payCallBack 调起api支付弹框的回调
	    isError  是否外界自己处理http的错误
	    isAsync  调用api的是否异步
	*/
	static async goPay({
		payData,
		payLink,
		callBack,
		payCallBack,
		isError = false,
		isAsync = false
	} = {}) {
		let data;


		//如果支付数据和支付链接都传了 则先调用接口返回支付数据
		if (payData && payLink) {
			try {
				data = await http[payLink]({
					'data': payData
				}, true);
			} catch (e) {
				if (isError) {
					(callBack || payCallBack)(e);
				} else {
					store.commit('setWin', {
						content: `${e.error.message}` || '接口报错了,请联系相关人员!'
					});
				}
				return;
			}
		} else {
			data = payData;
		}

		let temp = data;
		let oid = data.oid;
		if( data.hasOwnProperty('jsonData') ){
			temp = data.jsonData;
			oid = data.oid;
		}
		
		if( SQB_WX == temp.payType || SQB_ALI == temp.payType){
			if( payData.sqbData ){
				let d = JSON.parse(payData.sqbData);
				storage.session(`${d.hash}_data`,{oid});
			}
		}
	
		if (!callBack) {
			//不需要自己处理http之后返回的结果 直接将支付调起
			this._pay(data, payCallBack);
		} else {
			//有回调的情况 返回 自己调用
			callBack(data, function() {
				isAsync && WX._pay(data, payCallBack);
			});
			if (!isAsync && data.pay && typeof data.jsonData == 'object' && context == 'weixin') {
				this._pay(data, payCallBack);
			}
		}

	}

	/* 分享给朋友 */
	static onMenuShareAppMessage({
		type = 0,
		link,
		imgUrl,
		title,
		desc
	}) {
		return new Promise((resolve, reject) => {
			let interfaceName = type == 0 ? 'onMenuShareAppMessage' : 'onMenuShareTimeline'; //type:0为分享到给朋友,1分享给朋友圈
			/* eslint-disable-next-line*/
			wx[interfaceName]({
				title, // 分享标题
				desc, // 分享描述
				link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				imgUrl, // 分享图标
				type: 'link', // 分享类型,music、video或link，不填默认为link
				dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
				success: function() {
					// 用户确认分享后执行的回调函数
					resolve('ok');
				},
				cancel: function() {
					// 用户取消分享后执行的回调函数
					reject('fail');
				}
			});
		});
	}


	/* 上传图片 */
	static async uploadImg() {
		let data = await this.getImg();
		return new Promise((resolve, reject) => {
			/* eslint-disable-next-line*/
			wx.uploadImage({
				localId: data, // 需要上传的图片的本地ID，由chooseImage接口获得
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success: function(res) {
					let serverId = res.serverId; // 返回图片的服务器端ID
					resolve({
						serverId,
						localId: data
					});
				},
				fail: function(res) {
					reject(res);
				}
			});
		});

	}

	/* 下载文件 */
	static async download(serverId) {

		return new Promise((resolve, reject) => {
			/* eslint-disable-next-line*/
			wx.downloadImage({
				serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success: function(res) {
					let localId = res.localId; // 返回图片下载后的本地ID
					resolve(localId);
				},
				fail: function(res) {
					reject(res);
				}
			});
		});

	}


	/* 展示图片,直接从本地获取图片 */
	static getLocalImg(localId) {
		return new Promise((resolve, reject) => {
			if (window.__wxjs_is_wkwebview) {
				/* eslint-disable-next-line*/
				wx.getLocalImgData({
					localId, // 图片的localID
					success: function(res) {
						let localData = res.localData;
						resolve(localData); // localData是图片的base64数据，可以用img标签显示
					},
					fail: function(res) {
						reject(res);
					}
				});
			} else {
				resolve(localId);
			}
		});
	}

	/* 从本地选取图片 */
	static getImg() {
		return new Promise((resolve, reject) => {
			/* eslint-disable-next-line*/
			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success: function(res) {
					let localIds = res.localIds[0]; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					resolve(localIds);
				},
				fail: function(res) {
					reject(res);
				}
			});
		});
	}
	// 关闭窗口
	static closeWindow() {
		if (typeof window.WeixinJSBridge === 'object') {
			/* eslint-disable-next-line*/
			WeixinJSBridge.invoke('closeWindow', {}, function(res) {});
		} else if (typeof window.AlipayJSBridge === 'object') {
			/* eslint-disable-next-line*/
			AlipayJSBridge.call('popWindow');
		} else {
			window.location.href = '';
		}
	}
	/* 注册接口 */
	static async registerWXSDK() {
		if (context == 'ali') return Promise.resolve();

		let data = await http.getJsSign({
			data: {
				shopId: global.getShopId(),
				url: window.location.href.split('#')[0],
				type:utils.getQueryString('type')
			}
		});
		return new Promise((resolve, reject) => {


			// debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			// appId: '', // 必填，公众号的唯一标识
			// timestamp: , // 必填，生成签名的时间戳
			// nonceStr: '', // 必填，生成签名的随机串
			// signature: '',// 必填，签名
			// jsApiList: [] // 必填，需要使用的JS接口列表

			let config = {
				debug: false, //生产坏境debug
				// debug: true,                
				jsApiList: ['chooseImage', 'closeWindow', 'uploadImage', 'getLocalImgData', 'onMenuShareAppMessage', 'downloadImage', 'onMenuShareTimeline', 'chooseWXPay', 'scanQRCode']
			};
			Object.assign(config, data);

			/* eslint-disable-next-line*/
			if (process.env.NODE_ENV == 'development') {
				resolve('ok');
			}
			/* eslint-disable-next-line*/
			wx.config(config);
			/* eslint-disable-next-line*/
			wx.ready(function() {
				// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。
				// 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
				resolve('ok');
			});
			/* eslint-disable-next-line*/
			wx.error(function(res) {
				// config信息验证失败会执行error函数，
				// 如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
				console.log(res);
				reject(res);
			});
		});


	}

	/*
	    调用微信sdk支付
	    转移为goPay 
	    不要再用
	 */
	static async pay(data) {

		return new Promise((resolve, reject) => {
			let d = Object.assign(data, {
				timestamp: data.timeStamp
			}, {
				success: (res) => {
					// 支付成功后的回调函数 
					resolve(res);
				},
				error: (err) => {
					reject(err);
				}
			});

			/* eslint-disable-next-line*/
			wx.chooseWXPay(d);
		});

	}

	//微信扫一扫
	static ascanQRCode() {
		return new Promise((resolve, reject) => {
			/* eslint-disable-next-line*/
			wx.scanQRCode({
				needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
				success: function(res) {
					resolve(res);
				},
				error: (err) => {
					reject(err);
				}
			});

		});

	}

}

export default WX;