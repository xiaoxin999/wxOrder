<template>
    <div id="success" style="height: 100%;" class="order-mask">
        <template v-if="isLoading== false">
            <div class="loadding-box">
                <div class="order-loadding"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>正在提交...</h2>
                <section>
                    <p>您的订单正在提交...</p>
                    <p>客官莫急，让订单飞一会～</p>        	
                </section>
            </div>
        </template>
        <template v-if="isLoading && orderStatus == '4'">
            <div class="loadding-box">
                <div class="order-error"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>下单失败</h2>
                <section>
                    <p>您已经存在订单</p>
                    <p>请不要重复下单</p>        	
                </section>
            </div>
            <a href="javascript:void(0)" class="close" @click="closeShop">关闭</a>
        </template>
        <template v-if="isLoading && orderStatus == '3'">
            <div class="loadding-box">
                <div class="order-error"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>下单失败</h2>
                <section>
                    <p>请联系服务员</p>
                    <p>不要重复下单</p>        	
                </section>
            </div>
            <a href="javascript:void(0)" class="close" @click="closeShop">关闭</a>
        </template>
        <template v-if="isLoading && orderStatus == '5'">
            <div class="loadding-box">
                <div class="order-warn"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>加载失败</h2>
                <section>
                    <p>提交已超时!</p>
                    <p>请刷新页面，避免重复下单!</p>        	
                </section>
            </div>
            <a href="javascript:void(0)" class="detail" @click="orderOperate">刷新</a>
        </template>
        <template v-if="isLoading && orderStatus == '2'">
            <div class="loadding-box">
                <div class="order-error"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>下单失败</h2>
                <section>
                    <p>提示信息!</p>
                    <p>{{errorMsg}}</p>        	
                </section>
            </div>
            <a href="javascript:void(0)" class="detail" @click="orderOperate('1')" style="background-color: #ff5d42;">重新下单</a>
            <a href="javascript:void(0)" class="close" @click="closeShop">关闭</a>
        </template>
        <template v-if="isLoading && orderStatus == '1'">
            <div class="loadding-box">
                <div class="orderSuccess"></div>
            </div>
            <div class="order-success" style="height: auto;">
                <h2>下单成功</h2>
                <section v-if="remind != ''">
                    <p style="font-size: 12px;margin-bottom: 30px;padding: 0 30px 0 30px;">{{remind}}</p>
                </section>
                <section v-else>
                    <p style="font-size: 12px;">您所点的菜已经提交成功！</p>
                    <p style="margin-bottom: 30px;font-size: 12px;">耐心等待服务员确认后，就会为您上菜！</p>        	
                </section>
            </div>
            <a href="javascript:void(0)" class="detail" @click="getOrderDetail">查看订单</a>
            <a href="javascript:void(0)" class="close" @click="closeShop">关闭</a>
        </template>
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	
	let isBack = false;
    export default {
        data(){
            return {
                remind: '', //下单成功提醒
                orderStatus : '', // 订单状态,1:成功，2:报错失败，3:桌台待确认，4:已存在订单不能提交，5:超时处理
                randKey : '',
				isLoading : false,
				errorMsg : ''
            }
        },
        methods: {
            getOrderDetail(){
                this.$router.push('/memberCenterOrderDetail');
            },
            closeShop() {
                //关闭微信游览器
                this.$store.commit('setWin',{
                    content: '确定关闭游览器?',
                    type: 'alert',
                    callBack:()=>{
                        this.$closeWindow();
                    }
                })
            },
            orderOperate(type){
                if(type == '1'){
                    storage.session('randKey',null);
                    storage.session('order-reflow',{
                        'data' : storage.session('goodsData')
					});
					
					let {onlineStyle} = storage.session('login');
					let toRouter = (onlineStyle == '1') ? '/order' : '/latestOrder';
					this.$router.push(toRouter);
                }else{
                    this.validationRandKey();
                }
            },
            async validationRandKey(){
                if(this.orderStatus == '5'){
                    let res = await http.validationRandKey({
                        data: {
                            randKey : this.randKey
                        }
                    })
                    console.log(res)
                }
            }
		},
		beforeRouteEnter: (to, from, next) => {
			if(from.path == '/memberCenterOrderDetail'){
				isBack = true;
			}
			next();
		},
        mounted(){
            if(storage.session('orderDetail')){
                this.remind = storage.session('orderDetail').remind;
            }else{
                this.remind = "";
			}
			if(isBack){
				this.isLoading = true;
			}
			else{
				setTimeout(()=>{
					this.isLoading = true;
				},1000);
			}
            
			this.orderStatus = storage.session('orderStatus').orderStatus;
			this.errorMsg = storage.session('orderStatus').errorMsg;
            this.randKey = storage.session('randKey');
            utils.setTitle(storage.session('wechatShop').shopName)
        }
    }
