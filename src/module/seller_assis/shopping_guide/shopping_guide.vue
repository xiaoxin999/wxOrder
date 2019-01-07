/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:28:42 
 * @Last Modified by:   guan.sun 
 * @Last Modified time: 2018-04-03 15:28:42 
 */
<template>
    <div class="container">
        <div class="header">
            <div class="header_top">
                <div class="num">{{staffData.customerTotal}}</div>
                <div class="box"></div>
                <div class="num">{{staffData.customerTotal}}</div>      
            </div>
            <div class="header_bottom">
                <div class="num bottom_num">粉丝</div>
                <div class="box bottom_num"></div>
                <div class="num bottom_num">客户</div>
                <div class="content_center">
                    <div class="name">{{userData.name}}</div>
                    <div class="label" v-if="staffData.position == '1'">店长</div>
                    <div class="label" v-if="staffData.position == '2'">店员</div>
                    <div class="grade">
                        <star :levelList = 'staffObj.levelConfig' :levelKey = "'totalGold'" :backKet = "'start'" :total = 'staffData.coinsTotal'></star>
                    </div>
                </div>
            </div>
            <div class="head_sculpture">
                <img :src="userData.imageUrl" alt="头像">
            </div>
        </div>
        <div class="user_label">
            <span v-for="(item,index) in tagConfig" v-bind:key="index" :style="{'backgroundColor': userIsClick(item.id) ?  colorArr[index%4] : ''}"  @click="clickTag(item.id,index)">{{item.name}}<i class="praise_icon"></i><ins  v-if="item.clickCount > 0">{{item.clickCount}}</ins></span>     
        </div>
        <div class="user_comment_on">
            <div class="comment_on_header">
                <div class="comment_on_title fl">点评</div>
                <div class="comment_more fr" @click="openComments">查看更多》</div>
            </div>
            <div class="comment_on_content" v-if="comment">
                <div>
                    <div class="user_img fl">
                        <img :src="comment.imageUrl" alt="评论用户">
                    </div>
                    <div class="user_comment_content fl">
                        <div class="user_names">{{comment.name}}</div>
                        <div class="comment_content">{{comment.content}}</div>
                        <div class="comment_time">{{transformTime(comment.createTime)}}</div>
                    </div>
                </div>
            </div>
            <div class="no_comments" v-else>
                暂无点评,快来留下你的足迹吧~
            </div>
            <div class="comments_boxs">
                <a class="comments_btn" href="javascript:void(0)" @click="showComments">发布点评</a>
            </div>
        </div>
        <comments :isshow="isShow" @commentsChange="commentsChange"></comments>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import storage from 'src/verdor/storage';
import global from 'src/manager/global';

