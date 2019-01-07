/* * @Author: lhl * @Date: 2018-06-20 16:20:26 * @Module: {补足商品列表} */
<template>
	<div class="tableList">
		<div class="header">
			<p class="input_box">温馨提示
				<span>(以下商品补足起售数量后下单)</span>
			</p>
		</div>
		<div class="goodsList" style="padding-bottom:2rem;">
			<section class="goodsList" v-for="(item,index) in carlist" :key="index" :obj='item' :type='0'>
				<div class="goods" v-if="item.gtype ==1">
					<img src="../../../../res/images/sc.png" alt="" class="sc" @click="removeItem(item,index)">
					<span class="dj">{{item.goodsName}}</span>
					<span>{{item.gnum}}只起售</span>
					<div class="sq" v-if="item.status == 1 ||item.goodsName && item.goodsNum == 0 && item.isStock == 1 && item.isGroup != '1'">售罄</div>
					<riskAdd v-else :exter="!item.isAttr?'':'all'" :counter="getGoodsMaxNum(item)" :index="index" class="btn_add" @sendCounter='getCounter'></riskAdd>

				</div>
				<div class="fh_goods_all" v-if='item.gtype == 2'>
					<span class="goods_ll" @click="angle(item,index)">
						<img src="../../../../res/images/sc.png" alt="" class="scc" @click="removeItems(item,index)">
						<span class="ss">{{item.goodsName}}</span>
						<span class="num_al">{{item.gnum}} 只起售</span>
						<span class="num_all">
							<img src="../../../../res/images/rectangle.png" class="angle"> </span>
					</span>
					<span class="dan_goods" v-show="activeIndex===index" v-for='(i,index_i) in item.gobjs' :key="index_i">
						<span class="ss">{{i.goodsName}}</span>
						<span class="num_ss"></span>
						<div class="sq" v-if="i.status == 1 ||i.goodsName && i.goodsNum == 0 && i.isStock == 1 && i.isGroup != '1'">售罄</div>
						<riskAdd v-else :exter="!i.isAttr?'':'all'" :counter="getGoodsMaxNum(i)" :index="index + '_' + index_i" class="btn_add" @sendCounter='getCounters'></riskAdd>

					</span>
				</div>
			</section>
		</div>
		<transition name="fade">
			<specialDetail @chooseTaste="emit" v-if="show" :obj="specialData"></specialDetail>
		</transition>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';

	let orderData = null;
	export default {
		data() {
			return {
				item: {},
				index: null,
				goodsLeast: [],
				num: 0,
				show: false,
				exterStaus: false,
				showDe: false,
				open: false,
				data: {},
				isSelectShop: Boolean(storage.session('select-shop')),
				specialData: {}, //选择口味需要用的数据
				carlist: [],
				complementeGoods: [],
				activeIndex: -1,
				goodsList: [],
				groupGoodsData: storage.session('groupGoodsData'), //多规格数据

			};
		},
		computed: {},
		methods: {
			getGoodsMaxNum(item) {

				let GoodsMaxNum = this.$store.state.order.shopCarObj[(!!item.goodsName - 0) + '_' + item.id] || 0;
				return GoodsMaxNum;
			},
			removeItem(item, index) {
				let carGoodsLists = this.$store.state.order.carGoodsList;
				console.log(carGoodsLists, 'carGoodsLists');

				if (item.groupId > 0) { //规格菜
					carGoodsLists.forEach((item1) => {
						if (item1.id == item.id) {
							let obj1 = utils.deepCopy(item1);
							obj1.num = 0;
							let goodsa = {
								data: obj1, // 商品数据
								operateObj: 'carGoodsList', // 操作对象
								operateType: 'splice'
							};
							this.$store.commit('setCarList', goodsa);
						}
					});
				} else {
					item.num = 0;
					let goodsa = {
						data: item, // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'splice'
					};
					this.$store.commit('setCarList', goodsa);
				}

				this.carlist.splice(index, 1);
			},
			removeItems(item, index) {
				this.carlist.splice(index, 1);

				for (let i = 0; i < item.gobjs.length; i++) {
					item.gobjs[i].num = 0;
					let good = {
						data: item.gobjs[i], // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'complRemove'
					};
					this.$store.commit('setCarList', good);
				}
			},
			angle(item, index) {
				if (this.activeIndex == index) this.activeIndex = -5;
				else this.activeIndex = index;
			},
			emit(item) {
				if (item.type == 'ok' || item.type == 'close') {
					this.show = false;
				}
			},
			openSpec(item) {
				this.specialData = utils.deepCopy(item);
				this.show = true;
			},
			getCounter(item) {
				let data = utils.deepCopy(this.carlist[item.index]);

				if (!data.isAttr && data.goodsName) {
					data.num = item.number;
					let goodsa = {
						data: data, // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'splice'
					};
					this.$store.commit('setCarList', goodsa);

				} else if (!data.packageName && data.isAttr || data.type == 1 || data.isGroup == 1) {
					//口味
					data.num = item.number;
					if (item.type == 'add') {
						this.openSpec(data);
					} else {
						this.$store.commit('setWin', {
							content: '请在购物车中删除'
						});
					}
				}
			},
			getCounters(item) {
				let index = item.index.split('_');
				let data = utils.deepCopy(this.carlist[index[0]].gobjs[index[1]]);
				if (!data.isAttr && data.goodsName) {
					data.num = item.number;
					let goods = {
						data: data, // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'splice'
					};

					this.$store.commit('setCarList', goods);

				} else if (data.goodsName && data.isAttr) {
					this.carlist[index[0]].gobjs[index[1]].num = item.number;
					if (item.type == 'add') {
						this.openSpec(data);
					} else {
						this.$store.commit('setWin', {
							content: '请在购物车中删除'
						});
					}
				}
			},
			close() {
				this.open = false;
			},
			complementeLists() {
				let cache = {};
				this.complementeGoods.forEach(item => {
					if (!item.packageName && !cache[item.id]) {
						cache[item.id] = true;

						this.goodsLeast.forEach((item1) => {

							let gids = item1.gid.split(',');
							if (gids.indexOf(item.id) > -1) {
								item.gtype = item1.type;
								item.gnum = item1.num;
								if (item1.type == 1) { //单品
									if (item.groupId > 0) { //单品壳子菜
										let groupdatas = this.groupGoodsData[item.groupId];
										if (groupdatas) {
											for (let k = 0; k < groupdatas.length; k++) { //循环商品列表
												if (groupdatas[k].id == item.id) {
													item.attr = groupdatas[k].attr;
													break;
												}
											}
										}
									} else { //单品口味
										for (let j = 0; j < this.goodsList.length; j++) { //循环商品列表
											if (this.goodsList[j].id == item.id) {
												item.attr = this.goodsList[j].attr;
												break;
											}
										}
									}

								} else if (item1.type == 2) { //多品
									let arr = [];
									for (let i = 0; i < gids.length; i++) {
										cache[gids[i]] = true;

										let gobj = {};
										let gboolean = false;

										for (let j = 0; j < this.goodsList.length; j++) { //循环商品列表
											if (this.goodsList[j].id == gids[i]) {
												gobj = this.goodsList[j];
												gobj.attrInfo = item.attrInfo;
												gboolean = true;
												break;
											}

										}
										if (gboolean == false) { //如果gids[i]在商品列表找不到，则在规格列表去查找,规格商品的id在商品列表是不存在的
											for (let key in this.groupGoodsData) {
												let groupMapValues = this.groupGoodsData[key]; //数组
												for (let k = 0; k < groupMapValues.length; k++) {
													if (groupMapValues[k].id == gids[i]) {
														gobj = groupMapValues[k];
														break;
													}
												}
											}
										}

										if (item.id == gids[i]) {
											gobj.num = item.num;
											gobj.goodsName = item.goodsName;

										} else {
											gobj.num = 0;
										}
										arr.push(gobj);
									}
									item.gobjs = arr;
								}
							}
						});
						if (item.gtype) {
							this.carlist.push(item);
						}
					}

				});
			}
		},
		components: {
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue'),
			specialDetail: () =>
				import( /* webpackChunkName: 'special_detail' */ '../order/special_detail'),

		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;

			this.goodsList = orderData.goodsList;
			this.goodsLeast = orderData.goodsLeast;
			this.complementeGoods = storage.session('complementeGoods');
			this.complementeLists();
			if (this.item.num == undefined) {
				this.item.num = 0;
			}
		},
	};
