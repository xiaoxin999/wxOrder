<template>
	<div class="member_register">
		<div class="page_head">欢迎加入{{oftenShopName}}会员，请您认真填写注册信息~</div>
		<div class="formgroup">
			<div class="form_input" :class="[isphoneActive? 'active':'unactive']">
				<label for="tel">手机号</label>
				<input type="text" maxlength="11" v-on:input="checkPhone()" v-model="mobile" @blur="toBlur('phone')" @focus="toFocus('phone')" placeholder="请输入手机号">
			</div>
			<div class="form_input form_input_bg">
				<div class="code_style" :class="[iscodeActive? 'active':'unactive']">
					<label for="code">验证码</label>
					<input type="text" maxlength="4" v-on:input="checkPhone()" placeholder="请输入验证码" @blur="toBlur('code')" @focus="toFocus('code')" v-model="code">
				</div>
				<span v-show="!isCode" @click="sendSMS($event)" :class="[isCodeBtnActive? 'codeActive':'unCodeActive']">发送验证码</span>
				<span v-show="isCode" class="recode gray" readonly='readonly'>({{codeTime}}s)重新获取</span>
			</div>
			<div class="form_input" :class="[isnameActive? 'active':'unactive']">
				<label for="name">姓名</label>
				<input type="text" v-model="name" placeholder="请输入姓名" @blur="toBlur('name')" @focus="toFocus('name')" maxlength="10">
			</div>
			<div class="form_input sex_check">
				<span v-for="(i,index) in sexList" :class="i.isOn  ? 'sexOn' : ''" @click="setSex(index)" :key="index">{{i.name}}</span>
			</div>
			<div class="form_input form_input_birth" @click="handleDateShow">
				<label for="tel">生日</label>
				<input class="birth_span" v-model='birthday' placeholder="请填写生日" disabled style="height:1.21rem">
				<span>
					<img src="../../res/images/sell_assis/back_icon.png" alt="">
				</span>
			</div>
			<!-- <div class="form_input form_input_birth" @click="toOfenShop">
                    <label for="tel">常去门店</label>
                    <input class="birth_span" v-model='detail.name' placeholder="请选择门店" style="height:1.21rem">
                    <span>
                        <img src="../../res/images/sell_assis/back_icon.png" alt="">
                    </span>
                </div> -->
		</div>
		<div class="form_input_button">
			<button type="button" :class="[isButtonActive? 'buttonActive':'unButtonActive']" @click="registerMember">提交</button>
		</div>
		<transition name="fade">
			<component :recent_time="recent_time" :param="param" :is="dataSelectorComponent" :type="0" @closeData="closeData">
			</component>
		</transition>
	</div>

