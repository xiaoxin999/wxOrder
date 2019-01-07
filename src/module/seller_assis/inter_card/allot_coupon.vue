<template>
	<section class='allotcoupon'>
		<div class="topHead">
			<ul>
				<li>{{allotCoupon.name}}</li>

				<li v-if="allotCoupon.validityType == 1">有效期至：{{getTime(allotCoupon.startTime,allotCoupon.endTime)}}</li>
				<li v-if="allotCoupon.validityType == 0">有效期至：领券后{{allotCoupon.relativeTime}}天</li>

				<li><span>数量：<b>{{allotCoupon.total}}</b></span> <span>分配：<b>{{allotCoupon.allocatedQuantity}}</b></span> <span>发放：<b>{{allotCoupon.issuedQuantity}}</b></span> </li>
			</ul>
		</div>
		<section class="allotUser">
			<div class="dolist" v-for="(item,index) in staffList" :key="item.name">
				<img src="" alt="">
				<div class="dolist-name">
					<span class="name">{{item.staffName}}
						<span v-if='item.position==1'>店长</span>
						<span v-else>店员</span>
					</span>
					<em>已分配：{{item.allocatedQuantity}}张</em>
				</div>


				<div class="info_detail">
					<span class="riskNum" @click="riskcountNum(index,item.staffId)">
						<img class="add_icon" src="../../../res/images/sell_assis/risk_icon.png" alt="">
					</span>
					<input type="text" v-model="item.counter" :disabled="isInput" v-on:input="modelChange(index,item.staffId,item)" />
					<span class="addNum" @click="addcountNum(index,item.staffId)">
						<img class="add_icon" src="../../../res/images/sell_assis/add_icon.png" alt="">
					</span>
				</div>
			</div>
		</section>
		<div class="doNum">
			<div>管理导购数量：{{arrLength}}</div>
			<div>可分配数量：{{availNum}}</div>
		</div>
		<div class="group_btn">
			<span class="span1" @click="quickdistributeNum()">快速分配</span>
			<span class="span2" @click="distributionCouponToStaff()">提交</span>
		</div>

		<transition name="fade">
			<div class="bg" v-if="showWin">
				<div class="allot">
					<div class="text">
						<span>请输入最大数量&nbsp;(默认为最大可分配数)</span>
						<input type="Number" placeholder="请输入分配数量" ref="num" v-model="editNum">
					</div>
					<div class="btn">
						<span class="span1" @click='modify("cancle")'>取消</span>
						<span class="span2" @click="modify('ok')">确定</span>
					</div>

				</div>
			</div>
		</transition>

	</section>
</template>

