<template>
	<div class="coupon_user">
		<div class="header">
			<div class="left-jiao" onclick="window.history.go(-1)"><img src="../../../res/images/recurrence.png"></div>
			<p class="header-title">发放优惠券到用户</p>
			<router-link :to="{ path: 'couponDetail', query: { ss: '1' }}"><span>优惠券详情</span></router-link>
		</div>

		<div class="coupon">
			<div class="coupon_text">
				<p style="font-family: PingFangSC-Medium;font-size: 0.4rem;color: #303030; margin-bottom:0.2667rem;line-height:0.4rem;">{{couponDetail.name}}</p>
				<p v-if="couponDetail.validityType == 0">
					有效期至：{{couponDetail.relativeTime}}日内有效
				</p>
				<p v-else>
					有效期： {{transformTime(couponDetail.startTime)}}~{{transformTime(couponDetail.endTime)}}
				</p>
				<p>
					数量：<span>{{couponDetail.allocatedQuantity}}</span>
					发放：<span>{{couponDetail.issuedQuantity}}</span>
					剩余：<span>{{couponDetail.allocatedQuantity - couponDetail.issuedQuantity}}</span>
				</p>
			</div>
			<div class="jian">
				<p>{{getType(couponDetail.couponType)}}</p>
			</div>
		</div>

		<div class="select">
			<template v-for="(title,index) in title">
				<div @click="changeTitle(index)" :key='index'>
					<span>{{title}}</span>
					<img v-if="index == 2" src="../../../res/images/filter.png" alt="">
					<div class="line" v-if="indexSelect == index && index != 2"></div>
				</div>
			</template>
		</div>


		<section class='search'>
			<div>
				<div class='search_input'>
					<input ref='txt' @input='changeTxt' type="text" placeholder="搜索">
					<img src="../../../res/images/cancel.png" alt="" @click='clear' v-show="text != ''">
				</div>
				<span @click='clear'>取消</span>
			</div>
		</section>

		<div class="all">
			<div>
				<p>共计{{count}}人</p>
				<p>选择<span>{{selecteNum}}</span>人</p>
			</div>
			<div class="round-box">
				<template>
					<div class="round">
						<span :class="isSelectAll ? 'on' : ''" @click="changeImg('isSelectAll')">全选</span>
						<span :class="selectItem ? 'on' : ''" @click="changeImg('selectItem')">临时</span>
					</div>
				</template>
			</div>
		</div>

		<div class="xian"></div>
		<!-- <div class="user">
			<div class="no-date" v-if="customersList.length == 0">
				<div class="img"></div>
				<div class="txt">
					暂无粉丝
				</div>
			</div>
			<div class="user-item" v-else>
				<div class="text" v-for="(item,index) in customersList" :key="index">
					<div class="left">
						<div class="round">
							<span :class="item.selected ? 'on' : ''" @click="changeImg(item,'list',index)"></span>
						</div>
						<div class="photo">
							<img :src="item.imageUrl" alt="">
						</div>
						<div class="user-name">{{item.name}}</div>
						<span class='tag' style='vertical-align: middle;' v-show="item.isTemporary == '1'">临时</span>
					</div>
					<div class="right">
						<span class="surplus" v-if="item.couponNum > 0">有{{item.couponNum}}张，未使用{{item.couponNum - item.useNum}}张</span>
						<span class="timer" v-else>绑定:{{getTime(item.createTime)}}</span>
					</div>
				</div>
				<div class="btn" @click="sendBtn()"><span>确定发放</span></div>
			</div>
		</div>
		<transition name="fade">
			<div class="tagWin" v-if="showWin">
				<div class="bg" @click="closeWin"></div>
				<div class="select_label">
					<div class="label-title"><span>选择标签</span></div>
					<div class="label-line"></div>
					<div class="label">
						<span v-for="(t,index) in tags" :key="index" :style="{'background-color' : t.show ? getClass[index%4] : '#cdcdcd'}" @click="clickTag(t,t.id)">{{t.name}}</span>
					</div>
					<div class="btn" @click="closeWin">确定</div>
				</div>
			</div>
		</transition>
	</div> -->

		
		<div class="user">
			<div class="user-item">
				<list  :size="itemH" :height="height" :httpId="'getCouponUserList'" :callContext="this" :callFn="callFn" :httpData="httpData" :isScroll="true" :allData=true>

					<div class="text" slot-scope="prop">
						<div class="left">
							<div class="round">
								<span :class="prop.data.selected ? 'on' : ''" @click="changeImg(prop.data,'list',prop.index)"></span>
							</div>
							<div class="photo">
								<img :src="prop.data.imageUrl" alt="">
							</div>
							<div class="user-name">{{prop.data.name}}</div>
							<span class='tag' style='vertical-align: middle;' v-show="prop.data.isTemporary == '1'">临时</span>
						</div>
						<div class="right">
							<span class="surplus" v-if="prop.data.couponNum > 0">有{{prop.data.couponNum}}张，未使用{{prop.data.couponNum - prop.data.useNum}}张</span>
							<span class="timer" v-else>绑定:{{getTime(prop.data.createTime)}}</span>
						</div>
					</div>
				</list>
				<div class="no-date" v-if="customersList.length == 0">
						<div class="img"></div>
						<div class="txt">
							暂无粉丝
						</div>
					</div>
				<div class="btn" @click="sendBtn()"><span>确定发放</span></div>
			</div>
		</div>
		
		<transition name="fade">
			<div class="tagWin" v-if="showWin">
				<div class="bg" @click="closeWin"></div>
				<div class="select_label">
					<div class="label-title"><span>选择标签</span></div>
					<div class="label-line"></div>
					<div class="label">
						<span v-for="(t,index) in tags" :key="index" :style="{'background-color' : t.show ? getClass[index%4] : '#cdcdcd'}" @click="clickTag(t,t.id)">{{t.name}}</span>
					</div>
					<div class="btn" @click="closeWin">确定</div>
				</div>
			</div>
		</transition>
	</div>
	
