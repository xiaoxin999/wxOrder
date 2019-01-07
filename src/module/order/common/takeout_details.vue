/*
 * @Author: guan.sun 
 * @Date: 2018-05-09 17:47:11 
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-09-25 10:51:37
 */
 <template>
<div class="order-cancel" id="order-cancel" v-cloak v-if="isReady">
    <div class="order-header">
        <div class="header-logo">
            <div class="logo-img" >
                <img :src="logoImage">
            </div>
        </div>
        <div class="count-down" @click="openWin('1')">
            <em v-html="'当前状态：' + orderStatus"></em>
            <img src="../../../res/images/moretable.png" alt="箭头">
        </div>
        <div class="cancel-handle">
            <a href="javascript:void(0)" class="payoff"  @click="openWin('2')" v-if="showOperate != '-2' && showOperate != '10'">取消订单</a>
            <a href="javascript:void(0)" :class="isReminder ? 'payoff' : ''" @click="urgeOrder" v-if="showOperate != '-2' && showOperate != '10'">催单</a>
            <!-- <a href="javascript:void(0)" class="payoff"  @click="openOrder" v-if="showOperate == '-2'">重新点单</a>
            <a href="javascript:void(0)" class="payoff"  @click="openOrder" v-if="showOperate == '10'">再来一单</a> -->
        </div>
    </div>
    <div class="pay-details margin-bottom">
		<div class="pay-concent" style="margin-bottom:15px">
			<div class="pay-subhead">
				<div class="pay-sub fl">商品详情</div>
                <div class="pay-price fr">￥{{total}}</div>
			</div>
            <div class="pay-list" v-for="(goods,i) in goodsList" :key="i">
                <goods-list :goods="goods" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></goods-list>
            </div>
            <div class="pay-list" v-for="(packages,index) in packageList" :key="index">
                <package-list  :packages="packages" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></package-list>
            </div>
			<div class="pay-list" style="height: auto;">
				<div class="integral-info" v-if="orderInfo.pointCash > 0">
					<span class="fl">积分抵扣</span>
                    <span class="fr">- ￥{{orderInfo.pointCash}}</span>
				</div>
                <div class="coupon-icon" v-if="orderInfo.couponCash > 0">
                    <span class="fl">优惠券</span>
                    <span class="fr">- ￥{{orderInfo.couponCash}}</span>
                </div>
                <div class="member-icon" v-if="orderInfo.memberDiscountCash > 0">
                    <span class="fl">会员折扣</span>
                    <span class="fr">- ￥{{orderInfo.memberDiscountCash}}</span>
                </div>
                <div class="man-icon" v-if="Number(orderInfo.shopDiscountCash)>0">
                    
                    <span class="fl">满减优惠</span>
                    <span class="fr">- ￥{{Number(orderInfo.shopDiscountCash)}}</span>
                </div>
			</div>
            <div class="distributionFee" :class="orderInfo.pointCash > 0 && orderInfo.couponCash > 0 && orderInfo.memberDiscountCash > 0 ? '' : 'border-top-none'">
                <span class="fl">配送费</span>
                <span class="fr">￥{{orderInfo.moveFee}}</span>
            </div>
			<a :href="'tel:' + shopInfo.telephone" class="tel">联系商家</a>
		</div>
	</div>
    <div class="pay-details margin-bottom">
		<div class="pay-concent">
			<div class="pay-subhead">
				<div class="pay-sub fl">基本信息</div>
			</div>
			<div class="pay-address" >
				<div class="addressBox">
					<span class="fl">收货地址</span> 
					<div class="fl address-content"><div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{orderInfo.address}}</div> <div class="fl">{{orderInfo.name}}</div>  <div class="fl">{{orderInfo.phone}}</div></div>
				</div>
			</div>
			<div class="pay-box">
				<div class="pay-shouBox">
                    <span class="fl">预计送达</span> 
                    <span class="fl">{{dayDefinite}}</span>
                </div>
			</div>
            <div class="pay-box">
				<div class="pay-shouBox">
                    <span class="fl">支付方式</span> 
                    <span class="fl">{{orderInfo.paymentName}}</span>
                </div>
			</div>
            <div class="pay-box">
				<div class="pay-shouBox" style="border-bottom: none;">
                    <span class="fl">下单时间</span> 
                    <span class="fl">{{orderInfo.createTimeFormat}}</span>
                </div>
			</div>
		</div>
	</div>
    <win :width="280" :height='135' :type="'confirm'" :cancel="winCancel" :ok="winOk"   @winEvent='winEvent' v-if="isShowWin">
        <div slot="content" class='content'>
            <div class="win-title">确定要取消订单吗？</div>
            <div class="win-content">如需取消订单，建议您优先联系商家协商处理。</div>
        </div>
    </win> 
    <div class="record-win" v-show="isShowRecord">
        <div class="record-content">
            <div class="record-title">配送信息</div>
            <ul>
                <li v-for="(item,index) in orderRecord" :key="index">
                    <span class="fl" v-html="item.record"></span>
                    <span class="fr">{{item.time}}</span>
                </li>
            </ul>
        </div>
        <div class="close-btn" @click="openWin"></div>
    </div>
