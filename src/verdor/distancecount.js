import utils from './utils';
import map from 'src/manager/map';

/**
 * @namespace distancecount
 */

let Distancecount = {
	created: function() {
		this.distanceGD();
	},
	methods: {
		distanceGD() {
			let queque = [];
			let arr1 = [];
			setTimeout(() => {
				this.$store.dispatch('showLoad', false);
			}, 10000);
			for (let i = 0; i < this.shopList.length; i++) {
				let item = this.shopList[i];
				let lngLat = item.position.split(',');
				item.lng = lngLat[0];
				item.lat = lngLat[1];
				this.$set(item, 'distance', '定位中...');

				if (item.position == null || item.position == '') {
					item.distance = '';
					item.p = 1;
				} else {
					arr1.push(i);
					item.p = 0;
					queque.push(map.distanceMap({
						secondPoint: {
							lng: item.lng,
							lat: item.lat
						}
					}));
				}

			}
			Promise.all(queque).then((arr) => {
				arr.forEach((item, index) => {
					let temp = this.shopList[arr1[index]];
					if (temp) {
						this.$set(temp, 'distance', this.changeKm(item));
						this.shopList[arr1[index]].temp = item;
					}

				});
				this.shopList = utils.sortByAll(this.shopList, ['sort', 'temp', 'p'], true);

				this.$store.dispatch('showLoad', false);
			}, function(e) {
				console.log(e);
			});

		},
	}

};

export default Distancecount;