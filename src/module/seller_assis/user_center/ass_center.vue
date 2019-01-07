<template>
   <section class='assCenter'>
      
            <div class='user_info'>

                    <div class='left'>
                        <span>{{info.conversionTotal}}</span>
                        <div>转化</div>
                    </div>
                    
                    <div class='photo'>
                        <img style = 'border-radius: 50%;' :src="getUrl(info.imageUrl)" alt="">
                        <div class='name'>{{info.staffName}}</div>
                    </div>
                    
                    <div class='left'>
                        <span>{{info.customerTotal}}</span>
                        <div>客户</div>
                    </div>
            </div>
            <div class='money'>
                <div class='left'>累计金币：{{info.coinsTotal}}</div>
                <div class='line'></div>
                <div class='right'>当前金币：{{info.coins}}</div>
            </div>
            <section class='thumb_up' v-if="info.position == 2 &&info.tags.length>0">
                <div>
                    <div v-for='(item,index) in info.tags' :key='index' :style="{backgroundColor:item.num == 0?'#CDCDCD':colorArr[index%4]}">{{item.name}}
                        <img src="../../../res/images/sell_assis/praise_icon.png" alt="">
                        {{item.num}}
                    </div>
                </div>
            </section>
            <ul class='list'>
                <li @click='toggleMenu("qrcode")'>
                    <img src="../../../res/images/sell_assis/qrcode.png" alt="">
                    <span>我的二维码</span>
                    <em>></em>
                </li>
                <li @click='toggleMenu("ass_ranking")' v-if="this.info.position == '1'">
                    <img src="../../../res/images/sell_assis/ass_ranking.png" alt="">
                    <span>店员排行</span>
                    <em>></em>
                </li>
                <li @click='toggleMenu("shop_tools")' v-if="this.info.position == '1'">
                    <img src="../../../res/images/sell_assis/shop_tools.png" alt="">
                    <span>店铺工具</span>
                    <em>></em>
                </li>
                <li @click='toggleMenu("my_cou")'>
                    <img src="../../../res/images/sell_assis/my_cou.png" alt="">
                    <span>我的客户</span>
                    <em>></em>
                </li>
                <li @click='toggleMenu("money")'>
                    <img src="../../../res/images/sell_assis/money.png" alt="">
                    <span>收益</span>
                    <em>></em>
                </li>
            </ul>

            <transition name='fade'>
                <div class='bg' v-if='show'>
                    <div class='maskClick' @click="clickTool('cancle')"></div>
                    <ul class='shop_tool'  >
                        <li @click='clickTool("inter")'>积分卡<div></div></li>
                        <li @click='clickTool("coupon")'>优惠券<div></div></li>
                        <li @click='clickTool("cancle")'>取消</li>
                    </ul>
                </div>
            </transition>
            
            

            

  </section>
</template>


<script>
    import utils from "src/verdor/utils";
    import http from "src/manager/http";
    import global from "src/manager/global";
    import storage from "src/verdor/storage";
	var shopId = utils.getQueryString('shopId') || 10069;
    export default{
        data(){
            return {
                colorArr:["#FF6F49","#FCA73E","#0AC687","#349AEB"],
                thumbUpList:[
                ],
                info:{},
                show:false,
                selfTags:[]
            }
        },
        methods:{
            getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            async getInfo(){
                
                let data = null;

                try{

                    data = await http.getStaffInfo({
                        data:{
                            shopId: shopId
                        }
                    },true)

                }
                catch(e){
                    /* 没有权限时，页面关闭 */
                    if(e.error.code == 5303){

                        this.$store.commit("setWin",{content:"没有权限!",callBack:()=>{
                            this.$closeWindow();
                        }})

                    }
                } 
                
                this.info = data;
                this.selfTags = data.tagIds.split(",");

                //存储点击数量
                this.clickNum = data.clicked;

                this.info.tags = this.info.tags.filter((item)=>{
                    /* 模拟点赞数，后期要去除 */
                    let a = this.clickNum.filter((ele)=>{

                        if(ele.tagId == item.id){
                            item.num = ele.clickCount;
                            return true;
                        }
                        return false;
                    });
					return a.length>0;
                }).sort((a,b)=>{
                    return b.num - a.num;
                })
                
            },
            toggleMenu(id){
                
                let str = '';
                storage.session("ass_center_detail",this.info);
                switch(id){
                    case "qrcode":
                        str = '/guideRcode';
                        break;
                    case "ass_ranking":
                        str = '/rankList';
                        break;
                    case "my_cou":
                        str = '/customerList';
                        break;
                    case "money":
                        str = '/revenueRecord';
                        break;
                    case "shop_tools":
                        // str = '/shop_tools';
                        this.show = true;
                        break;
                    default:
                        break;
                }
                this.$router.push(str)
            },
            clickTool(str){
                
                let id = null;
                switch(str){
                    case "inter":
                        id=0;
                        break;
                    case "coupon":
                        id=1;
                        break;
                    case "cancle":
                        this.show = false;
                        break;
                    default:
                        break;
                }
                
               id!=null&&this.$router.push({path:"/distriCard",query:{type:id,p:this.info.position}})
            }
        },
        async mounted(){
            this.getInfo();
            utils.setTitle("我的")
        }

    }

