/*
* @Author: lhl
* @Date: 2018-06-21 16:45:14
* @Module: {套餐列表}
*/
<template>
	<div class="tableList">
		<div class="header">
			<img src="../../../../res/images/recurrence.png" alt="" class="fdj" @click='$router.go(-1)'>
			<span class="input_box">{{packages.packageName}}</span>
		</div>
		<div v-if='!noData'>
			<img src="../../../../res/images/sou_01.png" alt="">
		</div>
		<div class="goods-content">

			<div class="goodsList" v-for='(i,index_i) in packages.packageTag' :key="index_i">
				<p class="p_tit">———— {{i.tagName}} ( {{i.goods.length}} 款中选{{i.totalNum}}项 ) ————</p>
				<orderList v-if='noData' v-for='(item,index) in i.goods' :packages="packages" :type='2' :obj='item' :key="index" @packagesGoods="packagesGoods" @openSpecialDetail="openSpecialDetail">
				</orderList>

			</div>
		</div>
		<div class="footer">
			<div class="packages-price">￥<em>{{packages.price}}</em>元</div>
			<div class="add-to-cart" @click="addTocart">加入购物车</div>
		</div>
		<transition name="fade">
			<specialDetail :obj="goods" :isEdit="goods.isEdit" :isPackages="true" :type='2' @chooseTaste="chooseTaste" @delTaste="delTaste" v-if="$store.state.order.openPackageDeail">
			</specialDetail>
		</transition>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	export default {
		data() {
			return {
				searchBox: '',
				noData: true,
				showDe: false,
				open: false,
				packages: {},
				goods: {},
				packageIndex: {
					'packageTag': {},
					'goods': {}
				},
				tagGoodsNum: {}
			};
		},
		methods: {
			closeBtn() {
				this.searchBox = '';
			},
			packagesGoods(obj) {
				// 接收商品加减数据
				let {
					packageTagIndex,
					goodsIndex
				} = this.getIndex(obj.packageTagId, obj.packageTagId + obj.id);
				let packageTag = this.packages.packageTag[packageTagIndex];
				if (packageTag.optionalNum - 0 >= packageTag.totalNum - 0 && obj.operationType == 'add') {
					this.$store.commit('setWin', {
						content: '已经不能再选了'
					});
					return false;
				}

				if (obj.num >= obj.packageGoodsNum && obj.operationType == 'add') {
					this.$store.commit('setWin', {
						content: '该商品已达到最大数量'
					});
					return false;
				}

				this.addTagMaxNum(obj);

				packageTag.optionalNum = this.getTagMaxNum(obj.packageTagId);
				packageTag.goods.splice(goodsIndex, 1, utils.deepCopy(obj));
			},
			openSpecialDetail(obj) {
				// 打开口味弹窗
				let {
					packageTagIndex
				} = this.getIndex(obj.packageTagId, obj.packageTagId + obj.id);
				let packageTag = this.packages.packageTag[packageTagIndex];
				let str = '';
				if (Number(obj.num) >= Number(obj.packageGoodsNum) && obj.isEdit == false) {
					str = '该商品已达到最大数量';
				}
				if (Number(packageTag.optionalNum) >= Number(packageTag.totalNum) && obj.isEdit == false) {
					str = '已经不能再选了';
				}
				if (Number(packageTag.optionalNum) >= Number(packageTag.totalNum) && obj.isEdit == false) {
					str = '已经不能再选了';
				}

				if (str != '') {
					this.$store.commit('setWin', {
						content: str
					});
					return false;
				}


				if (obj.isEdit) {
					obj.attr = obj.attrList[obj.editIndex].attr;
				}
				this.goods = utils.deepCopy(obj);
				this.$store.commit('setOpenPackageDeail', true);
			},
			delTaste(obj) {
				// 删除口味
				let {
					packageTagIndex,
					goodsIndex
				} = this.getIndex(obj.packageTagId, obj.packageTagId + obj.id);
				let packageTag = this.packages.packageTag[packageTagIndex];
				packageTag.optionalNum--;
				let goods = packageTag.goods[goodsIndex];
				goods.num--;
				goods.operationType = 'taste';
				goods.attrList.splice(obj.editIndex, 1);

				packageTag.goods.splice(goodsIndex, 1, utils.deepCopy(goods));
				this.addTagMaxNum(goods);
				this.$store.commit('setOpenPackageDeail', false);
			},
			chooseTaste(obj) {
				// 接收口味信息
				let {
					type,
					data
				} = obj;
				if (type == 'ok') {
					let {
						attr
					} = data;

					let {
						packageTagIndex,
						goodsIndex
					} = this.getIndex(data.packageTagId, data.packageTagId + data.id);

					let packageTag = this.packages.packageTag[packageTagIndex];
					let goods = packageTag.goods[goodsIndex];
					goods.attrList = goods.attrList || [];
					goods.operationType = 'taste';

					let packageGoodsNum = this.tagGoodsNum[packageTag.id];
					let goodsNum = packageGoodsNum ? packageGoodsNum[goods.id] : 0;

					if (data.isEdit) {
						goods.attrList.splice(data.editIndex, 1, {
							'showAttr': !!(data.attrInfo != ''),
							'attr': attr
						});
					} else {
						goods.num = goodsNum ? ++goodsNum : 1;
						goods.attrList.push({
							'showAttr': !!(data.attrInfo != ''),
							'attr': attr
						});
					}

					packageTag.optionalNum = ++packageTag.optionalNum || 1;
					packageTag.goods.splice(goodsIndex, 1, utils.deepCopy(goods));
					this.addTagMaxNum(goods);
				}
				this.$store.commit('setOpenPackageDeail', false);
			},
			addTagMaxNum(obj) {
				// 设置改套餐下的可选数量

				let item = this.tagGoodsNum[obj.packageTagId];
				obj.num = obj.operationType == 'taste' ? obj.num : (obj.operationType == 'add') ? Number(obj.num) + 1 : obj.num - 1;
				if (item) {
					item[obj.id] = obj.num;
				} else {
					this.tagGoodsNum[obj.packageTagId] = {};
					this.tagGoodsNum[obj.packageTagId][obj.id] = obj.num;
				}
			},
			getIndex(packageTagId, gid) {
				// 返回下标位置

				let obj = {
					'packageTagIndex': this.packageIndex.packageTag[packageTagId],
					'goodsIndex': this.packageIndex.goods[packageTagId, gid]
				};
				return obj;
			},
			getTagMaxNum(tagId) {
				// 获取该tag下的商品总数量
				let numList = Object.values(this.tagGoodsNum[tagId]);
				let sum = numList.reduce(function(prev, cur) {
					return Number(prev) + Number(cur);
				});
				return sum;
			},
			addTocart() {
				// 加入购物车
				let packages = this.packages;
				packages.num = 1;

				// 固定套餐
				let {
					packageTag
				} = packages;
				packages.packageKey = '';
				// console.log(packageTag);
				for (let i = 0, len = packageTag.length; i < len; i++) {
					let tags = packageTag[i];

					let {
						goods
					} = packageTag[i];
					for (let j = 0; j < goods.length; j++) {
						//固定
						if (packages.type == '0') {
							goods[j].num = goods[j].packageGoodsNum;
							packages.packageKey += goods[j].key ? goods[j].key : '';
						} else {
							if (tags.optionalNum == undefined || (Number(tags.optionalNum) < Number(tags.totalNum))) {
								this.$store.commit('setWin', {
									content: `${tags.tagName}标识下，还有商品尚未选购。`
								});
								return false;
							}

							if (goods[j].num == undefined || goods[j].num == 0) {
								goods.splice(j, 1);
								j--;
							} else {
								packages.packageKey += goods[j].key ? goods[j].key : '';
							}
						}
					}
				}

				packages.packageKey = utils.getHash(packages.packageKey);
				let obj = {
					'data': packages,
					'operateObj': 'carPackageList'
				};
				this.$store.commit('setCarList', obj);
				this.$router.push('/latestOrder');
			}
		},
		mounted() {
			this.packages = storage.session('goodsPackges');
			let {
				packageTag
			} = this.packages;
			for (let i = 0, len = packageTag.length; i < len; i++) {
				let item = packageTag[i],
					{
						goods
					} = item;
				this.packageIndex.packageTag[item.id] = i;
				for (let j = 0, lens = goods.length; j < lens; j++) {
					this.packageIndex.goods[item.id + goods[j].id] = j;
				}
			}
		},
		components: {
			orderList: () => import( /* webpackChunkName: 'order_item' */ '../order/order_item'),
			goodsdetail: () => import( /* webpackChunkName: 'goods_detail' */ '../order/good_detail'),
			specialDetail: () => import( /* webpackChunkName: 'special_detail' */ '../order/special_detail'),
		}
	};
