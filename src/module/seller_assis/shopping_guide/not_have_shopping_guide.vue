/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:28:23 
 * @Last Modified by: guan.sun
 * @Last Modified time: 2018-04-09 15:26:16
 */
<template>
    <div class="container">
        <div class="header">您还没有选择专属导购...</div>
        <div class="content">
            <div class="box" v-for="item in list" v-bind:key="item.index">
                <div class="user_img fl">
                    <img :src="item.imageUrl" alt="头像">
                </div>
                <div class="user_info fl">
                    <div class="user_name">
                        <span class="fl">{{item.staffName}}</span>
                        <span class="user_label fl" v-if="item.position == '1'">店长</span>
                        <span class="user_label fl" v-if="item.position == '2'">店员</span>
                    </div>
                    <div class="user_score">
                        <star :levelList = 'staffObj.levelConfig' :levelKey = "'totalGold'" :backKet = "'start'" :total = 'item.coinsTotal'></star>
                    </div>
                    <div class="user_shop">{{getShopName(item.shopIds)}}</div>
                </div>
                <div class="fl user_operation" @click="selectStaff(item)">
                    <span>就选Ta了</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import global from "src/manager/global";

export default {
    data(){
        return {
            list : [],
            imgUrl : '',
            shopId : global.getShopId(),
            shopObj :  {}, // id为key,详情为value
            staffObj : {}
        }
    },
    methods: {
        async myStaffList(){
            // 获取导购列表
            let data = await http.myStaffList({data : {shopId : this.shopId}});
            this.staffObj = data;
            this.list = data.staffList;
        },
        async selectStaff(item){
            // 选择导购

            let shopName = this.getShopName(item.shopIds);
            let position = (item.position == '1') ? '店长' : '店员';
            
            this.$store.commit("setWin",{title:"提示信息",content:`您选中"${shopName}"的${item.staffName}${position}，点击确定与Ta沟通吧!`,cancel:{content:"重新选择"},type:"confirm",callBack:(str)=>{
                if(str === 'ok'){
                    this.selectStaffFun(item);
                }
            }});
        },
        async selectStaffFun(item){
            // 选择导购方法
            let data;
            try{
                data = await http.selectStaff({data : {
                    shopId : this.shopId,
                    staffFansId : item.fansId
                }},true);
                this.shopName = data.shopName;
                
                if(data){
                    this.$router.push({path:'/shoppingGuide',query :{'id':item.fansId}});
                }
            }catch(e){
                //关闭微信游览器
                // alert(JSON.stringify(e.error.message));
                this.$store.commit("setWin",{title:"错误提示",content:e.error.message,callBack:()=>{
                    this.$closeWindow();
                }});
            }
        },
        getShopName(shopIds){
            // 获取店铺名称
            let shopId = String(shopIds).split(',');
                shopId = shopId[0]; // 产品说显示第一家店铺
            
            if(this.shopObj[shopId]){
                return this.shopObj[shopId].name;
            }
        },
        async getUserInfo(){
            // 获取店铺列表
            let data = await http.getUserInfo({data : {shopId : this.shopId,type : 2,from : 0}});
            let shopList = data.shopList;

            for(var i = 0; i < shopList.length; i++){
                this.shopObj[shopList[i].id] = shopList[i];
            }
        }
    },
    components: {
        star:()=>import(/* webpackChunkName:"star" */"src/components/star")
    },
    mounted(){
        this.getUserInfo();
        this.imgUrl = global.getImgUrl();
        this.myStaffList();

        this.$router.beforeEach((to) => {
            let path = to.path;
            if(path == "/shoppingGuide"){
                //关闭微信游览器
                this.$closeWindow();
            }
        })

        utils.setTitle('我的专属导购');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,auto);
    min-height: 100%;
    background-color: #ffffff;
    .header{
        .setBox(100%,2rem);
        line-height: 2rem;
        background: url(../../../res/images/header_bg.jpg);
        font-size: .4rem;
        color: #ffffff;
        text-align: center;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 99;
    }
    .content{
        padding-top: 2.4rem;
        .setBox(100%,auto);
        overflow: hidden;
        .box{
            border: 1px solid #999999;
            border-radius: .1333rem;
            margin: 0 .36rem .2933rem .36rem;
            .setBox(9.28rem,3rem);
            .user_img{
                .setBox(2.6667rem,100%);
                position: relative;
                overflow: hidden;
                img{
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                    .setBox(1.7067rem,1.7067rem);
                    border-radius: 50%;
                }
            }
            .user_info{
                .setBox(3.8133rem,100%);
                padding: .6rem 0;
                box-sizing: border-box;
                overflow: hidden;
                .user_name,.user_shop{
                    .setBox(100%,.6667rem);
                    line-height: .6667rem;
                    color: #303030;
                    font-size: .3467rem;
                    font-weight: 600;
                    .text-overflow;
                    .user_label{
                        .setBox(auto,.4667rem);
                        max-width: 1.3333rem;
                        line-height: .4667rem;
                        color: #D0021B;
                        border: 1px solid #D0021B;
                        padding: 0 .2rem;
                        border-radius: .0533rem;
                        margin: .0667rem  0 0 .2667rem;
                        font-size: .24rem;
                        .text-overflow;
                    }
                }
                .user_score{
                    .setBox(100%,.4667rem);
                    line-height: 50%;
                    color: #EAC048;
                    font-size: .56rem;
                    img{
                        .setBox(.3333rem,.32rem);
                        margin: 0 .0667rem;
                    }
                }
                .user_shop{
                    .setBox(100%,.6667rem);
                    color: #999999;
                    font-size: .2667rem;
                }
            }
            .user_operation{
                .setBox(2.7rem,100%);
                padding: .6rem 0;
                box-sizing: border-box;
                overflow: hidden;
                span{
                    display: block;
                    background: rgba(234,192,72,1);
                    .setBox(2.1867rem,.84rem);
                    line-height: .84rem;
                    text-align: center;
                    color: #ffffff;
                    font-size: .3467rem;
                    border-radius: 1.3333rem;
                }
            }
        }
    }
}
</style>

