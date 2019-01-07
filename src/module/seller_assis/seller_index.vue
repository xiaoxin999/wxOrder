<template>
	<section class='sellerIndex'>
		<header>
			<div>
				<div class="swiper-container">
					<div class="swiper-wrapper">
						<img v-if='bannerList.length' v-for="(item,i) in bannerList" class="swiper-slide" :key='i' :src="getUrl(item.image)" alt="">
						<img v-if='showBan' class="swiper-slide" src="../../res/images/sell_assis/banner.jpg" alt="">
					</div>
				</div>
			</div>
		</header>
		<section class='nav'>
			<ul>
				<li @click="toRouter('1')">
					<img src="../../res/images/sell_assis/crazy_buy.png" alt="">
					<div>疯抢</div>
				</li>

				<li @click="toRouter('2')">
					<img src="../../res/images/sell_assis/point_mall.png" alt="">
					<div>积分商城</div>
				</li>
				<li @click="toRouter('5')">
					<img src="../../res/images/sell_assis/rw_task.png" alt="">
					<div>任务</div>
				</li>
				<li @click="toRouter('3')">
					<img src="../../res/images/sell_assis/my_guide.png" alt="">
					<div>专属导购</div>
				</li>
				<li @click="toRouter('4')">
					<img src="../../res/images/sell_assis/user_center.png" alt="">
					<div>用户中心</div>
				</li>

			</ul>
		</section>
		<section class='bottom'>
			<section class='guide_card' v-if='isStaff'>
				<span class='title stor'>我的专属导购</span>
				<div class='content'>
					<img style='border-radius: 50%;' :src="guideInfo.imageUrl" alt="">
					<div class='right'>
						<div class='n'>
							<span class='name'>{{guideInfo.staffName}}</span>
							<span class='tag'> {{guideInfo.position=='1'?"店长":"店员"}}</span>
							<div style='margin-top:0.2rem;' class='star'>
								<star :levelList='levelConfig' :levelKey="'totalGold'" :backKet="'start'" :total='coinsTotal'></star>
							</div>
						</div>
						<div class='callCard' style='color:white' @click='showGuideDetail'>
							查看名片
						</div>
						<div style='transform: scale(0.9);transform-origin: 0 0;white-space: nowrap;margin-top:0.3rem;font-size:0.2667rem;color: #999999;transform:scale(0.8)'>您可以直接在"公众号界面"输入内容,与TA直接沟通</div>
					</div>
				</div>
			</section>
			<section class='mall'>
				<span class='title stor'>积分商城</span>
				<span class='goHome' @click="toRouter('2')">去首页>></span>
			</section>

			<section class='swip_con'>
				<div>
					<div class="mall-swiper-container">
						<div class="swiper-wrapper" style='text-align:center'>
							<div @click='clickInterDetail(item,item.id)' style='width:6.8rem;height:3.4rem' v-for="(item,i) in goodLists" class="swiper-slide" :key="'-' + i">
								<img style='border-radius:0.2rem' :src="getUrl(item.imageName)" alt="">
								<span><em style='color:#D0021B'>NO.{{i+1+'_ '}}</em>{{item.name}}</span>
								<span class='price_point' v-text="Number(item.cash)>0?item.price+'积分￥'+item.cash:item.price+'积分'"></span>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section class="mall xian">
				<span class="title stor">有奖任务</span>
				<span class="goHome" @click="toRouter('5')">查看更多</span>
			</section>
			<div v-for="(item,index) in taskList" :key="index">
				<section class="task" @click='toChooseShop(item)'>
					<div class="taskline">任务名称：{{item.taskName}}</div><span class="taskline_span">距结束：
						<b v-if="item.endTime-ts<24*60*60">{{toMin(item.endTime-ts)}}</b>
						<b v-else-if="item.endTime-ts>=24*60*60">{{toGetDay(ts,item.endTime)}}天</b>

					</span>
					<div class="tasklineTime">有效期至：{{getTimeDay(item.endTime)}}</div><span class="tasklineTime_span">{{item.taskNum - item.receiveNum}}人可参与</span>
				</section>
			</div>

			<section class='time' v-if='showDeatil'>
				<span v-if='!crazyStart'>距离疯抢开始还有{{countdownTime}}</span>
				<span v-if='crazyStart'>距离疯抢结束还有{{countdownTime}}</span>
			</section>
			<section v-else style='height:0.2667rem;background: #F8F8F8;'></section>
			<section class='buy'>
				<span class='title stor' style='margin:0.3rem'>疯抢</span>
				<span class='goHome' v-if='showDeatil&&this.showGoogsList.length' @click="toCrazyRobbey()">查看更多>></span>
				<div class='clear'></div>
				<ul v-if='showDeatil'>
					<li v-for="(item,index) in showGoogsList" :key='index' @click="toCrazyRobbey(item)">
						<div>
							<img style='border-radius:0.2rem' :src="getUrl(item.listImage)" alt="">
							<div style='border-radius:0rem 0rem 0.2rem 0.2rem' class='name'>{{item.name}}</div>
						</div>

						<div>
							<span class='price'>¥{{item.price}}</span><br>
							<span class='lastprice'>¥{{item.originalPrice}}</span>
						</div>
					</li>
				</ul>
				<div class='noinfo' style='width:2rem;position:relative;left:0;right:0;margin: auto' v-if='!showDeatil||!this.showGoogsList.length'>
					<img style='width:2rem;' src="../../res/images/sell_assis/noinfo_tips.png" alt="">
					<div style='text-align:center;font-size: 0.32rem;color: #999999;margin-top:0.1rem'>{{!this.showGoogsList.length ? "无疯抢商品":"敬请期待..."}}</div>
				</div>

			</section>
			<div class='button' @click='clickTip' v-if='showBuying&&this.showGoogsList.length&&showDeatil' :class='{no:isBuying,yes:!isBuying}'>
				<span v-if='isBuying'>✔&nbsp;已开启</span>
				<span v-if='!isBuying'>开启疯抢提醒</span>
			</div>
		</section>
	</section>
