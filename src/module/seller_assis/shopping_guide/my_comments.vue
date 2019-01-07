/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:28:08 
 * @Last Modified by:   guan.sun 
 * @Last Modified time: 2018-04-03 15:28:08 
 */
<template>
    <div class="container">
        <div class="comments_header">
            <span :class="myComment == 0 ? 'on' : ''" @click="switchingType(0)">全部点评</span>
            <span :class="myComment == 1 ? 'on' : ''" @click="switchingType(1)">我的点评</span>
        </div>
        <div class="comment_on_content" id="comment_on_content">
            <div class="white_box"></div>
            <div v-for="(item,index) in list" v-bind:key="item.content + index">
                <div class="user_img fl">
                    <img :src="item.imageUrl" alt="">
                </div>
                <div class="user_comment_content fl">
                    <div class="user_names">{{item.name}}</div>
                    <div class="comment_content">{{item.content}}</div>
                    <div class="comment_time">{{transformTime(item.createTime)}}</div>
                </div>
            </div>
        </div>
        <div class="release_comments">
            <a class="comments_btn" href="javascript:void(0)" @click="showComments">发布点评</a>
        </div>
        <comments :isshow="isShow" @commentsChange="commentsChange"></comments>
        <div class="no_comments" v-if="list.length == 0">
            暂无点评,快来留下你的足迹吧~
        </div>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import storage from 'src/verdor/storage';
import global from 'src/manager/global';

export default {
    data(){
        return {
            list : [],
            myComment : 0 ,// 0全部，1我的评论
            shopId : global.getShopId(),
            isShow : false // 是否显示评论弹窗
        }
    },
    methods: {
        async getCommentList(){
            // 获取评论列表
            let data = await http.getCommentList({data:{
                shopId : this.shopId,
                page : 1,
                num : 50,
                staffFansId : this.$route.query.id || storage.session('login').staffFansId, // 导购id
                myComment : this.myComment
            }});
            
            let commentList = data.commentList;
            let fansList = data.fansList;
            let login = storage.session('login');
            
            // 组合评论名称和头像
            for(var i=0;i<commentList.length;i++){
                if(this.myComment == '0'){
                    for(var j=0;j<fansList.length;j++){
                        if(commentList[i].fansId == fansList[j].id){
                            commentList[i].name = fansList[j].name;
                            commentList[i].imageUrl = fansList[j].imageUrl;
                        }
                    }
                }else{
                    commentList[i].name = login.name;
                    commentList[i].imageUrl = login.imageUrl;
                }
            }
            this.list = commentList;
            
            setTimeout(()=>{
                document.documentElement.scrollTop = 0;
            },100);
        },
        transformTime(time){
            // 转换时间
            return utils.format(time,'yyyy/MM/dd hh:mm');
        },
        switchingType(type){
            // 切换类型
            this.myComment = type;
            this.getCommentList();
        },
        showComments(){
            // 显示评论类型
            this.isShow = true;
            this.$store.commit("setOverHide",true);
        },
        async commentsChange(obj){
            // 接收评论内容
            this.isShow = obj.isShow;

            if(obj.message != ""){
                let commentsData = await http.releaseComment({data:{
                    shopId : this.shopId,
                    content : obj.message
                }});
            }
            
            this.getCommentList();
            this.$store.commit("setOverHide",false);
        }
    },
    components: {
        comments: () => import(/* webpackChunkName: "comments" */ "./comments/release_comments"),
        'multi-picker': () => import (/* webpackChunkName: "multi_picker" */ 'src/components/multipicker/index')
    },
    mounted(){
        this.getCommentList();
        utils.setTitle('点评列表');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,100%);
    background-color: #F8F8F8;
    .comments_header{
        background: url(../../../res/images/header_bg.jpg);
        .setBox(100%,2rem);
        line-height: 2rem;
        font-size: 0;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2;
        >span{
            display: inline-block;
            .setBox(50%,100%);
            color: #ffffff;
            font-size: .4rem;
            text-align: center;
            position: relative;
        }
        .on:before{
            content: '';
            .setBox(2rem,.0533rem);
            display: block;
            background-color: #ffffff;
            position: absolute;
            left: 50%;
            top: 70%;
            transform: translate(-50%,-70%);
        }
    }
    .comment_on_content{
        .setBox(100%,100%);
        padding: 2rem 0;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        >div{
            .setBox(100%,auto); 
            min-height: 2rem;
            border-bottom: .0667rem solid #ffffff;
            overflow: hidden;  
            .user_img{
                .setBox(1.8933rem,2rem);
                position: relative;
                overflow: hidden;
                img{
                    .setBox(1.1733rem,1.1733rem);
                    border-radius: 50%;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                }
            }
            .user_comment_content{
                .setBox(8.1067rem,auto);
                overflow: hidden;
                .user_names{
                    .setBox(100%,.8rem);
                    line-height: .8rem;
                    color: #030303;
                    font-size: .3467rem;
                }
                .comment_content{
                    .setBox(100%,auto);
                    line-height: .56rem;
                    color: #999999;
                    font-size: .2933rem;
                   word-wrap: break-word; 
                    word-break: normal; 
                }
                .comment_time{
                    .setBox(100%,.5333rem);
                    line-height: .5333rem;
                    color: #999999;
                    font-size: .2933rem;
                }
            }
        }
        .white_box{
            .setBox(100%,.4rem);
            min-height: auto;
            background-color: #ffffff;
        }
    }
    .release_comments{
        position: fixed;
        left: 50%;
        bottom: 8%;
        .comments_btn{
            background-color: #EAC048;
            display: block;
            .setBox(4.5067rem,.8667rem);
            line-height: .8667rem;
            text-align: center;
            color: #ffffff;
            font-size: .3733rem;
            border-radius: 1.3333rem;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
        }
    }
    .no_comments{
        .setBox(4.2667rem,2rem);
        line-height: 3.5rem;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        font-size: .2933rem;
        color: #999999;
        text-align: center;
        background: url(../../../res/images/sell_assis/no_comments.png) center 0 no-repeat;
        background-size: 1.2533rem 1.1467rem;
        overflow: hidden;
    }
}
</style>
