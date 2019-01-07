import http from 'src/manager/http';
import global from 'src/manager/global';
import storage from 'src/verdor/storage';
import utils from './utils';

let pay = {
    /**
     * 关闭微信页面
     */
    closePage:function(){
        if (typeof window.WeixinJSBridge === "object"){
            WeixinJSBridge.invoke('closeWindow', {}, function (res) { });
        }else{
            window.location.href = "";
        }
    },
    /**
     * 获取支付链接
     * @param {String} type 0:返回（pay、paydetails、bespeakdetail）不建议调用 1:pay(支付)  2:paydetails(详情)  3:bespeakdetail  4:recharge(充值)  5:rechargeDetail(充值详情) 6:weChatOnlinePay(在线点单买单) 7:crazyRobbery(抢购)  8.goodsDetail 抢购详情
     * @param {Boolean} isToPage 是否跳转链接 默认为true
     * @param {String} return 返回支付链接
     */
    async getPayUrl(type, shopId , isToPage = true){
        shopId = shopId || global.getShopId();
        
        let url = await http.payUrl({
            data : {
                'type' : type,
                'shopId': shopId
            }
        });

        if (isToPage){
            window.location.href = url;
        }else{
            return  url;
        }
    },
    /**
     * 获取openId
     * @param {String} shopId 默认从全局中获取，可自己传递参数
     */
    async getOpenId(shopId = global.getShopId()){
        let openId = storage.session('openId'); // 获取openId
        let code = utils.getQueryString('code') || 'test'; // code
        let payType = utils.getQueryString('payType') || 'wx'; // 默认为微信

        if(openId){
            return openId;
        }else{
            openId = await http.getOpenId({
                data : {
                    'code': code,
                    'shopId': shopId,
                    'payType': payType
                }
            });
            storage.session('openId',openId);
            return openId;
        }
    },
    /**
     * 微信支付
     * @param {Object} 支付所需信息
     * @param {function} 回调函数  err_msg == get_brand_wcpay_request:ok 为支付成功，其他为支付
     */
    async wechatPay(data,callback){
        WeixinJSBridge.invoke('getBrandWCPayRequest',data,callback);
    },
    /**
     * 微信支付调试兼容处理
     */
    callpay() {
        if (typeof WeixinJSBridge == "undefined") {
            if (document.addEventListener) {
                document.addEventListener('WeixinJSBridgeReady', this.wechatPay, false);
            } else if (document.attachEvent) {
                document.attachEvent('WeixinJSBridgeReady', this.wechatPay);
                document.attachEvent('onWeixinJSBridgeReady', this.wechatPay);
            }
        } else {
            this.wechatPay();
        }
    }
};

export default pay;