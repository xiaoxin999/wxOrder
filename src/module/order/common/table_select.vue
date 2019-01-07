<template>

	<div id="table-select" style="height: 100%;" v-cloak>
		<div class="container">
			<!--选择桌台-->
			<div id="area" v-cloak v-if="showIndex == 1" style="position: relative;height: 100%;">
				<div class="head-tit">选择桌台</div>
				<div class="content">
					<div class="content-box">
						<span class="fl">区域</span>
						<span class="fl" @click="openAreaTable('area')" v-if="!isScanCode">{{areaNmae}}</span>
						<span class="fl" v-if="isScanCode">{{areaNmae}}</span>
						<template v-if="!istableCode">
							<span class="more fl" @click="openAreaTable('area')" v-if="!isScanCode"></span>
							<span class="more fl" v-if="!isScanCode"></span>
						</template>

					</div>
					<div class="content-box">
						<span class="fl">桌台</span>
						<span class="fl" @click="openAreaTable()" v-if="!isScanCode">{{tableName}}</span>
						<span class="fl" v-if="isScanCode">{{tableName}}</span>
						<template v-if="!istableCode">
							<span class="more fl" @click="openAreaTable()" v-if="!isScanCode"></span>
							<span class="more fl" v-if="!isScanCode"></span>
						</template>
					</div>
					<div class="content-box">
						<span class="fl">人数</span>
						<input type="number" placeholder="请填写人数" maxlength="2" v-model="num" v-if="tableMaxNum == ''" />
						<input type="number" :placeholder="tipsTxt" maxlength="2" v-model="num" :readonly="isOrder" v-if="tableMaxNum != ''" />
					</div>
				</div>
				<div class="area-footer">
					<a href="javascript:void(0)" :class="{'yellow':isShopping,'eor-yellow':!isShopping}" style="font-size: 16px;" @click="goShopping" v-if="isTableStatus == '0' || isTableStatus == '1' || isTableStatus == '4' && !isOrder">确定</a>
					<a href="javascript:void(0)" :class="{'yellow':isShopping,'eor-yellow':!isShopping}" style="font-size: 16px;" @click="goShopping" v-if="isTableStatus == '4' && isOrder">确定</a>
					<a href="javascript:void(0)" :class="{'yellow':isShopping,'eor-yellow':!isShopping}" style="font-size: 16px;" @click="goShopping" v-if="isTableStatus == '2' || isTableStatus == '3' && isOrder">加菜</a>
				</div>
				<div class="table-error red" v-if="errors">{{errorsInfo}}</div>
				<div class="areaLayer" v-show="isWinAera" @click="winHide">

				</div>
				<div class="areaList" v-show="isWinAera">
					<div class="areaList-head">
						<span>{{areaNmae}}</span>
					</div>
					<div class="areaList-concent">
						<ul v-if="isAera">
							<li v-for="(areas,i) in areasList" @click="getAreaDetail(areas.id,areas.areaName)" :key="i">{{areas.areaName}}</li>
							<li></li>
						</ul>
						<ul v-if="isTable">
							<li v-for="(tableList,i) in table" @click="getTableDetail(tableList)" :key="i">{{tableList.tableName}}</li>
							<li></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>

