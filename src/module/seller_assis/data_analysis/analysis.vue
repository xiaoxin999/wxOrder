/*
 * @Author: guan.sun 
 * @Date: 2018-06-06 16:29:25 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-09-27 19:37:11
 */
<template>
    <div class="container" v-if="isReady">
        <div class="header-sub">
            <span class="fl">{{shopName}}</span>
            <span class="follower-num fr">
                总粉丝数<em>{{analysisObj.fansTotal}}</em>人
            </span>
        </div>
        <div class="ranking-list">
            <div class="ranking-header">
                <div class="all-shop fl" @click="openComponents()">
                    <span class="fl">{{shopName}}</span>
                    <span class="analysis-sort fl"></span>
                </div>
                <div class="strat-end-time fr">
                    <span class="time" @click="openComponents('startDate')">
                        <em class="fl">{{timeDate.startDate}}</em>
                        <em class="analysis-sort fl"></em>
                    </span>
                    <span>至</span>
                    <span class="time" @click="openComponents('endDate')">
                        <em class="fl">{{timeDate.endDate}}</em>
                        <em class="analysis-sort fl" style="margin-right:none;"></em>
                    </span>
                </div>
            </div>
            <div class="ranking-content">
                <div class="ranking-sub">
                    <span class="fl">连接数</span>
                    <span class="fr">客服绑定客户数</span>
                </div>
                <ul class="ranking">
                    <li v-for="(item,index) in list" :key="index">
                        <span class="top" v-if="index > 2">NO.{{index + 1}}</span>
                        <span class="name">{{item.staffName}}</span>
                        <span class="num">{{item.person}}<em>人</em></span>
                        <span class="proportion"><em>{{item.accounted}}</em></span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="analysis">
            <div class="analysis-info">
                <div class="box">
                    <div class="fl left-box">
                        <p class="analysis-black">拉回人数<span class="analysis-yellow">{{analysisObj.conversionPerson}} <em class="analysis-gray">人</em></span> </p>
                        <p class="analysis-gray">引流人数</p>
                    </div>
                </div>
                <div class="box">
                    <div class="fr left-box" style="width:auto;">
                        <p class="analysis-black">转化金额 <span class="analysis-yellow"><em class="analysis-gray">￥</em>{{analysisObj.conversionAmount}}</span></p>
                        <p class="analysis-gray">绑定客户总消费额</p>
                    </div>
                </div>
            </div>
            <div class="analysis-chart" ref="chart">

            </div>
        </div>
        <transition name="fade">
            <dataSelector 
                :type="0"
                :recent_time = "recent_time"
                :param = "param"
                @closeData = "closeData"
                :fullDose = "fullDose"
                v-if="isDate"
            >
            </dataSelector>
            <picker :list="shopList" :isShow="isShow" :returnValue="'index'" @closePicker="closePicker" v-if="isShow"></picker>
        </transition>
    </div>
</template>
<script>
import global from 'src/manager/global';
import utils from 'src/verdor/utils';
import http from 'src/manager/http';
import storage from "src/verdor/storage";


let echarts = null;
let date = new Date();
let time = date - 0;
let myChart = null;
let {startTime} = utils.getFirstLastDay({time});
let {end} = utils.getTime({'time':time,'type':false});
let formatStartTime = utils.format(startTime,'yyyy/MM/dd'); 
let formatEndTime = utils.format(end, 'yyyy/MM/dd');


