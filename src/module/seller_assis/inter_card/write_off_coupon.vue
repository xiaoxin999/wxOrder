<template>
	<section class='inter_detail'>
		<!-- <div class='info'>
            {{getInfo(info.type)||"减"}} 
        </div> -->
		<div class="info" style="background: #00a0ea;" v-if="info.type == 1 || info.type == 2 || info.type == 8 || info.type == 11 || info.type == 9 && info.discountType ==2">
			<h1>减</h1>
		</div>
		<div class="info" style="background: #89b053;" v-if="info.type == 3 || info.type == 4 || info.type == 9 && info.discountType ==1">
			<h1>折</h1>
		</div>
		<div class="info" style="background: #ca5040;" v-if="info.type == 5">
			<h1>赠</h1>
		</div>
		<div class="info" style="background: #ca5040;" v-if="info.type == 10">
			<h1>送</h1>
		</div>
		<div class="info" style="background: #ebca0b;" v-if="info.type == 6 || info.type == 9 && info.discountType == 3">
			<h1>代</h1>
		</div>
		<div class='top'>
			<div>
				<span class='name'>{{info.couponName}}</span>
			</div>
		</div>
		<section class='detail'>
			<div>
				<div class='tips'>
					优惠券类型<br>

					我是一张{{couponType[info.type]}}券
				</div>
				<div class='time_out'>
					有效期<br>
					<!-- {{info.validityType == 1?getTime(info.endTime):getTime(info.startTime,info.endTime)}} -->
					{{getTime(info.startTime,info.endTime)}}
				</div>
			</div>
		</section>

		<section class='supple'>

			<template v-if="!noList">
				<div class='tit'>
					核销门店
				</div>

				<div v-if="shopName" class='name' @click="showPic">
					{{shopName}}&gt;
				</div>
				<div class='name line' @click="showPic" v-else>
					选择核销门店&gt;
				</div>
			</template>
			<template v-else>
				<div class='name line single' @click="showSL">查看优惠券适用门店&gt; </div>
			</template>


		</section>

		<section class='button' @click='use' :class="{isAllow:isAllow,noAllow:!isAllow}">
			确认核销
		</section>

		<transition name="fade">
			<picker v-if="showPicker" :list="allowSList" :returnValue="'index'" @closePicker="closePicker"></picker>
		</transition>

		<win :width="200" :height='120' :type="'alert'" @winEvent='winEvent' v-if='isSuccess'>
			<div slot="content" class='content'>
				<img src="../../../res/images/sell_assis/success.png" alt="">
				<div>核销成功！</div>
			</div>
		</win>

		<div class='tips' v-if="showTips">
			<img src="../../../res/images/sell_assis/warning.png" alt="">
			你没有该优惠券核销权限，请检查该<span>优惠券适用门店</span>。
		</div>

	</section>
</template>


<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';
	import global from 'src/manager/global';


	export default {
		data() {
			return {
				fansId: null,
				couponCode: null,
				isAllow: false,
				info: {},
				couponType: {
					1: '单品减免',
					2: '整单减免',
					3: '单品打折',
					4: '整单打折',
					5: '赠菜',
					6: '代金',
					7: '积分卡',
					8: '随机立减券',
					9: '第二件商品半价',
					10: '买送券',
					11: '定额券'
				},
				isSuccess: false,
				allowSList: [],
				noList: true,
				allShopList: [],
				shopName: '',
				showPicker: false,
				id: '',
				showTips: false
			};
		},
		methods: {
			closePicker(obj) {
				let {
					type,
					data
				} = obj;
				if (type == 'ok') {
					this.shopName = this.allowSList[data[0]].name;
					this.id = this.allowSList[data[0]].id;
				}
				this.showPicker = false;
			},
			showSL() {
				this.$router.push('/applicationStore');
			},
			showPic() {
				this.showPicker = true;
			},
			winEvent() {
				this.isSuccess = false;
				this.$closeWindow();
			},
			// getInfo(str){
			//     if(str == 1||str==2){
			//         return '减'
			//     }else if(str == 3||str==4){
			//         return '折'
			//     }else if(str == 5){
			//         return '赠'
			//     }else if(str == 6){
			//         return '代'
			//     }
			//     return '';
			// },
			//检查是否有权限核销
			async checkoutAllow() {
				try {
					let data = await http.couponVerificationSheet({
						data: {
							fansId: this.fansId,
							couponCode: this.couponCode,
							checkPermission: 1,
							shopId: global.getShopId()
						}
					}, true);

					this.isAllow = data.flag;
					//取得优惠券数据
					this.info = data.couponInfo;
					//允许的店铺列表
					this.allowSList = data.useShopIds.split(',');

					// this.allShopList
					//取权限和所有店铺列表的并集
					let unionList = [];

					for (let i = 0; i < this.allShopList.length; i++) {
						let item = this.allShopList[i];
						for (let j = 0; j < this.allowSList.length; j++) {
							let item1 = this.allowSList[j];
							if (item.id == item1) {
								unionList.push(item);
							}
						}
					}

					let L = unionList.length;
					if (L > 0) {
						if (L == 1) {
							this.shopName = unionList[0].name;
							this.id = unionList[0].id;
						}
						this.noList = false;
					} else {
						this.noList = true;
						this.showTips = true;
					}
					this.allowSList = unionList;

				} catch (e) {
					if (e.error.code == 4563 || e.error.code == 4123) {
						this.loading = false; //蒙层状态
						this.$store.commit('setWin', {
							content: '你没有权限',
							title: '操作提示',
							winType: 'alert',
							callback: (val) => {
								if (val == 'ok') {
									window.close();
								}
							}
						});
						return false;
					}
				}
			},
			getTime(...arg) {
				let s = '';

				for (let item of arg) {
					s += '至' + utils.format(item, 'yyyy/MM/dd');
				}
				return s.substr(1);
			},
			async use() {
				if (this.isAllow) {
					let data = await http.couponVerificationSheet({
						data: {
							fansId: this.fansId,
							couponCode: this.couponCode,
							checkPermission: 0,
							shopId: global.getShopId(),
							useShopId: this.id
						}
					});
					if (data) this.isSuccess = true;
				}
			}
		},
		components: {
			'win': () => import( /* webpackChunkName: 'win' */ 'src/components/phone/win'),
			'picker': () => import( /* webpackChunkName:'picker' */ 'src/components/picker/picker')
		},
		async mounted() {
			utils.setTitle('核销优惠券');

			let data = await http.getUserInfo({
				data: {
					shopId: global.getShopId(),
					type: 5,
					from: 0
				}
			});
			this.allShopList = data.shopList;
			storage.session('shopList', this.allShopList);
			storage.session('membership', data);

			this.couponCode = utils.getQueryString('couponCode');
			this.fansId = utils.getQueryString('fansId');

			this.checkoutAllow();
		}
	};
