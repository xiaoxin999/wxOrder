/* eslint-disable */
import {
	store
} from "src/manager/store";
import utils from "src/verdor/utils";
import storage from "src/verdor/storage";
import global from "src/manager/global";


//记录这个的菜的特价的数量
let recordSpecialList = {};

function esGoods(state, objList) {
	// 比较商品口味是否相同
	let list = state[objList[0].operateObj];
	for(let obj of objList){
		let findOk = false;
		let temp = null;
		let index = 0;
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			let goods = obj.data;
			index = i;
			temp = item;
			if (obj.operateType == "complRemove") {
				if ((item.goodsName === goods.goodsName && item.id === goods.id) || item.num == 0) {
					list.splice(i, 1);
					break;
				}
			} else {
	
				let type = obj.operateType != "splice" ? 'add' : 'splice';
				
				
				if( item.goodsName === goods.goodsName && item.id === goods.id){
					//普通菜 没有口味或者id商品名相同合并 口味相同合并
					if(goods.type != "1"){
						if( goods.isAttr === false || item.attrInfo === goods.attrInfo ){
							item.num = (type == 'add') ? Number(item.num) + Number(goods.num) : Number(goods.num);
							findOk = true;
							break;
						}
					}else{
						// 处理斤两菜
						if(type == "splice"){
							item.num = goods.num;
							findOk = true;
							break;
						}
					}
				}else if(item.packageName && item.id === goods.id && item.packageKey === goods.packageKey){
					// 合并套餐
					item.num = (type == 'add') ? Number(item.num) + Number(goods.num) : goods.num;
					findOk = true;
					break;
				}
	
				
			}
	
		}

		if(findOk){
			if (temp.num == 0) list.splice(index, 1);
		}else{
			list.push(obj.data);
		}
	}
	
	return list;
	
}

//预计算特价菜 
// function preParseSpec(obj){
// 	let {data} = obj;
// 	//特价菜不允许在列表中直接删除
// 	//在购物车中删除的时候有两种可能
// 	// 1.增加 菜的特价和优惠价或者普通价状态 OK
// 	// 2.删除 
// 		// 1):菜的优惠价  OK
// 		// 2):菜的特价    
// 	let list = [obj];
// 	if(data.isSpecial){
// 		store.commit("setUseReduce", false);
// 		if(!recordSpecialList[data.goodsName ? 'gl' : 'pl'][data.id]){
// 			recordSpecialList[data.goodsName ? 'gl' : 'pl'][data.id] = {
// 				total:0,//当前这个菜拥有特价菜的总数量
// 				normal:0 // 没有口味的菜 特价菜数量 为了区分有口味菜的情况下 或者普通菜也用此
// 			};
// 		}
// 		let attrInfoHash = '';
// 		//如果这个菜是口味菜
// 		if(data.isAttr && data.attrInfo){
// 			attrInfoHash = utils.getHash(data.attrInfo);
// 		}
// 		let specTemp = recordSpecialList[data.goodsName ? 'gl' : 'pl'][data.id];
// 		let num = specTemp.total;

// 		//第一次添加这种特价菜
// 		if(num == 0){
// 			num = data.num;
// 			//第一次添加特价菜的数量就大于了 这个特价菜的限制数量
// 			if(num > data.specialNum){
// 				let copyData = utils.deepCopy(obj);
// 				copyData.data.num = num - data.specialNum;
// 				copyData.data.isSpecial = 0;

// 				data.num = data.specialNum;
// 				obj.operateType = 'splice';
// 				list =  [obj,copyData];
				
				
// 				if(attrInfoHash){
// 					specTemp.total = specTemp[attrInfoHash] = data.specialNum;
// 					specTemp.normal = 0;
// 				}else{
// 					specTemp.total = specTemp.normal = data.specialNum;
// 				}
// 			}else{
// 				if(attrInfoHash){
// 					specTemp.total = specTemp[attrInfoHash] = data.num;
// 				}else{
// 					specTemp.total = specTemp.normal = data.num;
// 				}
// 			}
// 			//如果点的是特价口味菜 则记录这个口味的数量

// 		}else{
// 			//已经添加过此种特价菜了 分两种情况
// 			// 加菜或者减菜
			
