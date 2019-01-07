<template>
	<div class="member-integral" id="exchange-record">
		<div class="member-integral-header">
			<div class="head-sculpture-icon">
				<div class="member-head-sculpture">
					<div class="head-sculpture">
						<img :src="imageUrl" />
						<div class="membership-integral">
							<b>{{point}}</b>积分
						</div>
					</div>
				</div>
			</div>
			<div class="integral-presentation" v-if="isVip">
				<!--<p>注册时间:{{transFormData(creatTime)}}</p>-->
				<p>消费{{cash}}元可以获得{{getPoint}}积分</p>
				<!-- <p v-if="isHeighterLevel">您已经是最高等级</p>
                <p v-if="!isHeighterLevel">您距离{{nextLeval}}还需消费{{nextNeedPrice}}元</p> -->
			</div>
		</div>
		<div class="record">
			<div class="title">
				<div class="line"></div>
				<div :class="[!used?'select':'']" @click="click1(false)">未使用</div>
				<div :class="[used?'select':'']" @click="click1(true)">已使用</div>
			</div>
			<div class="content">
				<div v-for="(c,index) in list" :key="index">
					<div class="coupons" v-if="c.status == status">
						<div class="left" @click="getExchangeQR(c)">
							<div>商品名称：{{c.gname}}</div>
							<div>兑换时间：{{ c.createTime | transformTime}}</div>
						</div>
						<div class="center">
							<span></span>
							<div style="margin-top: -0.2rem;"></div>
							<div style="margin-top: 1.5rem;"></div>
						</div>
						<div class="right" v-if="c.status == 0" @click="lookCode(c)">
							查看劵码
						</div>
						<div class="right" v-else>
							已使用
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import http from 'src/manager/http';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	
	export default {
		name: 'exchangeRecord',
		data() {
			return {
				point: '', //积分
				isVip: false,
				list: [],
				used: true,
				status: 0,
				imageUrl: null,
				//          level:null,//dang qian deng ji
				nextLeval: null,
				nextNeedPrice: 0,
				isHeighterLevel: false,
				creatTime: null,
				cash: 0, //花费额度
				getPoint: 0, //送的积分数量
				token: '',
				info: []
			};
		},
		methods: {
			async getRecordList() {
				let res = await http.getListByMid({
					data: {
						shopId: this.shopId,
						page: 1,
						num: 100,
						// mid:this.mid
					}
				});
				this.list = res.list;
			},
			getLevel() {
				let levelId = this.info.member.levelId == 0 ? null : this.info.member.levelId;

				let levelList = this.info.member.levelList;
				let amount, nextLevelId;
				if (levelId == null && utils.isEmptyObject(levelList)) {
					this.isHeighterLevel = true;
				} else {
					for (let i = 0; i < levelList.length; i++) {
						if (levelId == null) {
							if (levelList[i].status == '1') {
								levelId = levelList[i].id;
							} else {
								this.isHeighterLevel = true;
							}
						}
						if (levelList[i].id == levelId) {
							amount = Number(this.info.member.totalCharge);
							nextLevelId = levelList[i].nextLevel;
							this.isHeighterLevel = (nextLevelId == '0') ? true : false;
						}
						if (nextLevelId == levelList[i].id) {
							this.nextLeval = levelList[i].name;
							this.nextNeedPrice = Number(Number(levelList[i].totalCharge) - amount).toFixed(2);
						}
					}
				}
			},
			click1(bol) {
				if (bol) {
					this.used = false;
					this.status = 1;
				} else {
					this.used = true;
					this.status = 0;
				}
			},
			getExchangeQR(g) {
				storage.session('goodsInfo', g);
				storage.session('isCode', 1);
				this.$router.push({
					path: '/mallGoodsDetail',
					query: {
						code: 1
					}
				});
			},
			lookCode(c) {
				console.log(c, 'c');
				storage.session('mall-code', c);
				this.$router.push({
					path: '/exchangeCode',
					query: {
						shopId: c.shopId,
						id: 0
					}
				});
			}
		},
		filters: {
			transformTime(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd hh:mm:ss');
			},
		},
		mounted() {
			let info = storage.session('userInfo');
			this.info = info;
			this.point = Number(info.point);


			this.token = storage.session('token');
			if (info.member) {
				this.isVip = true;
				this.creatTime = info.member.createTime;
			}
			if (info.pointConfig) {
				this.cash = info.pointConfig.cash;
				this.getPoint = info.pointConfig.point;
			}

			this.getRecordList();
			this.imageUrl = info.imageUrl + '/';
			this.getLevel();
			utils.setTitle('兑换记录');
		}
	};