export default {
    data () {
        return {
            shopId : global.getShopId(),
            timeObj : {
                'startDate' : startTime,
                'endDate' : end
            },
            analysisObj : {},
            list : [],
            fullDose : true,
            recent_time: [2018 ,1,1],
            param: [`2018-${date.getFullYear()}`,'1-12','1-31'],
            isShow : false,
            shopList : [],
            analysisShopId : '',
            shopName : '全部门店',
            timeDate : {
                'startDate' : formatStartTime,
                'endDate' : formatEndTime
            },
            isDate : false,
            timeType : null, // 1为开始时间，2为结束时间
            isReady : false,
            dimensionsObj : {'gift':'0','coupon':'1','rushed':'2','task':'3','noVerification':'4'},
            option : {
                legend: {
                    data : ['换礼', '优惠券', '疯抢', '任务','未核销']
                },
                tooltip: {},
				xAxis: {
                    type: 'category'
				},
				yAxis: {},
				series: [{
                        type: 'bar',
                        name : '换礼',
                        data : [],
                        borWidth : 50,
                        barMaxWidth : 50,
                        barGap : 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
					},
					{
						type: 'bar',
                        name : '优惠券',
                        data : [],
                        borWidth : 50,
                        barMaxWidth : 50,
                        barGap : 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
					},
					{
						type: 'bar',
                        name : '疯抢',
                        data : [],
                        borWidth : 50,
                        barMaxWidth : 50,
                        barGap : 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
					},
					{
						type: 'bar',
                        name : '任务',
                        data : [],
                        borWidth : 50,
                        barMaxWidth : 50,
                        barGap : 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
					},
					{
                        type: 'bar',
                        name : '未核销',
                        data : [],
                        borWidth : 50,
                        barMaxWidth : 50,
                        barGap : 1,
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
					}
                ]
            },
            shopName : ''
        };
    },
    methods:{
        async getAnalysis(){
            // 获取数据分析
            let data = null;
            try{
                data = await http.analysis({
                    data:{
                        shopId : this.shopId,
                        startTime : this.timeObj.startDate,
                        endTime : this.timeObj.endDate,
                        analysisShopId : this.analysisShopId
                    }
                },true);
                this.list = utils.sortByAll(data.list,'person',false);
                this.list = this.list.slice(0,5);
                this.analysisObj = data;
                // let source = this.option.dataset.source;
                // for(let item of source){
                //     let name = this.dimensionsObj[item.product];
                //     item[item.product] = data.chart[name];
                // }
                // console.log(JSON.stringify(Object.entries(data.chart)))
                Object.entries(data.chart).forEach((key)=>{
                    let index = this.dimensionsObj[key[0]];
                    if(index){
                        this.option.series[index].data = [];
                        this.option.series[index].data.push(key[1]);

                        this.option.series[index].label.normal.show = key[1] > 0;
                    }
                });
                
                this.isReady = true;
            }catch(e){
                this.$store.commit("setWin",{content: `${e.error.message}`});
            }


            this.echartsReady();
        },
        closeData(val){
            if(val.type == 'makeSure'){
                let reserveTime = val.data[0] + '/' + val.data[1] + '/' + val.data[2];
                let format = utils.format(new Date(reserveTime),'yyyy/MM/dd');
                let time = Math.round(new Date(reserveTime).getTime() / 1000);
                let {end} = utils.getTime({time,'type':false});
                    time = (this.timeType == 'endDate') ? end : time;
                    
                if(this.timeType == 'startDate' && time > this.timeObj.endDate){
                    this.$store.commit("setWin",{content: '开始时间不能大于结束时间,请修改！'});
                    return false;
                }else if(this.timeType == 'endDate' && this.timeObj.startDate > time){
                    this.$store.commit("setWin",{content: '结束时间不能小于开始时间,请修改！'});
                    return false;
                }

                
                this.timeObj[this.timeType] = time;
                this.timeDate[this.timeType] = format;
                this.getAnalysis();
            }
            this.isDate = false;
        },
        async getUserInfo(){
            let {shopList,shopName} = await http.getUserInfo({
                data : {
                    shopId : this.shopId,
                    type : 2
                }
            });

            this.shopName = shopName;
            this.shopList = shopList;
            this.shopList.unshift({
                'name' : '全部门店'
            });
            
        },
        openComponents(type){
            if(type){
                this.isDate = true;
                this.timeType = type;
            }else{
                this.isShow = true;
            }
        },
        closePicker(obj){
            if(obj.type == 'ok'){
                let data = this.shopList[obj.data[0]];
                this.analysisShopId = obj.data[0] > 0 ? data.id : '';
                this.shopName = data.name;
                this.getAnalysis();
            }
            this.isShow = false;
        },
        echartsReady(){
           if(this.isReady){
               setTimeout(()=>{
                    myChart = echarts.init(this.$refs.chart);
                    if(this.option && typeof this.option === "object") {
                        myChart.setOption(this.option, true);
                    }
               },100);
            }
        }
    },
    components: {
        dataSelector: () => import (/*webpackChunkName: "dateselector" */ 'src/components/dateselector'),
        picker: () => import (/*webpackChunkName: "picker" */ 'src/components/picker/picker')
    },
    computed:{},
    async mounted(){
        utils.setTitle('数据分析');
        echarts = await import(/* webpackChunkName:'echarts' */ "src/verdor/echarts.min.js");
        
        this.getAnalysis();
        this.getUserInfo();
    },
}
</script>
<style lang='less' scoped>
@import "../../../res/css/base.less";
.container{
    .setBox(10rem,auto);
    min-height: 100%;
    margin: 0 auto;
    background-color: #fff;
    overflow: hidden;
    .header-sub{
        .setBox(100%,1.52rem);
        line-height: 1.25rem;
        background: #FFFFFF;
        border-bottom: .2667rem solid #f2f2f2;
        span{
            display: block;
            font-size: .4rem;
            &:first-child{
                color: #303030;
                text-indent: .32rem;
            }
            &:last-child{
                color: #999999;
                padding-right: .32rem;
            }
            em{
                font-size: .48rem;
                color: #eac048;
            }
        }
    }
    .ranking-list{
        .setBox(100%,auto);
        padding: 0 .32rem;
        background-color: #FFFFFF;
        border-bottom: .2667rem solid #f2f2f2;
        overflow: hidden;
        .ranking-header{
            .setBox(100%,1.16rem);
            line-height: 1.16rem;
            border-bottom: .0133rem solid #cccccc;
            font-size: .3467rem;
            color: #9A9A9A;
            .all-shop{
                .setBox(3.5rem,100%);
                span:first-child{
                    width: auto;
                    max-width: 70%;
                    .text-overflow;
                }
            }
            .strat-end-time{
                max-width: 5.86rem;
                height: 100%;
                span{
                    float: left;
                    &:nth-child(2){
                        .setBox(0.85rem,100%);
                        text-align: center;
                    }
                }
            }
            .time{
                .setBox(auto,100%);
                // max-width: 3rem;
                text-align: right;
                em:first-child{
                    .setBox(auto,100%);
                    .text-overflow;
                }   
            }
        }
    }
    .ranking-sub{
        .setBox(100%,.9333rem);
        line-height: .9333rem;
        span{
            font-size: .3467rem;
            &:first-child{
                color: #303030;
            }
            &:last-child{
                color: #999999;
                text-align: right;
            }
        }
    }
    .ranking li{
        .setBox(100%,1.1733rem);
        line-height: 1.1733rem;
        background-color: #F8F8F8;
        margin-bottom: .2rem;
        &:nth-child(1){
            background-image: url(../../../res/images/sell_assis/gold-medal.png);
            background-position: .48rem center;
            background-repeat: no-repeat;
            background-size: .4533rem .5867rem;
        }
         &:nth-child(2){
            background-image: url(../../../res/images/sell_assis/silver-medal.png);
            background-position: .48rem center;
            background-repeat: no-repeat;
            background-size: .4533rem .5867rem;
        }
         &:nth-child(3){
            background-image: url(../../../res/images/sell_assis/bronze-medal.png);
            background-position: .48rem center;
            background-repeat: no-repeat;
            background-size: .4533rem .5867rem;
        }
        &:nth-child(1),&:nth-child(2),&:nth-child(3){
            padding-left: 1.4133rem;
        }
        span{
            display: block;
            float: left;
        }
        .name{
            .setBox(2rem,100%);
            font-size: .3467rem;
            color: #303030;
        }
        .num{
            .setBox(3.5rem,100%);
            font-size: .48rem;
            color: #303030;
            text-align: right;
            .text-overflow;
            em{
                font-size: .3467rem;
                color: #3F3F3F;
            }
        }
        .proportion{
            .setBox(2.4rem,100%);
            font-size: .3467rem;
            color: #999999;
            padding-right: .2667rem;
            text-align: right;
            em{
                font-size: .48rem;
                color: #0ac687;
            }
        }
        .top{
            .setBox(1.4133rem,100%);
            font-size: .3467rem;
            color: #EAC048;
            text-align: center;
        }
    }
    .analysis-sort{
        background: url(../../../res/images/sell_assis/triangle-icon.png)  center center no-repeat;
        background-size: .28rem .16rem;
        .setBox(.28rem,100%);
        margin-left: 0.2rem;
    }
    .analysis{
        .setBox(100%,auto);
        padding: 0 .32rem;
        overflow: hidden;
        background-color: #FFFFFF;
        .analysis-info{
            .setBox(100%,auto);
            font-size: 0;
            .box{
                .setBox(4.6rem,100%);
                padding: .5333rem 0;
                display: inline-block;
            }
            .analysis-black{
                font-size: .48rem;
                color: #303030;
                .setBox(100%,.8rem);
                line-height: .8rem;
            }
            .analysis-gray{
                font-size: .3467rem;
                color: #999999;
            }
            .analysis-yellow{
                font-size: .48rem;
                color: #eac048;
                   margin-left: 0.2rem;
            }
            .yellow_span{
                display: inline-block;
            }
            .left-box{
                .setBox(4.5rem,100%);
                .text-overflow;
            }
            .right-box{
                .setBox(2.12rem,100%);
                padding: 0 .2667rem;
                line-height: 1.2rem;
                .text-overflow;
            }
            .right_box{
                .setBox(2.12rem,100%);
                width: 45%;
                padding: 0 .2667rem;
                line-height: 1.2rem;
                // .text-overflow;
            }
        }
        .analysis-chart{
            .setBox(100%,10rem);
            position: relative;
        }
    }
    .follower-num{
        width: 5rem;
        text-align: right;
        .text-overflow;
    }
}
</style>