// 			//减菜
// 			if(obj.type == 'risk'){
// 				if(attrInfoHash){
// 					specTemp.total -= 1;
// 					specTemp[attrInfoHash] -= 1;
// 				}else{
// 					specTemp.total -= 1;
// 					specTemp.normal -= 1;
// 				}

// 				if(specTemp.total == 0){
// 					delete recordSpecialList[data.goodsName ? 'gl' : 'pl'][data.id];
// 					let gl = Object.keys(recordSpecialList['gl']);
// 					let pl = Object.keys(recordSpecialList['pl']);
// 					if(gl + pl == 0){
// 						this.commit('setUseReduce',true);
// 					}
// 				}
// 			}else{
// 				// 加菜
// 				// 1.添加后直接超过 限制
// 				// 2.添加还是未超过限制
// 				num += data.num;
// 				if(num > data.specialNum){

// 					specTemp.total = data.specialNum;
// 					let copyData = utils.deepCopy(obj);
// 					copyData.data.isSpecial = 0;
// 					if(attrInfoHash){

// 						//多余要当做非特价菜来处理
// 						copyData.data.num = data.num;

// 						specTemp[attrInfoHash] = num - specTemp.total;
// 						data.num = specTemp[attrInfoHash];//这个有口味菜的 能用的特价数量
// 						if(specTemp.normal > 0) list = [copyData];
// 						else {
// 							obj.operateType = 'splice';
// 							list = [obj,copyData]; 
// 						}
// 					}else{
						
// 						copyData.data.num = num - data.specialNum;
						
// 						list =  [obj,copyData];
// 						data.num = data.specialNum;
// 						if(specTemp.normal > 0) list = [copyData];
// 						else {
// 							obj.operateType = 'splice';
// 							list = [obj,copyData]; 
// 						}
// 						specTemp.normal = specTemp.specialNum;
// 					}

// 				}else{
					
// 					specTemp.total = data.num;
// 					if(attrInfoHash){
// 						specTemp[attrInfoHash] = data.num;
// 					}else{
// 						specTemp.normal = data.num;
// 					}
// 				}

// 			}
			
// 		}
// 	}
// 	return list;
// }

function eqTagGoods(state, list, obj) {
	let tempItem = null;
	let goods = obj.data;
	let ids = !!goods.goodsName - 0 + '_' + goods.id;

	let num = 0;
	for (let i in state.tagGoodsNum) {
		if (i != goods.tagId) {
			num += Number(state.tagGoodsNum[i][ids]) || 0;
		}
	}


	for (let i = 0, len = list.length; i < len; i++) {
		let item = list[i];

		if (item.packageName) {
			if (item.id === goods.id && item.packageKey === goods.packageKey) {
				// 合并套餐
				item.num = (obj.operateType != "splice") ? Number(item.num) + Number(goods.num) : Number(goods.num) - num;
				if (item.num == 0) list.splice(i, 1);
				tempItem = item;
				break;
			}
		} else {
			if (item.goodsName === goods.goodsName && item.id === goods.id && goods.isAttr === false && goods.type != "1") {
				// 没有口味，id商品名相同合并
				item.num = (obj.operateType != "splice") ? Number(item.num) + Number(goods.num) : Number(goods.num) - num;
				tempItem = item;
				if (item.num == 0) list.splice(i, 1);
				break;
			} else if (item.goodsName === goods.goodsName && item.id === goods.id && item.attrInfo === goods.attrInfo && goods.type != "1") {
				// 口味相同合并

				item.num = (obj.operateType != "splice") ? Number(item.num) + Number(goods.num) : Number(goods.num) - num;
				tempItem = item;
				if (item.num == 0) list.splice(i, 1);
				break;
			} else if (item.goodsName === goods.goodsName && item.id === goods.id && goods.type == "1" && obj.operateType == "splice") {
				// 处理斤两菜
				item.num = goods.num;
				tempItem = item;
				if (item.num == 0) list.splice(i, 1);
				break;
			}
		}

	}

	if (tempItem) {
		setNumPrice(state, tempItem);
		return list;
	}

	if (!state.tagShopObj[state.currentTagId]) {
		state.tagShopObj[state.currentTagId] = {
			'shopCarNum': 0,
			'shopCarPrice': 0,
			'tagNum': {}
		};
	}
	setNumPrice(state, goods);

	list.push(goods);
	return list;
}

