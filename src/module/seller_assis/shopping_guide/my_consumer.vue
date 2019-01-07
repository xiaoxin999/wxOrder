/*
* @Author: guan.sun
* @Date: 2018-04-03 15:28:16
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-10-30 17:38:21
*/
<template>
	<div class="container">
		<div class="header">
			<div class="header_top">
				<div class="num">{{userObj.coupon}}</div>
				<div class="box"></div>
				<div class="num">{{userObj.point}}</div>
			</div>
			<div class="header_bottom">
				<div class="num bottom_num">优惠券</div>
				<div class="box bottom_num"></div>
				<div class="num bottom_num">积分</div>
				<div class="content_center">
					<div class="name">{{userObj.name}}</div>
					<span class="label" v-if="userObj.memberId > 0">VIP</span>
					<span class="consume_icon" v-if="userObj.lastConsumeTime > 0"></span>
					<div class="info">未兑换商品：{{userObj.exchange}}</div>
				</div>
			</div>
			<div class="head_sculpture">
				<img :src="userObj.imageUrl" alt="头像">
			</div>
		</div>
		<div class="consumer_info">
			<div class="flBox subhead">客户信息</div>
			<div class="flBox">消费次数：{{userObj.consumptionNum}}次</div>
			<div class="flBox">最高消费：￥{{userObj.maxConsumption}}</div>
			<div class="flBox">最低消费：￥{{userObj.minConsumption}}</div>
			<div class="flBox">疯抢次数：{{userObj.grabNum}}次</div>


			<div class="flBox" v-if="userObj.shopNames">最常光临的店铺：{{userObj.shopNames}}</div>
			<div class="flBox" v-else>最常光临的店铺：暂无</div>
			<div style="overflow: inherit;white-space: inherit;text-overflow: inherit;line-height: 1.4;" class="flBox" @click="writeMark">
				备注:{{message?message:"暂无备注"}}
				<i></i>
			</div>
		</div>
		<div class="user_label">
			<span v-for="(item,index) in tagList" @click="clickTag(item,index)" v-bind:key="index" :style="{'backgroundColor': userIsClick(item.id) ?  colorArr[index%4] : ''}">{{item.name}}<i class="praise_icon"></i><ins v-if="item.clickCount > 0">{{item.clickCount}}</ins></span>
		</div>
		<div class="bottom_operate">
			<div class="box" @click="openCoupon('1')">送优惠券</div>
			<div class="box">
				<div class="chat_btn" @click="openChatPage">聊天</div>
			</div>
			<div class="box" @click="openCoupon('2')">送积分卡</div>
		</div>

		<transition name="fade">
			<component :is="couponObj.componentId" :type="couponObj.type" :list="couponList" :title="couponObj.title" @closePicker="closePicker">
			</component>
		</transition>

		<comments :isshow="isShow" ref="comment" @commentsChange="getMessage" :mess="mess"></comments>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import http from "src/manager/http";
	import storage from 'src/verdor/storage';
	import global from 'src/manager/global';

	export default {
		data() {
			return {
				shopId: global.getShopId(), // 店铺id
				id: this.$route.query.id, // 客户id
				userObj: {}, // 客户详情
				colorArr: ["#FF6F49", "#FCA73E", "#0AC687", "#349AEB"],
				tagList: [], // 显示的标签组
				couponObj: {
					"type": "",
					"title": "",
					"componentId": ""
				},
				couponList: [], // 优惠券列表
				coupon: [], // 优惠券
				integral: [], // 积分卡券
				clickedTagIds: {}, // 是否被用户点击过
				fansId: storage.session('login').fansId, // 获取fansId
				isShow: false,
				message: "",
				mess: ""
			}
		},
		methods: {
			getTxt(str) {
				return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
			},
			writeMark() {
				this.mess = this.message;
				this.$refs.comment.setMess(this.mess);
				this.isShow = !this.isShow;
			},
			getMessage(obj) {

				this.isShow = obj.isShow;

				if (obj.type != "close") {
					this.message = this.getTxt(obj.message);


					if (this.message == "") return;
					http.updateCustomerRemarks({
						data: {
							fansId: this.id,
							remark: this.message,
							shopId: this.shopId
						}
					})
				}


			},
			async customerDetail() {
				// 获取客户详情
				let data = await http.customerDetail({
					data: {
						"shopId": this.shopId,
						"id": this.id,
						"fansId": this.fansId
					}
				});

				let tags = data.tags;
				let clicked = data.clicked;
				this.message = data.detail.remark;

				let clickedObj = {}; //tagsId为key,clickCount为value


				for (var j = 0; j < clicked.length; j++) {
					clickedObj[clicked[j].tagId] = clicked[j].clickCount;
				}


				for (var i = 0; i < tags.length; i++) {
					let item = clickedObj[tags[i].id];
					tags[i].clickCount = -1;
					if (item) {
						tags[i].clickCount = item;
					}

					if (tags[i].type == '1') {
						tags.splice(i, 1);
						i--;
					}
				}

				// 用户记录点击过的标签
				let clickedTagIds = data.detail.tagIds ? data.detail.tagIds.split(',') : [];

				for (let obj of clickedTagIds) {
					this.clickedTagIds[obj] = true;
				}

				this.userObj = data.detail;
				this.tagList = utils.sortByAll(data.tags, 'clickCount', false);
			},
			userIsClick(id) {
				// 用户是否点击过
				if (this.clickedTagIds[id]) {
					return true;
				} else {
					return false;
				}
			},
			async assisGetCouponList() {
				// 获取优惠券列表
				let list = await http.getCouponByStaffId({
					data: {
						shopId: this.shopId
					}
				});

				for (var i = 0; i < list.length; i++) {
					list[i].couponName = list[i].name;
					if (list[i].couponType == '7') {
						this.integral.push(list[i]);
					} else {
						this.coupon.push(list[i]);;
					}
				}

				this.couponList = list;
			},
			openCoupon(type) {
				// 打开优惠券
				this.couponList = (type == '1') ? this.coupon : this.integral;
				this.couponObj.title = (type == '1') ? '优惠券' : '积分卡';

				for (let obj of this.couponList) {
					obj.name = `${obj.couponName} (${obj.issuedQuantity}/${obj.allocatedQuantity})`;
				}

				if (utils.isEmptyObject(this.couponList)) {
					this.$store.commit("setWin", {
						content: '暂无' + this.couponObj.title
					});
					return false;
				}

				this.couponObj.componentId = 'multi-picker';
				this.couponObj.type = "select";
			},
			closePicker(obj) {
				this.couponObj.componentId = "";
				if (obj.type == "sure") {
					// 确定后赠送券
					let index = obj.payload ? obj.payload[0] : '';
					this.sendCoupon(index);
				}
			},
			async sendCoupon(index) {
				// 赠送优惠券
				let data = await http.sendCoupon({
					data: {
						shopId: this.shopId,
						recordId: this.couponList[index].id,
						customerId: this.id
					}
				});

				if (data) {
					this.$store.commit("setWin", {
						content: "赠送" + this.couponObj.title + "成功"
					});
					// 处理赠送优惠券问题
					let list = (this.couponObj.title == "积分卡") ? this.integral : this.coupon; // 是优惠券还是积分卡
					let obj = list[index]; // 优惠券或积分卡数量
					obj.issuedQuantity = Number(obj.issuedQuantity) + 1;

					if (obj.issuedQuantity == obj.allocatedQuantity) {
						list.splice(index, 1);
					} else {
						list.splice(index, 1, obj);
					}
				}
			},
			openChatPage() {
				// 打开聊天页面
				this.$router.push({
					path: '/chatPage',
					query: {
						"id": this.id,
						"fansId": this.fansId
					}
				});
				storage.session('detail', this.userObj);
			},
			async clickTag(tmp, index) {
				// 给标签点赞
				
				let data = await http.staffTag({
					data: {
						tagId: tmp.id,
						shopId: this.shopId,
						fansId: this.id,
						tagType: tmp.type
					}
				});

				let item = this.tagList[index];


				if(tmp.type == 2){
					item.clickCount = 0;
				}else{
					if (data == "add") {
						item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) + 1 : 1;
					} else {
						item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) - 1 : 0;
					}
				}

				if(tmp.type == 2){
					if(data == "add"){
						this.clickedTagIds[tmp.id] = true;
					}else{
						delete this.clickedTagIds[tmp.id];
					}
				}else{
					if(data == "add"){
						this.clickedTagIds[tmp.id] = true;
					}else if(data == 'reduce'&&item.clickCount < 1){
						delete this.clickedTagIds[tmp.id];
					}
				}
				
				this.tagList.splice(index, 1, item);
			},
		},
		components: {
			'multi-picker': () => import( /* webpackChunkName: "multi_picker" */ 'src/components/multipicker/index'),
			comments: () => import( /* webpackChunkName: "comments" */ "src/module/seller_assis/shopping_guide/comments/release_comments"),
		},
		mounted() {
			this.assisGetCouponList();
			this.customerDetail();
			utils.setTitle('我的客户');
		}
	}
