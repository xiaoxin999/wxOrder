<template>
  <section>
      <img src="../../../res/images/allow.png" alt="">
      <div class='content'>
          <div>
              <img src="../../../res/images/icon_ali.png" alt="">
              <span class='ali'>&nbsp;&nbsp;支付宝</span>&nbsp;&nbsp;支付
              <div><span class='small'>选择"在&nbsp;&nbsp;</span>{{type==1?"浏览器":"Safari"}}<span class='small'>&nbsp;&nbsp;里打开"</span></div>
          </div>
      </div>
      <div class='button' @click='checkStatus'>
          支付完成后 点此看详情
      </div>
      <div class='select' @click='goback'>
          &lt;返回重选支付方式
      </div>

      <div class='tips' v-if='showTips'>
          {{tipsInfo}}
      </div>

  </section>
</template>

<script>
    
    import utils from "src/verdor/utils";
    import http from "src/manager/http";
    import global from "src/manager/global";
    import storage from "src/verdor/storage";

    export default{
        data(){
            return{
                type:1,
                t:"",
                tipsInfo:"",
                rechargeShopId:"",//回调查询shopId
                backRoute:"",//支付完成后去的页面
                getUrl:"",//获取数据的url
                checkUrl:"",//检查订单的状态的url
                formString:"",//支付宝返回的form表单
                data:"",
                oid:"",
                showTips:false,
                timer:"",
                payType:""//判断是哪里的支付宝支付的订单
            }
        },
        methods:{
            /* 检查是否是在普通的手机浏览器下 */
            async check(){

                let data = null;

                if(!this.formString){
                    data = await http[this.getUrl]({
                        data:this.data
                    });
                    
                    this.oid = data.oid;
                    this.formString = data.ali;
                    this.rechargeShopId = data.rechargeShopId;//
                }

                if(!utils.isWX()&&this.t&&process.env.NODE_ENV === 'production'){

                    let ali = this.formString;
                    let reg =  /(^<(\S|\s)*)<script>/g;
                    let m = ali.match(reg);
                    document.body.innerHTML = m&&m[0];

                    let s = document.createElement("script");

                    s.innerHTML= "document.forms['alipaysubmit'].submit()"
                    document.body.appendChild(s);
                }
            },
            async checkStatus(){
                
                let data  = await http[this.checkUrl]({
                    data:{
                        oid:this.oid,
                        shopId:this.data.shopId||this.shopId,
                        type:this.payType,
                        rechargeShopId:this.rechargeShopId 
                    }
                });

                this.showTips = false;
                if(data){

                    if(this.backRoute && this.backRoute != "false"){
                        this.$router.replace(`/${this.backRoute}`)
                    }
                    else{
                        this.showTips = true;
                        this.tipsInfo = "支付成功,3秒后关闭页面";

                    }
                }
                else{
                    this.showTips = true;
                    this.tipsInfo = "支付失败";
                }

                if(this.timer) clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                    this.showTips = false;
                    this.tipsInfo != "支付失败" && this.$closeWindow();
                },3000)
            },
            goback(){
                window.history.go(-1);
            },
            
        },
        beforeDestroy(){
            if(this.timer) clearTimeout(this.timer);
        },
        async mounted(){
            this.backRoute = this.$route.query.backRoute||"";
            this.getUrl = this.$route.query.getUrl;
            this.checkUrl = this.$route.query.checkUrl||"";
            this.payType = this.$route.query.type||"";
            
            this.data = JSON.parse(utils.uncompileStr(this.$route.query.hd));
            this.oid = this.data.oid;
            this.rechargeShopId = this.data.rechargeShopId;
            this.formString = storage.session("formString");

            this.t = utils.isMobile();
            this.type = /Android/i.test(this.t&&this.t[0])?"1":"0";
            this.check();
            
        }
    }

</script>

<style lang='less' scoped>
    section{
        height:100%;
        background-color: black;
        color:white;
        &>img{
            width:2.1333rem;
            height:2.56rem;
            position: absolute;
            right: 0.6rem;
            top: 0.5rem;
        }
        .content{
            width:4.6rem;
            position: absolute;
            top:2.2rem;
            right: 0;
            left:0;
            margin:auto;
            height:2rem;
            font-size: 0.48rem;
            color:white;
            div{
                img{
                    width:1.0667rem;
                    height:1.0667rem;
                    vertical-align: text-bottom;
                }
                .ali{
                    color:#0AAFFF;
                }
                .small{
                    font-size: 0.32rem;
                    
                }
                div{
                    margin-top: 0.1rem;
                }
            }
        }
        .button{
            height:1.2rem;
            width:8.92rem;
            border: 0.0133rem solid #979797;
            line-height: 1.2rem;
            font-weight: bold;
            font-size: 0.4rem;
            text-align: center;
            position: absolute;
            bottom:3.68rem;
            left: 0;
            right:0;
            margin: 0 auto; 
        }
        .select{
            position: absolute;
            bottom:3rem;
            left: 0;
            right:0;
            margin: 0 auto; 
            font-size: 0.32rem;
            color: #999999;
            text-align: center;
        }
        .tips{
            width:3.2rem;
            height: 0.84rem;
            line-height: 0.84rem;
            font-size: 0.3467rem;
            color: #FFFFFF;
            text-align: center;
            background: #999999;
            border-radius: 1.3333rem;
            position: absolute;
            bottom: 0;
            top:0;
            left:0;
            right:0;
            margin:auto;
        }
    }
</style>
