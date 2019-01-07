<template>
	<div id="selfPay-detail">
		<div class="orderTop">
			<div class="orderTitle">
				<p>您的当前位置：{{areaNmae}}—{{tableName}}</p>
				<p>开始时间：{{transFormDates(createTime)}}</p>
				<p>人数：{{person}}</p>
				<p></p>
			</div>
			<div class="orderDetail">
				<div class="detailTitle">
					<span class="lineLeft"></span>
					<span class="dotLeft"></span>
					<span class="title">订单详情</span>
					<span class="dotRight"></span>
					<span class="lineRight"></span>
				</div>
				<div class="detailList" ref='detailList'>
					<!-- 无菜品数据 -->
					<div class="noList" v-if="order == '' ">
						暂无订单详情,请点单
					</div>
					<!-- 有菜品数据 -->
					<div class="detaList" ref='detaList' v-else>
						<!-- 打折菜 -->
						<div class="details" v-for="(item) in discountList" :key='item.goodsName'>
							<div class="dishNames">
								<p class="discountIcon"></p>
								<p class="dishName">{{item.goodsName}}<span v-if="item.taste">({{item.taste}})</span></p>
							</div>
							<p class="dishNum">x{{item.num}}</p>
							<div class="disPrice">
								<span class="originalPrice presentPrice">¥{{item.totalprice}}</span>
								<span class="presentPrices">¥{{item.price}}</span>
							</div>
						</div>
						<!-- 赠送菜品 单品 -->
						<div class="details" v-for="(item) in giftitemList" :key='item.goodsName'>
							<div class="dishNames">
								<p class="present"></p>
								<p class="dishName">{{item.goodsName}}<span v-if="item.taste">({{item.taste}})</span></p>
							</div>
							<p class="dishNum">x{{item.freeNum}}</p>
							<p class="disPrice presentPrice">¥{{item.totalprice}}</p>
						</div>
						<!-- 正常菜品 -->
						<div class="details" v-for="(item) in goodsList" :key='item.goodsName'>
							<div class="dishNames">
								<p class="dishName">{{item.goodsName}}<span v-if="item.taste">({{item.taste}})</span></p>
							</div>
							<p class="dishNum">x{{item.num}}</p>
							<p class="disPrice">¥{{item.price}}</p>
						</div>
						<!-- 赠送的套餐 -->
						<section v-for="(item,index) in giftPackage" :key='item.packageName'>
							<div class="details">
								<div class="dishNames">
									<p class="present"></p>
									<p class="dishName">(套餐){{item.packageName}}</p>
								</div>
								<p class="dishNum">x{{item.num}}</p>
								<p class="disPrice presentPrice">¥{{item.totalprice}}</p>
							</div>
							<div class="details" v-for="(attr,index1) in item.goods" :key="index+'_'+index1">
								<div class="dishNames">
									<p class="dishName">{{attr.name}}<span v-if="attr.taste">({{attr.taste}})</span></p>
								</div>
								<p class="dishNum"></p>
								<p class="disPrice">x{{attr.num}}</p>
							</div>
						</section>
						<!-- 打折的套餐 -->
						<section v-for="(item,index) in dispackageList" :key='item.packageName'>
							<div class="details">
								<div class="dishNames">
									<p class="discountIcon"></p>
									<p class="dishName">(套餐){{item.packageName}}</p>
								</div>
								<p class="dishNum">x{{item.num}}</p>
								<div class="disPrice">
									<span class="originalPrice presentPrice">¥{{item.totalprice}}</span>
									<span class="presentPrices">¥{{item.price}}</span>
								</div>
							</div>
							<div class="details" v-for="(attr,index1) in item.goods" :key="index+'_'+index1">
								<div class="dishNames">
									<p class="dishName">{{attr.name}}<span v-if="attr.taste">({{attr.taste}})</span></p>
								</div>
								<p class="dishNum"></p>
								<p class="disPrice">x{{attr.num}}</p>
							</div>
						</section>
						<!-- 正常套餐 -->
						<section v-for="(item) in packageList" :key='item.packageName'>
							<div class="details">
								<div class="dishNames">
									<p class="dishName">(套餐){{item.packageName}}</p>
								</div>
								<p class="dishNum">x{{item.num}}</p>
								<p class="disPrice">¥{{item.price}}</p>
							</div>
							<div class="details" v-for="(attr,index1) in item.goods" :key='index1'>
								<div class="dishNames">
									<p class="dishName">{{attr.name}}<span v-if="attr.taste">({{attr.taste}})</span></p>
								</div>
								<p class="dishNum"></p>
								<p class="disPrice">x{{attr.num}}</p>
							</div>
						</section>
					</div>
				</div>
				<div class="viewmore" data-text="查看更多" @click="getMore" v-if="moreStatus">查看更多</div>
				<div class="viewmoreup" @click="getUp" v-if="upStatus">点击收起</div>
			</div>
		</div>

		<div class="orderPay">
			<!-- 无菜品 -->
			<div class="payOrderBtn" v-if="order == '' ">
				<p class="onOrder" @click="toOrder">点单</p>
			</div>
			<!-- 有菜品 -->
			<div class="payOrderBtn" v-else>
				<p class="order" @click="toOrder">加单</p>
				<p class="onPay" @click="toPay">在线支付</p>
			</div>
			<div class="orderBottom">
				<span>由闪店科技提供服务</span>
				<span>021-6505-6389</span>
			</div>
		</div>

	</div>

