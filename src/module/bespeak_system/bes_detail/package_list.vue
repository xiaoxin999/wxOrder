<template>
	<div class="pay-list" style="height: auto;" v-if="packages.num>0">
		<div class="pay-goods">
			<div class="pay-name fl">{{packages.packageName}}</div>
			<div class="pay-num fl">×{{packages.num}}</div>
			
			<div class="initialPrice" :class=" packages.isShowAvailPrice ? 'goodsDiscount' : ''">￥{{packages.price}}</div>
			<div class="vipPrice" v-if="packages.isShowAvailPrice">￥{{packages.memberPrice}}</div>
		
		</div>
		<template v-for="(tag,index) in packages.packageTag">
			<div class="pay-package" v-for="(goods,index1) in tag.goods" :key="index + '_' + index1 ">
				<div class="package-goods">
					<div class="pay-goodsName fl">
						{{goods.goodsName}}
						<template v-for="attr in goods.attr">
							<template v-for="options in attr.options">
								<template v-if="options.attrStatu">
									({{options.name}})
								</template>
							</template>
						</template>
					</div>
					<div class="pay-goodsNum fl">×{{goods.num}}</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				num: 0
			};
		},
		props: {
			packages: {
				type: null
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
	}

	.pay-list .pay-num {
		font-size: 0.37333rem;
		color: #bbbbbb;
		width: 15%;
		height: 1.25333rem;
		text-align: center;
	}

	.pay-list .pay-sum {
		font-size: 0.37333rem;
		color: #333333;
		width: 20%;
		height: 1.25333rem;
		padding-right: 0.4rem;
		box-sizing: border-box;
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
		line-height: 0.6rem;
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
		//   width: calc(100% - 0.4rem);
		height: 1.25333rem;
		//   margin-left: 0.4rem;
		text-indent: 0.4rem;
		border-bottom: 1px solid #DDDDDD;
	}

	// .pay-list:last-child .pay-goods {
	//   border-bottom: none; }
	.vipPrice,
	.initialPrice {
		font-size: 0.37333rem;
		color: #333333;
		width: 30%;
		padding-right: 0.4rem;
		box-sizing: border-box;
		height: 50%;
		line-height: 0.6266666666666667rem;
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.goodsDiscount {
		text-decoration: line-through;
		font-style: italic;
		color: #aba6a6;
	}

	.goodsDiscounts {
		color: #aba6a6;
	}
</style>