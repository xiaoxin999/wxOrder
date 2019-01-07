<template>
    
    <div id= "phone_win">
        <div class= 'win center' :style="{'width': w,'height': h == '100%' ? h : 'auto','border-radius': h == '100%' ? '0' : '5px' ,'z-index':5000+win_id,'transform':align=='center'?'translate(-50%,-50%)':null,'left':(align == 'left'?'0':(align == 'center'?'50%':null)),'right':align=='right'?'0':null}">
            
            <div class= 'win-body' :style="{'width':'auto','height':h}">
                <slot name="content"></slot>
            </div>
            <div v-if="showBtn" class= 'win-bottom'>
                <a class= 'win-cancel' @click="cancelFun" v-if="type === 'confirm'" :style="cancel?cancel.style:''">{{cancel?cancel.content:'取消'}}</a>
                <a :class = "{'win-ok':true,'alert':type !== 'confirm'}" @click="okFun" :style="ok?ok.style:''">{{ok?ok.content:'确定'}}</a>
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
                default:110
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
            autoHideTime:[Number,String],
            showBtn: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                win_id:global.win_id
            }
		},
		computed:{
			w(){
				if(Number(this.width) == this.width){
					return this.width + "px";
				}
				else{
					return this.width;
				}
			},
			h(){
				if(Number(this.height) == this.height){
					return this.height + "px";
				}
				else{
					return this.height;
				}
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
                this.$store.commit("setWinId",0)
            }
            else{
				 [...document.querySelectorAll(".win-mask")].slice(-1).shift().style.opacity = "1";
            }
            
        },
        mounted(){
			
            let arr = document.querySelectorAll(".win-mask");
            for(let item of arr){
                item.style.opacity = "0";
			}
	
            this.$refs.mask.style.opacity = "1";
            this.win_id = global.win_id+=2;
            this.$store.commit("setWinId",this.win_id)
            global.win_num++;

        }
    }

</script>
<style lang=  "less" scoped>

    #phone_win{
        .win {
            position:fixed;
            background-color: #fff;
            overflow: hidden;
            z-index: 4998;
            font-size: 18px;
            border-radius: 5px;
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
            background: url(../../res/images/a50.png) repeat;
            z-index: 997;
            opacity: 0;
        }

       

        .win .win-body {
            width: 100%;
            overflow:auto;
            height:auto;
            overflow-x:hidden;
			max-height: calc(~"100% - 50px");
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
            display: block;
            border-top:1px solid #d2d3d5;
        }

        .win .win-cancel {
            width: 50%;
            height: 50px;
            line-height: 50px;
            margin: 0px;
            padding: 0px;
            border: 0px;
            float: left;
            border-right: 1px solid #d2d3d5;
            color: #929292;
            font-size:18px;
        }

        .win .win-ok {
            width: 50%;
            height: 50px;
            line-height: 50px;
            margin: 0px;
            padding: 0px;
            border: 0px;
            float: left;
            color:#f5bf4f;
            font-size:18px;
        }

        .win .alert{
            width:100%;
        }
    }
    
</style>

