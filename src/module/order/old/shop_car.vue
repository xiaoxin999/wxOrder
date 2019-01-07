<template>
	<div id="shopCar" class="shopCar">
		<div class="bar_tip" v-if="reduceActivity && reduceActivity.length != 0 && str != ''">
			<span class="align_text">{{str}}</span>
		</div>
		<div v-else></div>
		<div class="shopCarBox" @click="openShopCar">
			<div class="shopCar-left fl">
				<div class="shopCar-icon fl">
					<div class="shopCar-num" v-show="$store.state.order.shopCarNum > -1">{{$store.state.order.shopCarNum}}</div>
				</div>
				<div class="shopCar-price fl">
					<div v-if="shopCarPrice>0" class="car-price">
						<!-- <span v-show="hidden">{{reducePriceAll1}}</span> -->
					</div>
					<span class="shopCar-text">总价</span>
					<span class="shopCar-totalPrice">¥{{Number(shopCarPrice).toFixed(2)}}</span>
				</div>
			</div>
		</div>
		<div class="shopCar-right fl">
			<div class="take-out" v-if="Number(shopCarPrice)<selfPayInfo.minFee">
				<!-- 外卖 -->
				<span>确认下单</span>
				<span>(满{{selfPayInfo.minFee}}起送)</span>
			</div>
			<a v-else href="javascript:void(0)" class="order-btn" @click="saleGoods(carLists)">确认下单</a>
		</div>
		<div class="shopCar-shade" v-show="shopCharIsShow" @click="openShopCar">
		</div>
		<div class="shopCar-list" v-show="shopCharIsShow">
			<div class="shopCar-header">
				<div class="shopCar-title fl">购物车</div>
				<div class="shopCar-clean fr" @click="emptyCart"></div>
			</div>
			<div class="shopCar-content">
				<span class="gray_tip" v-if="!isCompel && disCountPrice>0">参与优惠商品 小计 {{disCountPrice.toFixed(2)}} 元</span>
				<!-- 商品数据 -->
				<div class="goods" v-if="goods.goodsName && goods.isDiscount =='1'" v-for="(goods,index) in carLists" v-bind:key="goods.goodsName + random()">
					<div class="goodsName fl">
						<div class="goodsNames">{{goods.goodsName}}</div>
						<div class="tastes" v-if="goods.attrInfo">
							{{goods.attrInfo}}
						</div>
					</div>

					<div class="goodsPirce fl" style="max-width: 1.2rem;"  :style="{'line-height': goods.isShowAvailPrice ? '0.63rem' : 'inherit'}">
						<span :class="goods.isShowAvailPrice ? 'goodsDiscount' : 'price'">￥{{goods.sourcePrice}}</span>
						<span class="price" v-if="goods.isShowAvailPrice">￥{{goods.availPrice}}</span>
					</div>
					<div class="goodsNum fl">
						<addSubtract :item="goods" :index="index" @goodsChange="goodsChange"></addSubtract>
					</div>
				</div>
				<!-- 套餐数据 -->
				<div class="goods" v-for="(packages,index) in $store.state.order.carPackageList" v-bind:key="packages.packageName + random()" v-if="packages.isDiscount =='1'">
					<div class="packagesName fl">
						<div class="packagesNames fl">{{packages.packageName}}</div>
						<div class="goodsUpDown fl"></div>
					</div>
					<div class="goodsPirce fl" style="max-width: 1.2rem;"   :style="{'line-height': packages.isShowAvailPrice ? '0.63rem' : 'inherit'}">
						<span :class="packages.hasVip ? 'goodsDiscount' : 'price'">￥{{packages.sourcePrice}}</span>
						<span class="price" v-if="packages.hasVip">￥{{packages.memberPrice}}</span>
					</div>
					<div class="goodsNum fl">
						<addSubtract :item="packages" :index="index" @goodsChange="goodsChange"></addSubtract>
					</div>
					<div class="package-goods fl" v-for="tag in packages.packageTag" v-bind:key="tag.tagName + random()">
						<div class="package-tag">{{tag.tagName}}{{tag.goods.length}}选{{tag.totalNum}}</div>
						<div class="tag-goods" v-for="goods in tag.goods" v-bind:key="goods.goodsName + random()">
							<div class="package-name fl">{{goods.goodsName}}</div>
							<div class="package-taste fl">{{goods.attrInfo}}</div>
							<div class="package-num fr">
								x{{goods.num}}
							</div>
						</div>
					</div>
				</div>
				<span class="gray_tip" v-if="!isCompel && undisCountPrice>0">不参与优惠商品 小计 {{undisCountPrice.toFixed(2)}} 元</span>
				<div class="goods" v-if="goods.goodsName && goods.isDiscount =='0'" v-for="(goods,index) in carLists" v-bind:key="goods.goodsName + random()">
					<div class="goodsName fl">
						<div class="goodsNames">{{goods.goodsName}}</div>
						<div class="tastes" v-if="goods.attrInfo">
							{{goods.attrInfo}}
						</div>
					</div>

					<div class="goodsPirce fl" style="max-width: 1.2rem;" :style="{'line-height': goods.isShowAvailPrice ? '0.63rem' : 'inherit'}">
						<span :class="goods.isShowAvailPrice ? 'goodsDiscount' : 'price'">￥{{goods.sourcePrice}}</span>
						<span class="price" v-if="goods.isShowAvailPrice">￥{{goods.availPrice}}</span>
					</div>
					<div class="goodsNum fl">
						<addSubtract :item="goods" :index="index" @goodsChange="goodsChange"></addSubtract>
					</div>
				</div>
				<!-- 套餐数据 -->
				<div class="goods" v-for="(packages,index) in $store.state.order.carPackageList" v-bind:key="packages.packageName + random()" v-if="packages.isDiscount =='0'">
					<div class="packagesName fl">
						<div class="packagesNames fl">{{packages.packageName}}</div>
						<div class="goodsUpDown fl"></div>
					</div>
					<div class="goodsPirce fl" style="max-width: 1.2rem;" :style="{'line-height': packages.isShowAvailPrice ? '0.63rem' : 'inherit'}">
						<span :class="packages.isShowAvailPrice ? 'goodsDiscount' : 'price'">￥{{packages.price}}</span>
						<span class="price" v-if="packages.isShowAvailPrice">￥{{packages.memberPrice}}</span>
					</div>
					<div class="goodsNum fl">
						<addSubtract :item="packages" :index="index" @goodsChange="goodsChange"></addSubtract>
					</div>
					<div class="package-goods fl" v-for="tag in packages.packageTag" v-bind:key="tag.tagName + random()">
						<div class="package-tag">{{tag.tagName}}{{tag.goods.length}}选{{tag.totalNum}}</div>
						<div class="tag-goods" v-for="goods in tag.goods" v-bind:key="goods.goodsName + random()">
							<div class="package-name fl">{{goods.goodsName}}</div>
							<div class="package-taste fl">{{goods.attrInfo}}</div>
							<div class="package-num fr">
								x{{goods.num}}
							</div>
						</div>
					</div>
				</div>

				<div class="many-people-order" @click="goManyPeoPle" v-if="isSelfHelp && multiOrderStatus != '0'">商品如需分开打包，请使用多人订餐&nbsp;<em>&gt;</em></div>
			</div>
		</div>

		<transition name="fade">
			<component :is="isShowPay" @close="closeWin" @choicePay="changePay" :list="selfPay">
			</component>
		</transition>
	</div>
