<template>
	<div class="tast_detail">
		<div class="box">
			<header>
				<div class="subHeadTitle">
					<span>{{item.taskName}}</span>

				</div>
				<div class="cut_apart"></div>
				<div class="map">
					<span class="address"><img src="../../res/images/task_address.png" alt=""></span><a :href="mapUrl" class="address">{{this.item?this.item.shopAddress:this.shopdizhi}}</a>
					<a class="iphone" :href="'tel:' + shopTelephone"> <img src="../../res/images/task_iphone.png" alt=""></a>
				</div>
				<div class="cut_apart" style="margin-bottom: .72rem;"></div>
			</header>
			<div class="task_type">
				<div><b>●</b> 任务类型 : {{typeList[item.type]}}<br>
					<b>●</b> 任务奖励 : {{item.reward}}<br>
					<b>●</b> 任务期限：{{getTimes(item.durationTime)}}</div>

				<p v-if="item.type == '2'"><a :href="item.shareUrl" class="link">点此链接</a>，右上角分享至朋友圈达成任务</p>
			</div>
			<div class="cut_apart"></div>
			<div class="taskDes">
				<p>———— 任务介绍 ———— </p>
				<div class="spanDescribe" v-html='item.describe'></div>
			</div>
		</div>
		<div class="footer" v-if="item.begin == '0'">
			<div class="cut_apart" style="margin-bottom: .4667rem;"></div>
			<a href="javascript:void(0)" class="draw_task" @click="receiveTask">{{btnContent}}</a>
		</div>
		<win :width="280" :height='135' :type="'confirm'" :cancel="winCancel" :ok="winOk" @winEvent='winEvent' v-if="isShowWin">
			<div slot="content" class='content'>
				<img src="../../res/images/sell_assis/success.png" alt="">
				<div>领取成功</div>
				<p>快去行动完成任务,领取奖励吧！</p>
			</div>
		</win>
		<transition name='fade'>
			<section class='qrcode' v-if='showQr'>
				<div>
					<img class='qr' :src="codeUrl" alt="">
					<img class='close' @click='closeQr()' src="../../res/images/member_close.png" alt="">
				</div>
			</section>
		</transition>
	</div>
