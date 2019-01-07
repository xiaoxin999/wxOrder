<template>
	<section class='choose_shop'>
		<section class="chooseList" v-if="eventOk==true" v-for="(item, index) in shopList" @click="checkShop(item.id)" :key="index">
			<div>
				<img :src="getUrl(item.logoImage)" alt="">
			</div>
			<ul>
				<li>
					<div class="text-over name_div">{{item.name}}</div>
					<span class="distance">{{item.distance}}</span>
				</li>
				<li>营业时间：{{item.openTime}} - {{item.closeTime}}</li>
				<li class='text-over'>
					<span> 详细地址：{{item.address}}</span>
					<div class="dy"></div>
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

	export default {
		data() {
			return {
				memberInfo: {}, //会员信息,
				membership: {}, //缓存的membership
				shopName: '',
				logoImage: '',
				openTime: '',
				address: '',
				shopList: [],
				id: this.$route.query.id,
				distance: '',
				brandId: '',
				applyShopIds: [],
				arrShopIds: [], //id 
				eventOk: true,
				shopId: ''
			};
		},
		methods: {
			getUrl(url) {
				return global.getImgUrl({
					url
				});
			},
			checkShop(id) {
				this.$router.push({
					path: '/applicationStoreDetail',
					query: {
						id
					}
				});
				if (this.eventOk == false) return;
			},
			changeKm(d) {
				return utils.changeKmee(d);
			},
			async getShopList() {
				if (this.$route.query.id == 1) { // 如果applyShopIds存在列表 会员权益
					this.applyShopIds = storage.session('arrApplyShopIds');
					let newArr = [];

					if (this.applyShopIds) {
						this.shopList.map((item) => {
							if (this.applyShopIds.indexOf(item.applyShopIds) > -1) {
								newArr.push(item);
								this.shopList = newArr;
							}
							return item;
						});

					} else { // 如果applyShopIds不存在，显示当前店信息
						this.shopList = global.getNearShop(this.shopId, this.shopList);
					}
				}
				if (this.$route.query.id == 2) { //优惠券 根据优惠券的shopIds 匹配列表

					this.arrShopIds = storage.session('arrShopIds');
					let newArr2 = [];

					if (this.arrShopIds) {
						this.shopList.map((item) => {
							if (this.arrShopIds.indexOf(item.id) > -1) {
								newArr2.push(item);
								console.log(newArr2, 'newArr2');
								this.shopList = newArr2;
							}
							return item;

						});

					} else {
						this.shopList = global.getNearShop(this.shopId, this.shopList);
					}

				}
				this.shopListCon();
				storage.session('applicationStoreDetail', this.shopList);
			},
			async shopListCon() { //列表信息展示
				let queque = [];
				let arr = [];
				for (let i = 0; i < this.shopList.length; i++) {
					let item = this.shopList[i];
					item.openTime = this.getTime(item.openTime);
					item.closeTime = this.getTime(item.closeTime);
					let firstPoint = item.position.split(',');

					item.lng = firstPoint[0];
					item.lat = firstPoint[1];
					Vue.set(item, 'distance', '定位中...');
					if (!item.position) {
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
			getTime(second_time) {
				return utils.toHourMinute(second_time);
			}

		},
		async mounted() {
			map = await
			import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			utils.setTitle('适用门店');
			this.getTime();
			this.id = this.$route.query.id;
			this.shopList = storage.session('shopList');
			this.membership = storage.session('membership');

			// if(!this.membership){
			let data = await http.getUserInfo({
				data: {
					shopId: global.getShopId(),
					type: 5,
					from: 0
				}
			});
			this.shopList = data.shopList;
			this.membership = data;
			storage.session('membership', data);

			this.memberInfo = this.membership.member; //取出session中的信息

			if (this.memberInfo) {
				this.shopId = this.memberInfo.shopId;
				this.brandId = this.memberInfo.brandId;
			}
			this.getShopList();
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
			height: 2.42rem;
			background: #f8f8f8;
			line-height: 2.42rem;
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

				li {
					line-height: 0.66rem;
				}

				li:nth-child(1) {
					font-size: 0.4rem;
					color: #303030;
					font-weight: 600;
					margin-top: 0.22rem;
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

				li:nth-child(2),
				li:nth-child(3) {
					color: #999;
					font-size: 0.32rem;

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
	}
</style>