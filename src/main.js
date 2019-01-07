
/* eslint-disable no-unused-vars*/
import '@babel/polyfill';
import Vue from 'vue';
import 'vuex';
import routerConfig from './config/routes';
import App from './app';
import VueRouter from 'vue-router';
import 'src/res/css/reset.css';
import 'src/res/css/layout.css';
import 'src/res/css/base.less';
import global from 'src/manager/global';
import {
	store
} from 'src/manager/store';
import flexible from 'src/verdor/flexible';
import http from 'src/manager/http';
import storage from 'src/verdor/storage';
import utils from 'src/verdor/utils';
import DataBase from 'src/verdor/database';
import InitState from 'src/initstate/main';
import 'src/manager/jweixin-1.2.0';

const zhanUlr = require('../src/res/images/zhanweifu-m.jpg');

if (module.hot) {
	
	module.hot.accept();
}


class Main {

	constructor() {
		
		let cdn = process.env.ASSET_PATH;

		try {
			//php环境中
			
			cdn = httpDomain.cdn + 'static/';
			global.isPhpEnv = true;
			
			global.host = httpDomain.host;
		} catch (e) {
			console.log('');
		}
		
		/* eslint-disable-next-line */
		__webpack_public_path__ = cdn;
		global.cdnUrl = cdn;
		let router = new VueRouter({
			routes: routerConfig
			// mode: 'history',
		});
		global.router = router;
		flexible();

		new InitState(Vue);

		//全局捕捉图片报错事件,加上默认图片
		document.addEventListener('error', function(e) {
			let elem = e.target;
			let name = elem.tagName.toLowerCase();
			if (name === 'img') {
				//应对下ios下富文本中的图片 第一次加载失败 尝试在加载一次
				elem.src = zhanUlr;
			} else if ((name === 'script' || name == 'link') && (elem.src || elem.href).indexOf(cdn) > -1) {

				//文件加载三次都没成功
				if (elem._load == 3) {
					let {
						name,
						openId,
						shopId
					} = storage.session('login');
					let obj = {
						fileName: (elem.src || elem.href),
						'user-agent': navigator.userAgent.toLowerCase(),
						name,
						shopId,
						openId
					};
					http.log({
						data: {
							logData: JSON.stringify(obj)
						}
					});

					store.commit('setWin', {
						content: '您的网络开小差了,请重试!'
					});
				}

			}

		}, true);

		//非开发的模式下上传错误日志
		
		if (process.env.NODE_ENV === 'production') {
			window.onerror = function(...arg) {
				let [msg, fileName, line, col, error] = arg;
				if (msg != 'Script error.' && fileName) {
					let {
						name,
						openId,
						shopId
					} = storage.session('login');
					let i = fileName.lastIndexOf('/');
					let obj = {
						msg,
						fileName: fileName.slice(i + 1),
						line,
						col,
						error,
						'user-agent': navigator.userAgent.toLowerCase(),
						name,
						shopId,
						openId
					};
					http.log({
						data: {
							logData: JSON.stringify(obj)
						}
					});
				}
				return true;
			};
		}

		Vue.config.errorHandler = function(err) {
			console.log(err);
		};

		//登录时请求token
		router.beforeEach((to, from, next) => {

			store.dispatch('showLoad', true);

			document.querySelector('#app').scrollTop = 0;

			if (this.checkLogin(next, to)) {
				store.commit('setWin', {
					show: false
				});
				next();
			}
		});

		router.afterEach(() => {
			store.dispatch('showLoad', false);
		});

		Vue.use(VueRouter);

		this.inital(router, store, App);

		if (process.env.NODE_ENV === 'development') {

			http.getTxt().then(function(txt){

				console.log(`%c${txt}`,`font-size: 32px;color: #fff;margin-top: 30px;text-align: center;text-shadow:2px 2px 4px #000;background:linear-gradient(#84fab0,#8fd3f4);font-family: 'Microsoft YaHei',arial,tahoma,sans-serif;padding:10px 15px;border-radius:8px`);
			});

		}
		
	}

	async inital(router, store, App) {
		await DataBase.createInstance();
		global.db = DataBase;
		new Vue({
			router,
			store,
			render: h => h(App)
		}).$mount('#app');
	}

	//读取token信息
	checkLogin(next, to) {

		let token = to.query.token;
		let userData = storage.session('token');
		if (userData || token) {
			if (token) storage.session('token', token);
			return true;
		}

		let shopId = utils.getQueryString('shopId');

		let data = {
			
			shopId: (process.env.NODE_ENV === 'production') ? (shopId || '') : (shopId || '10069'),
			from: window.navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? 0 : 2, // 2是支付宝 0 公众号 1小程序
			code: utils.getQueryString('code') || 'test',
			auth_code: utils.getQueryString('auth_code') || 'test', //支付宝用
			useSD:utils.getQueryString('useSD') || null
		};
		
		if (process.env.NODE_ENV === 'development') {
			Object.assign(data, {
				from: 0,
				openId: 'o-PJZwbBk4eTDX-rjUwIKV-AKV58'
			});
		}

		http.Login({
			data
		}).then((data) => {
			storage.session('token', data.accessToken);
			storage.session('login', data);
			storage.session('uploadPic', data.uploadPic);
			storage.session('code_used', true); //登录界面是否使用了code  只有在页面中调用PayUrl时才会用到
			next();
			store.dispatch('showLoad', false);
		});

	}

}

new Main();