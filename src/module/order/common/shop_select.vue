<template>
	<div id="select-shop">
		<div class="shop-show" v-if="isShow">
			<div class="s-title">
				<div class="left">
					<div class="text">选择店铺</div>
				</div>
				<div class="right" @click="openMyOrder">我的订单 </div>
			</div>
			<section class='choose_shop'>
				<section v-for="(shop,index) in shopList" :key="index">
					<p class="worktime" v-if='index == 0 && shopList.length > 0 && shop.sort == 1'>营业中</p>
					<p class="worktime" v-else-if="shop.sort == '2' && shopList[index > 0 ? index - 1 : 0].sort == 1">闭店中</p>
					<p class="worktime" v-else-if="shop.sort == '2' && index == 0">闭店中</p>
					<div class="chooseList">
						<div class="chose_left">
							<div class="logoImg hide-img"></div>
							<img class="logoImg" :src="shop.logoImage" alt="店铺图片">
							<div v-if="shop.selfHelpStatus == '0' || shop.checkoutType.length == 0" class="s-measking">
								<img class="measkingimg" src="../../../res/images/dayang.png" alt="">
							</div>
						</div>
						<ul class="chose_right">
							<li>
								<div class="text-over name_div">{{shop.name}}</div>
							</li>
							<li>营业时间：{{getStartTime(shop)}}--{{getEndTime(shop)}} |
								<span> {{shop.distance}}</span>
							</li>
							<li class='text-over'>
								<span> 详细地址：{{shop.address}}</span>
							</li>
							<li>
								<img src="../../../res/images/dashed.png" alt="">
							</li>
						</ul>
						<div class="select_mode" v-if="shop.selfHelpStatus != '0' && shop.checkoutType.length > 0">
							<div v-for="(item,index1) in shop.checkoutType" :key='index1'>
								<div v-if="IS_ALI && item.type == 1" class="select_item">
									<img :src="imgObj[item.type]" alt="">
									<span>{{item.name}}</span>
									<span>{{descriObj[item.type]}}</span>
									<span @click="item.online?shopClick(shop,item):''" :class="{able:item.online,disable:!item.online}">{{ item.online ? nameObj[item.type] : "休息中" }}</span>
								</div>
								<div v-else-if="!IS_ALI" class="select_item">
									<img :src="imgObj[item.type]" alt="">
									<span>{{item.name}}</span>
									<span>{{descriObj[item.type]}}</span>
									<span @click="item.online?shopClick(shop,item):''" :class="{able:item.online,disable:!item.online}">{{ item.online ? nameObj[item.type] : "休息中" }}</span>
								</div>
							</div>
						</div>
						<div class="select_mode" v-else-if="shop.selfHelpStatus == '0' || shop.checkoutType.length == 0"></div>
					</div>
				</section>
			</section>
		</div>

	</div>
