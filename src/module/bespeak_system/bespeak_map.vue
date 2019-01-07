<template>
	<section>
		<header>
			<div class='left'>
				<img src="../../res/images/address.png" alt="">
				{{city}}
			</div>
			<div class='right'>
				<div>
					<img src="../../res/images/latest-order-sreach.png" alt="">
					<input type="text" placeholder="搜索地点" v-model="text" maxlength="10" @input='tempFn'>
				</div>
			</div>
		</header>

		<div class="select_ul" v-if='showTips'>
			<ul>
				<li v-for="(item,index) in tips" :key="index" @click="getValue(item,index)">{{item.name}} <span v-if='item.district'>{{item.district}}</span></li>
			</ul>
		</div>


		<div id='map'>

		</div>
		<div class='asideLis'>
			<div class='list' @click='goPage(1)'>
				<img src="../../res/images/shoplist.png" alt="">
			</div>
			<div class='location' @click='showLocation'>
				<img src="../../res/images/current_location.png" alt="">
			</div>
		</div>
		<div class='shopInfo' v-if='showShopInfo'>
			<div class='top'>
				<div class='left'>
					<img :src="shopInfo.logoImage" alt="">
				</div>
				<div class='right'>
					<div class='nameInfo'>
						<div class='name'>{{shopInfo.name}}</div>
						<div class='distance'>{{shopInfo.disInfo||'未知'}}</div>
					</div>
					<div class='time'>营业时间：{{shopInfo.time||'未知'}}</div>
					<div class='address'> <img src="../../res/images/address.png" alt=""> {{shopInfo.address||'未知'}}</div>
				</div>
			</div>
			<div class='button' @click='bespeakOrder'>
				立即预约
			</div>
		</div>
	</section>
</template>

<script>
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';


	let map = null;
	let mapInstance = null;

	let shopId = utils.getQueryString('shopId') || 10069;
	let merchId = utils.getQueryString('merchId') || 10013;
	let myPosition = {};
	let mapFunc = null;
	let geocoder = null;
	export default {
		data() {
			return {
				city: '上海',
				localCity: '上海',
				shopList: [],
				showShopInfo: false,
				shopInfo: {},
				/* eslint-disable-next-line */
				tempFn: () => {},
				search: null,
				tips: [],
				text: '',
				showTips: false
			};
		},
		methods: {
			bespeakOrder() {
				storage.session('bespeak_shopInfo', this.shopInfo);
				this.$router.push('/BespeakGen');
			},
			getValue(item) {
				let {
					location
				} = item;
				mapInstance.panTo(new AMap.LngLat(location.O, location.P));
				this.tips = [];
				this.text = '';
				this.showTips = false;

				geocoder.getAddress([location.O, location.P], (status, result) => {
					if (status === 'complete' && result.info === 'OK') {
						this.city = result.regeocode.addressComponent.city;
					}
				});

			},
			getGaodeMap(e) {
				this.showTips = true;
				this.search.search(e.target.value, (status, result) => {
					this.tips = result.tips;
					console.log(result);
				});
			},
			goPage() {
				this.$router.push('/bespeakShoplist');
			},
			showLocation() {
				mapInstance.panTo(new AMap.LngLat(myPosition.lng, myPosition.lat));
				this.city = this.localCity;
			},
			//处理地图的点击事件
			eventHandler() {
				this.showShopInfo = false;
			},
			loadLocation() {
				return new Promise((resolve, reject) => {
					let map, geolocation;
					//加载地图，调用浏览器定位服务
					mapInstance = map = new AMap.Map('map', {
						resizeEnable: true,
						zoom: 13, //初始化地图层级
					});

					mapFunc = AMap.event.addListener(map, 'click', this.eventHandler.bind(this));
					map.plugin('AMap.Geolocation', function() {
						geolocation = new AMap.Geolocation({
							enableHighAccuracy: true, //是否使用高精度定位，默认:true
							timeout: 10000, //超过10秒后停止定位，默认：无穷大
							extensions: 'all'
						});
						map.addControl(geolocation);
						geolocation.getCurrentPosition();
						AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
						AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
					});
					//解析定位结果
					function onComplete(data) {

						myPosition = {
							lng: data.position.getLng(),
							lat: data.position.getLat()
						};
						resolve(data);
					}
					//解析定位错误信息
					// {'type':'error','message':'Get sdkLocation failed.Geolocation permission denied.','info':'FAILED','status':0}
					function onError(data) {
						reject(data);
					}
				});
			},
			clickMarker(e) {
				if (!e.target.hasAttribute('data-index')) return;
				let index = e.target.getAttribute('data-index');
				this.shopInfo = this.shopList[index];
				this.showShopInfo = true;
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
			imgClick(type) {
				type = type ? 'addEventListener' : 'removeEventListener';
				let arr = Array.from(document.querySelectorAll('.map_marker img'));
				for (let item of arr) {
					item[type]('touchend', this.clickMarker);
				}
			}
		},
		beforeDestroy() {
			AMap.event.removeListener(mapFunc);
			this.imgClick();
		},
		async mounted() {

			this.$store.dispatch('showLoad', true);
			map = await import( /* webpackChunkName:"map" */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();


			let json = await http.choiceShop({
				data: {
					shopId: shopId ? shopId : null,
					merchId: merchId
				}
			});
			this.shopList = json.shopList;
			storage.session('shoplist_bespeak', {
				list: this.shopList,
				hasDis: false
			});
			
			let myLocation = await this.loadLocation();
			let {
				addressComponent: {
					province
				}
			} = myLocation;
			let scale = new AMap.Scale({
				visible: true
			});

			mapInstance.addControl(scale);
			this.city = province.replace(/市$/g, '');
			this.localCity = this.city;

			

			let index = 0;
			let promises = [];
			let hasPosList = [];
			//遍历店铺列表生成标记以及算出距离和营业时间
			for (let item of json.shopList) {
				item.logoImage = global.getImgUrl({
					url: item.logoImage
				});
				if (item.position) {
					let pos = item.position.split(',');
					let marker = new AMap.Marker({
						icon: item.logoImage,
						content: `
							<div class='map_marker'>
								<img data-index = ${index} src= ${global.getImgUrl({url: item.logoImage})}>
								<div>${item.name}</div>	
							</div>
						`,
						position: pos
					});
					marker.setMap(mapInstance);
					promises.push(map.distanceMap({
						secondPoint: {
							lng: pos[0],
							lat: pos[1]
						}
					}));
					item.time = this.getStartTime(item) + '~' + this.getEndTime(item);
					hasPosList.push(item);
					item.disId = 0;
				} else {
					item.disId = 1;
				}
				index++;
			}
			geocoder = new AMap.Geocoder({
				city: '' //城市，默认：“全国”
			});
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

			});

			

			setTimeout(() => {
				this.imgClick(true);
			}, 100);

			AMap.plugin(['AMap.Autocomplete'], () => {
				let autoOptions = {
					city: this.city.adcode, //城市，默认全国
					datatype: 'all'
				};
				this.search = new AMap.Autocomplete(autoOptions);


			});

			this.tempFn = utils.throttle(this.getGaodeMap, 300, 500, this);
			this.$store.dispatch('showLoad', false);
		},
	};
