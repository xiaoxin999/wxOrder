<template>
	<div id="order-detail" style="height: 100%;font-size: 12px;" v-cloak>
		<div class="order-detail" style="padding: 0;">
			<div class="detail-box">
				<!--<div class="detail-head">
            <span class="fl previousPage" @click="closeOrderDetail" style="background-size: 12px 19;" v-if="isOrederList"></span> 订单详情
        </div>-->
				<div class="detail-tit">{{shopName}}</div>
				<div class="detail-list">
					<span class="fl">菜品总价</span>
					<span class="fr color-red"><span class="fl">￥{{totalPrice}}</span><span class="fl">|</span><span class="fl" style="margin-right: 0;">{{orderInfo}}</span></span>
				</div>
				<div class="detail-list">
					<span class="fl">下单时间</span>
					<span class="fr">{{orderDate}}</span>
				</div>
				<div class="detail-list">
					<span class="fl">订单编号</span>
					<span class="fr">{{oid}}</span>
				</div>
				<div class="detail-list">
					<span class="fl">座位号</span>
					<span class="fr">{{tableName}}</span>
				</div>
			</div>
			<div class="detail-box">
				<div class="detail-tit">商品详情</div>
				<template v-for="(goods,i) in orderDetailList">
					<div class="detail-list" v-if="goods.num > 0" :key="i+'_num'">
						<div class="fl" style="width: 55%;height: 50px;overflow: hidden;">
							<span class="fl" v-bind:class="{ 'attrName': goods.attr && goods.attr.length >= 1}">{{goods.goodsName}}</span>
							<span class="fl attr">
								<template v-for="attr in goods.attr">
									{{attr.name}}
								</template>
							</span>
						</div>
						<span class="fr" style="width: calc(45% -15px);">
							<span class="fl" style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;">×{{goods.num}}</span>
							<span class="fl" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;">￥{{goods.price}}</span>
						</span>
					</div>
					<div class="detail-list" v-if="goods.freeNum && goods.freeNum > 0" :key="i+'_freeNum'">
						<div class="fl" style="width: 55%;height: 50px;overflow: hidden;">
							<span class="fl" v-bind:class="{ 'attrName': goods.attr && goods.attr.length >= 1}">{{goods.goodsName}}</span>
							<span class="fl attr">
								<template v-for="attr in goods.attr">
									{{attr.name}}
								</template>
							</span>
						</div>
						<span class="fr" style="width: calc(45% -15px);"><span class="fl" style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;">×{{goods.freeNum}}</span><span class="fl freenum" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;"></span></span>
					</div>
					<div class="detail-list" v-if="goods.returnNum && goods.returnNum > 0" :key="i+'_returnNum'">
						<div class="fl" style="width: 55%;height: 50px;overflow: hidden;">
							<span class="fl" v-bind:class="{ 'attrName': goods.attr && goods.attr.length >= 1}">{{goods.goodsName}}</span>
							<span class="fl attr">
								<template v-for="attr in goods.attr">
									{{attr.name}}
								</template>
							</span>
						</div>
						<span class="fr" style="width: calc(45% -15px);"><span class="fl" style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;">×{{goods.returnNum}}</span><span class="fl returnnum" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;"></span></span>
					</div>
				</template>
				<div class="detail-list" v-for="(packages,i) in orderPackageList" style="height: auto;min-height: 50px;" :key='i'>
					<template v-if="packages.num > 0">
						<span class="fl">{{packages.packageName}}</span>
						<span class="fr" style="width: calc(45% -15px);"><span style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;" class="fl">×{{packages.num}}</span><span class="fl" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;">￥{{packages.price}}</span></span>
						<div v-for="(goods,j) in packages.goods" class="tag-pacakge" :key="j+'tag-pacakge'">
							<div class="fl">
								<span class="fl" style="width: 80%;">
									<p class="fl">{{goods.name}}</p>
									<template v-for="(attr,index) in goods.attr">
										<p class="fl" style="text-indent: 5px;" :key="index+'_t'">({{attr.attrName}})</p>
									</template>
								</span>
								<span class="fr" style="margin-right: 30px;">×{{goods.num}}</span>
							</div>
						</div>
					</template>
					<template v-if="packages.freeNum && packages.freeNum > 0">
						<span class="fl">{{packages.packageName}}</span>
						<span class="fr" style="width: calc(45% -15px);"><span style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;" class="fl">×{{packages.returnNum}}</span><span class="fl returnnum" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;"></span></span>
						<div v-for="(goods,j) in packages.goods" class="tag-pacakge" :key="j+'tag-pacakge-freeNum'">
							<div class="fl">
								<span class="fl" style="width: 80%;">
									<p class="fl">{{goods.name}}</p>
									<template v-for="(attr,index) in goods.attr">
										<p class="fl" style="text-indent: 5px;" :key="index+'_fl'">({{attr.attrName}})</p>
									</template>
								</span>
								<span class="fr" style="margin-right: 30px;">×{{goods.num}}</span>
							</div>
						</div>
					</template>
					<template v-if="packages.returnNum && packages.returnNum > 0">
						<span class="fl">{{packages.packageName}}</span>
						<span class="fr" style="width: calc(45% -15px);"><span style="width: auto;text-align: right;color: #bbbbbb;text-indent: 0;" class="fl">×{{packages.freeNum}}</span><span class="fl freenum" style="margin-right: 0;width: 60px;text-align: right;color: #888888;text-indent: 0;height:50px;"></span></span>
						<div v-for="(goods,j) in packages.goods" class="tag-pacakge" :key="j+'tag-pacakge-goods'">
							<div class="fl">
								<span class="fl" style="width: 80%;">
									<p class="fl">{{goods.name}}</p>
									<template v-for="(attr,index) in goods.attr">
										<p class="fl" style="text-indent: 5px;" :key="index+'_text'">({{attr.attrName}})</p>
									</template>
								</span>
								<span class="fr" style="margin-right: 30px;">×{{goods.num}}</span>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import utils from "src/verdor/utils";
	import storage from "src/verdor/storage";
	import http from "src/manager/http";

	export default {
		data() {
			return {
				shopName: '',
				totalPrice: '',
				orderInfo: '',
				orderDate: '',
				oid: '',
				fid: '',
				orderStatus: '',
				tableName: '',
				orderDetailList: [],
				orderPackageList: [],
				token: '',
				shopId: '',
				isOrederList: false,
				status: {
					"-2": "已取消",
					"1": "待确认",
					"2": "已确认",
					"3": "待确认",
					"4": "已结账",
					"7": "已领取",
					"9": "待支付",
					"10": "已完成",
					"100": "已支付", //自己定义的
				},
			}
		},
		methods: {
			closeOrderDetail: function() {
				this.$router.push("/osuccess");
			},
			async showOrderDetail() {


				let data = await http.showOrderDetail({
					data: {
						oid: this.oid,
						shopId: this.shopId
					}
				});

				this.orderDate = utils.format(new Date(Number(data.createTime) * 1000), 'yyyy/MM/dd hh:mm');
				this.oid = data.oid;
				this.totalPrice = data.price;
				this.orderStatus = data.status;
				this.orderDetailList = data.goodsData.goods;
				this.orderPackageList = data.goodsData.package;
				this.tableName = data.tableName;

				this.orderInfo = this.status[this.orderStatus]

				var arr1 = this.orderPackageList;
				if (!utils.isEmptyObject(this.orderPackageList)) {
					for (var i = 0; i < arr1.length; i++) {
						if (Number(arr1[i].returnNum)) {
							arr1[i].num = Number(arr1[i].num) - Number(arr1[i].returnNum);
						}
						if (Number(arr1[i].freeNum)) {
							arr1[i].num = Number(arr1[i].num) - Number(arr1[i].freeNum);
						}
						arr1[i].num = Number(arr1[i].num);
						for (var j = 0; j < arr1[i].goods.length; j++) {
							arr1[i].goods[j].num = Number(arr1[i].goods[j].num);
							for (var k = 0; k < arr1[i].goods[j].attr.length; k++) {
								arr1[i].goods[j].attr[k].arrName = [];
								for (var h = 0; h < arr1[i].goods[j].attr[k].name.length; h++) {
									arr1[i].goods[j].attr[k].arrName.push(arr1[i].goods[j].attr[k].name[h].split(':'));
								}
								arr1[i].goods[j].attr[k].attrName = arr1[i].goods[j].attr[k].arrName[0][0];
							}
						}
					}
				}


				var arr = this.orderDetailList;
				if (!utils.isEmptyObject(this.orderDetailList)) {
					for (var i = 0; i < arr.length; i++) {
						if (Number(arr[i].returnNum)) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].returnNum);
						}
						if (Number(arr[i].freeNum)) {
							arr[i].num = Number(arr[i].num) - Number(arr[i].freeNum);
						}
						arr[i].num = Number(arr[i].num);
					}
				}


			}

		},
		mounted() {
			var orderInfo = storage.session('orderInfo');
			var payInfo = storage.session('orderListInfo');
			var hq = storage.session('select-shop');
			var wechatShop = storage.session('wechatShop');
			if (orderInfo) {
				this.oid = orderInfo.oid;
				this.shopName = orderInfo.shopName;
				this.token = wechatShop.accessToken;
				this.shopId = wechatShop.shopId;
			} else {
				this.oid = payInfo.oid;
				this.shopId = payInfo.shopId;
				this.shopName = payInfo.shopName;
				this.token = hq.token ? hq.token : hq.accessToken;
			}
			this.showOrderDetail();
			utils.setTitle('订单详情');
		}
	}
