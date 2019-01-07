/* * @Author: ruokun.ma * @Date: 2018-06-19 16:45:14 * @Module: {商品详情} */
<template>
	<section class="detail">
		<div>
			<div @click="back" class="contiue">继续点餐</div>
			<img :src="getUrl(item.imageName)" alt="">
		</div>
		<section class="content">
			<div>
				<div class="title bot_solid">
					<span class="nametext">{{item.packageName?item.packageName:item.goodsName}}</span>
					<!-- <span class="taste tips" v-if="!item.packageName && item.isAttr">口味</span>
                    <span class="taste tips"  v-if="item.packageName">套餐</span>
                    <span class="taste tips" v-if="!item.packageName && item.type == 1">斤两</span> -->
					<riskAdd :counter="getGoodsMaxNum" :index="item.id - 0" :tofix="item.type == '1' && item.goodsName ? 2 : 0" :max="Number(item.packageGoodsNum) || 99" class="btn_add" :exter='exterStaus' @sendCounter='getCounter'></riskAdd>
					<!-- <div v-if ="showStatus === false" class="choose-taste"  @click="openSpecialDetail" >选规格</div> -->
				</div>
				<div class="price_num bot_solid" v-if="!item.packageTagId">
					
					<!-- <span class="price member" v-if='item.isShowAvailPrice'>{{item.memberPrice}}</span> -->
					<template v-if="item.isShowAvailPrice">
						<div class="vip" v-if="item.isSpecial != 1">
							<span class="price">{{item.price}}</span>
							<span class="price member">{{item.memberPrice}}</span>
						</div>
						<div v-else class="special">
							<span class="price">{{item.memberPrice}}</span>
							<span class="sourcePrice">￥{{item.price}}</span>
							<span class="disCount">{{item.specDis}}折</span>
							<!-- <span class="subInfo">限{{item.specialNum}}份优惠</span> -->
						</div>
					</template>
					<template v-else>
						<span class="price">{{item.price}}</span>
					</template>
				</div>

				<div class="tips bot_solid" v-if="item.gnum">
					<img src="../../../../res/images/error_tips.png" alt="">
					<span>此商品最少{{item.gnum}}个起售</span>
				</div>
				<div class="package_detail bot_solid bot_s" v-if='item.type == 0 && item.packageName'>
					<div class="title goods_details">套餐详情</div>
					<ul v-for='(i,index) in packageTag' :key="index">
						<li v-for='(ii,index_i) in i.goods' :key="index_i">{{ii.goodsName}}
							<b class="b_s" v-if="ii.attr">
								(
								<b v-for="(iii,index_ii) in ii.attr" :key="index_ii" v-if="iii.name">
									<b class="b_s"> {{iii.name}} </b>
								</b>)
							</b>
							<b class="b_s" v-else-if="!ii.attr"></b>
							<span>x{{ii.packageGoodsNum}}</span>
						</li>
					</ul>
				</div>
				<div class="good_detail bot_solid bot_s" v-if="item.description!=''">
					<div class="title goods_details">商品详情</div>
					<div class="content goods_content">{{item.description}}</div>
				</div>
			</div>
		</section>
		<transition name="fade">
			<specialDetail @chooseTaste="emit" v-if="show" :obj="specialData"></specialDetail>
		</transition>
	</section>
</template>

<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';

	let orderData = null;
	export default {
		data() {
			return {
				tips: false,
				item: {},
				open: false,
				index: null,
				packageTag: [],
				num: 0,
				show: false,
				exterStaus: '',
				showDe: false,
				data: {},
				isSelectShop: Boolean(storage.session('select-shop')),
				showType: null,
				specialData: {}, //选择口味需要用的数据

			};
		},
		computed: {
			showStatus() {

				if (this.showType == '1') {
					return true;
				} else if (this.showType == '2') {
					if (this.item.num > 0) {
						return true;
					} else {
						return false;
					}
				}

				return null;
			},
			getGoodsMaxNum() {
				let GoodsMaxNum = this.$store.state.order.shopCarObj[(!!this.item.goodsName - 0) + '_' + this.item.id] || 0;
				return GoodsMaxNum;
			}
		},
		methods: {
			back() {
				this.$router.push('/latestOrder');
			},
			getUrl(imageName) {
				return global.getImgUrl({
					url: imageName
				});
			},
			toSearch() {
				this.$router.push('/searchList');
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
				let i = this.item;
				if (!this.item.isAttr || this.item.type == 1 || this.item.isGroup == 1 && this.item.goodsName) {
					i.num = item.number;
				}
				storage.session('specialDetail', i);
				if (i.packageName) {
					let goodsPackges = orderData.getPackage(i);
					storage.session('goodsPackges', goodsPackges);
					this.$router.push({
						path: '/goodsPackages'
					});
				} else if (!i.packageName && i.isAttr || i.type == 1 || i.isGroup == 1) {
					//口味
					if (item.type == 'add') {
						this.openSpec(i);
					} else {
						this.$store.commit('setWin', {
							content: '请在购物车中删除'
						});
					}
				} else if (this.type == 2) {
					// console.log(JSON.stringify(obj))
					this.item.operationType = item.type;
					this.$emit('packagesGoods', this.item);
				} else {

					let goods = {
						data: i, // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: this.item.num > 0 ? 'splice' : 'push'
					};
					this.$store.commit('setCarList', goods);

				}

			},
			close() {
				this.open = false;
			},
		},
		components: {

			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ '../../../../components/riskAdd/risk_add.vue'),
			specialDetail: () =>
				import( /* webpackChunkName: 'special_detail' */ '../order/special_detail'),

		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'lt_order_data' */ '../../data/order_data.js');
			orderData = orderData.default;

			this.item = storage.session('goodDetail');
			this.packageTag = this.item.packageName ? this.item.packageTag : {};


			let memberInfo = storage.session('memberInfo');

			let discount = memberInfo.member ?
				memberInfo.member.level.discount / 100 :
				1;

			//是粉丝
			// let isFans = !memberInfo.member && memberInfo.discount;
			// let fansHaveDis = isFans && memberInfo.discount.isDiscount;
			// if(isFans && memberInfo.discount.isDiscount){
			//     discount = memberInfo.discount.discount / 100;
			//     this.memberInfo.member = discount;
			// }

			this.$store.commit('setMemberInfo', {
				isMember: Boolean(memberInfo.member),
				memberDiscount: discount
			});

			// 是否自己处理加减数据
			/**
			 * 自己处理数据如下：
			 * this.item.isGroup > 0 多规格
			 * Boolean(this.item.type == '1' && this.item.goodsName) 斤两菜
			 * Boolean(this.item.packageName) 套餐
			 * this.item.isAttr 口味菜
			 */

			if (this.item.isGroup > 0 || Boolean(this.item.type == '1' && this.item.goodsName) || Boolean(this.item.packageName) ||
				this.item.isAttr) {
				this.exterStaus = 'all';
			} else {
				this.exterStaus = '';
			}

			if (this.item.num == undefined) {
				this.item.num = 0;
			}
		}
	};