</script>
<style lang="less" scoped>
	@import '../../../res/css/base.less';

	.container {
		.setBox(100%, auto);
		min-height: 100%;
		background-color: #fff;
		overflow: scroll;

		.header {
			.setBox(100%, 5.8667rem);
			background-color: #ffffff;
			border-bottom: .2667rem solid #f8f8f8;
			position: relative;
			overflow: hidden;

			.header_top {
				.setBox(100%, 2rem);
				background-color: black;
				font-size: 0;
			}

			.header_bottom {
				.content_center {
					display: table-cell;
					text-align: center;
					vertical-align: middle;
					.setBox(10rem, 2rem);

					.name {
						font-size: .3733rem;
						text-align: center;
						font-weight: bold;
						.setBox(100%, .5333rem);
						line-height: .5333rem;
						margin-bottom: .0667rem;
						.text-overflow;
					}

					.label {
						color: #D0021B;
						border: 1px solid #D0021B;
						.setBox(1.0667rem, .4667rem);
						line-height: .4667rem;
						display: inline-block;
						margin-bottom: .0667rem;
						border-radius: 4px;
						position: relative;
						top: -.08rem;
					}

					.info {
						.setBox(100%, .5333rem);
						line-height: .5333rem;
						font-family: PingFang-SC-Medium;
						font-size: .3467rem;
						color: #999999;
						display: inline-block;
					}
				}
			}

			.head_sculpture {
				.setBox(2.24rem, 2.24rem);
				border-radius: 50%;
				border: .0667rem solid #fff;
				position: absolute;
				left: 50%;
				top: 20%;
				transform: translate(-50%, 0);
				background-color: #999999;
				box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.23);

				img {
					.setBox(100%, 100%);
					border-radius: 50%;
					border: .0667rem solid #ffffff;
				}
			}

			.box,
			.num {
				float: left;
				margin-top: 1.0667rem;
			}

			.num {
				font-size: .4rem;
				color: #ffffff;
				.setBox(4rem, .56rem);
				line-height: .56rem;
				font-weight: bold;
				text-align: center;
			}

			.box {
				.setBox(2rem, .56rem);
			}

			// .num:last-child{
			//     text-indent: 2rem;
			// }
			// .num:first-child{
			//     text-indent: 1.1467rem;
			// }
			.bottom_num {
				font-size: .3467rem;
				color: #303030;
				margin-top: 0;
				height: 1.6rem;
				line-height: 1rem;
			}
		}

		.user_label {
			.setBox(100%, auto);
			background-color: #ffffff;
			padding: .4rem;
			box-sizing: border-box;
			font-size: 0;
			padding-bottom: 1.8133rem;
			margin-bottom: .2667rem;
			overflow: hidden;

			>span {
				display: inline-block;
				border-radius: 1.3333rem;
				.setBox(auto, .8667rem);
				line-height: .8667rem;
				padding: 0 .4rem;
				color: #ffffff;
				font-size: .3467rem;
				background-color: #CDCDCD;
				margin: 0 .4rem .4rem 0;
			}

			.label_red {
				background-color: #FF6F49;
			}

			.label_blue {
				background-color: #349AEB;
			}

			.label_green {
				background-color: #0AC687;
			}

			.label_orange {
				background-color: #FCA73E;
			}
		}

		.comment_on_header {
			background-color: #ffffff;
			.setBox(100%, 1.2533rem);
			line-height: 1.2533rem;

			.comment_on_title {
				color: #030303;
				font-size: .3467rem;
				text-indent: .7333rem;
				font-weight: 600;
				position: relative;

				&:before {
					content: '';
					position: absolute;
					left: .4rem;
					top: 50%;
					transform: translate(0, -50%);
					.setBox(.16rem, .16rem);
					background-color: #EAC048;
					border-radius: 50%;
				}
			}

			.comment_more {
				.setBox(2rem, 100%);
				font-size: .3467rem;
				font-weight: 600;
				color: #999999;
				margin-right: .2667rem;
			}
		}

		.consumer_info {
			.setBox(100%, 4.6rem);
			background-color: #ffffff;
			border-bottom: .2667rem solid #f8f8f8;
			padding: .2667rem .4667rem;
			box-sizing: border-box;

			.flBox {
				line-height: .6667rem;
				float: left;
				font-family: PingFang-SC-Medium;
				font-size: .32rem;
				color: #999999;
				.text-overflow;

				&:nth-child(1n) {
					.setBox(55%, .6667rem);
					text-indent: .4667rem;
				}

				&:nth-child(2n) {
					.setBox(45%, .6667rem);
				}

				&:last-child {
					width: 100%;
					.text-overflow;
				}

			}

			& i {
				background: url("../../../res/images/pencil.png") no-repeat center center;
				display: inline-block;
				width: 0.32rem;
				height: 0.32rem;
				vertical-align: middle;
				margin-left: 0.1rem;
			}

			.subhead {
				color: #030303;
				position: relative;

				&::before {
					content: '';
					.setBox(.1067rem, .1067rem);
					background-color: #EAC048;
					border-radius: 50%;
					position: absolute;
					left: .2267rem;
					top: 50%;
					transform: translate(0, -50%);
				}
			}
		}

		.bottom_operate {
			background: #F8F8F8;
			border-radius: 1.3333rem;
			.setBox(8.5333rem, 1.2rem);
			line-height: 1.2rem;
			position: fixed;
			left: 50%;
			bottom: .9333rem;
			transform: translate(-50%, 0);

			>.box {
				.setBox(33.3%, 100%);
				line-height: 1.2rem;
				text-align: center;
				font-family: PingFang-SC-Medium;
				font-size: .4rem;
				color: #303030;
				float: left;
			}

			.chat_btn {
				.setBox(1.8133rem, 1.8133rem);
				line-height: 1.8133rem;
				color: #FFFFFF;
				border-radius: 50%;
				background-color: #EAC048;
				transform: translate(-50%, -50%);
				position: absolute;
				left: 50%;
				top: 50%;
			}
		}

		.praise_icon {
			display: inline-block;
			background: url(../../../res/images/sell_assis/praise_icon.png) center center;
			background-size: .4rem .4rem;
			.setBox(.4rem, .4rem);
			margin: 0 .1067rem;
		}

		.consume_icon {
			display: inline-block;
			background: url(../../../res/images/sell_assis/consume.png) center center no-repeat;
			.setBox(.5333rem, .4667rem);
			background-size: .3867rem .3867rem;
		}
	}
</style>