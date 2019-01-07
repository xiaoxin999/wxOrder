<template>
      <div class="order-cancel" id="order-cancel" v-cloak>
	<div class="order-header">
		<div class="header-logo">
			<div class="logo-img" :style="{backgroundImage: 'url('+ logoImage +')'}">
			</div>
		</div>
        <template v-if="from == 2">
            <div class="count-down" v-if="isTimes">支付成功</div>
            <div class="cancel-handle">
            <p class="couponCode">取餐号:{{orderInfo.pickupNo}}</p>
            <template>
                <a href="javascript:void(0)" class="order-again" @click="openOrder" >再来一单</a>
            </template>     
            </div>
        </template>
        <template v-else>
            <div class="count-down" v-if="isTimes">等待支付，剩余{{times}}...</div>
                <div class="count-down" v-else>订单已取消</div>
                <div class="cancel-handle">
                    <template v-if="isTimes">
                        <a href="javascript:void(0)" @click="openPayWin('1')">取消订单</a>
                        <a href="javascript:void(0)" class="payoff" @click="goPay">去支付</a>
                    </template>
                    
                    <template v-else>
                        <a href="javascript:void(0)" class="order-again" @click="openOrder" >重新点单</a>
                    </template>     
            </div>
        </template>
	</div>
	<div class="pay-details margin-bottom">
		<div class="pay-concent">
			<div class="pay-subhead">
				<div class="pay-sub fl">基本信息</div>
			</div>
			<div class="pay-box" v-if="orderInfo.type == '1' || orderInfo.type == '3'">
				<div class="pay-shouBox" style="margin-right:0"><span class="fl">称&nbsp;&nbsp;&nbsp;呼</span> <input type="text"  v-model="orderInfo.name" readonly="readonly" disabled="disabled" class="inputWidth" id="name" maxlength="20"></div>
			</div>
			<div class="pay-box"  v-if="orderInfo.type == '1' || orderInfo.type == '3'">
				<div class="pay-shouBox"><span class="fl">手机号</span> <input type="number"  v-model="orderInfo.phone" readonly="readonly" disabled="disabled" id="phone" maxlength="11"></div>
			</div>
			<div class="pay-box" v-if="orderInfo.type == '3'">
				<div class="pay-shouBox"><span class="fl">定时取</span> <input type="text"  v-model="orderInfo.getTime" readonly="readonly" disabled="disabled"  > </div>
			</div>
			<div class="pay-box" v-if="orderInfo.type == '1'">
				<div class="pay-shouBox"><span class="fl">桌台号</span> <input type="text"  v-model="orderInfo.tableName" readonly="readonly" disabled="disabled" > </div>
			</div>
			<div class="pay-address" v-if="orderInfo.type == '2' || orderInfo.type == '4'">
				<div class="addressBox">
					<span class="fl">收货地址</span> 
					<div class="fl address-content"><div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{orderInfo.address}}</div> <div class="fl">{{orderInfo.name}}</div>  <div class="fl">{{orderInfo.phone}}</div></div>
				</div>
			</div>
			<div class="pay-box" v-if="orderInfo.remark != ''">
				<div class="pay-shouBox"><span class="fl">备注</span> <input type="text"  v-model="orderInfo.remark" readonly="readonly" disabled="disabled" id="remark" maxlength="50"></div>
			</div>
			<div class="pay-box" v-if="orderInfo.invoiceHeader != ''">
				<div class="pay-shouBox"><span class="fl">发票抬头</span> <input type="text"  v-model="orderInfo.invoiceHeader" readonly="readonly" disabled="disabled" id="involicHeader" maxlength="50"></div>
			</div>
			<!--地址信息-->
			<div class="pay-box" v-if="orderInfo.type == '1' && orderInfo.address !=''">
				<div class="pay-shouBox"><span class="fl">地址</span> <input type="text"  v-model="orderInfo.address" readonly="readonly" disabled="disabled" id="address" maxlength="50"></div>
			</div>
             <div class="pay-box" v-if="orderInfo.type == '3' && orderInfo.shopAddress != ''">
				<div class="pay-shouBox"><span class="fl">地址</span> <input type="text"  v-model="orderInfo.shopAddress" readonly="readonly" disabled="disabled"  maxlength="50"></div>
			</div>
		</div>
	</div>
	<div class="pay-details margin-bottom">
		<div class="pay-concent" style="margin-bottom:15px">
			<div class="pay-subhead">
				<div class="pay-sub fl">商品详情</div>
			</div>
            <div class="pay-list" v-for="(goods,index) in goodsList" :key="index+'_'">
                <!-- <goods-list :goods="goods"></goods-list> -->
            <goods-list :goods="goods" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></goods-list>
            </div>
            <!-- <package-list v-for="packages in packagesList" :packages="packages" :key="packages.id">
            </package-list> -->
            <package-list v-for="packages in packagesList" :packages="packages" :key="packages.id" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></package-list>
			<div class="pay-list" style="height: auto;" v-if="orderInfo.type == '2' || orderInfo.type == '4'">
	            <div class="pay-goods">
	                <div class="pay-name fl">
	                	<template v-if="orderInfo.type == '2'">
	                		配送费
	                	</template>
	                	<template v-if="orderInfo.type == '4'">
	                		快递费
	                	</template>
	                </div>
	                <div class="pay-num fl"></div>
	                <div class="pay-sum fl">￥{{orderInfo.moveFee}}</div>
	            </div>
	        </div>
			<div class="pay-list" style="height: auto;" v-if="orderInfo.point != '0'">
				<div class="integral-info">
					已使用{{orderInfo.point}}积分,抵扣{{orderInfo.pointCash}}元
				</div>
			</div>
			<div class="pay-info">
				<span class="fl" >总价￥{{orderInfo.originalPrice}} &nbsp;&nbsp; 
					<template v-if="orderInfo.point != '0'">
						优惠￥{{orderInfo.pointCash}}
					</template>
				</span>
				<span class="fr" style="color: #d0021b;text-align: right;">￥{{orderInfo.price}}</span>
			</div>
			<a :href="'tel:'+getTel(userDate.shopList,userDate.id)" class="tel">联系商家</a>
		</div>
	</div>
	<div class="pay-details margin-bottom">
		<div class="pay-concent">
			<div class="pay-subhead">
				<div class="pay-sub fl">订单信息</div>
			</div>
			<div class="order-infos">所属商家：{{userDate.shopName}}</div>
			<div class="order-infos">订单编号：{{orderInfo.oid}}</div>
			<div class="order-infos">下单时间：{{transformTime(orderInfo.createTime)}}</div>
			<div class="order-infos">订单类型：<span style="color: #F5A623;">{{orderInfo.typeName}}</span></div>
			<div class="order-infos">支付状态：<span style="color: #F5A623;">
				<template v-if="getStatus(orderInfo.status) == '已结账' && orderInfo.type == '3'">
					已支付
				</template>
				<template v-else>
					{{getStatus(orderInfo.status)}}
				</template>
			</span>
			</div>
			<div class="order-infos">支付方式：{{orderInfo.paymentName}}</div>
		</div>
	</div>
	<div class="payWIn" v-if="openWins">
		<div class="payContent">
			<div class="pay_header">是否取消订单</div>
			<div class="fl pay_btn" @click="openPayWin">取消</div>
			<div class="fl pay_btn" @click="thisUnpaidOrder">确定</div>
		</div>
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
                userDate : storage.session('select-shop'), //用户信息
                orderInfo : {}, //订单信息
                goodsList : [], //商品
                packagesList : [], //套餐
                isPhone : false , //是否显示手机号
                isInvolicHeader : false, //是否显示发票台头
                isAddress : false,//是否显示地址
                payDetailUrl : '', //跳转详情url
                times : '', //倒计时时间
                isTimes : true , //是否允许倒计时
                openWins : false, //打开弹窗
                reflowInfo:null,//若重新点单 需要的数据
                orderShopId : this.$route.query.shopId,
                logoImage:"",
                memberInfo:null,
                discount : null, // 获取会员等级折扣 
                from:this.$route.query.from,
                showOperate:true
            }
        },
        methods : {
    		async showWctDetail() {
                // 获取详情
                let data = await http.showOrderDetailPost({data:{
                    oid: storage.session('oid'),
					shopId: this.shopId,
                    merchId: this.userDate.merchId,
                    orderShopId : this.orderShopId
                }})
                this.orderInfo = data;
                this.goodsList = data.goodsData.goods;
                 if(this.goodsList){
                    for(let j = 0;j<this.goodsList.length;j++){
                        this.goodsList[j].price = this.goodsList[j].price/this.goodsList[j].num
                    }
                }
                
                this.packagesList = data.goodsData.package;
                if(this.packagesList){
                    for(let a = 0;a<this.packagesList.length;a++){
                        this.packagesList[a].price = this.packagesList[a].price/this.packagesList[a].num
                    }
                }
                this.countDown(data.createTime);
                this.reflowInfo = utils.deepCopy(data.goodsData);

                // 获取头像
                let {shopList} = this.userDate;
                for(var i=0,len=shopList.length;i<len;i++){
                    if(this.orderShopId == shopList[i].id){
                        this.logoImage = global.getImgUrl({url:shopList[i].logoImage});
                        break;
                    }   
                }
                
                var arr = utils.deepCopy(this.goodsList);
                if(!utils.isEmptyObject(this.goodsList)) {
                    for(var i = 0; i < arr.length; i++) {
                        if(arr[i].attr) {
                            for(var j = 0; j < arr[i].attr.length; j++) {
                                if(arr[i].attr[j].name) {
                                    for(var k = 0; k < arr[i].attr[j].name.length; k++) {
                                        arr[i].attr[j].attrPrice = [];
                                        arr[i].attr[j].attrPrice.push(arr[i].attr[j].name[k].split(':'));
                                        arr[i].attr[j].name[k] = String(arr[i].attr[j].name[k].replace(':', '￥'));
                                    }
                                }

                            }
                        }
                    }
                }
                        
				
			},
			getTel : function(list,shopId){
				// 获取电话号码
				var i,tel;
				for(i=0;i<list.length;i++){
					if(list[i].id == shopId){
						tel = list[i].telephone;
					}
				}
				return tel;
			},
			async goPay(){
				this.$router.push({path:"/payDetails",query:{shopId:this.orderShopId}});
			},
			async thisUnpaidOrder(){
                // 取消订单
                let data = await http.cancelUnpaidOrder({
                    data:{
                        shopId : this.orderShopId || this.shopId,
                        oid : storage.session('oid')
                    }
                });
                this.openWins = false;
                this.isTimes = false;
                
			},
			countDown : function(d){
				function zero(n){
					var n = parseInt(n, 10);
					if(n > 0){
						if(n <= 9){
							n = "0" + n;	
						}
						return String(n);
					}else{
						return "00";	
					}
				};
				
				var countFun = setInterval(()=>{
            		var deadline = new Date(Math.round(Number(d) * 1000)); // 过期时间
	            	var currentTime = new Date(); //当前时间
	            	var time = Math.round(((deadline.getTime() - currentTime.getTime()) / 1000) + 600); //加上延迟时间
	            	var m = Math.floor((time / 60)) > 0? zero(Math.floor((time / 60)) % 60) : "00";
	            	var s = zero(time % 60);
	            	this.times = m+'分'+s+'秒';
            		if(time <= 0){
            			this.isTimes = false;
            			this.thisUnpaidOrder();
            			clearInterval(countFun);
            		}
            	},1000);
			},
			openPayWin : function(type){
				// 打开弹窗
				if(type == '1'){
					this.openWins = true;
				}else{
					this.openWins = false;
				}
			},
			openOrder : function(){
				// 去点餐
                var {shopList} = storage.session('select-shop');
                var shopInfo;
				for(var i=0;i<shopList.length;i++){
					if(shopList[i].id == this.orderShopId){
                        shopInfo = shopList[i];
                        break;
					}
				}
	
                this.$router.push("/shopSelect");
				storage.session('order-reflow',{
					shop : shopInfo,
					data : this.orderInfo.goodsData
				});
            },
             async getUserInfo(){
                // 获取会员信息
                let user = await http.getUserInfo({data:{
                    
                    shopId : global.getShopId(),
                    type : 1,
                    from : 0
                }});

                storage.session("memberInfo",user);


                this.memberInfo = storage.session("select-shop") ? storage.session("memberInfo").member : storage.session("wechatShop").member;
                
                this.discount = this.memberInfo.level ? this.memberInfo.level.discount : 1;
            },
			transformTime : function(time){
				// 转换时间
				return utils.format(new Date(Number(time * 1000)),'yyyy-MM-dd hh:mm');
			},
			getStatus : function(item){
				// 获取订单状态
				switch(item){
					case '-2' :
						return '已取消';
						break;
					case '1' : 
						return '待确认';
						break;
					case '2':
						return '已确认';
						break;
					case '3':
						return '加菜';
						break;
					case '4':
						return '已结账';
						break;
					case '7':
						return '已领取';
                        break;
					default :
						return '待付款';
				};
			},
			
        },
        mounted(){
            this.showWctDetail();
            this.getUserInfo();
            utils.setTitle("订单详情");
        },
        components: {
            'goods-list': () => import (/* webpackChunkName: "goods_list"*/ 'src/module/bespeak_system/bes_detail/goods_list'),
            'package-list': () => import (/* webpackChunkName: "package_list"*/ 'src/module/bespeak_system/bes_detail/package_list'),
        }
    }
