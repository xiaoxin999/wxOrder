/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:27:21 
 * @Last Modified by: ruokun.ma
 * @Last Modified time: 2018-08-06 10:52:13
 */
<template>
<div class="quick_reply_bg" v-if="isShow">
    <div class="quick_reply_seat" @click="close"></div>
    <div class="quick_reply">
        <div class="reply_title">选择话术 </div>
        <div class="reply_subhead">
            <span v-for="(item,index) in list" v-bind:key="index" :class="(index == subHeadIndex) ? 'on' : ''" @click="clickSub(index)">{{item.name}}</span>
        </div>
        <ul class="reply_list">
            <li v-for="(item,index) in content" v-bind:key="index" :class="(index == contentIndex) ? 'on' : ''" @click="contentClick(index)">{{item.name}} <span class="select_on" v-if="index == contentIndex"></span></li>
        </ul>
        <div class="btns">
            <a href="javascript:void(0)" class="operate_btn orange" v-if="type == '2'" @click="addReply('add')">新增</a>
            <a href="javascript:void(0)" class="reply_btn" @click="commit">确定</a>
            <a href="javascript:void(0)" class="operate_btn gray" v-if="type == '2'" @click="customVerbalTrick('edit')">删除</a>
        </div>
    </div>
    <div class="add_reply" v-if="isAddReply">
        <div class="add_content">
            <div class="add_title">新增自定义话术</div>
            <textarea placeholder="请输入内容" v-model="userMsg" maxlength="100"></textarea>
            <div class="nums">{{userMsg.length}}/100</div>
            <div class="add_btns">
                <a href="javascript:void(0)" class="fl clean" @click="addReply">取消</a>
                <a href="javascript:void(0)" class="sure_btn fl" @click="customVerbalTrick('add')">确定</a>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import utils from 'src/verdor/utils';
import http from "src/manager/http";
import global from 'src/manager/global';