</script>

<style lang='less' scoped>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.container .head-tit,
	.container .search-head {
		width: 100%;
		height: 49px;
		line-height: 49px;
		padding: 0 10px;
		color: #705c5c;
		border-bottom: 1px solid #e5e5e5;
		overflow: hidden;
	}

	.container .head-tit {
		text-indent: 25px;
		font-size: 14px;
		background: url(../../res/images/table-icon.png) 10px center no-repeat;
		background-size: 16px 16px;
	}

	.search-head {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 99;
		background-color: #EFEFF4;
	}

	.container .content,
	.container .search-content,
	.container .search-goods {
		background-color: #fff;
		padding-left: 10px;
		width: 100%;
		height: auto;
		margin-bottom: 70px;
	}

	.container .content .content-box,
	.container .search-content .content-box,
	.container .search-goods .content-box {
		width: 100%;
		height: 50px;
		line-height: 50px;
		border-bottom: 1px solid #e5e5e5;
		font-size: 0;
	}

	.container .content .content-box:last-child,
	.container .search-content .content-box:last-child,
	.container .search-goods .content-box:last-child {
		border-bottom: none;
	}

	.container .content .content-box span:nth-child(1),
	.container .search-content .content-box span:nth-child(1),
	.container .search-goods .content-box span:nth-child(1) {
		width: 20%;
		height: 100%;
		font-size: 12px;
		display: inline-block;
	}

	.container .content .content-box span:nth-child(2),
	.container .search-content .content-box span:nth-child(2),
	.container .search-goods .content-box span:nth-child(2) {
		width: 60%;
		height: 100%;
		padding-left: 10px;
		color: #b2b2b2;
		font-size: 12px;
		display: inline-block;
	}

	.container .content .content-box span:nth-child(3),
	.container .search-content .content-box span:nth-child(3),
	.container .search-goods .content-box span:nth-child(3) {
		font-size: 12px;
		width: 20%;
		height: 100%;
		display: inline-block;
	}

	.container .content .content-box input,
	.container .search-content .content-box input,
	.container .search-goods .content-box input {
		border: none;
		outline: none;
		padding: 0;
		width: 80%;
		height: 100%;
		text-indent: 10px;
		float: left;
		font: 14px "arial rounded mt bold";
	}

	.container .content .content-box input::-webkit-input-placeholder,
	.container .search-content .content-box input::-webkit-input-placeholder,
	.container .search-goods .content-box input::-webkit-input-placeholder {
		font-size: 12px;
		color: #b2b2b2;
	}

	.container .area-footer {
		padding: 0 10%;
		width: 100%;
		height: 50px;
		line-height: 50px;
		text-align: center;
		color: #fff;
	}

	.container .area-footer a {
		display: block;
		border-radius: 10px;
		outline: none;
		transition: 0.3s ease-in-out background-color;
		-webkit-transition: 0.3s ease-in-out background-color;
	}

	.container .areaLayer {
		position: absolute;
		left: 0;
		top: 0;
		background: rgba(0, 0, 0, 0.7);
		width: 100%;
		height: 100%;
	}

	.areaList {
		position: absolute;
		left: 0;
		bottom: 0;
		z-index: 99;
		width: 100%;
		height: 40%;
		overflow: hidden;
		background-color: #fff;
	}

	.areaList .areaList-head {
		width: 100%;
		height: 45px;
		background-color: #f2f2f2;
	}

	.areaList .areaList-head span {
		display: block;
		width: 100%;
		height: 45px;
		line-height: 45px;
		text-align: center;
	}

	.areaList .areaList-concent {
		width: 100%;
		height: calc(100% - 45px);
		line-height: 45px;
		overflow: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.areaList .areaList-concent ul li {
		width: 100%;
		height: 45px;
		text-align: center;
		line-height: 45px;
		background-color: #fff;
		border-bottom: 1px solid #F0F0EE;
	}

	.areaList .areaList-concent ul li:last-child {
		border-bottom: none;
	}

	.container .table-error {
		width: 100%;
		height: 40px;
		line-height: 40px;
		color: #fff;
		text-align: center;
		position: fixed;
		left: 0;
		top: 0;
	}

	.container .search-box {
		width: 100%;
		height: 30px;
		margin-top: 10px;
		background-color: #fff;
		border-radius: 5px;
		border: 1px solid #edecf1;
		transition: 0.3s width ease-in-out;
	}

	.container .search-box span {
		width: 30px;
		height: 30px;
		display: block;
	}

	.container .search-box span.search {
		background: url("../../res/images/sreach.png") center 7px no-repeat;
		background-size: 15px 15px;
	}

	.container .search-box span.clean {
		background: url("../../res/images/close.png") center 7px no-repeat;
		background-size: 15px 15px;
	}

	.container .search-box input {
		outline: none;
		border: none;
		padding: 0;
		width: calc(100% - 60px);
		height: 28px;
	}

	.container .cancel {
		width: 20%;
		height: 30px;
		display: inline-block;
		line-height: 30px;
		color: #a4a4a4;
		text-align: center;
		opacity: 0;
		transition: 0.3s opacity ease-in-out;
	}

	.container .search-cancel {
		width: 80%;
	}

	.container .transition-cancel {
		opacity: 1;
		-webkit-transition: 0.3s opacity ease-in-out;
		transition: 1s opacity ease-in-out;
	}

	.container .search-content,
	.container .search-goods {
		margin-bottom: 0;
		height: auto;
		margin-top: 50px;
	}

	.container .search-content ul,
	.container .search-goods ul {
		width: 100%;
		height: 100%;
		overflow: auto;
	}

	.container .search-content ul li,
	.container .search-goods ul li {
		width: 100%;
		height: 45px;
		line-height: 45px;
		text-indent: 30px;
		color: #686868;
		border-bottom: 1px solid #f5f5f5;
	}

	.container .search-content ul li:last-child,
	.container .search-goods ul li:last-child {
		border-bottom: none;
	}

	.container .search-goods {
		padding-left: 0;
	}

	.container .search-goods .goods {
		width: 100%;
		height: 100px;
		padding: 10px 0;
		border-bottom: 1px solid #979797;
	}

	.container .search-goods .goods .goods-img {
		width: calc(40% - 20px);
		height: 80px;
		margin: 0 10px;
		background-color: #d8d8d8;
		border: 1px solid #979797;
	}

	.container .search-goods .goods .goods-img img {
		display: block;
		height: 100%;
		width: 100%;
	}

	.container .search-goods .goods .Sgoods-name {
		width: calc(40% + 20px);
		height: 50px;
		line-height: 22.5px;
	}

	.container .search-goods .goods .Sgoods-price {
		width: calc(40% - 20px);
		height: 30px;
		line-height: 30px;
		color: #d0021b;
	}

	.container .shopping-footer {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 99;
		width: 100%;
		height: 50px;
		line-height: 50px;
		padding-left: 10px;
		background: rgba(0, 0, 0, 0.5);
	}

	.container .shopping-footer .empty-Shopping {
		background: url("../../res/images/icon-gouwuche-none.png") center 2px no-repeat;
	}

	.container .shopping-footer .Shopping {
		background: url("../../res/images/shopcar.png") center 2px no-repeat;
	}

	.container .shopping-footer .Shopping,
	.container .shopping-footer .empty-Shopping {
		background-size: 41px 41px;
		display: block;
		width: 50px;
		height: 50px;
	}

	.container .shopping-footer .Shopping-tip {
		color: #999999;
		letter-spacing: 1px;
		font-size: 16px;
		text-indent: 10px;
		width: calc(100% - 160px);
	}

	.container .shopping-footer .Shopping-btn {
		width: 110px;
		height: 100%;
		text-align: center;
		border-left: 1px solid #efeff4;
		color: #c3c3c3;
		font-size: 16px;
	}

	.container .shopping-concent {
		background: rgba(0, 0, 0, 0.4);
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		bottom: 50px;
	}

	.container .shopping-concent .shopping-list {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 50%;
		background: #fff;
	}

	.container .shopping-concent .shopping-head {
		width: 100%;
		height: 40px;
		border-bottom: 1px solid #f3f3f3;
		padding: 5px 10px;
	}

	.container .shopping-concent .shopping-head .shopping-tit {
		display: block;
		width: 60px;
		height: 30px;
		line-height: 30px;
		text-indent: 5px;
		color: #818181;
	}

	.container .shopping-concent .shopping-head .shopping-tit:before {
		content: '';
		width: 4px;
		height: 20px;
		display: inline-block;
		background-color: #5ea1ef;
		position: relative;
		top: 5px;
		float: left;
	}

	.container .shopping-concent .shopping-head .empty {
		width: 30px;
		height: 30px;
		background: url("../../res/images/delect.png") center center no-repeat;
		background-size: 20px 20px;
	}

	.container .package {
		width: 100%;
		height: auto;
		position: relative;
	}

	.container .package .package-tit {
		width: 100%;
		height: 45px;
		line-height: 45px;
		text-indent: -50px;
		text-align: center;
		border-bottom: 1px solid #e0dcdc;
	}

	.container .package .package-tit span {
		display: block;
		width: 50px;
		height: 45px;
		font-size: 24px;
		text-indent: 0;
	}

	.container .package .package-head {
		width: 100%;
		height: 45px;
		border-bottom: 1px solid #e0dfe4;
		font-size: 0;
	}

	.container .package .package-head span {
		display: inline-block;
		width: auto;
		height: 44px;
		line-height: 44px;
		padding: 0 10px;
		border-right: 1px solid #e2dede;
	}

	.container .package .package-head span.on {
		color: #00BFFF;
	}

	.container .package .package-subhead {
		width: 100%;
		height: 20px;
		line-height: 20px;
		padding-left: 10px;
		color: #fff;
		background-color: #00A0E9;
		font-size: 10px;
	}

	.container .package .package-list {
		width: 100%;
		height: calc(100% - 65px);
		line-height: 40px;
		overflow: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.container .package .package-list ul li {
		width: 100%;
		height: auto;
		min-height: 40px;
		text-indent: 10px;
		border-bottom: 1px solid #F2DEDE;
		color: #666;
		overflow: hidden;
	}

	.container .package .package-list ul li .tip {
		font-size: 10px;
		color: #999999;
	}

	.container .package .package-footer {
		width: 100%;
		height: 45px;
		line-height: 45px;
		background-color: #f5a623;
		position: fixed;
		left: 0;
		bottom: 0;
		text-align: center;
		color: #fff;
	}

	.order-success {
		width: 100%;
		height: 100%;
		background-color: #fff;
		text-align: center;
		overflow: hidden;
	}

	.order-success .order-img {
		width: 100%;
		height: 150px;
		background: url("../../res/images/success.png") center center no-repeat;
		background-size: 100px 100px;
	}

	.order-success h2 {
		color: #000000;
		font-size: 24px;
		width: 100%;
		height: 45px;
		line-height: 45px;
		margin-bottom: 10px;
	}

	.order-success p {
		color: #888888;
	}

	.order-success a {
		display: block;
		width: calc(100% - 40px);
		height: 45px;
		line-height: 45px;
		margin: 0 20px 15px;
		border-radius: 8px;
		font-size: 14px;
	}

	.order-success a.close {
		color: #333333;
		border: 1px solid #dfdfdf;
		background-color: #f8f8f8;
	}

	.order-success a.detail {
		color: #FFFFFF;
		background-color: #f5a623;
	}

	.order-detail {
		width: 100%;
		height: calc(100%);
		background-color: #efeff4;
		padding-top: 50px;
		overflow-x: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.order-detail .detail-box {
		width: 100%;
		height: auto;
		background-color: #ffffff;
		margin-bottom: 10px;
		overflow: hidden;
	}

	.order-detail .detail-box .detail-tit {
		width: 100%;
		height: 50px;
		line-height: 50px;
		color: #000000;
		border-bottom: 1px solid #f3f3f3;
		text-indent: 20px;
		font-size: 14px;
		position: relative;
	}

	.order-detail .detail-box .detail-tit:after {
		content: '';
		display: block;
		width: 4px;
		height: 20px;
		background-color: #6ba9f1;
		position: absolute;
		left: 10px;
		top: 15px;
	}

	.order-detail .detail-box .detail-list {
		width: 100%;
		height: 50px;
		line-height: 50px;
		text-indent: 20px;
		color: #666;
		border-bottom: 1px solid #e5e5e5;
	}

	.order-detail .detail-box .detail-list span {
		display: block;
		margin-right: 15px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.order-detail .detail-box .detail-list span.color-red {
		color: #d0021b;
	}

	.order-detail .detail-box .detail-list span.attr {
		height: 25px;
		width: 100%;
		line-height: 25px;
		color: #9b9b9b;
	}

	.order-detail .detail-box .detail-list span.attrName {
		height: 25px;
		width: 100%;
		line-height: 25px;
		color: #333333;
	}

	.order-detail .detail-head {
		width: 100%;
		height: 50px;
		line-height: 50px;
		border-bottom: 1px solid #DDDDDD;
		text-indent: -50px;
		text-align: center;
		font-size: 14px;
		color: #999;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 99;
		background-color: #f7f7f7;
	}

	.order-detail .detail-head span {
		display: block;
		width: 50px;
		height: 50px;
		font-size: 24px;
		text-indent: 0;
	}

	.order-detail .tag-pacakge {
		width: 100%;
		height: auto;
		line-height: 35px;
		background-color: #efefef;
		overflow: hidden;
	}

	.order-detail .tag-pacakge .tag-head {
		color: #954442;
		font-size: 12px;
	}

	.order-detail .tag-pacakge div {
		font-size: 12px;
		width: 100%;
		height: 35px;
		overflow: hidden;
	}

	.order-detail .freenum {
		background: url(../../res/images/freenum.png) center center no-repeat;
		background-size: 38px 22px;
	}

	.order-detail .returnnum {
		background: url(../../res/images/returnnum.png) center center no-repeat;
		background-size: 38px 22px;
	}
</style>