function setNumPrice(state, obj) {
	// 设置价格和数量
	let attrPrice = obj.attrPrice || 0;

	let memberPrice = global.getAvailPrice(obj);
	let price = obj.isShowAvailPrice ? memberPrice : obj.price;

	if (obj.goodsName) {
		if (obj.type == '1') {
			state.tagShopObj[state.currentTagId].shopCarPrice += (Number(price) * Number(obj.num)) + Number(attrPrice);
		} else {
			state.tagShopObj[state.currentTagId].shopCarPrice += (Number(price) + Number(attrPrice)) * obj.num;
		}
	} else {
		// 套餐价格计算公式为：套餐价格 + 套餐数量
		state.tagShopObj[state.currentTagId].shopCarPrice += price * obj.num;
	}

	if (obj.goodsName && obj.type === '1') {
		// 斤两菜默认为一份
		state.tagShopObj[state.currentTagId].shopCarNum += 1;
	} else if (obj.goodsName) {

		state.tagShopObj[state.currentTagId].shopCarNum = state.tagShopObj[state.currentTagId].shopCarNum - (state.tagShopObj[state.currentTagId].tagNum[(!!obj.goodsName - 0) + '_' + obj.id] || 0);
		state.tagShopObj[state.currentTagId].shopCarNum += Number(obj.num);

	}


	// let num = state.tagShopObj[state.currentTagId].tagNum[(!!obj.goodsName - 0) + '_' + obj.id];
	// if(num){
	state.tagShopObj[state.currentTagId].tagNum[(!!obj.goodsName - 0) + '_' + obj.id] = Number(obj.num);
	// }else{
	//     state.tagShopObj[state.currentTagId].tagNum[(!!obj.goodsName - 0) + '_' + obj.id] = Number(obj.num);
	// }

}

