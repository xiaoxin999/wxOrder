<template>
	<div class="sides-nav">
		<ul>
			<li :class="(sidesIndex.parent == i) ? ( (item.id == -4 || item.id == -5) ? 'must-on' : 'parent-on') : ''" :style="{height:(sidesIndex.parent == i && item.child && item.child.length >= 0) ? `${(item.child.length * 1.4) + 1.4}rem` : '1.4rem'}" v-for="(item,i) in list" :key="i" ref="parent">
				<img style="vertical-align:middle;margin: -0.05rem -0.1rem 0 0.1rem;" src="../../../../res/images/must.png" alt="" v-if="item.id == -4">
				<img style="vertical-align:middle;margin: -0.05rem -0.1rem 0 0.1rem;" src="../../../../res/images/special_icon.png" alt="" v-if="item.id == -5">
				<span :style="{display: (item.id == -4 || item.id == -5) ? 'inline' :'' }" @click="pickSides('parent',i)" :class="item.name.length > 4 ? 'ellipsis' : ''">
					<template v-if="item.name.length > 5">
						<p>{{item.name}}</p>
					</template>
					<template v-else>
						{{item.name}}
					</template>
				</span>
				<template v-if="item.child && item.child.length > 0">
					<ul>
						<li :class="(sidesIndex.child == j) ? 'child-on' : ''" v-for="(child,j) in item.child" :key="j" @click="pickSides('child',j,i)">
							{{child.name.slice(0,4)}}
						</li>
					</ul>
				</template>
			</li>
		</ul>
	</div>
</template>
<script>
	let fs = parseFloat(document.documentElement.style.fontSize);

	export default {
		props: {
			list: {
				default: () => []
			},
			sidesIndex: {
				type: Object,
				default: function() {
					return {
						'parent': -1,
						'child': -1
					};
				}
			}
		},
		data() {
			return {
				top: 0,
				num: 0 //计算当前选中的个数
			};
		},
		methods: {
			pickSides(type, index, parentIndex) {
				// 选择导航
				if (type == 'parent') {
					this.sidesIndex.child = -1;
				}
				this.sidesIndex[type] = (type == 'parent' && this.sidesIndex.parent == index) ? -1 : index;
				this.$emit('emitIndex', {
					parent: parentIndex == undefined ? index : parentIndex,
					index: parentIndex == undefined ? null : index
				});

			}
		},

		beforeUpdate() {

			let {
				parent,
				child
			} = this.sidesIndex;
			if (parent > -1) {

				let parentName = this.list[parent].name;
				let childName = '';
				if (child != -1) {
					try {
						childName = this.list[parent].child[child].name;
					} catch (e) {
						console.log(e);
					}

				}
				this.$store.commit('setTitle', parentName + (childName != '' ? ('/' + childName) : ''));
			}

			let totalNum = this.list.length + (parent > -1 ? this.list[parent].child.length : 0);
			this.num = parent + 1 + (child >= 0 ? (child + 1) : 0);

			if (this.num > 9 && this.num < totalNum - 9) {
				this.$el.scrollTop = (this.num / 9 * 9 - 5) * 1.4 * fs;
			} else {
				if (this.num < 9) {
					this.$el.scrollTop = 0;
				} else {
					this.$el.scrollTop = (totalNum - 8.5) * 1.4 * fs;
				}
			}

		}
	};
</script>
<style lang='less' scoped>
	@import '../../../../res/css/base.less';

	.sides-nav {
		img {
			width: 0.35rem;
		}

		ul li {
			.setBox(100%, 1.4rem);
			line-height: 1.4rem;
			font-size: .3467rem;
			font-family: PingFangSC-Regular;
			color: #575757;
			text-align: center;
			position: relative;
			transition: height 0.5s;

			overflow: hidden;

			span {
				display: block;
				.setBox(100%, 1.4rem);
				padding: 0 0.2rem;

				p {
					overflow: hidden;
					// height: .8rem;
				}
			}

			ul li {
				background: #F2F2F2;
				border-bottom: .0133rem solid #E1E1E1;

				span {
					position: absolute;
					margin-left: -0.1rem;
					margin-top: -1.1rem;
					font-size: .2933rem;
				}
			}

			&:last-child {
				border-bottom: none;
			}
		}

		.must-on {
			border: #FCAE02 1px solid;
			font-family: PingFangSC-Regular;
			font-size: .3467rem;
		}

		.parent-on {
			background: #FCAE02;
			font-family: PingFangSC-Regular;
			font-size: .3467rem;
			color: #FFFFFF;
		}

		.child-on {
			font-family: PingFangSC-Medium;
			color: #FCAE02;
			position: relative;

			&::after {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translate(0, -50%);
				.setBox(.1333rem, .32rem);
				background-color: #FCAE02;
			}
		}

		.ellipsis {
			word-break: break-all;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			line-height: 1.4;
			padding: .2667rem 0.2rem;
		}
	}
</style>