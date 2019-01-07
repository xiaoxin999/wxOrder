
<template>
    <section class='list'>
        <header>
            <ul>
                <li @click="toggleSort('coinsTotal',$event)">全部 <span ref='s' class='t show'></span><span class='b'></span></li>
                <li @click="toggleSort('customerTotal',$event)">吸粉<span class='t'></span><span class='b'></span></li>
                <li @click="toggleSort('conversionTotal',$event)">转化<span class='t' ></span><span class='b'></span></li>
                <li @click="toggleSort('coins',$event)">收益<span class='t'></span><span class='b'></span></li>
            </ul>
        </header>
        <section class='select'> 
            <div class='left'>共计：{{lists.length}}人</div>
            <div class='right'>
                <!-- <list @index='selectIndex' :lists='shopList' v-if='shopList.length'></list> -->
                <div class='list' @click = 'showList'>
                    <div class='left'>
                        {{fristValue}}
                    </div>
                    <div class='line'>

                    </div>
                    <div class='right'>
                        <span></span>
                    </div>
                </div>
       
                    <component 
                        :is="showStr"
                        :type="'select'"
                        :list="shopList"
                        :title="'选择店铺'"
                        @closePicker="closePicker"
                    >
                    </component>

            </div>
        </section>
        <section :class='{bottom:true,auto:!isfill,fill:isfill}' >
            <section class ='card' v-for="(item,index) in lists" :key='index'>
                    <div class='content'>
                        <img style = 'border-radius:50%' :src="getUrl(item.imageUrl)" alt="">
                        <div class='right'>
                            <div class='n'>
                                <span class='name'>{{item.staffName||"暂无"}}</span>
                                <span class='tag' v-if="item.position=='1'||item.position=='2'">{{item.position == 1?"店长":"店员"}}</span>
                            </div>
                            <div class='callCard' @click='showDetail(item.fansId)'>

                                查看详情
                            </div>
                            <div style='width:0;clear:both'></div>
                            <div class='star'>
                                 <star :levelList = 'levelArr' :levelKey = "'totalGold'" :backKet = "'start'" :total = 'item.coinsTotal'></star>
                            </div>
                            <div class='info'>
                                <span>客户：<em>{{item.customerTotal}}</em></span>
                                <span style='padding-left:1.2rem'>收益：<em>{{item.coins}}</em></span>
                            </div>
                        </div>
                    </div>
            </section>

        </section>
    </section>
</template>

<script>
    import http from "src/manager/http";
    import global from "src/manager/global";
    import storage from "src/verdor/storage";
    import utils from "src/verdor/utils";

    export default{
        data(){
            return{
                lists:[],
                shopList:[],
                selectId:0,
                isfill:true,
                levelArr:[],
                lastTar:null,
                clickStack:{
                    "coinsTotal":1,
                    "customerTotal":1,
                    "conversionTotal":1,
                    "coins":1,
                },
                lastClickStack:"coinsTotal",
                showStr:"",
                fristValue:""
            }
        },
        methods:{
            showList(){
                this.showStr = "multi-picker"
            },
            closePicker(type){

                this.showStr = "";
                if(type.type != 'close'){
                    this.selectId = this.shopList[type.payload[0]].shopId;
                    this.fristValue = this.shopList[type.payload[0]].name;
                    this.getList();
                }
                
                
                
            },
            getUrl(url){
                if(url == undefined) return "";
                return global.getImgUrl({url});
            },
            async getList(){

                let data = await http.staffRanking({
                    data:{
                        shopId:global.getShopId(),
                        managementId:this.selectId
                    }
                })
                this.lists = data.list.filter((item)=> {
                    return item.shopIds.split(",").indexOf(this.selectId)>-1
                });
                this.toggleSort('coinsTotal',false)
                
                this.levelArr = Object.values(data.level);
                this.isfill = this.lists.length>3?false:true;

            },
            //上下切换
            toggleSort(type,e){
                if(this.lastTar&&e){
                    this.lastTar.className = this.lastTar.className.replace(" show","");
                    if(type!=this.lastClickStack) this.clickStack[this.lastClickStack] = 1;
                }
                let s = this.clickStack[type]++;
                
                this.lists = this.lists.sort((a,b)=>{
                    let num = a[type] - b[type];
                    return s%2?num:-num;
                })
                if(e){
                    let index = s%2?0:1;
                    let tar = e.currentTarget.children[index];
                    this.lastTar = tar;
                    this.lastTar.className +=" show";
                    this.lastClickStack = type;
                }
            },
            showDetail(str){
                this.$router.push({path:"/shopAssistantInfo",query:{id:str}});
            }
        },
        beforeDestroy(){
            // storage.session("ass_center_detail",null)
        },
        components:{
            list:()=>import(/* webpackChunkName:"select_list" */"./select_list.vue"),
             star:()=>import(/* webpackChunkName:"star" */"src/components/star"),
            'multi-picker': () => import (/* webpackChunkName: "multi_picker" */ 'src/components/multipicker/index')

        },
        async mounted(){

            let detail  = storage.session("ass_center_detail");
            

            if(detail&&detail.shop){
                this.shopList = detail&&detail.shop;
            }
            else if(storage.session('wxInfo')){
                this.shopList =  storage.session("wxInfo").shopList;
                
            }else{
                 let res = await http.getUserInfo({
                    data:{
                        shopId: global.getShopId(),
                        type: 3,
                        from: 0
                    }})
                this.shopList = res.shopList;
            }
            for(var i = 0;i<this.shopList.length;i++){
                let item  = this.shopList[i];
                item.shopId = item.id||item.shopId;
                item.name = item.shopName = item.name||item.shopName;
            }

            
            this.selectId = this.shopList[0].shopId;
            this.fristValue = this.shopList[0].shopName;

            this.lastTar = this.$refs.s;
            this.getList();
            utils.setTitle("店员排行");
        }
    }
