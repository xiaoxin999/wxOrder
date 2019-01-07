<template>
	<div class="pay-detail">
		<div class="pay-concent">
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">到店时间</span>
					<input type="text" placeholder="请输入到店时间" v-model="reserveTime" readonly="readonly" disabled="disabled" />
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">姓名</span>
					<input type="text" placeholder="请输入姓名" v-model="names" :readonly="isEdit" maxlength="20" />
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">人数</span>
					<input type="number" placeholder="请输入人数" v-model.trim.number="nums" :readonly="isEdit" maxlength="3" />
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">电话</span>
					<input type="number" placeholder="请输入电话" v-model.trim.number="phones" :readonly="isEdit" maxlength="11" />
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">备注</span>
					<input type="text" placeholder="请输入备注" v-model="remark" :readonly="isEdit" maxlength="50" />
				</div>
			</div>
		</div>

		<template v-if="!(goodsList.length == 0 && packagesList.length == 0)">
			<pay-content :isEdit="isEdit" :isMember="isMember " :memberDiscount="memberDiscount" :goodsList="goodsList" :packagesList="packagesList" :primeCost="primeCost" :sumPrice="sumPrice"></pay-content>
			<div class="pay-concent" style="margin-bottom: 0;border-top: 1px solid #DDD;" v-if="reserveType == '1' && payType == '5'">
				<div class="pay-subhead">
					<div class="pay-sub fl">订金支付</div>
					<div class="pay-sum fl" v-if="isEdit == false">￥{{depositAmount}}</div>
					<div class="pay-sum fl" v-else>￥{{discountPrice}}</div>
				</div>
			</div>
			<div class="bespeak-rule">
				<div class="rule-title">取消预约规则</div>
				<ul class="rule-list">
					<li v-if="first != '' && ten != ''">到店前{{first}}分钟内，取消预订收取预付款{{ten}}%</li>
					<li v-if="first != '' && theSecond != '' && twenty != ''">{{first}}分钟到{{theSecond}}分钟内，取消预订收取预付款{{twenty}}%</li>
					<li v-if="first != '' && twenty != '' && isCancels.length == 2">{{first}}分钟外，取消预订收取预付款{{twenty}}%</li>
					<li v-if="theSecond != '' && thirty != ''">{{theSecond}}分钟外，取消预订收取预付款{{thirty}}%</li>
					<li v-if="isReturn != 0">超出预留时间后，取消预订收取预付款{{isReturn}}%</li>
					<li v-if="isReturn == 0">超出预留时间，则无法退款</li>
				</ul>
			</div>

			<a href="javascript:void(0)" class="payDetail" @click="createOrderReserve" v-if="status == 4 && status !=7 && status !=8 && reserveType == '1' && payType == '5' && isEdit == false">订金支付￥{{depositAmount}}</a>
			<a href="javascript:void(0)" class="payDetail" @click="createOrderReserve" v-if="status == 4 && status !=7 && status !=8 && reserveType == '1' && payType == '5' && isEdit">订金支付￥{{discountPrice}}</a>
			<a href="javascript:void(0)" class="payDetail" @click="createOrderReserve" v-if="status == 4 && status !=7 && status !=8 && reserveType == '1' &&  payType != '5'">立即支付￥{{sumPrice}}</a>
			<a href="javascript:void(0)" class="payDetail" @click="createOrderReserve" v-if="status == 4 && status !=7 && status !=8 && reserveType == '0' &&  payType != '5'">立即支付￥{{sumPrice}}</a>
			<a href="javascript:void(0)" class="cancel-btn" v-if="status == 2 || status == 5" @click="cancelBespeak">取消预约</a>
		</template>


		<div class="footer-tel" v-if="status != 4">
			<a href="javascript:void(0)" class="delOrder fl" @click="deleteReserve" v-if="status != 1 && status != 2 && status != 3 && status != 5">删除订单</a>
			<a :href="'tel:' + telephone" class="fr">修改预约信息？联系商家>></a>
		</div>

		<transition name="fade">
			<win v-if="isPayWin && isCancel" :height='"auto"' @winEvent="cancelReserve" :ok="cancel">
				<div slot="content" class="payConcent">
					<div class="payTit">退款规则</div>
					<div class="payBox">
						<ul>
							<li>实际支付{{sumPrice}}元</li>
							<li>确认退款需收手续费{{brokerage}}元({{sumPrice}}*{{discount}}%)</li>
							<li>实际退款{{actualRefund}}元</li>
							<li>退款金额以实际退款为准</li>
						</ul>
					</div>
				</div>
			</win>
		</transition>
		<transition name="fade">
			<win v-if="isPayWin && !isCancel" :height='"auto"' @winEvent="winHandle" :ok="okPay">
				<div slot="content" class="payConcent">
					<div class="payTit">支付规则</div>
					<div class="payBox">
						<ul>
							<li>请勿离开座位</li>
							<li>请保持手机畅通</li>
							<li>等待时间约10~15分钟</li>
							<li>一经付款,概不退货</li>
						</ul>
					</div>
				</div>
			</win>
		</transition>

	</div>
