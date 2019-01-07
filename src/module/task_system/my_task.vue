/*
 * @Author: guan.sun 
 * @Date: 2018-04-11 13:29:28 
 * @Last Modified by: guan.sun
 * @Last Modified time: 2018-04-25 19:19:16
 */
<template>
    <section class="my_task" v-if="isShow">
        <section class="tast_title">
            <span v-for="(item,index) in subList" :key="item.name" :class="typeIndex == index ? 'on' : ''" @click="myTask(item.type,index)">{{item.name}}</span>
        </section>
        <section class='task_list'>
            <section class='item' v-for="(item,index) in taskList" :key="index" @click="getDetail(item)">
                <div class='top'>
                    <span class='name fl'>{{item.taskName}}</span>
                    <span class='task_type fl'>{{typeList[item.type]}}</span>
                </div>
                <div class="task_info">
                    <ul>
                        <li>任务奖励：
                            {{item.reward}}
                        </li>
                        <li v-if="shopObj">任务地点：{{item.shopName}}</li>
                        <li>任务期限：{{getTimes(item.durationTime)}}</li>
                    </ul>
                    <div class="task_status" v-show="taskList.length && typeIndex == '0'">{{item.countDown}}</div>  
                    <div class="task_status accomplish" v-show="taskList.length && typeIndex == '1'"></div>      
                    <div class="task_status expired" v-show="taskList.length && typeIndex == '2'"></div>          
                </div>
            </section>
        </section>
    </section>
</template>
<script>
import utils from "src/verdor/utils";
import timer from "src/verdor/timer";
import http from "src/manager/http";
import storage from 'src/verdor/storage';
import global from 'src/manager/global';

export default {
    data(){
        return{
            taskList : [],
            shopId : global.getShopId(),
            subList : [{
                'name' : '进行中',
                'type' : '1'
            },{
                'name' : '已完成',
                'type' : '2'
            },{
                'name' : '已过期',
                'type' : '3'
            }],
            typeIndex : 0,
            shopObj : {},
            myTaskObj : {},
            typeList : {
                '0' : '店内任务',
                '1' : '消费任务',
                '2' : '分享任务'
            },
            time : '',
            countDown : '',
            isShow : true,
            shopList:[],
        }
    },
    methods:{
        async myTask(type = 1,index = 0){
            // 获取任务列表
            let {data:{myTaskList,taskList,count,total},time} = await http.myTask({data:{
                shopId :global.getShopId(),
                type : type,
                num : 1000,
                page : 1
            }},false,true);
            for(let item of myTaskList){
                for(let item1 of taskList){
                    if(item.taskId == item1.id){
                        item1.createTime = item.createTime;
                        let createTime = item.createTime;
                        Object.assign(item,item1);
                        item.endTime = Number(item.createTime) + (Number(item.durationTime) * 60); // 获取任务结束时间
                        item.shopName = this.shopObj[item.applyShopId].name;
                        item.shopAddress = this.shopObj[item.applyShopId].address;
                        item.telephone = this.shopObj[item.applyShopId].telephone;

                        let {coupon,pointCard,pointGoods} = item1.couponIds;
                        coupon = coupon.concat(pointCard,pointGoods);

                        item.reward = coupon.map((item)=>{ 
                            return item.name + "  *  " + item.num;
                        }).join(",");
                    }
                } 
            }
           
            this.time = time;
            timer.clear(this.countDown);
        
            if(index == 0){
                this.countDown = timer.add(()=>{
                    for(var i=0;i<myTaskList.length;i++){
                        let item = myTaskList[i];
                            item.countDownTime = item.endTime - this.time;
                        let times = this.getCountDown(item.countDownTime);
                            item.endTime = item.endTime -1;
                        if(times){
                            item.countDown = times;
                        }else{
                            myTaskList.splice(i,1);
                            i--;
                        }   
                    }
                    this.taskList = myTaskList;
                },1000,0,true);           
            }else{
                this.taskList = myTaskList;
            }  
            this.typeIndex = index;
            this.isShow = true;
        },
        async getUserInfo(){
            // 获取店铺信息
            let {shopList} = await http.getUserInfo({
                data:{
                    from:0,
                    type:2,
                    shopId: global.getShopId()
                }
            })
           
           for(let item of shopList){
               this.shopObj[item.id] = item;
               
           }
           console.log(this.shopObj,'this.shopObj')
            storage.session('shopList',shopList);
        },
        getTimes(times){
            return utils.getMinuteDay(times);
        },
        getCountDown(second_time){
            // 获取倒计时
                // second_time = second_time - Math.round(new Date().getTime() / 1000);
            if(second_time < 0){
                return '0天0小时0分钟0秒';
            }
            var time = parseInt(second_time) + "秒";  
                var second = parseInt(second_time) % 60;  
                var min = parseInt(second_time / 60) % 60;  
                var hour = parseInt( parseInt(second_time / 60) /60 ) % 24;  
                var day = parseInt( parseInt( parseInt(second_time / 60) /60 ) / 24 );  
                time = ("00" + day).substr(-2) + "天" + ("00" + hour).substr(-2)  + "小时" + ("00" + min).substr(-2)  + "分" + ("00" + second).substr(-2)  + "秒";  
                time = time.replace(/00[^\d]*/g,"");
                
                return time;  
        },
        getDetail(item){
            item.myTask = true;
            item.begin = this.typeIndex;
            storage.session('taskDetails',item);
            this.$router.push({path:"/taskDetails",query:{shopId:item.applyShopId,type:2}});
        }
    },
    mounted(){
        this.getUserInfo();
        this.myTask();
        utils.setTitle('我的任务');
    }
}
</script>
<style lang="less" scoped>
@import '../../res/css/base.less';
.my_task{
    background-color: #ffffff;
    min-height: 100%;
    padding-bottom: 3.4133rem;
}
.tast_title{
    .setBox(10rem,2rem);
    background: url(../../res/images/header_bg.jpg);
    margin: 0 auto;
    font-size: 0;
    span{
        display: inline-block;
        .setBox(33.33%,100%);
        line-height: 2rem;
        font-size: .4rem;
        color: #FFFFFF;
        text-align: center;
        position: relative;
    }
    .on:before{
        content: '';
        .setBox(1.3733rem,.04rem);
        background-color: #ffffff;
        position: absolute;
        left: 50%;
        transform: translate(-50%,0);
        bottom: .6rem;
    }
}
.task_list{
    padding-top:0.5067rem; 
    .item{
        width:9.28rem;
        height:3.4133rem;
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
                padding-left: 0.6rem;
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
                margin-left:.5rem;
                margin-top: .2667rem;
            }
        }
        ul{
            font-size: 0.32rem;
            color: #999999;
            li{
                margin-top:0.2133rem;
                width: 100%;
                .text-overflow;
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
}
.task_info{
    .setBox(100%,2.2667rem);
    padding: 0 .4533rem; 
    >ul{
        .setBox(68%,100%);
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
.accomplish{
    background: url(../../res/images/accomplish-icon.png) center center no-repeat;
    background-size: 2.0267rem 1.64rem;
}
.expired{
    background: url(../../res/images/expired_icon.png) center center no-repeat;
    background-size: 2.0267rem 1.64rem;
}
</style>


