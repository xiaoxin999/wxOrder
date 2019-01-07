/* * @Author: lhl * @Date: 2018-06-19 16:45:14 * @Module: {商品列表} */
<template>
	<section :class="{one_goods:type==0,two_goods:type==1,three_goods:type==2}">
		<div class='top_left'>
			<img src="../../../../res/images/hot.png" alt="" class="hot" v-if="obj.isRecommend == 1">
			<img src="../../../../res/images/must_logo.png" alt="" class="must" v-if="obj.isMust == 1">
			<img src="../../../../res/images/special_logo.png" alt="" class="special" v-if="obj.isSpecial">
		</div>
		
		<div class="img_sq" v-if="sellOut">
			<div class="hide-img"></div>
			<img src="../../../../res/images/sq.png" alt="">
		</div>
		<!-- <div v-else-if="sellOutSq == true">
			<div class="hide-img"></div>
			<img src="../../../../res/images/sq.png" alt="">
		</div> -->
		<div class="div_wrap" @click="goodsDetail(obj)">
			<div class="hide-img"></div>
			<img :src="getUrl(obj.imageName)" data-v="lazy" :alt="obj.packageName?obj.packageName:obj.goodsName" class="img_left">
		</div>
		<div :class="{one_se:type==0,two_se:type==1,three_se:type==2}" @click="opengoods">
			<div class="goodsName" v-text="obj.packageName?obj.packageName:obj.goodsName"></div>
			<div class="goodsName" v-if="type==2">{{obj.gid}}</div>
			<span class="dashed"></span>

			<template v-if='obj.isSpecial'>
				<div class='specialPrice'>
					<div class="price">
						<b style="font-size:0.3467rem;">￥</b>{{obj.sp}}.<span class="litFont">{{obj.sr}}<span class="dis">{{obj.specDis}}折</span><!-- 限{{obj.specialNum}}份 --></span> 
					</div>
				</div>
				<div class="oldPrice" v-if='type==0 || type ==1'><b style="font-size:0.2933rem">￥</b>{{obj.p}}.<span class="litFont">{{obj.r}}</span> </div>
				<div class="price" v-if="type==2"></div>
			</template>
			<template v-else>
				<div class="vipPirce" v-if='obj.isShowAvailPrice'>
					<span class="bg_span"> 
						<img src="../../../../res/images/mem.png" class="mem" alt=""> 
						<template v-if="obj.isSpecial">
							¥{{obj.specialPrice}}{{obj.preferType == 'vip' ? '会员价' : '粉丝价'}}{{obj.isGroup > 0 ? '起' : ''}}
						</template>
						<template v-else>
							¥{{obj.memberPrice}}{{obj.preferType == 'vip' ? '会员价' : '粉丝价'}}{{obj.isGroup > 0 ? '起' : ''}}
						</template>
					</span>
				</div>
				<div class="vipPirce" v-if="type==2">
					<span class="">
						<span></span>
					</span>
				</div>
				<div class="price" v-if='type==0 || type ==1'><b style="font-size:0.3467rem;">￥</b>{{obj.p}}.<span class="litFont">{{obj.r}}</span> </div>
				<div class="price" v-if="type==2"></div>
			</template>
			

			<!-- 无规格，无口味的普通商品 直接加减-->
			<riskAdd key = 'A' v-if="showStatus === true && !sellOut" :counter="getGoodsMaxNum" :index="obj.id - 0" :max="Number(obj.packageGoodsNum) || 99" class="btn_add" :exter='exterStaus' @sendCounter='getCounter'></riskAdd>
			<riskAdd key = 'B' v-if="showStatus === false && !sellOut" :counter="getGoodsMaxNum" :index="obj.id - 0" :tofix="obj.type == '1' && obj.goodsName ? 2 : 0" :max="Number(obj.packageGoodsNum) || 99" class="btn_add" :exter="'all'" @sendCounter='getCounter'></riskAdd>
			<!-- <div v-if="showStatus === false" class="choose-taste"  @click="openSpecialDetail" >选规格</div> -->
		</div>
		<div class="showDe" v-if="type==2 && obj.attrList && obj.attrList.length > 0">
			<ul>
				<li v-for="(item,index) in obj.attrList" :key="index">
					<span>
						<template v-for="attrs in item.attr">
							<template v-for="option in attrs.options" v-if="option.attrStatu">
								{{option.name}}
							</template>
						</template>
						<template v-if="!item.showAttr">
							无口味
						</template>
					</span>
					<span @click="openSpecialDetail('edit',index)">修改</span>
				</li>
			</ul>
		</div>
	</section>
