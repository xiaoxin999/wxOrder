<template>
    
    <div id= "global_broadcast" :style="{'z-index': 5000 + win}">

        <template v-if="win > 2">
            <win v-if="show" @winEvent = "winEvent" :type="type" :ok="ok" :cancel ='cancel' :showBtn = "showBtn">
                <div slot="content" class="slotContent">
                    <div v-html="content">
                        <!-- <span>{{content}}</span> -->
                    </div>
                </div>
            </win>
        </template>
        <template v-else>
            <transition name="fade">
                <win v-if="show" @winEvent = "winEvent" :type="type" :ok="ok" :cancel ='cancel' :showBtn = "showBtn">
                    <div slot="content" class="slotContent">
                        <div v-html="content">
                            <!-- <span>{{content}}</span> -->
                        </div>
                    </div>
                </win>
            </transition>
        </template>
        
    </div>
    
</template>
<script>
    
    import win from "./phone/win.vue";
    import global from "src/manager/global";

    export default{
        props:{
            
        },
        data(){
            return {
                
            }
        },
        methods:{
            winEvent(str){
                let callback = this.$store.state.win.callBack||function(){};
                callback(str);
                this.$store.commit("setWin",{show:false})
            }
        },
        watch: {
            showBtn(val){
                if(val === false){
                    setTimeout(()=>{
                        let callback = this.$store.state.win.callBack||function(){};
                        callback("close");
                        this.$store.commit('setWin',{
                            show: false
                        })
                    },1000)
                }
            }
        },
        computed:{
            win(){
                return this.$store.state.win_id;
            },
            show(){
                return this.$store.state.win.show;
            },
            title(){
                return this.$store.state.win.title;
            },
            content(){
                return this.$store.state.win.content;
            },
            type(){
                return this.$store.state.win.type||'alert';
            },
            ok(){
                return this.$store.state.win.ok;
            },
            cancel(){
                return this.$store.state.win.cancel;
            },
            showBtn(){
                return this.$store.state.win.showBtn;
            }
        },
        components:{win}
    }

</script>
<style lang=  "less">
    #global_broadcast{
        position: fixed;
        
        div.slotContent{
            height:100%;
            display: table;
            width:100%;
            div{
                display: table-cell;
                text-align: center;
                vertical-align: middle;
                height: 100%;
               
            }
            
        }
        
    }
</style>