</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import timer from 'src/verdor/timer';

	let reTime = null;
	export default {
		name: 'test-keep-alive',
		data() {
			return {
				detail: {},
				sexList: [
					{
						name: '先生',
						type: '1',
						isOn: true
					},
					{
						name: '女士',
						type: '2',
						isOn: false
					}
				],
				sexType: '1', //性别
				isA: false,
				isB: false,
				isphoneActive: false,
				iscodeActive: false,
				isnameActive: false,
				isButtonActive: false,
				isCodeBtnActive: false,
				mobile: '', //手机号码
				code: '', //验证码
				isCode: false,
				codeTime: 60,
				birthday: '',
				recent_time: ['1990', '1', '1'],
				dataSelectorComponent: '',
				param: [],
				name: '',
				oftenShopName: '',
				shopId: '',
				openId: '',
				id: this.$route.query.id,
				iswechatPay: storage.session('wechatPay') == undefined ?
					false : storage.session('wechatPay'), // 是否转跳红桌台结账页面
				includedComponents: 'test-keep-alive',
				rechargeShopId: '',
				timeMessage: '本月',
				startTime: '', //开始日期
				endTime: '', //结束日期
				timeYear: '',
				timeData: '',
				codeToken: '',
				memberRouters: {
					'1': '/MembershipInfo',
					'2': '/wechatPay',
					'3': '/preferentialPay',
					'4': '/Pay',
					'5': '/memberStrategy',
				}, // key为类型，value为路由名
				type: this.$route.query.type || storage.session('type'),
				brandId: ''
			};
		},
		methods: {
			setDate() {
				const dates = new Date();
				this.param = ['1900-' + (dates.getFullYear() - 1), '1-12', '1-31'];
			},
			handleDateShow() {
				this.dataSelectorComponent = 'data-selector';
			},
			closeData(val) {
				this.dataSelectorComponent = '';
				if (val.type == 'makeSure') {
					this.birthday = val.data.join('-');
				}
			},
			transformTime(time, type) {
				let format = type ? 'yyyy-MM' : 'yyyy/MM/dd hh:mm';
				return utils.format(time, format);
			},
			toFocus(input) {
				if (input === 'phone') {
					this.isphoneActive = true;
				} else if (input === 'code') {
					this.iscodeActive = true;
				} else {
					this.isnameActive = true;
				}
			},
			toBlur(input) {
				if (input === 'phone') {
					this.isphoneActive = false;
				} else
				if (input === 'code') {
					this.iscodeActive = false;
				} else {
					this.isnameActive = false;

				}
			},
			checkPhone() {
				if (this.mobile.trim() != '' && this.mobile.length == 11 && this.code !== '') {
					this.isButtonActive = true;
					this.isCodeBtnActive = true;

				} else {
					this.isButtonActive = false;
					this.isCodeBtnActive = false;
				}
			},
			setSex(i) {
				for (let j = 0; j < this.sexList.length; j++) {
					this.sexList[j].isOn = false;
					this.sexList[i].isOn = true;
					this.sexType = this.sexList[i].type;
				}
			},
			changeKm(d) {
				if (d > 1000 || d == 1000) d = (d / 1000).toFixed(2) + 'km';
				if (d > 0 && d < 1000) d = '<' + d + 'm';
				return d;
			},
			async sendSMS() {
				this.toFocus('code');
				this.mobile.trim() !== '' && this.code !== '';
				if (this.mobile != '' && this.mobile.length == 11) {
					timer.clear(reTime);
					reTime = timer.add(() => {
						this.codeTime--;
						if (this.codeTime <= 0) {
							timer.clear(reTime);
							this.isCode = false;
							this.codeTime = 60;
						}
					}, 1000, 60, false, () => {
						this.isCode = false;
						this.codeTime = 60;
					});

					// 发送验证码
					let data = await http.sendSMS({
						data: {
							shopId: this.shopId,
							mobile: this.mobile,
							openId: this.openId
						}
					});
					this.isCode = true;
					this.codeToken = data.codeToken;
					if (data.memberData != null) {
						this.mobile = data.memberData.mobile;
						this.name = data.memberData.name;
						this.sexType = data.memberData.gender;
						for (let j = 0; j < this.sexList.length; j++) {
							if (this.sexType == '2') {
								this.sexList[0].isOn = false;
								this.sexList[1].isOn = true;
							}
						}
					}
				}
			},

			async registerMember() {
				if (!utils.checkData(
					{
						mobile: {
							cond: `$$.trim()!='' && this.mobile.length == 11`,
							pro: '请输入正确的手机号'
						},
						code: {
							cond: `$$.trim()!=''`,
							pro: '请输入验证码'
						},
						codeToken: {
							cond: `$$!=''`,
							pro: '验证不通过'
						}
					}, this)) {
					return false;
				}

				let data = await http.registerMember({
					data: {
						shopId: this.shopId,
						mobile: this.mobile,
						openId: this.openId,
						gender: this.sexType,
						birthday: this.birthday,
						name: this.name || '',
						codeToken: this.codeToken,
						code: this.code
					}
				});
				/* eslint-disable */
				switch (Number(this.type)) {
					case 1:
						await this.togetUserInfo();
						this.$router.push(this.memberRouters[this.type]);
						break;
					case 2:
						let wechatShop = storage.session('wechatShop');
						wechatShop.member = utils.deepCopy(data);
						storage.session('wechatShop', wechatShop);
					case 3:
						setTimeout(() => {
							this.$router.push(this.memberRouters[this.type]);
						}, 1000);
						break;
					case 4:
						await this.togetUserInfo();
						storage.session('regiser', false);
						this.$router.replace({
							path: '/pay',
							query: {
								typeInfo: 1
							}
						});
						break;
					case 5:
						let login = storage.session('login');
						login['memberId'] = data.memberId;
						storage.session('login', login);
						this.$router.push(this.memberRouters[this.type]);
						break;

					default:
				}
				/* eslint-disable */
			},
			async togetUserInfo() {
				let res = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: 5,
						from: 0
					}
				});

				Object.assign(res, storage.session('login'));
				storage.session('membership', res);
				storage.session('memberInfo', res);
				storage.session('wechatShop', res);
				storage.session('membership-info', true);
				let goodsList = [];
				goodsList = storage.session('goods');

				if (goodsList && goodsList.length > 0) {
					for (let i = 0; i < goodsList.length; i++) {
						let item = goodsList[i];
						item.memberPrice = global.getAvailPrice(item);
					}
					storage.session('goods', goodsList);
				}
			},
			async getUserInfo() {
				let data = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: '3',
						from: '0'
					}
				});

				Object.assign(data, storage.session('login'));
				this.openId = data.openId;

			}
		},
		beforeDestory() {
			//切换页面清除计时器
			timer.clear(reTime);
		},
		async mounted() {
			this.brandId = storage.session('brandId');
			this.name = storage.session('login').name;

			this.setDate();
			this.shopId = Number(this.brandId) ? this.brandId : global.getShopId();
			let userDate = (storage.session('membership') == undefined) ? storage.session('wechatShop') : storage.session(
				'membership');
			if (userDate) {
				this.openId = userDate.openId;
			} else {
				await this.getUserInfo();
			}

			utils.setTitle('会员注册');
		},
		components: {
			DataSelector: () =>
				import( /*webpackChunkName: 'dateselector' */ 'src/components/dateselector')
		}
	};
