<template>
    <section class='inter_card'> 
        <header>
            <ul @click='clickMenu'>
                <li>
                    <span class='down' data-i = '0' ref='s'>
                        未使用
                    </span>
                </li>
                <li>
                    <span data-i = '1'>
                        已使用
                    </span>
                </li>
                <li>
                    <span data-i = '2'>
                        已过期
                    </span>
                </li>
            </ul>
        </header> 
        <section class='content'>
            <section class='item' v-for="(item,index) in list" :key='index' v-if='status == item.status'>
                <div class='left'>
                        <span class='title'>{{item.couponName}}</span>
                        <div class='time'>有效期至：{{getTime(item.endTime)}}</div>
                        <span class='point'>积分：{{item.param}}</span>
                </div>
                <div class='right' @click='use(item)'>
                    <span :style='{backgroundColor:(item.status== 1||item.status== 2)?"#999999":"#EAC048"}'>{{item.status == 0?"使用":item.status == 1?"已使用":"已过期"}}</span>
                </div>
                <div class='width:0;clear:both'></div>
            </section>
        </section>
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';
    import global from "src/manager/global";
    import http from "src/manager/http";

    export default{
        data(){
            return{
                _tempTar:null,
                list:[],
                status:0
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

                this.status = target.getAttribute("data-i");

                this._tempTar&&(this._tempTar.className = '');
                this._tempTar = target;
            },
            async getList(){
                let data = await http.myPointCardList({
                    data:{
                        shopId:global.getShopId()
                    }
                })
                this.list = data;
                for(let item of this.list){

                    if(!this.count(item.endTime)){
                        item.status = 2;
                    }

                    //item.status = (item.validityType == 0||this.count(item.endTime))?1:2;
                }
            },
            /* 计算绝对时间下有没有过期 */
            count(time){
                console.log(new Date(time*1000) > Date.now());
                return new Date(time*1000) > Date.now();
            },
            getTime(...arg){
                let s = "";

                for(let item of arg){
                    console.log(item);
                    s+= "~" + utils.format(item,"yyyy/MM/dd");
                }
                return s.substr(1);
            },
            use(item){
                storage.session("interCard",item)
                this.$router.push("/interCardDetail");
            }
        },
        mounted(){
            this.getList();
            this._tempTar = this.$refs.s;

            this.query = this.$route.query;
            this.couponType = this.query.id==2;
            utils.setTitle(this.query.id == 1?"优惠券":'积分卡');
        }
    }
</script>

<style lang='less' scoped>

    .inter_card{
        height:2rem;
        background-color: rgb(32,32,32);
        
        header{
            height: 100%;
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
                }

                .right{
                    font-family: PingFang-SC-Medium;
                    font-size: .3467rem;
                    color: #FFFFFF;
                    vertical-align: top;
                    margin: .3rem 0.3rem 0 0.3rem;
                    float: right;
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
    }

</style>
