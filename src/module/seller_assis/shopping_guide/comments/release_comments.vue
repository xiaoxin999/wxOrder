/*
 * @Author: guan.sun 
 * @Date: 2018-04-03 15:28:00 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-09-27 19:38:09
 */
<template>
    <div class="comments_box" v-if="isshow">
        <div class="input_box">
            <textarea placeholder="请输入内容..." maxlength="50" v-model="message" class="fl" ></textarea>
            <div class="tips fl">{{message.length}}/50</div>
        </div>
        <div class="bottom_btn fr">
            <a href="javascript:void(0)" class="fl close" @click="close">关闭</a>
            <a href="javascript:void(0)" class="fl release" @click="release">提交</a>            
        </div>
    </div>
</template>
<script>
export default {
    props: {
        isshow : {default:false}, // 是否显示发表评论弹窗
        mess:{
            default:""
        }
    },
    data(){
        return{
            message : "" // 消息
        }
    },
    methods: {
        setMess(str){
            this.message = str;
        },
        close(){
            // 关闭组件
            let obj = {"isshow":false,"message":"",type:"close"};
            this.$emit('commentsChange',obj);
            this.$store.commit(
                "setOverHide",false);
        },
        release(){
            // 发布点评
            let reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
            if(reg.test(this.message)){
                this.$store.commit("setWin",{content:"暂时还不支持发送emoji表情..."});
                this.message = this.message.replace(reg, "");
                return false;
            }
            if(this.message.trim() == ""){
                this.$store.commit("setWin",{content: "请输入内容。"});
                return false;
            }

            let obj = {"isshow":false,"message":this.message,type:"ok"};
            this.message = "";
            this.$emit('commentsChange',obj);
        }
    },
    beforeUpdate() {
        // this.message = this.message || this.mess;
    },
    mounted(){
        this.message =  this.mess;
    }   
}
</script>
<style lang="less" scoped>
@import '../../../../res/css/base.less';
.comments_box{
    position: fixed;
    left: 0;
    bottom: 0;
    .setBox(100%,auto);
    background-image: linear-gradient(132deg, #5E5E63 0%, #242424 100%);
    border-radius: .2667rem .2667rem 0 0;
    padding: .5333rem;
    z-index: 56;
    .input_box{
        .setBox(8.7333rem,80%);
        margin-bottom: .3733rem;
        // position: relative;
        overflow: hidden;
        .tips{
            // position: absolute;
            // right: .4rem;
            // bottom: .4667rem;
            border: none;
            font-size: .2933rem;
            color: #999999;
            .setBox(100%,20%);
            line-height: .8rem;
            background-color: #fff;
            text-indent: 88%;
            margin-top: -1px;
        }
    }
    textarea{
        resize: none;
        outline:none;
        .setBox(8.7333rem,2.6667rem);
        padding: .4rem;
        padding-bottom: 0;
        font-size: .32rem;
        color: #999999;
        border: none;
        border-radius: 0;
    }
    .bottom_btn{
        .setBox(5.0667rem,.84rem);
        line-height: .84rem;
        font-size: 0;
        a{
            display: inline-block;
            background: #EAC048;
            border-radius: 1.3333rem;
            font-size: .3467rem;
            color: #FFFFFF;
        }
        .close{
            .setBox(1.8667rem,.84rem);
            margin-right: .4933rem;
        }
        .release{
            .setBox(2.5333rem,.84rem);
        }
    }
}
</style>


