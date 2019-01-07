/* * @Author: ruokun.ma * @Date: 2018-06-20 09:52:29 * @Module: {选择口味} */
<template>
	<section class="special_detail">
		<div class="spec_container">
			<div class="title">
				<div class="con">
					<h5>{{obj.packageName?obj.packageName:obj.goodsName}}</h5>
					<img src="../../../../res/images/order_close.png" @click="close" alt="">
					<div class="tips" v-if="obj.gnum">
						<img src="../../../../res/images/error_tips.png" alt="">
						<span v-if='obj.isGroup == 1'>此商品最少{{groupNum}}个起售</span>
						<span v-else>此商品最少{{obj.gnum}}个起售</span>
					</div>
				</div>
			</div>
			<header class="tap" @click="clickItemTab($event,'div','0',obj)" v-if='obj.isGroup == 1'>
				<!--点击tab。-->
				<div ref="tap" v-for="(item,index) in groupGoodsData[obj.id]" :key="index" :class="{select:index==0}" :data-index="index">
					{{(/.*\((.*)\)/g).exec(item.goodsName)[1]}}
				</div>
			</header>
			<div class="taste">
				<div class="items">
					<div class='item' v-for="(i,index) in ttObj.attr" :key='index'>
						<div class="title">{{i.name+(i.attr == 1?"(多选)":"(单选)")}}</div>
						<div class='tags'>
							<ul @click="clickItem($event,'li','1',i.options,index,i.attr)">
								<li v-for="(item,index_i) in i.options" :key="index_i" :class="{multi:i.attr == 1,select:item.attrStatu}" :data-index="index_i">

									<div :class="{boc:true,left:item.price >0&&typeTaste != 'package',less:typeTaste == 'package'?i.attr == 1:(item.price<=0&&i.attr == 1)}">{{item.name}}</div>
									<section class="more" v-if="Number(item.price) > 0&&typeTaste != 'package'">
										<div class="right boc">¥{{item.price}}</div>
										<div class='cricle top'></div>
										<div class='cricle bottom'></div>
									</section>


								</li>
							</ul>
						</div>
					</div>
				</div>
				<!-- <div class="noinfo">
                    <img src="../../../../res/images/leaf.png" alt="">
                    <div>该商品没有口味呦～</div>
                </div> -->
			</div>
			<div class="add">
				<div class="left">
					<template v-if="!isEdit && !isPackages">
						<div class="entry" v-if="!obj.packageName && obj.type == 1">
							数量：
							<input type="number" v-scrollTxt="'.special_detail'" v-model="obj.num" />{{obj.unit}}
						</div>
						<div class="entry" v-else>
							<riskAdd v-if="obj.isGroup == 1" :exter="obj.isGroup == 1?'all':''" :counter="obj.num" :min="1" :max="Number(obj.packageGoodsNum)" :index="index" class="btn_add" @sendCounter='getCounters'></riskAdd>
							<riskAdd v-else :counter="obj.num" :exter="obj.type == 0?'all':''" :min="1" :max="Number(obj.packageGoodsNum)" :index="index" class="btn_add" @sendCounter='getCounter'></riskAdd>
						</div>
					</template>
					<div class="edit" @click="delTaste" v-if="isEdit">删除</div>
				</div>

				<div class="price_red" v-if='obj.isGroup == 1 && obj.isShowAvailPrice'>
					￥ {{memberPrice}} 元
					<span>￥ {{price}} </span>
				</div>
				<div class="price_red" v-else-if='obj.isGroup == 1 && !obj.isShowAvailPrice'>
					￥ {{price}} 元
				</div>
				<div class="right" @click="addGoodsCar()">加入购物车</div>
			</div>
		</div>

	</section>