</script>
<style scoped>



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
  background: url(../../res/images/integral-icon.png) 0.4rem center no-repeat;
  background-size: 0.4rem 0.4rem;
  width: 100%;
  height: 0.8rem;
  line-height: 0.8rem;
  color: #CCCCCC;
  padding-left: 1.06667rem;
  box-sizing: border-box;
  font-size: 0.32rem; }

.order-infos {
  width: 100%;
  height: 0.6rem;
  line-height: 0.6rem;
  padding-left: 0.4rem;
  color: #525252;
  font-size: 0.37333rem;
  box-sizing: border-box; }

.pay-address {
  width: 100%;
  height: 1.73333rem;
  line-height: 0.86667rem;
  border-bottom: 1px solid #ddd;
  position: relative; }
  .pay-address .addressBox {
    margin-left: 0.4rem;
    width: calc(100% - 15px);
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
      height: 1.73333rem;
      line-height: 0.86667rem;
      font-size: 0.34667rem; }

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
    width: calc(100% - 15px);
    height: 1.25333rem;
    margin-left: 0.4rem;
    font-size: 0;
    border-bottom: 1px solid #dddddd;
    box-sizing: border-box
}

.pay-details .pay-concent .pay-box .pay-shouBox span {
    width: 30%;
    height: 1.25333rem;
    font-size: 0.34667rem;
    color: #333333
}