</script>

<style lang="less" scoped>
	.record {
		width: 10rem;
		height: 11.4rem;
		font-size: 0.35rem;
	}

	.record .title {
		width: 100%;
		height: 1.2rem;
		text-align: center;
		line-height: 1.2rem;
		border-bottom: 1px solid #000000;
		position: relative;
	}

	.record .title div {
		width: 50%;
		float: left;
	}

	.record .title .select {
		background-color: #e2e1e1;
	}

	.record .title .line {
		width: 1px;
		height: 1.2rem;
		background-color: #000;
		position: absolute;
		top: 0;
		left: 50%;
	}

	.record .content {
		width: 100%;
		height: 9.7rem;
		/*background-color:red;*/
		padding-top: 0.5rem;
		overflow-y: scroll;
	}

	.record .content .coupons {
		width: 8.367rem;
		height: 2rem;
		margin: 0 auto;
		border: 1px solid #000000;
		position: relative;
		margin-top: 0.3rem;
	}

	.record .content .coupons .center {
		width: 0.5rem;
		height: 2.05rem;
		background-color: red;
		background-color: #FFF;
		overflow: hidden;
		position: absolute;
		top: -0.03rem;
		left: 5.8rem;

	}

	.record .content .coupons .center div {
		width: 0.47rem;
		height: 0.47rem;
		border: 1px solid #000000;
		border-radius: 100%;
		float: left;
	}

	.record .content .coupons .center span {
		width: 1px;
		height: 1.45rem;
		border-left: 2px dashed #000;
		position: absolute;
		top: 0.35rem;
		left: 0.23rem;
	}

	.record .content .coupons .left {
		float: left;
		width: 6.2rem;
		height: 100%;
		line-height: 0.5rem;
		/*background-color:red;*/
		margin-top: 0.25rem;
	}

	.record .content .coupons .left div {
		text-indent: 0.3rem;
		width: 5.6rem;
		height: 0.8rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

	}

	.record .content .coupons .right {
		float: left;
		width: 2.067rem;
		height: 100%;
		line-height: 1.9rem;
		text-align: center;
		color: #000;
	}

	.member-integral {
		width: 100%;
		height: 100%;
	}

	.member-integral .member-integral-header {
		width: 100%;
		height: 6.29333rem;
		background-image: url(../../../res/images/member-integral-bg.png);
		background-repeat: no-repeat;
		background-size: cover;
		position: relative;
		margin-bottom: 0;
		overflow: hidden;
	}

	.member-integral .member-integral-header:after {
		content: '';
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
	}

	.member-integral .member-integral-header .head-sculpture-icon {
		width: 100%;
		height: 4.8rem;
		border-bottom: 0.02667rem solid #b7a89e;
		box-sizing: border-box;
		z-index: 2;
		position: absolute;
	}

	.member-head-sculpture {
		width: 2.93333rem;
		height: 4rem;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
	}

	.member-head-sculpture>.head-sculpture {
		width: 2.93333rem;
		height: 2.93333rem;
		border: 0.04rem solid #b0b0b0;
		border-radius: 50%;
		position: relative;
	}

	.member-head-sculpture>.head-sculpture img {
		width: 2.93333rem;
		height: 2.93333rem;
		border-radius: 50%;
		-webkit-border-radius: 50%;
	}

	.member-head-sculpture>.head-sculpture:after {
		content: '';
		position: absolute;
		right: -0.56rem;
		top: 0;
		background: url(../../../res/images/member-integral.icon.png) no-repeat;
		background-size: 0.92rem 0.82667rem;
		width: 1rem;
		height: 0.93333rem;
	}

	.member-head-sculpture .membership-integral {
		width: 100%;
		height: 1.06667rem;
		line-height: 1.33333rem;
		color: #FFFFFF;
		text-align: center;
		font-size: 0.32rem;
		overflow: hidden;
	}

	.member-head-sculpture .membership-integral b {
		font-size: 0.48rem;
	}

	.member-integral .member-integral-header .integral-presentation {
		width: 100%;
		height: 1.46667rem;
		position: absolute;
		bottom: -3%;
		box-sizing: border-box;
		z-index: 8;
	}

	.member-integral .member-integral-header .integral-presentation p {
		font-size: 0.32rem;
		line-height: 0.53333rem;
		color: #FFFFFF;
		text-align: center;
	}

	.restrictWidth {
		max-width: 40%;
		height: 0.7rem;
		overflow: hidden;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/*# sourceMappingURL=member-integral.css.map */
</style>