<template>
	<div id="newOrder">
		<!--点单页面-->
		<div class="order" id="order" v-cloak>
			<goodsClassify :navsList="headerList" @navs="getGoods" :marqueeShow=marqueeShow @closeBtn=closeBtn :marquee=marquee></goodsClassify>
			<div :class={goodsShow:marqueeShow,goodsShows:!marqueeShow} ref="goodsShow">
				<div class="goods-c1">
					<template v-for="(g,index) in firstGoods">
						<div class="c1" :key="index">

							<div class="ban-goods" v-if="banGoods(g)">

								<div class="ban-line" style="left: 0;">
								</div>
								<div class="ban-text ban-center">
									售完
								</div>
								<div class="ban-line" style="right: 0;">
								</div>
							</div>
							<div class="c1-c">
								<div class="img" @click="showGoodsDetail(g,index)">
									<div class="hide-img"></div>
									<img :src="getImgUrl(g.imageName)" alt="" />
								</div>
								<div class="name">
									<img v-if="g.isSpecial" src="../../../res/images/special_icon.png" alt="">
									<img v-if="g.isMust" src="../../../res/images/must.png" alt="">
									<div v-if="g.goodsName">{{g.goodsName}}</div>
									<div v-else>{{g.packageName}}</div>
								</div>

								<div class="rect_price">

									<span v-if='g.isShowAvailPrice' class="vipprice">
										<template v-if="g.isSpecial">
											¥{{g.specialPrice}}{{g.isGroup > 0 ? '起' : ''}}
										</template>
										<template v-else>
											¥{{g.memberPrice}}{{g.isGroup > 0 ? '起' : ''}}
										</template>
									</span>
									<span :class=" g.isShowAvailPrice ? 'hasVip' : 'noVip' " style="margin-left:0.2rem">¥{{g.price}}</span>

								</div>
								<img src="../../../res/images/msg-bg-number.png" class="triangle" v-if="getGoodsMaxNum(g)" />
								<div class="num" v-if="getGoodsMaxNum(g)">{{getGoodsMaxNum(g)}}</div>

							</div>
							<div class="plohder">
								<img src="../../../res/images/msg-label-taocan.png" v-if="g.packageName" />
								<img src="../../../res/images/msg-label-jinliang.png" v-if="!g.packageName && g.type == 1" />
								<img src="../../../res/images/msg-label-taste.png" v-if="!g.packageName &&  g.isAttr" />
							</div>
							<div class="hot-goods" style="bottom: 0;" v-if="g.isRecommend == 1">
								<img style="bottom: -0.2rem;width:1.2rem" src="../../../res/images/hot-goods.png" />
							</div>
						</div>
					</template>
				</div>

				<div class="goods-c2">
					<template v-for="(g,index) in secondGoods">
						<div class="c2" :key="index">

							<div class="img" @click="showGoodsDetail(g,index)">
								<div class="ban-goods" v-if="banGoods(g)">
									<div class="ban-line" style="left: 0;">
									</div>
									<div class="ban-text ban-center" style="font-size: 0.4rem;">
										售完
									</div>
									<div class="ban-line" style="right: 0;">
									</div>
								</div>
								<img class='goods_img' :src="getImgUrl(g.imageName)" alt="" />

							</div>
							<div class="con">
								<div class="con-name" v-if="g.goodsName">
									<img v-if="g.isSpecial" src="../../../res/images/special_icon.png" alt="">
									<img v-if="g.isMust" src="../../../res/images/must.png" alt="">
									{{g.goodsName}}
								</div>
								<div class="con-name" v-else>
									<img v-if="g.isSpecial" src="../../../res/images/special_icon.png" alt="">
									<img v-if="g.isMust" src="../../../res/images/must.png" alt="">
									{{g.packageName}}
								</div>
								<div class="con-explain">
									<div class="kind" v-if="!g.packageName && g.isAttr">口味</div>
									<div class="kind" style="background-color: #5A80CD;" v-if="g.packageName">套餐</div>
									<div class="kind" style="background-color: #C68850;" v-if="!g.packageName && g.type == 1">斤两菜</div>
								</div>
								<div class="con-operation">
									<div class="price" style="width: 59%;">

										<span v-if='g.isShowAvailPrice' class="vipprice">
											<template v-if="g.isSpecial">
												¥{{g.specialPrice}}{{g.isGroup > 0 ? '起' : ''}}
											</template>
											<template v-else>
												¥{{g.memberPrice}}{{g.isGroup > 0 ? '起' : ''}}
											</template>
										</span>
										<span :class=" g.isShowAvailPrice ? 'hasVip' : 'noVip' " style="margin-left:0.2rem">¥{{g.price}}</span>

									</div>

									<riskAdd :counter="getGoodsMaxNum(g)" :index="g.id" :max="99" class="btn_add" :exter="exterStatic(g)" @sendCounter='(obj) => {getCounter(obj,g)}'></riskAdd>

								</div>
							</div>
							<div class="hot-goods" style="top: 0;" v-if="g.isRecommend == 1">
								<img style="top: -0.2rem;" src="../../../res/images/hot-goods.png" />
							</div>
						</div>
					</template>
					<pullup v-if='showUp' :distance="150" :delay="50" :fn="loadDom" :show="tips"></pullup>
				</div>
			</div>
			<shopCar></shopCar>
			<transition name='fade'>
				<component :is="currentView" v-if="show" @close="closeWin"></component>
			</transition>
			<section v-if="isShowOutline" id="outline">
				<header class="outline-header">
					<ul>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
					</ul>
				</header>
				<section class="outline-content">
					<ul>
						<li>
							<div></div>
							<p></p>
							<p></p>
						</li>
						<li>
							<div></div>
							<p></p>
							<p></p>
						</li>
						<li>
							<div></div>
							<p></p>
							<p></p>
						</li>
						<li>
							<div></div>
							<p></p>
							<p></p>
						</li>
					</ul>
				</section>
				<section class="outline-list">
					<div class="goods-list">
						<div class="goods-left"></div>
						<div class="goods-right">
							<p></p>
							<p></p>
							<p>
								<span></span>
								<span></span>
							</p>
						</div>
					</div>
					<div class="goods-list">
						<div class="goods-left"></div>
						<div class="goods-right">
							<p></p>
							<p></p>
							<p>
								<span></span>
								<span></span>
							</p>
						</div>
					</div>
				</section>
				<footer class="footer">
					<p></p>
					<p></p>
				</footer>
			</section>
		</div>
		<span class="smallBoll" ref="smallBoll"></span>

	</div>