</script>


<style lang='less' scoped>

    .assCenter{

            .user_info{
                height:4rem;
                width: 100%;
                background-color: rgb(20,20,20);
                display: table;
                vertical-align: middle;
                text-align: center;
                color:white;
                &>div{
                    display: table-cell;
                    vertical-align: middle;
                    text-align: center;
                    height:100%;
                }
                .left span,.right span{
                    font-size: 0.48rem;
                }
                .left div,.right div{
                    font-size: 0.4rem;
                }
                .left,.right{
                    font-size: 0.4rem;
                }
                .left{
                    height:100%;
                }
                .right{
                    height:100%;
                }
                .photo{

                    img{
                        width:2.24rem;
                        height:2.24rem;
                    }
                    .name{
                        font-size: 0.37rem;
                        color: #FFFFFF;
                    }
                }
                
            
            }
            .money{
                height:1.47rem;
                text-align: center;
                font-size: 0.4rem;
                color: #303030;
                display: flex;
                flex-flow: row;
                align-items: center;
                justify-content: center;

                .left{
                    flex: 1;
                }
                .right{
                    flex:1;
                }
                .line{
                    border: 1px solid #979797;
                    width:1px;
                    height:0.4933rem
                }
                
            }
            .thumb_up{
                background: #FFFFFF;
                min-height:3.3333rem;
                margin-bottom: 0.2rem;
                
                &>div:nth-child(1){
                    width: 85%;
                    margin: 0 auto;
                    div{
                        display: inline-block;
                        height: 0.84rem;
                        border-radius: 1.3333rem;
                        line-height: 0.84rem;
                        padding: 0 0.5rem;
                        margin: 0.3rem 0.05rem;
                        font-size: 0.3467rem;
                        color: #FFFFFF;
                        img{
                            height:0.35rem;
                            width:0.35rem;
                        }
                    }
                }
                
            }

            ul.list{
                li{
                    height:1.33rem;
                    line-height:1.33rem;
                    margin-bottom: 0.05rem;
                    background-color: white;
                    padding-left: 0.7rem;
                    img{
                        width:0.48rem;
                        height:0.48rem;
                        vertical-align: middle;
                    }
                    span{
                        display: inline-block;
                        height: 100%;
                        text-indent: 0.2rem;
                        font-size: 0.35rem;
                        color: #303030;
                        font-weight: bold;
                        vertical-align: middle;
                    }
                    em{
                       position: absolute;
                       right: 0.5rem;
                    }
                }
            }

            div.bg{
                background-color: rgba(0,0,0,0.6);
                height: 100%;
                width:100%;
                position: fixed;
                top:0;
                .maskClick{
                    height: 100%;
                }
                ul.shop_tool{
                    height:4.7rem;
                    width: 100%;
                    position: fixed;
                    bottom:0;
                    font-size: 0.3733rem;
                    color: #303030;

                    border-top: 1px solid #999999;
                    border-top-left-radius: 0.2667rem;
                    border-top-right-radius: 0.2667rem;
                    background-color: #FFFFFF;
                    li{
                        height:1.6rem;
                        line-height: 1.6rem;
                        text-align: center;
                        
                        div{
                            border-bottom: 1px solid #979797;
                            width: 80%;
                            margin: 0 auto;
                        }
                    }
                    
                }

            }

            
            
    }
    


</style>
