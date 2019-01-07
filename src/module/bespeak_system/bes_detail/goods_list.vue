<template>
	<div class="pay-goods" v-if="goods.num>0">
		<div class="fl" style="height: 100%;width: 55%;line-height: 1.5;">
			
			<!-- 结账页面 -->
			<template v-if="goods.hasOwnProperty('isShowAvailPrice')">
				<div class="pay-name fl" :style="{height:goods.attrInfo ? '50%':'1.25333rem',
					lineHeight:goods.attrInfo ? '' : '1.25333rem'}" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
					<img  class="icon" v-if="goods.isSpecial" src="../../../res/images/special_icon.png" alt="">
					<img  class="icon"   v-if="goods.isMust" src="../../../res/images/must.png" alt="">
					{{goods.goodsName}}
				</div>
			</template>
			<template v-else>
				<div class="pay-name fl" :style="{height:goods.attr.length > 0 ? '50%':'1.25333rem',
					lineHeight:goods.attr.length > 0 ? '' : '1.25333rem'}" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
					<img  class="icon"   v-if="goods.isSpecial" src="../../../res/images/special_icon.png" alt="">
					<img  class="icon"   v-if="goods.isMust" src="../../../res/images/must.png" alt="">
					{{goods.goodsName}}
				</div>
			</template>
			

			<!--有口味的菜品-->
			<div v-if="goods.attr.length > 0" class="attrInfo pay-name fl">
				<template v-for="(attr,index) in goods.attr">
					<span v-if="attr.options" :key="index">
						<template>
							{{getAttrName(attr.options)}}
						</template>
					</span>
					<span v-else-if="attr.name" :key="index">
						<template v-for="name in attr.name">
							{{getAttr(name)}}
						</template>
					</span>
				</template>
			</div>
		</div>

		<div class="pay-num fl">×{{goods.num}}</div>
		<div class="pay-sum fl">
			
			<template v-if="goods.hasOwnProperty('isShowAvailPrice')">
				<div class="initialPrice" :class="goods.isShowAvailPrice ? 'goodsDiscount' : ''">
					￥{{goods.sourcePrice}}
				</div>
				<div class="vipPrice" v-if="goods.isShowAvailPrice">￥{{goods.availPrice}}</div>
			</template>
			<template v-else>
				<div class="initialPrice" :class="goods.isShowAvailPrice ? 'goodsDiscount' : ''">
					￥{{(Number(goods.price) + Number(goods.attrPrice?goods.attrPrice:0)).toFixed(2)}}
				</div>
				<div class="vipPrice" v-if="goods.isShowAvailPrice">￥{{(Number(goods.memberPrice) + Number(goods.attrPrice?goods.attrPrice:0)).toFixed(2)}}</div>
			</template>
			<!-- <div class="initialPrice" :class="goods.isShowAvailPrice ? 'goodsDiscount' : ''">
				￥{{(Number(goods.price) + Number(goods.attrPrice?goods.attrPrice:0)).toFixed(2)}}
			</div>
			<div class="vipPrice" v-if="goods.isShowAvailPrice">￥{{(Number(goods.memberPrice) + Number(goods.attrPrice?goods.attrPrice:0)).toFixed(2)}}</div> -->
			
		</div>
	</div>
</template>
<script>
	import storage from 'src/verdor/storage';

	export default {
		data() {
			return {
				hasDiscount: false, //是否享受折扣和会员
				discount: 0, //折扣
				num: 0,
				isBesk:false//是否是预约
			};
		},
		methods: {
			getAttr(str) {
				return str.replace(':', ':￥');
			},
			getVipDiscount: function(price) {
				return ((Number(this.discount) / 100) * price).toFixed(2);
			},
			getAttrName(options) {
				let str = '';
				if (options.length > 0) {
					for (let i = 0; i < options.length; i++) {
						let item = options[i];
						if (item.attrStatu) {
							str += item.name + '+';
						}
					}
					str = str.substring(0, str.length - 1);
				}
				return str;
			}
		},
		computed: {},
		watch: {
			num: function() {
				let newV = this.isMember;
				if (newV) {
					//普通会员折扣
					this.hasDiscount = true;
					this.discount = this.memberDiscount;
				} else {

					//粉丝折扣
					let member = null;
					let discount = null;
					if (storage.session('wechatShop')) {
						member = storage.session('wechatShop').member;
						discount = storage.session('wechatShop').discount;
					} else {
						member = storage.session('memberInfo').member;
						discount = storage.session('memberInfo').discount;
					}
					//是否是粉丝
					let isFans = member == false && discount;
					let isOK = false;
					if ((member || isFans) && this.goods.isVip != '0') {
						if (discount.isDiscount == '1' && this.goods.isVip == '2') {
							isOK = true;
						} else if (discount.isVipPrice == '1' && this.goods.isVip == '1') {
							isOK = true;
						}

					}

					if (isOK) {
						this.hasDiscount = true;
						this.discount = discount.discount;
					}
				}
			}
		},
		props: {
			goods: {
				type: [Object, Array]
			},
			isMember: {
				type: [Boolean, Number],
				default: -1
			},
			memberDiscount: [String, Number]
		},
		beforeUpdate() {
			this.num++;
		},
		mounted() {
			this.num++;
			let besk = storage.session('bespeak_shopInfo');
			this.isBesk = !!besk;
		},
	};