</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import orderHttp from 'src/module/order/data/order_http';
	import http from 'src/manager/http';
	import SubmitChecked from 'src/module/order/common/mixin';

	let selectPayWay = storage.session('selectPayWay');
	let orderData = null;
	export default {
		mixins: [SubmitChecked],
		data() {
			return {
				isMember: null,
				shopCharIsShow: false, // 购物车详情是否显示
				totalPrice: 0, // 购物车总价格
				carGoodsList: [], // 购物车商品列表
				carPackageList: [], // 购物车套餐列表
				minFee: storage.session('selectPayWay'),
				randKey: storage.session('randKey') || utils.getOnlyId(16), // 红桌台下单随机值
				isPay: true, // 商品是否开通在线支付
				selfPay: storage.session('SelfHelpConfig') ? storage.session('SelfHelpConfig').pay : [], // 支付方式
				selfPayInfo: {}, // 选择的支付方式详细信息
				isShowPay: '', // 是否渲染支付列表组件
				isTakeOut: false, // 是否为外卖
				discountRule: [], //满减列表
				discountRuleNew: [],
				discountRuleStatus: 0, //满减规则是否开启
				otherRuleStatus: 0,
				otherRuleOrderPrice: 0, //默认不满金额
				otherRulepay: 0, //默认支付
				reducePriceAll: 0,
				hidden: false,
				otherRuleData: null,
				mustList: [],
				personConfine: 0, //用餐人数
				confineStatus: 0, //用餐人数状态
				mustGoodsStatus: 1, //必点商品提醒方式（1仅提醒，2必点）
				mustGoodsRemind: '', //必点商品提醒内容 必点商品用{goods}
				str: '',
				reduceActivity: null,
				showPackDeta: {},
				isSelfHelp: !!storage.session('selectPayWay'),
				multiOrderStatus: selectPayWay ? selectPayWay.multiOrderStatus : null,
				isFans: null,
				memberInfo: null
			};
		},
		props: [],
		methods: {
			countStr(n) {
				let data = this.reduceActivity;
				if (this.reduceActivity &&(data.length > 0 || data != '')) {
					let actData = data.discountRule;
					console.log(actData, 'actData');
					let actStatus = data.status;
					let actDefData = data.otherRule;
					let actDefStatus = data.otherRule.status;
					// let sum = 0;
					let str = '';
					n = Number(n);
					if (n == -1) {

						if (actDefStatus) {
							str += '不满' + actDefData.orderPrice + '支付' + actDefData.pay + ',';
						}
						if (actStatus) {
							for (let i = 0; i < actData.length; i++) {
								str += '满' + actData[i].orderPrice + '减' + actData[i].reduction + ',';
							}
						}

						return str;
					} else {
						let reducePriceAll = 0;
						if (n < actDefData.orderPrice && actDefStatus) {

							let min = Math.min(n, Number(actDefData.pay));
							if (min != n) {
								reducePriceAll = n - min;
							}
							storage.session('reducePriceAll', reducePriceAll);
							str = '只需要付' + min;
							return str;
						} else if (n >= actDefData.orderPrice && actDefStatus && actStatus != 1) {
							storage.session('reducePriceAll', 0);
							str = '';
							return str;
						}
						if (actStatus == 1) {
							if (n < actData[0].orderPrice) {
								storage.session('reducePriceAll', 0);
								return '还差' + (Number(actData[0].orderPrice) - n).toFixed(2) + ',减' + actData[0].reduction;
							} else if (actData.length == 1) {
								reducePriceAll = actData[0].reduction;
								storage.session('reducePriceAll', reducePriceAll);
								str = '减' + reducePriceAll;
								return str;
							}
							for (let i = 1; i < actData.length; i++) {
								if (actData[i].orderPrice > n) {
									let temp = i;
									reducePriceAll = actData[temp - 1].reduction;
									str = '已减' + actData[temp - 1].reduction + ',再买' + (Number(actData[temp].orderPrice) - n).toFixed(2) + ',减' + actData[temp].reduction;
									break;
								} else if (i === actData.length - 1) {
									reducePriceAll = actData[i].reduction;
									str = '已减满' + actData[i].reduction;
									break;
								}
							}
							storage.session('reducePriceAll', reducePriceAll);
							return str;
						}

					}
				}

			},
			closeWin() {
				this.isShowPay = '';
			},
			random() {
				return Math.random();
			},
			openShopCar: function() {
				// 打开购物车
				if (this.$store.state.order.carGoodsList.length || this.$store.state.order.carPackageList.length) {
					this.shopCharIsShow = !this.shopCharIsShow;
					this.$store.commit('setOverHide', this.shopCharIsShow);
				}
			},
			emptyCart: function() {
				// 清空购物车
				this.shopCharIsShow = false;
				this.$store.commit('setOverHide', this.shopCharIsShow);
				this.$store.commit('resetShopCar');
			},
			goodsChange: function(item) {
				// 购物车数据发生改变
				if (item.isGoods) {
					// 处理商品
					let goods = {
						'data': utils.deepCopy(item),
						'operateType': 'splice',
						'operateObj': 'carGoodsList'
					};
					this.$store.commit('setCarList', goods);
				} else {
					// 处理套餐
					let packages = {
						'data': utils.deepCopy(item),
						'operateType': 'splice',
						'operateObj': 'carPackageList'
					};
					this.$store.commit('setCarList', packages);
				}
			},
			watchGoods: function() {
				if (this.$store.state.order.carGoodsList.length == 0 && this.$store.state.order.carPackageList.length == 0) {
					this.shopCharIsShow = false;
					this.$store.commit('setOverHide', this.shopCharIsShow);
				} else {
					// empty
				}
			},
			getVipPrice: function(goods) {
				// 获取会员价格
				return (goods.isVip == '1') ? goods.vipPrice : (goods.price * this.$store.state.order.memberDiscount).toFixed(2);
			},
			placeAnOrder: function() {
				// 下单
				let goods = utils.deepCopy(this.$store.state.order.carGoodsList);
				let packages = utils.deepCopy(this.$store.state.order.carPackageList);
				let sumPrice = this.$store.state.order.shopCarPrice;

				let odid = 0;
				goods.filter((item) => {
					item.odid = ++odid;
				});

				packages.filter((item) => {
					item.odid = ++odid;
				});

				storage.session('goods', goods);
				storage.session('packages', packages);
				storage.session('sumPrice', sumPrice);
				if (this.isPay === false) {
					this.$store.commit('setWin', {
						title: '提示信息:',
						content: '该店尚未开通支付'
					});
					return false;
				}

				if (goods.length === 0 && packages.length === 0) {
					this.$store.commit('setWin', {
						title: '提示信息:',
						content: '请选择菜品后提交'
					});
					return false;
				}

				let reservationInfo = storage.session('reservationInfo'); // 预约信息
				let selectShop = storage.session('select-shop'); // 自助模式信息


				if (reservationInfo) {
					// 跳转至预约界面
					this.$router.push({
						path: '/bespeakDetail',
						query: {
							detailId: this.shopId
						}
					});

				} else {
					if (selectShop) {
						// 跳转至自助模式结账
						let selectPayWay = storage.session('selectPayWay');
						console.log(selectPayWay, 'selectpayway');
						if (selectPayWay && selectPayWay.type === '2') {
							if (Number(this.$store.state.order.shopCarPrice) < Number(this.selfPay[0].minFee)) {
								this.$store.commit('setWin', {
									content: '未满足起送费'
								});
								return false;
							}
						}
						this.$router.push('/pay');


					} else {
						// 红桌台下单
						let subInfo = orderData.getCurrentTableUpdata(goods, packages);
						let orderStatus; // 订单状态,1:成功，2:报错失败，3:桌台待确认，4:已存在订单不能提交，5:超时处理
						let sendInfo = {};
						let tableInfo = storage.session('orderInfo');
						sendInfo.data = subInfo;
						sendInfo.tableId = tableInfo.tableId;
						sendInfo.person = tableInfo.num;
						sendInfo.tableName = tableInfo.areaNmae + '_' + tableInfo.tableName;
						sendInfo.randKey = this.randKey; //随机值
						sendInfo.shopId = this.shopId;
						orderHttp.newWechatOrder(sendInfo, (json) => {
							tableInfo.orderDate = utils.format(new Date(Number(json.time) * 1000), 'yyyy-MM-dd hh:mm');
							tableInfo.oid = json.data;
							storage.session('orderInfo', tableInfo);
							orderStatus = (json.error ? '2' : '1');
							storage.session('orderStatus', {
								'orderStatus': orderStatus,
								'errorMsg': json.error ? json.error.message : '下单失败'
							});
							this.$router.push('/osuccess');
						}, (json) => {
							if (json.error.code == '3805' || json.error.code == '3829') {
								//已存在订单不能提交
								orderStatus = '4';
							} else if (json.error.code == '3827') {
								//该桌台待确认,请联系服务员确认
								orderStatus = '3';
							} else if (json.error.code == '2822') {
								// 商品库存不足
								orderStatus = '2';
							} else if (json.error.code) {
								// code存在
								orderStatus = '2';
							} else {
								// 超时或后端返回数据错误
								orderStatus = '5';
							}
							storage.session('orderStatus', {
								'orderStatus': orderStatus,
								'errorMsg': json.error.message
							});
							this.$router.push('/osuccess');
						});
						storage.session('goodsData', JSON.parse(sendInfo.data));
						storage.session('randKey', sendInfo.randKey);
					}
				}
			},
			async payUrlFun() {
				// 获取链接地址
				if (storage.session('isWechatOrder') == 1) {
					// 是否为微信点餐
					this.isPay = true;
					storage.session('isWechatOrder', 0);
				}
			},

			saleGoods(carLists) {
				if (this.$store.state.order.isManyOrder) {
					let {
						tagList,
						carGoodsList,
						carPackageList,
						shopCarPrice
					} = this.$store.state.order;
					let allGoods = carGoodsList.concat(carPackageList);
					// let len = allGoods.length;

					let odid = 0;
					carGoodsList.forEach((item) => {
						item.odid = ++odid;
					});

					carPackageList.forEach((item) => {
						item.odid = ++odid;
					});

					storage.session('goods', carGoodsList);
					storage.session('packages', carPackageList);
					storage.session('sumPrice', shopCarPrice);

					// 缓存数据没有加入口袋
					if (tagList.length === 0) {
						this.$store.commit('setTagCar', allGoods);
					}
					storage.session('tagList', this.$store.state.order.tagList);
					storage.session('tagIndexObj', this.$store.state.order.tagIndexObj);
					// storage.session('tagShopObj',this.$store.state.order.tagShopObj);
					storage.session('isManyOrder', this.$store.state.order.isManyOrder);
					this.$router.push('/manyPeopleOrder');
					return;
				}

				storage.session('complementeGoods', carLists);
				storage.session('tagList', this.tagList);
				storage.session('selectPayWay');
				this.mustGoods();
			},
			mustGoods() {
				let selectShop = storage.session('select-shop'); // 自助模式信息
				if (selectShop) {
					if (this.tagList && this.tagList.length > 1) {
						if (!orderData.checkMustTagList(this.tagList) && !this.checked(this.placeAnOrder)) {
							// alert('多篮子必选');
							let multiOrderStatus = storage.session('selectPayWay').multiOrderStatus;
							//multiOrderStatus 多人下单开关 0关 1所有的菜品在一起判断必点 2每个篮子判断必点
							if (multiOrderStatus == '2') {
								this.$store.commit('setWin', {
									content: orderData.getContent(this.tagList)
								});
							}
							return;
						}
					} else {
						if (!orderData.checkMustList(this.carLists) && !this.checked(this.placeAnOrder)) {
							return;
						}

					}
				}
				this.placeAnOrder();
			},
			changePay(obj) {
				// 自助模式选择了支付方式 
				if (obj.type === '2') {
					if (this.$store.state.order.shopCarPrice - 0 < obj.minFee - 0) {
						this.$store.commit('setWin', {
							content: '未满足起送费'
						});
						return false;
					}
				}
				storage.session('selectPayWay', obj);
				this.$router.push('/pay');
				storage.session('selectPayWay', obj);

			},
			goManyPeoPle() {
				// 跳转至多人点餐
				let {
					tagList,
					carGoodsList,
					carPackageList,
					shopCarPrice
				} = this.$store.state.order;
				let allGoods = carGoodsList.concat(carPackageList);
				// let len = allGoods.length;

				let odid = 0;
				carGoodsList.filter((item) => {
					item.odid = ++odid;
				});

				carPackageList.filter((item) => {
					item.odid = ++odid;
				});

				storage.session('goods', carGoodsList);
				storage.session('packages', carPackageList);
				storage.session('sumPrice', shopCarPrice);

				// 缓存数据没有加入口袋
				if (tagList.length === 0) {
					this.$store.commit('setTagCar', allGoods);
				}
				storage.session('tagList', this.$store.state.order.tagList);
				storage.session('tagIndexObj', this.$store.state.order.tagIndexObj);

				storage.session('tagShopObj', this.$store.state.order.tagShopObj);

				this.$router.push('/manyPeopleOrder');

				this.$store.commit('setManyOrder', true);

			},
			async getUserInfo() {
				const loginInfo = storage.session('login');
				let res = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: 1,
						from: 0
					}
				});
				Object.assign(res, loginInfo);
				storage.session('wechatShop', res);

				let memberInfo = this.memberInfo = storage.session('memberInfo') ?
					storage.session('memberInfo') :
					storage.session('wechatShop');
				if (memberInfo) {
					this.isMember = !!memberInfo.member;
					if (!this.isMember && memberInfo.discount) {
						this.isFans = true;
					}
				}
			}

		},

		components: {
			addSubtract: () =>
				import( /* webpackChunkName: 'addSubtract' */ 'src/components/add_subtract'),
			payList: () =>
				import( /* webpackChunkName: 'payList' */ 'src/components/pay_list')
		},
		computed: {
			undisCountPrice: function() {
				return this.$store.state.order.undisCountPrice;
			},
			carLists: function() {
				let {
					carGoodsList,
					carPackageList
				} = this.$store.state.order;
				let temp = carGoodsList.concat(carPackageList);
				return temp;
			},
			goodsCarChange() {
				return this.$store.state.order.carGoodsList;
			},
			packagesCarChange() {
				return this.$store.state.order.carPackageList;
			},

			shopCarPrice: function() {
				let {
					shopCarPrice
				} = this.$store.state.order;
				return shopCarPrice;
			},
			storePrice: function() {
				if (this.$store.state.order.isCompel) {
					return this.$store.state.order.shopCarPrice;
				} else {
					return this.$store.state.order.disCountPrice;
				}
			},
			disCountPrice: function() {
				return this.$store.state.order.disCountPrice;
			},
			isCompel: function() {
				return this.$store.state.order.isCompel;
			},
			parseOk() {
				return this.$store.state.parseOk;
			}
		},
		watch: {
			storePrice() {
				this.str = this.countStr(this.storePrice);
			},
			'goodsCarChange': {
				handler: function() {
					this.watchGoods();
				},
				deep: true
			},
			'packagesCarChange': {
				handler: function() {
					this.watchGoods();
				},
				deep: true
			},
			parseOk(newV) {
				if (newV) {
					this.reduceActivity = storage.session('reduceActivity');
					let price = this.$store.state.order.isCompel == 1 ? this.storePrice : this.disCountPrice;
					if (price > 0) {
						this.str = this.countStr(price);
					} else {
						this.str = this.countStr(-1);
					}
				}
			}
		},
		async mounted() {
			orderData = await import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			storage.session('carLists', this.carLists);
			let selectShop = storage.session('select-shop');
			if (selectShop) {
				if (this.selfPay.length === 1 && this.selfPay[0].type == '2') {
					// 如果自助模式支付方式为一种，并且type为2，则为外卖。
					this.isTakeOut = true;
					this.selfPayInfo = this.selfPay[0];
					if (this.$store.state.order.shopCarPrice) {
						this.isTakeOut = Number(this.selfPayInfo.minFee) > Number(this.$store.state.order.shopCarPrice);
					}
				}
			}
			this.getUserInfo();
			this.reduceActivity = storage.session('reduceActivity');
			let price = this.$store.state.order.isCompel == 1 ? this.storePrice : this.disCountPrice;
			if (price > 0) {
				this.str = this.countStr(price);
			} else {
				this.str = this.countStr(-1);
			}
			this.payUrlFun();
		}
	};
