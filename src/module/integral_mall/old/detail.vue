<template>
	<div id="detail" style="margin-bottom: 2rem;">
		<div class="container" v-if="$route.query.d==1" v-cloak>
			<div class="comBanner">
				<img :src="hostImg + goods.imageName" alt="商品banner" />
			</div>
			<div class="comDinfo productname">
				<div class="comTit comTitcenter">产品名称：<span class="text-over text-overflow goodsName">{{goods.name}}</span>
					<img class="com_img" v-if='goods.type == 1' src="../../../res/images/sell_assis/md_f.png" alt="">
					<img class="com_img" v-if='goods.type == 0' src="../../../res/images/sell_assis/pp_f.png" alt="">
				</div>
				<div class="">
					<div class="div_f"> <img src="../../../res/images/exintegral.png" alt="兑换所需积分" class="fl" />
						<span v-html="Number(goods.cash)==0?goods.price+'积分':goods.price+'积分 +'+goods.cash+'元'"></span>
					</div>
					<div class="div_f div_s"> <img src="../../../res/images/surplus.png" alt="剩余库存数量" class="fl" /> <span> 剩余{{goods.inventory}}份</span></div>
				</div>

			</div>
			<div class="comSummary">
				<div class="comsTits">
					<h1>商品简介</h1>
				</div>
				<div class="conConts detail" v-html="description" id="conConts"></div>
			</div>
			<a href="javascript:void(0);" class="ofIntegral" v-if="status == 1">商品已下架</a>
			<a href="javascript:void(0);" class="comBnt" @click="exchangeCom()" v-if="type == 0 && status == 0 && point >= price && maxExchange">立即兑换</a>
			<a href="javascript:void(0);" class="comBnt" @click="tochooseMd()" v-if="type == 1 && status == 0 && point >= price && maxExchange">立即兑换</a>
			<a href="javascript:void(0);" class="comBnt" @click="exchangeCom()" v-if="type == 1 && choiceShopId && status == 0 && point >= price && maxExchange">立即兑换</a>
			<a href="javascript:void(0);" class="ofIntegral" v-if="point < price">积分不足,快去赚积分吧!</a>
			<a href="javascript:void(0);" class="ofIntegral" v-if="inventory == 0 && maxExchange">今天被抢光啦,补货中!</a>
			<a href="javascript:void(0);" class="ofIntegral" v-if="maxExchange == false">您已兑换</a>
		</div>
		<div class="container" v-if="$route.query.d==2" v-cloak>
			<div class="comBanner">
				<img :src="hostImgg + goods.gimage" alt="商品banner" />
			</div>
			<div class="comDinfo productname">
				<div class="comTit comTitcenter">产品名称：<span class="text-over text-overflow goodsName">{{goods.gname}}</span>
					<img class="com_img" v-if='goods.type == 1' src="../../../res/images/sell_assis/md_f.png" alt="">
					<img class="com_img" v-if='goods.type == 0' src="../../../res/images/sell_assis/pp_f.png" alt="">
				</div>
				<div class="">
					<div class="div_f"> <img src="../../../res/images/exintegral.png" alt="兑换所需积分" class="fl" />
						<span v-html="Number(goods.price)==0?goods.point+'积分':goods.point+'积分 +'+goods.price+'元'"></span>
					</div>
				</div>

			</div>
			<div class="comSummary">
				<div class="comsTits">
					<h1>商品简介</h1>
				</div>
				<div class="conConts detail" v-html="goods.description" id="conConts"></div>
			</div>
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
	let wxsdk = null;

	export default {
		name: 'detail',
		data() {
			return {
				goods: {},
				//userInfo:storage.session('userInfo'),
				name: '',
				hostImg: '',
				hostImgg: '',
				imageName: '',
				price: null, //剩余积分
				cash: null, //金额
				inventory: null, //库存
				num: null,
				point: null, //积分
				maxExchange: true,
				uid: null,
				description: '',
				details: [],
				mid: null,
				userDate: {},
				status: '',
				type: '',
				choiceShopId: this.$route.query.choiceShopId,
				openId: '',
				gid: '',
				comId: this.$route.query.comId,
				gimage: ''
			};
		},
		methods: {
			tochooseMd() { // type 1 跳转选择店铺
				this.$router.push({
					path: '/chooseGoodsStore',
					query: {
						goodsId: this.goods.id,
						comId: this.comId
					}
				});
			},
			storageDetail() {
				let goods = storage.session('goodsInfo');
				this.type = goods.type;
				this.name = goods.name;
				this.price = Number(goods.price);
				this.cash = Number(goods.cash); //需支付金额
				this.inventory = Number(goods.inventory);
				this.imageName = goods.imageName;
				this.gimage = goods.gimage;
				this.num = Number(goods.limit); // 最大兑换数量
				this.status = goods.status;
				this.description = utils.htmlspecialchars_decode(goods.description);

			},
			async detailList() { //只给一个库存
				let data = await http.getDetail({
					data: {
						shopId: this.shopId,
						mid: this.mid,
						id: this.uid || this.goods.id
					}
				});

				if (Number(this.num) != 0) {
					this.maxExchange = Number(data.count) < this.num;
				}
			},
			async exchangeCom() {
				let contenText, type;
				let can = false;
				if (Number(this.userDate.point) >= Number(this.goods.price) && Number(this.goods.cash) > 0) { //积分+钱
					contenText = `是否确定兑换，确定后需要支付${this.goods.cash}元现金。`;
					type = 'confirm';
					can = true;
				} else if (Number(this.userDate.point) >= Number(this.goods.price) && Number(this.goods.cash) == 0) { // 纯积分
					contenText = `您将消耗${this.goods.price}积分，是否兑换此产品？`;
					type = 'confirm';
					can = true;
				} else if (Number(this.goods.price == 0) && Number(this.goods.cash) > 0) { //
					contenText = `是否确定兑换，确定后需要支付${this.goods.cash}元现金。`;
					type = 'confirm';
					can = true;
				} else if (Number(this.goods.price > 0 && Number(this.userDate.point) < Number(this.goods.price))) {
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
							this.addExchange();
						}
					}
				});
			},
			async addExchange() {
				let res = await http.addExchange({
					data: {
						shopId: this.shopId,
						mid: this.mid,
						gid: this.gid,
						payType: 'wx' || 'zx',
						openId: this.openId,
						choiceShopId: '' || this.$route.query.choiceShopId,
						sqbData: JSON.stringify({
							// hash: 'detail',
							choiceShopId: this.choiceShopId,
							comId: this.comId,
							d: this.$route.query.d
						})
					}
				});

				let pt = res.payType || res.jsonData && res.jsonData.payType;
				if (pt == SQB_WX || pt == SQB_ALI) {
					storage.session('detail_data', res.oid || res.jsonData.oid);
				}

				if (this.goods.cash == 0) {
					if (res) {
						this.$router.push('/exchangeSuccess');

						await this.get(this.shopId);

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
			async get(shopId) {
				let loginInfo = storage.session('login');

				let res = await http.getUserInfo({
					data: {
						shopId: shopId,
						type: 3,
						from: 0
					}
				});
				Object.assign(res, loginInfo);
				this.point = res.point;
				this.userDate = res;
				storage.session('userInfo', res);
			}
		},

		async mounted() {

			wxsdkData = await import( /* webpackChunkName:'wx_sdk' */ 'src/manager/platform_sdk.js');
			if (this.$route.query.d == 1) {
				this.goods = storage.session('goodsInfo');
			} else {
				this.goods = storage.session('goods');
			}
			this.userDate = storage.session('userInfo');
			// console.log(this.userDate,'dsdd');
			if (!this.userDate) {
				await this.get(global.getShopId());
			}

			// let sqb = storage.session('detail_data');
			// if (sqb && sqb.oid) {
			// 	storage.session('detail_data', null);
			// 	let d = await http.getStatusByOid({
			// 		data: {
			// 			shopId: this.shopId,
			// 			oid: sqb.oid
			// 		}
			// 	});

			// 	if (d) {
			// 		this.$store.commit('setWin', {
			// 			content: '支付成功',
			// 			callBack: () => {
			// 				this.$router.push('/exchangeSuccess');
			// 			}
			// 		});
			// 	} else {
			// 		this.$store.commit('setWin', {
			// 			content: '支付失败',
			// 		});
			// 	}

			// }

			this.mid = this.userDate.memberId;
			this.gid = this.goods.id;
			this.hostImgg = global.getImgUrl();
			this.storageDetail();
			await this.detailList();
			this.hostImg = global.getImgUrl();

			this.point = Number(this.userDate.point);

			this.Token = this.userDate.accessToken;

			this.uid = this.$route.query.comId;
			if (this.uid === undefined) {
				this.$router.push('/intergralMall');
			}
			let openId = storage.session('login');
			this.openId = openId.openId;
			wxsdk = wxsdkData.default;
			await wxsdk.registerWXSDK();
			utils.setTitle('商品详情');
		}
	};
</script>

<style lang="less" scoped>
	#detail {
		.container {
			.productname {
				height: auto;
			}

			.biggestcount {
				height: 35px;
				line-height: 35px;
				width: 100%;
				font-size: 14px;
				color: #999;
			}
		}

		.shade {
			position: fixed;
			left: 0;
			top: 0;
			z-index: 99;
			background: rgba(0, 0, 0, 0.5);
			height: 100%;
			width: 100%;
			display: none;
			color: #666;

			.success {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				background-color: #f7f7f7;
				width: 80%;
				height: 100px;
				line-height: 100px;
				text-align: center;
				font-size: 14px;
				display: none;
			}

			.error {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 80%;
				background-color: #f7f7f7;
				height: 100px;
				line-height: 100px;
				text-align: center;
				font-size: 14px;
				display: none;
			}
		}
	}

	.comTitcenter {
		display: flex;
	}

	.com_img {
		position: relative;
		top: 0.22rem;
		width: 2rem;
		height: 0.68rem;
		align-items: center;
	}

	.goodsName {
		width: 4rem;
		display: inline-block;
	}

	.container .comDinfo .div_f {
		clear: both;
		font-size: 0.42rem;
		color: #ffa411;
		width: 100%;
		height: 22px;

		img {
			margin-right: 0.2rem;
			margin-right: 0.2rem;
			width: 0.56rem;
		}
	}

	.container .comDinfo .div_s {
		color: #999;
		font-size: 0.42rem;


	}

	.container .comSummary .detail {
		width: 100%;
		height: auto;
		font-size: 0.42rem;
		line-height: 28px;
		color: #828282;
		padding-bottom: 50px;
		text-align: justify;
		padding: 0 0.4rem;
		margin-top: 0.5rem;
		word-wrap: break-word;
	}
</style>