</script>
<style lang="less" scoped>
	.pay-list {
		width: calc(100%);
		height: 1.25333rem;
		line-height: 1.25333rem;
		color: #666;
	}

	.pay-list .pay-name {
		font-size: 0.37333rem;
		color: #333333;
		width: 55%;
		height: 1.25333rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;

		img.icon{
			width:0.4rem;
			vertical-align: middle;
		}

	}

	.pay-list .pay-num {
		font-size: 0.37333rem;
		color: #bbbbbb;
		width: 15%;
		height: 1.25333rem;
		text-align: center;
	}

	.pay-list .pay-sum {
		text-align: right;
		font-size: 0.37333rem;
		color: #333333;
		width: 30%;
		height: 1.25333rem;
		padding-right: 0.4rem;
		box-sizing: border-box;
		text-align: right;
		display: -webkit-box;
		-webkit-box-pack: center;
		-webkit-box-align: start;
		word-break: break-all;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	.vipPrice,
	.initialPrice {
		height: 50%;
		width: 100%;
		line-height: 0.6266666666666667rem;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: right;
	}

	.pay-list .pay-package {
		width: 100%;
		height: auto;
		line-height: 0.6rem;
		background-color: #efefef;
		text-indent: 0.4rem;
		overflow: hidden;
	}

	.pay-list .pay-package .package-goods {
		width: 100%;
		height: auto;
		background-color: #efefef;
	}

	.pay-list .pay-package .package-goods .pay-goodsName {
		color: #333333;
		font-size: 0.34667rem;
		width: 80%;
		height: 0.6rem;
	}

	.pay-list .pay-package .package-goods .pay-goodsNum {
		color: #333333;
		font-size: 0.34667rem;
		text-align: right;
		padding-right: 0.4rem;
		box-sizing: border-box;
		width: 20%;
		height: 0.6rem;
	}

	.pay-list .pay-integral {
		width: 85%;
		height: 1.25333rem;
		color: #333333;
		font-size: 0.37333rem;
		text-indent: 0.13333rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.pay-list .integral-explain {
		display: block;
		width: auto;
		height: 100%;
		font-size: 0.32rem;
		color: #999999;
	}

	.pay-list .integral-tip {
		display: block;
		margin-left: 0.06667rem;
		width: 0.66667rem;
		height: 100%;
		background: url(../../../res/images/integral-tip.png) center center no-repeat;
		background-size: 0.53333rem 0.53333rem;
	}

	.pay-list .integral-icon {
		display: block;
		width: 0.42667rem;
		height: 100%;
		background: url(../../../res/images/integral-icon.png) center center no-repeat;
		background-size: 0.42667rem 0.42667rem;
	}

	.pay-list .integral-off {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		margin-top: 0.36rem;
		margin-left: 0.13333rem;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-position: 0 0;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		overflow: hidden;
	}

	.pay-list .integral-on {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		margin-top: 0.36rem;
		margin-left: 0.13333rem;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		background-position: -1.04rem 0;
		overflow: hidden;
	}

	.pay-list .using-integral {
		width: calc(100% - 0.93333rem);
		height: 1.25333rem;
		margin-left: 0.93333rem;
		color: #333333;
		font-size: 0.37333rem;
		overflow: hidden;
	}

	.pay-list .using-integral input {
		border: 1px solid #e5e5e5;
		width: 2rem;
		height: 0.93333rem;
		background-color: #f7f7f7;
		margin-top: 0.16rem;
		margin-left: 0.26667rem;
		margin-right: 0.26667rem;
		padding-left: 0.26667rem;
	}

	.pay-goods {
		height: 1.25333rem;
		text-indent: 0.4rem;
		border-bottom: 1px solid #DDDDDD;
	}

	.pay-goods .attrInfo {
		height: 50%;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #777
	}

	.goodsDiscount {
		text-decoration: line-through;
		font-style: italic;
		color: #aba6a6;
		padding-right: 0.1rem;
	}

	.goodsDiscounts {
		color: #aba6a6;
	}
</style>