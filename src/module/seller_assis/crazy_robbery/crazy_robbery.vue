<template>
	<div class="container">
		<div v-show="!nodata">
			<div class="waitImage">
				<img :src="getUrl(waitImage)" v-if="!crazyStart" alt="等待图片">
				<img :src="getUrl(startImage)" v-else-if="crazyStart" v-show='ent' alt="开始图片">
				<img :src="getUrl(endImage)" v-show='!ent' alt="结束图片">
			</div>
			<div class="header" v-if='!crazyStart'>距离疯抢开始还有{{countdownTime}}</div>
			<div class="header" v-if='crazyStart'>距离疯抢结束还有{{countdownTime}}<br />订单{{passTime}}分钟内未支付，将自动取消!</div>
			<div class="content">
				<div class="box" v-for="(item, index) in goodsList" :key="index">
					<div class="img">
						<img :src="getUrl(item.showImage)" alt="" @click="toGoodsDetail(item,index,item.id)">
					</div>
					<div class="footer_operate">
						<div class="fl">
							<div class="fl top_box">
								<span>{{item.name}}</span>
								<span class="residual_quantity">仅剩{{item.tureSpareStock}}件</span>
							</div>
							<div class="fl">
								<span>限时价</span>
								<span class="discount_price">￥{{item.price}}</span>
								<span class="original_cost">￥{{item.originalPrice}}</span>
							</div>

						</div>
						<div class="fl">
							<span :class='{shopping_btn:true,gray:(!crazyStart||item.grayStatus)&&!item.showgrab,orange:(crazyStart ||item.orangeStatus) && item.showgrab}' @click="()=>{if(crazyStart || item.orangeStatus) toPay(item,index,id)}">{{item.showName}}</span>
                        </div>
					</div>
				</div>
			</div>
		</div>
		<div v-show="nodata">
			NoData
		</div>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import Timecount from 'src/verdor/timecount'
	import http from 'src/manager/http';
	import global, {
		SQB_WX,
		SQB_ALI
	} from 'src/manager/global';
	import timer from 'src/verdor/timer';
	import storage from 'src/verdor/storage';

	let wx_sdk = null;

	export default {
		mixins: [Timecount],
		data() {
			return {
				tobuy: true,
				crazyList: [],
				buyBtn: false,
				currentTime: Math.floor(Date.now() / 1000),
				countdownTime: 0,
				timeStr: "",
				goodsList: [], //商品列表
				paybtn: "",
				id: "", //商品id
				goodsId: "", //待支付商品id
				oid: "",
				payTime: 0,
				expireTime: "", //过期时间
				nodata: false,
				crazyStart: false,
				countdownTimepay: "", //过期倒计时时间,
				listImage: "",
				openId: "", // openId用于支付
				data: "", // 支付信息
				haveTime: 0,
				shopName: this.$route.query.shopName,
				shopId: this.$route.query.shopId,
				stockList: [], //库存列表
				orderList: [],
				waitImage: "",
				startImage: "",
				endImage: "",
				ent: true,
				timetime: "",
				haveEndTime: "",
				topaybtn: false,
                tobuytext: "立即购买", 
				show: true,
				count: '',
				timer: null,
				qiangwan: false,
				showName: "", 
				grayStatus: true,
				orangeStatus: true,
				surplusTime: "",
				passTime: "",
				grabNum:"",  //已经抢购的次数
				grabCount:"" //抢购上限
			}
		},
		created() {
			this.getTime();
			this.getTimeSource();
		},
		methods: {
			getUrl(url) {
				return global.getImgUrl({
					url
				})
			},
			// 点击立即购买 --->提示支付--->
			toPay(item, index, id) {
				let order = false;
				if (item.isOrder && item.info) {
					this.payWaitOrder(item.info);
					// this.grabGoods(item);
				} else {
					this.grabGoods(item);
				}
			},
			// getOrderStatus() {
			// 	if (this.crazyStart) {
			// 		this.orangeStatus = true;
			// 		this.grayStatus = false;
			// 		this.showName = "立即抢购"
			// 	} else {
			// 		this.grayStatus = true;
			// 		this.orangeStatus = false;
			// 		this.showName = "立即抢购"
			// 	}

			// 	if (this.tureSpareStock == 0) {
			// 		this.grayStatus = true;
			// 		this.orangeStatus = false;
			// 		this.showName = '已售罄';
			// 	}

			// 	if(this.showgrab){
			// 		if(this.grabNum >= this.grabCount){
			// 			this.grayStatus = true; 
			// 			this.orangeStatus = false;
			// 			this.showName = '已达抢购上限';
			// 		}
			// 		this.showgrab = true;
			// 	}
				
			// },
			//抢购完按钮变灰色
			 
			// 抢购专栏，立即抢购
			async grabGoods(item) {
				console.log(item, 'goodsIDITEM');
				this.goodsId = item.id;
				// let openId = storage.session('openId');
				let payType = utils.getQueryString('payType') || 'wx';
				let data = await http.grabGoods({
					data: {
						subShopId: this.shopId,
						shopId: global.getShopId(),
						payType: payType,
						goodsId: this.goodsId,
						sqbData: JSON.stringify({
							hash: 'crazyRobbery'
						})
						// openId :openId
					}
				});

				this.data = data;
				this.wxPay();
				this.getGoodsList()
			},
			getStock(id) {
				let obj = this.stockList.filter((item) => {
					return item.goodsId == id
				})[0];
				console.log(obj, 'obj');
				if (obj) {
					return obj.spareStock;
				}
				return 0;
			},
			toGoodsDetail(item, index, id) {
				this.$router.push({
					path: "/goodsDetail",
					query: {
						id
					}
				}); //商品详情页
			},
			// 获取该门店所有的活动商品列表

			async getGoodsList() {
				let listData = this.crazyList;
				listData = await http.getActivityShopGoodsList({
					data: {
						subShopId: this.shopId,
						shopId: global.getShopId()
					}
				}, false, true)
				this.waitImage = listData.data.buyConfig.waitImage;
				this.startImage = listData.data.buyConfig.startImage;
				this.endImage = listData.data.buyConfig.endImage;

				let expireTime = listData.data.buyConfig.expireTime;
				let time = parseInt(listData.time);
				this.goodsList = listData.data.goodsList.map((item) => {
					item.showName = "立即购买";
					item.isOrder = false;
					item.showgrab = true;
					item.surplusTime = parseInt(expireTime * 60);
					let obj = listData.data.stockList.filter((stock) => {
						return stock.goodsId == item.id
					})[0];
					if (obj) {
						item.tureSpareStock = obj.spareStock;
						item.grayStatus = true;
						item.orangeStatus = false;
					}
					if (item.tureSpareStock == 0) {
						item.grayStatus = true;
						item.orangeStatus = false;
						item.showName = '已售罄';
					}

			
					
					

					let ordeObj = listData.data.orderList.filter((order) => {
						return order.goodsId == item.id
					})[0];
					if (ordeObj) {
						let surplusTime = parseInt(ordeObj.createTime) + parseInt(ordeObj.expireTime * 60) - time;
						if (surplusTime > 0) {
							item.isOrder = true;
							item.surplusTime = surplusTime;
							item.grayStatus = false;
							item.orangeStatus = true;
							item.showName = "待支付 " + this.getTimeSource(surplusTime);
							item.info = ordeObj;
                        }
                       

                    }
                     if(item.grabNum >= item.grabCount){
						item.grayStatus = true;
						item.orangeStatus = false;
						item.showName = '已达抢购上限';
						item.showgrab = false;
					}
					
                    return item;
                    console.log(item)
				})

				this.startTime = listData.data.buyConfig.startTime;
				this.passTime = listData.data.buyConfig.expireTime;
				this.endTime = listData.data.buyConfig.endTime;
				this.haveTime = this.startTime - this.currentTime; //距离疯抢开始
				this.haveEndTime = this.endTime - this.currentTime; //距离疯抢结束
				this.remindTime = listData.data.buyConfig.remindTime;

				if (this.haveTime < 0) this.crazyStart = true;
				if (listData.data.buyConfig && !this.timeStr) this.changeCountTime(this.haveTime, this.haveEndTime);
			},



			async payWaitOrder(item) {
				// let openId = storage.session('openId');
				let payType = utils.getQueryString('payType') || 'wx';
				let data = await http.payWaitOrder({
					data: {
						shopId: global.getShopId(),
						payType: payType,
						oid: item.oid,
						sqbData: JSON.stringify({
							hash: 'crazyRobbery'
						})
						// openId :openId
					}
				});
				this.data = data;
				this.wxPay();

			},
			wxPay() {

				/* 收钱吧 */
				if (this.data.payType == SQB_WX || this.data.payType == SQB_ALI) {
					storage.session('crazy_robbery_data', this.data.oid);
				}
				// 改用wx 的goPay()
				wx_sdk.goPay({
					payData: this.data,
					payCallBack: (res) => {
						this.checkSuccess(res);
					}
				})
			},
			checkSuccess(status) {
				if (status) {
					this.$store.commit('setWin', {
						content: "支付成功",
						type: "confirm",
						ok: {
							content: "确定"
						},
						cancel: {
							content: "查看订单"
						},
						callBack: (str) => {
							if (str == 'ok') {
								this.getGoodsList();
							} else if (str == 'cancel') {
								this.$router.push("/myOrder");
							} else if (str == 'close') {
								this.getGoodsList();
							}
						}
					});

				} else {
					this.$store.commit('setWin', {
						content: "支付失败"
					});
				}
			},
			// async getOpenId(){
			//     this.openId = await this.getOpenId();
			// },

			/* 计算距离疯抢开始或者结束的倒计时 */
			changeCountTime(...arg) {

				let time = -1;
				let temp = 'start';

				/* 还没开始 */
				if (arg[0] > 0) {
					time = arg[0];
				}
				/* 已经开始还没结束 */
				else if (arg[1] > 0) {
					time = arg[1];
					temp = 'end';
				}

				let start = Number(time);

				if (start <= 0) return;

				this.timeStr = timer.add(() => {
					let t = --start;
					if (t <= 0) {

						if (temp == 'end') {
							this.showDetail = true;
						}
						this.crazyStart = true; //疯抢开始了
						timer.clear(this.timeStr);

						if (temp == 'start') {
							this.changeCountTime(...arg);
							this.crazyStart = true; //疯抢开始了
						}

					}
					this.countdownTime = this.getTime(t);
					if (this.remindTime == 0 || (t < this.remindTime * 60)) this.showBuying = false;

					this.goodsList = this.goodsList.map((item) => {
						if (item.isOrder == true) {
							item.surplusTime--;
							if (item.surplusTime > 0) {
								item.showName = "待支付 " + this.getTimeSource(item.surplusTime);
							} else {
								item.showName = "立即购买";
								item.isOrder = false;
							}

						} 
						return item;

					})

				}, 1000, 0, true)


			}
		},
		beforDestory() {
			timer.clear(this.timeStr);
		},
		async mounted() {
			// this.getOpenId();
			this.query = this.$route.query;
			let shopDetail = storage.session("shopDetail");
			this.shopName = shopDetail.shopName;
			this.shopId = shopDetail.shopId;
			this.getGoodsList();
			utils.setTitle(this.shopName);
			this.getStock();

			let oid = storage.session('crazy_robbery_data');
			if (oid) {
				storage.session('crazy_robbery_data', null);
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: oid,
						type:"grabGoodsPay"
					}
				})
				this.checkSuccess(d);
			}


			wx_sdk = await import( /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
			wx_sdk = wx_sdk.default;
		},
		beforeRouteLeave(to, from, next) {
			next()
			clearInterval(this.timetime)
		}
	}
