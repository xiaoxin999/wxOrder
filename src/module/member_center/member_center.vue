<template>
  <div id="user-center">
			<div class="user-heard">
				<img class="bg" src="../../res/images/user-bg.png"/>
				<div class="u-content">
					<div class="heard">
						<img :src="userInfo.imageUrl"/>
					</div>
					<div class="name">
						{{name}}
					</div>
				</div>
			</div>
			<div class="user-content">
				<div class="options" @click="toOtherHtml('order')">
					<div class="op-con">
						我的订单
					</div>
					<img src="../../res/images/user-order.png" style="left: 0.1rem;"/>
					<img src="../../res/images/more.png" style="right: 0.1rem;height: 0.33rem;width: 0.2rem;"/>
				</div>
				<div class="options" @click="toOtherHtml('resever')">
					<div class="op-con">
						预约列表
					</div>
					<img src="../../res/images/user-order.png" style="left: 0.1rem;"/>
					<img src="../../res/images/more.png" style="right: 0.1rem;height: 0.33rem;width: 0.2rem;"/>
				</div>
				<div class="options" @click="toOtherHtml('coupon')">
					<div class="op-con">
						优惠券
					</div>
					<img src="../../res/images/user-coupon.png" style="left: 0.1rem;"/>
					<img src="../../res/images/more.png" style="right: 0.1rem;height: 0.33rem;width: 0.2rem;"/>
				</div>
				<div class="options"  @click="toOtherHtml('info')">
					<div class="op-con">
						会员信息
					</div>
					<img src="../../res/images/user-vip.png" style="left: 0.1rem;"/>
					<img src="../../res/images/more.png" style="right: 0.1rem;height: 0.33rem;width: 0.2rem;"/>
				</div>
			</div>
		</div>
</template>

<script>
import utils from "src/verdor/utils";
import storage from "src/verdor/storage";
import http from "src/manager/http";

var code = utils.getQueryString("code") || "test";


export default {
	data() {
		return {
			userInfo: {
				name: null,
				imageUrl: null
			},
			name : ""
		};
	},
	methods: {
		getToken: function() {

			let data = this.userInfo = storage.session("login");
			this.userInfo = data;
			data.id = data.shopId;
			this.getUserInfo(data);
		
		},
		async getUserInfo(xhr) {

			let data = await http.getUserInfo({data:{
				shopId: this.shopId,
				code: code,
				type: 5
			}})
			let users = utils.deepCopy(xhr);
			Object.assign(data,users);

			this.name = data.member.name;
			storage.session("userInfo", data);
			storage.session("select-shop", data);
			storage.session("memberInfo", data);
		
		},
		toOtherHtml: function(type) {
			switch (type) {
				case "order":
					this.$router.push("/memberCenterOrderData");
					break;
				case "coupon":
					this.$router.push("/coupon");
					break;
				case "info":
					var info = storage.session("userInfo");
					storage.session("membership", info);
					if (info.member) {
						this.$router.push("/memberShipInfo");
					} else {
						this.$router.push("/memberShipJoin");
					}
					break;
				case "resever":
					this.$router.push("/bespeakList");
					break;
				default:
					break;
			}
		}
	},
	mounted(){
		this.getToken();
		utils.setTitle("会员中心");
	}
};
</script>

<style scoped>
#user-center {
  width: 10rem;
  height: 100%;
}
#user-center .user-heard {
  width: 10rem;
  height: 4.2rem;
  position: relative;
}
#user-center .user-heard img.bg {
  width: 100%;
  height: 100%;
}
#user-center .user-heard .u-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
}
#user-center .user-heard .u-content .heard {
  width: 2rem;
  height: 2rem;
  border-radius: 100%;
  overflow: hidden;
  border: 0.11rem solid rgba(243, 243, 243, 0.16);
}
#user-center .user-heard .u-content .heard img {
  width: 100%;
  height: 100%;
}
#user-center .user-heard .u-content .name {
  width: 100%;
  text-align: center;
  line-height: 0.6rem;
  font-size: 0.4rem;
  color: #ffffff;
}
#user-center .user-content {
  background-color: #fff;
  margin-top: 0.2rem;
}
#user-center .user-content .options {
  width: 96%;
  height: 1.4rem;
  margin: 0 auto;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
}
#user-center .user-content .options img {
  position: absolute;
  top: 50%;
  width: 0.53rem;
  height: 0.53rem;
  transform: translate(0, -50%);
  -webkit-transform: translate(0, -50%);
}
#user-center .user-content .options .op-con {
  width: 100%;
  height: 100%;
  line-height: 1.4rem;
  text-indent: 0.8rem;
  font-size: 0.44rem;
  color: #666362;
}
</style>
