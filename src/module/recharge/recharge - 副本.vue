<template>
	<div id="membership">
		<div class="head">
			<span>会员储值权益</span>
			<!-- <img src="../../res/images/crown.png" /> -->
		</div>
		<!-- 券 -->
		<div class="coupon" v-if="!loading">
			<div class="list" v-for="(item,index) in storedList" :key="index">
				<div class="list_t">
					<div class="list_l">
						<span v-if="item.payment.length < 7 ">￥{{item.payment}}</span>
						<span style="font-size: 0.5rem;" v-if="item.payment.length > 6 && item.payment.length < 10 ">￥{{item.payment}}</span>
						<span style="font-size: 0.4rem;" v-if="item.payment.length > 9 && item.payment.length < 12 ">￥{{item.payment}}</span>
					</div>
					<div class="list_r">
						<p>{{item.name}}</p>
						<!-- <a href="javascript:;" @click="pay(item)">立即购买</a> -->
						<a href="javascript:;" @click="handleDirectToPay(item)">立即购买</a>
					</div>
				</div>
				<div class="list_b" @click="openSchemeDetail(item)">
					<span class="disc"></span>
					<div class="sp">
						<span>包含{{item.deposit}}元+{{item.giftPoint}}积分+送{{item.giftAmount}}元{{getcoupon(item.couponIds)}}</span>
					</div>
					<img src="../../res/images/more.png" />
				</div>
			</div>
			<!-- 无方案的情况下 -->
			<div class="noList" v-if="storedList.length == 0">
				-暂无充值方案-
			</div>
		</div>
		<!-- loading -->
		<div class="spinner" v-if="loading">
			<div class="double-bounce1"></div>
			<div class="double-bounce2"></div>
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
				token: ' ', //token
				shopName: '',
				storedList: '',
				openId: '',
				payType: '', //支付方式
				infoData: '', //支付信息
				loading: true,
				userInfo: {},
				modeType: {},
				show: false,
				tempItem: '',
				shopId: utils.getQueryString('shopId') || '10069',
			};
		},
		methods: {
			async getUserInfo() {
				//获取用户的信息
				let data = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						from: 0,
						type: 3
					}
				});
				this.userInfo = data;
				storage.session('recharge_d', data);

				if (!data.member) {
					this.$store.commit('setWin', {
						title: '操作提示',
						content: '您还不是会员,确认后跳转至会员注册',
						type: 'alert',
						callBack: () => {
							this.$router.push('/memberRegister');
						}
					});
					return false;
				}
				this.shopName = data.shopName;
				storage.session('shopName', data.shopName);
				storage.session('shopList', data.shopList);

			},
			async getList() {

				let data = await http.getRechargeConfig({
					data: {
						shopId: this.shopId
					}
				});
				this.storedList = data; //获取储值的类表内容
				this.loading = false;
			},
			getcoupon(arr) {
				let couponDetail = '';
				if (arr.length == 0) {
					couponDetail = '';
				} else {
					for (let i = 0; i < arr.length; i++) {
						couponDetail += '+' + arr[i].name + arr[i].num + '张';
					}
				}
				return couponDetail;
			},
			openSchemeDetail(scheme) {
				// 点击对应的方案查看详情
				let payData = this.getSendData(scheme);
				storage.session('payData', payData);
				storage.session('schemeDetail', scheme);
				this.$router.push('/rechargeDetail');
			},

			getSendData(item) {
				let id = 0;
				// if(userInfo) id = userInfo.member.rechargeShopId;
				return {
					planId: item.id,
					payType: this.payType,
					openId: this.openId || '',
					shopId: id == 0 ? this.shopId : id,
					sqbData: JSON.stringify({
						hash: 'recharge'
					})
				};
			},

			closePage() {
				this.show = false;
			},
			// 旧支付方式
			// async select(str){

			// },
			// 新支付方式，直接调用符合的支付方式。weixin或ali
			async handleDirectToPay(item) {
				this.tempItem = item;
				await wx_sdk.goPay({
					payData: this.getSendData(this.tempItem),
					payLink: 'wechatRecharge',
					callBack: (res,next) => {
						if (res.payType == SQB_WX || res.payType == SQB_ALI) {
							storage.session('recharge_data', res);
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
			}
		},

		async mounted() {

			this.openId = storage.session('openId') || storage.session('login').openId;
			this.payType = this.IS_ALI ? 'ali' : 'wx';
			this.userInfo = storage.session('recharge_d') || storage.session('membership');

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;

			//获取支付类型
			let modeType = await http.getRechargePayType({
				data: {
					shopId: this.shopId
				}
			});
			//如果没有支付方式，默认给一个微信
			modeType = modeType.memberStoreChannels || '0';

			let mode = {
				0: 'weixin',
				1: 'ali'
			};
			modeType.split(',').forEach((item) => {
				this.modeType[mode[item]] = 1;
			});

			let sqb = storage.session('recharge_data');
			if (sqb && sqb.oid) {
				storage.session('recharge_data', null);
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

			if (!storage.session('shopName') && storage.session('shopList')) {
				await this.getUserInfo();
			}


			this.getList();
			utils.setTitle('购买会员权益');
		}
	};
</script>
<style lang="less" scoped>
	@import '../../res/css/base.less';

	#membership {
		width: 100%;
		height: 100%;

		.head {
			width: 100%;
			height: 1.52rem;
			background: url("../../res/images/saoma-bg.jpg") left top;
			line-height: 1.52rem;

			span {
				font-size: 0.4rem;
				color: #fff;
				text-align: center;
				display: inline-block;
				width: 100%;
			}

			img {
				display: inline-block;
				width: 0.43rem;
				height: 0.3rem;
			}
		}

		.coupon {
			width: 100%;
			height: 100%;
			position: relative;

			.noList {
				width: 100%;
				height: 1.52rem;
				font-size: 0.48rem;
				color: #6c6c6c;
				text-align: center;
				line-height: 1.52rem;
				font-weight: bold;
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				margin: auto;
			}

			.list {
				width: 9.17rem;
				height: 3.3rem;
				border-radius: 0.13rem;
				margin: 0.29rem 0.4rem 0 0.4rem;
				border: 1px solid #e4e4e4;

				.list_t {
					width: 9.17rem;
					height: 2.18rem;

					.list_l {
						width: 3.38rem;
						height: 2.18rem;
						text-align: center;
						line-height: 2.18rem;
						float: left;

						span {
							font-size: 0.8rem;
							color: #febe33;
						}
					}

					.list_r {
						width: 5.76rem;
						height: 2.18rem;
						float: right;
						box-sizing: border-box;

						p {
							width: 100%;
							height: 0.5rem;
							font-size: 0.41rem;
							color: #000;
							width: 100%;
							height: 0.5rem;
							.text-overflow();
							margin: 0.4rem 0 0.38rem 0;
						}

						a {
							width: 2.26rem;
							height: 0.68rem;
							display: block;
							background: #febe33;
							border-radius: 0.05rem;
							text-align: center;
							line-height: 0.68rem;
							color: #fff;
							font-size: 0.32rem;
						}
					}
				}

				.list_b {
					width: 9.17rem;
					height: 1.15rem;
					background: #e4e4e4;
					line-height: 1.15rem;
					padding: 0 0.38rem 0 0.5rem;
					box-sizing: border-box;
					border-radius: 0 0 0.13rem 0.13rem;

					.sp {
						line-height: 1.15rem;
						float: left;
					}

					.disc {
						width: 0.1rem;
						height: 0.1rem;
						display: block;
						background: #767676;
						border-radius: 100%;
						float: left;
						margin: 0.55rem 0;
					}

					span {
						display: block;
						width: 7.38rem;
						height: 1.15rem;
						.text-overflow();
						font-size: 0.26rem;
						color: #767676;
					}

					img {
						width: 0.17rem;
						height: 0.3rem;
						float: right;
						margin: 0.41rem 0;
					}
				}
			}
		}

		.spinner {
			width: 1.5rem;
			height: 1.5rem;
			position: relative;
			margin: 6.5rem auto;

			.double-bounce1,
			.double-bounce2 {
				width: 100%;
				height: 100%;
				border-radius: 50%;
				background-color: #67cf22;
				opacity: 0.6;
				position: absolute;
				top: 0;
				left: 0;
				-webkit-animation: bounce 2s infinite ease-in-out;
				animation: bounce 2s infinite ease-in-out;
			}

			.double-bounce2 {
				-webkit-animation-delay: -1s;
				animation-delay: -1s;
			}
		}
	}

	@-webkit-keyframes bounce {

		0%,
		100% {
			-webkit-transform: scale(0);
		}

		50% {
			-webkit-transform: scale(1);
		}
	}

	@keyframes bounce {

		0%,
		100% {
			transform: scale(0);
			-webkit-transform: scale(0);
		}

		50% {
			transform: scale(1);
			-webkit-transform: scale(1);
		}
	}
</style>