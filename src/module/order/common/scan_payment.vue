<template>
    <div class="order_pay" v-if="isReady">
        <div class="header">
            <div class="shopName">{{shopName}}</div>
            <div class="amount_input" @click="focusInput">
                <span class="fl">消费总额</span>
                <input type="Number" v-model="actualAmount"  maxlength="6" placeholder="询问服务员后输入" class="total_input fr" ref="total">
                <div class="fr coin" v-show="actualAmount > 0">￥</div>                
            </div>
        </div>
        <a class="pay_btn" :class="actualAmount > 0 ? 'black' : ''" @click="scanPay">微信支付：￥{{actualAmount || 0}}</a>

    </div>
</template>
<script>
import http from 'src/manager/http';
import global from 'src/manager/global';
import storage from 'src/verdor/storage';
import utils from 'src/verdor/utils';


let payType = utils.getQueryString('payType') || 'wx'; // 支付类型
let wx_sdk = null;
export default {
    data () {
        return {
            actualAmount : '', // 实际支付金额
            shopName : '',
            isReady : false,
            openId : '',
            oid : '',
            data : {},
            isPay : true
        };
    },
    watch : {
        'actualAmount' : function(){
            this.actualAmount = String(this.actualAmount).substring(0,8);
        }
    },
    methods:{
        focusInput(){
            // 获取焦点
            this.$refs.total.focus();
        },
        async getUserInfo(){
            // 获取用户信息
            let {shopName,member,cardPackage,point} = await this.getUserInfo({type:5,shopId:this.shopId});
            this.shopName = shopName;
        },
        async scanPay(){
            // 扫码支付
            if(this.actualAmount <= 0){
                return false;
            }

            let data = await http.scanPay({data:{
                shopId : this.shopId,
                originalPrice : this.actualAmount,
                notDiscountPrice : '',
                isMemberPrice : '',
                code : '',
                point : '',
                memberCardId : '',
                payType : payType,
                openId :  this.openId,
                oid : this.oid
            }});

            this.data = data;
            this.oid = data.oid;
            this.callpay();
        },
        async getOpenId(){
            this.openId = await this.getOpenId();
        },
        callpay(){
            if(this.isPay){
                this.isPay = false;
                wx_sdk.goPay({
                    payData:this.data,
                    payCallBack:(status)=>{
                        if(status){
                            //关闭微信游览器
                            this.$closewindow();
                            this.isPay = true;
                        }else{
                            this.isPay = true;                        
                        }
                    }
                })
            }
        },
    },
    beforeMount(){
        this.isReady = true;
    
    },
    async mounted (){    
        this.getUserInfo();
        utils.setTitle("扫码支付");

        wx_sdk = await import(  /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
        wx_sdk = wx_sdk.default;
    }
}
</script>
<style lang='less' scoped>
@import '../../../res/css/base.less';
.order_pay{
    .setBox(100%,auto);
    min-height: 100%;
    background-color: #ffffff;
    .header{
        .setBox(100%,3.6267rem);
        background: url(../../../res/images/pay_bg.png) center center no-repeat;     
        background-size: cover;       
        .shopName{
            line-height: 1.56rem;
            font-size: .32rem;
            color: #FFFFFF;
            text-align: center;
        }
        .amount_input{
            .setBox(8.9067rem,1.2rem);
            line-height: 1.2rem;
            background: #FFFFFF;
            margin: 0 auto;
            &>span{
                display: block;
                .setBox(2.7467rem,1.2rem);
                text-align: center;
                font-size: .4rem;
                color: #303030;   
            }
        }
        .checkbox{
            .setBox(8.9067rem,.8667rem);
            margin: 0 auto;
            margin-top: .2267rem;
            font-size: .32rem;
            color: #999999;
            text-indent: .2rem;
            input[type="checkbox"]{
                margin-top: .3333rem;
            }
        }
    }
    .content{
        padding: .4rem .5467rem;
        margin-bottom: 1.0667rem;
        .setBox(100%,auto);
        overflow: hidden;
        .item{
            background: #F2F2F2;
            .setBox(auto,1.2rem);
            line-height: 1.2rem;
            margin-bottom: .2667rem;
            .title{
                .setBox(2rem,auto);
                display: inline-block;
                font-size: .3733rem;
                color: #303030; 
                margin-left: .5733rem;
                margin-right: .2rem;
                .text-overflow;
            }
            .money{
                font-size: .32rem;
                color: #D0021B;
            }
            .describe{
                 font-size: .32rem;
                color: #999999;
            }
            &:last-of-type{
                margin-bottom: 0;
            }
        }
    }
}
::-webkit-input-placeholder {
    font-size: .3467rem;
    color: #999999;
    line-height: 0.6133rem;
}
.check{
    background: #FFFFFF;
    .setBox(.4rem,.4rem);
    display: block;
    position: relative;
    background: url(../../../res/images/check.png) center center no-repeat;
    background-size: .4rem .4rem;
}
.checkOn{
    background: url(../../../res/images/check_on.png) center center no-repeat;
    background-size: .4rem .4rem;
}
.preferential_rules{
    font-size: .32rem;
    color: #44C0FF;
    .setBox(1.8667rem,.9333rem);
    line-height: .9333rem;
    background: url(../../../res/images/rules_icon.png) right center no-repeat;
    background-size: .4rem .4rem;
}
.pay_btn{
    display: block;
    .setBox(8.9067rem,1.2rem);
    line-height: 1.2rem;
    font-size: .4rem;
    color: #FFFFFF;
    text-align: center;
    background: #D5D5D5;
    margin: 0 auto;
    transition: all 0.5s;
    position: fixed;
    left: 50%;
    bottom: 30%;
    transform: translate(-50%);
}
.more{
    background: url(../../../res/images/more.png) center center no-repeat;    
    background-size: .2133rem .3467rem;
    .setBox(.5333rem,100%);
    margin-right: .4667rem;
}
.tips{
    background: url(../../../res/images/pay_tpis.png) center center no-repeat;    
    background-size: .4rem .4rem;
    .setBox(.5333rem,100%);
    display: inline-block;
}
.switch{
    background: url(../../../res/images/pay_off.png) center center no-repeat;  
    background-size: 1.0267rem .4933rem;
    .setBox(1.0667rem,100%);
    display: inline-block;   
    margin-right: .4667rem; 
    transition: all 0.2s;
}
.switchOn{
    background: url(../../../res/images/pay_on.png) center center no-repeat;  
    background-size: 1.0267rem .4933rem;
}
.points{
    .setBox(4rem,100%);
    .text-overflow;
}
.rules_content{
    .setBox(6.5333rem,auto);
    margin: 0 auto;
    margin-bottom: .2667rem;
    // padding: .5333rem .4533rem 0 .4533rem;
    padding-top: .5333rem;
    .rules_title{
        font-size: .4533rem;
        color: #303030;
        text-align: center;
        margin-bottom: .2rem;
    }
    ul{
        list-style-type: disc;
        margin-left: .4667rem;
        li{
            font-size: .3467rem;
            color: #303030;
            line-height: .6133rem;
        }
    }
}
.point_input{
    .setBox(3.3333rem,.8rem);
    line-height: .8rem;
    margin-top: .2rem;
    border: none;
    background: #F2F2F2;
    color: #999999;
}
.point_input::-webkit-input-placeholder{
    line-height: 0.8rem;
}
.integral_des{
    margin-right: .4667rem;width:2.3rem;text-align:right;
    .text-overflow;
}
.black{
    background-color: #000000;
}
.total_input{
    font-size: .7467rem;
    color: #E00923;
    .setBox(auto,0.8rem);
    min-width: 1rem;
    max-width: 3.5rem;
    overflow: hidden;
    // line-height: 1.2rem;
    margin-right: .4rem;
    margin-top: .16rem;
    padding: none;
    border: none;
}
.total_input::-webkit-input-placeholder{
    line-height: 1rem;
}
.coin{
    font-size: .7467rem;
    color: #E00923;
    text-align: right;
    .setBox(auto,0.8rem);
    line-height: 0.8rem;
    margin-top: .2rem;
}
</style>