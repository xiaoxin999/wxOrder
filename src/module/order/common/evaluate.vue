/*
 * @Author: ruokun.ma 
 * @Date: 2018-03-31 12:26:01 
 * @Module: {评价系统} 
 */

<template>
    <section class='evaluate'>
        <section class='body' >
            <header>
                <div>   
                    <img src="../../../res/images/affirm.png" alt="">
                    <div class='status' style='font-weight:500'>支付成功</div>
                    <div class='name'>{{shopName}}</div>
                </div>
            </header>
            <section class='body'>

                <div>

                    <ul>
                        <li v-if='onOff[1]'>
                            <!-- -->
                            <span>环境评分</span>
                            <star :size="'0.6rem'" :offsetX = "'0.2rem'" :interactive='true' :name = "1" @index = "changeIndex"></star>
                        </li>
                        <li v-if='onOff[2]'>
                            <!-- -->
                            <span>口味评分</span>
                            <star  :size="'0.6rem'" :offsetX = "'0.2rem'" :name = "2"  :interactive='true' @index = "changeIndex"></star>
                        </li>
                        <li  v-if='onOff[3]'>
                            <!--  -->
                            <span>服务评分</span>
                            <star  :size="'0.6rem'" :offsetX = "'0.2rem'" :name = "3"  :interactive='true' @index = "changeIndex"></star>
                        </li>
                    </ul>
                    <section v-if='onOff[5]' class='message'>
                        <span class='title'>点评</span>
                        <textarea name="" id="" style="resize:none" @input="change" v-scrollTxt = "'.evaluate'"  placeholder = '为了更好的服务，您有什么建议可以提供给我们' ></textarea>
                        <span class='num'>{{mess.length}}/100</span>
                        <section @click='startNO' class='send' style='float:right;margin-top:0.15rem'>
                            <img :class = "{'filter_gray':!isstart}" src="../../../res/images/affirm.png"  alt="">
                            <span>匿名发布</span>
                        </section>
                    </section>
                    

                </div>
                
            </section>
            <section class='goods' v-if="onOff[4]&&type!='3'">
                <div class='title'>商品评分</div>


                    <ul>
                        <li v-for = "(item,index) in list" :key='index'>
                            <span>{{item.goodsName||item.packageName}}</span>
                            <div @click = 'good($event,item)' >
                                <!-- <img src="../../../res/images/sell_assis/praise_icon_color.png" class ='up filter_gray_s' alt="">
                                <img src="../../../res/images/sell_assis/praise_icon_color.png" class ='down filter_gray_s' alt=""> -->
                                <i class ='up filter_gray_s'></i>
                                <i class ='down filter_gray_s'></i>
                            </div>
                        </li>
                        
                    </ul>
                
                
            </section>
        </section>  
        
        <section :class='{button:true,gray:!isAllow,yellow:isAllow}' @click='submit'>
提交评价
        </section>
    </section>
</template>


