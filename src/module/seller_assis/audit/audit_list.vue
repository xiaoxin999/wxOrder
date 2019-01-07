/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:27:10 
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-08-06 10:51:27
 */
<template>
    <div class="container">
        <div class="box" v-for="(item,index) in auditList" v-bind:key="index">
            <div class="head_sculpture fl">
                <img :src="item.imageUrl" alt="头像">
            </div>
            <div class="user_content fl">
                <div class="left_box fl">
                    <div class="user_name">{{item.staffName}}</div>
                    <div class="user_shop">{{item.shopName}}</div>
                </div>
                <div class="right_box fl">
                        <a href="javascript:void(0)" class="show_btn" @click="openDetail(item.id)">查看</a>
                </div>
                <div class="user_time fl">{{translateTime(item.createTime)}}发起了一次消费审核</div>
            </div>
        </div>
        <div class="no_audit" v-if="auditList.length == 0">
            暂时没有待处理的审核信息~
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
            staffObj : {}, // 员工信息
            auditList : [] // 审计列表
        }
    },
    methods : {
        async getConsumeVerifyList(){
            // 获取审计列表
            let list = await http.getConsumeVerifyList({data:{
                shopId : this.shopId,
                status : "",
                num : ""
            }});

            for(let obj of list){
                let staffInfo = this.staffObj[obj.staffFansId]; // 员工信息
                if(staffInfo){
                    obj.staffName = staffInfo.staffName;
                    obj.imageUrl = staffInfo.imageUrl;
                }
            }

            this.auditList = utils.sortByAll(list,"createTime",false);
        },
        async getStaffList(){
            // 获取员工列表
            let list = await http.getStaffList({data:{
                shopId : this.shopId
            }});

            // 保存员工信息
            for(let obj of list){
                this.staffObj[obj.fansId] = obj;
            }

            this.getConsumeVerifyList();
        },
        openDetail(id){
            // 获取详情
            this.$router.push({path:'/auditDetails',query:{id:id}});
            storage.session("staffObj",this.staffObj);
        },
        translateTime: function(time) {
            // 转换时间格式
			return utils.format(time,'yyyy/MM/dd hh:mm');
		}
    },
    mounted(){
        this.getStaffList();
        utils.setTitle('消费审核');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,auto);
    min-height: 100%;
    padding: .4667rem .3333rem;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
    .box{
        .setBox(9.3333rem,2.5067rem);
        margin-bottom: .2667rem;
        background: #F8F8F8;
        border: 1px solid #DDDDDD;
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
            .setBox(6.6667rem,auto);
            padding: .2667rem 0 .4rem 0;
            box-sizing: border-box;
            .left_box{
                .setBox(4rem,auto);
                height: 100%;
                overflow: hidden;
                .user_name{
                    font-size: .4rem;
                    color: #303030;
                    .setBox(100%,.6667rem);
                    line-height: .6667rem;
                }
            }
            .right_box{
                .setBox(2.6667rem,100%);
                .show_btn{
                    background: #EAC048;
                    border-radius: 1.3333rem;
                    .setBox(2.1867rem,.84rem);
                    line-height: .84rem;
                }
            }
            .user_time,.user_shop{
                font-size: .3467rem;
                color: #999999;
                .setBox(100%,.6rem);
                line-height: .5333rem;
                word-wrap: break-word; 
                word-break: normal; 
            }
        }
    }
    .no_audit{
        .setBox(4rem,2rem);
        line-height: 3rem;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        font-size: .2933rem;
        color: #999999;
        text-align: center;
        background: url(../../../res/images/sell_assis/no_audit.png) center 0 no-repeat;
        background-size: .8933rem .9067rem;
        overflow: hidden;
    }
}
</style>


