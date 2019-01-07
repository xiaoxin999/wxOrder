<template>
	<section class='goodsDetail'>
		<header>
			<div>
				<div class='swiper-container'>
					<div class='swiper-wrapper'>
						<img :key='index' v-for='(item,index) in imageList' v-if='item.type == 0' class='swiper-slide' :src='getUrl(item.image)' alt=''>
					</div>
				</div>
			</div>

		</header>

		<section class='goodsImg'>

			<div class='retime' v-if='!crazyStart'>距离疯抢开始还有{{countdownTime}}</div>
			<div class='retime' v-if='crazyStart'>距离疯抢结束还有{{countdownTime}}<br />订单{{passTime}}分钟内未支付，将自动取消!</div>
			<ul>
				<li>{{detail.name}} <span>仅剩{{tureSpareStock}}件</span></li>
				<li>原价：￥{{detail.originalPrice}} <span>限时价 <b>￥{{detail.price}}</b></span></li>
			</ul>
			<div class='buyexplain'>
				<p> <b>·</b>抢购说明</p>
				<p>每人最多可抢购1次哦~</p>
				<p> <b>·</b>重要声明</p>
				<p>{{statement}}</p>

			</div>
			<div class='buyexplain fs'>
				<p> <b>·</b>商品详情</p>
				<section>
					<div>
						<img :key='index' v-for='(item,index) in imageList' :src='getUrl(item.image)' v-if='item.type == 1' alt=''>
					</div>
				</section>
			</div>
		</section>
		<section class='bthBuy'>
			<span :class='{btnBuy_btn:true,gray:grayStatus,orange:orangeStatus}' @click='()=>{if(orangeStatus) toPay(detail,id)}'>{{this.showName}}</span>
		</section>
	</section>
</template>


