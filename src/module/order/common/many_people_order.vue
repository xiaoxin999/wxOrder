/*
* @Author: guan.sun
* @Date: 2018-07-27 14:18:36
* @Last Modified time: 2018-07-27 14:18:36
*/
<template>
	<div class="many-people">
		<div class="header">
			<div class="header-tip">商家可按购物车分开打包商品</div>
			<div class="header-btn" @click="addTagCar('add')">添加购物车</div>
		</div>
		<div class="content">
			<div class="not-tags" v-if="!isEmpty">
				<p>还没有购物车呦！</p>
				<p>快去添加吧～</p>
			</div>
			<div class="tags-list">
				<div class="tags" v-for="(tag,j) in tagList" :key="j" v-if="tag">
					<div class="tags-header">
						<div class="tags-number" :style="{'backgroundColor': colorArr[j%5]}">{{j+1}}</div>
						<div class="tags-name">
							<span class="fl">{{tag.tagName}}</span>
							<span class="tags-edit fl" @click="addTagCar('edit',j)"></span>
						</div>
						<div class="tags-operate">
							<span @click="goOrder(tag.tagId)">添加商品</span>
							<span @click="delTag('del',tag.tagId,j)">删除Ta</span>
						</div>
					</div>
					<ul class="tags-content">
						<div class="not-goods" v-if="tag.list == 0">还没有添加商品</div>
						<li v-for="(item,index) in tag.list" :key="index" v-if="item.num>0">
							<span>
								{{item.goodsName || item.packageName}}
								<template v-if="item.attrInfo && item.attrInfo != ''">
									({{item.attrInfo}})
								</template>
							</span>
							<span>×{{item.num}}</span>
							<span>¥{{item.price}}</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="order-car">
			<div class="car-icon fl">
				<span class="car-num">{{shopCarNum}}</span>
			</div>
			<div class="car-info fl">
				<div class="car-price" v-if="isEmpty">
					<div class="reducePrice">￥{{isEmpty?Number(shopCarPrice).toFixed(2):0}}元</div>
				</div>
				<div class="car-empty" v-else>未选购商品</div>
			</div>
			<div class="car-btn fr" :class="shopCarNum > 0 ? 'car-on' : ''" @click="goPay">选好了</div>
		</div>
		<transition name="fade">
			<win :width="280" :height="'auto'" :type="'confirm'" @winEvent="winEmit" v-show="winObj.show">
				<div slot="content" class="win-content">
					<div class="win-title">{{winObj.title}}</div>
					<input type="text" placeholder="输入名称（2-12字）" maxlength="12" v-model="tagCarName" v-if="winObj.type == 2">
					<p v-else>退出点餐后，选购商品会被清空，将无法和好友继续一起订餐。</p>
				</div>
			</win>
		</transition>
	</div>
