<template>
	<div class="statisticsList" style="height: 45px;vertical-align: middle;display: inline-block;position: relative;">
		<section @click="showSort" class="tableListInp chairFix">
			<span :title="sortname" class="extent">{{sortname}}</span>
			<div class="fr">
				<i></i>
			</div>
		</section>
		<ul v-if="sortSel" class="tableListUl">
			<li @click="sortselShow(index)" v-for="(item,index) in sort" :key="index" :title="sort[index]">{{item}}</li>
		</ul>
	</div>
</template>
<script type="text/javascript">
	export default {
		props: ['sorts', 'name'],
		mounted: function() {
			if(this.sorts) {
				this.sort = this.sorts
			}
			this.sortname = this.name
		},
		data: function() {
			return {
				sort: [], //分类选择
				sortname: '', //分类选中
				sortSel: false, //分类下拉框显示
				select:0
			}
		},
		methods: {
			//分类选择模拟框
			showSort: function() {
				this.sortSel = !this.sortSel;
			},
			sortselShow: function(index) {
				this.sortSel = false;
				this.sortname = this.sort[index];
				this.select = index;
				this.$emit('callOut',this.select);
			},
		}
	}
</script>
<style lang="less">
	/***********模拟下拉框**********/
	
	.tableListInp {
		color: #666666;
		border: #b3b3b3 solid 1px;
		height: 40px;
		cursor: pointer;
		display: inline-block;
		background-color: #ffffff;
		div {
			width: 41px;
			height: 40px;
			position: relative;
			z-index: 5;
			i {
				height: 10px;
				width: 10px;
				position: absolute;
				top: 50%;
				left: 50%;
				margin-top: -5px;
				margin-left: -5px;
				border-top: 10px solid #b3b3b3;
				border-left: 5px solid transparent;
				border-right: 5px solid transparent;
				box-sizing: border-box;
			}
		}
	}
	
	.statisticsList {
		line-height: 35px;
		font-size: 16px;
		text-align: left;
		ul {
			width: 100%;
			margin: 0;
			position: absolute;
			top: 40px;
			left: 0px;
			z-index: 10;
			background: #fff;
			li {
				width: 100%;
				text-align: center;
				height: 41px;
				border: 1px #b3b3b3 solid;
				border-top: 0;
				background: #fff;
				cursor: pointer;
				list-style: none;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				&:hover {
					background: #f1f1f1;
				}
			}
		}
		.extent {
			width: 150px;
			height: 39px;
			display: block;
			float: left;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			text-align: center;
			border-right: 1px #B3B3B3 solid;
		}
	}
</style>