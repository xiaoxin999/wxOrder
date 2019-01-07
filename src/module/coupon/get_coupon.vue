<template>
	<div class="coupon-center">
		<template v-if="iscoupon">
			<div class="coupon-head">
				<div class="coupon-head-box">
					<div class="coupon-ticket-package">

					</div> 
					<div class="coupon-title">
						专属优惠卡包
					</div>
					<div class="coupon-get" @click="getCoupon">
						<span class="coupon-btn">立即领取</span>
					</div>
				</div>
			</div>
			<div class="coupon-bottom">
				<p>卡包介绍</p>
				<ul>				
					<li v-for="(item,index) in list" :key='index'>{{item.name}}</li>
				</ul>
			</div>
		</template>
		<template v-else>
			<div class="derate-head">
				<div class="coupon-head-box">
					<div :class="classA">

					</div> 
					<p class="coupon-shopname">{{shopName}}</p>
					<div class="coupon-money">
						<p>
							<template v-for="(item,index) in list">
								<template v-if="item.type == 1 || item.type == 2">
									¥<span :key='index'>{{Math.ceil(item.param)}}</span>
								</template>
								<template v-if="item.type == 3 || item.type == 4">
									{{(item.param) / 10}}折
								</template>
								<template v-if="item.type == 5">

								</template>
							</template>
						</p>
					</div>
					<div class="coupon-title">
						<template v-for="item in list">
							{{item.name}}
						</template>

					</div>
					<div class="coupon-get" @click="getCoupon">
						<span class="coupon-btn">立即领取</span>
					</div>
				</div>
			</div>
			<div class="coupon-rules">
				<p>优惠券细则</p>
				<ul>
					<li>{{couponType}}</li>
					<li>{{packageName}}</li>
					<li>{{todayTime}}</li>
				</ul>
			</div>
			<div class="instructions">
				<p>使用说明</p>
				<p>
					{{useKnow}}
				<!--<template v-if="list.length == 1">
					{{explain}}
				</template>
				<template v-else>
					{{useKnow}}
				</template>-->
			</p>
		</div>
	</template>
	
</div>
</template>
<script type="text/javascript">
import storage from "src/verdor/storage";
import utils from "src/verdor/utils";
import http from "src/manager/http";
import global from "src/manager/global";

let code = utils.getQueryString("code")||'test';
let actId = utils.getQueryString('actId');
let type  = utils.getQueryString('type');
let mouldType = utils.getQueryString('mouldType');


