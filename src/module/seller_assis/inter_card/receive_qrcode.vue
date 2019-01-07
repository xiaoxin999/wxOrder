<template>
    <section class='inter_detail'>
        <img style='border-radius:50%' :src="getUrl(item.showImage)" alt="">
        <div class='top'>
            <div>
                <span class='name'>{{item.goodsName}}</span>
                <div class='time'>下单时间：{{getTime(item.createTime)}}</div>
                <div style='margin-top:0.2rem;' class='price'>
                    抢购价格：<em>¥{{item.price}}</em>
                </div>
            </div>
        </div>
        <section class='detail'>
            <div class='no' v-if='!isok'>
                <div class='tips'>
                    请将二维码展示给商家即可领取
                </div>
                <img :src="imgUrl" alt="">
                <div class='time_out'>二维码有效期剩余{{num}}秒</div>
                <div style= 'margin-top:0.25rem' @click='refresh'>
                    <img style = ' width:0.6rem' src="../../../res/images/sell_assis/refersh.png" alt="">
                </div>
            </div>

            
            <div class='ok' v-else>
                <img src="../../../res/images/sell_assis/success.png" alt="">
                <div class='status'>已领取</div>
            </div>

        </section>

        <section class='supple'>
            <ul>
                <li>核销门店：{{shopInfo.shopName}}</li>
                <li>营业时间：{{showTime(shopInfo.openTime)}}</li>
                <li>详细地址：{{shopInfo.address}}</li>
            </ul>
        </section>

    <section class='button'>
        
        <a style= 'width:100%' :href='url'>查看导航</a>
    </section>
    </section>
</template>


<script>
    
    import utils from 'src/verdor/utils';
    import timer from 'src/verdor/timer';
    import storage from 'src/verdor/storage';
    import http from "src/manager/http";
    import global from "src/manager/global";

    let qrcode = null;
    export default{
        data(){
            return{
                item:{},
                num:30,
                oid:0,
                fromId:0,
                shopInfo:{},
                imgUrl:'',
                timerStr:"",
                isok:false,
                url:""
            }
        },
        methods:{

            getTime(time){
                return utils.format(time,"yyyy/MM/dd hh:mm");
            },
            async getDetail(s){
                let data = await http.getShopInfoAndQrcode({
                    data:{
                        shopId:global.getShopId(),
                        type:s?1:0,
                        oid:this.oid,
                        fromId:this.fromId
                    }
                })

                this.imgUrl = qrcode.getQrBase64(data.qrcode||data, {
                    padding: 15,
                    width: 300,
                    height: 300,
                    correctLevel: QRErrorCorrectLevel.L
                });

                if(!s) {
                    this.shopInfo = data;
                    // http://api.map.baidu.com/geocoder?address=上海虹桥机场&output=html
                    this.url = `http://api.map.baidu.com/geocoder?address=${this.shopInfo.address}&output=html&src=闪店卖手`;
                    // this.url = `bdapp://map/geocoder?address=${this.shopInfo.address}`;

                    // <a href="baidumap://map/direction?address=北京市海淀区上地信息路9号奎科科技大厦">地址解析</a>
                }
                this.num = 30;
                timer.clear(this.timerStr);

                this.timerStr = timer.add(this.changeTime,1000,this.num,true,()=>{timer.clear(this.timerStr);})
            },
            refresh(){
                this.getDetail("1");
            },
            changeTime(){
                this.num--;
                http.queryOrder({
                    data:{
                        shopId:global.getShopId(),
                        oid:this.oid,
                        fromId:this.fromId
                    },
					hideLoad:true
                }).then((res)=>{
                    if(res){
                        timer.clear(this.timeStr);
                        this.isok =true;
                    }
                    
                })

            },

            showTime(arr){
                if(!arr) return "";
                let s = "";
    
                arr = arr.split(",");
                for(let item of arr){
                     
                    let second_time = (item|0)*60;
                    var time = ""; 
                    var min = parseInt(second_time / 60) % 60;  
                    var hour = parseInt( parseInt(second_time / 60) /60 ) % 24;  
                    time = ("00" + hour).substr(-2)  + "时" + ("00" + min).substr(-2)  + "分";  
                    s+= "到"+time; 

                }
                return s.substring(1);
            },
            getUrl(url){
                return global.getImgUrl({url});
            },
        },
        components:{
            
        },
        beforeDestroy(){
            timer.clear(this.timerStr);
        },
        async mounted(){
            this.item = storage.session("order_item");
            this.oid = this.item.oid;
           this.fromId = this.item.fromId;
			

			qrcode = await import(/* webpackChunkName:"jr-qrcode" */"src/verdor/jr-qrcode.js");
            this.getDetail();


            utils.setTitle("我的核销");
        }
    }