</template>
<script>

	import utils from "src/verdor/utils";
	import http from "src/manager/http";
	import global from "src/manager/global";
	import storage from "src/verdor/storage";

	let qrcode = null;
	let wx_sdk = null;
	export default {
		data() {
			return {
				item: {},
				typeList: {
					'0': '店内任务',
					'1': '消费任务',
					'2': '分享任务'
				},
				shopId: global.getShopId(),
				winCancel: {
					content: '关闭页面'
				},
				winOk: {
					content: '去查看'
				},
				isShowWin: false,
				mapUrl: '',
				btnContent: '领取任务',
				shopList: [],
				codeUrl: '',
				showQr: false,
				status: 0, // 0:领取任务,1:展示二维码,2分享
				userInfo: '',
				shopdizhi: '', //getuserInfo 地址
				phone: '', //电话
				shopAddress: this.item ? this.item.shopAddress : this.shopdizhi,
				shopTelephone: this.item ? this.item.telephone : this.phone,

			}
		},
		methods: {
			getTimes(times) {
				// 分钟转化为时间
				return utils.getMinuteDay(times);
			},
			async receiveTask() {
				// 领取任务
				if (this.status == 1) {
					this.closeQr(true);
					this.getCode();
				} else {
					let data = await http.receiveTask({
						data: {
							shopId: this.shopId,
							receiveShopId: this.$route.query.shopId,
							taskId: this.item.id
						}
					});

					if (data) {
						this.isShowWin = true;
					}
				}
			},
			async getCode() {
				// 生成二维码
				this.codeUrl = qrcode.getQrBase64(this.item.shortUrl + "?&r=" + Date.now(), {
					padding: 15,
					width: 300,
					height: 300,
					correctLevel: QRErrorCorrectLevel.L
				});

			},
			closeQr(type) {
				this.showQr = type ? true : false;
			},
			async tastShare() {
				let data = await wx_sdk.onMenuShareAppMessage({
					"type": this.item.shareAddress,
					"link": this.item.shareUrl,
					"imgUrl": "",
					"title": this.item.taskName,
					"desc": this.item.describe
				});
				if (data == 'ok') {
					this.$store.commit("setWin", {
						content: "分享成功",
						callBack: () => {
							this.shareTask();
						}
					});
				} else {
					this.$store.commit("setWin", {
						content: '分享失败'
					});
				}
			},
			async shareTask() {
				let data = await http.shareTask({
					data: {
						shopId: this.shopId,
						fansTaskId: this.item.myTask.id
					}
				});
			},
			winEvent(str) {
				if (str == 'ok') {
					this.$router.push('/myTask');
				} else if (str == 'cancel') {
					this.$closeWindow();
				} else {
					this.isShowWin = false;
				}
			},
			removePrevent(e) {
				e.preventDefault();
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
					if (this.$route.query.applyShopId == item.id) {
						this.shopdizhi = item.address;
						this.phone = item.telephone;
						console.log(this.shopdizhi);
						console.log(this.phone);
					}
					return item;
				})
				storage.session('wxInfo', res);
			}

		},
		components: {
			'win': () =>
				import ( /* webpackChunkName: "win" */ 'src/components/phone/win')
		},
		async mounted() { 
			this.item = storage.session('taskDetails');
			this.item.describe = this.item.describe.replace(/<img/g,"<img noDefault='true'");
			
			if (this.item) {
				this.shopAddress = this.item.shopAddress;
				this.shopTelephone = this.item.telephone;
			}

			qrcode = await import( /* webpackChunkName:"jr-qrcode" */ "src/verdor/jr-qrcode.js");
			this.mapUrl = `http://api.map.baidu.com/geocoder?address=${this.shopAddress}&output=html&src=闪店卖手`;
			this.btnContent = this.item.myTask ? '展示二维码' : '领取任务';
			this.status = this.item.myTask ? 1 : 0;
			wx_sdk = await import( /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
			wx_sdk = wx_sdk.default;

			await wx_sdk.registerWXSDK();
			utils.setTitle("任务详情");
		}
	}
</script>
<style lang="less" scoped>
	@import '../../res/css/base.less';

	.tast_detail {
		.setBox(10rem, 100%);
		min-height: 100%;
		background-color: #ffffff;
		margin: 0 auto;

		.subHeadTitle {
			.setBox(100%, .6667rem);
			line-height: .6667rem;
			font-size: 0;

			span {
				float: left;
				font-size: .4267rem;
				color: #303030;

				&:nth-child(1) {
					.setBox(55%, 100%);
					text-indent: 4%;
					.text-overflow;
				}

				&:nth-child(2) {
					.setBox(45%, 100%);
					.text-overflow;
					text-align: right;
					padding-right: .4rem;
					font-size: 0.3467rem;
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
			padding: 0 4%;
			display: flex;

		}

		span.address {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 0.3467rem;
			color: #333;
			float: left;
			width: 0.6rem;
			align-items: center;
			display: flex;

			img {
				width: 65%;
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
			min-height: 2.6667rem;
			height: auto;
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

		.qrcode {
			background: rgba(0, 0, 0, 0.50);
			position: fixed;
			z-index: 10;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;


			div {
				width: 4.7467rem;
				height: 6.9333rem;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;

				.qr {
					width: 4.7467rem;
					height: 4.7467rem;
				}

				.close {
					width: 1.1867rem;
					height: 1.1867rem;
					margin-top: 2rem;
					margin-left: 50%;
					transform: translate(-50%)
				}
			}
		}

		.link {
			font-size: .4rem;
			color: #349AEB;
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