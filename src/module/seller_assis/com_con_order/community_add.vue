/*
 * @Author: ruokun.ma 
 * @Date: 2018-06-04 14:41:25 
 * @Module: {社群召集令新增} 
 */

<template>
    <section class='community_add'>
        <header>
            <div class='left' @click='goBack'>
                <img src="../../../res/images/sell_assis/back_page.png" alt="">
            </div>
            <div class='center'>社群召集令</div>
            <div class='right' ></div>
        </header>
        <section class='content'>
            <section class='title'>
                <div>标题</div>
                <div>
                    <input type="text" v-model="title"  placeholder="请输入标题" maxlength="10">
                </div>
            </section>
            <section class='upload'>
                <div>
                    <img :src="uploadUrl" alt="" v-if="uploadUrl" class='hasUrl'>
                    <label for="upload" v-else><img src="../../../res/images/sell_assis/add_img.png" alt="" class='noupload'></label>
                </div>
                <form action="" id='uploadFile' style='display:none' enctype="multipart/form-data">
                    <input accept="image/*"  id='upload' type="file" @change='uploadFile' name="image">
                </form>
                
                <label for="upload"><div class='uploadAgain' >重新上传</div></label>
            </section>
            
            
        </section>
        <div class='line'></div>
        <div class='sub'>
            <section class='title'>
                <div>描述</div>
                <div @click="selectShop">
                    {{shopName?shopName:"选择发布门店"}}
                    <img src="../../../res/images/sell_assis/back_page.png" alt="">
                </div>
            </section>
            <div class='content'>
                <textarea placeholder="请输入内容" @input="change" style='resize:none' v-scrollTxt = "'.community_add'"></textarea>
                <span class='count'>{{mess.length}}/100</span>
            </div>
        </div>
        <div :class='{button:true,gray:!subStatus,yellow:subStatus}' @click = 'submit'>
            提交
        </div>

        <transition name='fade'>
            <picker :list="shopList" :returnValue= "'index'" :isShow="true" v-if="showShop" @closePicker="closePicker"></picker>  
        </transition>

        <imgclip v-if = "showclip"  @sub = "sub" :fileStr = "file"></imgclip>

    </section>
</template>


<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import utils from 'src/verdor/utils';
    import storage from 'src/verdor/storage';

    let cropper = null;
    export default{
        data(){
            return {
                uploadUrl:'',
                mess:'',
                subStatus:false,
                shop:'',
                title:'',
                shopList:[],
                shopName:'',
                showShop:false,
                url:"",
                clicked:false,
                staffFansId : storage.session('login').fansId,
                showclip:false,
                file:null
            };
        },
        watch:{
            'uploadUrl':function(){
                this.changeStatus();
            },
            'shop':function(){
                this.changeStatus();
            },
            'title':function(){
                this.changeStatus();
            }
        },
        methods:{
            async sub(obj){
                this.showclip = false;
                let {status,blob} = obj;

                if(status == "complete"){
                    let data = await http.upload({
                        data:{
                            type:10,
                            shopId:global.getShopId()
                        },
                        name:"image",
                        blob
                    }) 
                    this.url  =data;
                    this.uploadUrl = global.getImgUrl({url:data}) ;
                }
            },
            closePicker(obj){
                let {type,data} = obj;

                if(type=="ok"){
                    this.shopName = this.shopList[data[0]].name;
                    this.shop = this.shopList[data[0]].id;
                }
                
                this.showShop = false;
            },
            selectShop(){
                if(this.shopList.length > 0){
                    this.showShop = true;
                }else{
                    this.$store.commit("setWin",{content: '暂无可用店铺'});
                }
            },
            changeStatus(){
                if(this.uploadUrl&&this.shop&&this.title){
                    this.subStatus = true;
                }
            },
            change(e){
                this.mess = e.target.value;
                if(this.mess.length>=100) {
                    e.target.value = this.mess.slice(0,100);
                    this.mess = e.target.value;
                }
            },
            async submit(){
                if(this.subStatus){
                    if(this.clicked) return;
                    this.clicked = true;
                    let data = await http.createCallUp({
                        data:{
                            title:this.title,
                            image:this.url,
                            describe:this.mess,
                            publishShopId:this.shop,
                            shopId: global.getShopId(),
                        }   
                    })
                    if(data){
                        this.$store.commit("setWin",{content:"创建成功!",callBack:()=>{
                            window.history.back();
                        }});
                       
                    }
                }
            },
            async uploadFile(e){

                this.file = "upload";
                this.showclip = true;


            },
            goBack(){
                window.history.back();
            },
            async myGuide(){
                // 获取导购信息
                let {staffData} = await http.myGuide({data:{
                    shopId : global.getShopId(),
                    staffFansId : this.staffFansId
                }});

                // 获取用户信息
                let {shopList} = await http.getUserInfo({data: {
                        shopId: global.getShopId(),
                        from: 0,
                        type: 3
                }});

                // 判断是否为店长
                staffData.shopIds = staffData.shopIds.split(','); // 该导购适用店铺
                if(staffData.position === '1'){
                    for(let i = 0;i<shopList.length;i++){
                        let item  = shopList[i];
                        if(staffData.shopIds.indexOf(item.id + '') != -1){
                            this.shopList.push(item);
                        }
                    }

                    if(this.shopList.length==1){
                        this.shopName = this.shopList[0].name;
                        this.shop = this.shopList[0].id;
                    }
                }else{
                    this.shopList = [];
                }
            }
        },
        components:{
            "picker":()=>import(/* webpackChunkName:"picker" */"src/components/picker/picker"),
            "imgclip":()=>import(/* webpackChunkName:"img_clip" */"src/components/img_clip"),
        },
        async mounted(){
            
            this.myGuide();
            utils.setTitle("闪店卖手");
        }
    }