</script>

<style lang="less" scoped>
	.detail {
		min-height: 100%;
		background: #fff;
		padding-bottom: 2rem;

		&>div {
			position: relative;
			padding-top: 7.2rem;

			.contiue {
				position: absolute;
				background: rgba(0, 0, 0, 0.5);
				border-radius: 1.04rem;
				font-size: 0.32rem;
				color: #FFFFFF;
				top: 0.5rem;
				left: 0.2rem;
				z-index: 1;
				width: 2.0933rem;
				height: 0.6933rem;
				line-height: 0.6933rem;
				text-align: center;
			}

			img {
				position: absolute;
				top: 0;
				width: 100%;
				height: 7.2rem;
			}
		}

		.content {
			&>div {
				width: 90%;
				margin: 0 auto;

				.title {
					font-size: 0.4267rem;
					color: #2D2D2D;
					height: 1.25rem;
					line-height: 1.25rem;

					span:nth-child(1) {
						font-weight: bold;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 3;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						display: inline-block;
						width: 6rem;
						font-size: 0.4267rem;
					}

					.tips {
						font-size: 0.2933rem;
						padding: 0.05rem 0.3rem;
						border-radius: 0.4rem;
					}

					.taste {
						border: 1px solid #FCAE02;
						color: #FCAE02;
					}
				}

				.bot_solid {
					border-bottom: 1px solid #E8E8E8;
				}

				.bot_s {
					padding-top: 0.2667rem;
				}

				.price_num {
					height: 1.25rem;
					line-height: 1.25rem;

					.price {
						font-size: 0.4267rem;
						color: #F4333C;
						margin-right: 0.2rem;
					}

					.price::before {
						content: "￥";
						font-size: 0.2933rem;
						color: #FE3937;
					}

					

					.vip{
						.price {
							font-size: 0.4267rem;
							color: #F4333C;
							margin-right: 0.5rem;
						}

						.price::before {
							content: "￥";
							font-size: 0.2933rem;
							color: #FE3937;
						}

						.member {
							background: rgba(255, 0, 0, 0.20);
							border-radius: 2px;
							padding: 0 0.15rem;
						}

						.member::after {
							content: "会员价";
							font-size: 0.2133rem;
						}
					}
					.special{
						.sourcePrice{
							text-decoration: line-through; 
							color: #8F8F8F;
						}
						.disCount{
							color: #FF2035;
							font-size: 0.3467rem;
							border: 1px solid #FF2035;
							padding: 0.02rem 0.05rem;
						}
						.subInfo{
							color: #FF2035;
							font-size: 0.3467rem;
							padding-left: 0.1rem;
						}
					}	
				}

				.tips {
					height: 1rem;
					font-size: 0.2933rem;
					color: #F4333C;
					line-height: 1rem;

					img {
						width: 0.35rem;
						height: 0.35rem;
						vertical-align: middle;
					}

					span {
						vertical-align: middle;
					}
				}

				.package_detail {
					padding: 0.25rem 0;

					ul {
						li {
							font-size: 0.2933rem;
							color: #8F8F8F;
							padding: 0.05rem 0rem;
							position: relative;

							.b_s {
								font-weight: 400;
							}

							span {
								position: absolute;
								right: 0;
							}
						}
					}
				}

				.title {
					font-size: 0.3467rem;
					color: #2D2D2D;
					height: 1.1467rem;
					line-height: 1.1467rem;
				}

				.goods_details {
					height: 0.6rem;
					line-height: 0.6rem;
				}

				.good_detail {
					padding: 0.25rem 0;

					.content {
						font-size: 0.2933rem;
						color: #8F8F8F;
						// padding-top: 0.1rem;
					}

					.goods_content {
						margin-top: 0.1333rem;
					}
				}

				.bot_s {
					padding-top: 0.2667rem;
				}
			}
		}
	}

	.btn_right {
		float: right;
	}

	.choose-taste {
		float: right;
		width: 1.3333rem;
		height: .6667rem;
		line-height: .6667rem;
		text-align: center;
		font-family: PingFangSC-Medium;
		font-size: .2933rem;
		color: #FFFFFF;
		background: #FCAE02;
		border-radius: 1.3333rem;
		margin-top: 0.24rem;
	}

	.btn_add {
		float: right;
	}
</style>