export default{
    data(){
        return {
            userData : {}, // 用户信息
            staffData : {}, // 导购详细信息
            tagConfig : [], // 标签信息
            comment : {}, // 评论信息
            shopId : global.getShopId(), //shopId
            tagClickObj : {}, // 被点击过的id
            tagIndex : {}, // 保存标签下标
            isShow : false, // 是否显示评论弹窗
            colorArr:["#FF6F49","#FCA73E","#0AC687","#349AEB"],
            level : 0,
            staffFansId : this.$route.query.id || storage.session('login').staffFansId, // 导购id
            clickedTagIds : {}, // 用户点击过的标签id
            staffObj : {} // 全部信息
        }
    },
    methods : {
        async myGuide(){
            // 获取配置
            if(this.staffFansId == "0"){
                this.$router.push("/notHaveShoppingGuide");
                return false;
            }


            let data = await http.myGuide({data:{
                shopId : global.getShopId(),
                staffFansId : this.staffFansId
            }});
            this.userData = data.userData;
            this.staffData = data.staffData;
            this.tagConfig = this.getTagCount(data.tagConfig,data.tagClick);
            this.comment = data.comment;
            this.staffObj = data;

            // 获取用户点击过的标签
            let clickedTagIds = data.clickedTagIds ? data.clickedTagIds.split(',') : [];
            for(let obj of clickedTagIds){
                this.clickedTagIds[obj] = true;
            }
        },
        userIsClick(id){
            // 用户是否点击过
            if(this.clickedTagIds[id]){
                return true;
            }else{
                return false;
            }
        },
        getTagCount(arr1,arr2){
            // 获取标签被点击总数
            for(var i=0;i<arr1.length;i++){
                arr1[i].clickCount = 0;
                if(arr2.length > 0){
                    for(var j=0;j<arr2.length;j++){
                        if(arr1[i].id == arr2[j].tagId){
                            arr1[i].clickCount = arr2[j].clickCount;
                        }
                    }
                }
                
                if(arr1[i].type == '0'){
                    arr1.splice(i,1);
                    i--;
                }
            }

            let list = utils.sortByAll(arr1,"clickCount",false);
            return list;
        },
        transformTime(time){
            // 转换时间
            return utils.format(time,'yyyy/MM/dd hh:mm');
        },
        openComments(){
            // 跳转至点评列表
            this.$router.push({path:'/myComments',query:{id:this.staffFansId}});
        },
        async clickTag(id,index){
            // 给标签点赞

            let data = await http.clickTag({data:{
                tagId : id,
                shopId : this.shopId
            }});

            let item = this.tagConfig[index];
            if(data == "add"){
                item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) + 1 : 1;
                this.clickedTagIds[id] = true;
            }else{
                item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) - 1 : 0;     
                delete this.clickedTagIds[id];
            }
            this.tagConfig.splice(index,1,item);
        },
         showComments(){
            // 显示评论类型
            this.isShow = true;
            this.$store.commit("setOverHide",true);
        },
        async commentsChange(obj){
            // 接收评论内容
            this.isShow = obj.isShow;

            if(obj.message){
                let commentsData = await http.releaseComment({data:{
                    shopId : this.shopId,
                    content : obj.message
                }});

                this.comment = commentsData;
                
                if(commentsData){
                    this.$store.commit("setWin",{content: "发表点评成功..."});
                }
            }
            this.$store.commit("setOverHide",false);
        }
    },
    components: {
        comments: () => import(/* webpackChunkName: "comments" */ "./comments/release_comments"),
        star:()=>import(/* webpackChunkName:"star" */"src/components/star")
    },
    mounted(){
        this.myGuide();
        utils.setTitle('我的专属导购');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,auto);
    min-height: 100%;
    background-color: #ffffff ;
 overflow: scroll;
    .header{
        .setBox(100%,5.8667rem);
        background-color : #ffffff;
        border-bottom: .2667rem solid #f8f8f8;
        position: relative;
        overflow: hidden;
        .header_top{
            .setBox(100%,2rem);
            background: url(../../../res/images/header_bg.jpg);
            font-size: 0;
        }
        .header_bottom{
            .content_center{
                display: table-cell;
                text-align: center;
                vertical-align: middle;
                .setBox(10rem,2rem);
                .name{
                    font-size: .3733rem;
                    text-align: center;
                    font-weight: bold;
                    .setBox(100%,.5333rem);
                    line-height: .5333rem;
                    margin-bottom: .0667rem;
                    .text-overflow;
                }
                .label{
                    color: #D0021B;
                    border: 1px solid #D0021B;
                    .setBox(1.0667rem,.4667rem);
                    line-height: .4667rem;
                    display: inline-block;
                    margin-bottom: .0667rem;
                    border-radius: 4px;
                }
                .grade{
                    .setBox(100%,.5333rem);
                    line-height: .5333rem;
                    color: #EAC048;
                    font-size: .56rem;
                    display: inline-block;
                    img{
                        .setBox(.3333rem,.32rem);
                        margin: 0 .0667rem;
                    }
                }
            }
        }
        .head_sculpture{
            .setBox(2.24rem,2.24rem);
            border-radius: 50%;
            border: .1333rem solid #CDCDCD;
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translate(-50%,0);
            box-sizing: border-box;
            box-shadow: 0 2px 4px 0 rgba(0,0,0,0.23);
            background: #FFFFFF;
            img{
                height: 100%;
                width: 100%;
                border-radius: 50%;
                border: .1067rem solid #fff;
            }
        }
        .box,.num{
            float: left;
            margin-top: 1.0667rem;
        }
        .num{
            font-size : .4rem;
            color: #ffffff;
            .setBox(4rem,.56rem);
            line-height: .56rem;
            font-weight: bold;
            text-align: center;
        }
        .box{
            .setBox(2rem,.56rem);
        }
        .bottom_num{
            font-size: .3467rem;
            color: #303030;
            margin-top: 0;
            height: 1.6rem;
            line-height: 1rem;
        }
    }
    .user_label{
        .setBox(100%,auto);
        background-color: #ffffff;
        padding: .4rem;
        box-sizing: border-box;
        font-size: 0;
        border-bottom: .2667rem solid #f8f8f8;
        overflow: hidden;
        >span{
          display: inline-block;
          border-radius: 1.3333rem;
          .setBox(auto,.8667rem);
          line-height: .8667rem;
          padding: 0 .4rem;  
          color: #ffffff;
          font-size: .3467rem;
          background-color: #CDCDCD;
          margin: 0 .4rem .4rem 0;
        }
        .label_red{
            background-color: #FF6F49;
        }
        .label_blue{
            background-color: #349AEB;
        }
        .label_green{
            background-color: #0AC687;
        }
        .label_orange{
            background-color: #FCA73E;
        }
    }
    .comment_on_header{
        background-color: #ffffff;
        .setBox(100%,1.2533rem);
        line-height: 1.2533rem; 
        .comment_on_title{
            color: #030303;
            font-size : .3467rem;
            text-indent: .7333rem;
            font-weight: 600;
            position: relative;
            &:before{
                content: '';
                position: absolute;
                left: .4rem;
                top: 50%;
                transform: translate(0,-50%);
                .setBox(.16rem,.16rem);
                background-color: #EAC048;
                border-radius: 50%;
            }
        }
        .comment_more{
            .setBox(2rem,100%);
            font-size : .3467rem;
            font-weight: 600;
            color: #999999;
            margin-right: .2667rem;
        }
    }
    .comment_on_content{
        .setBox(100%,auto);
        background-color: #F8F8F8;
        >div{
            .setBox(100%,2rem); 
            overflow: hidden;  
            &:first-child{
                border-bottom: .0667rem solid #ffffff;
            }
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
                .setBox(8.1067rem,2rem);
                overflow: hidden;
                .user_names{
                    .setBox(100%,.8rem);
                    line-height: .8rem;
                    color: #030303;
                    font-size: .3467rem;
                }
                .comment_content{
                    .setBox(100%,.56rem);
                    line-height: .56rem;
                    color: #999999;
                    font-size: .2933rem;
                    .text-overflow;
                }
                .comment_time{
                    .setBox(100%,.5333rem);
                    line-height: .5333rem;
                    color: #999999;
                    font-size: .2933rem;
                }
            }
        }
    }
    .comments_btn{
        background-color: #EAC048;
        display: block;
        .setBox(4.5067rem,.8667rem);
        line-height: .8667rem;
        text-align: center;
        color: #ffffff;
        font-size: .3733rem;
        border-radius: 1.3333rem;
        position:absolute;
        top: 50%;
        left: 50%;
        bottom: .8rem;
        transform: translate(-50%,-50%);
    }
    .praise_icon{
        display: inline-block;
        background: url(../../../res/images/sell_assis/praise_icon.png) center center;
        background-size: .4rem .4rem;
        .setBox(.4rem,.4rem);
        margin: 0 .1067rem;
    }
    .comments_boxs{
        .setBox(100%,2.5333rem);
        position: relative;
        background-color: #ffffff;
    }
    .no_comments{
        .setBox(100%,2.5rem);
        line-height: 4rem;
        font-size: .2933rem;
        color: #999999;
        text-align: center;
        background: url(../../../res/images/sell_assis/no_comments.png) center .4rem no-repeat;
        background-size: 1.2533rem 1.1467rem;
        overflow: hidden;
    }
}
</style>

