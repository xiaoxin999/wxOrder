<template>
	<div class='root' :style="{height:height + '','overflow-y': 'auto'}">
		<list :size="size" :remain="remain" :isScroll="isScroll" :height="H + 'px'" :tobottom="tobottom">
			<div v-for="(item,index) in list" :key="index">
				<slot v-bind:data="item"></slot>
			</div>
		</list>
		<div class="load" v-if="showTips">{{ !isAll?"下拉加载更多":"没有更多了"}}</div>
	</div>
</template>


<script>
	import list from 'src/components/scroll_list';
	import http from 'src/manager/http';

	export default {
		props: {
			size: {
				type: Number,
				required: true
			},
			isScroll: {
				type: Boolean,
				default: true
			}, //是否可以滚动
			height: {
				type: Number,
				required: true
			}, //渲染层的高度
			httpId: String,
			httpData: Object,
			keyStr: {
				type: String,
				default: 'list'
			}, // 接口中返回的字段名字
			listData: {
				handler: function() {
					return [];
				},
				type: Array
			},
			callFn: Function, //接口请求的数据需要回调函数处理的
			callContext: Object, //回调函数执行上下文
			allData: false, //是否需要全量数据
			needError: false //是否需要自己处理错误
		},
		computed: {
			H() {
				let h = this.height - (0.5 * this.fs);
				this.remain = h / this.size;
				return h;
			}
		},
		watch: {
			httpData: {
				deep: true,
				handler() {
					this.isAll = false;
					this.list = [];
					if (this.httpData.page == 1) {
						this.currentPage = 1;
						this.totalPage = 1;
					}
					this.tobottom();
				}
			}
		},
		data() {
			return {
				list: [],
				isAll: false, //当时分页加载时  是否加载完毕
				callData: {
					page: 1
				},
				showTips: false,
				fs: parseFloat(document.documentElement.style.fontSize),
				remain: 0, //渲染列表同时出现的item数量
				totalPage: 1,
				currentPage: 1,
				isLoading: false
			};
		},
		components: {
			list
		},
		methods: {
			//触底时的回调 
			async tobottom() {
				if (this.httpId && !this.isAll && this.currentPage <= this.totalPage && !this.isLoading) {
					if (this.list.length) this.showTips = true;
					else this.showTips = false;
					let obj = {};
					Object.assign(obj, this.httpData);
					obj.page = this.currentPage;
					let data = null;

					try {
						this.isLoading = true;
						data = await http[this.httpId]({
							data: obj
						}, this.needError, this.allData);
						this.currentPage++;
						this.isLoading = false;
					} catch (e) {
						if (this.needError && this.callFn) {
							this.callFn(e);
						}
					}

					if (this.callFn) {
						let res = this.callFn.call(this.callContext, data, this.list);
						if (Array.isArray(res)) {
							this.list = this.list.concat(res);
						} else {
							this.list = res.list;
						}

					} else {
						this.list = this.list.concat(data[this.keyStr]);
					}
					
					this.showTips = false;
					if (this.allData) data = data.data;
					this.totalPage = data.total;
					if (data.total > data.page) {
						this.isAll = false;
					} else {
						this.isAll = true;
					}

					this.$emit('giveData', {
						num: this.list.length
					});
				}
			}
		},
		mounted() {
			console.log(this.httpId)
			if (!this.httpId) {
				this.list = this.list.concat(this.listData);
			} else {
				this.tobottom();
			}


		}
	};
</script>

<style scoped>
	.root {
		width: 100%;
	}

	.load {
		position: absolute;
		bottom: 0;
		height: 0.8rem;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.15);
		font-size: 0.4rem;
		text-align: center;
		line-height: 0.8rem;
	}
</style>