</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import goodsClassify from './goods_classify';
	import global from 'src/manager/global';
	import http from 'src/manager/http';
	//供懒加载使用
	/* eslint-disable */
	import store from 'src/module/order/data/details_store';

	let lastSecondDom = null;
	let timer = '';
	const hh = utils.getWindowWH().h;
	// const isPhone = utils.isPhone();
	let scrollTop = 0;
	let orderData = null;
	let isInitAagin = false; //是否数据解析失败重新加载了

	let app = document.querySelector('#app');

	export default {
		data() {
			return {
				c1: [], //方块样式的列表（固定4个）
				c2: [], //列表样式的列表
				selectWay: false, //选择方式
				selectPayWay: '', //选择的支付方式
				isShowVipPrice: storage.session('isShowVipPrice'),
				groupGoodsObj: null,
				currentView: '',
				show: false, //是否展示商品详情和购物车内容
				headerList: [], //导航列表
				goodsList: [], // 显示的商品列表
				menuInfo: {
					id: '-1',
					pid: '-1'
				}, // 选中的分类信息
				secondGoods: [], //第二部分数据列表显示
				isShowOutline: true,
				memberInfo: null, // 自助模式取memberInfo，微信点餐取wechatShop
				discount: null, // 获取会员等级折扣
				showUp: false,
				tips: true,
				mustList: [],
				isMember: null,
				marqueeShow: false,
				marquee: null,
				queeshow: false
			};
		},
		watch: {
			selectWay: 'chengeHB'
		},
		methods: {
			closeBtn() {
				this.marqueeShow = false;
			},
			exterStatic(obj) {
				let exterStaus = '';
				if (obj.isGroup > 0 || Boolean(obj.type == '1' && obj.goodsName) || Boolean(this.packages) || Boolean(
						obj.packageName) || obj.isAttr) {
					exterStaus = 'all';
				}
				return exterStaus;
			},

			//加减组件的事件
			getCounter(obj, gObj) {

				if (gObj.packageName) {
					this.openPackage(gObj);
					return;
				}

				gObj.num = obj.number || 0;
				let item = gObj;
				let content;


				if (item.isAttr || item.type == 1 || item.isGroup == 1) {
					//口味
					if (obj.type == 'add') {
						orderData._oGood = gObj;
						this.show = true;
						this.$store.commit('setOverHide', true);
						this.currentView = 'goodsdetail';
					} else {
						content = '请在购物车中删除';
					}
				} else {

					let goods = {
						data: utils.deepCopy(item), // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'splice'
					};
					this.$store.commit('setCarList', goods);

				}
				this.$store.commit('setWin', {
					content: content
				});


			},

			getGoodsMaxNum(obj) {
				let GoodsMaxNum = this.$store.state.order.shopCarObj[(!!obj.goodsName - 0) + '_' + obj.id] || 0;
				return GoodsMaxNum;
			},

			getGoods(navInfo) {

				//搜索

				this.menuInfo = navInfo;
				if (navInfo.name == 'search') {
					this.$router.push('/search');
				} else {
					let padding = '1.75rem';
					let classNames =
						navInfo.type == '2' || navInfo.child.length >= 1 ?
						'childShow' :
						'goodsShow';
					this.$refs.goodsShow.setAttribute('class', classNames);
					if (classNames == 'childShow' && this.marqueeShow == true) {
						padding = '2.8rem';
					} else if (classNames == 'childShow' && this.marqueeShow == false) {
						padding = '1.75rem'
					}
					document.getElementById('app').scrollTop = 0;
					if (navInfo.child) {
						//一级
						this.getGoodsList(navInfo);

						if (navInfo.child.length == 0 && this.marqueeShow == true) {
							padding = '2.25rem';
						} else if (navInfo.child.length == 0 && this.marqueeShow == false) {
							padding = '1.25rem';
						}
					} else {
						//二级

						this.getGoodsList(navInfo, 'second');
					}

					console.log(padding);

					this.$refs.goodsShow.style['padding-top'] = padding;
					if (padding == '2.51rem') this.$refs.goodsShow.style['padding-bottom'] = '1.33333rem';
					clearTimeout(timer);
					timer = '';
					scrollTop = 0;
				}
			},
			closeWin() {
				//放入宏任务里执行
				setTimeout(() => {
					this.$store.commit('setOverHide', false);
					this.show = false;
				});
			},
			dataReflow(data) {
				// 把点餐数据加入进去
				/**
				 * 满足产品的需求，重新点单把菜品进入购物车
				 */
				let goods = data.goods;
				let packages = data.package;
				let arr = [];
				arr = arr.concat(goods, packages);
				setTimeout(() => {

					if (data.shop) {
						for (let item of arr) {
							let obj = {
								data: item, // 商品数据
								operateType: 'push', // 操作类型
								operateObj: 'carGoodsList' // 操作对象
							};
							if (item.name) {
								item.goodsName = item.name;
								obj.operateObj = 'carGoodsList';
								this.$store.commit('setCarList', obj);
							} else {
								obj.operateObj = 'carPackageList';
								this.$store.commit('setCarList', obj);
							}
						}
					}

				}, 500);
			},
			init() {

				this.groupGoodsObj = storage.session('groupGoodsObj');
				this.getNavList();

				let rshop = storage.session('order-reflow');
				if (rshop && rshop != 2) {
					this.dataReflow(rshop.data);
					storage.session('order-reflow', '2');
				}

				let shopData = storage.session('select-shop');
				let wechatShop = storage.session('wechatShop');
				let loginData = storage.session('loginData');

				this.mustList = orderData.cidGoodsList[-4];
				storage.session('mustList', this.mustList);
				// 初始化懒加载配置

				let shopName = storage.session('shopInfo') ?
					storage.session('shopInfo').name :
					storage.session('wechatShop').shopName;
				let info = storage.session('bespeak_shopInfo');
				if (info) {
					shopName = info.name;
				}
				utils.setTitle(shopName);
			},
			getImgUrl: function(urls) {
				return global.getImgUrl({
					type: '2',
					url: urls
				});
			},
			closeBtn() {
				this.marqueeShow = false;
			},
			getNavList: function() {
				let arr = orderData.navsList;
				if (arr.length == 0) {
					this.$store.commit('setWin', {
						content: '该渠道无商品!'
					})
					return;
				}
				this.headerList = arr;
			},
			getTastePrice: function(g, price) {
				/**
				 * @param {Object} g // 商品数据
				 * @param {String} price // 会员价或普通价格
				 */

				// 获取口味价格
				let TastePrice = 0; // 口味价格
				let bol = false; // 是否开启区间
				let taste = g.isAttr ? g.attr : [];

				if (taste.length === 0) return price;
				for (let i = 0; i < taste.length; i++) {
					if (taste[i].attrObj.type != 0 && taste[i].attrObj.minPrice) {
						// 开启口味区间则口味最小价格累加
						TastePrice += Number(taste[i].attrObj.minPrice);
						bol = true;
					}
				}

				let str = Number(TastePrice) + Number(price);
				str = bol ? (str += '起') : str;
				return str;

			},
			getGoodsList: function(nav) {
				//得到商品列表

				let goods = (nav ? orderData.cidGoodsList[nav.id] : orderData.cidGoodsList[orderData.navsList[0].id]) || [];
				//一级菜单
				if (nav && nav.child) {
					for (let i = 0; i < nav.child.length; i++) {
						goods = goods.concat(orderData.cidGoodsList[nav.child[i].id] || []);
					}
				}


				this.goodsList = goods;
				if (goods.length > 20) this.showUp = true;
				else this.showUp = false;
				this.secondGoods = goods.slice(4, 20);
				this.$nextTick().then(() => {
					this.isShowOutline = false;
				});
			},
			openPackage: function(packages) {
				//进入套餐页面
				packages = orderData.getPackage(packages);
				storage.session('searchPackage', packages);

				this.$router.push('/package');
			},
			checkGoods(goods) {
				if (!goods.goodsName) return false;
				if (goods.status == 1) return true;
				if (goods.isStock != 1) return false;
				if (goods.goodsNum == 0) return true;
				let num = this.getCarNum(goods);
				if (num >= goods.goodsNum) return true;
				return false;
			},
			banGoods: function(g) {
				// 是否显示售罄
				if (g.status == 1 || g.goodsName && g.goodsNum == 0 && g.isStock == 1 && g.isGroup !=
					'1') return true;
			},
			getCarNum: function(g) {
				let arr = [];
				if (g.packageName) {
					arr = orderData.oPackageList;
				} else {
					arr = orderData.oGoodsList;
				}
				let num = 0;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].id == g.id) {
						if (g.goodsName) {
							num += arr[i].num - 0;
						}
					}
				}
				return num;
			},
			showGoodsDetail(g, index) {
				//展示商品详情
				if (!this.banGoods(g)) {
					if (!g.packageName) {
						g.isGroupGoods = Boolean(orderData.groupGoodsObj[g.id]);
						orderData._oGood = g;
						this.show = true;

						this.$store.commit('setOverHide', true);

						this.currentView = 'goodsdetail';
					} else {
						this.openPackage(g);
					}
				}
			},
			getPackageByID: function(id) {
				let p = utils.deepCopy(orderData.oPackageList);
				let info,
					num = 0;
				for (let i = 0; i < p.length; i++) {
					if (p[i].id == id) {
						num++;
						info = p[i];
					}
				}
				if (num > 1) {
					this.$store.commit('setWin', {
						content: '请改数量只能在购物车'
					});
					return false;
				} else if (num == 1) {
					return info;
				}
			},
			getCargroupGoods: function(id) {
				let arr = this.carGoodsList;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].groupId == id) {
						return arr[i];
					}
				}
				return {};
			},
			getIsGood: function(id) {
				// 是否有包含口味的菜品在购物车中
				let goods = this.$store.state.order.carGoodsList;
				for (let i = 0; i < goods.length; i++) {
					if (goods[i].id == id && goods[i].attrInfo != '') {
						return true;
					}
				}
				return false;
			},
			loadDom() {
				if (this.secondGoods.length < this.goodsList.length) {
					let data = this.goodsList.slice(
						this.secondGoods.length + 4,
						this.secondGoods.length + 24
					);
					this.secondGoods.push(...data);
				} else {
					this.tips = false;
				}

				if (this.secondGoods.length == this.goodsList.length - 4) {
					this.tips = false;
				}
			},
			async setMemberInfo() {
				// 自助模式获取会员信息
				let selectShop = storage.session('select-shop');
				let memberInfo = storage.session('memberInfo');

				this.memberInfo = selectShop ?
					memberInfo :
					storage.session('wechatShop');

				let discount = this.memberInfo.member ?
					this.memberInfo.member.level.discount / 100 :
					1;

				//是粉丝
				// let isFans = !memberInfo.member && memberInfo.discount;
				// let fansHaveDis = isFans && memberInfo.discount.isDiscount;
				// if(isFans && memberInfo.discount.isDiscount){
				//     discount = memberInfo.discount.discount / 100;
				//     this.memberInfo.member = discount;
				// }

				this.$store.commit('setMemberInfo', {
					isMember: Boolean(this.memberInfo.member),
					memberDiscount: discount
				});
			},
			async getUserInfo() {
				// 自助模式获取会员信息

				let selectShop = storage.session('select-shop');
				let memberInfo = storage.session('memberInfo');
				if (selectShop && !memberInfo) {
					let userData = await http.getUserInfo({
						data: {
							shopId: this.shopId,
							type: 1,
							from: 0
						}
					});

					let login = storage.session('login');
					for (let key in login) {
						userData[key] = login[key];
					}
					storage.session('memberInfo', userData);
				}

				this.memberInfo = storage.session('select-shop') ?
					storage.session('memberInfo') :
					storage.session('wechatShop');
				this.discount = this.memberInfo.member ?
					this.memberInfo.member.level.discount / 100 :
					1;

				//是粉丝
				// let isFans = !memberInfo.member && memberInfo.discount;
				// let fansHaveDis = isFans && memberInfo.discount.isDiscount;
				// if(isFans && memberInfo.discount.isDiscount){
				// 	discount = memberInfo.discount.discount / 100;
				// 	this.memberInfo.member = discount;
				// }

				this.$store.commit('setMemberInfo', {
					isMember: Boolean(this.memberInfo.member),
					memberDiscount: this.discount
				});
			},
			getVipPrice(goods) {
				// 获取会员价格
				if (goods.isVip === '1' && this.memberInfo.member) {
					return (goods.price * this.discount).toFixed(2); // 计算出会员折扣价
				} else {
					return goods.vipPrice;
				}
			}
		},
		components: {
			goodsdetail: () =>
				import( /* webpackChunkName: 'goods_detail' */ './goodsdetail'),
			shopCar: () =>
				import( /* webpackChunkName: 'shop_car' */ './shop_car'),
			pullup: () =>
				import( /* webpackChunkName: 'pullup' */ 'src/components/phone/pullup'),
			goodsClassify,
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue'),
		},
		computed: {
			parseOk() {
				return this.$store.state.parseOk;
			},
			firstGoods() {
				// 分割出第一个商品展示模块
				return this.goodsList.slice(0, 4);
			}
		},
		watch: {
			parseOk(newV, oldV) {

				if (newV) {
					this.init();
				}
			}

		},
		updated() {},
		beforeDestroy() {
			timer = '';
			scrollTop = 0;
		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');

			orderData = orderData.default;
			let selectPayWay = storage.session('selectPayWay');
			this.marquee = selectPayWay && selectPayWay.marquee;
			this.marqueeShow = !!this.marquee;
			this.getUserInfo();

			let refreshInfo = storage.session('refresh');
			this.$store.commit('setOverHide', false);
			if (!refreshInfo) {
				let num = 1;
				storage.session('refresh', num);
			} else {
				let num = storage.session('refresh');
				num += 1;
				storage.session('refresh', num);
			}

			orderData.init();
			// await this.setMemberInfo();
			console.log(this.marqueeShow, 'w');
		},
		// created() {}
	};
