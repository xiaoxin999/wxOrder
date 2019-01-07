<template>
	<div id="my-coupon">
		<div class="content tomagin">
			<div class="content_t">
				<!-- 优惠券类型 -->
				<div class="less" style="background: #00a0ea;" v-if=" info.type == 1 || info.type == 2 || info.type == 8 || (info.type == 9 && info.discountType == 2)">
					<h1>减</h1>
				</div>
				<div class="less" style="background: #89b053;" v-if="info.type == 3 || info.type == 4 || (info.type == 9 && info.discountType == 1)">
					<h1>折</h1>
				</div>
				<div class="less" style="background: #ca5040;" v-if="info.type == 5 ">
					<h1>赠</h1>
				</div>
				<div class="less" style="background: #ebca0b;" v-if="info.type == 6 || (info.type == 9 && info.discountType == 3)">
					<h1>代</h1>
				</div>
				<div class="less" style="background: #ca5040;" v-if="info.type ==10">
					<h1>送</h1>
				</div>
				<div class="less" style="background: #00a0ea;" v-if="info.type == 11">
					<h1>定</h1>
				</div>
				<div class="qrcode" v-if='couponState '>
					<img src="../../res/icon/erwweima.png" @click="isCode()" v-if=" (sendCouponStatus == 1 || sendCouponStatus == 2) && (currentTime < info.endTime || info.status != 1 )" />
				</div>
				<div class="qrcode" v-if='codeState'>
					<img src="../../res/icon/6_03.png" @click="isCode()" />
				</div>
				<!--优惠券名称-->
				<template v-if="info.couponName">
					<div class="name" style="font-size: 0.4rem;" v-if="info.couponName.length <= 15">
						<!-- {{info.couponName}} -->
						{{shopName}}
					</div>
					<div class="name" style="font-size: 0.32rem;" v-else-if="info.couponName.length >= 15 && info.couponName.length <= 36">
						{{shopName}}
					</div>
					<div class="name" style="font-size: 0.27rem;" v-else-if="info.couponName.length >= 36 && info.couponName.length <= 60">
						{{shopName}}
					</div>
				</template>

				<!--优惠券类型-->
				<div class="amount" v-if="info.type == 1 || info.type == 2 || info.type == 6 || info.type == 8 || info.type== 11">
					<span>¥ &nbsp;</span>
					<h1>{{getRate(info)}}</h1>
				</div>
				<div class="amount" v-if="info.type == 3 || info.type == 4">
					<h1>{{getRate(info)}}</h1>
				</div>
				<div class="amount" v-if="(info.type == 5 && dishes.length <= 15) || info.type == 10">
					<h1 v-if="dishes.length == 1" style="font-size: 0.32rem;">{{dishes[0]}}</h1>
					<h1 v-else></h1>
				</div>
				<!-- 优惠券类型 -->
				<div class="coupon" v-if="info.type == 1 || info.type == 2">
					满减优惠券
				</div>
				<div class="coupon" v-if="info.type == 3 || info.type == 4 || (info.type == 9 && info.discountType == 1)">
					折扣券
				</div>
				<div class="coupon" v-if="info.type == 5">
					赠品券
				</div>
				<div class="coupon" v-if="info.type == 6 || (info.type == 9 && info.discountType ==3)">
					代金券
				</div>
				<div class="coupon" v-if="info.type == 8  || (info.type == 9 && info.discountType == 2)">随机立减券</div>
				<div class="coupon" v-if="info.type == 10">买送券</div>
				<div class="coupon" v-if="info.type == 11">定额券</div>
			</div>
			<div class="content_b" v-if='couponState'>
				<div class="immediate" v-if="!this.total ">
					<template v-if="sendCouponStatus!=1">
						<a href="javascript:;" style="background: #999;" v-if="currentTime > info.endTime">已过期</a>
						<a href="javascript:;" style="background: #999;" v-if="info.status == 1">已使用</a>
						<a href="javascript:;" v-if="info.status == 0 && currentTime < info.endTime " @click="isCode()" :style="bgStyle">立即使用</a>
					</template>
					<div class="semicircle" style="left: -0.18rem;"></div>
					<div class="semicircle" style="right: -0.18rem;"></div>
				</div>
				<div class="immediate" v-else>
					<div class="button able" :class="{'able':total.status == 1 , 'disable' : total.status == 0 }" @click="clickItem(total)">
						{{total.des}}
					</div>
				</div>
				<div class="rlues clearfix">
					<ul>
						<li v-if="info.lowestConsume == 0 && (info.type == 1 || info.type == 2)">任意金额可用，最高减免{{getRate(info)}}元</li>
						<li v-if="info.lowestConsume == 0 && (info.type == 8)">任意金额可用，随机减免{{getRate(info)}}元</li>
						<li v-if="info.lowestConsume == 0 && (info.type == 3 || info.type == 4)">任意金额可用，最高折扣{{getRate(info)}}</li>
						<li v-if="info.lowestConsume == 0 && (info.type == 6)">任意金额可用，最高抵扣{{getRate(info)}}元</li>
						<li v-if="info.lowestConsume != 0 && (info.type == 1 || info.type == 2)">支付金额满{{info.lowestConsume}}可用，最高减免{{getRate(info)}}元</li>
						<li v-if="info.lowestConsume != 0 && (info.type == 8)">支付金额满{{info.lowestConsume}}可用，随机减免{{getRate(info)}}元</li>
						<li v-if="info.lowestConsume != 0 && (info.type == 3 || info.type == 4)">支付金额满{{info.lowestConsume}}可用，最高折扣{{getRate(info)}}</li>
						<li v-if="info.type == 11">
							使用该优惠券购买指定商品只需支付{{getRate(info)}}元。
							<!-- <span v-for="(i,index) in dishes" :key="index">
								{{i}},
							</span>选1 -->
						</li>
						<!-- <li v-if="info.lowestConsume != 0 && info.type == 5">支付金额满{{info.lowestConsume}}可用，赠送{{dishes}}</li> -->
						<!-- 多个赠品选择 -->
						<li v-if="info.type == 5">赠送商品{{dishes.length}}选1，赠送
							<span v-for="(i,index) in dishes" :key="index">
								{{i}},
							</span>
						</li>
						<li v-if="info.type == 10">该优惠券购买指定商品买{{info.goodsNum}}送{{info.giveNum}}
							<!-- <span v-for="(i,index) in dishes" :key="index">
								{{i}},
							</span> -->
						</li>
						<li v-if="info.type == 9">
							使用该优惠券购买指定商品第二件
							<template v-if="info.discountType == 1">
								{{getRate(info)}}折
								<span v-text="info.isSuperposition==1?'(可叠加使用)':''"></span>。
							</template>
							<template v-else-if="info.discountType == 2">
								立减{{getRate(info)}}元
								<span v-text="info.isSuperposition==1?'(可叠加使用)':''"></span>。
							</template>
							<template v-else-if="info.discountType == 3">
								{{getRate(info)}}元
								<span v-text="info.isSuperposition==1?'(可叠加使用)':''"></span>。
							</template>
						</li>
						<!-- <li v-if="storename">本券仅限{{storename}}使用</li> -->
						<li v-if="info.sharingStatus == 0">使用该优惠券使用时，不与会员折扣/会员价，满减活动，店内折扣，积分抵扣共享。</li>
						<li v-if="info.sharingStatus == 2">使用该优惠券使用时，不享有会员折扣/会员价，积分抵扣。但是享有满减活动，店内折扣等优惠。</li>
						<li v-if="info.sharingStatus == 1">使用该优惠券使用时，叠加享有会员折扣/会员价，积分抵扣，满减活动，店内折扣等优惠。</li>
						<li v-if="info.validityType == 0">
							有效期：{{info.relativeTime}}日内有效
						</li>
						<li v-else>
							有效期： {{transformTime(info.startTime)}}~{{transformTime(info.endTime)}}
						</li>
						<li><span @click="applicationStore()">查看适用门店</span></li>
					</ul>
					<div class="semicircle" style="left: -0.18rem;"></div>
					<div class="semicircle" style="right: -0.18rem;"></div>
				</div>
				<div class="instructions">
					<h1>使用说明</h1>
					<section v-if="info.useTime">
						<span v-for="(item,index) in info.lists" :key='index'>
							{{item.name}}
						</span>
					</section>
					<template v-if="info.annotation != ''">备注:{{info.annotation}}<br /></template>
					<template v-else>备注:无<br /></template>
					<template v-if="info.useKnow != ''">使用须知:{{info.useKnow}}</template>
					<template v-else>使用须知:无</template>
				</div>
			</div>
			<div class="content_code" v-if='codeState'>
				<div class="coder">
					<img :src="imgUrl" />
					<p style="font-size: 0.4rem;">{{info.code}}</p>
				</div>
				<p>请出示上方二维码即可享受优惠</p>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	let brandId = utils.getQueryString('shopId');
	let activityId = utils.getQueryString('activityId') || 'asd';
	let wx_sdk = null;
	// 1.单品减免 2.整单减免 3.单品打折 4.整单打折 5.赠菜 6.代金券 8.随机减免券
	export default {
		data() {
			return {
				codeState: false, //是否显示二维码
				couponState: true, //状态
				token: '',
				total: null,
				info: {
					shopId: '',
					vipId: '',
					code: '',
					couponId: '',
					activityId: '',
					couponName: '',
					startTime: '',
					endTime: '',
					status: '',
					type: '',
					gids: '',
					pids: '',
					param: '',
					useTime: '',
					lowestConsume: '',
					highestConsume: '',
					annotation: '',
					useKnow: '',
					lists: [],
					sharingStatus: '' //0表示不参与优惠共享，2表示参与且不与会员卡共享，1表示参与且与会员卡共享
				},
				dishes: [], //赠菜优惠券赠送的菜品
				// goods:'豆腐,辣条,黄瓜,清蒸鲈鱼,面汤,馒头',
				// storename: '', //优惠券限用的店铺名称
				shopIds: '', //适用门店的id 
				currentTime: Date.parse(new Date()) / 1000, //当前的时间
				imgUrl: '', //二维码地址
				'bgStyle': {
					'background': '#00a0ea'
				},
				shopList: [],
				sendCouponStatus: false, // 从发放优惠券跳来的
				shopName: ''

			};
		},
		methods: {

			success(item) {
				this.getWin({
					ok: {
						content: '我的卡包',
						style: {
							color: '#EAC048'
						}
					},
					cancel: {
						content: '确定'
					},
					callBack: (str) => {
						if (str == 'ok') {
							this.goCoupon();
						}
					},
					content: `<h3 style='font-size: 0.48rem;font-weight:bold'>${item.channel == 1 ?'购买成功' :'领取成功'}</h3></br><span style='font-size: 0.4rem;'>您可前往<我的卡包>查看优惠券</span>`
				});
			},
			async clickItem(item) {

				if (item.status == 1) {
					let obj = {
						shopId: this.shopId,
						activityId,
						couponId: item.id,
						payType: 'wx'
					};
					//付钱的回调
					if (item.channel) {
						wx_sdk.goPay({
							payData: obj,
							payLink: 'getActCoupon',
							payCallBack: (status) => {
								if (status) {
									this.success(item);
								} else {
									this.$store.commit('setWin', {
										content: '购买失败'
									});
								}
							}
						});
					} else {
						let data = await http.getActCoupon({
							data: obj
						});

						if (data) {
							this.success(item);
						} else {
							this.$store.commit('setWin', {
								content: '领取失败'
							});
						}
					}

				}

			},

			applicationStore() {

				this.$router.push({
					path: '/applicationStore',
					query: {
						id: 2
					}
				});

			},
			isCode: function() { //显示二维码的状态
				this.codeState = !this.codeState;
				this.couponState = !this.couponState;
				this.getClass();

			},
			//把时间戳转化成***年**月**日
			transformTime: function(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd');
			},
			getClass: function() { //根据优惠券的类型不一样改变按钮的颜色
				let num = this.info.type;
				if (num == 8 || num == 11 || (num == 9 && this.info.discountType == 2)) {
					this.bgStyle = {
						'background': '#00a0ea'
					};
				} else if (num == 3 || num == 4 || (num == 9 && this.info.discountType == 1)) {
					this.bgStyle = {
						'background': '#69a834'
					};

				} else if (num == 5 || num == 10) {
					this.bgStyle = {
						'background': '#ca5040'
					};
				} else if (num == 6 || (num == 9 && this.info.discountType == 3)) {
					this.bgStyle = {
						'background': '#ebca0b'
					};
				}

			},
			getRate: function(c) { //减免金额与折扣的转换
				if (c.type == 3 || c.type == 4) {
					let num = (c.param - 0) / 10;
					num += '折';
					return num;
				} else {
					return c.param;
				}
			},
			async getParticulars() {
				let data = await http.getGoodsInfoByCouponId({
					data: { //获取优惠券
						couponId: this.info.couponId,
						shopId: this.info.shopId
					}
				});


				storage.session('arrShopIds', data.shopIds);
				this.dishes = data.goods;

				// this.storename = data.shopName;

			},
			getUseTime: function() {

				let useTime = this.info.useTime;
				if (!useTime) return;
				let info = '';
				let arr1 = []; //展示使用时段的数组
				if (useTime.type == 'week') { //星期                  
					info += '';
				} else { //月份
					info += '每月';
				}
				let arr;
				if (!useTime.list) { //如果没有时间段就是无限制
					arr1.push({
						name: '无限制'
					});
					info = '';
				} else {
					for (let i = 0; i < useTime.list.length; i++) {
						//将week转换为string格式然后再进行分割
						arr = String(useTime.list[i].week).split(',');
						arr = arr.sort(function(a, b) {
							return a - b;
						});
						info += this.getDate(arr);
						info += ' ';
						//判断isNextDay是否为undefined，如果是则进行强制转换
						//转换结果：当isNextDay是undefined时，转换为false，再进行判断
						if (useTime.list[i].isNextDay == undefined) {
							useTime.list[i].isNextDay = Boolean(useTime.list[i].isNextDay);
						}
						info += useTime.list[i].startslot;
						info += '-';
						(useTime.list[i].isNextDay == false) ? info += '次日' + useTime.list[i].endslot: info += useTime.list[i].endslot;
						//解析数据，逐条显示
						arr1.push({
							name: info
						});
						//数据解析出来每次push之后都要清空一次
						info = '';
					}
				}
				this.lists = utils.deepCopy(arr1);
				console.log(this.lists, 'this.lists');
				console.log(info, 'info');
				return info;
			},
			getDate: function(arr) {
				let res = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
				let str = '';

				function findItem(item, arr) {
					let index = arr.indexOf(item);
					for (let i = index; i < arr.length; i++) {
						if (arr[i + 1] - arr[i] != 1) {
							let rs = '';
							if (arr[i] - item == 0) {
								rs = res[arr[i]];
							} else if (arr[i] - item == 1) {
								rs = res[item] + ',' + res[arr[i]];
							} else {
								rs = res[item] + '到' + res[arr[i]];
							}
							if (i < arr.length - 1) {
								rs += ',';
							}
							return rs;
						}
					}
				}
				for (let j = 0; j < arr.length; j++) {
					if (arr[j] - arr[j - 1] != 1) {
						str += findItem(arr[j], arr);
					}
				}
				return str;
			}
		},
		async mounted() {
			this.info = storage.session('couponDetail');
			this.sendCouponStatus = this.$route.query.ss;

			if (!this.info.couponName && this.info.name) this.info.couponName = this.info.name;

			// console.log(this.info,'info');

			wx_sdk = await import( /*webpackChunkName: 'wx_sdk'*/ 'src/manager/platform_sdk');
			wx_sdk = wx_sdk.default;

			//供领券活动使用

			if (this.info.detail) {
				this.total = this.info;
				this.info = this.info.detail;
				this.info.couponName = this.info.name;
			}

			let data = await http.getUserInfo({
				data: {
					shopId: brandId,
					type: 5,
					from: 0
				}
			});
			this.shopList = data.shopList;
			this.shopName = data.shopName;
			this.token = storage.session('token');

			this.getUseTime();
			this.getClass();

			let qrcode = await import( /* webpackChunkName:'jr-qrcode' */ 'src/verdor/jr-qrcode.js');
			qrcode = qrcode.default;

			this.imgUrl = qrcode.getQrBase64(this.info.qrCode, {
				padding: 15,
				width: 300,
				height: 300,
				correctLevel: QRErrorCorrectLevel.L // eslint-disable-line
			});

			// if(!this.total){
			await this.getParticulars();
			// }
			//    console.log(this.info.sharingStatus)
			utils.setTitle('优惠券详情');
		}
	};
