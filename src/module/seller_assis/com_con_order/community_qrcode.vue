/*
 * @Author: ruokun.ma 
 * @Date: 2018-06-04 14:41:25 
 * @Module: {社群召集令列表} 
 */

<template>
    <section class='community_qrcode'>
        <div>
            <header>
                <div class='title'>{{title}}</div>
                <div class='tips'>
                    长按<span>二维码</span>添加社群疯抢为助手
                </div>
            </header>
            <section class='qrcode'>
                <img :src="imgUrl" alt="">
            </section>
            <section class='subtri'>
                {{text}}
            </section>
        </div>
    </section>
</template>


<script>
    import http from "src/manager/http";
    import global from 'src/manager/global';
    import utils from 'src/verdor/utils';

    export default{
        data(){
            return {
                text:"",
                callUpId:"",
                staffFansId:"",
                fid:"",
                title:"",
                imgUrl:""
            };
        },
        methods:{
            getUrl(url){
                this.imgUrl = global.getImgUrl({url});
            }
        },
        async mounted(){
            
            let {callUpId,staffFansId,publishShopId} = utils.getRouterParams();
            //获取优惠券详情
            let data = await http.getCallUpDetail({
                data:{
                    callUpId,
                    staffFansId,
                    publishShopId,
                    shopId:global.getShopId()
                }
            })
            
            this.title = data.title;
            this.text = data.describe;
            this.getUrl(data.image);
            utils.setTitle("闪店卖手");
        }
    }
</script>

<style lang='less' scoped>
    .community_qrcode{
        
        background-color: white;
        width:100%;
        height:100%;
        &>div{
            width: 80%;
            margin:0 auto;
            header{
                text-align: center;
                padding-top:2rem;
                font-weight: bold;
                .title{
                    font-size: 0.4rem;
                    color: #303030;
                }
                .tips{
                    font-size: 0.3467rem;
                    color: #303030;
                    margin-top: 0.5rem;
                    height:1.5rem;
                    border-bottom:0.04rem dashed #DDDDDD;
                    span{
                        color: #EAC048;
                    }
                }
            }
            .qrcode{
                display: flex;
                align-items: center;
                justify-content: center;
                height:7.2rem;
                border-bottom:0.04rem dashed #DDDDDD;
                img{
                    width:6.4533rem;
                    height:6.4533rem;
                }
            }
            .subtri{
                font-size: 0.3467rem;
                color: #999999;
                margin-top: 0.8rem;
                text-indent: 0.5rem;
            }
        }
        
        
    }
</style>


