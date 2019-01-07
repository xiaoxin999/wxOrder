<template>
	<section class='choose_shop'>
		<section class="chooseList" v-for='(item,index) in shopList' :key="index" @click="checkButton(item)">
			<ul>
				<li>
					<div class="text-over name_div">{{item.name}}</div> <span class="distance">{{item.distance}}</span>
				</li>
				<li>
					<div class='text-over'>地址：{{item.address}}</div>
					<div class="dy">仅剩库存 {{item.spareStock || 0}}</div>
				</li>

			</ul>
		</section>
	</section>
</template>
<script>
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import Vue from 'vue';
	let map = null;
	let wxsdkData = null;
	let wxsdk = null;
	export default {
		data() {
			return {
				shopList: [],
				comId: this.$route.query.comId,
				spareStockList: [],
				choiceShopId: '',
				gid: '',
				openId: '',
				wxInfo: {}, // 微信用戶信息
				goods: {}, //商品詳情
			};
		},
		methods: {
			changeKm(d) {
				return utils.changeKmee(d);
			},
			async getStoreList() { //缓存中获取的列表信息
				this.getGoodsStock();
			},
			async getGoodsStock() { //请求接口获取列表中，剩余人数
				let data = await http.getGoodsStock({
					data: {
						shopId: global.getShopId(),
						id: this.$route.query.comId
					}
				});
				// console.log(data,'库存'); 
				if (data.length == 0) {
					this.$store.commit('setWin', {
						content: '该商品没有店铺拥有库存!',
						callBack: () => {
							window.history.back();
						}
					});
				}
				let newArr = [];
				let shopList = this.wxInfo.shopList;
				shopList.map((item) => {
					for (let i = 0; i < data.length; i++) {
						let id = data[i].shopId;
						if (id == item.id) {
							Vue.set(item, 'spareStock', data[i].spareStock);
							newArr.push(item);
						}
					}
				});
				this.shopList = newArr;
				this.shopListCon();
			},
			async shopListCon() { //列表信息展示
				let queque = [];
				let arr = [];
				for (let i = 0; i < this.shopList.length; i++) {
					let item = this.shopList[i];
					let firstPoint = item.position.split(',');

					item.lng = firstPoint[0];
					item.lat = firstPoint[1];
					Vue.set(item, 'distance', '定位中...');
					if (item.position == null || item.position == '') {
						item.distance = '';
						item.p = 1;
					} else {
						arr.push(i);
						item.p = 0;
						queque.push(map.distanceMap({
							secondPoint: {
								lng: item.lng,
								lat: item.lat
							}
						}));
					}
				}
				Promise.all(queque).then((data) => {
					data.forEach((item, index) => {
						Vue.set(this.shopList[arr[index]], 'distance', this.changeKm(item));
						this.shopList[arr[index]].temp = item;
					});
					this.shopList = utils.sortByAll(this.shopList, ['p', 'temp'], true);
					this.$store.dispatch('showLoad', false);
				});
			},
			openDet(item) {
				this.$router.push({
					path: '/detail',
					query: {
						comId: item.id,
						choiceShopId: item.id
					}
				});
			},
			checkButton(item) {
				this.choiceShopId = item.id;
				this.exchangeCom();
			},
			async exchangeCom() {
				let contenText, type;
				if (Number(this.wxInfo.point) >= Number(this.goods.price) && Number(this.goods.cash) > 0) { //积分+钱
					contenText = `是否确定兑换，确定后需要支付${this.goods.cash}元现金。`;
					type = 'confirm';

				} else if (Number(this.wxInfo.point) >= Number(this.goods.price) && Number(this.goods.cash) == 0) { // 纯积分
					contenText = `您将消耗${this.goods.price}积分，是否兑换此产品？`;
					type = 'confirm';

				} else if (Number(this.goods.price == 0) && Number(this.goods.cash) > 0) {
					contenText = `是否确定兑换，确定后需要支付${this.goods.cash}元现金。`;
					type = 'confirm';

				} else {
					console.log('数据异常');
				}
				this.$store.commit('setWin', {
					content: `${contenText}`,
					type: type,
					callBack: (str) => {
						if (str === 'ok') {
							this.addExchange();
						}
					}
				});
			},
			async addExchange() {
				let res = await http.addExchange({
					data: {
						shopId: global.getShopId(),
						mid: this.mid,
						gid: this.gid,
						payType: 'wx' || 'zx',
						openId: this.openId,
						choiceShopId: '' || this.choiceShopId
					}
				});
				if (this.goods.cash == 0) {
					if (res) {
						this.$router.push('/exchangeSuccess');
						await this.get(global.getShopId());
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
			async get(shopId) { //异步更新用户信息变量以及缓存信息。
				let loginInfo = storage.session('login');

				let res = await http.getUserInfo({
					data: {
						shopId: shopId,
						type: 3,
						from: 0
					}
				});
				Object.assign(res, loginInfo);
				this.wxInfo = res;
				storage.session('userInfo', res);

			}
		},
		async mounted() {
			map = await import( /* webpackChunkName:'map' */ 'src/manager/map');
			wxsdkData = await import( /* webpackChunkName:'wx_sdk' */ 'src/manager/platform_sdk');
			this.wxInfo = storage.session('userInfo'); // 微信用戶信息
			this.goods = storage.session('goodsInfo'); //商品詳情
			if (!this.wxInfo) {
				await this.get(global.getShopId());
			}
			map = map.default;
			await map.getMapSDK();
			this.getStoreList();

			this.gid = storage.session('goodsInfo').id;
			let openId = storage.session('login');
			this.openId = openId.openId;
			wxsdk = wxsdkData.default;
			await wxsdk.registerWXSDK();

		}
	};
</script>

<style lang='less' scoped>
	.choose_shop {
		background: #fff;
		min-height: 100%;
		overflow-y: scroll;
		padding-bottom: 2rem;

		header {
			height: 2rem;
			background-color: rgb(24, 24, 24);

			&>div {
				width: 90%;
				margin: 0 auto;
				height: 2rem;
				font-size: 0.4rem;
				color: #FFFFFF;
				line-height: 2rem;
				text-align: center;
			}
		}

		.chooseList {
			width: 93%;
			border: 1px solid #ddd;
			height: 2.24rem;
			background: #f8f8f8;
			margin: 0 auto;
			margin-top: 0.22rem;

			&>div {
				margin: 0 auto;

				img {
					width: 1.8rem;
					height: 1.8rem;
					border-radius: 100%;
					float: left;
					line-height: 2rem;
					text-align: center;
					border: 1px solid #ddd;
					margin: 0.22rem;
				}
			}

			ul {
				height: 2rem;
				padding: 0 0.2rem;

				li {
					line-height: 0.66rem;
				}

				li:nth-child(1) {
					font-size: 0.4rem;
					color: #303030;
					font-weight: 600;
					margin-top: 0.3822rem;
					position: relative;

					.name_div {
						width: 5rem;
					}

					span {
						float: right;
						margin-right: 0.2rem;
						font-size: 0.32rem;
						color: #EAC048;
						font-weight: 500;
						position: absolute;
						right: 0.2rem;
						top: 0rem;
					}
				}

				li:nth-child(2) div:nth-child(1) {
					width: 78%;
					float: left;

				}

				li:nth-child(2) div:nth-child(2) {
					width: 22%;
					float: right;
				}

				li:nth-child(3) {
					position: relative;

					span {
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						width: 80%;
						display: inline-block;
					}

					.dy {
						float: right;
						width: 0.3rem;
						height: 0.3rem;
						color: #333;
						border: 1px solid #ccc;
						transform: rotate(45deg);
						-ms-transform: rotate(45deg);
						-moz-transform: rotate(45deg);
						-webkit-transform: rotate(45deg);
						-o-transform: rotate(45deg);
						border-bottom: 0;
						border-left: 0;
						position: absolute;
						right: 5%;
						bottom: 30%;
					}
				}

			}

		}

		.task_btn {
			text-align: center;
			position: fixed;
			width: 100%;
			bottom: 2%;

			&>span {
				display: inline-block;
				padding: 0 0.8rem;
				border: 1px solid #eaeaea;
				border-radius: 100px;
				height: 0.88rem;
				line-height: 0.88rem;
			}
		}

	}
</style>