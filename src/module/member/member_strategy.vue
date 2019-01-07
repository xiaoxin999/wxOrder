<template>
	<div class="member-strategy">
		<div class="level-box">
			<div class="level-card">
				<h3 class="card-tit">
					{{memberInfo.shopName}}<span>V{{level}}</span>会员，您好！
				</h3>
				<div class="card-avatar">
					<!-- 上一等级展示 -->
					<div class="lev-show light" v-if="level>1">
						<span class="prev-lev icon-lev">
							<em>V{{level - 1}}</em>
						</span>
					</div>
					<div class="avatar-show">
						<img :src="memberInfo.imageUrl" :alt="memberInfo.name">
						<span class="current-level">
							<em>V</em>{{level}}
						</span>
					</div>
					<!-- 下一等级展示 -->
					<div class="lev-show grey" v-if="isNext == 1 && nextLevel != '0'">
						<span class="next-lev icon-lev">
							<em>V</em>{{level + 1}}
						</span>

						<!-- 差多少 -->
						<div class="distance-num">
							<p>未达到</p>
							<p>还差:{{Number(active)-Number(activeValue)>0?Number(active)-Number(activeValue):0}}</p>
						</div>
					</div>
				</div>
				<!-- 当前活跃值 -->
				<p class="current-num">当前活跃值：{{memInfo.activeValue}}</p>
			</div>
		</div>
		<!-- 当前权益 -->
		<div class="equity-show" v-if="interests !=''">
			<p class="title">
				当前等级享有以下权益
			</p>
			<!-- 权益列表 -->
			<ul class="equity-list">
				<li v-for="(i,index) in interests" :key="index">
					{{i.replace(/[!]/g,'')}}
				</li>
			</ul>
		</div>
		<!-- 下级可享受的权益 -->
		<div class="next-equity" v-if="isNext == 1 && nextLevel != '0' && nextLevel != '0' && ((giveCoupons && giveCoupons.length > 0) || (givePoints && givePoints > 0))">
			<!-- (levelLength != Number(level) + 1) && isNext == 1 -->
			<div class="tp-bar" @click.stop="handleEqShow">
				<span class="lev-icon">
					<em>V</em>{{level + 1}}
				</span>
				<span class="lev-tit">下级会员权益</span>
				<span class="lev-equ">(享受{{discountNext}}折优惠)</span>
				<i class="lev-arrow" :class="{'up':nextEqShow}"></i>
			</div>
			<!-- <div class="equ-list" v-show="!nextEqShow">
				<ul>
					<li v-for="(j,index) in interestsNext" :key="index">
						{{j.replace(/[!]/g,'')}}
					</li>
				</ul>
			</div> -->
			<!-- 升级礼包 -->
		<div class="eq-detail" v-show="!nextEqShow" v-if="isNext == 1 && nextLevel != '0' && ((giveCoupons && giveCoupons.length > 0) || (givePoints && givePoints > 0))">
			<div class="left-cont">
				<h3>升级<span>享</span>好礼</h3>
				<ul class="gift-list">
					<li v-if="giveCoupons.length > 0">
						礼包一：<span>{{couponsList}}</span>
					</li>
					<li v-if="givePoints > 0">
						<template v-if="giveCoupons.length == 0">	礼包一：</template>
						<template v-else>	礼包二：</template>
						赠送{{givePoints}}积分
					</li>
				</ul>
			</div>
			<i class="right-icon"></i>
		</div>
		</div>
		
		<!-- 活跃值获取方式 -->
		<div class="access-ways">
			<div class="ways-title">
				<span>活跃值获取方式</span>
			</div>
			<ul class="ways-list">
				<li v-if="isStored == 1">
					<router-link to='recharge'>
						<div class="info">
							<p class="info-intro">储值满{{storedAmount}}元获得{{storeActive}}个活跃值</p>
						</div>
						<span class="btn">去充值</span>
					</router-link>

				</li>
				<li v-if="isConsumption == 1">
					<router-link to='shopSelect'>
						<div class="info">
							<p class="info-intro">消费满{{consumptionAmount}}元获得{{consumptionActive}}个活跃值</p>
						</div>
						<span class="btn">去下单</span>
					</router-link>

				</li>
				<li @click="handleToMail" v-if="integralMallActive>0">
					<div class="info">
						<p class="info-intro">积分商城兑换商品，兑换一次获得{{integralMallActive}}个活跃值</p>
					</div>
					<span class="btn">去看看</span>
				</li>
				<li @click="toTask" v-if="taskActive>0">
					<div class="info">
						<p class="info-intro">完成一次任务，获得{{taskActive}}个活跃值</p>
					</div>
					<span class="btn">去看看</span>
				</li>
				<li v-if="goodsActive>0">
					<div class="info">
						<p class="info-intro">购买品牌指定商品，一个商品可获得{{goodsActive}}个活跃值</p>
						<span class="specil-gd">指定商品：{{esGoods}}</span>
					</div>
					<!-- <span class="btn">去购买</span> -->
				</li>
			</ul>
		</div>
		<!-- 会员说明 -->
		<div class="vip-explain" v-if="activeDesc != ''">
			<p class="exp-tit">会员说明</p>
			<ul class="exp-list">
				<li>{{activeDesc}}</li>
			</ul>
		</div>
	</div>
