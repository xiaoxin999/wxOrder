<template>
    <section class="multi" v-if="isReady">
        <div  class="multi-picker-bg multi-picker-bg-up" @click="closePicker('close')">
        </div>
        <div  class="multi-picker-container multi-picker-container-up">
            <div class="multi-picker-btn-box">
                <div  class="multi-picker-btn fl" @click="closePicker('close')">返回</div>
                <div class="multi-picker-title fl"> {{title}} </div>
                <div  class="multi-picker-btn fl" @click="closePicker('ok')">完成</div>
            </div>
            <div ref='list'>
                <div  class="multi-picker-content">
                    <div class="picker-list">
						<ul v-for="(current,i) in childIndex" :key="i" ref="picker" @touchstart.prevent="touch($event,i)" @touchmove.prevent="touch($event,i)" @touchend.prevent="touch($event,i)">
							<li></li>
							<li></li>
							<li v-for="(item,index) in listData[i]" :key="index">{{item[name] || item}}</li>
							<li></li>
							<li></li>
						</ul>
                    </div>
                    <div class="multi-picker-up-shadow"></div>
                    <div class="multi-picker-down-shadow"></div>
                    <div class="multi-picker-line"></div>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    data () {
        return {
			isReady : false,
			listData : null,
			templateObj : {
				1 : {0:[]},
				2 : {0:[],1:[]},
				3 : {0:[],2:[],3:[]}
			},
			dataIndex : {},
			moveObj : {},
			rootSize : parseFloat(document.documentElement.style.fontSize),
			distance: 0
        };
    },
    props: {
        type : {
            default:" userDefined",
            type : String
        }, // 默认为用户自定义,可选类型：addressPicker选择省市区，personPicker选择人数
        childIndex : {
            default : 1,
            type : [String,Number]
		}, // 是否存在父子集关系，存在按几层嵌套解析,仅自定义时生效
		childName : {
			default : 'child',
			type : String
		},	
        name : {
            default : 'name',
            type : String
        }, // 根据什么字段进行显示
        list : {
			default : () => [],
            type : [Array,Number]
		}, // 显示的数据
		isShow : {
			default : true,
			type : Boolean
		}, // 是否显示
		title : {
			default : '',
			type : String
		}, // 标题
		returnValue : {
			default : 'value',
			type : String
		} // 返回值,默认为value,可选值为index
    },
    methods:{
		getType(){
			switch(this.type){
				case 'personPicker':
					this.pickerList = Array.from(new Array(this.list), (v,i) => { return i + 1});
					break;
				case 'addressPicker':
					break;
				default:
					this.pickerList = this.list;
			}
			this.getList();
		},
		getList(){
			let arr = this.templateObj[this.childIndex];
			let item = null;
			for(let i = 0,len = this.pickerList.length; len > i; i++){
				item = this.pickerList[i];
				arr[0].push(item); 

			// 处理子级节点
			let child = this.pickerList[0][this.childName];
				let j = 1;
				while(child){
					arr[j] = child;
					child = child[0][this.childName];
					j++;
				}
			}

			// 生成保存数据格式
			let k = 0;
			while(k < this.childIndex){
				this.dataIndex[k] = 0;
				k++;
			}

			this.listData = arr;
			this.isReady = this.isShow;
		},
		touch(event,index){
			event = event || window.event;
			
			let touches = event.touches[0];
			let maxHeight = (this.listData[index].length + 4) * this.rootSize;

			switch(event.type) {
				case "touchstart":
					this.moveObj.startY = touches.clientY;
					break;
				case "touchend":
					this.moveObj.endY = Math.abs(event.changedTouches[0].clientY);
					let tempDis = this.distance + (this.moveObj.startY - this.moveObj.endY);
					this.distance = tempDis < 0 ? 0 : (tempDis < maxHeight - this.rootSize * 5 ? tempDis : maxHeight - this.rootSize * 5);

					this.initPosition(this.distance,maxHeight);

					if(Math.abs(this.moveObj.startY - this.moveObj.endY)<3) break;

					if(this.moveObj.startY - this.moveObj.endY){
						this.setTransform(-this.distance,index);
					}else{
						this.setTransform(this.distance,index);
					}

					// 更新子级
					let i = this.distance / this.rootSize;
					this.dataIndex[index] = i;

					if(this.childIndex > 1){
						this.listData[index+1] = this.listData[index][i][this.childName];
					}

					if(index != this.childIndex - 1){
						let j = index + 1;

						while(j < this.childIndex){
							this.dataIndex[j] = 0;
							j++;
						}
					}

					break;
				case "touchmove":
					this.moveObj.endY = touches.clientY;
					let val = this.moveObj.startY - this.moveObj.endY; 

					if(this.distance == 0 && val < 0){
						this.setTransform(1* this.rootSize,index);
					}else{
						this.setTransform(-(val + this.distance),index)
					}
					break;
			}
		},
		initPosition: function(dis, max) {
			dis = dis < 0 ? 0 : dis;
			dis = dis > max ? max : dis;
			var sub = dis % this.rootSize;
			if(sub < this.rootSize / 2) {
				this.distance = dis - sub;
			} else {
				this.distance = dis + (this.rootSize - sub);
			}
			return this;
		},
		setTransform(val = 0,pickerIndex){
			let picker = this.$refs.picker;

			val = val/this.rootSize;

			for(let i=0,len = picker.length;i < len;i++){
				if(pickerIndex === undefined || pickerIndex == 0 && i != 0){
					picker[i].style.transform = `translate3d(0,0rem, 0)`;
					picker[i].style.webkitTransform  = `translate3d(0,0rem, 0)`;
				}else{
					picker[pickerIndex].style.transform = `translate3d(0,${val}rem, 0)`;
					picker[pickerIndex].style.webkitTransform  = `translate3d(0,${val}rem, 0)`;
				}
			}
		},
		getValue(){
			let obj = {
				"index" : this.dataIndex,
				"value" : {}
			};
			let j = 0;
			while(j < this.childIndex){
				if(this.type == 'personPicker'){
					obj.value = this.listData[j][this.dataIndex[j]];
				}else{
					obj.value[j] = this.listData[j][this.dataIndex[j]][this.name];
				}
				j++;
			}
			
			return obj[this.returnValue];
		},
		closePicker(type){
			let obj = {
				type : type,
				'data' : this.getValue()	
			}
			this.$emit('closePicker',obj);
		}
    },
    components: {},
    computed:{
	},
	beforeMount(){
		this.getType();
	},
    mounted(){
		 this.$nextTick().then(()=>{
			this.setTransform(0)
		})
    }
}
</script>
<style lang='less' scoped>
.multi .multi-picker-locked {
	height: 100% !important;
	overflow: hidden !important
}
.multi .multi-picker-bg {
	position: fixed;
	top: 0;
	left: 0;
	background: rgba(75, 75, 75, 0);
	height: 100%;
	width: 100%;
	overflow: hidden;
	transition: all .3s ease;
	-webkit-transition: all .3s ease;
	z-index: -1
}
.multi .multi-picker-bg-up {
	z-index: 9 !important;
	background: rgba(75, 75, 75, 0.65) !important
}
.multi .multi-picker-container {
	width: 100%;
	height: 6.25333rem;
	position: fixed;
	bottom: 0;
	transform: translate3d(0, 6rem, 0);
	-webkit-transform: translate3d(0, 6rem, 0);
	left: 0;
	background-color: #FFF;
	transition: transform .3s ease;
	-webkit-transition: -webkit-transform .3s ease;
	z-index: 99;
}
.multi .multi-picker-container-up {
	transform: translate3d(0, 0, 0) !important;
	-webkit-transform: translate3d(0, 0, 0) !important
}
.multi .multi-picker-btn-box {
	display: block;
	position: absolute;
	text-align: center;
	width: 100%;
	height: 1.25333rem;
	line-height: 1.25333rem;
	background: rgba(218, 218, 218, 0.7);
	z-index: 10
}
.multi .multi-picker-btn-box .multi-picker-btn {
	display: inline-block;
	right: 0;
	font-size: 0.34667rem;
	color: #333;
	width: 1.6rem;
	height: 1.25rem;
}
.multi .multi-picker-btn-box .multi-picker-btn:nth-child(1) {
	left: 0;
	right: initial;
	color: #333
}
.multi .multi-picker-title {
	width: calc(~"100% - 3.2rem");
	height: 1.25333rem;
	font-size: 0.34667rem;
	color: #999;
	text-align: center
}
.multi .multi-picker-content {
	position: absolute;
	width: 100%;
	background: #fff;
	font-size: 0;
	top: 1.25333rem;
	z-index: 10;
	transform: translate3d(0, 0, 0);
	-webkit-transform: translate3d(0, 0, 0);
	transition: transform .3s ease;
	-webkit-transition: -webkit-transform .3s ease
}
.multi .multi-picker-content .multi-picker {
	display: inline-block;
	height: 5rem;
	overflow: hidden;
	position: relative;
	z-index: -1;
	-webkit-transition: width .3s ease;
	transition: width .3s ease;
	vertical-align: top
}
.multi .multi-picker-content ul::-webkit-scrollbar {
	display: none
}
.multi .multi-picker-content ul{
	transition: -webkit-transform 0.2s ease-out;
}
.multi .multi-picker-content li {
	height: 1rem;
	text-align: center;
	font-size: 0.32rem;
	line-height: 1rem;
	list-style: none;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap
}
.multi .multi-picker-content .multi-picker-up-shadow,.multi .multi-picker-content .multi-picker-down-shadow {
	position: absolute;
	width: 100%;
	height: 80px;
	pointer-events: none
}
.multi .multi-picker-content .multi-picker-up-shadow {
	top: 0;
	background-image: -webkit-linear-gradient(top, #FFF, rgba(255, 255, 255, 0));
	background-image: linear-gradient(to bottom, #FFF, rgba(255, 255, 255, 0));
	z-index: 50
}
.multi .multi-picker-content .multi-picker-down-shadow {
	bottom: -200px;
	z-index: 50;
	background-image: -webkit-linear-gradient(bottom, #FFF, rgba(255, 255, 255, 0));
	background-image: linear-gradient(to top, #FFF, rgba(255, 255, 255, 0))
}
.multi .multi-picker-content .multi-picker-line {
	width: 95%;
	height: 1rem;
    position: absolute;
	top:2rem;
	left: 2.5%;
	pointer-events: none;
	box-sizing: border-box;
	border-top: 1px solid #ccc;
	border-bottom: 1px solid #ccc;
	
}
.multi-picker{
    display: inline-block;
    height: 4.53333rem;
    overflow: hidden;
    position: relative;
    z-index: -1;
    -webkit-transition: width .3s ease;
    transition: width .3s ease;
    vertical-align: top;
    ul{
        height: 100%;
        li{
            height: 1rem;
            text-align: center;
            font-size: 0.32rem;
            line-height: 1rem;
            list-style: none;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
.picker-list{
	display: flex;
	overflow: hidden;
	ul{
		flex: 1;
	}
}
</style>