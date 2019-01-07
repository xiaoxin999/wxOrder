<template>
	<div id="packages" v-cloak>
		<div class="package">
			<div class="package-tit">{{packageTitle}}
				<span class="previousPage fl" @click="openOrder"></span>
			</div>
			<!-- 可选套餐 -->
			<template v-if='Multiselect'>
				<div class="package-head">
					<span v-for="(subhead,i) in packageSub" :class="subhead.isOn == true ? 'on' : ''" @click="toogleSub(i,subhead)" :key="i">{{subhead.tagName}}</span>
				</div>
				<template v-for="(tagGoods,i) in packageGoods">
					<div class="package-subhead" :key="'0_'+i">{{tagGoods.tagName}}{{tagGoods.goods.length}}选{{tagGoods.totalNum}}</div>
					<div class="package-list" :key="'1_'+i">
						<ul>
							<li v-for="(goods,j) in tagGoods.goods" :key="j + '_goods'">
								<span class="goods_name">{{goods.goodsName}}</span>
								<span class="goods_num">(可选{{goods.packageGoodsNum}}份)</span>
								<span class="taste" v-if="goods.isAttr">口味</span>
								<div class="fr subAddBox">
									<span class="fr packageAdd" @click="addPackageNum(j,goods,'add')"></span>
									<span class="fr" v-if="goods.num >= 1">{{goods.num}}</span>
									<span class="fr packageSub" v-if="goods.num >= 1" @click="addPackageNum(j,goods,'del')"></span>
								</div>
								<template v-for="(attr,k) in goods.attrList">
									<div class="package-attr" :key="k+'_tem'" v-if="goods.isAttr && attr.attrs && attr.attrs.length >= 1">
										<span class="fl attr-name">
											<template v-for="(attrLsit,h) in attr.attrs">
												<template v-for="(options,g) in attrLsit.options" v-if="options.attrStatu">
													<p class="fl" :key="h+'_'+g+'_1'">{{options.name}}</p>
													<p :key="h+'_'+g+'_2'" class="fl attr_hido">/</p>
												</template>
											</template>
										</span>
										<span class="fl attr-name shoName" v-if="attr.showAttr">无口味</span>
										<div class="add_remove fr" :key="k+'_a'">
											<span class="fr attr-revise" @click="openAttr(k,goods)">修改</span>
										</div>
									</div>
								</template>
							</li>
						</ul>
					</div>
				</template>
			</template>
			<!-- 固定套餐 -->
			<template v-else>
				<template v-for="packageTag in fixedPackages">
					<div class="package-subhead" :key="packageTag.tagName + random()">{{packageTag.tagName}}{{packageTag.goods.length}}选{{packageTag.totalNum}}</div>
					<div class="package-list" :key="packageTag.goods + random()">
						<ul>
							<li v-for="goods in packageTag.goods" :key="goods.goodsName + random()">
								<span class="goods_name">{{goods.goodsName}}</span>
								<span class="goods_num">({{goods.packageGoodsNum}}份)</span>
								<span class="taste" v-if="goods.isAttr">口味</span>
								<button class="fr optAttr" v-if="goods.isAttr" :style="{background:'#f5a623'}" @click="openAttr('',goods,'add')">选择口味</button>
								<template v-for="(attr,k) in goods.attrList">
									<div class="package-attr" v-if="goods.isAttr && attr.attrs && attr.attrs.length >= 1" :key="'pack_attr_'+k">
										<span class="fl attr-name">
											<template v-for="(attrLsit,h) in attr.attrs">
												<template v-for="(options,g) in attrLsit.options" v-if="options.attrStatu">
													<p class="fl" :key="'attr_p1_'+h+'_'+g">{{options.name}}</p>
													<p class="fl attr_hido" :key="'attr_p2_'+h+'_'+g">/</p>
												</template>
											</template>
										</span>
										<span class="fl attr-name shoName" v-if="attr.showAttr">无口味</span>
										<div class="add_move">
											<span class="fr attr-revise" @click="openAttr(k,goods)">修改</span>
										</div>
									</div>
								</template>
							</li>
						</ul>
					</div>
				</template>
			</template>
			<a href="javascript:void(0)" class="package-sub" @click="conservationPackages">提交</a>
		</div>
		<!-- 选中商品的口味 -->
		<transition name="fade">
			<attr-win v-if="isAttrWin" :packagesAttr="packagesAttr" @isChangeAttr="isChangeAttr" :Multiselect="Multiselect" @changePackagesAttr="changePackagesAttr"
			    :packageGoods="packageGoods" :fixedPackages="fixedPackages" :packageSub="packageSub" :isRevise="isRevise">
			</attr-win>
		</transition>

		<div class="packagePopWin" v-if="goodsNumMax">
			<div class="packagePop">
				<div class="Pop-icon"></div>
				<h3>{{goodsTit}}</h3>
				<p>{{goodsSub}}</p>
			</div>
		</div>
	</div>
