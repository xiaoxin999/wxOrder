<template>
	<div @touchstart.prevent="touch($event)" @touchmove.prevent="touch($event)" @touchend.prevent="touch($event)" class="date-selector date-selector-left">
		<ul ref="arrIdx">
			<li></li>
			<li></li>
			<template v-if="minsList">
				<li :key="index" v-for="(item,index) in minsList">
					{{ item + '分'}}
				</li>
			</template>
			<template v-else>
				<li :key="index" v-for="(item,index) in len">
					{{ formatTxt(item,index) }}
				</li>
			</template>

			<li></li>
			<li></li>
		</ul>
	</div>
</template>

<script>
	let types = {
		'year': '年',
		'mouth': '月',
		'day': '日',
		'hour': '时',
		'minute': '分'
	};
	export default {
		name: 'select-list',
		data() {
			return {
				currentPosition: null,
				liHeight: 40,
				start: {
					Y: 0,
					time: ''
				},
				move: {
					Y: 0,
					speed: []
				},
				end: {
					Y: 0,
					index: 0
				},
				displacement: [], // 位移距离
				displacementTime: [], // 位移时间
				stopClick: true,
			};
		},
		props: {
			timeType: {
				type: String
			},
			list: {
				type: Array
			},
			distance: {
				type: Number
			},
			param: {
				type: Array
			},
			minsList: [Array, null]
		},
		mounted() {
			this.$nextTick().then(() => {
				this.currentPosition = this.distance;
				let $selector = this.$refs.arrIdx;
				this.setTransform($selector, -this.currentPosition);
			});
		},
		computed: {
			len() {
				return this.minsList ? this.minsList.length : (this.list[1] - this.list[0] + 1);
			},
			maxHeight() {
				return (this.len - 1) * this.liHeight;
			}
		},
		updated() {
			// let $selector = this.$refs.arrIdx;
			this.currentPosition = Math.floor(this.distance);
		},

		methods: {
			formatTxt(item) {
				let num = 0;
				let frist = this.list[0];

				num = frist + item - 1 + types[this.timeType];

				return num;
			},
			touch(event) { // event, vm, $selector, array, idx
				event = event || window.event;
				event.preventDefault();
				let $selector = this.$refs.arrIdx;
				switch (event.type) {
					case 'touchstart':
						event.preventDefault();
						this.move.speed = [];
						this.start.Y = event.touches[0].clientY;
						this.start.time = Date.now();
						break;
					case 'touchend':
						event.preventDefault();
						this.end.Y = event.changedTouches[0].clientY;
						let tempDis = this.currentPosition + (this.start.Y - this.end.Y);
						this.currentPosition = tempDis < 0 ? 0 : (tempDis < this.maxHeight ? tempDis : this.maxHeight);
						this.initSpeed(this.move.speed, this.start.Y - this.end.Y, this.maxHeight);
						// if(this.start.Y-this.end.Y >= 0){
						//     this.setTransform($selector,-this.currentPosition);
						// }else{
						//     this.setTransform($selector,this.currentPosition);
						// }
						this.setTransform($selector, -this.currentPosition);
						this.setTransition($selector, this.move.speed[0]);
						if (Math.abs(this.start.Y - this.end.Y) >= 20) {
							this.getDateArr(this.currentPosition);
						}
						break;
					case 'touchmove':
						event.preventDefault();
						this.move.Y = event.touches[0].clientY;
						let offset = this.start.Y - this.move.Y;
						if (this.currentPosition == 0 && offset < 0) {
							this.setTransform($selector, 1.5 * this.liHeight);
							this.setTransition($selector, 0.3);
						} else {
							this.setTransform($selector, '-' + (offset + this.currentPosition));
						}
						if (this.currentPosition <= -this.maxHeight) {
							this.setTransform($selector, '-' + this.liHeight);
							this.setTransition($selector, 0.3);
						}
						if (Math.abs(offset).toFixed(0) % 5 === 0) {
							let time = Date.now();
							this.move.speed.push((Math.abs(offset) / (time - this.start.time)).toFixed(2));
						}
						break;
				}
			},
			setTransform($selector, val = 0) {
				$selector.style.transform = `translate3d(0,${val}px, 0)`;
				$selector.style.webkitTransform = `translate3d(0,${val}px, 0)`;
			},
			setTransition($selector, val = 0) {
				$selector.style.transition = `transform ${val}s ease-out`;
				$selector.style.webkitTransition = `-webkit-transform ${val}s ease-out`;
			},
			initPosition(dis, max) {
				dis = dis < 0 ? 0 : dis;
				dis = dis > max ? max : dis;
				let sub = dis % this.liHeight;
				if (sub < this.liHeight / 2) {
					this.currentPosition = dis - sub;
				} else {
					this.currentPosition = dis + (this.liHeight - sub);
				}
				return this;
			},
			initSpeed(arr, dir, max) {
				let letiance = 0;
				let sum = 0;
				for (let i in arr) {
					sum += arr[i] - 0;
				}
				for (let j in arr) {
					letiance += (arr[j] - (sum / arr.length)) * (arr[j] - (sum / arr.length));
				}
				let rate = 0;
				if ((letiance / arr.length).toFixed(2) > .1) {
					rate = max > this.liHeight * 15 ? dir * 2 : 0;
					this.initPosition(this.currentPosition + rate, max);
					this.move.speed[0] = .2;
				} else {
					this.initPosition(this.currentPosition, max);
					this.move.speed[0] = this.move.speed[0] > 0.2 ? .2 : this.move.speed[0];
				}

				return this;
			},
			getDateArr(dis) {
				switch (this.timeType) {
					case 'year':
						this.$emit('changeResult', {
							id: 0,
							type: 'year',
							data: dis / 40 + this.list[0]
						});
						break;
					case 'mouth':
						this.$emit('changeResult', {
							id: 1,
							type: 'mouth',
							data: dis / 40 + this.list[0]
						});
						break;
					case 'day':
						this.$emit('changeResult', {
							id: 2,
							type: 'day',
							data: dis / 40 + this.list[0]
						});
						break;
					case 'hour':
						this.$emit('changeResult', {
							id: 3,
							type: 'hour',
							data: dis / 40 + this.list[0]
						});
						break;
					case 'minute':
						this.$emit('changeResult', {
							id: 4,
							type: 'minute',
							data: this.minsList ? this.minsList[dis / 40] : (dis / 40 + this.list[0])
						});
				}
			},
		}
	};
</script>

<style lang="less" scoped>
	.date-selector {
		display: inline-block;
		height: 200px;
		overflow: hidden;
		position: relative;
		z-index: -1;
		top: 0;
		vertical-align: top;
	}

	.date-selector .date-selector-left {
		width: 33.33%;
	}

	.date-selector .date-selector-right {
		width: 50%;
	}

	.date-selector ul::-webkit-scrollbar {
		display: none;
	}

	.date-selector li {
		height: 40px;
		text-align: center;
		font-size: 16px;
		line-height: 40px;
		list-style: none;
	}
</style>