<template>
	<div class="pay-details" id="pay" v-cloak>
		<div class="pay-concent" style="position: relative;" v-if="payType == '2' || payType == '4'">
			<div class="address" v-if="!addressInfo">
				<a href="javascript:void(0)" class="add-address" @click="openAddress">添加地址</a>
			</div>
			<div class="address-info" v-if="addressInfo" @click="openAddress">
				<p class="address-name">{{addressInfo.area + addressInfo.address}}</p>
				<p class="address-user-name">{{addressInfo.name}}&nbsp;&nbsp;&nbsp;</p>
				<p class="addre-user-phone">{{addressInfo.mobile}}</p>
			</div>
			<div class="estimated" v-if="payType == '2'">预计送达&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{dayDefinite}}</div>
		</div>
		<div class="pay-concent">
			<div class="pay-box" v-if="payType == '1' || payType == '3'">
				<div class="pay-shouBox" style="margin-right: 0;">
					<span class="fl arequired">称&nbsp;&nbsp;&nbsp;呼</span>
					<input type="text" placeholder="请输入姓名" class="inputWidth" id="name" v-model="name" maxlength="20" v-if="isName" />
					<template v-else>
						<span class="sexList" :class="[sexType == '0' ? 'on' : '']" @click="setSexType('0')"> 先生</span>
						<span class="sexList" :class="[sexType =='1' ? 'on' : '']" @click="setSexType('1')"> 女士</span>
					</template>
				</div>
			</div>
			<div class="pay-box" v-if="isPhone && payType == '1' || isPhone &&payType == '3'">
				<div class="pay-shouBox">
					<span class="fl arequired">手机号</span>
					<input type="number" placeholder="请输入手机号" id="phone" v-model="phones" maxlength="11" />
				</div>
			</div>
			<div class="pay-box" v-if="payType == '1'">
				<div class="pay-shouBox" @click="changePickerType()">
					<span class="fl arequired">桌台号</span>
					<input type="text" placeholder="请选择桌台号" :value="aresTableName" readonly="readonly" disabled v-if="isTable" />
					<input type="text" placeholder="请选择桌台号" :value="aresTableName" id="multiPickerInput" readonly="readonly" disabled v-else />
					<span class="more-Tbale" v-if="!isTable"></span>
				</div>
			</div>
			<div class="pay-box" v-if="payType == '3'">
				<div class="pay-shouBox" @click="changePickerType('1')">
					<span class="fl arequired">定时取</span>
					<input type="text" :value="presetTime" placeholder="请选择取餐时间" id="presetInput" readonly="readonly" disabled />
					<span class="more-Tbale"></span>
				</div>
			</div>
			<div class="pay-box" v-if="payType == '3'">
				<div class="pay-shouBox pay-shouBox-address">
					<span class="fl">取餐地址</span>
					<div class="lu">
						{{shopName}}<br>
						{{takeAddress}}
					</div>
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
					<span class="fl">备注</span>
					<input type="text" placeholder="请输入备注信息" v-model="remark" id="remark" maxlength="50" />
				</div>
			</div>
			<div class="pay-box" v-if="isInvolicHeader">
				<div @click="openBill" class="pay-shouBox">
					<span class="fl">发票抬头</span>
					<span>{{involicHeader}}</span>
					<span class="more-Tbale"></span>
				</div>
			</div>
			<div class="pay-box" v-if="payType == '1' || payType == '3'">
				<div @click="changePersonType" class="pay-shouBox">
					<span class="fl arequired">用餐人数</span>
					<input type="text" placeholder="请选择就餐人数" v-model="num" readonly="readonly" disabled="disabled" v-if="num == 1" />
					<input type="text" placeholder="请选择就餐人数" v-model="num" id="selectNumber" readonly="readonly" v-else disabled="disabled" />
					<span class="more-Tbale" v-if="selectPayWay.personConfine>'1'"></span>
				</div>
			</div>
			<div class="pay-box" v-if="!isInvolicHeader">
				<div class="pay-shouBox">
					<span class="fl">发票抬头</span>
					<input type="text" placeholder="商家不支持开具发票" v-model="involicHeader" id="involicHeader" maxlength="50" readonly="readonly" />
				</div>
			</div>

			<div class="pay-box" v-if="payType == '1' && isAddress">
				<div class="pay-shouBox">
					<span class="fl">地址</span>
					<input type="text" placeholder="请输入地址信息" v-model="address" id="address" maxlength="50" />
				</div>
			</div>
			<!-- 试用门店 -->
			<div class="pay-box" v-if="isAvail">

				<template v-if="isMember">
					<div class="pay-shouBox">
						<span class="fl">会员卡</span>
						<input type="text" class="pay-memberInfo" v-model="member_ship">
					</div>
				</template>
				<template v-else>
					<div class="pay-shouBox">
						<span class="fl">粉丝卡</span>
						<span class="pay-memberInfo">{{fansInfo}}</span>
					</div>
					<div class="pay-shouBox">
						<span class="fl">会员卡</span>
						<div class="receive-membership" @click="openMeberPage">绑定会员</div>
					</div>
				</template>

			</div>
			<template v-else>
				<div class="pay-box">
					<div class="pay-shouBox" v-if="isMember || fansDiscount">
						<span class="fl">粉丝卡</span>
						<span class="pay-memberInfo">{{fansInfo}}</span>
					</div>
				</div>
			</template>
		</div>
		<div id="targetContainer" class="multi"></div>
		<div id="payList" class="multi"></div>
		<div id="presetList" class="multi"></div>
		<div class="pay-concent">
			<div class="pay-subhead">
				优惠方式
			</div>
			<div class="pay-list">
				<template>
					<!-- 开启优惠券满减不共享-->
					<div class="pay-goods reduce" v-if="Number(reducePriceAll)>0">
						<span class="fl">满减优惠</span>
						<span>-{{Number(reducePriceAll).toFixed(2)}}</span>
					</div>
				</template>
				<div class="pay-goods coupon">
					<span class="fl">优惠券</span>
					<div class="couponMore fr">
						<div class="couponNum" v-if="couponNum > 0 && couponTypeName == ''&&!isHasSpecical" @click="openCouponPage">
							{{couponNum}}张可用
						</div>
						<div style= "color: #FF2035;" v-if="couponNum > 0 && couponTypeName == ''&&isHasSpecical" @click="openCouponPage">
							特价菜品不与优惠券共享
						</div>
						<div class="fl" v-if="couponNum == 0">无可用优惠券</div>
						<div style="color: #ff5d42;" class="couponTypeName" v-if="couponTypeName" @click="openCouponPage">{{couponTypeName}}</div>
					</div>
				</div>
				<template>
					<div class="pay-goods" v-if="integralConfig.status == '1' && isChannel && shareCoupon">
						<div class="pay-integral fl">
							<span class="fl integral-icon"></span>
							<span class="fl">积分抵扣</span>
							<span class="fl integral-explain" v-if="integralConfig.useMode == '1' && point >= 1">(已使用{{maxPoint}}积分，抵扣{{maxPoint/ integralConfig.point * integralConfig.pointCash}})元</span>
							<span class="fl integral-explain" v-if="integralConfig.useMode == '0' && point >= 1 && noIntegral">(当前{{point}}积分，可使用积分{{maxPoint}})</span>
							<span class="fl integral-explain" v-if="integralConfig.useMode == '0' && point >= 1 && noIntegral == false">(已使用{{points}}积分，抵扣{{points/ integralConfig.point * integralConfig.pointCash}})元</span>
							<span class="fl integral-explain" v-if="point <= 0">(无可用积分)</span>
							<span class="fl integral-tip" @click="isOpenColseWin('open')"></span>
						</div>
						<div class="pay-integral fl" style="width: 15%;">
							<span v-bind:class="[isIntegral ? 'integral-on' : 'integral-off']" @click="isUsingIntegral"></span>
						</div>
					</div>
				</template>
			</div>
			<div class="pay-list" v-if="isIntegral && integralConfig.useMode == '0' && noIntegral " style="border-top:1px solid #DDDDDD">
				<div class="using-integral">
					<span class="fl">使用积分</span>
					<input v-if="maxPoint>0" type="number" class="fl" v-model="pointss" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')" />
					<input v-else-if='sharingStatus == 1' type="number" class="fl" v-model="pointss" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')" disabled />
					<span class="fl">可抵扣{{points / integralConfig.point * integralConfig.pointCash}}元</span>
				</div>
			</div>
		</div>
		<div class="pay-concent">
			<div class="pay-subhead">
				支付方式
			</div>
			<div class="pay-list">
				<div class="pay-goods" v-for="(item,index) in PaymentList" :key="index" :class="payWay(item.value)" style="border-bottom: 1px solid #DDDDDD;">
					<span>{{item.value}}</span>
					<span class="selectPay fr" :class="item.isOn ? 'payOn' : 'payOff'" @click="chosePay(item,index)"></span>
				</div>
			</div>
		</div>
		<div class="pay-concent">
			<div class="pay-subhead">
				商品详情
			</div>
			<div class="pay-list">
				<goods-list :goods="goods" :isMember="isMember" :memberDiscount="discount" v-for="(goods,i) in goodsList" :key="i"></goods-list>
			</div>
			<package-list v-for="(packages,index) in packagesList" :packages="packages" :key="index" :isMember="isMember" :memberDiscount="discount"></package-list>
			<div class="pay-list" style="height: auto;" v-if="(payType == '2' || payType == '4') && moveFees && moveFees>0">
				<div class="pay-goods">
					<div class="pay-name fl">
						<template v-if="payType == '2'">
							配送费
						</template>
						<template v-if="payType == '4'">
							运费
						</template>
					</div>
					<div class="pay-sum fl"></div>
					<div class="pay-sum fl">￥{{moveFees}}</div>
				</div>
			</div>
		</div>
		
		<div class="pay-bottom">
			<template v-if="isOutOfRange == false">
				<span class="fl">
					<span class="needPay">待支付&nbsp;{{Number(totalPrice).toFixed(2)}}</span>	
					<span class="prePrice">|&nbsp;优惠&nbsp;￥{{Number(prePrice).toFixed(2)>0?Number(prePrice).toFixed(2):0}}</span>	
				</span>
				<a href="javascript:void(0)" class="fr pay-btn" @click="isPay()">去支付</a>
			</template>
			<template v-else>
				<p>
					本店超出配送范围</p>
			</template>
		</div>
		<transition name="fade">
			<win @winEvent="winEvent" v-if="isPayWin" :height='"auto"'>
				<div slot="content" class="pay-type">
					<div class="pay-Box">
						<ul>
							<li v-for="(item,index) in customContentList" :key="index">{{item.content}}</li>
							<li v-if="payType == '1' ||payType == '3'">等待时间约{{startTime}}~{{endTime}}分钟</li>
						</ul>
					</div>
				</div>
			</win>
		</transition>
		<transition name="fade">
			<win v-if="isIntegralWin" @winEvent="closeWin" :height="'auto'" :type="'alert'" :ok="{content: '关闭'}">
				<div slot="content" class="integral-box">
					<div class="integral-header">积分使用规则</div>
					<div class="integral-content">
						<ul>
							<li>积分抵扣比例为{{integralConfig.point}}:{{integralConfig.pointCash}}</li>
							<li v-if="integralConfig.maxRule == '1' || integralConfig.maxRule == '2'">积分抵扣最多为订单金额{{integralConfig.pointCash}}%</li>
							<li v-if="integralConfig.maxRule == '3' && point >= integralConfig.point ">积分抵扣最多为{{maxPoint /
								integralConfig.point * integralConfig.pointCash}}元</li>
							<li v-if="point >= integralConfig.point ">最多可使用积分{{maxPoint}}</li>
							<li v-if="integralConfig.pointUseRule != '2' && integralConfig.pointUseRule != '0'">人均消费满{{consumeConfig.averageConsum}}元可使用</li>
							<li v-if="integralConfig.pointUseRule != '1' && integralConfig.pointUseRule != '0'">总消费满{{consumeConfig.totalConsum}}元可使用</li>
						</ul>
					</div>
				</div>
			</win>
		</transition>
		<transition name="fade">
			<picker :isShow="isShow" :title="title" :type="type" :list="listData" :name="pickerName" :returnValue="returnValue" :childIndex="childIndex" v-if="isShow" @closePicker="closePicker"></picker>
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
	let wxsdkData = null;
	let wxsdk = null;
	let orderData = null;
	let map = null;
	let payType;
	let typeWay = {
		'微信支付': 'wechat-icon',
		'会员支付': 'member-icon',
		'支付宝支付': 'alipay-icon'
	};
	let baseInfo = {};
	export default {
		data() {
			return {
				isAvail: true,
				fansDiscount: {},
				fansInfo: '',
				listData: [],
				componentId: '',
				openId: '', //getMid中的openId
				tableAreaList: '', //桌台区域数组
				tableNmae: '', //桌台名称
				areaName: '', //区域名称
				tableId: '', //桌台id
				goodsList: [], //商品列表
				packagesList: [], //套餐列表
				orderInfo: '', //点菜json数据
				name: '', //姓名
				phone: '', //手机号码
				remark: '', //备注信息
				involicHeader: storage.session('billDetail') ? storage.session('billDetail').invoiceHeader : '', //发票抬头
				address: '', //地址
				isPayWin: false,
				isTable: false,
				sexType: 0,
				aresTableName: '',
				status: '', //是否开启广场模式 默认为0 1为开启
				SquareConfig: {}, //广场模式配置
				isName: false, //是否可输入姓名
				isPhone: false, //是否可输入手机号
				isInvolicHeader: false, //是否可输入发票抬头
				isAddress: false, //是否可输入地址
				startTime: '', //开始时间
				endTime: '', //结束时间
				customContentList: [], //支付规则数组
				isIntegralWin: false, //是否打开规则弹窗
				integralConfig: {}, //积分规则配置
				isIntegral: false, //是否使用积分
				point: '', //已有积分
				maxPoint: '', //最大可使用积分
				points: '', //使用积分
				consumeConfig: {}, //消费配置
				totalPrice: '', //订单总价
				noIntegral: true, //是否能使用积分
				pointConfig: false, //
				isMember: null, //是否为会员
				payName: '', //支付方式名称
				presetTime: '', //取餐时间
				addressInfo: storage.session('addressDetail'),
				dayDefinite: '', //预计送达时间
				payType: storage.session('selectPayWay') ? storage.session('selectPayWay').type : '0', //结账方式类型
				PaymentList: [], //支付方式数组
				code: '',
				type: 'tablePicker',
				num: '',
				memberInfo: null, // 自助模式取memberInfo，微信点餐取wechatShop
				discount: null, // 获取会员等级折扣
				couponNum: 0, // 优惠券可用数量
				couponTypeName: '', // 使用优惠券类型
				showCoupon: storage.session('couponOn'), // 选中的优惠券
				couponPrice: 0, // 优惠券优惠金额
				title: '',
				commentConfigData: null,
				jumpCode: '',
				channels: [],
				isChannel: false,
				mealTimeList: [],
				isOutOfRange: false, // 是否超出配送范围
				isReadyPay: true,
				isShow: false, // 选择桌台和人数
				pickerName: '',
				childIndex: 1,
				selectPayWay: storage.session('selectPayWay'),
				returnValue: 'value',
				oid: '',
				isWholeShare: storage.session('isWholeShare'),
				reducePrice: '',
				moveFees: 0,
				memberShip: storage.session('memberInfo').member ? storage.session('memberInfo').member : '',
				member_ship: '',
				prePrice: 0,
				originalPrice: '', //原价
				sharingStatus: 0, //优惠共享
				allPrice: 0,
				shopDiscountCash: 0, //满减
				shareCoupon: true, //选则优惠券是否与会员共享
				takeAddress: '', //自提模式取餐地址
				shopName: ''
			};
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
			pointss: {
				get: function() {
					return this.points;

				},
				set: function(newValue) {
					this.points = newValue.replace(/[^\d]/g, '');
					this.points = (this.points > this.maxPoint) ? this.maxPoint : this.points;
					this.budgetPrice();
				}
			},

			reducePriceAll() { //满减金额是否与会员共享判断
				return this.reducePrice = this.shopDiscountCash;
			},

			isHasSpecical(){
				return !this.$store.state.order.canUseReduce;
			}
		},
		watch: {
			'points': function() {
				// 计算出可抵扣的金额
				this.points = String(this.points);
				this.points = (this.points.substring(0, 1)) == 0 ? this.points.substring(1, this.points.length) : this.points;
				// 积分可使用时计算支付金额
			},
			'name': 'infoChange',
			'address': 'infoChange',
			'payName': 'infoChange',
			'phone': 'infoChange',
			'aresTableName': 'infoChange',
			'remark': 'infoChange',
			'invoiceHeader': 'invoiceHeader',
			'presetTime': 'infoChange',
			'num': 'infoChange',
			'takeAddress': 'infoChange',
		},
		methods: {
			async getMoveFees() { //商圈获取费送费
				let selectPayWay = storage.session('selectPayWay') || '';
				let data = await http.getMoveFee({
					data: {
						shopId: this.shopId,
						addressId: this.addressInfo ? this.addressInfo.id : '', //地址id
						id: selectPayWay.id //支付模式id
					}
				});
				this.moveFees = Number(data);
			},
			payWay(item) { //根据支付方式的value 判断icon 
				return typeWay[item];
			},
			winEvent(str) {
				this.isPayWin = false;
				if (str === 'ok') {
					this.getInfo();
				}
			},
			closePicker(val) {
				if (val.type === 'ok' && this.type === 'tablePicker') {
					let indexObj = val.data;
					let area = this.listData[indexObj[0]];
					let table = area.child[indexObj[1]];

					this.tableNmae = table.tableName;
					this.tableId = table.id;
					this.areaName = area.areaName;
					this.aresTableName = this.areaName + '_' + this.tableNmae;

					this.isTable = true;
				} else if (val.type === 'ok' && this.type === 'personPicker') {
					this.num = val.data;
				} else if (val.type === 'ok' && this.type === 'mealTime') {
					let indexData = val.data[0];
					this.presetTime = this.mealTimeList[indexData].name;
				}
				this.isShow = false;
				this.returnValue = 'value';
			},
			async openMeberPage() {
				// 打开会员注册页面
				storage.session('wechatPay', true);
				storage.session('type', 4);
				this.$router.replace({
					path: '/memberRegister',
					query: {
						'type': 4
					}
				});
			},
			changePickerType(type) {
				if (type) {
					this.componentId = 'multi-picker';
					this.type = 'mealTime';
					this.pickerName = 'name';
					this.listData = this.mealTimeList;
					this.title = '选择取餐时间';
					this.returnValue = 'index';

				} else {
					if (!this.tableAreaList) {
						this.$store.commit('setWin', {
							content: '暂无桌台'
						});
						return false;
					}
					this.type = 'tablePicker';
					this.pickerName = 'value';
					this.childIndex = 2;
					this.listData = this.tableAreaList;
					this.title = '选择桌台';
					this.returnValue = 'index';
				}
				this.isShow = true;
			},
			changePersonType() { // 选择就餐人数
				let selectPayWay = storage.session('selectPayWay');
				if (this.payType == 1 || this.payType == 3) {
					if (selectPayWay && selectPayWay.personConfine > 1) {
						this.listData = Number(selectPayWay.personConfine);
					} else {
						this.listData = 1;
					}
				}
				if (selectPayWay && selectPayWay.personConfine == '1') return false;
				this.type = 'personPicker';
				this.title = '选择人数';
				this.childIndex = 1;
				this.isShow = true;
			},
			async budgetPrice() {
				// 预计算价格
				let couponObj = storage.session('couponOn');
				let data;
				try {
					data = await http.budgetPrice({
						data: {
							shopId: this.shopId, // 店铺id
							data: this.orderInfo,
							point: this.points,
							couponId: couponObj ? couponObj.couponId : '',
							code: couponObj ? couponObj.code : '',
							couponType: couponObj ? couponObj.type : '',
							memberId: storage.session('memberInfo').member.id,
							odid: storage.session('odid') ? storage.session('odid') : ''
						}
					}, true, false);
					
					this.totalPrice = data.price;
					this.couponPrice = data.couponCash; ///优惠券优惠金额
					this.shopDiscountCash = data.shopDiscountCash;
					this.originalPrice = data.originalPrice;
					storage.session('sumPrices',this.originalPrice);
					this.prePrice = Number(data.pointCash) + Number(data.couponCash) + Number(data.memberDiscountCash) + Number(data.shopDiscountCash);
					this.sharingStatus = data.couponInfo.sharingStatus; //sharingStatus 0 不参与其他优惠共享，1 不与会员共享
					if (this.sharingStatus != undefined && this.sharingStatus == 0 || this.sharingStatus == 2) {
						this.shareCoupon = false;
					} else {
						this.shareCoupon = true;
					}
					// let arr = [];
					// let arrGoods = [];
					// arr = this.packagesList.map((item) => {
					// 	item.sharingStatus = this.sharingStatus;
					// 	return item;
					// });
					// arrGoods = this.goodsList.map((item) => {
					// 	item.sharingStatus = this.sharingStatus;
					// 	return item;
					// });
					// storage.session('packages', arr);
					// storage.session('goods', arrGoods);
				} catch (e) {
					storage.session('couponOn', null);
					this.$store.commit('setWin', {
						'content': `${e.error.message}`
					});
				}

			},
			getCouponType: function(couponDiscount, couponDetail) {
				let odid = storage.session('odid');
				// let odids = storage.session('odids');
				let param;
				if (couponDetail.type == '1' || couponDetail.type == '2' || couponDetail.type == '8') {
					param = '-' + '￥' + couponDiscount;
				} else if (couponDetail.type == '3') {
					param = this.getGoodsName(odid) + (parseFloat(couponDetail.param) / 10) + '折';
				} else if (couponDetail.type == '4') {
					param = (parseFloat(couponDetail.param) / 10) + '折';
				} else if (couponDetail.type == '6') {
					param = '-' + '￥' + couponDiscount;
				} else if (couponDetail.type == '5') {
					param = '赠' + '' + '';
					param = param + this.getGoodsName(odid);
				} else if (couponDetail.type == '11') {
					param = '定额券抵' + this.couponPrice + '元';
				} else if (couponDetail.type == '10') {
					param = '买送券抵' + this.couponPrice + '元';
				} else if (couponDetail.type == '9') {
					if(couponDetail.discountType == 1){
						param ='第二件商品' + (parseFloat(couponDetail.param) / 10) + '折';
					}else if(couponDetail.discountType == 2 || couponDetail.discountType == 3){
						param = '第二件商品优惠' + this.couponPrice + '元';
					}
				}
				return param;
			},
			getGoodsName: function(odid) {
				/*
				 * type为1则为优惠券单品折扣
				 */

				// 获取赠菜商品名
				let goods = this.goodsList.concat(this.packagesList);
				for (let i = 0; i < goods.length; i++) {
					if (goods[i].odid == odid) {
						return (goods[i].goodsName || goods[i].packageName);
					}
				}
			},
			getGoodsNames: function(odid) {
				/*
				 * type为1则为优惠券单品折扣
				 */

				// 获取赠菜商品名
				let odids = odid.split(',');
				let goodsName = [];
				// let name = '';
				for (let j = 0; j < this.goodsList.length; j++) {
					for (let k = 0; k < odids.length; k++) {
						if (odids[k] == this.goodsList[j].odid) {
							goodsName.push(this.goodsList[j].goodsName);
							let name = ''; // eslint-disable-line
							name = goodsName.join(',');
						}
					}
				}
				for (let j = 0; j < this.packagesList.length; j++) {
					for (let k = 0; k < odids.length; k++) {
						if (odids[k] == this.packagesList[j].odid) {
							goodsName.push(this.packagesList[j].packageName);
							let name = ''; // eslint-disable-line
							name = goodsName.join(',');
						}
					}

				}
				return goodsName;
			},
			async getInfo() {
				let name;
				if (this.isName || this.payType == '2' || this.payType == '4') {
					name = this.name;
				} else {
					name = this.sexType == 0 ? '先生' : '女士';
				}

				let payTypes = (this.payName == '会员支付') ? '5' : payType;
				let couponObj = storage.session('couponOn');

				if (!this.isReadyPay) return false;
				this.isReadyPay = false;

				let {
					type
				} = storage.session('selectPayWay');

				const getType = {
					'1': '8',
					'2': '9',
					'3': '10',
					'4': '11'
				};

				let res;
				let billDetail = storage.session('billDetail');
				let itin = billDetail ? billDetail.itin : '';
				let selectPayWay = storage.session('selectPayWay');
				let id = selectPayWay ? selectPayWay.id : '';
				try {
					res = await http.wechatFastPay({ //订单支付
						data: Object.assign( payTypes == 5 ? {payType: payTypes} : {} , {
							openId: this.openId, // openId
							oid: this.oid || '', // 订单id
							name: this.payType == '2' ? storage.session('addressDetail').name : name, // 用户名
							tableName: this.aresTableName, // 区域名 + 桌台名
							phone: this.phone, // 手机号
							remark: this.remark, //备注
							invoiceHeader: this.involicHeader, //发票抬头
							address: this.address, // 地址
							addressId: this.addressInfo ? this.addressInfo.id : '',
							tableId: this.tableId, // 桌台Id
							data: this.orderInfo, // 菜品数据
							shopId: this.shopId, // 店铺id
							// payType: payTypes, // 支付方式:中信 or 微信
							point: this.points, // 积分
							getTime: this.presetTime, // 自取时间
							itin, // 税号
							paymentName: this.payName, // 支付方式名称
							id, // 模式类型
							person: this.num,
							couponId: couponObj ? couponObj.couponId : '',
							code: couponObj ? couponObj.code : '',
							couponType: couponObj ? couponObj.type : '',
							originalPrice: this.originalPrice,
							odid: storage.session('odid'),
							channel: getType[type],
							sqbData: {
								'hash': 'Pay'
							}
						})
					}, true);
				} catch (e) {
					this.isReadyPay = true;
					this.$store.commit('setWin', {
						title: '错误提示',
						content: e.error.message
					});
				}

				this.noIntegral = false; //提交订单后不允许修改积分
				this.points = Number(this.points);

				if (res) {
					this.oid = res.oid;
					storage.session('oid', this.oid);
					this.data = res.jsonData;
					this.isReadyPay = true;


					if (res.pay && res.jsonData.payType == SQB_WX || res.jsonData.payType == SQB_ALI) {
						storage.session('oidStatus', res.oid);
					}

					if (res.pay && (payType == '5' || res.jsonData == '')) { //会员支付或者是微信中信

						this.$store.commit('setWin', {
							content: '支付成功',
							callBack: () => {
								this.paySucess(res);
							}
						});
						return false;
					} else if (res.pay && typeof res.jsonData == 'object' && payType != 4) { //微信支付
						await wxsdk.goPay({
							payData: res.jsonData,
							payCallBack: (result) => {
								if (result) {
									this.paySucess(res, 2);
								} else {
									sessionStorage.setItem('oid', this.oid);
									this.$router.push({
										path: '/memberCenterOrderSince',
										query: {
											'shopId': this.shopId
										}
									});
								}
							}

						});

						return false;
					} else if (res.pay && res.jsonData != '' && payType == 4 && this.IS_ALI) { //支付宝根据订单号支付
						await wxsdk.goPay({
							payData: res.jsonData,
							payCallBack: (result) => {
								if (result) {
									this.paySucess(res);
								} else {
									this.$store.commit('setWin', {
										content: '支付失败'
									});
								}
							}
						});
					}
				}
			},
			//支付成功的回调
			paySucess(data, channel = 3) {
				//关闭微信游览器
				storage.localData(`order_cache_${global.getShopId()}`, null);
				if (this.payType == '2') {
					this.$router.push({
						path: '/takeoutDetails',
						query: {
							'oid': this.oid
						}
					});
				} else if (this.payType == '3') {
					this.$router.push({
						path: '/memberCenterOrderSince',
						query: {
							'shopId': this.shopId,
							'from': 2
						}
					});
				} else {
					if (this.getcommentConfig(data, channel)) {
						global.evalObj = {
							oid: this.oid,
							type: 2
						};
						this.$router.push('/evaluate');
					} else {
						this.$closeWindow();
					}
				}
			},
			infoChange() {
				let objInfo = {
					name: this.name,
					aresTableName: this.aresTableName,
					address: this.address,
					payName: this.payName,
					remark: this.remark,
					phone: this.phone,
					tableId: this.tableId,
					presetTime: this.presetTime,
					num: this.num,
					invoiceHeader: this.invoiceHeader,
				};
				storage.session('objInfo', objInfo);
			},
			setSexType(type) {
				this.sexType = type;
			},
			async openBill() {
				let res = await http.getInvoiceList({
					data: {
						shopId: this.shopId
					}
				});
				storage.session('billList', res);
				if (utils.isEmptyObject(res)) {
					this.$router.push('/addBill'); //新增发票
				} else {
					this.$router.push('/choseBill'); // 跳转至发票列表
				}
			},
			chosePay(item, index) {

				if (typeof(item) == 'object') {
					for (let i = 0; i < this.PaymentList.length; i++) {
						this.PaymentList[i].isOn = false;
					}
					this.PaymentList[index].isOn = true;
					this.payName = item.value;

				} else if (typeof(item) == 'string') {
					let temp = null;
					this.payName = storage.session('objInfo').payName;
					for (let i = 0; i < this.PaymentList.length; i++) {
						this.PaymentList[i].isOn = false;
						if (this.payName == this.PaymentList[i].value) {
							temp = this.PaymentList[i];
						}
					}
					temp.isOn = true;
				}

			},
			closeWin() {
				this.isIntegralWin = false;
			},
			isUsingIntegral() {
				let p = !Number(this.point);
				if (p || this.noIntegral == false) {
					return false;
				}
				this.isIntegral = !this.isIntegral;
				if (this.integralConfig.useMode == '1') {
					this.points = this.isIntegral ? this.maxPoint : '';
				} else {
					this.points = this.isIntegral ? this.points : '';
				}
				this.budgetPrice();
			},
			validate(content) {
				this.$store.commit('setWin', {
					content: content
				});
			},
			isPay() { //掉支付前的校验
				if (utils.trim(this.phone) == '' && this.isPhone) {
					this.validate('请填写手机号..');
					return false;
				}
				if ((!/^1\d{10}$/g.test(this.phone)) && this.isPhone) {
					this.validate('手机号格式错误..');

					return false;
				}

				if (utils.trim(this.aresTableName) == '' && this.payType == '1') {
					this.validate('请选择桌台..');
					return false;
				}

				if (utils.trim(this.payName) == '') {
					this.validate('请选择支付方式..');
					return false;
				}

				if (this.payType == '3' && this.presetTime == '') {
					this.validate('请选择取餐时间..');
					return false;
				}
				if ((this.payType == '1' || this.payType == '3') && this.num == '') {
					this.validate('请选择用餐人数..');
					return false;
				}
				if ((this.payType == '2' || this.payType == '4')) {
					if (this.address == undefined) {
						this.validate('请选择地址');
						return false;
					}
					if (utils.trim(this.address) == '') {
						this.validate('请选择地址');
						return false;
					}
				}

				if (utils.isEmptyObject(this.customContentList)) {
					this.getInfo();
				} else {
					this.isPayWin = true;
				}
			},
			async openAddress() {
				if (utils.isEmptyObject(storage.session('addressList'))) {
					global.addAddress = null;
					this.$router.push('/addAddress'); //新增地址
				} else {
					storage.session('addressList');
					this.$router.push('/choseAddress'); // 跳转至地址列表
					this.$router.push({
						path: '/choseAddress',
						query: {
							nowCity: storage.session('nowCity')
						}
					});
				}
			},
			async areaAndTableList() {
				if (this.payType == '1') {
					let res = await http.getAreaAndTableList({
						data: {
							shopId: this.shopId,
							type: storage.session('selectPayWay') ? storage.session('selectPayWay').type : '',
							id: storage.session('selectPayWay') ? storage.session('selectPayWay').id : ''
						}
					});
					let areas = res.areas;
					let table = res.tables;

					if (utils.isEmptyObject(areas)) {
						this.$store.commit('setWin', {
							content: '暂无区域'
						});
						return false;
					}
					for (let i = 0; i < areas.length; i++) {
						areas[i].value = areas[i].areaName;
						areas[i].child = [];
						for (let j = 0; j < table.length; j++) {
							if (areas[i].id == table[j].areaId) {
								table[j].value = table[j].tableName;
								areas[i].child.push(table[j]);
							}
						}
					}
					this.tableAreaList = utils.deepCopy(areas);
					for (let k = 0; k < this.tableAreaList.length; k++) {
						if (utils.isEmptyObject(this.tableAreaList[k].child)) {
							this.tableAreaList.splice(k, 1);
							k--;
						}
					}
					if (storage.session('select-shop').tableId) {
						let tableId = storage.session('select-shop').tableId;
						let tableAreaList = this.tableAreaList;
						for (let i = 0; i < tableAreaList.length; i++) {
							for (let j = 0; j < tableAreaList[i].child.length; j++) {
								if (tableAreaList[i].child[j].id == tableId) {
									this.tableNmae = tableAreaList[i].child[j].tableName;
									this.tableId = tableAreaList[i].child[j].id;
									this.areaName = tableAreaList[i].areaName;
									this.aresTableName = this.areaName + '_' + this.tableNmae;
									this.isTable = true;
								}
							}
						}
					} else {
						this.isTable = false;
					}
				}
				this.mealTimeList = this.getPresetTime();
			},
			getPresetTime() {
				let time = new Date();
				let closeTime = storage.session('select-shop').closeTime;
				closeTime = (Number(Math.floor(closeTime / 60)) == 24) ? 0 : Number(Math.floor(closeTime / 60));
				let timeList = [];
				timeList.push({
					name: '下单即取'
				});

				let min, hours;
				min = time.getMinutes();
				hours = time.getHours();
				// if (time.getHours() == closeTime) {
				// 	break;
				// }

				if (closeTime >= 24 && hours == '0') {
					closeTime = closeTime - 24;
				}
				let mint = parseInt(min / 15);
				if (mint < 3) {
					time.setMinutes(mint * 15);
					time.setHours(hours);
				} else {
					time.setMinutes(0);
					time.setHours(hours + 1);
				}
				// let ilength = (time - closeTime)/1000*60*15;
				for (let i = 1; i < 100; i++) {
					timeList.push({
						// 'name': utils.format(new Date(time), 'hh:mm') + '-' + utils.format(new Date(time.getTime() + 1000 * 60 * 30), 'hh:mm')
						'name': utils.format(new Date(time.getTime() + 1000 * 60 * 15 * i), 'hh:mm')
					});
				}
				timeList[timeList.length - 1].name = timeList[timeList.length - 1].name.substring(0, 6) + '暂停营业';
				return timeList;
			},
			async getUserInfo() {
				let res = await http.getUserGoodsInfo({
					data: {
						shopId: this.shopId,
						type: '1',
						memberId: storage.session('login').memberId
					}
				}, false, true);

				if (res.data.userInfo) {
					if (res.data.userInfo.name == '女士') {
						this.sexType = 1;
					} else if (res.data.userInfo.name == '先生') {
						this.sexType = 0;
					} else {
						this.name = res.data.userInfo.name;
					}
					this.phone = res.data.userInfo.phone;

				}
				if (res.data.member) {
					this.sexType = res.data.member.gender == 1 ? 0 : 1;
					this.phone = res.data.member.mobile;
					this.name = res.data.member.name;
					this.isMember = true;
				}
				if (storage.session('billDetail')) {
					this.involicHeader = storage.session('billDetail').invoiceHeader;
				}
			},
			async getPointConfig() {
				let price = Number(this.totalPrice);
				let res = await http.getPointConfig({
					data: {
						shopId: this.shopId,
						price: price < 0 ? 0 : price
					}
				});
				this.pointConfig = Boolean(res);
				if (res) {
					this.integralConfig = res.pointConfig;
					let channel = this.integralConfig.channel.split('');
					this.isChannel = channel.indexOf('2') >= 0 ? true : false;
					this.consumeConfig = res.userData;
					this.point = res.userData.point;
					this.maxPoint = res.userData.pointLimit;
					this.isIntegral = Boolean(Number(this.integralConfig.useMode));
					if (this.isIntegral) {
						this.points = this.maxPoint;
					}
				}
			},
			async getAddress() {
				let addressList = storage.session('addressList');

				if (!addressList) {
					let res = await http.getAddressList({
						data: {
							shopId: this.shopId
						}
					});
					storage.session('addressList', res);
					let list = res;
					// 是否选择地址
					if (list != null && this.payType == '2' || this.payType == '4') {
						if (!utils.isEmptyObject(list)) {
							for (let i = 0; i < list.length; i++) {
								if (list[i].status == '1') {
									this.addressInfo = list[i];
									this.phone = this.addressInfo.mobile;
									this.address = this.addressInfo.area + this.addressInfo.address;
									this.name = this.addressInfo.name;
									storage.session('addressDetail', this.addressInfo);
								}
							}

						}
					}
				}

				this.addressInfo = storage.session('addressDetail');
				if (this.addressInfo && this.payType == '2' || this.payType == '4') {
					this.phone = this.addressInfo.mobile;
					this.address = this.addressInfo.area + this.addressInfo.address;
					this.name = this.addressInfo.name;
					await this.getMoveFees();
				}

				if (this.payType == '2' || this.payType == '4') { //配送费和快递费
					this.totalPrice = (Number(this.totalPrice) + Number(this.moveFees)).toFixed(2);
				}
			},
			async getOpenId() {
				this.openId = await this.getOpenId();
			},
			async getCouponList() {
				// 获取优惠券列表
				let data = await http.getCouponList({
					data: {
						shopId: this.shopId,
						type: 1,
						page: 1,
						num: 10000,
						code: {},
						status: ''
					}
				}, false, true);

				let goods = storage.session('goods');
				let packages = storage.session('packages');
				goods = goods.concat(packages);

				let couponList = data.data.list;

				this.couponNum = this.filterCoupon({
					goods,
					totalPrice:this.originalPrice,
					coupon:couponList,
					showCouponType:'1,2,3,4,5,6,8,9,10,11'
				});

			},
			openCouponPage: function() {
				// 进入使用优惠券页面
				if (this.couponNum) {
					this.$router.push({
						path: '/chooseCoupon',
						query: {
							'type': 1
						}
					});
				}
			},
			//判断是否需要往评价页面跳转
			getcommentConfig(data, channel) {
				let comment = null;
				let commentConfigData = data.commentConfigData;
				if (commentConfigData && commentConfigData.status == 1) {

					this.channels = commentConfigData.channels.split(',').map((item) => {
						return Number(item);
					});
					if (this.channels.indexOf(channel) > -1) {
						comment = true;
						global.evalObj = {
							oid: data.oid,
							type: 3,
							shopName: this.shopName
						};
						storage.session('commentConfigData', commentConfigData);
					}
				}
				return comment && commentConfigData.jumpCode == '0';
			},
		},
		async mounted() {
			this.member_ship = this.memberShip.name + '(' + this.memberShip.mobile + ')';
			if (this.IS_ALI) {
				payType = utils.getQueryString('payType') || 4;
			} else {
				payType = utils.getQueryString('payType') || 'wx';
			}

			this.goodsList = storage.session('goods'); //商品列表
			this.packagesList = storage.session('packages'); //套餐列表

			this.code = utils.getQueryString('code') || 'test';
			let selectPayWay = storage.session('selectPayWay');
			if (selectPayWay && selectPayWay.type != 1) {
				let selectId = this.$route.query.selectId;
				if (selectId) {
					await this.getMoveFees();
				}
			}
			orderData = await
			import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data');
			orderData = orderData.default;
			map = await
			import( /* webpackChunkName:'map' */ 'src/manager/map');
			map = map.default;
			await map.getMapSDK();
			this.getAddress();
			// 获取会员信息
			this.memberInfo = storage.session('select-shop') ? storage.session('memberInfo') : storage.session(
				'wechatShop');
			this.isMember = Boolean(this.memberInfo.member);
			this.discount = this.memberInfo.member ? this.memberInfo.member.level.discount : 1;
			this.areaAndTableList();
			this.getUserInfo();

			if (storage.session('openId')) {
				this.openId = storage.session('openId');
			}

			let fixedPayment = storage.session('SelfHelpConfig').fixedPayment;

			let arr = [];

			baseInfo = global.getBaseInfo();
			this.isAvail = baseInfo.isAvail;
			this.fansDiscount = baseInfo.discount ? baseInfo.discount.discount : 0;
			this.fansInfo = `${this.memberInfo.name}`;
			if (fixedPayment.indexOf(3) >= 0 && !this.IS_ALI) arr.push({
				value: '微信支付',
				isOn: false
			});
			if (fixedPayment.indexOf(5) >= 0 && this.isMember && this.isAvail) arr.push({
				value: '会员支付',
				isOn: false
			});
			if (fixedPayment.indexOf(4) >= 0 && this.IS_ALI) arr.push({
				value: '支付宝支付',
				isOn: false
			});

			if (arr.length == 0) {
				this.$store.commit('setWin', {
					content: '该店暂未配置可用的支付方式'
				});
				this.PaymentList = [];
				return;
			}

			//  设置默认就餐人数
			if (selectPayWay.type == '1' || selectPayWay.type == '3') {
				let maxNum = ((selectPayWay.type == '1' || selectPayWay.type == '3') && selectPayWay.personConfine) > 1 ? selectPayWay.personConfine :
					1;
				this.num = (maxNum == '1') ? maxNum : '';
			}

			this.payName = arr[0].value;
			arr[0].isOn = true;
			this.PaymentList = arr;
			let objInfo = storage.session('objInfo');
			if (objInfo) {
				this.name = objInfo.name;
				this.address = this.address;
				this.phone = objInfo.phone;
				this.aresTableName = objInfo.aresTableName;
				this.remark = objInfo.remark;
				this.payName = objInfo.payName;
				this.tableId = objInfo.tableId;
				this.presetTime = objInfo.presetTime;
				this.invoiceHeader = objInfo.invoiceHeader;
				this.num = objInfo.num;
				this.chosePay(this.payName);
			}

			this.orderInfo = orderData.getCurrentTableUpdata(this.goodsList, this.packagesList);
			storage.session('orderInfo', this.orderInfo);

			if (storage.session('squarePattern')) {
				if (storage.session('SelfHelpConfig')) {
					this.status = storage.session('SelfHelpConfig').status;
					this.SquareConfig = selectPayWay;
					// 分割字符串 获取配置
					let arr = this.SquareConfig.fillContent.split('');
					this.isName = arr.indexOf('1') >= 0 ? true : false;
					this.isPhone = arr.indexOf('2') >= 0 ? true : false;
					this.isInvolicHeader = arr.indexOf('3') >= 0 ? true : false;
					this.isAddress = arr.indexOf('4') >= 0 ? true : false;

					//获取配置时间
					if (this.payType == '1' || this.payType == '3') {
						this.startTime = '5';
						this.endTime = this.SquareConfig.readyMealTime;
					}
					let b = Boolean(this.SquareConfig.customContent);
					if (b) {
						let customContent = this.SquareConfig.customContent.split('!#!');
						for (let i = 0; i < customContent.length; i++) {
							this.customContentList.push({
								'content': customContent[i]
							});
						}
					}
				}
			}

			let preArriveTime = selectPayWay ? selectPayWay.preArriveTime : '';
			if (preArriveTime) {
				let times = new Date();
				times = new Date(times.getTime() + (1000 * 60 * Number(preArriveTime))); //当前时间加上预计送达时间
				times = utils.format(new Date(times), 'hh:mm');
				this.dayDefinite = times;
			}
			wxsdkData = await
			import( /* webpackChunkName:'wx_sdk' */ 'src/manager/platform_sdk.js');
			wxsdk = wxsdkData.default;
			this.payWay(this.item);
			if (this.$route.query.typeInfo == 1 && !storage.session('regiser')) {

				
				
				orderData.resetMemberPrice();
		
				this.$store.commit('setMemberInfo', {
					isMember: this.isMember,
					memberDiscount: this.discount
				});
				this.$store.commit('getCarMaxNum');

				this.totalPrice = this.$store.state.order.shopCarPrice;
				storage.session('regiser', true);
			}


			

			await this.budgetPrice();
			await this.getPointConfig();
			await this.budgetPrice();

			this.getCouponList(); // 获取优惠券列表
			let coupon = storage.session('couponOn');
			if (coupon) {
				this.couponTypeName = this.getCouponType(this.couponPrice, this.showCoupon);
				let list = this.goodsList.concat(this.packagesList);
				for(let item of list){
					global.getAvailPrice(item,coupon.sharingStatus);
				}
			}
			

			let oidStatus = storage.session('oidStatus');
			let comm = storage.session('commentConfigData');
			if (oidStatus) {
				let d = await http.getStatusByOid({
					data: {
						shopId: this.shopId,
						oid: oidStatus
					}
				});
				if (d) {
					this.paySucess({
						commentConfigData: comm
					});
				} else {
					this.$store.commit('setWin', {
						content: '支付失败'
					});
				}
			}
			let shopInfo = storage.session('shopInfo');
			this.shopName = shopInfo.name;
			this.takeAddress = shopInfo.address;
			storage.session('oidStatus', null);
			if (this.payType == '2' || this.payType == '4') { //配送费和快递费
				this.totalPrice = (Number(this.totalPrice) + Number(this.moveFees)).toFixed(2);
			}
			if (this.presetTime == '') this.presetTime = this.mealTimeList[0].name;
			utils.setTitle('确认订单');


		},
		components: {
			'package-list': () =>
				import( /* webpackChunkName: 'package_list' */ 'src/module/bespeak_system/bes_detail/package_list'),
			'goods-list': () =>
				import( /* webpackChunkName: 'goods_list' */ 'src/module/bespeak_system/bes_detail/goods_list'),
			'win': () =>
				import( /* webpackChunkName: 'win' */ 'src/components/phone/win'),
			'multi-picker': () =>
				import( /* webpackChunkName: 'multi_picker' */ 'src/components/multipicker/index'),
			'picker': () =>
				import( /* webpackChunkName: 'picker' */ 'src/components/picker/picker')
		}
	};
