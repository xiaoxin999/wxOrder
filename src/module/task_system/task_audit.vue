<template>
	<div class="tast_detail" v-if="isShow">
		<div class="box">
			<header>
				<div class="subHeadTitle">
					<span>{{item.taskName}}</span>
				</div>
				<div class="cut_apart"></div>
				<div class="map" v-if="item.shopInfo">
					<span class="address"><img src="../../res/images/task_address.png" alt=""></span>
					<a :href="mapUrl" class="address">{{this.item.shopInfo.address}}</a>
					<!-- <a class="iphone" :href="'tel:' + shopTelephone"> <img src="../../res/images/task_iphone.png" alt=""></a>   -->
				</div>
				<div class="cut_apart" style="margin-bottom: .72rem;"></div>
			</header>
			<div class="task_type">
				<div><b>● </b> 任务类型 : {{typeList[item.type]}}<br>
					<b>● </b> 任务奖励 : {{item.reward}}<br>
					<b>● </b> 任务期限：{{getTimes(item.durationTime)}}</div>
				<p v-if="item.type == '2'"><a :href="item.shareUrl" class="link">点此链接</a>，右上角分享至朋友圈达成任务</p>
			</div>
			<div class="cut_apart"></div>
			<div class="taskDes">
				<p>———— 任务介绍 ———— </p>
				<div class="spanDescribe" v-html='item.describe'></div>
			</div>
		</div>
		<div class="footer">
			<div class="cut_apart" style="margin-bottom: .4667rem;"></div>
			<a href="#" class="draw_task" @click="taskVerificationSheet('0')">确认核销</a>
		</div>
		<win :width="280" :height='135' :type="'alert'" :ok="okObj" @winEvent='winEvent' v-if="isShowWin">
			<div slot="content" class='content'>
				<img src="../../res/images/sell_assis/success.png" alt="">
				<div>核销成功</div>
				<p>该任务已经达成</p>
			</div>
		</win>
	</div></template>
<script>

	import utils from "src/verdor/utils";
	import http from "src/manager/http";
	import storage from 'src/verdor/storage';
	import global from 'src/manager/global';

	let fansId = utils.getQueryString('fansId') || '100001';
	let fansTaskId = utils.getQueryString('fansTaskId') || '6';

	export default {
		data() {
			return {
				item: {},
				shopId: global.getShopId(),
				typeList: {
					'0': '店内任务',
					'1': '消费任务',
					'2': '分享任务'
				},
				isShow: false,
				isShowWin: false,
				okObj: {
					content: '确认'
				},
				shopList: [],
				mapUrl: '',
				userInfo: '',
				shopdizhi: '', //getuserInfo 地址
				phone: '', //电话
			}
		},
		methods: {
			async taskVerificationSheet(checkPermission = 1) {
				let data;
				try {
					data = await http.taskVerificationSheet({
						data: {
							'fansId': fansId,
							'fansTaskId': fansTaskId,
							'checkPermission': checkPermission,
							'shopId': this.shopId
						}
					}, true);
					if (checkPermission == 0 && data) {
						this.isShowWin = true;
					} else {
						this.item = data;
						this.item.describe = this.item.describe.replace(/<img/g,"<img noDefault='true'");
						this.mapUrl = `http://api.map.baidu.com/geocoder?address=${this.item.shopInfo.address}&output=html&src=闪店卖手`;
						let {
							coupon,
							pointCard,
							pointGoods
						} = this.item.couponIds;
						coupon = coupon.concat(pointCard, pointGoods);

						this.item.reward = coupon.map((item) => {
							return item.name + "  *  " + item.num;
						}).join(",");
					}
				} catch (e) {
					if (e.error) {
						this.$store.commit("setWin", {
							content: e.error.message,
							callBack: () => {
								this.$closeWindow();
							}
						})
					}
				}
				this.isShow = true;
			},
			winEvent(str) {
				this.$closeWindow();
			},
			getTimes(times) {
				return utils.getMinuteDay(times);
			},
			transformation(text) {
				return global.line2br(text);
			},
			async get(shopId) {
				let loginInfo = storage.session('login');
				let res = await http.getUserInfo({
					data: {
						shopId: shopId,
						type: 3,
						from: 0
					}
				})
				Object.assign(res, loginInfo);
				this.shopList = res.shopList;
				console.log(res, 'res');
				this.shopList.map((item) => {
					if (this.$route.query.shopId == item.id) {
						this.shopdizhi = item.address;
						this.phone = item.telephone;
					}
					return item;
				})

				storage.session('wxInfo', this.shopList);
			}
		},
		components: {
			'win': () =>
				import ( /* webpackChunkName: "win" */ 'src/components/phone/win')
		},
		async mounted() {
			let userInfo = storage.session('wxInfo');
			if (!this.userInfo) {
				await this.get(global.getShopId());
			}
			this.taskVerificationSheet();

			console.log(this.item.shopInfo, 'this.item.shopInfo');
			console.log(this.item.shopInfo.address, 'this.item.shopInfo.address');
			utils.setTitle("任务核销");
		}
	}
