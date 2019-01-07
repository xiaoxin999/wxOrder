<template>
	<div>
		<div class="order-car">
			<div class="bar_tip" v-if="reduceActivity && reduceActivity.length != 0 && str != ''&&isCanUseReduce">
				<span class="align_text">{{str}}</span>
			</div>
			<div v-else></div>
			<div class="car-icon fl" @click="openGoodList">
				<span class="car-num">{{$store.state.order.shopCarNum}}</span>
			</div>
			<div class="car-info fl" @click="openGoodList">
				<!-- 满减价格 -->
				<div v-if="shopCarPrice>0" class="car-price">
					<span v-show="hidden">0</span>
					<div class="reducePrice">￥{{shopCarPrice}}元</div>
					<!-- <div class="reducePrice">￥{{Number(shopCarPrice).toFixed(2)}}元</div> -->
				</div>
				<div class="car-empty" v-else>未选购商品</div>
			</div>
			<template v-if="btns">
				<div class="car-btn fl" :class="$store.state.order.shopCarNum > 0 ? 'car-on' : ''" @click="goIndex">容我三思</div>
				<template v-if="isTakeOut">
					<template v-if='Number(shopCarPrice)>Number(minFee.minFee) || Number(shopCarPrice) == Number(minFee.minFee)'>
						<div class="car-btn fl" style="float:right;" :class="$store.state.order.shopCarNum > 0 ? 'car-on-s' : ''" @click="saleGoods(carLists)">确认下单</div>
					</template>
					<template v-else-if='Number(shopCarPrice)<Number(minFee.minFee)'>
						<div class="car-btn fl" style="float:right;" :class="$store.state.order.shopCarNum > 0 ? 'car-on-s-s' : ''">还差￥{{Number(minFee.minFee - shopCarPrice).toFixed(2)}}元起送</div>
					</template>
				</template>
				<template v-else>
					<div class="car-btn fl" style="float:right;" :class="$store.state.order.shopCarNum > 0 ? 'car-on-s' : ''" @click="saleGoods(carLists)">确认下单</div>
				</template>
			</template>
			<template v-else>
				<div class="car-btn fl" style="float:right;" :class="$store.state.order.shopCarNum > 0 ? 'car-on' : ''" @click="$store.state.order.shopCarNum > 0 ?saleGoods(carLists):''">选好了</div>
			</template>

		</div>
		<carGoods v-if="show" @close="close"></carGoods>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import orderHttp from 'src/module/order/data/order_http';
	import global from 'src/manager/global';
	import SubmitChecked from 'src/module/order/common/mixin';
	let orderData = null;
	let selectPayWay = storage.session('selectPayWay');
	export default {
		mixins: [SubmitChecked],
		data() {
			return {
				show: false,
				payUrlData: {},
				goodsLeast: [],
				gid: '',
				shopId: global.getShopId(),
				choose: 1,
				btns: false,
				minFee: selectPayWay,
				randKey: storage.session('randKey') || utils.getOnlyId(16), // 红桌台下单随机值
				discountRule: [], //满减列表
				discountRuleNew: [],
				discountRuleStatus: 0, //满减规则是否开启
				otherRuleStatus: 0, //默认满减
				otherRuleOrderPrice: 0, //默认不满金额
				otherRulepay: 0, //默认支付
				reducePriceAll: 0,
				hidden: false,
				otherRuleData: null,
				mustList: [],
				str: '',
				reduceActivity: null,
				isTakeOut: false,
				selfPay: storage.session('SelfHelpConfig') ? storage.session('SelfHelpConfig').pay : [],
				selfPayInfo: {}, // 选择的支付方式详细信息
			};
		},
		watch: {
			storePrice() {
				this.str = this.countStr(this.storePrice);
			},
			'$route': function(val) {
				console.log(val);
				if (val.path == '/latestOrder/complemente') {
					this.btns = true;
				} else {
					this.btns = false;
				}

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
		computed: {
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
			//这是购物车数据
			carLists: function() { //购物车列表。
				let {
					carGoodsList,
					carPackageList
				} = this.$store.state.order;
				return carGoodsList.concat(carPackageList);
			},
			tagList: function() {
				let tagList = this.$store.state.order.tagList;
				return tagList;
			},
			shopCarPrice: function() {
				// let {
				// 	shopCarPrice
				// } = this.$store.state.order;
				let shopCarPrice = Number(this.$store.state.order.shopCarPrice).toFixed(2);
				return shopCarPrice;
			},
			parseOk() {
				return this.$store.state.parseOk;
			},
			isCanUseReduce(){
				return this.$store.state.order.canUseReduce;
			}

		},
		// destroyed() {
		// 	storage.session('isReduce', null)
		// },
		methods: {
			countStr(n) {
				let data = this.reduceActivity;
				console.log(this.isCanUseReduce);
				if (this.reduceActivity && (data.length > 0 || data != '') && this.isCanUseReduce) {
					let actData = data.discountRule;
					let actStatus = data.status;
					let actDefData = data.otherRule;
					let actDefStatus = data.otherRule.status;
					let str = '';
					n = Number(n);
					if (n == -1) {

						if (actDefStatus) {
							str += '不满' + actDefData.orderPrice + '只支付' + actDefData.pay + ',';
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
			close() {
				this.show = !this.show;
			},
			openGoodList() {
				if (this.carLists.length < 1) return;
				this.close();
			},
			clearShopCar() {
				this.$store.commit('resetShopCar');
			},

			goPay() {
				let {
					carGoodsList,
					carPackageList,
					shopCarPrice
				} = this.$store.state.order;
				if (carGoodsList.length == 0 && carPackageList.length == 0) {
					this.$store.commit('setWin', {
						content: '请选择商品'
					});
					return false;
				}

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

				let reservationInfo = storage.session('reservationInfo'); // 预约信息
				let selectShop = storage.session('select-shop'); // 自助模式信息

				if (reservationInfo) {
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
						if (selectPayWay && selectPayWay.type == '2') {
							if (Number(this.$store.state.order.shopCarPrice) < Number(selectPayWay.minFee)) {
								this.$store.commit('setWin', {
									content: '未满足起送费'
								});
								return false;
							}
						}

						let goStatus = 'push';
						if (global.router.currentRoute.path == '/latestOrder/complemente') {
							goStatus = 'replace';
						}
						this.$router[goStatus]('/pay');
					} else {
						// 红桌台下单
						let subInfo = orderData.getCurrentTableUpdata(carGoodsList, carPackageList);
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
						storage.localData(`order_cache_${global.getShopId()}`, null);
					}
				}

				//判断购物车列表是否有商品id 等于 gid的数组元素。
				console.log(this.carLists, 'this.carLists');
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
					return;
				}

				storage.session('complementeGoods', carLists);
				storage.session('tagList', this.tagList);
				this.mustGoods();
			},
			mustGoods() {
				let selectShop = storage.session('select-shop'); // 自助模式信息
				if (selectShop) {
					if (this.tagList && this.tagList.length > 1) {
						if (!orderData.checkMustTagList(this.tagList) && !this.checked(this.leastGood)) {
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

						if (!orderData.checkMustList(this.carLists) && !this.checked(this.leastGood)) {
							return;
						}

					}
				}
				this.leastGood();
			},
			leastGood() {
				//起售商品
				let goodsLeastData = orderData.goodsLeast; //起售数据
				this.goodsLeast = goodsLeastData;
				let status = true;

				this.goodsLeast.map((item) => {
					if (item.type == '1') { //type 1 单品
						let sumNum = 0;

						this.carLists.map((item1) => {
							if (!item1.packageName) {
								if (item.gid == item1.id) {
									sumNum = Number(sumNum) + Number(item1.num);
								}
							}
							return item;
						});
						if (sumNum > 0) {
							if (Number(item.num) > Number(sumNum)) {
								status = false;
								this.$store.commit('setWin', {
									content: '该商品起售数' + Number(item.num) + ',还差' + Number(item.num - sumNum).toFixed(2) + '个'
								});
								return;
							}
						}

					} else if (item.type == '2') { //type 2 多品
						let gids = item.gid.split(',');
						let sumNum = 0;
						this.carLists.map((item1) => {
							if (!item1.packageName) {
								if (this.isInArray(gids, item1.id)) {
									sumNum = Number(sumNum) + Number(item1.num); //多品之和
								}
							}

							return item;
						});
						if (sumNum > 0) {
							if (Number(item.num) > Number(sumNum)) {
								status = false;
								this.$store.commit('setWin', {
									content: '该组合商品起售数' + Number(item.num) + ',还差' + Number(item.num - sumNum).toFixed(2) + '个'
								});
								return;
							}
						}
					}
				});

				if (status) {
					this.goPay();
				} else {
					storage.session('multiGoods');
					storage.session('complementeGoods');
					this.$router.push({
						path: '/latestOrder/complemente'
					});
				}
			},
			/**
			 * 使用循环的方式判断一个元素是否存在于一个数组中
			 * @param {Object} arr 数组
			 * @param {Object} value 元素值
			 */
			isInArray(arr, value) {
				for (let i = 0; i < arr.length; i++) {
					if (value === arr[i]) {
						return true;
					}
				}
				return false;
			},
			goIndex() {
				this.$router.push('/latestOrder');
				this.btns = false;
			}

		},
		components: {
			carGoods: () =>
				import( /* webpackChunkName: 'car_goods' */ './car_goods.vue'),
		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			this.packageList = orderData.packageList;
			let selectShop = storage.session('select-shop');
			if (selectShop) {
				if (this.selfPay.length === 1 && this.selfPay[0].type === '2') {
					// 如果自助模式支付方式为一种，并且type为2，则为外卖。
					this.isTakeOut = true;

					if (this.$store.state.order.shopCarPrice) {
						this.isTakeOut = Number(this.selfPayInfo.minFee) > Number(this.$store.state.order.shopCarPrice);
					}
					this.selfPayInfo = this.selfPay[0];
				}
			}
			storage.session('carLists', this.$store.state.order.carGoodsList);
			let price = this.$store.state.order.isCompel == 1 ? this.storePrice : this.disCountPrice;
			if (price > 0) {
				this.str = this.countStr(price);
			} else {
				this.str = this.countStr(-1);
			}
		}
	};
</script>
<style lang='less' scoped>
	@import "../../../../res/css/base.less";

	.order-car {
		height: 1.4267rem;
		line-height: 1.4267rem;
		width: 10rem;
		background-color: #fff;
		position: fixed;
		left: 50%;
		transform: translate(-50%, 0);
		bottom: 0;

		z-index: 4;

		.car-icon {
			.setBox(1.8267rem, 100%);
			background: url(../../../../res/images/latest-car-icon.png) no-repeat center center;
			background-size: 0.7467rem 0.7733rem;
			position: relative;

			.car-num {
				display: block;
				.setBox(0.3333rem, 0.3333rem);
				line-height: 0.3333rem;
				text-align: center;
				font-family: PingFangSC-Semibold;
				font-size: 0.1867rem;
				color: #ff2035;
				position: absolute;
				top: 0.6977rem;
				left: 0.9067rem;
			}

			&:after {
				content: "";
				position: absolute;
				top: 50%;
				right: 0;
				transform: translate(0, -50%);
				width: 0.0133rem;
				height: 0.96rem;
				background-color: #e1e1e1;
			}
		}

		.car-info {
			.setBox(2.483333rem, 100%);
			text-indent: 0.2rem;

			.car-empty {
				font-family: PingFangSC-Regular;
				font-size: 0.32rem;
				color: #8f8f8f;
				letter-spacing: 0;
			}

			.car-price {
				em {
					float: left;
					font-size: 0.2933rem;
					color: #ff2035;
				}

				font-family: PingFangSC-Medium;
				font-size: 0.4rem;
				color: #ff2035;
			}
		}

		.car-btn {
			.setBox(2.84rem, 100%);
			font-family: PingFangSC-Medium;
			font-size: 0.4rem;
			color: #ffffff;
			text-align: center;
			background-image: linear-gradient(90deg, #ffe082 0%, #fed781 100%);
			transition: all 0.3s;
		}

		.car-on-s {
			background-image: linear-gradient(90deg, #f66900 0%, #f43900 100%);
		}

		.car-on-s-s {
			background-image: linear-gradient(90deg, #f66900 0%, #f43900 100%);
			opacity: .7;
		}

		.car-on {
			background-image: linear-gradient(90deg, #fec205 0%, #fcae02 100%);
		}
	}


	.bar_tip {
		width: 100%;
		height: 0.6rem;
		line-height: 0.6rem;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		position: fixed;
		bottom: 1.42rem;
		z-index: 3;
		left: 0;
		text-align: center;
		width: 100%;
		overflow-x: auto;
		white-space: nowrap;
		padding: 0 0.2rem;
		overflow: auto;

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
</style>