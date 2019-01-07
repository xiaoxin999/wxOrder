<template>
	<div id="goods-detail" class="show-mesking">
		<div class="showGoods">
			<div class="show-content">
				<div class="show-img" style="float: left;">
					<img class="goods_img" :src="goodsUrl" alt="商品图片" />
					<div class="text">
						<div class="name">
							<img  v-if="info.isSpecial" src="../../../res/images/special_icon.png" alt="">
							<img  v-if="info.isMust" src="../../../res/images/must.png" alt="">
							{{info.goodsName}}
						</div>

						<div class="price" v-if="info.isShowAvailPrice">
							<template v-if="info.isSpecial">
								<span v-if="goodsList.length > 0" style="height: 0.60333rem;line-height: 0.60333rem;text-decoration: line-through;">¥{{info.price}}</span>
								<span v-else style="height: 0.60333rem;line-height: 0.60333rem;font-size: 0.32rem;color: rgb(45, 45, 45);" >¥{{info.price}}/{{info.unit}}</span>
								<span class="vipPrice" style="height: 0.40333rem;line-height: 0.40333rem;font-size: 0.34rem;color: #fff!important;">&nbsp;¥{{info.specialPrice}}</span>
							</template>
							<template v-else>
								<span v-if="goodsList.length > 0" style="height: 0.60333rem;line-height: 0.60333rem;text-decoration: line-through;">¥{{info.price}}</span>
								<span style="height: 0.60333rem;line-height: 0.60333rem;font-size: 0.32rem;color: rgb(45, 45, 45);" v-else>¥{{info.price}}/{{info.unit}}</span>
								<span class="vipPrice" style="height: 0.40333rem;line-height: 0.40333rem;font-size: 0.34rem;color: #fff!important;">&nbsp;¥{{info.memberPrice}}</span>
							</template>
							
							
						</div>
						<div class="price" v-else>
							<span v-if="goodsList.length > 0">¥{{info.price}}</span>
							<span v-else>¥{{info.price}}/{{info.unit}}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="group" v-if="goodsList.length > 0">
				<template v-for="(g,index) in goodsList">
					<div @click="selectGroup(index)" :class="{'two':goodsList.length == 2,'three':goodsList.length == 3,'selectG':index == selectG }" :key="index">
						{{(/.*\((.*)\)/g).exec(g.goodsName)[1]}}
					</div>
				</template>
			</div>

			<div class="taste" v-if="hasTaste">
				<div class="tas-con">
					<template v-for="(tas,i) in tasteList">

						<div class="tt" v-if="tas.attrObj && tas.attrObj.rules" :key="i">
							<div class="tt_name">
								{{tas.name}}
							</div>
							<div class="tt_name" style="padding-left:0.55rem ;font-size: 0.1rem;font-weight: 200;">
								<img src="../../../res/icon/6_03.png" /> {{tas.attrObj.rules}}
							</div>
						</div>
						<div class="tt" v-else :key="i-i*2">
							{{tas.name}}
						</div>

						<template v-for="(ta,j) in tas.options">
							<div class="more1" v-if="tas.attr == 1" @click="tasteClick(tas,i,j)" :class="{select:ta.attrStatu}" :key="i+'_'+j+'_tag1'">
								<div class="left" :class="{hasborder : !checkPrice(ta.price)}"> {{ta.name}} </div>
								<div class="line" v-if="checkPrice(ta.price)"></div>
								<div class="right" v-if="checkPrice(ta.price)">¥{{ta.price}} </div>
							</div>
							<div class="more1 one" v-if="tas.attr == 0" @click="tasteClick(tas,i,j)" :class="{select:ta.attrStatu}" :key="j+'_'+i+'_tag2'">
								<div class="left" :class="{hasborder : !checkPrice(ta.price)}">{{ta.name}}</div>
								<div class="line" v-if="checkPrice(ta.price)"></div>
								<div class="right" v-if="checkPrice(ta.price)">¥{{ta.price}}</div>
							</div>
						</template>
					</template>
				</div>
			</div>

			<div class="goodfoot">
				<div class="text" v-if="isWeight">
					数量：
					<input type="number" v-model="gnum" />{{info.unit}}
				</div>
				<div class="text" v-if="!isWeight">
					<riskAdd :counter="1" :index="this.info.id" :max="99" :min="1" class="btn_add" @sendCounter='getCounter' style="margin-left: 1rem;"></riskAdd>
				</div>
				<div class="addcar" @click="addToOrder">
					加入购物车
				</div>
			</div>
			<div class="close" @click="cloceDetail">
				<img src="../../../res/images/pop-btn-del.png" />
			</div>
		</div>


	</div>
</template>

