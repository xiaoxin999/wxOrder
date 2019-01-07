import Vue from 'vue';

Vue.directive('focusD',{
	inserted: function (el) {
		console.log(el,'el');
		// 聚焦元素
		el.focus()
	  }	
})