<template>
	<div class="pay" id="wechatPay" v-if="isReady">
		<div class="pay-box">
			<div class="pay-subhead">基本信息</div>
			<div class="pay-item">
				<div class="fl pay-left">所属店铺</div>
				<div class="fl pay-content">{{shopName}}</div>
			</div>
			<div class="pay-item">
				<div class="fl pay-left">所属位置</div>
				<div class="fl pay-content">{{orderInfo.tableName}}</div>
			</div>
			<div class="pay-item">
				<div class="fl pay-left">下单时间</div>
				<div class="fl pay-content">{{getTranslateTime(orderInfo.createTime)}}</div>
			</div>
		</div>
		<div class="pay-box">

			<template v-if="isAvail">
				<template v-if="member">
					<div class="member_icon pay-member">
						会员卡
						<div class="pay-memberInfo">{{member.name}}（{{member.mobile}}）</div>
					</div>
				</template>
				<template v-else-if="discount && discount.discount">
					<div class="fans_icon pay-member">
						粉丝卡
						<div class="pay-memberInfo">{{fansInfo.name}} <!-- （{{(discount.discount)/10}}折） -->
						</div>
					</div>
					<div class="member_icon pay-member">
						会员卡
						<div class="receive-membership" @click="openMeberPage">立即领取</div>
					</div>
				</template>
			</template>
			<template v-else>
				<div class="fans_icon pay-member">
					粉丝卡
					<div class="pay-memberInfo">{{fansInfo.name}} <!-- （{{(discount.discount)/10}}折） -->
					</div>
				</div>
			</template>
			<template v-if="autoPay == 1 && pointSwitch == 1">
				<div class="integral" v-if="pointConfig.status == '1'">
				<div class="fl" style="width: 26%;">积分抵扣</div>
				<div class="fl" v-if="pointConfig.useMode == '1' && pointData.point > 0" style="width: 53%;text-indent: 0;overflow: hidden;height: 100%;">(已使用{{showPoint}}积分，抵扣{{showPointCash}})元</div>
				<div class="fl" v-if="pointConfig.useMode == '0' && pointData.point > 0 " style="width: 53%;text-indent: 0;overflow: hidden;height: 100%;">(当前{{pointData.point}}积分,可用{{pointData.pointLimit}}积分)</div>
				<div class="fl" v-if="pointData.point <= 0" style="width: 53%;text-indent: 0;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;height: 100%;">(无可用积分)</div>
				<div class="fl integral-tips" @click="isOpenColseWin('open')"></div>
				<div class="fl switch" style="width: 13%;">
					<span :class=" isUserUsePoint ? 'integral-on' : 'integral-off'" @click="switchToggle"></span>
				</div>
				</div>
				<div class="using-integral fl" v-show="isUserUsePoint && pointConfig.useMode == '0'">
					<div class="fl">使用积分</div>
					<input type="number" class="using-input fl" @input='changePoint' v-model="points">
					<div class="fl">可抵扣{{ showPointCash }}元</div>
				</div>
			</template>
			
			<div class="coupon fl" v-if="autoPay == 1 && couponUse == 1">
				优惠券
				<div class="coupon-more">
					<div class="coupons-num" v-if="couponNum >= 1 && isCoupon == false" @click="openCouponPage">{{couponNum}}个可用</div>
					<div v-if="couponNum == 0">无可用优惠券</div>
					<div v-if="isCoupon" @click="openCouponPage" style="color: #ff5d42;">{{couponTypeName}}</div>
				</div>
			</div>
		</div>
		<div class="pay-box">
			<div class="order-subhead borBottom-no">支付方式</div>
			<div class="wechatPay">
				<div class="fl">微信支付</div>
				<span :class="chosePay == '1' ? 'pay-on' : 'pay-off'" @click="chosePayList('1')"></span>
			</div>
			<div class="memberPay" v-if="member && isAvail && autoPay == 1 && storedValuePay == 1">
				<div class="fl">会员支付(余额：{{member.totalAmount}})</div>
				<span :class="chosePay == '2' ? 'pay-on' : 'pay-off'" @click="chosePayList('2')"></span>
			</div>
		</div>
		<div class="pay-box">
			<div class="order-subhead">点菜详情</div>
			<!--商品-->
			<template v-for="(goods,index) in goodsList">
				<div class="pay-item" :key='index'>
					<div class="fl" style="height: 100%;width: 60%;line-height: 1.5;" v-if="goods.attr && goods.attr.length >= 1">
						<div class="pay-goodsName fl" :class="setGoodsClass(goods)" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							<img  class="icon"   v-if="goods.isSpecial" src="../../../res/images/special_icon.png" alt="">
							<img  class="icon"   v-if="goods.isMust" src="../../../res/images/must.png" alt="">
							<span>{{goods.goodsName}}</span>
						</div>
						<div class="pay-goodsName fl" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;color: #777;">
							<template v-for="attr in goods.attr">
								{{attr.name}}
							</template>
						</div>
					</div>
					<div class="pay-goodsName fl" :class="setGoodsClass(goods)" v-else>
						<img  class="icon"   v-if="goods.isSpecial" src="../../../res/images/special_icon.png" alt="">
						<img  class="icon"   v-if="goods.isMust" src="../../../res/images/must.png" alt="">
						{{goods.goodsName}}
					</div>
					<div class="pay-num fl">×{{getInt(goods.num)}}</div>
					<div class="fl" :class="setGoodsClass(goods,'1')" v-if="goods.unitPrice == goods.price">￥{{getInt(goods.price)}}</div>
					<div class="fl" :class="setGoodsClass(goods,'1')" v-if="goods.unitPrice != goods.price && goods.freeNum > 0 || goods.returnNum > 0">￥{{getInt(goods.unitPrice)}}</div>
					<div class="discount-price fl" v-if="goods.unitPrice != goods.price && goods.freeNum == 0 && goods.returnNum == 0 ">
						<template v-if="Number(getInt(goods.price)/getInt(goods.num)) == Number(goods.unitPrice)">
							<div class="fl onPrice">￥{{Number(goods.unitPrice)}}</div>
						</template>
						<template v-else>
							<div class="original-cost fl">￥{{Number(goods.unitPrice).toFixed(2)}}</div>
							<div class="discount-prices fl">￥{{Number(getInt(goods.price)/getInt(goods.num)).toFixed(2)}}</div>
						</template>
					</div>
				</div>
			</template>

			<!--套餐-->
			<template v-for="(packages,index) in packageList">
				<div class="pay-item" :key='index'>
					<div class="pay-goodsName fl" :class="setGoodsClass(packages)">
						<img  class="icon"   v-if="packages.isSpecial" src="../../../res/images/special_icon.png" alt="">
						<img  class="icon"   v-if="packages.isMust" src="../../../res/images/must.png" alt="">
						<span>{{packages.packageName}}</span>
					</div>
					<div class="pay-num fl">×{{getInt(packages.num)}}</div>
					<div class="fl" :class="setGoodsClass(packages,'1')" v-if="packages.unitPrice == packages.price">￥{{getInt(packages.price)}}</div>
					<div class="fl" :class="setGoodsClass(packages,'1')" v-if="packages.unitPrice != packages.price && packages.freeNum > 0 || packages.returnNum > 0">￥{{getInt(packages.unitPrice)}}</div>
					<div class="discount-price fl" v-if="packages.unitPrice != packages.price">
						<div class="original-cost fl">￥{{getInt(packages.unitPrice)}}</div>
						<div class="discount-prices fl">￥{{getInt(packages.price)}}</div>
					</div>
				</div>
				<div class="pay-package" v-for="(goods,indexs) in packages.goods" :key="index_+'_'+indexs">
					<div class="package-goods">
						<div class="pay-goodsName fl">
							{{goods.name}}
							<template v-for="attr in goods.attr">
								<template v-for="options in attr.options">
									<template v-if="options.attrStatu">
										({{options.name}})
									</template>
								</template>
							</template>
						</div>
						<div class="pay-goodsNum fl">×{{getInt(goods.num)}}</div>
					</div>
				</div>
			</template>
		</div>
		<div class="pay-bottom">
			<span class="fl">
				<span class="needPay">待支付&nbsp;{{Number(orderDetail.price).toFixed(2)}}</span>
				<span class="prePrice">|&nbsp;优惠&nbsp;￥{{Number(prePrice).toFixed(2)>0?Number(prePrice).toFixed(2):0}}</span>
			</span>
			<a href="javascript:void(0)" class="fr pay-btn" @click="weChatOnlinePay">去支付</a>
		</div>
		<!-- <div class="pay-btns" @click="weChatOnlinePay">立即支付￥{{orderDetail.price}}</div> -->
		<transition name="fade">
			<win v-if="isIntegralWin" @winEvent="closeWin" :height="'auto'" :type="'alert'" :ok="{content: '关闭'}">
				<div slot="content" class="integral-box">
					<div class="integral-header">积分使用规则</div>
					<div class="integral-content">
						<ul>
							<li>积分抵扣比例为{{pointConfig.point}}:{{pointConfig.pointCash}}</li>
							<li v-if="pointConfig.maxRule == '1' || pointConfig.maxRule == '2'">积分抵扣最多为订单金额{{pointConfig.pointCash}}%</li>
							<li v-if="pointConfig.maxRule == '3' && points >= pointConfig.point ">积分抵扣最多为{{pointData.pointLimit / pointConfig.point * pointConfig.pointCash}}元</li>
							<li v-if="points >= pointConfig.point ">最多可使用积分{{pointData.pointLimit}}</li>
						</ul>
					</div>
					<!-- <div class="integral-footer" @click="isOpenColseWin">关闭</div> -->
				</div>
			</win>
		</transition>
	</div>