</script>
<style lang='less' scoped>
	@import "../../../res/css/base.less";
	/** rem转px公式为：rem * 75 = px;  */

	.order {
		width: 10rem;

		.title {
			width: 10rem;
			height: 1.25333rem;
			background-color: #f7f7f7;
			border-bottom: 1px solid #dddddd;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 6;
		}

		.lazyloadDiv {
			.px2rem(width, 750);
			.px2rem(height, 100);
		}

		.goodsShow {
			padding: 1.25333rem 0;
			margin-top: 0.2rem;

		}

		.goodsShows {
			position: relative;
			top: -0.8rem;
		}

		.goods-c1 {
			width: 9.86667rem;
			height: 10rem;
			padding: 0 0.06667rem;

			.c1 {
				width: 4.53333rem;
				height: 4.53333rem;
				background-color: #fff;
				float: left;
				margin: 0.26667rem 0 0 0.26667rem;
				border-radius: 0.10667rem;
				position: relative;

				.img {
					position: relative;
					width: 100%;
					height: 3.3333333rem;

					img {
						width: 100%;
						height: 100%;
					}

					.hide-img {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						z-index: 2;
						opacity: 0;
						/* background: red; */
					}
				}

				.price,
				.name {
					text-align: center;
					width: 100%;
					height: 0.73333rem;
					font-size: 0.42667rem;
					line-height: 0.73333rem;
					font-weight: 300;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					padding-top: 0.02667rem;

					div {
						display: inline-block;
					}

					img {
						width: 0.3467rem;
						vertical-align: middle;
					}
				}

				.price {
					font-size: 0.37333rem;
					height: 0.46667rem;
					line-height: 0.46667rem;
					font-weight: 600;
					margin-top: -0.13333rem;
				}

				.plohder {
					position: absolute;
					left: -0.08rem;
					top: 0.53333rem;
					width: 0.93333rem;
					height: auto;

					img {
						float: left;
						width: 100%;
						margin-top: 0.13333rem;
					}
				}

				.triangle {
					position: absolute;
					top: 0;
					right: 0;
					width: 0.8rem;
					height: 0.8rem;
				}

				.num {
					position: absolute;
					top: 0;
					right: 0;
					width: 0.42667rem;
					height: 0.53333rem;
					line-height: 0.53333rem;
					font-size: 0.29333rem;
					color: #ffffff;
					text-align: center;
					overflow: hidden;
				}
			}

			.c1-c {
				overflow: hidden;
				border-radius: 0.10667rem;

				.rect_price {
					text-align: center;

					.vipprice,
					.noVip {
						font-size: 0.3467rem;
						color: #FF463B;
						font-weight: 600;
					}

					.hasVip {
						font-size: 0.32rem;
						color: #888888;
						text-decoration: line-through;
					}
				}
			}
		}

		.goods-c2 {
			margin-bottom: 2rem;

			.c2 {
				height: 2.4rem;
				background-color: #fff;
				position: relative;
				border-bottom: 1px solid #dddddd;

				.img {
					position: absolute;
					top: 0.05333rem;
					left: 0.05333rem;
					width: 3.06667rem;
					height: 2.29333rem;
				}

				img.goods_img {
					width: 100%;
					height: 100%;
				}

				.con {
					width: 6.4rem;
					height: 100%;
					padding-left: 3.33333rem;
					padding-right: 0.26667rem;

					.con-name {
						font-size: 0.37333rem;
						padding-top: 0.13333rem;
						width: 6.4rem;
						color: #000000;
						height: 0.96rem;
						max-height: 0.96rem;
						line-height: 0.4rem;
						vertical-align: middle;
						overflow: hidden;
						display: -webkit-box;
						-webkit-box-pack: center;
						-webkit-box-align: start;
						word-break: break-all;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						text-overflow: ellipsis;
						font-weight: 300;

						img {
							width: 0.3467rem;
							vertical-align: middle;
						}
					}
				}

				.con-explain {
					width: 6.4rem;
					height: 0.5rem;
					padding: 0.02667rem 0;

					.kind {
						width: 0.93333rem;
						height: 0.4rem;
						background-color: #ff463b;
						color: #ffffff;
						font-size: 0.29333rem;
						line-height: 0.4rem;
						text-align: center;
						border-radius: 0.13333rem;
						float: left;
						margin-right: 0.26667rem;
					}
				}

				.con-operation {
					width: 6.4rem;
					height: 0.66667rem;
					font-size: 0.37333rem;
					padding-bottom: 0.21333rem;

					.price,
					.num {
						width: 50%;
						height: 0.66667rem;
						line-height: 0.66667rem;
						color: #ff463b;
						float: left;
					}

					.price {
						font-weight: 600;
					}

					.vipprice,
					.noVip {
						font-size: 0.3467rem;
						color: #FF463B;
						font-weight: 600;
					}

					.hasVip {
						font-size: 0.32rem;
						color: #888888;
						text-decoration: line-through;
					}

					.num {
						.number {
							float: right;
							position: relative;
							width: 100%;
							padding: 0 0.66667rem;
							max-width: 2.17333rem;
							text-align: center;
							color: #000000;
						}

						.btn {
							width: 0.66667rem;
							height: 0.66667rem;
							position: absolute;
							top: 0;

							img {
								width: 100%;
								height: 100%;
							}
						}
					}
				}
			}
		}

		.ban-goods {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 5;
		}

		.ban-center {
			position: absolute;
			top: 50%;
			left: 50%;
			-webkit-transform: translate(-50%, -50%);
			transform: translate(-50%, -50%);
		}

		.ban-line {
			position: absolute;
			top: 50%;
			width: 30%;
			height: 0;
			-webkit-transform: translate(0%, -50%);
			transform: translate(0%, -50%);
			border-bottom: 0.05rem solid #fff;
		}

		.ban-text {
			width: 40%;
			height: 1rem;
			text-align: center;
			line-height: 1rem;
			color: #ffffff;
			font-size: 0.6rem;
		}

		.vipPrice {
			font-size: 0.3467rem;
			color: #FF463B;
			width: 50%;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.bbtg {
			background-color: rgba(0, 0, 0, 0.8) !important;
			color: #ffffff;
		}

		.hot-goods {
			width: 1.1rem;
			height: 1.1rem;
			overflow: hidden;
			position: absolute;
			right: 0;
			bottom: 0;
		}

		#outline {
			width: 100%;
			height: 100%;
			position: fixed;
			top: 0px;
			left: 0px;
			z-index: 100;
			background: #fff;

			.outline-header {
				width: 100%;
				height: auto;

				ul {
					display: flex;
					flex-direction: row;
					align-items: center;
					flex-wrap: nowrap;
					justify-content: space-around;
					padding: 0.3rem 0;

					li {
						width: 12%;
						background: rgb(244, 244, 244);
						height: 0.7rem;
						border-radius: 2px;
					}

					li:nth-child(5) {
						width: 1rem;
						height: 1rem;
						border-radius: 50%;
						background: rgb(244, 244, 244);
					}
				}
			}

			.outline-content {
				width: inherit;
				height: auto;

				ul {
					display: flex;
					flex-direction: row;
					align-items: center;
					flex-wrap: wrap;
					justify-content: space-around;

					li {
						width: 4.53333rem;
						height: 4.53333rem;
						margin: 0.2rem auto;

						div {
							width: 100%;
							height: 3.33333rem;
							width: 100%;
							border-radius: 2px;
							background: rgb(244, 244, 244);
						}

						p {
							width: 3rem;
							height: 0.4rem;
							background: rgb(244, 244, 244);
							margin: 0.1rem 0.2rem;
							border-radius: 1px;
						}
					}
				}
			}

			.outline-list {
				display: flex;
				flex-direction: column;
				align-items: center;
				flex-wrap: wrap;

				.goods-list {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					width: 95%;
					height: 2.4rem;
					margin-bottom: 0.08rem;

					.goods-left {
						width: 4rem;
						height: 2.29333rem;
						background: rgb(244, 244, 244);
						border-radius: 2px;
					}

					.goods-right {
						width: 100%;
						height: 0.4rem;
						padding: 0.18rem;

						p:nth-child(1) {
							width: 50%;
							height: 0.4rem;
							background: rgb(244, 244, 244);
							border-radius: 2px;
							margin: 0.2rem 0;
						}

						p:nth-child(2) {
							width: 35%;
							height: 0.4rem;
							margin: 0.2rem 0;
							background: rgb(244, 244, 244);
							border-radius: 2px;
						}

						p:nth-child(3) {
							display: flex;
							justify-content: space-between;

							span:nth-child(1) {
								width: 35%;
								height: 0.4rem;
								background: rgb(244, 244, 244);
								border-radius: 2px;
							}

							span:nth-child(2) {
								width: 0.7rem;
								height: 0.7rem;
								background: rgb(244, 244, 244);
								border-radius: 50%;
							}
						}
					}
				}
			}

			.footer {
				width: 100%;
				height: 1.33333rem;
				position: fixed; // background: rgb(244,244,244);
				bottom: 0;
				display: flex;
				justify-content: space-between;
				padding: 0 0.3rem;

				p:nth-child(1) {
					width: 1.2rem;
					height: 1.2rem;
					border-radius: 50%;
					background: rgb(244, 244, 244);
				}

				p:nth-child(2) {
					width: 3rem;
					height: 1.2rem;
					background: rgb(244, 244, 244);
				}
			}
		}

		.smallBoll {
			position: relative;
			/* display: none; */
			width: 3px;
			height: 3px;
			border-radius: 50%;
			background: red;
		}
	}

	.childShow {
		margin-top: 1rem;
	}
</style>