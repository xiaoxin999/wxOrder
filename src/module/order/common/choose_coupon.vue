<template>
	<div id="choose-coupon">
		<div class="nonuse" :class="isChoose ? 'active' : ''" @click="choose">不使用优惠券</div>
		<div class="couponList">
			<div class="eachCoupon">
				<div class="couponCenter" :class="saveCode == item.code ? 'chooseActive' : ''" @click="item.isUsed?chooseCoupons(item,index):''" v-for="(item,index) in coupons" :key="index">
					<p class="couponTitle" :class="item | getClass">{{item | getText}}</p>
					<ul class="couponDetail">
						<li>{{shopName}}</li>
						<li>{{item.couponName}}
							<br>
							<span class="hint" style="font-size:0.2rem;color:red;" v-if="!item.isUsed">
								{{item.unUseReason}}
							</span>
						</li>
						<li>有效期 {{item.startTime | transformTime }} 至 {{ item.endTime | transformTime}}</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="gift-win" v-if="isGiftWin">
			<div class="gfit-content">
				<div class="gift-title" v-if="coupons[giftCouponIndex].type == 5">可赠送商品</div>
				<div class="gift-title" v-if="coupons[giftCouponIndex].type == 11">定额商品</div>
				<div class="gift-list">
					<ul>
						<li v-for="(item,index) in giftList" :class="giftIndex == index ? 'on' : ''" :key="index" @click="chooseGiftObj(item,index)">{{item.goodsName || item.packageName}}</li>
					</ul>
				</div>
				<div class="gift-footer" @click="confirmGift">确定使用</div>
				<div class="gift-close" @click="closeGiftWin"></div>
			</div>
		</div>
		<div class="gift-win" v-if="isGiftWins">
			<div class="gfit-content">
				<div class="gift-title" v-if="coupons[giftCouponIndex].type == 10">买送商品</div>
				<div class="gift-title" v-if="coupons[giftCouponIndex].type == 9">第二件半价商品</div>
				<div class="gift-list">
					<div class="giftDiv" :class="item.giftTrue && item.num>0?'giftDivs':''" v-for="(item,index) in giftLists" :key="index">
						<div :class="item.giftTrue && item.num>0? 'onDiv' : 'unDiv'" @click="chooseGiftObjs(item,index)">{{item.goodsName || item.packageName}}</div>
						<div class="btn">
							<img src="../../../res/images/risk.png" class="left" @click="risk(item)" />
							<input type="text" v-model="item.num">
							<img src="../../../res/images/add.png" @click="add(item);" />
						</div>
					</div>
				</div>
				<div class="gift-footer" v-if="coupons[giftCouponIndex].type == 10" @click="confirmGifts">确定使用</div>
				<div class="gift-footer" v-if="coupons[giftCouponIndex].type == 9" @click="confirmGiftss">确定使用</div>
				<div class="gift-close" @click="closeGiftWin"></div>
			</div>
		</div>
	</div>
