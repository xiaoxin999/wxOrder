<template>
	<section class="membership-info" id="membership-info" v-cloak style="overflow: hidden;">
		<header>
			<div>
				<div class='left'>
					<div class='top'>
						<span class='title'>{{name}}</span>
						<span class='button' @click="openPersonal()">修改资料</span>
						<div>您好！{{shopName}}的会员！</div>
					</div>
				</div>
				<img :src="headSculpture" alt="">
			</div>
		</header>
		<section class='num'>
			<div class='info' @click="openIntegralAndBalance('1')">我的积分：{{memberInfo.point}}</div>
			<div class='spilt'></div>
			<div class='info' @click="openMemberCards()">我的优惠券：{{couponNum}}</div>
		</section>
		<section class='card'>
			<div :class='{center:cardList.length==1}'>
				<div class="mall-swiper-container">
					<div class="swiper-wrapper">

						<div class='cardItem swiper-slide' :style="{'background-color':item.color,'background-image':item.url!=undefined?'url('+item.url+')':'','background-repeat': 'no-repeat','background-size':'100% 100%'}" v-for="(item,index) in cardList" :key='index'>
							<div class='title s' style='opacity:0'>{{item.name}}</div>
							<div class='number s'>NO.{{item.memberType == 1?(item.cardNumber.replace(/-/g,"")):item.mobile}}</div>
							<div class='type s'>{{item.cardTypeName}}</div>
							<div class='money s'>余额：{{item.memberType==1?item.cardAmount:item.totalAmount}}</div>
							<img @click='showQrCode()' src="../../res/images/qrcode_white.png" alt="">
						</div>


					</div>
				</div>
			</div>

		</section>
		<section class='legalRight'>

			<div>
				<div @click='show'>会员权益<img v-if="currentCard.memberType == 0&&interests.length>0" ref='rot' class='rotate' src="../../res/images/sell_assis/back_icon.png" /></div>
				<ul class="liLast">
					<li v-for='(item,index) in currentCard.legal' :key='index' @click='applicationStore(index)' :class="{'text-over':currentCard.legal.length==1}"><span>.</span>{{item}}</li>
				</ul>

			</div>

		</section>
		<section class='multi-entry'>
			<div>
				<ul>
					<li>
						<router-link to='memberCenterOrderData'>
							<div class='top'>
								<img src="../../res/images/order_icon.png" alt="">
							</div>
							<div>我的订单</div>
						</router-link>
					</li>
					<li>
						<router-link to='coupon'>
							<div class='top'>
								<img src="../../res/images/coupon_icon.png" alt="">
							</div>
							<div>优惠券</div>
						</router-link>
					</li>
					<li>
						<router-link to='interCard'>
							<div class='top'>
								<img src="../../res/images/inter_card_icon.png" alt="">
							</div>
							<div>积分卡</div>
						</router-link>
					</li>
					<li @click="toMall">
						<a>
							<div class='top'>
								<img src="../../res/images/inter_mall_icon.png" alt="">
							</div>
							<div>积分商城</div>
						</a>
					</li>
					<li>
						<router-link to='nearbyStore'>
							<div class='top'>
								<img src="../../res/images/shop_list_icon.png" alt="">
							</div>
							<div>门店列表</div>
						</router-link>
					</li>
					<!-- 会员攻略 -->
					<li>
						<router-link to='memberStrategy'>
							<div class='top'>
								<img src="../../res/images/strategy-guan.png" alt="">
							</div>
							<div>会员说明</div>
						</router-link>
					</li>
					<li @click='integral'>
						<a>
							<div class='top'>
								<img src="../../res/images/inco_icon.png" alt="">
							</div>
							<div>交易记录</div>
						</a>
					</li>
					<li>
						<router-link to='recharge'>
							<div class='top'>
								<img src="../../res/images/recharge_icon.png" alt="">
							</div>
							<div>充值</div>
						</router-link>
					</li>
				</ul>
			</div>

		</section>
		<transition name='fade'>
			<section class='qrcode' v-if='showQr'>
				<div>
					<img class='qr' :src="qrcodeUrl" alt="">
					<img class='close' @click='closeQr()' src="../../res/images/member_close.png" alt="">
				</div>
			</section>
		</transition>

	</section>