</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import store from 'src/module/order/data/details_store';
	// import global from 'src/manager/global';

	let _seatObj = {};
	let orderData = null;
	export default {
		props: {
			obj: {
				type: Object,
				default: () => {
					return {};
				}
			},
			type: {
				type: Number,
				default: 2
			},
			isPackages: {
				type: Boolean,
				default: false
			},
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				index: 0,
				item: {},
				edit: [],
				tips: false,
				open: true,
				tasteStr: '', //口味
				num: 1,
				selfObj: {},
				typeTaste: 'good', //当前页面是那个页面的选择口味  good 首页商品的选择口味   package 为套餐页面的选择口味
				tempTasteObj: {}, //存储选择的口味,
				groupGoodsData: storage.session('groupGoodsData'), //多规格数据
				objAttr: [], //口味列表
				groupAttr: [],
				ttObj: [], //规格循环obj
				index_s: 0,
				price: 0,
				memberPrice: 0,
				goodsLeast: [],
				groupGoods: [],
				groupNum: 0
			};
		},
		store,
		methods: {
			close() {
				this.$store.commit('setOverflow', false);
				this.$emit('chooseTaste', {
					type: 'close'
				});
			},
			// data 一个口味的所有分类 id 口味数组的索引    attr口味是单还是多选 
			/* eslint-disable */
			clickItem(e, bindType, type, data, id, attr) {
				/* eslint-disable */
				//事件代理
				let tar = e.target;
				if (tar == e.currentTarget) return;
				while (tar.tagName.toLowerCase() !== bindType) {
					tar = tar.parentNode;
				}
				if (!_seatObj[type]) _seatObj[type] = tar;

				let index = -1;
				/* eslint-disable */
				if (index = tar.getAttribute('data-index')) {
					/* eslint-disable */
					// _seatObj[type]&&(_seatObj[type].className = '');
					let item = data[index];
					let tempObj = this.tempTasteObj[id];
					if (!tempObj) {
						tempObj = this.tempTasteObj[id] = new Set();
					}

					//多选
					if (attr == 1) {
						if (tempObj.has(index)) tempObj.delete(index);
						else tempObj.add(index);
					} else {
						//单选
						//将已经保存的索引对应的选中的效果还原
						if (tempObj.size > 0 && [...tempObj][0] != index) data[[...tempObj][0]].attrStatu = false;
						tempObj.clear();
						if (!item.attrStatu) tempObj.add(index);

					}

					item.attrStatu = !item.attrStatu;
					_seatObj[type] = tar;

				}

				if (bindType == 'li') {

					// let name = data[index].name;

					// if(this.tasteArr.has(name)) this.tasteArr.push(name);
					// else this.tasteArr.add(name);
					// console.log(this.tasteArr,name);
				}

			},
			clickItemTab(e, bindType, type, obj) {
				// console.log(e, bindType, type, obj,'e, bindType, type, obj)');
				this.goodsLeast.map((item) => {
					for (var x = 0; x < this.groupGoodsData[obj.id].length; x++) {
						if (item.gid == this.groupGoodsData[obj.id][x].id) {
							this.groupGoodsData[obj.id][x].gnum = item.num;
							this.groupGoodsData[obj.id];
							this.groupGoods = this.groupGoodsData[obj.id];
						}
					}
				})

				let tar = e.target;
				if (tar == e.currentTarget) return;
				while (tar.tagName.toLowerCase() !== bindType) {
					tar = tar.parentNode;
				}
				if (!_seatObj[type]) _seatObj[type] = tar;

				if (tar.getAttribute('data-index')) {

					let index = tar.getAttribute('data-index');
					this.getgroupGood(tar.getAttribute('data-index'));

					_seatObj[type] && (_seatObj[type].className = '');
					if (tar.className !== 'select') tar.className = 'select';
					else tar.className = '';

					_seatObj[type] = tar;

				}

				if (this.obj.isGroup == 1) {
					//this.objAttr = this.groupGoodsData[this.obj.id][tar.getAttribute('data-index')].attr;
					this.ttObj = this.groupGoodsData[this.obj.id][tar.getAttribute('data-index')];
					this.selfObj = utils.deepCopy(this.ttObj);
				}

			},
			getgroupGood(index) {
				let item = this.groupGoodsData[this.obj.id][index];
				if (item.isVip && this.obj.isGroup == 1) {
					// item.memberPrice = global.getAvailPrice(item);
					// this.$set(this.obj,'memberPrice',item.memberPrice);
					this.price = item.price;
					this.memberPrice = item.memberPrice;
					this.groupNum = this.groupGoods[index] ? this.groupGoods[index].gnum : 1;
					this.obj.gnum = this.groupNum;
					console.log(item, 'this.groupGoods[index]');
					let gnum = Number(this.obj.gnum);
					if (Number(this.obj.num) < gnum) {
						this.obj.num = gnum;
					} else {
						this.obj.num = this.groupGoods[index] ? this.groupGoods[index].gnum : 1;
					}

				} else if (!item.isVip && this.obj.isGroup == 0) {
					this.price = '';
					this.memberPrice = '';
				}
			},
			getCounter(obj) {
				if (obj.type == 'risk') {
					if (Number(this.obj.num) == Number(this.obj.gnum)) {
						this.$store.commit('setWin', {
							content: '数量至少起售',
							callBack: (str) => {
								if (str === 'ok') {
									this.obj.num = obj.number;
								}
							}
						});
					} else {
						this.obj.num = --obj.number;
					}
				} else {
					this.obj.num = ++obj.number || 0;
					if (Number(this.obj.num) < Number(this.obj.gnum)) {
						this.obj.num = Number(this.obj.gnum) * Number(obj.number) || 0;
					}
				}
			},
			// 多规格
			getCounters(obj) {
				console.log(obj, 'obj');
				if (obj.type == 'risk') {
					if (Number(this.obj.num) == Number(this.groupNum)) {
						this.$store.commit('setWin', {
							content: '数量至少起售',
							callBack: (str) => {
								if (str === 'ok') {
									this.obj.num = obj.number;
								}
							}
						});

					} else {
						this.obj.num = --obj.number;
					}
				} else {
					this.obj.num = ++obj.number || 0;
					if (Number(this.obj.num) < Number(this.groupNum)) {
						this.obj.num = Number(this.groupNum) * Number(obj.number) || 0;
					}
				}
				// this.obj.num = obj.number;
			},
			addGoodsCar() {
				console.log(this.selfObj, 'ttobj');
				if (!orderData.checkGoodsNum(this.selfObj)) return false;

				if (this.obj.num > 99) {
					this.$store.commit('setWin', {
						content: '已超出最大数量,请修改'
					});
					return;
				}

				// 	if (this.groupNum == 0 || this.obj.num == 0 || isNaN(Number(this.obj.num))) {
				// 	this.$store.commit('setWin', {
				// 		content: '输入数字有误,请修改'
				// 	});
				// 	return;
				// }

				if (this.obj.type == 1) {
					this.obj.num = Number(this.obj.num).toFixed(2);
				}
				// if (this.obj.isGroup == 1) {
				// 	this.obj.num = Number(this.groupNum);
				// }
				this.obj.key = '';
				this.obj.attrPrice = 0;
				for (let str in this.tempTasteObj) {
					let arr = [...this.tempTasteObj[str]];
					//let item = this.obj.attr[str];
					let item = this.ttObj.attr[str];

					for (let i = 0; i < arr.length; i++) {
						let obj = item.options[arr[i]];
						this.tasteStr += obj.name + (this.typeTaste == 'package' ? '' : (' ￥' + obj.price)) + ' ';
						this.obj.key += obj.name + obj.price;
						this.obj.attrPrice += Number(obj.price);
					}
				}
				this.selfObj.num = this.obj.num;
				this.selfObj.gnum = this.obj.gnum;
				this.selfObj.attr = this.ttObj.attr;
				this.selfObj.key = this.obj.key;
				this.selfObj.attrPrice = this.obj.attrPrice;
				this.selfObj.attrInfo = this.tasteStr;
				if (this.ttObj.num == undefined) this.ttObj.num = 0;
				if (this.typeTaste == 'good') {
					this.ttObj.num += this.obj.num;
				}

				// console.log(JSON.stringify(this.selfObj))
				let goods = {
					data: utils.deepCopy(this.selfObj), // 商品数据
					operateObj: 'carGoodsList', // 操作对象
					type:'add'
				};
				if (this.typeTaste == 'good') {
					this.$store.commit('setCarList', goods);
				}

				this.$emit('chooseTaste', {
					type: 'ok',
					data: this.selfObj
				});
				// this.close();
			},
			delTaste() {
				// 删除口味
				this.$emit('delTaste', this.selfObj);
			}
		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			_seatObj['0'] = this.$refs.tap && this.$refs.tap[0];
			console.log(_seatObj['0'], '0');
			if (this.obj.isGroup == 1) {
				let price = this.groupGoodsData[this.obj.id][0].price;
				let memberPrice = this.groupGoodsData[this.obj.id][0].memberPrice;

				if (price && memberPrice) {
					this.price = price;
					this.memberPrice = memberPrice;
				} else if (price && !memberPrice)
					this.price = price;
			}
			this.typeTaste = this.isPackages ? 'package' : 'good';
			this.goodsLeast = storage.session('goodsLeast');
			let {
				attr
			} = this.obj;
			for (let i = 0, len = attr.length; i < len; i++) {
				let {
					options
				} = attr[i];
				attr[i].showAttr = false;
				for (let j = 0; j < options.length; j++) {
					if (!this.isEdit) {
						options[j].attrStatu = false;
					} else if (options[j].attrStatu) {
						let temp = this.tempTasteObj[i];
						if (temp) {
							temp.add(j);
						} else {
							this.tempTasteObj[i] = new Set();
							this.tempTasteObj[i].add(j);
						}
					}
				}
			}

			if (this.obj.isGroup == 1) { //多规格商品
				this.ttObj = this.groupGoodsData[this.obj.id][0];
				if (this.goodsLeast) {
					this.goodsLeast.map((item) => {
						if (this.ttObj.id == item.gid) {
							this.obj.gnum = item.num;
							// this.$set(this.ttObj,'gnum',item.num);  
						} else if (this.typeTaste == 'package') {
							this.obj.gnum = 0; // 如果是套餐，则不显示
						}
						return item;
					});
				}

			} else {
				this.ttObj = this.obj;
				if (this.goodsLeast) {
					this.goodsLeast.map((item) => {
						if (this.obj.id == item.gid) {
							this.obj.gnum = item.num;
						} else if (this.typeTaste == 'package') {
							this.obj.gnum = 0; // 如果是套餐，则不显示
						}
						return item;
					});
				}
			}
			this.obj.num = 1;
			let gnum = Number(this.obj.gnum);
			if (Number(this.obj.num) < gnum) {
				this.obj.num = gnum;
			} else {
				this.obj.num = 1;
			}
			this.selfObj = utils.deepCopy(this.ttObj);
			if (this.obj.isGroup == '1') {
				this.goodsLeast.map((item) => {
					for (var x = 0; x < this.groupGoodsData[this.obj.id].length; x++) {
						if (item.gid == this.groupGoodsData[this.obj.id][x].id) {
							this.groupGoodsData[this.obj.id][x].gnum = item.num;
							this.groupGoodsData[this.obj.id];
							this.groupGoods = this.groupGoodsData[this.obj.id];
						}
					}
				})

				this.groupNum = this.groupGoods[0] ? this.groupGoods[0].gnum : 0;
				this.obj.gnum = this.groupGoods[0] ? this.groupGoods[0].gnum : 0;
				this.getgroupGood(0);
			}

			// this.clickItemTab($event,'div','0',obj)

		},
		components: {
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue'),
		}
	};