</template>
<script>
	import storage from "src/verdor/storage";
	import utils from "src/verdor/utils";
	import http from "src/manager/http";

	let code = utils.getQueryString("code") || "test";

	export default {
		data() {
			return {
				token: "", //token
				title: ["未发放", "已发放", "标签筛选"], //标题
				indexSelect: "", //点击对应的index
				success: false,
				time: "", //当前时间
				showList: [], //页面展示的优惠券数组
				shopName: "", //店铺名字
				expireList: [], //过期优惠券的数组
				useList: [], //未使用的优惠券的数组
				usedList: [], //已使用的优惠券数组
				showWin: false,
				selectItem: false, // 是否筛选临时状态
				isSelectAll: false, // 是否选中全部
				text: "",
				endtime: "32153541654156",
				show: false,
				couponId: this.$route.query.couponId,
				selectOnList: new Set(), // 选中的用户id
				status: 0, // 0.未发放,1.已发放
				isFilterTag: false,
				list: [{
					selected: 0
				}, {
					selected: 0
				}, {
					selected: 0
				}],
				getClass: ["#FF6F49", "#FCA73E", "#0AC687", "#349AEB"],
				couponDetail: {},
				customersList: [], // 客户列表
				tags: [],
				selectTag: [],
				count: 0,
				selecteNum: 0,
				tagSet: new Set(),
				id: "",
				itemH: this.FS * 1.8667,
				height: utils.getWindowWH().h - 7.3 * this.FS - 2 * this.FS,
				httpData: {
					shopId: this.shopId,
					couponId:this.$route.query.couponId,
					page: "1", //开始页数
					num: "10", //请求条数
					search:'', 
					tags:'',
					temporary: 0, //是否临时
					grant:0	//是否发放
				},
				fn:null
			};
		},
		methods: {
			getType(num) {
				if (num == 0 || num == 1 || num == 2) {
					return "减";
				} else if (num == 3 || num == 4) {
					return "折";
				} else if (num == 5) {
					return "赠";
				} else {
					return "代";
				}
			},
			//把时间戳转化成***年**月**日
			transformTime: function(time) {
				return utils.format(new Date(Number(time) * 1000), "yyyy/MM/dd");
			},
			getTime: function(time) {
				return utils.format(new Date(Number(time) * 1000), "yyyy/MM/dd hh:ss");
			},
			filterIsOn(id) {
				// 是否选中
				return this.selectOnList[id];
			},
			closeWin() {
				this.showWin = false;
				this.changeData();
			},
			close(obj) {
				this.show = false;
				this.tagIndex = obj.data[0];
				if (obj.type != "close") {
					this.filter();
				}
			},
			clear() {
				this.text = this.$refs.txt.value = "";
				this.changeData();
			},
			clickMenu(e) {
				let target = e.target;

				if (target.tagName.toLowerCase() == "ul") {
					return;
				}
				if (!/span/gi.test(target.tagName)) {
					target = target.children[0];
				}

				if (target === this._tempTar) return;
				target.className = "down";

				let index = Array.from(e.currentTarget.children).indexOf(
					target.parentNode
				);
				this.type = index;

				this._tempTar &&
					target != this._tempTar &&
					(this._tempTar.className = "");
				this._tempTar = target;

				if (index < 3) {
					this.filter();
				} else {
					if (this.tagList.length < 1) {
						this.$store.commit("setWin", {
							content: "暂无可筛选的标签"
						});
						return;
					}
					this.show = true;
				}
			},
			changeTitle: function(index) {
				//切换标题title
				this.selecteNum = 0;

				if (index == 2) {
					this.showWin = true;
					return;
				}
				this.clear();
				this.status = index == 2 ? this.status : index;
				this.isSelectAll = false;
				this.selectItem = false;
				if (this.indexSelect != index && index != 2) {
					this.httpData.temporary = this.selectItem - 0;
					this.httpData.grant= this.status;	
					
					for (let item of this.tags) {
						this.$set(item, "show", false);
					}
					for (let item of this.customersList) {
						this.$set(item, "selected", false);
					}
				}
				this.indexSelect = index == 2 ? this.indexSelect : index;
			},
			async changeImg(item, type, index) {
				this.selecteNum = 0;
				if (type == "list") {
					item.selected = !item.selected;
					let num = 0;
					console.log(num, item);
					for (let temp of this.customersList) {
						if (temp.selected) this.selecteNum++;
					}
					if (this.selecteNum == this.customersList.length)
						this.isSelectAll = true;
					else this.isSelectAll = false;
				} else {
					this[item] = !this[item];
					if (item == "isSelectAll") {
						for (let temp of this.customersList) {
							temp.selected = this[item];
						}
						if (this.isSelectAll) this.selecteNum = this.count;
					} else {
						this.httpData.temporary = this.selectItem - 0;
						this.httpData.grant= this.status;
							for (let item of this.tags) {
								this.$set(item, "show", false);
							}
							for (let item of this.customersList) {
								this.$set(item, "selected", false);
							}
							// this.count = this.count;
					}
				}
			},
			callFn(res,allList){
				this.customersList = res.data.customersList; 
				this.customersList = allList.concat(this.customersList);
			
				this.tags = res.data.tags;
				this.count = res.data.count;
				console.log(this.customersList,'b',this.tags,'ww');
				storage.session('res',res);
				// this.tags = tags;
			 	for (let item of this.tags) {
			 		this.$set(item, "show", false);
			 	}
			 	for (let item of this.customersList) {
			 		this.$set(item, "selected", false);
			 	}
				return {list:this.customersList};
			},
			clickTag: function(t, id) {
				t.show = !t.show;

				if (t.show) {
					this.tagSet.add(id);
				} else {
					this.tagSet.delete(id);
				}
			},
			changeTxt(e) {
				this.text = e.target.value;
				this.fn();
			},
			changeData(){
				this.httpData.search = this.text;
				this.httpData.tags = [...this.tagSet].join(',');
				this.tagSet.clear();

				for (let item of this.tags) {
					this.$set(item, "show", false);
				}

			},
			async sendBtn() {
				let str = "";
				for (let item of this.customersList) {
					if (item.selected == 1) {
						str += item.id + ","
					}
				}

				if (str == "") return;

				let data = await http.sendCoupon({
					data: {
						recordId: this.$route.query.id, //优惠券Id
						shopId: this.shopId,
						customerId: str.slice(0, -1) //客户Id
					}
				})

				if (data) {
					this.$store.commit("setWin", {
						content: "发放成功"
					})
				}
			}
		},
		components: {
			'list': () =>
				import( /* webpackChunkName:'list' */ 'src/components/list')
		},
		mounted() {
			// this.getCouponUserList();
			// this.callFn();
			// let res = storage.session('res');
			// this.callFn(res);
			this.fn = utils.throttle(this.changeData,600);
			this.couponDetail = storage.session("couponDetail");
			setTimeout(function() {
				utils.setTitle("发放优惠券");
			}, 60);
		}
	};