</script>
<style lang="less" scoped>
	@import '../../../res/css/base.less';

	.container {
		.setBox(100%, auto);
		min-height: 100%;
		overflow: hidden;

		.header {
			width: 100%;
			background: linear-gradient(-90deg, #1D1D1D, #5E5E63);
			text-align: center;
			color: #fff;
			padding: 0.086rem 0 0.086rem 0;
		}

		.waitImage {
			img {
				width: 100%;
				max-height: 4rem;
				
				overflow: hidden;
			}

		}

		.content {
			margin-bottom: 1.6rem;

			.box {
				.setBox(100%, 5.68rem);
				padding: .36rem .4533rem;
				overflow: hidden;
				margin-bottom: 0.6rem;

				.img {
					.setBox(100%, 3.6rem);

					img {
						.setBox(100%, 100%);
					}
				}

				.footer_operate {
					.setBox(100%, 1.8667rem);
					padding: .16rem 0;
					box-sizing: border-box;

					>div:first-child {
						.setBox(6rem, 100%);
					}

					>div:last-child {
						.setBox(3.0667rem, 100%);
					}
				}

				.shopping_btn {
					border-radius: 1.3333rem;
					.setBox(auto, .8rem);
					min-width: 2.2rem;
					padding: 0 .2rem;
					line-height: .8rem;
					text-align: center;
					font-family: PingFang-SC-Medium;
					font-size: .3467rem;
					color: #FFFFFF;
					float: right;
					margin-top: 0.2rem;
				}


				.gray {
					background: #999;
				}

				.orange {
					background: #EAC048;
				}

				.residual_quantity {
					font-size: .32rem;
					color: #EAC048;
				}

				.top_box {
					.setBox(100%, .56rem);
					font-family: PingFang-SC-Medium;
					font-size: .4rem;
					color: #303030;
					margin-bottom: .0933rem;

					span {
						display: inline-block;
						width: 2.9rem;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}
				}

				.bottom_box {
					.setBox(100%, .6667rem);
					font-family: PingFang-SC-Medium;
					font-size: .32rem;
					color: #303030;

					span {
						display: inline-block;
					}
				}

				.discount_price {
					font-size: .48rem;
					color: #D0021B;
					padding: 0 .1067rem;
				}

				.original_cost {
					color: #999999;
					text-decoration: line-through;
				}

				.pending_payment {
					font-size: .2933rem;
					line-height: .4rem;
					.setBox(3.0667rem, .8rem);
				}
			}
		}
	}
</style>