</template>
<script>
	import utils from 'src/verdor/utils';
	import global from 'src/manager/global';
	import storage from 'src/verdor/storage';
	let orderData = null;

	export default {
		props: {
			obj: {
				type: Object,
				default: function() {
					return {};
				}
			},
			edit: {
				type: Array,
				default: function() {
					return [];
				}
			},
			index: {
				type: Number,
				default: 0
			},
			type: {
				type: Number,
				default: 0
			},
			packages: {
				type: Object,
				default: function() {
					return null;
				}
			},
			isMember: {
				type: Boolean,
				default: false
			},
			testIndex: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				exterStaus: '',
				showDe: false,
				open: false,
				data: {},
				showType: null,
				prevSpecNum:0
			};
		},
		computed: {
			showStatus() {

				if (this.showType == '1') {
					return true;
				} else if (this.showType == '2') {
					
					if (this.obj.num > 0) {
						return true;
					} else {
						return false;
					}
				}

				return null;
			},
			getGoodsMaxNum() {
				let GoodsMaxNum = this.$store.state.order.shopCarObj[(!!this.obj.goodsName - 0) + '_' + this.obj.id] || 0;
				GoodsMaxNum = this.packages ? this.obj.num : GoodsMaxNum;
				return GoodsMaxNum;
			},
			sellOut() {
				// 是否显示售罄
				if (this.obj.status == 1 || this.obj.goodsName && (this.obj.goodsNum == 0 || Number(this.obj.goodsNum) < Number(this.obj.gnum)) && this.obj.isStock == 1 && this.obj.isGroup != 1) return true;
			},
			// sellOutSq(){
			// 	// debugger;
			// 	if ((this.obj.status == 1 || this.obj.goodsName) && (Number(this.obj.goodsNum) < Number(this.obj.gnum)) && this.obj.isGroup != 1) return true;

			// }
		},

		methods: {
			getUrl(imageName) {
				return global.getImgUrl({
					url: imageName,
					type: 2
				});
			},
			goodsDetail(obj) {
				if (this.packages) return false;
				if (!this.sellOut) {
					if (obj.goodsName) {
						storage.session('goodDetail', obj);
					} else {
						let goodsPackges = orderData.getPackage(obj);
						storage.session('goodDetail', goodsPackges);
					}
					this.$router.push({
						path: '/latestOrder/detail'
					});
				}
			},

			opengoods() {
				if (this.type == 2) {
					this.showDe = !this.showDe;
				}
			},
			getCounter(obj) {
				this.obj.num = obj.number || 0;
				if (obj.type == 'risk') {
					this.obj.num = obj.number || 0;
					if (Number(this.obj.num) + 1 == Number(this.obj.gnum)) {
						this.obj.num = 0;
					}
				} else {
					this.obj.num = obj.number || 0;
					if (Number(this.obj.num) < Number(this.obj.gnum)) {
						this.obj.num = Number(this.obj.gnum) * Number(obj.number) || 0;
					}
				}
				let item = this.obj;
				let content;
				if (item.packageName) {
					if (obj.type == 'add') {
						let goodsPackges = orderData.getPackage(item);
						storage.session('goodsPackges', goodsPackges);
						this.$router.push({
							path: '/goodsPackages'
						});
					} else {
						content = '请在购物车中删除';
					}

				} else if (!item.packageName && item.isAttr || item.type == 1 || item.isGroup == 1) {
					//口味
					if (obj.type == 'add') {
						this.$emit('specialData', item);
						this.openSpecialDetail('add');
					} else {
						if (this.packages) {
							content = '请在口味弹窗中删除';
						} else {
							content = '请在购物车中删除';
						}
					}
				} else if (this.type == 2) {
					this.obj.operationType = obj.type;
					this.$emit('packagesGoods', this.obj);
				} else if(item.isSpecial && obj.type == 'risk'){
					content = '请在购物车中删除';
				}
				else {
					let goods = {
						data: utils.deepCopy(item), // 商品数据
						operateObj: 'carGoodsList', // 操作对象
						operateType: 'splice',
						type:obj.type
					};
					//特价菜的添加需要用逐一添加
					if(item.isSpecial && obj.type == 'add'){
						goods.data.num = 1;
						goods.operateType = '';
					}
					
					this.$store.commit('setCarList', goods);

				}
				this.$store.commit('setWin', {
					content: content
				});
				storage.session('specialDetail', item);

			},
			openSpecialDetail(type, index) {
				// 打开口味弹窗
				this.obj.isEdit = Boolean(type == 'edit');
				this.obj.editIndex = index;
				if (this.packages && Object.keys(this.packages).length) {
					this.$emit('openSpecialDetail', this.obj);
				} else {
					// this.getCounter({type:'add',number:0});
				}

			}
		},
		async mounted() {
			orderData = await
			import( /* webpackChunkName:'lt_order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;


			// 是否自己处理加减数据
			/**
			 * 自己处理数据如下：
			 * this.obj.isGroup > 0 多规格
			 * Boolean(this.obj.type == '1' && this.obj.goodsName) 斤两菜
			 * Boolean(this.obj.packageName) 套餐
			 * this.obj.isAttr 口味菜
			 */

			if (this.obj.isGroup > 0 || Boolean(this.obj.type == '1' && this.obj.goodsName) || Boolean(this.packages) || Boolean(this.obj.packageName) || this.obj.isAttr) {
				this.exterStaus = 'all';
			} else {
				this.exterStaus = '';
				if(this.obj.isSpecial){
					this.exterStaus = 'left';
				}
			}

			
			// 如果 口味和规格已经有数量  显示加减
			// 列表里的 
			// 口味 有规格的 显示选规格    
			// 普通商品的 加减

			//套餐列表
			// 有口味    选规格
			// 普通商品  加减
			// 固定套餐  没有口味 都不显示
			// 有口味  选规格

			//type == 0 && this.packageName 套餐 
			// obj.type == 1  斤两菜

			// 1 加减
			// 2 选规格
			if (!this.packages) {
				//列表
				//this.obj.type  == 0 普通菜 没有口味 不是规格菜
				if (this.obj.type == '0' && !this.obj.isAttr && this.obj.isGroup == 0 || this.obj.packageName) {
					this.showType = '1';
				} else {
					this.showType = '2';
				}

			} else {
				//套餐
				//可选套餐下的商品 该商品没口味
				if (this.packages.type == 1 && !this.obj.isAttr) {
					this.showType = '1';
				} else if (this.obj.isAttr) {
					//有口味
					this.showType = '2';
				} else {
					//固定套餐的没有口味 都不显示
					this.showType = '3';
				}
			}
		},

		components: {
			riskAdd: () =>
				import( /* webpackChunkName: 'risk_add' */ 'src/components/riskAdd/risk_add.vue'),
			specialDetail: () =>
				import( /* webpackChunkName: 'special_detail' */ '../order/special_detail'),
		},
	};