<script>
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';

	export default {
		data() {
			return {
				params: this.$route.query.id,
				allotCoupon: {},
				staffList: [],
				staffName: '',
				arrLength: '', //员工数量
				recordId: '',
				id: this.$route.query.id,
				couponType: '',
				staffIds: '',
				staffIdsObj: {}, // id为key,num为value
				couponNum: '', //对应分配的数量
				isInput: false, // 是否禁止输入,可分配数量 == 数量总和时为 true
				total: 0, // 可以分配的数量
				showWin: false,
				editNum: 0
			};
		},
		watch: {
			$route() {
				this.params = this.$route.query.id;
			}
		},
		//算数量总和
		computed: {
			sum: function() {
				let sum = 0;
				for (let i = 0; i < this.staffList.length; i++) {
					sum += parseInt(this.staffList[i].counter);
				}
				return sum;
			},
			availNum() {
				let temp = this.allotCoupon.total - this.allotCoupon.allocatedQuantity - this.sum;
				return temp < 0 ? 0 : temp;
			}
		},
		methods: {
			modelChange(index, id, item) {
				if (this.staffIdsObj[id] != undefined) {
					item.counter = this.staffIdsObj[id] = parseInt(this.staffList[index].counter || 0);
				} else {
					item.counter = this.staffIdsObj[id] = 0;
				}
			},
			//减
			riskcountNum(index, id) {
				if (this.staffList[index].counter <= 0) {
					this.staffList[index].counter = 0;
					return false;
				}
				if (this.staffIdsObj[id]) {
					this.staffIdsObj[id]--;
				} else {
					this.staffIdsObj[id] = 1;
				}
				this.staffList[index].counter--;

				setTimeout(() => {
					this.isInput = Number(this.sum) == Number(this.total) ? true : false;
				});
			},
			//加
			addcountNum(index, id) {
				if (this.sum >= this.total) {
					this.$store.commit('setWin', {
						content: '已全部分配,修改请删减数量...'
					});
					return false;
				}
				if (this.staffIdsObj[id]) {
					this.staffIdsObj[id]++;
				} else {
					this.staffIdsObj[id] = 1;
				}
				this.staffList[index].counter++;
				this.id = Object.keys(this.staffIdsObj).toString();
				this.num = Object.values(this.staffIdsObj).toString();

				Object.keys(this.staffIdsObj).toString();
				setTimeout(() => {
					this.isInput = Number(this.sum) < Number(this.total) ? false : true;
				});
			},
			//获取员工列表
			async getStaffList() {
				let arr = await http.getStaffDetailList({
					data: {
						shopId: global.getShopId(),
						id: this.$route.query.id,
					}
				});

				this.arrLength = arr.length;
				this.staffName = arr[0].staffName;
				this.staffList = arr.map(item => {
					item.counter = 0;
					return item;
				});
			},
			//快速均分
			quickdistribute() {
				let total = this.editNum;

				let num = Math.floor(total / this.arrLength);
				let maxNum = total;
				if (num < 1) {
					num = 1;
				}
				for (let obj of this.staffList) {
					if (maxNum - num < 0) {
						obj.counter = 0;
						this.staffIdsObj[obj.staffId] = 0;
					} else {
						obj.counter = num;
						this.staffIdsObj[obj.staffId] = num;
					}
					this.couponNum = this.staffIdsObj[obj.staffId];
					maxNum -= num;
				}
			},
			quickdistributeNum() {
				this.showWin = true;
			},
			//提交
			async distributionCouponToStaff() {
				if (this.allotCoupon.total < this.sum) {
					this.num = this.num;
					this.id = this.id;
					this.$store.commit('setWin', {
						content: '不能超过总分配量'
					});
				} else {
					let data = await http.distributionCouponToStaff({
						data: {
							shopId: global.getShopId(),
							recordId: this.allotCoupon.id,
							couponId: this.allotCoupon.couponId,
							couponType: this.allotCoupon.couponType,
							staffIds: Object.keys(this.staffIdsObj).toString(),
							couponNum: Object.values(this.staffIdsObj).toString()
						}
					});
					if (data) this.$router.push({
						path: '/distriCard',
						query: this.query
					});
				}
			},
			/* 获取时间 结束时间和相对过期时间 */
			getTime(...arg) {
				let s = '';

				for (let item of arg) {
					s += '~' + utils.format(item, 'yyyy/MM/dd');
				}
				if (arg.length == 1) {
					return '领券后30日内有效';
				}
				return s.substr(1);
			},
			clear() {
				this.showWin = !this.showWin;
			},
			modify(status) {
				if (status == 'ok') {
					if (this.editNum > this.allotCoupon.total - this.allotCoupon.allocatedQuantity) {
						this.$store.commit('setWin', {
							content: '不能超过总分配量'
						});
					} else {
						this.quickdistribute();
						this.showWin = !this.showWin;
					}
				} else {
					this.showWin = !this.showWin;
				}
			}
		},

		mounted() {
			this.allotCoupon = storage.session('distri_card_item');
			this.total = this.allotCoupon.total - this.allotCoupon.allocatedQuantity;
			this.editNum = this.total;
			let query = (this.query = this.$route.query);
			this.getStaffList();
			this.title = query.type == 0 ? '积分卡' : '优惠券';
		}
	};
</script>