.pay-details .pay-concent .pay-box .pay-shouBox span.more-Tbale {
    position: absolute;
    right: 0.93333rem;
    top: 0.45333rem;
    width: 0.21333rem;
    height: 0.33333rem;
    background: url(../../res/images/moretable.png) no-repeat;
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
    width: calc(50% - 30px);
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
    background: url(../../res/images/integral-tip.png) center center no-repeat;
    background-size: 0.53333rem 0.53333rem
}

.pay-details .pay-list .integral-icon {
    display: block;
    width: 0.42667rem;
    height: 100%;
    background: url(../../res/images/integral-icon.png) center center no-repeat;
    background-size: 0.42667rem 0.42667rem
}

.pay-details .pay-list .integral-off {
    display: block;
    width: 1.02667rem;
    height: 0.52rem;
    cursor: pointer;
    margin-top: 0.36rem;
    margin-left: 0.13333rem;
    background: url(../../res/images/on-off.png) no-repeat;
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
    background: url(../../res/images/on-off.png) no-repeat;
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
    text-indent: 0.4rem;
    border-bottom: 1px solid #DDDDDD
}

.pay-list:last-child .pay-goods {
    border-bottom: none
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
  height: 6.4rem;
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
      background-color: #CCCCCC; }
  .order-header .count-down {
    width: 100%;
    height: 0.86667rem;
    line-height: 0.86667rem;
    color: #000000;
    font-size: 0.42667rem;
    text-align: center; }
  .order-header .cancel-handle {
    width: 100%;
    height: 2.06667rem;
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
        .couponCode{
        text-align: center;
        font-size: 0.4rem;
        font-weight: 600;
        }
</style>
