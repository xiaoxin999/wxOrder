<template>

	<div id="goods-search">
		<!--搜索-->
		<div class="search">
			<header>
				<span class="search-icon fl"></span>
				<input type="text" placeholder="请输入关键字" class="fl" v-model="searchName" />
				<span class="close" v-if="isClean" @click="cleanName"></span>
				<span class="fl cancel" @click="openOrder">取消</span>
			</header>
		</div>
		<!--搜索出的商品-->
		<div class="goods-top">
			<div class="goods-box" v-for="(goods,i) in goodsList" @click="showGoodsDetail(goods)" :key="i+'_goods'">
				<div class="goods-img">
					<div class="hide-img"></div>
					<img :src="uploadUrl + goods.imageName" alt="商品图片" />
					<div class="ban-goods" v-if="banGoods(goods)">
						<div class="ban-line" style="left: 0;">
						</div>
						<div class="ban-text ban-center">
							售完
						</div>
						<div class="ban-line" style="right: 0;">
						</div>
					</div>
				</div>
				<div class="goods-name">{{goods.goodsName}}</div>
				<div class="rect_price">

					<span v-if='goods.isShowAvailPrice' class="vipprice">
						<template v-if="goods.isSpecial">
							¥{{goods.specialPrice}}{{goods.isGroup > 0 ? '起' : ''}}
						</template>
						<template v-else>
							¥{{goods.memberPrice}}{{goods.isGroup > 0 ? '起' : ''}}
						</template>
					</span>
					<span :class="goods.isShowAvailPrice ? 'hasVip' : 'noVip' " style="margin-left:0.2rem">¥{{goods.price}}</span>

				</div>
				<div class="goods-num" v-if="getGoodsMaxNum(goods)">{{getGoodsMaxNum(goods)}}</div>
				<div class="goods-weight top-option" v-if="goods.type == '1'"></div>
				<div v-bind:class="['goods-attr','top-option',{ 'isWeight': goods.type == '1' }]" v-if="isAttr(i,goods)"></div>
			</div>
			<div class="goods-box" v-for="(packages,j) in packagesList" @click="openPackage(packages)" :key="j+'_packages'">
				<div class="goods-img">
					<img :src="uploadUrl + packages.imageName" alt="商品图片" />
					<div class="ban-goods" v-if="banGoods(packages)">
						<div class="ban-line" style="left: 0;">
						</div>
						<div class="ban-text ban-center">
							售完
						</div>
						<div class="ban-line" style="right: 0;">
						</div>
					</div>
				</div>
				<div class="goods-name">{{packages.packageName}}</div>
				<div class="goods-price">￥{{packages.price}}</div>
				<div class="goods-num" v-if="checkIsIdentical(packages) > 0">{{checkIsIdentical(packages)}}</div>
				<div class="top-option goods-package"></div>
			</div>
		</div>
		<div class="ineffectiveness" v-if="isSearch">
			<div class="ineffectiveness-icon"></div>
			<div class="ineffectiveness-info">没有搜索到结果...</div>
		</div>
		<div id="show-mesking" v-show="show">

		</div>
		<component :is="currentView" v-if="show" @close="closeWin"></component>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import global from 'src/manager/global';

	let orderData = null;
	export default {
		data() {
			return {
				token: '', //data.accessToken
				goods: [], //商品
				packages: [], //套餐
				searchName: '', //搜索关键词
				goodsList: [], //搜索出的商品列表
				packagesList: [], //搜索出的套餐列表
				isSearch: '', //是否存在搜索关键词商品 or 套餐
				isClean: false, //是否显示清除图标
				uploadUrl: global.getImgUrl(), //图片url地址
				show: false,
				carNum: 0,
				isShowVipPrice: storage.session('isShowVipPrice'),
				currentView: ''
			};
		},
		methods: {
			getGoodsMaxNum(obj) {
				let GoodsMaxNum = this.$store.state.order.shopCarObj[(!!obj.goodsName - 0) + '_' + obj.id] || 0;
				return GoodsMaxNum;
			},
			closeWin() {
				this.show = false;
				this.$store.commit('setOverHide', false);
			},
			banGoods: function (g) {
				if (g.packageName && g.status == 1) return true;
				if (!g.goodsName) return false;
				if (g.status == 1) return true;
				if (g.isStock == 1 && g.goodsNum == 0) return true;
				if (g.type == 1) {
					let num = this.getCarNum(g);
					if (g.isStock == 1) {
						if (num >= g.goodsNum) return true;
					}
				} else {
					if (g.isStock == 1 && g.num) {
						if (g.num >= g.goodsNum) return true;
					}
					if (this.checkIsIdentical(g) >= g.goodsNum) return true;
				}
			},
			searchGoods: function () {
				// 搜索商品
				let goods = this.goods;
				let packages = this.packages;
				this.goodsList = [];
				this.packagesList = [];
				if (this.searchName) {
					// 搜索商品

					let self = this;
					goods.forEach(function (item) {
						if (
							item.goodsName.indexOf(self.searchName) >= 0 &&
							orderData.delectGoods(item)
						) {
							self.goodsList.push(item);
						}

						if (
							item.BC.indexOf(self.searchName.toUpperCase()) >= 0 &&
							orderData.delectGoods(item)
						) {
							self.goodsList.push(item);
						}
					});

					// 搜索套餐
					packages.forEach(function (item) {
						if (item.packageName.indexOf(self.searchName) >= 0) {
							self.packagesList.push(item);
						}
						if (item.BC.indexOf(self.searchName.toUpperCase()) >= 0) {
							self.packagesList.push(item);
						}
					});
				}

				// 数组去重复
				function unique2(arr) {
					let newArr = [];
					for (let i = 0, len = arr.length; i < len; i++) {
						if (arr.indexOf(arr[i]) == i) {
							newArr.push(arr[i]);
						}
					}
					return newArr;
				}
				this.goodsList = unique2(this.goodsList);
				this.packagesList = unique2(this.packagesList);

				// 判断搜索关键词是否为空
				this.isClean = Boolean(this.searchName);

				// this.searchName是否为空
				if (this.isClean) {
					// 是否搜索出商品
					if (
						utils.isEmptyObject(this.goodsList) &&
						utils.isEmptyObject(this.packagesList)
					) {
						this.isSearch = true;
					} else {
						this.isSearch = false;
					}
				} else {
					this.isSearch = false;
				}
			},
			cleanName: function () {
				// 清除搜索关键字
				this.searchName = '';
				this.isSearch = false;
				this.goodsList = [];
				this.packagesList = [];
			},
			openOrder: function () {
				// 回到主页面
				this.$router.push('/order');
			},
			openPackage: function (packages) {
				//进入套餐页面
				packages = orderData.getPackage(packages);
				storage.session('searchPackage', packages);
				this.$router.push('/package');
			},
			isAttr: function (i, goods) {
				//判断该商品是否有口味
				if (utils.isEmptyObject(orderData.getTasteList(goods.id))) {
					return false;
				} else {
					return true;
				}
			},

			showGoodsDetail: function (g) {
				//展示商品详情

				if (this.banGoods(g)) return false;
				orderData._oGood = g;
				this.show = true;

				this.$store.commit('setOverHide', true);
				this.currentView = 'goodsdetail';
			},
			getCarNum: function (g) {
				let arr = [];
				arr = orderData.goodsList;
				
				let num = 0;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].id == g.id) {
						if (g.type == 1 && g.goodsName) {
							num += arr[i].num - 0;
						}
					}
				}
				return num;
			},
			checkIsIdentical: function (g) {
				let arr = [];
				if (g.packageName) {
					arr = orderData.goodsList;
				} else {
					arr = orderData.packageList;
				}
				let num = 0;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].id == g.id) {
						if (g.type == 1 && g.goodsName) {
							num += 1;
						} else {
							num += arr[i].num;
						}
					}
				}
				return num;
			}
		},
		computed: {
			parseOk() {
				return this.$store.state.parseOk;
			}
		},
		watch: {
			searchName: 'searchGoods',
			parseOk(newV) {
				if (newV) {
					this.goods = orderData.goodsList;
					this.packages = orderData.packageList;
				}
			}
		},
		components: {
			goodsdetail: () =>
				import ( /* webpackChunkName: 'goods_detail' */ './goodsdetail')
		},
		async mounted() {
			this.$store.commit('setOverHide', false);

			orderData = await
			import ( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			orderData.init();
			utils.setTitle('搜索');

		}
	};

