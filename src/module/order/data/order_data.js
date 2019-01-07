import orderHttp from './order_http';
import utils from 'src/verdor/utils';
import storage from 'src/verdor/storage';
import {
	store
} from 'src/manager/store';

import global from 'src/manager/global';
import http from 'src/manager/http';

let isloading = false;

const STRUCT_VERSION = '2018.12.26';//点餐保存在本地的数据版本

//下划线开头的变量的为老版本点餐使用的变量
class orderData {
	
	static packageList = [];
	static goodsList = {}
	static allGoodsObj = {} //所有的商品数据
	static packageGoods = {}
	static packageTag = {}
	static goodsAttrIndex = {}
	static groupGoodsObj = {}
	static others = {}
	static inventory = []
	static goods = []
	static navsList = {}
	static navsObj = {}
	static cidGoodsList = {}
	static cidPackageList = {}
	static classSortNum = [] //菜单下对应商品的数量,新点餐用
	static packagesNum = []
	static goodsLeast = []
	static showNavs = new Set() // 当前可使用(过滤后) 商品的分类的id
	static channelNavs = new Set() // 开启渠道后  商品对应的分类id
	static categoryObj = {}
	static isGetNavs = false
	static channelList = {}
	static isFilterChanne = false //是否开启对应的渠道
	static mustList = {
		glist: [], //商品
		plist: [], //套餐
		num: 0,
		gson: [],
		pson: []
	} //必点商品列表
	static currentChannel = 0 // 0为在线点餐，1为自助点餐，2为外卖，3为自提，4为快递
	static groupResetList = []; //当前在线点餐 结账页面 粉丝注册会员变为会员时  规格菜的会员价格重新计算的问题

	static _oGood = null; //详情中数据详情

	static async init() {
		// 初始化数据 
		if (isloading) return;

		let selectShopInfo = storage.session('select-shop');
		this.currentChannel = storage.session('selectPayWay') ? storage.session('selectPayWay').type : 0;

		store.commit('setParseOk', false);
		store.commit('setAsideOk', false);
		
		let channel = storage.session('channelType');

		if(channel && channel == 1 ) await this.getReduceActivity();

		if (selectShopInfo) {
			// await orderHttp.getOpenId(1, 'selectShop');
			await this.checkVersion();
		} else {
			await orderHttp.getOpenId();
			await this.checkVersion();
		}
		
	}
	//获取该店铺的满减活动
	static async getReduceActivity() {
		// 满减商品

		let res = await http.getReduceActivity({
			data: {
				shopId: global.getShopId(),
			}
		});

		let isMemberShare = res.isMemberShare;
		let isWholeShare = res.isWholeShare;
		store.commit('setCompel',res.isCompel);
		storage.session('isWholeShare', isWholeShare);
		storage.session('reduceActivity',res);

		global.isMemberShare = isMemberShare == undefined ? true : !!isMemberShare;
	}
	static reset() {
		this.navsList = [];
		this.goodsList = {};
		this.packageList = [];
		this.cidGoodsList = {};
		this.goodsLeast = [];
		this.groupResetList = [];
		this.isGetNavs = false;
		this.showNavs.clear();
		this.channelNavs.clear();

		this.packageTag = {};
		this.packageGoods = {};

		this.mustList = {
			glist: [], //商品
			plist: [], //套餐
			num: 0,
			gson: [],
			pson: []
		};
	}
	static async checkVersion() {
		// 切换店铺时清空
		this.reset();

		// 检查版本信息

		let data = await orderHttp.getVerCode();
		let shopId = global.getShopId();
		let version = await storage.localData('vercode_' + shopId);
		//存在本地的数据与 数据版本号 数据结构版本号 有关系
		let struct_str = `${STRUCT_VERSION}_${shopId}`;
		let struct_version = await storage.localData(struct_str);

		//需要加载的数组对象
		let needLoad = [];
		//需要处理的数据对象
		let parserObj = {};

		if (version && struct_version && struct_version == struct_str ) {

			//查看商品缓存
			if (version.goodsConfigVer !== data.goodsConfigVer) {
				needLoad.push('getGoodsList');
				
			} else {
				this.goodsList = await storage.localData('allGoodsObj_' + shopId);
			}

			//查看other套餐数据
			if (version.otherConfigVer !== data.otherConfigVer) {
				needLoad.push('getOtherList');
			} else {
				this.others = await storage.localData('otherList_' + shopId); // getOtherList数据
				if (this.others) {
					console.log('ok');
				} else needLoad.push('getOtherList');
			}

			needLoad.push('getInventoryList','getChannelList');

		} else {
			needLoad.push('getOtherList', 'getGoodsList', 'getInventoryList', 'getChannelList');
		}

		if(needLoad[0] == 'getInventoryList'){
			await this.parserOther(this.others);
		}


		//同步并行加载数据
		let loadPro = [];
		for (let item of needLoad) {
			loadPro.push(orderHttp[item]());
		}
		//把加载的状态改为true
		isloading = true;

		let loadData = await Promise.all(loadPro);

		for (let item of loadData) {
			let {
				type,
				data
			} = item;
			parserObj[type] = data;
		}
		
		if(needLoad.indexOf('getGoodsList') > -1 && needLoad.indexOf('getOtherList') == -1){
			parserObj['parserOther'] = this.others;
		}

		let funCall = ['parserChannelList', 'parserGood', 'parserOther', 'parserInventory'];
		


		//同步处理数据
		try {
			for (let item of funCall) {
				let obj = parserObj[item];
				if (obj) {
					await this[item](obj);
				}
			}
		} catch (e) {
			console.log(e);
			global.db.clearAll();
			store.commit('setWin',{content:'请刷新重试'});
			return;
		}
		
		//这两个有任意一个没解析都需要重新解析对应的memberPrice
		if(!parserObj['parserOther'] || !parserObj['parserGood']){
			this.resetMemberPrice();
		}

		//存储版本号
		storage.localData('vercode_' + shopId, data, false);
		storage.localData(struct_str,struct_str,false);
		store.commit('setParseOk', true);
		isloading = false;
	}
	//以下三个方法是解析 商品 库存 other数据
	static async parserGood(data) {

		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			item.sort = data[i].sort | 0;
			this.goodsList[item.id] = item; //将数据id以的形式存储
		}