</script>
<style lang='less' scoped>
	.member_register {
		background: #fff;
		height: 100%;
		overflow-y: scroll;

		.page_head {
			width: 100%;
			font-size: 0.32rem;
			color: #FFFFFF;
			text-align: center;
			background-image: url(../../res/images/sell_assis/head_bg.jpg);
			background-repeat: no-repeat;
			background-size: 100% 100%;
			padding: 0.4rem;
			text-align: center;

			.span_l {
				float: left;
				margin-left: 5%;
			}

			.span_s {
				float: right;
				margin-right: 5%;
			}

			.span_name {
				display: inline-block;
				width: 22%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.formgroup {
			height: auto;
			width: 89.2%;
			margin: 0 auto;
			margin-top: 0.38rem;

			.form_input {
				width: 100%;
				height: 1.24rem;
				line-height: 1.2rem;
				margin-bottom: 0.26rem;
				background: #F2F2F2;

				label {
					font-size: 0.4rem;
					color: #303030; // display: inline-block;
					width: 20%;
					text-align: center;
					background: #f2f2f2;
					float: left;
					height: 1.1rem;
				}

				input {
					font-size: 0.32rem;
					color: #999999;
					height: 1.1rem; // line-height: 1.2rem;
					border: none;
					background: #F2F2F2; // float: left; // margin-top: 0.1rem;
				}
			}

			.active {
				border: 1px solid #44C0FF;
				caret-color: #44C0FF
			}

			.unactive {
				border: 1px solid #f2f2f2; // caret-color: #f2f2f2
			}

			.form_input_bg {
				background: #fff;

				.code_style {
					width: 56%;
					height: 1.24rem;
					float: left;
					background: #f2f2f2;

					label {
						width: 36%;
					}

					input {
						width: 64%;
					}
				}

				.codeActive {
					font-size: 0.4rem;
					color: #303030; // display: inline-block;
					width: 40.8%; // background: #f1af5b;
					background: #f1af5b;
					border: none;
					height: 1.24rem;
					float: right;
					text-align: center;
					color: #fff;
				}

				.unCodeActive {
					font-size: 0.4rem;
					color: #303030; // display: inline-block;
					width: 40.8%; // background: #f1af5b;
					background: #D5D5D5;
					border: none;
					height: 1.24rem;
					float: right;
					text-align: center;
					color: #fff;
				}

				.gray {
					font-size: 0.4rem;
					color: #303030; // display: inline-block;
					width: 40.8%; // background: #f1af5b;
					background: #D5D5D5;
					border: none;
					height: 1.24rem;
					float: right;
					text-align: center;
					color: #fff;
				}
			}

			.sex_check {
				background: #fff;

				span {
					font-size: 0.4rem;
					color: #303030; // display: inline-block;
					width: 48.4%;
					text-align: center;
					background: #f2f2f2;
					float: left;
				}

				span:nth-child(2) {
					float: right;
				}

				.sexOn {
					border: 0.0267rem solid #44C0FF;
					color: #44c0ff;
				}
			}

			.form_input_birth {
				.birth_span {
					float: left;
					color: #999999;
					font-size: 0.32rem;
				}

				span {
					float: right;
					margin-right: 2%;

					img {
						width: 0.1733rem;
						text-align: inherit;
					}
				}
			}
		}

		.form_input_button {
			width: 89.2%;
			margin: 0 auto;
			margin-top: 1.38rem;
			height: 1.2rem;
			line-height: 1.2rem;

			.buttonActive {
				width: 100%;
				display: inline-block;
				height: 1.2rem;
				line-height: 1.2rem;
				background: #000;
				border: none;
				font-size: 0.4rem;
				color: #FFFFFF;
			}

			.unButtonActive {
				width: 100%;
				display: inline-block;
				height: 1.2rem;
				line-height: 1.2rem;
				background: #D5D5D5;
				border: none;
				font-size: 0.4rem;
				color: #FFFFFF;
			}
		}
	}
</style>