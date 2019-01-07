<template>
	<div class='order_pay' v-if='isReady'>
		<div class='header'>
			<div class='shopName'>{{shopName}}</div>
			<div class='amount_input' @click='focusInput'>
				<span class='fl'>消费总额</span>
				<div v-show='total > 0' class='fr show_input'>{{total}}</div>
				<input type='Number' v-model='total' maxlength='6' placeholder='询问服务员后输入' class='total_input fr' ref='total'>
				<div class='fr coin' v-show='total > 0'>￥</div>
				<!-- <div class='analog_input' contenteditable='true' ref='total' v-html='total' @input='total=$event.target.innerHTML'></div> -->
			</div>
			<div class='checkbox'>
				<span class='check fl' :class="isPreferential ? 'checkOn' : ''" @click=" switchType('1')"></span>
				<span class='fl'>输入不参加优惠金额</span>
			</div>
		</div>
		<div class='content'>
			<div class='item' v-if='isPreferential'>
				<span class='title fl'>不参与优惠</span>
				<input type='Number' v-model='notDiscountPrices' placeholder='询问服务员后输入' class='point_input fl'>
			</div>
			<div class='item' v-if='(fullReduceCash == 0 && payConfig.shopDiscount > 0 && ( onlyMember ? !!member :true))'>
				<span class='title fl'>门店折扣</span>
				<span class='money fl'>
					{{payConfig.shopDiscount / 10}}折
				</span>
				<span class='more fr'></span>
			</div>
			<div class='item' v-if="fullReduceCash>0">
				<span class='title fl'>满减活动</span>
				<span class='money fl'>
					{{fullReduceCash}} 元
				</span>
				<!-- <span class='more fr'></span> -->
			</div>
			<div class='item' v-if='unshop && member' @click='choseCard'>
				<span class='title fl'>{{level.name || '基础卡'}}</span>
				<span class='money fl'>
					<em v-if="isCoupon && coupon && (coupon.sharingStatus == 2 || coupon.sharingStatus == 0) && payConfig.shopDiscount == '0'">会员折扣与优惠券不共享</em>
					<em v-else-if='payConfig.shopDiscount == 0'>{{level.discount / 10 || '10'}}折</em>
					<em v-else-if='payConfig.shopDiscount > 0'>已参加门店折扣</em>
				</span>
				<span class='more fr'></span>
			</div>
			<div class='item' v-else-if='cardPackage.length>1 && !unshop' @click='choseCard'>
				<span class='title fl'>{{level.name || '基础卡'}}</span>
				<span class='money fl'>
					<em v-if="isCoupon && coupon && (coupon.sharingStatus == 2 || coupon.sharingStatus == 0) && payConfig.shopDiscount == '0'">会员折扣与优惠券不共享</em>
					<em v-else-if='payConfig.shopDiscount == 0'>{{level.discount / 10 || '10'}}折</em>
					<em v-else-if='payConfig.shopDiscount > 0'>已参加门店折扣</em>
				</span>
				<span class='more fr'></span>
			</div>
			<!-- && !IS_ALI -->
			<div class='item' v-if='unshop && member == false' @click='registerMember'>
				<span class='title fl'>注册会员</span>
				<span class='member_link fr'>点击领卡</span>
			</div>
			<div class='item' v-if="(member == false && discount == '1' && isDiscount=='1') || (!unshop && member != false && discount == '1' && isDiscount=='1')">
				<span class=' title fl'>粉丝等级</span>
				<span class='member_link fr'>{{fansDiscount}}折</span>
			</div>
			<div class='item' v-if="unshop && payConfig.isMemberPay == '1' && member">
				<span class='title fl'>会员余额</span>
				<span class='money fl'><em v-if='isUseAmount'>- ￥{{useMemberAmount}}</em><em v-else>￥{{level.totalAmount || 0}}</em></span>
				<span class='switch fr' :class="isUseAmount ? ' switchOn' : ''" @click=" switchType('2')"></span>
			</div>
			<div class='item' v-if="payConfig.isCouponPay == '1'" @click='choseCoupon'>
				<span class='title fl'>优惠劵</span>
				<span class='describe fl' v-if='!couponName'><em v-if='couPonNum > 0'>{{couPonNum}}张可用</em><em v-else>无可用优惠券</em></span>
				<span class='money fl' v-if='couponName'>{{couponName}}</span>
				<span class='more fr' v-if='couPonNum > 0'></span>
			</div>
			<div class='item' v-if="integralConfig.status == '1' && payConfig.isPointsPay> 0">
				<span class='title fl'>积分抵扣</span>
				<span class='describe points fl' v-if="integralConfig.useMode == '0' || integralConfig.useMode=='1' && isIntegral==false">可用{{maxPoint}}积分</span>
				<span class='describe points fl' v-if="integralConfig.useMode == '1' && isIntegral">已抵扣{{integralAmount}}元</span>
				<span class='tips fl' @click="openRuleWin('1')"></span>
				<span class='switch fr' :class="isIntegral ? ' switchOn' : ''" @click=" switchType('3')"></span>
			</div>
			<div class='item' v-if="integralConfig.status == '1' && isIntegral && integralConfig.useMode=='0'">
				<span class=' title fl'>使用积分</span>
				<input type='Number' v-model='usePoint' placeholder='请输入积分' class='point_input fl'>
				<span class='describe integral_des fl'>可抵扣{{integralAmount}}元</span>
			</div>
			<div class='item' @click='choosePerson' v-if='payConfig.person > 0'>
				<span class='title fl'>用餐人数</span>
				<span class='describe points fl'>{{person}}</span>
				<span class='more fr'></span>
			</div>
			<div class='item' v-if="total-actualAmount>0">
				<span class=' title fl'>共计优惠</span>
				<span class='money fl'>-{{saveMoney.toFixed(2)}}</span>
			</div>
			<span class='preferential_rules fr' @click="openRuleWin('2')" v-if="payConfig.rules != ''">优惠规则</span>
		</div>
		<a class='pay_btn' @click='goPay' :class="total > 0 && isPay ? 'black' : ''">{{payName}}：￥<span v-if=' total <=0 '>0</span><span v-else>{{actualAmount || 0}}</span></a>

		<win :width=' 280' :height="'auto'" :type="'alert'" @winEvent='winEvent' v-show='isShowWin'>
			<div slot='content' class='rules_content'>
				<div class='rules_title'>{{winConfig.winTitle}}</div>
				<ul v-if="winConfig.winType == '1'">
					<li>积分抵扣比例为{{integralConfig.point}}:{{integralConfig.pointCash}}</li>
					<li v-if="integralConfig.maxRule == '1' || integralConfig.maxRule=='2'">积分抵扣最多为订单金额{{integralConfig.maxRuleValue}}%</li>
					<li v-if=" integralConfig.maxRule=='3'">积分抵扣最多为{{integralConfig.maxRuleValue}}元</li>
					<!-- <li v-if=' pointUserData.point>= integralConfig.point '>最多可使用积分{{maxPoint}}</li> -->
					<li v-if="integralConfig.pointUseRule != '2' && integralConfig.pointUseRule !='0'">人均消费满{{integralConfig.minCash}}元可使用</li>
					<li v-if="integralConfig.pointUseRule !='1' && integralConfig.pointUseRule !='0'">总消费满{{integralConfig.minCash}}元可使用</li>
				</ul>
				<ul v-else>
					<li v-for=' (item,index) in ruleList' :key='index'>{{item}}</li>
				</ul>
			</div>
		</win>
		<transition name='fade'>
			<component :is='personObj.id' :type='personObj.type' @closePicker='closePicker' :list='personObj.list' :title='personObj.title'>
			</component>
		</transition>
	</div>