</script>

<style lang="less" scoped>
	@import '../../../res/css/base.less';

	.pay-type {
		width: 100%;
		height: 100%;
		padding: 20px 0;
		text-align: center;

		.pay-Tit {
			height: 1rem;
			margin-top: .3rem;
			border-bottom: 1px solid #999;
		}
	}

	.pay-details {
		width: 100%;
		height: auto;
		position: relative;
		padding-bottom: 1.25333rem;
		font-family: "微软雅黑";
		color: #343434;
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

	.pay-details .pay-concent {
		width: 100%;
		height: auto;
		background-color: #ffffff;
		overflow: hidden;
	}

	.pay-details .pay-concent .pay-box {
		width: 100%;
		height: 1.425333rem;
		line-height: 1.25333rem;
		position: relative;
	}

	.pay-details .pay-concent .pay-box:last-child .pay-shouBox{
		border:none;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox {
		width: calc(~"100% - 0.4rem");
		height: 1.25333rem;
		margin-left: 0.4rem;
		font-size: 0;
		border-bottom: 1px solid #dddddd;
		box-sizing: border-box;

		.receive-membership {
			background: #eca621;
			text-align: center;
			height: 0.86rem;
			line-height: 0.86rem;
			align-items: center;
			width: 2rem;
			border-radius: 4px;
			color: #fff;
			margin-left: 3.8rem;
			margin-top: 0.162rem;
		}
	}

	.pay-details .pay-concent .pay-box .pay-shouBox-address {
		width: calc(100% - 0.4rem);
		height: 1.425333rem;
		margin-left: 0.4rem;
		font-size: 0;
		border-bottom: 1px solid #dddddd;
		box-sizing: border-box;
		/* white-space: nowrap; */
		position: relative;

		.receive-membership {
			background: #eca621;
			text-align: center;
			height: 0.86rem;
			line-height: 0.86rem;
			align-items: center;
			width: 2rem;
			border-radius: 4px;
			color: #fff;
			margin-left: 3.8rem;
			margin-top: 0.162rem;
		}
	}

	.pay-details .pay-concent .pay-box .pay-shouBox-address div.lu {
		text-overflow: ellipsis;
		position: absolute;
		left: 2.86rem;
		top: 0;
		line-height: initial;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		width: 6rem;
		overflow: hidden;
		white-space: normal;
		height: auto;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox span {
		width: 30%;
		height: 1.25333rem;
		font-size: 0.34667rem;
		color: #333333;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox span.more-Tbale {
		position: absolute;
		right: 0.93333rem;
		top: 0.45333rem;
		width: 0.21333rem;
		height: 0.33333rem;
		background: url(../../../res/images/moretable.png) no-repeat;
		background-size: 0.21333rem 0.33333rem;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox input {
		outline: none;
		border: none;
		padding: 0;
		width: 70%;
		height: 1.17333rem;
		font-size: 0.34667rem !important;
		color: #999999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox .inputWidth {
		width: 66%;
		height: 1.17333rem;
	}

	.pay-details .pay-concent .pay-box .pay-shouBox div {
		width: calc(~'50% - 30px');
		height: 1.13333rem;
		line-height: 1.13333rem;
		font-size: 0.32rem !important;
		color: #999999;
		float: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pay-details .pay-subhead {
		width: 100%;
		height: 0.5333rem;
		line-height:  0.5333rem;
		text-indent: 0.4rem;
		background-color: rgb(240,240,240);
		font-size: 0.32rem;
		color: #888888;
	}

	.pay-details .pay-list {
		width: 100%;
		height: auto;
		line-height: 1.25333rem;
		color: #666;
	}

	.pay-details .pay-list .pay-name {
		font-size: 0.37333rem;
		color: #333333;
		width: 65%;
		height: 1.25333rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.pay-details .pay-list .pay-num {
		font-size: 0.37333rem;
		color: #bbbbbb;
		width: 15%;
		height: 1.25333rem;
		text-align: center;
	}

	.pay-details .pay-list .pay-sum {
		font-size: 0.37333rem;
		color: #333333;
		width: 15%;
		height: 1.25333rem;
		padding-right: 0.4rem;
		box-sizing: border-box;
		text-align: right;
	}

	.pay-details .pay-list .pay-package {
		width: 100%;
		height: auto;
		line-height: 0.6rem;
		background-color: #efefef;
		text-indent: 0.4rem;
		overflow: hidden;
	}

	.pay-details .pay-list .pay-integral {
		width: 85%;
		height: 1.25333rem;
		color: #333333;
		font-size: 0.37333rem;
		text-indent: 0.13333rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.pay-details .pay-list .integral-explain {
		display: block;
		width: auto;
		height: 100%;
		font-size: 0.32rem;
		max-width: 6rem;
		.text-overflow;
		color: #999999;
	}

	.pay-details .pay-list .integral-tip {
		display: block;
		margin-left: 0.06667rem;
		width: 0.66667rem;
		height: 100%;
		background: url(../../../res/images/integral-tip.png) center center no-repeat;
		background-size: 0.53333rem 0.53333rem;
	}

	.pay-details .pay-list .integral-icon {
		display: block;
		width: 0.42667rem;
		height: 100%;
		background: url(../../../res/images/integral-icon.png) center center no-repeat;
		background-size: 0.42667rem 0.42667rem;
		margin-left: 0.4rem;
	}

	.pay-details .pay-list .integral-off {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		margin-top: 0.36rem;
		margin-left: 0.13333rem;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-position: 0 0;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		overflow: hidden;
	}

	.pay-details .pay-list .integral-on {
		display: block;
		width: 1.02667rem;
		height: 0.52rem;
		cursor: pointer;
		margin-top: 0.36rem;
		margin-left: 0.13333rem;
		background: url(../../../res/images/on-off.png) no-repeat;
		background-size: 2.06667rem, 0.77333rem;
		-webkit-transition: background-position 0.25s ease-in;
		transition: background-position 0.25s ease-in;
		background-position: -1.04rem 0;
		overflow: hidden;
	}

	.pay-details .pay-list .using-integral {
		width: calc(~'100% - 0.93333rem');
		height: 1.25333rem;
		margin-left: 0.93333rem;
		color: #333333;
		font-size: 0.37333rem;
		overflow: hidden;
	}

	.pay-details .pay-list .using-integral input {
		border: 1px solid #e5e5e5;
		width: 2rem;
		height: 0.93333rem;
		background-color: #f7f7f7;
		margin-top: 0.16rem;
		margin-left: 0.26667rem;
		margin-right: 0.26667rem;
		padding-left: 0.26667rem;
	}

	.pay-goods {
		width: 100%;
		height: 1.25333rem;
		text-indent: 0.4rem;
		border-bottom: 1px solid #DDDDDD;
	}

	.pay-goods:first-child {
		border-bottom: 1px solid #DDDDDD;
	}

	.pay-btn {
		width: 2.8rem;
		height: 1.33333rem;
		font-size: 0.42667rem;
		text-align: center;
		background-image: linear-gradient(-90deg, #FEC205 0%, #FCAE02 100%);
	}

	.integral-box {
		width: 100%;
		height: 100%;
		background-color: #FFFFFF;
		position: relative;
	}

	.integral-box .integral-header {
		width: 100%;
		height: 1.04rem;
		line-height: 1.04rem;
		font-size: 0.37333rem;
	}

	.integral-box .integral-header {
		background-color: #f7f8f8;
		color: #999999;
		text-indent: 0.4rem;
	}

	.integral-box .integral-content {
		width: 100%;
		height: auto;
		line-height: 0.66667rem;
		padding: 0.4rem 0.8rem;
		font-size: 0.34667rem;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.integral-box .integral-content ul {
		list-style: disc;
	}

	.required {
		position: relative;
		left: 0;
	}

	.required:after {
		content: '*';
		color: #d0021c;
		font-size: 0.42667rem;
		display: block;
		position: absolute;
		left: 0.8rem;
		top: -0.13333rem;
	}

	.arequired {
		position: relative;
		left: 0;
	}

	.arequired:after {
		content: '*';
		color: #d0021c;
		font-size: 0.42667rem;
		display: block;
		position: absolute;
		left: 1.46667rem;
		top: -0.13333rem;
	}

	.sexList {
		display: inline-block;
		width: 2rem !important;
		height: 1.25333rem;
		line-height: 1.25333rem;
		font-size: 0.34667rem !important;
		text-indent: 0.53333rem;
		color: #999999 !important;
		background: url(../../../res/images/name-default.png) left center no-repeat;
		background-size: 0.32rem 0.32rem !important;
	}

	.on {
		background-size: 0.32rem 0.32rem !important;
		background: url(../../../res/images/name-on.png) left center no-repeat;
	}

	.pay-bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		background:white;
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		padding-left: 0.4rem;
		font-size: 0.42667rem;
		color: #888888;
		box-shadow: 0 0 5px 0 #F1F1F1;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
	}

	.pay-bottom .needPay{
		font-family: PingFangSC-Medium;
		font-size: 0.48rem;
		color: #FF2035;
		font-weight: bold;
	}
	.pay-bottom .prePrice{
		font-size: 0.3733rem;
	}

	.pay-bottom .preferential {
		color: #DFDFDF;
		margin-left: 0.13333rem;
		font-size: 0.34667rem;
	}

	.pay-bottom p {
		font-size: .4267rem;
		color: #ffffff;
		text-align: center;
		margin-left: .4rem;
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
		background: url(../../../res/images/estimated.png) 0.4rem center no-repeat;
		background-size: 0.44rem 0.44rem;
	}

	.address-info {
		padding: 0.36rem 0.4rem;
		box-sizing: border-box;
		width: 100%;
		height: auto;
		max-height: 2.8rem;
		background: url(../../../res/images/address.png) 0.36rem 0.4rem no-repeat;
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
		background: url(../../../res/images/more.png) no-repeat;
		background-size: 0.21333rem 0.34667rem;
	}

	input:disabled {
		background-color: #FFFFFF;
	}

	input::-webkit-input-placeholder {
		color: #999;
	}

	.member-icon,
	.wechat-icon {
		text-indent: 1.2rem;
		font-size: 0.37333rem;
		color: #333;
	}

	.member-icon,
	.alipay-icon {
		text-indent: 1.2rem;
		font-size: 0.37333rem;
		color: #333;
	}

	.member-icon {
		background: url(../../../res/images/member-icon.png) 0 center no-repeat;
		background-size: 0.54667rem 0.49333rem;
		background-position: 0.4rem;
	}

	.wechat-icon {
		background: url(../../../res/images/wechat-icon.png) 0 center no-repeat;
		background-size: 0.56rem 0.49333rem;
		background-position: 0.4rem;
	}

	.alipay-icon {
		background: url(../../../res/images/alipay.png) 0 center no-repeat;
		background-size: 0.56rem 0.49333rem;
		background-position: 0.4rem;
	}

	.selectPay {
		width: 1.06667rem;
		height: 100%;
		margin-right: 0.4rem;
	}

	.payOn {
		background: url(../../../res/images/pay-on.png) center center no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.payOff {
		background: url(../../../res/images/pay-off.png) center center no-repeat;
		background-size: 0.45333rem 0.45333rem;
	}

	.coupon {
		background: url(../../../res/images/coupon.png) left center no-repeat;
		background-size: 0.4rem 0.4rem;
		text-indent: 1rem;
		font-size: 0.37333rem;
		color: #333;
		background-position: .4rem;
	}

	.couponNum {
		.px2rem(width, 120);
		.px2rem(height, 42);
		background-color: #FF5D42;
		.px2rem(line-height, 42);
		.px2rem(font-size, 22);
		color: #ffffff;
		text-align: center;
		text-indent: 0;
		.px2rem(border-radius, 8);
		position: relative;
		top: 50%;
		left: 40%;
		transform: translate(-40%, -50%);
	}

	.couponMore {
		background: url(../../../res/images/moretable.png) right center no-repeat;
		background-size: 0.21333rem 0.33333rem;
		width: auto;
		height: 100%;
		text-align: center;
		padding-right: 0.4rem;
		margin-right: 0.4rem;
	}

	.couponTypeName {
		width: 4.5rem;
		height: 100%;
		.text-overflow;
	}

	.address-user-name {
		width: 45% !important;
		.text-overflow;
		float: left;
	}

	.addre-user-phone {
		width: 50% !important;
		.text-overflow;
	}

	.reduce {
		background: url(../../../res/images/full.png) left center no-repeat;
		background-size: 0.4rem 0.4rem;
		text-indent: 1rem;
		font-size: 0.37333rem;
		color: #333;
		background-position: .4rem;

		:nth-child(2) {
			float: right;
			color: #d0021b;
			padding-right: 0.4rem;
		}
	}

	.subtraction {
		color: #a8a8a8;
		text-decoration: line-through;
	}

	.pay_memberInfo {
		width: auto;
		height: 1.28rem;
		float: right;
		margin-right: 0.42667rem;
		line-height: 1.28rem;
		text-align: right;
		color: #333333;
		font-size: 0.37333rem;
	}
</style>