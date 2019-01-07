<template>
	<section class='addcoupon'>
		<div class="formgroup">
			<label for="" v-if="params=='1'">关联优惠券</label>
			<label for="" v-if="params=='0'">关联积分卡</label>
			<select v-model="selected">
				<option v-for="(option,index) in options" :value="option" :key="index">
					{{ option.name }}
				</option>
			</select>
			<div class="kuang">
				<div class="angle"></div>
			</div>
		</div>
		<div class="info" v-if="params=='1'">
			<ul>
				<li>适用门店: <span class="toStore" @click="applicationStore()">查看适用门店</span></li>
				<li>优惠券类型：
					<span>{{typeObj[selected.type]}}</span>
				</li>
				<li>是否强制：
					<span>{{isObj[selected.isDiscount]}}</span>
				</li>
				<!-- <li>优惠金额：{{selected.param}}元</li> -->
				<li v-if="selected.lowestConsume == 0 && (selected.type == 1 || selected.type == 2)">优惠金额：任意金额可用，最高减免{{getRate(selected)}}元</li>
				<li v-if="selected.lowestConsume == 0 && (selected.type == 3 || selected.type == 4)">优惠金额：任意金额可用，最高折扣{{getRate(selected)}}</li>
				<li v-if="selected.lowestConsume == 0 && (selected.type == 6)">优惠金额：任意金额可用，最高抵扣{{getRate(selected)}}元</li>
				<li v-if="selected.lowestConsume != 0 && (selected.type == 1 || selected.type == 2)">优惠金额：最高减免{{getRate(selected)}}元</li>
				<!-- 支付金额满{{selected.lowestConsume}}可用， -->
				<li v-if="selected.lowestConsume != 0 && (selected.type == 3 || selected.type == 4)">优惠金额：最高折扣{{getRate(selected)}}</li>
				<li>券有效期:
					<span v-if="selected.validityType == 0">
						{{selected.relativeTime}}日内有效
					</span>
					<span v-else>
						{{transformTime(selected.startTime)}}~{{transformTime(selected.endTime)}}
					</span>
				</li>

				<li>使用时段:
					<span v-if="selected.useTime">
						<!-- 领取后{{selected.relativeTime}}天内有效 -->
						{{getUseTime(selected.useTime)}}
					</span>

				</li>


				<li>备注：{{selected.annotation}}</li>
				<li>使用须知：{{selected.useKnow}}</li>
			</ul>
		</div>
		<div class="info" v-if="params=='0'">
			<ul>
				<li>积分量：{{selected.param}}分</li>
				<li>卡有效期：领券后
					<span v-if="selected.delayHours=='0'">
						即时生效
					</span>
					<span v-else>
						{{selected.delayHours}}日内有效
					</span>
				</li>
				<li>备注：{{selected.annotation}}</li>
				<li>使用须知：{{selected.useKnow}}</li>
			</ul>
		</div>
		<div class="crateNum">
			<label for="">创建数量</label>
			<input type="text" v-model="total" @change="changeEvent($event)" pattern="[0-9]*">
		</div>
		<div class="sub_btn">
			<span :class="{submitBtn:true,gray:grayStatus,orange:orangeStatus}" @click="()=>{if(orangeStatus) submitCoupon()}">提交</span>
		</div>
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
				params: this.$route.query.type,
				infoId: '0',
				selected: '',
				options: [],
				name: '', //券
				type: '', //类型
				id: '', //id
				delayHours: '', //有效期，
				total: '1',
				couponId: '',
				couponType: '',
				isDisable: false,
				grayStatus: false,
				orangeStatus: true,
				crazyStart: false,
				validityType: '',
				typeObj: {
					1: '单品减免',
					2: '整单减免',
					3: '单品打折',
					4: '整单打折',
					5: '赠菜 ',
					6: '代金券',
					7: '积分卡券'
				},
				isObj: {
					1: '是',
					0: '否'
				},
				allotCoupon: {},
			};

		},
		watch: {
			'$route'() {
				this.params = this.$route.query.type;
			}
		},
		methods: {
			getRate: function(c) { //减免金额与折扣的转换
				if (c.type == 3 || c.type == 4) {
					let num = (c.param - 0) / 10;
					num += '折';
					return num;
				} else {
					return parseInt(c.param);
				}
			},
			getUseTime(time) {
				if (time == '{}') {
					return '不限制使用时间';
				} else {
					let obj = JSON.parse(time);
					let str = '';
					if (obj) {
						if (obj.type == 'week') {
							let hashMap = {
								0: '星期天',
								1: '星期一',
								2: '星期二',
								3: '星期三',
								4: '星期四',
								5: '星期五',
								6: '星期六',
							};
							str = '每周的';
							for (let item of obj.list[0].week) {
								str += hashMap[item] + ',';
							}
							str += obj.list[0].startslot + '~' + obj.list[0].endslot + '可用';
						} else if (obj.type == 'month') {
							str = '每月的';
							for (let item of obj.list[0].month) {
								str += item + '号,';
							}
							str += obj.list[0].startslot + '~' + obj.list[0].endslot + '可用';
						}
					}
					return str;
				}
			},
			changeEvent(e) {
				if (this.total <= 0) {
					this.total = 0;
					e.target.style.borderColor = 'red';
					e.target.style.color = 'red';
				} else {
					e.target.style.borderColor = '#999';
					e.target.style.color = '#999';

				}
			},
			async getCouponList() {

				let data = await http.assisGetCouponList({
					data: {
						shopId: global.getShopId(),
					}
				});
				this.options = data.filter((item) => {
					if (this.$route.query.type == 0 && item.type == 7) {
						return true;
					} else if (this.$route.query.type == 1 && item.type != 7) {
						return true;
					}
				});
				this.selected = this.options[0];
				this.delayHours = this.selected.delayHours;
			},
			async submitCoupon() {
				if (this.grayStatus) return;

				if (!/^\d+$/.test(this.total)) {
					this.$store.commit('setWin', {
						content: '请输入整数'
					});
					return false;
				}

				if (!utils.checkData(
					{
						total: {
							cond: '$$>0&&$$<1000',
							pro: '至少要创建1张并且少于1000张'
						},

					}, this)) return false;

				let couponId = this.selected.id;
				let couponType = this.selected.type;
				this.orangeStatus = false;
				this.grayStatus = true;

				await http.distributionCoupon({
					data: {
						shopId: global.getShopId(),
						couponId: couponId, //券id
						couponType: couponType, //券类型
						total: this.total //总分配量
					}
				});
				this.$store.commit('setWin', {
					content: '新增成功',
					callBack: () => {
						this.$router.push({
							path: '/distriCard',
							query: this.query
						});
					}
				});
			},
			transformTime(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy/MM/dd hh:ss');
			},
			applicationStore() {
				storage.session('shopList');
				this.$router.push({
					path: '/applicationStore',
					query: {
						id: 2
					}
				});

			}
		},
		mounted() {
			this.getCouponList();
			this.query = this.$route.query;
		}
	};
