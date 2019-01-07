<template>
    <section class='inter_detail'>
        <img style = 'border-radius:50%' :src="getUrl(info.imageUrl)" alt="">
        <div class='top'>
            <div>
                <span class='point'>{{info.staffName}}</span>
                <div class='tag' v-if="info.position == 1">店长</div>
                <div style='margin-top:0.2rem;' class='star'>
                    <star :levelList = 'levelArr' :levelKey = "'totalGold'" :backKet = "'start'" :total = 'totalMoney'></star>
                </div>
            </div>
        </div>
        <section class='detail'>
            <div>
                <div class='tips'>
                    扫码即可绑定此导购，为你提供专属服务
                </div>
                <img :src="url" alt="">
            </div>
        </section>

        <section class='supple'>
            <div> 
                您可以直接在“公众号界面”输入内容，与Ta沟通。
            </div>
        </section>

        
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import http from "src/manager/http";
    import global from "src/manager/global";

    export default{
        data(){
            return{
                urlInfo:{},
                url:"",
                info:"",
                levelArr:[],
                totalMoney:0
            }
        },
        methods:{
            async getInfo(){
                let data = await http.myQrCode({
                    data:{
                        shopId: global.getShopId()
                    }
                })
                this.url = data;
            },
             getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            async getStaffInfo(){
                
                let data = null;

                try{

                    data = await http.getStaffInfo({
                        data:{
                            shopId: global.getShopId()
                        }
                    },true)

                }
                catch(e){
                    /* 没有权限时，页面关闭 */
                    if(e.error.code == 5303){

                        this.$store.commit("setWin",{content:"没有权限!",callBack:()=>{
                            pay.closePage();
                        }})

                    }
                }
                

                
                this.info = data;
                this.levelArr = this.info.level;
                this.totalMoney = Number(this.info.coinsTotal);
            }
        },
        components:{                  
            star:()=>import(/* webpackChunkName:"star" */"src/components/star")
        },
        beforeDestroy(){
            // storage.session("ass_center_detail",null)
        },
        mounted(){
            this.getInfo();

            let info = storage.session("ass_center_detail");
            if(info){
                this.info = info;
                this.levelArr = this.info.level;
                this.totalMoney = Number(this.info.coinsTotal);
            }else{
                this.getStaffInfo();
            }
            


            utils.setTitle("我的");
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
            height: 3.2rem;
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

                div.tag{
                    width:0.82rem;
                    border: 1px solid #D0021B;
                    border-radius: 0.1rem;
                    text-align: center;
                    margin: 0.15rem auto;
                }
                .star{
                    img{
                        width: 0.32rem;
                        height:0.32rem;
                        margin-left: 0.1rem;
                    }
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
            height: 6.33rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            font-size: .3467rem;
            color: #999999;

            .tips{
                font-size: 0.35rem;
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
                    width:5rem;
                    height:5rem;
                    margin-top: 0.3rem;
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
            height: 2.2rem;
            width: 8.5733rem;
            margin: 0 auto;
            font-size: .3467rem;
            color: #999999;

            &>div{
                width: 90%;
                margin: 0 auto; 
                height: 2.2rem;
                line-height: 2.2rem;
                text-align: center;
                font-size: 0.32rem;
                color: #999999;
                
            }
            
            
        }   

    }

</style>