</script>

<style lang="less" scoped>
	.special_detail {
		position: fixed;
		z-index: 101;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.2);

		.spec_container {
			position: absolute;
			bottom: 0;
			background-color: white;
			width: 100%;
			z-index: 6;

			&>.title {
				border-bottom: 1px #E8E8E8 solid;
				min-height: 1.2rem;
				display: flex;
				align-items: center;
				width: 92%;
				margin: 0 auto;

				.con {
					position: relative;
					width: 100%;

					h5 {
						font-size: 0.4267rem;
						color: #2D2D2D;
						height: 0.8rem;
						line-height: 0.8rem;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						width: 4.5rem;
						float: left;
					}

					&>img {
						position: absolute;
						right: 0.2rem;
						top: 0;
						bottom: 0;
						margin: auto;
						width: 0.3733rem;
						height: 0.3733rem;
					}

					.tips {
						height: 0.65rem;
						float: right;
						margin-right: 1rem;
						display: flex;
						align-items: center;
						height: 1rem;
						line-height: 1rem;

						img {
							width: 0.2667rem;
							height: 0.2667rem;
						}

						span {
							font-size: 0.2933rem;
							color: #F4333C;
						}
					}
				}
			}

			.tap {

				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 0.3467rem;
				color: #A8A8A8;

				&>div {
					height: 1.2rem;
					line-height: 1.2rem;
					flex: 1;
					text-align: center;
					border-bottom: 1px #E8E8E8 solid;
					overflow: hidden;
					;
					white-space: nowrap;
					text-overflow: ellipsis;
				}

				&>div.select {
					border-bottom: 2px #FCAE02 solid;
				}
			}

			.taste {
				height: 7rem;
				overflow-y: auto;
				position: relative;

				.items {
					width: 92%;
					margin: 0 auto;

					.item {
						.title {
							font-size: 0.3467rem;
							color: #FCAE02;
							height: 0.8rem;
							line-height: 0.8rem;
						}

						.tags {
							ul {

								li {
									display: inline-block;
									font-size: 0;
									position: relative;
									overflow: hidden;
									margin: 0 calc(~"(100% - 2.9999rem * 3)/2") 0.3rem 0;

									.less {
										border-radius: 4px;
									}

									.more {
										display: inline-block;
									}

									.boc {
										min-width: 1.4667rem;
										height: 0.8rem;
										font-size: 0.3467rem;
										color: #FCAE02;
										;
										display: inline-block;
										border: 1px solid #FCAE02;
										text-align: center;
										line-height: 0.8rem;
									}

									&.multi {
										.left {
											border-right: none;
											border-top-left-radius: 0.1333rem;
											border-bottom-left-radius: 0.1333rem;
										}

										.right {
											border-left: 1px dashed #FCAE02;
											border-top-right-radius: 0.1333rem;
											border-bottom-right-radius: 0.1333rem;
										}
									}

									.cricle {
										position: absolute;
										left: 1.4667rem;
										width: 0.2rem;
										height: 0.2rem;
										border: 1px solid #FCAE02;
										border-radius: 50%;
										background-color: white;
										transform: translate(-50%, -50%);
									}

									.top {
										top: 0;
									}

								}

								li.select {
									.boc {
										color: white;
										background-color: #F95D18;
										border: 1px solid #F95D18;
									}

									.right {
										border-left: 1px dashed white;
									}

									.cricle {
										border: 1px solid #F95D18;
									}
								}
							}
						}
					}
				}

				.noinfo {
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					margin: auto;
					width: 3.1333rem;
					height: 2rem;
					text-align: center;

					img {
						width: 1.36rem;
						height: 1.2rem;
					}

					div {
						font-size: 0.3467rem;
						color: #A8A8A8;
						margin-top: 0.3rem;
					}
				}
			}

			.add {
				height: 1.4667rem;
				border-top: 1px #E8E8E8 solid;
				display: flex;
				align-items: center;
				justify-content: space-between;

				&>div {
					margin: 0 0.5rem;
				}

				.right {
					background: #FCAE02;
					border-radius: 1.3333rem;
					font-size: 0.4rem;
					color: #FFFFFF;
					text-align: center;
					width: 2.9333rem;
					height: 1.0667rem;
					line-height: 1.0667rem;
				}

				.left {
					.entry {
						input {
							background: #FFFFFF;
							border: 3px solid #FCAE02;
							border-radius: 4px;
							width: 1.4667rem;
							height: 0.8267rem;
							text-align: center;
						}

					}
				}
			}
		}

		.edit {
			background: #fff;
			border-radius: 1.3333rem;
			border: .04rem solid #FCAE02;
			font-size: 0.4rem;
			color: #FFFFFF;
			text-align: center;
			width: 2.9333rem;
			height: 1.0667rem;
			line-height: 1rem;
			color: #FCAE02;
		}
	}

	.price_red {
		color: #FF2035;
		font-size: 0.42rem;
		position: absolute;
		left: 3rem;

		span {
			color: #A8A8A8;
			text-decoration: line-through;
			display: block;
			font-size: 0.28rem;
			margin-left: 0.0468rem;
			line-height: 0.28rem;

		}
	}
</style>