<template>
    <div class="code" id="code">
        <div class="goodsName">{{info.gname}}</div>
         <div class="goodsCode">券码编号：{{info.code}}</div>
        <div class="img">
            <img :src="imgUrl"/>
        </div>
       
        <ul class="appliymd">
            <li>适用门店</li>
            <li><a :href="addressMap || nowAddress" class="">{{shopName || infoData.shopName}}</a></li>
        </ul>
        <div class="goodsTime">有效期</div>
        <div v-if="info.expire != 0">{{info.createTime | transformTime}}至{{info.expire | transformTime}}</div>
        <div v-else>永久</div>
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';
    export default {
        name: 'exchangeCode',
        data(){
            return {
                info:this.$route.query.id==1?storage.session("mall-codes"):storage.session("mall-code"),
                imgUrl: '',
                shopList:[],
                shopName:'',
                shopIdd:this.$route.query.shopId,
                addressMap:'',
                addressShop:'',
                id:this.$route.query.id,
                infoData:'',
                nowAddress:'javascript:void(0);'
            }
        },
        methods: {
            async getUrl(){
                let res = await http.getExchangeQR({
                    data: {
                        shopId: this.shopId,
                        code: this.$route.query.id==1?storage.session("mall-codes").code:storage.session("mall-code").code
                    }
                })
                this.imgUrl = res.url;
            },
            getShopName(){
                this.shopList = this.shopList.map((item) =>{
                    console.log(item,'i');
                    if(this.shopIdd == item.id){
                        this.shopName = item.name;
                        this.addressShop =item.address;
                        this.addressMap = `http://api.map.baidu.com/geocoder?address=${this.addressShop}&output=html&src=闪店卖手`
                    }
                    return item;
                })
            },
        },
        filters: {
            transformTime(time){
                return utils.format(new Date(Number(time) * 1000),'yyyy-MM-dd');
            }
        },
        mounted(){

            this.getUrl();
            this.shopIdd = this.$route.query.shopId;
            // this.infoData = this.$route.query.id == 1?storage.session('wxInfo'):storage.session('userInfo');
            // this.shopList = this.$route.query.id == 1? storage.session('wxInfo').shopList : storage.session('userInfo').shopList ;

            this.infoData = storage.session('userInfo');
            this.shopList = storage.session('userInfo').shopList ;
            
            this.getShopName();
            utils.setTitle("查看劵码");
            
        }
    }
</script>

<style lang="less" scoped>
    html,body{
		background-color: #fff;	
	}
	.code{
		width: 100%;
        height: 100%;
        .goodsName{
            margin-top: 2rem;
            font-size: 0.6rem;
        }
        .goodsCode{
            margin-top: 0.5rem;
            font-size: 0.3rem;
        }
        .goodsTime{
            margin-top: 1.5rem;
        }
        div{
            float: left;
            width: 10rem;
            font-size: 0.4rem;
            height: 1rem;
            line-height: 1rem;
            text-align: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        div.img{
            width: 4.8rem;
            height: 4.8rem;
            margin-left: 2.6rem;
            margin-top: 1rem;
            img{
                width: 100%;
                height: 100%;
            }
        }
    }
    .appliymd{
            clear: both;
            width: 80%;
            margin: 0 auto;
            font-size: 0.3rem;
            position: relative;
            top: 0.6rem;
    li{
            height: 1rem;
            border: 1px solid #aaa;
            border-left: none;
            border-right: none;
            line-height: 1rem;
            font-size: 0.3rem;
    }
    li:first-child{
    border-top: 1px dashed #aaa;
    };
    li:nth-child(2){
        border-top: none;
        a{
            color: #333;
        }
    }
    }
</style>