</div>
</template>
<script>
    import utils from "src/verdor/utils";
    import storage from "src/verdor/storage";
    import http from "src/manager/http";
    import global from "src/manager/global";

    export default{
        data(){
            return{
                shopId : this.$route.query.shopId || global.getShopId(),
                orderInfo : {}, // 订单信息
                goodsList : [],
                packageList : [],
                memberInfo : null,
                discount : null,
                shopInfo : null, // 当前店铺信息
                oid : this.$route.query.oid, // 订单列表
                isReady: false,
                logoImage : "", // 店铺图片
                dayDefinite : "", // 预计送达时间
                orderStatusObj : {"1":"已接单","2":"已拒单"}, // 订单操作状态
                cancelStatus : {"1":"用户直接取消","2":"用户申请取消"}, // 取消状态
                status : {"-2":"已取消","4":"已支付","9":"待支付","10":"已完成"}, // 订单状态
                orderStatus : "", // 当前状态
                showOperate : true, // -2已取消，4已结账，10已完成
                isShowWin : false,
                winCancel : {
                    content : '申请取消',
                    style : "color:#f5bf4f"
                },
                winOk : {
                    content : '联系商家',
                    style : "color:#8a8a8a"
                },
                isReminder : true, // 是否能催单
                orderRecord : [], // 订单记录
                isShowRecord : false, //
                total : 0
            }
        },
        methods : {
    		async showOrderDetail(){
                // 获取订单详情
                let data = await http.showOrderDetail({data:{
                    shopId : this.shopId,
                    oid : this.oid
                }});

                this.orderInfo = data;
                console.log(data,'data');
                this.total = (Number(this.orderInfo.memberPrice) + Number(this.orderInfo.price)).toFixed(2);
                this.orderInfo.createTimeFormat = utils.format(this.orderInfo.createTime,'yyyy/MM/dd hh:mm');
                this.goodsList = data.goodsData.goods;
                this.packageList = data.goodsData.package?data.goodsData.package:[];
                this.goodsList.map((item) =>{
                    item.price = item.price/item.num;
                    return item;
                })
                this.packageList.map((item1) =>{
                    item1.price = item1.price/item1.num;
                    return item1;
                })


                this.showOperate = data.status;
                this.SquareConfig();

                let presentTime = Math.round(new Date().getTime() / 1000);
                // 第一次催单时间为点单20分钟后，第二次催单时间为10分钟
                let times = (data.urgeOrder.num == 0) ? Number(this.orderInfo.createTime) + 1200 : Number(data.urgeOrder.time) + 600;

                this.isReminder = times < presentTime;
                
                // 订单状态
                // this.orderStatus = this.status[data.status];
                // this.orderStatus = data.orderStatus != '0' ? this.orderStatusObj[data.orderStatus] : this.orderStatus;
               

                let Record = data.orderRecordDetail ? data.orderRecordDetail.split('##') : [];
                    Record.forEach((item)=>{
                        item = item.split('#');
                        this.orderRecord.push({
                            'time' : item[0],
                            'record' : item[1]
                        });
                    });

                this.orderRecord.reverse();
                
                // 订单状态
                this.orderStatus = data.orderRecord || "已下单";
                this.orderStatus = (this.orderStatus == '已下单') ? this.orderStatus : this.orderStatus.split('#')[1];
            },
            async getUserInfos(){
                // 获取会员信息
                let data = await http.getUserInfo({data:{
                    shopId : this.shopId,
                    type : 5
                }});

                console.log(data,'2');
                // 获取会员信息
                this.memberInfo = data;
                this.discount = this.memberInfo.member ? this.memberInfo.member.level.discount : 1;
                let obj = {
                    'memberInfo' : data,
                    'discount' : this.discount
                };
                storage.session('memberDetail',obj);
                
                // 获取当前店铺信息

                let shopList= data.shopList;
                for(var i=0,len=shopList.length;i<len;i++){
                    if(this.shopId == shopList[i].id){
                        this.shopInfo = shopList[i];
                        this.logoImage = global.getImgUrl({url:this.shopInfo.logoImage});
                        break;
                    }   
                }
                this.isReady = true;
            },
            async urgeOrder(){
                // 微信催单
                let times = Number(this.orderInfo.createTime) + 1200;
                let presentTime = Math.round(new Date().getTime() / 1000);

                if(times > presentTime){
                    this.$store.commit("setWin",{content: '下单二十分钟后才能催单哦！'});
                    return false;
                }else{
                    if(this.isReminder){
                        let data = await http.urgeOrder({data:{
                            shopId : this.shopId,
                            orderShopId : this.orderInfo.shopId,
                            oid : this.oid
                            // oid : '201805150060000001'
                        }});

                        if(data){
                            this.isReminder = false;
                            this.$store.commit("setWin",{content:`催单成功`,type:"alert",callBack:()=>{}});
                        }
                    }else{
                         this.$store.commit("setWin",{content: '十分钟内不能重复催单哦！'});
                    }
                }
            },
            async SquareConfig(){
                // 自助获取配置
                let {pay} = await http.getSelfHelpConfig({
					data:{
						shopId: this.shopId
					}
                });

                for(var i=0,len=pay.length;i<len;i++){
                    let item = pay[i];

                    if(item.id == this.orderInfo.typeId){
                        let times = new Date(this.orderInfo.createTimeFormat);
                        times = new Date(times.getTime() + (1000 * 60 * Number(item.preArriveTime)));  //当前时间加上预计送达时间
                        times = utils.format(new Date(times),'hh:mm');
                        this.dayDefinite = times;
                        break;
                    }
                }
            },
             winEvent(str){
                if(str == 'ok'){
                    window.location.href = `tel:${this.shopInfo.telephone}`;
                }else if(str == 'cancel'){
                    this.$router.push({path:'/takeoutCancel',query:{"oid":this.oid,"shopId":this.shopId}});
                }else{
                    this.isShowWin = false;
                }
            },
            openWin(type){
                if(type == '1'){
                    if(this.orderRecord.length == 0){
                        this.$store.commit("setWin",{content: '暂无配送信息'});
                    }else{
                        this.isShowRecord = true;
                    }
                }else if(type == '2'){
                    this.isShowWin = true;
                }else{
                    this.isShowRecord = false;
                    this.isShowWin = false;
                }
            },
            openOrder : function(){
				// 去点餐	
                this.$router.push("/shopSelect");
				storage.session('order-reflow',{
					shop : this.shopInfo,
					data : this.orderInfo.goodsData
				});
			}
        },
        mounted(){
            this.getUserInfos();
            this.showOrderDetail();
            utils.setTitle("订单详情");
        },
        components: {
            'goods-list': () => import (/* webpackChunkName: "goods_list"*/ 'src/module/bespeak_system/bes_detail/goods_list'),
            'package-list': () => import (/* webpackChunkName: "package_list"*/ 'src/module/bespeak_system/bes_detail/package_list'),
            'win': () => import (/* webpackChunkName: "win" */ 'src/components/phone/win')
        }
    }