</script>

<style lang='less' scoped>
	.addcoupon {
		height: 100%;
		width: 100%;
		background: #fff;

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

			select {
				width: 50%;
				height: 0.78rem;
				line-height: 0.78rem;
				border-radius: 100px;
				text-align: center;
				text-indent: 0.4rem;
				background: #fff;
				-webkit-appearance: none;
				-webkit-appearance: none;
				appearance: none;
				outline: none;
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
				border: 1px solid #999;
			}

			.kuang {
				float: right;
				width: 0.88rem;
				background: #fff;
				height: 0.6rem;
				border-left: 1px solid #999;
				position: relative;
				top: 0.68rem;
				right: 2.18rem;
				border-radius: 0 100px 100px 0;
			}

			.angle {
				width: 0;
				height: 0;
				border: 0.156rem solid transparent;
				border-top: 0.156rem solid #333;
				position: absolute;
				right: 27%;
				top: 0.2rem;
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

			ul {
				margin: 0.34rem;

				li {
					.toStore {
						text-decoration: underline;
						cursor: pointer;
					}
				}
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
				-webkit-appearance: none;
				-webkit-appearance: none;
				appearance: none;
				outline: none;
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
			}
		}

		.sub_btn {
			width: 100%;
			margin: 0 auto;
			text-align: center;
			margin-top: 1rem;
			margin-bottom: 1rem;
		}

		.submitBtn {
			display: inline-block;
			width: 50%;
			border-radius: 100px;
			color: #fff;
			text-align: center;
			height: 0.88rem;
			line-height: 0.88rem;
			cursor: pointer;
			font-size: 0.38rem;
		}

		.gray {
			background: #999;
		}

		.orange {
			background: #EAC048;
		}

	}
</style>