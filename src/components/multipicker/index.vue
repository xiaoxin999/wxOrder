<template>
    <section class="multi">
        <div @click="closePicker" class="multi-picker-bg multi-picker-bg-up">
        </div>
        <div  class="multi-picker-container multi-picker-container-up">
            <div class="multi-picker-btn-box">
                <div @click.prevent="closePicker" class="multi-picker-btn fl">返回</div>
                <div class="multi-picker-title fl"> {{title}} </div>
                <div @click.prevent="makeSurePicker" class="multi-picker-btn fl">提交</div>
            </div>
            <div ref='list'>
                
                <div v-if="type==='addressPicker'" class="multi-picker-content">
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "province"
                    @getCity = "getCity"
                    :type= '"pro"'
                    :currentDistance= "distance[0]"
                ></picker>
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "city"
                    @getCentionTown="getCentionTown"
                    :type= '"city"'
                    :currentDistance= "distance[1]"                        
                ></picker>
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "centionTown"
                    @getCitytown = "getCitytown"
                    :type= '"town"'
                    :currentDistance= "distance[2]"
                ></picker>
                <div class="multi-picker-up-shadow"></div>
                <div class="multi-picker-down-shadow"></div>
                <div class="multi-picker-line"></div>
            </div>
            <div v-if="type==='tablePicker'" class="multi-picker-content">
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "tableName"
                    @getTableName = "getTableName"
                    :type= '"tablePicker"'
                    :currentDistance= "distance[0]"
                ></picker>
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "tableSelectName"
                    @getTableSelectName = "getTableSelectName"
                    :type= '"tableSelectName"'
                    :currentDistance= "distance[0]"
                ></picker>
                <div class="multi-picker-up-shadow"></div>
                <div class="multi-picker-down-shadow"></div>
                <div class="multi-picker-line"></div>
            </div>
            <div v-if="type === 'personPicker'" class="multi-picker-content">
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "personList"
                    @getPerson = "getPerson"
                    :type= '"personPicker"'
                    :currentDistance= "distance[0]"
                ></picker>
                <div class="multi-picker-up-shadow"></div>
                <div class="multi-picker-down-shadow"></div>
                <div class="multi-picker-line"></div>
            </div>
            <div v-if="type=='select'" class="multi-picker-content">
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "list"
                    @selects = "selects"
                    :type= '"select"'
                    :currentDistance= "distance[0]"
                ></picker>
                <div class="multi-picker-up-shadow"></div>
                <div class="multi-picker-down-shadow"></div>
                <div class="multi-picker-line"></div>
            </div>
            <div v-if="type=='mealTime'" class="multi-picker-content">
                <picker
                    :style="styleObj"
                    class="multi-picker"
                    :areaData = "list"
                    @selects = "selects"
                    :type= '"select"'
                    :currentDistance= "distance[0]"
                ></picker>
                <div class="multi-picker-up-shadow"></div>
                <div class="multi-picker-down-shadow"></div>
                <div class="multi-picker-line"></div>
            </div>
            </div>
            
        </div>


    </section>
    
</template>

