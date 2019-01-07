<template>
    <div id="mall-register">
        <div class="im-title">
            <div @click="pointDetail()">积分：{{userPoint}}</div><span></span>
            <div @click="toIntegralMall">兑换记录</div>
        </div>
        <div class="bgc">
            <img src="../../../res/icon/get-vip.jpg" />
        </div>
        <div class="no-vip">
            <div class="content">
                <div class="border">
                    <div class="border-content">
						<div class="top">
							<div class="img">
								<img src="../../../res/icon/grass.png" alt="" />
							</div>
							<div class="text">
								加入{{userInfo.shopName}}会员 尊享积分好礼
							</div>
						</div>
						<div class="line">
							<div class="imgs">
								<img src="../../../res/icon/line.png" />
							</div>
						</div>
						<div class="bottom">
							欢迎来到{{userInfo.shopName}}积分商城 <br />
							您的每笔消费都会获得积分<br /> 
							<template v-if="userInfo.pointConfig">
							{{cash}}元 = {{point}}积分<br />
							</template>
							在这里我们为你准备了好礼<br /> 
							快去兑换你喜欢的商品吧
						</div>
					</div>
                </div>
            </div>

            <div class="get-vip">
                <div class="line">

                </div>
                <div class="register" @click="register">
                    注册会员
                </div>
                <div class="line">
                </div>
            </div>
            <div class="get-icon" @click="toMall">
                <img src="../../../res/icon/back.png" />
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
        name: "mallRegister",
        data(){
            return {
                accessToken:"",
				userInfo: "",
				openList: false,
				userPoint: 0,
				cash: 0,
                point: 0,
                token: ''
            }
        },
        methods: {
            pointDetail(){
                var info = storage.session("userInfo");
                storage.session('membership',info);
                storage.session('type',1);
                this.$router.push("/memberIntegral");
            },
            toIntegralMall(){
                this.$router.push('/exchangeRecord')
            },
            register(){
                var info = storage.session("userInfo");
                storage.session('membership', info);
                this.$router.push("/memberRegister");
            },
            toMall(){
                this.$router.push('/newIntegralMall')
            },
            async getUserInfo(){
                let login = storage.session('login')
                if(storage.session("userInfo")) {
                    this.userInfo = storage.session("userInfo");
                    if(this.userInfo.point) {
                        this.userPoint = this.userInfo.point;
                    }
                    if(this.userInfo.pointConfig) {
                        this.cash = this.userInfo.pointConfig.cash;
                        this.point = this.userInfo.pointConfig.point;
                    }
                    
                }else{
                    let res = await http.getUserInfo({
                        data: {
                            shopId: this.shopId,
	                        type: 3,
	                        from: 0
                        }
                    })
                    this.userInfo = res;
                    if(res.point) {
                        this.userPoint = res.point
                    }
                    if(res.pointConfig) {
                        this.cash = res.pointConfig.cash;
                        this.point = res.pointConfig.point;
                    }
                    Object.assign(res,userInfo)
                    storage.session("userInfo",res)
                }
            }
        },
        mounted(){
            this.token = storage.session('token');
            this.getUserInfo();
            utils.setTitle('积分商城');
        }
    }
</script>

<style lang="less" scoped>
	#mall-register {
		width: 10rem;
		height: 100%;
		.im-title {
			width: 10rem;
			height: 1.15rem;
			background-color: #fff;
			color: #000000;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 66;
			div {
				width: 50%;
				height: 100%;
				float: left;
				text-align: center;
				line-height: 1.15rem;
			}
			span {
				width: 1px;
				height: 1.15rem;
				background-color: #666;
				position: absolute;
				top: 0;
				left: 50%;
				transform: translate(-50, 0%);
				-webkit-transform: translate(-50, 0%);
			}
		}
		.bgc {
			width: 100%;
			height: 100%;
			img {
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
			}
		}
		.no-vip {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			.content {
				width: 6.24rem;
				height: 8.88rem;
				border: 0.01rem solid #FFF;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				-webkit-transform: translate(-50%, -50%);
				.border {
					width: 5.8rem;
					height: 8.4rem;
					border: 0.08rem solid #FFF;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					-webkit-transform: translate(-50%, -50%);
                    .border-content{
						overflow: scroll;
						height: 8rem;
						.top {
						min-height: 3rem;
						width: 100%;
						.img {
							width: 1.25rem;
							height: 1rem;
							margin: 0 auto;
							margin-top: 0.5rem;
							img {
								width: 1.25rem;
								height: 1rem;
							}
						}
                        .text {
							width: 4.53rem;
							min-height: 1.2rem;
							line-height: 0.6rem;
							font-size: 0.42rem;
							color: #FFF;
							text-align: center;
							margin: 0 auto;
							margin-top: 0.2rem;
						}
					}
                    .line {
						height: 1rem;
						width: 100%;
						.imgs {
							width: 5.17rem;
							height: 1rem;
							img {
								width: 100%;
							}
						}
					}
                    .bottom {
						/*height: 4rem;*/
						width: 100%;
						text-align: center;
						line-height: 0.6rem;
						color: #FFF;
					}
					}
				}
			}
            .get-vip {
				width: 3rem;
				height: 0.5rem;
				position: absolute;
				left: 50%;
				top: 13.6rem;
				transform: translate(-50%, 0);
				-webkit-transform: translate(-50%, 0);
				color: #FFF;
				.register{
					width: 2rem;
				}
				/*background-color: red;*/
				div {
					text-align: center;
					line-height: 0.5rem;
					width: 0.5rem;
					height: 0.5rem;
					float: left;
				}
				div.line {
					width: 0.5rem;
					height: 0.02rem;
					margin-top: 0.24rem;
					background-color: #fff;
				}
			}
		}
		.get-icon {
			width: 0.93rem;
			height: 0.67rem;
			position: absolute;
			bottom: 2.5rem;
			right: 1rem;
			img {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>