<script>
	import utils from 'src/verdor/utils';
	import storage from 'src/verdor/storage';
	import http from 'src/manager/http';
	import orderHttp from 'src/module/order/data/order_http';
	import global from 'src/manager/global';


	let intReg = /[^\d]/g;
	let orderData = null;
	export default {
		data() {
			return {
				tipsTxt: '',
				showIndex: 1,
				Token: '',
				areasList: [], //区域列表
				ordersList: [], //订单列表
				tablesList: [], //桌台列表
				table: [], //筛选后的桌台
				areaNmae: '选择就坐区域', //区域名称
				tableName: '选择就坐桌台', //桌台名称
				areaId: '', //区域Id
				tableId: '', //桌台Id
				num: '', //用餐人数
				oid: '', //订单id
				isTableStatus: '0', //桌台状态码
				tableMaxNum: '', //桌台最大容纳人数
				errors: false, //是否发生错误
				errorsInfo: '', //错误信息
				isShopping: false,
				isWinAera: false, //是否打开区域桌台弹窗 true为打开 false为关闭
				isAera: false, //是否打开区域桌台弹窗 true为打开 false为关闭
				isTable: false, //是否打开区域桌台弹窗 true为打开 false为关闭
				isOrder: false,
				istableCode: false, //是否是扫码点餐,
				isScanCode: false,
				shopName: '', //店铺名称
				shopId: global.getShopId()
			};
		},
		watch: {
			tableMaxNum() {
				this.tipsTxt = `请填写人数,最大容纳人数为${this.tableMaxNum}人`;
			},
			'num': 'areaChange',
			'tableName': 'areaChange',
			'areaNmae': 'areaChange'
		},
		computed: {
			nums() {
				return this.num.replace(intReg, '');
			}
		},
		methods: {
			init() {

				if (orderData.tableId) {
					this.istableCode = true;
					this.checkTable();
				} else {
					this.getAreaList();
				}
			},
			async getAreaList() {
				// 获取桌台区域订单数据
				let data = await http.areaAndTableList({
					data: {
						type: '0',
						shopId: this.shopId
					}
				});
				this.areasList = data.areas;
				this.areasList = utils.sortByAll(this.areasList, 'sort', true);
				this.tablesList = data.tables;
				this.tablesList = utils.sortByAll(this.tablesList, 'sort', true);
				this.ordersList = data.orders;

			},
			winHide() {
				// 关闭桌台区域弹窗
				this.isWinAera = false;
			},
			async checkTable() {
				//扫码加菜
				let data = await http.checkTable({
					data: {
						shopId: this.shopId,
						tableId: orderData.tableId
					}
				});

				this.tableId = data.table.id;
				this.tableName = data.table.tableName;
				this.tableMaxNum = data.table.maxSeat;
				this.areaId = data.area.area;
				this.areaNmae = data.area.areaName;


				if (!utils.isEmptyObject(data.order)) {
					this.isTableStatus = data.order.status;
					this.oid = data.order.oid;
					this.num = data.order.person;
				} else {
					this.getAreaList();
				}
				if (this.isTableStatus == '1') {
					this.errors = true;
					this.errorsInfo = '该桌台待确认..';
				}
				if (this.isTableStatus == '4') {
					this.errors = true;
					this.errorsInfo = '该桌台暂时无法使用,请联系服务员清台..';
				}
				if (this.isTableStatus != '0') {
					this.isOrder = true;
					this.isScanCode = true;
				} else {
					this.isTableStatus = '0';
					this.isOrder = false;
				}

			},
			getAreaDetail(areaId, areaName) {
				// 获取区域id 区域名称
				this.areaId = areaId;
				this.areaNmae = areaName;
				this.tableName = '选择就坐桌台';
				this.num = '';

				// 筛选出该区域下的桌台
				let tableList = this.tablesList;
				this.table = [];
				for (let i = 0; i < tableList.length; i++) {
					if (tableList[i].areaId == areaId) {
						this.table.push(tableList[i]);
					}
				}
				this.isWinAera = false;
				this.isAera = false;
			},
			areaChange() {
				if (Number(this.tableMaxNum)) {
					//监测是否超出最大人数
					if (Number(this.num) > Number(this.tableMaxNum)) {
						this.errors = true;
						this.errorsInfo = '超出该桌台最大容纳人数..';
					} else {
						if (this.isTableStatus != '1' && this.isTableStatus != '4') {
							this.errors = false;
						}
					}
				}

				//监测是否可以跳转到购物车
				if (this.tableName != '选择就坐桌台' && this.areaNmae != '选择就坐区域' && Number(this.num) > 0 && !this.errors) {
					this.isShopping = true;
				} else {
					this.isShopping = false;
				}

				if (this.isTableStatus == '1' || this.isTableStatus == '4') {
					this.isShopping = false;
				}
			},
			getTableDetail(tables) {
				//获取桌台id 区域名称

				this.tableId = tables.id;
				this.tableName = tables.tableName;
				this.tableMaxNum = tables.maxSeat;

				this.num = '';
				let bol = false;
				for (let i = 0; i < this.ordersList.length; i++) {
					if (this.ordersList[i].tableId == tables.id) {
						// 判断订单列表中是否有该id 如果该id存在 isTableStatus = ordersList[i].status
						this.isTableStatus = this.ordersList[i].status;
						this.oid = this.ordersList[i].oid;
						if (this.ordersList[i].status == '1') {
							this.errors = true;
							this.errorsInfo = '该桌台待确认..';
						}
						if (this.ordersList[i].status == '4') {
							this.errors = true;
							this.errorsInfo = '该桌台不可用,请联系服务员清台..';
						}
						bol = true;
						this.num = this.ordersList[i].person;
					}
				}
				if (!bol) {
					this.isTableStatus = '0';
					this.isOrder = false;
				} else {
					this.isOrder = true;
				}

				this.isWinAera = false;
				this.isTable = false;
			},
			openAreaTable(isAreaTable) {
				if (this.istableCode) {
					return false;
				}
				if (isAreaTable && isAreaTable == 'area') {
					this.isAera = true;
					this.isTable = false;
					this.errors = false;
				} else {
					this.isTable = true;
					this.isAera = false;
					if (utils.isEmptyObject(this.table) && this.areaId.trim() == '') {
						this.errors = true;
						this.errorsInfo = '请选择区域..';
						return false;
					} else if (utils.isEmptyObject(this.table)) {
						this.errors = true;
						this.errorsInfo = '该区域下暂无桌台..';
						return false;
					} else {
						this.errors = false;
					}
				}
				this.isWinAera = true;

			},
			goShopping() {
				// 跳转到购物车页面
				if (this.isShopping) {
					let orderInfo = {};
					orderInfo.shopName = this.shopName;
					orderInfo.tableId = this.tableId;
					orderInfo.areaId = this.areaId;
					orderInfo.oid = this.oid;
					orderInfo.num = this.num;
					orderInfo.areaNmae = this.areaNmae;
					orderInfo.tableName = this.tableName;
					orderInfo.status = this.isTableStatus;
					storage.session('orderInfo', orderInfo);
					storage.session('isWechatOrder', 1);
					storage.session('isSelectTable', 1);
					storage.session('isShowVipPrice', true);
					let {
						onlineStyle
					} = storage.session('login');
					let toRouter = (onlineStyle == '1') ? '/order' : '/latestOrder';
					this.$router.push(toRouter);
					// this.$router.push('/order');
				}
			}
		},
		async mounted() {

			orderData = await import( /* webpackChunkName:'order_data' */ 'src/module/order/data/order_data.js');
			orderData = orderData.default;

			//获取详情
			await orderHttp.getOpenId();
			this.shopName = storage.session('wechatShop').shopName;
			utils.setTitle(this.shopName);
			storage.session('shopInfo', {
				id: this.shopId
			});
			this.init();
		}
	};
