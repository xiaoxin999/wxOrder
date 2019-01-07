<template>
	<div class="chose_card">
		<div class="header"></div>
		<div class="content">
			<div class="item" v-for="(item,index) in cardList" :key="index" @click="item.applyShopIds?choseCard(item):unUse(item)">
				<div v-if="item.memberType == 0" class="card_title">{{item.level.name || '基础卡'}}</div>
				<div v-else-if="item.memberType == 1" class="card_title">{{item.cardTypeName || item.levelName}}</div>
				<div class="fl card_balance">可用余额：￥{{item.totalAmount}}</div>
				<div v-if="item.memberType == 0" class="fr card_discount">{{item.level.discount / 10}}折</div>
				<div v-if="item.memberType == 1" class="fr card_discount">{{item.discount / 10}}折</div>
			</div>
		</div>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';

	export default {
		data() {
			return {
				cardList: []
			};
		},
		methods: {
			choseCard(item) {
				item.name = item.cardTypeName || item.levelName;
				item.cardId = item.id || '';
				let level = storage.session('memberLevel');
				if (item.name != level.name) {
					storage.session('couponOn', null);
				}
				storage.session('level', item);
				this.$router.push('/preferentialPay');
			},
			unUse(item) {
				let unshop = storage.session('unshop');
				let status = storage.session('status')?storage.session('status'):'';
				this.choseCard(item);
				if (unshop) {
					this.choseCard(item);
				} else {
					if (status && status == 2) {
						this.choseCard(item);
					} else {
						this.$store.commit('setWin', {
							content: '该电子卡不适用此门店',
							callback: () => {
								this.$closeWindow();
							}
						});
					}

				}
			}
		},
		components: {},
		computed: {},
		mounted() {
			let list = storage.session('cardList');
			let arr = [];
			for (let item of list) {
				console.log(item.applyShopIds);
				if (item.memberType == 1) {
					let applyShopIds = item.applyShopIds.split(',');
					if (applyShopIds.indexOf(this.shopId + '') != -1) {
						arr.push(item);
					}
				} else {
					arr.push(item);
				}
			}

			this.cardList = arr;
			console.log(this.cardList, 'cardList');
			utils.setTitle('选择会员卡');
		}
	};
</script>
<style lang='less' scoped>
	@import '../../../res/css/base.less';

	.chose_card {
		.setBox(100%, auto);
		min-height: 100%;
		background-color: #fff;

		.header {
			.setBox(100%, 1.52rem);
			background: url(../../../res/images/chose_card_bg.png) center center no-repeat;
			background-size: cover;
		}

		.content {
			margin: 0 auto;
			padding: .3333rem;
			overflow: hidden;

			.item {
				.setBox(9.3333rem, 2.5067rem);
				background: #F8F8F8;
				border: .0133rem solid #DDDDDD;
				text-indent: .4667rem;
				padding-right: .8rem;
				margin-bottom: .32rem;

				.card_title {
					.setBox(100%, 1.48rem);
					line-height: 1.48rem;
					font-size: .4rem;
					color: #303030;
				}

				.card_balance {
					font-size: .32rem;
					color: #EAC048;
				}

				.card_discount {
					opacity: 0.3;
					font-size: .56rem;
					color: #303030;
				}
			}
		}
	}
</style>