</template>
<script>
	import http from 'src/manager/http';
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import SubmitChecked from 'src/module/order/common/mixin';
	let orderData = null;

	function pushHistory() {
		let state = {
			title: 'title',
			url: '#'
		};
		window.history.pushState(state, 'title', '#');
	}

	export default {
		mixins: [SubmitChecked],
		data() {
			return {
				tagList: null,
				isEmpty: null,
				winObj: {
					'title': '确认退出',
					'type': 1, // 1为添加购物车，2为修改名称，3为退出提示
					'show': false // 是否显示
				},
				tagCarName: '',
				colorArr: ['#BC97FF', '#FF6000', '#FFB038', '#7AD946', '#6DD3DC'],
				editIndex: null,
				shopCarNum: 0,
				shopCarPrice: 0,
				isMember: !!storage.session('memberInfo').member,
				isClosePage: false, // 是否清楚页面数据
				str: '',
				reduceActivity: {},
				memberInfo: storage.session('memberInfo'),

			};
		},
		watch: {
			'tagList': function(nVal) {
				this.shopCarNum = 0;
				this.shopCarPrice = 0;
				for (let i of nVal) {
					for (let j of i.list) {

						if (j.goodsName && j.type === '1') {
							// 斤两菜默认为一份
							this.shopCarNum += 1;
						} else if (j.goodsName) {
							this.shopCarNum += Number(j.num);
						} else if (j.packageName) {
							this.shopCarNum += Number(j.num);
						}


						let price = 0;
						if (j.isVip == '0') {
							price = j.price;
						} else {
							if (this.isMember) {
								price = j.memberPrice;
							} else if (this.$store.state.order.isFans) {

								if (this.memberInfo.discount.isDiscount == '1' && j.isVip == '2') {
									price = j.memberPrice;
								} else if (this.memberInfo.discount.isVipPrice == '1' && j.isVip == '1') {
									price = j.memberPrice;
								} else {
									price = j.price;
								}

							} else {
								price = j.price;
							}
						}

						let attrPrice = j.attrPrice || 0;
						// let price = (j.isVip == '0') ? j.price : (this.isMember) ? j.memberPrice : j.price;

						if (j.goodsName) {
							if (j.type == '1') {
								this.shopCarPrice += (Number(price) * Number(j.num)) + Number(attrPrice);
							} else {
								this.shopCarPrice += (Number(price) + Number(attrPrice)) * j.num;
							}
						} else {
							// 套餐价格计算公式为：套餐价格 + 套餐数量
							let price = (j.isVip == '0') ? j.price : (this.isMember) ? j.memberPrice : j.price;
							this.shopCarPrice += price * j.num;
						}

					}
				}
			}
		},
		methods: {
			winEmit(type) {
				if (type == 'ok') {
					if (this.isClosePage) {
						this.$store.commit('setManyOrder', false);
						this.$store.commit('resetShopCar');
						window.history.back();
						return;
					}

					if (this.tagCarName.trim() == '' || this.tagCarName.trim().length < 2) {
						this.$store.commit('setWin', {
							content: '请填写口袋名,至少2个字'
						});
						return;
					}

					let obj = {
						'type': this.editIndex == null ? 'add' : 'edit',
						'tagName': this.tagCarName,
						'index': this.editIndex != null ? this.editIndex : ''
					};
					this.updateStatus(obj);
				} else if (type == 'cancel') {
					pushHistory();
				}
				console.log(type);

				this.winObj.show = false;
				this.tagCarName = '';
				this.editIndex = null;
			},
			addTagCar(type, index) {
				// 添加购物车
				this.winObj = {
					'title': '修改购物车',
					'type': type == 'edit' ? 2 : 1,
					'show': type == 'add' ? false : true
				};
				this.editIndex = type == 'edit' ? index : null;

				if (type == 'add') {
					this.updateStatus({
						'type': 'add'
					});
				}
			},
			delTag(type, tagId, index) {
				// 删除口袋
				this.$store.commit('setWin', {
					'content': '点餐人被删除后不可恢复哦',
					'type': 'confirm',
					'ok': {
						'content': '确定删除'
					},
					callBack: (res) => {
						if (res == 'ok') {
							let obj = {
								'id': tagId,
								'type': type,
								'index': index
							};
							this.updateStatus(obj);
						}
					}
				});
			},
			goOrder(id) {
				// 去点餐页面
				this.$store.commit('setTagId', id);
				let configStyle = storage.session('configStyle');
				if (configStyle == 1) {
					this.$router.push('/order');
				} else if (configStyle == 2) {
					this.$router.push('/latestOrder');
				}

			},
			updateStatus(obj) {
				// 更新数据状态
				this.$store.commit('setTag', obj);
				this.tagList = this.$store.state.order.tagList;
				storage.session('tagList', this.$store.state.order.tagList);
				storage.session('tagIndexObj', this.$store.state.order.tagIndexObj);
				storage.session('tagShopObj', this.$store.state.order.tagShopObj);
				this.isEmpty = !!this.tagList.length;
				this.$store.commit('setCache');
			},
			goPay() {
				// 下单
				if (this.isEmpty) {
					let goods = [],
						packages = [],
						godid = 0,
						podid = 0;

					for (let tag of this.tagList) {
						for (let g of tag.list) {
							if (g.goodsName) {
								g.odid = ++godid;
								goods.push(g);
							} else {
								g.odid = ++podid;
								packages.push(g);
							}
						}
					}
					
					storage.session('goods', goods);
					storage.session('packages', packages);
					storage.session('sumPrice', this.shopCarPrice);
					storage.session('complementeGoods', packages);
					storage.session('tagList', this.tagList);
					this.mustGoods();

				}
			},
			mustGoods() {
				let selectShop = storage.session('select-shop'); // 自助模式信息
				if (selectShop) {
					if (this.tagList && this.tagList.length > 1) {
						if (!orderData.checkMustTagList(this.tagList) && !this.checked(this.leastGood)) {
							// alert('多篮子必选');
							let multiOrderStatus = storage.session('selectPayWay').multiOrderStatus;
							//multiOrderStatus 多人下单开关 0关 1所有的菜品在一起判断必点 2每个篮子判断必点
							let mustGoodsStatus = storage.session('mustGoodsStatus');
							if (multiOrderStatus == '2' && mustGoodsStatus == 1) {
								this.$router.push({
									path: '/pay',
									query: {
										type: 2
									}
								});
							} else if (multiOrderStatus == '2' && !mustGoodsStatus) {
								this.$store.commit('setWin', {
									content: orderData.getContent(this.tagList)
								});
							}

							return;
						}
					} else {

						if (!orderData.checkMustList(this.carLists) && !this.checked(this.leastGood)) {
							return;
						}

					}
				}
				let configStyle = storage.session('configStyle');
				if (configStyle == 2) {
					this.leastGood();
				} else {

					this.$router.push({
						path: '/pay',
						query: {
							type: 2
						}
					});

				}
			},
			isInArray(arr, value) {
				for (let i = 0; i < arr.length; i++) {
					if (value === arr[i]) {
						return true;
					}
				}
				return false;
			},
			leastGood() {
				//起售商品
				let carLists = storage.session('goods');
				carLists = carLists.concat(storage.session('packages'));
				storage.session('complementeGoods', carLists);
				let goodsLeastData = orderData.goodsLeast; //起售数据
				this.goodsLeast = goodsLeastData;
				let status = true;
				this.goodsLeast.map((item) => {
					if (item.type == '1') { //type 1 单品
						let sumNum = 0;
						carLists.map((item1) => {
							if (!item1.packageName) {
								if (item.gid == item1.id) {
									sumNum = Number(sumNum) + Number(item1.num);
								}
							}
							// if (item.gid == item1.id) {
							// 	sumNum = Number(sumNum) + Number(item1.num);
							// }
							return item;
						});
						if (sumNum > 0) {
							if (Number(item.num) > Number(sumNum)) {
								status = false;
								this.$store.commit('setWin', {
									content: '该商品起售数' + Number(item.num) + ',还差' + Number(item.num - sumNum) + '个'
								});
								return;
							}
						}

					} else if (item.type == '2') { //type 2 多品
						let gids = item.gid.split(',');
						let sumNum = 0;
						carLists.map((item1) => {
							if (!item1.packageName) {
								if (this.isInArray(gids, item1.id)) {
									sumNum = Number(sumNum) + Number(item1.num); //多品之和
								}
							}

							return item;
						});
						if (sumNum > 0) {
							if (Number(item.num) > Number(sumNum)) {
								status = false;
								this.$store.commit('setWin', {
									content: '该组合商品起售数' + Number(item.num) + ',还差' + Number(item.num - sumNum) + '个'
								});
								return;
							}
						}
					}

				});
				//goodsLeast遍历完后，如果没有跳列表说明都满足大于起售num 则去支付

				if (status) {
					this.$router.push({
						path: '/pay',
						query: {
							type: 2
						}
					});
				} else {
					storage.session('multiGoods');
					storage.session('complementeGoods');
					this.$router.push({
						path: '/latestOrder/complemente'
					});
				}
			},
			countStr(n) {
				let data = this.reduceActivity;
				if (data.length > 0 || data != '') {
					let actData = data.discountRule;
					console.log(actData, 'actData');
					let actStatus = data.status;
					let actDefData = data.otherRule;
					let actDefStatus = data.otherRule.status;
					let str = '';
					n = Number(n);
					if (n == -1) {

						if (actDefStatus) {
							str += '不满' + actDefData.orderPrice + '支付,' + actDefData.pay;
						}
						if (actStatus) {
							for (let i = 0; i < actData.length; i++) {
								str += '满' + actData[i].orderPrice + '减' + actData[i].reduction + ',';
							}
						}

						return str;
					} else {
						let reducePriceAll = 0;
						if (n < actDefData.orderPrice && actDefStatus) {

							let min = Math.min(n, Number(actDefData.pay));
							if (min != n) {
								reducePriceAll = n - min;
							}
							storage.session('reducePriceAll', reducePriceAll);
							str = '只需要付' + min;
							return str;
						} else if (n >= actDefData.orderPrice && actDefStatus && actStatus != 1) {
							storage.session('reducePriceAll', 0);
							str = '';
							return str;
						}
						if (actStatus == 1) {
							if (n < actData[0].orderPrice) {
								storage.session('reducePriceAll', 0);
								return '还差' + (Number(actData[0].orderPrice) - n).toFixed(2) + ',减' + actData[0].reduction;
							} else if (actData.length == 1) {
								reducePriceAll = actData[0].reduction;
								storage.session('reducePriceAll', reducePriceAll);
								str = '减' + reducePriceAll;
								return str;
							}
							for (let i = 1; i < actData.length; i++) {
								if (actData[i].orderPrice > n) {
									let temp = i;
									reducePriceAll = actData[temp - 1].reduction;
									str = '已减' + actData[temp - 1].reduction + ',再买' + (Number(actData[temp].orderPrice) - n).toFixed(2) + ',减' + actData[temp].reduction;
									break;
								} else if (i === actData.length - 1) {
									reducePriceAll = actData[i].reduction;
									str = '已减满' + actData[i].reduction;
									break;
								}
							}
							storage.session('reducePriceAll', reducePriceAll);
							return str;
						}

					}
				}

			},
			async getReduceActivity() {
				// 满减商品
				let res = await http.getReduceActivity({
					data: {
						shopId: this.shopId,
					}
				});
				this.reduceActivity = res;
				let isWholeShare = res.isWholeShare;
				storage.session('isWholeShare', isWholeShare);
				let price = this.shopCarPrice;
				if (Number(price) > 0) {
					this.str = this.countStr(price);
				} else {
					this.str = this.countStr(-1);
				}

			},
		},
		components: {
			win: () => import( /* webpackChunkName: 'win' */ 'src/components/phone/win')
		},
		async mounted() {
			orderData = await import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;

			this.tagList = storage.session('tagList') || [];
			this.isEmpty = !!this.tagList.length;
			utils.setTitle('多人点餐');

			pushHistory();
			window.addEventListener('popstate', () => {
				this.addTagCar(1);
				this.isClosePage = true;
			}, false);
			await this.getReduceActivity();
			this.str = this.countStr(this.shopCarPrice);
		}
	};
