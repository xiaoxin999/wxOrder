<template>
	<section class='choose_shop'>
		<section class="chooseList" v-for="(item, index) in shopList" @click="checkShop(item,item.id,index)" :key="index">
			<div>
				<img :src="getUrl(item.logoImage)" alt="">
			</div>
			<ul>
				<li>
					<div class="text-over name_div">{{item.name}}</div> <span class="distance">{{item.disInfo}}</span>
				</li>
				<li>营业时间：{{item.time}}</li>
				<li class='text-over'> <img src="../../res/images/address.png" alt=""><span> 详细地址：{{item.address}}</span>
				</li>
			</ul>
		</section>
	</section>
</template>


<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	let map = null;
	export default {
		data() {
			return {
				shopName: '',
				logoImage: '',
				openTime: '',
				address: '',
				shopList: [],
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
			checkShop(item) {

				storage.session('bespeak_shopInfo', item);
				this.$router.push('/BespeakGen');
			},
			changeKm(d) {
				if (d > 1000 || d == 1000) d = (d / 1000).toFixed(2) + 'km';
				if (d > 0 && d < 1000) d = '<' + d + 'm';
				return d;
			},
			getTime(second_time) {
				let time = parseInt(second_time);
				let hour = parseInt(parseInt(second_time / 60)) % 24;
				time = hour + ':00';
				return time;
			},
			getStartTime: function(shop) {
				let s = (shop.openTime - 0);
				let start = Math.floor(s / 60);
				let start1 = this.tranformDate(s - (start * 60));
				return start + ':' + start1;
			},
			getEndTime: function(shop) {
				let e = (shop.closeTime - 0);
				let end = Math.floor(e / 60);
				let end1 = this.tranformDate(e - (end * 60));

				if (end > 24) {
					end -= 24;
					end = '次日' + end;
				}
				if (end == 24) {
					end == '00';
				}
				return end + ':' + end1;
			},
			tranformDate: function(t) {
				t -= 0;
				if (t < 10) {
					return ('0' + t);
				} else {
					return (t + '');
				}
			},
		},
		async mounted() {
			map = await import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			utils.setTitle('选择店铺');

			let shopList = storage.session('shoplist_bespeak');
			this.shopList = shopList.list;
			if (shopList.hasDis) {
				utils.sortByAll(this.shopList, ['disId', 'dis']);
			} else {
				let promises = [];
				let hasPosList = [];
				for (let item of this.shopList) {

					if (item.position) {
						let pos = item.position.split(',');
						promises.push(map.distanceMap({
							secondPoint: {
								lng: pos[0],
								lat: pos[1]
							}
						}));
						item.disId = 0;
						hasPosList.push(item);
					} else {
						item.disId = 1;
					}
					item.dis = 1000000000000000;
					item.time = this.getStartTime(item) + '~' + this.getEndTime(item);
				}

				//存储算出的距离,以供店铺列表使用
				Promise.all(promises).then((list) => {

					for (let i = 0; i < list.length; i++) {
						let item = hasPosList[i];
						this.$set(item, 'dis', list[i]);
						this.$set(item, 'disInfo', utils.changeKmee(list[i]));
					}
					storage.session('shoplist_bespeak', {
						list: this.shopList,
						hasDis: true
					});
					utils.sortByAll(this.shopList, ['disId', 'dis']);
				});


				this.getTime();
			}
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
						vertical-align: middle;
    					padding-left: 0.2rem;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						width: 80%;
						display: inline-block;
					}
					img{
						width: 0.2667rem;
						height: 0.32rem;
						vertical-align: middle;
					}

				}

			}

		}
	}
</style>