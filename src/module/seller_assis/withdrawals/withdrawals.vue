<template>
    <section class='withdrawals'>
        <div>提现金额</div>
        <div class="withdrawals_price">
            <input type="number" placeholder="请输入要提现金额" v-model="gold">
        </div>
        <div>可用金额：{{profit.coins}}金币 <span class="withdrawals_btn sq" @click="allWidthdrawals()">全部提现</span></div>
        <div><span class="withdrawals_btn" @click="withdrawals()">申请</span></div>
    </section>
</template>

<script>
    import utils from 'src/verdor/utils';
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from "src/verdor/storage";
    export default{
        data(){
            return{
                gold:"",
                profit:{},//收益
            }
        },
        methods:{
            allWidthdrawals(){
                this.gold=this.profit.coins;
                
            },
            async withdrawals(){
                if(this.gold>0){
                    let data = await http.enchashment({
                    data:{
                        subShopId:global.getShopId(),
                        shopId:global.getShopId(),
                        gold:this.gold,
                    }
                })
                setTimeout(function(){WeixinJSBridge.call('closeWindow');},100);
                }else{
                    this.$store.commit("setWin",{content:"请输入提现金额"});
                }
                
            },
        },
        mounted(){
        this.profit=storage.session("profit_data");
        // console.log(this.profit);
        }
    }
</script>

<style lang='less' scoped>
    .withdrawals{
        height:100%;
        background: #fff;
        &>div{
            width: 88%;
            height: 1.4rem;
            line-height: 1.4rem;
            margin: 0 auto;
            font-size: 0.4rem;
            color: #303030;
            position: relative;
        }
        .withdrawals_price{
            width: 100%;
            background: #f8f8f8;
        }
        div:nth-child(2){
            background:#F8F8F8;
            input{
                background: #F8F8F8;
                border: none;
                width: 88%;
                height: 100%;
                margin-left: 6%;

            }
            input::-webkit-input-placeholder{
                color:#999;
            }
        }
        div:nth-child(4){
            text-align: center;
            margin: 0.84rem 0 0 0.84rem;
        }
        .withdrawals_btn{
            display: inline-block;
            width: 50%;
            background: #EAC048;
            border-radius: 100px;
            color: #fff;
            text-align: center;
            height: 0.88rem;
            line-height: 0.88rem;
            cursor: pointer;
            font-size: 0.38rem;

        }
        .sq{
            width: 26%;
            position: absolute;
            right: 6%;
            top: 0.4rem;
        }
    }


</style>