</template>
<script>
	import http from 'src/manager/http';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';

	let orderData = null;
	let wx_sdk = null;
	import PayContent from 'src/module/bespeak_system/bes_detail/pay_content';
	let payType = utils.getQueryString('payType') || 'wx';
	export default {
		name: 'BespeakDetail',
		data() {
			return {
				oid: '',
				token: '',
				phone: '',
				sumPrice: '',
				tableName: '',
				remark: '',
				involicHeader: '',
				fid: '',
				goodsList: [], //商品列表
				packagesList: [], //套餐列表
				isPay: false,
				tableId: '',
				goodsInfo: {},
				data: '',
				isPayWin: false,
				isCancel: false,
				name: '',
				reserveTime: '',
				num: '',
				status: '',
				roid: '',
				isEdit: false,
				deadline: '',
				isCancels: [],
				differenceValue: '',
				time: '',
				valueIndex: '',
				discount: '',
				brokerage: null,
				isReturn: '',
				ten: '', //十分钟取消预约
				twenty: '', //二十分钟取消预约
				thirty: '', //三十分钟取消预约
				telephone: '', //商家电话号码
				isExtendSeat: '', //预留时间
				first: '', //第一个分钟数
				theSecond: '', //第二个分钟数
				reserveType: '', //预约配置
				payType: '', //支付类型
				payAttr: '', //支付类型对应属性
				depositAmount: '', //定金金额
				primeCost: '', //原价
				discountPrice: '', //折扣价
				code: '',
				memberInfo: '',
				memberDiscount: '',
				isMember: '',
				detailId:''
			};
		},
		computed: {
			phones: {
				get: function() {
					return this.phone;
				},
				set: function(newValue) {
					this.phone = String(newValue).replace(/[^\d]/g, '');
					if (this.phone.length > 11) {
						this.phone = this.phone.substring(0, 11);
					}
				}
			},
			nums: {
				get: function() {
					return this.num;
				},
				set: function(newValue) {
					this.num = (newValue + '').replace(/[^\d]/g, '');
					if (this.num.length > 3) {
						this.num = this.num.substring(0, 3);
					}
				}
			},
			names: {
				get: function() {
					return this.name;
				},
				set: function(newValue) {
					this.name = newValue.replace(/[^\w\d\u4e00-\u9fa5]/g, '');
				}
			},
			cancel() {
				return {
					content: '确认退款'
				};
			},
			okPay() {
				return {
					content: '确认支付'
				};
			}
		},
		methods: {
			async getReserveDetail(roid) {
				let res = await http.getReserveDetail({
					data: {
						shopId: this.detailId,
						roid: roid
					}
				}, false, true);
				this.name = res.data.name;
				this.remark = res.data.remark;
				this.phone = res.data.phone;
				this.num = res.data.person;
				this.sumPrice = res.data.price;
				this.status = res.data.status;
				this.goodsInfo = res.data.goodsData || {};
				this.goodsList = this.goodsInfo.goods || [];
				this.packagesList = this.goodsInfo.package || [];
				this.isEdit = true;
				this.time = res.data.reserveTime;
				this.discountPrice = res.data.price;
				this.reserveTime = utils.format(new Date(Number(res.data.reserveTime) * 1000), 'yyyy-MM-dd hh:mm');
				let time = res.time;
				if (this.status == '4' && Number(this.time) < Number(time)) {
					this.status = '-3';
				}
				let goodsPrice = 0;
				let packagesPrice = 0;
				let arr = this.goodsList;
				if (!utils.isEmptyObject(arr)) {
					for (let i = 0; i < arr.length; i++) {
						if (arr[i].returnNum) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].returnNum);
						}

						if (arr[i].freeNum) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].freeNum);
						}
						goodsPrice += Number(arr[i].price);
					}
				}

				let arr1 = this.packagesList;
				if (!utils.isEmptyObject(arr1)) {
					for (let i = 0; i < arr1.length; i++) {
						if (Number(arr1[i].returnNum)) {
							arr1[i].num = Number(arr1[i].num) - Number(arr1[i].returnNum);
						}
						if (Number(arr1[i].freeNum)) {
							arr1[i].num = Number(arr1[i].num) - Number(arr1[i].freeNum);
						}
						arr1[i].num = Number(arr1[i].num);
						for (let j = 0; j < arr1[i].goods.length; j++) {
							arr1[i].goods[j].num = Number(arr1[i].goods[j].num);
							for (let k = 0; k < arr1[i].goods[j].attr.length; k++) {

								arr1[i].goods[j].attr[k].arrName = [];

								for (let h = 0; h < arr1[i].goods[j].attr[k].name.length; h++) {
									arr1[i].goods[j].attr[k].arrName.push(arr1[i].goods[j].attr[k].name[h].split(':')[0]);
								}
								arr1[i].goods[j].attr[k].attrName = arr1[i].goods[j].attr[k].arrName[0][0];
							}
						}
						packagesPrice += Number(arr1[i].price);
					}
				}
				this.primeCost = (Number(goodsPrice) + Number(packagesPrice)).toFixed(2);
			},
			deleteReserve() {
				this.$store.commit('setWin', {
					content: '确认删除订单?',
					type: 'confirm',
					callBack: (str) => {
						if (str === 'ok') {
							this.deleteOrder();
						}
					}
				});
			},
			async deleteOrder() {
				await http.deleteReserve({
					data: {
						shopId: this.detailId,
						roid: this.roid
					}
				});
				if (storage.session('isOrderList')) {
					this.$router.go(-1); //跳转至预约列表
				} else {
					this.$router.go(-1); //跳转至预约列表
				}
			},
			async createOrderReserve() {
				let reserveTime = new Date(this.reserveTime.replace(/-/g, '/'));
				reserveTime = Math.round(reserveTime.getTime() / 1000);

				// 验证信息
				if (!utils.checkData(
					{
						name: {
							cond: '$$.length > 0',
							pro: '请填写姓名..'
						},
						num: {
							reg: /\d{1,3}/g,
							pro: '请输入人数..'
						},
						phone: {
							reg: /^1\d{10}/g,
							pro: '请输入电话..'
						},
					}, this)) {
					return false;
				}
				let res = await http.createOrderReserve({
					data: {
						shopId: this.detailId,
						payType: payType,
						roid: this.roid || '',
						reserveTime: reserveTime,
						name: this.name,
						person: this.num,
						phone: this.phone,
						remark: this.remark,
						data: this.goodsInfo,
						sqbData: JSON.stringify({
							'hash': 'bespeakDetail',
							'detailId':this.detailId
						})
					}
				});
				this.roid = res.oid;
				this.data = res;
				storage.session('oid_bespeak',this.roid);
				storage.session('roid',this.roid);
				wx_sdk.goPay({
					payData: this.data,
					payCallBack: (status) => {
						if (status) {
							this.$store.commit('setWin', {
								content: '支付成功!',
								callBack: () => {
									this.$closeWindow();
								}
							});
						} else {
							this.$store.commit('setWin', {
								content: '支付失败!'
							});
						}
					}
				});

			},
			winHandle(type) {
				if (type == 'ok') {
					this.createOrderReserve();
					this.isPayWin = false;
				} else {
					this.isPayWin = false;
				}
			},
			cancelBespeak() {
				if (utils.isEmptyObject(this.isCancels)) {
					this.$store.commit('setWin', {
						content: '商家不允许取消预约!'
					});
					return false;
				} else {
					if (this.differenceValue < 0 && this.isReturn == '0' && this.status != '5') {
						this.$store.commit('setWin', {
							content: '已超出预约时间,不能退款!'
						});
					} else {
						this.isPayWin = true;
						this.isCancel = true;
					}
				}
			},
			async cancelReserve(type) {
				let _this = this;
				if (type == 'ok') {
					await http.cancelReserve({
						data: {
							shopId: this.detailId,
							roid: this.roid
						}
					});
					this.isPayWin = false;
					//关闭微信游览器
					this.$store.commit('setWin', {
						content: '取消成功,1秒后关闭游览器!'
					});
					setTimeout(function() {
						_this.$closeWindow();
					}, 1000);
				}
				this.isPayWin = false;
			},

			async getReserveConf() {
				let res = await http.getReserveConf({
					data: {
						shopId: this.detailId
					}
				}, false, true);
				this.deadline = res.time;
				this.isCancels = res.data.isCancel;
				this.isReturn = res.data.isReturn;
				this.telephone = res.data.telephone;
				this.isExtendSeat = res.data.isExtendSeat;
				this.time = this.isExtendSeat == '0' ? this.time : this.getDate(this.time, this.isExtendSeat);
				this.differenceValue = this.getTime(this.time, this.deadline);
				
				if (!utils.isEmptyObject(this.isCancels)) {
					let arr = [];
					let arrList = this.isCancels;
					for (let i = 0; i < arrList.length; i++) {
						//获取时间计算
						if (i == 0) {
							arr.push(arrList[i][0]);
						} else if (i == 1) {
							arr.push(arrList[i][0]);
						} else {
							arr.push(arrList[i][0]);
						}
					}
					if (arrList.length == 3) {
						this.first = arrList[1][0]; //第一个时间
						this.theSecond = arrList[0][0]; //第二个时间
						this.ten = arrList[2][1]; //第一个折扣
						this.twenty = arrList[1][1]; //第二个折扣
						this.thirty = arrList[0][1]; //第三个折扣
					} else {
						this.first = arrList[0][0];
						this.ten = arrList[1][1];
						this.twenty = arrList[0][1];
					}

					if (this.differenceValue < 0) {
						this.discount = this.isReturn;
					} else {
						if (!utils.isEmptyObject(this.isCancels)) {
							this.discount = this.getDiscount(this.time, this.deadline, this.isCancels);
						}
					}
					// 实际退款金额：支付金额*折扣
					this.actualRefund = ((Number(this.sumPrice) * this.discount) / 100).toFixed(2);
					// 手续费：支付金额-实际退款金额
					this.brokerage = (Number(this.sumPrice) - (this.actualRefund)).toFixed(2);
				}

				this.reserveType = res.data.status;
				this.payType = res.data.payType;
				this.payAttr = res.data.payAttr;
				if (this.reserveType == '1' && this.payType == '5') {
					this.depositAmount = utils.toDecimal((Number(this.sumPrice) * (Number(this.payAttr) / 100)));
					this.depositAmount = (this.depositAmount == 0) ? 0.01 : this.depositAmount;
				}

			},
			getDate(times, num) {
				let startTime = utils.format(new Date(Number(times) * 1000), 'yyyy/MM/dd hh:mm'); //获取times时间 转化为YYYY/MM/DD hh:mm格式
				let dates = new Date(startTime); //时间副本 用于获取times分钟
				dates.setMinutes(dates.getMinutes() + Number(num));
				return Math.round(dates.getTime() / 1000);
			},
			getTime(startTime, endTime) {
				let date1 = new Date(startTime * 1000); //开始时间
				let date2 = new Date(endTime * 1000); //结束时间
				let date3 = date1.getTime() - date2.getTime(); //时间差的毫秒数
				//计算相差的年数
				let years = Math.floor(date3 / (12 * 30 * 24 * 3600 * 1000));
				//计算相差的月数
				let leave = date3 % (12 * 30 * 24 * 3600 * 1000);
				//计算出相差天数
				let leave0 = leave % (30 * 24 * 3600 * 1000);
				let days = Math.floor(leave0 / (24 * 3600 * 1000));
				//计算出小时数
				let leave1 = leave0 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
				let hours = Math.floor(leave1 / (3600 * 1000));
				//计算相差分钟数
				let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
				let minutes = Math.floor(leave2 / (60 * 1000));

				return (years * 365 * 24 * 60) + (days * 24 * 60) + (hours * 60) + minutes;
			},
			getDiscount(startTime, endTime, arr) {
				let tote = ((startTime - endTime) / 60);
				let discount;
				if (tote >= arr[0][0]) {
					discount = arr[0][1];
				} else if (tote >= arr[1][0]) {
					discount = arr[1][1];
				} else {
					discount = arr[2][1];
				}
				return discount;
			}
		},
		async mounted() {
			let reservationInfo = storage.session('reservationInfo');
			// this.payType = utils.getQueryString('payType') || 'wx';
			orderData = await import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data');
			orderData = orderData.default;

			wx_sdk = await import( /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;

			// 获取会员信息
			this.memberInfo = storage.session('select-shop')  ? storage.session('select-shop') : storage.session('wechatShop');
			this.isMember = Boolean(this.memberInfo.member);
			this.memberDiscount = this.memberInfo.member ? this.memberInfo.member.level.discount : 1;

			
			this.roid = storage.session('roid');
			
			this.detailId = utils.getQueryString('detailId') || this.$route.query.detailId;

			let oidStatus = storage.session('oid_bespeak');
			if (oidStatus) {
				let d = await http.getStatusByOid({
					data: {
						shopId: this.detailId,
						oid: oidStatus,
						type:'reservePay'
					}
				});
				if (d) {
					this.$store.commit('setWin', {
						content: '支付成功',
						callBack:()=>{
							this.$closeWindow();
						}
					});
				} else {
					this.$store.commit('setWin', {
						content: '支付失败'
					});
				}
			}
			storage.session('oid_bespeak',null);

			if (this.roid) {
				await this.getReserveDetail(this.roid);
			} else {
				let goods = storage.session('goods');
				if (!utils.isEmptyObject(goods)) {
					let goodsFilter = goods.filter(function(item, index, array) {
						item.price = (parseFloat(item.price) * parseFloat(item.num)).toFixed(2);
						let arr = item.attr;
						if (!utils.isEmptyObject(arr)) {
							arr.filter(function(item1) {
								let options = item1.options;
								options.filter(function(item2) {
									if (item2.attrStatu) {
										item.isAttr = true;
										if (item.type == '1') {
											item.price = (parseFloat(item2.price) + parseFloat(item.price)).toFixed(2);
										} else {
											item.price = (parseFloat(item2.price) * parseFloat(item.num) + parseFloat(item.price)).toFixed(2);
										}
									}
								});
							});
						}
						return array;
					});
					this.goodsList = goodsFilter;
				}
				this.packagesList = storage.session('packages');
				this.goodsInfo = orderData.getCurrentTableUpdata(storage.session('goods'), storage.session('packages'));
				this.sumPrice = storage.session('sumPrice');
				this.status = '4';
				this.name = reservationInfo.name;
				this.phone = reservationInfo.phone;
				this.num = reservationInfo.person;
				this.remark = reservationInfo.remark;
				console.log(reservationInfo.reserveTime);
				this.reserveTime = utils.format(new Date(Number(reservationInfo.reserveTime) * 1000), 'yyyy-MM-dd hh:mm');
			}

			this.getReserveConf();
			utils.setTitle('订单详情');
		},
		components: {
			PayContent,
			'win': () =>
				import( /* webpackChunkName: "win" */ 'src/components/phone/win')
		}
	};