<style lang='less' scoped>
	.allotcoupon {
		height: 100%;
		width: 100%;
		overflow: hidden;

		.topHead {
			width: 100%;
			background: #fff;
			padding: 4% 0;

			ul {
				width: 92%;
				margin-top: 4%;
				border: 1px solid #ddd;
				background: #f8f8f8;
				padding: 2% 4%;
				margin: 0 auto;

				li {
					height: 0.56rem;
					line-height: 0.56rem;
					font-size: 0.34rem;
					color: #999;

					span {
						display: inline-block;
						width: 30%;

						b {
							font-weight: 500;
							color: #e0c32e;
						}
					}
				}

				li:nth-child(1) {
					font-size: 0.4rem;
					color: #303030;
					height: 0.88rem;
					line-height: 0.88rem;
				}
			}
		}

		.allotUser {
			margin-top: 0.2rem;
			width: 100%;
			background: #ffffff;
			padding: 0.2rem 0 0.2rem 0;
			height: 7.5rem;
			overflow: auto;

			.dolist {
				width: 92%;
				margin: 0 auto;
				height: 2rem;

				img {
					width: 1.68rem;
					height: 1.68rem;
					border-radius: 100%;
					float: left;
				}

				.dolist-name {
					float: left;
					margin-right: 0.2rem;
					height: 0.4933rem;
					line-height: 0.4933rem;
					margin-left: 4%;
					margin-top: 0.3333rem;
					font-size: 0.3467rem;
					color: #303030;

					.name {
						display: flex;

						span {
							color: #d0021b;
							border: 1px solid #d0021b;
							padding: 0.01rem 0.12rem;
							border-radius: 4px;
							font-size: 0.2933rem;
							margin-left: 0.1333rem;
						}
					}

					em {
						font-size: 0.2933rem;
						color: #999999;
					}
				}

				.info_detail {
					height: 2rem;
					line-height: 2rem;
					float: right;

					.riskNum {
						font-size: 1rem;
						color: #fff;
						height: 0.6rem;
						width: 0.6rem;
						display: inline-block;
						line-height: 0.5rem;
						text-align: center;
						border-radius: 100%;
						margin-right: 0.2rem;
						position: relative;
						top: 0.18rem;

						img {
							width: 100%;
							height: 100%;
						}
					}

					input {
						width: 1rem;
						height: 0.6rem;
						text-align: center;
						background: #fff;
						border: 1px solid #eaeaea;
					}

					.addNum {
						font-size: 0.8rem;
						color: #fff;
						height: 0.6rem;
						width: 0.6rem;
						display: inline-block;
						line-height: 0.54rem;
						text-align: center;
						border-radius: 100%;
						margin-left: 0.2rem;
						position: relative;
						top: 0.18rem;

						img {
							width: 100%;
							height: 100%;
						}
					}
				}
			}
		}

		.doNum {
			width: 100%;
			height: 7.1rem;
			line-height: 4rem;
			background: #fff;
			margin-top: 0.2rem;
			margin-bottom: 3rem;

			div {
				width: 49%;
				font-size: 0.4rem;
				color: #303030;
				float: left;
				height: 2rem;
				line-height: 2rem;
				text-align: center;
			}
		}

		.group_btn {
			text-align: center;
			bottom: 6%;
			width: 100%;
			position: fixed;
			overflow: hidden;

			.span1 {
				display: inline-block;
				width: 30%;
				background: #eac048;
				border-radius: 100px;
				color: #fff;
				text-align: center;
				height: 0.88rem;
				line-height: 0.88rem;
				cursor: pointer;
				font-size: 0.38rem;
			}

			.span2 {
				display: inline-block;
				width: 40%;
				background: #eac048;
				border-radius: 100px;
				color: #fff;
				text-align: center;
				height: 0.88rem;
				line-height: 0.88rem;
				cursor: pointer;
				font-size: 0.38rem;
			}
		}
	}

	.bg {
		position: fixed;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		top: 0;
		left: 0;

		.allot {
			width: 7.3733rem;
			height: 4.5867rem;
			background: #ffffff;
			border-radius: 0.2667rem;
			position: relative;
			top: 6.1067rem;
			left: 1.3333rem;
			font-size: 0.3733rem;
			color: #303030;

			.text {
				padding: 0.5333rem 0.48rem;
				text-align: center;

				input {
					width: 5.6267rem;
					height: 1.1733rem;
					border: 1px solid #d8d8d8;
					font-size: 0.32rem;
					color: #999999;
					margin: 0.2667rem 0;
					padding-left: 0.1333rem;
				}
			}

			.btn {
				position: absolute;
				width: 100%;
				height: 1.3333rem;
				line-height: 1.3333rem;
				border-top: 1px solid #d8d8d8;
				top: 72%;

				span {
					font-size: 0.3733rem;
					text-align: center;
					padding: 0.24rem 1.44rem;
				}

				.span1 {
					border-right: 1px solid #d8d8d8;
					color: #999;
				}

				.span2 {
					color: #eac048;
				}
			}
		}
	}
</style>