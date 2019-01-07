<template>
	<div>
		<div class="container" id="record" v-cloak>
			<div class="recerdTit">
				<div class="comHead comHeadHig">
					<span>已兑换商品记录</span>
				</div>
			</div>
			<div class="comList" v-for="(com,i) in recordList" :key="i">
				<span>
					<div class="conListImg conListImgWid" @click="openCom(com,com.gid)">
						<img :src="hostImg + com.gimage" alt="兑换商品" />
					</div>
					<div class="conListContr conListContent">

						<div @click="onUse(com)" v-if="com.status == 0 && com.compare == false">
							<div class="comTits comGname">{{com.gname}}</div>
							<!-- <p class="comExpired jf" v-if="com.price>0">{{com.point}}积分+{{com.price}}元</p>
						<p class="comExpired jf" v-else-if="com.price==0">{{com.point}}积分</p> -->
							<p style="height:0.6rem;line-height:0.6rem;" :class="com.status == 1 ? 'comCode uCode' : 'comCode aCode'">劵码：{{com.code}}</p>
							<p class="comExpired textexpired" v-if="com.expire == 0">过期时间：永久</p>
							<p class="comExpired textexpiredTime" v-else>过期时间：{{com.showExpire}}</p>
						</div>
						<div v-if="com.status ==0 && com.compare == true">
							<div class="comTits comGname">{{com.gname}}</div>
							<!-- <p class="comExpired jf" v-if="Number(com.price)>0">{{com.point}}积分+{{com.price}}元</p>
						<p class="comExpired jf" v-else-if="Number(com.price)==0">{{com.point}}积分</p> -->
							<p style="height:0.6rem;line-height:0.6rem;" :class="com.status == 1 ? 'comCode uCode' : 'comCode aCode'">劵码：{{com.code}}</p>
							<p class="comExpired textexpired" v-if="com.expire == 0">过期时间：永久</p>
							<p class="comExpired textexpiredTime" v-else>过期时间：{{com.showExpire}}</p>
						</div>
						<div v-if="com.status == 1">
							<div class="comTits comGname">{{com.gname}}</div>
							<!-- <p class="comExpired jf" v-if="Number(com.price)>0">{{com.point}}积分+{{com.price}}元</p>
						<p class="comExpired jf" v-else-if="Number(com.price)==0">{{com.point}}积分</p> -->
							<p style="height:0.6rem;line-height:0.6rem;" :class="com.status == 1 ? 'comCode uCode' : 'comCode aCode'">劵码：{{com.code}}</p>
							<p class="comExpired textexpired" v-if="com.expire == 0">过期时间：永久</p>
							<p class="comExpired textexpiredTime" v-else>过期时间：{{com.showExpire}}</p>
						</div>

						<div class="fl textSty">
							<div class="conListInfo textInfo">
								<span class="noused" v-if="com.status ==0 && com.compare == false"></span>
								<span class="aused" v-if="com.status == 1"></span>
								<span class="expired" v-if="com.status ==0 && com.compare == true"></span>
							</div>
						</div>

					</div>
				</span>
			</div>
		</div>
		<!-- <transition name="fade">
			<component
			    @winEvent = "winEvent"
				:height="'auto'"
				:width="70 + '%'"
				:is="showComponent"
			>-->
		<!-- <p slot="title">使用券码</p> -->
		<!-- <div class="recordForm recordFormContent newStyle" slot="content">
					<div class="fl fImg">
			            <img :src="codeUrl"/>
				    </div>
				    <p>{{codeStatus}}</p>
				    <p>{{showText}}</p>
				</div>-->
		<!-- <span class="expired"></span> -->
		<!--</component>
		</transition>-->

	</div>
</template>

