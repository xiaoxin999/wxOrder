/*
* @Author: guan.sun
* @Date: 2018-06-20 16:31:04
* @Last Modified time: 2018-06-20 16:31:04
*/
<template>
	<div class="order">
		<orderHeader :marqueeShow=marqueeShow @closeBtn=closeBtn :marquee=marquee></orderHeader>
		<div :class={content:marqueeShow,contents:!marqueeShow} :style={height:heightOffest}>
			<div class="sides" ref="side" @scroll="scrollSide" :style="{overflow:$store.state.order.isOverflow?'hidden':'auto'}">
				<orderSides :list="asideList" :sidesIndex="sidesIndex" @emitIndex="selectSide"></orderSides>
			</div>
			<div class="list_item_con" ref="scrollCon">
				<list :size="listH" :remain="remain" :isScroll="!$store.state.order.isOverflow" :onscroll="loadDom" ref="list">
					<orderList v-for="(item,index) in showList" :isMember="Boolean(memberInfo.member)" :key="index" @specialData="openSpec" class="goodsList" :obj='item' :type='0'></orderList>
				</list>

				<ul v-if="showList.length == 0">
					<li v-for="n in 5" :key="n">
						<div></div>
						<div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					</li>
				</ul>
			</div>
		</div>
		<transition name="fade">
			<specialDetail class="special" @chooseTaste="emit" v-if="show" :obj="specialData"></specialDetail>
		</transition>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';


	let orderData = null;
	let fs = parseFloat(document.documentElement.style.fontSize);

	let lastIndex = 0;
	export default {
		data() {
			return {
				open: false,
				item: {},
				goodsList: [], //所有商品数据
				showList: [], //当前展示 的商品数据
				num: 0,
				show: false,
				showOrderTip: true,
				sh: utils.getWindowWH().h,
				asideList: [],
				allGoodsList: [], //商品 + 套餐数据
				packageList: [],
				specialData: {}, //选择口味需要用的数据
				timerStr: '',
				groupGoodsData: {},
				sidesIndex: {
					'parent': 0,
					'child': -1
				}, //侧边栏需要用
				lastP: null,
				lastC: null,
				recordTop: 0, //记录当前列表的滚动高度
				memberInfo: null, // 会员信息
				goodsLeast: [],
				tempFn: null,
				discountRule: [], //满减列表
				discountRuleNew: [],
				getReduceActivityPrice: 0,
				status: 0,
				listH: 2.68 * fs,
				interEnable: false, //侧边栏是人为滚动
				scrollCon: null,
				sideTop: 0,
				marqueeShow: false,
				marquee: null,
				heightOffest:'100%',
				remain:3.55
			};
		},
		methods: {
			addIndex() {
				return lastIndex++;
			},
			closeBtn(str) {
				if(str == 'on'){
					this.heightOffest = 'calc(100% - 0.93rem)';
					this.marqueeShow = true;
				}else{
					this.heightOffest = '100%';
					this.marqueeShow = false;
				}
			},
			/* eslint-disable */
			selectSide({
				parent,
				index
			} = selectSide) {
				// index == null 时  点击的是一级菜单
				if (orderData.classSortNum.length < 1) return;
				let arr = orderData.classSortNum.slice(0, parent);
				if (index !== null) {
					arr.push(orderData.classSortNum[parent].slice(0, index + 1));
				}
				let sum = this.count(arr);
				this.interEnable = true;
				// console.log(parent,index,arr,orderData.classSortNum,sum,sum * this.listH * fs);
				this.scrollTo(sum * this.listH);

			},
			/* eslint-disable */
			count(arr) {

				let sum = 0;
				for (let i = 0; i < arr.length; i++) {
					let item = arr[i];
					for (let j = 0; j < item.length; j++) {
						sum += Number(item[j]);
					}

				}
				return sum;
			},
			emit(obj) {

				if (obj.type == 'ok' || obj.type == 'close') {
					this.show = false;
				}
				this.$store.commit('setOverflow', false);

			},

			openSpec(obj) {
				this.$store.commit('setOverflow', true);
				this.specialData = obj;
				// console.log(this.specialData,'specialData');
				this.show = true;
			},
			async init() {
				// 初始化数据
				// console.log(orderData.goodsList)
				if (orderData.navsList.length === 0) {
					this.$store.commit('setWin', {
						content: '该渠道尚未配置商品'
					});
					return;
				}

				this.goodsList = orderData.goodsList;
				storage.session('goodsList', this.goodsList);
				this.packageList = orderData.packageList;
				storage.session('packageList', this.packageList);
				this.goodsList.push(...this.packageList);

				this.goodsLeast = orderData.goodsLeast;
				this.mustList = orderData.cidGoodsList[-4];
				storage.session('mustList', this.mustList);
				// this.$store.commit('setLoad', true);
				this.$store.dispatch('showLoad', true);
				this.goodsList.map((item) => {
					this.goodsLeast.map((item1) => {
						if (item.id == item1.gid) {
							item.gnum = item1.num;
						}

						return item;
					});
				});

				storage.session('goodsLeast', this.goodsLeast);

				this.showList = this.goodsList;

				this.$nextTick(() => {

					let top = storage.session('ls_top');
					// setTimeout(()=>{    
					this.$refs.side.scrollTop = storage.session('ls_aside_top');
					// },500)

					if (top) {
						this.scrollTo(top);
					}
					// this.$store.commit('setLoad', false);
					this.$store.dispatch('showLoad', false);
					this.remain = 3.6;
				});

				this.groupGoodsData = orderData.groupGoodsObj;

				storage.session('groupGoodsData', this.groupGoodsData);
				// 合并商品和套餐数据

				await this.setMemberInfo();

				// 获取商品缓存
				let data = await storage.localData(`order_cache_${global.getShopId()}`);
				console.log(data, 'data');
				if (data == null) {
					return;
				} else {
					this.$store.commit('getCache', data);
				}

				if (data) {
					if (Date.now() - data.t > 1000 * 60 * 60) {
						//缓存失效
						storage.localData(`order_cache_${global.getShopId()}`, null);
					} else {
						this.$store.commit('getCache', data);
					}
				}
			},
			getAsideList() {
				// 获取分类数据
				this.asideList = orderData.navsList;
			},
			//滚动动画
			scrollTo(dis) {
				this.$refs.list.setScrollTop(dis);
			},
			scrollSide(e) {
				this.sideTop = e.target.scrollTop;
			},
			//活动时优化dom
			loadDom(e, obj) {

				this.recordTop = obj.offset;
				if (!this.interEnable && obj) {
					let sum = 0;
					let top = obj.offset;

					let fixNum = top / (this.listH);
					let num = Math.floor(fixNum); //已经滚动总个数

					for (let i = 0; i < orderData.classSortNum.length; i++) {
						let item = orderData.classSortNum[i];
						let isTemp = false;
						for (let j = 0; j < item.length; j++) {
							sum += Number(item[j]);

							if (sum > num) {

								let parent = i;
								let child = j == 0 ? -1 : j - 1;
								isTemp = true;
								if (parent == this.lastP && child == this.lastC) {
									// empty
								} else {
									this.sidesIndex.parent = parent;
									this.sidesIndex.child = child;
								}

								this.lastP = parent;
								this.lastC = child;
								break;
							}
						}
						if (isTemp) break;
					}

				}
			},
			touch() {
				this.interEnable = false;
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
			}
		},
		/* eslint-disable */
		components: {
			orderHeader: () =>
				import( /* webpackChunkName: 'latest_header' */ './order/order_header'),
			orderSides: () =>
				import( /* webpackChunkName: 'latest_sides' */ './order/order_sides'),
			orderList: () =>
				import( /* webpackChunkName: 'order_item' */ './order/order_item'),
			specialDetail: () =>
				import( /* webpackChunkName: 'special_detail' */ './order/special_detail'),
			list: () =>
				import( /* webpackChunkName: 'scroll_list' */ 'src/components/scroll_list'),
		},
		computed: {
			parseOk() {
				return this.$store.state.parseOk;
			},
			asideOk() {
				return this.$store.state.asideOk;
			},
			mustOk() {
				return this.$store.state.order.mustStatus;
			}
		},
		watch: {
			parseOk(newV, oldV) {
				if (newV) {
					this.init();
				}
			},
			asideOk(val) {
				if (val) {
					this.getAsideList();
				}
			},
			mustOk(val) {
				this.$refs.side.scrollTop = 0;
				this.scrollTo(0);
				this.sidesIndex.parent = 0;
			},
			getReduceActivityPrice: {
				handler: function(val, oldVal) {
					/* ... */
				},
				immediate: true
			},
		},
		beforeRouteLeave(to, from, next) {
			if (to.path == '/shopSelect') {
				this.$store.commit('resetShopCar');
			}
			next();
		},
		beforeDestroy() {
			storage.session('ls_top', this.recordTop + 5);
			storage.session('ls_aside_top', this.sideTop);
			this.scrollCon.removeEventListener('touchstart', this.touch);
		},
		async mounted() {
			orderData = await import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;

			await this.getUserInfo();
			let selectPayWay = storage.session('selectPayWay');
			this.marquee = selectPayWay && selectPayWay.marquee;
			this.marqueeShow = !!this.marquee;

			orderData.init();
			this.scrollCon = this.$refs.scrollCon;
			this.scrollCon.addEventListener('touchstart', this.touch);

			if (this.asideOk && Array.isArray(orderData.navsList)) {
				this.getAsideList();
			}

			let shop = storage.session('select-shop');

			let shopName = storage.session('shopInfo') ?
				storage.session('shopInfo').name :
				storage.session('wechatShop') ? storage.session('wechatShop').shopName : '';

			let info = storage.session('bespeak_shopInfo');
			if (info) {
				shopName = info.name;
			}
			utils.setTitle(shopName);
			lastIndex = 0;

		},
	}
</script>
<style lang='less' scoped>
	@import '../../../res/css/base.less';

	.order {
		.setBox(10rem, calc(~"100% - 0.15rem"));
		padding-top: 1.4667rem;
		margin: 0 auto;
		background-color: #f2f2f2;
	}

	.content {
		.setBox(100%, 100%);
		margin-top: 1rem;
		-webkit-overflow-scrolling: touch;
		display: flex;
		overflow: hidden;
	}

	.contents {
		.setBox(100%, 100%);
		-webkit-overflow-scrolling: touch;
		display: flex;
		overflow: hidden;
	}

	.sides {
		width: 1.8267rem;
		height: 100%;
		background: #FFFFFF;
		border-right: .0133rem solid #E1E1E1;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}

	.list_item_con {
		width: calc(~"100% - 1.9867rem");
		margin-left: 0.1rem;
		height: 100%;
		overflow: auto;
	}
</style>