/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:27:42 
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-10-06 17:49:02
 */
<template>
    <div class="container">
        <div class="header">
            <span class="return_page fl" @click="returnPage"></span>
            <span class="subhead_title fl">消息中心</span>
            <span class="renovate fl"></span>
        </div>
        <div class="content">
            <div class="box" v-for="(item,index) in contactsList" v-bind:key="index" @click="openChat(item)">
                <div class="head_sculpture fl">
                    <img :src="item.imageUrl" alt="头像">
                </div>
                <div class="userName fl">{{item.name}}</div>
                <div class="boxfr fr">
                    <span class="fl num" v-if="item.unreadNum > 0">{{item.unreadNum}}</span>
                </div>
            </div>
            <div class="not_message" v-if="contactsList.length == 0">
                没有消息喲~
            </div>
        </div>
    </div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import global from "src/manager/global";
import storage from 'src/verdor/storage';
import Socket from './websocket.js'
let path;
export default {
    data(){
        return{
            contactsList : [], // 联系人列表 
            login : storage.session('login'),
            fansId : this.$route.query.fansId || storage.session('login').fansId,
            path : ""
        }
    },
    methods:{
        async getList(){
            // 获取未读消息列表和客户列表
            let messageList = await http.getUnreadMsg({data:{shopId:this.shopId,fansId:this.fansId}});
            let list = await http.myCustomer({data:{
                shopId:this.shopId,
                page : 1,
                num : 100,
				fansId : this.fansId,
				needContactTime:1
            }});

            let index = 0;
            for(let obj of list.customerList){
				obj.sendTime = obj.lastContactTime;
				this.contactsList.push(obj);
            }

            // 组合消息列表数量
            for(let obj of messageList){
                let staffInfo = this.checkList(obj.fansId);
                if(staffInfo){
                    staffInfo.unreadNum = obj.unreadNum;
                    staffInfo.sendTime = obj.sendTime;
				}
				
            }

            this.contactsList = utils.sortByAll(this.contactsList,"sendTime",false);
		},
		checkList(id){
			for(let item of this.contactsList){
				if(id === item.id){
					return item;
				}
			}
			return null;
		},
        readyWebSocket(){
            // 初始化webSocket
			let that = this;
            Socket.init({id:"list",url:this.login.webSocket,open:(event)=> {
                // webSocket链接成功发送身份验证
				let obj = JSON.stringify({"cmd":"login","roomId":this.login.fansId,"token":this.login.accessToken});
				
				this.socket = Socket._socket;
                Socket.send(obj);

            },message:(event)=> {
                // 接收消息

                try{
                    let obj = JSON.parse(event.data);
                    if(obj.toFansId){
						
						// console.log(that.contactsObj,that.contactsList,that.staffObj,obj.fromFansId)
						let item = that.checkList(obj.fromFansId);
                        if(item.unreadNum!=undefined){
                            // 如果联系人存在未读消息数量直接+
                            item.sendTime = obj.sendTime;
                            item.unreadNum++;
                        }else{
                            // 不存在push
							item.unreadNum = 1;
							item.index = that.contactsList.length;
							item.sendTime = obj.sendTime;
						}
                        that.contactsList = utils.sortByAll(that.contactsList,"sendTime",false);
					}
					
                }
                catch(e){

                }
                
			},
			"error":(event)=>{
			}});
        },
        openChat(item){
            // 打开聊天页面
			storage.session('detail',item);
            this.$router.push({path:'/chatPage',query:{"id":item.id,"fansId":this.fansId}});
        },
        returnPage(){
            // 返回上一页,离开页面断开链接 
            if(path == "/"){
                //关闭微信游览器
                this.$closeWindow();
            }else{     
                this.$router.go(-1);
            }
        }
    },
    beforeRouteEnter: (to, from, next) => {
        path = from.path;
        next();
    },
    destroyed(){
        Socket.destroyed();
    },
    async mounted(){
        await this.getList();
        this.readyWebSocket();
        utils.setTitle('我的联系人');
    }
}
</script>
<style lang="less" scoped>
@import '../../../res/css/base.less';
.container{
    .setBox(100%,auto);
    min-height: 100%;
    background-color: #fff;
    overflow: hidden;
    .header{
        .setBox(100%,1.44rem);
        line-height: 1.1733rem;
        text-align: center;
        border-bottom: .2667rem solid #F8F8F8;
        .return_page{
            background: url(../../../res/images/recurrence.png) center center no-repeat;
            background-size: .28rem .4933rem;
            .setBox(1.0667rem,100%);
        }
        .renovate{
            background: url(../../../res/images/sell_assis/renovate.png) center center no-repeat;
            background-size: .6rem .5333rem;
            .setBox(1.3333rem,100%);
        }
        .subhead_title{
            @diff : 2.4rem;
            .setBox(calc(~"100% - @{diff}"),100%);
            font-family: PingFang-SC-Medium;
            font-size: .3733rem;
            color: #303030;
        }
    }
    .content{
        .box{
            background: #F8F8F8;
            border-top: 1px solid #DDDDDD;
            border-bottom: 1px solid #DDDDDD;
            .setBox(100%,2.5067rem);
            line-height: 2.5067rem;
            padding-left: .0667rem;
            box-sizing: border-box;
            margin-bottom: .32rem;
            .head_sculpture{
                position: relative;
                .setBox(2.72rem,2.5067rem);
                img{
                    .setBox(1.7067rem,1.7067rem);
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                    border-radius: 50%;
                    overflow: hidden;
                }
            }
            .boxfr{
                .setBox(2rem,2.5067rem);
                background: url(../../../res/images/more.png) 1.3333rem center no-repeat;
                background-size: .2133rem .3467rem;
                position: relative;
                .num{
                    background: #FF6F49;
                    .setBox(.6667rem,.6667rem);
                    line-height: .6667rem;
                    text-align: center;
                    border-radius: 50%;
                    display: block;
                    font-size: .3467rem;
                    color: #FFFFFF;
                    position: absolute;
                    top: 50%;
                    left: 10%;
                    transform: translate(0,-50%);
                }
            }
        }
    }
    .not_message{
        .setBox(2.6667rem,2rem);
        line-height: 3rem;
        position: absolute;
        left: 50%;
        top: 45%;
        transform: translate(-50%,-45%);
        font-size: .2933rem;
        color: #999999;
        text-align: center;
        background: url(../../../res/images/sell_assis/no_message.png) center 0 no-repeat;
        background-size: 1.04rem .88rem;
        overflow: hidden;
    }
}
</style>
