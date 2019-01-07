<template>
    <section class='inter_card'> 
        <header>
            <ul @click='clickMenu'>
                <li>
                    <span class='down' data-i = '0' ref='s'>
                        疯抢
                    </span>
                </li>
                <li>
                    <span data-i = '1'>
                       砍价
                    </span>
                </li>
            </ul>
        </header> 
        <section class='content'>
            <section class='item' v-for="(item,index) in list" :key='index' v-if='status == 0'>

                <div class='left'>
                        <div class='img'>
                            <img style = 'border-radius:50%' :src='getUrl(item.listImage)'/>
                        </div>
                        <div class='info'>
                            <span class='title text-over'>{{item.goodsName}}</span>
                            <div class='time'>抢购价格：<em class='price'>{{item.price}}</em></div>
                            <span class='point'>下单时间：{{getTime(item.createTime)}}</span>
                        </div>
                        <div class='right' @click='()=>{use(item)}'>
                            <span :class = "{grey:item.status == 7||item.status == -2}">{{hook[item.status]}}</span>
                        </div>
                </div>
                
            </section>

            <section v-if='status != 0' class='noOrder'>
                <div class='total'>
                    <img src="../../../res/images/sell_assis/no_order.png" alt="">
                    <div class='info'>您还没有订单，快去下单吧~</div>
                    <div class='button' @click='goIndex'>GO</div>
                </div>
            </section>

        </section>
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import http from "src/manager/http";
	import global,{SQB_WX,SQB_ALI} from 'src/manager/global';


    let wx_sdk = null;
    export default{
        data(){
            return{
                _tempTar:null,
                list:[],
                status:0,
                hook:{
                    "-2":"已取消",
                    // "4":"已支付",
                    "7":"已领取",
                    "9":"待付款",
                    "4":"可领取"
                }
            }
        },
        methods:{
            goIndex(){
                this.$router.push("/sellerIndex")
            },
            getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            clickMenu(e){
                let target = e.target;
                if(!/span/gi.test(target.tagName)){
                    target = target.children[0];
                }
                target.className += 'down';

                this.status = target.getAttribute("data-i");
                this._tempTar&&(this._tempTar.className = '');
                this._tempTar = target;
            },
            async getList(){
                let data = await http.crazyOrderList({
                    data:{
                        shopId:global.getShopId()
                    }
                })
                this.list = data;
            
                for(var i = 0;i<this.list.length;i++){
                    let item = this.list[i];
                    if(item.status == '9') item.s = 2;
                    else if(item.status == '4') item.s = 1;
                    else item.s = 0;
                }

                //先按状态排序 在按时间排序
                utils.sortByAll(this.list,['s','createTime'],false)


            },
            getTime(time){
                return utils.format(time,"yyyy/MM/dd hh:mm");
            },
            use(item){
                storage.session("order_item",item);
                if(item.status == '4') this.$router.push("/receiveQrcode");
                else if(item.status == '9') this.grabGoods(item);
                
            },
            // 抢购专栏，立即抢购
            async grabGoods(item){
                let openId = storage.session('openId');
                let payType = utils.getQueryString('payType') || 'wx';
               let data = await http.payWaitOrder({data:{
                    shopId:global.getShopId(),
                    payType:payType,
                    oid:item.oid,
                    sqbData:JSON.stringify({
                        hash:'myOrder'
                    })
               }});

                if(data.payType == SQB_WX || data.payType == SQB_WX){
                    let oid = data.oid;
                    storage.session('myorder_oid',oid);
                }
                this.data = data;
                this.callpay(item);
            },
            callpay(item){
                //  改用wx goPay()
                wx_sdk.goPay({
                    payData:this.data,
                    payCallBack:(res)=>{
                       this.check(res);
                    }
                })
            },
            check(res){
                if (res) {
                        this.$store.commit('setWin',{
                            content: "支付成功",
                            type:"alert",
                            callBack:(str)=>{
                                this.getList();
                            }
                        });
                        } else {
                            this.$store.commit('setWin',{content: "支付失败"});
                        }
            }
        },
        async mounted(){
            this.getList();
            this._tempTar = this.$refs.s;

            /* 有item的情况下，证明是点击了待支付的 */
            let item = storage.session("my_order_item");
            if(item){
                this.grabGoods(item);
                storage.session("my_order_item",null);
            }

            let oid = storage.session('myorder_oid');
            if(oid){
                storage.session('myorder_oid',null);
                let data = await http.getStatusByOid({
					data: {
						shopId:global.getShopId(),
                        oid: oid,
						type:"grabGoodsPay"
					}
                })
                this.check(data);
            }

            utils.setTitle('我的订单');

            wx_sdk = await import(  /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk');
            wx_sdk = wx_sdk.default;
        }
    }
</script>

<style lang='less' scoped>

    .inter_card{
        height:2rem;
        background-color: rgb(32,32,32);
        
        header{
            height: 100%;
            ul{
                color:#FFFFFF;
                font-size: .4rem;
                display: table;
                width:100%;
                height:100%;
                li{
                    height:100%;
                    display: table-cell;
                    text-align: center;
                    vertical-align: middle;
                    span{
                        display: inline-block;
                        width:1.4133rem;
                        height:0.7rem;
                    }
                    span.down{
                        border-bottom: 2px solid #FFFFFF;
                    }
                }
            }
        }
        section.content{
            width: 9.2933rem;
            margin: .2667rem auto 0;
            .item{
                width: 100%;
                height:2.5067rem;
                background: #F8F8F8;
                border: 1px solid #DDDDDD;
                margin-bottom: .2933rem;
                display: table;
                .left{
                    width:65%;
                    display:inline-block;
                    height: 100%;
                    display: table-cell;
                    vertical-align: middle;
                    text-align: left;
                    padding-left: .2667rem;
                    &>div{
                        display: inline-block;
                    }
                    .info{
                        margin-left: 0.2rem;
                        .title{
                            font-size: 0.4rem;
                            color: #303030;
                            display: inline-block;
                            width: 4rem;
                        }
                        .time{
                            margin-top: 0.1rem;
                            .price{
                                font-size: 0.4rem;
                                color: #D0021B;
                            }
                        }
                        .point{
                            display: inline-block;
                            margin-top: 0.1rem;
                        }
                        .time,.point{
                            font-family: PingFang-SC-Medium;
                            font-size: .3467rem;
                            color: #999999;
                        }
                    }
                    .img{
                        img{
                            width:1.7067rem;
                            height:1.7067rem;
                        }
                    }
                    .right{
                        font-family: PingFang-SC-Medium;
                        display:inline-block;
                        font-size: .3467rem;
                        color: #FFFFFF;
                        vertical-align: top;
                        margin-left:-0.5rem;
                        span{
                            display: inline-block;
                            width: 2.1867rem;
                            height: .84rem;
                            line-height: 0.84rem;
                            background: #EAC048;
                            border-radius: 1.3333rem;
                            text-align: center;
                            vertical-align: middle;
                        }
                        span.grey{
                            background: rgb(205,205,205);
                        }
                    }
                }
                
            }
            .noOrder{
                
                
                .total{
                    margin: auto;
                    position: absolute;
                    width: 75%;
                    top:0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    height:5rem;
                    text-align: center;
                    div{
                        margin-top:0.56rem;
                    }
                    .button{
                        width: 2.1867rem;
                        height:0.84rem;
                        line-height: 0.84rem;
                        text-align: center;
                        background: #EAC048;
                        border-radius: 1.3333rem;
                        font-size: 0.3467rem;
                        color: #FFFFFF;
                        margin: 0.56rem auto;
                    }
                    img{
                        width:1rem;
                        height:1.1067rem;
                    }
                }
            }
        }
    }

</style>