</script>
<style lang="less" scoped>
	@import '../../res/css/base.less';

	.tast_detail {
		.setBox(10rem, 100%);
		min-height: 100%;
		margin: 0 auto;
		overflow: hidden;
		background-color: #fff;

		.subHeadTitle {
			.setBox(100%, .6667rem);
			line-height: .6667rem;
			font-size: 0;

			span {
				display: inline-block;
				font-size: .4267rem;
				color: #303030;

				&:nth-child(1) {
					.setBox(65%, 100%);
					text-indent: 4%;
					.text-overflow;
				}

				&:nth-child(2) {
					.setBox(35%, 100%);
					.text-overflow;
				}

				em {
					font-size: .4rem;
					color: #8e8383;
				}
			}
		}

		.cut_apart {
			width: 100%;
			background: #f2f2f2;
			background-size: 8.9067rem .04rem;
			.setBox(100%, auto);
			height: 0.12rem;
			margin: 0.2rem 0 0.2rem 0;
		}

		.map {
			.setBox(100%, .9333rem);
			font-size: .4rem;

			span {
				display: block;
				.setBox(100%, .9333rem);
				line-height: .9333rem;
				color: #303030;
				text-indent: .4rem;
			}
		}

		span.address {
			height: 1.4rem;
			line-height: 1.4rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 0.3467rem;
			color: #333;
			display: inline-block;
			float: left;
			width: 1.4rem;

			img {
				width: 32%;
			}
		}

		a.address {
			width: 6rem;
			height: 0.9333rem;
			line-height: .9333rem;
			float: left;
			text-align: left;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 0.3467rem;
			color: #333;
		}

		.iphone {
			width: 1.46rem;
			float: right;
			height: 1.4rem;
			line-height: 1.4rem;

			img {
				width: 40%;
			}
		}

		.task_type {
			.setBox(100%, auto);
			margin-bottom: .4533rem;
			color: #303030;
			font-size: .4rem;
			text-align: center;
			line-height: .7067rem;
			color: #303030;

			b {
				color: #EAC048;
				font-size: 0.08rem;
			}

		}

		.task_type div {
			width: 100%;
			// float: left;
			text-align: left;
			font-size: 0.34rem;
			color: #303030;
			padding: 0 4%;
			line-height: 0.8rem;
		}

		;

		.tast_info {
			height: 6667rem;
			font-size: .4rem;
			text-align: center;
			margin-bottom: .4533rem;

			p:nth-child(1) {
				color: #303030;
				margin-bottom: .4267rem;
			}

			p:nth-child(2) {
				color: #999999;
				line-height: .6933rem;
			}
		}

		.draw_task {
			background: #EAC048;
			border-radius: 1.3333rem;
			font-size: .48rem;
			color: #FFFFFF;
			.setBox(4.5067rem, 1.04rem);
			line-height: 1.04rem;
			text-align: center;
			margin-left: 50%;
			transform: translate(-50%, 0);
			margin-bottom: .9333rem;
		}

		.content {

			width: 80%;
			margin: 0.5rem auto;
			text-align: center;

			img {
				width: 1rem;
				height: 1rem;
			}

			&>div {
				margin-top: 0.32rem;
			}

			&>p {
				font-size: .3467rem;
				color: #999999;
				margin-top: 0.22rem;
			}
		}

		.footer {
			width: 100%;
			height: 3rem;
			background-color: #fff;
			position: fixed;
			bottom: 0;
		}

		.box {
			    padding: 0 .36rem;
				padding-top: .5067rem;
				background-color: #ffffff;
				height: calc(100% - 2.8rem);
				overflow: auto;
		}
	}

	.taskDes {
		width: 100%;

		p {
			text-align: center;
			width: 100%;
			color: #999;
			margin: 0.4rem 0 0.4rem 0;

			span {
				width: 80%;
				display: inline-block;
				margin: 0 auto;
			}
		}

	}

.spanDescribe {
		display: block;
		width: 100%;
		padding: 0.5rem 4%;
	}
</style>

<style>
	.spanDescribe img {
		width: 100%;
	}
</style>