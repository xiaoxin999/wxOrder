<!-- :class="[isShow?'date-selector-bg-up': '']"        :class="[isShow?'date-selector-container-up':'']"-->
<template>
	<section>
		<div @click="closeData" class="date-selector-bg date-selector-bg-up">
			<div class="date-selector-container date-selector-container-up">
				<div class="date-selector-btn-box">
					<div @click="closeData" class="date-selector-btn">返回</div>
					<div v-if="type==1" class="date-selector-tab-box">
						<div @click.stop="showYear()" class="date-selector-tab" :class="isYear?'date-selector-tab-active': ''">年月日</div>
						<div @click.stop="showHour()" class="date-selector-tab" :class="!isYear?'date-selector-tab-active': ''">时分</div>
					</div>
					<div @click.stop='makeSureData' class="date-selector-btn">提交</div>
				</div>
				<div v-if="type == 0" class="date-selector-content">
					<selector-list v-for="(item,index) in htmlList" :key="index" :style="styleObj" :distance="distance[index]" :list="item" :timeType="timeType[index]" :param="param" @changeResult="changeResult" :minsList="timeType[index] == 'minute' ? minsList : null">
					</selector-list>
					<div class="date-selector-up-shadow"></div>
					<div class="date-selector-down-shadow"></div>
					<div class="date-selector-line"></div>
					<!-- <click-bar></click-bar> -->
				</div>
				<div class="date-selector-content" v-if="type == 1" :class="isYear?'':'date-selector-content-right'">
					<selector-list :distance="distance[0]" :maxHeight="maxHeight[0]" :list="htmlList[0]" :ind="0" :param="param" :resultArr="resultArr" @daysChange="daysChange" @changeResult="changeResult" :minsList="minsList">
					</selector-list>

					<!--月-->

					<selector-list :distance="distance[1]" :maxHeight="maxHeight[1]" :list="htmlList[1]" :ind="1" :param="param" :resultArr="resultArr" @daysChange="daysChange" @changeResult="changeResult" :step="1">
					</selector-list>
					<!--日-->
					<selector-list :distance="distance[2]" :maxHeight="maxHeight[2]" :list="htmlList[2]" :ind="2" :param="param" :resultArr="resultArr" @changeResult="changeResult" :step="1">
					</selector-list>
					<div class="date-selector-up-shadow"></div>
					<div class="date-selector-down-shadow"></div>
					<div class="date-selector-line"></div>
				</div>
				<div v-if="type == 1" class="date-selector-content" :class="!isYear?'':'date-selector-content-right'">
					<!--小时-->
					<selector-list :distance="distance[3]" :maxHeight="maxHeight[3]" :list="htmlList[3]" :ind="3" :param="param" :resultArr="resultArr" @changeResult="changeResult" :step="1">
					</selector-list>
					<!--分钟-->
					<selector-list :distance="distance[4]" :maxHeight="maxHeight[4]" :list="htmlList[4]" :ind="4" :param="param" :resultArr="resultArr" @changeResult="changeResult" :step="1">
					</selector-list>
					<div class="date-selector-up-shadow"></div>
					<div class="date-selector-down-shadow"></div>
					<div class="date-selector-line"></div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	/**
	 * type   1 表示左右滑动的时间选择分为年月日和时分，0 表示年月日时分全部显示在同一页面
	 * recent_time  Array  要显示的当前默认显示时间
	 * fullDose    是否显示全量数据
	 * param   显示的格式
	 */
	import SelectorList from 'src/components/selector_list';
	export default {
		data() {
			return {
				ulCount: 0,
				idxArr: [],
				endTime: [],
				liHeight: 40,
				resultArr: [], //  最终返回的数据
				maxHeight: [],
				distance: [],
				htmlList: [],
				isYear: true,
				timeType: ['year', 'mouth', 'day', 'hour', 'minute'],
				stepTime: 1
			};
		},
		props: {
			hoursDelay: 0,
			dayDelay: 0,
			minsList: Array,
			type: {
				type: Number,
				default: 0
			},
			param: {
				type: Array
			},
			recent_time: {
				type: Array,
				default: function() {
					let time = new Date();
					let fristTimer = time.getTime();
					let nowTime = new Date(fristTimer + this.hoursDelay * 60 * 1000 * 60 + 24 * 1000 * 60 * 60 * this.dayDelay);
					return [nowTime.getFullYear(), nowTime.getMonth() + 1, nowTime.getDate(), nowTime.getHours(), nowTime.getMinutes()];
				}
			},
			fullDose: {
				type: Boolean,
				default: false
			},
			step: {
				type: Number,
				default: 1
			}

		},
		computed: {
			styleObj() {
				return {
					width: (100 / (this.ulCount)).toFixed(2) + '%'
				};
			}
		},
		mounted() {
			this.checkParam();
			this.stepTime = this.step;
		},
		methods: {
			initPar() {
				this.checkParam();
			},
			changeResult(val) {
				if (this.fullDose) {
					this.$set(this.resultArr, val.id, val.data);

					switch (val.type) {
						case 'year':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'mouth':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'day':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'hour':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'minute':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
					}
				} else {
					this.$set(this.resultArr, val.id, val.data);
					switch (val.type) {
						case 'year':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'mouth':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'day':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'hour':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
						case 'minute':
							this.initFullTime(val.id, this.checkTime(val.id));
							break;
					}
				}

			},
			checkTime(id) {
				let start = false;
				for (let i = 0; i < id + 1; i++) {
					if (this.resultArr[i] !== this.recent_time[i]) {
						start = true;
					}
				}
				return start;
			},
			initFullTime(id, isChange) { // isChange 位true 表示全部显示
				for (let i = id + 1; i < this.param.length; i++) {
					if (/(\d)+-(\d)+/.test(this.param[i])) {
						let arr = this.param[i].split('-');
						let arrHtml = [];
						let max;
						if (i === 2) {
							let days = new Date(this.resultArr[0], this.resultArr[1], 0).getDate();
							max = days;
						} else {
							max = Number(arr[1]);
						}
						let minMax = !isChange && this.fullDose ?
							Math.max(Number(arr[0]), this.recent_time[i]) :
							Number(arr[0]);
						if (i == 3 && this.hoursDelay == 0) {
							minMax = arr[0];
							max = arr[1];
						}
						arrHtml.push(minMax, max);
						this.$set(this.htmlList, i, arrHtml);
						// // this.htmlList[i] = arrHtml
						// this.resultArr[i] = Number(this.recent_time[i]);
						if (max < this.recent_time[i]) {
							this.distance[i] = isChange ?
								this.liHeight * (max - minMax) :
								0; // 记录当前ul高度
							this.$set(this.resultArr, i, max);
						} else {
							this.distance[i] = isChange ?
								this.liHeight * (this.recent_time[i] - minMax) :
								0; // 记录当前ul高度
							this.$set(this.resultArr, i, this.recent_time[i]);
						}

					} else {
						this.htmlList[i] = 0;
						this.distance[i] = 0;
						this.resultArr[i] = 0;
					}
				}
			},
			showYear() {
				this.isYear = true;
			},
			showHour() {
				this.isYear = false;
			},
			closeData() {
				this.$emit('closeData', {
					type: 'close'
				});
			},
			makeSureData() {
				this.$emit('closeData', {
					type: 'makeSure',
					data: this.resultArr
				});
			},

			checkParam() {
				let idxArr = [];
				let fullDose = this.fullDose;
				let arrHtml = [];
				for (let i = 0; i < this.param.length; i++) {
					if (/(\d)+-(\d)+/.test(this.param[i])) {
						let arr = this.param[i].split('-');
						let arrHt = [];
						let minMax = fullDose ?
							Math.max(Number(arr[0]), this.recent_time[i]) :
							Number(arr[0]);
						if (i == 3 && this.hoursDelay == 0) {
							arrHt.push(Number(arr[0]), Number(arr[1]));
						}else{
							arrHt.push(minMax, Number(arr[1]));
						}
						// this.htmlList[i] = arrHtml
						arrHtml[i] = arrHt;
						idxArr.push(i);
						this.distance[i] = this.liHeight * (this.recent_time[i] - minMax); // 记录当前ul高度
						this.resultArr[i] = Number(this.recent_time[i]);
					} else {
						this.htmlList[i] = 0;
						this.distance[i] = 0;
						this.resultArr[i] = 0;
					}
				}
				this.htmlList = arrHtml;
				let days = new Date(this.resultArr[0], this.resultArr[1], 0).getDate();
				if (this.param[2]) {
					this.$set(this.htmlList, 2, [this.htmlList[2][0], days]);
					// this.$set(this.distance,2,0)
					// this.$set(this.resultArr,2,0)
				}

				this.ulCount = idxArr.length;
			},
		},
		components: {
			SelectorList
		}
	};
