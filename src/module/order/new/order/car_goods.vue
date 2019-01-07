<template>
	<div class="car-goods">
		<div class="car-shade" @click="close"></div>
		<div class="goods-content">
			<div class="carTitle">
				<span class="car-icon fl">购物车</span>
				<span class="clearcar" @click="clearShopCar()">清空购物车</span>
			</div>
			<div class="carList">
				<span class="gray_tip" v-if="!isCompel && disCountPrice>0">参与优惠商品 小计 {{disCountPrice.toFixed(2)}} 元</span>
				<div class="goods-item" v-for="(item,index) in carLists" :key="index + '_' + item.type" v-if="item.isDiscount =='1'">
					<template v-if="item.goodsName">
						<div class="goodsName fl">
							<template v-if="item.attrInfo">
								<div class="name">
									{{item.goodsName}}
								</div>
								<div class="taste">{{item.attrInfo}}</div>
							</template>
							<template v-else>
								{{item.goodsName}}
							</template>
						</div>
						<div class="goodsPirce fl">
							<span :class=" item.isShowAvailPrice ? 'price' : 'memberPrice'">￥{{item.sourcePrice}}</span>
							<span class="memberPrice" v-if="item.isShowAvailPrice">￥{{item.availPrice}}</span>
						</div>
						<div class="add-and-subtract fr">
							<riskAdd :counter="item.num" :index="index" :exter="'all'" :key="index" :show="{'left':false,'right': item.type == '1' ? item.unit : true}" @sendCounter="getCounter"></riskAdd>
						</div>
					</template>
					<template v-else>
						<div class="packages-heade">
							<div class="goodsName  fl">
								<span>{{item.packageName}}</span>
								<img src="../../../../res/images/xl.png" :class="{'package-down':true,'package-up':showPackDeta[index]}" @click="clickItem(index)" alt="">
							</div>
							<div class="goodsPirce fl">
								<span :class="item.isShowAvailPrice ? 'price' : 'memberPrice'">￥{{item.sourcePrice}}</span>
								<span class="memberPrice" v-if="item.isShowAvailPrice ">￥{{item.availPrice}}</span>
							</div>
							<div class="add-and-subtract fr">
								<riskAdd :counter="item.num" :index="index" :exter="'all'" :key="index" @sendCounter="getCounter"></riskAdd>
							</div>
						</div>
						<template v-if="showPackDeta[index]">
							<div class="packages-tags" v-for="(tags,index) in item.packageTag" :key="index">
								<div class="tags-name">({{tags.tagName}}{{tags.goods.length}}选{{tags.totalNum}})</div>
								<ul>
									<li v-for="(goods,j) in tags.goods" :key="j">
										<span>{{goods.goodsName}}</span>
										<span>*{{goods.num}}</span>
									</li>
								</ul>
							</div>
						</template>
					</template>
				</div>
				<div>
					<span class="gray_tip" v-if="!isCompel && undisCountPrice>0">不参与优惠商品 小计 {{undisCountPrice.toFixed(2)}} 元</span>
					<div class="goods-item" v-for="(item,index) in carLists" :key="index + '_' + item.type" v-if="item.isDiscount == '0'">
						<template v-if="item.goodsName">
							<div class="goodsName fl">
								<template v-if="item.attrInfo">
									<div class="name">
										{{item.goodsName}}
									</div>
									<div class="taste">{{item.attrInfo}}</div>
								</template>
								<template v-else>
									{{item.goodsName}}
								</template>
							</div>
							<div class="goodsPirce fl">
								<span :class="item.isShowAvailPrice  ? 'price' : 'memberPrice'">￥{{item.sourcePrice}}</span>
								<span class="memberPrice" v-if="item.isShowAvailPrice ">￥{{item.availPrice}}</span>
							</div>
							<div class="add-and-subtract fr">
								<riskAdd :counter="item.num" :index="index" :exter="'all'" :key="index" :show="{'left':false,'right': item.type == '1' ? item.unit : true}" @sendCounter="getCounter"></riskAdd>
							</div>
						</template>
						<template v-else>
							<div class="packages-heade">
								<div class="goodsName  fl">
									{{item.packageName}}
									<img src="../../../../res/images/xl.png" :class="{'package-down':true,'package-up':showPackDeta[index]}" @click="clickItem(index)" alt="">
								</div>
								<div class="goodsPirce fl">
									<span :class="item.isShowAvailPrice  ? 'price' : 'memberPrice'">￥{{item.sourcePrice}}</span>
									<span class="memberPrice" v-if="item.isShowAvailPrice ">￥{{item.availPrice}}</span>
								</div>
								<div class="add-and-subtract fr">
									<riskAdd :counter="item.num" :index="index" :exter="'all'" :key="index" @sendCounter="getCounter"></riskAdd>
								</div>
							</div>
							<template v-if="showPackDeta[index]">
								<div class="packages-tags" v-for="(tags,index) in item.packageTag" :key="index">
									<div class="tags-name">({{tags.tagName}}{{tags.goods.length}}选{{tags.totalNum}})</div>
									<ul>
										<li v-for="(goods,j) in tags.goods" :key="j">
											<span>{{goods.goodsName}}</span>
											<span>*{{goods.num}}</span>
										</li>
									</ul>
								</div>
							</template>
						</template>
					</div>
				</div>
			</div>
			<div class="many-people-order" @click="goManyPeoPle" v-if="isSelfHelp && multiOrderStatus != '0'">商品如需分开打包，请使用多人订餐&nbsp;<em>&gt;</em></div>
		</div>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import store from '../../data/details_store';

	let selectPayWay = storage.session('selectPayWay');
	export default {
		data() {
			return {
				isMember: null,
				showPackDeta: {},
				isSelfHelp: !!storage.session('selectPayWay'),
				multiOrderStatus: selectPayWay ? selectPayWay.multiOrderStatus : null,
				// isFans: null,
				// memberInfo: null,
				atPrice: 0, // 普通口味多规格单价
				mbPrice: 0, // 会员口味多规格单价
			};
		},
		store,
		computed: {
			carLists: function() {
				let {
					carGoodsList,
					carPackageList
				} = this.$store.state.order;
				storage.session('carLists', this.$store.state.order.carLists);
				let temp = carGoodsList.concat(carPackageList);
				if (this.memberInfo) {
					// let discount = this.memberInfo.discount;
					for (let item of temp) {
						// item.hasVip = this.isMember && item.isVip != 0;
						// if (
						// 	this.isFans &&
						// 	((discount.isDiscount == '1' && item.isVip == '2') ||
						// 		(discount.isVipPrice == '1' && item.isVip == '1'))
						// ) {
						// 	item.hasVip = true;
						// }
						// 判断是不是会员优惠  计算单价+口味价格
						if (item.isAttr && item.memberPrice > -1) {
							this.atPrice = Number(item.price);
							this.mbPrice = (Number(item.memberPrice) + Number(item.attrPrice)).toFixed(2);
						} else if (item.isAttr) {
							this.atPrice = (Number(item.price) + Number(item.attrPrice)).toFixed(2);
						}

						if (item.isAttr) {
							// 转化口味展示，只显示口味，不显示价格
							let atArr = item.attrInfo.replace(/^\s+|\s+$/g, '');
							let str = '';
							atArr = atArr.split(' ');
							atArr = atArr.filter(element => element.indexOf('￥') == -1);
							atArr.forEach(item => {
								str += '+' + item;
							});
							str = str.substring(1, str.length);
							item.attrInfo = str;
						}
					}
				}
				return temp;
			},
			disCountPrice: function() {
				return this.$store.state.order.disCountPrice;
			},
			isCompel: function() {
				return this.$store.state.order.isCompel;
			},
			undisCountPrice: function() {
				return this.$store.state.order.undisCountPrice;
			},
		},
		methods: {
			clickItem(index) {
				if (this.showPackDeta[index] == undefined) {
					this.$set(this.showPackDeta, index, true);
				} else {
					this.showPackDeta[index] = !this.showPackDeta[index];
				}
			},
			close() {
				this.$emit('close');
			},
			getCounter(obj) {
				let item = utils.deepCopy(this.carLists[obj.index]);
				//   item.num =
				//     obj.type == 'add'
				//       ? ++obj.number
				//       : item.type == '1' && item.goodsName
				//         ? 0
				//         : --obj.number;
				// item.num = obj.number || 0;
				if (obj.type == 'risk') {
					if (Number(item.num) == Number(item.gnum)) {
						item.num = 0;
					} else {
						item.num = --obj.number || 0;
					}
				} else {
					item.num = obj.number || 0;
					if (Number(item.num) < Number(item.gnum)) {
						item.num = Number(item.gnum) * Number(obj.number) || 0;
					} else {
						item.num = ++obj.number || 0;
					}
				}


				let goods = {
					data: item, // 商品数据
					operateObj: item.goodsName ? 'carGoodsList' : 'carPackageList', // 操作对象
					operateType: 'splice',
					type:obj.type
				};
				this.$store.commit('setCarList', goods);
				if (this.carLists.length == 0) this.clearShopCar();
			},
			clearShopCar() {
				this.$store.commit('resetShopCar');
				this.$emit('close');
			},
			goManyPeoPle() {
				// 跳转至多人点餐
				let {
					tagList,
					carGoodsList,
					carPackageList,
				} = this.$store.state.order;
				let allGoods = carGoodsList.concat(carPackageList);
				// 缓存数据没有加入口袋
				if (tagList.length === 0) {
					this.$store.commit('setTagCar', allGoods);
				}
				storage.session('tagList', this.$store.state.order.tagList);
				storage.session('tagIndexObj', this.$store.state.order.tagIndexObj);
				storage.session('tagShopObj', this.$store.state.order.tagShopObj);
				this.$router.push('/manyPeopleOrder');
				this.$store.commit('setManyOrder', true);
			}
		},
		components: {
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ '../../../../components/riskAdd/risk_add.vue')
		},
		mounted() {
			storage.session('carLists', this.carLists);
			// let memberInfo = (this.memberInfo = storage.session('memberInfo'));
			// console.log(memberInfo, '000000000000.................');
			// this.isMember = !!memberInfo.member;
			// if (!this.isMember && memberInfo.discount) {
			// 	this.isFans = true;
			// }
		}
	};