</template>
<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';

	let orderData = null;

	export default {
		data() {
			return {
				Multiselect: false, //是否为可选套餐
				packageTitle: '固定套餐', //套餐类型 默认固定套餐
				fixedPackages: [], //固定套餐数据
				packages: [], //套餐总数据
				packageGoods: [], //套餐中的商品
				packageSub: [], //可选套餐副标题
				packagesAttr: [], //套餐口味
				isAttrWin: false, //是否打开口味弹窗
				goodsNumMax: false, //是否达到商品最大数量
				goodsTit: '不能在加了', //提示标题
				goodsSub: '请选择其他标识或提交', //提示信息
				isRevise: false, //是否为修改口味
				parentIndex: 0, //口味父级index
				attrIndexObj: {}, // 保存口味下标
				goodsMaxnum: 0, // 最多可选中商品数量
				subHadeIndex: 0 //选中的标识index
			};
		},
		methods: {
			isChangeAttr(val) {
				if (val.type === 'packageGoods') {
					this.packageGoods = val.payload.packageGoods;
				} else if (val.type === 'fixedPackages') {
					this.fixedPackages = val.payload.fixedPackages;
				} else {
					this.isAttrWin = false;
					this.isRevise = val.payload.isRevise;
				}
				this.isAttrWin = false;
			},
			changePackagesAttr(val) {
				this.packagesAttr = val;
			},
			random() {
				// 生成一个随机数，避免key值重复
				return Math.random();
			},
			openOrder: function () {
				// 回到主页面
				this.$router.push({
					path: '/order'
				});
			},
			toogleSub: function (i, subDetail) {
				//切换副标题与商品
				let subId = subDetail.id;
				let arr = this.packageSub;
				for (let j = 0; j < arr.length; j++) {
					arr[j].isOn = false;
					if (arr[j].id == subId) {
						arr[j].isOn = true;
						this.packageGoods = [];
						this.packageGoods.push(arr[j]);
					}
				}
				this.packageSub = utils.deepCopy(arr);
				this.subHadeIndex = i;
			},
			isAttr: function (goods) {
				//判断该商品是否有口味
				if (goods.onAttr || goods.attrList.length == goods.packageGoodsNum) {
					return false;
				} else {
					return true;
				}
			},
			openAttr: function (i, goods, type) {
				// this.parentIndex = i;
				//打开套餐口味弹窗
				if (type == 'add') {
					// 添加口味
					if (goods.isAttr) {
						let arr = goods.attr;
						for (let i = 0; i < arr.length; i++) {
							for (let j = 0; j < arr[i].options.length; j++) {
								arr[i].options[j].attrStatu = false;
							}
						}
						this.isRevise = false;
					}
				} else {
					// 修改口味
					this.isRevise = true;
					goods.attr = utils.deepCopy(goods.attrList[i].attrs);
				}
				this.packagesAttr = [];
				this.packagesAttr.push(utils.deepCopy(goods));
				this.isAttrWin = true;
				this.goodsMaxnum = goods.packageGoodsNum;
			},
			addPackageNum: function (j, goods, type) {
				//选择可选套餐商品数量
				let numMax = this.packageGoods[0].totalNum;
				// 根据type值判断为添加还是删除
				if (type == 'add') {
					if (goods.num >= goods.goodsNum) {
						let content = goods.goodsName + '数量仅剩' + goods.goodsNum + '份';
						this.$store.commit('setWin', {
							content: content
						});
						return false;
					}
					let packageGoods = this.packageGoods[0].goods;
					let num = 0;
					for (let k = 0; k < packageGoods.length; k++) {
						num += Number(packageGoods[k].num);
						// 判断商品总数量是否超出套餐可选数量
						if (num >= numMax) {
							this.goodsNumMax = true;
							this.goodsTit = '不能再加了';
							this.goodsSub = '已达到最大数量';
							setTimeout(() => {
								this.goodsNumMax = false;
							}, 1000);
							return false;
						}
					}
					if (goods.num >= goods.packageGoodsNum) {
						this.goodsNumMax = true;
						this.goodsTit = '不能再加了';
						this.goodsSub = '请选择其它标识';
						setTimeout(() => {
							this.goodsNumMax = false;
						}, 1000);
						return false;
					} else {
						if (!utils.isEmptyObject(goods.attr)) {
							this.openAttr('', goods, 'add');
							return false;
						}
						goods.num++;
					}
					// 保存套餐数据
					let tagGoods = this.packageSub;
					tagGoods[this.subHadeIndex].goods = utils.deepCopy(this.packageGoods[0].goods);
				} else {
					if (Number(goods.num) <= 0) {
						this.goodsNumMax = true;
						this.goodsTit = '不能再减了';
						this.goodsSub = '已达到最小数量';
						setTimeout(() => {
							this.goodsNumMax = false;
						}, 1000);
						return false;
					} else {
						if (utils.isEmptyObject(goods.attr)) {
							goods.num--;
							// 保存套餐数据
							let tagGoods = this.packageSub;
							for (let h = 0; h < tagGoods.length; h++) {
								for (let k = 0; k < tagGoods[h].goods.length; k++) {
									if (
										goods.id == tagGoods[h].goods[k].id &&
										goods.packageTagId == tagGoods[h].goods[k].packageTagId
									) {
										tagGoods[h].goods[k] = utils.deepCopy(goods);
									}
								}
							}
						} else {
							this.goodsNumMax = true;
							this.goodsTit = '不能减了';
							this.goodsSub = '请去修改口味弹窗中删除';
							setTimeout(() => {
								this.goodsNumMax = false;
							}, 1000);
							return false;
						}
					}
				}
				// this.packageGoods[0].goods.$set();
				this.$set(this.packageGoods[0].goods, j, utils.deepCopy(goods));
			},
			conservationPackages: function () {
				// 保存套餐数据提交到购物车
				this.packages.num = 1;
				this.packages.packageKey = this.packages.id;
				if (this.Multiselect) {
					//可选套餐
					let arr = this.packages.packageTag;
					let numMax = 0; //套餐可选总数量
					let num = 0; //商品已选数量
					for (let i = 0; i < arr.length; i++) {
						arr[i] = utils.deepCopy(this.packageSub[i]);
						this.packages.packageKey += arr[i].id;
						numMax += Number(arr[i].totalNum);
						for (let j = 0; j < arr[i].goods.length; j++) {
							num += Number(arr[i].goods[j].num);
							arr[i].goodsLength = arr[i].goods[j].length;
							if (arr[i].goods[j].num > 0) {
								this.packages.packageKey += arr[i].goods[j].id + arr[i].goods[j].attrKye;
							}
						}
					}


					if (num < numMax) {
						this.goodsNumMax = true;
						this.goodsTit = '还没选完呢';
						this.goodsSub = '还有标识下可选商品';
						setTimeout(() => {
							this.goodsNumMax = false;
						}, 1000);
						return false;
					}

					// 删除多余商品
					for (let i = 0; i < arr.length; i++) {
						for (let j = 0; j < arr[i].goods.length; j++) {
							if (arr[i].goods[j].num == '0') {
								arr[i].goods.splice(j, 1);
								j--;
							}
						}
					}
				} else {
					//固定套餐
					let arr = this.packages.packageTag;
					let arr1 = this.fixedPackages;
					for (let k = 0; k < arr1.length; k++) {
						this.packages.packageKey += arr1[k].id;
						for (let h = 0; h < arr1[k].goods.length; h++) {
							if (arr1[k].goods[h].num == '0') {
								arr1[k].goods[h].num = arr1[k].goods[h].packageGoodsNum;
							}
							arr1[k].goodsLength = arr1[k].goods.length;
							this.packages.packageKey += arr1[k].goods[h].id + arr1[k].goods[h].attrKye;
						}
					}
					for (let i = 0; i < arr.length; i++) {
						arr[i] = utils.deepCopy(this.fixedPackages[i]);
					}
				}
				this.packages.packageKey = utils.getHash(this.packages.packageKey);
				let pl = utils.deepCopy(this.packages);
				for (let i = 0; i < pl.packageTag.length; i++) {
					let gl = [];
					for (let j = 0; j < pl.packageTag[i].goods.length; j++) {
						if (pl.packageTag[i].goods[j].attrList.length > 0) {
							for (
								let k = 0; k < pl.packageTag[i].goods[j].attrList.length; k++
							) {
								let g = utils.deepCopy(pl.packageTag[i].goods[j]);
								g.attr = pl.packageTag[i].goods[j].attrList[k].attrs;
								g.num = 1;
								gl.push(g);
							}
						} else {
							gl.push(pl.packageTag[i].goods[j]);
						}
					}
					pl.packageTag[i].goods = gl;
				}
				let sendP = utils.deepCopy(pl);
				// 回到主页面

				let packages = {
					data: sendP, // 商品数据
					operateType: 'push', // 操作类型
					operateObj: 'carPackageList' // 操作对象
				};
				this.$store.commit('setCarList', packages);
				this.$router.push({
					path: '/order'
				});
			}
		},
		
		async mounted() {
			storage.session('packagePage', true);

			orderData = await
			import ( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;

			let packagesList = storage.session('searchPackage'); //获取传递过来的套餐数据
			if (packagesList) {
				let tagPackages = packagesList.packageTag;
				for (let i = 0; i < tagPackages.length; i++) {
					tagPackages[i].isOn = false;
					tagPackages[0].isOn = true;
					let goods = tagPackages[i].goods;
					for (let j = 0; j < goods.length; j++) {
						goods[j].num = '0';
						goods[j].attrList = [];
						
						let attrs = goods[j].attr;
						if (attrs) {
							for (let k = 0; k < attrs.length; k++) {
								for (let h = 0; h < attrs[k].options.length; h++) {
									attrs[k].options[h].attrStatu = false;
								}
							}
						}
					}
				}
			}
			this.packages = utils.deepCopy(packagesList); //套餐总数据
			this.Multiselect = Boolean(Number(packagesList.type)); //判断套餐类型
			this.packageTitle = this.Multiselect ? '可选套餐' : '固定套餐'; //判断套餐类型

			if (this.Multiselect) {
				this.packageGoods.push(packagesList.packageTag[0]); //取出可选套餐第一个商品数组
				this.packageSub = packagesList.packageTag; //取出可选套餐数据
			} else {
				this.fixedPackages = packagesList.packageTag; //取出固定套餐数据
			}

			utils.setTitle('选择套餐');
		},
		destroyed() {
			// 离开套餐时清除套餐数据
			storage.session('searchPackage', null);
		},
		components: {
			'attr-win': () =>
				import ( /* webpackChunkName: 'arrt_win' */ './attr_win')
		}
	};

</script>
<style scoped>
	.package {
		width: 100%;
		height: auto;
		position: relative;
		padding: 1.25333rem 0;
	}

	.package .package-tit {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: -0.93333rem;
		text-align: center;
		font-size: 0.42667rem;
		color: #999999;
		position: fixed;
		left: 0;
		top: 0;
		background-color: #f7f7f7;
		border-bottom: 1px solid #dddddd;
		z-index: 99;
	}

	.package .package-tit span {
		display: block;
		width: 0.93333rem;
		height: 1.25333rem;
		text-indent: 0;
	}

	.package .package-head {
		width: 100%;
		height: 1.25333rem;
		line-height: 1.25333rem;
		border-bottom: 1px solid #dddddd;
		font-size: 0;
	}

	.package .package-head span {
		display: inline-block;
		width: auto;
		height: 1.25333rem;
		line-height: 1.25333rem;
		padding: 0 0.33333rem;
		font-size: 0.34667rem;
		color: #777777;
		position: relative;
	}

	.package .package-head span.on {
		color: #f1a724;
	}

	.package .package-head span.on:after {
		content: "";
		width: 50%;
		height: 0.08rem;
		background-color: #f1a724;
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translate(-50%, 0);
		-webkit-transform: translate(-50%, 0);
	}

	.package .package-subhead {
		width: 100%;
		height: 0.53333rem;
		line-height: 0.53333rem;
		padding-left: 0.26667rem;
		color: #fff;
		background-color: #c6c2bc;
		font-size: 0.34667rem;
	}

	.package .package-list {
		width: 100%;
		height: calc(100% - 1.78667rem);
		line-height: 40px;
		overflow: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.package .package-list ul li {
		width: 100%;
		height: auto;
		min-height: 1.25333rem;
		line-height: 1.25333rem;
		text-indent: 0.26667rem;
		border-bottom: 1px solid #dddddd;
		color: #000000;
		background-color: #fdfdfd;
		overflow: hidden;
	}

	.package .package-list ul li .tip {
		font-size: 0.13333rem;
		color: #999999;
	}

	.package .package-list ul li .package-attr {
		background-color: #f0f0f0;
		padding: 0.26667rem 0;
		width: 100%;
		height: 1.25333rem;
		padding-left: 0.66667rem;
		border-bottom: 1px solid #dddddd;
		position: relative;
	}

	.package .package-list ul li .package-attr:after {
		content: "";
		width: 0.18667rem;
		height: 0.18667rem;
		position: absolute;
		left: 0.26667rem;
		top: 50%;
		margin-top: -0.09333rem;
		background-color: #f5a623;
		border-radius: 0.2rem;
	}

	.package .package-list ul li .package-attr .attr-revise {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		border: 1px solid #f5a623;
		color: #f5a623;
		border-radius: 8px;
		background-color: #f0f0f0;
		text-align: center;
		margin-right: 0.33333rem;
		text-indent: 0;
	}

	.package .package-list ul li .package-attr:last-child {
		border-bottom: none;
	}

	.package .package-list ul li span {
		font-size: 0.34667rem;
	}

	.package .package-list ul li span.taste {
		width: 0.93333rem;
		height: 0.4rem;
		line-height: 0.4rem;
		color: #ffffff;
		background-color: #ff463b;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		display: inline-block;
		font-size: 0.29333rem;
		text-indent: 0;
		text-align: center;
	}

	.package .package-list ul li button.optAttr {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		text-align: center;
		text-indent: 0;
		color: #ffffff;
		font-size: 0.34667rem;
		margin-right: 0.33333rem;
		margin-top: 0.26667rem;
		border: none;
	}

	.package .package-list ul li span.reviseAttr {
		width: 2rem;
		height: 0.72rem;
		line-height: 0.72rem;
		border: 3px solid #f5a623;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		background-color: #f0f0f0;
		text-align: center;
		text-indent: 0;
		color: #ffffff;
		font-size: 0.34667rem;
		margin-right: 0.33333rem;
		margin-top: 0.26667rem;
	}

	.package .package-list ul li span.goods_num {
		width: 1.33333rem;
		height: 0.4rem;
		line-height: 0.4rem;
	}

	.package .package-list ul li span.goods_name {
		font-size: 0.42667rem;
		max-width: 4rem;
		float: left;
		height: 100%;
		line-height: 1.25333rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.package .package-sub {
		width: 100%;
		height: 1.16rem;
		line-height: 1.16rem;
		background-color: #f5a623;
		position: fixed;
		display: block;
		left: 0;
		bottom: 0;
		font-size: 0.42667rem;
		text-align: center;
		color: #fff;
	}

	.package .previousPage {
		background: url(../../../res/images/recurrence.png) center center no-repeat;
		background-size: 0.28rem 0.49333rem;
	}

	.attrWin {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 99;
		overflow: hidden;
	}

	.attrWin .attrConten {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 9.33333rem;
		height: 11.46667rem;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
	}

	.attrWin .attrConten .attr-concent {
		padding: 0.6rem 0.4rem;
		padding-bottom: 0;
		width: 9.33333rem;
		height: 10.13333rem;
		border-radius: 8px 8px 0 0;
		-webkit-border-radius: 8px 8px 0 0;
		background-color: #ffffff;
		overflow: hidden;
	}

	.attrWin .attrConten .attrClose {
		position: absolute;
		right: 0.33333rem;
		top: -0.41333rem;
		width: 0.82667rem;
		height: 0.82667rem;
		background: url(../../../res/images/pop-btn-del.png) center center no-repeat;
		background-size: 0.82667rem 0.82667rem;
	}

	.attrWin .attrConten .attrHead {
		width: 100%;
		height: 1.06667rem;
		line-height: 1.06667rem;
		display: block;
		border-bottom: dashed 1px #999999;
		color: #000000;
		font-size: 0.45333rem;
		overflow: hidden;
	}

	.attrWin .attrConten .attrHead span {
		display: inline-block;
		font-size: 0.34667rem;
		margin-left: 0.2rem;
	}

	.attrWin .attrConten .attrBox {
		width: 100%;
		height: 8.26667rem;
		overflow-y: scroll;
	}

	.attrWin .attrConten .attrBox .attrName {
		width: 100%;
		height: 0.8rem;
		line-height: 0.8rem;
		color: #777777;
		font-size: 0.34667rem;
	}

	.attrWin .attrConten .attrBox .attrOptions {
		width: 100%;
		height: auto;
		line-height: 0.66667rem;
		overflow: hidden;
	}

	.attrWin .attrConten .attrBox .attrOptions span {
		display: inline-block;
		padding: 0.13333rem 0.33333rem;
		color: #f5a623;
		background-color: #ffffff;
		margin-bottom: 0.26667rem;
		margin-right: 0.26667rem;
		border: 1px solid #f5a623;
		font-size: 0.32rem;
	}

	.attrWin .attrConten .attrBox .attrOptions span.on {
		color: #ffffff;
		background-color: #f5a623;
	}

	.attrWin .attrConten .attrBox .attrOptions span.arrtMultiselect {
		border-radius: 8px;
		-webkit-border-radius: 8px;
	}

	.attrWin .attrFooter {
		width: 100%;
		height: 1.33333rem;
		line-height: 1.33333rem;
		font-size: 0;
	}

	.attrWin .attrFooter a {
		display: inline-block;
		width: 50%;
		height: 1.33333rem;
		text-align: center;
		color: #ffffff;
		font-size: 0.42667rem;
	}

	.attrWin .attrFooter a.del {
		background-color: #999999;
		border-radius: 0 8px 0 0;
		-webkit-border-radius: 0 8px 0 0;
	}

	.attrWin .attrFooter a.confirm {
		background-color: #f5a623;
		border-radius: 0 0 8px 0;
		-webkit-border-radius: 0 0 8px 0;
	}

	.attr-name {
		color: #777777;
		width: auto;
		height: 0.72rem;
		line-height: 0.72rem;
		font-size: 0.34667rem;
		text-indent: 0;
	}

	.subAddBox {
		width: 2.73333rem;
		height: 1.33333rem;
		line-height: 1.33333rem;
		padding-right: 0.33333rem;
		font-size: 0;
	}

	.subAddBox span {
		display: inline-block;
		width: 0.8rem;
		height: 1.33333rem;
		text-align: center;
		color: #2c2d31;
		text-indent: 0;
		font-size: 0.42667rem !important;
	}

	.subAddBox span.packageAdd {
		background: url(../../../res/images/btn-jia.png) center center no-repeat;
		background-size: 0.66667rem 0.66667rem;
	}

	.subAddBox span.packageSub {
		background: url(../../../res/images/btn-jian.png) center center no-repeat;
		background-size: 0.66667rem 0.66667rem;
	}

	.packagePopWin {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.packagePop {
		width: 9.33333rem;
		height: 5.06667rem;
		background-color: #ffffff;
		position: absolute;
		left: 50%;
		top: 50%;
		border-radius: 8px;
		-webkit-border-radius: 8px;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
		overflow: hidden;
	}

	.packagePop .Pop-icon {
		width: 100%;
		height: 3.2rem;
		background: url(../../../res/images/taocan-pop-msg.png) center center no-repeat;
		background-size: 2.48rem 2.48rem;
	}

	.packagePop>h3,
	.packagePop p {
		text-align: center;
		width: 100%;
		height: 0.8rem;
		line-height: 0.8rem;
	}

	.packagePop h3 {
		font-size: 0.45333rem;
		color: #5b5b5b;
	}

	.packagePop p {
		font-size: 0.34667rem;
		color: #5b5b5b;
	}

	.add_remove {
		display: none;
	}

	.add_remove:last-child {
		display: block;
	}

	.package-attr>.shoName:first-child {
		display: block;
	}

</style>
