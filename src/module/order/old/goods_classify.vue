<template>
	<div id="goods-classify" class="goods-classify">
		<div class="marqu" ref='moveDiv' v-if='isShow' :class="{marqueeMove:move}">
			<img src="./../../../res/images/gong.png" alt="">
			<div v-if="!queeshow" ref="marqueeWidth">{{marquee}}</div>
			<marquee v-else-if="queeshow" behavior=scroll ref="marquee" direction=left hspace="0" vspace="0" loop="INFINITE" scrollamount="5" align=middle> {{marquee}}</marquee><span class="close" @click="closeBtn()">x</span>
		</div>
		<div ref="navList" class="navList">
			<div v-for="(navs,index) in navsList" v-bind:key="index" class="navs" :class="(firstNavIndex == index) ? 'navs-select' : ''" @click="clickNavs('1',index,navs)">
				<img style="vertical-align:middle;margin: -0.05rem 0 0 0.1rem;" src="../../../res/images/must.png" alt="" v-if="navs.id == -4">
				<img style="vertical-align:middle;margin: -0.05rem 0 0 0.1rem;" src="../../../res/images/special_icon.png" alt="" v-if="navs.id == -5">
				{{navs.name}}
			</div>
		</div>
		<div class="navChild" :class="{navChilds:move || !queeshow}" v-show="childNav && childNav.length >= 1">
			<span v-for="(child,index) in childNav" v-bind:key="child.name" :class="(childNavIndex == index) ? 'child-select' : ''" @click="clickNavs('2',index,child)">{{child.name}}</span>
		</div>
		<div class="sreach-btn" @click='search'>

		</div>
	</div>
</template>

<script>
	import storage from 'src/verdor/storage';
	export default {
		data() {
			return {
				firstNavIndex: 0, // 选中的一级分类下标
				childNavIndex: -1, // 选中的二级分类下标
				childNav: [], // 二级分类
				parentItem: [],
				queeshow: false,
				move: false,
				show: true
			};
		},
		computed: {
			mustOk() {
				return this.$store.state.order.mustStatus;
			},
			isShow() {
				return this.marqueeShow && this.show;
			}
		},
		watch: {
			mustOk() {
				this.$refs.navList.scrollLeft = 0;
				this.clickNavs('1', 0, {
					child: [],
					id: '-4',
					name: '必选品',
					pid: '256',
					type: 1
				});
			}
		},
		props: {
			navsList: {
				type: Array,
				default: () => []
			},
			marqueeShow: {
				type: Boolean,
				default: false
			},
			marquee: {
				type: String,
				default: ''
			},
		},
		methods: {
			clickNavs: function(type, index, item) {
				// 选择分类
				if (type === '1') {
					this.firstNavIndex = index;
					this.childNav = item.child;
					this.childNavIndex = -1;
					this.parentItem = item;
				} else {
					this.childNavIndex = index;
					if (item.name == '全部') {
						item = this.parentItem;
					}
				}
				item.type = type;
				this.$emit('navs', item);
			},
			search() {
				this.$emit('navs', {
					name: 'search'
				});
			},
			toSearch() {
				this.$router.push('/latestOrder/searchList');
			},
			closeBtn() {
				this.move = true;
			},
			listener() {
				this.show = false;
				this.$emit('closeBtn');
			}
		},
		updated() {

			if (this.firstCom && this.navsList.length > 0) {
				let p = storage.session('packagePage');
				if (!p) {
					this.clickNavs('1', 0, this.navsList[0]);
				} else {
					this.$nextTick(() => {
						let dom = this.$refs.navList;
						dom.scrollLeft = dom.scrollWidth - dom.offsetWidth;
						this.firstNavIndex = this.navsList.length - 1;
						storage.session('packagePage', null);
						this.clickNavs('1', this.firstNavIndex, this.navsList[this.firstNavIndex]);
					});
				}
				this.firstCom = false;
			}

			if (this.isShow) {
				this.$nextTick(() => {
					this.$refs.moveDiv.addEventListener('animationend', this.listener, false);
					if (this.$refs.marqueeWidth) {
						if (this.$refs.marqueeWidth.offsetWidth >= window.innerWidth * 0.65) {
							this.queeshow = true;
						} else {
							this.queeshow = false;
						}
					}

				});

			}
		},
		mounted() {

			this.firstCom = true;
			// console.log(this.marquee,'marquee');
			// vue2.0版本使用mounted替代ready
			// this.$emit('io',{name:'sung'});
			// if (this.isShow) {
			// 	this.$refs.moveDiv.addEventListener('animationend', this.listener, false);
			// 	if (this.$refs.marqueeWidth && (this.$refs.marqueeWidth.offsetWidth >= window.innerWidth * 0.65)) {
			// 		this.queeshow = true;
			// 	} else {
			// 		this.queeshow = false;
			// 	}
			// }


		}
	};
</script>

