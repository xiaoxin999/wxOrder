<template>
	<div id="mall-goods-detail">
		<div class="im-title">
			<div @click="pointDetail()">积分：{{redeemPoint}}</div><span></span>
			<div @click="toIntegralMall">兑换记录</div>
		</div>
		<div class="bgc">

			<!--<img :src="res/icon/get-vip.jpg"/>-->
			<template v-if="reqSuccess">
				<img :src="imgUrl + goodsDetail.bigImage" v-if="goodsDetail.bigImage" />
				<img src="../../../res/icon/goods.jpg" v-else />
			</template>
			<div class="grayy graypos"></div>
		</div>
		<div class="content">
			<div class="name">
				{{goodsDetail.name}}
				<div class="point">
					<span v-if="goodsDetail.price != 0 && goodsDetail.cash !=0">所需：积分{{goodsDetail.price}} + ￥ {{goodsDetail.cash}} 剩余：{{goodsDetail.inventory}}</span>
					<span v-else-if="goodsDetail.price != 0 && goodsDetail.cash ==0">所需：积分{{goodsDetail.price}} 剩余：{{goodsDetail.inventory}}</span>
					<span v-else>无需积分</span>

					<template v-if="$route.query.code == 1">
						<br />兑换时间<br />
						{{getTime(goodsDetail.updateTime)}}
						<br />有效期<br />
						<div class="">
							{{getTime(goodsDetail.updateTime)}} -
							<template v-if="goodsDetail.expire != 0">{{getTime(endTime)}} </template>
							<template v-else-if="goodsDetail.expire == 0">永久有效</template>
						</div>
					</template>
					<template v-if="$route.query.code == 2">
						<br />有效期<br />
						<template v-if="goodsDetail.expire != 0">兑换后{{goodsDetail.expire}}天内有效</template>
						<template v-else-if="goodsDetail.expire == 0">永久有效</template>
					</template>
				</div>
			</div>

			<div style="margin-top:2rem;">商品描述：</div>
			<div v-html="goodsDetail.description" class="describe" v-if="goodsDetail.description != ''"></div>
		</div>
		<div class="btn" @click="redeemNow()" v-if="goodsDetail.type == 0 && !isDetail">
			立即兑换
		</div>
		<div class="btn" @click="Number(userInfo.point) >= Number(goodsDetail.price)?redeemNowChose():''" v-if="goodsDetail.type ==1 && !isDetail">
			立即兑换
		</div>
	</div>
</template>