</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';
	import global, {
		SQB_WX,
		SQB_ALI
	} from 'src/manager/global';

	let payType = utils.getQueryString('payType') || 'wx';
	let wx_sdk = null;
	let baseInfo = {};
	export default {
		data() {
			return {
				isAvail: false,
				discount: {},
				fansInfo: {
					name: storage.session('wechatShop') ? storage.session('wechatShop').name : ''
				},
				userConfig: {}, //用户配置
				orderDetail: {}, //订单详情
				goodsList: [], //商品
				packageList: [], //套餐
				pointConfig: {}, //积分抵扣配置
				pointData: {}, // 积分可用配置
				points: 0, // 使用的积分
				totalPrice: '', //订单初始价格
				jsonData: {}, // 支付json数据
				chosePay: 1, // 支付方式：1为微信支付，2为会员支付
				couponNum: 0, // 优惠券可用数量
				orderInfo: storage.session('orderDetail'),
				shopName: storage.session('wechatShop') ? storage.session('wechatShop').shopName : '', // 店铺名称
				member: storage.session('wechatShop') ? storage.session('wechatShop').member : '', // 会员信息
				couponoObj: (storage.session('couponOn') == undefined) ? {} : storage.session('couponOn'), //选中的优惠券信息
				noIntegral: true, // 是否可使用积分
				couponPrice: 0, //使用优惠券减免的金额
				isCouponPrice: true, // 默认无优惠劵
				couponTypeName: '', //使用优惠券减免的类型金额
				isCoupon: false, //是否存在已经使用的优惠券
				isIntegralWin: false, //是否打开积分规则弹窗
				isPay: true,
				commentConfigData: null,
				jumpCode: '',
				channels: [],
				brandId: null,
				isReady: false,
				oid: 0,
				fn: null,
				showPoint: 0, //展示用的积分使用数量 和  积分抵扣数量
				showPointCash: 0,
				pointLimit: 0,
				isUserUsePoint: false,
				couponList: [],
				prePoint:0,
				autoPay:0,
				couponUse:0,
				pointSwitch:0,
				storedValuePay:0
			};
		},
		computed: {
			prePrice() {
				return this.orderDetail.originalPrice - this.orderDetail.price;
			}
		},
		methods: {
			changePoint() {
				if (this.points > this.pointLimit) {
					this.$store.commit('setWin', {
						content: '超出最大使用积分'
					});
					return;
				}
				this.fn();
			},
			closeWin() {
				this.isIntegralWin = false;
			},
			parseGood() {
				this.totalPrice = this.orderDetail.price;
				let data = this.orderDetail;
				this.noIntegral = (data.point > 0) ? false : true;
				this.isCouponPrice = utils.isEmptyObject(data.couponDetail);
				if (!utils.isEmptyObject(data.couponDetail) && storage.session('couponOn') == undefined && storage.session('cleanCoupon') == undefined) {
					this.couponoObj = data.couponDetail;
					this.couponoObj.isUsed = true;
					this.isCoupon = true;
					this.couponPrice = data.couponDiscount;
					this.couponTypeName = this.getCouponType(data.couponDiscount, data.couponDetail);
					storage.session('couponOn', this.couponoObj);
				}
				this.goodsList = this.filterGoodsNum(data.orderDetail.goods);
				this.packageList = this.filterGoodsNum(data.orderDetail.package);

				let arr = this.goodsList;
				if (arr.length > 0) {
					for (let i = 0; i < arr.length; i++) {
						global.getAvailPrice(arr[i]);
						arr[i].id = arr[i].gid;
						if (arr[i].attr) {
							for (let j = 0; j < arr[i].attr.length; j++) {
								if (arr[i].attr[j].name) {

									for (let k = 0; k < arr[i].attr[j].name.length; k++) {
										arr[i].attr[j].attrPrice = [];
										arr[i].attr[j].attrPrice.push(arr[i].attr[j].name[k].split(':'));
										arr[i].attr[j].name[k] = String(arr[i].attr[j].name[k].replace(':', '￥'));
									}
								}
							}
						}
					}
				}
				console.log(arr);
				let arrs = this.packageList;
				if (arrs.length > 0) {
					for (let i = 0; i < arrs.length; i++) {
						global.getAvailPrice(arrs[i]);
						arrs[i].id = arrs[i].pid;
					}
				}


				storage.session('goods', arr);
				storage.session('packages', arrs);
				let packages = utils.deepCopy(this.packageList);
				let goods = utils.deepCopy(this.goodsList);
				goods.concat(packages);
				this.filterCou(goods, this.orderDetail.price);
			},
			async showOrderDetail() {
				// 获取订单详情
				let data = null;
				try {
					data = await http.orderDetailPay({
						data: {
							oid: this.orderInfo.oid,
							memberId: this.userConfig.memberId,
							shopId: this.shopId
						}
					}, true);
					this.orderDetail = data;
					let orderConfig = data.orderConfig;
					this.autoPay = orderConfig.autoPay;
					this.couponUse = orderConfig.couponUse;
					this.pointSwitch = orderConfig.pointSwitch;
					this.storedValuePay = orderConfig.storedValuePay;

					this.parseGood();
					await this.getPointConfig();
					this.isReady = true;
				} catch (e) {
					this.$store.commit('setWin', {
						content: `${e.error.message}`,
						callBack: () => {
							this.$closeWindow();
						}
					});
				}

				await this.preComputing();
			},
			async getPointConfig() {
				let price, amount;
				if (this.couponPrice > 0) {
					amount = (parseFloat(this.totalPrice) - parseFloat(this.couponPrice));
					price = (amount > 0) ? amount : 0;
				} else {
					price = parseFloat(this.orderDetail.price);
				}

				// 获取积分规则配置
				let data = await http.getPointConfig({
					data: {
						shopId: this.shopId,
						price: price <= 0 ? 0 : price
					}
				});
				this.pointConfig = data.pointConfig;
				this.pointConfig.switchs = Boolean(parseInt(this.pointConfig.useMode));
				this.pointData = data.userData;
				this.points = data.userData.pointLimit;
				if (this.pointConfig.switchs) {
					// this.points = 0;
					this.isUserUsePoint = true;
				}
				this.isCoupon = !utils.isEmptyObject(this.couponoObj); // 执行过getPointConfig，存在优惠券isCoupon为true
			},
			async preComputing() {
				// 预算订单价格
				let point = this.points;
				// if (storage.session('couponOn')) {
				// 	point = 0;
				// }
				let data = await http.preComputing({
					data: {
						shopId: this.shopId,
						point: this.isUserUsePoint ? point : 0,
						tableId: this.orderInfo.tableId,
						memberId: this.userConfig.memberId,
						oid: this.orderInfo.oid,
						code: this.couponoObj.code,
						originalPrice: this.orderDetail.originalPrice,
						odid: storage.session('odid')
					}
				});

				this.orderDetail.price = data.price;

				this.couponPrice = data.couponDiscount;
				this.couponTypeName = this.getCouponType(data.couponDiscount, data.couponDetail);
				this.showPoint = data.point;
				this.showPointCash = data.pointCash;
				// this.getPointConfig();
				this.pointData.pointLimit = this.pointLimit = data.pointLimit;
				this.points = data.point;

				this.orderDetail = data;
				this.parseGood();
			},
			loginWechat: function() {
				// 获取用户数据
				this.userConfig = storage.session('wechatShop');
				this.showOrderDetail();
				this.getUserInfo();
			},
			async getUserInfo() {
				// 获取用户信息
				let {
					shopList
				} = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: 5,
						from: 0,
					}
				});

				this.brandId = shopList.filter((item) => {
					return item.id == this.shopId;
				})[0].brandId;
			},
			async getCouponList() {
				// 获取优惠券列表

				let data = await http.getCouponList({
					data: {
						shopId: this.shopId,
						type: 1,
						code: this.couponoObj.code,
						page: 1,
						num: 10000
					}
				});
				this.couponList = data.list;

			},
			filterCou(goods, totalPrice) {
				let orderInfo = {
					'goods': goods,
					'totalPrice': totalPrice,
					'coupon': this.couponList,
					'showCouponType': '1,2,3,4,5,6,8,9,10,11'
				};
				storage.session('orderInfo', orderInfo);
				this.couponNum = this.filterCoupon(orderInfo);
			},
			async weChatOnlinePay() {
				// 支付订单
				let type = (this.chosePay == 2) ? '5' : payType;
				let paymentName = (this.chosePay == 2) ? '会员支付' : '微信支付';
				if (!this.isPay) return false;
				this.isPay = false;

				let data = null;
				try {
					data = await http.weChatOnlinePay({
						data: Object.assign(type == 5 ? {
							payType: type
						} : {}, {
							shopId: this.shopId,
							tableName: this.orderInfo.tableName,
							tableId: this.orderInfo.tableId,
							data: JSON.stringify(this.orderDetail.orderDetail),
							paymentName: paymentName,
							couponId: this.couponoObj.couponId,
							oid: this.orderInfo.oid,
							code: this.couponoObj.code,
							couponType: this.couponoObj.type,
							openId: this.userConfig.openId,
							memberId: this.userConfig.memberId,
							originalPrice: this.orderDetail.originalPrice,
							point: this.isUserUsePoint ? this.points : 0,
							odid: storage.session('odid')
						})
					}, true);

					if (data.pay && data.jsonData.payType == SQB_WX || data.jsonData.payType == SQB_ALI) {
						storage.session('table_pay_oid', data.oid);
					}

					this.isPay = true;

					this.jsonData = data.jsonData;
					this.noIntegral = false; //提交订单后不允许修改积分

					if (data.pay && (type == '5' || data.jsonData === true)) {
						this.$store.commit('setWin', {
							content: '支付成功',
							callBack: () => {
								this.paySucess(data);
							}
						});
						return false;
					} else if (data.pay && typeof data.jsonData == 'object') {
						wx_sdk.goPay({
							payData: this.jsonData,
							payCallBack: (res) => {
								if (res) {
									this.paySucess(data);
								} else {
									let _this = this;
									this.$store.commit('setWin', {
										content: '支付失败',
										callBack: () => {
											_this.$closeWindow();
										}
									});
								}
							}
						});
						return false;
					} else if (data.pay && data.jsonData == '' && payType == 'wx' || payType == 'zx') {

						this.$store.commit('setWin', {
							content: '支付成功',
							callBack: () => {
								this.paySucess(data);
							}
						});
						return false;
					}
				} catch (e) {
					this.$store.commit('setWin', {
						content: `${e.error&&e.error.message||'有错误'}`
					});
					this.isPay = true;
				}
			},
			filterGoodsNum: function(arr) {
				// 处理商品数量
				if (arr && arr.length > 0) {
					for (let i = 0; i < arr.length; i++) {
						if (arr[i].returnNum > 1) {
							arr[i].num = arr[i].returnNum;
						}
						if (arr[i].freeNum > 1) {
							arr[i].num = arr[i].freeNum;
						}
						arr[i].num = Number(arr[i].num);
					}
				} else {
					arr = [];
				}
				return arr;
			},
			getTotalPrice: function(goods, packages) {
				// 计算订单实际总价格
				let totalPrice = 0;
				goods = storage.deepCopy(goods.concat(packages));

				goods.forEach(function(item) {
					if (item.freeNum >= 1) {
						// 减除赠品数量和计算实际价格
						item.num = item.num - item.freeNum;
						item.price = item.price - (parseInt(item.freeNum) * parseInt(item.unitPrice));
					}
					if (item.returnNum >= 1) {
						// 减除退品数量和计算实际价格
						item.num = item.num - item.returnNum;
						item.price = (parseInt(item.returnNum) * parseInt(item.unitPrice));
					}
					totalPrice += parseInt(item.price);
				});

				return totalPrice;
			},
			openMeberPage: function() {
				// 打开会员注册页面
				storage.session('wechatPay', true);
				storage.session('brandId', this.brandId);
				storage.session('type', 2);
				this.$router.push({
					path: '/memberRegister',
					query: {
						'type': 2
					}
				});

			},
			openCouponPage: function() {
				// 进入使用优惠券页面
				if (this.couponNum) {
					this.$router.push({
						path: '/chooseCoupon',
						query: {
							'type': 2
						}
					});
				}
			},
			isOpenColseWin: function() {
				// 关闭 and 打开积分规则弹窗
				this.isIntegralWin = true;
			},
			getCouponType: function(couponDiscount, couponDetail) {
				let odid = storage.session('odid');
				// let odids = storage.session('odids');
				let param;
				if (couponDetail.type == '1' || couponDetail.type == '2' || couponDetail.type == '8') {
					param = '-' + '￥' + couponDiscount;
				} else if (couponDetail.type == '3') {
					param = this.getGoodsName(odid) + (parseFloat(couponDetail.param) / 10) + '折';
				} else if (couponDetail.type == '4') {
					param = (parseFloat(couponDetail.param) / 10) + '折';
				} else if (couponDetail.type == '6') {
					param = '-' + '￥' + couponDiscount;
				} else if (couponDetail.type == '5') {
					param = '赠' + '' + '';
					param = param + this.getGoodsName(odid);
				} else if (couponDetail.type == '11') {
					param = '定额券抵' + this.couponPrice + '元';
				} else if (couponDetail.type == '10') {
					param = '买送券抵' + this.couponPrice + '元';
				} else if (couponDetail.type == '9') {
					if (couponDetail.discountType == 1) {
						param = '第二件商品' + (parseFloat(couponDetail.param) / 10) + '折';
					} else if (couponDetail.discountType == 2 || couponDetail.discountType == 3) {
						param = '第二件商品优惠' + this.couponPrice + '元';
					}
				}
				return param;
			},
			getGoodsName: function(odid) {
				/*
				 * type为1则为优惠券单品折扣
				 */

				// 获取赠菜商品名
				let goods = this.goodsList.concat(this.packagesList);
				for (let i = 0; i < goods.length; i++) {
					if (goods[i].odid == odid) {
						return (goods[i].goodsName || goods[i].packageName);
					}
				}
			},
			getTranslateTime: function(time) {
				// 转换时间格式
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd hh:mm');
			},
			getInt: function(int) {
				// 转换数字格式
				return parseFloat(int);
			},
			switchToggle: function() {
				// 切换积分使用状态			
				// if (this.noIntegral == false) {
				// 	return false;
				// }
				this.isUserUsePoint = !this.isUserUsePoint;
				if (this.pointConfig.useMode == '1' && this.isUserUsePoint) {
				// if (!this.isUserUsePoint) {
					this.points = this.prePoint;
				
				}
				this.fn();
				this.prePoint = this.points;
				// } 
				// else {
				// 	this.points = this.pointConfig.switchs ? this.points : 0;
				// }
				// this.pointConfig = utils.deepCopy(this.pointConfig);
			},
			chosePayList: function(type) {
				// 选择支付方式类型：1为微信，2为会员
				this.chosePay = type;
			},
			setGoodsClass: function(goods, type) {
				/*
				 * type：默认为商品名 1为商品价格
				 * goods：商品或套餐
				 */

				let className;
				if ((goods.freeNum | 0) >= 1) {
					// 赠菜
					className = (type === undefined) ? 'present-goods' : 'gift-price';
				} else if (goods.price != goods.unitPrice && goods.returnNum == 0) {
					// 折扣菜
					className = (type === undefined) ? 'discount-goods' : 'discount-price';
				} else if (goods.price != goods.unitPrice && goods.returnNum > 0) {
					// 退菜
					className = (type === undefined) ? 'return-goods' : 'gift-price';
				} else {
					if (goods.isVip == '1' || goods.isVip == '2' && this.userConfig.member) {
						className = (type === undefined) ? '' : 'vip-price';
					} else {
						className = (type === undefined) ? '' : 'pay-price';
					}
				}

				return className;
			},
			//支付成功的回调
			paySucess(data, channel = 1) {
				//关闭微信游览器
				storage.localData(`order_cache_${global.getShopId()}`, null);

				if (this.getcommentConfig(data, channel)) {
					global.evalObj = {
						oid: this.orderInfo.oid,
						type: 1
					};
					this.$router.push('/evaluate');
				} else {
					this.$closeWindow();
				}

			},
			//判断是否需要往评价页面跳转
			getcommentConfig(data, channel) {
				let comment = null;
				let commentConfigData = data.commentConfigData;
				if (commentConfigData && commentConfigData.status == 1) {

					this.channels = commentConfigData.channels.split(',').map((item) => {
						return Number(item);
					});
					if (this.channels.indexOf(channel) > -1) {
						comment = true;
						global.evalObj = {
							oid: data.oid,
							type: 1,
							shopName: this.shopName
						};
						storage.session('commentConfigData', commentConfigData);
					}
				}
				return comment && commentConfigData.jumpCode == '0';
			}
		},
		async mounted() {
			this.loginWechat();

			await this.getCouponList();
			utils.setTitle('在线支付');
			baseInfo = global.getBaseInfo();
			this.isAvail = baseInfo.isAvail;
			this.discount = baseInfo.discount;


			let oidStatus = storage.session('table_pay_oid');
			this.oid = oidStatus;
			let comm = storage.session('commentConfigData');
			if (oidStatus) {
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: oidStatus
					}
				});
				if (d) {
					this.paySucess({
						commentConfigData: comm
					}, 1);
				} else {
					this.$store.commit('setWin', {
						content: '支付失败'
					});
				}
				storage.session('table_pay_oid', null);
			}

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;
			this.fn = utils.throttle(this.preComputing, 500, this);

		},
		components: {
			'win': () =>
				import( /* webpackChunkName: 'win' */ 'src/components/phone/win')
		}
	};