</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	export default {
		name: 'chooseCoupon',
		data() {
			return {
				isChoose: false, //是否选择此优惠券,默认否
				coupons: [], //优惠券列表
				shopName: '', //店铺名称
				saveCode: '', //存储每个优惠券的code,用于判断是否选取该优惠券
				goodsDetail: '',
				couponRouters: {
					'1': '/pay',
					'2': '/wechatPay',
					'3': '/preferentialPay'
				}, // key为类型，value为路由名
				pageType: this.$route.query.type,
				isGiftWin: false,
				singleGiftObj: {}, // 单品的商品数据
				singleGiftObjs: {}, // 多品的商品数据
				giftList: [],
				giftLists: [],
				giftIndex: null,
				giftCouponIndex: null,
				goods: [],
				totalPrice: null,
				lowestprice: false,
				giftTrue: false,
				isGiftWins: false,
				goodsList: [],
				objs: {},
				allNum: 0,
				allNums: 0,
				exterStaus: false,
				objc: {},

			};
		},
		methods: {
			risk(item) {
				if (item.num > 0) {
					item.num--;
				}

			},
			add(item) {
				item.num++;
			},

			//是否选择优惠券
			choose() {
				this.isChoose = false;
				this.saveCode = '';
				for (let i = 0; i < this.coupons.length; i++) {
					this.coupons[i].status = 0;
				}
				sessionStorage.removeItem('couponOn');
				storage.session('cleanCoupon', true);
				this.$router.replace(this.couponRouters[this.pageType]);

			},
			closeGiftWin() {
				this.isGiftWin = false;
				this.isGiftWins = false;
				this.giftIndex = null;
				this.giftCouponIndex = null;
			},
			//选择哪张优惠券
			chooseCoupons(item, index) {
				console.log(item, 'teim');
				// this.objs = item;
				if (item.type == '1' || item.type == '3' || item.type == '5' || item.type == '11') {
					this.isGiftWin = true;
					this.giftList = this.singleGiftObj != undefined ? [...this.singleGiftObj[item.couponId]] : [];
					this.giftCouponIndex = index;
					return false;
				} else if (item.type == '9') {
					let goods = storage.session('goods');
					let packages = storage.session('packages') ? storage.session('packages') : [];
					let gids = item.gids ? item.gids.split(',') : [];
					let pids = item.gids ? item.gids.split(',') : [];
					let giveGids = item.giveGids ? item.giveGids.split(',') : [];
					let givePids = item.givePids ? item.givePids.split(',') : [];
					let giftListGid = [];
					let giftListPid = [];
					for (let n = 0; n < goods.length; n++) {
						let nt = goods[n];
						if (gids.indexOf(nt.id) > -1) {
							this.isGiftWins = true;
						}
						for (let k = 0; k < giveGids.length; k++) {
							if (giveGids[k] == nt.id) {
								giftListGid.push(nt);
							}
						}
					}

					for (let m = 0; m < packages.length; m++) {
						let mt = packages[m];
						if (pids.indexOf(mt.id) > -1) {
							this.isGiftWins = true;
						}
						for (let k = 0; k < givePids.length; k++) {
							if (givePids[k] == mt.id) {
								giftListPid.push(mt);
							}
						}
					}
					this.giftLists = giftListGid.concat(giftListPid);
					this.giftCouponIndex = index;
					return false;
				}
				if (item.type == '10') {
					let goods = storage.session('goods');
					console.log(goods, 'ww');
					let gids = item.gids ? item.gids.split(',') : [];
					let pids = item.gids ? item.gids.split(',') : [];
					let packages = storage.session('packages') || [];
					let giveGids = item.giveGids ? item.giveGids.split(',') : [];
					let givePids = item.givePids ? item.givePids.split(',') : [];
					let giftListGid = [];
					let giftListPid = [];
					for (let n = 0; n < goods.length; n++) {
						let nt = goods[n];
						if (gids.indexOf(nt.id) > -1) {
							this.isGiftWins = true;
						}
						for (let k = 0; k < giveGids.length; k++) {
							if (giveGids[k] == nt.id) {
								giftListGid.push(nt);
							}
						}
					}
					console.log(giftListGid, 'giftListGid');

					for (let m = 0; m < packages.length; m++) {
						let mt = packages[m];
						if (pids.indexOf(mt.id) > -1) {
							this.isGiftWins = true;
						}
						for (let k = 0; k < givePids.length; k++) {
							if (givePids[k] == mt.id) {
								giftListPid.push(mt);
							}
						}
					}
					this.giftLists = giftListGid.concat(giftListPid);

					this.giftCouponIndex = index;
					return false;
				}

				if (storage.session('couponOn')) {
					//判断选取的哪张优惠券
					if (this.saveCode || this.saveCode != item.code) {
						this.saveCode = item.code;
					} else {
						this.saveCode = '';
					}
					this.isCoupons(item);
				} else {
					//判断选取的哪张优惠券
					if (this.saveCode == '' || this.saveCode != item.code) {
						this.saveCode = item.code;
					} else {
						this.saveCode = '';
					}
					this.isCoupons(item);
					this.isChoose = true;
				}
			},
			isCoupons(item) {
				//一次只能选取一张优惠券,切换UI状态的同时还要将选取的优惠券标记为已选取
				for (let i = 0; i < this.coupons.length; i++) {
					this.coupons[i].status = (this.coupons[i].code == this.saveCode) ? 2 : 0;
				}
				storage.session('couponOn', item);
				this.$router.replace(this.couponRouters[this.pageType]);
			},
			chooseGiftObj(obj, index) {
				this.giftIndex = (this.giftIndex == index) ? null : index;
			},
			chooseGiftObjs(obj, index) {
				obj.num = 1;
				this.$set(obj, 'giftTrue', true);
				if (this.giftIndex == index) {
					this.$set(obj, 'giftTrue', false);
				}
				this.giftIndex = (this.giftIndex == index) ? null : index;
				console.log(obj);
			},
			confirmGift() {
				if (this.giftIndex == null) {
					this.$store.commit('setWin', {
						content: '请选择菜品'
					});
					return false;
				}

				let coupon = this.coupons[this.giftCouponIndex];
				let goods = this.giftList[this.giftIndex];

				this.isCoupons(coupon);
				storage.session('odid', goods.odid);
			},
			confirmGiftss() {
				if (this.giftIndex == null) {
					this.$store.commit('setWin', {
						content: '请选择菜品'
					});
					return false;
				}
				let coupon = this.coupons[this.giftCouponIndex];
				console.log(coupon, 'coupon');
				let cargoods = storage.session('goods');
				let arr = [];
				let odids = [];
				let numBan = 0;
				let gids = coupon.gids.split(',');
				for (let j = 0; j < cargoods.length; j++) {
					for (let k = 0; k < gids.length; k++) {
						if (cargoods[j].id == gids[k]) {
							numBan++;
						}
					}
				}
				this.giftLists.map((item) => {
					let num = 0;
					if (item.giftTrue && item.num > 0) {
						num = Number(item.num);
						item.obj = item.odid + ':' + item.num;
						odids.push(item.odid);
						arr.push(item.obj);
						this.allNums += Number(num);
					}
					if (coupon.isSuperposition == 1) {
						if (numBan <= this.allNums) {
							this.$store.commit('setWin', {
								content: '哥，不能再优惠了哦'
							});
						}
					} else {
						if (1 < this.allNums) {
							this.$store.commit('setWin', {
								content: '只能一个半价哦'
							});
						}
					}
				});
				odids = odids.join(',');
				storage.session('odids', odids);
				if (this.allNums) {
					storage.session('goods', cargoods);
					this.isCoupons(coupon);
					let obj = {};
					for (let i = 0; i < arr.length; i++) {
						let c = arr[i].split(':');
						obj[c[0]] = c[1];
					}
					storage.session('odid', obj);
				}
			},
			confirmGifts() {
				if (this.giftIndex == null) {
					this.$store.commit('setWin', {
						content: '请选择菜品'
					});
					return false;
				}
				let coupon = this.coupons[this.giftCouponIndex];
				// let packages = storage.session('packages');
				let cargoods = storage.session('goods');
				let arr = [];
				let odids = [];
				this.giftLists.map((item) => {
					let num = 0;
					if (item.giftTrue && item.num > 0) {
						// cargoods.push(item);
						// this.$set(item, 'odid', cargoods.length);
						// item.odid = cargoods.length + index;
						num = Number(item.num);
						item.obj = item.odid + ':' + item.num;
						odids.push(item.odid);
						arr.push(item.obj);
						this.allNum += Number(num);
						if (this.objs.giveNum <= this.allNum) {
							this.$store.commit('setWin', {
								content: '超出数量了哟'
							});
							return false;
						}
					}
				});

				odids = odids.join(',');
				storage.session('odids', odids);

				if (this.allNum) {
					storage.session('goods', cargoods);
					this.isCoupons(coupon);
					let obj = {};
					for (let i = 0; i < arr.length; i++) {
						let c = arr[i].split(':');
						obj[c[0]] = c[1];
					}
					storage.session('odid', obj);

				}

			}
		},
		filters: {
			transformTime(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd hh:mm');
			},
			getText(item) {
				if (item.type == 1 || item.type == 2 || item.type == 8 || (item.type == 9 && item.discountType == 2)) {
					return '减';
				} else if (item.type == 3 || item.type == 4 || (item.type == 9 && item.discountType == 1)) {
					return '折';
				} else if (item.type == 5) {
					return '赠';
				} else if (item.type == 6 || (item.type == 9 && item.discountType == 3)) {
					return '代';
				} else if (item.type == 11) {
					return '定';
				} else if (item.type == 10) {
					return '送';
				}
			},
			getClass(item) {
				if (item.type == 1 || item.type == 2 || item.type == 8 || item.type == 11 || (item.type == 9 && item.discountType == 2)) {
					return 'subtract';
				} else if (item.type == 3 || item.type == 4 || (item.type == 9 && item.discountType == 1)) {
					return 'discount';
				} else if (item.type == 5 || item.type == 10) {
					return 'present';
				} else if (item.type == 6 || (item.type == 9 && item.discountType == 3)) {
					return 'yellow';
				}
			},

		},
		components: {
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue'),
		},
		mounted() {
			let couponList = storage.session('couponList') || [];
			couponList = utils.sortByAll(couponList, 'isUsed', false);

			let goods, packages;
			this.totalPrice = storage.session('sumPrices');
			goods = storage.session('goods') || [];
			packages = storage.session('packages') || [];
			this.goods = goods.concat(packages);
			for (let i = 0; i < this.goods.length; i++) {
				for (let j = 0; j < couponList.length; j++) {
					if (couponList[j].type == '1' || couponList[j].type == '2' || couponList[j].type == '9' || couponList[j].type == '10') {
						if (couponList[j].isDiscount == '1') {
							couponList[j].noGoods = false;
						} else if (couponList[j].isDiscount == '0') {
							if ((couponList[j].gids == null || couponList[j].gids.indexOf(this.goods[i].id == -1)) || (couponList[j].pids == null || couponList[j].pids.indexOf(this.goods[i].id == -1))) {
								couponList[j].noGoods = true;
							}
						}

					}

				}
			}

			storage.session('time');
			this.coupons = couponList;

			this.shopName = storage.session('wechatShop') ? storage.session('wechatShop').shopName : storage.session('memberInfo').shopName;
			// this.goodsDetail = storage.session('orderInfo');
			let couponOn = storage.session('couponOn');
			if (couponOn) {
				if (this.saveCode != couponOn.code) {
					this.saveCode = couponOn.code;
				} else {
					this.saveCode = '';
				}
				this.isChoose = true;
			}

			for (let i = 0; i < this.coupons.length; i++) {
				if (couponOn) {
					this.coupons[i].status = (this.coupons[i].code == this.saveCode) ? 2 : 0;
				}

				let item = this.coupons[i];
				if (item.type == '1' || item.type == '3' || item.type == '5' || item.type == '8' || item.type == '11') {
					for (let j = 0, len = this.goods.length; j < len; j++) {
						let g = this.goods[j];
						let gids = item.gids != null ? item.gids.split(',') : [];
						let pids = item.pids != null ? item.pids.split(',') : [];
						if (g.goodsName && gids.indexOf(g.id || g.gid) != -1) {
							if (this.singleGiftObj[item.couponId]) {
								this.singleGiftObj[item.couponId].add(g);
							} else {
								this.singleGiftObj[item.couponId] = new Set();
								this.singleGiftObj[item.couponId].add(g);
							}
						}

						if (g.packageName && pids.indexOf(g.id || g.pid) != -1) {
							if (this.singleGiftObj[item.couponId]) {
								this.singleGiftObj[item.couponId].add(g);
							} else {
								this.singleGiftObj[item.couponId] = new Set();
								this.singleGiftObj[item.couponId].add(g);
							}
						}
					}
				}
			}
			this.goodsList = storage.session('goodsList');
			utils.setTitle('选择优惠券');
		}
	};
