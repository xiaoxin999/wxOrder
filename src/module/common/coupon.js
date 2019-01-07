import utils from 'src/verdor/utils';
import global from 'src/manager/global';
import storage from 'src/verdor/storage';

class coupon {

	static filterCoupon({
		goods = [],
		coupon = [],
		totalPrice = 0,
		time = Math.round(new Date().getTime() / 1000),
		showCouponType = true
	}) {

		/**
		 * 过滤可使用优惠券
		 * 
		 * @param {Object} goods 商品和套餐合并数据
		 * @param {Object} coupon 优惠券
		 * @param {String} totalPrice 订单支付金额
		 * @param {String} time 当前时间
		 * @param {String || Boolean} showCouponType 默认全部显示,指定显示某种类型传递参数：'1,2,3'
		 * type类型说明：1.单品减免,2整单减免,3.单品打折,4.整单打折,5.赠菜,6.代金券,7.积分卡券,8.随机立减券,9.
		 */

		let num = 0;
		let weekDay; // 今天是周几
		let today; // 今天是几号
		showCouponType = showCouponType === true ? ['7'] : showCouponType.split(',');

		for (let item of coupon) {
			item.isUsed = 0;
			if (goods.length == 0) {
				item.isUsed = 1;
			}

			/* 适用门店 */
			let avilShopIds = item.shopIds;
			if (avilShopIds != undefined && avilShopIds.indexOf(global.getShopId()) > -1) {
				item.isUsed = 1;
			} else {
				item.isUsed = 0;
				item.unUseReason = '门店不适用';
				continue;
			}

			// 条件1：优惠券在可使用期限内
			// type类型说明:2整单减免，4整单打折，6代金券
			if (Number(item.startTime) < time && Number(item.endTime) > time) {
				item.isUsed = 1;
				// 条件2：实际支付金额大于最低消费
				if (Number(totalPrice) >= Number(item.lowestConsume)) {
					item.isUsed = 1;
				} else {
					item.isUsed = 0;
					item.unUseReason = '未满使用金额';
					continue;
				}
				for (let temp of goods) {

					// 先过滤与菜不关联的优惠券
					// 1 3 5 
					if (item.pids || item.gids) {
						let isUsed = 0;

						// 是否存在可使用优惠券的商品
						let gids = item.gids != null ? item.gids.split(',') : [];
						let pids = item.pids != null ? item.pids.split(',') : [];
						if (gids.length > 0 && temp.goodsName) {
							if (gids.indexOf(temp.id || temp.gid) != -1) {
								isUsed = 1;
							}
						} else {
							if (pids.indexOf(temp.id || temp.pid) != -1) {
								isUsed = 1;
							}
						}
						item.isUsed = isUsed;
						if (isUsed == 0) {
							item.unUseReason = '请先在购物车内添加该商品';
							continue;
						}
					} else {
						item.isUsed = 1;
					}

					// 处理整单打折，整单减免,如果券非强折，至少有一种菜是参与优惠的。
					// 2 4 6
					if (item.type == '2' || item.type == '4' || item.type == '6' || item.type == '8') {
						let isUsed = 0;
						if (item.isDiscount == '0') {
							// 非强折
							if (temp.isDiscount == '1') {
								isUsed = 1;
							}
						} else {
							// 强折
							isUsed = 1;
						}
						item.isUsed = isUsed;
						if (isUsed == 0) {
							item.unUseReason = '没有可参与优惠的商品';
							continue;
						}
					}

					if (item.isUsed) break;
				}

				if (item.isUsed == 0) {
					continue;
				}

				//查看是否过期
				if (typeof item.useTime === 'object' && !utils.isEmptyObject(item.useTime)) {
					// week为周，month为月

					weekDay = utils.format(new Date(Number(Math.round(time * 1000))), 'yyyy-MM-dd');
					today = new Date(weekDay).getDate(); // 今天是几号                                
					weekDay = new Date(weekDay).getUTCDay(); // 今天周几
					let listFirst = item.useTime.list[0];
					let isNextDay = listFirst ? listFirst.isNextDay : false; // 是否隔天
					let startslot, endslot;
					startslot = new Date(Math.round(time * 1000)); //当前时间
					endslot = new Date(Math.round(time * 1000)); //当前时间
					let start = listFirst ? listFirst.startslot.split(':') : []; // 周几什么时间可用
					let end = listFirst ? listFirst.endslot.split(':') : []; // 周几到什么时候不可用
					startslot = startslot.setHours(start[0], start[1]);
					startslot = Math.round(startslot / 1000); // 转换为时间戳
					endslot = endslot.setHours(end[0], end[1]);
					endslot = new Date(endslot);
					endslot = isNextDay ? endslot.setDate(endslot.getDate() + 1) : endslot; //如果隔天的话加上一天
					endslot = Math.round(endslot / 1000); // 转换为时间戳

					if (item.useTime.type == 'week') {
						let weekList = listFirst ? listFirst.week : ''; // 周几可用
						for (let i = 0; i < weekList.length; i++) {
							if (weekList[i] == weekDay && Number(startslot) <= Number(time) && Number(endslot) >= Number(time)) {
								// 今天是否是可使用日期
								item.isUsed = 1;
								break;
							} else {
								item.isUsed = 0;
							}
						}
					} else {
						let weekList = listFirst ? listFirst.month : ''; // 周几可用
						for (let i = 0; i < weekList.length; i++) {
							if (weekList[i] == today && Number(startslot) <= Number(time) && Number(endslot) >= Number(time)) {
								// 今天是否是可使用日期
								item.isUsed = 1;
								break;
							} else {
								item.isUsed = 0;
							}
						}
					}
				}

				if (item.isUsed == 0) {
					item.unUseReason = '不满足使用时段';
				}

			}
		}


		for (let i = 0; i < coupon.length; i++) {

			let item = coupon[i];
			if (showCouponType.indexOf(item.type) == -1) {
				coupon.splice(i, 1);
				i--;
				continue;
			}

			if (item.isUsed) {
				num++;
			}
		}

		storage.session('couponList', coupon);

		// for (let i = 0; i < coupon.length; i++) {

		// 	let item = coupon[i];

		// 	if (item.isUsed) {
		// 		num++;
		// 	} 

		// }

		return num;
	}
}

export default coupon;