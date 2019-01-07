<template>
	<section class='RevenueRecord'>
		<div class="formgroup">
			<label>选择时间</label>
			<div class="timeMessageDiv">
				<span class="timeMessage" @click="showtab()">{{timeMessage}}</span>
				<span class="angle"></span>
			</div>
			<span class="submitBtn" @click="reset()">重置</span>
		</div>
		<div class="detailInfo">
			<p>累计收入：{{coinsTotal}}金币 <span>余额：{{coins}}金币</span></p>
			<p>当月收入：{{allMountAmount}}金币</p>
		</div>
		<div class="info">
			<p v-for="(item,index) in list" v-if="list.length>=1" :key="index"><span>{{item.createTime}}</span>
				<span v-if="item.status=='0'">绑定客户<span>+{{item.operateAmount}}</span></span>
				<span v-else-if="item.status=='1'">客户消费<span>+{{item.operateAmount}}</span></span>
				<span v-else-if="item.status=='2'">提现申请<span>-{{item.operateAmount}}</span></span>
				<span v-else-if='item.status=="3"'>提现驳回<span>+{{item.operateAmount}}</span></span>
				<span v-else-if="item.status =='4'">{{item.behavior}}<span>+{{item.operateAmount}}</span></span>
				<span v-else-if="item.status == '5'">{{item.behavior}}<span>-{{item.operateAmount}}</span></span>
				
			</p>

		</div>
		<div class="withBtn">
			<span class="submitBtn" @click="toWithdrawals">提现</span>
		</div>
		<transition name="fade">
			<dateselector v-if="isShow" :recent_time="recent_time" :param="param" :type="0" @closeData="closeData"></dateselector>
		</transition>
	</section>
</template>


<script>
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import dateselector from 'src/components/dateselector';

	const date = new Date();
	export default {
		components: {
			dateselector
		},
		data() {
			return {
				coinsTotal: '',
				coins: '',
				isShow: false,
				recent_time: [date.getFullYear(), date.getMonth() + 1],
				param: ['2015-2018', '1-12'],
				timeMessage: '本月',
				startTime: '', //开始日期
				endTime: '', //结束日期
				timeYear: '',
				timeData: '',
				list: [], //收益记录明细
				createTime: '',
				operateAmount: '',
				profit: {},
				allMountAmount: [],
				haveTime: 0,
				haveEndTime: 0, //距离疯抢结束的时间
			};
		},
		methods: {
			toWithdrawals() {
				storage.session('profit_data', this.profit);
				this.$router.push('/withdrawals');
			},
			setDate() {
				const date = new Date();
				this.param = ['2015-' + date.getFullYear(), '1-12'];
				// this.getProfitList();
			},
			closeData(val) {
				this.isShow = false;

				if (val.type == 'makeSure') {
					let data = val.data;
					let selectTime = new Date(data[0], data[1] - 1); // 获取选中的月份
					let nowMonth = new Date().getMonth(); // 当前月份
					this.timeMessage = (nowMonth == data[1] - 1) ? '本月' : this.transformTime(selectTime, true);
					let getFirstLastDay = utils.getFirstLastDay({
						'time': selectTime
					});
					this.startTime = getFirstLastDay.startTime;
					this.endTime = getFirstLastDay.endTime;

					this.getProfitList();
				}
			},
			showtab() {
				this.isShow = true;
			},
			async getProfitList() {

				let data = await http.getProfitList({
					data: {
						shopId: global.getShopId(),
						startTime: this.startTime || utils.getFirstLastDay({
							'time': new Date()
						}).startTime,
						endTime: this.endTime || utils.getFirstLastDay({
							'time': new Date()
						}).endTime
					}
				});
				console.log(data, 'this.lsit');
				this.list = data.list.map((item) => {
					item.createTime = this.transformTime(item.createTime);
					return item;
				});

				let arr = this.list;

				this.allMountAmount = arr.reduce((total, item) => {
					if (item.status == '0' || item.status == '1') {
						total += Number(item.operateAmount);
					}
					return total;
				}, 0).toFixed(2);


				this.coins = data.info.coins;
				this.coinsTotal = data.info.coinsTotal;
				if (data.list[0]) {
					this.createTime = data.list[0].createTime;
					this.operateAmount = data.list[0].operateAmount;
				}

				this.profit = data.info;
			},
			transformTime(time, type) {
				let format = type ? 'yyyy-MM' : 'yyyy/MM/dd hh:mm';
				return utils.format(time, format);
			},
			reset() {
				this.timeMessage = '本月';
				this.startTime = (new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() - 1000) / 1000;
				this.endTime = (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() - 1000) / 1000;
				this.getProfitList();
				this.isShow = false;


			}
		},
		mounted() {
			// this.closeData();
			this.setDate();
			this.getProfitList();
			storage.session('profit_data');
		}
	};