</template>
<script>
	import http from 'src/manager/http';
	import global, {
		SQB_WX,
		SQB_ALI
	} from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';


	let payType = utils.getQueryString('payType') || 'wx'; // 支付类型
	let wxsdk = null;

	//电子卡不需要传
	//实体卡需要传 memberCardId
	export default {
		data() {
			return {
				pointUserData: {}, // 积分用户配置
				integralConfig: {}, // 后台配置
				isShowWin: false, // 弹窗是否开启
				winConfig: {
					winType: null, // 1为积分规则,2为优惠规则
					winTitle: null // 同上
				},
				payConfig: {}, // 买单配置
				point: 0, // 当前使用的积分
				isIntegral: false, // 是否使用积分
				shopName: null,
				ruleList: null, // 规则列表
				member: false, // 会员信息,false则不是会员
				onlyMember: false, //是否开启了只有会员才享受门店折扣
				isReady: false, // 是否加载完成
				level: {}, // 当前会员等级
				isPreferential: false, // 是否参加优惠
				isUseAmount: false, // 是否使用会员余额
				total: '', // 消费总额
				cardPackage: [], // 卡列表
				maxPoint: 0, // 可使用最大积分数
				userPoint: 0, // 用户总积分
				actualAmount: 0, // 实际支付金额
				memberAmount: 0, // 会员余额
				notDiscountPrice: '', // 不参加优惠金额
				couPonList: [], // 优惠券列表
				useMemberAmount: 0, // 使用的会员余额
				couPonNum: 0, // 可用的优惠券数量
				couponName: '', // 优惠券抵扣金额
				openId: '', // 用于支付
				isPay: true,
				oid: '',
				data: '',
				commentConfigData: null,
				channels: null,
				isPaySuccess: false, // 是否支付成功
				calculatedValue: null, // 用于计算 
				integralAmount: 0,
				isPoint: false, // 是否显示积分
				isCoupon: false, // 是否选择优惠券
				coupon: {},
				payName: '去支付',
				comment: false, // 是否开启支付评价
				brandId: '',
				showPayType: false,
				payMode: {},
				scanpayInfo: {}, //在点击微信支付后.刷新页面之前保存的数据
				tpayType: '',
				person: '1', // 默认为1
				personObj: {
					'id': '',
					'type': 'personPicker',
					'list': null,
					'title': '选择用餐人数'
				},
				clickPay: false,
				isReadyPay: false,
				fansDiscount: '', //会员折扣
				discount: '',
				isDiscount: '',
				// eslint-disable-next-line
				throttlePrice: function() {}, //节流函数
				throttleCoupon: function() {}, //节流函数
				preAllData: {}, //存储数据
				unshop: false, //默认不适用
				useShopIds: [],
				fullReduceCash: 0, //满减金额
				saveMoney: 0,
			};
		},
		methods: {
			goPay() {
				// 消费总额大于0才能显示弹窗
				if (this.total - 0 > 0) {

					if (this.actualAmount - 0 == 0) {
						this.selectType(payType);
						// this.scanPay(payType);
					} else {
						let payList = this.payConfig.payMode.split(',');

						if (this.IS_ALI && payList.indexOf('1') > -1) {
							this.selectType('ali');
						} else if (!this.IS_ALI && payList.indexOf('0') > -1) {
							this.selectType('wx');
						} else {
							this.$store.commit('请在微信或者支付宝中打开支付');
						}

					}
					this.clickPay = true;

				}

			},
			selectType(str) {
				this.tpayType = str;
				this.scanPay(str);

			},

			onKeyUp() {
				let selection = getSelection();
				// 设置最后光标对象
				let lastEditRange = selection.getRangeAt(0);
				selection.addRange(lastEditRange);
			},
			winEvent() {
				// 弹窗的回调
				this.isShowWin = false;
			},
			openRuleWin(type) {
				// 打开规则弹窗
				this.winConfig = {
					'winType': type,
					'winTitle': type == '1' ? '积分规则' : '优惠规则'
				};
				this.isShowWin = true;
			},
			async getUserInfo() {
				// 获取用户信息
				let data = await http.getUserInfo({
					data: {
						type: 1,
						shopId: this.shopId
					}

				});
				this.shopName = data.shopName;
				this.member = data.member;
				if (data.discount) {
					this.isDiscount = data.discount.isDiscount;
					this.discount = data.discount.discount;
					let status;
					status = data.discount.status;
					storage.session('status', status);
				}

				this.cardPackage = data.cardPackage;
				this.useShopIds = data.useShopIds ? data.useShopIds.split(',') : [];
				this.userPoint = data.point;
				this.brandId = data.brandAndAloneId; //获取品牌或单店id
				console.log(data, 'data');
				let level = storage.session('level');
				let memberLevel = level || this.member.level;
				if (level) {
					this.level = level;
				} else {
					if (this.member) {
						this.member.level.totalAmount = this.member.totalAmount;
						this.level = this.member ? this.member.level : {};
					} else if (data.discount && !this.member) {
						//粉丝
						this.fansDiscount = data.discount.discount / 100;

					}
					if (data.discount) {
						this.fansDiscount = data.discount.discount / 100;
					}

				}
				storage.session('memberLevel', memberLevel);
				storage.session('memberInfo', {
					'shopName': data.shopName
				});
				this.getCouponListNew();

				storage.session('shopInfo', {
					id: this.shopId
				});
			},
			/* 
				0 返回快捷支付配置
				1 返回与计算价格
				2 返回0和1的内容
			 */
			async preComputingPriceAndPoint(type = 1) {
				// 获取买单配置

				if (type == 1) {
					this.preAllData = {
						total: this.total,
						notDiscountPrice: this.notDiscountPrice,
						person: this.person,
						useMemberAmount: this.useMemberAmount,
						isUseAmount: this.isUseAmount,
						isPreferential: this.isPreferential
					};
					storage.session('preAllData', this.preAllData);
				}


				let {
					fullReduceCash,
					pointConfig,
					scanPayConfig,
					wechatPrice,
					priceLimit,
					pointLimit,
					pointCash,
					isPoint
				} = await http.preComputingPriceAndPoint({
					data: {
						shopId: this.shopId,
						type: type,
						memberCardId: this.level.memberType == '1' ? this.level.cardId : '',
						isMemberPrice: Number(this.isUseAmount),
						originalPrice: this.total,
						notDiscountPrice: this.notDiscountPrice || 0,
						point: this.isIntegral ? this.point : 0,
						couponCode: storage.session('couponOn') ? storage.session('couponOn').code : '',
						userPoint: this.userPoint
					}
				});

				if (type == 0 || type == 2) {
					this.integralConfig = pointConfig;
					this.payConfig = scanPayConfig;
					this.ruleList = this.payConfig.rules.split('!#!');
					this.isIntegral = this.integralConfig.useMode == '1' ? true : false;
					this.isPoint = isPoint;
					this.isReadyPay = true;
					this.onlyMember = Boolean(this.payConfig.onlyMember - 0);

				}

				if (type == 1 || type == 2) {
					this.actualAmount = wechatPrice;
					this.calculatedValue = wechatPrice;
					this.maxPoint = pointLimit;
					this.point = (this.integralConfig.useMode == '1' ? this.maxPoint : this.point) || 0;
					this.useMemberAmount = priceLimit;
				}
				this.fullReduceCash = fullReduceCash;
				this.saveMoney = Number(this.total) - Number(wechatPrice) - Number(priceLimit) - Number(pointCash) > 0 ? Number(this.total) - Number(wechatPrice) - Number(priceLimit) - Number(pointCash) : 0;
				this.couponName = this.couponChange();
			},
			/* eslint-disable */
			couponChange() {
				// 计算优惠券抵扣金额
				let couponOn = storage.session('couponOn');
				if (!couponOn) return false;
				switch (couponOn.type) {
					case '2':
						return `-￥${couponOn.param}`;
						break;
					case '4':
						return `${couponOn.param / 10}折`;
						break;
					case '6':
						return `-￥${couponOn.param}`;
						break;
					case '8':
						return `-￥${couponOn.param}`;
						break;
					default:
				}
			},
			/* eslint-enable */
			switchType(type) {
				// 1为优惠买单,2为会员余额,3为积分
				switch (type) {
					case '1':
						this.isPreferential = !this.isPreferential;
						this.notDiscountPrice = '';
						break;
					case '2':
						if (Number(this.total) <= 0) {
							this.$store.commit('setWin', {
								content: '请输入支付金额'
							});
							return false;
						}
						this.isUseAmount = !this.isUseAmount;
						this.throttlePrice();
						break;
					case '3':
						if (Number(this.total) <= 0) {
							this.$store.commit('setWin', {
								content: '请输入支付金额'
							});
							return false;
						}
						this.isIntegral = !this.isIntegral;
						if (this.integralConfig.useMode == '1' && this.isIntegral) {
							this.point = this.maxPoint || 0;
						} else {
							this.point = 0;
						}

						// if(this.isUseAmount){
						this.throttlePrice();
						// }
						break;
					default:
						return false;
				}
			},
			focusInput() {
				// 获取焦点
				this.$refs.total.focus();
			},
			async getCouponListNew() {
				// 获取优惠券
				let {
					data,
					time
				} = await http.getCouponListNew({
					data: {
						shopId: this.shopId,
						memberCardId: this.level.memberType == '1' ? this.level.cardId : '',
					}
				}, false, true);
				this.couPonNum = this.filterCoupon({
					'coupon': data,
					'totalPrice': this.total,
					'time': time,
					'showCouponType': '2,4,6,8'
				});
				// storage.session('couponList', this.couPonList);
			},
			choseCard() {
				// 选择会员卡
				storage.session('cardList', this.cardPackage);
				this.$router.push('/choseCard');
			},
			choseCoupon() {
				// 选择优惠券
				if (Number(this.total) <= 0) {
					this.$store.commit('setWin', {
						content: '请输入支付金额'
					});
					return false;
				}
				this.$router.push({
					path: '/chooseCoupon',
					query: {
						'type': 3
					}
				});
			},
			registerMember() {
				// 注册会员
				storage.session('type', 3);
				storage.session('brandId', this.brandId);
				this.$router.push({
					path: '/MemberRegister',
					query: {
						'type': 3
					}
				});
			},
			async getOpenId() {
				this.openId = await this.getOpenId();
				this.isReady = true;
			},
			/* 获取发送前的数据 */
			getSendData() {
				let data = {
					shopId: this.shopId,
					originalPrice: this.total,
					isMemberPrice: Number(this.isUseAmount),
					couponCode: storage.session('couponOn') ? storage.session('couponOn').code : '',
					point: this.isIntegral ? this.point : 0,
					memberCardId: this.level.memberType == '1' ? this.level.cardId : '',
					payType: this.tpayType || payType || 'wx',
					openId: this.openId,
					oid: this.oid,
					person: Number(this.person) == 1 ? 1 : this.person,
					isIntegral: this.isIntegral, //下面的都是自己补充的 并不是
					total: this.total,
					integralConfig: this.integralConfig,
					useMemberAmount: this.useMemberAmount,
					isUseAmount: this.isUseAmount,
					isPreferential: this.isPreferential,
					notDiscountPrice: this.notDiscountPrice,
					actualAmount: this.actualAmount
				};
				return data;
			},
			async scanPay(str = 'wx') {
				// 扫码支付
				if (this.total <= 0) {
					return false;
				}

				let staffId = utils.getQueryString('staffId') || '';
				let data = {
					shopId: this.shopId,
					originalPrice: this.total,
					notDiscountPrice: this.notDiscountPrice,
					isMemberPrice: Number(this.isUseAmount),
					couponCode: storage.session('couponOn') ? storage.session('couponOn').code : '',
					point: this.isIntegral ? this.point : 0,
					memberCardId: this.level.memberType == '1' ? this.level.cardId : '',
					// payType: this.tpayType || payType || 'wx',
					openId: this.openId,
					oid: this.oid,
					person: Number(this.person) == 1 ? 1 : this.person,
					isPreferential: this.isPreferential,
					actualAmount: this.actualAmount,
					staffId,
					sqbData: JSON.stringify({
						staffId,
						shopId: this.shopId,
						hash: 'preferentialPay'
					})
				};

				// data.payType = str;
				data.openId = storage.session('openId');

				let t = await http.scanPay({
					data: data
				});

				this.data = data = t;
				this.oid = data.oid;
				let backRoute = this.getcommentConfig(t);

				//缓存数据
				storage.session('evalObj', {
					oid: t.oid,
					type: 3
				});

				//付钱为0元时
				if (t.memberPay) {
					this.$store.commit('setWin', {
						content: `支付成功`,
						type: 'alert',
						callBack: () => {
							if (backRoute) {
								this.goEvaluate();
							} else {
								this.$closeWindow();
							}
						}
					});
					this.isPaySuccess = true;
					this.clickPay = false;
				} else {

					let pt = t.jsonData.payType;

					//收钱吧
					if (pt == SQB_ALI || pt == SQB_WX) {
						this.preAllData.payFor = true;
						this.preAllData.oid = t.oid;
						this.preAllData.commentConfigData = t.commentConfigData;
						storage.session('preAllData', this.preAllData);
					}

					if (str == 'ali') {
						data.oid = t.oid;

						wxsdk.goPay({
							payData: t.jsonData,
							payCallBack: (res) => {
								if (res) {
									if (backRoute) {
										this.goEvaluate();
									}
								} else {
									this.$store.commit('setWin', {
										content: '支付失败'
									});
								}
							}
						});
						return;
					}

					if (this.isPay) {
						this.isPay = false;
						wxsdk.goPay({
							payData: this.data.jsonData,
							payCallBack: (res) => {
								if (res) {
									//关闭微信游览器
									this.$store.commit('setWin', {
										content: `支付成功`,
										type: 'alert',
										callBack: () => {
											if (backRoute) {
												this.goEvaluate();
											} else {
												this.$closeWindow();
											}
										}
									});
									this.isPay = true;
								} else {
									this.isPay = true;
									storage.session('isGetPoenId', null);
								}
							}
						});
					}


				}


			},
			goEvaluate() {
				global.evalObj = {
					oid: this.oid,
					type: 3,
					shopName: this.shopName
				};

				this.$router.push('/evaluate');
			},
			getcommentConfig(data) {
				let comment = null; //是否开启评价
				this.commentConfigData = data.commentConfigData;
				if (this.commentConfigData && data.commentConfigData.status == 1) {

					this.channels = this.commentConfigData.channels.split(',').map((item) => {
						return Number(item);
					});
					if (this.channels.indexOf(3) > -1) {
						comment = true;
						global.evalObj = {
							oid: data.oid,
							type: 3,
							shopName: this.shopName
						};
						storage.session('commentConfigData', data.commentConfigData);
					}
				}
				return comment && this.commentConfigData.jumpCode == '0';
			},
			choosePerson() {
				// 选择人数
				this.personObj.list = Number(this.payConfig.person) || 1;
				if (this.personObj.list == 1) {
					return false;
				}
				this.personObj.id = 'multi-picker';
			},
			closePicker(obj) {
				this.personObj.id = '';
				if (obj.type === 'sure' && this.personObj.type === 'personPicker') {
					this.person = obj.payload;
				}
			},
			isShopId() {

				if (this.useShopIds.indexOf(this.shopId) > -1 || this.useShopIds == '') {
					this.unshop = true; //适用门店
					storage.session('unshop', this.unshop);

				} else {
					this.unshop = false; //不适用门店
					storage.session('unshop', this.unshop);

				}
			}
		},
		beforeMount() {
			this.isReady = true;

		},
		watch: {
			'total': function() {
				this.total = String(this.total).substring(0, 8);
				this.point = 0;
				this.notDiscountPrice = Number(this.notDiscountPrice) > Number(this.total) ? this.total : this.notDiscountPrice;
				this.throttlePrice();
				this.throttleCoupon();
			},
			'notDiscountPrice': function() {
				this.throttlePrice();
			},
			'point': function() {
				this.throttlePrice();
				if (this.isIntegral) {
					let sum = (Number(this.calculatedValue) - Number(this.point / this.integralConfig.point * this.integralConfig.pointCash)).toFixed(2);
					this.actualAmount = (sum > 0) ? sum : 0;
				} else {
					this.actualAmount = this.calculatedValue;
				}

				this.integralAmount = (Number(this.point / this.integralConfig.point * this.integralConfig.pointCash).toFixed(2));
			},
			'maxPoint': function() {
				this.point = (this.integralConfig.useMode == '1' ? this.maxPoint : this.point) || 0;
			},
			'$route': function(val, oldVal) {

				if (!this.isPaySuccess && val.path == '/preferentialPay') {

					let level = storage.session('level');
					if (level) {
						this.level = level;
					}

					let isCoupon = this.coupon = storage.session('couponOn');
					storage.session('couponOn', isCoupon);
					this.isCoupon = Boolean(storage.session('couponOn'));
					this.point = 0;
					this.clickPay = false;

					if (oldVal.path == '/MemberRegister' || oldVal.path == '/choseCard') {
						this.getUserInfo();
					}

					this.throttlePrice();
					this.throttleCoupon();
				}
			}
		},
		components: {
			'win': () => import( /* webpackChunkName: 'win' */ 'src/components/phone/win'),
			'multi-picker': () => import( /* webpackChunkName: 'multi_picker' */ 'src/components/multipicker/index')
		},
		computed: {
			usePoint: {
				get: function() {
					return this.point;
				},
				set: function(newValue) {
					this.point = newValue.replace(/[^\d]/g, '') || 0;
					this.point = (this.point > this.maxPoint) ? this.maxPoint : this.point;
				}
			},
			notDiscountPrices: {
				get: function() {
					return this.notDiscountPrice;
				},
				set: function(newValue) {
					this.notDiscountPrice = newValue.replace(/[^\d]/g, '');
					this.notDiscountPrice = Number(newValue) > Number(this.total) ? this.total : newValue;
				}
			}
		},
		async mounted() {

			await this.getUserInfo();
			// this.getPointConfig();
			let isGetPoenId = storage.session('isGetPoenId');
			let openId = storage.session('openId');

			let preAllData = storage.session('preAllData');
			if (preAllData) {
				let comm = preAllData.commentConfigData;
				let oid = preAllData.oid;
				// delete preAllData.oid;
				delete preAllData.commentConfigData;

				Object.assign(this, preAllData);

				if (preAllData.oid) {
					storage.session('preAllData', null);

					let d = await http.getStatusByOid({
						data: {
							shopId: this.shopId,
							oid: oid
						}

					});

					if (d) {
						this.comment = this.getcommentConfig({
							commentConfigData: comm
						}); //是否开启评价
						this.$store.commit('setWin', {
							content: `支付成功`,
							callBack: () => {
								if (this.comment) {
									global.evalObj = {
										oid: data.oid,
										type: 3,
										shopName: this.shopName
									};
									this.$router.push('/evaluate');
								} else {
									this.$closeWindow();
								}
							}
						});
					} else {
						this.$store.commit('setWin', {
							content: '支付失败'
						});
					}
				}

			}

			if (isGetPoenId) {
				await this.getOpenId();
				if (openId) this.isReady = true;
			}

			this.throttlePrice = utils.throttle(this.preComputingPriceAndPoint, 800, 2000, this.total);
			await this.preComputingPriceAndPoint(preAllData ? '2' : '0');
			
			let data = await import( /* webpackChunkName:'wx_sdk' */ 'src/manager/platform_sdk.js');
			wxsdk = data.default;
			this.coupon = storage.session('couponOn');
			this.isCoupon = Boolean(storage.session('couponOn'));
			this.throttleCoupon = utils.throttle(this.getCouponListNew,800,2000,this.total);
			this.isShopId();
			utils.setTitle('快捷支付');
		}
	};