</script>
<style lang="less" scoped>
@import "../../../res/css/base.less";
.margin-bottom {
  padding-bottom: 0 !important; }

.pay-info {
  width: 100%;
  height: 1.06667rem;
  line-height: 1.06667rem;
  text-indent: 0.4rem;
  font-size: 0.37333rem;
  color: #b2b2b2;
  padding-right: 0.4rem;
  box-sizing: border-box; }

.tel {
  display: block;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #169bd5;
  font-size: 0.34667rem; }

input:disabled {
  background-color: #FFFFFF; }

.payWIn {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
  overflow: hidden; }
  .payWIn .payContent {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    width: 7.46667rem;
    height: 3.86667rem;
    background-color: #ffffff;
    border-radius: 0.13333rem;
    text-align: center; }
  .payWIn .pay_header {
    width: 100%;
    height: 2.66667rem;
    line-height: 2.66667rem;
    color: #000000;
    font-size: 0.42667rem; }
  .payWIn .pay_btn {
    display: block;
    width: 50%;
    height: 1.2rem;
    line-height: 1.2rem;
    border-top: 1px solid #CCCCCC;
    border-right: 1px solid #CCCCCC;
    box-sizing: border-box;
    font-size: 0.34667rem; }
    .payWIn .pay_btn:last-child {
      border-right: none; }

.integral-info {
  background: url(../../../res/images/integral-icon.png) 0.4rem center no-repeat;
  background-size: 0.4rem 0.4rem;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #CCCCCC;
  padding-left: 1.06667rem;
  box-sizing: border-box; }
.coupon-icon{
  background: url(../../../res/images/coupon.png) 0.4rem center no-repeat;
  background-size: 0.4rem 0.4rem;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #CCCCCC;
  padding-left: 1.06667rem;
  box-sizing: border-box;
}
.member-icon{
    background: url(../../../res/images/member_icon.png) 0.4rem center no-repeat;
  background-size: 0.4rem 0.4rem;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #CCCCCC;
  padding-left: 1.06667rem;
  box-sizing: border-box;
  font-size: .1867rem;
}
.man-icon{
    background: url(../../../res/images/full.png) 0.4rem center no-repeat;
  background-size: 0.4rem 0.4rem;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #CCCCCC;
  padding-left: 1.06667rem;
  box-sizing: border-box;
  font-size: .1867rem;
}
.coupon-icon span:nth-child(1),.member-icon span:nth-child(1),.man-icon span:nth-child(1),.integral-info span:nth-child(1){
    color: #333333;
    font-size: .3733rem;
}
.coupon-icon span:nth-child(2),.member-icon span:nth-child(2),.man-icon span:nth-child(2),.integral-info span:nth-child(2){
    margin-right: .4rem;
    color: #888888;
    font-size: .3467rem;
}
.order-infos {
  width: 100%;
  height: 0.6rem;
  line-height: 0.6rem;
  padding-left: 0.4rem;
  color: #525252;
  font-size: 0.37333rem;
  box-sizing: border-box; }

.pay-address {
  width: auto;
  height: auto;
    margin-left: 0.4rem;  
  line-height: 0.86667rem;
  border-bottom: 1px solid #ddd;
overflow: hidden;
  position: relative; }
  .pay-address .addressBox {
    width: auto;
    height: 0.86667rem;
    font-size: 0;
    box-sizing: border-box; }
    .pay-address .addressBox span {
      width: 30%;
      height: 0.86667rem;
      font-size: 0.34667rem;
      color: #333333; }
    .pay-address .addressBox .address-content {
      color: #333333;
      width: calc(100% - 30%);
      height: auto;
      min-height: 1.25333rem;
      line-height: 0.86667rem;
      font-size: 0.34667rem; }
.pay-price{
    color: #D0021B;
    padding-right:.4rem;
    font-size: .3467rem;     
}
.pay-details {
    width: 100%;
    height: auto;
    position: relative;
    padding-bottom: 1.25333rem;
    font-family: "微软雅黑"
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
    border-bottom: 1px solid #dddddd
}

.pay-details .pay-title span {
    display: block;
    width: 0.93333rem;
    height: 1.25333rem;
    text-indent: 0
}

.pay-details .pay-concent {
    width: 100%;
    height: auto;
    background-color: #ffffff;
    margin-bottom: 0.2rem;
    overflow: hidden
}

.pay-details .pay-concent .pay-box {
    width: 100%;
    height: 1.25333rem;
    line-height: 1.25333rem;
    position: relative
}

.pay-details .pay-concent .pay-box .pay-shouBox {
    width: auto;
    height: 1.25333rem;
    margin-left: 0.4rem;
    font-size: 0;
    border-bottom: 1px solid #dddddd;
    box-sizing: border-box
}

.pay-details .pay-concent .pay-box .pay-shouBox span {
    height: 1.25333rem;
    font-size: 0.34667rem;
}
.pay-details .pay-concent .pay-box .pay-shouBox span:nth-child(1){
    width: 30%;
    color: #333333;    
}
.pay-details .pay-concent .pay-box .pay-shouBox span:nth-child(2){
    width: 70%;
    color: #555555;
}
.pay-details .pay-concent .pay-box .pay-shouBox span.more-Tbale {
    position: absolute;
    right: 0.93333rem;
    top: 0.45333rem;
    width: 0.21333rem;
    height: 0.33333rem;
    background: url(../../../res/images/moretable.png) no-repeat;
    background-size: 0.21333rem 0.33333rem
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
    box-sizing: border-box
}

.pay-details .pay-concent .pay-box .pay-shouBox .inputWidth {
    width: calc(100% - 3.26667rem);
    height: 1.17333rem
}


.pay-details .pay-concent .pay-box .pay-shouBox div {
    width: 50%;
    margin-left: .4rem;
    height: 1.13333rem;
    line-height: 1.13333rem;
    font-size: 0.32rem !important;
    color: #999999;
    float: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis
}

.pay-details .pay-subhead {
    width: 100%;
    height: 1.25333rem;
    line-height: 1.25333rem;
    text-indent: 0.4rem;
    border-bottom: 1px solid #DDDDDD
}

.pay-details .pay-subhead .pay-sub {
    width: 60%;
    height: 1.25333rem;
    font-size: 0.42667rem;
    position: relative
}

.pay-details .pay-subhead .pay-sub:after {
    content: '';
    display: block;
    width: 0.08rem;
    height: 0.37333rem;
    background-color: #6ba9f1;
    position: absolute;
    left: 0.24rem;
    top: 0.42667rem
}

.pay-details .pay-subhead .pay-tit {
    width: 100%;
    height: 1.25333rem;
    font-size: 0.42667rem;
    background-color: #FFFFFF;
    position: relative
}

.pay-details .pay-subhead .pay-tit:after {
    content: '';
    display: block;
    width: 0.08rem;
    height: 0.37333rem;
    background-color: #f5a623;
    position: absolute;
    left: 0.24rem;
    top: 0.42667rem
}

.pay-details .pay-subhead .pay-sum {
    width: 40%;
    height: 1.25333rem;
    color: #d0021b;
    font-size: 0.37333rem;
    padding-right: 0.4rem;
    box-sizing: border-box;
    text-align: right
}

.pay-details .pay-list {
    width: calc(100%);
    height: 1.25333rem;
    line-height: 1.25333rem;
    color: #666
}

.pay-details .pay-list .pay-name {
    font-size: 0.37333rem;
    color: #333333;
    width: 65%;
    height: 1.25333rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden
}

.pay-details .pay-list .pay-num {
    font-size: 0.37333rem;
    color: #bbbbbb;
    width: 15%;
    height: 1.25333rem;
    text-align: center
}

.pay-details .pay-list .pay-sum {
    font-size: 0.37333rem;
    color: #333333;
    width: 20%;
    height: 1.25333rem;
    padding-right: 0.4rem;
    box-sizing: border-box;
    text-align: right
}

.pay-details .pay-list .pay-package {
    width: 100%;
    height: auto;
    line-height: 0.6rem;
    background-color: #efefef;
    text-indent: 0.4rem;
    overflow: hidden
}

.pay-details .pay-list .pay-package .package-goods {
    width: 100%;
    height: auto;
    background-color: #efefef
}

.pay-details .pay-list .pay-package .package-goods .pay-goodsName {
    color: #333333;
    font-size: 0.34667rem;
    width: 80%;
    height: 0.6rem
}

.pay-details .pay-list .pay-package .package-goods .pay-goodsNum {
    color: #333333;
    font-size: 0.34667rem;
    text-align: right;
    padding-right: 0.4rem;
    box-sizing: border-box;
    width: 20%;
    height: 0.6rem
}

.pay-details .pay-list .pay-integral {
    width: 85%;
    height: 1.25333rem;
    color: #333333;
    font-size: 0.37333rem;
    text-indent: 0.13333rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden
}

.pay-details .pay-list .integral-explain {
    display: block;
    width: auto;
    height: 100%;
    font-size: 0.32rem;
    color: #999999
}

.pay-details .pay-list .integral-tip {
    display: block;
    margin-left: 0.06667rem;
    width: 0.66667rem;
    height: 100%;
    background: url(../../../res/images/integral-tip.png) center center no-repeat;
    background-size: 0.53333rem 0.53333rem
}

.pay-details .pay-list .integral-icon {
    display: block;
    width: 0.42667rem;
    height: 100%;
    background: url(../../../res/images/integral-icon.png) center center no-repeat;
    background-size: 0.42667rem 0.42667rem
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
    overflow: hidden
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
    overflow: hidden
}

.pay-details .pay-list .using-integral {
    width: calc(100% - 0.93333rem);
    height: 1.25333rem;
    margin-left: 0.93333rem;
    color: #333333;
    font-size: 0.37333rem;
    overflow: hidden
}

.pay-details .pay-list .using-integral input {
    border: 1px solid #e5e5e5;
    width: 2rem;
    height: 0.93333rem;
    background-color: #f7f7f7;
    margin-top: 0.16rem;
    margin-left: 0.26667rem;
    margin-right: 0.26667rem;
    padding-left: 0.26667rem
}

.pay-goods {
    width: 100%;
    height: 1.25333rem;
    border-bottom: 1px solid #DDDDDD;
    margin-left: 0;
}



.address {
    position: relative;
    width: 100%;
    height: 2.4rem;
    padding-left: 0.4rem;
    box-sizing: border-box;
    border: 1px solid #E5E5E5
}

.address .add-address {
    display: block;
    width: 4.38667rem;
    height: 1.18667rem;
    line-height: 1.18667rem;
    position: absolute;
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    background-color: #F5BF4F;
    font-size: 0.42667rem;
    color: #FFFFFF;
    text-align: center;
    text-decoration: none
}

.distributionFee{
    border-top: 1px solid #E5E5E5;
    border-bottom: 1px solid #E5E5E5;    
    height: 1.1333rem;
    line-height: 1.1333rem;
    width: 100%;
    color: #888888;
    font-size: .3467rem;
    span:nth-child(1){
        margin-left: .4rem;
    }
    span:nth-child(2){
        margin-right: .4rem;
    }
}


input:disabled {
    background-color: #FFFFFF
}

input::-webkit-input-placeholder {
    color: #999
}


.pointer-events {
    pointer-events: none
}

.order-header {
  width: 100%;
  height: auto;
  background-color: #FFFFFF;
  margin-bottom: 0.4rem;
  overflow: hidden; }
  .order-header .header-logo {
    width: 100%;
    height: 3.46667rem;
    position: relative; }
    .order-header .header-logo .logo-img {
      width: 2.58667rem;
      height: 2.58667rem;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      -webkit-transform: translate(-50%, -50%);
      border-radius: 50%;
      background-size: 2.58667rem 2.58667rem;
      background-color: #CCCCCC; 
        img{
            height: 100%;
            width: 100%;
            border-radius: 50%;
        }  
    }
  .order-header .count-down {
    width: auto;
    height: auto;
    line-height: 0.86667rem;
    color: #000000;
    font-size: 0.42667rem;
    text-align: center; 
    margin: 0 auto;
    .text-overflow;
    }
  .order-header .cancel-handle {
    width: 100%;
    height: auto;
    text-align: center;
    font-size: 0;
    position: relative; }
    .order-header .cancel-handle a {
      display: inline-block;
      width: 4.29333rem;
      height: 1.16rem;
      line-height: 1.16rem;
      margin: 0.46667rem 0.33333rem;
      font-size: 0.42667rem;
      background-color: #efefef;
      color: #8a8a8a; }
      .order-header .cancel-handle a.payoff, .order-header .cancel-handle a.order-again {
        background-color: #f5bf4f;
        color: #FFFFFF; }
      .order-header .cancel-handle a.order-again {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        -webkit-transform: translate(-50%, -50%);
        margin: 0; }
    .count-down img{
        height: .3333rem;
        width: .2133rem;
        display: inline-block;;
    }
    .content{
        padding: .6rem .4667rem;
    }
    .win-title{
        text-align: center;
        color: #000000;
        font-size: .48rem;
        height: 1.2rem;
    }
    .win-content{
        color: #999;
        font-size: .3733rem;
    }
    .record-win{
        background: rgba(0,0,0,0.5);
        position: fixed;
        left: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
        .record-content{
            width: 8.9333rem;
            height: auto;
            max-height: 9.3333rem;
            margin: 2.3333rem auto;
            background-color: #ffffff;
            border-radius: .1333rem;
            padding: .8rem .6667rem;
            margin-bottom: 0.5rem;
            overflow: scroll;
            .record-title{
                color: #000000;
                font-size: .48rem;
                width: 100%;
                height: 1.0667rem;
                text-indent: .3333rem;
            }
            ul{
                height: auto;
                min-height: 1.2rem;
                border-left: 1px dashed #ccc;
                li{
                    min-height: 1.2rem;
                    line-height: 1.5;
                    color: #888888;
                    font-size: .4rem;
                    position: relative;
                    span{
                        min-height:1.2rem;
                        display: inline-block;
                        padding-left: 0.4rem;
                    }
                    span:nth-child(1){
                        width: 80%;
                        &:after{
                            content: '';
                            position: absolute;
                            left: -.0667rem;
                            top: 0;
                            width: .1333rem;
                            height: .1333rem;
                            border-radius: 50%;
                            background-color: #f5bf4f;
                        }
                    }
                }
            }
        }
    }
    .close-btn{
        background: url(../../../res/images/member_close.png) center center no-repeat;
        background-size: 1.1867rem 1.1867rem;
        height: 1.6rem;
        width: 1.6rem;
        margin: 0 auto;
    }
    .border-top-none{
        border-top: none;
    }
</style>
