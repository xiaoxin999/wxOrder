import Vue from 'vue';

let obj = {};
let num = 0;

function resize(el){
    return function(){
        let dom = obj[el.id].dom;
        if( el.sourceHeight!= dom.clientHeight){
            dom.scrollTop =  dom.scrollHeight -  dom.clientHeight;
            el.sourceHeight =  dom.clientHeight;
        }
    }
    
}
function on(e){
    e.fn = resize(e.target);
    window.addEventListener("resize",e.fn);
}

Vue.directive('scrollTxt', {

    // 当被绑定的元素插入到 DOM 中时……
    inserted: function (el,binding) {
        num++;
        let dom = document.querySelector(binding.value);
        el.addEventListener("focus", on);
        el.sourceHeight = app.clientHeight; 
        el.id = num;

        obj[num] = {
            dom
        } 
    },

    unbind:function(el){
        el.addEventListener("focus", on);

        window.addEventListener("resize",el.fn);
        delete obj[el.id];
    }
})

// export default {
//     name:"scrollTxt",
//     structure:{
//         // 当被绑定的元素插入到 DOM 中时……
//         inserted: function (el,binding) {
//             num++;
//             let dom = document.querySelector(binding.value);
//             el.addEventListener("focus", on);
//             el.sourceHeight = app.clientHeight; 
//             el.id = num;

//             obj[num] = {
//                 dom
//             } 
//         },

//         unbind:function(el){
//             el.addEventListener("focus", on);

//             window.addEventListener("resize",el.fn);
//             delete obj[el.id];
//         }
//     }
// }
