<template>
  <div class="join-membership join-membership-bg" id="join-membership" v-cloak style="overflow: hidden;">
    <div class="join-membership-content">
        <div class="join-membership-explainBox">
            <div class="join-membership-explain">
                <div class="join-membership-slogan">
                    <div class="join-membership-subhead">
                        <p>加入{{shopName}}会员</p>
                        <p>尊享积分好礼</p>
                    </div>
                </div>
                <div class="join-membership-summary">
                    <p>欢迎来到{{shopName}}积分商城</p>
                    <p>您的每笔消费都会获得积分</p>
                    <p v-if="pointConfig.status == '1'">{{pointConfig.cash}}元={{pointConfig.point}}积分</p>
                    <p>在这里我们为您准备了好礼</p>
                    <p>快去兑换你喜欢的商品吧</p>
                </div>
            </div>
        </div>
        <div class="join-membership-btnBox">
            <a href="javascript:void(0)" class="join-membership-btn" @click="openJoinMember">注册会员</a>
        </div>
    </div>
</div>
</template>
<script>
import storage from "src/verdor/storage";
import utils from "src/verdor/utils";
import http from "src/manager/http";

let shopId = utils.getQueryString("shopId") || "61";
export default {
	data() {
		return {
			shopName: "", // shopName 店铺名称
      pointConfig: {}, // 现金兑换积分比例
      
		};
	},
	methods: {
		openJoinMember: function() {
			this.$router.push("/memberRegister")
		}
	},
	async mounted() {
		// this.getUserInfo();
		utils.setTitle("会员信息");
		console.log(3)
	},
	beforeRouteEnter: (to, from, next) => {
		let ship = storage.session('membership');
		if(ship&&ship.member){
      // next(vm=> vm.$router.replace({path:'/MembershipInfo'}))
      next({path:'/MembershipInfo',replace: true})
		}
		else{
			http.getUserInfo({
				data: {
					shopId:shopId,
					type: 5,
					from: 0
				}
			}).then(res => {
				const loginInfo = storage.session('login');
				Object.assign(res,loginInfo);
				storage.session("membership", res);
				if (res.member) {
					storage.session("membership-info", true);
          // next(vm => vm.$router.replace({path:'/MembershipInfo'}) )
          next({path:'/MembershipInfo',replace: true})

          }else{
          
            next({path:'/memberRegister',query:{type:1},replace: true})
          }
          
				// next(vm => {
				// 	vm.shopName = res.shopName;
				//     vm.pointConfig = res.pointConfig;
        // })
        
			})
		}
	}
};
</script>
<style scoped>
.join-membership-bg {
  background-image: url(../../res/images/join-membership-bg.png);
  background-repeat: no-repeat;
  background-size: cover;
}

#join-membership {
  width: 100%;
  height: 100%;
  position: relative;
}
.join-membership:after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.join-membership .join-membership-content {
  width: 6.13333rem;
  height: 10.93333rem;
  z-index: 3;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
}
.join-membership-explainBox {
  width: 100%;
  height: 8.66667rem;
  border: 1px solid #c1c0be;
  box-sizing: border-box;
  padding: 0.10667rem;
  overflow: hidden;
}
.join-membership-explainBox .join-membership-explain {
  box-sizing: border-box;
  border: 0.06667rem solid #fff;
  width: 100%;
  height: 100%;
}
.join-membership-explainBox .join-membership-explain .join-membership-slogan {
  width: 100%;
  height: 3.53333rem;
  background: url(../../res/images/join-membership-slogan.png) center 0.66667rem
    no-repeat;
  background-size: 1.06667rem 0.93333rem;
  position: relative;
}
.join-membership-explainBox
  .join-membership-explain
  .join-membership-slogan:after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  background: url(../../res/images/join-membership-border.png) center center
    no-repeat;
  width: 100%;
  height: 0.04rem;
}
.join-membership-subhead {
  position: absolute;
  left: 0;
  bottom: 15%;
  width: 100%;
  height: 1.2rem;
}
.join-membership-subhead p {
  width: 100%;
  height: auto;
  line-height: 0.6rem;
  color: #ffffff;
  text-align: center;
  font-size: 0.4rem;
}
.join-membership-explainBox .join-membership-explain .join-membership-summary {
  width: 100%;
  height: 5rem;
  padding: 0.6rem 0;
  box-sizing: border-box;
  overflow: hidden;
}
.join-membership-explainBox
  .join-membership-explain
  .join-membership-summary
  p {
  width: 100%;
  height: auto;
  line-height: 0.66667rem;
  color: #ffffff;
  text-align: center;
  font-size: 0.32rem;
}
.join-membership .join-membership-content .join-membership-btnBox {
  width: 100%;
  height: 2.26667rem;
  box-sizing: border-box;
  padding: 0.6rem 1.66667rem;
  padding-top: 1.13333rem;
  z-index: 22;
}
.join-membership
  .join-membership-content
  .join-membership-btnBox
  .join-membership-btn {
  display: block;
  width: 2.8rem;
  height: 1.13333rem;
  text-align: center;
  line-height: 1.13333rem;
  border: 1px solid #ffffff;
  box-sizing: border-box;
  font-size: 0.32rem;
}
</style>


