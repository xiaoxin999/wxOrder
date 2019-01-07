<template>
    <div class="container">
        <div class="header">
            <span class="return_page fl" @click="returnPage"></span>
            <span class="title">{{staffDetail.name}}</span>
        </div>
        <div class="content" ref="contents" id="contents">
            <div class="chat_content">
                <div class="fl chat_box">
                    <div class="fl" v-for="(item,index) in messageList" v-bind:key="index" style="width:100%;margin-bottom:0.266666rem">
                        <div class="chat_time" v-if="isShowTime(index)">
                            <span>{{item.chatTime}}</span>
                        </div>
                        <div class="oneself" v-if="item.mySelf">
                            <div class="head_sculpture fr">
                                <img class="fr" :src="login.imageUrl" alt="head_sculpture">
                            </div>
                            <div class="user_info fr">
                                <div class="user_msg message_right" v-if="item.type == '0' || item.type == '2' || item.type == '3'">{{item.message}}</div>
                                <div class="user_msg message_right" v-if="item.type == '1'">
                                    <img :src="item.message" alt="聊天图片">
                                </div>                            
                            </div>
                        </div>
                        <div class="another_person" v-else>
                            <div class="head_sculpture fl">
                            <img :src="staffDetail.imageUrl" alt="">
                            </div>
                            <div class="user_info fl">
                                <div class="user_msg message_left" v-if="item.type == '0'">{{item.message}}</div>
                                <div class="user_msg message_left" v-if="item.type == '1'">
                                    <img :src="item.message" alt="聊天图片">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="operate_icon fl">
                <span class="select_pictures" @click="fileChange">
                    <!-- <form enctype="multipart/form-data" id="chatFrom">
                        <input type=file accept="image/*" name="image" @change="fileChange">                        
                    </form>
                    <span class="upload_img"></span> -->
                </span>
                <span class="give_present" @click="giftCoupon"></span>
                <span class="quick_reply" @click="openQuickReply"></span>
            </div>
            <div class="import_box fl">
                <input type="text" class="fl" v-model="message" :disabled="isMessAge" @focus="onFoucs('1')">
                <span class="commit fl" @click="sendMessage()"></span>
            </div>
        </div>
        <div class="gift_bg" v-show="isGift" @click="giftCoupon('close')">
        </div>
        <div class="gift_win" v-show="isGift">
            <span @click="openCoupon('2')">积分卡</span>
            <span @click="openCoupon('1')">优惠券</span>
            <span @click="giftCoupon('close')">取消</span>
        </div>

        <transition name="fade">
            <component 
                :is="couponObj.componentId"
                :type="couponObj.type"
                :list="couponList"
                :title="couponObj.title"
                @closePicker="closePicker"
            >
            </component>
        </transition>

        <quickReply :list="quickReplyList" @messageContent="messageContent" :isShow="isQuickReply" :fansId="fansId" v-if="isQuickReply"></quickReply>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import storage from 'src/verdor/storage';
import global from 'src/manager/global';
import Socket from './websocket.js'
let wx_sdk = null;