</script>

<style scoped>
	.pay,
	.pay-box {
		width: 100%;
		height: auto;
		overflow: hidden;
	}

	.pay {
		min-height: 100%;
		background-color: #efefef;
		padding-bottom: 1.33333rem;
	}

	.pay-box {
		background-color: #ffffff;
		margin-bottom: 0.13333rem;
	}

	.order-subhead{
		width: 100%;
		height: 0.5333rem;
		line-height:  0.5333rem;
		text-indent: 0.4rem;
		background-color: rgb(240,240,240);
		font-size: 0.32rem;
		color: #888888;
	}
	
	.pay-subhead{
		width: 100%;
		height: 1.4rem;
		text-indent: 0.56rem;
		line-height: 1.4rem;
		font-size: 0.45333rem;
		color: #333333;
		border-bottom: 0.01333rem solid #e5e5e5;
		position: relative;
	}

	.pay-subhead:after{
		width: 0.09333rem;
		height: 0.4rem;
		content: "";
		position: absolute;
		left: 0.32rem;
		top: 50%;
		-webkit-transform: translate(0, -50%);
		-ms-transform: translate(0, -50%);
		transform: translate(0, -50%);
	}

	.pay-subhead:after {
		background-color: #f5a623;
	}

	.order-subhead:after {
		background-color: #6ba9f0;
	}

	.pay-item {
		margin-left: 0.4rem;
		width: calc(100% - .4rem);
		height: 1.2rem;
		line-height: 1.2rem;
		font-size: 0.37333rem;
		border-bottom: 0.01333rem solid #e5e5e5;
	}

	.pay-item:last-child {
		border-bottom: none;
	}

	.pay-left {
		width: 3.33333rem;
		height: 1.13333rem;
		color: #333333;
	}

	.pay-content {
		width: 5.33333rem;
		height: 1.13333rem;
		color: #888888;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.present-goods {
		background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE4Njc2QkQyOTg1MTExRTc5QTA3QjZERTI3QzdGRjhDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE4Njc2QkQzOTg1MTExRTc5QTA3QjZERTI3QzdGRjhDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTg2NzZCRDA5ODUxMTFFNzlBMDdCNkRFMjdDN0ZGOEMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTg2NzZCRDE5ODUxMTFFNzlBMDdCNkRFMjdDN0ZGOEMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz59zzq5AAACPUlEQVR42mKMajjLAASqQNwBxC5AzMdAG/AJiPcAcQUQ32YBEupAfAKIBRhoC0AeCgJiJyC2YAISbXSwFBmA7GpjggYvvYEbEw3jFB/gYaJEd16oIoOOEi+KmLmWIENlrCpBvSzYBCNcpBkUJbmwamhffBvOfvX+F9iiK/c+w8UUpbgY7j//RtBirD4GWXrl3ieGzUdfwDGIj+67fWffMJhrC6L5WIDh5NX35PkYBECuBvkE5IhX73+iyIGCEtkRS+uNUORb0jTANEg/cggRZTFysIN8jC3IkYMYZHl04zk4H+QwX2sJ0oKaWOBkLIKRFkB8kGPJimNiwdfvfzHiGOTTr9//0Nbik9feYyQ4UCiAEh1NLQaBuZsfofAnrb7P8PXHX/JTNTGJDhTU6KkdBrg5mTHkKbZ4xZ6nYIORAbaUj89isoIalMfxGYqsjmwfiwmygfMreiICBTW6GDpAztdkWMyOUw69EEHOUoQqCiZc2QRUAYAKA1hwgfiguKUWwOpjWD70tRZnuP/sGwM3BzO4vN589CXOVEwVi5ELgxV7njH42kiALZ+75RFtgxrmW1BBAAr2zUdegOvZZB852gY1yFKQL9sXQao0kANA7P58HXCcw6KCqkENCl5QwQ+yCDkfgiyftPoeSv6lJKgZgQ36/+S4GNZAwFYug9IDKGqwOQrZx5/IaWniK5VAjsFnKRB8YYJ2K+gNdoEsrgbiD3S0FGRXNcjiG6C+DBCvA+LPNLTwM9QOkF03AAIMAGTC8qgAAtWCAAAAAElFTkSuQmCC") left center no-repeat;
		background-size: 0.4rem 0.4rem;
		padding-left: 0.6rem;
	}

	.discount-goods {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0FBNDdEOTg1MTExRTc4MjlEOEMxRTRGNDY0QTgwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFCN0FBNDdFOTg1MTExRTc4MjlEOEMxRTRGNDY0QTgwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUI3QUE0N0I5ODUxMTFFNzgyOUQ4QzFFNEY0NjRBODAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUI3QUE0N0M5ODUxMTFFNzgyOUQ4QzFFNEY0NjRBODAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7Bm/AxAAACFUlEQVR42rxXTUsCURS9TgMJSgpCikEGEkaLaqfYIohwXW5a9T8CN67EfkE/oFWbWidt2ljtskUYYdQiaAJBU0HBqHuejk3QqOV7c+DMF8Oc9+659743rmj+mxiLzDxzizlDavDOPGfuMx90PsSYV0w/qQUmlGZuMhMaH3IOiFoBrZzWD6/TSGkKPR0GrzbqjeXdLPkWVv/0VU8oSvMbe+JsB32SYetur/i47vaQ2x8iTzDKg1wRz6vlojhLFUYEEAmgXTOoU3sV55ZRIaNUoPpTafSgJ5nx5cHO/6Nl56vVrwj71Y33RJ4vjqRk16/C9efbwfU0e9d8rVCnboj7j3ZzqHcTCb9cnXz7GVmh6n3xh28YjBLhcWG1xA6wpsURkypstcSMDqLxxpltAtZMNGO3P0iBpXWqWUJutWQgbvP8z8JIpDnOaNSucVPgmjVIDylILswMIuhCgaWkEMYMHs8ORZMwYb3+D7Tf+mw4nqYue3N3nBXZDC+tQl5+B91K6ozRY8FhmPYFRW1LnfG4vdpsKI4JIwfAUVGRLjy7mhK+d23qU4kwMjy4lhItVEnL7C3uXrHAw8+X61PxPMz1jDpGPSsRDsSSNJfolRREzAXCz4OocD3LgIs39J+ydnBIuimOVGuMUtP7O3wpO81ekxmrzJpa/7fCaRQgnGHWHBSFVgbCZfzLMLGWNRQKNvoa0Cp/CTAAWmi3gV1aLQwAAAAASUVORK5CYII=) left center no-repeat;
		background-size: 0.4rem 0.4rem;
		padding-left: 0.6rem;
	}

	.return-goods {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzlCODFCNjBBODE0MTFFN0I3QUI5QUVBOTZGNEVGOTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzlCODFCNjFBODE0MTFFN0I3QUI5QUVBOTZGNEVGOTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozOUI4MUI1RUE4MTQxMUU3QjdBQjlBRUE5NkY0RUY5MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozOUI4MUI1RkE4MTQxMUU3QjdBQjlBRUE5NkY0RUY5MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps+kbSQAAAJ4SURBVHjavJc9ayJRFIZPhhQiiwhiRKJ2so02SmARbHSxERHEQrAQ/BMupA/6JwQLwUIE0WrVSpAFS1GCYmWCiviBWRSr3ftenKxfqybO+MIZ78zIPPece865MzfxeJyYzMww+M5MRfJozqzM7Aezzi07fGX2i5ma5BUcCjBzMfsmsMPTFaCbAutJWIf32vIIMq7pMX0RDl1VKpX08PAgK/n20EW73U4Oh4N0Oh0Vi8Wte+FwmAwGw8kHv7y8UDqd/hi4Wq2SQqEgm83Gz3fho9GI/+d/CgQCn/MYKpVKNJvNyOVy7cFXqxV1Oh3pQy2qXq+TWq3mE9iUVqvlIZcNLHp+teQ6JazxscSJxWIfB6OU7u/vt669vr7SYrH41/tUKnI6ndJ6DOhuVuZyua1kAhjlJikYgEQiwcdms/lgaZyqUTFyxyRcMms8PBqN8rBvgtD1QqEQaTQaaZNLFNYdEULYLRYLlctlXn6o/WazSePxWB6w2OVarRb5/f73ZQF0t9tJGmpR8CyZTFKtVuPnd3d3J9f40x5jo9Dr9XwjMRqNPMzwHl3O7XZTJBKhQqHAE/FiMLJc3JnEljmfz6nX69FyueTnjUaDptMpBYNB8vl8lEqltnrASTAAXq+Xj5G1aCKTyYS63S4Nh0MaDAZ7jWWz3LLZLI/IofvQDXvL/HMIihnDG4RP7FIYX7orHfXY4/Hw33w+zxMHnqEukbWYDOxctdttvsud1auhSqXyXocIF7LWarXyOjWZTGeD+/3+eR4DkslkDq4NEkcqCes3/D24zPotrD8rrq2fAD8ym10RCtYjwM/4lsG2y+xNRuDbmgHW818BBgBl9wUWk7FM/AAAAABJRU5ErkJggg==) left center no-repeat;
		background-size: 0.4rem 0.4rem;
		padding-left: 0.6rem;
	}

	.discount-goods,
	.present-goods,
	.pay-goodsName {
		width: 60%;
		height: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.pay-goodsName img{
		width:0.4rem;
		vertical-align: middle;
	}
	.pay-num {
		color: #bbbbbb;
		font-size: 0.37333rem;
		font-weight: 700;
		width: 15%;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.gift-price,
	.pay-price,
	.discount-price,
	.vip-price {
		color: #888888;
		font-size: 0.37333rem;
		text-align: center;
		width: 25%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.gift-price,
	.original-cost {
		text-decoration: line-through;
	}

	.onPrice {
		width: 100%;
	}

	.original-cost {
		width: 100%;
		height: 0.8rem;
		line-height: 0.8rem;
	}

	.discount-prices {
		width: 100%;
		height: 0.4rem;
		line-height: 0.13333rem;
	}

	.pay-btns {
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		text-align: center;
		font-size: 0.42667rem;
		color: #ffffff;
		position: fixed;
		left: 0;
		bottom: 0;
		background-color: #ffbd2f;
	}

	.member_icon {
		background: url('../../../res/images/member-icon.png') 0.37333rem center no-repeat;
	}

	.fans_icon {
		background: url('../../../res/images/fans_icon.png') 0.37333rem center no-repeat;
		background-size: 0.6rem 0.6rem;
	}

	.pay-member {
		width: 100%;
		height: 1.28rem;
		line-height: 1.28rem;
		text-indent: 1.06667rem;
		font-size: 0.37333rem;
		color: #333333;

		background-size: 0.54667rem 0.49333rem;
		position: relative;
	}

	.receive-membership {
		width: 2.33333rem;
		height: 0.74667rem;
		margin: 0.26667rem 0rem;
		margin-right: 0.42667rem;
		line-height: 0.74667rem;
		text-indent: 0;
		text-align: center;
		color: #ffffff;
		background-color: #ffbd2f;
		border-radius: 0.13333rem;
		font-size: 0.37333rem;
		float: right;
	}

	.pay-bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		background:white;
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		padding-left: 0.4rem;
		font-size: 0.42667rem;
		color: #888888;
		box-shadow: 0 0 5px 0 #F1F1F1;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.pay-bottom .needPay{
		font-family: PingFangSC-Medium;
		font-size: 0.48rem;
		color: #FF2035;
		font-weight: bold;
	}
	.pay-bottom .prePrice{
		font-size: 0.3733rem;
	}

	.pay-bottom .preferential {
		color: #DFDFDF;
		margin-left: 0.13333rem;
		font-size: 0.34667rem;
	}

	.pay-bottom p {
		font-size: .4267rem;
		color: #ffffff;
		text-align: center;
		margin-left: .4rem;
	}

	.pay-btn {
		width: 2.8rem;
		height: 1.33333rem;
		font-size: 0.42667rem;
		text-align: center;
		background-image: linear-gradient(-90deg, #FEC205 0%, #FCAE02 100%);
	}

	.coupon,
	.integral,
	.wechatPay,
	.memberPay {
		width: 100%;
		height: 1.2rem;
		line-height: 1.2rem;
		text-indent: 1.06667rem;
		font-size: 0.37333rem;
		color: #333333;
		position: relative;
		border-top: .0133rem solid #e5e5e5;
	}

	.coupon {
		background: url('../../../res/images/coupon.png') 0.37333rem center no-repeat;
		background-size: 0.4rem 0.4rem;
	}

	.integral {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBFODZENjAyOTg1MTExRTdCMjBDRjQzQzYxQjk3MkQ5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBFODZENjAzOTg1MTExRTdCMjBDRjQzQzYxQjk3MkQ5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEU4NkQ2MDA5ODUxMTFFN0IyMENGNDNDNjFCOTcyRDkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEU4NkQ2MDE5ODUxMTFFN0IyMENGNDNDNjFCOTcyRDkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4S60t9AAACPklEQVR42mIUXyDAAASqQNwBxC5AzMdAG/AJiPcAcQUQ32YBEupAfAKIBRhoC0AeCgJiJyC2YAISbXSwFBmA7GpjggYvvYEbEw3jFB/gYSJWJT+bAEOOTgHVbGbBZ5G+sAGDHhDbSdkz2Ek6MDz8/IBh88MNYJoYR0y5MgGnHCMwO/1HF3wR/x5Mf/z1AUwfenaAYfKViQyX3l5AUXPo+QHsqQfoaJCDJRYKkubjsF2BDBeBloAsXuW2Hsi+iGIpsjpsABQ6IH0kBzUun1ATMDEMEMDqY+RgAiUweR4FcAIDgc0PNjIsvrWANhYfenYQzgZZ+vDLA7gYKEXTzMewbADKUjXG9eAshC9rUD2O/RQCwHSsWgKDL5RN8wIEYmE8OBuBUnmuTj44mJGzFa4sA8rHZFsM8iUoL8vzKjB8+PmRoeR4IcNs+/kMblscwfm75WwjXoM3ARMhyRZDyuV8hrDdgQzdlv1gMZBPQXHdA+SnHkykOM6xxjEsQaGn4MmXJ4KLTuRQQS+zTwadBxeXJFsMSkSgIg9kCToABTFyHINCBR3AQoUsH5cC4xNWQeBLAwLsAhiFCcjBxFShGBZvfrCBqLIa5FuQJegOBPFBDs/VzQcnTKqW1TDf4EpgIIeDcgS2qCDbYlDCASU+kK/wAZA8KDpA6YUqFoMKEpBPCUUHKEeA4h9XCsfaAqEHYIK28OkNvjBBuxX0BrtAFlcD8Qc6Wgqyqxpk8Q1QXwaI1wHxZxpa+BlqB8iuGwABBgDVUeWLPb05lAAAAABJRU5ErkJggg==) 0.37333rem center no-repeat;
		background-size: 0.4rem 0.4rem;
	}

	.integral-info {
		width: auto;
		height: 100%;
		color: #999999;
		font-size: 0.32rem;
		text-indent: 0.33333rem;
	}

	.integral-tips {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAdVBMVEUAAACIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIh9djwyAAAAJnRSTlMA3QqyeQT6yoJOxPPvu9Yb5c+mcmdWIxKrjYZIQTPpXymXbS+eOVoQKL8AAAHcSURBVDjLfZOLEqIwDEVTkALyUN6CouDj/v8nLi1L26C7Z0Znmh7SQFJyeUVHib+IdxzQb2JfG3exsLqV90NrlZZeHh+9OV37HMC5+fIeEshrluFWAih35/eArEws2NQCKE6uVy6BdlsMuRicBGnL8vkm3QULh21VA2fP1AdktjIocvqxeXLjdNBi4QRM/gxwCm60WJm13b/xcBACuJBDJ9f1EYJcguchJkYEtEQTUNP/8SR6pSfm9W1PMta7N85EBcqdNuquu627AiMBD+4doDm5Zyd4kpIdugyaO6snxExI3dBLYCUklxlHguBnIJEAdoVHCLkY5BgaLdZc3GekJqIKiulbPBMnBLAP9upo2bJYl2BrtsWHT4DtrJ3HJxfPiJbf8ON7v1hsUtneEPwUXWKwe1h6qo8fN5gq0SfPzSmWANF9+beMUNyoSNlMXImoYt2ulZdUIWAHLV+rC1Lk7IYDEkDYmgq3DxMDvRGPWMkCMyfLwl752vZF86aNUwrZmVGw01voYWysJ4CrXSXmkteLNnRm55PyLrUC8Nt1K/bcL209ewOSqCNGHALpdq59WC7qbNONB1Wuf6IvplK/RzhHUTRkQi1C+1JcHQQsySWmfzPW81HhV/Gu4D802DyQ68JiiQAAAABJRU5ErkJggg==);
		background-size: 0.53333rem 0.53333rem;
		width: 0.75rem;
		height: 100%;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.switch {
		width: 1.02667rem;
		height: 0.49333rem;
		position: relative;
		top: 50%;
		left: 0.13333rem;
		margin-top: -0.25333rem;
		overflow: hidden;
	}

	.integral-off {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-position: 0 0;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		overflow: hidden;
	}

	.integral-on {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		background-position: -1.04rem 0;
		overflow: hidden;
	}

	.wechatPay {
		background: url(../../../res/images/wechat-icon.png) 0.37333rem center no-repeat;
		background-size: 0.56rem 0.49333rem;
	}

	.memberPay {
		background: url('../../../res/images/member-icon.png') 0.37333rem center no-repeat;
		background-size: 0.54667rem 0.49333rem;
	}

	.coupon-more {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVGMDlFNTY4NzgzNTExRTdCQzA1ODg1Q0Y4RTEyNkQ2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjVGMDlFNTY5NzgzNTExRTdCQzA1ODg1Q0Y4RTEyNkQ2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NUYwOUU1NjY3ODM1MTFFN0JDMDU4ODVDRjhFMTI2RDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NUYwOUU1Njc3ODM1MTFFN0JDMDU4ODVDRjhFMTI2RDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7McRjTAAABdklEQVR42oyUzSuEURTGZyYkKSmRyGcJRSgLkY9EWFhZWSgl2djyR9hb2tgoC1Kk5Gs1yiQpksJQkyaasFLy8Tt1pt5O073vU7+mnnnP89773nNPNB5PRFRz0APz8BMJqTz9XYBViEIhzIQNicFioFg0DRtQEDagOlCc1RRshgmRgGVYgj/z3yRs6ZacAaIV/Yh23xOwA0W+ANGaLv3LPDMCe1DsCxBtwzh8Gn8A9qHEFyA6gSFIG78XDqDUFyC6gH5IGr8bDqHMFyC6gz64Nn6nhpT7AkQpXcmZ8dt1q5WxEM2WgVn4Nn4LrIcJqIVdyDf+k1w8X0C9LrXB+I8wCA+ugEYtrjP+vRYnXR+xCU6hJsfJSFM9u46xWd9cZfxbfXPK1Uit2eMx/o0Wv7hauQ2OocI8c6XFaddl6oCjbHcFdAnD8Oq6zl22vwP3QYrffAPlN8dIO9fiTJiRJsschQ/14jpE3sMOVVFCB4lMnrFAmFf/AgwAkx5I30Bs0NkAAAAASUVORK5CYII=) center right no-repeat;
		background-size: 0.21333rem 0.33333rem;
		margin-right: 0.33333rem;
		width: auto;
		height: 100%;
		min-width: 1.33333rem;
		text-indent: 0;
		float: right;
		padding-right: 0.4rem;
		color: #999999;
		font-size: 0.32rem;
	}

	.coupons-num {
		width: auto;
		height: 0.42667rem;
		background-color: #ff5d42;
		padding: 0rem 0.26667rem;
		line-height: 0.42667rem;
		font-size: 0.29333rem;
		color: #ffffff;
		text-align: center;
		border-radius: 0.10667rem;
		position: relative;
		top: 50%;
		-webkit-transform: translate(0, -50%);
		-ms-transform: translate(0, -50%);
		transform: translate(0, -50%);
	}

	.pay-memberInfo {
		width: auto;
		height: 1.28rem;
		float: right;
		margin-right: 0.42667rem;
		line-height: 1.28rem;
		text-align: right;
		color: #333333;
		font-size: 0.37333rem;
	}

	.member-pay {
		text-indent: 0.97333rem;
		width: 100%;
		height: 1.28rem;
		line-height: 1.28rem;
		font-size: 0.37333rem;
		color: #333333;
	}

	.pay-on,
	.pay-off {
		width: 1.06667rem;
		height: 1.28rem;
		position: absolute;
		right: 0;
		top: 0;
		margin-right: 0.45333rem;
	}

	.pay-on {
		background: url('../../../res/images/chose-on.png') center right no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.pay-off {
		background: url('../../../res/images/chose-off.png') center right no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.using-integral {
		text-indent: 0.96rem;
		height: 1.28rem;
		line-height: 1.28rem;
		font-size: 0.37333rem;
		color: #333333;
		width: 100%;
		border-top: 0.01333rem solid #e5e5e5;
	}

	.using-input {
		width: 2.08rem;
		height: 0.90667rem;
		background-color: #f7f7f7;
		line-height: 0.90667rem;
		border: 0.01333rem solid #e5e5e5;
		font-size: 0.37333rem;
		padding-left: 0.4rem;
		margin-top: 0.18667rem;
		margin-left: 0.34667rem;
	}

	.vip-price {
		color: #17a010;
		font-size: 0.37333rem;
		font-weight: bold;
	}

	.borBottom-no {
		border-bottom: none;
	}

	.integral-box {
		width: 8rem;
		height: auto;
		background-color: #ffffff;
		position: relative;


	}

	.integral-box .integral-header,
	.integral-box .integral-footer {
		width: 100%;
		height: 1.04rem;
		line-height: 1.04rem;
		font-size: 0.37333rem;
	}

	.integral-box .integral-header {
		background-color: #f7f8f8;
		color: #999999;
		text-indent: 0.4rem;
	}

	.integral-box .integral-footer {
		text-align: center;
		color: #ffffff;
		background-color: #b3b3b3;
	}

	.integral-box .integral-content {
		width: 100%;
		height: auto;
		line-height: 0.66667rem;
		padding: 0.4rem 0.8rem;
		font-size: 0.34667rem;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.integral-box .integral-content ul {
		list-style: disc;
	}

	.pay-package {
		width: 100%;
		height: auto;
		line-height: 0.6rem;
		background-color: #efefef;
		text-indent: 0.4rem;
		overflow: hidden;
	}

	.pay-package .package-goods {
		width: 100%;
		height: auto;
		background-color: #efefef;
	}

	.pay-package .package-goods .pay-goodsName {
		color: #333333;
		font-size: 0.34667rem;
		width: 80%;
		height: 0.6rem;
	}

	.pay-package .package-goods .pay-goodsNum {
		color: #333333;
		font-size: 0.34667rem;
		text-align: right;
		padding-right: 0.4rem;
		box-sizing: border-box;
		width: 20%;
		height: 0.6rem;
	}
</style>