<script>
	import utils from 'src/verdor/utils';
	import Timecount from 'src/verdor/timecount'
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';
	import global,{SQB_WX,SQB_ALI} from 'src/manager/global';
	import timer from 'src/verdor/timer';

	let wx_sdk = null;
	export default {
		mixins: [Timecount],
		data() {
			return {
				bannerList: [], //banner
				showBan: false,
				flag: false,
				detail: {},
				currentTime: 0,
				countdownTime: 0,
				timeStr: '',
				imageList: [],
				name: '',
				goodsId: '', //待支付商品id
				data: '',
				goodsId: '',
				goodsList: [],
				crazyStart: false,
				id: this.$route.query.id,
				haveTime: 0,
				haveEndTime: '',
				topaybtn: false,
				tobuytext: '立即购买',
				show: true,
				count: '',
				timer: null,
				qiangwan: '',
				stockList: [], //库存列表
				showName: '',
				tureSpareStock: '',
				surplusTime: '',
				grayStatus: true,
				orangeStatus: true,
				statement: '',
				passTime: '',
				shopId:''
			}
		},
		created() {
			this.getTime();
			this.getTimeSource();
		},
		methods: {
			// 支付
			toPay(detail, id) {
				let order = false;
				if (this.isOrder && this.info) {
					this.payWaitOrder(this.info);

				} else {
					this.ImmediateBuy()
				}
			},
			getOrderStatus() {

				if (this.crazyStart) {
					this.orangeStatus = true;
					this.grayStatus = false;
					this.showName = '立即抢购'
				} else {
					this.grayStatus = true;
					this.orangeStatus = false;
					this.showName = '立即抢购'
				}

				if (this.tureSpareStock == 0) {
					this.grayStatus = true;
					this.orangeStatus = false;
					this.showName = '已售罄';
				}

			},
			getUrl(url) {
				return global.getImgUrl({
					url
				})
			},
			goBack() {
				this.$router.go(-1);
			},
			// 抢购专栏，立即抢购
			async ImmediateBuy() {
				// let openId = storage.session('openId');
				let payType = utils.getQueryString('payType') || 'wx';
				let data = await http.grabGoods({
					data: {
						subShopId: this.shopId,
						shopId: global.getShopId(),
						payType: payType,
						goodsId: this.id,
						sqbData:JSON.stringify({
							id:this.id,
							hash:'goodsDetail'
						})
						// openId :openId
					}
				});
				this.data = data;

				
				this.wxPay();
				this.getGoodsList()
			},

			async payWaitOrder(item) {

				let payType = utils.getQueryString('payType') || 'wx';
				let data = await http.payWaitOrder({
					data: {
						shopId: global.getShopId(),
						payType: payType,
						oid: item.oid,
						sqbData:JSON.stringify({
							id:this.id,
							hash:'goodsDetail'
						})
					}
				});

				this.data = data;
				this.wxPay();

			},
			wxPay() {

				/* 收钱吧 */
				if(this.data.payType == SQB_WX || this.data.payType == SQB_ALI){
					storage.session('goods_detail_data',this.data.oid);
				}
				wx_sdk.goPay({
					payData: this.data,
					payCallBack: (res) => {
						this.checkSuccess(res);
					}
				})

			},

			// 商品列表
			async getGoodsList() {
				let data = await http.getActivityShopGoodsList({
					data: {
						subShopId: this.shopId,
						shopId: global.getShopId()
					}
				}, false, true)
				this.currentTime = data.time;
				data = data.data;
	
				let {
					buyConfig,
					goodsList,
					stockList,
					imageList,
					orderList
				} = data;
				this.goodsList = goodsList;
				this.imageList = imageList;
				this.stockList = stockList;
				this.orderList = orderList;
				let index = 0;

				this.isOrder = false;
				this.showName = '立即购买';
				let time = parseInt(this.currentTime);

				let expireTime = data.buyConfig.expireTime;
				this.statement = data.buyConfig.statement;
				this.passTime = data.buyConfig.expireTime

				if (this.goodsList.length == 0) return;
				this.detail = this.goodsList.filter((item, i) => {
					if (item.id == this.id) {
						index = i;
						return true;
					}

					return false;
				})[0];

				let obj = this.stockList.filter((stock) => {
					return stock.goodsId == this.id
				})[0];

				if (obj) {
					this.tureSpareStock = obj.spareStock;
					this.grayStatus = false;
					this.orangeStatus = true;
				}
				if (obj.tureSpareStock == 0) {
					obj.grayStatus = true;
					obj.orangeStatus = false;

					obj.showName = '已售罄'
				}
				let ordeObj = this.orderList.filter((order) => {
					return order.goodsId == this.id
				})[0];
				console.log("4");
				if (ordeObj) {
					let surplusTime = parseInt(ordeObj.createTime) + parseInt(ordeObj.expireTime * 60) - time;

					if (surplusTime > 0) {
						this.isOrder = true;
						this.surplusTime = surplusTime;

						this.grayStatus = false;
						this.orangeStatus = true;
						this.showName = '待支付 ' + this.getTimeSource(surplusTime);
						this.info = ordeObj;

					}

				}

				this.startTime = data.buyConfig.startTime;
				this.endTime = data.buyConfig.endTime;
				this.haveTime = this.startTime - this.currentTime;
				this.haveEndTime = this.endTime - this.currentTime;
				this.stockList = data.stockList;
				this.orderList = data.orderList;
				this.remindTime = data.buyConfig.remindTime;

				if (this.haveTime < 0) this.crazyStart = true;
				if (data.buyConfig && !this.timeStr) this.changeCountTime(this.haveTime, this.haveEndTime);
console.log("5");
				for (var i = 0, len = imageList.length; i < len; i++) {
					let item = imageList[i];
					for (var j = 0; j < item.length; j++) {
						if (this.id == item[j].goodsId) {
							this.imageList.push(item[j]);
						}
					}
				}


				/* 轮播图 */
				// this.$nextTick(function() {

				// 	setTimeout(() => {
				// 		new this.Swiper('.swiper-container', {
				// 			pagination: '.swiper-pagination',
				// 			autoplay: 6000
				// 		});
				// 	},200)

				// })

				this.getOrderStatus();
				console.log("6");
			},
			checkSuccess(status){
				if (status) {
					this.$store.commit('setWin', {
						content: '支付成功',
						type: 'confirm',
						ok: {
							content: '确定'
						},
						cancel: {
							content: '查看订单'
						},
						callBack: (str) => {
							if (str == 'ok') {
								this.getGoodsList();
							} else if (str == 'cancel') {
								this.$router.push('/myOrder');
							} else if (str == 'close') {
								this.getGoodsList();
							}
						}
					});

				} else {
					this.$store.commit('setWin', {
						content: '支付失败'
					});
				}
			},
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

					if (this.isOrder == true) {
						this.surplusTime--;
						if (this.surplusTime > 0) {
							this.grayStatus = false;
							this.orangeStatus = true;
							this.showName = '待支付 ' + this.getTimeSource(this.surplusTime);
						} else {
							this.showName = '立即购买';
							this.isOrder = false;
						}

					}


				}, 1000, 0, true)

			}
		},
		beforDestory() {
			timer.clear(this.timeStr);
			this.imageList = [];
		},
		async mounted() {
			// this.toPay();

			this.Swiper = await import( /* webpackChunkName: 'swiper' */ 'src/verdor/swiper.min.js');
			this.Swiper = this.Swiper.default;

			let shopDetail = storage.session("shopDetail");
			this.shopName = shopDetail.shopName;
			this.shopId = shopDetail.shopId;

			this.id = utils.getQueryString('id') || this.$route.query.id;

			await this.getGoodsList();

			utils.setTitle('商品详情');

			let oid = storage.session('goods_detail_data');
			if(oid){
				storage.session('goods_detail_data',null);
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: oid,
						type:"grabGoodsPay"
					}
				})
				this.checkSuccess(d);
			}
			

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk')
			wx_sdk = wx_sdk.default;
			
			

		},
		destroyed() {

		}
	}
