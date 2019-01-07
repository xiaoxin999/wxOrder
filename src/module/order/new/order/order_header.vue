<template>
	<header>
		<div class="marqu" ref='moveDiv' v-if='isShow' :class="{marqueeMove:move}">
			<img src="../../../../res/images/gong.png" alt="">
			<div v-if="!queeshow" ref="marqueeWidth">{{marquee}}</div>
			<marquee v-else behavior=scroll ref="marquee" direction=left hspace="0" vspace="0" loop="INFINITE" scrollamount="5" align=middle> {{marquee}}</marquee>
			<span class="close" @click="closeBtn()">x</span>
		</div>
		<div>
			<div class="search-btn fl" @click="toSearch()">搜索</div>
			<div class="classify fl">
				<div class="classify-name">{{$store.state.order.title}}</div>
			</div>
		</div>

	</header>
</template>
<script>
	export default {
		props: {
			marqueeShow: {
				type: Boolean,
				default: false
			},
			marquee: {
				type: String,
				default: ''
			},
		},
		data() {
			return {
				queeshow: false,
				move: false,
				show: true
			};
		},
		computed: {
			isShow() {
				return this.marqueeShow && this.show;
			}
		},
		updated() {
			if (this.isShow) {
				this.$nextTick(() => {

					this.$refs.moveDiv.addEventListener('animationend', this.listener, false);
					this.$emit('closeBtn','on');
					if(this.$refs.marqueeWidth){
						if (this.$refs.marqueeWidth.offsetWidth >= window.innerWidth * 0.65) {
							this.queeshow = true;
						} else {
							this.queeshow = false;
						}
					}
	
				});

			}
		},
		methods: {
			toSearch() {
				this.$router.push('/latestOrder/searchList');
			},
			closeBtn() {
				this.move = true;
			},
			listener() {
				this.show = false;
				this.$emit('closeBtn','close');
			}
		},
		// components: {},
		mounted(){
			this.$emit('closeBtn','close');
		}
	};
</script>
<style lang='less' scoped>
	@import '../../../../res/css/base.less';

	header {
		height: 2rem;
		overflow: none;
		.setBox(10rem, 1.4667rem);
		padding: .1333rem 0 .0933rem 0;
		position: fixed;
		left: 50%;
		top: 0;
		transform: translate(-50%, 0);
		z-index: 3;
		// overflow: hidden;


		.search-btn {
			.setBox(1.8267rem, 1.2rem);
			font-size: .3467rem;
			color: #8f8f8f;
			line-height: 1.2rem;
			background: #fff url(../../../../res/images/latest-order-sreach.png) no-repeat .3467rem center;
			border: .0133rem solid #E1E1E1;
			border-left: none;
			background-size: .3467rem .3467rem;
			text-indent: .8rem;
			cursor: pointer;
		}

		.classify {
			.setBox(calc(~'10rem - 1.8267rem'), 1.2rem);
			font-family: PingFangSC-Regular;
			font-size: .3467rem;
			line-height: 1.2rem;
			color: #565656;
			letter-spacing: 0;
			text-align: center;

			.classify-name {
				.setBox(4.1333rem, .5333rem);
				line-height: .5333rem;
				margin: .3333rem auto;
				position: relative;
				display: block;
				overflow: hidden;
				text-overflow: ellipsis;
				// white-space: nowrap;
				padding: 0 0.88rem;

				&::after {
					content: '';
					position: absolute;
					left: .4rem;
					top: 50%;
					transform: translate(-50%, 0);
					.setBox(.8rem, 1px);
					background-color: #B6B6B6;
				}

				&::before {
					content: '';
					position: absolute;
					right: -.4rem;
					top: 50%;
					transform: translate(-50%, 0);
					.setBox(.8rem, 1px);
					background-color: #B6B6B6;
				}
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