</template>

<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	export default {
		name: 'member-strategy',
		data: function() {
			return {
				equityList: [
					'消费10元获得1积分，享受8.8折，不定期会员活动',
					'2张消费减免优惠券',
					'积分商品'
				],
				nextEqShow: false,
				pointStyle: 1,
				memberInfo: {},
				levelList: [], //会员等级
				activeValue: 0, //活跃值
				memInfo: {},
				level: '',
				nextActive: 0, //下一个活跃值
				levelLength: 0,
				interests: '', //当前等级下的会员权益
				interestsNext: '', //下级会员权益
				discountNext: '',
				activeDesc: '', //会员说明
				isStored: 0, //储值活跃度 0关闭 1开启
				isConsumption: 0, //消费活跃度 0关闭 1开启
				storedAmount: 0,
				storeActive: 0,
				consumptionAmount: 0,
				consumptionActive: 0,
				integralMallActive: 0,
				taskActive: 0,
				goodsActive: 0,
				esGoods: '',
				DifferenceValue: 0, //当前等级活跃值与会员活跃值差值
				isNext: '',
				nextLevel: '',
				firstArr: {},
				beforeLevelCount: 0,
				active: 0,
				ismemberInfo: null,
				// giveCoupons: [{
				// 	'id': '1',
				// 	'name': '优惠券',
				// 	'num': '2'
				// }, {
				// 	'id': '2',
				// 	'name': '优惠券2',
				// 	'num': '3'
				// }],
				giveCoupons:[],
				givePoints: '0',
				couponsList: '',
			};
		},
		beforeRouteEnter(to, from, next) {
			let memberId = storage.session('login').memberId;
			let ismemberInfo = storage.session('memberInfo');
			if ((memberId && memberId != 0) || (ismemberInfo && ismemberInfo.member)) { // 判断当前的memberId是否存在
				next();
			} else {
				next({
					path: '/memberRegister',
					query: {
						type: 5
					} // 将跳转的路由path作为参数，登录成功后跳转到该路由
				});
			}
		},
		methods: {
			handleEqShow() {
				this.nextEqShow = !this.nextEqShow;
			},
			// 跳转到积分商城
			handleToMail() {
				if (this.pointStyle == 1) {
					this.$router.push('/intergralMall');
				} else {
					this.$router.push('/newIntegralmall');
				}
			},
			toTask() {
				this.$router.push('/taskList');
			},
			async memberInstruction() {
				let data = await http.memberInstructions({
					data: {
						shopId: this.shopId
					}
				});
				this.levelList = data.level; //会员等级
				this.levelList.filter((item) => {
					if (data.memberInfo.levelId == item.id) {
						this.isNext = item.isNext;
					}
				});
				this.beforeLevelCount = data.beforeLevelCount;
				this.levelLength = data.level.length;
				this.activeValue = data.memberInfo.activeValue;
				this.memInfo = data.memberInfo;
				let levelId = data.memberInfo.levelId;
				this.activeDesc = data.activeConf.activeDesc;
				this.isStored = data.activeConf.isStored;
				this.isConsumption = data.activeConf.isConsumption;
				this.storedAmount = data.activeConf.storedAmount;
				this.storeActive = data.activeConf.storeActive;
				this.consumptionAmount = data.activeConf.consumptionAmount;
				this.consumptionActive = data.activeConf.consumptionActive;
				this.integralMallActive = data.activeConf.integralMallActive;
				this.taskActive = data.activeConf.taskActive;
				this.goodsActive = data.activeConf.goodsActive;
				this.esGoods = data.activeConf.goodsNames + data.activeConf.packageNames;
				this.level = data.beforeLevelCount + 1;
				for (let i = 0; i < this.levelList.length; i++) {
					if (levelId == this.levelList[i].id) {
						this.interests = this.levelList[i].interests.split('#!');
						this.DifferenceValue = this.memInfo.activeValue - this.levelList[i].activeValue;
						this.nextLevel = this.levelList[i].nextLevel;
						this.active = this.levelList[i].activeValue; //当前等级的活跃值
					}
					if (this.nextLevel == this.levelList[i].id) {
						this.nextActive = Number(this.levelList[i].activeValue);
						this.interestsNext = this.levelList[i].interests.split('#!');
						this.discountNext = this.levelList[i].discount / 10;
						this.givePoints = this.levelList[i].givePoints;
						this.giveCoupons = this.levelList[i].giveCoupons;
						let arr = [];
						if(this.giveCoupons && this.giveCoupons.length>0){
							this.giveCoupons.map((item) => {
								arr.push(item.name + item.num + '张');
							});
							arr.join(',');
							this.couponsList = arr.toString();
						}
					}
				}
				storage.session('memInfo', this.memInfo);
			}
		},

		async mounted() {
			this.memberInfo = storage.session('login');
			// 获取积分类型
			this.pointStyle = storage.session('login').pointStyle;
			this.memberInstruction();
			utils.setTitle('会员攻略');
		}
	};
