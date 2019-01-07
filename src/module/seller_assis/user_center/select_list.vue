<template>
    <section class='selectList' @click='open'>
        <div class='left'>
            {{fristValue }}
        </div>
        <div class='line'>

        </div>
        <div class='right'>
            <span></span>
        </div>
        <transition name='fade'>
            <ul class='list' v-if='show'>
                <li  v-for = '(item,index) in lists' :key='index'>{{item.shopName}}</li>
            </ul>
        </transition>

    </section>
</template>


<script>
    
    export default{
        props:{
            lists:{
                type:[Array],
                default:[]
            }
        },
        data(){
            return{
                show:false,
                fristValue:""
            }
        },
        watch:{
            lists:{
                handler:function(){
                     this.fristValue = this.lists[0]&&this.lists[0].shopName||"";
                },
                deep:true
            }
        },
        methods:{
            open(e){
                
                
                if(/li/gi.test(e.target.tagName)){
                    let index = [...e.target.parentNode.children].indexOf(e.target)
                    this.$emit('index',this.lists[index].shopId);
                    this.fristValue = this.lists[index].shopName;
                }
                
                this.show = !this.show;
            }
        },
        updated(){
           
        },
        mounted(){
            this.fristValue = this.lists[0]&&this.lists[0].shopName||"";
        }
    }
</script>


<style lang='less' scoped>
    .selectList{
        height:0.8rem;
        width:4.8rem;
        background: #FFFFFF;
        border: 1px solid #999999;
        border-radius: 1.3333rem;
        margin-right: 0.3rem;
        &>div{
            
            height:100%;
            display: inline-block;
            vertical-align: middle;
        }
        .line{
            width: 0.04rem;
            height:0.4267rem;
            background-color: #999999;
        }
        .left{
            width: 3.57rem;

            font-size: 0.35rem;
            color: #303030;
            height: 0.77rem;
            line-height: 0.77rem;
            text-align: center;
            white-space:nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            text-indent: 0.2rem;
        }
        .right{

            width:0.69rem;
            span{
                
                display: inline-block;
                position: relative;
                top:50%;
                left:50%;
                transform: translate(-50%,-25%);
                width: 0;
                height:0;
                border-top:0.25rem solid black;
                border-right:0.16rem solid  rgba(0,0,0,0);
                border-bottom:0.1rem solid rgba(0,0,0,0);
                border-left:0.16rem solid  rgba(0,0,0,0);
            }
        }
        ul{
            width:3.57rem;
            position: absolute;
            z-index:1;
            border: 1px solid #ccc;
            li{
                height:1rem;
                background-color: white;
                line-height: 1rem;
                font-size: 0.35rem;
                color: #303030;
                text-indent: 0.2rem;
                white-space:nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                border-bottom: 1px solid #ccc;
            }
            li:last-child{
                border:none;
            }
        }
    }
</style>