</script>
<style lang='less' scoped>
	.tableList {
		background: #fff;
		height: 100%;

		.header {
			width: 100%;
			height: 1.2rem;
			padding: 0.2rem 0 0.2rem;
			text-align: center;
			display: flex;
			align-items: center;
			margin-bottom: 0.2667rem;
			background: #fff;

			.fdj {
				width: 0.2667rem;
				height: 0.4667rem;
				margin-left: 0.2rem;
			}

			.input_box {
				display: inline-block;
				width: 92%;
				text-align: left;
				margin-left: 0.4rem;
				font-size: 0.4267rem;
				color: #2D2D2D;

				span {
					color: #EB3941;
					font-size: 0.3467rem;
				}
			}
		}

		section {
			border-bottom: 1px solid #eaeaea; // height: 1.7333rem;
			display: flex;
			align-items: center; // .fh_goods{

			// width: 100%;
			// height: auto;
			// display: flex;
			// align-items: center;
			.goods {
				height: 2rem;
				width: 100%;
				display: flex;
				align-items: center;

				.sc {
					width: 0.48rem;
					height: 0.48rem;
					margin: 0 0.32rem;
				}

				.dj {
					font-size: 0.3467rem;
					color: #2D2D2D;
					width: 3.84rem;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
				}

				.dj+span {
					font-size: 0.3467rem;
					color: #8E8E8E;
					text-align: right;
					display: block;
					width: 2.4rem;
					margin-right: 0.2rem;
				}

				.btn_add {
					float: right;
				}

			}

			.fh_goods_all {
				width: 100%;

				.goods_ll {
					display: inline-block;
					height: 1rem;
					display: flex;
					align-items: center; // padding: 0.8rem 0;
					position: relative;
				}

				.scc {
					width: 0.48rem;
					height: 0.48rem;
					margin: 0 0.32rem;
					float: left;

				}

				.ss {
					width: 4rem;
					display: inline-block;
				}

				.num_ss {
					width: 2.5rem;
				}

				.angle {
					height: 0.1733rem;
					cursor: pointer;
					margin-right: 0.42rem;
					position: absolute;
					right: 0;
				}

				.num_al {
					display: inline-block; // width: 4rem;
					color: #8E8E8E;
					padding-left: 1.4rem;
					font-size: 0.3467rem;
					position: absolute;
					right: 0.88rem;
				}

				.num_all {
					display: flex;
					align-items: center;
				}

			}

			.dan_goods {
				display: block;
				background: #F2F2F2;
				padding: 0.4rem 0.2rem 0.4rem 1.1rem;
				display: flex;
				align-items: center;
			}

		}

	}

	.redColor {
		color: red;
	}

	.sq {
		float: right;
		width: 2.1rem;
		text-align: right;
	}
</style>