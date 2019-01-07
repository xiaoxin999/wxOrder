/*
领取列表
*/

<template>
	<section class="voucherList">
		<div class="main">

			<div class="top" @click="goCoupon">我的卡包></div>
			<div class="content">
				<div class="item" v-for="(item,index) in list" :key="index">

					<div class="center">
						<div class="left" @click="getDetail(item)">

							<div class="name">
								<div class="type" :style="{'backgroundColor':type[item.type].color}">{{type[item.type].title}}</div>
								<span>{{item.name}}</span>
							</div>
							<div class="info" v-if="Number(item.lowestConsume)">满{{item.lowestConsume}}元可用</div>


						</div>
						<div class="middle"></div>
						<div class="right">

							<div class="button able" :class="{'able':item.status == 1 , 'disable' : item.status == 0 }" @click="clickItem(item)">
								{{item.des}}
							</div>

							<template v-if="item.channel == 1">
								<div class="num" v-if="item.perCapitaNum - item.buyNum > 0">
									还剩{{item.perCapitaNum - item.buyNum}}张
								</div>
							</template>
							<template v-else>
								<div class="num" v-if="item.isCeiling && item.ceilingNum - item.giveNum > 0">
									还剩{{item.ceilingNum - item.giveNum}}张
								</div>
							</template>


						</div>

					</div>

				</div>
			</div>
		</div>
		<transition name='fade'>
			<section class='qrcode' v-if='showQr'>
				<div class="content">
					<div class="bg">
						<img class='qr' :src="imgQRUrl" alt="">
						<div class="tips">长按图片 '识别二维码' 关注公众号</div>
					</div>
					<img class='close' @click='closeQr()' src="../../res/images/member_close.png" alt="">
				</div>
			</section>
		</transition>
	</section>
</template>
<script type="text/javascript">
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';

	let qrcode = null;
	let wx_sdk = null;
	let activityId = utils.getQueryString('activityId') || 'asd';
	let type = {
		1: {
			title: '减',
			color: '#00a0ea'
		},
		2: {
			title: '减',
			color: '#00a0ea'
		},
		3: {
			title: '折',
			color: '#89b053'
		},
		4: {
			title: '折',
			color: '#89b053'
		},
		5: {
			title: '赠',
			color: '#ca5040'
		},
		6: {
			title: '代',
			color: '#ebca0b'
		},
		8: {
			title: '减',
			color: '#00a0ea'
		},
		9: {
			title: '半',
			color: '#00a0ea'
		},
		10: {
			title: '送',
			color: '#ca5040'
		},
		11: {
			title: '定',
			color: '#00a0ea'
		}
	};
	export default {
		data() {
			return {
				showQr: false,
				list: [],
				type,
				imgQRUrl: ''
			};
		},
		methods: {
			getStatus(item) {

				//需要付钱

				if (item.isBuy) {

					item.channel = 1; //付钱
					if (Number(item.buyNum) >= Number(item.perCapitaNum)) {
						return '已达购券上限';
					}
					if (Number(item.buyNum) >= Number(item.ceilingNum) && item.isCeiling) {
						return '已购完';
					}
					return '￥' + item.price;
				} else {
					item.channel = 0; //免费领

					if (Number(item.buyNum) >= Number(item.perCapitaNum)) {
						return '已达领取上限';
					}

					if (Number(item.giveNum) >= Number(item.ceilingNum) && item.isCeiling) {
						return '已领完';
					}
					return '免费领取';
				}

			},
			getDetail(item) {
				storage.session('couponDetail', item);
				this.$router.push({
					path: '/couponDetail',
					query: {
						ss: '2'
					}
				});
			},
			goCoupon() {
				this.$router.push('/coupon');
			},
			success(item) {

				let str = this.getStatus(item);
				this.$set(item, 'status', str.charAt(0) == '已' ? 0 : 1);
				this.$set(item, 'des', str);
				this.$forceUpdate();

				this.getWin({
					ok: {
						content: '我的卡包',
						style: {
							color: '#EAC048'
						}
					},
					cancel: {
						content: '确定'
					},
					callBack: (str) => {
						if (str == 'ok') {
							this.goCoupon();
						}
					},
					content: `<h3 style='font-size: 0.48rem;font-weight:bold'>${item.channel == 1 ?'购买成功' :'领取成功'}</h3></br><span style='font-size: 0.4rem;'>您可前往<我的卡包>查看优惠券</span>`
				});
			},
			closeQr() {
				this.showQr = !this.showQr;
			},
			async clickItem(item) {

				if (item.status == 1) {


					let obj = {
						shopId: this.shopId,
						activityId,
						couponId: item.id,
						payType: 'wx'
					};
					//付钱的回调
					if (item.channel) {
						wx_sdk.goPay({
							payData: obj,
							payLink: 'getActCoupon',
							payCallBack: (status) => {
								if (status) {
									item.buyNum = Number(item.buyNum) + 1;
									this.success(item);
								} else {
									this.$store.commit('setWin', {
										content: '购买失败'
									});
								}
							}
						});

					} else {
						let data = await http.getActCoupon({
							data: obj
						});

						if (data) {
							item.giveNum = Number(item.giveNum) + 1;
							this.success(item);
						} else {
							this.$store.commit('setWin', {
								content: '领取失败'
							});
						}
					}

				}

			},
			getWin(obj) {
				let {
					ok,
					cancel,
					callBack,
					content
				} = obj;
				this.$store.commit('setWin', {
					type: 'confirm',
					ok,
					cancel,
					callBack,
					content
				});
			}
		},
		async mounted() {

			qrcode = await import( /* webpackChunkName:'jr-qrcode' */ 'src/verdor/jr-qrcode.js');
			qrcode = qrcode.default;

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;

			let data = null;

			data = await http.getActivityList({
				data: {
					shopId: this.shopId,
					activityId
				}
			});
			this.list = data.list;
			this.imgQRUrl = data.imgQRUrl;

			utils.setTitle(data.activityName);
			//需要弹出提示
			if (data.userError || data.activityError) {
				this.getWin({
					ok: {
						content: '去关注',
						style: {
							color: '#EAC048'
						}
					},
					cancel: {
						content: '关闭'
					},
					callBack: (str) => {
						console.log(str);
						if (str == 'ok') {
							this.closeQr();
						} else {
							this.$closeWindow();
						}
					},
					content: '活动已结束，您可以关注公众号</br>查看更多活动优惠'
				});
				return;
			}

			for (let item of this.list) {
				let str = this.getStatus(item);
				item.status = str.charAt(0) == '已' ? 0 : 1; //0 是无法点击 1可以
				item.des = str;
			}
		}
	};
