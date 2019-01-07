/**
 * @description 压缩图片
 * @function compress
 * @param {Object}
 * 		file 选择的file对象
 * 		quality   图片质量,默认为0.5
 * 		size 压缩后的尺寸 {w,h} "auto" 宽高不变  0.6 按照原始比例缩放
 * 	    type "blob" "base64"   返回数据的类型
 * @returns {Blob}
 * @constructor
 * @example 
 */

class ImgCompress {
	constructor() {

	}

	static async compress( {file,quality=0.5,size="auto",type="blob"}) {
		//兼容在低版本下canvas 没有toBlob 方法
		this.setHack();
		
		this.quality = quality;
		this.size = size;
		this.type = file.type;
		this.returnType = type;
		this.sorceSize = file.size;
		
		if(file.size < 100 * 1024) return file;
		var re = await this.readFile(file);
		var img = await this.loadImg(re);
		var blob = 	await ImgCompress.parserImg(img);

		
		return blob;
	}

	static loadImg(str){
		return new Promise((res,rej)=>{
			var img = new Image();
			img.src = str;
			img.onload = function(){
				
				res(img);
				img = null;
			}
		})
	}
	static readFile(file){

		return new Promise((res,rej)=>{
			var ready = new FileReader();
			ready.readAsDataURL(file);
			ready.onload = function () {
				res(this.result);
			}
		})
			
	}

	static async parserImg(objImg){
		
		var initSize = objImg.src.length;
		var sourceW = objImg.width;
		var sourceH = objImg.height;
		var width = 0;
		var height = 0;

		var that = ImgCompress;

		if(typeof that.size == "object"){
			width = that.size.w;
			height = that.size.h;
		}else if(typeof that.size == 'number'){
			width = sourceW * that.size;
			height = sourceH * that.size;
		}else{
			width = sourceW;
			height = sourceH;
		}

		// 用于压缩图片的canvas
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
	
		
		canvas.width = width;
		canvas.height = height;
		// 铺底色
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		var count
		if ((count = width * height / 1000000) > 1) {
		  // 计算要分成多少块
		  count = ~~(Math.sqrt(count) + 1);
			
		  //缩放之前的块的大小
		  var ww = ~~(sourceW / count);
		  var hh = ~~(sourceH / count);

		  //缩放之后的块的大小
		  var nw = ~~(width / count);
		  var nh = ~~(height / count);

		  for (var i = 0; i < count; i++) {
			for (var j = 0; j < count; j++) {
			  ctx.drawImage(objImg, i * ww , j * hh , ww , hh , i * nw, j * nh, nw, nh);
			}
		  }
		} else {
		  ctx.drawImage(objImg, 0, 0, width, height);
		}

		// 进行压缩
		var nData = null;
		if(that.returnType == "base64"){
			nData = canvas.toDataURL(that.type, that.quality);
		}else{
			nData = await that.toBlob(canvas);
		}
		
		canvas.width = canvas.height = 0;

		
		return nData

	}

	static toBlob(canvas){
		return new Promise(function(res,rej){
			canvas.toBlob(function(data){
				res(data);
			},ImgCompress.type, ImgCompress.quality);
		})		
	}

	static setHack(){
		var CanvasPrototype =window.HTMLCanvasElement && window.HTMLCanvasElement.prototype
		var hasBlobConstructor =window.Blob &&
		(function () {
			try {
			return Boolean(new Blob())
			} catch (e) {
			return false
			}
		})()
		var hasArrayBufferViewSupport =
		hasBlobConstructor &&
		window.Uint8Array &&
		(function () {
			try {
			return new Blob([new Uint8Array(100)]).size === 100
			} catch (e) {
			return false
			}
		})()
		var BlobBuilder =
		window.BlobBuilder ||
		window.WebKitBlobBuilder ||
		window.MozBlobBuilder ||
		window.MSBlobBuilder
		var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
		var dataURLtoBlob =
		(hasBlobConstructor || BlobBuilder) &&
		window.atob &&
		window.ArrayBuffer &&
		window.Uint8Array &&
		function (dataURI) {
			var matches,
			mediaType,
			isBase64,
			dataString,
			byteString,
			arrayBuffer,
			intArray,
			i,
			bb
			// Parse the dataURI components as per RFC 2397
			matches = dataURI.match(dataURIPattern)
			if (!matches) {
			throw new Error('invalid data URI')
			}
			// Default to text/plain;charset=US-ASCII
			mediaType = matches[2]
			? matches[1]
			: 'text/plain' + (matches[3] || ';charset=US-ASCII')
			isBase64 = !!matches[4]
			dataString = dataURI.slice(matches[0].length)
			if (isBase64) {
			// Convert base64 to raw binary data held in a string:
			byteString = atob(dataString)
			} else {
			// Convert base64/URLEncoded data component to raw binary:
			byteString = decodeURIComponent(dataString)
			}
			// Write the bytes of the string to an ArrayBuffer:
			arrayBuffer = new ArrayBuffer(byteString.length)
			intArray = new Uint8Array(arrayBuffer)
			for (i = 0; i < byteString.length; i += 1) {
			intArray[i] = byteString.charCodeAt(i)
			}
			// Write the ArrayBuffer (or ArrayBufferView) to a blob:
			if (hasBlobConstructor) {
			return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
				type: mediaType
			})
			}
			bb = new BlobBuilder()
			bb.append(arrayBuffer)
			return bb.getBlob(mediaType)
		}
		if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
			if (CanvasPrototype.mozGetAsFile) {
				CanvasPrototype.toBlob = function (callback, type, quality) {
				var self = this
				setTimeout(function () {
					if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
					callback(dataURLtoBlob(self.toDataURL(type, quality)))
					} else {
					callback(self.mozGetAsFile('blob', type))
					}
				})
				}
			} else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
				CanvasPrototype.toBlob = function (callback, type, quality) {
					var self = this
					setTimeout(function () {
						callback(dataURLtoBlob(self.toDataURL(type, quality)))
					})
				}
			}
		}
	}
}

export default ImgCompress;
	