</script>
<style type="text/css" scoped>
	.ban-goods {
		width: 100%;
		height: 3.36rem;
		position: absolute;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.5);
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
		background-color: #ffeceb;
		color: #fb5046;
		font-size: 0.29333rem;
	}

	.search {
		position: fixed;
		left: 0px;
		top: 0px;
		z-index: 55;
		display: block;
		width: 100%;
		background-color: #f5a623;
		padding: 0.24rem 0;
	}

	.search .search-icon {
		display: block;
		width: 1.28rem;
		height: 0.77333rem;
		background: url(../../../res/images/nav-icon-search.png) center center no-repeat;
		background-size: 0.8rem 0.8rem;
	}

	.search input {
		outline: none;
		border: none;
		border-radius: 8px;
		text-indent: 0.26667rem;
		margin-right: 0.2rem;
		width: calc(100% - 2.81333rem);
		height: 0.77333rem;
		line-height: normal;
		font-size: 0.32rem;
	}

	.search .cancel {
		color: #fff;
		width: 1.33333rem;
		height: 0.77333rem;
		line-height: 0.77333rem;
		font-size: 0.32rem;
		text-align: center;
	}

	.search .close {
		background: url(../../../res/images/nav-search-del.png) center center no-repeat;
		display: block;
		width: 0.66667rem;
		height: 0.77333rem;
		background-size: 0.4rem 0.4rem;
		position: absolute;
		right: 1.6rem;
	}

	.goods-top {
		width: 100%;
		height: calc(100% - 1.25333rem);
		padding: 0 0.33333rem;
		margin-top: 1.25333rem;
		position: absolute;
		left: 0;
		top: 0.24rem;
		right: 0;
		bottom: 0;
		overflow-y: scroll;
		-webkit-overflow-scrolling: touch;
		font-size: 0;
	}

	.goods-top div.goods-box {
		width: 4.53333rem;
		height: 4.53333rem;
		display: inline-block;
		background-color: #ffffff;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		margin-right: 0.26667rem;
		margin-bottom: 0.24rem;
		position: relative;
		overflow: hidden;
	}

	.goods-top div.goods-box:nth-child(2n) {
		margin-right: 0px;
	}

	.goods-top div.goods-box .goods-img {
		width: 4.53333rem;
		height: 3.36rem;
	}

	.goods-top div.goods-box .goods-img .hide-img {
		width: 4.53333rem;
		height: 3.36rem;
		position: absolute;
		top: 0;
		left: 0;
		opacity: 1;
	}

	.goods-top div.goods-box .goods-img img {
		width: 4.53333rem;
		height: 3.36rem;
	}

	.goods-top div.goods-box .goods-weight {
		background: url(../../../res/images/msg-label-jinliang.png) no-repeat;
	}

	.goods-top div.goods-box .goods-package {
		background: url(../../../res/images/msg-label-taocan.png) no-repeat;
	}

	.goods-top div.goods-box .goods-attr {
		background: url(../../../res/images/msg-label-taste.png) no-repeat;
	}

	.top-option {
		background-size: 0.45333rem 0.25333rem !important;
		position: absolute;
		left: -3px;
		top: 10%;
		width: 0.90667rem;
		height: 0.50667rem;
	}

	.ineffectiveness {
		width: 3.73333rem;
		height: 3.4rem;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -70%);
		-webkit-transform: translate(-50%, -70%);
	}

	.ineffectiveness-icon {
		width: 100%;
		height: 2.8rem;
		background: url(../../../res/images/msg-search-none.png) center center no-repeat;
		background-size: 2.4rem 2.4rem;
	}

	.ineffectiveness-info {
		width: 100%;
		height: 0.6rem;
		line-height: 0.6rem;
		text-align: center;
		font-size: 0.32rem;
		color: #666;
	}

	.top-option {
		background-size: 0.90667rem 0.49333rem !important;
		position: absolute;
		left: -6px;
		top: 10%;
		width: 0.90667rem;
		height: 0.50667rem;
	}

	.goods-num {
		position: absolute;
		right: 0;
		top: 0;
		background: url(../../../res/images/msg-bg-number.png) right top no-repeat;
		background-size: 0.8rem 0.8rem;
		width: 1.06667rem;
		height: 1.06667rem;
		font-size: 0.32rem;
		color: #fff;
		text-align: right;
		padding-right: 0.06667rem;
		padding-top: 0.06667rem;
	}

	.rect_price{
		width: 4.53333rem;
		height: 0.58667rem;
		line-height: 0.58667rem;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		
	}

	.vipprice,.noVip{
		font-size: 0.3467rem;
		color: #FF463B;
		font-weight: 600;
	}
	.hasVip{
		font-size: 0.32rem;
		color: #888888;
		text-decoration: line-through;
	}

	.goods-name,
	.goods-price {
		width: 4.53333rem;
		height: 0.58667rem;
		line-height: 0.58667rem;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.goods-price {
		font-size: 0.16rem;
		color: #fb5046;
		font-weight: bold;
	}

	.goods-name {
		font-size: 0.32rem;
		color: #333333;
	}

	.goods-price {
		font-size: 0.32rem;
		color: #fb5046;
		font-weight: bold;
	}

	.package {
		width: 100%;
		height: auto;
		position: relative;
		padding: 1.25333rem 0;
	}

	.package .package-tit {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: -0.93333rem;
		text-align: center;
		font-size: 0.42667rem;
		color: #999999;
		position: fixed;
		left: 0;
		top: 0;
		background-color: #f7f7f7;
		border-bottom: 1px solid #dddddd;
		z-index: 99;
	}

	.package .package-tit span {
		display: block;
		width: 0.93333rem;
		height: 1.25333rem;
		text-indent: 0;
	}

	.package .package-head {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		border-bottom: 1px solid #dddddd;
		font-size: 0;
	}

	.package .package-head span {
		display: inline-block;
		width: auto;
		height: 1.25333rem;
		line-height: 1.25333rem;
		padding: 0 0.33333rem;
		font-size: 0.34667rem;
		color: #777777;
		position: relative;
	}

	.package .package-head span.on {
		color: #f1a724;
	}

	.package .package-head span.on:after {
		content: "";
		width: 50%;
		height: 0.08rem;
		background-color: #f1a724;
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translate(-50%, 0);
		-webkit-transform: translate(-50%, 0);
	}

	.package .package-subhead {
		width: 100%;
		height: 0.53333rem;
		line-height: 0.53333rem;
		padding-left: 0.26667rem;
		color: #fff;
		background-color: #c6c2bc;
		font-size: 0.34667rem;
	}

	.package .package-list {
		width: 100%;
		height: calc(100% - 1.78667rem);
		line-height: 40px;
		overflow: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.package .package-list ul li {
		width: 100%;
		height: auto;
		min-height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: 0.26667rem;
		border-bottom: 1px solid #dddddd;
		color: #000000;
		background-color: #fdfdfd;
		overflow: hidden;
	}

	.package .package-list ul li .tip {
		font-size: 0.13333rem;
		color: #999999;
	}

	.package .package-list ul li .package-attr {
		background-color: #f0f0f0;
		padding: 0.26667rem 0;
		width: 100%;
		height: 1.25333rem;
		padding-left: 0.66667rem;
		border-bottom: 1px solid #dddddd;
		position: relative;
	}

	.package .package-list ul li .package-attr:after {
		content: "";
		width: 0.18667rem;
		height: 0.18667rem;
		position: absolute;
		left: 0.26667rem;
		top: 50%;
		margin-top: -0.09333rem;
		background-color: #f5a623;
		border-radius: 0.2rem;
	}

	.package .package-list ul li .package-attr .attr-revise {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		border: 1px solid #f5a623;
		color: #f5a623;
		border-radius: 8px;
		background-color: #f0f0f0;
		text-align: center;
		margin-right: 0.33333rem;
		text-indent: 0;
	}

	.package .package-list ul li .package-attr:last-child {
		border-bottom: none;
	}

	.package .package-list ul li span {
		font-size: 0.34667rem;
	}

	.package .package-list ul li span.taste {
		width: 0.93333rem;
		height: 0.4rem;
		line-height: 0.4rem;
		color: #ffffff;
		background-color: #ff463b;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		display: inline-block;
		font-size: 0.29333rem;
		text-indent: 0;
		text-align: center;
	}

	.package .package-list ul li span.optAttr {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		background-color: #f5a623;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		text-align: center;
		text-indent: 0;
		color: #ffffff;
		font-size: 0.34667rem;
		margin-right: 0.33333rem;
		margin-top: 0.26667rem;
	}

	.package .package-list ul li span.reviseAttr {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		border: 3px solid #f5a623;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		background-color: #f0f0f0;
		text-align: center;
		text-indent: 0;
		color: #ffffff;
		font-size: 0.34667rem;
		margin-right: 0.33333rem;
		margin-top: 0.26667rem;
	}

	.package .package-list ul li span.goods_num {
		width: 1.33333rem;
		height: 0.4rem;
		line-height: 0.4rem;
	}

	.package .package-list ul li span.goods_name {
		font-size: 0.42667rem;
		max-width: 50%;
		float: left;
		height: 100%;
		line-height: 1.25333rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.package .package-sub {
		width: 100%;
		height: 1.16rem;
		line-height: 1.16rem;
		background-color: #f5a623;
		position: fixed;
		display: block;
		left: 0;
		bottom: 0;
		font-size: 0.42667rem;
		text-align: center;
		color: #fff;
	}

	.package-attr>.attr-name {
		color: #777777;
		width: auto;
		height: 0.72rem;
		line-height: 0.72rem;
		font-size: 0.34667rem;
		text-indent: 0;
	}

	.previousPage {
		background: url(../../../res/images/recurrence.png) center center no-repeat;
		background-size: 0.28rem 0.49333rem;
	}

	.isWeight {
		top: 20%;
	}
</style>