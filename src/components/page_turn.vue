// 翻页组件
<template>
<ul class="tab-list">
    <li v-if="total > showpages">
        <a href="javascript:void(0)" @click="firstPage">
        	<span>&laquo;</span>
        </a>
    </li>
    <li v-if="total > showpages">
        <a href="javascript:void(0)" @click="prePage(false)">
        	<span>‹</span>
        </a>
    </li>
    <li v-for="i in showpages" v-if="i+offset-1 < total" :class="currentPage == i+offset ?  'active' : ''" :key="i">
    	<a  href="javascript:void(0)" @click="handlePage(i,offset)">{{i+offset}}</a>
    </li>
    <li v-if="total > showpages">
	    <a href="javascript:void(0)"  @click="nextPage(false)">
	    	<span>›</span>
	    </a>
    </li>
    <li v-if="total > showpages">
	    <a href="javascript:void(0)" @click="endPage" style="border-right:none">
	    	<span>&raquo;</span>
	    </a>
    </li>
</ul>
</template>
<script type="text/javascript">
	export default{
		props: [
            'page', // 当前第几页
            'total', // 总页数
            "len"
        ],
        data: function() {
            return {
                showpages: 10, // 默认显示10页
                offset: 0, // 当前页面偏移量
                currentPage: 1
            };
        },
        watch:{
        	"currentPage":function(){
        		this.$emit('pageNum',this.currentPage);
        	}
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
            handlePage: function(i, offset) {
            	console.log(i);
                var cpage = i + offset;
                var offset = cpage - this.currentPage;
                if(cpage <= this.offset) {
                    this.prePage(true);
                } else if(cpage >= this.offset + this.showpages - 1) {
                    this.nextPage(true);
                }
                this.currentPage = cpage;
            }
        },
        mounted: function() {
            if(this.len) {
                this.showpages = this.len;
            }
            this.currentPage = this.page+1
        }
	}
</script>
<style lang="less">
/*tab-list sd-page css*/
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
</style>	