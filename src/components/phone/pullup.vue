/*
 * @Author: ruokun.ma 
 * @Date: 2018-05-11 11:26:27 
 * @Module: {下拉加载更多...} 
 */

<template>
    <div ref = 'pullup' id='pullup' >
        <div v-if = 'show'  >下拉加载更多...</div>
        <div v-else>菜单到底啦...</div>
    </div>
    
</template>

<script>
    import utils from "src/verdor/utils";

    export default{
        props:{
            distance:{//在目标块距离底部父级多少时开始加载
                type:[Number,String],
                default:100
            },
            parentNode:null,//父级节点元素
            fn:{
                type:Function,
                default:()=>{
                    return ()=>{}
                }
            },
            context:null,//回调的执行上下文
            params:{
                type:Array,
                default: function () {
                    return []
                }
            },//回调的执行上下文的参数
            delay:{
                type:[Number,String],
                default:100
            },//回调是否延迟时间
            show:true,
        },
        data(){

            return{
                callBack:null,
                
                sh:utils.getWindowWH().h,
                pn:null,
                lastDis:0
            }
        },
        methods:{
            srollLoad(e) {
                

                    let dis = utils.getDOMPosition(this.$refs.pullup).y ;
                    if ((dis - this.distance  < this.sh&&this.lastDis >= dis)||this.lastDis == 0) {
                        //下拉加载触发
                        let show = true;
                        show = this.fn.apply(this.context,[{dir:"up",allow:true}]);
                        if(show == false) {
                            this.show = false;
                            this.pn.removeEventListener("scroll", this.callBack);
                        }
                    }
                    else{
                        if(this.lastDis!=0&&Math.abs(this.lastDis - dis)< 3000){
                            if(this.lastDis > dis){
                                this.fn.apply(this.context,[{dir:"up",allow:false}]);
                            }
                            else if(this.lastDis < dis){
                                this.fn.apply(this.context,[{dir:"down",allow:false}]);
                            }
                        }
                        
                    }

                    this.lastDis = dis;

                
                
            },
        },
        mounted(){
            let p = this.pn = document.querySelector(this.parentNode)||document.querySelector("#app");
            this.callBack = utils.throttle(this.srollLoad,this.delay,this.delay * 1.5,this);
            p.addEventListener("scroll", this.callBack);
        },
        destroyed(){
            this.pn.removeEventListener("scroll", this.callBack);
        }
    }
</script>

<style lang='less' scoped>

    div#pullup{
        height:1rem;
        text-align: center;
        line-height: 1rem;
    }

</style>
