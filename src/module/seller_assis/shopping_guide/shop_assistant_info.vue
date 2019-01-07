/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:28:33 
 * @Last Modified by:   guan.sun 
 * @Last Modified time: 2018-04-03 15:28:33 
 */
<template>
    <div class="container">
        <div class="header">
            <div class="header_top">
                <div class="num">{{assistantObj.coins}}</div>
                <div class="box"></div>
                <div class="num">{{assistantObj.customerTotal}}</div>      
            </div>
            <div class="header_bottom">
                <div class="num bottom_num">当前金币</div>
                <div class="box bottom_num"></div>
                <div class="num bottom_num">客户</div>
                <div class="content_center">
                    <div class="name">{{assistantObj.staffName}}</div>
                    <div class="label">{{positionList[assistantObj.position]}}</div>
                    <div class="info">累计金币：{{assistantObj.coinsTotal}}</div>
                </div>
            </div>
            <div class="head_sculpture">
                <img :src="assistantObj.imageUrl" alt="">
            </div>
        </div>
        <div class="user_label">
            <span v-for="(item,index) in tagsList" @click="clickTag(item.id,index)" :style="{'backgroundColor': item.clickCount ?  colorArr[index%4] : ''}" v-bind:key="item.name + index">{{item.name}}<i class="praise_icon"></i><ins v-if="item.clickCount">{{item.clickCount}}</ins></span>     
        </div>
        <div class="user_operate">
            <a href="javascript:void(0)" class="btns" @click="openMessageCenter">查看客户沟通记录</a>
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
        return{
            shopId : global.getShopId(), // 店铺id
            fansId : this.$route.query.id, // 店员staffId
            assistantObj : {}, // 店员信息
            positionList : {"1":"店长","2":"店员"}, // 职位列表 1为店长,2为店员
            tagsList : [], // 标签列表
            colorArr:["#FF6F49","#FCA73E","#0AC687","#349AEB"]
        }
    },
    methods:{
        async getStaffDetail(){
            // 获取店员详情
            this.assistantObj = await http.getStaffDetail({data:{
                shopId : this.shopId,
                fansId : this.fansId
            }});

            // 被点击的总数
            
            let tags = this.assistantObj.tags;
            let clicked = this.assistantObj.clicked;

            for(var i=0;i<tags.length;i++){
                tags[i].clickCount = 0;

                for(var j=0;j<clicked.length;j++){
                    if(tags[i].id == clicked[j].tagId){
                        tags[i].clickCount = clicked[j].clickCount;
                    }
                }
                
                if(tags[i].type == '0'){
                    tags.splice(i,1);
                    i--;
                }
            }

            this.tagsList = utils.sortByAll(tags,'clickCount',false);
        },
        openMessageCenter(){
            // 打开聊天中心
            this.$router.push({path:'/messageCenter',query:{"fansId":this.fansId}});
        },
        async clickTag(id,index){
            // 给标签点赞

            let data = await http.staffTag({data:{
                tagId : id,
                shopId : this.shopId,
                fansId : this.fansId
            }});

            let item = this.tagsList[index];
            if(data == "add"){
                item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) + 1 : 1;
            }else{
                item.clickCount = (item.clickCount > 0) ? Number(item.clickCount) - 1 : 0;     
            }

            this.tagsList.splice(index,1,item);
        }
    },
    mounted(){
        this.getStaffDetail();
        utils.setTitle("店员详情");
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,100%);
    background-color: #ffffff ;
    overflow: hidden;
    .header{
        .setBox(100%,5.6rem);
        background-color: #ffffff;
        margin-bottom: .2667rem;
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
        max-height: 8.4rem;
        background-color: #ffffff;
        padding: .4rem;
        box-sizing: border-box;
        font-size: 0;
        margin-bottom: .2667rem;
        overflow: scroll;
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
    .btns{
        position: fixed;
        left: 50%;
        bottom: .8rem;
        transform: translate(-50%,0);
        display: block;
        .setBox(5.1733rem,.84rem);
        line-height: .84rem;
        font-family: PingFang-SC-Medium;
        font-size: .3467rem;
        color: #FFFFFF;
        border-radius: 1.3333rem;
        background-color: #EAC048;
    }
    .praise_icon{
        display: inline-block;
        background: url(../../../res/images/sell_assis/praise_icon.png) center center;
        background-size: .4rem .4rem;
        .setBox(.4rem,.4rem);
        margin: 0 .1067rem;
    }
    .info{
        .setBox(100%,.5333rem);
        line-height: .5333rem;
        font-family: PingFang-SC-Medium;
        font-size: .3467rem;
        color: #999999;
        display: inline-block;
    }
}
</style>

