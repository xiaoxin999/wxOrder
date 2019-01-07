<template>
	<div class="member-integral" id="member-integral">
		<div class="member-integral-header">
			<div class="head-sculpture-icon">
				<div class="member-head-sculpture">
					<div class="head-sculpture">
						<img :src="headSculpture" />
						<div class="membership-integral">
							<template v-if="type == 1">
								<b>{{integral}}</b>积分
							</template>
							<template v-else>
								<b>{{card.balance}}</b>余额
							</template>
						</div>
					</div>
				</div>
			</div>
			<div class="integral-presentation" v-if="isMembership && type == '2' && highestRank == false">
				<template v-if='card.memberType == 0'>
					<p v-if="pointConfig.status == '1'">消费{{pointConfig.cash}}元可以获得{{pointConfig.point}}积分</p>
					<p v-if="nextLevePrice>0">您距离{{nextLeveName}}还需消费{{nextLevePrice}}元</p>
				</template>
				<template v-if='card.memberType == 1'>
					<p>{{card.cardTypeName}}</p>
				</template>

			</div>
			<div class="integral-presentation" v-if="highestRank">
				<p v-if="membership.length >= 1">注册时间:{{membership.createTime}}</p>
				<p>消费{{pointConfig.cash}}元可以获得{{pointConfig.point}}积分</p>
				<p v-if="membership.length >= 1">您已是最高等级</p>
			</div>
			<div class="integral-presentation" v-if="type == '1' && highestRank == false">
				<p>在这里可以看到您的会员消费记录哦~</p>
			</div>
		</div>
		<div class="member-integralList">
			<ul>
				<li v-for="(item,index) in list" :key="index">
					<p>{{item.createTime}}</p>
					<p :class="index%2==0 ? 'fr' : 'fl'" class="restrictWidth">
						{{item.behavior ? item.behavior : typeInfo[item.type]}}
						<template v-if="type == '1'">
							<b v-if="item.type == 36 && item.status == 0 || item.type == 3 || item.type == 8 || item.type == 9 || item.type == 11" v-bind:class="[ index%2==0 ? 'fr' : '']">-{{item.operatePoint}}</b>
							<b v-else :class="[ index%2==0 ? 'fr' : '']">+{{item.operatePoint}}</b>
						</template>
						<template v-else>
							<b v-if="item.type == 1 || item.type == 6 || item.type == 13" v-bind:class="[ index%2==0 ? 'fr' : '']">-{{(item.operateGiftAmount-0) + (item.operateAmount-0)}}</b>
							<b v-if="item.type == 2 || item.type == 4 || item.type == 7 || item.type == 12" v-bind:class="[ index%2==0 ? 'fr' : '']">+{{item.type == 2 ? ((item.operateGiftAmount-0) + (item.rechargeAmount-0)) :((item.operateGiftAmount-0) + (item.operateAmount-0))}}</b>
						</template>
					</p>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';
	import global from 'src/manager/global';

	let shopId = utils.getQueryString('shopId');
	export default {
		data() {
			return {
				integral: '', //积分
				memberId: '', //会员id
				isMembership: false, //是否是会员
				type: '', //1为积分 2为余额
				membership: {}, //会员信息
				list: [], //消费或充值
				amount: '', //余额
				levelId: '', //会员id
				nextLeveName: '', // 下个会员等级名称
				nextLevePrice: '', //距离下个等级还差多少金额
				headSculpture: '', //头像
				highestRank: false, //是否达到最高等级
				pointConfig: {}, //现金兑换积分比例配置
				card: '',
				typeInfo: {},
				integralType: {
					3: true,
					4: true,
					5: true,
					8: true,
					9: true,
					10: true,
					11: true,
					17: true
				}
			};
		},
		methods: {
			transFormData(t) {
				// 转换时间
				let d = new Date(Number(t + '000'));
				return utils.format(d, 'yyyy-MM-dd hh:mm');
			},
			async getConsumeList() {
				let data = await http.getConsumeList({
					data: {
						shopId: this.shopId,
						memberId: this.memberId,
						type: this.type,
						memberCardId: this.card && this.card.memberType == '1' ? this.card.id : ''
					}
				});
				console.log(data, 'data');
				this.list = data.list;
				console.log(data.list, 'list')
				this.amount = data.amount;
				this.integral = data.point;
				let member = storage.session('membership');

				if (member.member && typeof member.member == 'object') {
					member.member.point = data.point;
					member.member.totalAmount = data.amount;
				}

				this.typeInfo = data.typeInfo;

				storage.session('membership', member);
				for (let i = 0; i < this.list.length; i++) {
					this.list[i].createTime = this.transFormData(this.list[i].createTime);
				}
			}
		},
		beforeDestroy() {
			storage.session('card', null);
			storage.session('type', null);
		},
		mounted() {
			let membership = storage.session('membership');
			// this.integral = Number(membership.point);
			this.type = storage.session('type');
			this.card = storage.session('card');
			this.membership = storage.session('membership').member;
			this.isMembership = Boolean(storage.session('membership').member);
			this.memberId = this.membership.memberId;
			this.amount = Number(this.membership.totalAmount);
			this.levelId = this.membership.levelId == 0 ? null : this.membership.levelId;
			this.membership.levelId == 0 ? null : this.membership.levelId;
			this.headSculpture = membership.imageUrl;
			this.pointConfig = membership.pointConfig;
			this.getConsumeList();
			let levelList = this.membership.levelList;
			let amount, nextLevelId;

			if (this.levelId == null && JSON.stringify(levelList) == '{}') {
				this.highestRank = true;
			} else {

				levelList = utils.type(levelList) == 'object' ? Object.values(levelList) : levelList;


				if (!levelList) return;

				for (let i = 0; i < levelList.length; i++) {
					if (this.levelId == null) {
						if (levelList[i].status == '1') {
							this.levelId = levelList[i].id;
						} else {
							this.highestRank = true;
						}
					}

					if (levelList[i].id == this.levelId) {
						amount = this.membership.totalCharge;
						nextLevelId = levelList[i].nextLevel;
						this.highestRank = (nextLevelId == '0') ? true : false;
						break;
					}

				}

				let obj = {};
				obj = levelList.filter((item) => {
					return item.id == nextLevelId;
				})[0];
				this.nextLeveName = obj && obj.name?obj.name:'';
				this.nextLevePrice = (obj.totalCharge - amount).toFixed(2);
			};
			let slft = this;
			if (slft.type == '1') {
				utils.setTitle('我的积分');
			} else {
				utils.setTitle('会员余额');
			}
		}
	};
