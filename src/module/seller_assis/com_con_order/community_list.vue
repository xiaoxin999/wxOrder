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
            <div class='right' @click='add'>{{position}}</div>
        </header>
        <section class='content' v-if='list.length>0'>
            <section ref= 'list' class ='item' v-for="(item,index) in list" :key='index'>
                    <div class='content'>
                        <img :src="getUrl(item.image)" alt="">
                        <div class='right'>
                            <div class='n'>
                                <span class='name' style='vertical-align: middle;'>{{item.title}}</span>
                            </div>
                            <div :class='{source:true,pubed:item.pushed == "0",unpub:item.pushed != "0"}' @click='pub(item)'>
                                {{item.pushed != "0" ? "已发布" :"发布"}}
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
        </section>
        <section class='none' v-else>
            <img src="../../../res/images/sell_assis/none_content.png" alt="">
            <div>暂无内容～</div>
        </section>

        <transition name='fade'>
            <picker :list="selectList" :returnValue= "'index'"  v-if="show" @closePicker="closePicker"></picker>  
        </transition>

    </section>
</template>


<script>
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import http from 'src/manager/http';
    import global from 'src/manager/global';

    export default{
        data(){
            return {
                show:false,
                list:[],
                position:"",
                selectList:[{name:"全部发送"},{name:"标签筛选"}],
                id:"",
                staffFansId:'',
                item:''
            };
        },
        methods:{
            async closePicker(obj){
                let {type,data} = obj;
                if(type=="ok"){
                    if(data[0] == 1){
                        storage.session("community_item",this.item);
                        this.$router.push("/communityLable");
                    }
                    else{
                        let data = await http.pushCallUp({
                            data:{
                                shopId:global.getShopId(),
                                callUpId:this.id,
                                staffFansId:this.staffFansId,
                                publishShopId:this.item.publishShopId
                            }
                        })

                        if(data){
                            this.$store.commit("setWin",{content:"发布成功"});
                            this.item.pushed = "1";
                            this.item.pushTime = Math.round(new Date() - 0 / 1000);
                            utils.sortByAll(this.list,["pushed","pushTime"])
                        }
                        
                    }
                    
                }
                this.show = false;
            },
            getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            getTime(item){
                let str = item.pushed=="0"?"创建":"发布";
                let time = item.pushed=="0"?item.createTime:item.pushTime;
                return utils.format(time,'yyyy-MM-dd hh:mm') + str;
            },
            pub(item){
                if(item.pushed!="0") return;
                this.id = item.id;
                this.staffFansId = item.staffFansId;
                this.show = true;
                this.item = item;
            },
            add(){
                this.$router.push("/communityAdd");
            },
            goBack(){
                window.history.back();
            }
        },
        components:{
            "picker":()=>import(/* webpackChunkName:"picker" */"src/components/picker/picker")
        },
        async mounted(){
           
            let data = await http.getCallUpList({
                data:{
                    shopId: global.getShopId()
                }
            })
            
            this.position = data.position == 1?"新增":"";
            this.list = data.list;
            utils.sortByAll(this.list,["pushed","creteTime"])
            storage.session("lableTag",data.tags);
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
            height:calc(~"100% - 1.1733rem");
            overflow: auto;
            .item{
                width: 9.2933rem;
                height:2.5067rem;
                margin: 0.3rem auto;
                border-radius: 0.1rem;
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
        }
        .none{
            width:4.3733rem;
            margin-top: 2.5rem;
            margin-left: 3.6rem;
            img{
                width:4.3813rem;
                height:4.4107rem;
            }
            div{
                font-size: 0.32rem;
                color: #999999;
                display: inline-block;
                width: 1.7333rem;
                margin: 0.5rem 0.6rem;
            }
        }
    }
</style>


