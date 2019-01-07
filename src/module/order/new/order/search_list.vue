/* * @Author: lhl * @Date: 2018-06-20 14:30:50 * @Module: {搜索列表} */
<template>
	<div class="tableList">
		<div class="search_box">
			<div class="kuang_box">
				<img src="../../../../res/images/fdj.png" alt="" class="fdj">
				<input type="text" placeholder="请输入搜索商品" class="input_box" v-model.trim='searchName' maxlength='40'>
				<img src="../../../../res/images/close_cha.png" alt="" class="close_cha" @click="cleanName">
			</div>
			<span class="close_qu" @click="openOrder">取消</span>

		</div>
		<div v-if='isSearch || searchName==""' class="isSearch">
			<img src="../../../../res/images/sou_01.png" alt="">
		</div>
		<orderList v-if='!isSearch' :type='1' v-for="(goods,index) in goodsList" :obj='goods' @specialData="openSpec" :key="index"></orderList>
		<transition name="fade">
			<specialDetail @chooseTaste="emit" v-if="show" :obj="specialData"></specialDetail>
		</transition>
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
				open: false,
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
				currentView: '',
				list: [],
				specialData: {}, //选择口味商品
				groupGoodsData: storage.session('groupGoodsData', this.groupGoodsData),
				goodsLeast: []
			};
		},
		methods: {
			emit(obj) {

				if (obj.type == 'ok' || obj.type == 'close') {
					this.show = false;
				}

			},
			openSpec(obj) {
				this.specialData = obj;
				this.show = true;
			},
			closeWin() {
				this.show = false;
				this.$store.commit('setOverHide', false);
			},
			banGoods: function(g) {
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
			searchGoods: function() {
				// 搜索商品
				let goods = this.goods;
				let packages = this.packages;
				let list = [];
				let temp = [];
				this.goodsList = [];

				if (this.searchName) {
					// 搜索商品

					let reg = new RegExp(this.searchName, 'g');
					list = goods.concat(packages);

					for (let index = 0; index < list.length; index++) {
						const item = list[index];
						let name = item.goodsName || item.packageName;
						if ((reg.test(name) || reg.test(item.BC))) {
							temp.push(item);
						}
					}

				}

				this.goodsList = temp;
				this.goodsList.map((item) => {
					let a = item.price.split('.');
					item.p = a[0];
					item.r = a[1];
					return item;

				});

				// 判断搜索关键词是否为空
				this.isClean = Boolean(this.searchName);

				// this.searchName是否为空
				if (this.isClean) {
					// 是否搜索出商品
					if (
						utils.isEmptyObject(this.goodsList)
					) {
						this.isSearch = true;
					} else {
						this.isSearch = false;
					}
				} else {
					this.isSearch = false;
					this.goodsList = null;
				}
			},
			cleanName: function() {
				// 清除搜索关键字
				this.searchName = '';
				this.isSearch = false;
				this.goodsList = [];
			},
			openOrder: function() {
				// 回到主页面
				this.$router.push('/latestOrder');
			},
			openPackage: function(packages) {
				//进入套餐页面
				packages = orderData.getPackage(packages);
				storage.session('searchPackage', packages);
				this.$router.push('/package');
			},
			isAttr: function(index, goods) {
				//判断该商品是否有口味
				if (utils.isEmptyObject(orderData.getTasteList(goods.id))) {
					return false;
				} else {
					return true;
				}
			},

			showGoodsDetail: function(g) {
				//展示商品详情
				if (this.banGoods(g)) return false;
				orderData.oGood = g;
				this.show = true;

				this.$store.commit('setOverHide', true);
				//   this.currentView = 'goodsdetail';
				this.$router.push('/latestOrder/detail');
			},
			toDetail(obj) {
				storage.session('goodDetail', obj);
				this.$router.push({
					path: '/latestOrder/detail'
				});

			},
			getcounter(goods) {
				if (goods.packageName) {
					let goodsPackges = orderData.getPackage(goods);
					storage.session('goodsPackges', goodsPackges.packageTag);
					this.$router.push({
						path: '/latestOrder/goodsPackages'
					});
				} else if (!goods.packageName && goods.isAttr) {
					this.open = true;
				} else if (!goods.packageName && goods.type == 1) {
					this.open = true;

				} else {
					this.$store.commit('setCarList', {
						operateType: 'push',
						operateObj: 'carGoodsList',
						data: goods
					});
					this.open = false;
				}
				storage.session('specialDetail', goods);
				this.specialDetail = storage.session('specialDetail');
			},
			close() {
				this.open = false;
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
						if (g.type == 1 && g.goodsName) {
							num += arr[i].num - 0;
						}
					}
				}
				return num;
			},
			checkIsIdentical: function(g) {
				let arr = [];
				if (g.packageName) {
					arr = orderData.oPackageList;
				} else {
					arr = orderData.oGoodsList;
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
					this.goods.map((item) => {
						this.goodsLeast.map((item1) => {
							if (item.id == item1.gid) {
								item.gnum = item1.num;
							}
							return item;
						});
					});
				}
			}
		},
		components: {
			goodsdetail: () =>
				import( /* webpackChunkName: 'goods_detail' */ '../order/good_detail'),
			orderList: () =>
				import( /* webpackChunkName: 'order_item' */ '../order/order_item'),
			specialDetail: () =>
				import( /* webpackChunkName: 'special_detail' */ '../order/special_detail'),
		},
		async mounted() {
			this.$store.commit('setOverHide', false);
			orderData = await import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			orderData.init();

			this.goods = orderData.goodsList;
			this.goodsLeast = orderData.goodsLeast;
			this.packages = orderData.packageList;

			utils.setTitle('搜索');
		}
	};
</script>
<style lang='less' scoped>
	.tableList {
		background: #fff;
		height: auto;
		min-height: 100%;
		background: #fff;
		height: auto;
		min-height: 100%;
		position: absolute;
		width: 100%;
		top: 1rem;
		padding-bottom: 2rem;

		.search_box {
			padding: 0.32rem 0 0.32rem 0;
			position: fixed;
			top: 0;
			background: #fff;
			right: 0;
			width: 100%;
			z-index: 3;

			.kuang_box {
				width: 7.9467rem;
				height: 0.8rem;
				background: #F2F2F2;
				border-radius: 100px;
				// border: 1px solid #F2F2F2;
				-webkit-appearance: none;
				padding-left: 0.2rem;
				margin: 0 auto;
				margin-left: 0.4rem;

				.input_box {
					width: 6.48rem;
					height: 0.78rem;
					border: none;
					background: #F2F2F2;
				}

				.fdj {
					width: 0.4533rem;
					height: 0.4533rem;
					position: relative;
					top: 0.12rem;
					left: 0.068rem;
				}

				.close_cha {
					width: 0.4rem;
					height: 0.4rem;
					position: relative;
					top: 0.12rem;
					right: 0;
				}
			}

			.close_qu {
				color: #FCAE02;
				font-size: 0.4rem;
				position: absolute;
				top: 0.4rem;
				right: 0.4rem;
			}

		}
	}

	.isSearch img {
		width: 5rem;
		height: 3.6667rem;
		display: flex;
		align-items: center;
		margin: 0 auto;
		margin-top: 2.6rem;
	}
</style>