</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import Distancecount from 'src/verdor/distancecount';

	let shopId = utils.getQueryString('shopId') || 10069;
	let merchId = utils.getQueryString('merchId') || 10013;
	let tableId = utils.getQueryString('tableId');
	let payId = utils.getQueryString('payId');


	if (payId) {
		let obj = {
			'payId': payId,
			'shopId': shopId
		};
		storage.session('payInfo', obj);
	}
	let map = null;
	// let sourceData = []; //原始数据

	export default {
		mixins: [Distancecount],
		data() {
			return {
				shopList: [],
				sessionInfo: {},
				shopId: '',
				time: null,
				type: '',
				token: '',
				goodsUrlMiddle: '',
				shopInfo: {},
				isShow: true,
				payType: '',
				isChoose: '',
				isPay: true, // 商品是否开通在线支付
				selfPay: [], // 支付方式
				selfPayInfo: {}, // 选择的支付方式详细信息
				isShowPay: '', // 是否渲染支付列表组件
				isTakeOut: false, // 是否为外卖
				descriObj: {
					1: '自助下单，快捷方便',
					2: '外卖下单，极速送达',
					3: '自己提，更方便',
					4: '快递到家，省心省力'

				},
				nameObj: {
					1: '自助',
					2: '外卖',
					3: '自提',
					4: '快递'
				},
				imgObj: {
					1: require('../../../res/images/zizhu.png'), // eslint-disable-line
					2: require('../../../res/images/waimai.png'), // eslint-disable-line
					3: require('../../../res/images/ziti.png'), // eslint-disable-line
					4: require('../../../res/images/kuaidi.png'), // eslint-disable-line
				},
				selfHelpConfig: {},
				configStyle: 1,
			};
		},
		methods: {
			getStartTime: function(shop) {
				let s = (shop.openTime - 0);
				let start = Math.floor(s / 60);
				let start1 = this.tranformDate(s - (start * 60));
				return start + ':' + start1;
			},
			getEndTime: function(shop) {
				let e = (shop.closeTime - 0);
				let end = Math.floor(e / 60);
				let end1 = this.tranformDate(e - (end * 60));

				if (end > 24) {
					end -= 24;
				}
				if (end == 24) {
					end == '00';
				}
				return end + ':' + end1;
			},
			tranformDate: function(t) {
				t -= 0;
				if (t < 10) {
					return ('0' + t);
				} else {
					return (t + '');
				}
			},
			changeKm(d) {
				if (d > 1000 || d == 1000) d = (d / 1000).toFixed(2) + 'km';
				if (d > 0 && d < 1000) d = parseInt(d) + 'm';
				return d;
			},
			checkBusiness: function(shop) { //是否在营业时间
				let n = new Date().getHours() * 60 + new Date().getMinutes();
				let s = shop.openTime - 0; //开始时间
				let e = shop.closeTime - 0; //打烊时间		
				if (s == 0 && e == 0) {
					return true;
				} else if (s == '' && e == '') {
					return true;
				}
				if (s != 0 && (e == 0 || e == '')) {
					return true;
				}
				if (s == '' || s == 0) {
					s = 0;
				}
				if ((e <= 1440 && n > s && n < e) || (e > 1440 && (n < (e - 1440) || n > s))) {
					return true;
				} else {
					return false;
				}

			},
			setImg(arr) {
				for (let i = 0; i < arr.length; i++) {
					arr[i].logoImage = global.getImgUrl({
						type: '2',
						url: arr[i].logoImage
					});
					if (arr[i].id == shopId) {
						this.shopInfo = arr[i];
					}
				}
			},
			async getShopList() {
				let shopData = storage.session('select-shop');
				if (shopData) {
					let arr = utils.deepCopy(shopData.shopList);
					this.setImg(arr);
					this.shopList = arr = arr.filter((item) => {
						return item;
					});
				} else {

					let json = await http.choiceShop({
						data: {
							shopId: shopId ? shopId : null,
							merchId: merchId
						}
					}, false, true);
					// json = sourceData;
					let arr = json.data.shopList.map((item1) => {
						item1.checkoutType = Object.values(item1.checkoutType);
						return item1;
					});
					this.setImg(arr);
					this.shopList = arr = arr.filter((item) => {
						return item;
					});
					this.sessionInfo.time = json.time;
					this.time = json.time;
					storage.session('time', this.time);
					let obj = json.data;

					obj.merchId = merchId;
					obj.tableId = tableId;
					obj.accessToken = this.token;
					obj.goodsUrlMiddle = this.goodsUrlMiddle;
					storage.session('select-shop', obj);
				}
				// let i = 0;
				this.shopList = this.shopList.map((item) => {
					item.checkoutStatus = 0;
					if (item.checkoutType.length > 0 && item.selfHelpStatus == '1') {
						item.sort = 1;
					} else if (item.checkoutType.length == 0 || item.selfHelpStatus == '0') {
						item.sort = 2;
					}
					this.$set(item, 'online', this.checkBusiness(item));

					for (let i = 0; i < item.checkoutType.length; i++) {
						let item1 = item.checkoutType[i];
						if (item1.status == '1') {
							item.checkoutStatus = 1;
						} else if (item1.status == '0') {
							item.checkoutStatus = 0;
						}

						//如果开启自身模式的营业时间
						if (item1.openTimeStatus == '1') {
							item1.online = this.checkModeTime(item1);
						} else {
							//使用店铺的营业时间
							item1.online = item.online;
						}
					}
					return item;
				});
				this.shopList = utils.sortByAll(this.shopList, ['sort'], true);
				this.distanceGD();
				await this.getTemplateStyle(shopId);
				await this.SquareConfig();
			},
			//检查模式的营业时间是否在营业中
			checkModeTime(item) {
				// let isOnline = false;
				let now = Date.now();
				let tempYM = utils.getTime({
					time: now,
					format: 'yyyy/MM/dd'
				}).format + ' ';
				const dayTime = 86400000;
				if (item.openTime.type == 'week') {
					let day = new Date().getDay();
					for (let temp of item.openTime.list) {
						let start = new Date(tempYM + temp.startslot).getTime();
						let end = new Date(tempYM + temp.endslot).getTime() + (temp.isNextDay ? dayTime : 0);
						//满足星期
						if (now > start && now < end && temp.week.indexOf(day) > -1) {
							return true;
						}
						if (temp.isNextDay) {
							let prevDay = day - 1 < 0 ? 6 : day - 1;
							if (now > start && now < end && temp.week.indexOf(prevDay) > -1) {
								return true;
							}
						}

					}
				} else {
					let date = new Date().getDate();
					for (let temp of item.openTime.list) {
						let start = new Date(tempYM + temp.startslot).getTime();
						let end = new Date(tempYM + temp.endslot).getTime() + (temp.isNextDay ? dayTime : 0);
						//满足月份对应的天数

						if (now > start && now < end && temp.month.indexOf(date) > -1) {
							return true;
						}

						if (temp.isNextDay) {

							let preDayDate = new Date(now - dayTime);
							preDayDate.setDate(0);
							let prevDay = date - 1 <= 0 ? preDayDate.getDate() : date - 1;
							if (now > start && now < end && temp.month.indexOf(prevDay) > -1) {
								return true;
							}

						}

					}
				}
				return false;
			},
			async shopClick(shop, item, isPage = false) {
				storage.session('channelType',1);
				storage.session('selectPayWay', item);
				storage.session('shopInfo', shop);
				let selectId = storage.session('selectPayWay') ? storage.session('selectPayWay').id : '';
				let bol = this.checkBusiness(shop);
				this.shopInfo = shop;
				shopId = shop.id;
				
				if (!isPage) {
					await this.SquareConfig(item);
					await this.getTemplateStyle(shopId);
				}
				if (shop.payType != '' && bol) {
					let shopData = storage.session('select-shop');
					shopData.id = shop.id;
					shopData.shopName = shop.name;
					shopData.closeTime = shop.closeTime;
					shopData.shopInfo = this.shopInfo;
					storage.session('select-shop', shopData);
					!isPage && (this.isShow = true);

				} else {
					let obj = storage.session('select-shop');
					obj.shopInfo = this.shopInfo;
					storage.session('select-shop', obj);

					let routerPage = !isPage ? 'push' : 'replace';
					this.goPage(routerPage);
					return;
				}
				if (selectId != item.id) {
					this.$store.commit('resetShopCar');
				}
				this.goPage();
			},

			async getTemplateStyle(shopId) {
				let res = await http.getTemplateStyle({
					data: {
						shopId: shopId,
					}
				});
				this.configStyle = res.selfhelpStyle;
			},
			openMyOrder: function() {
				let obj = storage.session('select-shop');
				obj.id = (obj.id == undefined) ? obj.shopList[0].id : obj.id;
				storage.session('select-shop', obj);
				this.$router.push('/memberCenterOrderData');
			},
			async SquareConfig() {
				let SelfHelpConfig = await http.getSelfHelpConfig({
					data: {
						shopId: shopId
					}
				});

				this.type = SelfHelpConfig.status;
				this.isChoose = SelfHelpConfig.isChoose;

				if (this.isChoose == '0') {
					// no-empty
				} else {
					this.isShow = true;
				}

				storage.session('SelfHelpConfig', SelfHelpConfig);
				this.$store.dispatch('showLoad', false);
				return SelfHelpConfig.status;
			},
			reflowShop: function(data) {
				this.shopClick(data);
			},
			closeWin() {
				this.isShowPay = '';
			},
			goPage(type = 'push') {
				console.log(this.configStyle, 'configStyle');
				storage.session('configStyle', this.configStyle);
				if (this.configStyle == 1) {
					this.$router[type]('/order');
				} else if (this.configStyle == 2) {
					this.$router[type]('/latestOrder');
				}
				// storage.session('selectPayWay', obj);
			},
		},
		components: {
			payList: () =>
				import( /* webpackChunkName: 'payList' */ 'src/components/pay_list')
		},
		async beforeRouteEnter(to, from, next) {
			storage.session('squarePattern', true);
			// let json = await http.choiceShop({
			// 	data: {
			// 		shopId: shopId ? shopId : null,
			// 		merchId: merchId
			// 	}
			// }, false, true);
			// sourceData = json;

			// let list = json.data.shopList;
			let res = await http.getTemplateStyle({
				data: {
					shopId: shopId,
				}
			});
			let configStyle = res.selfhelpStyle;

			let SelfHelpConfig = await http.getSelfHelpConfig({
				data: {
					shopId: shopId
				}
			});
			let list = storage.session('select-shop')?storage.session('select-shop').shopList:[];
			let obj = storage.session('select-shop')?storage.session('select-shop'):{};
			let accessToken = storage.session('token');
			obj.accessToken = accessToken;
			// obj.goodsUrlMiddle = '';
			// obj.merchId = merchId;
			// obj.tableId = tableId;
			if (SelfHelpConfig.isChoose == '0') {
				if (payId) {
					let item;
					let pay = SelfHelpConfig.pay;
					for (let i = 0; i < pay.length; i++) {
						if (payId == pay[i].id) {
							item = pay[i];
							break;
						}
					}
					storage.session('selectPayWay', item);
					storage.session('SelfHelpConfig', SelfHelpConfig);
					// storage.session('shopInfo', item);
					storage.session('select-shop', obj);
					storage.session('configStyle', configStyle);
					next({
						path: configStyle == 1 ? '/order' : '/latestOrder',
						replace: true
					});

				} else {
					let item;
				
					for (let j = 0; j < list.length; j++) {
						if (shopId == list[j].id) {
							item = list[j];
							break;
						}
					}

					if (item && Object.values(item.checkoutType).length == 1) {
						storage.session('selectPayWay', Object.values(item.checkoutType)[0]);
						storage.session('SelfHelpConfig', SelfHelpConfig);
						storage.session('shopInfo', item);
						storage.session('select-shop', obj);
						storage.session('configStyle', configStyle);
						next({
							path: configStyle == 1 ? '/order' : '/latestOrder',
							replace: true
						});
					} else {
						next();
					}
				}

			} else {
				next();
			}
			next();
		},
		async mounted() {
			map = await
			import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			this.getShopList();
			storage.session('squarePattern', true);
			let rshop = storage.session('order-reflow');
			if (rshop && rshop != '2') {
				this.reflowShop(rshop.shop);
			}
			if (this.selfPay.length === 1 && this.selfPay[0].type === '2') {
				//如果自助模式支付方式为一种，并且type为2，则为外卖。
				this.selfPayInfo = this.selfPay[0];
			}

			// this.$store.commit('resetShopCar');
			storage.session('ls_top', null);
			storage.session('ls_aside_top', null);
			utils.setTitle('选择店铺');

		}
	};
