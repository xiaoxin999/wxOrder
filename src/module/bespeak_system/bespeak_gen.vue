<template>
	<div class="baspeak" id="baspeak" v-cloak>
		<section class="chooseList">
			<div>
				<img :src="getUrl(shopInfo.logoImage)" alt="">
			</div>
			<ul>
				<li>
					<div class="text-over name_div">{{shopInfo.name}}</div> <span class="distance">{{shopInfo.disInfo}}</span>
				</li>
				<li>营业时间：{{shopInfo.time}}</li>
				<li class='text-over'><span> 详细地址：{{shopInfo.address}}</span>
				</li>
			</ul>
		</section>
		<section class="info">
			<div class="baspeak-head baspeak-icon">创建预约</div>
			<div class="baspeak-concent">
				<div @click="handleDateShow" class="baspeak-box content-height">
					<span><em class="required">*</em>到店时间：</span>
					<input type="text" class="wid451" style="text-align:center;text-indent: 0rem;" v-model="time" placeholder="请选择到店时间" readonly />
				</div>
				<div class="baspeak-box content-height">
					<span><em class="required">*</em>姓名：</span>
					<input type="text" class="wid451" placeholder="填写姓名" v-model="names" maxlength="10" />
				</div>
				<div class="baspeak-box content-height">
					<span><em class="required">*</em>人数：</span>
					<div class="addSub">
						<div @click="change(false)">-</div>
						<div>{{num}}</div>
						<div @click="change(true)">+</div>
					</div>
				</div>
				<div class="baspeak-box content-height">
					<span><em class="required">*</em>电话：</span>
					<input type="number" class="wid451" placeholder="输入电话" maxlength="11" v-model="phones" />
				</div>
				<div class="top baspeak-box content-height">
					<span class="fl">备注：</span>
					<textarea type="text" class="textarea fl wid451" style="height:2rem;resize:none" placeholder="输入备注信息" v-model="remark" maxlength="50" />
					</div>
			</div>

			<div id="targetContainers"></div>
			<div class="shop-measking" id="shop-measking">
				<div class="spinner">
					<div class="bounce1"></div>
					<div class="bounce2"></div>
					<div class="bounce3"></div>
				</div>
			</div>
		</section>
		<div class="baspeak-footer">
			<a href="javascript:void(0)" :class="[baspeakNext ? 'on' : 'off']" @click="createOrderReserves" v-if="status == '0'">确认预约</a>
			<a href="javascript:void(0)" :class="[baspeakNext ? 'on' : 'off']" v-else @click="createOrderReserves">预约点餐</a>
		</div>
		<transition name="fade">
			
			<component
                :type="0"
                :param = "param"
                @closeData = "closeData"
                :fullDose = "fullDose"
                :is="showComponent"
				:minsList="['00','05','10','15','20','25','30','35','40','45','50','55']"
				:hoursDelay="hoursDelay"
				:dayDelay = "dayDelay"
				ref="dateSel"
            ></component>

		</transition>
	</div>
</template>

