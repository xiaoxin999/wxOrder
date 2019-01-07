<template>
    <section class='inter_detail'>
        <img src="../../../res/images/icon2.png" alt="">
        <div class='top'>
            <div>
                <span class='point'>积分：{{details.param}}</span>
                <div class='name'>{{details.couponName}}</div>
                <div class='button' @click="use">立即使用</div>
            </div>
            
        </div>
        <section class='detail'>
            <div>
                  
                <span class='content'>
                    {{details.useKnow||"暂无"}}
                </span>
                <span class='visible'></span>
            </div>
            
        </section>

        <section class='supple'>
            <div> 
                <span>使用说明:</span>
                <div>
                    ∙有效期至：{{getTime(details.endTime)}}
                </div>
            </div>
        </section>
        <transition name ='fade'>
            <Win  v-if='show' @winEvent='winEvent' :ok='okStyle' :cancel='cancelStyle'>
                <section slot="content" style='height:100%'>
                    <div class='winSec'>
                        <div>
                            <img src="../../../res/images/icon2.png" alt="">
                            <div class='status'>使用成功</div>
                            <span class='info'>您已增加了{{details.param}}积分，可在用户中心查看~</span>
                        </div>
                    </div>
                    
                </section>
            </Win>
        </transition>
        
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import global from 'src/manager/global';
    import http from 'src/manager/http';

    export default{
        data(){
            return{
                okStyle:{
                    content:"去看看",
                    style:""
                },
                cancelStyle:{
                    content:"关闭页面",
                    style:""
                },
                show:false,
                details:{}
            }
        },
        methods:{
            winEvent(str){
                this.show = false;
                if(str == "ok"){
                    this.$router.push("/userCenter")
                }else{
                    this.$closeWindow();
                }
            },
            async use(){

                let data = await http.usePointCard({
                    data:{
                        shopId:global.getShopId(),
                        code:this.details.code
                    }
                })

                if(data) this.show = true;
                
            },
            getTime(time){
                return utils.format(time,"yyyy/MM/dd hh:mm");
            },
        },
        components:{
            Win:()=>import(/* webpackChunkName:"win" */"src/components/phone/win")
        },
        mounted(){
            this.details = storage.session("interCard");
            utils.setTitle("积分卡")
        }
    }

</script>

<style lang ='less' scoped>

    .inter_detail{
        width: 9.2933rem;
        height:11.96rem; 
        background: #FFFFFF;
        border: 1px solid #DDDDDD;
        border-radius: .2667rem;
        position: absolute;
        top: 0;
        left:0;
        bottom: 0;
        right:0;
        margin: auto;
        &>img{
            width: 1.92rem;
            height: 1.92rem;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
        }
        .top{
            height: 5.12rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            display: table;
            &>div{
                display: table-cell;
                vertical-align: middle;
                text-align: center;
                padding-top: 1rem;
                .point{
                   font-family: PingFang-SC-Semibold;
                    font-size: .48rem;
                    color: #303030; 
                }
                .name{
                    margin-top: .2rem;
                    font-size: .4rem;
                    color: #303030;
                }
                .button{
                    font-family: PingFang-SC-Medium;
                    font-size: .48rem;
                    color: #FFFFFF;
                    width: 4.5067rem;
                    height: 1.0267rem;
                    line-height: 1.0267rem;
                    background: #EAC048;
                    border-radius: 1.3333rem;
                    text-align: center;
                    margin: .5333rem auto;
                }
            }
            
        }
        section.detail{
            height: 3rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            font-size: .3467rem;
            color: #999999;


            div{
                width: 90%;
                margin: 0 auto; 
                height: 100%;
                text-align: left;
                .content{
                    display: inline-block;
                    vertical-align: middle;
                    width: 98%;
                    text-indent: .3467rem;
                }
                .visible{
                    height: 100%;
                    vertical-align: middle; 
                    width: 0;
                    display: inline-block;
                }
                
            }
            
            
        }   
        section.supple{
            height: 3rem;
            width: 8.5733rem;
            margin: 0 auto;
            font-size: .3467rem;
            color: #999999;

            &>div{
                width: 90%;
                margin: 0 auto; 
                height: 100%;
                text-align: left;
                padding-top: .2667rem;
                div{
                    margin-top: .1333rem;
                }
                .content{
                    display: inline-block;
                    vertical-align: middle;
                    width: 98%;
                    text-indent: .3467rem;
                }
                .visible{
                    height: 100%;
                    vertical-align: middle; 
                    width: 0;
                    display: inline-block;
                }
                
            }
            
            
        }   
        .winSec{

        
                text-align: center;
                display: table;
                height: 100%;
                width: 100%;
                &>div{
                    height: 100%;
                    display: table-cell;
                    width :100%;
                    vertical-align: middle;
                    img{
                        width: 1rem;
                        height: 1rem;
                    }
                    .status{
                        font-size: .3733rem;
                        color: #303030;
                    }
                    .info{
                        font-size: .32rem;
                        color: #999999;
                    }
                }
                
            
           
        }
    }

</style>
