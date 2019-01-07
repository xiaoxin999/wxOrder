let _debounce = function(func, wait, immediate) {
	let timeout;
	return function() {
		let context = this;
		let args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
};

let isToBottom = false;

export default {
	props: {
		size: {
			type: Number,
			required: true
		},
		remain: {
			type: Number,
			required: true
		},
		rtag: {
			type: String,
			default: 'div'
		},
		wtag: {
			type: String,
			default: 'div'
		},
		wclass: {
			type: String,
			default: ''
		},
		start: {
			type: Number,
			default: 0
		},
		offset: {
			type: Number,
			default: 0
		},
		variable: [Function, Boolean],
		bench: Number,
		debounce: Number,
		totop: Function,
		tobottom: Function,
		onscroll: Function,
		isScroll: {
			type: Boolean,
			default: true
		}, //是否可以滚动
		height: {
			type: String,
			default: '100%'
		},
		reduceNum: {
			type: Number,
			default: 0
		} //需要减去的虚拟dom节点数
	},

	created: function() {
		let start = this.start >= this.remain ? this.start : 0;
		let keeps = this.remain + (this.bench || this.remain);

		this.delta = {
			start: start, //起始渲染的索引
			end: start + keeps - 1, //结束渲染的索引
			keeps: keeps, // 渲染多少个真实dom
			total: 0, // 一共多少个item
			offsetAll: 0, // 总共的偏移量
			paddingTop: 0, // 上边距
			paddingBottom: 0, // 下边距
			varCache: {}, // 缓存每个item的height和偏移量
			varAverSize: 0, //保留偏移量的值
			varLastCalcIndex: 0 // 保存上一次的偏移量
		};

	},

	watch: {
		size: function() {
			this.alter = 'size';
		},
		remain: function() {
			this.alter = 'remain';
		},
		bench: function() {
			this.alter = 'bench';
		},
		start: function() {
			this.alter = 'start';
		},
		offset: function() {
			this.alter = 'offset';
		}
	},

	methods: {
		onScroll: function(e) {
			let delta = this.delta;
			let offset = (this.$refs.vsl && this.$refs.vsl.scrollTop) || 0;

			if (delta.total > delta.keeps) {
				this.updateZone(offset);
			} else {
				delta.end = delta.total - 1;
			}

			let offsetAll = delta.offsetAll;
			if (this.onscroll) {
				this.onscroll(e, {
					offset: offset,
					offsetAll: offsetAll,
					start: delta.start,
					end: delta.end
				});
			}

			if (!offset && delta.total) {
				this.triggerEvent('totop');
			}
			console.log( parseInt(offset) + this.size ,  parseInt(offsetAll));
			if (parseInt(offset) + this.size >= parseInt(offsetAll) && !isToBottom) {
				this.triggerEvent('tobottom');
				isToBottom = true;
			}else{
				isToBottom = false;
			}
		},

		updateZone: function(offset) {
			let overs = this.variable ?
				this.getVarOvers(offset) :
				Math.floor(offset / this.size);
			let delta = this.delta;
			let zone = this.getZone(overs);
			let bench = this.bench || this.remain;

			if (!zone.isLast && (overs > delta.start) && (overs - delta.start <= bench)) {
				return;
			}

			delta.end = zone.end;
			delta.start = zone.start;
			this.$forceUpdate();
		},

		getVarOvers: function(offset) {
			let low = 0;
			let middle = 0;
			let middleOffset = 0;
			let delta = this.delta;
			let high = delta.total;
			while (low <= high) {
				middle = low + Math.floor((high - low) / 2);
				middleOffset = this.getVarOffset(middle);

				if (!delta.varAverSize) {
					delta.varAverSize = Math.floor(middleOffset / middle);
				}

				if (middleOffset === offset) {
					return middle;
				} else if (middleOffset < offset) {
					low = middle + 1;
				} else if (middleOffset > offset) {
					high = middle - 1;
				}

			}

			return low > 0 ? --low : 0;
		},

		getVarOffset: function(index, nocache) {
			let delta = this.delta;
			let cache = delta.varCache[index];

			if (!nocache && cache) {
				return cache.offset;
			}

			let offset = 0;
			for (let i = 0; i < index; i++) {
				let size = this.getVarSize(i, nocache);
				delta.varCache[i] = {
					size: size,
					offset: offset
				};
				offset += size;
			}

			delta.varLastCalcIndex = Math.max(delta.varLastCalcIndex, index - 1);
			delta.varLastCalcIndex = Math.min(delta.varLastCalcIndex, delta.total - 1);

			return offset;
		},


		getVarSize: function(index, nocache) {
			let cache = this.delta.varCache[index];

			if (!nocache && cache) {
				return cache.size;
			}

			if (typeof this.variable === 'function') {
				return this.variable(index) || 0;
			} else {
				let slot = this.$slots.default[index];
				let style = slot && slot.data && slot.data.style;
				if (style && style.height) {
					let shm = style.height.match(/^(.*)px$/);
					return (shm && +shm[1]) || 0;
				}
			}
			return 0;
		},

		getVarPaddingTop: function() {
			return this.getVarOffset(this.delta.start);
		},


		getVarPaddingBottom: function() {
			let delta = this.delta;
			let last = delta.total - 1;
			if (delta.total - delta.end <= delta.keeps || delta.varLastCalcIndex === last) {
				return this.getVarOffset(last) - this.getVarOffset(delta.end);
			} else {

				return (delta.total - delta.end) * (delta.varAverSize || this.size);
			}
		},

		getVarAllHeight: function() {
			let delta = this.delta;
			if (delta.total - delta.end <= delta.keeps || delta.varLastCalcIndex === delta.total - 1) {
				return this.getVarOffset(delta.total);
			} else {
				return this.getVarOffset(delta.start) + (delta.total - delta.end) * (delta.varAverSize || this.size);
			}
		},


		updateVariable: function(index) {
			this.getVarOffset(index, true);
		},

		getZone: function(index) {
			let start, end;
			let delta = this.delta;

			index = parseInt(index, 10);
			index = Math.max(0, index);

			let lastStart = delta.total - delta.keeps;
			let isLast = (index <= delta.total && index >= lastStart) || (index > delta.total);
			if (isLast) {
				end = delta.total - 1;
				start = Math.max(0, lastStart);
			} else {
				start = index;
				end = start + delta.keeps;
			}
			return {
				end: end,
				start: start,
				isLast: isLast
			};
		},

		triggerEvent: function(event) {
			if (this[event]) {
				this[event]();
			}
		},

		setScrollTop: function(scrollTop) {
			let vsl = this.$refs.vsl;
			if (vsl) {
				vsl.scrollTop = scrollTop;
			}
		},

		filter: function() {
			let delta = this.delta;
			let slots = this.$slots.default;
			if (!slots) {
				slots = [];
				delta.start = 0;
			}
			delta.total = slots.length - this.reduceNum;

			let paddingTop, paddingBottom, allHeight;
			let hasPadding = delta.total > delta.keeps;

			if (this.variable) {
				allHeight = this.getVarAllHeight();
				paddingTop = hasPadding ? this.getVarPaddingTop() : 0;
				paddingBottom = hasPadding ? this.getVarPaddingBottom() : 0;
			} else {
				allHeight = this.size * delta.total;
				paddingTop = this.size * (hasPadding ? delta.start : 0);
				paddingBottom = this.size * (hasPadding ? delta.total - delta.keeps : 0) - paddingTop;
			}

			delta.paddingTop = paddingTop;
			delta.paddingBottom = paddingBottom < this.size ? 0 : paddingBottom;
			delta.offsetAll = allHeight - this.size * this.remain;

			let targets = [];
			for (let i = delta.start; i <= delta.end; i++) {
				targets.push(slots[i]);
			}
			// console.log(slots,targets, delta.start, delta.end);
			return targets;
		}
	},

	mounted: function() {
		if (this.start) {
			let start = this.getZone(this.start).start;
			this.setScrollTop(this.variable ? this.getVarOffset(start) : start * this.size);
		} else if (this.offset) {
			this.setScrollTop(this.offset);
		}
	},


	beforeUpdate: function() {
		let delta = this.delta;
		delta.keeps = this.remain + (this.bench || this.remain);
		let calcstart = this.alter === 'start' ? this.start : delta.start;
		let zone = this.getZone(calcstart);

		if (~['start', 'size', 'offset'].indexOf(this.alter)) {
			this.$nextTick(this.setScrollTop.bind(this, this.alter === 'offset' ?
				this.offset : this.variable ?this.getVarOffset(zone.isLast ? delta.total : zone.start) :zone.isLast && (delta.total - calcstart <= this.remain) ?delta.total * this.size : calcstart * this.size));
		}

		if (calcstart !== zone.start || delta.end !== zone.end || this.alter) {
			this.alter = '';
			delta.end = zone.end;
			delta.start = zone.start;
			this.$forceUpdate();
		}
	},

	render: function(h) {
		let list = this.filter();
		let delta = this.delta;
		let dbc = this.debounce;
		return h(this.rtag, {
			'ref': 'vsl',
			'style': {
				'display': 'block',
				'overflow-y': this.isScroll ? 'auto' : 'hidden',
				// 'height': this.size * this.remain + 'px'
				'height': this.height
			},
			'on': {
				'&scroll': dbc ? _debounce(this.onScroll.bind(this), dbc) : this.onScroll
			}
		}, [
			h(this.wtag, {
				'style': {
					'display': 'block',
					'padding-top': delta.paddingTop + 'px',
					'padding-bottom': delta.paddingBottom + 'px'
				},
				'class': this.wclass
			}, list)
		]);
	}
};