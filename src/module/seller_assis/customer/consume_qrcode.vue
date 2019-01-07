<template>
    <section class='inter_detail'>
        <img style = 'border-radius:50%' :src="getUrl(info.imageUrl)" alt="">
        <div class='top'>
            <div>
                <span class='point'>{{info.name}}</span>
                <div class='info'>
                      将二维码展示给店内人员，您的消费金额将会
转为积分，存入您的积分账户中
                </div>
            </div>
        </div>
        <section class='detail'>
            <div>
                <div class='tips'>
                    
                </div>
                <img :src="url" alt="">
                <img class='refersh' @click="refersh" src="../../../res/images/sell_assis/refersh.png" alt="">
            </div>
        </section>

        <section class='supple'>
            <div> 
                消费1元获得1积分
            </div>
        </section>

        
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import global from 'src/manager/global';
    import http from 'src/manager/http';

    let qrcode = null;
    export default{
        data(){
            return{
                info:{},
                url:""
            }
        },
        methods:{
            getUrl(url){
                return global.getImgUrl({url});
            },
            async getCode(){
                this.url = await http.userQrcode({
                    data:{
                        shopId:global.getShopId()
                    }
                })
                
                this.url = qrcode.getQrBase64(this.url+"?&r="+Date.now(), {
                    padding: 15,
                    width: 300,
                    height: 300,
                    correctLevel: QRErrorCorrectLevel.L
                });
                
            },
            refersh(){
                this.getCode();
            }
        },
        components:{
            
        },
        async mounted(){
            qrcode = await import(/* webpackChunkName:"jr-qrcode" */"src/verdor/jr-qrcode.js");
            this.getCode();
            this.info = storage.session("login");
            utils.setTitle("我的");
        }
    }

</script>

<style lang ='less' scoped>

    .inter_detail{
        width: 9.2933rem;
        height:11.7333rem;
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
            height: 3.5rem;
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


                .info{
                    font-size: 0.35rem;
                    color: #999999;
                    margin-top:0.2rem;
                    text-align:left;
                    text-indent:0.35rem
                }

            }
            
        }
        section.detail{
            height: 6.33rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            font-size: .3467rem;
            color: #999999;

            .tips{
                font-size: 0.32rem;
                color: #303030;
                text-align: center;
                margin-top: 0.3rem;
            }
           
            &>div{
                width: 90%;
                margin: 0 auto; 
                height: 100%;
                text-align: center;

                 &>img{
                    width:4.2667rem;
                    height:4.2667rem;
                    margin-top: 0.3rem;
                }   
                &>img.refersh{
                    width:0.6rem;
                    height:0.5333rem;
                    display: block;
                    margin: .3rem auto;
                }
                .content{
                    display: inline-block;
                    vertical-align: middle;
                    width: 98%;
                    text-indent: .3467rem;
                }

                
            }
            
            
        }   
        section.supple{
            height: 1.5rem;
            width: 8.5733rem;
            margin: 0 auto;
            font-size: .3467rem;
            color: #999999;

            &>div{
                width: 90%;
                margin: 0 auto; 
                height: 1.5rem;
                line-height: 1.5rem;
                text-align: center;
                font-size: 0.32rem;
                color: #999999;
                
            }
            
            
        }   

    }

</style>
