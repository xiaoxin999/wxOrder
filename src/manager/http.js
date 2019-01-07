import Ajax from 'src/verdor/ajax';
import storage from 'src/verdor/storage';
import httpConfig from 'src/config/http_config';
import {
	store
} from 'src/manager/store';
import uploadfile from 'src/verdor/uploadfile';
import exportFile from 'src/verdor/exportFile';

//let model = {};

let http = {};

export let globalData = {
	format: 'json'
};

// if (Proxy != null) {          
//     http = new Proxy({}, {
//         get(target, key, receiver) {

//             let obj = httpConfig[key];
//             if (obj) {
//                 //单条请求
//                 return getOne(key, obj);
//             } else if (key === 'All') {
//                 //多条请求同时进行时
//                 // http.All([{httpId:'',data:{data:{ name:'123',phone:'2222' }}}])
//                 return getAll();
//             }
//             return Reflect.get(target, propKey, receiver);
//         }
//     })
// } else {
for (let str in httpConfig) {
	let obj = httpConfig[str];
	//分为file接口和ajax请求
	if (obj.type == 'file') {
		//下载文件
		http[str] = function(o = {}) {
			console.log(Object.assign(o, obj, {
				token: storage.session('token'),
				shopId: storage.session('shopId') || ''
			}));
			exportFile(Object.assign(o, obj, {
				token: storage.session('token'),
				shopId: storage.session('shopId') || ''
			}));
		};
	} else if (obj.type == 'upload') {
		//上传文件
		http[str] = async function(o = {}) {
			let data = null;
			try {
				data = await uploadfile.crosrouteroMain(Object.assign(obj, o, {
					shopId: storage.session('shopId') || ''
				}));
			} catch (e) {
				return Promise.reject(e);
			}

			return data;
		};
	} else {
		http[str] = getOne(str);
	}
}
http.All = getAll();

//统计接口的信息
let cacheArr = [];

function getOne(key, obj = null) {

	obj = obj || httpConfig[key];
	//第一参数是请求的参数
	//第二参数是请求者是否自己提供处理错误的方式
	return function(dataObj = {}, hasError = false, full = false) {

		globalData.token = storage.session('token') || 'token';

		let o = Object.create(null);
		for (let str in obj) {
			o[str] = obj[str];
		}

		Object.assign(o, dataObj, {
			globalData
		});
		//将资源缓存，需要配合后台一起做
		//              if(model[key]){
		//                  return Promise.resolve(model[key]);
		//              }
		store.dispatch('showLoad', true);
		return new Promise((resolve, reject) => {


			Ajax(o).then(json => {
				if (json.data !== undefined) {

					let temp = full ? json : json.data;
					let costTime = json.costTime;

					cacheArr.push({
						costTime,
						url: o.url
					});
					delete json.costTime;
					// console.log(cacheArr,'=====');
					resolve(temp);
					//                          model[key] = json.data;
				}
				if (json.error) {
					if (json.error.code + '' === '1002') {
						/* eslint-disable-next-line */
						global.router.push('/');
						return false;
					}!hasError && store.commit('setWin', {
						content: json.error.message || '接口报错了,请联系相关人员!'
					});
					hasError && reject({
						status: 200,
						error: json.error
					});
					console.log(json.error.message + '   **** ajax error: *** fail url in :' + obj.url);
				}
				store.dispatch('showLoad', false);
			}).catch(error => {
				hasError && reject({
					status: 500,
					error
				});
				!hasError && store.commit('setWin', {
					content: error.message || '接口报错了,请联系相关人员!'
				});
				console.log(JSON.stringify(error) + '  **** ajax error: *** fail url in :' + obj.url);
				store.dispatch('showLoad', false);
			});
		});
	};

}

function getAll() {

	return function(dataObj) {

		store.dispatch('showLoad', true);
		let queue = [];
		// globalData.token=storage.session('token') || 'token';
		dataObj.forEach(function(item) {
			let sourceObj = httpConfig[item.httpId];
			if (!sourceObj) throw new Error('httpId: ' + item.httpId + ',没有配置,请查看配置');
			Object.assign(sourceObj, {
				globalData
			}, item);
			queue.push(Ajax(sourceObj));

		});

		return new Promise((resolve, reject) => {
			Promise.all(queue).then(data => {
				resolve(data);
				store.dispatch('showLoad', false);
			}).catch(error => {
				reject(error);
				store.commit('setWin', {
					content: error.message
				});
				store.dispatch('showLoad', false);
			});
		});

	};

}

export default http;