//创建Store实例
let storeLocal = {
	// 存储状态值
	state: {
		shopCarNum: 0, // 购物车总数量
		shopCarPrice: 0, // 购物车总价格
		carGoodsList: [], // 购物车商品列表
		carPackageList: [], // 购物车套餐列表
		maxNum: 0, // 商品在购物车中的总数量
		shopCarObj: {}, // 加入购物车的商品，id为键，总数量为key
		groupObj: {}, // 多规格数据
		isMember: false, // 是否为会员
		memberDiscount: 0, // 会员折扣率
		openDeail: false, //打开列表中的详情
		openPackageDeail: false, //打开套餐列表中的口味详情
		title: "",
		goodsDetail: {}, //详情数据
		goodsLeave: [],
		isOverflow: false,
		mustStatus: 0,
		currentTagId: 1, // 多人点餐使用的口袋id，默认为1
		tagIndexObj: storage.session('tagIndexObj') || {}, // 口袋下标
		tagList: storage.session('tagList') || [], // 多人点餐数据，多口袋数据
		isManyOrder: false, // 是否开启多人点餐
		tagShopObj: storage.session('tagShopObj') || {}, // 记录每个口袋的价格和数量
		isFans: false, //是否是粉丝
		discount: {}, //折扣的配置
		disCountPrice: 0, //总优惠金额
		undisCountPrice: 0, //没参与优惠金额
		isCompel:0,//满减活动是否是强制减免
		canUseReduce:true //是否可以使用满减 供特价菜使用，使用特价菜之后无法使用满减
	},
	// 状态值的改变方法,操作状态值
	// 提交mutations是更改Vuex状态的唯一方法
	mutations: {
		setUseReduce(state,val){
			state.canUseReduce = val;
		},
		setCompel(state,val){
			state.isCompel = val;
		},
		setFans(state) {
			let member = null;
			let discount = state.discount = null;
			if (storage.session('wechatShop')) {
				member = storage.session('wechatShop').member;
				discount = state.discount = storage.session('wechatShop').discount;
			} else {
				member = storage.session('memberInfo').member;
				discount = state.discount = storage.session('memberInfo').discount;
			}

			state.isFans = !member && discount;
			state.memberDiscount = Number((discount ?.discount) || 100) / 100;
		},
		setMustAdd(state) {
			state.mustStatus += 1;
		},
		setTitle(state, data) {
			state.title = data;
		},
		setManyOrder(state, v) {
			state.isManyOrder = v;
		},
		//设置商品和套餐列表
		setList(state, obj) {
			state[obj.type] = obj.data;
		},
		setOpenDeail(state, bol) {
			state.openDeail = bol;
		},
		setGoodsDetail(state, obj) { //详情数据
			state.goodsDetail = obj;
		},
		setOpenPackageDeail(state, bol) {
			state.openPackageDeail = bol;
		},
		goodsLeave(state, obj) {
			state.goodsLeave = obj;

		},
		setOverflow(state, v) {
			state.isOverflow = v;
		},
		async setCarList(state, obj) {
			// 设置购物车列表

			/**
			 * @param {Object} obj
			 * @param {Object} obj.data // 操作数据
			 * @param {String} obj.operateObj // 操作对象, carGoodsList或carPackageList
			 * @param {String} obj.sourceObj // 原始数据,上面的data 是复制的后的数据
			 */
			let operateObj = obj.operateObj;
			let data = obj.data;
			console.log(obj,'insert shopping');
			
			if (state.isManyOrder) {
				// 设置多人点餐数据
				data.tagId = state.currentTagId;
				this.commit('setTagCar', obj);
			}
			// let preObj = preParseSpec(obj);
			state[operateObj] = esGoods(state, [obj]); // 处理商品加减

			// parseSpecial(state);

			// 获取总价格，总数量，下标
			this.commit("getCarMaxNum", obj);

			if (data.groupId > 0) {
				// groupId为壳子菜id
				if (!state.groupObj[data.groupId]) {
					state.groupObj[data.groupId] = {
						['1_' + data.id]: state.maxNum
					}
				} else {
					state.groupObj[data.groupId]['1_' + data.id] = state.maxNum;
				}

				// 起售商品多规格子菜数量
				state.shopCarObj['1_' + data.id] = state.maxNum;
			}

			let gid = (data.groupId > 0) ? data.groupId : data.id; // 该商品为规格菜则使用壳子菜id，否则使用商品id
			let groupArr = Object.values(state.groupObj[data.groupId] || []) || []; // 当前壳子菜包含总数量
			let doSums = (arr, currentValue) => arr + currentValue;
			state.maxNum = (data.groupId > 0) ? groupArr.reduce(doSums) : Number(state.maxNum)

			// 商品和套餐，防止套餐和商品id重复,前缀为1商品，否则为套餐
			state.shopCarObj[(!!data.goodsName - 0) + '_' + gid] = state.maxNum;
			state.shopCarObj = utils.deepCopy(state.shopCarObj);

			this.commit('setCache');

		},
		setCache(state) {

			//将订单数据缓存到本地
			let cache = {
				gl: state.carGoodsList,
				pl: state.carPackageList,
				num: state.shopCarObj,
				t: Date.now()
			}
			storage.localData(`order_cache_${global.getShopId()}`, cache);
		},
		setTagCar(state, obj) {
			// 设置口袋商品
			let index = state.tagIndexObj[state.currentTagId];
			let currentTag = state.tagList[index];

			if (currentTag) {
				// 当前口袋已存在
				currentTag.list = eqTagGoods(state, currentTag.list, obj);
			} else {

				// 没有口袋
				let len = state.tagList.length;
				let currentTag = state.tagList[len] = {
					'tagName': `${len + 1}号购物车`,
					'tagId': state.currentTagId,
					'list': []
				}

				if (Array.isArray(obj)) {
					currentTag.list = obj;
					state.tagShopObj[state.currentTagId] = {
						'shopCarNum': 0,
						'shopCarPrice': 0,
						'tagNum': {}
					};

					for (let i = 0, len = obj.length; i < len; i++) {
						let item = obj[i];
						item.tagId = state.currentTagId;
						setNumPrice(state, item);
					}
				} else {
					obj.data.tagId = state.currentTagId;
					currentTag.list.push(obj.data);
					state.tagShopObj[state.currentTagId] = {
						'shopCarNum': 0,
						'shopCarPrice': 0,
						'tagNum': {}
					};
					setNumPrice(state, obj.data);
				}

				// currentTagId为键，len为value = 下标。
				state.tagIndexObj[state.currentTagId] = len;
			}
		},
		setTag(state, obj) {
			// 设置新口袋
			let {
				tagName,
				id,
				index
			} = obj;
			let len = state.tagList.length;

			if (obj.type == 'add') {
				state.currentTagId = state.currentTagId + 1;
				state.tagList[len] = {
					'tagName': `${len + 1}号购物车`,
					'tagId': state.currentTagId,
					'list': []
				};
				state.tagIndexObj[state.currentTagId] = len;
			} else if (obj.type == 'edit') {
				state.tagList[index].tagName = tagName;
			} else if (obj.type == 'del') {
				state.tagList.splice(index, 1);
				delete state.tagIndexObj[id];
				delete state.tagShopObj[id];

				if (state.tagList.length === 0) {
					state.currentTagId = 1;
					this.commit("resetShopCar");

				}

				// 重写下标
				state.tagShopCar = {};
				for (let k = 0, len = state.tagList.length; k < len; k++) {
					state.tagShopCar[state.tagList[k].tagId] = k;
				}
			}
		},
		async setTagId(state, id) {
			state.currentTagId = id;

			let TagObj = state.tagShopObj[state.currentTagId] || {};
			let index = state.tagIndexObj[state.currentTagId];
			let tag = state.tagList[index];

			if (state.isManyOrder) {
				// 如果开启了多人订餐
				state.shopCarNum = TagObj.shopCarNum || 0;
				state.shopCarPrice = Number(TagObj.shopCarPrice) || 0;
				state.shopCarObj = TagObj.tagNum || {};
				let goods = [],
					packages = [];

				if (tag && tag.list && tag.list.length) {
					for (let item of tag.list) {
						if (item.goodsName) {
							goods.push(item);
						} else {
							packages.push(item);
						}
					}
				}
				state.carGoodsList = goods;
				state.carPackageList = packages;
				storage.localData(`order_cache_${global.getShopId()}`, null);
			}
		},
		getCache(state, obj) {
			// 将缓存商品加入购物车

			let {
				gl,
				pl,
				num
			} = obj;
			state.carGoodsList = gl;
			state.carPackageList = pl;
			state.shopCarObj = num;

			pl.concat(gl).forEach(element => {
				element.memberPrice = global.getAvailPrice(element);
			});
			this.commit("getCarMaxNum");
		},
		resetShopCar(state) {
			/**
			 * 重置购物车
			 */

			storage.localData(`order_cache_${global.getShopId()}`, null);
			state.shopCarObj = {};
			state.groupObj = {};
			state.shopCarPrice = 0;
			state.disCountPrice = 0;
			state.undisCountPrice = 0;
			state.shopCarNum = 0;
			state.maxNum = 0;
			state.carGoodsList = [];
			state.carPackageList = [];
			state.goodsDetail = {};
			state.tagList = [];
			state.tagShopCar = {};
			state.tagGoodsNum = {};
			state.currentTagId = 1;
			state.canUseReduce = true;
			recordSpecialList = {};

		},
		setMemberInfo(state, obj) {
			// 设置会员信息
			state.isMember = obj.isMember;
			state.memberDiscount = obj.memberDiscount;
			this.commit("setFans");
		},
		getCarMaxNum(state, obj = {
			data: {
				id: -100
			}
		}) {
			// 获取购物车商品总数量
			/**
			 * @param {Object} obj // 同setCarList
			 */
			this.commit('setUseReduce',true);
			recordSpecialList = {};
			let list = state.carGoodsList.concat(state.carPackageList); // 商品和套餐合并数据
			let id = obj.data.id; // 商品id或套餐id
			let maxNum = 0; // 该商品在购物车中的总数量
			let shopCarNum = 0; // 购物车商品总数量
			let shopCarPrice = 0; // 购物车商品总价
			let disCountPrice = 0;
			let undisCountPrice = 0;
			for (let i = 0; i < list.length; i++) {
				let item = list[i];

				if (item.goodsName && obj.data.goodsName && item.id === id) {
					maxNum += Number(item.num);
				} else if (item.packageName && obj.data.packageName && item.id === id) {
					maxNum += Number(item.num);
				}

				if (item.goodsName && item.type === '1') {
					// 斤两菜默认为一份
					shopCarNum += 1;
				} else if (item.goodsName) {
					shopCarNum += Number(item.num);
				}


				let memberPrice = global.getAvailPrice(item);
				let price = item.isShowAvailPrice ? memberPrice : item.price;
				let specialPrice = item.isSpecial ? Number(item.specialPrice) : 0;
				let sourcePrice = item.price;

				let keyHash = utils.getHash( (item.goodsName || item.packageName) + item.id + (item.goodsName ? item.attrInfo : '') );

				if (item.goodsName) {
					// 商品价格计算公式为：商品价格 * 商品数量 + 商品口味总价格
					// 会员价计算公式为：isVip为1，取vipPrice，isVip为2：price * memberDiscount  isCompel 是否强制减免
					let attrPrice = item.attrPrice || 0;
					let sp = ((Number(sourcePrice) + Number(attrPrice)) * Number(item.num));//原价
					let avp = ((Number(price) + Number(attrPrice)) * Number(item.num)) ;//优惠价
					if (item.type == '1') {
						sp = (Number(sourcePrice) * Number(item.num)) + Number(attrPrice);
						avp = (Number(price) * Number(item.num)) + Number(attrPrice);
						// shopCarPrice += avp;
						// if (item.isDiscount == 1) {
						// 	disCountPrice += avp;
						// } else if (item.isDiscount == 0) {
						// 	undisCountPrice += avp;
						// }
						
					} 
					// else {

						//特价菜
						if(item.isSpecial){

							
							
							//计算出这个菜还剩多少个特价状态可以用
							if(!recordSpecialList[keyHash]) recordSpecialList[keyHash] = 0;
							let surpNum = item.specialNum - ( recordSpecialList[keyHash]|| 0 );

							if( surpNum > 0){
								if(item.num > surpNum){
									
									avp = ( Number(specialPrice) + Number(attrPrice)) * surpNum + (item.num - surpNum) * ( price + Number(attrPrice));
									recordSpecialList[keyHash] = item.specialNum;
								}else{
									avp = (Number(attrPrice) + Number(specialPrice)) * item.num;
									recordSpecialList[keyHash] += Number(item.num);
								}
							}else{
								avp = (Number(attrPrice) + Number(price)) * item.num;
								recordSpecialList[keyHash] = item.specialNum;
							}
							this.commit('setUseReduce',false);
						}
						shopCarPrice += avp;
						if (item.isDiscount == 1) {
							disCountPrice += avp;
						} else if (item.isDiscount == 0) {
							undisCountPrice += avp;
						}

					// }
					item.sourcePrice = sp;
					item.availPrice = avp;
				}

				if (item.packageName) {
					shopCarNum += Number(item.num);
					// 套餐价格计算公式为：套餐价格 + 套餐数量
					let avp = Number(price * item.num);//优惠价
					shopCarPrice += avp;

					//特价菜
					if(item.isSpecial){

						if(item.num > item.specialNum){
							avp = specialPrice * item.specialNum + (item.num - item.specialNum) * price;
						}else{
							avp = specialPrice * item.num;
						}
						this.commit('setUseReduce',false);
					}

					item.sourcePrice = Number(sourcePrice * item.num);
					item.availPrice = avp;
				}

				//原始价格
				// item.sourcePrice = global.countPrice(item,false);
				//优惠价
				// item.availPrice = global.countPrice(item,true);
				//直接从缓存中设置特价菜
				// if(item.isSpecial && obj.data.id == -100){
					// let type = item.goodsName ? 'carGoodsList' :'carPackageList';
					// if(!recordSpecialList[type][item.id]) recordSpecialList[type][item.id] = 0;
					// recordSpecialList[type][item.id] = recordSpecialList[type][item.id] + item.num
				// }
			}

			state.maxNum = maxNum;
			state.shopCarNum = Number(shopCarNum);
			state.shopCarPrice = Number(shopCarPrice).toFixed(2); // 价格保留2位小数
			state.disCountPrice = Number(disCountPrice);
			state.undisCountPrice = Number(undisCountPrice);

			
		}
	},
	// 在store中定义getters（可以认为是store的计算属性）。Getters接收state作为其第一个函数
	getters: {

	},
	namespace: true
	// actions: {
	//     global ({ state, commit, rootState }) {
	//             // if ((state.count + rootState.count) % 2 === 1) {
	//             //     commit('increment')
	//             // }
	//             commit("setWin",{title:"sss",content:"sssss"});
	//     }
	// }
}

store.registerModule('order', storeLocal);
export default store;