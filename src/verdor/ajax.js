import utils from 'src/verdor/utils';

/**
 * @description ajax请求
 * @function ajax
 * @param {Object} obj 一个对象
 * @param {Object} obj.data ajax请求中附加的数据
 * @param {String} obj.url 请求地址  支持多域
 * @param {String} obj.method 请求方式
 * @param {Function} obj.success 请求成功时的回调
 * @param {Function} obj.error 请求失败时的回调
 * @param {Boolean} obj.async 是否异步 
 * @param {String} obj.type 数据类型 json text script
 * @param {Array} obj.ajaxId 获取ajax的唯一id
 * @param {int} obj.timeout 多少毫秒之后自动取消
 * @example
	let ajaxId = [];//可以获取当前这个ajax的引用,供后期取消使用
	let obj = {
		url: 'http://60.205.222.103:3000',
		method: 'get',
		type: 'json',
		id:ajaxId
	}
	let p = ajax(obj);

	p.then(function(obj) {
			console.log(obj);
		})['catch'](function(e) {
			console.log(e);
		})
 * @returns {Promise}
 * @constructor
 */

let accepts = {
	xml: 'application/xml, text/xml',
	html: 'text/html',
	script: 'text/javascript, application/javascript',
	json: 'application/json, text/javascript',
	text: 'text/plain',
	_default: ''
};

function ajax(params) {

	return new Promise(function(resolve, reject) {
		let obj = utils.deepCopy(params);
		ajax.checkCrossDomain(obj.url);
		let xhr = ajax.createajax();
		let url = obj.url;

		let method = obj.method || 'get';
		let timeout = obj.timeout || 10000;
		let async = typeof obj.async == 'undefined' ? true : obj.async;
		let type = obj.type || 'json';
		let id = 'a_' + ajax.id++;
		let globalData = Object.assign(obj.globalData || {}, {
			format: 'json'
		});
		ajax.loadQueue[id] = xhr;
		xhr._obj = obj;
		obj.costTime = Date.now(); //请求消耗时间
		obj.promise = [resolve,reject];
		//回调出ajax的id

		if (obj.id != undefined) {
			if (ajax.isArray(obj.id)) {
				obj.id.push(id);
			}
		} else {
			obj.id = id;
		}

		url += '?' + ajax.paramsajaxData(globalData);
		//解析参数
		if (method === 'get' && obj.data) {
			let pd = ajax.paramsajaxData(obj.data);
			if (pd != '') {
				if (url.indexOf('?') > 0) {
					url += '&' + ajax.paramsajaxData(obj.data);
				} else {
					url += '?' + ajax.paramsajaxData(obj.data);
				}
			}
		}
		if (url.indexOf('?') > 0) url += '&r=' + Math.random();
		else url += '?r=' + Math.random();


		//xhr2和XDomainRequest
		if ('onload' in xhr && async) {
			xhr.onload = function() {
				parseData(xhr.responseText);
			};
			xhr.onerror = function() {
				destroyed({
					message: '请求出错,请稍后再试!'
				});
			};
		} else {

			if (ajax.xDomain && !async) throw new Error('IE9及以下使用XDomainRequest请求时,响应方式不能是同步!');

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {

					if (xhr.status == 200) {
						parseData(xhr.responseText);
					} else {
						destroyed({
							message: '请求出错',
							code: xhr.status
						});
					}

				}

			};
		}

		function destroyed(data) {
			data && reject(data);
			ajax.removeStatus(id);
			obj.timer && clearTimeout(obj.timer);
		}

		function parseData(str) {

			if (type == 'json') {
				try {
					let o = JSON.parse(str);
					o.costTime = Date.now() - obj.costTime;
					resolve(o);
				} catch (e) {
					reject({
						message: 'json解析失败'
					});
				}

			} else if (type == 'text') {
				resolve({
					data: str
				});
			} else if (type == 'script') {
				ajax.DOMEval(str);
				resolve(str);
			}
			destroyed();
		}

		//到时间后取消请求
		if (timeout && timeout > 0) {
			//注意此事件不能用在加载文件的接口中
			// xhr.timeout = timeout;
			// xhr.ontimeout = function(event){
			//     reject('请求超时,已经取消');
			//     ajax.removeStatus(id);
			// }

			obj.timer = setTimeout(function() {

				reject({
					message: '请求超时,已经取消'
				});
				ajax.stop(id);
				ajax.removeStatus(id);


			}, timeout);

		}

		//发送请求
		let sendPam = [method, url, async];
		xhr.open.apply(xhr, ajax.xDomain ? sendPam : sendPam.slice(0, 2));
		!ajax.xDomain && xhr.setRequestHeader('Accept', accepts[type] || '/');

		if (method === 'post') {

			!ajax.xDomain && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(ajax.paramsajaxData(obj.data));

		} else {
			xhr.send(null);
		}

	});

}
/**
 * @description 执行js
 * @function isArray
 * @memberof ajax
 * @param {Object} obj 需要判断的对象
 * @returns {Boolean}
 */