</script>
<style scoped>
	#member-integral {
		width: 100%;
		height: 100%;
		background: #fff !important;
	}

	#member-integral .member-integral-header {
		width: 100%;
		height: 6.29333rem;
		background-image: url(../../res/images/member-integral-bg.png);
		background-repeat: no-repeat;
		background-size: cover;
		position: fixed;
		top: 0;
		z-index: 55;
		margin-bottom: 0.4rem;
		overflow: hidden;
	}

	#member-integral .member-integral-header:after {
		content: "";
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
	}

	#member-integral .member-integral-header .head-sculpture-icon {
		width: 100%;
		height: 4.8rem;
		border-bottom: 0.02667rem solid #b7a89e;
		box-sizing: border-box;
		z-index: 2;
		position: absolute;
	}

	#member-integral .member-head-sculpture {
		width: 2.93333rem;
		height: 4rem;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	#member-integral .member-head-sculpture>.head-sculpture {
		box-sizing: content-box;
		width: 2.93333rem;
		height: 2.93333rem;
		border: 0.04rem solid #b0b0b0;
		border-radius: 50%;
		padding: 0.2rem;
		position: relative;
	}

	#member-integral .member-head-sculpture>.head-sculpture img {
		width: 2.93333rem;
		height: 2.93333rem;
		border-radius: 50%;
		-webkit-border-radius: 50%;
	}

	#member-integral .member-head-sculpture>.head-sculpture:after {
		content: "";
		position: absolute;
		right: -0.56rem;
		top: 0;
		background: url(../../res/images/member-integral.icon.png) no-repeat;
		background-size: 0.92rem 0.82667rem;
		width: 1rem;
		height: 0.93333rem;
	}

	#member-integral .member-head-sculpture .membership-integral {

		height: 1.06667rem;
		line-height: 1.33333rem;
		color: #ffffff;
		text-align: center;
		font-size: 0.32rem;
		width: 4.2rem;
		margin-left: -0.6rem;
	}

	#member-integral .member-head-sculpture .membership-integral b {
		font-size: 0.48rem;
	}

	#member-integral .member-integral-header .integral-presentation {
		width: 100%;
		height: 1.46667rem;
		position: absolute;
		bottom: -3%;
		box-sizing: border-box;
		z-index: 8;
	}

	#member-integral .member-integral-header .integral-presentation p {
		font-size: 0.32rem;
		line-height: 0.53333rem;
		color: #ffffff;
		text-align: center;
	}

	#member-integral .member-integralList {
		width: 100%;
		height: auto;
		padding: 0 1.6rem;
		min-height: calc(100% - 6.69333rem);
		box-sizing: border-box;
		position: relative;
		background: #fff;
	}

	#member-integral .member-integralList:after {
		content: "";
		position: fixed;
		top: 6.29333rem;
		left: 50%;
		transform: translate(-50%, 0);
		-webkit-transform: translate(-50%, 0);
		width: 0.02667rem;
		height: 100%;
		background: linear-gradient(to top right, #000, #ccc);
	}

	#member-integral .member-integralList:before {
		content: "";
		position: fixed;
		top: 6.29333rem;
		left: 50%;
		transform: translate(-50%, 0);
		-webkit-transform: translate(-50%, 0);
		width: 0.2rem;
		height: 0.2rem;
		background-color: #000000;
	}

	#member-integral .member-integralList ul {
		margin-top: 6.29333rem;
	}

	#member-integral .member-integralList ul li {
		width: 100%;
		height: 2.3rem;
		font-size: 0.32rem;
		padding-top: 0.5rem;
		line-height: 0.66667rem;
		box-sizing: border-box;
	}

	#member-integral .member-integralList ul li:nth-child(1n) {
		background: url(../../res/images/member-integral-right.png) right bottom no-repeat;
		background-size: 3.41333rem 0.36rem;
		text-align: right;
	}

	#member-integral .member-integralList ul li:nth-child(2n) {
		background: url(../../res/images/member-integral-left.png) left bottom no-repeat;
		background-size: 3.41333rem 0.36rem;
		text-align: left;
	}

	#member-integral .restrictWidth {
		max-width: 50%;
		height: 0.7rem;
		overflow: hidden;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>