<script>
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';

	export default {
		name: 'bespeak',
		data() {
			return {
				time: '选择到店时间', //到店时间
				name: '', //用户姓名
				num: 1, //预约人数
				phone: '', //电话号码
				remark: '', //备注
				baspeakNext: false, // 是否满足条件确认预约 || 预约点餐
				status: '', //是否开启预约点餐
				preTime: '', //提前多少时间预约
				type: 0,
				param: ['2018-2019', '1-12', '1-31', '9-20', '0-59'],
				fullDose: true,
				showComponent: '',
				shopInfo: {},
				hourListValue:'',
				hoursDelay:3,
				dayDelay:0
			};
		},
		
		methods: {
			change(type){
				this.num = type ? this.num + 1 : this.num - 1;
				if(this.num < 1) this.num = 1;
				if(this.num > 99) this.num = 99;
			},
			getUrl(url) {
				return global.getImgUrl({
					url
				});
			},
			async createOrderReserves() {
				let res = utils.checkData(
					{
						time: {
							cond: `$$ != ''&& $$ != '选择到店时间'`,
							pro: '请选择到店时间..'
						},
						name: '请填写姓名..',
						num: {
							pro: '请输入人数且必须为数字..',
							reg: /\d+/
						},
						phone: {
							reg: /^1\d{10}$/,
							pro: '电话格式错误..'
						}
					}, this);
				if (!res) {
					return false;
				}
				let dates = Math.round(new Date() / 1000);
				let reserveTime = new Date(this.time);
				reserveTime = Math.round(new Date(reserveTime).getTime() / 1000);

				if (reserveTime < dates) {
					this.valideMsg('到店时间不能小于当前时间..');
					return false;
				}
				let obj = {
					reserveTime: reserveTime,
					name: this.name,
					person: this.num,
					phone: this.phone,
					remark: this.remark
				};
				if (this.status == 1) {
					storage.session('reservationInfo', obj);
					this.goPage('replace');
				}else{
					let data = await http.createReserve({
						data:{
							...obj,
							shopId:storage.session('bespeak_shopInfo').id
						}
					});
					let str = '成功';
					if(!data){
						str = '失败';
					}
					this.$store.commit('setWin',{
						content:`预约${str}`,
						callBack:()=>{
							this.$closeWindow();
						}
					});
				}
			},
			goPage(type = 'push') {
				let selfhelpStyle = storage.session('login').selfhelpStyle;
				storage.session('configStyle', selfhelpStyle);
				if (selfhelpStyle== 1) {
					this.$router[type]('/order');
				} else if (selfhelpStyle == 2) {
					this.$router[type]('/latestOrder');
				}
			},
			valideMsg(content, type = 'alert') {
				this.$store.commit('setWin', {
					content: content,
					type: type
				});
			},
			infoChange() {
				if ((this.time).trim() != '' && (this.time) !='选择到店时间' && (this.name).trim() != '' && (this.phone).trim() != '') {
					this.baspeakNext = true;
				} else {
					this.baspeakNext = false;
				}
			},
			handleDateShow() {
				this.showComponent = 'data-selector';
			},
			closeData(val) {
				this.showComponent = '';
				if (val.type == 'makeSure') {
					let reserveTime = val.data[0] + '/' + val.data[1] + '/' + val.data[2] + '\r' + val.data[3] + ':' + val.data[4];
					this.time = utils.format(new Date(reserveTime), 'yyyy/MM/dd hh:mm');
				}
			},
			async getReserveConf() {
				let res = await http.getReserveConf({
					data: {
						shopId: storage.session('bespeak_shopInfo').id
					}
				});
				this.status = res.status;
				storage.session('preTime', res.preTime);
				let time = +new Date() + (parseInt(res.preTime) * 60 * 1000);
				let date = new Date(time);
				this.recent_time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
			},
			async getUserInfo() {
				const loginInfo = storage.session('login');
				let res = await http.getUserInfo({
					data: {
						shopId: this.shopId,
						type: 1,
						from: 0
					}
				});
				Object.assign(res, loginInfo);
				storage.session('wechatShop', res);
				this.getReserveConf();
			}
		},
		computed: {
			phones: {
				get: function() {
					return this.phone;
				},
				set: function(newValue) {
					this.phone = newValue.replace(/[^\d]/g, '');
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
					this.num = newValue.replace(/[^\d]/g, '');
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
			}
		},
		watch: {
			'time': 'infoChange',
			'name': 'infoChange',
			'num': 'infoChange',
			'phone': 'infoChange'
		},
		async mounted() {

			
			this.getUserInfo();
			
			this.shopInfo = storage.session('bespeak_shopInfo');
			
			let starthours = Math.floor(this.shopInfo.openTime/60) + 4;
			let endhours = Math.floor(this.shopInfo.closeTime/60);
			let now = new Date().getHours();
			//当天已经无法预约


			//营业时间跨天的  不做任何时间的上的限制
			if(endhours > 1440){
				this.hoursDelay = 3;
			}else{
				//没有跨天 但是 查出营业时间了
				if(now + 3 > endhours){
					this.dayDelay = 1;
					this.hoursDelay = 0;
				}else{
					this.dayDelay = 0;
					this.hoursDelay = 3;
				}
			}

			if(endhours == 24){
				endhours = 23;
			}
			this.$set(this.param,3,`${starthours-4}-${endhours}`);
			storage.session('channelType','5');
			utils.setTitle('预约点单');
		},
		components: {
			DataSelector: () => import( /*webpackChunkName: "dateselector" */ 'src/components/dateselector'),
		}
	};
</script>

<style lang="less" scoped>
	.baspeak {
		width: 100%;
		height: 100%;
		background: #f8f8f8;
		overflow: hidden;

		.chooseList {
			width: 90%;
			height: 2.42rem;
			line-height: 2.42rem;
			margin: 0.5rem auto 0.35rem auto;

			&>div {
				margin: 0 auto;

				img {
					width: 1.8rem;
					height: 1.8rem;
					border-radius: 100%;
					float: left;
					line-height: 2rem;
					text-align: center;
					border: 1px solid #ddd;
					margin: 0.22rem;
				}
			}

			ul {
				height: 2rem;

				li {
					line-height: 0.66rem;
				}

				li:nth-child(1) {
					font-size: 0.4rem;
					color: #303030;
					font-weight: 600;
					margin-top: 0.22rem;
					position: relative;

					.name_div {
						width: 5rem;
					}

					span {
						float: right;
						margin-right: 0.2rem;
						font-size: 0.32rem;
						color: #EAC048;
						font-weight: 500;
						position: absolute;
						right: 0.2rem;
						top: 0rem;
					}
				}

				li:nth-child(2),
				li:nth-child(3) {
					color: #999;
					font-size: 0.32rem;

				}

				li:nth-child(3) {
					position: relative;

					span {
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						width: 80%;
						display: inline-block;
					}

				}

			}

		}

		.info {
			width: 90%;
			height:9.7067rem;
			margin: 1rem auto 0 auto;
			background: #fff;
			
			.baspeak-head {
				width: 100%;
				height: 1.16rem;
				line-height: 1.16rem;
				padding: 0 0.4267rem;
				border-bottom: 0.9975px solid #e5e5e5;
				font-size: 0.4rem;
				color: #000000;
			}

			.baspeak-concent {
				background-color: #fff;
				padding-left: 15px;
				width: 100%;
				height: auto;
				margin-bottom: 70px;

				
				.baspeak-box {
					width: 100%;
					margin: 0.4rem 0;
					height: 0.9333rem;
					line-height: 0.9333rem;
					position: relative;
					display: flex;
					align-items: center;
					justify-items: center;
			
					.required {
						width: 0.04rem;
						height: 0.9333rem;
						line-break: 50px;
						display: inline-block;
						color: red;
						position: absolute;
    					margin-left: -0.3rem;
					}

					span {
						font-size: 12px;
						text-align: right;
						width: 1.8667rem;
					}
					.addSub{
						width: 6.0133rem;
						height: 0.9333rem;
						line-height: 0.9333rem;
						display: flex;
						justify-items: center;
						align-items: center;
						text-align: center;
						div{
							vertical-align: middle;
							border: 0.0267rem solid #DEDEDE;
							border-radius: 0.1333rem;
							font-size: 0.4rem;
						}
						div:nth-child(1),div:nth-child(3){
							width: 1.3333rem;
							font-size: 0.65rem;
						}
						div:nth-child(2){
							margin: 0 0.2rem;
							width: 2.9333rem;
							font-size: 0.5rem;
						}
						
					}
					.wid451{
						width: 6.0133rem;
						height: 0.9333rem;
						line-height: 0.9333rem;
						border: 0.0267rem solid #DEDEDE;
						border-radius: 0.1333rem;
						vertical-align: middle;
						color: black;
						text-align: left;
						padding-left: 0.25rem;
					}
					.textarea{
						line-height: 0.45rem;
						padding-top: 0.2rem;
						color: black;
					}
					input {
						width: calc(80% - 20px);
						height: 50px;
						outline: none;
						resize: none;
						border: none;
						text-indent: 0.05rem;
					}
				}
				.top{
					align-items:flex-start;
				}
				.baspeak-box:last-child {
					border-bottom: none;
				}
			}



			.baspeak-success-icon {
				background-image: url(../../res/images/bespeak-success.png);
				background-position: center center;
				background-repeat: no-repeat;
				background-size: 93px 93px;
				width: 100%;
				height: 150px;
			}

			.success-tit {
				font-size: 18px;
				color: #000000;
				text-align: center;
				width: 100%;
				height: 50px;
				line-height: 50px;
				margin-bottom: 10px;
			}

			.success-info {
				color: #999999;
				width: 100%;
				height: 20px;
				line-height: 20px;
				text-align: center;
			}
		}

		.more {
			background: url("../../res/images/more.png") center center no-repeat;
			background-size: 8px 16px;
		}

		input[type="text"]:disabled,
		input[type="number"]:disabled {
			background-color: #FFFFFF !important;
		}

		.shop-measking {
			width: 100%;
			height: 100%;
			background-color: #FFFFFF;
			position: fixed;
			top: 0;
			left: 0;
			display: none;
		}
	}

	.baspeak-footer {
		width: 100%;
		height: 50px;
		position: absolute;
		left:0;
		bottom:0;
		a {
			display: block;
			height: 50px;
			line-height: 50px;
			text-align: center;
			font-size: 16px;
		}

		a:hover {
			text-decoration: none;
		}

		.on {
			background-color: #f3bc61;
			color: #FFFFFF;
		}

		.off {
			background-color: #f8f8f8;
			color: #000000;
			border: 1px solid #dfdfdf;
		}

	}

	.spinner {
		/*width: 150px;*/
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);

		>div {
			width: 30px;
			height: 30px;
			background-color: #F8931F;
			border-radius: 100%;
			display: inline-block;
			-webkit-animation: bouncedelay 1.4s infinite ease-in-out;
			animation: bouncedelay 1.4s infinite ease-in-out;
			-webkit-animation-fill-mode: both;
			animation-fill-mode: both;
		}

		.bounce1 {
			-webkit-animation-delay: -0.32s;
			animation-delay: -0.32s;
		}

		.bounce2 {
			-webkit-animation-delay: -0.16s;
			animation-delay: -0.16s;
		}
	}



	@-webkit-keyframes bouncedelay {

		0%,
		80%,
		100% {
			-webkit-transform: scale(0.0)
		}

		40% {
			-webkit-transform: scale(1.0)
		}
	}

	@keyframes bouncedelay {

		0%,
		80%,
		100% {
			transform: scale(0.0);
			-webkit-transform: scale(0.0);
		}

		40% {
			transform: scale(1.0);
			-webkit-transform: scale(1.0);
		}
	}
</style>