</script>

<style lang="less" scoped>
	#select-shop {
		width: 100%;
		height: 100%;
	}

	#select-shop .shop-show {
		width: 10rem;
		height: 100%;
		margin: 0 auto;
	}

	#select-shop .s-title {
		width: 10rem;
		height: 1.3rem;
		line-height: 1.3rem;
		font-size: 0.45rem;
		color: #FFFFFF;
		position: fixed;
		top: 0;
		left: 50%;
		z-index: 66;
		transform: translate(-50%, 0);
		-webkit-transform: translate(-50%, 0);
		background-color: #F5BF4F;
	}

	#select-shop .s-title div {
		width: 4.9rem;
		float: left;
		vertical-align: middle;
	}

	#select-shop .s-title div.left {
		padding-left: 0.4rem;
	}

	#select-shop .s-title div.left div {
		float: left;
	}

	#select-shop .s-title div.left div.img {
		width: 0.6rem;
		height: 1.3rem;
	}

	#select-shop .s-title div.left div.img img {
		width: 0.56rem;
		height: 0.56rem;
		float: left;
		margin-top: 0.36rem;
	}

	#select-shop .s-title div.left div.text {
		width: 3.6rem;
		font-size: 0.42rem;
	}

	#select-shop .s-title div.right {
		text-align: right;
		font-size: 0.42rem;
	}

	#select-shop .shop-show .show-list {
		width: 8.4rem;
		height: 15rem;
		position: absolute;
		top: 1.7rem;
		left: 0.8rem;
		overflow: scroll;
		-webkit-overflow-scrolling: touch
	}

	#select-shop .shop-show .show-list .shop {
		float: left;
		width: 4rem;
		height: 5rem;
		position: relative;
	}

	#select-shop .shop-show .show-list .shop div {
		text-align: center;
		width: 4rem;
		height: 1rem;
		line-height: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.s-measking {
		background-color: rgba(0, 0, 0, 0.4);
		position: absolute;
		top: 0rem;
		color: #FFFFFF;
		overflow: hidden;
		z-index: 5;
		width: 2.22rem;
		height: 2.22rem;
		float: left;
		text-align: center;
		border: 1px solid #ddd;
		margin: 0.22rem;

		img.measkingimg {
			width: 84%;
			margin-top: 0.52rem;
		}
	}

	.s-measking div span {
		float: left;
		display: block;
		width: 100%;
		height: 0.7rem;
	}

	.s-measking div .measkingimg {
		width: 1.5rem;
		position: relative;
		top: 0.28rem;
	}

	#select-shop .shop-show .show-list .shop:nth-child(2n) {
		margin-left: 0.4rem;
	}

	#select-shop .shop-show .show-list .shop div.img {
		position: relative;
		width: 4rem;
		height: 4rem;
		background-color: #FFFFFF;
		border-radius: 0.2rem;
		overflow: hidden;

		.hide-img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}

	#select-shop .shop-show .show-list .shop div.img img {
		width: 100%;
		height: 100%;
	}

	.choose_shop {
		background: #f7f7f7;
		min-height: 100%;
		overflow-y: scroll;
		padding-bottom: 2rem;
		margin-top: 1.3rem;

		section {
			margin-bottom: 0.2rem;

			.worktime {
				padding: 0.16rem 0.24rem 0.12rem;
				font-size: 0.38rem;
				color: #424242;
				font-weight: 600;
			}

			header {
				height: 2rem;
				background-color: rgb(24, 24, 24);

				&>div {
					width: 90%;
					margin: 0 auto;
					height: 2rem;
					font-size: 0.4rem;
					color: #FFFFFF;
					line-height: 2rem;
					text-align: center;
				}
			}

			.chooseList {
				width: 100%;
				background: #fff;

				.chose_left {
					width: 2.66rem;
					height: 2.66rem;
					float: left;
					position: relative;
				}

				&>div {
					img.logoImg {
						width: 2.2rem;
						height: 2.2rem;
						float: left;
						text-align: center;
						border: 1px solid #ddd;
						margin: 0.22rem;
					}
				}

				ul {
					width: 7.32rem;
					float: left;
					margin-top: 0.2rem;

					li {
						line-height: 0.53rem;
					}

					li:nth-child(1) {
						font-size: 0.4rem;
						color: #303030;
						font-weight: 600;
						position: relative;
						margin-bottom: 0.12rem;

						.name_div {
							width: 5rem;
						}

						.dy {
							float: right;
							width: 0.3rem;
							height: 0.3rem;
							color: #333;
							border: 0.038rem solid #ccc;
							transform: rotate(45deg);
							-ms-transform: rotate(45deg);
							-moz-transform: rotate(45deg);
							-webkit-transform: rotate(45deg);
							-o-transform: rotate(45deg);
							border-bottom: 0;
							border-left: 0;
							position: absolute;
							right: 3%;
							bottom: 0.08rem;
						}

						span {
							float: right;
							margin-right: 0.2rem;
							font-size: 0.32rem;
							color: #ef6e4d;
							font-weight: 500;
							position: absolute;
							right: 0.4rem;
							top: 0rem;
						}
					}

					li:nth-child(2),
					li:nth-child(3) {
						font-size: 0.32rem;
						color: #ACACAC;
					}

					li:nth-child(3) {
						position: relative;

						span {
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							width: 80%;
							display: inline-block;
						}
					}

					li:nth-child(4) {
						position: relative;
						color: #fff;
						font-size: 0.282rem;
						width: 100%;
						top: 0;

						span {
							padding: 0.06rem 0.12rem;
							border-radius: 6px 0;
						}
					}

					li:last-child {
						img {
							width: 6.88rem;
						}
					}
				}

				.select_mode {
					clear: both;
					margin: 0 0.22rem;
					width: 9.56rem;

					&>div {
						.select_item {
							display: flex;
							align-items: center;
							height: 1rem;
							line-height: 1rem;
							position: relative;
							top: -0.1067rem;

							img {
								width: 0.4rem;
								height: 0.4rem;
								margin-right: 0.12rem;
							}

							span:first-of-type {
								font-size: 0.32rem;
								color: #565656;
							}

							span:nth-of-type(2) {
								margin-left: 0.2rem;
								font-size: 0.24rem;
								color: #ACACAC;
							}

							.able {
								display: inline-block;
								font-size: 0.32rem;
								color: #FFFFFF;
								background: #FCAE02;
								border-radius: 1.3333rem;
								width: 1.2267rem;
								height: 0.6667rem;
								text-align: center;
								line-height: 0.6667rem;
								position: absolute;
								right: 0rem;
							}

							.disable {
								display: inline-block;
								font-size: 0.32rem;
								color: #FFFFFF;
								background: #a8a8a8;
								border-radius: 1.3333rem;
								width: 1.2267rem;
								height: 0.6667rem;
								text-align: center;
								line-height: 0.6667rem;
								position: absolute;
								right: 0rem;
							}

							span.rest {
								background: #d8d8d8
							}
						}
					}
				}
			}
		}
	}
</style>