</script>

<style lang='less' scoped>
	@import '../../../res/css/swiper.min.css';

	.goodsDetail {

		header {

			position: relative;
			padding-top: 10rem;

			&>div {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
			}

		}

		.swiper-wrapper img {
			width: 100%;
			height: 10rem;
		}

		section.goodsImg {
			width: 100%;

			.retime {
				width: 100%;
				background: linear-gradient(-90deg, #1D1D1D, #5E5E63);
				text-align: center;
				color: #fff;
				// line-height: 0.6rem;
				padding: 0.086rem 0 0.086rem 0;
			}

			ul {
				height: 2rem;
				background: #fff;
				width: 100%;

				li:nth-child(1) {
					font-size: 0.44rem;
					color: #303030;
					font-weight: 600;
					height: 1rem;
					line-height: 1rem;
					width: 90%;
					margin: 0 auto;

					span {
						float: right;
						font-size: 0.36rem;
						color: #EAC048;
						font-weight: 500;
					}
				}

				li:nth-child(2) {
					font-size: 0.38rem;
					color: #999;
					height: 1rem;
					line-height: 1rem;
					width: 90%;
					margin: 0 auto;
					text-decoration: line-through;

					span {
						float: right;
						font-size: 0.36rem;
						color: #303030;
						font-weight: 600;

						b {
							color: #D0021B;
						}
					}
				}
			}

			.buyexplain {
				background: #fff;
				margin-top: 0.24rem;

				p {
					color: #303030;
					font-size: 0.4rem;
					font-weight: 600;
					//    height: 0.8rem;
					line-height: 0.8rem;

					b {
						color: #EAC048;
						display: inline-block;
						padding: 0 0.2rem;
						font-size: 0.6rem;
					}
				}

				p:nth-child(2) {
					color: #999;
					font-weight: 500;
					font-size: 0.36rem;
					line-height: 0.8rem;
					width: 87%;
					margin: 0 auto;
					text-align: justify;
				}

				p:nth-child(4) {
					color: #999;
					font-weight: 500;
					font-size: 0.36rem;
					line-height: 0.8rem;
					width: 87%;
					margin: 0 auto;
					text-align: justify;
				}

				section {
					// width: 100%;
					// margin-top: 0.2rem;
					margin-bottom: 2rem;

					img {
						width: 10rem;
						height: 10rem;
						// display: block;
					}
				}
			}

			.fs {
				margin-bottom: 2rem;

				section {
					padding-top: 5.5rem;
					position: relative;

					div {
						position: absolute;
						top: 0;
						padding-bottom: 2rem;
						background: #fff;

					}
				}
			}

		}

		.bottom {
			padding-top: 0.5rem;
			background-color: white;
		}
	}

	section.bthBuy {
		position: fixed;
		width: 100%;
		bottom: 4%;
		text-align: center;

		.gray {
			background: #999;

		}

		.orange {
			background: #EAC048;
		}
	}

	section .btnBuy_btn {
		width: 4.6rem;
		height: 1rem;
		font-size: .3467rem;
		color: #fff;
		border-radius: 100px;
		border: none;
		display: inline-block;
		line-height: 1rem;
	}
</style>