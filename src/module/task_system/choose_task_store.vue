<template>
	<section class='choose_shop'>
		<section class="chooseList" v-for='(item,index) in shopList' :key="index" @click="toTaskDetail(item)">
			<ul>
				<li>
					<div class="text-over name_div">{{item.name}}</div> <span class="distance">{{item.distance}}</span>
				</li>
				<li>
					<div class='text-over'>地址：{{item.address}}</div>
					<div class="dy">{{item.spareStock==0?0:item.spareStock}}人可参与</div>
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
				shopList: [],
				taskId: this.$route.query.taskId,
				spareStockList: [],
				applyShopIds: []
			};
		},
		methods: {
			changeKm(d) {
				return utils.changeKmee(d);
			},
			async getStoreList() { //缓存中获取的列表信息
				this.applyShopIds = storage.session('arrApplyShopIds');
				console.log(this.applyShopIds, ' this.applyShopIds');
				let newArr = [];
				this.shopList.map((item) => {
					if (this.applyShopIds.indexOf(item.id) > -1) {
						newArr.push(item);
						this.shopList = newArr;
					}

					return item;
				});

				this.shopListCon();
				this.spareStockLists();
			},
			async spareStockLists() { //请求接口获取列表中，剩余人数
				let data = await http.shopTaskList({
					data: {
						shopId: global.getShopId(),
						taskId: this.taskId
					}
				});
				for (let i = 0; i < data.length; i++) {
					for (let j = 0; j < this.shopList.length; j++) {
						let id = data[i].shopId;
						if (id == this.shopList[j].id) {
							Vue.set(this.shopList[j], 'spareStock', data[i].spareStock);
						}
					}
				}
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
			toTaskDetail(item) {
				item.begin = 0;
				storage.session('taskDetail');
				storage.session('storeDetail', item);
				this.$router.push({
					path: '/taskDetails',
					query: {
						shopId: item.id
					}
				});
			},
		},
		async mounted() {
			map = await import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			this.shopList = storage.session('shopList');
			this.getStoreList();
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