<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';

	let Tnum = /^\d+(\.\d+)?$/;
	let orderData;
	let hnum = 0;

	export default {
		data() {
			return {
				info: `{id:'',goodsName:'',price:'20.00',imageName:'',unit:'份',sort:1}`,
				hasTaste: false,
				isWeight: false,
				goodsList: [], //若是多规格的菜 数据存在列表
				selectG: 0, //选择的多规格
				goodsUrlMiddle: '',
				goodsUrl: '',
				tasteList: [],
				gnum: '1.0'
			};
		},
		props: {
			'index': {
				default: 0
			}
		},
		methods: {
			getCounter(obj) {
				// 加减
				this.info.num = obj.number;
				let goodsCarNum = this.$store.state.order.shopCarObj[(!!this.info.goodsName - 0) + '_' + this.info.id];

				if (goodsCarNum && this.info.num - 0 + goodsCarNum > this.info.goodsNum) {
					this.$store.commit('setWin', {
						content: this.info.goodsName + '数量仅剩' + hnum + this.info.unit
					});
				}
			},
			selectGroup: function(index) {
				let item = utils.deepCopy(this.goodsList[index]);
				if (!this.checkGoodsNum(item, 'type')) {
					this.selectG = index;
					this.info = this.goodsList[index];
					this.info.num = 1;

					if (this.info.isAttr) {
						this.hasTaste = true;
						this.tasteList = this.info.attr;
					} else {
						this.tasteList = [];
						this.hasTaste = false;
					}
				}
			},
			initGroup: function() {
				let arr = this.goodsList;
				for (let i = 0; i < arr.length; i++) {
					let str = '';
					let reg = /[^()]+(?=\))/g;
					str = reg.exec(arr[i].goodsName);
					if (this.checkGoodsNum(arr[i])) {
						str += '(已售罄)';
					}
					arr[i].groupName = str;
				}
			},
			getGoodsInfo: function() {
				this.info = utils.deepCopy(orderData._oGood);
				console.log(this.info);
				let groupGoods = orderData.groupGoodsObj[this.info.id];
				if (groupGoods) {
					this.info = groupGoods[0];
					this.selectG = 0;
					this.goodsList = groupGoods;
				}

				this.info.num = 1;
				if (this.info.isAttr) {
					this.hasTaste = true;
					this.tasteList = this.info.attr;
				} else {
					this.tasteList = [];
					this.hasTaste = false;
				}
				if (this.info.type == 1) {
					this.isWeight = true;
				}

			},
			getCarNum: function(g) {
				if (!g.goodsName) return false;
				let arr = orderData.oGoodsList;
				let num = 0;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].id == g.id) {
						num += arr[i].num - 0;
					}
					return num;
				}
			},
			cloceDetail: function() {
				this.$emit('close', utils.deepCopy(this.info));
			},
			tasteClick: function(tas, j, index) {
				let tl = utils.deepCopy(this.tasteList);
				tas = utils.deepCopy(tas);

				if (tas.attr == 0) {
					//单选
					for (let i = 0; i < tas.options.length; i++) {
						if (i == index) {
							continue;
						}
						tas.options[i].attrStatu = false;
					}
					if (tas.options[index].attrStatu) {
						tas.options[index].attrStatu = false;
					} else {
						tas.options[index].attrStatu = true;
					}
				} else {
					//多选
					tas.options[index].attrStatu = !tas.options[index].attrStatu;
				}
				tl.splice(j, 1, tas);
				this.tasteList = tl;
			},
			checkPrice: function(p) {
				p -= 0;
				if (p == 0) {
					return false;
				} else {
					return true;
				}
			},
			checkGoodsNum: function(g) {
				if (!g.goodsName) return false;
				if (!g.goodsNum) return false;
				if (g.status == 1) return true;
				if (g.isStock == 0) return false;
				if (g.isStock == 1 && g.goodsNum == 0) return true;
			},
			checkNum: function() {
				if (!this.isWeight) return true;
				let num = this.gnum;
				num = num.replace(/\s/g, '');
				this.info.num = utils.toFloatStr(num.toString(), 2);
				if (num == '' || num == undefined || num == ' ') {
					this.$store.commit('setWin', {
						content: '斤两数不能为空'
					});
					this.gnum = null;
					return false;
				}
				if (!Tnum.test(num)) {
					this.$store.commit('setWin', {
						content: '请输入正确的斤两数'
					});
					this.gnum = null;
					return false;
				}

				return true;
			},
			checkTasteInRules: function() {
				let arr = this.tasteList;
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].attrObj && arr[i].attrObj.type != 0) {
						let obj = arr[i].attrObj;
						if (
							(obj.type == 1 && obj.selectNum != obj.maxNum) ||
							(obj.type == 2 && obj.selectNum - obj.minNum < 0)
						) {

							this.$store.commit('setWin', {
								content: arr[i].name + obj.rules
							});
							return false;
						}
					}
				}
				return true;
			},
			addToOrder: function() {
				if (!this.checkTasteInRules()) {
					return false;
				}
				let info = this.info;
				if (!this.checkNum()) return false;
				if (this.checkGoodsNum(info, 'add')) {
					// 判断库存
					let gnum = info.goodsNum;
					let cnum = orderData.getGoodsNumInCar(info.id);
					hnum =info.type == 1 ?utils.toFloatStr((gnum - cnum).toFixed(3).toString(), 2) :gnum - cnum;

					this.$store.commit('setWin', {
						content: info.goodsName + '数量仅剩' + hnum + info.unit
					});
					return false;
				}
				if (this.tasteList.length > 0) {
					this.info.attr = this.tasteList;
					// 计算出选中的口味价格
					let tasteList = utils.deepCopy(this.tasteList);
					let attrPrice = 0; // 口味总价格
					let attrInfo = ''; // 选中的口味和价格
					for (let i = 0; i < tasteList.length; i++) {
						for (let j = 0; j < tasteList[i].options.length; j++) {
							let item = tasteList[i].options[j];
							if (item.attrStatu) {
								attrPrice += Number(item.price);
								attrInfo += item.name + '￥' + item.price + ' ';
							}
						}
					}
					this.info.attrPrice = attrPrice;
					this.info.attrInfo = attrInfo;
				} else {
					this.info.attrPrice = 0;
				}

				this.cloceDetail();

				let goods = {
					'data': this.info, // 商品数据
					'operateType': 'push', // 操作类型
					'operateObj': 'carGoodsList' // 操作对象
				};
				this.$store.commit('setCarList', goods);
			}
		},
		components: {
			riskAdd: () => import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue')
		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;
			this.getGoodsInfo();
			this.goodsUrl = global.getImgUrl({
				type: '2',
				url: this.info.imageName
			});
		}
	};
