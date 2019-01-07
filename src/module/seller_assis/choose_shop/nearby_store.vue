<template>
	<section class='choose_shop'>
		<section class="chooseList" v-for="(item, index) in shopList" @click="checkShop(item.id)" :key="index">
			<div>
				<img :src="getUrl(item.logoImage)" alt="">
			</div>
			<ul>
				<li>
					<div class="text-over name_div">{{item.name}}</div> <span class="distance">{{item.distance}}</span>
				</li>
				<li>营业时间：{{item.openTime}} - {{item.closeTime}}</li>
				<li class='text-over'><span> 详细地址：{{item.address}}</span>
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
				shopName: '',
				logoImage: '',
				openTime: '',
				address: '',
				shopList: [],
				id: this.$route.query.id,
				distance: '',
				brandId: ''
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
					path: '/nearbyStoreDetail',
					query: {
						id
					}
				});
				storage.session('nearbyStoreDetail', this.shopList);
			},
			changeKm(d) {
				if (d > 1000 || d == 1000) d = (d / 1000).toFixed(2) + 'km';
				if (d > 0 && d < 1000) d = '<' + d + 'm';
				return d;
			},
			async getShopList() {
				let data = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: '3',
						from: '0'
					}
				});
				this.shopList = data.shopList;
				this.shopList = global.getNearShop(this.shopId, this.shopList);
				let queque = [];
				let arr = [];


				setTimeout(() => {
					this.$store.dispatch('showLoad', false);
				}, 10000);
				for (let i = 0; i < this.shopList.length; i++) {
					let item = this.shopList[i];
					item.openTime = this.getTime(item.openTime);
					item.closeTime = this.getTime(item.closeTime);
					item.lng = item.position.split(',')[0];
					item.lat = item.position.split(',')[1];
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

				storage.session('nearbyStoreDetail', this.shopList);
			},
			getTime(second_time) {
				let time = parseInt(second_time);
				let hour = parseInt(parseInt(second_time / 60)) % 24;
				time = hour + ':00';
				return time;
			}
		},
		async mounted() {
			map = await import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			this.getShopList();
			utils.setTitle('附近门店');
			this.getTime();
			this.id = this.$route.query.id;
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