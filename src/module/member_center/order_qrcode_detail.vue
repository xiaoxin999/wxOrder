<template>
    <section class='orderQrcodeDetail'>
        <header>
            <span>支付信息</span>
        </header>
        <section class='con'>
            <p>支付总额<span>¥{{obj.originalPrice}}</span></p>
            <p>优惠金额<span>-¥{{(Number(obj.originalPrice) - (Number(obj.memberPrice)+Number(obj.price)+Number(obj.shopDiscountCash))).toFixed(2)}}</span></p>
            <p>实付金额<span>¥{{Number(obj.memberPrice)+Number(obj.price)}}</span></p>
            <p>结账方式<span>{{Number(obj.memberPrice)>0&&Number(obj.price)>0?"混合支付":Number(obj.memberPrice)>0?"会员支付":"微信支付"}}</span></p>
            <p>结账订单<span>{{obj.oid}}</span></p>

        </section>
    </section>
</template>
<script>
import utils from "src/verdor/utils";
import storage from "src/verdor/storage";

export default {
    data () {
        return {
            obj:{}
        };
    },
    methods:{},
    components: {},
    computed:{},
    mounted(){
        this.obj = storage.session("order_data");
        utils.setTitle("订单详情")
    },
}
</script>
<style lang='less' scoped>
    .orderQrcodeDetail{
        height:100%;
        background-color: white;
       header{
           height: 1.2rem;
           line-height: 1.2rem;
           border-bottom: 1px solid #DDDDDD;
           span{
                font-size: 0.4533rem;
                color: #333333;
                padding-left: 0.3rem;
                border-left: 0.08rem solid #F5BF4F;
                margin-left: 0.6rem;
           }
       } 
       .con{
           width:85%;
           margin: 0 auto;
           p{
               font-size: 0.3733rem;
                color: #555555;
                margin-top: 0.35rem;
                span{
                    
                    float: right;
                }
           }
       }
    }
</style>