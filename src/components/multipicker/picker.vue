<template>
    <div>
        <ul ref="arrIdx" @touchstart.prevent="touch($event)" @touchmove.prevent="touch($event)" @touchend.prevent="touch($event)">
            <li></li>
            <li></li>
            <li v-if="type == 'select'" v-for="(item,index) in areaData" :key="getRandom(index)" >{{item.name}}</li>
            <li v-if="type != 'select'" v-for="(item,index) in areaData" :key="getRandom(index)">{{item | validArr}}</li>
            <!-- <li v-if="type===''" v-for="(item,index) in areaData" :key="index">{{item[1]}}</li> -->
            <li></li>
            <li></li>
        </ul>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                liHeight: 1 * parseFloat(document.documentElement.style.fontSize),
                start: {
                    Y: 0,
                    time: ''
                },
                move: {
                    Y: 0,
                    speed: []
                },
                end: {
                    Y: 0,
                    index: 0
                },
                distance: 0
            }
        },
        props: {
            areaData: {
                type: [Array,Object]
            },
            type: {
                type: String
            },
            currentDistance: {
                type: Number,
                default: 0
            },
        },
        updated(){
            console.log(this.type)
        },
        computed: {
            maxHeight(){
                return (this.areaData.length + 4)*this.liHeight;
            }
        },
        filters:{
            validArr(val){
                if(Array.isArray(val)){
                    return val[1]
                }else{
                    return val
                }
            },
        },
        methods: {
            getRandom(index){
                return Math.random() + "_" + index;
            },
            touch(event){
                event = event || window.event;
                let $picker = this.$refs.arrIdx;
                event.preventDefault();
                switch(event.type) {
                    case "touchstart":
                        // this.end.status = !this.end.status;
                        // event.preventDefault();
                        this.move.speed = [];
                        this.start.Y = event.touches[0].clientY;
                        this.start.time = Date.now();
                        break;
                    case "touchend":
                        this.end.Y = Math.abs(event.changedTouches[0].clientY);
                        var tempDis = this.distance + (this.start.Y - this.end.Y);
                        var temp = this.distance;
                        this.distance = tempDis < 0 ? 0 : (tempDis < this.maxHeight - this.liHeight * 5 ? tempDis : this.maxHeight - this.liHeight * 5);
                        this.initSpeed(this.move.speed, this.start.Y - this.end.Y, this.maxHeight);
                        this.setTransition($picker,this.move.speed[0])
                        if(Math.abs(this.start.Y-this.end.Y)<3) break;

                        if(this.start.Y-this.end.Y){
                            this.setTransform($picker,-this.distance);
                        }else{
                            this.setTransform($picker,this.distance);
                        }
                        this.setResultArr(this.distance)
                        break;
                    case "touchmove":
                        event.preventDefault();
                        this.move.Y = event.touches[0].clientY;
                        var offset = this.start.Y - this.move.Y;
                        if(this.distance == 0 && offset < 0) {
                            this.setTransform($picker,1.5 * this.liHeight)
                            this.setTransition($picker,.3)
                        } else {
                            this.setTransform($picker,-(offset + this.distance))
                        }
                        if(Math.abs(offset).toFixed(0) % 5 === 0) {
                            var time = Date.now();
                            this.move.speed.push((Math.abs(offset) / (time - this.start.time)).toFixed(2));
                        }
                        break;
                }
            },
            setResultArr(val){
                switch(this.type){
                    case 'pro':
                        this.$emit('getCity',{
                            type: 'pro',
                        	data: this.areaData[val/this.liHeight]
                        });
                        break;
                    case 'city':
                        this.$emit('getCentionTown',{
                            type: 'city',
                        	data: this.areaData[val/this.liHeight]
                        });
                        break;
                    case 'town':
                        this.$emit('getCitytown',{
                            type: 'pro',
                        	data: this.areaData[val/this.liHeight]
                        });
                        break;
                    case 'tablePicker':
                        this.$emit('getTableName',{
                            data: this.areaData[val/this.liHeight],
                            index: val/this.liHeight
                        })
                        break;
                    case 'tableSelectName':
                        this.$emit('getTableSelectName',{
                            data: this.areaData[val/this.liHeight],
                            index: val/this.liHeight
                        })
                        break;
                    case 'personPicker':
                        this.$emit('getPerson',{
                            data: this.areaData[val/this.liHeight],
                            index: val/this.liHeight
                        })
                        break;
                    case 'select':
                        this.$emit('selects',{
                            index: val/this.liHeight
                        })
                        break;
                }
            },
            initSpeed(arr, dir, max) {
                var variance = 0;
                var sum = 0;
                var rate = 0;
                for(var i in arr) {
                    sum += arr[i] - 0;
                }
                for(var j in arr) {
                    variance += (arr[j] - (sum / arr.length)) * (arr[j] - (sum / arr.length));
                }
                if((variance / arr.length).toFixed(2) > .1) {
                    rate = max > this.liHeight * 15 ? dir * 2 : 0;
                    this.initPosition(this.distance + rate, max - this.liHeight * 5);
                    this.move.speed[0] = .2;
                } else {
                    this.initPosition(this.distance, max);
                    this.move.speed[0] = this.move.speed[0] > 0.2 ? .2 : this.move.speed[0];
                }
            },
            initPosition: function(dis, max) {
                dis = dis < 0 ? 0 : dis;
                dis = dis > max ? max : dis;
                var sub = dis % this.liHeight;
                if(sub < this.liHeight / 2) {
                    this.distance = dis - sub;
                } else {
                    this.distance = dis + (this.liHeight - sub);
                }
                return this;
            },
            setTransform($picker,val = 0){

                val = val/parseFloat(document.documentElement.style.fontSize);
                $picker.style.transform        = `translate3d(0,${val}rem, 0)`;
                $picker.style.webkitTransform  = `translate3d(0,${val}rem, 0)`;
            },
            setTransition($picker,val = 0){
                $picker.style.transition       = `transform ${val}s ease-out`;
                $picker.style.webkitTransition = `-webkit-transform ${val}s ease-out`;
            },
        },
        mounted(){
            this.$nextTick().then(()=>{
                this.distance = this.currentDistance
                let $picker = this.$refs.arrIdx;
                this.setTransform($picker,0)
            })
        },
        updated(){
            // let $picker = this.$refs.arrIdx;
            // this.distance = Math.floor(this.currentDistance);
            // this.setTransform($picker,0)
        }
    }
</script>

<style lang="less" scoped>
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
</style>