</script>

<style lang="less" scoped>
	section {
		z-index: 100;
		position: fixed;
	}

	.date-selector-locked {
		height: 100% !important;
		overflow: hidden !important;
	}

	.date-selector-bg {
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(75, 75, 75, 0);
		height: 100%;
		width: 100%;
		overflow: hidden;
		transition: all .3s ease;
		-webkit-transition: all .3s ease;
		z-index: -1;
	}

	.date-selector-bg-up {
		z-index: 999 !important;
		background: rgba(75, 75, 75, 0.65) !important;
	}

	.date-selector-container {
		width: 100%;
		height: 250px;
		position: absolute;
		bottom: 0;
		transform: translate3d(0, 250px, 0);
		-webkit-transform: translate3d(0, 250px, 0);
		left: 0;
		background-color: #FFF;
		transition: transform .3s ease;
		-webkit-transition: -webkit-transform .3s ease;
		z-index: -1;
	}

	.date-selector-container-up {
		transform: translate3d(0, 0, 0) !important;
		-webkit-transform: translate3d(0, 0, 0) !important;
	}

	.date-selector-btn-box {
		display: block;
		position: absolute;
		bottom: 0;
		text-align: center;
		width: 100%;
		height: 50px;
		line-height: 50px;
		background: rgb(0, 0, 0);
		z-index: 10;
	}

	.date-selector-btn-box .date-selector-btn {
		position: absolute;
		display: inline-block;
		width: 50%;
		color: #fff;
		right: 0;
	}

	.date-selector-btn-box .date-selector-btn:nth-child(1) {
		left: 0;
		border-left: none;
		right: initial;
	}

	.date-selector-btn {
		border-left: 1px solid #fff;
	}

	.date-selector-tab-box {
		display: inline-block;
		border-radius: 10px;
		margin: 9px 0;
		height: 32px;
		box-sizing: border-box;
		line-height: 30px;
		color: rgba(218, 218, 218, .7);
		background: #fff;
		border: 1px solid #fff;
		position: relative;
		z-index: 100;
	}

	.date-selector-tab-box .date-selector-tab {
		display: inline-block;
		padding: 0 10px;
		transition: all .3s ease;
	}

	.date-selector-tab-box .date-selector-tab:first-child {
		border-right: 1px solid #fff;
	}

	.date-selector-tab-box .date-selector-tab-active {
		color: #fff;
		border-radius: 10px;
		background: rgba(219, 219, 219, 1);
	}

	.date-selector-content-left {
		transform: translate3d(-100%, 0, 0) !important;
		-webkit-transform: translate3d(-100%, 0, 0) !important;
	}

	.date-selector-content-right {
		transform: translate3d(100%, 0, 0) !important;
		-webkit-transform: translate3d(100%, 0, 0) !important;
	}

	.date-selector-content {
		position: absolute;
		width: 100%;
		background: #fff;
		font-size: 0;
		top: 0;
		z-index: 10;
		transform: translate3d(0, 0, 0);
		-webkit-transform: translate3d(0, 0, 0);
		transition: transform .3s ease;
		-webkit-transition: -webkit-transform .3s ease;
	}

	.date-selector-content .date-selector {
		display: inline-block;
		height: 200px;
		overflow: hidden;
		position: relative;
		z-index: -1;
		top: 0;
		vertical-align: top;
	}

	.date-selector-content .date-selector-left {
		width: 33.33%;
	}

	.date-selector-content .date-selector-right {
		width: 50%;
	}

	.date-selector-content ul::-webkit-scrollbar {
		display: none;
	}

	.date-selector-content li {
		height: 40px;
		text-align: center;
		font-size: 16px;
		line-height: 40px;
		list-style: none;
	}

	.date-selector-content .date-selector-up-shadow,
	.date-selector-content .date-selector-down-shadow {
		width: 100%;
		height: 80px;
		position: absolute;
		pointer-events: none;
		background-image: linear-gradient(to bottom, #FFF, rgba(255, 255, 255, 0));
		z-index: 50;
	}

	.date-selector-content .date-selector-up-shadow {
		top: 0;
	}

	.date-selector-content .date-selector-down-shadow {
		bottom: 0;
		z-index: 50;
		background-image: linear-gradient(to top, #FFF, rgba(255, 255, 255, 0));
	}

	.date-selector-content .date-selector-line {
		width: 95%;
		height: 40px;
		position: absolute;
		top: 80px;
		left: 50%;
		pointer-events: none;
		box-sizing: border-box;
		/*border-top: 1px solid #DCDCDC;
    border-bottom: 1px solid #DCDCDC;*/
		transform: translate3d(-50%, 0, 0);
		-webkit-transform: translate3d(-50%, 0, 0);
	}

	.date-selector-content .date-selector-line:after,
	.date-selector-content .date-selector-line:before {
		content: '';
		position: absolute;
		display: block;
		width: 100%;
		height: 1px;
		background: -webkit-linear-gradient(#dbdbdb, #161616, #dbdbdb);
		/* Safari 5.1 - 6.0 */
		background: -o-linear-gradient(#dbdbdb, #161616, #dbdbdb);
		/* Opera 11.1 - 12.0 */
		background: -moz-linear-gradient(#dbdbdb, #161616, #dbdbdb);
		/* Firefox 3.6 - 15 */
		background: linear-gradient(to right, #dbdbdb, #161616, #dbdbdb);
		/* 标准的语法（必须放在最后） */
	}

	.date-selector-content .date-selector-line:before {
		bottom: 0;
	}
</style>