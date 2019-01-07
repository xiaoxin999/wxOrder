<template>
	<div class="selectbtns">
		<span v-for="(item,i) in list" :key="i" v-bind:class="{sign:isSelected(i,item) }" v-on:click="clickHandle(i,item)" :title="item.name">{{getValue(item)}}</span>
	</div>
</template>
<script type="text/javascript">
import $ from "src/verdor/dom";
	/**
	 * 多选按钮组组件
	 * list {Array} 需要展示的按钮列表数据
	 * selects {Array} 被选中的列表
	 * name {String} 如果list数据是Object集合，则name则是Object的键名，该键值就是按钮的名称；如果list就是按钮名称集合，则name不要设置。
	 * keys {String} 如果list数据是Object集合，则key则是Object的键名，该键值就是需要记录的选中列表selects中的元素值；如果list就是按钮名称集合，则key不要设置，selects中的元素会是选中的索引值。
	 * isradio {Boolean} 如果是单选，则设置为true,如果是多选则设置false或不设置
	 */

	export default {
		props: ['list', 'selects', 'name', 'keys', 'isradio'],
		data() {
			return{
				onSelects:[]
			}
		},
		watch:{
			onSelects:function(){
				this.$emit('selOn',this.onSelects);
			}
		},
		methods: {
			getValue: function(item) {
				if(this.name) {
					return item[this.name];
				} else {
					return item;
				}
			},
			clickHandle: function(i, item) {
				if(this.onSelects) {
					var id = i;
					if(this.keys) {
						id = item[this.keys];
					}
					var find = false;
					for(var i = 0; i < this.onSelects.length; i++) {
						if(this.onSelects[i] + '' == id + '') {
							find = true;
							break;
						}
					}
					if(find) {
						this.onSelects.splice(this.onSelects.indexOf(id),1);
					} else {

						if(this.isradio) {
							this.onSelects.splice(0, 1, id)
						} else {
							this.onSelects.push(id);
						}
					}
				}
			},
			isSelected: function(i, item) {
				if(this.onSelects) {
					var id = i;
					if(this.keys) {
						id = item[this.keys];
					}
					for(var i = 0; i < this.onSelects.length; i++) {
						if(this.onSelects[i] + '' == id + '') {
							return true;
						}
					}
				}
				return false;
			}
		},
		mounted:function(){
			this.onSelects = this.selects;
		}
	}
</script>
<style lang="less">
	.selectbtns {
		width: 100%;
		height: auto;
		overflow: hidden;
	}
	
	.selectbtns span {
		display: inline-block;
		height: 40px;
		line-height: 40px;
		padding-left: 18px;
		padding-right: 18px;
		background-color: #F1F1F1;
		text-align: center;
		cursor: pointer;
		margin: 1px;
	}
	
	.selectbtns span:hover {
		background-color: #eeeeee;
	}
	.sign {
  		background: url("../res/images/sign.png") right bottom no-repeat; 
  	}
</style>