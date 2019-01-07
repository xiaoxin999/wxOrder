<template>
    <div class="container">
        <div class="loadding-box">
            <div class="orderSuccess"></div>
        </div>
        <div class="order-success">
            <h2>订单取消成功</h2>
            <p>订单已取消成功，请点击返回订单详情查看详细信息。</p>
        </div>
        <div class="order-mask">
            <a href="javascript:void(0)" class="detail" @click="openTakeDetail">返回订单详情</a>
            <a href="javascript:void(0)" class="close" @click="closePage">关闭</a>
        </div>    
    </div>
</template>
<script>
import utils from "src/verdor/utils";

export default {
    data () {
        return {
            oid : this.$route.query.oid,
            shopId : this.$route.query.shopId
        };
    },
    methods:{
        openTakeDetail(){
            // 打开订单详情
            this.$router.push({path:"/takeoutDetails",query:{'oid':this.oid,'shopId':this.shopId}});
        },
        closePage(){
            // 关闭页面
            this.$closeWindow();
        }
    },
    components: {},
    computed:{},
    mounted(){
        utils.setTitle('取消订单');
    },
}
</script>
<style lang='less' scoped>
@import "../../../res/css/base.less";
.container{
    min-height: 100%;
    width: 100%;
    background-color: #ffffff;
    overflow: hidden;
}
.loadding-box {
	width: 100%;
	height: 4.6667rem;
	position: relative;
	overflow: hidden
}
.orderSuccess {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjM5RDAxQkNEQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjM5RDAxQkREQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBN0JBMjlDM0RCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBN0JBMjlDNERCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Prr16DcAAA0qSURBVHja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");
	background-position: bottom center;
	background-size: 2.6667rem 2.6667rem;
	width: 2.6667rem;
	height: 2.6667rem;
	position: absolute;
	top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.order-success {
	width: 100%;
	height: auto;
	background-color: #fff;
	text-align: center;
	margin-bottom: 1.5rem;
	overflow: hidden
}
.order-success h2 {
	color: #000000;
	font-size: 0.53333rem;
	width: 100%;
	height: 1.2rem;
	line-height: 1.2rem;
}
.order-success p {
	color: #888888;
    font-size: .3733rem;
    padding: 0 1.0667rem;
}
.order-mask a {
	display: block;
	width: calc(100% - 30%);
	height: 1.17333rem;
	line-height: 1.17333rem;
	margin: 0 15% 0.4rem;
	border-radius: 0.10667rem;
	font-size: 0.45333rem
}

.order-mask a.close {
	color: #333333;
	border: 1px solid #dfdfdf;
	background-color: #f8f8f8
}

.order-mask a.detail {
	color: #FFFFFF;
	background-color: #f5a623
}
</style>