</script>
<style lang='less' scoped>
	.tableList {
		background: #fff;
		height: 100%;

		.p_tit {
			text-align: center;
			background: #fff;
			color: #8e8e8e;
			height: 1.44rem;
			line-height: 1.1733rem;
			border-bottom: .0133rem solid #eaeaea;
			border-top: 0.2667rem solid #f2f2f2;
		}

		.header {
			width: 100%;
			height: 1.2rem;
			text-align: center;
			display: -webkit-box;
			display: -webkit-flex;
			display: flex;
			-webkit-box-align: center;
			-webkit-align-items: center;
			align-items: center;
			background: #fff;

			.fdj {
				width: 0.2667rem;
				height: 0.4667rem;
				margin-left: 0.2rem;
			}

			.input_box {
				display: inline-block;
				width: 92%;
			}

			.close_cha {
				width: 0.4rem;
				height: 0.4rem;
				position: relative;
				top: 0.12rem;
				right: 0.82rem;
			}

			.close_qu {
				color: #FCAE02;
				font-size: 0.4rem;
				position: relative;
				right: 0.2rem;
			}
		}
	}

	.showDe {
		// position: absolute;
		top: 2.8rem;
		height: auto;
		line-height: 1rem;
		background: #f2f2f2;
		width: 100%;
		padding: 0.2rem;
		font-size: 0.3467rem;
		color: #8f8f8f;

		ul {
			li {
				position: relative;
				display: flex;
				align-items: center;

				span:nth-child(1) {
					position: absolute;
					right: 2rem;
					top: 0;
				}

				span:nth-child(2) {
					background: #FCAE02;
					border-radius: 1.3333rem;
					width: 1.3333rem;
					height: 0.6533rem;
					position: absolute;
					right: 0;
					color: #fff;
					text-align: center;
					line-height: 0.6533rem;
					top: 0.2rem;

				}
			}

		}
	}

	.footer {
		width: 100%;
		height: 1.4267rem;
		line-height: 1.4267rem;
		background: #FFFFFF;
		box-shadow: 0 0 .0667rem 0 #F1F1F1;
		position: fixed;
		left: 0;
		bottom: 0;
		font-size: 0;
		z-index: 0;

		.packages-price {
			width: calc(~"100% - 2.8rem");
			font-family: PingFangSC-Medium;
			font-size: .2933rem;
			color: #FF2035;
			text-indent: .4rem;

			em {
				font-size: .4rem;
			}
		}

		.add-to-cart {
			background-image: linear-gradient(90deg, #fec205 0%, #fcae02 100%);
			font-family: PingFangSC-Medium;
			font-size: .4rem;
			color: #FFFFFF;
			letter-spacing: 0;
			text-align: center;
			width: 2.8rem;
		}

		.packages-price,
		.add-to-cart {
			display: inline-block;
		}
	}

	.goods-content {
		height: calc(~"100% - 2.6267rem");
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}
</style>