</script>
<style lang='less' scoped>
	.voucherList {

		background-color: white;
		height: auto;
		min-height: 100%;

		.main {
			width: 9.3333rem;
			margin: 0 auto;

			.top {
				height: 1rem;
				line-height: 1rem;
				font-size: 0.3467rem;
				color: #999999;
				text-align: right;
			}

			.content {
				.item {
					width: 9.2933rem;
					height: 2.5067rem;
					margin-bottom: 0.2rem;
					border: 1px solid #DDDDDD;

					.center {
						height: 1.6rem;
						margin-top: 0.4533rem;
						display: flex;
						align-items: center;
						justify-content: center;

						&>div.left {
							width: 5.3333rem;

							.name {
								.type {
									width: 0.7467rem;
									height: 0.7467rem;
									line-height: 0.7467rem;
									border-radius: 50%;
									display: inline-block;
									text-align: center;
									font-size: 0.3733rem;
									color: #FFFFFF;
								}

								.blue {
									background: #00A0EA;
								}

								span {
									font-size: 0.4533rem;
									color: #303030;
									vertical-align: -0.05rem;
								}
							}

							.info {
								width: 5.3333rem;
								margin-top: 0.2rem;
								text-align: center;
								font-size: 0.3467rem;
								color: #999999;
							}
						}

						.middle {
							border-left: 0.08rem dashed #DDDDDD;
							height: 100%;
						}

						.left,
						.right {
							display: flex;
							align-items: center;
							flex-wrap: wrap;
						}

						.left {
							justify-content: left;
						}

						.right {
							justify-content: center;
						}

						&>div.right {
							width: 3.4667rem;

							text-align: center;

							.button {
								width: 2.6667rem;
								height: 0.84rem;
								line-height: 0.84rem;
								border-radius: 1.3333rem;
							}

							.able {
								background: #EAC048;
								color: #FFFFFF;
							}

							.disable {
								border: 2px solid #979797;
								color: #999;
								background: transparent;
							}

							.num {
								margin-top: 0.2rem;
								font-size: 0.32rem;
								color: #EAC048;
								width: 2.6667rem;
							}
						}

					}
				}
			}
		}

		.qrcode {
			background: rgba(0, 0, 0, 0.50);
			position: fixed;
			z-index: 10;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;


			div.content {
				width: 7.3733rem;
				height: 6.9333rem;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;

				.bg {
					width: 7.3733rem;
					height: 6.56rem;
					background-color: white;
					border-radius: 0.2667rem;

					.qr {
						width: 4.0667rem;
						height: 4.0667rem;
						margin: 0.5rem 50%;
						transform: translateX(-50%);
					}

					.tips {
						font-size: 0.3733rem;
						color: #303030;
						text-align: center;
					}
				}

				.close {
					width: 1.1867rem;
					height: 1.1867rem;
					margin-top: 2rem;
					margin-left: 50%;
					transform: translate(-50%)
				}
			}
		}

	}
</style>