</script>

<style lang="less" scoped>
.order-mask {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #FFFFFF;
	z-index: 99
}

.order-success {
	width: 100%;
	height: auto;
	background-color: #fff;
	text-align: center;
	margin-bottom: 2.4rem;
	overflow: hidden
}

.order-success .order-img {
	width: 100%;
	height: 150px;
	background: url("../../../res/images/success.png") center center no-repeat;
	background-size: 100px 100px
}

.order-success h2 {
	color: #000000;
	font-size: 0.53333rem;
	width: 100%;
	height: 1.2rem;
	line-height: 1.2rem;
	margin-bottom: 0.13333rem
}

.order-success p {
	color: #888888;
	font-size: 0.4rem
}

.order-mask .loadding-box {
	width: 100%;
	height: 5.53333rem;
	position: relative;
	overflow: hidden
}

.order-mask .order-loadding {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACUCAYAAABBRcHIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjA1ODQ3NDVEQkQxMTFFNzhDRjBFQUEwNjhDOEMwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjA1ODQ3NDZEQkQxMTFFNzhDRjBFQUEwNjhDOEMwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MDU4NDc0M0RCRDExMUU3OENGMEVBQTA2OEM4QzA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MDU4NDc0NERCRDExMUU3OENGMEVBQTA2OEM4QzA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgjUXKgAACB0SURBVHja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");
	background-position: bottom center;
	background-size: 1.86667rem 1.97333rem;
	width: 1.86667rem;
	height: 1.97333rem;
	position: absolute;
	bottom: 10%;
	left: 40%;
	-webkit-transform: translate(-40%, 0);
	-ms-transform: translate(-40%, 0);
	transform: translate(-40%, 0);
	-webkit-animation-name: revolve;
	animation-name: revolve;
	-webkit-animation-duration: 0.8s;
	animation-duration: 0.8s;
	-webkit-animation-iteration-count: infinite;
	animation-iteration-count: infinite;
	overflow: hidden
}

