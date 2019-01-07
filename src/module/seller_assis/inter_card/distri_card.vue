<template>
    <section class='inter_card'> 
        <header>
            <ul @click='clickMenu'>
                <li>
                    <span class='down' ref='s'>
                        全部
                    </span>
                </li>
                <li>
                    <span>
                        可用
                    </span>
                </li>
                <li>
                    <span>
                        过期
                    </span>
                </li>
            </ul>
        </header> 
        <section class='content'>
            <section class='item' v-for="(item,index) in list" :key='index' v-if='showCard(item)&&(type==0?true:(item.diyType == type?true:false))'>
                <div class='left'>
                        <span class='title'>{{item.name}}</span>
                        <div class='time' v-if="item.validityType == 1">有效期至：{{getTime(item.startTime,item.endTime)}}</div>
                        <div class ="time" v-if="item.validityType == 0">有效期至：领券后{{item.relativeTime}}天</div>
                        <div class='info'>
                            <span class='point'>数量：<em>{{item.total}}</em></span>
                            <span class='point'>分配：<em>{{item.allocatedQuantity}}</em></span>
                            <span class='point'>发放：<em>{{item.issuedQuantity}}</em></span>
                        </div>
                </div>
                <div class='right' @click='distri($event,item)'>
                    <span v-if='(item.validityType == 0||(item.validityType == 1&&count(item.endTime)))&&!checkEnough(item)'>分配</span>
                    <span v-else-if="item.validityType == 1&&count(item.endTime)" style='backgroundColor:#CDCDCD'>已过期</span> 
                    <span v-else style='backgroundColor:#CDCDCD'>已分完</span>
                </div>
                <div style='width:0;clear:both'></div>
            </section>
        </section>
        <!--  v-if='showAdd' -->
        <div class='button' @click='add'>
            新增关联
        </div>
    </section>
</template>


<script>
    
    /* 
        分配的状态:
            在有效期内并且没有分配完
        
    */
    import utils from 'src/verdor/utils';
    import global from "src/manager/global";
    import http from "src/manager/http";
    import storage from "src/verdor/storage";


    let alert = ["已过期","已分完"]
    
    export default{
        data(){
            return{
                _tempTar:null,
                list:[],
                couponType:true, //true 为积分卡 false 优惠券as
                type:0,
                showAdd:false,
                query:{},
                title:""
            }
        },
        methods:{
            showCard(item){
                return this.couponType?item.couponType == 7:item.couponType != 7;
            },
            clickMenu(e){
                let target = e.target;
                if(!/span/gi.test(target.tagName)){
                    target = target.children[0];
                }
                target.className += 'down';

                let index = Array.from(e.currentTarget.children).indexOf(target.parentNode);
                this.type = index;
                this._tempTar&&(this._tempTar.className = '');
                this._tempTar = target;
            },
            async getList(){
                let data = await http.getDistributionList({
                    data:{
                        shopId:global.getShopId()
                    }
                })
                this.list = Object.values(data);
                console.log(this.list,'list');
                for(let item of this.list){
                    item.diyType = (item.validityType == 0||this.count(item.endTime))?1:2;

                    /* 已经分完的状态就给3了,只有在全部中显示 */
                    if(this.checkEnough(item)) item.diyType = 3;
                }

                utils.sortByAll(this.list,"diyType",true)
            },
            /* 计算绝对时间下有没有过期 */
            count(time){
                return new Date(time*1000) > Date.now();
            },
            /* 判断此卡有没有分完 */
            checkEnough(item){
                return item.allocatedQuantity == item.total;
            },
            /* 获取时间 结束时间和相对过期时间 */
            getTime(...arg){
                let s = "";

                for(let item of arg){
                    console.log(item);
                    s+= "~" + utils.format(item,"yyyy/MM/dd");
                }
                // if(arg.length==1){
                //     return "领券后30日内有效";
                // }
                return s.substr(1);
            },
            //新增关联
            add(){
               //0 是积分 1是优惠券
                this.$router.push({path:"/addCoupon",query:{type: typeof this.query.type == undefined ? 1 : this.query.type}})
            },
            //分配
            distri(e,item){
                console.log(item,'item');
                let index = alert.indexOf(e.currentTarget.children[0].innerText);
                if(index>-1){
                    this.$store.commit("setWin",{content:`你选择的${this.title},${alert[index]}`});
                    return;
                }
                
                storage.session("distri_card_item",item);
                // this.$router.replace({path:"/allotCoupon",query:this.query})
                this.$router.replace({path:"/allotCoupon",query:{type:this.query.type,id:item.id}})
            }
                
        },
        mounted(){
            this._tempTar = this.$refs.s;
            this.getList();
            let query = this.query = this.$route.query;
            this.showAdd = query.p == 1;
            this.title = query.type==0?'积分卡':"优惠券"
            utils.setTitle(this.title );
            this.couponType = query.type==0
        }
    }
</script>

<style lang='less' scoped>

    .inter_card{
        height:100%;
        width: 100%;
        overflow: hidden;
        header{ 
            height: 1.53rem;
            width: 100%;
             background-color: rgb(32,32,32);
            ul{
                color:#FFFFFF;
                font-size: .4rem;
                display: table;
                width:100%;
                height:100%;
                li{
                    height:100%;
                    display: table-cell;
                    text-align: center;
                    vertical-align: middle;
                    span{
                        display: inline-block;
                        width:1.4133rem;
                        height:0.7rem;
                    }
                    span.down{
                        border-bottom: 2px solid #FFFFFF;
                    }
                }
            }
        }
        section.content{
            width: 9.2933rem;
            margin: .2667rem auto 0;
            margin-bottom: 2rem; 
	        height:calc(~"100% - 1.53rem");
            overflow: auto;
            padding-bottom:2rem;
            .item{
                width: 100%;
                height:2.5067rem;
                background: #F8F8F8;
                border: 1px solid #DDDDDD;
                margin-bottom: .2933rem;
                display: table;
                .left{
                    display:inline-block;
                    height: 100%;
                    display: table-cell;
                    vertical-align: middle;
                    text-align: left;
                    padding-left: .2667rem;
                    .title{
                        font-size: .4rem;
                        color: #303030;
                    }
                    .time{
                        margin-top: 0.3rem;
                    }
                    .time,.point{
                        font-family: PingFang-SC-Medium;
                        font-size: .3467rem;
                        color: #999999;
                    }
                    .info{
                        span{
                            padding-left: 0.5rem;
                            em{
                                color: #EAC048;
                            }
                        }
                        span:nth-child(1){
                            padding: 0;
                        }
                    }
                }
                .right{
                    font-family: PingFang-SC-Medium;
                    font-size: .3467rem;
                    color: #FFFFFF;
                    vertical-align: top;
                    margin: .3rem 0 0 0.3rem;
                    float: right;
                    margin-right:0.1rem;
                    span{
                        display: inline-block;
                        width: 2.1867rem;
                        height: .84rem;
                        line-height: 0.84rem;
                        background: #EAC048;
                        border-radius: 1.3333rem;
                        text-align: center;
                        vertical-align: middle;
                    }
                }
            }
        }
        .button{
            background: #EAC048;
            border-radius: 1.25rem;
            height:0.84rem;
            line-height: 0.84rem;
            width:4.50rem;
            position: fixed;
            bottom:0.3rem;
            left:0;
            right:0;
            margin: 0 auto;
            text-align: center;
            font-size: 0.35rem;
            color: #FFFFFF;
            
        }
    }

</style>