</script>

<style lang ='less' scoped>

    .inter_detail{
        width: 9.2933rem;
        height:12.52rem;
        background: #FFFFFF;
        border: 1px solid #DDDDDD;
        border-radius: .2667rem;
        position: absolute;
        top: 0;
        left:0;
        bottom: 0;
        right:0;
        margin: auto;
        &>img{
            width: 1.92rem;
            height: 1.92rem;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
        }
        .top{
            height: 3.4667rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            display: table;
            &>div{
                display: table-cell;
                vertical-align: middle;
                text-align: center;
                padding-top: 1rem;
                .name{
                   font-family: PingFang-SC-Semibold;
                    font-size: .48rem;
                    color: #303030; 
                }

                div.time{
                    text-align: center;
                    margin: 0.15rem auto;
                    font-size: 0.3467rem;
                    color: #999999;
                }
                .price{
                    font-size: 0.3467rem;
                    color: #999999;
                    em{
                        font-size: 0.4rem;
                        color: #D0021B;
                    }
                }
                .button{
                    font-family: PingFang-SC-Medium;
                    font-size: .48rem;
                    color: #FFFFFF;
                    width: 4.5067rem;
                    height: 1.0267rem;
                    line-height: 1.0267rem;
                    background: #EAC048;
                    border-radius: 1.3333rem;
                    text-align: center;
                    margin: .5333rem auto;
                }
            }
            
        }
        section.detail{
            height: 5.6rem;
            width: 8.5733rem;
            margin: 0 auto;
            border-bottom: 3px dashed  #DDDDDD;
            font-size: .3467rem;
            color: #999999;
            position: relative;
            .tips{
                font-size: 0.3467rem;
                color: #303030;
                font-weight: bold;
                text-align: center;
                margin-top: 0.3rem;
            }
           
            &>div.no{
                width: 90%;
                margin: 0 auto; 
                height: 100%;
                text-align: center;

                 &>img{
                    width:3.2rem;
                    height:3.2rem;
                    margin-top: 0.2rem;
                }   

                .content{
                    display: inline-block;
                    vertical-align: middle;
                    width: 98%;
                    text-indent: .3467rem;
                    
                }
                .time_out{
                    margin-top: 0.1rem;
                }
                
            }
            
            &>div.ok{
                width: 60%;
                margin: auto; 

                text-align: center;
                height:60%;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                img{
                    width:1rem;
                    height:1rem;
                }
                div{
                    margin-top: 0.2rem;
                    font-size: 0.48rem;
                    color: #303030;
                }
            }
            
        }   
        section.supple{

            height: 3.1333rem;
            width: 8.5733rem;
            margin: 0 auto;
            color: #999999;
            display: flex;
            align-items: center;
            padding-left: 0.3rem;
            ul{
                li{
                    font-size: 0.32rem;
                    color: #999999;
                    margin-top: 0.1rem;
                }
            }
            
            
        }   
        .button{
            background: #EAC048;
            border-radius: 1.3333rem;
            width:4.5067rem;
            height:1.04rem;
            line-height: 1.04rem;
            font-size: 0.48rem;
            color: #FFFFFF;
            position: absolute;
            left: 0;
            right:0;
            margin: -0.5rem auto;
            text-align: center;
        }
    }

</style>