<script>
	import Timer from 'src/verdor/timer';
	import http from 'src/manager/http';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';

	export default {
		name: 'record',
		data() {
			return {
				recordList: [],
				code: '',
				showText: '',
				hostImg: '',
				codeUrl: '',
				codeStatus: null,
				datas: null,
				timer: null,
				gid: null,
				showComponent: ''
			};
		},
		methods: {
			winEvent() { //  监听win组件的事件
				this.showComponent = '';
				Timer.clear(this.timer);
				this.timer = null;
				this.$store.commit('setOverHide', false);
			},
			onUse(com) { // 点击显示confirm弹框
				this.gid = com;
				this.getStatus();
				let code;
				for (let i = 0; i < this.recordList.length; i++) {
					if (this.recordList[i].id == com.id) {
						code = this.recordList[i].code;
					}
				}
				if (com.compare == false && com.status != 1) {
					this.showText = '';
					this.showComponent = 'win';
					this.$store.commit('setOverHide', true);
					this.codeStatus = com.code;
					this.getExchangeQR(code);
				} else {
					if (com.status == 1) {
						this.showWinError('该商品已兑换！');
					}
					if (com.compare == true) {
						this.showWinError('该商品已过期！');
					}
				}
				storage.session('mall-codes', com);
				this.$router.push({
					path: '/exchangeCode',
					query: {
						shopId: com.shopId,
						id: 1
					}
				});
			},
			getStatus() {
				Timer.clear(this.timer);
				this.timer = Timer.add(() => {
					http.getStatus({
						data: {
							shopId: this.shopId,
							exchangeId: this.gid.id
						}
					}).then((data) => {
						if (data && data.status) {
							this.status = data.status;
							if (this.status == 2) {
								this.showText = '兑换成功';
								this.$store.commit('setWin', {
									content: '兑换成功!'
								});
								this.gainRecord();
							} else if (this.status == 1) {
								this.showText = '管理员已扫';
							} else if (this.status == 3) {
								this.deleteStatus();
							}
						}
					}).catch(()=> {
						this.$store.commit('setWin', {
							content: '接口报错了'
						});
						Timer.clear(this.timer);
						this.timer = null;
					});

				}, 1000, 0, true);
			},
			async deleteStatus() {
				await http.deleteStatus({
					data: {
						shopId: this.shopId,
						exchangeId: this.gid.id
					}
				});
			},
			showWinError(content) { //  弹框类型判断方法
				this.$store.commit('setWin', {
					content: content,
					type: 'alert'
				});
			},
			openCom(com, id) { //  进入详细页面
				storage.session('goods', com);
				this.$router.push({
					path: '/detail',
					query: {
						comId: id,
						type: com.type,
						d: 2
					}
				}); //type 0 品牌 1 门店
			},
			async getUserInfo(shopId) { //  获取登录信息
				let loginInfo = storage.session('login');
				this.hostImg = global.getImgUrl();

				let res = await http.getUserInfo({
					data: {
						shopId: shopId,
						type: 3,
						from: 0
					}

				});
				Object.assign(res, loginInfo);
				storage.session('userInfo', res);
				this.gainRecord();
			},
			async gainRecord() {
				let res = await http.getListByMid({ //  获取列表展示数据
					data: {
						shopId: this.shopId,
						page: 1,
						num: 500
					}
				}, false, true);
				this.recordList = res.data.list;
				this.datas = utils.format(new Date(Number(res.time) * 1000), 'yyyy-MM-dd');
				for (let i = 0; i < this.recordList.length; i++) {
					if (this.recordList[i].expire != 0) {
						this.recordList[i].showExpire = utils.format((new Date(Number(this.recordList[i].expire) * 1000)), 'yyyy-MM-dd');
						// this.recordList[i].expire = utils.format((new Date(Number(this.recordList[i].expire) * 1000)),'yyyy-MM-dd');
						this.recordList[i].compare = new Date(this.recordList[i].showExpire) < new Date(this.datas);
						console.log(this.recordList[i].compare, 'compare');
					} else {
						this.recordList[i].compare = false;
					}
				}
				// Timer.clear(this.timer)
			},
			async getExchangeQR(code) { //  获取弹框img  url 地址
				let res = await http.getExchangeQR({
					data: {
						shopId: this.shopId,
						code: code
					}
				});
				this.codeUrl = res.url;
			}
		},
		mounted() {
			let userDate = storage.session('userInfo');
			let code = utils.getQueryString('code');
			storage.session('goodsInfo');
			if (!userDate) {
				this.getUserInfo(this.shopId, code);
			} else {
				this.hostImg = global.getImgUrl();
				this.fid = userDate.fid;
				this.Token = userDate.accessToken;
				this.gainRecord();
			}

			utils.setTitle('已换商品');
		},
		destroyed() {
			Timer.clear(this.timer);
			this.timer = null;

		},
		components: {
			win: () => import( /* webpackChunkName: "win" */ 'src/components/phone/win'),
		}
	};
