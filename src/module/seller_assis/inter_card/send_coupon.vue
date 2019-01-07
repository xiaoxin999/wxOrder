<template>
	<div id="coupon" v-cloak>
		<div class="header">
			<template v-for="(title,index) in title">
				<div @click="changeTitle(index)" :key='index'>
					<span>{{title}}</span>
					<div class="line" v-if="indexSelect == index"></div>
				</div>
			</template>
		</div>

		<div class="content">
			<div class="no-coupon" v-if="getMyCouponList.length == 0">
				<div class="img"> </div>
				<div class="text">
					还没有优惠券...
				</div>
			</div>

			<template v-for="(item,index) in getMyCouponList" v-if="status == -1 || status == item.status ? true : false">
				<div class="send_coupon" :key='index'>
					<div class="send_text">
						<p style="font-family: PingFangSC-Medium;font-size: 0.4rem;color: #303030; margin-bottom:0.2667rem;line-height:0.4rem;">{{item.name}}</p>
						<p v-if="item.validityType == 0">有效期：领取后{{item.relativeTime}}日内有效</p>
						<p v-else>有效期：{{transformTime(item.startTime)}}~{{transformTime(item.endTime)}}</p>
						<p>
							数量：
							<span>{{item.allocatedQuantity}}</span>
							发放：
							<span>{{item.issuedQuantity}}</span>
							剩余：
							<span>{{item.allocatedQuantity - item.issuedQuantity}}</span>
						</p>
					</div>
					<div class="send_btn">
						<span @click="toCouponUser(item)" v-if='item.status == 1'>发放</span> 
						<span class="card" v-else>已过期</span>
					</div>
					<div class="clearfloat"></div>
				</div>
			</template>

		</div>
	</div>
</template>
<script type="text/javascript">
import storage from "src/verdor/storage";
import utils from "src/verdor/utils";
import http from "src/manager/http";

let code = utils.getQueryString("code") || "test";

export default {
	data() {
		return {
			token: "", //token
			title: ["全部", "可用", "过期"], //标题
			indexSelect: "", //点击对应的index
			success: false,
			list: [],
			time: "", //当前时间
			id: "",
			status: -1,
			getMyCouponList: [],
			couponId: ""
		};
	},
	methods: {
		//把时间戳转化成***年**月**日
		transformTime: function (time) {
			return utils.format(new Date(Number(time) * 1000), "yyyy/MM/dd");
		},
		async getUserInfo() {
			let data = await http.getUserInfo({
				data: {
					//请求登录接口
					shopId: this.shopId,
					type: 4,
					from: 0
				}
			});
			this.shopName = data.shopName; //获取店铺名称
		},
		async getDistriList() {
			let data = await http.getMyCouponList({
				data: {
					//获取优惠券
					shopId: this.shopId
				}
			});
			this.getMyCouponList = Object.values(data);
			this.getMyCouponList = this.getMyCouponList.filter(item => {
				if (item.validityType == 0) {
					item.status = 1;
				} else {
					let time = Date.now() / 1000;
					if (item.startTime < time && item.endTime > time) {
						item.status = 1;
					} else if(item.startTime <= time && item.endTime >= time){
						item.status = 1;
					}else{
						item.status = 0;
					}
				}
				return item.type != 7;
			});
		},

		changeTitle: function (index) {
			//切换标题title
			this.indexSelect = index;
			if (index == 0) {
				this.status = -1;
			} else if (index == 1) {
				this.status = 1;
			} else {
				this.status = 0;
			}
		},

		toCouponUser(item) {
			storage.session("couponDetail", item);
			this.couponId = item.couponId;
			let id = item.id;
			this.$router.push({
				path: "/userCoupon",
				query: {
					couponId: this.couponId,
					id:id
				}
			});
		}
	},
	async mounted() {
		this.getUserInfo();
		setTimeout(function () {
			utils.setTitle("发放优惠券");
		}, 60);
		this.getDistriList();
	}
};
</script>
<style lang='less' scoped>
#coupon {
	width: 100%;
	height: 100%;
	background: #fff;
	overflow: hidden;
}

.header {
	display: flex;
	width: 100%;
	height: 1.53rem;
	background: #000;
}

.header div {
	font-size: 0.4rem;
	line-height: 1.53rem;
	position: relative;
	text-align: center;
	color: white;
	flex: 1;
}

.header div .yellowHover {
	color: #eac048;
}

.line {
	position: absolute;
	bottom: 0.27rem;
	left: 22%;
	width: 56%;
	height: 0.051rem;
	background-color: #fff;
}

#coupon .content {
	width: 100%;
	height: calc(~"100% - 1.53rem");
	padding-bottom: 0.2667rem;
	background: #fff;
	overflow: auto;
}

#coupon .content .no-coupon {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 60%;
	height: 60%;
	transform: translate(-50%, -50%);
}

#coupon .content .no-coupon .img {
	width: 100%;
	height: 40%;
	background: url(../../../res/icon/no-coupon.png) center center no-repeat;
	background-size: 45%;
}

#coupon .content .no-coupon .text {
	line-height: 1rem;
	width: 100%;
	height: 1rem;
	text-align: center;
	color: #999999;
}

.send_coupon {
	border: solid 1px #999;
	border-radius: 2px;
	padding: 0.3333rem 0.5333rem;
	width: 9.2933rem;
	height: 2.5067rem;
	margin: auto;
	margin-top: 0.2rem;
	background: #f8f8f8;
}

.send_text {
	float: left;
}

.send_text p {
	font-size: 0.32rem;
	color: #999;
	height: 0.4933rem;
	line-height: 0.4933rem;
}

.send_text span {
	color: #eac048;
	margin-right: 0.5rem;
}

.send_btn {
	background: #eac048;
	height: 0.84rem;
	width: 1.8667rem;
	border-radius: 1.3333rem;
	float: right;
	line-height: 0.84rem;
	text-align: center;
}

.send_btn span {
	color: #fff;
	font-size: 0.3467rem;
	text-align: center;
}

.card {
	pointer-events: none;
}

span.card {
	background: #cdcdcd;
	height: 0.84rem;
	width: 1.8667rem;
	border-radius: 1.3333rem;
	float: right;
	line-height: 0.84rem;
	text-align: center;
	color: #fff;
	font-size: 0.3467rem;
}

.clearfloat {
	clear: both;
}

.hide {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>