<template>
	<div id="coupon" v-cloak>
		<div class="header">
			<template v-for="(title,index) in title">
				<div @click="getList(index)" :key='index'><span>{{title}}</span>
					<div class="line" v-if="indexSelect == index"></div>
				</div>
			</template>
		</div>
		<div class="content">
			<div class="no-coupon" v-if="showList.length == 0">
				<div class="img">

				</div>
				<div class="text">
					还没有优惠券...
				</div>
			</div>
			<!-- <template v-for="(c,index) in showList">
				<div class="discount" :key="index" @click="openCoupponDetail(c)">
					<div class="dis-mark" :class="getClass(c.type)">
						{{getText(c.type)}}
					</div>   
                    <div class="jiao" v-if="c.showNew  && indexSelect == 0">
                        新
                    </div>
                    <div class="jiao-mark">新</div> 
					<div class="dis-name hide">
						{{shopName}}
					</div>
					<div class="dis-desc hide">{{c.couponName}}</div>
					<div class="dis-date hide">
						有效期 至 {{transformTime(c.endTime)}}
					</div>
					<div class="dis-used" v-if="c.status == -1">
						<img src="../../res/icon/expired.png"/>
					</div>
					<div class="dis-used" v-if="c.status == 1">
						<img src="../../res/icon/used.png"/>
					</div>
				</div>
			</template> -->

			<list :size="itemH" :height="height" :httpId="'getCouponList'" :callContext="this" :callFn="callFn" :httpData="httpData" :isScroll="true" :allData=true>
				<div slot-scope="prop" class="discount" @click="openCoupponDetail(prop.data)">
					<div class="dis-mark" :class="getClass(prop.data,prop.data.type)">
						{{getText(prop.data,prop.data.type)}}
					</div>
					<div class="jiao" v-if="prop.data.showNew  && indexSelect == 0">
						新
					</div>
					<div class="jiao-mark">新</div>
					<div class="dis-name hide">
						{{shopName}}
					</div>
					<div class="dis-desc hide">{{prop.data.couponName}}</div>
					<div class="dis-date hide">
						有效期 至 {{transformTime(prop.data.endTime)}}
					</div>
					<div class="dis-used" v-if="prop.data.status == -1">
						<img src="../../res/icon/expired.png" />
					</div>
					<div class="dis-used" v-if="prop.data.status == 1">
						<img src="../../res/icon/used.png" />
					</div>
				</div>
			</list>
		</div>
	</div>
</template>
<script>
	import storage from 'src/verdor/storage';
	import utils from 'src/verdor/utils';
	import http from 'src/manager/http';

	export default {
		data() {
			return {
				token: '', //token
				title: ['未使用', '已使用', '已过期'], //标题
				indexSelect: '', //点击对应的index
				success: false,
				list: [],
				time: new Date().getTime() / 1000, //当前时间
				showList: [], //页面展示的优惠券数组
				shopName: '', //店铺名字
				expireList: [], //过期优惠券的数组
				useList: [], //未使用的优惠券的数组
				usedList: [], //已使用的优惠券数组
				createTime: '', //优惠券发放时间
				itemH: this.FS * 2.85,
				height:utils.getWindowWH().h  - 1.25 * this.FS,
				httpData: {
					shopId: this.shopId,
					useStatus: 1,
					page: 1,
					num: 50
				}
			};
		},
		methods: {
			//把时间戳转化成***年**月**日
			transformTime: function(time) {
				return utils.format(new Date(Number(time) * 1000), 'yyyy-MM-dd');
			},
			async getUserInfo() {
				let data = await http.getUserInfo({
					data: { //请求登录接口
						shopId: this.shopId,
						type: 4,
						from: 0
					}
				});
				this.shopName = data.shopName; //获取店铺名称
			},
			callFn(res,allList) {
				console.log(res,'res');
				this.list = res.data.list; //全部优惠券 

				//过滤出积分卡
				this.list = this.list.filter((item) => {
					item.showNew = false;
					if (this.time - item.createTime < 3600) {
						item.showNew = true;
						item.newNum = 0;
					}else{
						item.newNum = 1;
					}
					return item.type != 7;
				});
				// 获取返回优惠券时间的零点时间戳
				let times = new Date(res.time * 1000);
				this.time = times;
				this.success = true;

				this.showList = utils.sortByAll(allList.concat(this.list), ['newNum','endTime']);
				return {list:this.showList};
			},
			getList(type) {
				this.httpData.useStatus = type + 1;
				this.indexSelect = type;
			},
			openCoupponDetail: function(coupon) { //点击打开优惠券详情
				storage.session('couponDetail', coupon);
				this.$router.push('/couponDetail');
			},
			checkExpire: function(et) { //通过传入的时间判断是否过期
				et -= 0;
				let t = new Date().getTime();
				t = t.toString().substring(0, 10);
				t -= 0;
				if (t < et) {
					return true;
				} else {
					return false;
				}
			},
			getClass: function(data,num) { //根据类名获取样式
				if (this.indexSelect == 0) {
					if (num == 0 || num == 1 || num == 2 || num == 8 || num == 11 || (num == 9 && data.discountType == 2 )) {
						return 'cblue';
					} else if (num == 3 || num == 4 || (num == 9 && data.discountType == 1)) {
						return 'cgreen';
					} else if (num == 5 || num == 10) {
						return 'cred';
					} else if(num == 6 || (num == 9 && data.discountType == 3)){
						return 'cyellow';
					}
				}
			},
			getText: function(data,num) { //根据类型判断是哪种类型的优惠券
				if (num == 0 || num == 1 || num == 2 || num == 8 || (num == 9 && data.discountType == 2 )) {
					return '减';
				} else if (num == 3 || num == 4 || (num == 9 && data.discountType == 1 )) {
					return '折';
				} else if (num == 5) {
					return '赠';
				} else if(num == 6 || (num == 9 && data.discountType == 3)){
					return '代';
				}else if(num == 10){
					return '送';
				}else if(num == 11){
					return '定';
				}
			},
			getRate: function(c) {
				if (c.type == 3 || c.type == 4) {
					let num = (c.param - 0) / 10;
					num += '折';
					return num;
				} else {
					return '¥' + c.param;
				}
			}
		},
		components: {
			'list': () =>
				import( /* webpackChunkName:'list' */ 'src/components/list')
		},
		mounted() {
			this.getUserInfo();
			utils.setTitle('我的优惠券');
			
		}
	};