</template>


<script>
	import global from 'src/manager/global';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import timer from 'src/verdor/timer';
	import storage from "src/verdor/storage";
	// let ts = Math.round(new Date().getTime()/1000);
	// console.log(ts,'ts');

	export default {
		data() {
			return {
				ts: null,
				isBuying: false,
				currentTime: 0,
				countdownTime: 0,
				countEndTime: 0,
				timeStr: "",
				goodsList: [],
				taskList: [],
				showGoogsList: ["", "", ""],
				guideData: {},
				userData: {},
				staffData: {},
				coinsTotal: 0, //累计金币
				level: 0,
				goodLists: [],
				bannerList: [],
				showBan: false,
				guideInfo: {},
				buyConfig: {},
				showBuying: true,
				allData: {},
				crazyStart: false,
				isStaff: false, //是否拥有导购
				haveTime: 0,
				haveEndTime: 0, //距离疯抢结束的时间
				showDeatil: true, //判断疯抢活动是否开启状态
				staffFansId: storage.session('login').staffFansId,
				levelConfig: [],
				img: '',
				shopList: [],
				pointStyle: 1,
			}
		},
		methods: {
			toMin(time) {
				return utils.format(new Date(Number(time) * 1000), 'hh:mm');
			},
			/*获取当前的时间戳*/
			toGetDay(startTime, endTime) {
				return utils.getDay(startTime, endTime);
			},
			getTimeDay(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd hh:mm');
			},
			/* 进入积分商品详情 */

			clickInterDetail(item, id) { //如果是品牌--->详情

				storage.session('goodsInfo', item);
				if (this.pointStyle == 1) {
					this.$router.push({
						path: '/detail',
						query: {
							comId: id,
							type: item.type,
							d: 1
						}
					}); //type 0 品牌 1 门店

				} else {
					this.$router.push({
						path: "/mallGoodsDetail",
						query: {
							comId: id,
							type: item.type,
							code: 2,
							d: 1
						}
					});
				}

			},
			async comList() {
				let data = await http.getListByWeixin({
					data: {
						shopId: this.shopId,
						page: 1,
						num: 20
					}
				})
				this.goodLists = data.list;
				console.log(this.goodLists, 'goodsLists');
			},

			getUrl(url) {
				return global.getImgUrl({
					url
				})
			},
			/* 展示我的专属导购 */
			showGuideDetail() {
				// storage.session("guide_detail",this.guideData);
				this.$router.push({
					path: "/shoppingGuide",
					query: {
						id: this.staffFansId
					}
				});
			},
			/* 前往疯抢页面 */
			toCrazyRobbey(item) {
				storage.session("seller_index_data", this.allData);

				let obj = {
					path: '/chooseshop'
				};
				if (item) {
					Object.assign(obj, {
						query: {
							id: item.id
						}
					})
				}
				this.$router.push(obj)
			},
			/* 开启或关闭疯抢提示 */
			async clickTip(e) {
				this.isBuying = !this.isBuying;
				let data = await http.crazyGoodsSubscribe({
					data: {
						shopId: global.getShopId()
					}
				})
				if (data) {
					this.$store.commit("setWin", {
						content: `${this.isBuying?"开启":"关闭"}疯抢提示成功`
					})
				}
			},
			/* 切换路由 */
			toRouter(id) {
				switch (id) {
					case "1":
						storage.session("seller_index_data", this.allData);
						this.$router.push("/chooseshop");
						break;
					case "2":
						if (this.pointStyle == 1) {
							this.$router.push("/intergralMall");
						} else {
							this.$router.push({
								path: "/newIntegralmall",
								query: {
									code: 2
								}
							})
						}
						break;
					case "3":
						if (!this.isStaff) {
							this.$router.push("/notHaveShoppingGuide");
							return;
						}
						// storage.session("guide_detail",this.guideData);
						this.$router.push({
							path: "/shoppingGuide",
							query: {
								id: this.staffFansId
							}
						});
						break;
					case "4":
						storage.session("guide_detail", this.guideData);
						this.$router.push("/userCenter");
						break;
					case "5":
						// storage.session("guide_detail",this.guideData);
						this.$router.push("/taskList");
						break;

				}
			},
			async getUserInfo() {
				let data = await http.getUserInfo({
					data: {
						from: 0,
						type: 3,
						shopId: global.getShopId()
					}
				})
				this.shopList = data.shopList;

				storage.session('userInfo', data);
				storage.session('wxInfo', data);
				storage.session('shopList', this.shopList);
				return data.shopList;
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
							this.showDetail = false;
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

				}, 1000, 0, true)
			},
			toChooseShop(item) { //跳选择店铺
				item.begin = 0;
				let applyShopIds = item.applyShopIds.split(',');
				storage.session('arrApplyShopIds', applyShopIds);
				storage.session('shopList');
				storage.session('taskDetail', item);
				this.$router.push({
					path: "/chooseTaskStore",
					query: {
						taskId: item.id
					}
				});
			},
			/* 时间转换 */
			getTime(second_time) {

				var time = parseInt(second_time) + "秒";
				var second = parseInt(second_time) % 60;
				var min = parseInt(second_time / 60) % 60;
				var hour = parseInt(parseInt(second_time / 60) / 60) % 24;
				var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
				time = ("00" + day).substr(-2) + "天" + ("00" + hour).substr(-2) + "小时" + ("00" + min).substr(-2) + "分" + ("00" + second).substr(-2) + "秒";

				return time;
			},
			async getInfo() {
				let data = await http.getHomePage({
					data: {
						shopId: global.getShopId()
					}
				}, false, true);
				console.log(data, 'data');
				this.ts = data.time;
				this.currentTime = data.time;
				this.allData = data;
				data = data.data;

				this.bannerList = data.carousel;
				/* 轮播图 */
				if (this.bannerList.length == 0) this.showBan = true;
				this.$nextTick(function() {
					new this.Swiper('.swiper-container', {
						pagination: '.swiper-pagination',
						autoplay: 6000
					});
				})
				/* 任务列表 */
				this.taskList = data.taskList.slice(0, 2);
				this.taskList.forEach((item, index) => {
					let {
						coupon,
						pointCard,
						pointGoods
					} = item.couponIds;
					coupon = coupon.concat(pointCard, pointGoods);

					item.reward = coupon.map((item) => {
						return item.name + "  *  " + item.num;
					}).join(",");

				})
				storage.session('taskDetail', this.taskList);

				/* 我的导购 */
				this.guideData = data.myGuide;
				this.guideInfo = this.guideData.staffData;

				if (this.guideInfo.length == 0 || Object.values(this.guideInfo).length < 1) this.isStaff = false;
				this.isStaff = Boolean(Number(this.staffFansId)); // 没有导购 staffFansId为0

				this.levelConfig = utils.sortByAll(this.guideData.levelConfig, 'totalGold', true);
				// let index = 0;
				this.coinsTotal = this.guideInfo.coinsTotal;

				/* 积分商品 */
				let pointShop = data.pointShop;
				this.goodLists = pointShop.slice(0, 3);
				this.$nextTick(() => {

					let space = 30;
					var swiper = new Swiper('.mall-swiper-container', {
						slidesPerView: 1.4,
						spaceBetween: space,
						centeredSlides: true,
						pagination: {
							el: '.swiper-pagination',
							clickable: true,
						}
					});

					/* 以下为动态计算偏移量 */
					// let l = this.goodLists.length;
					// if(l==2){
					//     let offsetX = (utils.getWindowWH().w - space)/2;
					//     let c = null;

					//     if(c = swiper.container){
					//         c[0].children[0].style.transform = `translate3d(${l==2?0:-((offsetX)/1.5+space/1.5)}px, 0px, 0px)`
					//     }
					// }

				})

				/* 疯抢数据 */
				let grabGoods = data.grabGoods;

				if ((grabGoods && grabGoods.buyConfig && grabGoods.buyConfig.status == '0') || (grabGoods.buyConfig.endTime < Math.floor(Date.now() / 1000))) {
					this.showDeatil = false;
					return false;
				}
				this.showGoogsList = utils.deepCopy(grabGoods.goodsList).slice(0, 3); //首页展示的列表
				this.startTime = grabGoods.buyConfig.startTime;
				this.endTime = grabGoods.buyConfig.endTime;
				this.haveTime = this.startTime - this.currentTime; //距离疯抢开始
				this.haveEndTime = this.endTime - this.currentTime; //距离疯抢结束
				this.remindTime = grabGoods.buyConfig.remindTime;

				if (this.haveTime < 0) this.crazyStart = true;
				if (grabGoods.buyConfig) this.changeCountTime(this.haveTime, this.haveEndTime);

				/* 1.remindTime等于0
				   2.在开始抢购前remindTime的分钟内
				    将开启提示按钮隐藏,
				*/
				if (this.remindTime == 0 || (this.haveTime < this.remindTime * 60)) this.showBuying = false;

			}
		},
		components: {
			star: () =>
				import( /* webpackChunkName:"star" */ "src/components/star")
		},
		beforDestory() {
			timer.clear(this.timeStr);
		},
		async mounted() {

			this.pointStyle = storage.session('login').pointStyle;
			this.getUserInfo();
			this.Swiper = await import ( /* webpackChunkName: "swiper" */ 'src/verdor/swiper.min.js');
			this.Swiper = this.Swiper.default;
			this.getInfo();
			this.toMin();
			utils.setTitle('闪店卖手');


		}
	}