</script>
<style lang='less' scoped>
	@import '../../../../res/css/base.less';
	section{
		position: relative;
		border-radius: 0.15rem;
		.top_left{
			position: absolute;
			z-index: 3;
			top: 0;
			left:0;
			.hot{
				height: 1.0667rem;
				vertical-align: top;
			}
			.must,.special{
				width: 1rem;
				height: 0.4933rem;
				vertical-align: top;
			}
		}
	}
	.one_goods {
		width: 7.8667rem;
		position: relative;
		z-index: 0;
		display: flex;
		// height: 3.8667rem;
		height: 2.64rem;
		clear: both;
		margin-bottom: 0.28rem;
		background: #fff;

		.div_wrap {
			position: relative;
			// width: 5.1333rem;
			width: 3.2rem;
			height: 2.64rem;
			
			overflow: hidden;
			background-position: 50%;
			background-size: cover;
			border-radius: 4px;
			-webkit-transform: translateZ(0);
			transform: translateZ(0);
			z-index: 0;

			.img_left {
				padding: 0 0.2rem 0 0rem;
				// position: absolute;
				// top: 50%;
				// left: 0;
				// z-index: 0;
				height: 100%;
				width: 100%;
				// -webkit-transform: translateY(-50%);
				// transform: translateY(-50%);
				overflow: hidden;

			}

			.hide-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 2;
				opacity: 0;
				padding: 0 0.2rem 0 0rem;
				overflow: hidden;

			}
		}

		.img_sq {
			height: 100%;
			padding: 0;
			position: absolute;
			display: flex;
			align-items: center;
			background: rgba(0, 0, 0, .5);
			width: 2.9rem;
			z-index: 2;

			img {
				width: 100%;
			}
		}

		.one_se {
			width: 4.6667rem;
			margin: 0.2rem 0.2rem 0 0;
			text-align: justify;
			display: inline-block;

			.goodsName {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.dashed {
				display: block;
				width: 100%;
				background: url('../../../../res/images/dian.png') center no-repeat;
				height: 0.2rem;
				/* margin-top: 0.1rem; */
				/* margin-bottom: 0.1rem; */
				background-size: 100%;
			}

			.specialPrice{
				
			}
			.oldPrice{
				text-decoration: line-through;
				color: #8F8F8F;
			}
			.kou_w {
				width: 100%;
				clear: both;
				height: 0rem;

				.kind {
					width: 1.02rem;
					height: 0.46rem;
					border: 1px solid #FCAE02;
					color: #FCAE02;
					font-size: 0.2933rem;
					line-height: 0.4rem;
					text-align: center;
					border-radius: 0.4rem;
					float: left;
					margin: 0 0.1rem 0 0;
					padding: 0 0.1rem;
				}

				.tc {
					border: 1px solid #FC5B02;
					color: #FC5B02;
				}

				.jl {
					border: 1px solid #C68850;
					color: #C68850;
				}
			}

			.price {
				text-align: left;
				padding: 0.01rem;
				color: #FF2035;
				margin: 0rem 0 0.1rem 0;
				font-size: 0.48rem;
				float: none;
				padding-left: 0;

				.litFont {
					color: #FF2035;
					font-size: 0.3467rem;
					.dis{
						border: 1px solid #FF2035;
						padding: 0.02rem 0.15rem;
						margin: 0 0.1rem;
					}
				}
			}

			.vipPirce {
				display: inline-block;
				margin-bottom: 0.04rem;
			}

			.bg_span {
				// background: pink;
				color: #FF2035;
				display: inline;
				word-break: break-all;
				font-size: 0.2933rem;

				span {
					font-size: 0.2133rem;
				}

			}

			.kou_wei {
				width: 100%;
				text-align: right;
				margin: 0.1rem 0 0.1rem 0;

				span {
					display: inline-block;
					width: 1.2333rem;
					height: 0.5667rem;
					background: #FCAE02;
					color: #fff;
					text-align: center;
					line-height: 0.5667rem;
					border-radius: 100px;
					margin-bottom: 0.02rem;
					font-size: 0.24rem;
				}
			}

			.btn_add {
				height: 0.6667rem;
				text-align: center;
				position: absolute;
				right: 0.2rem;
				bottom: 0.2rem;
			}

		}

	}

	.two_goods {
		width: 8.96rem;
		position: relative;
		z-index: 0;
		display: flex;
		height: 2rem;
		clear: both;
		background: #fff;
		margin: 0.8rem auto;


		.hot {
			display: none;
		}

		.div_wrap {
			position: relative;
			width: 2.7467rem;
			height: 2rem;
			overflow: hidden;
			background-position: 50%;
			background-size: cover;
			border-radius: 4px;
			-webkit-transform: translateZ(0);
			transform: translateZ(0);
			z-index: 0;

			.img_left {
				padding: 0 0.2rem 0 0rem;
				position: absolute;
				top: 50%;
				left: 0;
				height: 100%;
				width: 100%;
				z-index: 0;
				-webkit-transform: translateY(-50%);
				transform: translateY(-50%);
				overflow: hidden;

			}

			.hide-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 2;
				opacity: 0;
				padding: 0 0.2rem 0 0rem;
				overflow: hidden;
			}
		}

		.img_sq {
			
			height: 100%;
			padding: 0 0.2rem 0 0rem;
			position: absolute;
			display: -webkit-box;
			display: -webkit-flex;
			display: flex;
			-webkit-box-align: center;
			-webkit-align-items: center;
			align-items: center;
			width: 2.4rem;
			z-index: 2;
			background: url(../../../../res/images/sq.png) center no-repeat;
			background-size: 188%;
			background-color: rgba(0, 0, 0, 0.5);

			img {
				display: none;
				width: 100%;
			}
		}

		.two_se {
			width: 6.9333rem;
			text-align: justify;
			display: inline-block;

			.goodsName {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
			}

			.dashed {
				display: block;
				width: 100%;
				background: url(../../../../res/images/dian.png) center no-repeat;
				height: 0.2rem;
				margin-top: 0.1rem;
				margin-bottom: 0.1rem;
				background-size: 100%;
			}

			.specialPrice{
				overflow: hidden;
			}
			.oldPrice{
				display: inline-block;
			}
			.kou_w {
				width: 100%;
				clear: both;
				height: 0.6rem;

				.kind {
					width: 1.02rem;
					height: 0.46rem;
					border: 1px solid #FCAE02;
					color: #FCAE02;
					font-size: 0.2933rem;
					line-height: 0.4rem;
					text-align: center;
					border-radius: 0.4rem;
					float: left;
					margin: 0 0.1rem 0 0;
					padding: 0 0.1rem;
				}

				.tc {
					border: 1px solid #FC5B02;
					color: #FC5B02;
				}

				.jl {
					border: 1px solid #C68850;
					color: #C68850;
				}
			}

			.price {
				text-align: left;
				padding: 0.01rem;
				color: #FF2035;
				margin: 0rem 0 0.1rem 0;
				font-size: 0.48rem;
				float: left;
				padding-left: 0;

				.litFont {
					color: #FF2035;
					font-size: 0.3467rem;
					.dis{
						border: 1px solid #FF2035;
						padding: 0.05rem 0.15rem;
						margin: 0 0.1rem;
					}
				}
			}

			.vipPirce {
				clear: none;

			}

			.bg_span {
				// background: pink;
				color: #FF2035;
				display: inline;
				font-size: 0.2933rem;

				span {
					font-size: 0.2133rem;
				}

			}

			.kou_wei {
				width: 100%;
				text-align: right;
				margin: 0.1rem 0 0.1rem 0;

				span {
					display: inline-block;
					width: 1.2333rem;
					height: 0.5667rem;
					background: #FCAE02;
					color: #fff;
					text-align: center;
					line-height: 0.5667rem;
					border-radius: 100px;
					margin-bottom: 0.02rem;
					font-size: 0.24rem;
				}
			}

		}

	}

	.btn_add {
		// display: inline-block;
		float: right; // position: absolute;
		// right: 0.2rem;
		// bottom:0.2rem;
	}

	.three_goods {
		width: 10rem;
		position: relative;
		z-index: 0;
		display: flex;
		clear: both;
		background: #fff;
		margin: 0 auto;
		align-items: center;
		border-bottom: 1px solid #eaeaea;
		display: block;
		padding: 0.25rem 0 0.25rem 0;

		.hot {
			display: none;
		}

		.div_wrap {
			position: relative;
			width: 2.7467rem;
			height: 2rem;
			overflow: hidden;
			background-position: 50%;
			background-size: cover;
			border-radius: 4px;
			-webkit-transform: translateZ(0);
			transform: translateZ(0);
			z-index: 0;
			margin-left: 0.2rem;

			.img_left {
				padding: 0 0.2rem 0 0rem;
				position: absolute;
				top: 50%;
				left: 0;
				height: 100%;
				width: 100%;
				z-index: 0;
				-webkit-transform: translateY(-50%);
				transform: translateY(-50%);
				overflow: hidden;

			}

			.hide-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 2;
				opacity: 0;
				padding: 0 0.2rem 0 0rem;
				overflow: hidden;

			}
		}

		.img_sq {
			display: none;
		}

		.three_se {
			width: 6.8333rem;
			text-align: justify;
			display: inline-block;
			margin: 0 0 0.25rem 0;

			.goodsName {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
			}

			.dashed {
				display: block;
				width: 100%;
				background: url(../../../../res/images/dian.png) center no-repeat;
				height: 0.06rem;
				margin-top: 0.1rem;
				margin-bottom: 0.1rem;
			}

			.kou_w {
				width: 100%;
				clear: both;
				height: 0.6rem;

				.kind {
					width: 1.02rem;
					height: 0.46rem;
					border: 1px solid #FCAE02;
					color: #FCAE02;
					font-size: 0.2933rem;
					line-height: 0.4rem;
					text-align: center;
					border-radius: 0.4rem;
					float: left;
					margin: 0 0.1rem 0 0;
					padding: 0 0.1rem;
				}

				.tc {
					border: 1px solid #FC5B02;
					color: #FC5B02;
				}

				.jl {
					border: 1px solid #C68850;
					color: #C68850;
				}
			}

			.price {
				float: left;
				margin-right: 0.1rem;
			}

			.vipPirce {
				display: inline-block;
				clear: none;

			}

			.bg_span {
				background: pink;
				color: #FF2035;
				display: inline;

				span {
					font-size: 0.2133rem;
				}

			}

			.kou_wei {
				width: 100%;
				text-align: right;
				margin: 0.1rem 0 0.1rem 0;

				span {
					display: inline-block;
					width: 1.2333rem;
					height: 0.5667rem;
					background: #FCAE02;
					color: #fff;
					text-align: center;
					line-height: 0.5667rem;
					border-radius: 100px;
					margin-bottom: 0.02rem;
					font-size: 0.24rem;
				}
			}

		}

		.showDe {
			height: auto;
			line-height: 1rem;
			background: #f2f2f2;
			width: 100%;
			padding: 0 0.2rem;
			font-size: 0.3467rem;
			color: #8f8f8f;

			ul {
				li {
					position: relative;
					display: flex;
					align-items: center;
					height: 1.2rem;
					line-height: 1.2rem;

					span:nth-child(1) {
						position: absolute;
						left: 0;
						top: 0;
						width: 4rem;
						.text-overflow;
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
					}
				}

			}
		}

		open {
			position: absolute;
		}

	}

	// .btn_add{
	//     display: inline-block;
	//     clear:both;
	//     position: absolute;
	//     right: 0.2rem
	// }
	.choose-taste {
		float: right;
		width: 1.3333rem;
		height: .6667rem;
		line-height: .6667rem;
		text-align: center;
		font-family: PingFangSC-Medium;
		font-size: .2933rem;
		color: #FFFFFF;
		background: #FCAE02;
		border-radius: 1.3333rem;
		position: absolute;
		right: 0.2rem;
		bottom: 0.2rem;
	}

	.mem {
		width: 0.3rem;
		height: 0.26rem;
	}
</style>