</script>

<style lang="less" scoped>
	.pay-details {
		width: 100%;
		height: auto;
		position: relative;
		padding-bottom: 1.25333rem;
		font-family: "微软雅黑";
	}

	.pay-details .pay-title {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: -0.93333rem;
		text-align: center;
		font-size: 0.42667rem;
		color: #999999;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 5;
		background-color: #f7f7f7;
		border-bottom: 1px solid #dddddd;
	}

	.pay-details .pay-title span {
		display: block;
		width: 0.93333rem;
		height: 1.25333rem;
		text-indent: 0;
	}

	.previousPage {
		background: url("../../res/images/recurrence.png") center center no-repeat;
		background-size: 0.28rem 0.49333rem;
	}

	.payDetail {
		background-color: #f5a623;
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		position: fixed;
		left: 0;
		bottom: 0;
		text-align: center;
		font-size: 0.42667rem;
		color: #FFFFFF;
	}

	.payDetail:link {
		text-decoration: none;
	}

	.pay-btn {
		width: 2.8rem;
		height: 1.33333rem;
		font-size: 0.42667rem;
		text-align: center;
		background-color: #FF5D42;
	}

	/* 积分弹窗  */

	.payWin {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 99;
		overflow: hidden;
	}

	.payWin .payTip {
		width: 9.33333rem;
		height: auto;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
	}

	.payConcent {
		width: 100%;
		height: auto;
		background-color: #ffffff;
		border-radius: 8px 8px 0 0;
		-webkit-border-radius: 8px 8px 0 0;
	}

	.payConcent .payTit {
		width: calc(100% - 0.8rem);
		height: 1.33333rem;
		line-height: 1.33333rem;
		box-sizing: border-box;
		margin-left: 0.4rem;
		margin-right: 0.4rem;
		border-bottom: 2px dashed #C0C0C0;
		text-align: center;
		font-size: 0.42667rem;
		color: #333;
	}

	.payConcent .payBox {
		width: 100%;
		height: auto;
		padding: 0.26667rem 0.4rem;
		box-sizing: border-box;
	}

	.payConcent ul li {
		width: 100%;
		height: 0.93333rem;
		line-height: 0.93333rem;
		text-indent: 0.53333rem;
		font-size: 0.34667rem;
		position: relative;
	}

	.payConcent ul li:after {
		position: absolute;
		left: 0.2rem;
		top: 0.4rem;
		content: '';
		width: 0.13333rem;
		height: 0.13333rem;
		background-color: #f4a522;
		border-radius: 50%;
		-webkit-border-radius: 50%;
	}

	.payFooter {
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		font-size: 0;
	}

	.payFooter .cancel,
	.payFooter .confirm {
		width: 50%;
		height: 1.33333rem;
		display: inline-block;
		font-size: 0.34667rem;
		color: #FFFFFF;
		text-align: center;
	}

	.payFooter .cancel:hover,
	.payFooter .confirm:hover {
		text-decoration: none;
	}

	.payFooter .cancel {
		background-color: #999999;
		border-radius: 0 8px 0 0;
		-webkit-border-radius: 0 8px 0 0;
	}

	.payFooter .confirm {
		background-color: #f5a623;
		border-radius: 0 0 8px 0;
		-webkit-border-radius: 0 0 8px 0;
	}

	.pay-bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		padding-left: 0.4rem;
		font-size: 0.42667rem;
		color: #FFFFFF;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.pay-bottom .preferential {
		color: #DFDFDF;
		margin-left: 0.13333rem;
		font-size: 0.34667rem;
	}

	.bespeak-rule {
		width: 100%;
		height: auto;
		background-color: #efeff4;
		margin-bottom: 1.33333rem;
	}

	.bespeak-rule .rule-title {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		padding-left: 0.4rem;
		color: #888888;
		font-size: 0.37333rem;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.bespeak-rule .rule-list li {
		width: 100%;
		height: 0.73333rem;
		line-height: 0.73333rem;
		padding-left: 0.4rem;
		border-left: 0.08rem solid #f5a623;
		background-color: #FFFFFF;
		color: #888888;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
		position: relative;
	}

	.bespeak-rule .rule-list li:after {
		content: '';
		display: block;
		width: 0.08rem;
		height: 0.08rem;
		border-radius: 50%;
		-webkit-border-radius: 50%;
		background-color: #888888;
		position: absolute;
		left: 0.2rem;
		top: 50%;
		transform: translate(0, -50%);
		-webkit-transform: translate(0, -50%);
	}

	.footer-tel {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		margin-bottom: 0.4rem;
	}

	.footer-tel a {
		color: #f5a623;
		font-size: 0.34667rem;
		display: block;
		padding-right: 0.26667rem;
	}

	.footer-tel a:hover {
		text-decoration: none;
	}

	.cancel-btn {
		background-color: #c65055;
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-align: center;
		font-size: 0.42667rem;
		color: #FFFFFF;
	}

	.cancel-btn:hover {
		text-decoration: none;
	}

	[v-cloak] {
		display: none;
	}

	.delOrder {
		background: url(../../res/images/delect.png) 0.2rem center no-repeat;
		background-size: 0.48rem 0.48rem;
		width: 3.06667rem;
		color: #999999 !important;
	}

	.freenum {
		background: url(../../res/images/freenum.png) center center no-repeat;
		background-size: 0.8rem 0.46667rem;
	}

	.returnnum {
		background: url(../../res/images/returnnum.png) center center no-repeat;
		background-size: 0.8rem 0.46667rem;
	}

	.infoTip {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-align: center;
		color: #000000;
		font-size: 0.34667rem;
		border-bottom: 1px solid #000000;
		background-color: #FFFFFF;
	}

	.address {
		position: relative;
		width: 100%;
		height: 2.4rem;
		padding-left: 0.4rem;
		box-sizing: border-box;
		border: 1px solid #E5E5E5;
	}

	.address .add-address {
		display: block;
		width: 4.38667rem;
		height: 1.18667rem;
		line-height: 1.18667rem;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
		background-color: #F5BF4F;
		font-size: 0.42667rem;
		color: #FFFFFF;
		text-align: center;
		text-decoration: none;
	}

	.estimated {
		width: 100%;
		height: 1.24rem;
		line-height: 1.24rem;
		padding-left: 0.4rem;
		box-sizing: border-box;
		text-indent: 0.68rem;
		font-size: 0.37333rem;
		color: #333333;
		background: url(../../res/images/estimated.png) 0.4rem center no-repeat;
		background-size: 0.44rem 0.44rem;
	}

	.address-info {
		padding: 0.36rem 0.4rem;
		box-sizing: border-box;
		width: 100%;
		height: auto;
		max-height: 2.8rem;
		background: url(../../res/images/address.png) 0.36rem 0.4rem no-repeat;
		background-size: 0.4rem 0.53333rem;
		text-indent: 0.85333rem;
		font-size: 0.37333rem;
		color: #333333;
		border: 1px solid #E5E5E5;
		position: relative;
	}

	.address-info .address-name {
		width: 100%;
		height: auto;
		max-height: 1.6rem;
		line-height: 0.66667rem;
		font-size: 0.42667rem;
		color: #333333;
		padding: 0 0.4rem;
		box-sizing: border-box;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.address-info p {
		width: 100%;
		height: 1.06667rem;
		line-height: 1.06667rem;
	}

	.address-info:after {
		content: '';
		position: absolute;
		right: 0.4rem;
		top: 50%;
		transform: translate(0, -50%);
		width: 0.21333rem;
		height: 0.34667rem;
		background: url(../../res/images/more.png) no-repeat;
		background-size: 0.21333rem 0.34667rem;
	}

	input:disabled {
		background-color: #FFFFFF;
	}

	// input::-webkit-input-placeholder {
	//   　color: #999; 
	// }
	.member-icon,
	.wechat-icon {
		text-indent: 0.8rem;
		font-size: 0.37333rem;
		color: #333;
	}

	.member-icon {
		background: url(../../res/images/member-icon.png) 0 center no-repeat;
		background-size: 0.54667rem 0.49333rem;
	}

	.wechat-icon {
		background: url(../../res/images/wechat-icon.png) 0 center no-repeat;
		background-size: 0.56rem 0.49333rem;
	}

	.selectPay {
		width: 1.06667rem;
		height: 100%;
		margin-right: 0.4rem;
	}

	.payOn {
		background: url(../../res/images/pay-on.png) center center no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.payOff {
		background: url(../../res/images/pay-off.png) center center no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.pointer-events {
		pointer-events: none;
	}
</style>