<template>
    <section class='choose_shop'>
        <section class="chooseList">
            <div>
                <img :src="getUrl(applicationStoreDetail.logoImage)" alt="">
            </div>
            <ul>
                <li><div class="text-over name_div">{{applicationStoreDetail.name}} </div><span class="distance">{{changeKm(distance)}}</span></li>
                <li>营业时间：{{applicationStoreDetail.openTime}} - {{applicationStoreDetail.closeTime}}</li>
            </ul>
            </section>
                <p><span class="address_span">详细地址 : {{applicationStoreDetail.address}}</span>
                    <a :href="addressMap"><span class="xian">|</span>
                    <img src="../../res/images/sell_assis/address_icon.png" alt="">
                    </a>
                </p>
                <p class="brother_p"><span class="address_span">商家电话 : {{telephone}}  </span> <a :href="'tel:'+telephone"><span class="xian">|</span>
                <img src="../../res/images/sell_assis/phone_icon.png" alt="">
                </a></p>
        
    </section>
</template>


<script>
    import utils from 'src/verdor/utils';
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import timer from 'src/verdor/timer';
    import storage from "src/verdor/storage";
    import Vue from 'vue';
    let map = null;
    export default{
        data(){
            return{
                applicationStoreDetail:{},
                membership:{},//缓存的membership
                name:"",
                logoImage: "",
                openTime:"",
                closeTime:"",
                address:"",
                shopList:[],
                id:this.$route.query.id,
                telephone:"",
                lng:"",
                lat:"",
                distance:"",
                addressMap:"",
                brandId:""
            }
        },
        created(){
            
        },
        methods:{
            jumpMap(){
                this.$router.push('/mapCompent');
            },
            getUrl(url){
                return global.getImgUrl({url})
            },
            changeKm(d){
                return utils.changeKmee(d);
            },
            async normoalShopDetail(){
                let index = 0;
                if(this.shopList.length == 0) return ;

                this.applicationStoreDetail = this.shopList.filter((item,i)=>{
               
                    if(item.id == this.$route.query.id){
                        index = i;
                        this.openTime=this.getTime(item.openTime)
                        this.closeTime=this.getTime(item.closeTime)
                        this.position = item.position;
                        this.distance = item.distance;
                        this.telephone = item.telephone;
                        let firstPoint = this.position.split(',');

                        this.lng = firstPoint[0];
                        this.lat = firstPoint[1];
                        this.address = item.address;
                        this.addressMap = `http://api.map.baidu.com/geocoder?address=${this.address}&output=html&src=闪店卖手`
                         Vue.set(this,'distance',"定位中...");

                        if(this.position == null || this.position == ""){  
                            this.distance = ""
                        }else{
                            map.distanceMap({secondPoint:{lng:this.lng,lat:this.lat}}).then((data)=>{
                                this.distance = data;
                            })
                        }  

                        return true;
                    }
                    return false;
                })[0];                  
               
            },
            getTime( second_time ){
                 return utils.toHourMinute(second_time);
                }
            },
            async mounted(){
                //引用高德地图
                map = await import(/* webpackChunkName:"map" */"src/manager/map");
                map = map.default;
                await map.getMapSDK();
                this.shopList = storage.session("applicationStoreDetail");
                this.applicationStoreDetail = storage.session("applicationStoreDetail");
                this.getTime();
                this.id = this.$route.query.id;
                
                this.normoalShopDetail();
                utils.setTitle("适用门店详情")
            }
    }
</script>

<style lang='less' scoped>
    .choose_shop{
        height: 100%;
        background: #fff;
        position: relative;
        top: -0.22rem;
        .chooseList{
            width: 93%;
            height: 2.42rem;
            line-height: 2.42rem;
            margin: 0 auto;
            padding-top: 0.22rem;
            &>div{
                margin: 0 auto;
                img{
                width: 1.8rem;
                height: 1.8rem;
                border-radius: 100%;
                float: left;
                line-height: 2rem;
                text-align: center;
                border: 1px solid #ddd;
                margin: 0.22rem;
                } 
            }
            ul{
                li{
                    line-height: 0.66rem;
                }
                li:nth-child(1){
                    font-size: 0.4rem;
                    color: #303030;
                    font-weight: 600;
                    margin-top: 0.422rem;
                    position: relative;
                    .name_div{
                        width: 5rem;
                    }
                    span{
                        float: right;
                        margin-right: 0.2rem;
                        font-size: 0.32rem;
                        color: #EAC048;
                        font-weight: 500;
                        position: absolute;
                        top: 0;
                        right: 0rem;
                    }
                }
                li:nth-child(2),li:nth-child(3){
                    color: #999;
                    font-size: 0.32rem;
                        
                }
                li:nth-child(3){
                    position: relative;
                    span{
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            width: 80%;
                            display: inline-block;
                    }
                    .dy{
                        float: right;
                        width: 0.3rem;
                        height: 0.3rem;
                        color: #333;
                        border: 1px solid #aaa;
                        transform: rotate(45deg);
                        -ms-transform: rotate(45deg);
                        -moz-transform: rotate(45deg);
                        -webkit-transform: rotate(45deg);
                        -o-transform: rotate(45deg);
                        border-bottom: 0;
                        border-left: 0;
                        position: absolute;
                        right: 3%;
                        bottom: 30%;
                    }
                }
                
            }

        }
            p{
                text-align: left;
                width: 100%;
                height: 1.24rem;
                line-height: 1.24rem;
                float: left;
                font-size: 0.3733rem;
                background: #fff;
                margin-bottom: 0.04rem;
                color: #999;
                padding-left: 0.68rem;
                border-top: 0.1333rem solid #f2f2f2;
                .address_span{
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        width: 7rem;
                        display: inline-block;
                }
                a{
                   float: right;
                    width: 2rem;
                    position: relative;
                    right: 0.2rem;
                        img{
                        width:0.42rem;
                        vertical-align: middle;
                        position: absolute;
                        top: 0.34rem;
                        
                }
               span{
                    display: inline-block;
                    width: 0.6rem;
                    color: #eaeaea;
                    font-size: 0.52rem;
               }
            }
            
            }
            P.brother_p{
                // border-bottom: none;
                border-top: 1px solid #f2f2f2;
                a{
                  float: right;
                    width: 2rem;
                    position: relative;
                    right: 0.2rem;
                img{
                    width: 0.52rem;
                    vertical-align: middle;
                    position: absolute;
                    top: 0.38rem;
                }
                span{
                       display: inline-block;
                        width: 0.6rem;
                        color: #eaeaea;
                        font-size: 0.52rem;
               }
            }
            }
    }

</style>


