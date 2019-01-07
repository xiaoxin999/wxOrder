<template>
    <div class="brand-detail" id="brand-detail">
        <div class="swiper-container">
            <div class="swiper-wrapper">
                <div v-for="(item,i) in detailInfo.image" class="swiper-slide" :key="'-' + i" :style="{backgroundImage: 'url(' + uploadUrl + item.imageName + ')'}"></div>
            </div>
            <div class="swiper-pagination"></div>
        </div>
        <transition name="fade">
            <div class="about-win" v-if="isAbout">
                <div class="about">
                    <div class="about-header">
                        <h2>关于我们</h2>
                        <h2 class="about-size">ABOUT US</h2>
                    </div>
                    <div v-html="detailInfo.description" class="about-content"></div>
                    <a href="javascript:void(0)" class="cancel" @click="aboutFun('close')"></a>
                </div>
            </div>
        </transition>
        <a href="javascript:void(0)" class="detali-btn" @click="aboutFun">关于我们</a>
    </div>
</template>

<script>
    import storage from "src/verdor/storage";
    import utils from "src/verdor/utils";
    import http from "src/manager/http";
    import global from "src/manager/global";

    export default {
        data(){
            return {
                detailInfo : {}, //详情信息
                uploadUrl : '', // url地址
                isAbout : false, //是否显示关于我们
            }
        },
        methods:{
            aboutFun(type){
                if(type == 'close'){
                    this.isAbout = false;
                }else{
                    this.isAbout = true;
                }
            },
            async brandDetail(){
                let res = await http.brandDetail({
                    data: {
                        shopId : this.shopId,
                        id : storage.session('brandDetail').id
                    }
                })

                this.detailInfo = res;
                this.detailInfo.image = utils.sortByAll(this.detailInfo.image);
                this.detailInfo.description = this.detailInfo.description.replace(/\n/g,"<br>");

                this.$nextTick(function(){
                    new this.Swiper('.swiper-container', {
                        pagination: '.swiper-pagination',
                        slidesPerView: 1,
                        paginationClickable: true,
                        spaceBetween: 0
                    });
                })

            }
        },
        async mounted(){
            
            this.Swiper = await import (/* webpackChunkName: "swiper" */'src/verdor/swiper.min.js');

            this.uploadUrl = global.getImgUrl();
            this.brandDetail();
            
            
            
        }
    }
</script>

<style lang="less" scoped>
@import '../../res/css/swiper.min.css';
.swiper-container {
        width: 100%;
        height: 100%;
		background: #fafafa;
		padding: 0 0 40px 0;
	}
	
	.swiper-slide {
        text-align: center;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat; 
	}
	
	.swiper-pagination {
		padding: 0 15px !important;
        text-align: center !important;
        margin-bottom: 63px;
	}
.brand-detail {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; }
  .brand-detail .detali-btn {
    z-index: 10;
    position: fixed;
    left: 0;
    bottom: 0;
    display: block;
    background-color: #000000;
    width: 100%;
    height: 1.25333rem;
    line-height: 1.25333rem;
    text-align: center;
    color: #FFFFFF;
    font-size: 0.42667rem; }
  .brand-detail .brand-title {
    width: 4rem;
    height: auto;
    line-height: 0.66667rem;
    font-size: 0.42667rem;
    color: #FFFFFF;
    text-align: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 5; }
  .brand-detail .dot {
    position: absolute;
    left: 50%;
    bottom: 12%;
    transform: translate(-50%, 0);
    width: auto;
    height: 0.4rem;
    font-size: 0; }
    .brand-detail .dot span {
      display: inline-block;
      width: 0.16rem;
      height: 0.16rem;
      border-radius: 50%;
      border: 0.06667rem solid #FFFFFF;
      margin-right: 0.13333rem; }
      .brand-detail .dot span:last-child {
        margin-right: 0; }
      .brand-detail .dot span.cur {
        background-color: #FFFFFF; }
  .brand-detail .about-content {
    width: 100%;
    height: 5.06667rem;
    line-height: 0.66667rem;
    text-align: center;
    color: #FFFFFF;
    font-size: 0.32rem;
    overflow: auto; }
  .brand-detail .about-win {
    position: fixed;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100%;
    height: 100%;
    z-index: 66;
    overflow: hidden; }
  .brand-detail .about {
    width: 7.86667rem;
    height: 9.6rem;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    box-sizing: border-box;
    padding: 1.06667rem 1.33333rem; }
    .brand-detail .about .about-header {
      width: 100%;
      height: 2rem;
      font-size: 0.42667rem;
      line-height: 0.8rem;
      text-align: center;
      color: #FFFFFF;
      position: relative; }
      .brand-detail .about .about-header:after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 10%;
        width: 100%;
        height: 0.01333rem;
        background: linear-gradient(to top right, #1f1d1d, #fff, #1f1d1d);
 }
    .brand-detail .about .cancel {
      position: absolute;
      left: 50%;
      bottom: -20%;
      transform: translate(-50%, 0);
      -webkit-transform: translate(-50%, 0);
      width: 1.6rem;
      height: 1.6rem;
      display: block;
      background: url(../../res/images/cancel.png) center center no-repeat;
      background-size: 1.4rem 1.4rem;
      z-index: 99; }
  .brand-detail .about-size {
    font-size: 0.34667rem;
    font-weight: bold; }

/*# sourceMappingURL=brand-detail.css.map */

</style>