export default {
    props: {
        list : {default:() => []}, // 默认为空数组
        isShow : {default:false},
        fansId : ""
    },
    data(){
        return{
            subHeadIndex : 0, // 副标题选中的index
            contentIndex : -1, // 内容下选中的index 
            content : [], // 话术下的回复
            type : null, // 话术类型
            isAddReply:false,
            userMsg : "",
            contentId : null
        }
    },
    methods:{
        clickSub(index){
            // 点击副标题
            this.contentIndex = -1;
            this.subHeadIndex = (index === undefined) ? 0 : index;
            this.content = this.list[this.subHeadIndex].arr;
            this.type = this.list[this.subHeadIndex].type;
        },
        contentClick(index){
            // 点击内容
            this.contentIndex = index;
        },
        commit(){
            // 提交
            if(this.contentIndex < 0){
                this.$store.commit("setWin",{content: '请选择话术内容'});
                return false;
            }

            let messageContent = this.list[this.subHeadIndex].arr[this.contentIndex];
            this.$emit('messageContent',{"messageContent":messageContent,"type":"sure","contentType":this.list[this.subHeadIndex].type});
        },
        close(){
            // 关闭
            this.$emit('messageContent',{"type":"close"});
        },
        addReply(type){
            if(type == "add"){
                 this.isAddReply = true;
            }else{
                 this.isAddReply = false;                
            }
           this.userMsg = "";
        },
        async customVerbalTrick(type){
           // 添加或编辑,默认为添加,type为edit时编辑
			
			let temp = this.list[this.subHeadIndex];
            let arr = temp.arr;

			let t = utils.deepAssign([],arr);
			console.log(this.contentIndex)
			if(type == 'edit'){
				if(this.contentIndex == -1){
					return;
				}
				t.splice(this.contentIndex,1);
				
			}
            let msg = "";
            for(let obj of t){
                msg += obj.name + '&';
            }

            msg = this.userMsg ? msg + this.userMsg : msg.slice(0,-1); 

			let id = this.list[this.subHeadIndex].id ? this.list[this.subHeadIndex].id : "";
			if(id == "" && msg == ""){
				return;
			}
            let data = await http.customVerbalTrick({ data:{
                shopId : this.shopId,
                content : msg,
                fansId : this.fansId,
                id
			}});

			if(type == 'edit'){
				arr.splice(this.contentIndex,1);
				this.contentIndex = -1;
			}

            if(data && type != 'edit'){
				if(data.id){
					this.list[this.subHeadIndex].id = data.id;
				}
				
                this.list[this.subHeadIndex].arr.push({
                    "name" : this.userMsg
				});
            }

            this.addReply();
        }
    },
    mounted(){
       this.clickSub();
    }
}
</script>
<style lang="less" scoped>
@import '../../../../res/css/base.less';
.quick_reply{
    position: fixed;
    left: 0;
    bottom: 0;
    .setBox(100%,10rem);
    border-radius: .2667rem .2667rem 0 0;
    background-color: #ffffff;
    z-index: 11;
    .reply_title{
        .setBox(100%,1.2533rem);
        line-height: 1.2533rem;
        font-family: PingFang-SC-Medium;
        font-size: .48rem;
        color: #303030;
        text-align: center;
        border-bottom: .1333rem solid #F8F8F8;
    }
    .reply_subhead{
        .setBox(100%,auto);
        line-height: 1.0933rem;
        padding: 0 .8933rem;
        font-family: PingFang-SC-Semibold;
        font-size: 0;
        color: #303030;
        border-bottom: .1333rem solid #F8F8F8;
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        span{
            display: inline-block;
            .setBox(auto,100%);
            min-width: 1.1333rem;
            padding: 0 .2rem;
            font-size: .4rem;
            text-align: center;
            position: relative;
        }
        span.on:before{
            content: '';
            .setBox(1.0667rem,.0533rem);
            background-color: #303030;
            position: absolute;
            left: 50%;
            bottom: 0;
            transform: translate(-50%,0);
        }
    }
    .reply_list{
        .setBox(100%,5.6rem);
        padding-left: .9333rem;
        box-sizing: border-box;
        line-height: .6667rem;
        overflow-y: scroll;
        overflow-x: hidden;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        li{
            border-bottom: .0667rem solid #F8F8F8;
            font-size: .4rem;
            padding: .24rem 0;
            white-space: normal;
        }
        .on{
            color: #EAC048;
        }
    }
    .reply_btn{
        position: fixed;
        left: 50%;
        bottom: .7067rem;
        transform: translate(-50%,0);
        display: block;
        background: #EAC048;
        border-radius: 1.3333rem;
        .setBox(4.5067rem,.84rem);
        line-height: .84rem;
        font-family: PingFang-SC-Medium;
        font-size: .3467rem;
        color: #FFFFFF;
    }
    .select_on{
        background: url(../../../../res/images/sell_assis/select_on.png) center center no-repeat;
        background-size: .48rem .3333rem;
        display: inline-block;
        .setBox(.6667rem,.3333rem);
    }
}
.quick_reply_bg{
    position: fixed;
    left: 0;
    top: 0;
    .setBox(100%,100%);
    z-index: 55;
    overflow: hidden;
}
.quick_reply_seat{
    .setBox(100%,7.7867rem);
}
.btns{
    padding: 0 .3067rem;
}
.operate_btn{
    border-radius: 1.3333rem;
    .setBox(2.2667rem,.84rem);
    line-height: .84rem;
    font-size: .3467rem;
    color: #FFFFFF;
    position: fixed;
    bottom: .7067rem;
    &:first-child{
        background: #EAC048;
        left: .2667rem;
    }
    &:last-child{
        background: #bb9494;
        right: .2667rem;
    }
}
.add_reply{
    position: fixed;
    left: 0;
    top: 0;
    .setBox(100%,100%);
     z-index: 23;
    overflow: hidden;
    .add_content{
        .setBox(100%,12rem);
        background-color: #ffffff;
        border-top: .0133rem solid #999999;
        border-radius: .2667rem;
        position: absolute;
        bottom: 0;
        textarea{
            margin: 0 5%;
            padding: .5067rem;
            resize: none;
            border: none;
            background: #F8F8F8;
            .setBox(90%,7.3333rem);
            font-size: .4rem;
            color: #999999;
        }
    }
    .nums{
        margin: 0 5%;
        .setBox(90%,.8667rem);
        line-height: .8667rem;
        background: #F8F8F8;
        font-size: .4rem;
        color: #999999;
        text-align: right;
        padding-right: .5067rem;
        margin-top: -0.1rem;
    }
    .add_title{
        .setBox(100%,1.52rem);
        line-height: 1.52rem;
        text-align: center;
        font-size: .48rem;
        color: #303030;
    }
    .add_btns{
        .setBox(100%,3.1467rem);
        padding: 0 1.52rem;
        font-size: .3467rem;
        color: #FFFFFF;
        text-align: center;
    }
    .clean{
        background: #CDCDCD;
        border-radius: 1.3333rem;
        .setBox(2.2667rem,.84rem);
        line-height: .84rem;
        margin-right: .2rem;
        margin-top: .5733rem;
    }
    .sure_btn{
        background: #EAC048;
        border-radius: 1.3333rem;
        border-radius: 1.3333rem;
        .setBox(4.4rem,.84rem);
        line-height: .84rem;
         margin-top: .5733rem;
    }
}
</style>

