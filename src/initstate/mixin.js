import http from 'src/manager/http';
import storage from 'src/verdor/storage';
import global from 'src/manager/global';
import utils from 'src/verdor/utils';
import coupon from 'src/module/common/coupon';
class Mixin {
	constructor(Vue) {
		Vue.mixin({
			methods: {
				//获取用户信息
				async getUserInfo(shopId, type = 3) {
					let memberInfo = storage.session('memberInfo');

					if (!memberInfo) {
						let userData = await http.getUserInfo({
							data: {
								shopId: shopId || this.shopId,
								type,
								from: window.navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? 0 : 2, // 2是支付宝 0 公众号 1小程序
							}
						});

						let login = storage.session('login');
						for (let key in login) {
							userData[key] = login[key];
						}

						storage.session('memberInfo', userData);
						storage.session('wechatShop', userData);
						return userData;
					} else {
						return memberInfo;
					}

				},
				/**
				 * 获取openId
				 * @param {String} shopId 默认从全局中获取，可自己传递参数
				 */
				async getOpenId(shopId = global.getShopId()) {
					let openId = storage.session('openId'); // 获取openId
					let code = utils.getQueryString('code') || 'test'; // code
					let payType = utils.getQueryString('payType') || 'wx'; // 默认为微信

					if (openId) {
						return openId;
					} else {
						openId = await http.getOpenId({
							data: {
								'code': code,
								'shopId': shopId,
								'payType': payType
							}
						});
						storage.session('openId', openId);
						return openId;
					}
				},
				filterCoupon(obj) {
					return coupon.filterCoupon(obj);
				},
			}
		});
	}
}

export default Mixin;