<template>
	<div class="pay-concent" style="margin-bottom: 0;">
		<div class="pay-subhead">
			<div class="pay-sub fl">商品详情</div>
			<div class="pay-sum fl" v-if="isEdit == false">￥{{sumPrice}}</div>
			<div class="pay-sum fl" v-else>￥{{primeCost}}</div>
		</div>
		<div class="pay-list" v-for="(goods,i) in goodsList" :key="i" v-if="isEdit == false">
			<goods-list :isMember="isMember" :memberDiscount="memberDiscount" :goods="goods"></goods-list>
		</div>
		<div v-if="isEdit">
			<goods-list-edit v-for="(goods,index) in goodsList" :key="index + 's'">
				<show-goods-number :goods="goods" v-if="goods.num > 0" slot="goodsNum">
					<div slot="content" class="pay-num fl">×{{goods.num}}</div>
					<div slot="content" class="pay-sum fl">￥{{goods.price}}</div>
				</show-goods-number>
				<show-goods-number :goods="goods" v-if="goods.returnNum && goods.returnNum > 0" slot="goodsReturnNum">
					<div slot="content" class="pay-num fl">×{{goods.returnNum}}</div>
					<div slot="content" class="pay-sum fl"></div>
				</show-goods-number>
				<show-goods-number :goods="goods" v-if="goods.freeNum && goods.freeNum > 0" slot="goodsFreeNum">
					<div slot="content" class="pay-num fl">×{{goods.freeNum}}</div>
					<div slot="content" class="pay-sum fl"></div>
				</show-goods-number>
			</goods-list-edit>
		</div>
		<package-list :isMember="isMember" :memberDiscount="memberDiscount" v-for="packages in packagesList" :packages="packages" :key="packages.id" v-if="isEdit == false">
		</package-list>
		<div v-if="isEdit">
			<goods-list-edit v-for="packages in packagesList" :key="packages.id">
				<show-package-number :packages="packages" v-if="packages.num > 0" slot="goodsNum">
					<div slot="paygoods" class="pay-goods">
						<div class="pay-name fl">{{packages.packageName}}</div>
						<div class="pay-num fl">×{{packages.num}}</div>
						<div class="pay-sum fl">￥{{packages.price}}</div>
					</div>
				</show-package-number>
				<show-package-number :packages="packages" v-if="packages.returnNum && packages.returnNum > 0" slot="goodsReturnNum">
					<div slot="paygoods" class="pay-goods">
						<div class="pay-name fl">{{packages.packageName}}</div>
						<div class="pay-num fl">×{{packages.returnNum}}</div>
						<div class="pay-sum fl returnnum"></div>
					</div>
				</show-package-number>
				<show-package-number :packages="packages" v-if="packages.freeNum && packages.freeNum > 0" slot="goodsFreeNum">
					<div slot="paygoods" class="pay-goods">
						<div class="pay-name fl">{{packages.packageName}}</div>
						<div class="pay-num fl">×{{packages.freeNum}}</div>
						<div class="pay-sum fl freenum"></div>
					</div>
				</show-package-number>
			</goods-list-edit>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'payContent',
		props: {
			isEdit: {
				type: Boolean,
				default: false
			},
			goodsList: {
				type: Array
			},
			sumPrice: {
				type: null
			},
			primeCost: {
				type: null
			},
			packagesList: {
				type: Array
			},
			isMember: {
				type: Boolean
			},
			memberDiscount: {
				type: [String, Number]
			}
		},
		components: {
			GoodsList: () => import( /* webpackChunkName: "goods_list"*/ './goods_list'),
			'package-list': () => import( /* webpackChunkName: "package_list"*/ './package_list'),
			GoodsListEdit: () => import( /* webpackChunkName: "goods_list_edit"*/ './goods_list_edit'),
			'show-goods-number': () => import( /* webpackChunkName: "show_goods_number"*/ './show_goods_number'),
			'show-package-number': () => import( /* webpackChunkName: "show_package_number"*/ './show_package_number')
		}
	};
</script>

<style lang="less">
	.pay-concent {
		width: 100%;
		height: auto;
		background-color: #ffffff;
		margin-bottom: 0.2rem;
		overflow: hidden;
	}

	.pay-concent .pay-box {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		position: relative;
	}

	.pay-concent .pay-box .pay-shouBox {
		width: calc(100% - 15px);
		height: 1.25333rem;
		margin-left: 0.4rem;
		font-size: 0;
		border-bottom: 1px solid #dddddd;
		box-sizing: border-box;
	}

	.pay-concent .pay-box .pay-shouBox span {
		width: 30%;
		height: 1.25333rem;
		font-size: 0.34667rem;
		color: #333333;
	}

	.pay-concent .pay-box .pay-shouBox span.more-Tbale {
		position: absolute;
		right: 0.93333rem;
		top: 0.45333rem;
		width: 0.21333rem;
		height: 0.33333rem;
		background: url(../../../res/images/moretable.png) no-repeat;
		background-size: 0.21333rem 0.33333rem;
	}

	.pay-concent .pay-box .pay-shouBox input {
		outline: none;
		border: none;
		padding: 0;
		width: 70%;
		height: 1.17333rem;
		font-size: 0.34667rem !important;
		color: #999999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
	}

	.pay-concent .pay-box .pay-shouBox .inputWidth {
		width: calc(100% - 3.26667rem);
		height: 1.17333rem;
	}

	.pay-concent .pay-box .pay-shouBox div {
		width: calc(50% - 30px);
		height: 1.13333rem;
		line-height: 1.13333rem;
		font-size: 0.32rem !important;
		color: #999999;
		float: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pay-subhead {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: 0.4rem;
		border-bottom: 1px solid #DDDDDD;
	}

	.pay-subhead .pay-sub {
		width: 60%;
		height: 1.25333rem;
		font-size: 0.42667rem;
		position: relative;
	}

	.pay-subhead .pay-sub:after {
		content: '';
		display: block;
		width: 0.08rem;
		height: 0.37333rem;
		background-color: #6ba9f1;
		position: absolute;
		left: 0.24rem;
		top: 0.42667rem;
	}

	.pay-subhead .pay-tit {
		width: 100%;
		height: 1.25333rem;
		font-size: 0.42667rem;
		background-color: #FFFFFF;
		position: relative;
	}

	.pay-subhead .pay-tit:after {
		content: '';
		display: block;
		width: 0.08rem;
		height: 0.37333rem;
		background-color: #f5a623;
		position: absolute;
		left: 0.24rem;
		top: 0.42667rem;
	}

	.pay-subhead .pay-sum {
		width: 40%;
		height: 1.25333rem;
		color: #d0021b;
		font-size: 0.37333rem;
		padding-right: 0.4rem;
		box-sizing: border-box;
		text-align: right;
	}

	.pay-list {
		width: calc(100%);
		height: 1.25333rem;
		line-height: 1.25333rem;
		color: #666;
	}

	.pay-list .pay-name {
		font-size: 0.37333rem;
		color: #333333;
		width: 65%;
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
		width: calc(100% - 0.4rem);
		height: 1.25333rem;
		margin-left: 0.4rem;
		border-bottom: 1px solid #DDDDDD;
	}

	.pay-list:last-child .pay-goods {
		border-bottom: none;
	}
</style>