</template>
<script>
	import storage from "src/verdor/storage";
	import utils from "src/verdor/utils";
	import http from "src/manager/http";
	import global from "src/manager/global";

	export default {
		data() {
			return {
				memberInfo: {}, //会员信息
				level: {}, //会员等级
				uploadUrl: "", //url
				levelImg: {}, //会员背景url
				qrcodeUrl: "", //二维码url
				levelName: "", //会员等级
				cardsLenth: '', //卡数量
				openId: '', //openId
				memberCardsInfo: "", ///会员卡信息
				headSculpture: '', //头像
				shopName: '',
				showLegal: false,
				showQr: false,
				cardList: [],
				couponNum: 0,
				shopList: [],
				name: "",
				currentCard: {}, //当前的卡片
				interests: [],
				color: ["#C8E9F8", "#F8C8C9", "#F8E2C8"],
				shopId: "",
				brandId: "",
				pointStyle: 1,
			};
		},
		// applyShopIds
		methods: {
			toMall() {
				if (this.pointStyle == 1) {
					this.$router.push("/intergralMall");
				} else {
					this.$router.push("/newIntegralmall");
				}
			},
			// 跳转适用门店
			applicationStore(index) {
				if (index === this.currentCard.legal.length - 1) {
					this.$router.push({
						path: "/applicationStore",
						query: {
							id: 1
						}
					})

				}
			},
			integral() {
				if (this.cardList.length > 1) {
					storage.session("memberCard", {
						card: this.cardList,
						num: this.couponNum
					})
					this.$router.push("/memberCards");
				} else {
					storage.session('type', 2);
					storage.session("card", this.currentCard);
					this.$router.push('/memberIntegral');
				}
			},
			showQrCode() {
				this.getMemberQrCode();
				this.showQr = true;
			},
			closeQr() {
				this.showQr = false;
			},
			async getMemberQrCode() {
				let datas = storage.session("membership")
				let data = await http.getMemberQrCode({
					data: {
						shopId: datas.shopId,
						mobile: datas.member.mobile,
						openId: datas.member.openId,
						mid: datas.member.memberId
					}
				});
				this.qrcodeUrl = global.host + "common/qrcode?format=json&text=" + data + "&" + "size=10";
			},
			openPersonal: function() {
				this.$router.push('/personalInfo');
			},
			openMemberCards() {
				this.$router.push('/coupon');
			},
			openIntegralAndBalance(type) {
				// 跳转至积分 and 余额页面 根据type判断 1为积分 2为余额
				storage.session('type', type);
				this.$router.push("/memberIntegral");
			},
			show() {
				if (this.currentCard.memberType == 1 || this.interests.length == 0) return;
				let rot = this.$refs.rot;
				let classN = rot.className;
				if (classN == 'rotate') {
					rot.className = "res-rotate";
					this.currentCard.legal = utils.deepCopy(this.currentCard.tempHide);
				} else {
					rot.className = 'rotate';
					this.currentCard.legal = [utils.deepCopy(this.currentCard.tempHide)[0]]
				}
			},
			transFormData(t) {
				// 转换时间
				var d = new Date(Number(t + "000"));
				return utils.format(d, "yyyy-MM-dd");
			},
			getShopName(list) {
				console.log(list, 'list')
				let num = 0;
				for (let item of list) {
					item.color = this.color[num % 3];
					item.cardTypeName = item.memberType == '0' ? this.level.name : item.cardTypeName;
					item.bgimg = item.memberType == '0' ? this.level.name : "";

					if (item.memberType == '0') {
						let id = this.memberInfo.levelId;
						let url = this.memberInfo.levelList.filter((item) => {
							return item.id == id;
						})[0].imgName;
						item.url = global.getImgUrl({
							url
						});
					}

					let shopName = "";
					this.$set(item, 'legal', []);
					if (item.applyShopIds) {
						let arr = item.applyShopIds.split(",");
						console.log(arr);
						storage.session("arrApplyShopIds", arr);
						arr.forEach((item) => {
							for (let n of this.shopList) {
								if (n.id == item) {
									shopName += "," + n.name;
								}
							}
						})
					} else {
						let arr = global.getNormalShop(this.shopId, this.brandId, this.shopList);
						for (let n of arr) {
							shopName += "," + n.name;

						}
					}

					// item.legal = ["适用门店:"+shopName.substring(1)];
					// item.tempHide = ["适用门店:"+shopName.substring(1)];
					item.legal = ["查看适用门店"];
					item.tempHide = ["查看适用门店"];
					if (item.memberType == '0') {
						item.tempHide.unshift(...this.interests);
						item.legal = [item.tempHide[0]];
					}

					num++;
				}
			},
			getCard() {

				if (this.cardList.length > 1) {

					// setTimeout(()=>{
					this.$nextTick(() => {
						let space = 20;
						var swiper = new Swiper('.mall-swiper-container', {
							slidesPerView: 1.2,
							spaceBetween: space,
							centeredSlides: true,
							onSlideChangeEnd: (swiper) => {
								let legal = this.currentCard.legal;
								if (legal.length > 1) legal.splice(0, legal.length - 1);
								this.currentCard = this.cardList[swiper.activeIndex];

							},
							onSlideChangeStart: (swiper) => {
								let rot = this.$refs.rot;
								if (rot && this.currentCard.memberType == 0 && rot.className == 'res-rotate') {
									this.$refs.rot.className = 'rotate';
								}

							}

						});
					})
					// },50)



				}
			}
		},
		async mounted() {
			this.Swiper = await import ( /* webpackChunkName: "swiper" */ 'src/verdor/swiper.min.js');
			this.pointStyle = storage.session('login').pointStyle;
			let datas = storage.session("membership");

			this.name = datas.member.name;
			this.memberInfo = datas.member; //取出session中的信息

			this.level = this.memberInfo.level;
			this.cardList = datas.cardPackage;
			if(this.cardList.length>0){
				this.currentCard = this.cardList[0];
			}
			
			this.shopList = datas.shopList;
			storage.session("shopList", this.shopList)
			let inter = (datas.member && datas.member.level && datas.member.level.interests) || "";
			this.interests = inter.length > 1 ? inter.split('!#!') : []; //卡权益
			this.shopId = this.memberInfo.shopId;
			this.brandId = this.memberInfo.brandId;

			this.getShopName(this.cardList);
			this.getCard();


			this.couponNum = datas.couponNum;

			this.shopName = datas.shopName;
			this.uploadUrl = global.getImgUrl();
			this.headSculpture = datas.imageUrl;
			this.memberInfo.createTime = this.transFormData(this.memberInfo.createTime)
			if (this.level != undefined) {
				this.levelImg = this.uploadUrl + this.level.imgName;
				this.levelName = this.level.name;
			}
			utils.setTitle("会员信息");
		}
	};
