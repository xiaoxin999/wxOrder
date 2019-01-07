<template>
	<div class="btn">
		<img src="../../res/images/risk.png" class="left" :class="{show:showBtn.left}" @click="riskAddGoods('risk')" />
		<span v-if="!interactive" :class="{show:showBtn.left}" :style="{color:color}" class="text">{{number}}</span>
		<input v-else type="text" v-model="number">
		<img src="../../res/images/add.png" @click="riskAddGoods('add')" v-if="showBtn.right === true" />
		<span v-else>{{showBtn.right}}</span>
	</div>
</template>
<script>
	export default {
		props: {
			index: {
				type: [Number, String],
				default: 0
			},
			//默认值
			counter: {
				type: [Number, String],
				default: 0
			},
			//最小值
			min: {
				type: Number,
				default: 0
			},
			//最大值
			max: {
				type: Number,
				default: 99
			},
			//最大值
			interactive: {
				type: Boolean,
				default: false
			},
			//保留几位小数
			//默认是整数
			tofix: {
				type: Number,
				default: 0
			},
			//每次加减量级
			step: {
				type: Number,
				default: 1
			},
			show: {
				type: Object,
				default: function() {
					return {
						left: false,
						right: true
					};
				}
			},
			color: {
				type: String,
				default: 'black'
			},
			//数据是否是外界操作
			// "" 不控制
			// left 控制-
			// right 控制+
			// all 二者都控制
			exter: {
				type: String,
				default: ''
			}
		},
		watch: {
			counter(newV) {
				this.number = newV;
				if (this.number <= 0) {
					this.number = this.min;
					this.showBtn.left = false;
				} else {
					this.showBtn.left = true;
				}

				if (this.number >= this.max) {
					this.number = this.max;

				}
				this.number = Number(this.number).toFixed(this.tofix);

			}
		},
		data() {
			return {
				number: this.counter,
				showBtn: this.show
			};
		},
		methods: {
			riskAddGoods(type) {
				// if (!this.exter) {
				if (type == 'risk' && this.showBtn.left && (this.exter == '' || this.exter == 'right')) {
					if (this.number <= this.min) {
						this.number = this.min;

					} else {
						this.number = (Number(this.number) - this.step).toFixed(this.tofix);
					}
				}

				if (type == 'add' && this.showBtn.right && (this.exter == '' || this.exter == 'left')) {
					if (this.number >= this.max) {
						this.number = this.max.toFixed(this.tofix);
					} else {
						this.number = (Number(this.number) + this.step).toFixed(this.tofix);
					}
					this.showBtn.left = true;
				}
				// }
				if ((type == 'risk' && this.showBtn.left) || (type == 'add' && this.showBtn.right)) {
					this.$emit('sendCounter', {
						type,
						index: this.index,
						number: this.number
					});
				}

				if (this.number <= 0) this.showBtn.left = false;

			}
		},
		mounted() {
			if (this.counter > 0) {
				this.showBtn.left = true;
			}
			// this.step = 1/Math.pow(10,this.tofix);
			// if(this.tofix) this.number = +this.counter.toFixed(this.tofix);
		},
		computed: {

		},
		components: {},
	};
</script>
<style lang='less' scoped>
	.btn {
		height: 0.6667rem;
		text-align: center;

		img {
			width: 0.6667rem;
			vertical-align: middle;
		}

		span {
			display: inline-block;
			width: 0.65rem;
			vertical-align: middle;
		}

		input {
			width: 0.65rem;
			vertical-align: middle;
			border: none;
		}

		.left,
		.text {
			opacity: 0;
		}

		.show {
			opacity: 1;
		}
	}
</style>