import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);
//记录调用setLoad的次数
let num = 0;
//创建Store实例
let globalStore = {
	// 存储状态值
	state: {
		win: {
			show: false,
			title: '提示信息',
			content: '',
			type: 'alert',
			callback: '',
		},
		loadShow: false,
		//是否启用body和html的ovethide
		overHide: false,
		//商品列表数据是否可用
		goodlist: false,
		//区域列表数据是否可用
		otherlist: false,
		//库存数据是否可用
		inventory: false,
		//套餐页面是否可以使用
		parseOk: false,
		//侧边导航数据是否处理完成
		asideOk: false,
		//弹框的数量
		win_id: 0
	},
	// 状态值的改变方法,操作状态值
	// 提交mutations是更改Vuex状态的唯一方法
	mutations: {
		setWinId(state, obj) {
			state.win_id = obj;
		},
		setWin(state, obj) {
			state.win = obj;
			if (state.win.content) state.win.show = true;
		},
		setLoad(state, v) {
			state.loadShow = v;
		},
		setOverHide(state, v) {
			state.overHide = v;
		},
		setOrderState(state, v) {
			state[v.state] = v.value;
		},
		setParseOk(state, v) {
			state.parseOk = v;
		},
		setAsideOk(state, v) {
			state.asideOk = v;
		}
	},
	// 在store中定义getters（可以认为是store的计算属性）。Getters接收state作为其第一个函数
	getters: {

	},
	namespace:true,
	actions: {
		showLoad(context, str) {
			// context 是一个对象
			if(str){
				num++;
			}else{
				num--;
			}
			if(num<=0){
				num = 0;
				context.commit('setLoad', false);
			}else{
				context.commit('setLoad', true);
			}
				
		},
		asideOk(context, str) {
			setTimeout(() => {
				context.commit('setAsideOk', str);
			}, 100);
		}
	}
};

export default globalStore;

export let store = new Vuex.Store(globalStore);