<template>
	<div id="membershipDetail">
		<div class="couDetail">
			<div class="semicircle semleft"></div>
			<div class="semicircle semright"></div>
			<!-- <div class="disc" style="left:-0.13rem;"></div>
		<div class="disc" style="right:-0.13rem;"></div> -->
			<!-- <div class="disc" style="top:9.6rem;left:-0.13rem;"></div>
		<div class="disc" style="top:9.66rem;right:-0.13rem;"></div> -->
			<!-- 价格 -->
			<div class="price">
				￥{{info.payment}}
			</div>
			<!-- 名称 -->
			<div class="name">
				{{info.name}}
			</div>
			<!-- 包含项 -->
			<div class="include">
				<span></span>
				包含项
				<span></span>
			</div>
			<!-- 优惠券-->
			<div class="stored ">
				<div class="gold">
					储值金:{{info.deposit}}元+送{{info.giftAmount}}元
				</div>
				<!-- 积分 -->
				<div class="point">
					积分:{{info.giftPoint}}积分
				</div>
				<!-- 券 -->
				<div class="coupon">
					优惠券：
				</div>
				<!-- 优惠券详情 -->
				<div class="noCoupon" v-if="info.couponIds.length == 0||coupons.length == 0">
					暂无优惠券
				</div>
				<ul v-for="(item,index) in coupons" :key="index">
					<li>
						{{index+1}}.&nbsp;{{item.name}}
					</li>
					<li>
						适用门店: {{item.shopName}}
					</li>
					<li v-if="item .validityType == '1'">
						使用规则:有效期{{transformTime(item.startTime)}}至{{transformTime(item.endTime)}}
					</li>
					<li v-if="item.validityType == '0'">
						使用规则:领取后{{item.relativeTime}}天内有效
					</li>
				</ul>
			</div>
			<!-- 按钮 -->
			<div class="buy" @click="pay">
				立即购买
			</div>
		</div>
	</div>
</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import {
		SQB_WX,
		SQB_ALI
	} from 'src/manager/global';

	let wx_sdk = null;
	export default {
		data() {
			return {
				info: {
					couponIds: []
				},
				coupons: [], //优惠券列表
				storeName: '',
				shopList: '',
				payType: '',
				data: '',
				openId: '',
				userInfo: {},
				shopId: '',
			};
		},
		methods: {
			async getcouponInfo() {
				//获取优惠券详情
				if (this.info.couponIds == null || this.info.couponIds.length == 0) {
					this.info.couponIds = [];
				} else {

					let data = await http.getCouponByIds({
						data: {
							shopId: this.shopId,
							couponIds: this.getcouponId(this.info.couponIds)
						}
					});
					this.coupons = data;
				}
			},
			async pay() {
				let data = storage.session('payData');
				data.sqbData = JSON.stringify({
					hash: 'rechargeDetail'
				});
				await wx_sdk.goPay({
					payData: data,
					payLink: 'wechatRecharge',
					callBack: (res,next) => {
						if (res.payType == SQB_WX || res.payType == SQB_ALI) {
							storage.session('rechargeDetail_data', res);
						}
						next();
					},
					payCallBack: (status) => {
						let str = '';
						if (status) {
							str = '成功';
						} else {
							str = '失败';
						}
						this.$store.commit('setWin', {
							content: `支付${str}`
						});
					},
					isAsync:true
				});
			},
			getcouponId(arr) {
				let ids = '';
				for (let i = 0; i < arr.length; i++) {
					ids += '' + arr[i].id + ',';
				}
				return ids;
			},
			transformTime(t) {
				let d = new Date(Number(t + '000'));
				return utils.format(d, 'yyyy-MM-dd hh:mm');
			}
		},
		async mounted() {
			let payData = storage.session('payData');

			this.payType = payData.payType;
			this.openId = payData.openId;
			this.shopId = payData.shopId;
			this.info = storage.session('schemeDetail'); //获取优惠券详情; 

			let sqb = storage.session('rechargeDetail_data');
			if (sqb && sqb.oid) {
				storage.session('rechargeDetail_data', null);
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: sqb.oid,
						type: 'rechargePay'
					}
				});
				let str = '';
				if (d) {
					str = '成功';
				} else {
					str = '失败';
				}
				this.$store.commit('setWin', {
					content: `支付${str}`
				});
			}

			// this.userInfo = storage.session('recharge_d')||storage.session('membership');
			// this.store = shopName;
			// this.shopList = shopList;

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;

			this.getcouponInfo();
			utils.setTitle('权益详情');
		}
	};
</script>
<style lang="less" scoped>
	@import '../../res/css/base.less';

	#membershipDetail {

		width: 100%;
		height: 100%;
		background: url("../../res/images/saoma-bg.jpg") left top;
		box-sizing: border-box;
		padding-top: 1.12rem;

		.couDetail {

			width: 9.53rem;
			height: 13.1rem;
			background: #fff;
			margin: 0 auto;
			padding-top: 0.96rem;
			position: relative;

			.price {
				width: 100%;
				margin: 0rem 0 0.32rem 0;
				text-align: center;
				color: #febe33;
				font-size: 0.96rem;
			}

			.name {
				width: 100%;
				color: #000;
				font-size: 0.5rem;
				text-align: center;
				margin-bottom: 0.65rem;
			}

			.include {
				width: 100%;
				padding: 0 0.2rem;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 0.3rem;
				color: #6c6c6c;
				box-sizing: border-box;
				margin-bottom: 0.4rem;

				span {
					display: block;
					width: 3.58rem;
					height: 1px;
					background: #000;
				}
			}

			.stored {
				height: 7rem;
				padding-left: 0.8rem;
				overflow-y: scroll;
				overflow-x: hidden;

				.gold,
				.point,
				.coupon {
					font-size: 0.33rem;
					color: #6c6c6c;
					margin-bottom: 0.3rem;
				}

				ul {
					width: 100%;
					height: auto;

					li {
						font-size: 0.33rem;
						color: #6c6c6c;
						margin-bottom: 0.3rem;
					}
				}

				.noCoupon {
					font-size: 0.33rem;
					color: #6c6c6c;
				}
			}

			.buy {
				width: 100%;
				height: 1.28rem;
				background: #febe33;
				font-size: 0.48rem;
				color: #fff;
				text-align: center;
				line-height: 1.28rem;
				position: absolute;
				left: 0;
				bottom: 0;
			}

			.semicircle {
				width: 0.48rem;
				height: 0.8rem;
				background: #1a1714;
				position: absolute;
				top: 5.35rem;
			}

			.semleft {
				border-radius: 0.4rem 0 0 0.4rem;
				right: 0;
			}

			.semright {
				border-radius: 0 0.4rem 0.4rem 0;
				left: 0;
			}

			.disc {
				width: 0.26rem;
				height: 0.26rem;
				background: #1a1714;
				border-radius: 100%;
				position: absolute;
				top: 7rem;
			}
		}
	}
</style>