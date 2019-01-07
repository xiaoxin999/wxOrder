<template>
	<ul class="tab-list page">
		<li v-if="total > showpages">
			<a href="javascript:void(0)" @click="firstPage" style="font-size: 32px;line-height: 16px;">
				&laquo;
			</a>
		</li>
		<li v-if="total > showpages">
			<a href="javascript:void(0)" @click="prePage(false)" style="font-size: 20px;line-height: 22px;">
				&lt;
			</a>
		</li>
		<li v-for="i in showpages" :key="i" v-if="i+offset-1 < total" :class="currentPage == i+offset ? 'active' : ''">
			<a href="javascript:void(0)" @click="handlePage(i,offset)">{{i+offset}}</a>
		</li>
		<li v-if="total > showpages">
			<a href="javascript:void(0)" @click="nextPage(false)" style="font-size: 20px;line-height: 22px;">
				&gt;
			</a>
		</li>
		<li v-if="total > showpages">
			<a href="javascript:void(0)" @click="endPage" style="border-right:none;font-size: 32px;line-height: 16px;">
				&raquo;
			</a>
		</li>
		<span>共{{total}}页</span>
		<span style="margin-left: 10px;margin-right: 5px">到第<input @keyup.enter="jump(jumpnum,0)" v-model="jumpnum" type="text" style="width: 30px;height: 21px;margin: 0 3px;">去</span>
		<a href="javascript:void(0);" class="blue" style="width: 40px;height: 25px;line-height: 25px;" @click="jump(jumpnum,0)">确定</a>
	</ul>
</template>
<script type="text/javascript">
import store from "src/manager/store";

	export default{
		props: [
            'page', // 当前第几页
            'count', // 记录的总数量 
            'total', // 总页数
            'num', // 每页数量 
            'len' // 展示几条
        ],
        watch:{
        	"currentPage":function(){
        		this.$emit('pageNum',this.currentPage);
        	}
        },
        data: function() {
            return {
                showpages: 10, // 默认显示10页
                offset: 0, // 当前页面偏移量
                jumpnum: '',//输入跳转
                currentPage:this.page
            };
        },
        methods: {
            firstPage: function() {
                this.offset = 0;
                this.currentPage = 1;
            },
            endPage: function() {
                this.offset = this.total - this.showpages;
                if(this.offset < 0) {
                    this.offset = 0;
                }
                this.currentPage = this.total;
            },
            prePage: function(b) {
                var offset = this.offset;
                var newoffset = this.offset;
                newoffset -= Math.ceil(this.showpages / 2);
                if(newoffset < 0) {
                    newoffset = 0;
                }
                this.offset = newoffset;
                if(!b) this.currentPage += newoffset - offset;
            },
            nextPage: function(b) {
                var offset = this.offset;
                var newoffset = this.offset;
                newoffset += Math.ceil(this.showpages / 2);
                if(newoffset > this.total - this.showpages) {
                    newoffset = this.total - this.showpages;
                    if(newoffset < 0) newoffset = 0;
                }
                this.offset = newoffset;
                if(!b) this.currentPage += newoffset - offset;
            },
            handlePage:function(i, offset) {
            	console.log(this.page)
                var cpage = i + offset;
                var offset = cpage - this.page;
                if(cpage <= this.offset + Math.ceil(this.showpages / 2)-1) {
                    this.prePage(true);
                } else if(cpage >= this.offset + this.showpages - 1) {
                    this.nextPage(true);
                }
                this.currentPage = cpage;
            },
            jump: function(i,offset){
            	var g = /^[1-9]*[0-9]*$/;
            	if(!g.test(i)){
                    store.commit("setWin",{title:"提示信息",content:"跳转页请输入正整数！"})
            		return false
            	}
            	var cpage = parseInt(i) + offset;
                var newoffset = this.offset;
                if(newoffset < -5){
                	return false;
                } 
                	
                newoffset = i - 5;
                if(newoffset>this.total-5) {
					return false;
                }
                this.offset = newoffset
                if(newoffset<0){
                	this.offset = 0
                }
                this.currentPage = cpage;
                if(i>this.total){
                	this.page = this.total
                }
            }
        },
        mounted: function() {
            if(this.len) {
                this.showpages = this.len;
            }
        }
	}
</script>
<style lang="less">
.tab-list {
    display: inline-block;
    vertical-align: middle;
    height: 45px;
    list-style: none;
    overflow: hidden;
    li {
        width: 45px;
        height: 45px;
        box-sizing: border-box;
        text-align: center;
        line-height: 45px;
        float: left;
        background: #F2F2F2;
        a {
            display: inline-block;
            width: 45px;
            height: 45px;
            box-sizing: border-box;
            text-align: center;
            line-height: 45px;
            text-decoration: none;
            color: #666;
        }
    }
    li.active {
        width: 45px;
        height: 45px;
        text-align: center;
        line-height: 45px;
        background: #29AAE3;
        box-sizing: border-box;
        color: #FFFFFF;
    }
    li:hover {
        width: 45px;
        height: 45px;
        text-align: center;
        line-height: 45px;
        background: #ccc;
        box-sizing: border-box;
        color: #FFFFFF;
    }
    li:hover a,
    li.active a {
        box-sizing: border-box;
        color: #FFFFFF;
    }
}
.page{
    height: 25px;
    li {
        width: 25px;
        height: 25px;
        line-height: 25px;
        border: 1px solid #ccc;
        background: #fff;
        margin: 0 2px;
        &.active{
            width: 25px;
            height: 25px;
            line-height: 25px;
        }
        a{
            width: 25px;
            height: 25px;
            line-height: 25px;
            color: #28a8e0;
        }
        &:hover{
            width: 25px;
            height: 25px;
            line-height: 25px;
            color: #fff;
        }   
    }
}
input{
    -webkit-appearance: none; 
    -moz-appearance: none;
    -o-appearance: none;
    appearance: none;
    border: 1px solid #ccc;
    padding: 0;
} 
</style>