<script>
	import http from 'src/manager/http';
	import global, {
		SQB_WX,
		SQB_ALI
	} from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	let wxsdkData = null;
	// let payType = utils.getQueryString('payType'); // '
	let wxsdk = null;

	export default {
		name: 'mallGoodsDetail',
		data() {
			return {
				// userInfo: {},
				goodsDetail: {
					'name': '',
					'price': '',
					'description': '',
					'inventory': '',
					'bigImage': '',
					'cash': '', //金額
				},
				redeem: false,
				reqSuccess: false,
				imgUrl: null,
				isDetail: false,
				redeemPoint: storage.session('userInfo').point,
				exchangeGoodsPoint: '',
				gid: null,
				fid: null,
				token: null,
				choiceShopId: this.$route.query.choiceShopId,
				comId: this.$route.query.comId,
				endTime: '',
				userInfo: storage.session('userInfo'),
			};
		},
		computed: {
			sure() {
				return {
					style: {

					},
					content: '是'
				};
			},
			cancel() {
				return {
					style: {

					},
					content: '否'
				};
			}
		},
		methods: {
			getTime(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd hh:mm');
			},
			pointDetail() {
				let info = storage.session('userInfo');
				storage.session('membership', info);
				storage.session('type', 1);
				this.$router.push('/newIntegralMall');
			},
			toIntegralMall() {
				this.$router.push('/exchangeRecord');
			},
			redeemNow() {
				let contenText, type;
				let can = false;
				console.log(this.userInfo, 'wooo');
				if (Number(this.userInfo.point) >= Number(this.goodsDetail.price) && Number(this.goodsDetail.cash) > 0) { //积分+钱
					contenText = `是否确定兑换，确定后需要支付${this.goodsDetail.cash}元现金。`;
					type = 'confirm';
					can = true;
				} else if (Number(this.userInfo.point) >= Number(this.goodsDetail.price) && Number(this.goodsDetail.cash) == 0) { // 纯积分
					contenText = `您将消耗${this.goodsDetail.price}积分，是否兑换此产品？`;
					type = 'confirm';
					can = true;
				} else if (Number(this.goodsDetail.price == 0) && Number(this.goodsDetail.cash) > 0) { //
					contenText = `是否确定兑换，确定后需要支付${this.goodsDetail.cash}元现金。`;
					type = 'confirm';
					can = true;
				} else if (Number(this.goodsDetail.price > 0 && Number(this.userInfo.point) < Number(this.goodsDetail.price))) {
					contenText = `抱歉老铁，积分不足`;
					type = 'alert';
				} else {
					contenText = `数据异常`;
					type = 'confirm';
				}
				this.$store.commit('setWin', {
					content: `${contenText}`,
					type: type,
					callBack: (str) => {
						if (str === 'ok' && can) {
							this.enterChange();
						}
					}
				});
			},
			redeemNowChose() {
				this.$router.push({
					path: '/chooseGoodsStoreSs',
					query: {
						goodsId: this.goodsDetail.id,
						comId: this.comId
					}
				});
			},
			async enterChange() {
				let res = await http.addExchange({
					data: {
						shopId: this.shopId,
						mid: this.mid,
						gid: this.goodsDetail.id,
						payType: 'wx' || 'zx',
						openId: this.openId,
						choiceShopId: '' || this.$route.query.choiceShopId,
						sqbData: JSON.stringify({
							hash: 'mallGoodsDetail'
						})
					}
				});

				let pt = res.payType || res.jsonData && res.jsonData.payType;
				if (pt == SQB_WX || pt == SQB_ALI) {
					storage.session('mall_goods_detail_data', res || res.jsonData);
				}

				if (this.goodsDetail.cash == 0) {
					if (res) {
						this.$router.push('/exchangeSuccess');
						await this.get();
					} else {
						this.$store.commit('setWin', {
							content: '兑换失败',
							type: 'alert',
							showBtn: false
						});
					}
				} else {
					await wxsdk.goPay({
						payData: res,
						payCallBack: (res) => {
							if (res) {
								this.$router.push('/exchangeSuccess');
							} else {
								this.$store.commit('setWin', {
									content: '兑换失败'
								});
							}
						}
					});
				}
			},
			async getGoodsDetail() {
				let gid;
				gid = this.goodsDetail.gid;
				let infoVal = storage.session('isCode');
				if (infoVal == 1) {
					gid = this.goodsDetail.gid;
					this.isDetail = true;
					storage.session('isCode', 0);
				} else {
					gid = this.goodsDetail.id;
				}
				let res = await http.getDetail({
					data: {
						shopId: this.shopId,
						id: gid,
						// mid: this.userInfo.memberId
					}
				});

				this.goodsDetail = res;
				this.endTime = Number(this.goodsDetail.updateTime) + Number(this.goodsDetail.expire * 24 * 60 * 60);
				this.goodsDetail.description = utils.htmlspecialchars_decode(res.description);
				this.reqSuccess = true;
			},
			async get() {
				let loginInfo = storage.session('login');
				let res = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: 3,
						from: 0
					}
				});
				Object.assign(res, loginInfo);
				this.userInfo = res;
				storage.session('userInfo', res);
			}
		},
		async mounted() {
			wxsdkData = await import( /* webpackChunkName:'wx_sdk' */ 'src/manager/platform_sdk.js');
			wxsdk = wxsdkData.default;
			await wxsdk.registerWXSDK();
			this.userInfo = storage.session('userInfo');
			this.goodsDetail = storage.session('goodsInfo');
			if (!this.userInfo) {
				await this.get(global.getShopId());
			}

			this.token = storage.session('token');
			this.getGoodsDetail();
			this.imgUrl = global.getImgUrl();
			let openId = storage.session('login');
			this.openId = openId.openId;
			let sqb = storage.session('mall_goods_detail_data');
			if (sqb && sqb.oid) {
				storage.session('mall_goods_detail_data', null);
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: sqb.oid,
						type:'pointShopPay'
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
			utils.setTitle('商品详情');
		}
	};
</script>

<style lang="less" scoped>
	#mall-goods-detail {
		width: 10rem;
		height: 100%;

		.im-title {
			width: 10rem;
			height: 1.15rem;
			background-color: #fff;
			color: #000000;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 66;

			div {
				width: 50%;
				height: 100%;
				float: left;
				text-align: center;
				line-height: 1.15rem;
			}

			span {
				width: 1px;
				height: 1.15rem;
				background-color: #666;
				position: absolute;
				top: 0;
				left: 50%;
				transform: translate(-50, 0%);
				-webkit-transform: translate(-50, 0%);
			}
		}

		.bgc {
			width: 100%;
			//  height: 100%;
			height: calc(~'100% - 1.2rem');
			position: fixed;
			top: 0;
			left: 0;

			img {
				width: 100%;
				height: 100%;
			}

			.graypos {
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0;
				left: 0;
				background-color: rgba(0, 0, 0, 0.4);
			}
		}

		.content {
			width: 10rem;
			height: calc(~'100% - 2.35rem');
			/*background-color:rgba(0,0,0,0.5);*/
			position: absolute;
			top: 35%;
			left: 0%;
			color: #FFF;
			text-align: center;
			transform: translate(0%, -50%);
			overflow: scroll;

			.name {
				width: 100%;
				height: 5rem;
				line-height: 3rem;
				font-size: 0.5rem;
				margin-top: 3rem;
				position: relative;

				.point {
					width: 100%;
					height: 1rem;
					font-size: 0.4rem;
					line-height: 1rem;
					position: absolute;
					bottom: 2rem;
					left: 0;
				}
			}

			.describe {

				width: 85%;
				margin: 0 auto;
				/* line-height: 1.2; */
				font-size: .4rem;
				/* max-height: 2.8rem; */
				overflow: scroll;
				margin-top: 0.6rem;
				text-align: justify;
			}

			.num {
				width: 100%;
				height: 1rem;
				font-size: 0.3rem;
				position: absolute;
				bottom: 3rem;
				left: 50%;
				transform: translate(-50%, 0);
				font-size: 0.4rem;
			}
		}

		.btn {
			width: 10rem;
			height: 1.2rem;
			line-height: 1.2rem;
			text-align: center;
			font-size: 0.4rem;
			color: #FFF;
			background-color: black;
			position: fixed;
			bottom: 0;
			left: 0;
		}
	}
</style>