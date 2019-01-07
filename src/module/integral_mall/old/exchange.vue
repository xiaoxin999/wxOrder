<template>
    <div class="container" id="exchange" v-cloak>
        <div v-if="!errors">
            <div class="namefor">{{goodsName}} <span>券码：{{exchangeCode}}</span></div>
            <div class="comBanner comBannerH">
                <img :src="hostImg + goodsImage" alt="商品banner" />
                <div class="convertible-shade" v-if="status == '1'">
                    <img src="../../../res/images/convertible.png" alt="已兑换" />
                </div>
            </div>
            <p class="line"></p>            
            <p class="mdName" v-if="!showTips && type == 1 && (flag === 1 || flag ===2)">适用门店：<a :href="addressMap">{{shopName}}</a></p>
            <div class="btngroup">
                <a href="javascript:void(0)" class="comBnttn" v-if="status == '0'" @click="goodsExchange">确认核销</a>
                <a href="javascript:void(0)" class="ofIntegraltn" v-if="status == '1'">已核销</a>
            </div>
            
        </div>
        <div class="fl errors reject" v-if="errors">
            <div class="errors-box">
                <img src="../../../res/images/error.png"/>
            </div>
            <p>您无核销权限!</p>
        </div>
        <div class='tips' v-if="!showTips && flag === 1">
            <img src="../../../res/images/sell_assis/warning.png" alt="">
            你没有该积分商品核销权限。
        </div>
        <div class='tips' v-if="!showTips && flag === 2">
            <img src="../../../res/images/sell_assis/warning.png" alt="">
            你没有该积分商品核销权限，请检查该<span>积分商品适用门店</span>。
        </div>
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';

    export default {
        name: 'exchange',
        data(){
            return {
                hostImg: '',
                exchangeCode: '',
                goodsName: '',
                goodsImage: '',
                status: '0',
                errors: false,
                openId: '',
                exchangeId: '',
                showTips:false,
                type:'',
                pointGoodsShopId:'',
                shopList:[],
                flag:"",
                goodsAddress:"",
                addressMap:"",
                shopName:''
            }
            
        },
        methods: {
            async getUser(){
                let loginInfo = storage.session('login');
                let res = await http.getUserInfo({
                data:{
                    shopId: this.shopId,
                    type: 3,
                    from: 0
                }})
                this.shopList = res.shopList;
                Object.assign(res,loginInfo)
                storage.session('wxInfo',res);
                storage.session('shopList',this.shopList);
                this.getExchange();
            },
            async getExchange(){ //刚进入页面 不检查权限
                let res = await http.goodsExchange({
                    data: {
                        shopId: this.shopId,
                        code: this.exchangeCode,
                        checkPermission:1,
                    }
                })
                this.goodsName = res.goodsName;
                this.goodsImage = res.goodsImage;
                this.status = res.status;
                this.type = res.type;
                this.flag = res.flag;
                this.requestToGetStatus(res.exchangeId);
                this.pointGoodsShopId =  res.pointGoodsShopId;
                this.addressMap = `http://api.map.baidu.com/geocoder?address=${this.goodsAddress}&output=html&src=闪店卖手`;
                this.shopList = storage.session('shopList');
                if(this.type == 1){
                    this.shopList.map((item) =>{
                    if(this.pointGoodsShopId == item.id){
                        this.goodsAddress = item.address;
                        this.shopName = item.name;
                        }
                            return item;
                        })
                }
            },
            async requestToGetStatus(id){
                let res = await http.saveStatusByScan({
                    data: {
                        shopId: this.shopId,
                        exchangeId: id
                    }
                })

            },
            async goodsExchange(){ //兑换按钮 检查
                let res = await http.goodsExchange({
                    data: {
                        shopId: this.shopId,
                        code: this.exchangeCode,
                        checkPermission:0,
                    }
                })

               if(res){
                   this.$store.commit('setWin',{
                    content:'核销成功!',
                    callBack:(str)=>{
                       this.$closeWindow()
                    }
                })
               }
            }
        },
        updated(){

        },
        mounted(){
            let userDate = storage.session("login");//取用户登录信息
            let code = utils.getQueryString('code');
            this.exchangeCode = utils.getQueryString('exchangeCode');
            this.openId = userDate.openId;
            this.hostImg = global.getImgUrl();

            this.getUser();
            this.getExchange();

            utils.setTitle("核销积分商品");
        }
    }
</script>

<style lang="less" scoped>
    #exchange{
        .content{
            width: 100%;
            .comBannerH{
                margin-bottom:10px;
                position: relative;
                .convertible-shade{
                    img{
                        height: 50px;
                        width: 100px;
                        position: absolute;
                        right: 15px;
                        bottom: 15px;
                    }
                }
            }
        }
        .reject{
            img{
                height:93px;
                width:93px;
            }
            p{
                width: 100%;
                text-align: center;
                height: 45px;
                line-height: 45px;
                color: #666;
                font-size: 14px;
            }
        }
    }
    .explain {
        width: 100%;
        height: 45px;
        line-height: 45px;
        padding-left: 20px;
        background-color: #fff;
        margin-bottom: 10px;
    }
    
    .explain span {
        display: block;
        float: left;
        width: auto;
        height: 45px;
        color: #ccc;
        margin-right: 5px;
    }
    
    .convertible-shade {
        background: rgba(0, 0, 0, 0.5);
        height: 100%;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }
    
    .convertible-shade img {
        position: relative;
        bottom: 0;
        right: 0;
        background-size: 50% 50%;
    }
    
    .errors {
        position: absolute;
        left: 50%;
        top: 15%;
        transform: translate(-50%, 0%);
        -webkit-transform: translate(-50%, 0%);
        width: 50%;
        height: 300px;
    }
    
    .errors-box {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        width: 300px;
        height: 150px;
    }
    .namefor{
        font-size: 0.4rem;
        text-align: center;
        padding: 0.8rem 0 0.84rem 0;
        border-bottom: 1px dashed #ccc;
        margin-bottom: 0.4rem;
        margin-top: 1rem;
            span{
                    display: block;
                    // font-size: 0.2rem;
                    padding-top: 0.2rem;
            }
    }

    .mdName{
    text-align: center;
    font-size: 0.38rem;
    color: #999;
    padding: 0.6rem 0 0rem 0;
    border-top: 1px dashed #ccc;
    }
    .btngroup{
        width: 100%;
        text-align: center;
        margin-top: 1rem;
        .comBnttn{
            display: inline-block;
            width: 4rem;
            height: 1rem;
            background: #FF9800;
            line-height: 1rem;
            border-radius: 100px;
        }
        .ofIntegraltn{
            display: inline-block;
            width: 4rem;
            height: 1rem;
            background: #ccc;
            line-height: 1rem;
            border-radius: 100px;
        }
    }
    .tips{
            position: fixed;
            top:0;
            left:0;
            height:1.0133rem;
            background-color: rgba(209, 7, 32,0.2) ;
            width: 100%;
            font-size: 0.32rem;
            color: #303030;
            text-align: center;
            line-height: 1.0133rem;
            img{
                width:0.4rem;
                height:0.3467rem; 
                position: absolute;
                margin: 0.28rem 0 0 -0.55rem;
            }
            span{
                color: rgb(211,79,93)
            }
        }
         .line{
            clear: both;
            height: 0.16rem;
            line-height: 0.16rem;
            border-bottom: 1px dashed #ccc;
        }

</style>
