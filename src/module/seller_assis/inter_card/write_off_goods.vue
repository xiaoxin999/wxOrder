<template>
    <section class='inter_detail'>
        <div class='top'>
            <div>
                <span class='name'>{{info.goodsName}}</span>
                <div class='price'>
                    订单编号：<em>{{info.oid}}</em>
                </div>
            </div>
        </div>
        <section class='detail'>
            <div>
                <img :src="info.listImage" v-if='info.listImage' alt="">
            </div>
        </section>

        <section class='supple'>

        </section>

        <section :class='{button:true,ok:isAllow,no:!isAllow}' @click='use()'>
            确认核销
        </section> 

        

        <win :width="200" :height='120' :type="'alert'" @winEvent='winEvent' v-if='isSuccess'>
            <div slot="content" class='content'>
                <img src="../../../res/images/sell_assis/success.png" alt="">
                <div>核销成功！</div>
            </div>
        </win>

    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import http from 'src/manager/http';
    import global from 'src/manager/global';

    export default{
        data(){
            return{
                info:{},
                isAllow:false,
                isSuccess:false
            }
        },
        methods:{
            getUrl(url){
                let u = global.getImgUrl({url});
                console.log(u);
                return u;
            },
            winEvent(str){
                this.$closeWindow();
            },
            async use(type){

                if(!type&&!this.isAllow){
                    this.$store.commit("setWin",{content:"您没有权限"})
                    return;
                }else{
                    let data = await http.crazyOrderVerificationSheet({
                        data:{
                            crazyOrderKey:utils.getQueryString("crazyOrderKey")||"",
                            checkPermission:type?1:0,
                            shopId:global.getShopId()
                        }
                    })
                    if(data&&!type){
                        this.$store.commit("setWin",{content:"核销成功",callBack:()=>{
                            this.$closeWindow();
                        }})
                        return;
                    }
                    this.info = data;
                    let u = this.info.listImage;
                    this.info.listImage = this.getUrl(u)
                    this.isAllow = this.info.flag;
                    if(this.info === true) this.isSuccess = true;
                }
                
            }
        },
        components:{
            'win': () => import (/* webpackChunkName: "win" */ 'src/components/phone/win')
        },
        mounted(){
            this.use(1);
            utils.setTitle("核销疯抢商品");
        }
    }

</script>

<style lang ='less' scoped>

    .inter_detail{
        width: 9.2933rem;
        height:11.72rem;
        background: #FFFFFF;
        border: 1px solid #DDDDDD;
        border-radius: .2667rem;
        position: absolute;
        top: 0;
        left:0;
        bottom: 0;
        right:0;
        margin: auto;

        .content{
            
            width: 60%;
            margin: 0.5rem auto;
            text-align: center;
        
            img{
                width: 1rem;
                height:1rem;  
            }
            &>div{
                margin-top: 0.32rem;
            }
        }
        
        &>img{
            width: 1.92rem;
            height: 1.92rem;
            border: 1px solid #DDDDDD;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
        }
        .top{
            height: 3.4667rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            display: table;
            &>div{
                display: table-cell;
                vertical-align: middle;
                text-align: center;
                padding-top: 0.5rem;
                .name{
                   font-family: PingFang-SC-Semibold;
                    font-size: .48rem;
                    color: #303030; 
                }

                .price{
                    font-size: 0.3467rem;
                    margin-top:0.76rem;
                    color: #303030;
                }
 
            }
            
        }
        section.detail{
            height: 7.0667rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            font-size: .3467rem;
            color: #999999;

            .tips{
                font-size: 0.3467rem;
                color: #303030;
                font-weight: bold;
                text-align: center;
                margin-top: 0.3rem;
            }
           
            &>div{
                width: 90%;
                margin: 0 auto; 
                height: 100%;
                text-align: center;

                 &>img{
                    width:6.4rem;
                    height:6.4rem;
                    margin-top: 0.2rem;
                }   


                
            }
            
            
        }   
        section.supple{

            height: 1.8rem;
            width: 8.5733rem;
            margin: 0 auto;
            color: #999999;
            display: flex;
            align-items: center;
            padding-left: 0.3rem;
          
            
        }   

        .ok{
            background: #EAC048;
        }
        .no{
            background: #C7C7C7;
        }
        .button{
            
            border-radius: 1.3333rem;
            width:4.5067rem;
            height:1.04rem;
            line-height: 1.04rem;
            font-size: 0.48rem;
            color: #FFFFFF;
            position: absolute;
            left: 0;
            right:0;
            margin: -1.2rem auto;
            text-align: center;
        }
    }

</style>
