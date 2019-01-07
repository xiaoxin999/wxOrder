<template>
	<div id="user_consume">
		<header class="user_consume_header">
			<p>消费用户昵称: {{name}}</p>
		</header>
		<section class="user_consume_content">
			<div class="user_consume_content_price">
				<input type="text" maxlength="8" @blur="formatPrice" onkeyup="value=value.replace(/[^\d.]/g,'')" placeholder="请输入消费金额">
			</div>
			<div @click="selecrShop" class="user_consume_content_shop">
				<p>消费店铺:</p>
				<p>
					<span>{{shopName}}</span>
				</p>
				<img class="user_consume_icon" src="../../../res/icon/on.png" />
			</div>
			<p class="user_consume_content_linear"></p>
		</section>
		<footer class="user_consume_foot">
			<p @click="confirmConsurm(position)">{{position == 1 ?"确认消费":"发起审核"}}</p>
		</footer>
		<transition name="fade">
			<multi-picker v-if="isShow" :type="'select'" @closePicker="closePicker" :list="list" :title="'选择门店'">
			</multi-picker>
		</transition>
	</div>
</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';



	export default {
		data() {
			return {
				isShow: false,
				fromId: '', //  店铺id
				list: [], //  店铺数据
				fansId: '',
				shopId: storage.session('login').shopId,
				price: '', //  消费金额
				name: '', //  用户名称
				shopName: '', //   选择的商铺名称
				position: 1
			};
		},
		methods: {
			formatPrice(e) {
				let a = Number(e.target.value).toFixed(2);
				e.target.value = a;
				this.price = a;
			},
			selecrShop() {
				this.isShow = true;
				this.$store.commit('setOverHide', true);
			},
			closePicker(val) { //    关闭选择组件，选择数据
				this.isShow = false;
				if (val.type == 'sure') {
					this.shopName = this.shopList[val.payload[0]].shopName; //   获取店铺名称
					this.fromId = this.shopList[val.payload[0]].id; //   获取店铺id
				}
				this.$store.commit('setOverHide', false);
			},
			async getUserConsumInfo() {
				let res = await http.getUserConsumInfo({
					data: {
						shopId: this.shopId,
						fansId: this.fansId
					}
				});
				this.name = res.userInfo.name;
				this.shopList = res.consumShop;
				this.position = res.position;

				let list = [];
				for (let i of this.shopList) {
					list.push({
						name: i.shopName
					});
				}
				this.list = list;
			},
			async confirmConsurm() {

				if (this.fromId.trim() == '') {
					this.$store.commit('setWin', {
						content: '请选择消费店铺',
					});
					return;
				}
				if (!(/[\d\.]/g).test(this.price)) { // eslint-disable-line
					this.$store.commit('setWin', {
						content: '消费金额只能是数字',
					});
					return;
				}
				if (this.price.toString().trim() == '') {
					this.$store.commit('setWin', {
						content: '消费金额不能为空',
					});
					return;
				}
				if (this.price - 0 < 0.3 || this.price - 0 > 20000) {
					this.$store.commit('setWin', {
						content: '单笔提现金额应在0.3~20000元之间'
					});
					return;
				}
				let res = await http.confirmUserConsum({
					data: {
						fromId: this.fromId,
						fansId: this.fansId,
						price: this.price,
						shopId: this.shopId
					}
				});
				if (res) {
					this.$store.commit('setWin', {
						content: '提交审核成功',
						callBack: () => {
							this.$closeWindow();
						}
					});

				} else {
					this.$store.commit('setWin', {
						content: '提交审核失败'
					});
				}
			}
		},
		mounted() {

			this.fansId = utils.getQueryString('fansId');
			this.getUserConsumInfo();

			utils.setTitle('确认用户消费');

		},
		components: {
			'multi-picker': () => import( /* webpackChunkName: 'multipicker' */ 'src/components/multipicker/index')
		}
	};
</script>

<style lang="less" scoped>
	#user_consume {
		background: #fff;
		width: 100%;
		height: 100%;

		.user_consume_header {
			width: 100%;
			height: 1.8667rem;
			background: #fff;

			p {
				height: inherit;
				width: 100%;
				padding-left: 0.5867rem;
				font-size: 0.4rem;
				color: #303030;
				font-weight: 600;
				line-height: 1.8533rem;
			}
		}

		.user_consume_content {
			width: 100%;
			height: 3.72rem;

			.user_consume_content_price {
				height: 1.68rem;
				width: 100%;

				input {
					width: inherit;
					height: inherit;
					font-size: 0.4rem;
					background: #F8F8F8;
					padding: 0 0.5867rem;
					border: none;
				}
			}

			.user_consume_content_linear {
				height: 0.1067rem;
				width: 100%;
				background: #f8f8f8;
			}

			.user_consume_content_shop {
				width: 100%;
				height: 1.9733rem;
				font-family: PingFang-SC-Medium;
				background: #fff;
				display: flex;
				align-items: center;
				position: relative;

				&>p:nth-child(1) {
					font-size: 0.4rem;
					color: #303030;
					height: 1.9733rem;
					line-height: 1.96rem;
					margin-left: 0.5867rem;
					font-weight: bold;
				}

				&>p:nth-child(2) {
					position: relative;
					font-size: 0.4rem;
					color: #303030;
					height: 1.9733rem;
					line-height: 1.96rem;
					margin-left: 2.5333rem;
					font-weight: bold;
					display: flex;
					align-items: center;

				}

				.user_consume_icon {
					// width: 0.2533rem;
					position: absolute;
					top: 0.67rem;
					right: 1rem;
					align-items: center;

				}
			}
		}

		.user_consume_foot {
			width: 100%;
			// height: 100%;
			background: #fff;

			p {
				width: 3.04rem;
				height: 0.84rem;
				border-radius: 0.4267rem;
				background: #EAC048;
				line-height: 0.84rem;
				text-align: center;
				font-size: 0.3467rem;
				color: #fff;
				margin: 121px auto;
			}
		}
	}
</style>