</script>



<style lang="less" scoped>
	@import "../../res/css/base.less";

	.mb20 {
		.px2rem(margin-bottom, 22);
	}

	.lightVip {
		display: block;
		.px2rem(width, 50);
		.px2rem(height, 50);
		background: url("../../res/images/strategy-lv-1.png") no-repeat center / cover;
		.px2rem(font-size, 22);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6a300b;

		em {
			font-size: 0.36rem;
			font-weight: bold;
			font-family: serif;
		}
	}

	.greyVip {
		display: block;
		.px2rem(width, 50);
		.px2rem(height, 50);
		background: url("../../res/images/strategy-lv-2.png") no-repeat center / cover;
		.px2rem(font-size, 22);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #828080;

		em {
			font-size: 0.36rem;
			font-weight: bold;
			font-family: serif;
		}
	}

	.level-box {
		width: 100%;
		height: 4.786rem;
		padding-bottom: 0.4rem;
		background: url("../../res/images/strategy-01.png") no-repeat center / cover;

		.level-card {
			width: 8.76rem;
			height: 4.973rem;
			background: url("../../res/images/strategy-card.png") no-repeat top center/ cover;
			margin: 0 auto;
			position: relative;
			top: 0.42rem;

			.card-tit {
				text-align: center;
				.px2rem(padding-top, 51);
				.px2rem(padding-bottom, 26);
				.px2rem(font-size, 26);
				color: #fff;

				span {
					.px2rem(font-size, 48);
					font-weight: bold;
				}
			}

			.card-avatar {
				position: relative;

				.avatar-show {
					position: relative;
					margin: 0 auto;
					z-index: 5;
					.px2rem(width, 128.5);
					.px2rem(height, 128.5);
					border-radius: 50%;
					border: 0.11rem solid #fff;

					img {
						width: 100%;
						height: 100%;
						border-radius: 50%;
						display: block;
					}

					.current-level {
						.lightVip;
						position: absolute;
						bottom: -0.2rem;
						right: -0.1rem;
					}
				}
			}

			.lev-show {
				.px2rem(width, 272);
				.px2rem(height, 4);
				background-image: linear-gradient(90deg, #CCA559 0%, #B18739 100%);
				position: absolute;
				top: .9rem;

				&.light {
					left: 0.15rem;
				}

				&.grey {
					right: 0.15rem;
				}

				.prev-lev {
					.lightVip;
					.px2rem(left, 78)
				}

				.next-lev {
					.greyVip;
					.px2rem(right, 78)
				}

				.icon-lev {
					position: absolute;
					top: -0.3rem;
				}
			}

			.current-num {
				.px2rem(font-size, 24);
				.px2rem(margin-top, 15);
				color: #fff;
				text-align: center;
			}

			.distance-num {
				position: absolute;
				left: 1.4rem;
				top: 0.55rem;
				text-align: center;
				color: #fff;
				.px2rem(font-size, 24);
			}

		}
	}

	.equity-show {
		width: 100%;
		min-height: 2.62rem;
		position: relative;
		background: #fff;
		padding: 0 0.92rem;
		z-index: 5;
		.mb20;

		&::before {
			content: "";
			width: 0;
			height: 0;
			border-width: 0 0.2rem 0.2rem;
			border-style: solid;
			border-color: transparent transparent #fff;
			position: absolute;
			top: -0.18rem;
			left: 50%;
			margin-left: -0.1rem;
			z-index: 6;
		}

		.title {
			padding: 0.2933rem 0;
			text-align: center;
			color: #ba7f4d;
			.px2rem(font-size, 24);
		}

		.equity-list {
			li {
				display: inline-block;
				.px2rem(font-size, 24);
				color: #000;
				text-align: center;
				padding: 0.06rem 0.33rem;
				background: rgba(224, 207, 163, 0.48);
				border-radius: 1rem;
				margin: 0 0.07rem 0.2933rem;
			}
		}
	}

	.next-equity {
		background: #fff;
		.mb20;
		position: relative;

		&:after {
			content: "";
			width: 100%;
			.px2rem(height, 2);
			background: #f2f2f2;
			position: absolute;
			left: 0;
			bottom: 0;
		}

		.tp-bar {
			width: 100%;
			.px2rem(height, 94);
			.px2rem(padding-left, 42);
			display: flex;
			align-items: center;
			position: relative;

			.lev-icon {
				.lightVip;
				.px2rem(margin-right, 12.2);
			}

			.lev-tit {
				.px2rem(font-size, 30);
				.px2rem(margin-right, 18);
				color: #303030;
				font-weight: bold;
			}

			.lev-equ {
				.px2rem(font-size, 24);
				color: #6b6b6b;
			}

			.lev-arrow {
				.px2rem(width, 26);
				.px2rem(height, 15);
				display: block;
				order: 1;
				position: absolute;
				.px2rem(right, 33.5);
				background: url("../../res/images/strategy-arrow.png") no-repeat center / cover;
				transform: rotate(180deg);

				&.up {
					transform: rotate(0deg);
				}
			}
		}

		.equ-list {
			padding: 0.33333333rem 0.85333333rem 0.33333333rem 0.56rem;

			li {
				list-style-type: disc;
				list-style-position: inside;
				color: #303030;
				.px2rem(font-size, 24);
				.px2rem(line-height, 46);
			}
		}
	}

	.eq-detail {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.33333333rem 0.85333333rem 0.33333333rem 0.56rem;
		background: #fff;
		border-top: 1px solid #eaeaea;
		.mb20;

		.left-cont {
			    width: 7.5rem;
			h3 {
				color: #303030;
				.px2rem(font-size, 36);

				span {
					color: #e1be64;
				}
			}

			.gift-list {
				li {
					.px2rem(font-size, 24);
					.px2rem(line-height, 40);
					color: #6b6b6b;
				}
			}
		}

		.right-icon {
			.px2rem(width, 63);
			.px2rem(height, 72);
			background: url("../../res/images/strategy-gift.png") no-repeat center / cover;
		}
	}

	.access-ways {
		background: #fff;
		padding: 0 0.3333rem 0.3333rem;
		.mb20;

		.ways-title {
			.px2rem(height, 108);
			display: flex;
			align-items: center;
			justify-content: center;

			span {
				display: block;
				.px2rem(font-size, 30);
				color: #303030;
				margin-top: 0.42rem;

			}
		}

		.ways-list {
			li {
				.mb20;
				padding: 0.3333rem 0.2333rem;
				width: 100%;
				.px2rem(min-height, 100);
				.px2rem(border-radiUS, 10);

				display: flex;
				align-items: center;
				justify-content: space-between;
				background: #f2f2f2;

				.info {

					// width: 78%;
					.info-intro {
						.px2rem(font-size, 25);
						color: #000;
					}

					.specil-gd {
						.px2rem(font-size, 24);
						.px2rem(line-height, 40);
						color: #6b6b6b;
					}
				}

				.btn {
					.px2rem(width, 138);
					.px2rem(height, 50);
					.px2rem(border-radius, 100);
					display: flex;
					align-items: center;
					justify-content: center;
					background: url("../../res/images/strategy-border.png") no-repeat center / cover;
					color: #c09f63;
					.px2rem(font-size, 24);
				}

				a {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
					background: #f2f2f2;
				}
			}
		}
	}

	.vip-explain {
		background: #fff;
		padding: 0.3066rem 0.7333rem;

		.exp-tit {
			.px2rem(font-size, 26);
			color: #000;
			font-weight: 600;
			line-height: 0.53333333rem;
		}

		.exp-list {
			li {
				list-style-type: disc;
				list-style-position: inside;
				.px2rem(font-size, 24);
				color: #000;
				line-height: 0.53333333rem;
			}
		}
	}
</style>