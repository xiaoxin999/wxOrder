import storage from '../verdor/storage';
import utils from '../verdor/utils';

let global = {

	cdnUrl: '',
	isPhpEnv: false, //是否是php环境
	router: null,
	hour: 3600, // 1小时
	getShopId() {
		let shop = storage.session('select-shop');
		let shopInfo = storage.session('shopInfo'); // 点餐用的
		let memberInfo = storage.session('membership');
		let bespeak = storage.session('bespeak_shopInfo');

		return (shopInfo && shopInfo.id) || (shop && shop.id) || (memberInfo && memberInfo.member && memberInfo.member.shopId) || (bespeak && bespeak.id) || utils.getQueryString('shopId') || 10069;
	},

	getNormalShop(shopId, brandId, shopList) {
		let arr = shopList.filter((item) => {
			return item.id == shopId;
		});
		if (arr.length == 0 && shopId == brandId) {
			arr = shopList;
		}
		return arr;
	},
	getNearShop(shopId, shopList) {
		let arr = shopList.filter((item) => {
			if (item.id == shopId) {
				return item;
			} else if (item.brandId == shopId) {
				return item;
			}
		});

		if (arr.length == 0) {
			arr = shopList;
		}
		return arr;
	},
	//返回上一次循环的数据
	prevInfo:null,
	//获取这个人的基本信息 只供点单页面使用
	getBaseInfo(){
		
		let obj = null;
		if(this.prevInfo) return this.prevInfo;
		else{
			if (storage.session('wechatShop')) {
				obj = storage.session('wechatShop');
			} else{
				obj = storage.session('memberInfo');
			}

			let shopId = this.getShopId();
			//isAvail  电子会员在这家门店是否试用
			// discountType : 1 会员,2 会员日, 0 粉丝 , 3非粉丝非会员
			let discount = obj.discount || {};
			obj = {member:obj.member,isVipDay:discount.discountType == 2,isFans:discount.discountType == 0,discount:discount,shopId,isMember:!!obj.member,isAvail: obj.useShopIds !=undefined ? (obj.useShopIds == '' ? true : (obj.useShopIds.indexOf(shopId) > - 1 ? true : false)) : false};
		}
		
		setTimeout(function(){
			global.prevInfo = null;
		},0);
		return obj;
	},
	//多规格菜的保存
	//key(id):value:{minAvailPrice:0,obj:good};
	groupGood:{
		
	},
	//满减是否与会员价共享
	isMemberShare:true,
	//每个订单可以点的特价菜数量
	orderSpecicalNum:2,
	//只供点单页面有关使用
	//计算商品的优惠价(会员价或者粉丝价格)
	/*
		1.商品或者套餐的单个数据
		obj :{
			会员数据
			粉丝折扣
			会员可使用的门店
		}
		2.选择优惠券中的sharingStatus
		2018.12.4
	 */
	getAvailPrice(item,sharingStatus){
		let memberPrice = -1;
		let {member,discount,isMember,isAvail,isFans,isVipDay} = global.getBaseInfo();
		//该电子会员无法在这家用
		if(!(isMember && isAvail)){
			member = false;
			isFans = true;
		}
		
		//是粉丝或者会员并且菜是享受优惠的
		if ( ( member || isFans ) && item.isVip != '0') {
			
			item.isShowAvailPrice = true;
			//这个菜是享受vip价格的
			item.preferType = 'vip';
			if(member){
				//会员价的菜
				if(item.isVip == '1'){
					memberPrice = item.vipPrice;
				}else if(item.isVip ==  '2'){
					//会员折扣的菜
					memberPrice = (Number(item.price) * Number(member.level.discount / 100)).toFixed(2);
				}else{
					//当这个菜没有开启会员价和折扣
					item.isShowAvailPrice = false;
					item.preferType = null;
				}
				
			}
			else{

				//这个菜是享受fans价格的
				item.preferType = 'fans';
				//粉丝开启的享受会员折扣并且这个菜开启了会员折扣
				if( discount.isDiscount == '1' && item.isVip == '2'){
					memberPrice = (Number(item.price) * Number(discount.discount / 100)).toFixed(2);
				}else if(discount.isVipPrice == '1' && item.isVip == '1'){
					//粉丝开启了享受会员价的菜并且这个菜开启了会员价
					memberPrice = item.vipPrice;
				}else{
					//当粉丝配置不享受会员折扣和会员价的时候
					item.isShowAvailPrice = false;
					item.preferType = null;
				}
				
			}
		}
		
		
		//如果店铺开启满减活动 但是不与会员共享(不享受任何优惠会员价和粉丝价)
		if(this.isMemberShare == false || memberPrice == -1){
			item.isShowAvailPrice = false;
		}else{
			item.isShowAvailPrice = true;
		}

		//特价菜
		if(item.isSpecial == 1){
			item.isShowAvailPrice = true;
			//下个版本放开数量限制
			item.specialNum = 100;
			item.isSpecial = true;
			// memberPrice = item.specialPrice;
		}else{
			item.isSpecial = false;
			item.specialPrice = 0;
		}

		//如果可以显示优惠 并且是会员日 
		if(item.isShowAvailPrice && isVipDay){
			item.preferType = 'isVipDay';
		}

		//在使用优惠券的情况下该商品是否可以使用 优惠价  2,0 不可以 1可以
		//如果优惠券允许使用优惠价并且优惠价大于-1,则改商品允许使用优惠券,优先级要高于满减的不与会员价共享
		if( sharingStatus != undefined &&  sharingStatus != 1 ){
			item.isShowAvailPrice = false;
			item.num > 0 && (item.availPrice = item.num * item.price);
		}
		
		//如果是多规格菜,只有等到他的子菜计算时才知道具体的优惠价  而且是  **元起
		if( (item.isGroup > 0 || item.groupId > 0) && item.goodsName && (item.isShowAvailPrice) ){
			this.collectGroup(item);
		}

		//以后逻辑是为了在列表中显示使用 大小数字展示
		let ps = (item.price + '').split('.');
		let ms = (item.specialPrice + '').split('.');
		item.p = ps[0];
		item.r = ps[1];
		item.sp = ms[0];
		item.sr = ms[1] || 0;
		if(item.isSpecial){
			item.specDis = (item.specialPrice / item.price * 10).toFixed(1);
		}

		clearTimeout(this.groupTimer);
		this.groupTimer = setTimeout(()=>{
			this.parseGroup();
		});
		return item.memberPrice = Number(memberPrice);
	},
	groupTimer:'',
	parseGroup(){
		for(let str in this.groupGood){
			let item = this.groupGood[str];
			if( item.childObj.length > 0 && item.obj){
				item.obj.memberPrice = item.minAvailPrice = utils.sortByAll(item.childObj,'memberPrice')[0].memberPrice;
			}
		}
	},
	//收集商品列表中的子母菜
	collectGroup(item){
		//母菜
	
		let id = 0;
		let temp = null;
		let childObj = [];
		//母菜
		if(item.isGroup > 0){
			id = item.id;
			temp = item;
		}else if(item.groupId){
			//子菜
			id = item.groupId;
			childObj = [item];
		}
	
		if(!this.groupGood[id]){
			this.groupGood[id] = {
				obj:temp,
				minAvailPrice:0,
				childObj
			};
		}
		if(item.isGroup > 0){
			if(!this.groupGood[id].obj) this.groupGood[id].obj = item;
		}
		else if(item.groupId > 0){
			this.groupGood[id].childObj.push(item);
		}
	},
	//用以记录已经计算过的特价菜
	recordSpecialList:{},	
	countPrice(item,isAvail){
		let {num,price,memberPrice,attrPrice,specialPrice,specialNum} = item;
		let _sourcePrice = Number(price) + Number(attrPrice?attrPrice:0);
		let _memberPrice = Number(memberPrice) + Number(attrPrice?attrPrice:0);
		let _specialPrice = Number(specialPrice) + Number(attrPrice?attrPrice:0);

		if(isAvail){
			if(!item.isSpecial){
				return _memberPrice * num;
			}else{
				
				let p = utils.deepCopy(item);
				p.isSpecial = 0;
				p = this.getAvailPrice(p);
				p = p == -1 ? price : p;
				console.log(_specialPrice,specialNum,num - specialNum,p);
				return _specialPrice * specialNum + (num - specialNum) * p;
			}
		}else{
			return _sourcePrice * num;
		}
		
	},
	picObj: null,
	hashPic: {
		1: 'pic',
		2: 'picMiddle',
		3: 'picSmall'
	},
	win_id: 0,
	win_num: 0,
	//type 1 是大图 2是中等图 3 是小图
	getImgUrl({
		type = '1',
		url = ''
	} = {}) {
		if (url.indexOf('http') > -1) return url;
		!this.picObj && (this.picObj = storage.session('uploadPic'));
		return this.picObj[this.hashPic[type]].replace('{picName}', url);
	},

	//本地时的请求接口地址
	// 'host': 'http://zishi.ishandian.com.cn/weixin/',
	'host': 'http://wx.qa.ishandian.com.cn/weixin/',
	// 'host': 'http://wxpre.ishandian.net/weixin/',
	// 'host': 'https://wx.ishandian.net/weixin/',


	// 把textarea换行显示
	line2br(text) {
		return text.split('\n').join('<br/>');
	},

	/* 评价系统需要的 */
	evalObj: {
		oid: -1,
		type: -1
	}


};

export default global;

/* 支付收钱吧 */
export let SQB_WX = 27;
export let SQB_ALI = 28;