</script>
<style type="text/css" scoped>
	#coupon .content .no-coupon {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 60%;
		height: 60%;

		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}

	#coupon .content .no-coupon .img {
		width: 100%;
		height: 40%;

		background: url(../../../src/res/icon/no-coupon.png) center center no-repeat;
		background-size: 45%;
	}

	#coupon .content .no-coupon .text {
		line-height: 1rem;

		width: 100%;
		height: 1rem;

		text-align: center;
	}

	#coupon {
		width: 10rem;
	}

	.header {
		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;

		width: 100%;
		height: 1.53rem;

		background: url(../../../src/res/icon/list-bg.jpg);
	}

	.header div {
		font-size: .4rem;
		line-height: 1.53rem;

		position: relative;

		text-align: center;

		color: white;

		-webkit-box-flex: 1;
		-webkit-flex: 1;
		-ms-flex: 1;
		flex: 1;
	}

	.header div .yellowHover {
		color: #f6a623;
	}

	.line {
		position: absolute;
		bottom: .27rem;
		left: 22%;

		width: 56%;
		height: .051rem;

		background-color: #fff;
	}

	.discount {
		position: relative;

		overflow: hidden;

		width: 93%;
		height: 2.55rem;
		margin: .3rem auto 0;

		border: #ebeced 1px solid;
		border-radius: .1rem;
		background-color: #f7f9fa;
	}

	.discount .cblue {
		background-color: #128de5;
	}

	.discount .cred {
		background-color: #ce2f2b;
	}

	.discount .cgreen {
		background-color: #69a834;
	}

	.discount .cyellow {
		background-color: #ebca0b;
	}

	.dis-mark {
		font-size: .38rem;
		line-height: .8rem;

		position: absolute;
		top: .4rem;
		left: .33rem;

		width: .8rem;
		height: .8rem;

		text-align: center;

		color: #fff;
		border-radius: .4rem;
		background-color: #656667;
	}

	.jiao {
		position: absolute;
		top: 0;
		right: 0;
		width: 0;
		height: 0;
		border-top: solid .8rem red;
		border-left: .8rem solid transparent;
	}

	.jiao-mark {
		font-size: .3rem;
		position: absolute;
		top: .05rem;
		right: .05rem;
		color: #fff;
	}

	.dis-name {
		font-size: .35rem;

		position: absolute;
		top: .5rem;
		left: 1.3rem;

		width: 81%;
		height: .54rem;

		text-overflow: ellipsis;

		color: #626364;
		/*background-color: yellow;*/
	}

	.dis-desc {
		font-size: .42rem;
		/*background-color: #ADFF2F;*/

		position: absolute;
		top: 1.05rem;
		left: 1.3rem;

		width: 81%;
		height: .74rem;
	}

	.dis-date {
		font-size: .28rem;

		position: absolute;
		top: 1.8rem;
		left: 1.3rem;

		width: 81%;
		height: .44rem;

		color: #626364;
		/*background-color: #FFA500;*/
	}

	/*已使用*/
	.dis-used {
		line-height: 1.14rem;

		position: absolute;
		top: .33rem;
		right: .33rem;

		width: 1.14rem;
		height: 1.14rem;

		text-align: center;

		color: lightgray;
		border-radius: 50%;
	}

	.dis-used img {
		width: 100%;
		height: 100%;
	}

	.dis-date:before {
		position: relative;
		top: -.06rem;
		right: .02rem;

		content: '.';

		color: #626364;
	}

	.hide {
		overflow: hidden;

		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>