</script>
<style lang="less" scoped>
	#my-coupon {
		width: 100%;
		height: 100%;
		font-family: 黑体;
		// background: url('../../res/images/saoma-bg.jpg') repeat;
		min-height: 100%;
		position: relative
	}

	#my-coupon .content {
		width: 9.44rem;
		min-height: 10rem;
		border-radius: 0.1rem;
		background: #fff;
		margin: auto;
		margin-top: 1.4rem;
		height: auto;
		margin-bottom: 1.4rem;
	}

	#my-coupon .content .content_t {
		width: 100%;
		height: auto;
		padding-top: 0.29rem;
		position: relative;
	}

	#my-coupon .content .content_t .less {
		width: 1.86rem;
		height: 1.86rem;
		border-radius: 100%;
		text-align: center;
		line-height: 1.86rem;
		position: absolute;
		top: -0.93rem;
		left: 3.79rem;
	}

	#my-coupon .content .content_t .less h1 {
		font-size: 0.8rem;
		color: #fff;
		font-weight: bold;
	}

	#my-coupon .content .content_t .qrcode {
		width: 100%;
		height: 0.69rem;
		margin-bottom: 0.26rem;
	}

	#my-coupon .content .content_t .qrcode img {
		width: 0.69rem;
		height: 0.69rem;
		margin-right: 0.35rem;
		float: right;
	}

	#my-coupon .content .content_t .name {
		width: 100%;
		height: auto;
		text-align: center;
		line-height: 0.4rem;
		font-size: 0.4rem;
		color: #797979;
		margin-bottom: 0.35rem;
	}

	#my-coupon .content .content_t .amount {
		width: 100%;
		height: auto;
		text-align: center;
		/* line-height: 0.7rem; */
		color: #000;
		margin-bottom: 0.22rem;
	}

	#my-coupon .content .content_t .amount span {
		font-size: 0.4rem;
		font-weight: bold;
	}

	#my-coupon .content .content_t .amount h1 {
		font-size: 0.96rem;
		display: inline-block;
	}

	#my-coupon .content .content_t .coupon {
		width: 100%;
		height: auto;
		min-height: 0.45rem;
		text-align: center;
		line-height: 0.45rem;
		font-size: 0.48rem;
		color: #000;
	}

	#my-coupon .content .content_b {
		width: 100%;
		height: auto;
		min-height: 10rem;
		overflow: hidden;
	}

	#my-coupon .content .content_b .immediate {
		width: 100%;
		height: 2.37rem;
		border-bottom: 0.04rem dashed #d1d1d1;
		position: relative;
		text-align: center;
	}


	.button {
		width: 4.4rem;
		height: 1.2rem;
		line-height: 1.2rem;
		border-radius: 1.3333rem;
		margin: 0 auto;
		font-size: 0.48rem;
		color: #FFFFFF;
	}

	.able {
		background: #00A0EA;
		color: #FFFFFF;
		margin-top: 0.3rem;
	}

	.num {
		margin-top: 0.2rem;
		font-size: 0.32rem;
		color: #EAC048;
		width: 2.6667rem;
	}


	#my-coupon .content .content_b .immediate a {
		display: inline-block;
		width: 4.42rem;
		height: 1.26rem;
		border-radius: 0.1rem;
		text-align: center;
		line-height: 1.26rem;
		font-size: 0.48rem;
		color: #fff;
		margin-top: 0.52rem;
		text-decoration: none;
	}

	#my-coupon .content .content_b .semicircle {
		width: 0.4rem;
		height: 0.4rem;
		background: #f2f2f2;
		border-radius: 100%;
		position: absolute;
		bottom: -0.18rem;
	}

	#my-coupon .content .content_b .rlues {
		width: 100%;
		// height: 3.4rem;
		clear: both;
		border-bottom: 0.04rem dashed #d1d1d1;
		position: relative;
	}

	#my-coupon .content .content_b .rlues ul {
		margin: 0.3rem 0.4rem 0.66rem 0.5rem;
		color: #494949;
		font-size: 0.32rem;
		overflow: auto;
		height: auto;
	}

	#my-coupon .content .content_b .rlues ul li {
		margin-bottom: 0.26rem;
		list-style: disc;
		list-style-position: outside;
		font-size: 0.32rem;
	}

	#my-coupon .content .content_b .rlues ul li:last-child {
		text-decoration: underline;
		color: #00a0ea;
		list-style: disc;
	}

	#my-coupon .content .content_b .instructions {
		width: auto;
		height: auto;
		margin: 0.5rem 0.85rem 0.5rem 0.5rem;
		height: auto;
		overflow: scroll;
	}

	#my-coupon .content .content_b .instructions h1 {
		font-size: 0.4rem;
		font-weight: bold;
		margin-bottom: 0.36rem;
	}

	#my-coupon .content .content_b .instructions span {
		display: block;
		font-size: 0.32rem;
		color: #828282;
	}

	#my-coupon .content .content_code {
		width: 100%;
		height: auto;
		min-height: 9rem;
		text-align: center;
		overflow: hidden;
	}

	#my-coupon .content .content_code .coder {
		width: 5.25rem;
		height: 5.25rem;
		margin: 0 auto;
		margin-top: 1rem;
		margin-bottom: 0.8rem;
	}

	#my-coupon .content .content_code .coder img {
		width: 100%;
		height: 100%;
	}

	#my-coupon .content .content_code p {
		font-size: 0.32rem;
		color: #8a8a8a;
	}
</style>