</script>
<style scoped lang='less'>
	@import '../../res/css/swiper.min.css';

	section.membership-info {
		background-color: white;
		min-height: 100%;

		header {
			height: 2.6667rem;
			width: 100%;

			&>div {
				width: 8.29rem;
				height: 1.8667rem;
				margin: 0 auto;

				.left {
					width: 6.3rem;
					height: 100%;
					display: inline-block;
					vertical-align: middle;
					margin-top: 0.5rem;

					.top {
						.title {
							font-size: 0.4rem;
							color: #303030;
							font-weight: bold;
							padding-right: 0.16rem;
						}

						.button {
							border: 1px solid #6A9CE4;
							border-radius: 1.3333rem;
							color: #6A9CE4;
							padding: 0.1rem 0.3rem;

						}

						div {
							font-size: 0.32rem;
							color: #999999;
							margin-top: 0.5rem;
						}
					}
				}

				&>img {
					width: 1.8667rem;
					height: 1.8667rem;
					border-radius: 50%;
					float: right;
					margin-top: 0.5rem;
					box-shadow: 0.01rem 0.01rem 0.02rem 0.03rem #999;
				}
			}
		}

		.num {
			border-top: 2px solid rgb(240, 240, 240);
			height: 1.1067rem;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;

			&>.info {
				flex: 1;
				text-align: center;
				font-size: 0.32rem;
				color: #303030;
			}

			&>div.spilt {
				width: 1px;
				height: 0.6rem;
				;
				background-color: #F2F2F2;
			}
		}

		.card {
			height: 5.84rem;
			border-top: 0.1333rem solid rgb(240, 240, 240);

			div.center {
				margin-left: 0.85rem;
			}

			&>div {
				// display: flex;
				// align-items: center;
				// justify-content:flex-start;
				// width:100%;
				// height:100%;
				margin-top: 0.43333rem;

				.cardItem {
					width: 8.2933rem;
					height: 4.9733rem;
					box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.25);
					border-radius: 0.2667rem;
					position: relative;

					&>.s {
						font-size: 0.4rem;
						color: #303030;
						font-weight: bold;
						margin: 0.5rem 0 0 0.5rem;
					}

					.type {
						opacity: 0.38;
						font-size: 1.1867rem;
						color: #FFFFFF;
						position: absolute;
						right: 0.5rem;
						bottom: 0.1rem;
					}

					.money {
						position: absolute;
						// right:0.6133rem;
						bottom: 2.133rem;
					}

					img {
						position: absolute;
						top: 0.52rem;
						right: 0.6133rem;
						width: 0.72rem;
						height: 0.72rem;
					}
				}
			}

		}

		.legalRight {

			min-height: 1rem;
			border-top: 0.0267rem solid rgb(240, 240, 240);

			&>div {
				margin: 0 auto;
				width: 85%;
				font-size: 0.3467rem;
				color: #303030;

				overflow: hidden;

				div {
					margin-top: 0.25rem;
					font-weight: bold;

					img {
						width: 0.2rem;
						height: 0.3467rem;
						vertical-align: middle;
						float: right;
						margin-right: 0.15rem;
					}

					// img.rot{

					// }
				}

				ul {
					padding-top: 0.25rem;

					li {
						padding: 0 0 0.3rem 0.5rem;

						span {
							position: absolute;
							margin: 0.1rem 0 0 -0.35rem;
							font-size: 0.5rem;
							line-height: 0;
						}
					}

					li:last-child {
						color: #00a0ea;
						text-decoration: underline;

						span {
							color: #303030;
						}
					}

					li:first-child {
						color: #303030;
						text-decoration: none;
					}
				}
			}
		}

		.multi-entry {

			border-top: 0.1333rem solid rgb(240, 240, 240);
			font-size: 0.32rem;
			color: #303030;

			&>div {
				width: 90%;
				margin: 0 auto;

				ul {
					display: flex;
					width: 100%;
					justify-content: flex-start;
					align-items: center;
					flex-wrap: wrap;

					li {
						padding-top: 0.5rem;
						text-align: center;
						height: 2rem;
						width: 25%;

						a {
							display: inline;
							font-size: 0.32rem;
							color: #303030;

							div.top {
								height: 50%;

								img {
									width: 28%;
								}
							}
						}

					}
				}
			}


		}
	}

	.qrcode {
		background: rgba(0, 0, 0, 0.50);
		position: fixed;
		z-index: 10;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;


		div {
			width: 4.7467rem;
			height: 6.9333rem;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;

			.qr {
				width: 4.7467rem;
				height: 4.7467rem;
			}

			.close {
				width: 1.1867rem;
				height: 1.1867rem;
				margin-top: 2rem;
				margin-left: 50%;
				transform: translate(-50%)
			}
		}
	}


	.res-rotate {
		transform: rotate(270deg);
	}

	.rotate {
		transform: rotate(90deg);
	}
</style>