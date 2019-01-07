/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:26:27 
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-08-06 10:51:21
 */
<template>
    <div class="container">
        <div class="sub_head">店员信息</div>
        <div class="box">
            <div class="head_sculpture fl">
                <img :src="staffObjInfo.imageUrl" alt="头像">
            </div>
            <div class="user_content fl">
                <div class="left_box fl">
                    <div class="user_name">{{staffObjInfo.staffName}}</div>
                    <div class="user_shop">{{translateTime(detailObj.createTime)}}发起了一次消费审核</div>
                </div>
            </div>
        </div>
        <div class="sub_head">顾客信息</div>
        <div class="box">
            <div class="head_sculpture fl">
                <img :src="fansInfo.imageUrl" alt="头像">
            </div>
            <div class="user_content fl">
                <div class="left_box fl">
                    <div class="user_name">{{fansInfo.name}}</div>
                    <div class="user_shop">在{{detailObj.shopName}}消费{{this.detailObj.cash}}元</div>
                </div>
            </div>
        </div>
        <div class="operate_btn">
            <a href="javascript:void(0)" class="fl gray" @click="confirmSubmitConsume('2')">驳回</a>
            <a href="javascript:void(0)" class="fl orange" @click="confirmSubmitConsume('1')">通过</a>            
        </div>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import global from "src/manager/global";
import storage from 'src/verdor/storage';

export default {
    data(){
        return{
            id : this.$route.query.id,
            staffObj : storage.session('staffObj'), // 员工信息
            staffObjInfo : {}, // 导购信息
            detailObj : {}, // 详情信息
            fansInfo : {} // 顾客信息
        }
    },
    methods : {
        async getConsumeVerifyDetail(){
            // 获取详情
            let list = await http.getConsumeVerifyDetail({data:{
                shopId : this.shopId,
                id : this.id
            }});

            this.staffObjInfo = this.staffObj[list.staffFansId];
            this.detailObj = list;
            this.fansInfo = list.fansInfo[0];
        },
        translateTime: function(time) {
            // 转换时间格式
			return utils.format(time,'yyyy/MM/dd hh:mm');
        },
        async confirmSubmitConsume(status){
            // 操作审核
            let data = await http.confirmSubmitConsume({data:{
                shopId : this.shopId,
                id : this.id,
                status : status
            }});

            if(data){
                this.$store.commit("setWin",{content:"操作成功",callBack:()=>{
                    this.$router.push('/auditList');
                }});
            };
        }
    },
    mounted(){
        this.getConsumeVerifyDetail();
        utils.setTitle('审核详情');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,auto);
    min-height: 100%;
    padding: .4667rem .3333rem;
    box-sizing: border-box;
    overflow: hidden;
    .box{
        .setBox(9.3333rem,2.5067rem);
        margin-bottom: .2667rem;
        background: #F8F8F8;
        border: .0133rem solid #DDDDDD;
        .head_sculpture{
            .setBox(2.5067rem,2.5067rem);
            position: relative;
            img{
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
                .setBox(1.7067rem,1.7067rem);
                border-radius: 50%;
            }
        }
        .user_content{
            .setBox(6.6667rem,2.48rem);
            padding: .2667rem 0 .4rem 0;
            box-sizing: border-box;
            .left_box{
                .setBox(6.6667rem,auto);
                .user_name{
                    font-size: .4rem;
                    color: #303030;
                    .setBox(100%,.9333rem);
                    line-height: .9333rem;
                }
            }
            .user_time,.user_shop{
                font-size: .3467rem;
                color: #999999;
                .setBox(100%,.9333rem);
            }
            .user_time{
                color: #EAC048;
            }
        }
    }
    .sub_head{
        .setBox(100%,1.0667rem);
        line-height: 1.0667rem;
        font-size: .3733rem;
        color: #999999;
        text-indent: .4rem;
        position: relative;
        &:before{
            content: '';
            .setBox(.1067rem,.1067rem);
            background: #EAC048;
            position: absolute;
            left: .1067rem;
            top: 50%;
            transform: translate(-50%,0);
            border-radius: 50%;
        }
    }
    .operate_btn{
        position: fixed;
        left: 0;
        bottom: 1.2rem;
        .setBox(100%,.84rem);
        line-height: .84rem;
        text-align: center;
        font-size: .3467rem;
        color: #FFFFFF;
        padding: 0 .72rem;
        box-sizing: border-box;
        a{
            display: block;
            .setBox(48%,100%);
            border-radius: 1.3333rem;
            &:last-child{
                margin-left: 4%;
            }
        }
        .gray{
            background: #CDCDCD;
        }
        .orange{
            background: #EAC048;
        }
    }
}
</style>