</script>

<style lang="less" scoped>
	@import '../../../res/css/base.less';

	.shopCar {
		.px2rem(width, 750);
		.px2rem(height, 100);
		.px2rem(line-height, 100);
		position: fixed;
		left: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		color: #FFFFFF;
		.px2rem(font-size, 32);
		text-align: center;
		z-index: 99;

		.shopCar-left {
			.px2rem(width, 540);
			.px2rem(height, 100);
			overflow: hidden;

			.shopCar-icon {
				.px2rem(width, 140);
				height: 100%;
				background: url(../../../res/images/tab-icon-gouwuche.png) center center no-repeat transparent;
				background-size: 1.066rem 1.066rem;
				position: relative;

				.shopCar-num {
					.px2rem(width, 40);
					.px2rem(height, 40);
					.px2rem(line-height, 40);
					text-align: center;
					background-color: #ff463b;
					border-radius: 50%;
					position: absolute;
					.px2rem(right, 18);
					.px2rem(top, 6);
					.px2rem(font-size, 22);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.shopCar-price {
				.px2rem(width, 400);
				height: 100%;
				.text-overflow;
				text-align: right;
				.px2rem(padding-right, 40);
				box-sizing: border-box;

				.shopCar-text {
					.px2rem(font-size, 28);
				}

				.shopCar-totalPrice {
					.px2rem(font-size, 28);
				}
			}
		}

		.shopCar-right {
			.px2rem(width, 210);
			.px2rem(height, 100);
			overflow: hidden;

			.order-btn {
				background-color: #f5a623;
				height: 100%;
				width: 100%;
				.px2rem(font-size, 32);
			}

			.take-out {
				height: 100%;
				width: 100%;
				border-left: 1px solid #fff;
				box-sizing: border-box;

				span:last-child {
					.px2rem(font-size, 16);
					display: block;
					width: 100%;
					.px2rem(height, 40);
					.px2rem(line-height, 20);
				}

				span:first-child {
					.px2rem(font-size, 36);
					display: block;
					width: 100%;
					.px2rem(height, 60);
					.px2rem(line-height, 70);
				}
			}
		}

		.shopCar-shade {
			height: 100%;
			.px2rem(width, 750);
			position: fixed;
			top: 0;
			right: 0;
			background-color: rgba(0, 0, 0, 0.3);
			z-index: 55;
		}

		.shopCar-list {
			.px2rem(width, 750);
			background-color: #FFF;
			position: absolute;
			.px2rem(bottom, 100);
			left: 0;
			z-index: 66;
			overflow: scroll;

			.shopCar-header {
				.px2rem(width, 750);
				.px2rem(font-size, 28);
				.px2rem(height, 86);
				padding: 0 0.4rem;
				.px2rem(line-height, 86);
				border-bottom: 1px solid #DDDDDD;
				color: #666666;
				overflow: hidden;

				.shopCar-title {
					.px2rem(width, 110);
					.px2rem(height, 30);
					.px2rem(line-height, 30);
					text-align: center;
					.px2rem(margin-top, 28);
					border-left: 0.106666rem solid #F5A623;
				}

				.shopCar-clean {
					.px2rem(width, 50);
					.px2rem(height, 40);
					background: url(../../../res/images/pop-icon-del.png) center center no-repeat transparent;
					background-size: 0.49333rem 0.52rem;
					margin-top: 0.266rem;
				}
			}

			.shopCar-content {
				max-height: 9.3333rem;
				width: 10rem;
				overflow-y: scroll;

				.goods {
					width: 9.6rem;
					height: 1.52rem;
					line-height: 1.52rem;
					border-bottom: 1px solid #DDDDDD;
					background-color: #fff;
					margin-left: .4rem;

					.goodsName {
						width: 3.733333rem;
						height: 100%;
						font-size: 0.45333rem;
						color: #333;
						font-weight: 300;
						max-height: 1.50rem;
						line-height: 0.7rem;
						vertical-align: middle;
						overflow: hidden;
						display: -webkit-box;
						-webkit-box-pack: center;
						-webkit-box-align: start;
						word-break: break-all;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						text-overflow: ellipsis;
						font-weight: 300;
					}

					.goodsPrice {
						width: 3.2rem;
						height: 100%;
						color: #FF463B;
						font-size: 0.373rem;
						text-align: center;
					}

					.goodsNum {
						width: 2.4rem;
						height: 100%;
						font-size: 0.42666rem;
						color: #333;
						float: right;
						margin-right: 0.2rem;
					}

					.goodsDiscount {
						text-decoration: line-through;
						font-style: italic;
						color: #aba6a6;
					}

					.goodsName,
					.goodsPrice {
						.text-overflow;
						text-align: left;
					}

					.goodsUpDown {
						width: 1rem;
						height: 100%;
						background: url(../../../res/images/icon-xiala.png) center center no-repeat transparent;
						background-size: 0.5866rem 0.5866rem;
					}

					.packagesName {
						width: 3.7333rem;
						height: 100%;
						font-size: 0.45333rem;
						color: #333;
						font-weight: 300;
						max-height: 1.50rem;
					}

					.packagesNames {
						width: auto;
						height: 100%;
						max-width: 2.7333rem;
						color: #333333;
						text-align: left;
						.text-overflow;
					}

					.goodsNames {
						width: 100%;
						height: 0.9333rem;
						line-height: 0.9333rem;
						.text-overflow;
					}

					.tastes {
						width: 100%;
						height: 0.56rem;
						line-height: 0.56rem;
						font-size: 0.34666rem;
						color: #999999;
						.text-overflow;
					}
				}

				.package-goods {
					width: 100%;
					height: auto;
					font-size: 0.34666rem;
					line-height: 0.533rem;
					background-color: #EFEFEF;
					text-align: left; // margin-top : -1px;
					color: #333;
					overflow: hidden;

					.package-tag {
						color: #954442;
					}

					.package-num {
						text-align: center;
						width: 1rem;
						height: 100%;
						color: #999;
						.text-overflow;
					}

					.package-name {
						width: auto;
						max-width: 3rem;
						height: 100%;
						.text-overflow;
					}

					.package-taste {
						width: 4.6rem;
						height: 100%;
						color: #999;
						.text-overflow;
					}

					.package-num,
					.package-name,
					.package-taste {
						min-height: .6rem;
						line-height: .6rem;
					}
				}
			}
		}

		.tag-goods {
			width: 100%;
			overflow: hidden;
		}
	}

	.bar_tip {
		width: 100%;
		height: 0.6rem;
		line-height: 0.6rem;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		position: fixed;
		bottom: 1.32rem;
		z-index: 3;
		left: 0;
		text-align: center;
		width: 100%;
		overflow-x: auto;
		white-space: nowrap;
		padding: 0 0.2rem;
		overflow: auto;
		font-size: 0.26rem;

		span {
			text-align: center;
			margin: 0 auto;
		}

	}

	.bar_tip::-webkit-scrollbar {
		height: 0;
	}

	.align_text {
		text-align: center;
	}

	.line_text {
		color: #a8a8a8;
		text-decoration: line-through;
		float: left;
	}

	.reducePrice {
		float: left;

	}

	.price_red {
		float: left;
	}

	.many-people-order {
		background: #F8F8F8;
		width: 100%;
		height: .7733rem;
		line-height: .7733rem;
		font-family: PingFangSC-Medium;
		font-size: .32rem;
		color: #8F8F8F;
		text-align: center;
		clear: both;

		em {
			font-size: 0.4266rem;
		}
	}

	.price {
		color: #FF463B;

	}

	.gray_tip {
		padding: 0rem 0 0rem 0.4rem;
		display: inline-block;
		color: #8f8f8f;
		background: #f2f2f2;
		width: 100%;
		text-align: left;
	}
</style>