<template>
<div class="container" id="app" v-cloak>
    <header>
        <span>
            <div class="items">
                <img src="../../../res/images/icno1.png" class="fl" alt="积分" />
                <span class="fl"><span class="labels">{{point}}</span>&nbsp;积分</span>
            </div>
        </span>
        <span>
            <div class="items" @click="openRecord">
               <img src="../../../res/images/icon3.png" class="fl" alt="兑换记录" />
               <span class="fl">兑换记录</span>
            </div>
        </span>
    </header>
	<div class="contenr">
	    <div class="swiper-container" v-show="bannberList.length >= 1">
	        <div class="swiper-wrapper">
	            <div class="swiper-slide" v-for="(item,index) in bannberList" :key="index"><img :src="hostImg + bannber.fileName" :alt="item.bannerName" /></div>
	        </div>
	    </div>
	    <div class="affiche helpsb">
	        <!--<p>每邀请一个好友就会增加<b class="labels">{{spreader}}</b>积分哦</p>-->
	        <p id="js-shopNotice"></p>
	    </div>
	    <div class="comBox">
	        <div class="comHead">
	            <span>积分商品兑换</span>
	        </div>
	        <div class="comConter">
	            <div v-for="(goods,i) in goodLists" :key="i">
	                <div class="imgBox">
						<span class="tip" v-if="goods.type == 1"   @click="openDet(goods,goods.id)"><img src="../../../res/images/sell_assis/mdgood_2.png" alt=""></span>
						<span  class="tip" v-if="goods.type == 0"  @click="openDet(goods,goods.id)"><img src="../../../res/images/sell_assis/ppgood_2.png" alt=""></span>
			
	                    <img v-bind:src="hostImg + goods.imageName" v-if="goods.type == 1"   @click="openDet(goods,goods.id)"/>
	                    <img v-bind:src="hostImg + goods.imageName" v-if="goods.type == 0"  @click="openDet(goods,goods.id)"/>
	                </div>
	                <div class="comInfo">
	                    <div class="comTitle">{{goods.name}}</div>
	                    <div class="comNum">
	                        <div>
	                            <p class="fk" v-if="Number(goods.cash)>0">{{goods.price}}积分+{{goods.cash}}元</p>
	                            <p class="fk" v-if="Number(goods.cash)==0">{{goods.price}}积分</p>
	                        </div>
	                    </div>
	                    <div class="comNum otherlist">
	                        <div>
	                            <p class="fk fll">剩余{{goods.inventory}}份</p>
	                        </div>
	                    </div>
						<div class="comFooter" v-if="Number(goods.inventory) == 0">
	                        <p >商品数量不足！</p>
	                    </div>
						<div class="comFooter" v-if=" Number(goods.inventory) > 0 && point < Number(goods.price)">
	                        <p>现有积分不足,快去赚吧！</p>
	                    </div>
	                </div>
	            </div>
	        </div>
	    </div> 
	</div>
</div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';

	export default {
		name: 'mainbody',
		data() {
			return {
                goodLists: [],
                hostImg: [],
                point: null,
                spreader: [],
                loaddding: true,
                bannberList: [], 
                shopNotice: [],
                version:'',
				shopId: 0,
				cash:'',//金额
			}
		},
		beforeRouteEnter (to, from, next) {
			let {pointStyle} = storage.session('login');
			if (pointStyle == 0){
				global.router.replace("/newIntegralMall"); 
				next();
				return;
			}
			next();
		},
		methods: {
			openRecord(){//记录
                this.$router.push('/record')
			},
			openDet(goods,id){ //如果是品牌--->详情 
				storage.session('userInfo');
				storage.session('goodsInfo',goods);
                this.$router.push({path:'/detail',query: {'comId':id,type:goods.type,d:1}}); //type 0 品牌 1 门店 
			},
			async get(shopId) {
				let loginInfo = storage.session('login');
                
                let res = await http.getUserInfo({
                	data: {
                		shopId: shopId,
                        type: 3,
	                    from: 0
                	}
				})
                Object.assign(res,loginInfo); 
                this.point = res.point;  

                storage.session('userInfo',res);
                this.comList(); 
			},
			async comList(){
				let data = await http.getListByWeixin({
					data:{
						shopId: this.shopId,
                        page: 1,
                        num: 500
					}
				})
                this.goodLists = data.list;  
			}
		},
		mounted(){
			let userDate = storage.session('userInfo');
			let shopId = utils.getQueryString('shopId')||10062;
			this.shopId = shopId;
            this.hostImg = global.getImgUrl();  
			
            if(userDate) {
                this.point = userDate.point;  
				this.spreader = userDate.spreader;
				if (userDate.shopNotice != null) {
					this.shopNotice = utils.line2br(userDate.shopNotice);
				}
				this.comList()
            }else{
                this.get(shopId)
			}
			utils.setTitle('积分商城');
		}
	}
</script>

<style lang="less" scoped>
	.container{
        padding-top: 50px;
        .contenr{
            .helpsb{
            	height: auto;
            	p{
            		height: auto;
					padding: 0 20px;
            	}
            }
            .otherlist{
				margin-bottom: 5px;
				
			}
			.comBox .comConter>div .imgBox{
				span.tip{
					    width: 22%;
						display: inline-block;
						position: absolute;
						background: none;
						img{
                            position: relative;
                            background: none;
								
						}
				}
			} 
		}
	
	}
.container .contenr .comBox .comConter .comInfo .comNum{
	height: 20px;
}
.container .contenr .comBox  .comConter>div{
	height:190px;
}
.container .contenr .comBox .comConter .comInfo .comNum div{
	width: 100%;
}
.fk{
	color: #fec270;
	text-align: center;
	float: none;
	border-bottom:0.4rem;
	font-size: 0.4rem;
	font-size: 0.36rem;}
.fll{
	color:#999;
	}
.container .contenr .comBox .comConter .comInfo .comTitle{
	font-size: 0.38rem;
}
</style>