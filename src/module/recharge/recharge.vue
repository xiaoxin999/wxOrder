<template>
	<div id="membership">
		<div class="head">
			<span>会员储值权益</span>
		</div>
		<!-- 券 -->
		<div class="coupon" v-if="!loading">
			<div class="chargePrice">充值金额</div>
			<div class="list" :class="{'lists':item.check}" v-for="(item,index) in storedList" :key="index" @click="payItem(item)">
				<div class="index_item">
					{{index + 1}}
				</div>
				<div class="list_item">
					<p>{{item.name}}</p>
					<p>充值{{item.payment}}元</p>
					<p>包含
						<template v-if="item.deposit>0">
							{{item.deposit}}元
						</template>
						<template v-if="item.giftPoint>0">
							+{{item.giftPoint}}积分
						</template>
						<template v-if="item.giftAmount>0">
							+送{{item.giftAmount}}元
						</template>
						<template v-if="item.couponIds.length>0">
							+{{getcoupon(item.couponIds)}}
						</template>
					</p>
				</div>
			</div>

			<!-- 无方案的情况下 -->
			<div class="noList" v-if="storedList.length == 0">
				-暂无充值方案-
			</div>

		</div>
		<div class="price_self">
			<span @click="showInput" v-if="showIn">自定义金额</span>
			<div v-show='savePrice > 0' class='fr show_input'>{{savePrice}}</div>
			<input onkeyup="value=value.replace(/[^\d.]/g,'')" autofocus="autofocus" type="text" v-if="!showIn" v-model='savePrice' @blur="blurFn" class="total_input">
			<div class='fr coin' v-show='savePrice > 0'>￥</div>
		</div>
		<span class="btn" v-if="tatalSave == 0" @click="obj?handleDirectToPay:''">立即充值</span>
		<span class="btn" v-if="tatalSave > 0" @click="handleDirectToPays">立即充值</span>
		<!-- loading -->
		<div class="spinner" v-if="loading">
			<div class="double-bounce1"></div>
			<div class="double-bounce2"></div>
		</div>
		<div class="outbox" v-show="showBox">
			<div class="content">
				<p>充值礼包 <img @click="closeBtn()" src="../../../src/res/images/close_btn.png" alt=""></p>
				<div id="maincate" class="maincate" v-if="savePrice > 0">
					<a v-for="(i,index) in customList" :key="index" :class="{'active':i.activeShow == true,'unactive':i.activeShow == false}" @click="checkActive(i)">
						{{i.name}}
					</a>

				</div>
				<p class='chargePrice' v-if="savePrice > 0">充值{{this.savePrice}}元</p>
				<p class='chargePrice' v-if='savePrice == 0'>充值{{obj.payment}}元</p>
				<div class="blockDiv" v-if="obj && (obj.giftAmount && obj.giftAmount>0 || obj.giftPoint && obj.giftPoint>0 || obj.couponIds.length>0)">
					<ul v-if="savePrice > 0">
						<li v-if="obj && obj.giftAmount && obj.giftAmount>0"><span>•</span> 储值金额
							<template v-if="obj.depositRule == 1">
								等于{{obj.deposit}}
							</template>
							<template v-if="obj.depositRule == 2">
								{{obj.deposit}} 至 {{obj.payment}}
							</template>
							<template v-if="obj.depositRule == 3">
								大于等于{{obj.deposit}}
							</template>
							<template v-if="obj.depositRule == 4">
								小于等于{{obj.deposit}}
							</template>
							元
							<template v-if="obj.giftAmountRule>0 && obj.giftAmountRule == 1">
								赠{{obj.giftAmount}}
							</template>
							<template v-else-if="obj.giftAmountRule>0 && obj.giftAmountRule == 2">
								赠储值金额百分之{{Number(obj.giftAmount)}}
							</template>
							元
						</li>
						<li v-if="obj && obj.giftPoint && obj.giftPoint>0"><span>•</span> 累计
							<template v-if="obj.giftPointRule>0 && obj.giftPointRule == 1">
								赠{{obj.giftPoint}}
							</template>
							<template v-else-if="obj.giftPointRule>0 && obj.giftPointRule == 2">
								赠储值金额百分之{{Number(obj.giftPoint)}}
							</template>
							积分</li>
						<li v-if="obj && obj.couponIds.length>0"><span>•</span> {{getNum(obj.couponIds)}}张优惠券：
							<span v-if="obj.couponIds.length>0">
								{{getcoupon(obj.couponIds)}}
							</span>
						</li>
					</ul>
					<ul v-if="savePrice == 0">
						<li v-if="obj && obj.deposit && obj.deposit>0"><span>•</span> 储值金额 {{obj.deposit}}元
							<template v-if="obj.giftAmount>0">
								+ 赠送金额{{obj.giftAmount}}元
							</template>
						</li>
						<li v-if="obj && obj.giftPoint && obj.giftPoint>0"><span>•</span>
							累计{{obj.giftPoint}}积分
						</li>
						<li v-if="obj && obj.couponIds.length>0"><span>•</span> {{getNum(obj.couponIds)}}张优惠券：
							<span v-if="obj.couponIds.length>0">
								{{getcoupon(obj.couponIds)}}
							</span>
						</li>
					</ul>
				</div>
				<a class="btnBox" href="javascript:;" @click="handleDirectToPay">立即充值</a>

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
				showIn: true,
				showBox: false,
				savePrice: 0,
				obj: '',
				customLists: [],
				customList: [],
				arr: [],
				num: 0, //优惠券
			};
		},
		computed: {
			tatalSave() {
				return this.savePrice;
			}
		},
		methods: {
			blurFn() {
				window.scroll(0, 0);
			},
			checkActive(item) {
				storage.session('item', item);
				this.obj = item;
				for (let i = 0; i < this.customList.length; i++) {
					if (item.id == this.customList[i].id) {
						this.$set(item, 'activeShow', true);
					} else {
						this.$set(this.customList[i], 'activeShow', false);
					}
				}
			},
			closeBtn() {
				if (Number(this.savePrice) == 0) {
					this.showBox = false;
				} else if (Number(this.savePrice) > 0) {
					storage.session('item', null);
					this.savePrice = 0;
					this.showBox = false;
				}

			},
			showInput() {
				this.showIn = !this.showIn;
				for (let i = 0; i < this.storedList.length; i++) {
					this.$set(this.storedList[i], 'check', false);
				}
			},
			payItem(item) {
				this.savePrice = 0;
				storage.session('item', item);
				this.obj = storage.session('item');
				if (item.deposit > 0 || item.giftPoint > 0 || item.giftAmount > 0 || item.couponIds.length > 0) {
					this.showBox = true;
					this.obj = storage.session('item');
				}
				for (let i = 0; i < this.storedList.length; i++) {
					if (item.id == this.storedList[i].id) {
						this.$set(item, 'check', true);
						this.showIn = true;
					} else {
						this.$set(this.storedList[i], 'check', false);
					}

				}

			},
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
				this.storedList = data.fixed; //获取储值的类表内容
				this.customLists = data.custom;
				for (let i = 0; i < this.storedList.length; i++) {
					this.$set(this.storedList[i], 'check', false);
				}

				this.loading = false;
			},
			getcoupon(arr) {
				let couponDetail = '';
				if (arr.length == 0) {
					couponDetail = '';
				} else {
					for (let i = 0; i < arr.length; i++) {
						couponDetail += arr[i].name + '*' + arr[i].num + '张' + ',';
					}
				}
				return couponDetail.replace(/,$/gi, '');
			},
			getNum(arr) {
				let num = 0;
				for (let i = 0; i < arr.length; i++) {
					num += Number(arr[i].num);
				}
				return num;
			},
			getSendData(item) {
				let id = 0;
				// if(userInfo) id = userInfo.member.rechargeShopId;
				return {
					planId: item.id,
					payType: this.payType,
					openId: this.openId || '',
					shopId: id == 0 ? this.shopId : id,
					price: this.savePrice > 0 ? this.savePrice : item.payment,
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
			async handleDirectToPays() {
				this.getList();
				let customList = [];
				for (let i = 0; i < this.customLists.length; i++) {
					let item = this.customLists[i];
					if (Number(this.tatalSave) > 0) {
						if (Number(item.depositRule) == 1) { 
							if (Number(this.tatalSave) == Number(item.deposit)) {
								customList.push(item);
							}
						}
						if (Number(item.depositRule) == 2) {
							if ((Number(this.tatalSave) >= Number(item.deposit)) && (Number(this.tatalSave) <= Number(item.payment)) && (Number(item.payment) >= Number(item.deposit)) || Number(this.tatalSave) == Number(item.payment) == Number(item.deposit)) {
								customList.push(item);
							}
						}
						if (item.depositRule == 3) {
							if (Number(this.tatalSave) >= Number(item.deposit)) {
								customList.push(item);
							}
						}
						if (item.depositRule == 4) {
							if (Number(this.tatalSave) <= Number(item.deposit)) {
								customList.push(item);
							}
						}
					}

				}

				this.customList = customList;
				if (customList.length > 0) {
					for (let i = 0; i < this.customList.length; i++) {
						if (i == 0) {
							this.customList[0].activeShow = true;
						} else {
							this.customList[i].activeShow = false;
						}
					}
					this.showBox = true;
					this.obj = this.tatalSave > 0 ? this.customList[0] : storage.session('item') ? storage.session('item') : '';
				} else {
					let item = storage.session('item');
					this.tempItem = item;
					await wx_sdk.goPay({
						payData: this.getSendData(this.tempItem),
						payLink: 'wechatRecharge',
						callBack: (res, next) => {
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
						isAsync: true
					});
				}
			},

			async handleDirectToPay() {
				this.obj = storage.session('item');
				let item = storage.session('item');
				this.tempItem = item;
				await wx_sdk.goPay({
					payData: this.getSendData(this.tempItem),
					payLink: 'wechatRecharge',
					callBack: (res, next) => {
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
					isAsync: true
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
		background: #fff;
		text-align: center;
		padding-bottom: 1rem;
		z-index: 0;

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
			height: calc(~"100% - 4.2rem");
			position: relative;
			z-index: 1;
			overflow-y: scroll;

			.chargePrice {
				font-size: 0.3467rem;
				margin: 0.64rem 0 0.3733rem 0.88rem;
				color: #000;
				text-align: left;
			}



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
				width: 8.2667rem;
				height: 2.2667rem;
				background: #FFFFFF;
				box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
				border-radius: 0.1067rem;
				margin-left: 0.88rem;
				margin-bottom: 0.24rem;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: space-between;

				.index_item {
					width: 0.6667rem;
					height: 2.2667rem;
					opacity: 0.3;
					font-size: 1.6267rem;
					color: #D73018;
					text-align: center;
					margin-left: 0.4rem;
					margin-right: 0.48rem;
				}

				.list_item {
					width: calc(8.2667rem - 2rem);

					p:nth-child(1) {
						font-size: 0.2667rem;
						color: #797979;
						text-align: left;
						margin: 0.24rem 0 0.1467rem 0;
					}

					p:nth-child(2) {
						font-size: 0.48rem;
						color: #000000;
						text-align: left;
						margin-bottom: 0.08rem;
					}

					p:nth-child(3) {
						font-size: 0.2667rem;
						color: #000000;
						overflow: hidden;
						text-align: left;
						text-overflow: ellipsis;
						white-space: nowrap;
						padding-right: 0.3733rem;

					}
				}

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

			.lists {
				background: rgba(215, 48, 24, 0.08);
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

	.outbox:before {
		content: "";
		width: 0;
		height: 100%;
		display: inline-block;
		vertical-align: middle;
	}

	.outbox {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		text-align: center;
		background: rgba(0, 0, 0, 0.45);
		display: block;
		z-index: 999;
	}

	.content {
		width: 10rem;
		background: #FFFFFF;
		display: inline-block;
		vertical-align: bottom;
		height: auto;
		min-height: 8rem;
		overflow: auto;
		max-height: 12rem;
		z-index: 9999;


		p:nth-child(1) {
			height: 1.2rem;
			line-height: 1.2rem;
			font-size: 0.4rem;
			color: #000000;
			border-bottom: 1px solid #E4E4E4;
			position: relative;

			img {
				width: 0.5333rem;
				height: 0.5333rem;
				margin: 0.3467rem 0;
				position: absolute;
				right: 0.6667rem;
			}
		}

		p.chargePrice {
			font-size: 0.4rem;
			color: #000000;
			margin: 0.3467rem 0.7467rem;
			text-align: left;
		}

		.blockDiv {
			width: 8.6667rem;
			height: auto;
			background: #F2F2F2;
			margin: 0 auto;
			padding-top: 0.2667rem;
			padding-bottom: 0.2667rem;

			ul {
				background: #F2F2F2;
				border-radius: 8px;
				font-size: 0.32rem;
				color: #000000;
				text-align: justify;
				margin: 0 auto;
				margin-left: 0.1867rem;
				margin-right: 0.56rem;

				li {
					line-height: 0.44rem;
				}
			}
		}

		.btnBox {
			width: 8.2667rem;
			height: 1.2rem;
			line-height: 1.2rem;
			background: #D73018;
			margin-top: 0.4267rem;
			border-radius: 8px;

		}

	}

	.maincate {
		height: 1.7067rem;
		line-height: 1.7067rem;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-backface-visibility: hidden;
		-webkit-perspective: 1000;
		-webkit-overflow-scrolling: touch;
		text-align: justify;
		padding: 0px 0.0667rem;
		box-sizing: border-box;
		margin-bottom: 0.5067rem;
		margin: 0.3467rem 0.7467rem;
	}

	.maincate a {
		background: #FFFFFF;
		box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
		border-radius: 0.1067rem;
		width: 3.5467rem;
		height: 1.7067rem;
		margin-right: 0.2933rem;
		font-size: 0.4rem;
		color: #000000;
		letter-spacing: 0;
		text-align: center;
		border: 1px solid #eaeaea;
	}

	.maincate a:nth-child(1) {
		background: rgba(215, 48, 24, 0.08);
		border: 1px solid #D73018;
		box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
		border-radius: 0.1067rem;
	}

	.maincate a.active {
		background: rgba(215, 48, 24, 0.08);
		border: 1px solid #D73018;
		box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
		border-radius: 0.1067rem;
	}

	.maincate a.unactive {
		background: #FFFFFF;
		box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
		border-radius: 0.1067rem;
		border-radius: 0.1067rem;
		border: 1px solid #eaeaea;
	}

	.maincate::-webkit-scrollbar {
		display: none;
	}

	.total_input {
		position: absolute;
		right: 0;
		top: 0;
		font-size: .48rem;
		color: #D0021B;
		.setBox(auto, 1.18rem);
		min-width: 1rem;
		overflow: hidden;
		line-height: 1.5;
		padding: none;
		border: none;
		text-align: right;
		width: 4.9067rem;
		height: 1.3333rem;
		box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
		border-radius: 0.1067rem;
		outline: medium;
		border: 1px solid #eaeaea;
		font-size: 0.48rem;
		border: 1px solid #D0021B;
		padding-right: 0.4rem;
	}

	.show_input {
		text-align: right;
		font-size: .48rem;
		color: #D0021B;
		.setBox(auto, 1.2rem);
		line-height: 1.5;
		// z-index: 5;
		position: relative;
		right: .4rem;
		bottom: 0;
		opacity: 0;
		padding-right: 0.4rem;
		// margin-right: .4rem;
	}

	.total_input::-webkit-input-placeholder {
		line-height: 1.5rem;
	}

	.coin {
		font-size: 0.48rem;
		color: #E00923;
		text-align: right;
		width: auto;
		height: 1.5rem;
		line-height: 1.65;
		position: relative;
		display: inline-block;
		line-height: 1.333rem;
	}

	.price_self {
		width: 4.9067rem;
		height: 1.3333rem;
		display: inline-block;
		float: left;
		margin: 0.24rem 0 0.5067rem;
		margin-left: 0.9067rem;
		position: relative;

		span {
			width: 4.9067rem;
			height: 1.3333rem;
			box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
			border-radius: 0.1067rem;
			font-size: 0.48rem;
			color: #000000;
			letter-spacing: 0;
			text-align: center;
			outline: medium;
			border: none;
			display: inline-block;
			line-height: 1.3333rem;
		}

		input {
			// width: 4.9067rem;
			// height: 1.3333rem;
			// box-shadow: 0 0 0.2133rem 0 rgba(0, 0, 0, 0.10);
			// border-radius: 0.1067rem;
			// font-size: 0.48rem;
			// color: #000000;
			// letter-spacing: 0;
			// text-align: center;
			// outline: medium;
			// border: 1px solid #eaeaea;
			// font-size: 0.48rem;
			// color: #D0021B;
		}

		input:focus {
			border: 1px solid red;
			background: rgba(215, 48, 24, 0.08);
		}
	}

	.btn {
		display: inline-block;
		width: 8.2667rem;
		height: 1.2rem;
		line-height: 1.2rem;
		background: #D73018;
		border-radius: 8px;
		color: #fff;

	}
</style>