</script>
<style lang='less' scoped>
	@import '../../../res/css/base.less';

	.order_pay {
		.setBox(100%, auto);
		min-height: 100%;
		background-color: #ffffff;

		.header {
			.setBox(100%, 3.6267rem);
			background: url(../../../res/images/pay_bg.png) center center no-repeat;
			background-size: cover;

			.shopName {
				height: 1.56rem;
				line-height: 1.56rem;
				font-size: .32rem;
				color: #FFFFFF;
				text-align: center;
			}

			.amount_input {
				.setBox(8.9067rem, 1.2rem);
				line-height: 1.2rem;
				background: #FFFFFF;
				margin: 0 auto;
				position: relative;

				&>span {
					display: block;
					.setBox(2.7467rem, 1.2rem);
					text-align: center;
					font-size: .4rem;
					color: #303030;
				}
			}

			.checkbox {
				.setBox(8.9067rem, .8667rem);
				margin: 0 auto;
				margin-top: .2267rem;
				font-size: .32rem;
				color: #999999;
				text-indent: .2rem;

				input[type='checkbox'] {
					margin-top: .3333rem;
				}
			}
		}

		.content {
			padding: .4rem .5467rem;
			margin-bottom: 1.0667rem;
			.setBox(100%, auto);
			overflow: hidden;

			.item {
				background: #F2F2F2;
				.setBox(auto, 1.2rem);
				line-height: 1.2rem;
				margin-bottom: .2667rem;

				.title {
					.setBox(2rem, auto);
					display: inline-block;
					font-size: .3733rem;
					color: #303030;
					margin-left: .5733rem;
					margin-right: .2rem;
					.text-overflow;
				}

				.money {
					font-size: .32rem;
					color: #D0021B;
				}

				.describe {
					font-size: .32rem;
					color: #999999;
				}

				&:last-of-type {
					margin-bottom: 0;
				}
			}
		}
	}

	.payType {
		background: rgba(0, 0, 0, 0.50);
		position: fixed;
		z-index: 10;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		.content_type {
			position: absolute;
			width: 7.3733rem;
			height: 4.5333rem;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
			background-color: white;
			border-radius: 0.2667rem;

			.title {
				font-size: 0.3733rem;
				color: #303030;
				text-align: center;
				height: 1rem;
				line-height: 1rem;
				font-weight: bold;
			}

			.icon {
				display: flex;
				align-items: center;
				justify-content: center;
				height: calc(~'100% - 1rem');

				&>div {
					flex: 1;
					text-align: center;

					img {
						width: 1.0667rem;
						height: 1.0667rem;
						vertical-align: middle;
					}

					.n {
						font-size: 0.32rem;
						color: #303030;
						line-height: 0.6133rem;
						vertical-align: middle;
					}
				}

				&>div:nth-child(1) {
					position: relative;
				}

				&>div:nth-child(1)::after {
					content: '';
					position: absolute;
					width: 0.0267rem;
					height: 1.6533rem;
					background-color: #F0F0F0;
					right: 0;
					top: 0;
				}
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

	::-webkit-input-placeholder {
		font-size: .3467rem;
		color: #999999;
		line-height: 0.6133rem;
	}

	.check {
		background: #FFFFFF;
		.setBox(.4rem, .4rem);
		display: block;
		position: relative;
		background: url(../../../res/images/check.png) center center no-repeat;
		background-size: .4rem .4rem;
	}

	.checkOn {
		background: url(../../../res/images/check_on.png) center center no-repeat;
		background-size: .4rem .4rem;
	}

	.preferential_rules {
		font-size: .32rem;
		color: #44C0FF;
		.setBox(1.8667rem, .9333rem);
		line-height: .9333rem;
		background: url(../../../res/images/rules_icon.png) right center no-repeat;
		background-size: .4rem .4rem;
	}

	.pay_btn {
		display: block;
		.setBox(8.9067rem, 1.2rem);
		line-height: 1.2rem;
		font-size: .4rem;
		color: #FFFFFF;
		text-align: center;
		background: #D5D5D5;
		margin: 0 auto;
		transition: all 0.5s;
	}

	.more {
		background: url(../../../res/images/more.png) center center no-repeat;
		background-size: .2133rem .3467rem;
		.setBox(.5333rem, 100%);
		margin-right: .4667rem;
	}

	.tips {
		background: url(../../../res/images/pay_tpis.png) center center no-repeat;
		background-size: .4rem .4rem;
		.setBox(.5333rem, 100%);
		display: inline-block;
	}

	.switch {
		background: url(../../../res/images/pay_off.png) center center no-repeat;
		background-size: 1.0267rem .4933rem;
		.setBox(1.0667rem, 100%);
		display: inline-block;
		margin-right: .4667rem;
		transition: all 0.2s;
	}

	.switchOn {
		background: url(../../../res/images/pay_on.png) center center no-repeat;
		background-size: 1.0267rem .4933rem;
	}

	.points {
		.setBox(4rem, 100%);
		.text-overflow;
	}

	.rules_content {
		.setBox(6.5333rem, auto);
		margin: 0 auto;
		margin-bottom: .2667rem;
		// padding: .5333rem .4533rem 0 .4533rem;
		padding-top: .5333rem;

		.rules_title {
			font-size: .4533rem;
			color: #303030;
			text-align: center;
			margin-bottom: .2rem;
		}

		ul {
			list-style-type: disc;
			margin-left: .4667rem;

			li {
				font-size: .3467rem;
				color: #303030;
				line-height: .6133rem;
			}
		}
	}

	.point_input {
		.setBox(3.3333rem, .8rem);
		line-height: .8rem;
		margin-top: .2rem;
		border: none;
		background: #F2F2F2;
		color: #999999;
	}

	.point_input::-webkit-input-placeholder {
		line-height: 0.8rem;
	}

	.integral_des {
		margin-right: .4667rem;
		width: 2.3rem;
		text-align: right;
		.text-overflow;
	}

	.black {
		background-color: #000000;
	}

	.total_input {
		position: absolute;
		right: 0;
		top: 0;
		font-size: .7467rem;
		color: #D0021B;
		// text-shadow: 0 0 #E00923;
		.setBox(auto, 1.18rem);
		min-width: 1rem;
		max-width: 3.6rem;
		overflow: hidden;
		line-height: 1.5;
		margin-right: .4rem;
		// margin-top: .16rem;
		padding: none;
		border: none;
		text-align: right;
	}

	.show_input {
		text-align: right;
		font-size: .7467rem;
		color: #D0021B;
		.setBox(auto, 1.2rem);
		line-height: 1.5;
		// z-index: 5;
		position: relative;
		right: .4rem;
		bottom: 0;
		// margin-right: .4rem;
	}

	.total_input::-webkit-input-placeholder {
		line-height: 1.2rem;
	}

	.coin {
		font-size: .7467rem;
		color: #E00923;
		text-align: right;
		.setBox(auto, 1.2rem);
		line-height: 1.65;
		position: relative;
		right: 0.25rem;
		top: -0.05rem;
	}

	.member_link {
		font-size: .32rem;
		color: #44C0FF;
		height: 100%;
		display: inline-block;
		margin-right: .4667rem;
	}

	.analog_input {
		.setBox(auto, 1.2rem);
		min-width: 1rem;
		line-height: 1.2rem;
		font-size: .7467rem;
		color: #E00923;
		// color: transparent;
		// text-shadow: 0 0 0 #E00923;
		// text-align: right ;
		// margin-right: .4rem;
	}

	.tipss {
		text-align: center;
		display: inline-block;
		width: 100%;
		color: #999;
		padding: 0.2rem 0;
	}
</style>