export default {
	data() {
		return {
			accessToken: '',
			list: [],
			member: '',
			iscoupon: false, //是否是卡包
			shopName: '', //店铺名称
			classA: '', //判断是何种类型优惠券，按类型渲染对应class
			couponType: '', //判断无门槛是优惠券的类型
			goodsName: '', //赠菜名称
			packageName: '', //套餐名称
			todayTime: '', //优惠券使用期限
			useKnow: '' //品牌下的加盟店的使用须知
		};
	},
	methods: {
		async getUserInfo() {
			let loginInfo = storage.session('login');
			let data = await http.getUserInfo({data:{
				shopId: this.shopId,
				code: code,
				type: 3
			}});
			this.member = data.member.id;
			
			Object.assign(data,loginInfo);
			storage.session("coupon", data);
			storage.session("shopName", data.shopName);
			this.shopName = data.shopName == '' ? '' : data.shopName;
			this.getActivityCouponList();
		},
		async getActivityCouponList(){
			let data = await http.getActivityCouponList({data:{
				shopId:this.shopId,
				actId:actId,
				// actId: 259,
				type:type,
				mouldType:mouldType,
				member:this.member,
			}});
			let _this = this;
			switch (data) {
				case 1:
					this.$store.commit("setWin",{content:"活动已下架",callBack:()=>{
						_this.$closeWindow()
					}});
					break;
				case 2:
					this.$store.commit("setWin",{content:"已领取过或没有领取资格",callBack:()=>{
						_this.$closeWindow()
					}});
					break;
				default:
					this.list = data.list;
					if(this.list.length == 1){
						this.iscoupon = false;
						this.getGoodsname();
						setTimeout(()=>{
							this.judgeClass();
							this.judgeTime();
						},100);
					}else{
						this.iscoupon = true;
						this.classA = 'coupon-ticket-package';
					}
					this.useKnow = utils.htmlspecialchars_decode(data.list[0].useKnow);
					var list = this.list;
					for(var i=0;i<list.length;i++){
						list[i].endTime = utils.format(new Date(Number(list[i].endTime) * 1000),'yyyy-MM-dd')
					}
					break;
			}
		},
		async getGoodsname() {
			let data = await http.getGoodsInfoByCouponId({
					data: { //请求登录接口
						shopId: this.shopId,
						couponId : this.list[0].id
					}
				});
			this.goodsName = utils.isEmptyObject(data.goods) ? '' : data.goods;
			this.packageName =utils.isEmptyObject(data.shopName) ? '' : '本券仅限“' + data.shopName + '”使用';
			
		},
		async getCoupon() {
			let data = await http.getCoupon({
				data: { //请求登录接口
					shopId: this.shopId,
					actId: actId,
					// actId: 259,
					member : this.member,
					type : type,
					mouldType : mouldType
				}
			});
			let _this = this;
			switch (data) {
				case 1:
					this.$store.commit("setWin",{content:"活动已结束",callBack:()=>{
						_this.$closeWindow()
					}});
				break;
				case 2:
					this.$store.commit("setWin",{content:"已领取过或没有领取资格",callBack:()=>{
						_this.$closeWindow()
					}});
				break;
				default:
					this.$store.commit("setWin",{content:"领取成功",callBack:()=>{
						this.$router.push("/coupon");
					}});
				break;
			}
		},
		judgeThreshold: function() {
			//判断是否有门槛
			setTimeout(()=> {
				var threshold = this.list[0].lowestConsume;
				if (threshold == 0) {
					this.judgeClass();
				} else {
					this.couponType = '支付金额满' + threshold + '元可用'
				}
			}, 100);
		},
		judgeTime: function() {
			//判断有效期
			if (this.list[0].validityType == 0) {
				if (this.list[0].relativeTime == 1) {
					this.todayTime = '只限' + this.translateTime(this.setDate(Number(this.list[0].relativeTime))) + '当天使用';
				} else {
					this.todayTime = '领券后' + this.list[0].relativeTime + '天有效';
				}
			} else {
				this.todayTime = '有效期：' + this.translateTime(this.list[0].startTime) + '至' + this.list[0].endTime;
			}
		},
		setDate: function(num) {
			//设置有效期加几天
			var dates = new Date();
			dates.setDate(dates.getDate() + num);
			return Math.round(dates.getTime() / 1000);
		},
		//把时间戳转化成***年**月**日
		translateTime: function(time) {
			return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd');
		},
		judgeClass: function() {
			//判断是何种优惠券形式的class
			var type = this.list[0].type;
			if (type == 1 || type == 2) {
				this.classA = 'coupon-ticket-package';
				this.couponType = '任意金额可用，最高减免' + this.list[0].param + '元';
			} else if (type == 3 || type == 4) {
				this.classA = 'discount';
				this.couponType = '任意金额可用，最高折扣' + ((this.list[0].param) / 100) + '%';
			} else {
				this.classA = 'donate';
				this.couponType = '任意金额可用，赠送' + this.goodsName + '一份';
			}
		}
	},
	mounted() {
		if(storage.session('coupon')){
            this.accessToken = storage.session('token');
			this.member = storage.session('coupon').member.id;
			this.shopName = storage.session('coupon').shopName;
			this.getActivityCouponList();
		}else{
			this.getUserInfo();
		}
		

		utils.setTitle("优惠券详情");


	}
}; 
</script>
<style type="text/css" scoped>


.coupon-center
{
	height: 100%;
}

.coupon-head
{
	position: relative;

	overflow: hidden; 

	width: 100%;
	height: 8.66667rem;

	background: url(../../../src/res/images/coupon-head-bg.jpg) no-repeat;
	background-size: cover;
}
.coupon-head .coupon-head-box
{
	position: absolute;
	top: 50%;
	left: 50%;

	width: 6.13333rem;
	height: auto;

	-webkit-transform: translate(-50%, -50%); 
	transform: translate(-50%, -50%);
}
.coupon-head .coupon-head-box .coupon-ticket-package
{
	width: 100%;
	height: 4rem;

	background: url(../../../src/res/images/ticket-package.png) center center no-repeat;
	background-size: 2.88rem 3rem;
}
.coupon-head .coupon-head-box .coupon-title
{
	font-size: .48rem;
	line-height: 1.25333rem;

	position: relative;
	z-index: 55; 

	width: 100%;
	height: 1.25333rem;

	text-align: center;

	color: #fff;
}
.coupon-head .coupon-head-box .coupon-title:before,
.coupon-head .coupon-head-box .coupon-title:after
{
	position: absolute;

	display: block;

	width: 20%;
	height: .04rem;

	content: '';

	background-color: #fff;
}
.coupon-head .coupon-head-box .coupon-title:before
{
	top: 50%;
}
.coupon-head .coupon-head-box .coupon-title:after
{
	top: 50%; 
	right: 0;
}
.coupon-head .coupon-head-box .coupon-get
{
	position: relative;

	overflow: hidden; 

	width: 100%;
	height: 2rem;
}
.coupon-head .coupon-head-box .coupon-get .coupon-btn
{
	font-size: .42667rem;
	font-weight: bold; 
	line-height: 1.25333rem;

	position: absolute;
	top: 50%;
	left: 50%;

	display: block;

	width: 4.4rem;
	height: 1.25333rem;

	transform: translate(-50%, -50%);
	text-align: center;

	color: #26221b;
	border-radius: .13333rem;
	background-color: #fff;
}