</script>
<style lang='less' scoped>
	@import "../../../../res/css/base.less";

	.car-shade {
		position: fixed;
		width: 10rem;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		left: 50%;
		bottom: 1.4267rem;
		transform: translate(-50%, 0);
		z-index: 3;
	}

	.goods-content {
		position: absolute;
		background: #fff;
		left: 0;
		width: 10rem;
		z-index: 5;
		bottom: 1.4267rem;
		left: 50%;
		transform: translate(-50%, 0);

		.carTitle {
			height: 1.2rem;
			border-bottom: 1px solid #e8e8e8;

			img {
				width: 0.5067rem;
				height: 0.5067rem;
				margin: 0 0.2rem 0 0.4rem;
			}

			.clearcar {
				width: 2.2rem;
				height: 0.65rem;
				background: #fcae02;
				color: #fff;
				font-size: 0.2933rem;
				border-radius: 0.6667rem;
				text-align: center;
				line-height: 0.65rem;
				float: right;
				margin: 0.26rem;
			}

			.car-icon {
				height: 1.2rem;
				line-height: 1.2rem;
				width: 3rem;
				background: url(../../../../res/images/gwc.png) no-repeat 0.32rem center;
				background-size: 0.3733rem 0.4533rem;
				text-indent: 0.8667rem;
				font-family: PingFangSC-Medium;
				font-size: 0.32rem;
				color: #4e4e4e;
			}
		}

		.carList {
			max-height: 7.8667rem;
			overflow: auto;
			-webkit-overflow-scrolling: touch;

			.goods-item {
				.setBox(100%, auto);
				min-height: 1.52rem;
				border-bottom: 1px solid #e8e8e8;
				padding: 0 0.26rem 0 0.4rem;
				line-height: 1.52rem;

				img.icon{
					width: 0.35rem;
					vertical-align: middle;
				}

				.goodsName {
					.setBox(3.5rem, 100%);
					font-family: PingFangSC-Regular;
					font-size: 0.32rem;
					color: #343434;
					.text-overflow;

					.name,
					.taste {
						.setBox(100%, 50%);
					}

					.name {
						line-height: 0.5333rem;
						padding: 0.24rem 0 0.1467rem 0;
					}

					.taste {
						line-height: 0.5333rem;
						color: #8f8f8f;
						width: 100%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}

					span {
						float: left;
						max-width: 80%;
						.text-overflow;
					}
				}

				.goodsPirce {
					.setBox(2.9rem, 1.52rem);
					font-family: PingFangSC-Semibold;
					text-align: right;
					margin-right: 0.2667rem;
					.text-overflow;
					display: flex;
				}

				.price {
					font-family: PingFangSC-Medium;
					font-size: 0.3467rem;
					color: #8f8f8f;
					text-decoration: line-through;
					flex: 1;
					.text-overflow;
				}

				.memberPrice {
					font-size: 0.4267rem;
					color: #fe3937;
					margin-left: 0.1067rem;
					flex: 1;
					.text-overflow;
				}

				.add-and-subtract {
					.setBox(2.4rem, 100%);
				}
			}

			.package-down {
				.setBox(0.32rem, 0.32rem);
				vertical-align: middle;
				margin: 0.06rem 0.1rem;
				transform: scaleY(-1);
			}

			.package-up {
				transform: scaleY(1);
			}

			.packages-heade {
				overflow: hidden;
			}

			.packages-tags {
				overflow: hidden;

				ul li {
					.setBox(100%, 0.5333rem);
					line-height: 0.5333rem;
					font-family: PingFangSC-Regular;
					font-size: 0.2933rem;
					color: #8f8f8f;
					display: flex;

					span {
						&:first-child {
							flex: 3;
						}

						&:last-child {
							flex: 1;
							text-align: right;
						}
					}
				}
			}

			.tags-name {
				font-family: PingFangSC-Regular;
				font-size: 0.2933rem;
				color: #ff403f;
				line-height: 0.5333rem;
			}
		}
	}

	.many-people-order {
		background: #f8f8f8;
		width: 100%;
		height: 0.7733rem;
		line-height: 0.7733rem;
		font-family: PingFangSC-Medium;
		font-size: 0.32rem;
		color: #8f8f8f;
		text-align: center;
		clear: both;

		em {
			font-size: 0.4266rem;
		}
	}

	.gray_tip {
		padding: 0.2rem 0 0.2rem 0.4rem;
		display: inline-block;
		color: #8f8f8f;
		background: #f2f2f2;
		width: 100%;
	}
</style>