</script>


<style lang='less' scoped>
	@import "../../../res/css/layout.css";

	.coupon_user {
		background: #fff;
		font-family: PingFangSC-Medium;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.header {
		height: 1.1733rem;
		line-height: 1.1733rem;
		display: flex;
		justify-content: space-between;
		padding: 0 0.4rem;

		.left-jiao {
			img {
				height: 0.4667rem;
				width: 0.2667rem;
				display: inline-block;
				vertical-align: middle;
			}
		}

		.header-title {
			display: inline-block;
			font-size: 0.48rem;
			color: #303030;
			text-align: center;
			margin-left: 0.9333rem;
		}

		span {
			font-size: 0.3467rem;
			color: #eac048;
		}
	}

	.coupon {
		width: 9.2933rem;
		height: 2.5067rem;
		border: solid 1px #999;
		border-radius: 2px;
		background: #f8f8f8;
		margin: auto;
		margin-top: 0.1333rem;
		padding: 0.4rem;
	}

	.coupon_text {
		float: left;

		p {
			font-size: 0.32rem;
			color: #999;
			height: 0.4933rem;
			line-height: 0.4933rem;
		}

		span {
			color: #eac048;
			margin-right: 0.5rem;
		}
	}

	.jian {
		color: #fff;
		font-size: 0.35rem;
		background: #00a0ea;
		height: 0.84rem;
		width: 0.84rem;
		border-radius: 50%;
		float: right;
		margin-right: 0.2667rem;

		p {
			line-height: 0.84rem;
			text-align: center;
		}
	}

	.clearfloat {
		clear: both;
	}

	.select {
		display: flex;
		background: #fff;
	}

	.select div {
		font-size: 0.4rem;
		font-family: PingFangSC-Regular;
		line-height: 1.53rem;
		position: relative;
		text-align: center;
		color: #343434;
		flex: 1;
	}

	.select div .yellowHover {
		color: #eac048;
	}

	.line {
		position: absolute;
		bottom: 0.27rem;
		left: 22%;
		width: 56%;
		height: 0.051rem;
		background-color: #eac048;
	}

	.search {
		height: 1.0667rem;
		width: 9.3333rem;
		margin: 0 0.3333rem;
		background-color: #fff;
		color: #999999;
		position: relative;
		overflow: hidden;

		&>div {
			width: 9.2933rem;
			margin: auto;
			height: 1.0667rem;
			position: absolute;
			top: 0;
			bottom: 0;

			.search_input {
				width: 9.2933rem;
				height: 1.0667rem;
				background-color: #ffffff;
				border: 2px #dcdcdc solid;
				border-radius: 1.3333rem;
				position: relative;
				top: 50%;
				transform: translate(0, -50%);
				vertical-align: middle;
				transition: all 0.5s;
				float: left;

				img {
					width: 0.56rem;
					height: 0.56rem;
					position: absolute;
					right: 0.4rem;
					top: 50%;
					transform: translate(0, -50%);
				}

				input {
					width: 100%;
					border-radius: 1.3333rem;
					height: 0.5067rem;
					text-indent: 0.4rem;
					border: none;
					font-size: 0.4rem;
					position: relative;
					top: 50%;
					transform: translate(0, -50%);
				}
			}
		}

		span {
			width: 1.3333rem;
			height: 0.5067rem;
			text-align: center;
			font-size: 0.4rem;
			color: #999;
			line-height: 1.0667rem;
			float: left;
		}

		.search_input:hover {
			width: 7.9rem;
			transition: all 0.5s;
		}

		input::-webkit-input-placeholder {
			text-align: center;
		}
	}

	.all {
		height: 0.4933rem;
		font-size: 0.3467rem;
		color: #999999;
		line-height: 0.4933rem;
		margin: 0.2rem 0.4rem;
		display: flex;
		justify-content: space-between;

		p {
			display: inline-block;
			margin-right: 0.6667rem;

			span {
				color: #eac048;
			}
		}

		.round-box {
			display: flex;

			.round {
				display: flex;

				span {
					color: #999999;
					height: 0.4933rem;
					width: 1.3333rem;
					flex: 1;
					text-indent: 0.5333rem;
					background: url(../../../res/images/chose-off.png) left center no-repeat;
					background-size: 0.4133rem 0.4133rem;
				}

				span:last-child {
					margin-left: 0.4rem;
				}

				.on {
					background: url(../../../res/images/chose-on.png) left center no-repeat;
					background-size: 0.4133rem 0.4133rem;
				}
			}
		}
	}

	.xian {
		width: 10rem;
		height: 0.0267rem;
		background: #f8f8f8;
	}

	.user {
		width: 100%;
		height: calc(~"100% - 7.3rem");
		overflow: auto;

		.no-date {
			position: absolute;
			top: 70%;
			left: 50%;
			width: 50%;
			height: 50%;
			transform: translate(-50%, -50%);

			.img {
				width: 100%;
				height: 40%;
				background: url(../../../res/images/no-date.png) center center no-repeat;
				background-size: 50% 50%;
			}

			.txt {
				line-height: 0.4rem;
				width: 100%;
				height: 0.4rem;
				font-size: 0.3467rem;
				text-align: center;
				color: #999999;
			}
		}

		.user-item {
			width: 100%;
			// padding-bottom: 2rem;

			.text {
				width: 100%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				height: 1.8667rem;
				line-height: 1.8667rem;
				padding: 0 0.4rem;
				border-bottom: solid 1px #f8f8f8;

				.left {
					display: flex;
					align-items: center;

					.round {
						display: flex;

						span {
							width: 0.4133rem;
							height: 0.4133rem;
							background: url(../../../res/images/chose-off.png) left center no-repeat;
							background-size: 0.4133rem 0.4133rem;
						}

						.on {
							background: url(../../../res/images/chose-on.png) left center no-repeat;
							background-size: 0.4133rem 0.4133rem;
						}
					}

					.photo {
						width: 1.3333rem;
						height: 1.3333rem;
						border-radius: 50%;
						margin-left: 0.1333rem;

						img {
							border-radius: 50%;
							width: 1.3333rem;
							height: 1.3333rem;
						}
					}

					.user-name {
						font-size: 0.3467rem;
						color: #303030;
						margin-left: 0.1333rem;
						max-width: 2.2667rem;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}

					span.tag {
						color: #d0021b;
						font-size: 0.2133rem;
						border: solid 1px #d0021b;
						border-radius: 0.0533rem;
						height: 0.4rem;
						line-height: 0.4rem;
						font-size: 0.16rem;
						padding: 0 0.0667rem;
					}
				}

				.right {
					// width: 3.4667rem;

					span.timer {
						width: 100%;
						height: 0.4rem;
						font-size: 0.2933rem;
						color: #999999;
						text-align: right;
					}

					.surplus {
						font-size: 0.3467rem;
						color: #eac048;
						text-align: right;
						margin-left: 0.5333rem;
					}
				}
			}

			.btn {
				width: 4.5067rem;
				height: 0.84rem;
				background: #eac048;
				border-radius: 1.3333rem;
				text-align: center;
				line-height: 0.84rem;
				position: fixed;
				top: 90%;
				left: 28%;

				span {
					font-size: 0.3467rem;
					color: #ffffff;
					text-align: center;
				}
			}
		}
	}

	.tagWin {
		position: fixed;
		width: 100%;
		height: 100%;

		top: 0;
		left: 0;

		.bg {
			background-color: rgba(0, 0, 0, 0.5);
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}

		.select_label {
			width: 10rem;
			border: 1px solid #999999;
			border-radius: 20px 20px 0 0;
			background-color: white;
			position: absolute;
			bottom: 0;
			left: 0;
			height: 55%;

			.label-title {
				width: 100%;
				height: 1.36rem;
				font-size: 0.48rem;
				color: #303030;
				text-align: center;
				line-height: 1.36rem;
			}

			.label-line {
				width: 100%;
				height: 0.1333rem;
				background: #f8f8f8;
			}

			.label {
				padding: 0.6667rem;
				height: 5rem;
				overflow: auto;

				span {
					display: inline-block;
					color: white;
					font-size: 0.3467rem;
					text-align: center;
					border-radius: 1.3333rem;
					padding: 0.2667rem 0.4rem;
					margin-top: 0.4rem;
					margin-right: 0.16rem;
					background-color: #cdcdcd;
				}
			}

			.btn {
				width: 4.5067rem;
				height: 0.84rem;
				line-height: 0.84rem;
				font-size: 0.3467rem;
				color: #ffffff;
				text-align: center;
				background: #eac048;
				border-radius: 1.3333rem;
				margin: 0 auto;
				margin-bottom: 1.5rem;
			}
		}
	}
</style>