</script>

<style lang='less' scoped>

    

    .community_add{
        background: #FFFFFF;
        padding-bottom: 0.3rem;
        header{
            width: 100%;
            height:1.1733rem;
            display: flex;
            align-items: center;
            justify-content: center;

            div.left{
                width:1.6rem;
                padding-left: 0.5rem;
                img{
                    width:0.2667rem;
                    height:0.4667rem;
                }
            }
            div.center{
                font-size: 0.48rem;
                color: #303030;
                text-align: center;
                flex:1;
            }
            div.right{
                width:1.6rem;
                font-size: 0.3467rem;
                color: #EAC048;
                text-align: center;
            }
        }
        .content{
            width:9.5rem;
            margin: 0 auto;
            .title{
                height:0.8rem;
                margin-top: 0.3rem;
                display: flex;
                align-items: center;
                justify-content: center;
                div:first-child{
                    width:1.5rem;
                    text-align: center;
                    font-size: 0.4rem;
                    color: #303030;
                }
                div:nth-child(2){
                    flex:1;
                    height:100%;
                    input{
                        width:7.7067rem;
                        height: 0.8rem;
                        border-radius: 1.3333rem;
                        text-align: left;
                        border: none;
                        background: #F8F8F8;
                        font-size: 0.3467rem;
                        color: #999999;
                        text-indent: 0.5rem;
                    }
                }
            }
            .upload{
                
                overflow: hidden;
                div:first-child{
                    height:8.2rem;
                    display: table-cell;
                    vertical-align: middle;
                    width: 9.5rem;
                    text-align: center;
                        img{
                            vertical-align: middle;
                        }
                        img.noupload{
                            width:4.2133rem;
                            height:4.2133rem;
                        }
                        img.hasUrl{
                            width:7.4133rem;
                            height:7.4133rem;
                        }
                }
                
                label{
                    .uploadAgain{
                        font-size: 0.3467rem;
                        color: #FFFFFF;
                        text-align: center;
                        background: #EAC048;
                        border-radius: 1.3333rem;
                        width:2.1867rem;
                        height:0.84rem;
                        line-height:0.84rem;
                        float: right;
                    }
                }
                
            }
            
        }
        .line{
            background-color: #F8F8F8;
            height:0.2rem;
            margin-top: 0.2rem;
        }
        .sub{
            width:9.5rem;
            margin: 0 auto;
            .title{
                height:0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                div:first-child{
                    width:1.5rem;
                    text-align: center;
                    font-size: 0.4rem;
                    color: #303030;
                }
                div:nth-child(2){
                    flex:1;
                    font-size: 0.3467rem;
                    color: #999999;
                    vertical-align: middle;
                    text-align: right;
                    img{
                        width:0.2667rem;
                        height:0.4667rem;
                        transform: scaleX(-1);
                        vertical-align: text-top;
                        margin-left: 0.2rem;
                        margin-right: 0.3rem;
                    }
                }
            }
            .content{
                textarea{
                    width:8.9rem;
                    height:3.64rem;
                    background: #F8F8F8;
                    border: none;
                    margin: 0.2rem 0.3rem;
                    font-size: 0.4rem;
                    color: #999999;
                    text-indent: 0.5rem;
                    padding-top: 0.2rem;
                }
                .count{
                    position: absolute;
                    margin-left: 7.8rem;
                    margin-top: -1rem;
                }
            }
        }  
        .button{
            border-radius: 1.3333rem;
            width:4.5067rem;
            height:0.84rem;
            line-height:0.84rem;
            font-size: 0.3467rem;
            color: #FFFFFF;
            text-align: center;
            margin: 0 auto;
        } 

        .gray{
            background: #CDCDCD;
        }

        .yellow{
            background: #EAC048;
        }
    }
</style>