</script>

<style scoped lang="less">
	section {
		&>header {
			height: 1.1733rem;
			background: #FFFFFF;
			display: flex;
			align-items: center;
			justify-content: center;

			&>.left {
				flex: 1;
				padding-left: 0.32rem;
				font-size: 0.4rem;
				color: #303030;

				&>img {
					width: 0.2667rem;
					height: 0.32rem;
				}
			}

			&>.right {
				width: 7.5267rem;
				margin-right: 0.6rem;
				height: 0.8rem;
				background: #F3F3F3;
				border-radius: 33px;

				&>div {

					&>img {
						width: 0.4667rem;
						margin: 0 0.3067rem;
						vertical-align: middle;
					}

					&>input {
						width: 5.5rem;
						height: 0.8rem;
						border: none;
						background-color: transparent;
						vertical-align: middle;
					}
				}
			}
		}

		#map {
			position: absolute;
			top: 1.1733rem;
			left: 0;
			bottom: 0;
			right: 0;
		}

		.asideLis {
			position: fixed;
			z-index: 100;
			right: 0;
			top: 3rem;

			.location {
				margin-top: 0.3rem;
			}

			img {
				width: 1rem;
			}
		}

		.select_ul {
			height: 5rem;
			overflow: auto;
			position: fixed;
			z-index: 1000;
			top: 1.17333rem;
			left: 0;
			width: 100%;

			ul {
				width: 100%;
				padding: 0 3%;
				background: rgb(255, 255, 255);

				li {
					border-bottom: 1px solid #eaeaea;
					padding: 0.24rem 0;

					span {
						font-size: 0.3rem;
						color: #999;
						display: block;
						padding: 0.1rem 0;
					}
				}
			}
		}

		.shopInfo {
			height: 4.4533rem;
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			z-index: 1000;

			.top {
				height: 3.2533rem;
				display: flex;
				align-items: center;
				justify-items: center;
				background: #F7F7F7;

				.left {
					img {
						width: 1.96rem;
						height: 1.96rem;
						margin: 0.35rem;
					}
				}

				.right {
					width: 6.9333rem;

					.nameInfo {
						font-size: 0.48rem;
						color: #000000;

						div {
							display: inline-block;
						}

						.name {
							width: 4rem;
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							vertical-align: text-bottom;
							margin-right: 0.25rem;
						}

						.distance {
							font-size: 0.3467rem;
						}
					}

					.time {
						font-size: 0.3467rem;
						color: #9A9A9A;
						margin: 0.2267rem 0;
					}

					.address {
						font-size: 0.3467rem;
						color: #9B9B9B;

						img {
							width: 0.2667rem;
							height: 0.32rem;
						}
					}
				}
			}

			.button {
				background: #EAC048;
				font-size: 0.48rem;
				color: #FFFFFF;
				text-align: center;
				width: 100%;
				height: 1.2rem;
				line-height: 1.2rem;
			}
		}
	}
</style>

<style lang='less'>
	.amap-geolocation-con,
	.amap-logo,
	.amap-copyright {
		display: none !important;
	}

	.map_marker {
		width: 1.5rem;
		text-align: center;
		position: relative;

		img {
			width: 0.65rem;
			height: 0.65rem;
			border-radius: 50%;
			position: absolute;
			top: 0;
			margin: auto;
			left: 0;
			right: 0;
		}

		div {
			overflow: hidden;
			white-space: initial;
			margin-top: -0.5rem;
		}
	}
</style>