<style lang="less" scoped>
	@import '../../../res/css/base.less';

	.goods-classify {
		position: fixed;
		left: 0;
		top: 0;
		// font-size: 0;
		background-color: #f7f7f7;
		border-bottom: 1px solid #ddd;
		.px2rem(width, 750);
		// .px2rem(height, 94);
		// .box(px2rem(750px),px2rem(94px));
		z-index: 9;

		.navList {
			.px2rem(width, 656);
			.px2rem(height, 94);
			// .box(calc(#{px2rem(750px)} - #{px2rem(94px)}),px2rem(94px));

			color: #888;
			font-size: 0;
			float: left;
			overflow-x: scroll;
			overflow-y: hidden;
			white-space: nowrap;
			-webkit-overflow-scrolling: touch;

			img {
				width: 0.35rem;
			}

			div.navs {
				// padding : 0 px2rem(24px);
				.px2rem(padding-top, 0);
				.px2rem(padding-left, 24);
				.px2rem(padding-bottom, 0);
				.px2rem(padding-right, 24);
				.px2rem(font-size, 32);
				// font-size : px2rem(32px);
				display: inline-block;
				// float: left;
				// .box(auto,px2rem(94px));
				// .px2rem(width,auto);
				width: auto;
				.px2rem(height, 94);

				// line-height : px2rem(94px);
				.px2rem(line-height, 94);

				position: relative;
			}

			.navs-select {
				color: #f6a623;

				&:after {
					content: '';
					position: absolute;
					left: 50%;
					transform: translate(-50%, 0);
					// bottom : px2rem(10px);
					.px2rem(bottom, 10);
					// .box(px2rem(56px),px2rem(6px));
					.px2rem(width, 56);
					.px2rem(height, 6);
					background-color: #f6a623;
				}
			}
		}

		.navChild {
			// .box(px2rem(750px),px2rem(94px));
			.px2rem(width, 750);
			.px2rem(height, 94);
			// font-size : px2rem(26px);
			.px2rem(font-size, 26);
			color: #888888;
			background-color: #fbfbfb;
			position: fixed;
			// top : px2rem(94px);
			.px2rem(top, 176);
			left: 0;
			z-index: 66;
			overflow-x: scroll;
			overflow-y: hidden;
			white-space: nowrap;
			-webkit-overflow-scrolling: touch;

			>span {
				padding: 0 0.32rem;
				font-size: 0.42267;
				display: inline-block;
				// .box(auto,px2rem(94px));
				width: auto;
				height: 1.253rem;
				line-height: 1.253rem;
				position: relative;
				font-size: 0.3466rem;
			}

			.child-select {
				color: #f6a623;
			}
		}

		.navChilds {
			// .box(px2rem(750px),px2rem(94px));
			.px2rem(width, 750);
			.px2rem(height, 94);
			// font-size : px2rem(26px);
			.px2rem(font-size, 26);
			color: #888888;
			background-color: #fbfbfb;
			position: fixed;
			// top : px2rem(94px);
			.px2rem(top, 94);
			left: 0;
			z-index: 66;
			overflow-x: scroll;
			overflow-y: hidden;
			white-space: nowrap;
			-webkit-overflow-scrolling: touch;

			>span {
				padding: 0 0.32rem;
				font-size: 0.42267;
				display: inline-block;
				// .box(auto,px2rem(94px));
				width: auto;
				height: 1.253rem;
				line-height: 1.253rem;
				position: relative;
				font-size: 0.3466rem;
			}

			.child-select {
				color: #f6a623;
			}
		}

		.sreach-btn {

			.px2rem(width, 94);
			.px2rem(height, 94);
			background: url(../../../res/images/nav-icon-search.png) center center no-repeat #f6a623;
			background-size: .8rem .8rem;
			float: left;
		}
	}

	.marqu {
		width: 9.5rem;
		left: 0.2rem;
		text-align: center;
		height: 0.9333rem;
		display: flex;
		align-items: center;
		border-radius: 0 100px 100px 0;
		background: #f2e6d2;
		color: #F0A64C;
		margin-bottom: 0.14rem;
		overflow: hidden;

		div {
			white-space: nowrap;
			width: 7.64rem;

		}

		img {
			width: 0.4rem;
			height: 0.4133rem;
			// position: absolute;
			// left: 0.2rem;
			background: #f2e6d2;
			// z-index: 2;
			margin-left: 0.32rem;
			margin-right: 0.2667rem;
		}
	}

	.marqueeMove {
		animation: mymove 1s;
		animation-fill-mode: forwards;
	}

	.close {
		color: #F0A64C;
		font-size: 0.4rem;
		display: inline-block;
		cursor: pointer;
		width: 0.42rem;
		margin-left: 0.32rem;
		height: 0.2667rem;
		line-height: 0.2667rem;
		padding-right: 0.2rem;
	}

	@keyframes mymove {
		from {
			width: 9.5rem;
		}

		to {
			width: 0;
		}
	}

	marquee {
		background: #f2e6d2;
		color: #F0A64C;
		height: .6rem;
		line-height: .6rem;
		float: left;
		z-index: 1;
		border-radius: 0 100px 100px 0;
		width: 9.5rem;
		margin-left: 0.2rem;
	}
</style>