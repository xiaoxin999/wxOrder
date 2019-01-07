<template>
	<div class="selectbtns">
    	<span v-for="(item,i) in list" :key="i"  v-bind:class="{sign:isSelected(i) }" v-on:click="clickHandle(i)">{{getValue(item)}}</span>
    </div>
</template>
<script type="text/javascript">
/**
 * 单选按钮组组件
 * list {Array} 需要展示的按钮列表数据
 * index {Array} 被选中的索引
 * name {String} 如果list数据是Object集合，则name则是Object的键名，该键值就是按钮的名称；如果list就是按钮名称集合，则name不要设置。
 */
	export default{
		props: {
            'list': Array,
            'index': Number,
            'name': String
        },
        watch:{
			onSelects:function(){
				this.$emit('selOn',this.onIndex);
			}
		},
        data(){
        	return{
        		onIndex:0
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
            clickHandle: function(i) {
                this.onIndex = i;
            },
            isSelected: function(i) {
                if(i == this.onIndex) return true;
                return false;
            }
        },
        mounted:function(){
        	this.onIndex = this.index;
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