<script>
    
    import utils from "src/verdor/utils";
    import storage from "src/verdor/storage";
    import global from "src/manager/global";
    import http from "src/manager/http";

    export default{
        data(){
            return{
                mess:"",
                isstart:false,
                config:{},
                isAllow:false,
                //配置开关
                onOff:{
                    1:false,
                    2:false,
                    3:false,
                    4:false,
                    5:false
                },
                list:[],
                itemScores:{},
                itemOk:false,
                isMess:false,
                goodsComment:{
                    package:{
                        up:"",
                        down:""
                    },
                    goods:{
                        up:"",
                        down:""
                    }
                },
                type:0,
                oid:0,
                shopName:""
            }
        },
        methods:{
            change(e){
                this.mess = e.target.value;
                if(this.mess.length>=100) {
                    e.target.value = this.mess.slice(0,100);
                    this.mess = e.target.value;
                }
            },
            changOk(){  
                if(this.itemOk){
                    this.isAllow = true
                }
                else{
                    this.isAllow = false
                }
            },
            changeIndex(name,i){
                this.itemScores[name] = i + 1;

                let isOK = true;
                for(let str in this.itemScores){
                    if(this.itemScores[str] == 0){
                        isOK = false
                        break;
                    }
                }
                
                this.itemOk = isOK;
                this.changOk();

            },
            startNO(){
                this.isstart = !this.isstart;
            },
            good(e,item){
                console.log(e,item);
                let tar = e.target;
                console.log(tar,'tar');
                let up = true;
                let id = item.id||item.gid||item.packageId;

                if(id == undefined) return;

                let type = 'goods';
                if(item.packageName){
                    type = 'package'
                }
                let evalType = 'up';

                if(tar.tagName.toLowerCase() == 'i'){
                    Array.from(e.currentTarget.children).forEach((item,index)=>{
                        if(item === tar&&index == 1){
                           evalType = 'down';
                        }
                        if(index == 0){
                            item.className = 'up filter_gray_s';
                        }else{
                            item.className = 'down filter_gray_s';
                        }
                    })
                    tar.className += ' no_filter_s'
                }


                let typeArr = ['goods','package'];
                for(let item of typeArr){
                    this.goodsComment[item].down = this.goodsComment[item].down.replace(","+id,"");
                    this.goodsComment[item].up = this.goodsComment[item].up.replace(","+id,"");
                }
                this.goodsComment[type][evalType] += ","+id;
                console.log(this.goodsComment)
            },
            async submit(){
                
                if(this.isAllow){

                    if(this.mess.length != 0 ){
                        if(this.mess.length<5){
                            this.$store.commit("setWin",{
                                content:"文字评价至少5个字哦!"
                            })
                            return;
                        }
                    }

                    let typeArr = ['goods','package'];
                    let evalTypeArr = ['down','up'];

                    for(let item of typeArr){
                        for(let item1 of evalTypeArr){
                            this.goodsComment[item][item1] = this.goodsComment[item][item1].substr(1);
                        }
                    }

                    let d = {
                            oid:this.oid,
                            channel:this.type,
                            isAnonymous:Number(this.isstart),
                            itemScores:JSON.stringify(this.itemScores),
                            comment:this.mess,
                            goodsComment:JSON.stringify(this.goodsComment),
                            shopId:this.shopId // 通过url获取的是点击推送的进来的
                        };
                    let data = await http.addPayComment({
                        data:d
                    })

                    if(data){
                        this.$store.commit("setWin",{
                            content:"评价成功",
                            callBack:()=>{
                                this.$closeWindow();
                            }
                        })
                        
                    }
                }
            },
            async getGoods(){
                let data = await http.showOrderDetail({data:{
                    oid: this.oid,
                    shopId : this.shopId
               }});

                let arr = [];
                this.shopName = data.shopName;
                try{
                    let goods = data.goodsData.goods||[];
                    let pack = data.goodsData.package||[];
                    arr = goods.concat(pack);
                }
                catch(e){
                    arr = [];
                }
                return arr;

            }
        },
        beforeRouteLeave: (to, from, next) => {
            this.$closeWindow();
        },
        components:{                  
            star:()=>import(/* webpackChunkName:"star" */"src/components/star")
        },
        async mounted(){

            let urlMode = utils.getQueryString('oid');
            if(urlMode){
                //推送的链接 评论
                this.oid = urlMode;
                this.type = utils.getQueryString('modeType');
                this.config.items = utils.getQueryString('items');

                this.list = await this.getGoods();
            }else{
                //直接进来评论

                let evalObj = storage.session("evalObj");
                
                this.oid = evalObj && evalObj.oid || global.evalObj.oid;
                this.type = evalObj && evalObj.type || global.evalObj.type;
                storage.session("evalObj",null);
                this.config = storage.session("commentConfigData");
            }
            
            let isNo = true;
            let indexItme = ['1','2','3'];

            if(this.config){
                this.config.items.split(",").forEach((item)=>{
                    if(indexItme.indexOf(item+"")>-1) isNo = false;
                    this.onOff[item] = true;
                    if(Number(item)<=3){
                        this.itemScores[item] = 0;
                    }
                })
                if(this.type!='3'&&!urlMode){
                    this.list = storage.session("goods").concat(...storage.session("packages"));
                }
            }

            if(isNo) this.isAllow = true;

            if(this.type>-1&&!urlMode){
                if(this.type == 3){
                    this.shopName = global.evalObj.shopName;
                }else{
                    this.shopName = storage.session("select-shop")
                    ? storage.session("select-shop").shopName
                    : storage.session("wechatShop").shopName;
                }
            }
            
           

            utils.setTitle("用户评价");
            document.body.scrollTop = 0;
        }
    }