</script>

<style lang='less' scoped>
	.RevenueRecord {
		width: 100%;
		background: #fff;
		min-height: 100%;
		padding-bottom: 2rem;

		.formgroup {
			width: 88%;
			margin: 0 auto;
			height: 2rem;
			line-height: 2rem;
			font-size: 0.38rem;

			label {
				margin-right: 2%;
				width: 2rem;
				display: inline-block;
			}

			.timeMessageDiv {
				width: 48%;
				text-align: center;
				height: 0.8rem;
				display: inline-block;
				border: 1px solid #999;
				border-radius: 100px;
				line-height: 0.8rem;
				position: relative;
				top: 0rem;
				margin-right: 3%;

				span.timeMessage {
					width: 55%;
					text-align: center;
					height: 0.6rem;
					display: inline-block;
					line-height: 0.7rem;
					position: relative;
					border-right: 1px solid #999;
				}

				span.angle {
					display: inline-block;
					position: relative;
					top: 24%;
					left: 9%;
					-webkit-transform: translate(-50%, -25%);
					transform: translate(-50%, -25%);
					width: 0;
					height: 0;
					border-top: 0.25rem solid black;
					border-right: 0.16rem solid rgba(0, 0, 0, 0);
					border-bottom: 0.1rem solid rgba(0, 0, 0, 0);
					border-left: 0.16rem solid rgba(0, 0, 0, 0);
				}
			}
		}

		.info {
			width: 88%;
			margin: 0 auto;
			background: #f8f8f8;
			line-height: 0.8rem;
			font-size: 0.34rem;
			color: #999;
			border: 1px solid #DDDDDD;
			padding: 2%;
			margin-top: 0.4rem;

			p {
				height: 0.68rem;
				line-height: 0.68rem;

				span:nth-child(1) {
					text-align: center;
					display: inline-block;
					width: 42%;
				}

				span:nth-child(2) {
					text-align: center;
					display: inline-block;
					width: 56%;

					span {
						text-align: left;
						// display: inline-block;
						width: 40%;
						float: right;
					}
				}

				span:nth-child(3) {
					text-align: center;
					display: inline-block;
					width: 29%;
				}
			}

		}

		.withBtn {
			margin: 0 auto;
			line-height: 0.8rem;
			font-size: 0.34rem;
			color: #999;
			padding: 2%;
			margin-top: 0.4rem;
			text-align: center;
			position: fixed;
			width: 100%;
			bottom: 1%;

			span {
				width: 80%;
				height: 0.868rem;
				line-height: 0.868rem;
			}
		}

		.crateNum {
			width: 88%;
			margin: 0 auto;
			height: 2rem;
			line-height: 2rem;
			font-size: 0.38rem;

			label {
				margin-right: 2%;
				display: inline-block;
				width: 2rem;
			}

			input {
				width: 50%;
				height: 0.78rem;
				line-height: 0.78rem;
				border-radius: 100px;
				text-align: center;
				border: 1px solid #999;
			}
		}

		.sub_btn {
			width: 100%;
			margin: 0 auto;
			text-align: center;
			position: absolute;
			bottom: 1rem;
		}

		.submitBtn {
			display: inline-block;
			background: #EAC048;
			border-radius: 100px;
			color: #fff;
			text-align: center;
			height: 0.8rem;
			line-height: 0.8rem;
			cursor: pointer;
			font-size: 0.38rem;
			width: 1.84rem;
		}

		.detailInfo {
			width: 88%;
			margin: 0 auto;
			font-size: 0.38rem;

			span {
				float: right;
			}

			p {
				height: 0.68rem;
				line-height: 0.68rem;
			}
		}

	}
</style>