</template>
<script>
	import orderHttp from 'src/module/order/data/order_http';
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';

	let tableId = utils.getQueryString('tableId');

	export default {
		data() {
			return {
				shopName: '', //店铺名称
				accessToken: '', //token
				moreStatus: false, //点击查看更多 
				upStatus: false, //点击收起
				detaListHeight: '', //列表的实际高度
				detailListHeight: '', //可视区域的高度
				areaNmae: '', //区域名称
				tableId: '', //桌台id
				tableName: '', //桌台名称
				areaId: '', //区域id
				person: '1', //人数
				oid: '', //订单id
				isTableStatus: '0', //
				order: [], //数据
				goodsList: [], //单品菜数据
				giftitemList: [], //赠送单品数据
				discountList: [], //打折菜品数据
				packageList: [], //套餐数据
				giftPackage: [], //赠送套餐数据
				dispackageList: [], //打折套餐数据
				createTime: new Date().getTime() //桌台创建的时间
			};
		},
		methods: {
			async getToken() {
				this.accessToken = storage.session('token');
				if (!storage.session('wechatShop')) {
					await orderHttp.getOpenId();
				}
				this.shopName = storage.session('wechatShop').shopName;
				this.checkTable();
			},

			getStatus: function() {
				if (this.$refs.detaList) {
					this.detaListHeight = this.$refs.detaList.offsetHeight;
					this.detailListHeight = this.$refs.detailList.offsetHeight;

					if (this.detaListHeight >= this.detailListHeight) {
						this.moreStatus = true;
					} else {
						this.moreStatus = false;
					}
				}
			},
			//点击加载更多
			getMore: function() {
				this.$refs.detailList.style.height = this.detaListHeight + 'px';
				this.moreStatus = false;
				this.upStatus = true;
			},
			getUp: function() {
				this.$refs.detailList.style.height = this.detailListHeight + 'px';
				this.moreStatus = true;
				this.upStatus = false;
			},
			async checkTable() {
				let data = await http.getTableDetail({
					data: {
						shopId: this.shopId,
						tableId: tableId
					}
				});

				let orderDetail = {};
				orderDetail.remind = data.remind; //下单成功提醒
				orderDetail.tableId = data.table.id;
				this.areaNmae = data.area.areaName; //获取区域名称
				orderDetail.tableName = data.area.areaName + '_' + data.table.tableName;
				this.tableName = data.table.tableName; //获取桌台名称 
				this.areaId = data.area.id; //区域id
				this.tableId = data.table.id; //桌台id
				this.order = data.orderDetail;
				if (data.order && data.order != '') {
					this.isTableStatus = data.order.status;
					orderDetail.oid = data.order.oid;
					orderDetail.createTime = data.order.createTime;
					this.oid = data.order.oid;
					storage.session('orderDetail', orderDetail);
					this.createTime = data.order.createTime; //桌台创建的时间
					this.person = data.order.person; //桌台人数
				} else {
					storage.session('orderDetail', orderDetail);
					this.toOrder();
					return false;
				}
				//数据处理 单品菜系
				if (!utils.isEmptyObject(data.orderDetail.goods)) {
					let arr = data.orderDetail.goods;
					//第一层循环
					for (let i = 0; i < arr.length; i++) {
						arr[i].num = Number(arr[i].num); //数量格式化
						arr[i].taste = ''; //新建一个口味字段
						//挑出赠菜
						if (Number(arr[i].freeNum) != 0) {
							arr[i].freeNum = Number(arr[i].freeNum);
							arr[i].totalprice = arr[i].freeNum * Number(arr[i].unitPrice);
							this.giftitemList.push(arr[i]);
						}

						//挑出正常菜品
						if (Number(arr[i].price) != 0 && Number(arr[i].price) >= Number(arr[i].unitPrice) * (Number(arr[i].num) - Number(arr[i].freeNum) - Number(arr[i].returnNum))) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].freeNum) - Number(arr[i].returnNum);
							this.goodsList.push(arr[i]);
						}
						//挑出打折菜
						if (Number(arr[i].price) != 0 && Number(arr[i].price) < Number(arr[i].unitPrice) * (Number(arr[i].num) - Number(arr[i].freeNum) - Number(arr[i].returnNum))) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].freeNum) - Number(arr[i].returnNum);
							arr[i].totalprice = arr[i].num * Number(arr[i].unitPrice);
							this.discountList.push(arr[i]);
						}
						//第二层循环
						for (let j = 0; j < arr[i].attr.length; j++) {
							//第三层循环
							for (let k = 0; k < arr[i].attr[j].name.length; k++) {
								arr[i].attr[j].name[k] = arr[i].attr[j].name[k].split(':');
								arr[i].taste += arr[i].attr[j].name[k][0] + ',';
							}
						}
						arr[i].taste = arr[i].taste.substring(0, arr[i].taste.length - 1);
					}
				}
				//套餐处理
				if (!utils.isEmptyObject(data.orderDetail.package)) {
					let brr = data.orderDetail.package;
					//第一层循环
					for (let i = 0; i < brr.length; i++) {
						brr[i].num = Number(brr[i].num); //数量格式化
						//挑出赠送套餐
						if (Number(brr[i].freeNum) != 0) {
							brr[i].freeNum = Number(brr[i].freeNum);
							brr[i].totalprice = brr[i].freeNum * Number(brr[i].unitPrice);
							this.giftPackage.push(brr[i]);
						}
						//挑出正常套餐
						if (Number(brr[i].price) != 0 && Number(brr[i].price) == Number(brr[i].unitPrice) * (Number(brr[i].num) - Number(brr[i].freeNum) - Number(brr[i].returnNum))) {
							brr[i].num = Number(brr[i].num) - Number(brr[i].freeNum) - Number(brr[i].returnNum);
							this.packageList.push(brr[i]);
						}
						//挑出打折套餐
						if (Number(brr[i].price) != 0 && Number(brr[i].price) < Number(brr[i].unitPrice) * (Number(brr[i].num) - Number(brr[i].freeNum) - Number(brr[i].returnNum))) {
							brr[i].num = Number(brr[i].num) - Number(brr[i].freeNum) - Number(brr[i].returnNum);
							brr[i].totalprice = brr[i].num * Number(brr[i].unitPrice);
							this.dispackageList.push(brr[i]);
						}
						//第二层循环
						for (let j = 0; j < brr[i].goods.length; j++) {
							brr[i].goods[j].taste = ''; //口味
							brr[i].goods[j].num = Number(brr[i].goods[j].num); //数量
							//第三层循环
							for (let k = 0; k < brr[i].goods[j].attr.length; k++) {
								//第四层循环
								for (let l = 0; l < brr[i].goods[j].attr[k].name.length; l++) {
									brr[i].goods[j].attr[k].name[l] = brr[i].goods[j].attr[k].name[l].split(':');
									//sd.log(brr[i].attr[j].name[k][0]);
									brr[i].goods[j].taste += brr[i].goods[j].attr[k].name[l][0] + ',';
								}
							}
							brr[i].goods[j].taste = brr[i].goods[j].taste.substring(0, brr[i].goods[j].taste.length - 1);
						}
					}
				}
				this.$nextTick(function() {
					this.getStatus();
					if (data.order.status == '4') {
						this.$store.commit('setWin', {
							content: '该桌台不可用,请联系服务员清台..'
						});
					}
				});
			},
			changeFormat: function(t) {
				t -= 0;
				if (t < 10) {
					return ('0' + t);
				} else {
					return (t + '');
				}
			},
			transFormDates: function(time) {
				time += '';
				if (time.length == 10) {
					time -= 0;
					time *= 1000;
				} else {
					time -= 0;
				}
				let date = new Date(time);
				return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ':' + this.changeFormat(date.getMinutes());
			},
			toOrder: function() {
				if (this.isTableStatus == '4') {
					this.$store.commit('setWin', {
						content: '该桌台不可用,请联系服务员清台..'
					});
					return false;
				}
				if (this.isTableStatus == '1') {
					this.$store.commit('setWin', {
						content: '您有订单待确认,请联系服务员确认..'
					});
					return false;
				}
				let orderInfo = {};
				orderInfo.status = this.isTableStatus;
				orderInfo.shopName = this.shopName;
				orderInfo.tableId = this.tableId;
				orderInfo.areaId = this.areaId;
				orderInfo.oid = this.oid;
				orderInfo.num = this.person;
				orderInfo.areaNmae = this.areaNmae;
				orderInfo.tableName = this.tableName;
				storage.session('orderInfo', orderInfo);
				storage.session('isWechatOrder', 1);
				storage.session('isSelectTable', 1);
				storage.session('isShowVipPrice', true);

				let {
					onlineStyle
				} = storage.session('login');
				let toRouter = (onlineStyle == '1') ? '/order' : '/latestOrder';
				this.$router.push(toRouter);
			},

			async toPay() {
				if (this.isTableStatus == '4') {
					this.$store.commit('setWin', {
						content: '该桌台不可用,请联系服务员清台..'
					});
					return false;
				}
				if (this.isTableStatus == '1') {
					this.$store.commit('setWin', {
						content: '您有订单待确认,请联系服务员确认..'
					});
					return false;
				}

				this.$router.push('/wechatPay');
			}
		},
		computed: {
			parseOk() {
				return this.$store.state.order.parseOk;
			}
		},
		beforeRouteEnter: (to, from, next) => {
			next();
			let path = from.path;
			if (path == '/order') {
				//关闭微信游览器
				this.$closeWindow();
			}
		},
		async mounted() {
			await this.getUserInfo();
			storage.session('channelType','0');
			this.getToken();
		}
	};