<script>
    /**
     * type  选择器类型  有select
     * list   数据   eg: [{name: 'aaa',id: '111'},{name: 'aaa',id: '111'}，{name: 'aaa',id: '111'}，{name: 'aaa',id: '111'}]  name 必须要有
     * title  选择器名称   自己传值
     * 
     *  closePicker    派发的事件
     * 
     */
    import global from 'src/manager/global';
    import Picker from './picker';
    export default {
        data(){
            return {
                input: 'inpArea',//点击触发插件的input框的id
                jsonData: 'data',
                resultArr: [],
                province: [],
                city: [],
                centionTown: [],
                allData: [],
                distance: [0,0,0],
                tableName: [],
                tableObj: [],
                tableSelectName: [],
                personList: [],
            }
        },
        props: {
            type: {
                type: String
            },
            list: {
                type: null
            },
            title: {
                type: String,
                default: '选择地区'
            },
        },
        computed: {
            styleObj(){
                if(this.type==='addressPicker'){
                    return {
                        width: '33.3333%',
                    }
                }else if(this.type==='tablePicker'){
                    return {
                        width: '50%',
                    }
                }else{
                    return {
                        width: '100%',
                    }
                }
                
            }
        },
        methods: {
            getPerson(val){
                this.resultArr = val.data;
            },
            getTableName(val){
                // this.tableSelectName = this.tableObj[val.index]
                // console.log(this.tableSelectName)
                this.tableSelectName = [];
                if(this.tableObj[val.index]){
                    for(let i = 0; i < this.tableObj[val.index].length; i++ ){
                        this.tableSelectName.push(this.tableObj[val.index][i].tableName)
                    }
                    this.resultArr = [val.index,0]
                }

                
            },
            getTableSelectName(val){         
                this.resultArr = [this.resultArr[0],val.index]
            },
            closePicker(){
                this.$emit('closePicker',{
                    type: 'close'
                })           
            },
            makeSurePicker(){
                this.$emit('closePicker',{
                    type: 'sure',
                    payload: this.resultArr
                })
            },
            async getAreaData(){
                let res = await import ( /*webpackChunkName: "area_cn"*/ 'src/verdor/area_cn');
                this.allData = res.default;
                this.province = this.allData.get1();

                this.city = this.allData.get2(this.province[0][0])
                this.centionTown = this.allData.get3(this.city[0][0])
                this.resultArr = [this.province[0][1],this.city[0][1],this.centionTown[0][1]]
            },
            async getCity(val){
                let data = this.allData.default;
                this.city = this.allData.get2(val.data[0]);
                this.centionTown = this.allData.get3(this.city[0][0]);

                this.resultArr = [val.data[1],this.city[0][1],this.centionTown[0][1]]
                this.distance = [this.distance[0],0,0]
                // this.$set(this.distance,1,0.1)          
                // this.$set(this.distance,2,0.1)            
            },
            async getCentionTown(val){
                this.centionTown = this.allData.get3(val.data[0]);
                this.$set(this.resultArr,1,val.data[1])
                this.$set(this.resultArr,2,this.centionTown[0][1])
                this.$set(this.distance,2,0.1)        
            },
            getCitytown(val){
                this.$set(this.resultArr,2,val.data[1])
            },
            initTable(){
                for(let i = 0;i< this.list.length; i++ ){
                    this.tableName.push(this.list[i].areaName)
                    this.tableObj[i] = this.list[i].child
                }
                for(let i = 0;i< this.tableObj[0].length; i++ ){
                    this.tableSelectName.push(this.tableObj[0][i].tableName)
                }
                this.resultArr = [0,0]
            },
            initPerson(){
                if(this.list == 1){
                    this.personList.push(1)
                }else{
                    for(let i = 0; i < this.list; i++){
                        this.personList.push(i + 1)
                    }
                }
                this.resultArr = this.personList[0];
            },
            selects(val){
                this.resultArr = [val.index]
            },
            touchstart(e){
                e.preventDefault();
            },
            removeEvent(){
                // this.$refs.list.removeEventListener('touchstart', this.touchstart);
            }
        },
        mounted(){
            if(this.type === 'addressPicker'){
                this.getAreaData()
            }else if(this.type === 'tablePicker'){
                this.initTable()
            }else if(this.type === 'personPicker'){
                this.initPerson()
            }else if(this.type === 'select'){
                this.resultArr = [0]
            }else if(this.type === 'mealTime'){
                this.resultArr = this.list;
            }

            // 全局overflow,阻止微信默认滚动条
            this.$store.commit("setOverHide",true);
            this.$refs.list.addEventListener('touchstart', this.touchstart);
        },
        destroyed(){
            this.removeEvent();
        },
        components: {
            Picker
        }
    }
</script>

<style lang="less" scoped>
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
	width: calc(100% - 3.2rem);
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
.multi .multi-picker-content li {
	height: 1.06667rem;
	text-align: center;
	font-size: 0.32rem;
	line-height: 1.06667rem;
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
    top:0;
    bottom:0;
    left:0;
    right:0;
    margin:auto;
	pointer-events: none;
	box-sizing: border-box;
	border-top: 1px solid #ccc;
	border-bottom: 1px solid #ccc;
	
}
</style>