</script>
<style lang='less' scoped>
    .list{

        header{
            height:2rem;
            background-color: rgb(25,25,25);
            font-size: 0.4rem;
            color: #FFFFFF; 
            border-bottom: white solid 0.2rem;
            ul{
                display: flex;
                align-items:center;
                text-align: center;
                height: 100%;
                li{
                    flex:1;
                    vertical-align: middle;
                    span{
                        
                        width: 0;
                        height:0;
                        position: absolute;
                        border-top:0.2rem solid white;
                        border-right:0.12rem solid  rgba(0,0,0,0);
                        border-bottom:0.1rem solid rgba(0,0,0,0);
                        border-left:0.12rem solid  rgba(0,0,0,0);
                        margin-left: 0.1rem;
                        opacity:0.42;
                        &.t{
                            transform: rotate(180deg);
                            margin-top: -0.1rem;
                        }
                        &.b{
                            margin-top: 0.32rem;
                            
                        }
                        &.show{
                            opacity: 1;
                        }
                    }
                    
                }
            }
        }

        .list{
            height:0.8rem;
            width:4.8rem;
            background: #FFFFFF;
            border: 1px solid #999999;
            border-radius: 1.3333rem;
            margin-right: 0.3rem;
            &>div{
                
                height:100%;
                display: inline-block;
                vertical-align: middle;
            }
            .line{
                width: 0.04rem;
                height:0.4267rem;
                background-color: #999999;
            }
            .left{
                width: 3.57rem;

                font-size: 0.35rem;
                color: #303030;
                height: 0.77rem;
                line-height: 0.77rem;
                text-align: center;
                white-space:nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                text-indent: 0.2rem;
            }
            .right{

                width:0.69rem;
                span{
                        
                        display: inline-block;
                        position: relative;
                        top:50%;
                        left:50%;
                        transform: translate(-50%,-25%);
                        width: 0;
                        height:0;
                        border-top:0.25rem solid black;
                        border-right:0.16rem solid  rgba(0,0,0,0);
                        border-bottom:0.1rem solid rgba(0,0,0,0);
                        border-left:0.16rem solid  rgba(0,0,0,0);
                    }
            }
        }


        .select{
            height:1.2rem;
            display: flex;
            align-items: center;
            background: #F8F8F8;
            &>div{
                flex:1;
            }
            .left{
                font-size: 0.35rem;
                color: #303030;
                text-indent: 0.3rem;
            }
            .right{

            }
        }

        .auto{
            margin-top: 0.2rem;
            padding-top: 0.2rem;
        }

        .fill{
            position: absolute;
            top: 3.2rem;
            bottom: 0px;
            left: 0px;
            width:100%;
        }

        .bottom{
            
            background-color: white;
            padding-bottom: 0.2rem;
            


            .card{
                width: 9.28rem;
                height:3rem;
                margin: 0 auto;
                border: 1px solid #999999;
                border-radius: 0.1333rem;
                margin-top: 0.3rem;
                display: table;
                
                .content{
                    display: table-cell;
                    vertical-align: middle;
                    text-align: center;
                    img{
                        width:1.7rem;
                        height:1.7rem;
                    }
                    div.right{
                        display: inline-block;
                        height:1.7rem;
                        vertical-align: top;
                        width:71%;
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
                        }
                        .star{
                            width: 50%;
                            margin-top: -0.2rem;
                            margin-bottom: 0.2rem;

                            img{
                                width: 0.32rem;
                                height:0.32rem;
                                margin-left: 0.1rem;
                            }

                            img:nth-child(1){
                                margin: auto;
                            }

                        }
                        .info{
                            margin-top:0.1rem;
                            font-size:0.26rem;
                            span{
                                em{
                                    color:rgb(234,192,71);
                                }
                            }
                            
                        }
                        .callCard{
                            display: inline-block;
                            width:2.18rem;
                            height:0.84rem;
                            background-color: rgb(234,192,71);
                            border-radius: 1.33rem;
                            float:right;
                            line-height: 0.8rem;
                            text-align: center;
                            color:white;
                        }


                    }
                }
            }
        }

    }
</style>