</script>


<style scoped lang = 'less'>
    section.evaluate{
        height:100%;
        background-color: white;
        overflow:auto;
        box-sizing: border-box;
        .body{
            header{
                height: 4.8rem;
                
                &>div{
                    width:5.1rem;
                    margin: 0 auto;
                    text-align: center;
                    
                    &>img{
                        width: 1.64rem;
                        height:1.64rem;
                        margin-top: 1rem;
                    }
                    .status{
                        font-size: 0.5333rem;
                        color: #000000;
                        margin-top: 0.3rem;
                    }
                    .name{
                        font-size: 0.3733rem;
                        color: #888888;
                        line-height: 0.56rem;
                        margin-top: 0.24rem;
                    }
                }
            }
            section.body{

                border-top:0.2667rem solid rgb(240,240,240);
                padding-bottom: 0.5rem;
                height: auto;

                &>div{
                    width:90%;
                    margin: 0 auto;
                    ul{
                        padding-top: 0.4rem;
                        overflow: hidden;
                        li:first-child{
                            margin-top: 0;
                        }
                        li{
                            margin-top: 0.5333rem;
                            height: 0.6rem;
                            line-height: 0.6rem;
                            span{

                                font-size: 0.4rem;
                                color: #000000;
                                vertical-align: middle;
                            }
                            div{
                                vertical-align: middle;
                                float: right;
                            }
                        }
                    }
                    .message{
                        margin-top: 0.5rem;
                        &>span.title{
                            font-size: 0.4rem;
                            color: #000000;
                            
                        }
                        span.num{
                            position: relative;
                            font-size: .32rem;
                            color: #888;
                            top: -0.8rem;
                            left: 1;
                            right: -7.5rem;
                        
                        }
                        textarea{
                            margin-top: 0.36rem;
                            width:100%;
                            height:2.36rem;
                            font-size: 0.32rem;
                            color: #888888;
                            line-height: 0.5rem;
                            text-indent: 0.32rem;
                            padding-top: 0.2rem;
                            border:none;
                            background-color:  #F8F8F8;

                        }
                    }
                    .send{
                        margin-top: 0.35rem;
                        img{
                            width:0.5rem;
                            vertical-align: middle;
                        }
                        span{
                            vertical-align: middle;
                            padding-left:0.1rem;
                        }
                    }
                }
                
            }
            section.goods{

                border-top:0.2667rem solid rgb(240,240,240);
                margin-bottom: 1.45rem;

                

                .title{
                    height: 42px;
                    line-height: 42px;
                    text-align: center;
                    font-size: 0.4rem;
                    color: #000000;
                }


                    ul{
                        
                        li{

                            overflow: hidden;
                            padding-top: 0.45rem;
                            width: 90%;
                            margin: 0 auto;
                            span{
                                font-size: 0.4rem;
                                color: #000000;
                                vertical-align: middle;
                                display: inline-block;
                                width: 70%;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }

                            div{
                                float: right;
                                i{
                                    display: inline-block;
                                    width:0.5867rem;
                                    height:0.5867rem;
                                    vertical-align: middle;
                                    margin-right: 0.6rem;
                                    background:url(../../../res/images/sell_assis/praise_icons.png) center center no-repeat;
                                    background-size:100%;
                                }
                                i.down{
                                    transform: scaleY(-1);
                                    margin-right: 0;
                                }
                                i.no_filter_s{
                                    background:url(../../../res/images/sell_assis/praise_icon_color.png) center center no-repeat;
                                    background-size:100%;
                                }
                            }
                        }
                    }
                
                
                
            }

        
        }
        
        .yellow{
            background: #F5A623;
        }
        .gray{
            background: rgb(230,230,230);
        }
        section.button{
            height:1.2533rem;
            line-height:1.2533rem;
            text-align: center;
            font-size: 0.48rem;
            color: #FFFFFF;
            
            position: fixed;
            bottom:0;
            z-index:10;
            width: 100%;
        }

    }
    
</style>
