import Timer from 'src/verdor/timer';
import storage from 'src/verdor/storage';


class Map {

	static isHasMap = null;
	//记录当前的经纬度
	static myPosition = null;

	static getMapSDK() {
		if (this.isHasMap) return Promise.resolve();
		return new Promise((resolve, reject) => {

			let s = document.createElement('script', true);
			let proto = window.location.protocol; //判断协议


			s.src = `${proto}//webapi.amap.com/maps?v=1.4.6&key=f4fd8c2aaa26c58a12eae5b301cf1c1c&&plugin=AMap.Scale`;

			document.head.appendChild(s);

			let d = document.createElement('div');
			d.id = 'allmap';
			document.body.appendChild(d);
			window.HOST_TYPE = proto == 'https:' ? '1' : '0'; //开启https请求

			this.str = Timer.add(() => {
				try {
					/* eslint-disable-next-line */
					if(window.AMap){
						Timer.clear(this.str);
						this.isHasMap = true;
						resolve();
					}
					
				} catch (e) {
					console.log(e);
				}
			}, 20, 0, true);

			s.onerror = () => {
				reject();
			};

		});
	}

	//计算两个坐标点距离
	static distanceMap({
		fristPoint = true,
		secondPoint
	}) {

		return new Promise((resolve, reject) => {

			if (typeof secondPoint != 'object') {
				reject('请传入经纬度');
			}

			let pointA = (fristPoint === true && storage.session('myPosition')) ? storage.session('myPosition') : fristPoint;
			let pointB = new AMap.LngLat(secondPoint.lng, secondPoint.lat);
			if (this.myPosition) {
				resolve(AMap.GeometryUtil.distance(new AMap.LngLat(pointA.lng, pointA.lat), pointB).toFixed(2));
			} else {

				this.loadLocation().then((data) => {
					resolve(AMap.GeometryUtil.distance(new AMap.LngLat(data.position.getLng(), data.position.getLat()), pointB).toFixed(2));
				}, (error) => {
					reject(error);
				});
			}

		});
	}

	//获取当前定位
	static loadLocation() {

		return new Promise((resolve, reject) => {
			let map, geolocation;
			//加载地图，调用浏览器定位服务
			map = new AMap.Map('allmap', {
				resizeEnable: true
			});
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

				this.myPosition = {
					lng: data.position.getLng(),
					lat: data.position.getLat()
				};
				storage.session('myPosition', this.myPosition);
				resolve(data);
			}
			//解析定位错误信息
			// {'type':'error','message':'Get sdkLocation failed.Geolocation permission denied.','info':'FAILED','status':0}
			function onError(data) {
				reject(data);
				// 	if (data.message.indexOf('Geolocation permission denied')) {

				// 	}
			}
		});

		//关于状态码
		//BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
		//BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
		//BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
		//BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
		//BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
		//BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
		//BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
		//BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
		//BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)

		// map.centerAndZoom('重庆',12);

		// alert('从大渡口区到江北区的距离是：'+(map.getDistance(pointA,pointB)).toFixed(2)+' 米。');  //获取两点距离,保留小数点后两位
		// let polyline = new BMap.Polyline([pointA,pointB], {strokeColor:'blue', strokeWeight:6, strokeOpacity:0.5});  //定义折线
		// map.addOverlay(polyline);     //添加折线到地图上

	}

	static getCity() {
		return new Promise((resolve, reject) => {

			new AMap.Map('allmap').plugin(['AMap.CitySearch'], function() {
				//实例化城市查询类
				let citysearch = new AMap.CitySearch();
				//自动获取用户IP，返回当前城市
				citysearch.getLocalCity();
				AMap.event.addListener(citysearch, 'complete', function(result) {
					if (result && result.city && result.bounds) {
						resolve(result);
					} else {
						console.log(result);
					}
				});
				AMap.event.addListener(citysearch, 'error', function(result) {
					reject(result.info);
				});
			});


		});

	}
}

export default Map;