</script>
<style lang="less" scoped>
	#choose-coupon {
		width: 100%;
		height: 100%;
		background: #efeff4;

		.nonuse {
			width: 100%;
			height: 1.53333rem;
			background: url(../../../res/images/choose.png) #fff 95% no-repeat;
			background-size: 0.68rem 0.68rem;
			font-size: 0.42667rem;
			line-height: 1.53333rem;
			padding-left: 0.77333rem;
			box-sizing: border-box;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 3;
		}

		.hint {
			background: url(../../../res/images/disabled.png) left no-repeat;
			background-size: 0.26667rem 0.26667rem;
			color: #DB7C63;
			padding-left: 0.4rem;
		}

		.active {
			background: url(../../../res/images/no-choose.png) #fff 95% no-repeat;
			background-size: 0.68rem 0.68rem;
		}

		.couponList {
			width: 100%;
			height: calc(100% - 1.53333rem);
			background: #efeff4;
			padding: 0.28rem 0.33333rem;
			margin-top: 1.53333rem;
			box-sizing: border-box;

			.eachCoupon {
				#no-coupon {
					background: #fff;
				}

				.couponCenter {
					width: 9.30667rem;
					height: auto;
					border: 1px #D8D8D8 solid;
					border-radius: 0.06667rem;
					background: url(../../../res/images/no-choose.png) #fff 95% no-repeat;
					background-size: 0.68rem 0.68rem;
					margin: 0 auto;
					margin-bottom: 0.28rem;
					padding: 0.4rem 0rem 0.4rem 0.24rem;
					box-sizing: border-box;
					display: flex;
					position: relative;

					.couponTitle {
						width: 0.77333rem;
						height: 0.77333rem;
						border-radius: 50%;
						background: #C0C0C0;
						line-height: 0.77333rem;
						text-align: center;
						color: #fff;
						font-size: 0.37333rem;
						margin-right: 0.13333rem;
					}

					.couponDetail {
						display: flex;
						flex-direction: column;
						justify-content: space-around;

						li:nth-of-type(1) {
							color: #797979;
							font-size: 0.33333rem;
						}

						li:nth-of-type(2) {
							color: #000;
							font-size: 0.41333rem;
						}

						li:nth-of-type(3) {
							color: #767676;
							font-size: 0.26667rem;
							list-style-type: disc;
							list-style-position: inside;
						}

						.hint {
							background: url(../../../res/images/disabled.png) left no-repeat;
							background-size: 0.26667rem 0.26667rem;
							color: #DB7C63;
							padding-left: 0.4rem;
						}

						#disable {
							color: #C0C0C0;
						}
					}
				}

				.subtract {
					background: #00A0EA !important;
				}

				.discount {
					background: #7DB343 !important;
				}

				.present {
					background: #da4438 !important;
				}

				.yellow {
					background: #ebca0b !important;
				}

				.chooseActive {
					background: url(../../../res/images/choose.png) #fff 95% no-repeat;
					background-size: 0.68rem 0.68rem;
				}
			}
		}

		.gift-win {
			position: fixed;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			z-index: 6;

			.gfit-content {
				width: 7.7333rem;
				height: auto;
				max-height: 8.4rem;
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
				bottom: 0;
				margin: auto;
				background-color: #fff;
				border-radius: .16rem;

				.gift-title {
					width: 100%;
					height: 1.8667rem;
					line-height: 1.8667rem;
					text-align: center;
					color: #313131;
					font-size: .4267rem;
				}

				.gift-list {
					padding: .1333rem .64rem;
					overflow: auto;
					-webkit-overflow-scrolling: touch;
					height: 5.3333rem;
					width: 100%;

					.giftDiv {
						clear: both;
						height: 1rem;
						line-height: 1rem;
						padding: 0.2rem;

						div:nth-child(1) {
							width: 100%;
							float: left;
						}

						.btn {
							display: none;
						}
					}

					.giftDivs {
						clear: both;
						height: 2.1rem;
						line-height: 1rem;
						padding: 0.2rem;

						div:nth-child(1) {
							width: 100%;
							float: left;
						}

						.btn {
							display: block;
						}
					}


					ul li {
						height: 1.0667rem;
						line-height: 1.0267rem;
						text-align: center;
						width: 100%;
						color: #7a7a7a;
						font-size: .3467rem;
						border: .04rem solid #efefef;
						background-color: #fff;
						margin-bottom: .2667rem;
						border-radius: .1333rem;
						transition: all 0.3s;
					}

					ul li.on {
						color: #e76801;
						background-color: #ffe5ad;
						border: .04rem solid #febe33;
					}
				}

				.onDiv {
					color: #e76801;
					background-color: #ffe5ad;
					border: .04rem solid #febe33;
					text-align: center;

					.btn {
						display: block;
					}
				}

				.unDiv {
					color: #666;
					background-color: #fff;
					border: .04rem solid #eaeaea;
					text-align: center;
				}

				.gift-footer {
					width: 100%;
					height: 1.2533rem;
					line-height: 1.2533rem;
					background-color: #febe33;
					font-size: .3733rem;
					text-align: center;
					color: #fff;
					border-radius: 0 0 .16rem .16rem;
				}

				.gift-close {
					background: url(../../../res/images/gift-close.png) center center no-repeat;
					background-size: .64rem .64rem;
					width: .8533rem;
					height: .8533rem;
					position: absolute;
					right: -0.4267rem;
					top: -0.4267rem;
				}
			}
		}
	}

	.btn.btn_add {
		float: right;
	}


	.btn {
		height: 0.6667rem;
		text-align: center;

		img {
			width: 0.6667rem;
			vertical-align: middle;
		}

		span {
			display: inline-block;
			width: 0.65rem;
			vertical-align: middle;
		}

		input {
			width: 0.65rem;
			vertical-align: middle;
			border: none;
			text-align: center;
		}

		// .left,
		// .text {
		// 	opacity: 0;
		// }

		.show {
			opacity: 1;
		}
	}
</style>