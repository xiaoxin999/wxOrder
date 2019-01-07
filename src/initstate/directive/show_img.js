import Vue from 'vue';


//防止网速慢时,图片是重上往下一点点出来的
Vue.directive("showImg",function (el) {
    
    let url = el.src;
    el.src = require("src/res/images/zhanweifu-m.jpg");
    el.onload = function(){
        let img = new Image();
        img.src = url;
        img.onload = function(){
            el.src = url;
        }
    }

})