ajax.DOMEval = function(code) {

	code = utils.trim(code);
	if (!utils.NotIE8) {
		// ( window.execScript || function( data ) {
		//     window[ 'eval' ].call( window, data );
		// } )( code );
		(new Function(code))(code);
	} else {
		let script = document.createElement('script');
		script.text = code;
		document.head.appendChild(script).parentNode.removeChild(script);
	}

};
/**
 * @description 移除当前ajax的状态
 * @function isArray
 * @memberof ajax
 * @param {Object} obj 需要判断的对象
 * @returns {Boolean}
 */
ajax.removeStatus = function(id) {
	ajax.loadQueue[id] = null;
	delete ajax.loadQueue[id];
};
/**
 * @description 判断目标是否是数组
 * @function isArray
 * @memberof ajax
 * @param {Object} obj 需要判断的对象
 * @returns {Boolean}
 */
ajax.isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};
/**
 * @description 移除还在加载的ajax对象
 * @function stop
 * @memberof ajax
 */
ajax.stop = function(id) {

	ajax.loadQueue[id].abort();
	ajax.loadQueue[id]._obj.promise[1]({message:'已经主动取消'});
	ajax.loadQueue[id] = null;
	delete ajax.loadQueue[id];
};

/**
 * @description 判断是否存在需要移除的对象
 * @function abortLoad
 * @param {Array} obj 可以是数组也可以是字符串
 * @memberof ajax
 * @example
 * ajax.abortLoad(ajaxId);
 */
ajax.abortLoad = function(obj) {
	//数组
	if (this.isArray(obj)) {
		let i = 0;
		for (; i < obj.length; i++) {
			let id = obj[i];
			ajax.loadQueue[id] && (ajax.stop(id));
		}
		obj.length = 0;
	} else if (typeof obj == 'string') {
		ajax.loadQueue[obj] && (ajax.stop(obj));
	}
};
/**
 * @description ajax累加器
 * @type {Number}
 * @let id
 * @memberof ajax
 */
ajax.id = 0;
/**
 * @description 当前正在加载的ajax队列,供取消时使用
 * @type {Object}
 * @let loadQueue
 * @memberof ajax
 */
ajax.loadQueue = {};
/**
 * @description ajax存储对象
 * @type {Array}
 * @let cacheajax
 * @memberof ajax
 */
ajax.cacheajax = [];
/**
 * @description 解析ajax发送的数据
 * @function ajax
 * @param {Object} data 一个对象
 * @returns {String} 加工之后可以用的字符串
 * @memberof ajax
 */
ajax.paramsajaxData = function(data) {
	if (!data) return '';
	let arr = [];
	for (let str in data) {
		arr.push(encodeURIComponent(str) + '=' + encodeURIComponent(typeof(data[str]) == 'object' ? JSON.stringify(data[str]) : data[str]));
	}
	return arr.join('&');
};
/**
 * @description 创建ajax  
 * @function createajax
 * @memberof ajax
 */
ajax.createajax = function() {
	let i = 0;
	for (; i < ajax.cacheajax.length; i++) {
		if (ajax.cacheajax[i].readyState == 0 || ajax.cacheajax[i].readyState == 4) {
			return ajax.cacheajax[i];
		}
	}
	let xmlhttp = new XMLHttpRequest();
	//如果浏览器不支持CORS并且是跨域请求时 IE9-
	//XDomainRequest不支持cookie的上传
	if (!('withCredentials' in xmlhttp) && ajax.crossDomain) {
		xmlhttp = null;
		/* eslint-disable-next-line */
		xmlhttp = new XDomainRequest();
		this.xDomain = true;
	} else {
		ajax.cacheajax[ajax.cacheajax.length] = xmlhttp;
		this.xDomain = false;
	}

	// xmlhttp.withCredentials = true; //允许跨域发送cookie

	return xmlhttp;

};

//检测当前的请求是否跨域
ajax.checkCrossDomain = function(str) {
	if (str.indexOf('http') != 0) {
		ajax.crossDomain = false;
		return;
	}
	let locOrigin = location.origin || location.href.split('/').slice(0, 3).join('/');
	let remoteOrigin = str.split('/').slice(0, 3).join('/');
	ajax.crossDomain = true;
	if (locOrigin === utils.trim(remoteOrigin)) {
		ajax.crossDomain = false;
	}
};

//请求是否使用的XDomainRequest
ajax.xDomain = true;
//是不是跨域的请求
ajax.crossDomain = false;

Object.defineProperty(ajax, '_length', {
	configurable: true,
	get: function() {
		return Object.keys(ajax.loadQueue).length;
	}
});

export default ajax;