</script>

<style lang='less' scoped>
	@import '../../res/css/swiper.min.css';

	.stor {
		font-family: PingFang-SC-Medium;
		font-size: 0.32rem;
		color: #030303;
		font-weight: bold
	}

	.sellerIndex {

		header {
			position: relative;
			padding-top: 4rem;

			&>div {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
			}

		}

		.nav {
			height: 2.5rem;
			background-color: white;
			padding: 0 0.8rem;

			ul {
				height: 100%;
				text-align: center;
				display: table;
				width: 100%;
				font-size: 0.32rem;
				font-family: PingFang-SC-Medium;
				color: #555555;

				li {
					display: table-cell;
					height: 100%;
					vertical-align: middle;

					img {
						width: 1.173rem;
						height: 1.173rem;
					}
				}
			}
		}

		.swiper-wrapper img {
			width: 100%;
			height: 4rem;
		}

		.bottom {
			margin-top: 0.3rem;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			background-color: white;

			.title {
				vertical-align: middle;
				padding-left: 0.5rem;
				line-height: 0.8rem;
			}

			.title:before {
				content: ".";
				color: rgb(234, 192, 71);
				font-size: 30px;
				position: absolute;
				margin-top: -0.28rem;
				margin-left: -0.3rem;
			}

			.guide_card {
				width: 9.28rem;
				height: 3.2rem;
				margin: 0 auto;
				border-radius: 0.1rem;
				border: #ccc solid 1px;
				margin-bottom: 0.3rem;


				.content {
					width: 90%;
					margin: 0 auto;
					height: 70%;
					margin-top: 0.25rem;

					img {
						width: 1.7rem;
						height: 1.7rem;
					}

					div.right {
						display: inline-block;
						margin-left: 0.5rem;
						height: 1.7rem;
						vertical-align: top;
						width: 71%;

						div.n {
							display: inline-block;
							vertical-align: top;

							span.name {
								font-size: 0.4rem;
							}

							.star {
								img {
									width: 0.32rem;
									height: 0.32rem;
								}
							}

							span.tag {
								display: inline-block;
								margin-left: 0.1rem;
								width: 0.82rem;
								border: 1px solid #D0021B;
								border-radius: 0.1rem;
								text-align: center;
							}
						}

						.callCard {
							width: 2.18rem;
							height: 0.84rem;
							background-color: rgb(234, 192, 71);
							border-radius: 1.33rem;
							line-height: 0.8rem;
							text-align: center;
							float: right;
						}
					}
				}
			}

			.mall {
				margin-top: 0.15rem;
				width: 9.28rem;
				margin: 0 auto;

				.goHome {
					line-height: 0.8rem;
					float: right;
					margin-top: 0.01rem;
					color: #aaa;
				}

				.img {
					border-radius: 0.2rem;
				}
			}

			.task {
				clear: both;
				min-height: 1.868rem;
				border-bottom: 1px solid #eaeaea;
				width: 92%;
				margin: 0 auto;
				padding: 0.2rem 0 0.2rem 0;

				.taskline {
					width: 68%;
					padding: 1% 0% 1% 4%;
					float: left;
				}

				.taskline_span {
					/* width: 30%; */
					display: inline-block;
					float: right;
					text-align: right;
					padding: 1% 0% 1% 0;
					color: #999;

					b {
						color: #EAC048;
					}

				}

				.tasklineTime {
					width: 68%;
					padding: 1% 0 1% 4%;
					float: left;
					color: #999;
				}

				.tasklineTime_span {
					width: 30%;
					display: inline-block;
					float: right;
					text-align: right;
					padding: 1% 6% 1% 0;
					color: #999;
				}
			}

			.swip_con {
				overflow: hidden;
				width: 100%;
				position: relative;
				padding-top: 4.7rem;

				&>div {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;

					.price_point {
						position: absolute;
						left: 0;
						top: 0.5rem;
						/* width: 3.0267rem; */
						height: 0.4533rem;
						background: rgba(0, 0, 0, 0.4);
						font-size: 0.32rem;
						color: #FFFFFF;
						line-height: 0.4533rem;
						padding: 0 0.2rem;
					}
				}
			}

			.time {
				background: linear-gradient(to right, #5E5E63, #1D1D1D);
				/* 标准的语法 */
				height: 0.8rem;
				text-align: center;
				line-height: 0.8rem;
				font-size: 0.35rem;
				color: #FFFFFF;
				margin-top: 0.3rem;
			}

			.buy {
				background-color: white;
				margin-top: 0.3rem;
				position: relative;

				.goHome {
					line-height: 0.8rem;
					color: #aaa;
					margin-right: 10px;
					position: absolute;
					right: -0.1rem;
				}

				ul {
					display: flex;
					align-items: center;
					width: 100%;

					li {
						flex: 1;
						vertical-align: middle;
						text-align: center;
						list-style: none;
						height: 100%;
						padding-top: 3.09rem;
						position: relative;

						&>div:first-child {

							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							margin: 0 auto;

							.name {
								position: relative;
								background: rgba(0, 0, 0, 0.6);
								height: 0.8rem;
								width: 2.69rem;
								left: 0;
								right: 0;
								bottom: 0.86rem;
								margin: 0 auto;
								color: white;
								line-height: 0.8rem;
								text-overflow: ellipsis;
								overflow: hidden;
								white-space: nowrap;
							}

							img {
								width: 2.69rem;
								height: 3.09rem;
							}
						}

						&>div:nth-child(2) {
							padding-top: 0.3rem;
						}

						.price {
							font-size: 0.30rem;
							color: #D0021B;
						}

						.lastprice {
							font-size: 0.24rem;
							color: #999999;
							text-decoration: line-through;
						}
					}
				}
			}

			.button {
				width: 2.69rem;
				height: 0.84rem;
				border-radius: 1.25rem;
				font-size: 0.35rem;
				margin: 0 auto;
				margin-top: .5rem;
				line-height: 0.84rem;
				text-align: center;
			}

			.yes {
				background-color: #EAC048;
			}

			.no {
				background: #999999;
			}
		}
	}

	.xian {
		border-bottom: 1px solid #eaeaea;
		margin-bottom: 0.2rem;
	}
</style>