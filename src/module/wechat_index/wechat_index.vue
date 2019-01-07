<template>
<div id="wechat-index">
	<div class="bg" :style="styleBg">
		<div class="mesking">
			<div class="header">
				<div class="logo">
					<div class="img" style="width: 2.6rem;height: 2.6rem;">
						<img :src="info.logoImage" style="width: 100%;height: 100%;"/>
					</div>
				</div>
			</div>
			<div class="texts">
			{{welcome}}
			</div>
			<div class="content" :style="styleWidth">
                <template v-for="(i,index) in info.menu">
                    <div class="options" :key="index" @click="ToOtherPage(i)">
                        <div class="imgs-icon">
                            <img :src="i.image" />
                        </div>
                        
                        <div class="wi-name">
                            {{i.name}}
                        </div>
                    </div>
                </template>
            </div>
		</div>
	</div>
</div>
</template>
<script>
import storage from "src/verdor/storage";
import utils from "src/verdor/utils";
import http from "src/manager/http";
import global from "src/manager/global";

const obj = {
    img0:require("../../res/index/icon_0.png"),
    img1:require("../../res/index/icon_1.png"),
    img2:require("../../res/index/icon_2.png"),
    img3:require("../../res/index/icon_3.png"),
    img4:require("../../res/index/icon_4.png"),
    img5:require("../../res/index/icon_5.png"),
    img6:require("../../res/index/icon_6.png"),
    img7:require("../../res/index/icon_7.png"),
    img8:require("../../res/index/icon_8.png"),
    img9:require("../../res/index/icon_9.png"),
    img10:require("../../res/index/icon_10.png"),
    img11:require("../../res/index/icon_11.png"),
    img12:require("../../res/index/icon_12.png"),
    img13:require("../../res/index/icon_13.png"),
    img15:require("../../res/index/icon_15.png"),
}
const iconBg = require('../../res/icon/index.jpg');
let code = utils.getQueryString("code")||'test';
let auth_code = utils.getQueryString("auth_code")||'test';

export default {
  data() {
    return {
      info: [],
      uploadUrl: "",
      styleWidth: {
        width: "6.79rem"
      },
      welcome: "",
      urlAddress: "",
      styleBg:{}
    };
  },
  methods: {
    ToOtherPage: function(item) {
      if (item.url && item.type && item.type != "") {
        window.location.href = item.url;
      }
    },
    getImgUrl: function(type) {
      return "res/index/icon_" + type;
    },
    getWelcome: function(type) {
      this.welcome = type.replace(/\n/g,"");
    },
    async getHomePageConfig() {
 
        let data = await http.getHomePageConfig({data:{
            shopId: this.shopId
        }});
        var bgUrl = this.uploadUrl;
        bgUrl += data.bgImage? data.bgImage : iconBg;
        
        this.styleBg = {
            'background': "url(" + bgUrl + ") center center no-repeat",
            "background-size": "100%"
        };

        for(let i = 0; i < data.menu.length; i++ ){
            let item  = data.menu[i];
            if(!item.image){
                item.image = obj['img' + item.type];
            }else{
                item.image = this.uploadUrl + item.image;
            }
        }

        this.info = data;

        this.getWelcome(data.welcome);
        data.logoImage = this.uploadUrl + data.logoImage;
    },
    async getUserInfo() {
       let login = storage.session('login');
        
        let data = http.getUserInfo({data:{
            shopId: this.shopId,
            code: code,
            type: 1,
            auth_code:auth_code
        }});
        Object.assign(data,login);
        storage.session("userInfo", data);
        this.getHomePageConfig();
    }
  },
  mounted() {

    let loginInfo = storage.session('userInfo');
    this.uploadUrl = global.getImgUrl();
    if(loginInfo){
        this.getHomePageConfig();
    }else{
        this.getUserInfo();
    }
  }
};
</script>
<style lang="less" scoped>
@import '../../res/css/base.less';
#wechat-index{
    .box(10rem,100%);
    .bg {
        .box(10rem,100%);
        background-size: cover!important;  
        .mesking {
            .box(100%,100%);            
            position: fixed;
            top: 0;
            left: 0;
            .header {
                .box(10rem,4rem);
                margin-top: 2.2rem;
                position: relative;
                .logo{
                    .box(3rem,3rem);
                    border-radius: 50%;
                    border: solid 2px #FFF;
                    margin: auto;
                    overflow: hidden;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    -webkit-transform: translate(-50%, -50%);
                    .img {
                        .box(3rem,3rem);
                        border-radius: 50%;
                        border: solid 2px #FFF;
                        margin: auto;
                        overflow: hidden;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        -webkit-transform: translate(-50%, -50%);
                    }
                }

            }
            .texts {
                box-sizing: border-box;
                padding-right:.1rem;
                width: 6rem;
                margin: auto;
                color: #FFF;
                text-align: center;
                line-height: 0.5rem;
            }
            .content {
                .box(6.86rem,4.5rem);
                margin: auto;
                margin-top: 0.5rem;
                text-align: center;
                .options {
                    .box(2.1rem,2.1rem);
                    border: 1px solid #FFF;
                    float: left;
                    margin: 0.05rem;
                    color: #FFF;
                    overflow: hidden;
                    position: relative;
                    .imgs-icon{
                        .box(2.1rem,2.1rem);
                        position: absolute;
                        left: 0;
                        img{
                            .box(100%,100%);
                        }
                    }
                    .wi-name{
                        box-sizing: border-box;
                        padding-right:.1rem;
                        .box(100%,1rem);
                        line-height: 1rem;
                        text-align: center;
                        position: absolute;
                        bottom: 0rem;
                        left: 0;
                    }
                }
            }
            .center{
                overflow: hidden;
                width: auto;
                display: inline-block;	
            }
        }
    }
}
</style>