</script>
<style lang='less' scoped>
	@import '../../../res/css/base.less';

	.many-people {
		.setBox(10rem, 100%);
		margin: 0 auto;
		background-color: #fff;
		overflow: hidden;

		.header {
			.setBox(100%, 2.2rem);
			background-image: linear-gradient(90deg, #FEC205 0%, #FCAE02 100%);
			text-align: center;
			font-family: PingFangSC-Medium;

			.header-tip {
				.setBox(100%, .8667rem);
				line-height: .8667rem;
				font-size: .2933rem;
				color: #FFFFFF;
			}

			.header-btn {
				margin: 0 .32rem;
				.setBox(calc(100% - .64rem), 1.0667rem);
				line-height: 1.0667rem;
				font-size: .4rem;
				color: #FCAE02;
				background: #ffffff url(../../../res/images/add-tags.png) 3.0667rem center no-repeat;
				background-size: .48rem .48rem;
				border-radius: .0533rem;
			}
		}

		.content {
			.setBox(100%, calc(100% - 3.6267rem));
			position: relative;

			.not-tags {
				position: absolute;
				left: 50%;
				top: 20%;
				transform: translate(-50%, 0);
				.setBox(100%, 6.6667rem);
				background: url(../../../res/images/not-tags.png) .6667rem 0 no-repeat;
				background-size: 7.76rem 3.5467rem;
				text-align: center;
				padding-top: 4.2667rem;

				p:nth-child(1) {
					font-size: .4533rem;
					color: #333333;
					margin-bottom: .2667rem;
				}

				p:nth-child(2) {
					font-size: .3467rem;
					color: #ACACAC;
				}
			}

			.tags-list {
				margin: 0 .4rem;
				.setBox(calc(100% - .8rem), 100%);
				overflow-x: auto;
				-webkit-overflow-scrolling: touch;

				.tags {
					.setBox(100%, auto);
					min-height: 2.2667rem;
					border-bottom: .0133rem solid #E8E8E8;
					padding-top: .4933rem;

					.tags-header {
						display: flex;
						.setBox(100%, .6667rem);
						line-height: .6667rem;
						margin-bottom: .2133rem;

						.tags-number {
							background: #BC97FF;
							.setBox(.6667rem, .6667rem);
							border-radius: 50%;
							text-align: center;
							font-size: .4rem;
							color: #FFFFFF;
						}

						.tags-name {
							flex: 1;
							height: .6667rem;
							text-indent: .2667rem;
							font-size: .4rem;
							color: #333333;

							.tags-edit {
								background: url(../../../res/images/tags-edit.png) center center no-repeat;
								background-size: .3867rem .3867rem;
								.setBox(.6667rem, .6667rem);
							}
						}

						.tags-operate {
							.setBox(3.2rem, .6667rem);
							font-size: 0;

							span {
								display: inline-block;
								.setBox(1.5067rem, .5333rem);
								line-height: .5333rem;
								font-size: .2933rem;
								border-radius: .0533rem;
								text-align: center;
								margin-top: .0667rem;
							}

							span:nth-child(1) {
								border: 1px solid #FCB203;
								color: #FCB302;
								margin-right: .1467rem;
							}

							span:nth-child(2) {
								border: 1px solid #CCCCCC;
								color: #CCCCCC;
							}
						}
					}

					.tags-content {
						padding-left: .9333rem;
						.setBox(100%, auto);

						.not-goods {
							font-size: .32rem;
							color: #ACACAC;
						}

						li {
							display: flex;
							height: .5333rem;
							line-height: .5333rem;
							font-size: .32rem;
							color: #ACACAC;

							span:nth-child(1) {
								flex: 2;
								.text-overflow;
							}

							span:nth-child(2) {
								flex: 1;
								text-align: right;
								.text-overflow;
							}

							span:nth-child(3) {
								flex: 1;
								text-align: right;
								.text-overflow;
							}
						}

						li:last-child {
							margin-bottom: .2667rem;
						}
					}
				}
			}
		}

		.order-car {
			height: 1.4267rem;
			line-height: 1.4267rem;
			width: 10rem;
			background-color: #fff;
			position: fixed;
			left: 50%;
			transform: translate(-50%, 0);
			bottom: 0;

			.car-icon {
				.setBox(1.8267rem, 100%);
				background: url(../../../res/images/latest-car-icon.png) no-repeat center center;
				background-size: 0.7467rem 0.7733rem;
				position: relative;

				.car-num {
					display: block;
					.setBox(0.3333rem, 0.3333rem);
					line-height: 0.3333rem;
					text-align: center;
					font-family: PingFangSC-Semibold;
					font-size: 0.1867rem;
					color: #ff2035;
					position: absolute;
					top: 0.6977rem;
					left: 0.9067rem;
				}

				&:after {
					content: "";
					position: absolute;
					top: 50%;
					right: 0;
					transform: translate(0, -50%);
					width: 0.0133rem;
					height: 0.96rem;
					background-color: #e1e1e1;
				}
			}

			.car-info {
				.setBox(2.483333rem, 100%);
				text-indent: 0.2rem;

				.car-empty {
					font-family: PingFangSC-Regular;
					font-size: 0.32rem;
					color: #8f8f8f;
					letter-spacing: 0;
				}

				.car-price {
					em {
						float: left;
						font-size: 0.2933rem;
						color: #ff2035;
					}

					font-family: PingFangSC-Medium;
					font-size: 0.4rem;
					color: #ff2035;
				}
			}

			.car-btn {
				.setBox(2.84rem, 100%);
				font-family: PingFangSC-Medium;
				font-size: 0.4rem;
				color: #ffffff;
				text-align: center;
				background-image: linear-gradient(90deg, #ffe082 0%, #fed781 100%);
				transition: all 0.3s;
			}

			.car-on {
				background-image: linear-gradient(90deg, #fec205 0%, #fcae02 100%);
			}
		}

		.win-content {
			padding: .4rem 0 .2667rem 0;

			input {
				background: #F8F8F8;
				border: .0133rem solid #CCCCCC;
				font-size: .3467rem;
				.setBox(calc(100% - .5334rem), .72rem);
				line-height: .72rem;
				text-indent: .1333rem;
				margin-bottom: .2667rem;
				margin: 0 .2667rem;
			}

			input::-webkit-input-placeholder {
				color: #C8C8CE;
			}

			p {
				font-size: .3467rem;
				color: #ACACAC;
				text-align: center;
				padding: 0 .9333rem;
			}
		}

		.win-title {
			font-size: .4533rem;
			color: #333333;
			text-align: center;
			margin-bottom: .4rem;
		}

		.tags:nth-child(1) .tags-header .tags-number {
			background: #FF6000;
		}
	}
</style>