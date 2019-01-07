<template>
    <section class='task_list'>
        <section  class='item' v-for="(item,index) in list" :key="index" @click='toChooseShop(item)' v-if="toInt(item.receiveNum) < toInt(item.taskNum) && (toInt(item.startTime) < times && times < toInt(item.endTime))">
            <div class='top'>
                <span class='name fl'>{{item.taskName}}</span>
                <span class='task_type fl'>{{typeList[item.type]}}</span>
            </div>
            <div class="task_info">
                <ul>
                    <li>任务期限：{{getTime(item.durationTime)}}</li>
                    <li class='text-over text-overflow'>任务地点：{{item.shopName}}</li>
                    <li class="text-over text-overflow">任务奖励：{{item.reward}}</li>
                    <li> <span class="text-over text-overflow">{{item.taskNum - item.receiveNum}}</span>人可参与</li>
                </ul>
            </div>
        </section>
        <div class='my_list' @click='goPage()'>
            我的任务
        </div>
    </section>
</template>
<script>

    import utils from "src/verdor/utils";
    import http from "src/manager/http";
    import global from "src/manager/global";
    import storage from "src/verdor/storage";

    export default{
        data(){
          return {
              list:{

              },
              shopList:{

              },
              typeList:{
                0:"店内任务",
                1:"消费任务",
                2:"分享任务",
              },
              times : Math.round(new Date().getTime() / 1000),
              shopName:''
          }  
        },
        methods:{
            toChooseShop(item){ //跳选择店铺

                item.begin = 0;
                let applyShopIds = item.applyShopIds.split(',');
                storage.session('arrApplyShopIds',applyShopIds);
                storage.session('shopList');
                storage.session('taskDetails',item);
                this.$router.push({path:"/chooseTaskStore",query:{taskId:item.id}});
            },
            getTime( second_time ){  
                return utils.getMinuteDay(second_time);        
            } ,
            goPage(){
                this.$router.push("/myTask")
            },
            async getList(item){ //任务列表的接口
                let data = await http.getTaskList({
                    data:{
                        shopId:this.shopId
                    }
                })
                if(data==false) return;
                let address = this.shopList = await this.getUserInfo(); //shopList 的数据
                storage.session('shopList',this.shopList);
                var arr = address.map((item)=>item.id);

                storage.session('taskDetail',data)
                data.map((item,index)=>{
                    var newArr = item.applyShopIds.split(',');
                    var name = [];
                    var list = [];
                    newArr.map((item1)=>{
                        if(arr.indexOf(item1)>-1)
                        name.push(address[arr.indexOf(item1)].name)
                        return item;
                    })
                    item.shopName = name.toString();
                })

                data.forEach((item,index)=>{
                    let {coupon,pointCard,pointGoods} = item.couponIds;
                    coupon = coupon.concat(pointCard,pointGoods);

                    item.reward = coupon.map((item)=>{ 
                        return item.name + "  *  " + item.num;
                    }).join(",");
                    
                })

                this.list = data;
                
            },
            async getUserInfo(){
                let data = await http.getUserInfo({
                    data:{
                        from:0,
                        type:2,
                        shopId: global.getShopId()
                    }
                })
                return data.shopList;
                
                
            },
            toInt(num){
                return Number(num);
            }
        },
        async mounted(){
            utils.setTitle("任务")
            this.getList();
            // this.getUserInfo();
        }
    }
</script>

<style lang ='less' scoped>
@import '../../res/css/base.less';
    .task_list{
    padding-top:0.5067rem; 
    padding-bottom: 3.4133rem;
    .item{
        width:9.28rem;
        height:3.64133rem;
        margin: 0 auto;
        background: #FAFAFA;
        border: 1px solid #D6D6D6;
        border-radius: 0.1rem;
        margin-bottom: .24rem;
        .top{
            border-bottom: 1px dashed #D6D6D6;
            height:1.1467rem;
            .name{
                font-size: 0.4rem;
                color: #303030;
                display: inline-block;
                height:1.1467rem;
                width: 6.4rem;
                line-height: 1.1467rem;
                padding-left: 0.4rem;
                font-weight: bold;
                .text-overflow;
            }
            .task_type{
                display: inline-block;
                font-size: 0.2667rem;
                color: #FFFFFF;
                background: #EAC048;
                border: 1px solid #EAC048;
                border-radius: 5px;
                padding: 0.05rem 0.2rem;
                float: right;
                margin-top: .2667rem;
                margin-right: 0.4rem;
            }
        }
        ul{
            font-size: 0.32rem;
            color: #999999;
            li{
                margin-top:0.2133rem;
                width: 100%;
                /* .text-overflow; */
            }
            li:nth-child(3){
                width: 62%;
                float: left;
            }
            li:nth-child(4){
                width: 38%;
                float: left;
                text-align: right;
            }
        }
    }
    .my_list{
        background: #EAC048;
        border-radius: 1.3333rem;
        font-size: 0.48rem;
        color: #FFFFFF;
        width:4.5067rem;
        height:1.0267rem;
        line-height:1.0267rem;
        position: fixed;
        bottom:1rem;
        left:0;
        right:0;
        text-align: center;
        margin: 0 auto;
    }
    .task_info{
    .setBox(100%,2.2667rem);
    padding: 0 .4533rem; 
    >ul{
        .setBox(100%,100%);
        float: left;
    }
    .task_status{
        .setBox(32%,100%);
        line-height: 3.5rem;
        font-size: .32rem;
        text-align: right;
        color: #349AEB;
        text-align: center;
        float: left;
        .text-overflow;
    }
}
}
</style>