</script>

<style lang='less' scoped>
	.inter_detail {
		width: 9.2933rem;
		height: 11.72rem;
		background: #FFFFFF;
		border: 1px solid #DDDDDD;
		border-radius: .2667rem;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		margin: auto;

		.content {

			width: 60%;
			margin: 0.5rem auto;
			text-align: center;

			img {
				width: 1rem;
				height: 1rem;
			}

			&>div {
				margin-top: 0.32rem;
			}
		}

		&>.info {
			width: 1.92rem;
			height: 1.92rem;
			border-radius: 50%;
			background: #00A0EA;
			position: absolute;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
			line-height: 1.92rem;
			font-size: 0.96rem;
			color: #FFFFFF;
		}

		.top {
			height: 3.4667rem;
			width: 8.5733rem;
			margin: 0 auto;
			border-bottom: 3px dashed #DDDDDD;
			display: table;

			&>div {
				display: table-cell;
				vertical-align: middle;
				text-align: center;
				padding-top: 1rem;

				.name {
					font-family: PingFang-SC-Semibold;
					font-size: .48rem;
					color: #303030;
				}

			}

		}

		section.detail {
			width: 8.5733rem;
			margin: 0 auto;
			border-bottom: 3px dashed #DDDDDD;
			font-size: 0.3467rem;
			color: #303030;
			font-weight: bold;

			.tips {

				text-align: center;
				margin-top: 1rem;
			}

			.time_out {
				margin: 1.2rem auto;
			}

			&>div {
				width: 90%;
				margin: 0 auto;
				text-align: center;

			}


		}

		section.supple {

			height: 2.84rem;
			width: 8.5733rem;
			margin: 0 auto;
			color: #999999;
			display: table-cell;
			padding-left: 0.3rem;
			text-align: center;

			div.tit {
				font-size: 0.3467rem;
				color: #303030;
				text-align: center;
				line-height: 1.42rem;
				font-weight: bold;
			}

			div.name {
				font-size: 0.3467rem;
				color: #00A0EA;

			}

			div.line {
				text-decoration: underline;
			}

			div.single {
				height: 2.84rem;
				line-height: 2.84rem;
			}

			div {
				height: 1.42rem;
			}

		}

		.isAllow {
			background: #EAC048;
		}

		.noAllow {
			background: #C7C7C7;
		}

		.button {

			border-radius: 1.3333rem;
			width: 4.5067rem;
			height: 1.04rem;
			line-height: 1.04rem;
			font-size: 0.48rem;
			color: #FFFFFF;
			position: absolute;
			left: 0;
			right: 0;
			margin: -0.45rem auto;
			text-align: center;
		}

		&>div.tips {
			position: fixed;
			top: 0;
			left: 0;
			height: 1.0133rem;
			background-color: rgba(209, 7, 32, 0.2);
			width: 100%;
			font-size: 0.32rem;
			color: #303030;
			text-align: center;
			line-height: 1.0133rem;

			img {
				width: 0.4rem;
				height: 0.3467rem;
				position: absolute;
				margin: 0.28rem 0 0 -0.55rem;
			}

			span {
				color: rgb(211, 79, 93)
			}
		}
	}
</style>