export default {
    data(){
        return{
            message : "", // 发送的消息
            socket : "", // webSocket
            messageList : [], //消息列表
            couponObj : {
                "type" : "",
                "title" : "",
                "componentId" : ""
            },
            couponList : [], // 优惠券列表
            coupon : [], // 优惠券
            integral : [], // 积分卡券
            isGift : false, // 是否打开赠送弹窗
            quickReplyList : [], // 话术列表
            isQuickReply : false, // 是否打开快速回复
            id : this.$route.query.id, // 粉丝id
            login : storage.session('login'),
            staffDetail : storage.session('detail'),
            type : 0, // 发送消息的类型
            fansId : this.$route.query.fansId || storage.session('login').fansId,
            isMessAge : "", // 是否可以发送消息
            imgData : {}, // 上传图片对象
            token : storage.session('token'),
            contentObj : {} ,//选中的话术
            timer:""
        }
    },
    methods:{
        async sendMessage(){ 
            // 发送消息
            let reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
            if(reg.test(this.message)){
                this.$store.commit("setWin",{content:"暂时还不支持发送emoji表情..."});
                this.message = this.message.replace(reg, "");
                return false;
            }
            if(this.type != 1 && this.message.trim().length == 0) return false;
            let msg = (this.type == 1) ? this.imgData.mediaid : this.message;
            let obj = JSON.stringify({"cmd":"","shopId":this.shopId,"openId":this.staffDetail.openId,"staffName":this.login.name,"toFansId":this.id,"fromFansId":this.login.fansId,"type":this.type,"msg":msg});

            Socket.send(obj);
            
            if(this.contentObj.contentType == '1'){
                this.sendMenuPath(this.contentObj.messageContent);
            }

            // 消息在本机显示
            let time = Math.round(new Date().getTime() / 1000); // 当前时间
            let pushMessage = (this.type == 1) ? await this.getImg(this.imgData.mediaid) : this.message;
            this.messageList.push({"message":pushMessage,"mySelf":true,"chatTime":this.transformTime(time),"sendTime":time,"type":this.type}); // 我自己发的消息
            this.message = "";
            this.contentObj = {};
            this.type = 0;
            this.setScrollTop();
        },
        readyWebSocket(){
           // 初始化webSocket
            Socket.init({id:"chat",url:this.login.webSocket,open:(event)=> {
                // webSocket链接成功发送身份验证
				let obj = JSON.stringify({"cmd":"login","roomId":this.login.fansId,"token":this.login.accessToken});
				
				this.socket = Socket._socket;
                Socket.send(obj);

            },message:async (event)=> {
                // 接收消息

                try{
                    let messageObj = JSON.parse(event.data);
                    if(this.id == messageObj.fromFansId){
                        if(messageObj.msg){
							messageObj.msg = (messageObj.type == 1) ? await this.getImg(messageObj.msg) : messageObj.msg; 
							let o = {"message":messageObj.msg,"mySelf":false,"chatTime":this.transformTime(messageObj.sendTime),"sendTime":messageObj.sendTime,"type":messageObj.type};
                            this.messageList.push(o); // type：1为他人发送消息
							this.$nextTick(function(){
								Socket.send(JSON.stringify(Object.assign(messageObj,{cmd:"read"})));
							})
							this.setScrollTop();
                        }
                    }
                }
                catch(e){

                }
                
            }});
        },
        async assisGetCouponList(){
            // 获取优惠券列表
            let list = await http.getCouponByStaffId({data:{
                shopId : this.shopId
            }});
             this.couponList = list;

             for(var i=0;i<list.length;i++){
                 list[i].couponName = list[i].name;
                 if(list[i].couponType == '7'){
                     this.integral.push(list[i]);
                 }else{
                    this.coupon.push(list[i]);
                 }
             }
        },
        openCoupon(type){
            // 打开优惠券
            this.isGift = false;
            this.couponList = (type == '1') ? this.coupon : this.integral;
            this.couponObj.title = (type == '1') ? '优惠券' : '积分卡';

            for(let obj of this.couponList){
                obj.name = `${obj.couponName} (${obj.issuedQuantity}/${obj.allocatedQuantity})`;
            }

            if(utils.isEmptyObject(this.couponList)){
                this.$store.commit("setWin",{content: '暂无' + this.couponObj.title});
                return false;
            }

            this.couponObj.type="select";
            this.couponObj.componentId = 'multi-picker';
        },
        closePicker(obj){
            // 选择卡券后的回调
            if(obj.type == "sure"){
                // 确定后赠送券
                let index = obj.payload ? obj.payload[0] : '';
                 let recordId = this.couponList[index].id;
                let couponInfo = {
                    recordId : recordId,
                    index : index
                }
                this.sendCoupon(couponInfo);
            }
            this.couponObj.componentId = "";
        },
        async sendCoupon(obj){
            // 赠送优惠券
            let data = await http.sendCoupon({data:{
                shopId : this.shopId,
                recordId : obj.recordId,
                customerId : this.id
            }});
            let index = obj.index;
            if(data){
                // 发送优惠券赠送消息
                let title = (this.couponList[index].couponType == 7) ? '积分卡' : '优惠券';
                let couponName = this.couponList[index].couponName;
                this.type = 2;
                this.message = "赠送了一张" + title + ":"  + couponName;

                // 处理赠送优惠券问题
                let list = (this.couponObj.title == "积分卡") ? this.integral : this.coupon; // 是优惠券还是积分卡
                let obj = list[index]; // 优惠券或积分卡数量
                obj.issuedQuantity = Number(obj.issuedQuantity) + 1;
               
                if(obj.issuedQuantity == obj.allocatedQuantity){
                    list.splice(index,1);
                }else{
                    list.splice(index,1,obj);
                }
                this.sendMessage();
            }
        },
        giftCoupon(type){
            // 赠送卡券
            if(this.isMessAge) return false;
            this.isGift = (type === "close") ? false : true;
        },
        async sendMenuPath({name,type}){
            // 发送路径
            let data = await http.sendMenuPath({data:{
                shopId : this.shopId,
                menuName : name,
                type : type,
                fansId : this.id
            }});
        },
        async getVerbalTrick(){
            // 获取话术列表
            this.quickReplyList = await http.getVerbalTrick({data:{shopId:this.shopId}});

            let isMy = false; // 是否有我的
			let index = -1;
            for(let i=0;i<this.quickReplyList.length;i++){
                let content = this.quickReplyList[i].content;
                    this.quickReplyList[i].arr = [];
				if(this.quickReplyList[i].type == '2'){
					isMy = true;
					index = i;
				}
                for(let j=0;j<content.length;j++){
                    let item = content[j];
                    if(typeof item == "string"){
                        this.quickReplyList[i].arr.push({"name":item});
                    }else{
                        this.quickReplyList[i].arr.push(item);
                    }
                    
                }

                
            }
			
			if(index > -1){
				let item  = this.quickReplyList.splice(index,1)[0];
				this.quickReplyList.unshift(item);
			}
            if(isMy == false){
                this.quickReplyList.unshift({
                    "name" : "我的",
                    "type" : "2"
                });
				this.quickReplyList[0].arr = [];
            }
        },
        messageContent(obj){
            // 接收快速回复的消息
            if(obj.type == "sure"){
                this.type = (obj.contentType == '1') ? 3 : 0;
                this.message = (obj.contentType == '1') ?  "你发送了条路径：" + obj.messageContent.name : obj.messageContent.name;
                this.contentObj = obj;
            }
            this.isQuickReply = false;
            this.$store.commit("setOverHide",false);
        },
        transformTime(time){
            // 转换时间
            return utils.format(time,'yyyy/MM/dd hh:mm');
        },
        isShowTime(index){
            // 是否显示聊天时间,超过一小时显示聊天时间
            let time1 = (index == 0) ? this.messageList[0] : this.messageList[index - 1].sendTime;
            let time2 = this.messageList[index].sendTime;


            if(index == 0 || (time2 - time1) > 3600){
                return true;
            }else{
                return false;
            }
        },
        openQuickReply(){
            if(this.isMessAge) return false;
            this.isQuickReply = true;
            this.$store.commit("setOverHide",true);
        },
        async getHistoryMsg(){
            // 获取聊天记录
            let data = await http.getHistoryMsg({data:{
                shopId : this.shopId,
                page : 1,
                count : 1000,
                fromFansId : this.id,
                fansId : this.fansId
            }});

            for(let item of data.msgList){
                let obj = {
                    message : (item.type == 1) ? await this.getImg(item.msg) : item.msg,
                    mySelf : (this.id == item.fromFansId) ? false : true,
                    chatTime : this.transformTime(item.sendTime),
                    sendTime : item.sendTime,
                    type : item.type
                };
                this.messageList.push(obj);
            }

            this.setScrollTop();
        },
        setScrollTop(){
            // 内容始终滚到最下方
            setTimeout(()=>{
                 this.$refs.contents.scrollTop = this.$refs.contents.scrollHeight;
            });
        },
        returnPage(){
            // 返回上一页,离开页面断开链接
            Socket.destroyed();   
            clearInterval(this.timer);          
            this.$router.go(-1);
        },
        async getStaffDetail(){
            // 获取店员详情用于显示头像

            if(!this.isMessAge){
                let data = await http.getStaffDetail({data:{
                    shopId : this.shopId,
                    fansId : this.fansId
                }});
                this.login.imageUrl =  data.imageUrl;       
            }
        },
        onFoucs(type){
            // 获取焦点
            setTimeout(() => {
                this.$refs.contents.scrollTop = this.$refs.contents.scrollHeight - 100;
            },500);
        },
        async fileChange(){
            // 上传图片
            if(this.isMessAge) return false;
            let id =  await wx_sdk.uploadImg();
            let {serverId} = id;

            this.imgData = {
                "mediaid" : serverId,
                "picurl" : this.getImg(serverId)
            };
            this.type = 1; // 1为图片
            this.sendMessage();
        },
        async getImg(mediaid){
            // 获取聊天图片
            let imageUrl = global.host + 'image/weChatPhotoAgency?' + '&mediaId=' + mediaid + '&token=' + this.token + '&shopId=' + this.shopId;
            return  imageUrl;
        }
    },
    components: {
        'multi-picker': () => import (/* webpackChunkName: "multi_picker" */ 'src/components/multipicker/index'),
        'quickReply' : () => import (/* webpackChunkName: "quick_reply" */ './quick_reply/quick_reply' )
    },
    destroyed(){
        Socket.destroyed();
    },
    async mounted(){
        wx_sdk = await import(  /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
        wx_sdk = wx_sdk.default;

        await wx_sdk.registerWXSDK();


        this.getStaffDetail();
        this.readyWebSocket();
        this.getVerbalTrick();
        this.getHistoryMsg();
        this.assisGetCouponList();

        this.isMessAge = !Boolean(this.fansId == this.login.fansId); // 是否是自己的聊天记录
        utils.setTitle('我的客户');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,100%);
    overflow: hidden;
}
.header{
    background: #FFFFFF;
    text-align: center;
    font-family: PingFang-SC-Medium;
    font-size: .48rem;
    color: #303030;
    .setBox(100%,1.1733rem);
    line-height: 1.1733rem;
    .return_page{
        display: block;
        .setBox(1.0667rem,100%);
        background: url(../../../res/images/recurrence.png) center center no-repeat;
        background-size: .28rem .4933rem;
    }
    .title{
        margin-left: -1.0667rem;
    }
}
.content{
    @diff : 2.51rem;
    .setBox(100%,calc(~"100% - @{diff}"));
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    .chat_time{
        .setBox(10rem,.9333rem);
        display: table-cell;
        vertical-align: middle;
        text-align: center;
        overflow: hidden;
        span{
            background: #D8D8D8;
            border-radius: 8px;
            font-family: PingFang-SC-Medium;
            font-size: .32rem;
            color: #FFFFFF;
            padding: 0.05rem 0.3rem;
        }
    }
    .chat_content{
        padding: 0 .2933rem;
        .another_person,.oneself{
            .setBox(100%,auto);
            min-height: 1.12rem;
            overflow: hidden;
        }
        .head_sculpture{
            .setBox(1.36rem,auto);
            img{
                .setBox(1.0933rem,1.0933rem);
                border-radius: 50%;
            }
        }
        .oneself > .head_sculpture{
            height: 100%;
        }
        .user_info{
            @diff : 1.36rem;
            max-width: calc(~"100% - @{diff}");
            .setBox(auto,auto);
            margin-top: .1333rem;
        }
        .user_msg{
            background-color: #FFFFFF;
            border: 1px solid #999999;
            border-radius: 4px;
            .setBox(auto,auto);
            max-width: 6.7rem;
            line-height: .6rem;
            min-height: .6rem;
            padding: .1rem .2rem;
            word-wrap: break-word;
            word-break: normal;     
            position: relative;
            a{
                color: #6A9CE4;
                cursor: pointer;
            }
            img{
                .setBox(100%,100%);
                overflow: hidden;
            }
        }
        .chat_box{
            .setBox(100%,auto);
            margin-bottom: .4rem;
            overflow: hidden;
        }
    }
}
.footer{
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 5;
    .setBox(100%,1.32rem);
    line-height: 1.32rem;
    background: #F8F8F8;
    border-top: 1px solid #999999;
    box-sizing: border-box;
    .operate_icon{
        .setBox(3.8667rem,100%);
        padding-left: .1333rem;
        box-sizing: border-box;
        font-size: 0;
        span{
            .setBox(33.33%,100%);
            display: inline-block;
        }
        .select_pictures{
            background: url(../../../res/images/sell_assis/select_pictures.png) center center no-repeat;
            background-size: .72rem .5733rem;
            position: relative;
            >input{
                opacity: 0;
                position: absolute;
                left: 0;
                z-index: 5;
                .setBox(100%,100%);
            }
        }
        .give_present{
            background: url(../../../res/images/sell_assis/give_present.png) center center no-repeat;
            background-size: .6667rem .56rem;
        }
        .quick_reply{
            background: url(../../../res/images/sell_assis/quick_reply.png) center center no-repeat;
            background-size: .6rem .6rem;
        }
    }
    .import_box{
        .setBox(6.1333rem,100%);
        input{
            background: #FFFFFF;
            border: 1px solid #979797;
            border-radius: .1067rem;
            .setBox(5.0533rem,.9733rem);
            margin-top: .1467rem;
            text-indent: .2667rem;
        }
        span.commit{
            display: block;
            .setBox(1.08rem,100%);
            background: url(../../../res/images/sell_assis/send_message.png) center center no-repeat;
            background-size : .6rem .36rem;
        }
    }
}
.gift_win{
    .setBox(100%,4.8rem);
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: #ffffff;
    border: 1px solid #999999;
    border-radius: .2667rem .2667rem 0 0;
    padding: 0 1.0267rem;
    box-sizing: border-box;
    z-index: 56;
    span{
        display: block;
        .setBox(100%,1.6rem);
        line-height: 1.6rem;
        border-bottom:  1px solid #979797;
        text-align: center;
        font-size: .3733rem;
        color: #303030;
        &:nth-child(3){
            color: #999999;
            border-bottom: none;
        }
    }
}
.gift_bg{
    .setBox(100%,100%);
    position: fixed;
    left: 0;
    top: 0;
    overflow: hidden;
}
.message_right{
    &:before{
        box-sizing: content-box;
        width: 0px;
        height: 0px;
        position: absolute;
        top: .16rem;
        right:-.18rem;
        padding:0;
        border-bottom:.1067rem solid transparent;
        border-top:.1067rem  solid transparent;
        border-left:.1067rem  solid #FFFFFF;
        border-right:.1067rem  solid transparent;
        display: block;
        content:'';
        z-index: 12;
    }
    &:after{
        box-sizing: content-box;
        width: 0px;
        height: 0px;
        position: absolute;
        top: .16rem;
        right:-.23rem;
        padding:0;
        border-bottom:.1067rem  solid transparent;
        border-top:.1067rem  solid transparent;
        border-left:.1067rem  solid #999;
        border-right:.1067rem  solid transparent;
        display: block;
        content:'';
        z-index:10
    }
}
.message_left{
    &:before{
        box-sizing: content-box;
        width: 0px;
        height: 0px;
        position: absolute;
        top: .16rem;
        left:-.18rem;
        padding:0;
        border-bottom:.1067rem solid transparent;
        border-top:.1067rem  solid transparent;
        border-left:.1067rem  solid transparent;
        border-right:.1067rem  solid #FFFFFF;
        display: block;
        content:'';
        z-index: 12;
    }
    &:after{
        box-sizing: content-box;
        width: 0px;
        height: 0px;
        position: absolute;
        top: .16rem;
        left:-.23rem;
        padding:0;
        border-bottom:.1067rem  solid transparent;
        border-top:.1067rem  solid transparent;
        border-left:.1067rem  solid transparent;
        border-right:.1067rem  solid #999;
        display: block;
        content:'';
        z-index:10
    }
}
#chatFrom{
    position: absolute;
    left: 0;
    bottom: 0;
    opacity: 0;
    .setBox(100%,100%);
    input{
        .setBox(100%,100%);
        display: block;
    }
}
</style>

