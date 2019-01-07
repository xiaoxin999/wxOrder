<template>
	<div id='app'>
		<keep-alive>
			<router-view v-if='$route.meta.keepAlive'></router-view>
		</keep-alive>

		<router-view v-if='!$route.meta.keepAlive'>

		</router-view>

		<broadcast></broadcast>
		<globalLoad v-if='show'></globalLoad>

	</div>
</template>

<style lang='less'>
	#app {
		width: 100%;
		height: 100%;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>

<script>
	import broadcast from 'src/components/global_broadcast'; //全局提示框
	import globalLoad from 'src/components/phone/global_load'; //全局加载条
	let b = document.body;
	let h = document.documentElement;
	let top = 0;
	let str = '';
	let stack = [];
	let maxTime = null;
	export default {
		data() {
			return {
				show: false
			};
		},
		// mounted() {
		// let content = this.$el;
		// let startY;

		// content.addEventListener('touchstart', function(e) {
		// 	startY = e.touches[0].clientY;
		// });

		// content.addEventListener('touchmove', function(e) {
		// 	// 高位表示向上滚动
		// 	// 底位表示向下滚动
		// 	// 1容许 0禁止
		// 	let status = '11';
		// 	let ele = this;

		// 	let currentY = e.touches[0].clientY;

		// 	if (ele.scrollTop === 0) {
		// 		// 如果内容小于容器则同时禁止上下滚动
		// 		status = ele.offsetHeight >= ele.scrollHeight ? '00' : '01';
		// 	} else if (ele.scrollTop + ele.offsetHeight >= ele.scrollHeight) {
		// 		// 已经滚到底部了只能向上滚动
		// 		status = '10';
		// 	}

		// 	// if (status != '11') {
		// 		// 判断当前的滚动方向
		// 		// let direction = currentY - startY > 0 ? '10' : '01';
		// 		// 操作方向和当前允许状态求与运算，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
		// 		// if (!(parseInt(status, 2) & parseInt(direction, 2))) {

		// 		// }
		// 	// }
		// });
		// },
		computed: {
			hide() {
				return this.$store.state.overHide || this.$store.state.loadShow;
			},
			showLoad() {
				return this.$store.state.loadShow;
			}
		},
		watch: {
			hide(newV) {

				if (newV == true) {
					top = document.documentElement.scrollTop || document.body.scrollTop;
				}

				if (newV) {
					b.className += ' overHiden';
					h.className += ' overHiden';
				} else {
					b.className = b.className.replace('overHiden', '');
					h.className = h.className.replace('overHiden', '');
				}
				b.scrollTop = h.scrollTop = top;


			},
			//锁死检测
			showLoad(newV) {
				if (newV) {
					str = setTimeout(() => {
						if (stack.length > 0) {
							clearTimeout(str);
							str = null;
						} else {
							this.show = false;
						}
					}, 250);
					stack.push('add');
					this.show = true;

					//加载条存在的极限时间
					clearTimeout(maxTime);
					maxTime = setTimeout(() => {
						stack.length = 0;
						clearTimeout(maxTime);
						this.show = false;
					}, 15000);

				} else {
					stack.shift();
					if (str == null && stack.length == 0) {
						clearTimeout(maxTime);
						this.show = false;
					}
				}

			}
		},
		components: {
			broadcast,
			globalLoad
		}
	};
</script>