.order-mask .orderSuccess {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjM5RDAxQkNEQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjM5RDAxQkREQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBN0JBMjlDM0RCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBN0JBMjlDNERCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Prr16DcAAA0qSURBVHja7J17bBTXFcbPDuYRwEBiB5ECfvCwCWA1FaBit1baEhBqQ1IJzEPQODxVQh4Y8aYKRQopVQMmBKKUNDySAAEH+kdoFSlNRaliEnCTFlJhbCC2oU0VsBueJQjYnrN71qy979l53Jk53+rT7qxnd+895+eZOzN37vWNOTQGrJAfHwnf9yexvt8f/3v90d+PuuyHXHyZj84j43u0nIXOpmf8LXqtoTPQmfy5K/h0C30HF5rxuRnfo+eL6EZ0Ay434PMXvBxR5ogy+VOrczKfiQyLP+bfzFAGeEeF6O+hR6CL2L10fE9m2OusBOt+jT7B/hu6Gl3rhWC7GaxB6PHosehi9P02lIHALWWHdAF9BP0B+n30aQFLbfnQo9Fl6AkMlooiwB9jA4N1EL0P/bE1OyoLkuGCNtZQfJrJQOWm2MaKv06Utk208ib8reTbWNQmq0LvQP/TyW0sp4LVjUGah+sVp9F4Vw2s8D/T7nIrgYafv+Y0sDSHbWH7oNeim9Dbue3kVhVzHZu4zn2cVHingJXL/710GL8SfZ+Hjmbv4zo3cAxyBaz01Rf9KroOPRfdGbyrzhyDOo5JPwErdXVHv4CuR89HdwJRSJ04JnUco+4CVnKnDKZz0Fah7xGOYuoejhHFagbHTsCKIjrv9CH6bfQDwk3Soli9xbEbLGDdFZ2kXYY+jv6hcKJbFLt/cCwzvA7WAPRf0Otkt2fY7nEdx3SAV8GidsFn6BLhwXCVcGx/5iWw6LD5dW4X9BAGTBPF9k2OdWe3g5WD/it6juTdMs3hmOe4FSzqeXAMPUpybblGcexHuw2sieg/o3tLjm1Tb87BJLeAtRCCfY3kqE+No8a96Aqng/U8uhKc14vCzaJcbODcOA4surzwa/QayaOyWsM5MuVSUIbPZ/z3+v1+KvASyZ3yWspgLeW8Kb3Fel6gcpSWmLFbNBqsCtn9OXa3uEhVsOiuk5ckR44V5e5x1cD6LnqPHP05WtTW2s25VAKs/uj30F0lN45XV85ljt1g0cXNA2DPXcYic0S53A9pXrjWfKDvwdqCHim5cJ1Gcm5t2WJRf6rZkgPXajbn2FKw8tIlWuQIUY7zrQKrAx89SCc994tyvItzbjpYi8Hdt7aL2opyvcRssOgWrdUSa8+Jcj7YLLDoUJDGDpB+Vd5TF869zwyw6I4Pue/Pu/oB+gmjwaLxAV6U2HpeayHJsSK0wMYtkYN31/aVuHpexMAyPyR+aEl+2WKJqSjsrEDCjUwyYK3kxptIFGrIrwoMNxnHicDKA7m5VBSp2cyG7i3WcpBBz0SRIiZW6AXrgVQOL0WeUznEGccsHlhPgZwMFcVWZ2YkJbCoJ+HPJXaiBCJGukX7Q6yR36ZAcAYskSIqvb8UpudNh+G9hgeWP//6c9jVsAsOf3XYzmIRI5MhOB59G3UYOHNgtA9sBouHvRFFF/XWfabwGVg+dDn07doXOmodA6bX4781HjSfBjUtNXYWkboyb0tmVzgMgtOviRSAatGQRVCeXx5znbmD5kJp71I7i0mjBw6PACtKX/ZySak6UE3LnZZw3Rl5M+wubnmiLZaP95kih0BFCrW7bNRkaNelpj1YdLNirqTWOVApImqPF8cDa4qk1nlQ0RGiAiqLB9ajkl7nbanotIMCmhALLDrvMEhS7Cyodp7dafe5rHB+BkYD68eSYvugmpo7NeXP7mnYA5tObVKpOj+JBtYjkmZnQbX+5PrYU/fao9Z5oDPCTjPI1CMWQ1UxpAKm5uiAqlFJqIAZIpb8oS1WIci1QYEqfRFDBeG7QrmEI1AZpe+HgzVCUi5QGaQR4WAVSdoFKoNUJGAJVKaBRUeFdJ2np6TfPKgWDlmoG6oNtRucBBUwSzkE1gBJv4lbqsIKmJIzxStQhTSAdoV5goBAZbDyCKx8wUCgMlgDQ20skZFtqsKFXoaK1I+2WFmCg/1QvdP4jlugImUTWDL4v0BlCliyxbITqibXQUXKojaWDKudJlTPFT4nULVVD9piydhXApXR6kJgyVRwNkBVWVvpVqhIHWhXmKliyYqziqGsXxk82OPBwPLJyyeh6nwVVF+sVgOqAoEqjrr7xh0e16aGUSsc9a3YgYk2aXWs9du8zy9n5c+CGbnR7+7d07QHtp7Z2vq5iO/1R/+9qMv++GWMNfm2UVD57xY2foz8sXMSMw/+xHFO6ndi5SzBqrQbvKoS6iXZJTGhIk3LmQYLBi8In9pOtlTq6SrtCm+rVKJJ/SYlvc6W+i2WJSoE1eScyQJVYt2mLdYNlUpUkFmQNIBWbbnSgWpv016vQUW6QWBdVqlEWgoHqQTX04OfNhWutKE65TmoSJcpi80qlaj2Sm3Ku06z4BKodKuZwLqgUokOnD+gq11mNFwCVVq6SENFjsMXD6lSoqbrTdClQxcY3jO1MZ+G9hgK3Tt2h2PNxwyB6tmCZwUq/aomsOh2nYdVKtWn//0UMjMyW0+OpgRXBsLVckx3Yluh6q8Pqo2nNnodKtJBAosGWvupaiU72nJUH1w9g3DR5wUq27SDwOqFL55UrWSUINry6IWLPpcKXAKVodpIYN3BFxWqltAKuAQqw7WawLrEYHVxM1yxEh+Cqqx/mS6oXj71skDVVsTTitAEAjRgltI3VZix5RKoTBHNZrA9BNYoNqgOFzXM6egv3QZ92lDVCVQx9AdyCKw+6MecUOqjzXi02DEzZbiG9RzWClcAqsEClUn6Lfqz0Ih+Hzml1JTQzfWbA68n9puY0mfDQdID1b6mfQJVYgVYoo5+wT0DwFfobBU6+sVdn7+btjp0GSdVuPQqBNUduBNR3oSdCv0J6u6ejn503ZluJ2wdKpJWq3bSv0Voy7X//H7LoJItVVJbq0CQwvuo/MlptaBEv1L/iqlwCVQp6cPQi3Cw/ujEmpgJl0Cl64gwAqwz6NMCF0N1TqBKUWfYEWCRDjq1VkbCRVBtqtskUKWm98IX2oO118k1C8BVlx5cApVuVcUD6xN0oxvgevf8uwKVdWpCH4kHFkV0n9Nr2QrXueThqjpXJVCl0XqAdme2ND+0faDedENNQ22uZOASqNLWzvZvRLvXiqbr/MhNcNFt+bG0u3G3QJWeqpmZNgpdhIYou8TH3VLzmpaawG1lWZ2y4N5O98It/y04fuk4VNZV6rorSNRGq9F/b/+mb+zhsdFW7sqN+OxWzKJsDWJuKSy4VhhzPZMHBYlWXg9fK7wIweHcryWzKyRdR78m/4yiBHotGlTxwCK9CoqN6yBSSt8wI5AqWF+65QhRZNqR4Jd6wCL9Cn1TYihqp5vMBugFqwH9hsRR1E7bmA3dYJHWSltLFCZi4YVAn+M4Tgasf6HXSzxFrPXMBMTfYtH5iEQGWJfMl4lcr38TCz5I/Eh2+DwaAHeVxNXzWglJDoacyuQBdOrhkMTWszoEKZx+SgUs2inOk4a8Zxvs8wCSv1Kf6nQn9eg1EmfPaQ3nHswCi/QbaNdbUORqHeGcg9lg0YQDNHXEZYm563WFc33bCrBIZ9ELJO6u1wLONVgFFultkMs9bhZdtnlL74cj+rwn+wgjukZy4DpRTp9K5wvSnQST+uTQcC8XJBeu0QXO6Td2gkWie8omQLDXqcjZus65bEr3i4yatvcTPnqQW12cK8rdE5xLUAUs0u/RiyU/jtUStGGjqhg90fgG9C8lR44T5czQrlFmzGBPp/9fklw5Ri+BCZfpMpK9lyxFLeV99hLJm9KiSzXLQgs+n3HT8mkmFdjPcMluUe3d31KzDrg0kwtPm9hFcrSo3NHfIjC5l4pmQUUq0TT70f8kp7brBuei0uwf0iyqEI0lNAbkDL2dotj/iHMBbgGLRP16RoJcW7RDNRx7y/rRaRZXkC4VlIL0irBSb3DMm6z8Uc2GitJ+fg66HKSzoJm6zDGeAzbcp6DZWHG64+M74LCpVhyiao6tbYO6aDYHgHonPoxeIUeNhohiuJJjetbOgmgKBOMWBO+0/jbIfYvpiGL3EARHgblld2E0hQJTz4fDT0KccZdEEaJYzeTY1alSKE2xINFZYRrQqwCCo9zI7jH+bm8tx2oHKHZ1Q1M0aDQ+wC84aDTOpQz+dlc3OSYFHKOrKhZSUzyI59Hz0YXo1yHNftgOF9X9dxyL+RwbZaU5JKgNEBw7IA/9IrrFQ0C1cJ2p7nMhwUh6ApY+/QeCwynlcIPVzbf6U91mcV1Xcd0dI82hQb/GDdYSdBEEu9WecwFM57guRVy37RBjHHXV5RtzaIxFh3umz0xB3R9H4yJ1C3kU3x8U7/cVmpniND7RBKT7cPnjaEd3Vs1MIWDF+967ASewxqNpTpcSXM5WBCyaJoQuuXyA673PYKVUZwHLXrDa1BOXh+BzMQS7jxThchGu0tNksC6hT+D3nIBg1xVqN9WGPqnaXDpGKsMjR1YUypPsbWHv56Lz+YhrADeUs9qZ2qGd0N3C2nd0LukOurmdqWvKF2FuBI/q/wIMAKsI8k4rR3+qAAAAAElFTkSuQmCC");
	background-position: bottom center;
	background-size: 2rem 2rem;
	width: 2rem;
	height: 2rem;
	position: absolute;
	bottom: 10%;
	left: 40%
}

