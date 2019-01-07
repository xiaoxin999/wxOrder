<template>
    <div class="order-cancel" v-cloak v-if="isReady">
        <div class="pay-content">
            <div class="pay-subhead">
                <div class="pay-sub fl">退款商品</div>
            </div>
            <div class="pay-list" v-for="(goods,i) in goodsList" :key="i">
                <goods-list :goods="goods" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></goods-list>
            </div>
            <div class="pay-list" v-for="(packages,index) in packageList" :key="index">
                <package-list  :packages="packages" :isMember="Boolean(memberInfo)" :memberDiscount="discount"></package-list>
            </div>
        </div>
        <div class="pay-content">
            <div class="pay-subhead">
                <div class="pay-sub fl">选择取消原因</div>
                <div class="couponMore fr" @click="chooseReason(true)">{{reason}}</div>
            </div>
            <div class="cancel-cause">
                <textarea placeholder="请填写详情原因,以便商家更快帮您处理（必填）" v-model="remark" maxlength="50">
                </textarea>
                <div class="input-font">{{remark.length}}/50</div>
            </div>
        </div>
        <div class="pay-bottom">
            <div class="pay-box fl">
                <span class="fl">¥{{total}}(按原路退回)</span>
                <span class="fl preferential">|&nbsp;已包含配送费</span>
            </div>
            <a href="javascript:void(0)" class="fr pay-btn" @click="cancelOrder">提交</a>
        </div>
        <reason-list :isShow="isReason" @reason="chooseReason"></reason-list>
    </div>
</template>
<script>
import http from 'src/manager/http';
import global from 'src/manager/global';
import storage from 'src/verdor/storage';
import utils from 'src/verdor/utils';

export default {
    data () {
        return {
            orderInfo : null,
            goodsList : [],
            packageList : [],
            shopId : this.$route.query.shopId || global.getShopId(),
            isReady : false,
            oid : this.$route.query.oid,
            isReason : false, // 是否选择退单原因
            reason : '', // 退单主要原因
            memberInfo : null,
            discount : null,
            remark : '',
            total : ''
        };
    },
    methods:{
        async showOrderDetail(){
            // 获取订单详情
            let data = await http.showOrderDetail({data:{
                shopId : this.shopId,
                oid : this.oid
            }});

            this.orderInfo = data;
            this.total = (Number(this.orderInfo.memberPrice) + Number(this.orderInfo.price)).toFixed(2);
            this.goodsList = data.goodsData.goods;
            this.packageList = data.goodsData.package;
            this.isReady = true;
        },
        async cancelOrder(){
            // 取消订单
            if(this.reason == ''){
                this.$store.commit('setWin',{
                    content: '请选择取消订单原因'
                })
                return false;
            }

            if(this.remark == '其他原因'){
                this.$store.commit('setWin',{
                    content: '请输入详情原因'
                })
                return false;
            }

            let data = await http.cancelOrder({data:{
                orderShopId : this.shopId,
                oid : this.oid,
                remark : this.remark,
                reason : this.reason,
                shopId : this.shopId
            }});

            if(data){
                this.$router.push({path:"/takeCancelSuccess",query:{'oid':this.oid,'shopId':this.shopId}});
            }
        },
        chooseReason(obj){
            // 选择退单原因
            if(obj === true){
                this.isReason = true;
            }else{
                this.reason = obj.name || '';
                this.isReason = obj.isShow;
            }
        }
    },
    components: {
        'goods-list': () => import (/* webpackChunkName: "goods_list"*/ 'src/module/bespeak_system/bes_detail/goods_list'),
        'package-list': () => import (/* webpackChunkName: "package_list"*/ 'src/module/bespeak_system/bes_detail/package_list'),
        'reason-list': () => import (/* webpackChunkName: "reason"*/ 'src/module/order/common/cancellation_reason')
    },
    computed:{},
    mounted(){
        let {memberInfo,discount} = storage.session('memberDetail');
        this.memberInfo = memberInfo;
        this.discount = discount;

        this.showOrderDetail();
        utils.setTitle('取消订单');
    },
}
</script>
<style lang='less' scoped>
@import "../../../res/css/base.less";
.pay-content{
    background-color: #FFFFFF;
    margin-bottom: .2667rem;
    overflow: hidden;
}
.pay-subhead {
    width: 100%;
    height: 1.25333rem;
    line-height: 1.25333rem;
    text-indent: 0.4rem;
    border-bottom: 1px solid #DDDDDD
}

.pay-subhead .pay-sub {
    width: auto;
    height: 1.25333rem;
    font-size: 0.42667rem;
    position: relative
}

.pay-subhead .pay-sub:after {
    content: '';
    display: block;
    width: 0.08rem;
    height: 0.37333rem;
    background-color: #6ba9f1;
    position: absolute;
    left: 0.24rem;
    top: 0.42667rem
}

.pay-subhead .pay-tit {
    width: 100%;
    height: 1.25333rem;
    font-size: 0.42667rem;
    background-color: #FFFFFF;
    position: relative
}
.pay-list{
    line-height: 1.2rem;
}

.pay-subhead .pay-tit:after {
    content: '';
    display: block;
    width: 0.08rem;
    height: 0.37333rem;
    background-color: #f5a623;
    position: absolute;
    left: 0.24rem;
    top: 0.42667rem
}
.cancel-cause{
    height: auto;
    width: 100%;
    overflow: hidden;
    textarea{
        height: 4.1333rem;
        width: 100%;
        padding: .3333rem;
        border: none;
        font-size: .3733rem;
        resize: none;
    }
}
textarea::-webkit-input-placeholder{
    color:#C3C3C3;
}
.input-font{
    text-align: right;
    font-size: .3733rem;
    padding-right: .3333rem;
    height: 1.2rem;
    line-height: 1.2rem;
}
.pay-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  width: 100%;
  height: 1.33333rem;
  line-height: 1.33333rem;
  padding-left: .4rem;
  font-size: 0.42667rem;
  color: #FFFFFF;
  box-sizing: border-box;
  -webkit-box-sizing: border-box; }
  .pay-bottom .preferential {
    color: #DFDFDF;
    margin-left: 0.13333rem;
    font-size: .3733rem }
.pay-bottom span{
    font-size: .4267rem;
}
.pay-btn{
    height: 100%;
    width: 2.6667rem;
    font-size: .4267rem;
    color: #666;
    display: block;
    border: #cccccc 1px solid;
    background-color: #EFEFEF;
}
.pay-box{
    width: calc(~'100% - 2.6667rem');
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.couponMore{
    background: url(../../../res/images/moretable.png) right center no-repeat;
    background-size: 0.21333rem 0.33333rem;
    width:auto;
    min-width: 1.3333rem;
    max-width: 5rem;
    height:100%;
    text-align : center;
    padding-right : 0.4rem;
    margin-right : 0.4rem;
    .text-overflow;
}
</style>