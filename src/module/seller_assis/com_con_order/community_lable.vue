/*
 * @Author: ruokun.ma 
 * @Date: 2018-06-04 14:41:25 
 * @Module: {社群召集令列表} 
 */

<template>
    <section class='community_list'>
        <header>
            <div class='left' @click='goBack'>
                <img src="../../../res/images/sell_assis/back_page.png" alt="">
            </div>
            <div class='center'>社群召集令</div>
            <div class='right'></div>
        </header>
        <section class='content'>
            <section ref= 'list' class ='item'>
                    <div class='content'>
                        <img :src="getUrl(item.image)" alt="">
                        <div class='right'>
                            <div class='n'>
                                <span class='name' style='vertical-align: middle;'>{{item.title}}</span>
                            </div>
                            <div class='source pubed'>
                                发布
                            </div>
                            <div style='width:0;clear:both'></div>
                            <div class='info' style='font-size:0.26rem'>
                                {{getTime(item)}}
                            </div>
                            <div style='margin-top:0.1rem;font-size:0.26rem;'>
                                <span>推送：{{item.pushTotal}}人</span>
                                <span style='padding-left:0.2rem' >查看：{{item.viewTotal}}人</span>
                            </div>
                        </div>
                    </div>
            </section>
            <div class='tips'>带有选中标签的客户将收到推送信息</div>
            <section class='lableContent' @click='selectLable'>
                <span :class='{lable:true,yellow:item.s}' ref ='lableArr' v-for="(item,index) in lableList" :key='index'>{{item.name}}</span>
            </section>
        </section>

        <div class='go' @click='pub(item)'>
            立即推送
        </div>
    </section>
</template>


<script>
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    export default{
        data(){
            return {
                show:false,
                item:{},
                lableList:[],
                lableArr:[],
                clicked:false
            };
        },
        methods:{
            getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            async pub(item){
                
                if(this.clicked) return ;
                this.clicked = true;
                
                let data;
                try{
                    data = await http.pushCallUp({
                        data:{
                            shopId:global.getShopId(),
                            callUpId:item.id,
                            staffFansId:item.staffFansId,
                            tagIds:Object.values(this.lableArr).join(","),
                            publishShopId:item.publishShopId
                        }
                    },true);

                    this.$store.commit("setWin",{content:"发布成功",callBack:()=>{
                         window.history.back();
                     }});
                }catch(e){
                    this.clicked = false;
                    this.$store.commit("setWin",{content:`${e.error.message}`});
                }
            },
            getTime(item){
                let str = "创建";
                return utils.format(item.createTime,'yyyy-MM-dd hh:mm') + str;
            },
            selectLable(e){
                let tar = e.target;
                if(tar.tagName.toLowerCase() === 'span'){
                    let index = this.$refs.lableArr.indexOf(tar);
                    let item = this.lableList[index];
                    let status = item.s
                    if(status){
                        item.s = false;
                        delete this.lableArr[index];
                    } 
                    else {
                        item.s = true;
                        this.lableArr[index] = item.id;
                    }
                }
            },
            goBack(){
                window.history.back();
            }
        },
        mounted(){
            this.item = storage.session("community_item");
            this.lableList = storage.session("lableTag");
            for(let i = 0;i<this.lableList.length;i++){
                let item = this.lableList[i];
                this.$set(item,"s",false)
            }
            utils.setTitle("闪店卖手");
        }
    }
</script>

<style lang='less' scoped>
    
    .community_list{
        background: #FFFFFF;
        height: 100%;
        header{
            width: 100%;
            height:1.1733rem;
            display: flex;
            align-items: center;
            justify-content: center;

            div.left{
                width:1.6rem;
                padding-left: 0.5rem;
                img{
                    width:0.2667rem;
                    height:0.4667rem;
                }
            }
            div.center{
                font-size: 0.48rem;
                color: #303030;
                text-align: center;
                flex:1;
            }
            div.right{
                width:1.6rem;
                font-size: 0.3467rem;
                color: #EAC048;
                text-align: center;
            }
        }
        .content{

            .item{
                width: 9.2933rem;
                height:2.5067rem;
                margin: 0 auto;
                border-radius: 0.1rem;
                margin-top: 0.3rem;
                display: table;
                background: #F8F8F8;
                border: 1px solid #DDDDDD;
                
                .content{
                    display: table-cell;
                    vertical-align: middle;
                    text-align: center;
                    img{
                        width:1.7rem;
                        height:1.7rem;
                        border-radius: 50%;
                    }
                    div.right{
                        display: inline-block;
                        height:1.7rem;
                        vertical-align: top;
                        width:75%;
                        text-align: left;
                        margin-left: 0.2rem;
                        div.n{
                            display: inline-block;
                            vertical-align: top;
                            span.name{
                                font-size: 0.4rem;
                                font-weight: bold;
                            }
                            span.tag{
                                display: inline-block;
                                width:0.82rem;
                                border: 1px solid #D0021B;
                                border-radius: 0.1rem;
                                text-align: center;
                                color:#D0021B;
                                margin-left: 0.1rem;
                            }
                            img{
                                width:0.36rem;
                                height:0.36rem;
                                vertical-align: middle;
                            }
                            img.temp{
                                width:0.43rem;
                                height:0.3rem;
                            }
                        }
                        .info{
                            span{
                                padding-left:0.2rem;
                            }
                            span:nth-child(1){
                                padding-left: 0;
                            }
                            em{
                                color: rgb(234,192,71);
                            }
                        }

                        .source{
                            width:2.18rem;
                            height:0.84rem;
                            border-radius: 1.33rem;
                            line-height: 0.8rem;
                            text-align: center;
                            color:white;
                            float: right;
                        }

                        .pubed{
                            background-color: rgb(234,192,71);
                        }
                        .unpub{
                            background: #CDCDCD;
                        }

                    }
                }
            }
            .tips{
                font-size: 0.32rem;
                color: #999999;
                text-align: center;
                margin: 0.5rem 0;
            }
            .lableContent{
                font-size: 0.3467rem;
                color: #FFFFFF;
                width: 85%;
                margin: 0 auto;
                span{ 
                    text-align: center;
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    margin: 0.2rem 0.2667rem 0 0;
                    background: #CDCDCD;
                    border-radius: 1.3333rem;
                }
                span.yellow{
                    background: #EAC048;
                }
            }
            
        }
        .go{
            background: #EAC048;
            border-radius: 1.3333rem;
            width:4.5067rem;
            height:0.9067rem;
            line-height:0.9067rem;
            margin: 0 auto;
            text-align: center;
            position: fixed;
            bottom:1rem;
            left:0;
            right:0;
            font-size: 0.3467rem;
            color: #FFFFFF;
        }
    }
</style>


