import storage from 'src/verdor/storage';
/**
 * @namespace submitChecked
 */

let SubmitChecked = {
	data() {
		return {
			mustList: [],
			personConfine: 0, //用餐人数
			confineStatus: 0, //用餐人数状态
			mustGoodsStatus: 1, //必点商品提醒方式（1仅提醒，2必点）
			mustGoodsRemind: '', //必点商品提醒内容 必点商品用{goods}
			multiOrderStatus: 0 //多人下单开关，0关，1开,2多人必点

		};
	},
	computed: {
		//这是购物车数据
		carLists: function() { //购物车列表。
			let {
				carGoodsList,
				carPackageList
			} = this.$store.state.order;
			return carGoodsList.concat(carPackageList);
		},
		tagShopCar: function() {
			let tagShopCar = this.$store.state.order.tagShopCar;
			return tagShopCar;
		},
	},
	methods: {
		checked(fn) {
			let mustGoodsSession = storage.session('selectPayWay');

			if (mustGoodsSession) {
				this.mustGoodsStatus = mustGoodsSession.mustGoodsStatus; //必点商品提醒方式（1仅提醒，2必点）
				this.mustGoodsRemind = mustGoodsSession.mustGoodsRemind || ''; //必点商品提醒内容 必点商品用{goods}
				this.multiOrderStatus = mustGoodsSession.multiOrderStatus; //多人下单开关，0关，1开,2开启多人必点。
				let mustList = storage.session('mustList');
				let str = '';
				for (let i = 0; i < mustList.length; i++) {
					str += mustList[i].goodsName + ',';

				}
				if (str.length > 0) {
					str = str.substr(0, str.length - 1);
				}
				console.log(str, 'str');
				let goods = '{goods}';
				if (this.mustGoodsRemind.indexOf(goods) > -1) {
					let oldMustGoodsRemind = this.mustGoodsRemind.replace(goods, str);
					this.mustGoodsRemind = oldMustGoodsRemind;
				}
				if (this.mustGoodsStatus == '1') {
					this.$store.commit('setWin', {
						content: this.mustGoodsRemind != '' ? this.mustGoodsRemind : '有必点商品未选择，请选择好必选商品再提交',
						type: 'confirm',
						ok: {
							content: '去看看'
						},
						cancel: {
							content: '不需要了'
						},
						callBack: (str) => {
							if (str == 'ok') {
								this.$store.commit('setMustAdd');
								storage.session('mustGoodsStatus', null);

							} else if (str == 'cancel') {
								fn();
								storage.session('mustGoodsStatus', 1);
							}
						}
					});


				} else if (this.mustGoodsStatus == '2') {
					this.$store.commit('setWin', {
						content: this.mustGoodsRemind != '' ? this.mustGoodsRemind : '有必点商品未选择，请选择好必选商品再提交',
						type: 'alert',
						ok: {
							content: '去看看'
						},
						callBack: (str) => {
							if (str == 'ok') {
								this.$store.commit('setMustAdd');
							}
						}
					});

				}
			}
			return false;
		}
	}
};

export default SubmitChecked;