</script>
<style scoped>
	.show-mesking {
		width: 10rem;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.show-mesking .showGoods {
		width: 9.3333rem;
		/*height: 11.46667rem;*/
		background-color: #fff;
		border-radius: 0.1067rem;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		-webkit-transform: translate(-50%, -50%);
	}

	.show-mesking .close {
		width: 0.8267rem;
		height: 0.8267rem;
		border-radius: 100%;
		background-color: #ff463b;
		position: absolute;
		top: -0.41335rem;
		right: 0.2667rem;
		line-height: 0.8267rem;
		text-align: center;
	}

	.show-mesking .close img {
		width: 100%;
		height: 100%;
	}

	.show-mesking .showGoods .show-content {
		width: 9.3333rem;
		height: 6.7533rem;
		border-radius: 0.1067rem 0.1067rem 0 0;
		overflow: hidden;
		position: relative;
		color: #ffffff;
	}

	.show-mesking .showGoods .show-content .show-img {
		width: 100%;
		height: 100%;
		float: left;
	}

	.show-mesking .showGoods .show-content img.goods_img {
		width: 100%;
		height: 100%;
	}

	.show-mesking .showGoods .show-content .text {
		height: 1.06667rem;
		line-height: 1.06667rem;
		font-size: 0.4533rem;
		background-color: rgba(0, 0, 0, 0.3);
		position: absolute;
		bottom: 0;
		left: 0;
		padding: 0 0.4267rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.show-mesking .showGoods .show-content .text .name {
		width: 4.5rem;
		height: 1.06667rem;
		max-height: 1.06667rem;
		line-height: 0.5rem;
		vertical-align: middle;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-pack: center;
		-webkit-box-align: start;
		word-break: break-all;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
	}
	.show-mesking .showGoods .show-content .text .name img{
		width: 0.3467rem;
		vertical-align: middle;
	}
	.show-mesking .showGoods .show-content .text .price {
		height: 1.06667rem;
		line-height: 1.06667rem;
		text-align: right;
	}

	.show-mesking .showGoods .taste {
		height: 2.85333rem;
		width: 9.3rem;
		float: left;
		z-index: 9999;
		overflow-y: scroll;
		border-bottom: 1px dashed #999999;
	}

	.show-mesking .showGoods .taste::-webkit-scrollbar {
		width: 0.1rem;
		height: 0.8rem;
	}

	.show-mesking .showGoods .taste::-webkit-scrollbar-track,
	.show-mesking .showGoods .taste::-webkit-scrollbar-button {
		background-color: gray;
	}

	.show-mesking .showGoods .taste::-webkit-scrollbar-thumb {
		background-color: #f5a623;
	}

	.show-mesking .showGoods .taste .tas-con {
		width: 100%;
		height: auto;
		padding: 0 0.4267rem;
		min-height: 2.8rem;
		clear: both;
	}

	.show-mesking .showGoods .taste .tas-con .tt {
		color: #999999;
		width: 100%;
		font-size: 0.34667rem;
		height: 0.733rem;
		line-height: 0.733rem;
		float: left;
	}

	.show-mesking .showGoods .taste .tas-con .more1 {
		font-size: 0.34667rem;
		height: 0.72rem;
		line-height: 0.72rem;
		float: left;
		margin-left: 0.4rem;
		margin-bottom: 0.2667rem;
		font-weight: 300;
		position: relative;
	}

	.show-mesking .showGoods .taste .tas-con .more1 .left,
	.show-mesking .showGoods .taste .tas-con .more1 .right {
		float: left;
		padding: 0 0.266667rem;
		border-radius: 0.18rem;
		border: 1px #f5a623 solid;
	}

	.show-mesking .showGoods .taste .tas-con .select .left,
	.show-mesking .showGoods .taste .tas-con .select .right {
		background-color: #f5a623;
		color: #ffffff;
	}

	.show-mesking .showGoods .taste .tas-con .one .left,
	.show-mesking .showGoods .taste .tas-con .one .right {
		border-radius: 0;
	}

	.show-mesking .showGoods .taste .tas-con .more1 .left {
		border-right: none;
	}

	.show-mesking .showGoods .taste .tas-con .more1 .hasborder {
		border-right: 1px solid #f5a623;
	}

	.show-mesking .showGoods .taste .tas-con .more1 .right {
		border-left: none;
		border-left: 1px dashed #f5a623;
		margin-left: 1px;
	}

	.show-mesking .showGoods .taste .tas-con .select .right {
		border-left: 0.026rem dashed #ffffff;
	}

	.show-mesking .showGoods .taste .tas-con .more1 .line {
		height: 100%;
		float: left;
		z-index: 8;
		position: relative;
		overflow: hidden;
	}

	.show-mesking .showGoods .goodfoot {
		float: left;
		width: 100%;
		height: 1.52rem;
		margin-top: 0.08rem;
		padding: 0.2rem 0.4267rem;
		font-size: 0.35rem;
		color: #888888;
		position: relative;
	}

	.show-mesking .showGoods .goodfoot .text {
		height: 1.06667rem;
		width: 6rem;
		max-height: 1.06667rem;
		line-height: 0.5rem;
		vertical-align: middle;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-pack: center;
		-webkit-box-align: start;
		word-break: break-all;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
	}

	.show-mesking .showGoods .goodfoot .text .gnum {
		width: 2.54rem;
		height: 0.85rem;
		margin-left: 1rem;
		position: relative;
	}

	.show-mesking .showGoods .goodfoot .text .gnum .number {
		height: 0.85rem;
		line-height: 0.85rem;
		text-align: center;
		padding: 0 0.54rem;
		overflow: hidden;
	}

	.show-mesking .showGoods .goodfoot .text .gnum .btn {
		width: 0.76rem;
		height: 0.76rem;
		border-radius: 100%;
		position: absolute;
		top: 0.05rem;
	}

	.show-mesking .showGoods .goodfoot .text .gnum .btn img {
		width: 100%;
		height: 100%;
	}

	.show-mesking .showGoods .goodfoot .addcar {
		width: 2.4rem;
		height: 0.8rem;
		background-color: #ff463b;
		color: #ffffff;
		line-height: 0.8rem;
		position: absolute;
		top: 0.33rem;
		right: 0.4627rem;
		text-align: center;
	}

	.goodfoot .text input {
		width: 2rem;
		height: 1rem;
		border: none;
		outline: 0;
		padding: 0;
		background-color: #efefef;
		margin-right: 0.25rem;
		text-align: center;
		color: #333;
	}

	.group {
		width: 100%;
		height: 1.1rem;
		background-color: #fff;
		line-height: 1.1rem;
		color: #888;
		text-align: center;
	}

	.group div {
		height: 1.1rem;
		float: left;
		background-color: #f0f0f0;
	}

	.group .three {
		width: 3.111rem;
	}

	.group .two {
		width: 50%;
	}

	.group .selectG {
		background-color: #fff !important;
	}

	.taste .tas-con .tt .tt_name {
		float: left;
		position: relative;
		width: 50%;
		height: 0.733rem;
	}

	.taste .tas-con .tt .tt_name img {
		position: absolute;
		width: 0.38rem;
		height: 0.38rem;
		top: 0.18rem;
		left: 0.1rem;
	}
</style>