</script>
<style lang='less'>
	#selfPay-detail {
		font-size: .4rem;
		width: 100%;
		height: 100%;
		color: #333;
		background-color: #fff;
	}

	#selfPay-detail .orderTop {
		width: 100%;
		height: auto;

		background: #fff;
	}

	#selfPay-detail .orderTop .orderTitle {
		box-sizing: border-box;
		width: 100%;
		height: 3.33333rem;
		padding: .66667rem .86667rem 0rem;

		border-bottom: .14667rem #efeff4 solid;
		;
	}

	#selfPay-detail .orderTop .orderTitle p {
		line-height: .8rem;
	}

	#selfPay-detail .orderTop .orderDetail {
		box-sizing: border-box;
		padding: .53333rem .86667rem 2.66667rem;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle {
		line-height: 1.06667rem;

		position: relative;

		width: 2.8rem;
		height: 1.06667rem;
		margin: 0 auto;

		text-align: center;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle .lineLeft {
		position: absolute;
		top: 50%;
		left: -.8rem;

		width: 1.06667rem;
		height: .04rem;

		background: #979797;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle .dotLeft {
		position: absolute;
		top: 50%;
		left: .4rem;

		width: .04rem;
		height: .05333rem;

		border-radius: .02667rem;
		background: #979797;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle .title {
		font-size: .4rem;

		color: #979797;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle .dotRight {
		position: absolute;
		top: 50%;
		right: .4rem;

		width: .04rem;
		height: .05333rem;

		border-radius: .02667rem;
		background: #979797;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailTitle .lineRight {
		position: absolute;
		top: 50%;
		right: -.8rem;

		width: 1.06667rem;
		height: .04rem;

		background: #979797;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailList {
		position: relative;

		overflow-y: hidden;

		height: 7.33333rem;
		margin: .4rem 0rem 0 0;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .noList {
		font-size: .6rem;
		font-weight: bold;
		line-height: 1rem;

		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		width: 100%;
		height: 1rem;
		margin: auto;

		text-align: center;

		coor: #333;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details {
		line-height: 1.2rem;

		position: relative;

		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;

		margin-bottom: .2rem;

		align-items: center;
		-webkit-align-items: center;
		box-align: center;
		-moz-box-align: center;
		-webkit-box-align: center;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .dishNames {
		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;

		width: 4.66rem;
		margin-right: .3rem;

		align-items: center;
		-webkit-align-items: center;
		box-align: center;
		-moz-box-align: center;
		-webkit-box-align: center;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .dishNames .dishName {
		line-height: .64rem;

		display: -webkit-box;
		overflow: hidden;

		width: 4.89rem;

		text-overflow: ellipsis;

		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .discount {
		font-size: .26667rem;

		position: absolute;
		top: 40%;
		right: .04rem;

		color: #888;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .dishNames .present {
		width: .4rem;
		height: .4rem;
		margin-right: .13rem;

		background: url(../../../res/images/present.png) no-repeat;
		background-size: .4rem .4rem;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .dishNames .discountIcon {
		width: .6rem;
		height: .5rem;
		margin-right: .13rem;

		background: url(../../../res/images/discountIcon.png) no-repeat;
		background-size: .4rem .4rem;
		background-position: 0.1rem;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .dishNum {
		width: 1rem;
		margin-right: .4rem;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .disPrice {
		line-height: 2;

		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;
		flex-direction: column;

		text-align: center;

		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-moz-box-orient: vertical;
		-moz-box-direction: normal;
		-webkit-flex-direction: column;
		-webkit-justify-content: space-around;
		justify-content: space-around;
		-moz-box-pack: space-around;
		-webkit--moz-box-pack: space-around;
		box-pack: space-around;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .disPrice .originalPrice {
		font-size: .37rem;

		color: #333;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .disPrice .presentPrices {
		font-size: .26rem;

		color: #888;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .details .presentPrice {
		text-decoration: line-through;

		text-decoration-color: red;
		-moz-text-decoration-color: red;
		-webkit-text-decoration-color: red;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .text-gradient {
		font-size: .66667rem;

		position: relative;

		display: inline-block;
		;
	}

	#selfPay-detail .orderTop .orderDetail .detailList .text-gradient[data-text]::after {
		position: absolute;
		z-index: 2;
		left: 0;

		content: attr(data-text);

		color: #979797;
		background-image: -webkit-gradient(linear, center bottom, center top, from(#fff), to(#4e4e4e));
		-webkit-background-clip: text;

		-webkit-text-fill-color: transparent;
	}

	#selfPay-detail .orderTop .orderDetail .viewmore {
		font-size: .4rem;

		position: relative;

		width: 2.26667rem;
		margin: 0 auto;

		background: url(../../../res/images/viewmore.png) right no-repeat;
		background-size: .4rem .4rem;
		;
	}

	#selfPay-detail .orderTop .orderDetail .viewmore[data-text]::after {
		position: absolute;
		z-index: 2;
		left: 0;

		content: attr(data-text);

		color: #333;
		background-image: -webkit-gradient(linear, center bottom, center top, from(#fff), to(#4e4e4e));
		-webkit-background-clip: text;

		-webkit-text-fill-color: transparent;
	}

	#selfPay-detail .orderTop .orderDetail .viewmoreup {
		font-size: .4rem;

		position: relative;

		width: 2.26667rem;
		margin: 0 auto;

		background: url(../../../res/images/update.png) right no-repeat;
		background-size: .4rem .4rem;
		;
	}

	#selfPay-detail .orderPay {
		position: fixed;
		z-index: 999;
		bottom: 0;
		left: 0;

		width: 100%;
		height: 2.53333rem;

		background: #fff;
		;
	}

	#selfPay-detail .orderPay .payOrderBtn {
		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;

		box-sizing: border-box;
		padding: 0rem .62667rem .53333rem;

		-webkit-justify-content: space-around;
		justify-content: space-around;
		-moz-box-pack: space-around;
		-webkit--moz-box-pack: space-around;
		box-pack: space-around;
		align-items: center;
		-webkit-align-items: center;
		box-align: center;
		-moz-box-align: center;
		-webkit-box-align: center;
	}

	#selfPay-detail .orderPay .payOrderBtn .order,
	#selfPay-detail .orderPay .payOrderBtn .onPay {
		font-size: .48rem;
		line-height: 1.18667rem;

		width: 4.10667rem;
		height: 1.18667rem;

		text-align: center;
		;
	}

	#selfPay-detail .orderPay .payOrderBtn .order {
		color: #f5bf50;
		border: .01333rem #f5bf50 solid;
		border-radius: .13333rem;
		;
	}

	#selfPay-detail .orderPay .payOrderBtn .onPay {
		color: #fff;
		border-radius: .13333rem;
		background: #f5bf4f;
		background: -moz-linear-gradient(right, #f4cf81, #f5bf4f);
		background: -webkit-gradient(linear, left 0, right 0, from(#f4cf81), to(#f5bf4f));
		background: -o-linear-gradient(right, #f4cf81, #f5bf4f);
	}

	#selfPay-detail .orderPay .payOrderBtn .onOrder {
		font-size: .48rem;
		line-height: 1.18667rem;

		width: 8rem;
		height: 1.18667rem;
		margin: 0 auto;

		text-align: center;

		color: #fff;
		border: .01333rem #f5bf50 solid;
		border-radius: .13333rem;
		background: #f4ca73;
		background: -webkit-linear-gradient(left, #f4cf81, #f5bf4f);
		/* Safari 5.1 - 6.0 */
		background: -o-linear-gradient(right, #f4cf81, #f5bf4f);
		/* Opera 11.1 - 12.0 */
		background: -moz-linear-gradient(right, #f4cf81, #f5bf4f);
		/* Firefox 3.6 - 15 */
		background: linear-gradient(to right, #f4cf81, #f5bf4f);
		/* 标准的语法 */
	}

	#selfPay-detail .orderPay .orderBottom {
		font-size: .26667rem;

		box-sizing: border-box;
		padding: 0rem .62667rem .4rem;

		text-align: center;

		color: #cacacb;
		;
	}
</style>