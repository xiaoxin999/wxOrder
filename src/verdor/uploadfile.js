import utils from "./utils";
import timer from "./timer";
import global from "src/manager/global";
import storage from "src/verdor/storage";
import ImgCompress from "src/verdor/img_compress";

/**
 * @description 异步上传文件专用
 * @namespace upload
 */
let uploadfile = {

    /**
     * @description 获取url
     * @function getUrl
     * @param {String} url 字符串
     * @returns {String} 字符串
     * @memberof upload
     */
    getUrl: function (url, urlParams) {
        var sendParams = '';

        if (urlParams) {
            for (var key in urlParams) {
                sendParams += '&' + key + '=' + urlParams[key];
            }
        }
        if(utils.type(url) == 'object'){
            url = global.host[url.type]||global.host.shop;
            url += url.url;
        }

        url+= '?' + sendParams;

        return url;
    },
    onlyid: 0,
    Queue: {},
    /**
     * @description 跨域上传文件
     * @function ajax
     * @param {Object} obj 一个对象
     * @param {String} obj.url 请求地址
     * @param {String} obj.formIdOrJson 表单id
     * @param {Object} obj.data 参数
     * @param {String} obj.name FormData的参数
     * @param {Object} obj.compress 压缩参数
     * @param {Object} obj.blob Blob对象
     * @memberof uploadObject
     */
    crosrouteroMain({
        url,
        formId,
        name,
        data,
        compress,
        blob
    }) {


        return new Promise(async (resolve, reject) => {
            
            let file = null;
            if(blob){
                file = blob;
            }
            else{
                let dom = document.querySelector('#' + formId);
                
                if (typeof (formId) == "string") {

                    if (dom.tagName != 'FORM') {
                        throw new Error('id等于#' + formId + "的form表单不存在");
                    }

                    if(!dom.hasAttribute("enctype")) dom.setAttribute("enctype","multipart/form-data");
                }
                let input = dom.children[0];
                file = input.files[0];
            }

            let oid = ++this.onlyid;

            data = Object.assign(data, {
                oid: oid,
                format: "json",
                token: storage.session("token")
            });

            let obj = {
                url:this.getUrl(url,data),
                formId,
                oid,
                resolve,
                reject,
                timerStr: "",
                name,
                compress
            }
           
            this.Queue[oid] = obj;
            timer.init();
            console.log(file);
            if(blob){
                file = blob;
            }else{
                if(compress&&file.type.indexOf("image")>-1){
                    file =  await ImgCompress.compress(Object.assign({file},obj.compress));
                }
            }
            
            var accData = (e) => {


                let o = null;
                // if(e&&!e.data){
                //     var reg = /^<script>([\S\s]*)if/gim;
                //     let arr = e.match(reg);
                //     let data = RegExp.$1;
                //     if(data){
                //         let str  = new Function(data+`;return str`)().substr(1);
                //         let sr = /(\w*)=([^&]*)/g;
                //         let a = [];
                //         o = {};
                //         while(a = sr.exec(str)){
                //             o[a[1]] = a[2];
                //         }
                //     }
                    
                // }
                // else if(e&&e.data){
                    try{
                        let d = JSON.parse(e);
                        o = d.data;
                    }
                    catch(e){
                        console.log("json error!");
                    }
                // }

                if(o&&o.encode) o.url = JSON.parse(o.encode).data;

                if (!(Object.keys(this.Queue) + "")) {
                    this.onlyid = 0;
                }
                

                if (o && o.oid && this.Queue[o.oid]) {

                    timer.clear(this.Queue[o.oid].timerStr)
                    var backStr = decodeURIComponent(o.url);

                    this.Queue[o.oid].resolve(backStr);
                    delete this.Queue[o.oid];
                }
                

                
            }

            //超时处理
            obj.timerStr = timer.add(function () {

            }, 10000, 1, false,  ()=> {
                
                this.Queue[obj.oid].reject({
                    code: 1000,
                    message: "timeout!"
                });
                delete this.Queue[obj.oid];
                if (!(Object.keys(this.Queue) + "")) {
                    this.onlyid = 0;
                }

            });


            let xhr = new XMLHttpRequest(); 
            xhr.open("POST", obj.url, true); 
            xhr.onload = function(obj){
                accData(xhr.responseText)
            }; //请求完成
            xhr.onerror =  function(){

            }; //请求失败

            // xhr.upload.onprogress = progressFunction;
            
            
            let form = new FormData();
            form.append(name||"file",file);

            xhr.send(form); //开始上传，发送form数据


        })

    }
}

export default uploadfile;