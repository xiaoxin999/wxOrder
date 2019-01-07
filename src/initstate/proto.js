
import global from "src/manager/global";

let context = window.navigator.userAgent.toLowerCase().indexOf("alipay")>-1 ? "ali" :"weixin";
//在Vue原型上挂载属性
class Proto{

    constructor(Vue){

        //判断是否是支付宝环境判断是否是支付宝环境
		Vue.prototype.IS_ALI = context == "ali";
		//获取根节点字体大小
		Vue.prototype.FS = parseFloat(document.documentElement.style.fontSize);
        this.getShopId(Vue);
		this.setCloseWindow(Vue);
		
    }

    setCloseWindow(Vue){
        Vue.prototype.$closeWindow = function(){
            if (typeof window.WeixinJSBridge === "object"){
                WeixinJSBridge.invoke('closeWindow', {}, function (res) { });
            }else if(typeof window.AlipayJSBridge === "object"){
                AlipayJSBridge.call('popWindow');
            }else{
                window.location.href = "";
            }
        }
    }
    //挂载shopId
    getShopId(Vue){
        Object.defineProperty(Vue.prototype,"shopId",{
            get:function(){
                return global.getShopId();
            }
        })
    }

}

export default Proto;