		store.commit('setOrderState', {
			state: 'goodlist',
			value: true
		});
	}

	//点餐结算页面  粉丝注册为会员时重新计算  商品和套餐的会员价格
	static resetMemberPrice(){

		if(!this.goodsList.length) return;

		let list = this.goodsList.concat(this.packageList,this.groupResetList);
		for(let item of list){
			item.memberPrice = global.getAvailPrice(item);
		}

	}

	static async parserOther(data) {
		this.isGetNavs = true;
		this.goodsLeast = data.goodsLeast;
		// await storage.localData('goodsLeast_' + global.getShopId(), data.goodsLeast);

		this.others = data;

		// 计算分类下有多少商品
		let {
			goodsCategory,
			category
		} = this.others.categoryArr;
		let categoryGoods = goodsCategory || {}; // 记录那个商品在那个分类下

		// 获取分类数据
		for (let k = 0, len = category.length; k < len; k++) {
			let item = category[k];
			this.categoryObj[item.id] = item;
		}

		let cidGoodsList = [];
		let goodsList = Object.values(this.goodsList);
		goodsList = utils.sortByAll(goodsList, ['sort', 'id']);

		let list = {}; // 保存处理过的数据
		this.groupGoodsObj = {};
		let groupIndex = {}; // 记录多规格商品在分类下的下标



		for (let i = 0; i < goodsList.length; i++) {
			let item = goodsList[i];
			let objs = item;

			item.attr = this.getTasteList(item.id);
			item.isAttr = item.attr.length > 0;

			let cid = categoryGoods[item.id];
			item.num = 0;
			item.cid = cid;
			
			// let objs = {
			// 	'id': item.id,
			// 	'groupId': item.groupId,
			// 	'type': item.type,
			// 	'goodsName': item.goodsName,
			// 	'BC': item.BC,
			// 	'price': item.price,
			// 	'isVip': item.isVip,
			// 	'vipPrice': item.vipPrice,
			// 	'imageName': item.imageName,
			// 	'unit': item.unit,
			// 	'sort': item.sort,
			// 	'description': item.description,
			// 	'status': item.status,
			// 	'attr': item.attr,
			// 	'isAttr': item.isAttr,
			// 	'num': 0,
			// 	'isGroup': item.isGroup,
			// 	'cid': cid,
			// 	'isRecommend': item.isRecommend,
			// 	'isStock': item.isStock,
			// 	'isDiscount': item.isDiscount
			// };
			objs.memberPrice = global.getAvailPrice(item);

			if (this.delectGoods(item)) {
				list[item.id] = objs;

				if (cid) {
					// 如果该商品存在多个分类下
					for (let j = 0, len = cid.length; j < len; j++) {
						let id = cid[j];
						let cidList = cidGoodsList[id];
						if (cidList) {
							cidList.push(objs);
						} else {
							cidGoodsList[id] = [];
							cidGoodsList[id].push(objs);
						}

						// 多规格下标
						if (objs.isGroup == '1') {
							groupIndex[objs.id] = groupIndex[objs.id] || (groupIndex[objs.id] = []);
							groupIndex[objs.id].push(id);
						}

						// 显示的分类
						let pid = this.categoryObj[id] ? this.categoryObj[id].pid : ''; // 是否有父级分类
						if (pid && pid > 0) {
							this.showNavs.add(id);
							this.showNavs.add(pid);
						} else {
							this.showNavs.add(id);
						}
					}
				}
				
				//特价菜
				if(objs.isSpecial){
					if (!cidGoodsList['-5']) cidGoodsList['-5'] = [];
					cidGoodsList['-5'].push(objs);
					this.showNavs.add(-5);
				}
			} else {
				// 多规格菜品
				if (item.isGroup > 0 && !this.groupGoodsObj[item.id]) {
					this.groupGoodsObj[item.id] = [];
				} else {
					if (item.groupId > 0 && this.groupGoodsObj[item.groupId]) {
						this.groupGoodsObj[item.groupId].push(objs);
					} else {
						this.groupGoodsObj[item.groupId] = [];
						this.groupGoodsObj[item.groupId].push(objs);
					}
				}
			}


			this.goodsList[item.id] = objs;
		}

		this.allGoodsObj = utils.deepCopy(this.goodsList);
		await storage.localData('allGoodsObj_' + global.getShopId(), this.goodsList);
		this.cidGoodsList = cidGoodsList;
		// 计算出多规格壳子菜的价格
		for (let i in groupIndex) {
			let indexList = groupIndex[i];
			let groupList = this.groupGoodsObj[i];
			if (!groupList) continue;

			groupList = utils.sortByAll(groupList, 'price', true);
			for (let j = 0, len = indexList.length; j < len; j++) {
				let goods = this.cidGoodsList[indexList[j]];
				for (let k = 0, lens = goods.length; k < lens; k++) {
					if (goods[k].id.indexOf(i + '') != -1) {
						if (groupList.length > 0) {
							goods[k].price = groupList[0].price;
							this.groupResetList.push(goods);
							// 计算会员价格
							goods[k].memberPrice = global.getAvailPrice(goods[k]);
						}
						break;
					}
				}
			}
		}


		// 处理套餐数据
		if ( data && data.packageArr && data.packageArr.package) {
			let {
				packageTag,
				packageGoods
			} = data.packageArr;
			let packages = data.packageArr.package; // 后端接口字段使用了关键字package，因此不能使用析构赋值

			// 处理套餐标识

			for (let i = 0, len = packageTag.length; i < len; i++) {
				let item = packageTag[i];
				let objs = {
					'id': item.id,
					'packageId': item.packageId,
					'tagName': item.tagName,
					'totalNum': item.totalNum,

				};

				if (!this.packageTag[objs.packageId]) {
					this.packageTag[objs.packageId] = [];
				}

				this.packageTag[objs.packageId].push(objs);

			}

			// 处理标识下的商品
			for (let j = 0, len = packageGoods.length; j < len; j++) {
				let item = packageGoods[j];
				let goods = this.goodsList[item.gid];
				let objs = {
					'id': goods.id,
					'goodsName': goods.goodsName,
					'attr': goods.attr,
					'isAttr': goods.isAttr,
					'packageGoodsNum': item.packageGoodsNum,
					'packageTagId': item.packageTagId,
					'type': goods.type,
					'price': goods.price
				};

				if (!this.packageGoods[item.packageTagId]) {
					this.packageGoods[item.packageTagId] = [];
				}

				this.packageGoods[item.packageTagId].push(objs);
			}

			this.goodsList = list;

			let packageTypeClass = { // 分类下的数量,0为普通套餐，1为可选套餐
				0: 0,
				1: 0
			};
			for (let k = 0, len = packages.length; k < len; k++) {
				let item = packages[k];

				if (item) {
					let objs = {
						'id': item.id,
						'packageName': item.packageName,
						'BC': item.BC,
						'type': item.type,
						'price': item.price,
						'isVip': item.isVip,
						'vipPrice': item.vipPrice,
						'imageName': item.imageName,
						'sort': item.sort,
						'description': item.description,
						'status': item.status,
						'isDiscount':item.isDiscount,
						'num': 0
					};

					objs.memberPrice = global.getAvailPrice(objs);
					
					if (!this.delectGoods(objs)) {
						packages.splice(k, 1);
						k--;
					} else {

						//特价菜
						if(item.isSpecial){
							if (!this.cidGoodsList['-5']) this.cidGoodsList['-5'] = [];
							this.cidGoodsList['-5'].push(objs);
							this.showNavs.add(-5);
						}

						packageTypeClass[objs.type]++;
						this.packageList.push(objs);
							
						let id = objs.type == 1 ? '-2' : '-3';
						this.showNavs.add(id);
					}
				}
			}

			this.packagesNum.push(0, packageTypeClass[0], packageTypeClass[1]);

			
		}


		this.others = data;
		store.commit('setOrderState', {
			state: 'otherlist',
			value: true
		});
	}

	//处理侧边栏(分类的显示)
	static parseAside(data) {

		if (data && data.categoryArr && data.categoryArr.category) {
			let {
				category
			} = data.categoryArr;
			// let arr = [];
			category = utils.sortByAll(category, 'pid', true);
			this.navsList = {};
			for (let i = 0, len = category.length; i < len; i++) {
				let item = category[i];

				if (this.showNavs.has(item.id || item.pid)) {
					if (item.pid == '0') {
						item.child = [];
						this.navsList[item.id] = item;
					} else {
						let parents = this.navsList[item.pid];
						if (parents) {
							parents.child.push(item);
						}
					}
				}
			}

			this.navsList = utils.sortByAll(Object.values(this.navsList), ['sort', 'id'], true);


			//判断分类中是否有 -2 可选套餐 -3 固定套餐
			let obj = null;
			let h2 = this.showNavs.has('-2');
			let h3 = this.showNavs.has('-3');
			if (h2 || h3) {
				let child = [];
				if (h2) {
					child.push({
						'id': -2,
						'name': '可选套餐'
					});
				}
				if (h3) {
					child.push({
						'id': -3,
						'name': '固定套餐'
					});
				}
				obj = {
					'id': '-1',
					'name': '套餐',
					'pid': 255,
					child
				};
			}

			if (obj) {
				this.navsList.push(obj);
			}

			//必点
			let hasMust = false;
			if (this.isFilterChanne && this.mustList.num > 0 ) {
				this.navsList.unshift({
					'id': '-4',
					'name': '必选品',
					'pid': 256,
					child: []
				});
				hasMust = true;
			}
			
			//特价菜
			// if(this.showNavs.has(-5)){
			let tempObj = {
				'id': '-5',
				'name': '特价菜',
				'pid': 257,
				child: []
			};
			if(hasMust){
				this.navsList.splice(1,0,tempObj);
			}else{	
				this.navsList.unshift(tempObj);
			}
			// }
			store.commit('setAsideOk', true);
		}
	}
	//解析库存
	static async parserInventory(data) {

		
		this.inventory = data.inventory.list;

		for (let i = 0; i < this.inventory.length; i++) {
			let item = this.inventory[i]; // 库存数据
			if (item == null) {
				continue;
			}

			if (Array.isArray(this.goodsList)) {
				// 处理缓存数据的库存
				
				for (let j = 0; j < this.goodsList.length; j++) {
					let goods = this.goodsList[j];

					if (goods.id == item.gid) {
						goods.goodsNum = (item.goodsNum - 0);
						goods.goodsThreshold = item.goodsThreshold;
						goods.isWarn = item.isWarn;
					}
				}

			} else {
				// 非缓存数据
				let goods = this.goodsList[item.gid]; // 商品数据
				if (goods) {
					goods.goodsNum = (item.goodsNum - 0);
					goods.goodsThreshold = item.goodsThreshold;
					goods.isWarn = item.isWarn;
				}
			}
		}
	
		// 处理套餐多余数据
		let packages = await this.channel(this.packageList, 'packages'); // 多渠道开启则获取过滤后的套餐，未开启则获取全部套餐
		
		//在套餐分类加上套餐数据
		this.cidPackageList['-1'] = [];
		this.cidPackageList['-2'] = [];
		this.cidPackageList['-3'] = [];

		for (let i = 0; i < packages.length; i++) {
			let item = packages[i];
			//可选
			if (item.type == 1) {
				this.cidPackageList['-2'].push(item);
			} else if (item.type == 0) {
				this.cidPackageList['-3'].push(item);
			}
		}


		// 数据处理完成后进行排序
		this.packageList = (packages.length === 0) ? [] : utils.sortByAll(packages, ['sort', 'id'], true);
		// 将处理好的套餐数据放入data中，和getOtherList数据一并缓存
		this.others.packageTag = this.packageTag;
		this.others.packageGoods = this.packageGoods;
		this.others.packageList = this.packageList;
		
		// 多渠道开启获取过滤后的数据，未开启获取全部数据
		await this.channel(Object.values(this.goodsList), 'goods');

		if (this.isFilterChanne) {
			// 多渠道开启时使用channelNavs替代showNavs
			this.showNavs = this.channelNavs;
		}
		
		await this.parseAside(this.others);
		// 拆分分类下的商品数量
		let goodsList = [];
		this.classSortNum = [];
		for (let i = 0, len = this.navsList.length; i < len; i++) {
			let navs = this.navsList[i];

			//必选 以及普通商品 以及 特价菜
			if (navs.id > -1 || navs.id == -4 || navs.id == -5) {
				let item = this.cidGoodsList[navs.id];
				let arr = this.classSortNum[i] || [item ? item.length : 0];

				if (item) {
					item = utils.sortByAll(item, ['sort', 'id']);
					goodsList.push(...item);
				}

				if (navs.child.length) {

					for (let j = 0, lens = navs.child.length; j < lens; j++) {
						let childId = navs.child[j].id;
						let temp = this.cidGoodsList[childId];
						arr.push( temp ? temp.length : 0);

						if (temp) {
							temp = utils.sortByAll(temp, ['sort', 'id']);
							goodsList.push(...temp);
						}
					}

				}

				this.classSortNum.push(arr);
				
			} else {
				//对应的套餐分类下的数据
				console.log(navs.id);
			}
		}


		this.goodsList = goodsList;
		this.classSortNum.push(this.packagesNum);

		//将套餐分类  合并到分类中
		Object.assign(this.cidGoodsList, this.cidPackageList);

		store.commit('setOrderState', {
			state: 'inventory',
			value: true
		});

	}
	static getMustList(data) {
		this.isFilterChanne = Number(data.status) > 0;
		//必点商品数据解析
		if (this.isFilterChanne) {
			let {
				mustGids,
				mustSonGids,
				mustPids,
				mustSonPids,
				mustNum
			} = data;
			this.mustList.glist = mustGids.split(','); //商品
			this.mustList.plist = mustPids.split(','); //套餐
			this.mustList.num = mustNum;
			this.mustList.gson = mustSonGids.split(',');
			this.mustList.pson = mustSonPids.split(',');

		}
	}

	static async parserChannelList(data) {
		// 解析渠道商品和必点商品
		this.channelList = data;
		this.getMustList(data);
	}

	static getTasteList(gid) {
		let tasteInfo = []; //返回的信息
		if (this.others == null) return;
		if (this.others.radio == null) return;

		let {
			goodsAttr,
			goodsRadio
		} = this.others.radio; // 获取口味信息

		// 获取商品口味Id
		let attrIdList = goodsAttr[gid] || [];

		// 口味详情
		for (let i = 0; i < attrIdList.length; i++) {
			let item = attrIdList[i];
			let radio = goodsRadio[item];
			if(!radio) continue;
			let tasteObj = {};
			tasteObj.name = radio.name;

			if (radio.options) {
				let {
					options
				} = radio;
				let oparr = [];
				let reg = /([^:]*):([\d.]+)\|?/g;

				let num = 0;
				options.replace(reg, (...args) => {
					let obj = {};
					obj.name = args[1];
					obj.price = args[2];
					obj.id = radio.id;
					obj.attrStatu = false;
					// attr.options[`${obj.name}:${obj.price}`] = num;
					oparr[num++] = obj;
				});

				// tasteObj.attrObj = attrObj;
				tasteObj.options = oparr;
				tasteObj.attr = radio.attr;
				tasteObj.id = radio.id;
			}
			tasteInfo.push(tasteObj);
		}

		return tasteInfo;
	}
	static delectGoods(goods) {
		// 过滤的商品

		//未删除 下架
		if (goods.status + '' === '-1' || goods.status === '2') return false;
		//多规格
		if (goods.isGroup && goods.isGroup == 0 && goods.groupId && goods.groupId > 0) return false;
		//自定义菜
		if (goods.type == 2) return false;

		return true;
	}
	static channel(data, type) {
		// 过滤多渠道商品

		if (this.isFilterChanne) {
		
			if (typeof this.channelList.goodsIds !== 'string') {
				this.channelList.goodsIds = '';
			}
			if (typeof this.channelList.packageIds !== 'string') {
				this.channelList.packageIds = '';
			}

			let goodsIds = this.channelList.goodsIds.split(',');
			let packageIds = this.channelList.packageIds.split(',');
			if (type != 'goods') {
				this.showNavs.clear();
			} else {
				this.cidGoodsList = {};
			}

			let packagesNum = {
				'0': 0,
				'1': 0
			};

			// 筛选
			for (let i = 0, len = data.length; i < len; i++) {
				let item = data[i];
				if (item) {
					let operateObj = item.goodsName ? goodsIds : packageIds;
					let cid = item.goodsName ? item.cid || [] : [];

					if (operateObj.indexOf(item.id + '') == -1) {
						data.splice(i, 1);
						i--;
					} else {
						if (type == 'goods') {
							for (let j = 0, len = cid.length; j < len; j++) {
								let id = cid[j];

								// 显示的分类
								if (this.categoryObj[id]) {
									
									let pid = this.categoryObj[id].pid; // 是否有父级分类
									if (pid > 0) {
										this.channelNavs.add(id);
										this.channelNavs.add(pid);
									} else {
										this.channelNavs.add(id);
									}

									// 如果该商品存在多个分类下
									let cidList = this.cidGoodsList[id];
									if (cidList) {
										cidList.push(item);
									} else {
										this.cidGoodsList[id] = [];
										this.cidGoodsList[id].push(item);
									}
								}
							}
						} else {
							let id = item.type == '0' ? '-3' : '-2';
							this.channelNavs.add(id);
							this.channelNavs.add(-1);
							// 套餐数量
							packagesNum[item.type] = Number(packagesNum[item.type]) + 1;
							
						}

						if(item.isSpecial){
							this.channelNavs.add(-5);
							//特价菜
							if (!this.cidGoodsList['-5']) this.cidGoodsList['-5'] = [];
							this.cidGoodsList['-5'].push(item);
							
						}

						//必点商品
						if (!this.cidGoodsList['-4']) this.cidGoodsList['-4'] = [];
						let temp = null;
						if (type == 'goods' && this.mustList.glist.indexOf(item.id) > -1) {
							temp = item;
						} else if (type == 'packages' && this.mustList.plist.indexOf(item.id) > -1) {
							temp = item;
						}
						if (temp){
							//贴上必选标志
							temp.isMust = 1;
							this.cidGoodsList['-4'].push(temp);
						} 

					}
				}

			}

			if (type != 'goods') {
				this.packagesNum = [];
				this.packagesNum.push(0, packagesNum[0], packagesNum[1]);
		
			}


		}
		return data;
	}

	static getPackage(packages) {
		// 获取指定套餐数据

		packages.packageTag = this.packageTag[packages.id]; // 获取套餐标识
		for (let i = 0; i < packages.packageTag.length; i++) {
			// 获取标识下的商品
			let item = packages.packageTag[i];
			packages.packageTag[i].goods = this.packageGoods[item.id];
		}
		return packages;
	}
	static checkGoodsNum(goods) {
		// 检查库存状态

		if (goods.packageName) {
			return true;
		} else {
			if (goods.status == 1) {
				store.commit('setWin', {
					content: goods.goodsName + '已估清'
				});
				return false;
			}
			if (goods.isStock == 1 && goods.goodsNum == 0) {
				store.commit('setWin', {
					content: goods.goodsName + '已售完'
				});
				return false;
			}
			if (goods.isStock == 1 && goods.num > goods.goodsNum) {
				store.commit('setWin', {
					content: goods.goodsName + '库存不足'
				});
				return false;
			}
			return true;
		}
	}
	/**
	 * 转换数据格式提交后台
	 */
	static getCurrentTableUpdata(gl, pl) {
		let getAttr = function (arr) {
			let ret = {};
			for (let i = 0; i < arr.length; i++) {
				if (arr[i].attrStatu) {
					if (!ret[arr[i].id]) {
						ret[arr[i].id] = [arr[i].name + ':' + (arr[i].price ? arr[i].price : 0)];
					} else {
						ret[arr[i].id].push(arr[i].name + ':' + (arr[i].price ? arr[i].price : 0));
					}
				}
			}
			let attrs = [];
			for (let key in ret) {
				attrs.push({
					id: key,
					name: ret[key]
				});
			}
			return attrs;

		};
		let getAttrs = function (attrs) {
			let ret = [];
			if (attrs && attrs.length > 0) {
				for (let i = 0; i < attrs.length; i++) {
					ret = ret.concat(getAttr(attrs[i].options));
				}
			}
			return ret;
		};
		let getGoods = function (goods) {
			let ret = [];
			for (let i = 0; i < goods.length; i++) {
				let item = goods[i];
				let obj = {
					gid: item.id,
					num: item.num,
					name: item.goodsName,
					price: item.price,
					isGift: item.isGift || 0,
					waitNum: item.waitNum ? item.waitNum : 0,
					type: item.type,
					isVip: item.isVip,
					vipPrice: item.vipPrice,
					odid: item.odid,
					tagId: item.tagId
				};
				obj.attr = getAttrs(item.attr);
				ret.push(obj);

			}
			return ret;
		};

		let getPackageItemGoods = function (goods) {
			let ret = [];
			for (let i = 0; i < goods.length; i++) {
				let item = goods[i];
				let obj = {
					gid: item.id,
					num: item.num,
					name: item.goodsName,
					price: item.price,
					waitNum: item.waitNum ? item.waitNum : 0,
					type: item.type,
					odid: '',
					packageTagId: item.packageTagId
				};
				obj.attr = getAttrs(item.attr);
				ret.push(obj);
			}

			return ret;
		};

		let getPackageGoods = function (packageTag) {
			let ret = [];
			for (let i = 0; i < packageTag.length; i++) {
				let item = packageTag[i].goods;
				item.packageTagId = packageTag[i].id;
				let packageTagGoods = getPackageItemGoods(item);
				ret = ret.concat(packageTagGoods);
			}
			return ret;
		};

		let getPackages = function (packages) {
			let ret = [];
			for (let i = 0; i < packages.length; i++) {
				let item = packages[i];

				ret.push({
					packageId: item.id,
					packageName: item.packageName,
					price: item.price,
					isGift: item.isGift || 0,
					num: item.num,
					waitNum: item.waitNum ? item.waitNum : 0,
					odid: item.odid,
					goods: getPackageGoods(item.packageTag),
					tagId : item.tagId
				});
			}
			return ret;
		};

		let isSelfHelp = storage.session('select-shop');
		let tagList = storage.session('tagList') || [];

		let getTagObj = function(){
			if(isSelfHelp) {
				let allGoods = gl.concat(pl);
				let tagObj = {};
				let obj = {};
				for(let tag of tagList){
					tagObj[tag.tagId] = tag.tagName;
				}

				for(let i = 0,len = allGoods.length;i < len;i++){
					let item = allGoods[i];
					if(tagObj[item.tagId]){
						obj[item.tagId] = tagObj[item.tagId];
					}
				}

				return obj;
			}else{
				return '';
			}
		};

		let retObj = {
			goods: getGoods(gl),
			package: getPackages(pl),
			tagData: getTagObj()
		};

		return JSON.stringify(retObj);
	}


	//公用判断逻辑
	//检查必点商品
	//data 购物车中的数据
	//return  => true  =>false
	static checkMustList(data) {
		// debugger;
		//统计出购物车中必选的 商品和套餐的列表和数量
		if (!this.isFilterChanne) {
			return true;
		} else {
			if (data) {
				let mustNum = Number(this.mustList.num); //必点数量
				let sumNum = 0; //商品列表中是必点母菜的总量
				let flag = false; //是否包含必点子菜
				let obj = this.getSumNum(data);
				flag = obj['flag'];
				sumNum = obj['sumNum'];
				if (flag) {
					if (sumNum >= mustNum) {
						return true;
					} else {
						return false;
					}

				} else {
					return true;
				}
			}
		}
	}


	//检查必点商品
	//tagShopCar 购物车中多人下单的数据
	//return  => true  =>false
	static checkMustTagList(tagShopCar) {
		let flag = true;
		let multiOrderStatus = storage.session('selectPayWay').multiOrderStatus;
		//multiOrderStatus 多人下单开关 0关 1所有的菜品在一起判断必点 2每个篮子判断必点 
		if (multiOrderStatus == 0) {
			flag = true;
		} else if (multiOrderStatus == 1) {
			flag = this.getCheckMustNum(tagShopCar);
		} else if (multiOrderStatus == 2) {
			// for(let item of tagShopCar){
			// 	if (!this.checkMustList(item.tagList)) {
			// 		flag = false;
			// 	}
			// }
			tagShopCar.forEach(item => {
				if (!this.checkMustList(item.list)) {
					flag = false;
					// break;
				}
			});
		}
		return flag;
	}


	//多人必点 如果多个篮子中必点之和大于必点数量即校验通过
	//return  => true  =>false
	static getCheckMustNum(tagShopCar) {
		if (!this.isFilterChanne) {
			return true;
		} else {
			if (tagShopCar) {
				let mustNum = Number(this.mustList.num); //必点数量
				let sumNum = 0; //商品列表中是必点母菜的总量
				let flag = false; //是否包含必点子菜
				//如果说子菜为空字符串，说明所有的菜都是子菜
				tagShopCar.forEach(data => {
					let obj = this.getSumNum(data.list);
					if (obj['flag']) {
						flag = true;
						sumNum += obj['sumNum'];
					}
				});

				if (flag) { //如果多个篮子中有至少一个篮子包含必点菜，则需要校验数量之和是否大于必点数量
					if (sumNum >= mustNum) {
						return true;
					} else {
						return false;
					}

				} else {
					return true;
				}
			}
		}
	}


	//获取不满足必点商品数量的篮子提示信息，多个篮子不满足则拼接显示
	//return 提示内容
	static getContent(tagShopCar) {
		let msg = '';
		let mustNum = Number(this.mustList.num); //必点数量
		// tagShopCar.forEach(data => {
		// 	let sumNum = 0; //商品列表中是必点母菜的总量
		// 	let flag = false; //是否包含必点子菜
		// 	let obj = getSumNum(data.tagList);
		// 	flag = obj['flag'];
		// 	sumNum = obj['sumNum'];
		// 	if (flag && sumNum < mustNum) {
		// 		msg += data.tagName + ',还需' + (mustNum - sumNum) + '个必点商品; ';
		// 	}
		// });
		for (let data of tagShopCar) {
			let sumNum = 0; //商品列表中是必点母菜的总量
			let flag = false; //是否包含必点子菜
			let obj = this.getSumNum(data.list);
			flag = obj['flag'];
			sumNum = obj['sumNum'];
			if (flag && sumNum < mustNum) {
				msg += data.tagName + ',还需' + (mustNum - sumNum) + '个必点商品; ';
			}
		}
		return msg;
	}

	//公用方法 普通或者一个篮子中必点数量的校验
	//return json格式：flag为boolean类型 指篮子中是否包含必点菜，sumNum为篮子中必点菜数量
	static getSumNum(data) {
		// debugger;
		let mustGids = this.mustList.glist; //母菜必点id
		let mustPids = this.mustList.plist; //套餐母菜必点id
		let mustSonGids = this.mustList.gson; //子菜必点id
		let mustSonPids = this.mustList.pson; //套餐子菜必点id
		//let mustNum = this.mustList.num; //必点数量
		let sumNum = 0; //商品列表中是必点母菜的总量
		let flag = false; //是否包含必点子菜
		//如果说子菜为空字符串，说明所有的菜都是子菜。
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			if (item.goodsName) {
				if (mustGids.length>0 && (mustSonGids.toString() == '' || mustSonGids.indexOf(item.id) > -1)) {
					flag = true;
					break;
				}
			} else if (item.packageName) {
				if (mustPids.length>0 && (mustSonPids.toString() == '' || mustSonPids.indexOf(item.id) > -1)) {
					flag = true;
					break;
				}
			}
		}

		if (flag) {
			for (let i = 0; i < data.length; i++) {
				let item = data[i];
				if (item.goodsName) {
					if (mustGids.indexOf(item.id) > -1) {
						if (item.type == 1) {
							sumNum += 1;
						} else {
							sumNum += Number(item.num);
						}
					}
				} else if (item.packageName) {
					if (mustPids.indexOf(item.id) > -1) {
						sumNum += Number(item.num);
					}
				}
			}
		}

		let obj = {
			'sumNum': sumNum,
			'flag': flag
		};
		return obj;
	}
}

export default orderData;