</script>

<style lang="less" scoped>
	.whiteSpace() {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.texttype {
		text-align: center;
		height: 30px;
		line-height: 30px;
		font-size: 24px;
		float: left;
		width: 100%;
	}

	.container {
		.recerdTit {
			.comHeadHig {
				top: 24px;
			}
		}

		.comList {
			.conListImgWid {
				// width: 35%;
				width: 4rem;
				height: 2.6rem;

				img {
					padding: 0.1rem;
				}
			}

			.conListContent {
				width: 5rem;
				float: left;
				position: relative;

				.comGname {
					font-size: 0.38rem;
					color: #333;
					height: 0.72rem;
					width: 4rem;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: 0.72rem;
				}

				.comTitsPrice {
					width: 4.5rem;
				}

				.textSty {
					position: absolute;
					right: 0;
					top: 0;

					.textInfo {
						width: 1.6rem;
						position: absolute;
						top: -0.43rem;
						right: -0.26rem;
					}

					a {
						width: 30%;
						height: 100%;
					}
				}

				.textexpired {
					color: #737373;
					line-height: 0.6rem;
					height: 0.6rem;
				}

				.textexpiredTime {
					color: #737373;
					line-height: 0.6rem;
					height: 0.6rem;
				}
			}
		}
	}

	.recordFormContent {
		display: flex;
		flex-direction: column;
		padding-top: 27px;
		align-items: center;
		width: 70%;
		margin: 0 auto;
		text-align: center;
		font-size: 24px;

		.fImg {
			width: 100%;
			height: 140px;

			img {
				height: 100%;
			}
		}

		p:nth-child(1) {
			.texttype;
			color: green;
		}

		p:nth-child(2) {
			.texttype;
		}
	}

	.newStyle {
		width: 100%;
		height: 100%;
	}

	.conListInfo span.noused,
	.conListInfo span.aused,
	.conListInfo span.expired {
		display: inline-block;
		width: 100%;
		height: 70px;
		background-size: 1.67rem !important;
		background-position: center center !important;
	}

	.container .comList {
		width: 94%;
		height: auto;
		padding: 5px;
		box-sizing: border-box;
		background-color: #fff;
		border-top: none;
		border-bottom: 0.18rem solid #f2f2f2;
		font-size: 0;
		overflow: hidden;
		margin: 0 auto;
		height: 3rem;
	}

	.comExpired {
		height: 0.6rem;
	}

	.container .comList .conListContr .comCode,
	.container .comList .conListContr .jf {
		color: #f7c261;
		height: 0.56rem;
		line-height: 0.56rem;
	}

	.conListInfo span.noused.noused,
	.conListInfo span.aused.noused,
	.conListInfo span.expired.noused {
		background: url(../../../res/images/noused2.png) no-repeat;
	}

	.conListInfo span.noused.aused,
	.conListInfo span.aused.aused,
	.conListInfo span.expired.aused {
		background: url(../../../res/images/aused2.png) no-repeat;
	}

	.conListInfo span.noused.expired,
	.conListInfo span.aused.expired,
	.conListInfo span.expired.expired {
		background: url(../../../res/images/expired2.png) no-repeat;
	}
</style>