</script>

<style lang='less' scoped>
	@import "../../../res/css/base.less";

	.container {

		width: 100%;
		height: 100%;
		position: relative;

		.head-tit,
		.search-head {
			width: 100%;
			height: 49px;
			line-height: 49px;
			padding: 0 10px;
			color: #705c5c;
			border-bottom: 1px solid #e5e5e5;
			overflow: hidden;
		}

		.head-tit {
			text-indent: 25px;
			font-size: 14px;
			background: url(../../../res/images/table-icon.png) 10px center no-repeat;
			background-size: 16px 16px;
		}

		.search-head {
			position: fixed;
			left: 0;
			top: 0;
			z-index: 99;
			background-color: #EFEFF4;
		}

		.more {
			background: url("../../../res/images/more.png") center center no-repeat;
			background-size: 8px 16px;
			;
		}

		.content,
		.search-content,
		.search-goods {
			background-color: #fff;
			padding-left: 10px;
			width: 100%;
			height: auto;
			margin-bottom: 70px;

			.content-box {
				width: 100%;
				height: 50px;
				line-height: 50px;
				border-bottom: 1px solid #e5e5e5;
				font-size: 0;

				&:last-child {
					border-bottom: none;
				}

				span:nth-child(1) {
					width: 20%;
					height: 100%;
					font-size: 12px;
					display: inline-block;
				}

				span:nth-child(2) {
					width: 60%;
					height: 100%;
					padding-left: 10px;
					color: #b2b2b2;
					font-size: 12px;
					display: inline-block;
				}

				span:nth-child(3) {
					font-size: 12px;
					width: 20%;
					height: 100%;
					display: inline-block;
				}

				input {
					border: none;
					outline: none;
					padding: 0;
					width: 80%;
					height: 100%;
					text-indent: 10px;
					float: left;
					font: 14px "arial rounded mt bold";

					&::-webkit-input-placeholder {
						font-size: 12px;
						color: #b2b2b2;
					}
				}
			}
		}

		.area-footer {
			padding: 0 10%;
			width: 100%;
			height: 50px;
			line-height: 50px;
			text-align: center;
			color: #fff;

			a {
				display: block;
				border-radius: 10px;
				outline: none;
				transition: 0.3s ease-in-out background-color;
				-webkit-transition: 0.3s ease-in-out background-color;
			}
		}

		.areaLayer {
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

			.areaList-head {
				width: 100%;
				height: 45px;
				background-color: #f2f2f2;

				span {
					display: block;
					width: 100%;
					height: 45px;
					line-height: 45px;
					text-align: center;
				}
			}

			.areaList-concent {

				width: 100%;
				height: 100%;
				line-height: 45px;
				overflow: scroll;
				-webkit-overflow-scrolling: touch;

				ul li {
					width: 100%;
					height: 45px;
					text-align: center;
					line-height: 45px;
					background-color: #fff;
					border-bottom: 1px solid #F0F0EE;

					&:last-child {
						border-bottom: none;
					}
				}
			}
		}

		.table-error {
			width: 100%;
			height: 40px;
			line-height: 40px;
			color: #fff;
			text-align: center;
			position: fixed;
			left: 0;
			top: 0;
		}
	}
</style>