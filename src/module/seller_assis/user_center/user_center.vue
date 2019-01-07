<template>
  <section class='userCenter'>
      
      <div>
            <div class='user_info'>
                    <div class='photo'>
                        <img style='border-radius:50%' :src="getUrl(baseInfo.imageUrl)" alt="">
                        <div class='name'>{{baseInfo.name}}</div>
                    </div>
                    <div class='other'>
                        <div @click="toRouter('6')"><img src='../../../res/images/sell_assis/user_point_icon.png'>积分：{{info.point}}</div>
                        <div @click="toRouter('5')"><img src='../../../res/images/sell_assis/user_gift.png'>待核销：{{info.exchange}}</div>
                    </div>
                    <!-- <div class='sign'>签到+5积分</div> -->
            </div>
            <section class ='nav'>
                    <ul>
                        <li @click="toRouter('1')">
                            <div class='imgCon'>
                                <img src="../../../res/images/sell_assis/user_order.png" alt="">
                            </div>
                            <div >我的订单</div>
                        </li>
                        <li @click="toRouter('2')">
                            <div class='imgCon'><img src="../../../res/images/sell_assis/copuon.png" alt=""></div>
                            <div>优惠券</div>
                        </li>
                        <li @click="toRouter('3')">
                            <div class='imgCon'><img src="../../../res/images/sell_assis/user_guide.png" alt=""></div>
                            <div>专属导购</div>
                        </li>
                        <li @click="toRouter('4')">
                            <div class='imgCon'><img src="../../../res/images/sell_assis/user_point.png" alt=""></div>
                            <div>积分卡</div>
                        </li>
                    </ul>
            </section>
      </div>
      
  </section>
</template>
<script>
import utils from 'src/verdor/utils';
import storage from 'src/verdor/storage';
import http from 'src/manager/http';
import global from 'src/manager/global';


let routerConfig = {
    "1":"myOrder",
    "2":"coupon",
    "3":"shoppingGuide",
    "4":"interCard",
    "5":"record",
    "6":"memberIntegral",
    "7":"notHaveShoppingGuide"
}

export default{
    data(){
        return {
            info:{},
            baseInfo:{},
            staffFansId : storage.session('login').staffFansId
        }
    },
    methods : {
        toRouter(id){
                let o = {};
                switch(id){ 
                    case "2":
                        o.id = 1;
                        break;
                    case "3":
                        if(this.staffFansId == "0"){
                            id = 7;
                        }
                        o.id = this.staffFansId;
                        break;
                    case "4":
                        o.id = 2;
                        break;
                    case "6":
                        storage.session('type',1);
                        break;
                    default:
                        break;
                }
                this.$router.push({path:"/"+ routerConfig[id],query:o});
        },
        getUrl(url){
            return global.getImgUrl({url});
        },
        async getData(){
            let data = await http.userCenter({
                data:{
                    shopId:global.getShopId()
                }
            })
            this.info =data;
        }
    },
    async mounted(){
        this.getData();
        this.baseInfo = storage.session("login");
        
        this.memberInfo = await http.getUserInfo({data:{
            shopId: global.getShopId(),
            type: 3
		}})
		
        Object.assign(this.memberInfo,this.baseInfo);
        storage.session("membership", this.memberInfo);

            
        utils.setTitle('用户中心');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.userCenter{
    
    &>div{
        background-color: #fff;
        
        .user_info{
            height:6.21rem;
            width: 100%;
            padding-top:1rem;
            background: url(../../../res/images/sell_assis/user_background.png) no-repeat ;
            background-size:100% 5.9rem;
            .photo{
                width: 2.24rem;
                margin: 0 auto;
                text-align: center;
                img{
                    width:2.24rem;
                    height:2.24rem;
                }
                .name{
                    font-size: 0.37rem;
                    color: #FFFFFF;
                }
            }
            .other{
                margin-top: 0.5rem;
                width: 100%;
                &>div{
                    text-align: center;
                    display: inline-block;
                    width: 49%;
                    font-size: 0.35rem;
                    color: #FFFFFF;

                    img{
                        width: 0.35rem;
                        height:0.35rem;
                        position: relative;
                        top:0.05rem;
                        left:-0.1rem;
                    }
                }
                
            }
            .sign{
                margin: 0 auto;
                text-align: center;
                width:2.69rem;
                height:0.84rem;
                line-height: 0.84rem;
                margin-top:0.51rem;
                background-color: #EAC048;
                border-radius: 1.25rem;
            }
            &>div{
                vertical-align: middle;
            }
        }
        .nav{
                height:3.5rem;
                padding: 0 0.8rem;
                ul{
                    height:100%;
                    text-align: center;
                    display: table;
                    width: 100%;
                    font-size: 0.32rem;
                    font-family: PingFang-SC-Medium;
                    color: #303030;
                    li{
                        display: table-cell;
                        height:100%;
                        vertical-align: middle;

                        .imgCon{
                            position: relative;
                            height:35%;
                            img{
                                position:absolute;  
                                top:0;  
                                bottom:0;  
                                left:0;  
                                right:0;  
                                margin:auto;  
                            }
                        }

                        img{
                            width: 0.8rem;
                        }
                        div{
                            margin-top: 0.1rem;
                        }
                    }
                }
            }
    }
    
}
</style>
