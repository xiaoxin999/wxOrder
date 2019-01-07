<template>
   <div class="reminderWrap">
		<div class="reminder-pic">
			<img src="../../../res/icon/mall-success.png"/>
		</div>
		<div class="remindertext">
			<div class="text1">恭喜您兑换成功！</div>
			<div class="text2">({{name}})</div>
		</div>
		<div class="backButton">
			<div class="bt1" @click="toExchange"> <span> 查看兑换商品</span></div>
			<div class="bt2" @click="toMall"><span>返回积分商城</span></div>
		</div>
	</div>
</template>

<script>
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';
    
    export default {
        name: 'exchangeSuccessful',
        data(){
            return {
                name:storage.session("goodsInfo").name,
                goodsType:storage.session("goodsInfo").goodsType
            }
        }, 
        methods: {
            toExchange(){
                if(this.goodsType == '0'){
                    let {pointStyle} = storage.session('login');
                    if(pointStyle != 1){
                        this.$router.push("/exchangeRecord");
                    }else{
                        this.$router.push("/record");
                    }  
                }else if(this.goodsType == '1'){
                    this.$router.push("/coupon")
                } 
            },
            toMall(){ 
                let {pointStyle} = storage.session('login');
                if (pointStyle != 1){
                  this.$router.push("/newIntegralMall"); 
                } else{
                    this.$router.push("/intergralMall"); 
                }
            }
        },
        mounted(){ 
            utils.setTitle('积分商城');
        }
    }
</script>

<style lang="less" scoped>
    * {
		margin: 0;
		padding: 0;
	}
	body {
		width: 100%;
		height: 100%;
		/*font-size: 62.5%;*/
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		-webkit-user-select: none;
	}
	
	.reminderWrap {
		width: 100%;
		height: auto;
		position: absolute;
		top: 24%;
	}
	
	.reminder-pic {
		width: 2.5rem;
		height: 2.5rem;
		margin: auto;
		background-color: #f1eeee;
		border-radius: 50%;
	}
	
	.reminder-pic>img {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	
	.remindertext {
		width: 100%;
		height: 1rem;
		text-align: center;
		overflow: hidden;
		margin: 1.5rem 0 2.5rem 0;
	}
	
	.text1 {
		width: 100%;
		height: 0.5rem;
		font-size: 0.4rem;
		line-height: 0.5rem;
	}
	
	.text2 {
		width: 100%;
		height: 0.5rem;
		font-size: 0.4rem;
		line-height: 0.5rem;
	}
	
	.backButton {
		width: 8rem;
		height: 1.2rem;
		/*background-color: yellow;*/
		margin: auto;
	}
	
	.bt1,
	.bt2 {
		float: left;
		width: 50%;
	}
	
	.bt1>span,
	.bt2>span {
		display: block;
		width: 3.5rem;
		height:1.2rem;
		font-size: .4rem;
		text-align: center;
		line-height: 1.2rem;
	}
	
	.bt1>span {
		background-color: #d7d7d7;
		float: left;
	}
	
	.bt2>span {
		background-color: #000000;
		color: #fff;
		float: right;
	}
</style>
