<template>
    
    <div id= "win">
        <div class= 'win center' :style="{'width': width +'px','height': 'auto','z-index':5000+win_id,'transform':align=='center'?'translate(-50%,-50%)':null,'left':(align == 'left'?'0':(align == 'center'?'50%':null)),'right':align=='right'?'0':null}">
            <div class= 'win-head'>
                <span class= 'win-head-logo noselect' ></span>
                <span class= 'win-head-title noselect'>
                    <slot name="title">提示信息</slot>    
                </span>
                <span class= 'win-head-close noselect' @click="closeFun"></span>
            </div>
            <div class= 'win-body' :style="{'width':'auto','height':typeof(height) == 'number' ? (height +'px') : 'auto'}">
                <slot name="content"></slot>
            </div>
            <div class= 'win-bottom'>
                <a class= 'win-cancel gray' @click="cancelFun" v-if="type === 'confirm'" :style="cancel?cancel.style:''">{{cancel?cancel.content:'取消'}}</a>
                <a class= 'win-ok blue ' :class = "{'wid-ok':true,blue:true,'alert':type !== 'confirm'}" @click="okFun" :style="ok?ok.style:''">{{ok?ok.content:'确定'}}</a>
            </div>
        </div>
        <div ref = "mask" class="win-mask" @click="closeFun" :style="{'z-index':5000 + win_id - 1}"></div>
    </div>
    
</template>
<script>

    import global from "src/manager/global";

    export default{
        props:{
            type:{
                type:String,
                default:"confirm"
            },
            align:{
                type:String,
                default:"center"
            },
            width:{
                type:[Number,String],
                default:300
            },
            height:{
                type:[Number,String],
                default:80
            },
            okCallback:{
                type:Function,
                default:function(){}
            },
            cancelCallBack:{
                type:Function,
                default:function(){}
            },
            ok:[Object],//单独给按钮设立样式和内容
            cancel:[Object],
            closeHandle:{
                type:Function,
                default:function(){}
            },
            autoHideTime:[Number,String]
        },
        data(){
            return {
                win_id:global.win_id
            }
        },
        methods:{
            okFun(){
                this.okCallback();
                this.$emit("winEvent","ok");
            },
            cancelFun(){
                this.cancelCallBack();
                this.$emit("winEvent","cancel")
            },
            closeFun(){
                this.closeHandle();
                this.$emit("winEvent","close")
            }
        },
        beforeDestroy(){
            if(!--global.win_num){
                global.win_id=0;
            }
            else{
                
                [...document.querySelectorAll(".win-mask")].slice(-2).shift().style.opacity = "1";
            }

        },
        mounted(){

            let arr = document.querySelectorAll(".win-mask");
            for(let item of arr){
                item.style.opacity = "0";
            }
            this.$refs.mask.style.opacity = "1";
            this.win_id = global.win_id+=2;
            global.win_num++;
        }
    }

</script>
<style lang=  "less">

    #win{
        position:fixed;
        z-index:4000;
        .win {
            position:fixed;
            background-color: #fff;
            overflow: hidden;
            z-index: 4998;
        }
        
        .win.center{
            top: 50%;
            transform: translate(0, -50%);
        }

        .win.right{
            top: 50%;
            right: 0;
            transform: translate(0, -50%);
        }

        .win-mask {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: url(../res/images/a50.png) repeat;
            z-index: 997;
            opacity: 1;
        }

        .win .win-head {
            position: relative;
            background-color: #e6e6e6;
            width: 100%;
            height: 50px;
            line-height: 50px;
            overflow: hidden;
        }

        .win .win-head-logo {
            float: left;
            width: 3px;
            height: 50px;
            background-color: #fbb03b;
            cursor: default;
        }

        .win .win-head-title {
            position: absolute;
            width: auto;
            height: 50px;
            line-height: 50px;
            top: 0px;
            left: 32px;
            cursor: default;
        }

        .win .win-head-close {
            float: right;
            width: 50px;
            height: 50px;
            cursor: pointer;
            background: url(../res/images/close.png) no-repeat center center;
        }

        .win .win-body {
            width: 100%;
            overflow:auto;
            height:auto;
            overflow-x:hidden;
        }

        .win .win-body-str {
            padding: 15px;
            width: auto;
            height: auto;
            line-height: 25px;
            font-size: 14px;
        }

        .win .win-bottom {
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-align: center;
            overflow: hidden;
            font-size: 0;
            display: block;
            background-color: #999;
        }

        .win .win-cancel {
            width: 50%;
            height: 50px;
            line-height: 50px;
            margin: 0px;
            padding: 0px;
            border: 0px;
            float: left;
        }

        .win .win-ok {
            width: 50%;
            height: 50px;
            line-height: 50px;
            margin: 0px;
            padding: 0px;
            border: 0px;
            float: left;
        }

        .win .alert{
            width:100%;
        }
    }
    
</style>