.coupon-bottom
{
	box-sizing: border-box; 
	width: 100%;
	height: auto;
	min-height: calc(100% - 8.66667rem);
	padding: .74667rem .90667rem 1.06667rem .64rem;

	background: #fff;
}
.coupon-bottom p
{
	font-size: .4rem;
	font-weight: bolder;

	margin-bottom: .38667rem;
}
.coupon-bottom ul
{
	width: 100%;
	height: 100%; 
	margin-left: .32rem;
}
.coupon-bottom ul li
{
	font-size: .32rem;
	line-height: .64rem;

	list-style: disc;

	color: #4a4a4a;
}

.coupon-center
{
	height: 100%;
}
.coupon-center .derate-head
{
	position: relative;

	overflow: hidden; 

	width: 100%;
	height: 8.66667rem;

	background: url(../../../src/res/images/coupon-head-bg.jpg) no-repeat;
	background-size: cover;
}
.coupon-center .derate-head .coupon-head-box
{
	position: absolute;
	top: 50%;
	left: 50%;

	width: 6.13333rem;
	height: auto;

	-webkit-transform: translate(-50%, -50%); 
	transform: translate(-50%, -50%);
}
.coupon-center .derate-head .coupon-head-box .coupon-ticket-package,
.coupon-center .derate-head .coupon-head-box .discount,
.coupon-center .derate-head .coupon-head-box .donate
{
	width: 100%;
	height: 2.4rem;
}
.coupon-center .derate-head .coupon-head-box .coupon-ticket-package
{
	background: url(../../../src/res/images/coupon-derate.png) center center no-repeat;
	background-size: 2.81333rem 2.10667rem;
}
.coupon-center .derate-head .coupon-head-box .discount
{
	background: url(../../../src/res/images/coupon-discount.png) center center no-repeat;
	background-size: 2.81333rem 2.10667rem;
}
.coupon-center .derate-head .coupon-head-box .donate
{
	background: url(../../../src/res/images/coupon-largess.png) center center no-repeat;
	background-size: 2.81333rem 2.10667rem;
}
.coupon-center .derate-head .coupon-head-box .coupon-shopname
{
	font-size: .26667rem;

	overflow: hidden; 

	width: 6rem;
	height: .8rem;

	text-align: center;
	text-overflow: ellipsis;

	color: #fff;
}
.coupon-center .derate-head .coupon-head-box .coupon-money
{
	font-size: .48rem; 
	line-height: .72rem;

	width: 100%;
	height: .72rem;

	text-align: center;

	color: #fff;
}
.coupon-center .derate-head .coupon-head-box .coupon-money span
{
	font-size: .96rem;

	margin-left: .21333rem;
}
.coupon-center .derate-head .coupon-head-box .coupon-title
{
	font-size: .48rem;
	line-height: 1.25333rem;

	position: relative;
	z-index: 55; 

	width: 100%;
	height: 1.25333rem;

	text-align: center;

	color: #fff;
}
.coupon-center .derate-head .coupon-head-box .coupon-title:before,
.coupon-center .derate-head .coupon-head-box .coupon-title:after
{
	position: absolute;

	display: block;

	width: 20%;
	height: .04rem;

	content: '';

	background-color: #fff;
}
.coupon-center .derate-head .coupon-head-box .coupon-title:before
{
	top: 50%;
}
.coupon-center .derate-head .coupon-head-box .coupon-title:after
{
	top: 50%; 
	right: 0;
}
.coupon-center .derate-head .coupon-head-box .coupon-get
{
	position: relative;

	overflow: hidden; 

	width: 100%;
	height: 2rem;
}
.coupon-center .derate-head .coupon-head-box .coupon-get .coupon-btn
{
	font-size: .42667rem;
	font-weight: bold; 
	line-height: 1.25333rem;

	position: absolute;
	top: 50%;
	left: 50%;

	display: block;

	width: 4.4rem;
	height: 1.25333rem;

	transform: translate(-50%, -50%);
	text-align: center;

	color: #0c0a0c;
	border-radius: .13333rem;
	background-color: #fff;
}
.coupon-center .coupon-rules
{
	box-sizing: border-box;
	width: 100%;
	height: auto;
	margin-bottom: .26667rem; 
	padding: .64rem .74667rem .93333rem;

	background: #fff;
}
.coupon-center .coupon-rules p
{
	font-size: .4rem;
	font-weight: bolder;

	margin-bottom: .38667rem;
}
.coupon-center .coupon-rules ul
{
	width: 8.4rem; 
	margin-left: .32rem;
}
.coupon-center .coupon-rules ul li
{
	font-size: .32rem;
	line-height: .64rem;

	list-style: disc;

	color: #4a4a4a;
}
.coupon-center .instructions
{
	box-sizing: border-box; 
	width: 100%;
	height: calc(100% - 12rem);
	padding: .64rem .94667rem 0rem .64rem;

	background: #fff;
}
.coupon-center .instructions p:nth-of-type(1)
{
	font-size: .4rem;
	font-weight: bolder;

	margin-bottom: .38667rem;
}
.coupon-center .instructions p:nth-of-type(2)
{
	font-size: .32rem;
	line-height: .48rem; 

	color: #828282;
}


</style>