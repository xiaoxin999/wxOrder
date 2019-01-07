<template>
	<div>
		<win :height="'100%'" :align="'right'" @winEvent="go">
			<div class="content" slot='content'>
				<div class="top">
					<h2>通用标签</h2>
					<div class="cont">
						<span v-for="(item,index) in normalList" @click="clickTag('nor',item.id,index,item.type)" v-bind:key="index" :style="{'backgroundColor': selectTag['nor'][item.id] ?  colorArr[index%4] : '#CDCDCD' }">
							{{item.name}}
						</span>
					</div>
				</div>
				<div class="bottom">
					<h2>自定义标签</h2>
					<div class="funBtn" @click="addFun">
						<span data-type="edit">编辑</span>
						<span data-type="add">新增</span>
					</div>
					<div class="line"></div>
					<div class="cont">
						<span v-for="(item,index) in dryList" :class="{edit:status=='edit'}" @click="clickTag('nor',item.id,index,item.type)" v-bind:key="index" :style="{'backgroundColor': selectTag['nor'][item.id] ?  colorArr[index%4] : status == 'edit' ? 'white' : '#CDCDCD' }">
							{{item.name}}
							<i :class="{icon:status=='edit' ? true : false}"></i>
						</span>
					</div>
				</div>
				
			</div>
		</win>
		<win v-if="show" @winEvent="close" :cancel="cancel">
			<div class="fun" slot="content">
				<div class="title">请输入标签名称</div>
				<input type="text" placeholder="请输入标签名称" v-model="text" maxlength="20">
				<div class="num">{{text.length}}/20</div>
			</div>	
		</win>
	</div>
</template>

<script>
import http from "src/manager/http";
import storage from "src/verdor/storage";
	export default {
		props: {
			list: Array
		},
		data(){
			return {
				colorArr:["#FF6F49","#FCA73E","#0AC687","#349AEB"],
				selectTag:{
					"nor":{

					},
					"dry":{
						
					}
				},
				show:false,
				text:"",
				dryList:[],
				normalList:[],
				status:"add",
				cache:new Map(),
				index:null,
				cancel:{content:"取消"},
				lastTxt:""
			}
		},
		methods:{
			go(str){
				this.$emit("winEvent",{data:this.cache,type:str});
			},
			clickTag(type,id,index,ty){
				
				if(this.status =='add'){
					let key = `${ty}_${id}`;
					if(this.cache.has(key)){
						this.cache.delete(key);
					}else{
						this.cache.set(key,{id,tagType:ty,index});
					}
				}
								
				if(this.status == 'add'){
					let status = this.selectTag[type][id];
					if(status){
						this.selectTag[type][id] = false;
					}else{
						this.$set(this.selectTag[type],id,true);
					}
				}else{
					this.text = this.dryList[index].name;
					this.lastTxt = this.text;
					this.show = true;
				}
				this.index = index;
				
				
			},
			addFun(e){
				let type = e.target.getAttribute("data-type");
				if(type == "edit"){
					this.status = this.status == 'edit' ? 'add' : 'edit';
					this.cancel.content = "删除";
					for(let str in this.selectTag){
						let obj = this.selectTag[str];
						for(let tmp in obj){
							obj[tmp] = false;
						}
					}
				}else{
					this.cancel.content = "取消";
					this.status = 'add';
					this.show = true;
				}
			},
			async close(str){
				
				let obj = {
					name:this.text,
					staffFansId:storage.session('login').fansId,
					shopId:this.shopId
				};

				let allIndex = this.index + this.normalList.length;

				if(str == "ok"){
					
					if(!this.text){
						this.$store.commit("setWin",{content:"标签不能为空"});
						return;
					}
					
					if(this.lastTxt != this.text){
						if(this.status == 'edit'){
							let id = this.dryList[this.index].id;
							this.dryList[this.index] = {name:this.text,id};
							this.$parent.tagList.splice(allIndex,1,{name:this.text,id,type:2});
							Object.assign(obj,{id});
						}

						let data = await http.diyTag({
							data:obj
						})
						if(this.status != 'edit') {
							this.dryList.push({name:this.text,id:data});
							this.$parent.tagList.push({name:this.text,id:data,type:2});
						}
					}
					
				}else if(str == "cancel"&&this.status=="edit"){
					let id = this.dryList[this.index].id;
					let data = await http.diyTag({
						data:Object.assign(obj,{id,del:1})
					})

					this.dryList.splice(this.index,1);
					this.$parent.tagList.splice(allIndex,1);
				}
				this.show = false;
				this.text = "";
			}
		},
		mounted() {
			for(let item of this.list){
				if(item.type == 0){
					this.normalList.push(item);
				}else if(item.type == 2){
					this.dryList.push(item);
				}
			}
		},
		components: {
			win: () => import( /* webpackChunkName:"win" */ "src/components/phone/win")
		}
	}
</script>

<style scoped lang='less'>
	.content {
		padding: 0.5333rem 0 0.4rem 0.4rem;
		height: 100%;
		overflow: auto;
		.top{
			min-height: 50%;
		}

		.top,
		.bottom {

			h2 {
				height: 1.25rem;
				border-bottom: 1px solid #d2d3d5;
			}

			.cont {
				margin: 0.3rem;
				&>span{
					display: inline-block;
					border-radius: 1.3333rem;
					line-height: .8667rem;
					padding: 0 .4rem;  
					color: #ffffff;
					font-size: .3467rem;
					background-color: #CDCDCD;
					margin: 0 .4rem .4rem 0;
					position:relative;
					.icon{
						display:inline-block;
						background:url(../../../res/images/filter_edit.png) center no-repeat;
						background-size: 100% 100%;
						width:0.48rem;
						height:0.48rem;
						position:absolute;
						right:-0.12rem;
						top:-0.12rem;
					}
				}
				span.edit{
					box-shadow:0 0 10px #CDCDCD;
					color:#CDCDCD;
					background-color:white;
				}
				
			}
		}

		.bottom {
			h2{
				width: 50%;
				display: inline-block;
				border-bottom: none;
			}
			.funBtn{
				display: inline-block;
				color:#CDCDCD;
				font-size:14px;
				span{
					border-radius:0.5rem;
					border:1px solid #CDCDCD;
					padding: 0.1rem 0.35rem;
				}
				span:nth-child(2){
					margin-left:0.2rem;
				}
			}
			.line{
				height: 1px;
				border-bottom: 1px solid #d2d3d5;
			}
		}

		
	}
	.fun{
		
		.title{
			font-weight: bold;
			font-size: 16px;
			text-align: center;
			margin-top: 0.3rem;
		}
		input{
			text-indent: 0.2rem;
			font-size: 14px;
			height: 1rem;
			width: 80%;
			margin: 0.3rem 0.8rem 0 0.8rem;
			line-height: 1rem;
		}
		.num{
			margin-top: 0.1rem;
			padding-right: 0.65rem;
			text-align:right;
			color: #CDCDCD;
			font-size: 14px;
		}
	}
</style>