.order-mask .order-warn {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDBGN0YxQ0REQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDBGN0YxQ0VEQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMzlEMDFDNkRCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEMEY3RjFDQ0RCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Puh/N8IAAA7kSURBVHja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");
	background-position: bottom center;
	background-size: 2rem 2rem;
	width: 2rem;
	height: 2rem;
	position: absolute;
	bottom: 10%;
	left: 40%
}

.order-mask .order-error {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REYxOEUyOUJEQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REYxOEUyOUNEQkQ2MTFFNzhDRjBFQUEwNjhDOEMwNzciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpERjE4RTI5OURCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpERjE4RTI5QURCRDYxMUU3OENGMEVBQTA2OEM4QzA3NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhLaqlwAABRjSURBVHja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");
	background-position: bottom center;
	background-size: 2rem 2rem;
	width: 2rem;
	height: 2rem;
	position: absolute;
	bottom: 10%;
	left: 40%
}

@-webkit-keyframes revolve {
	0% {
		-webkit-transform: rotate(0deg);
		transform: rotate(0deg)
	}
	10% {
		-webkit-transform: rotate(36deg);
		transform: rotate(36deg)
	}
	20% {
		-webkit-transform: rotate(72deg);
		transform: rotate(72deg)
	}
	30% {
		-webkit-transform: rotate(108deg);
		transform: rotate(108deg)
	}
	40% {
		-webkit-transform: rotate(144deg);
		transform: rotate(144deg)
	}
	50% {
		-webkit-transform: rotate(180deg);
		transform: rotate(180deg)
	}
	60% {
		-webkit-transform: rotate(216deg);
		transform: rotate(216deg)
	}
	70% {
		-webkit-transform: rotate(252deg);
		transform: rotate(252deg)
	}
	80% {
		-webkit-transform: rotate(288deg);
		transform: rotate(288deg)
	}
	90% {
		-webkit-transform: rotate(324deg);
		transform: rotate(324deg)
	}
	100% {
		-webkit-transform: rotate(360deg);
		transform: rotate(360deg)
	}
}

@keyframes revolve {
	0% {
		-webkit-transform: rotate(0deg);
		transform: rotate(0deg)
	}
	10% {
		-webkit-transform: rotate(36deg);
		transform: rotate(36deg)
	}
	20% {
		-webkit-transform: rotate(72deg);
		transform: rotate(72deg)
	}
	30% {
		-webkit-transform: rotate(108deg);
		transform: rotate(108deg)
	}
	40% {
		-webkit-transform: rotate(144deg);
		transform: rotate(144deg)
	}
	50% {
		-webkit-transform: rotate(180deg);
		transform: rotate(180deg)
	}
	60% {
		-webkit-transform: rotate(216deg);
		transform: rotate(216deg)
	}
	70% {
		-webkit-transform: rotate(252deg);
		transform: rotate(252deg)
	}
	80% {
		-webkit-transform: rotate(288deg);
		transform: rotate(288deg)
	}
	90% {
		-webkit-transform: rotate(324deg);
		transform: rotate(324deg)
	}
	100% {
		-webkit-transform: rotate(360deg);
		transform: rotate(360deg)
	}
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

