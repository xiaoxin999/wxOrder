<template>
    <div style="position:absolute;right:200px;top:300px;background-color:#fff;align:center;cursor:pointer">
        <input type="text" class="calendar-input" oncopy='return false;'
            placeholder="选择日期时间" 
            v-on:click="funShowCalendar"
            readonly v-model="timestr">

            <!--日历-->
            <div class="calendar" onmousedown="return false;" v-if="showCalendar">
                <div class="calendar-title">
                    <span class="calendar-left" v-on:click='funPreMonth'>&lt;</span>
                    <span class="calendar-center">{{year+"-"+month}}</span>
                    <span class="calendar-right" v-on:click='funNextMonth'>&gt;</span>
                </div>

                <div class="calendar-week">
                    <span v-for="(day,index) in weekday" :key='index'>{{day}}</span>
                </div>

                <div class="calendar-day" @click="clickItem">
                    <!--日历的前几天-->
                    <span class="calendar-pre" v-for="(day,index) in calendarBefore">{{day}}</span>
                    <!--日历中设定的月-->
                    <span class= "calendar-on" v-for="(day,index) in calendarNow" :key='index'>{{day}}</span>
                    <!--日历的后几天-->
                    <span class="calendar-next" v-for="(day,index) in calendarAfter">{{day}}</span>
                    <div style="clear: both;width: 100%; font-size: 0; height: 5px;"></div>
                </div>


                <!--时分秒的显示-->
                <div v-if='!only'>
                    <div class="calendar-time">
                        <span :class="{'calendar-hour':true, 'calendar-seleted':hourClass}" v-on:click="funSelectHMS('hour')" style="width: 27% ;">{{hour}}</span>
                        <span style="width: 10% ;">:</span>
                        <span :class="{'calendar-minute':true,'calendar-seleted':minuteClass}" v-on:click="funSelectHMS('minute')" style="width: 27% ;">{{minute}}</span>
                        <span style="width: 10% ;">:</span>
                        <span :class="{'calendar-second':true,'calendar-seleted':secondClass}" v-on:click="funSelectHMS('second')" style="width: 26% ;">{{second}}</span>
                    </div>

                    <div class="calendar-bar" onmousedown="return false;">
                        <div class='barContainer' onmousedown="return false;" style="position:relative;  width:88%; height: 2px; background-color:#c8cac9; margin: 9px auto 9px auto;">
                            <div class="calendar-size" onmousedown="return false;" :style="{'width':barSize}"></div>

                            <div class="calendar-handle" :style="{'left':barSize}" @mousedown='barmousedown'>
                                <div onmousedown="return false;" style="width: 80%; height: 2px; background-color:#dddddd; margin: 17% auto 16% auto;"></div>
                                <div onmousedown="return false;" style="width: 80%; height: 2px; background-color:#dddddd; margin: 16% auto 17% auto;"></div>
                                <div onmousedown="return false;" style="width: 80%; height: 2px; background-color:#dddddd; margin: 16% auto 16% auto;"></div>
                            </div>

                        </div>
                    </div>
                </div>

                <!--确认按钮-->
                <div class="calendar-buttons" onmousedown="return false;">
                    <a onmousedown="return false;" class="green fl" style="height: 40px; line-height: 40px; width:50% ;" @click='funSelectNowTime'>当前时间</a>
                    <a onmousedown="return false;" class="yellow fl" style="height: 40px; line-height: 40px;width:50% ;" @click='funSelectTime'>确认</a>
                </div>
                <div style="clear: both;width: 100%;font-size: 0;"></div>
            </div>
    </div>
</template>

<script>
    export default{
        props: {
                'time': [Number,String],
                'only': Boolean,        //传过来的是false 需要显示时分秒
                'format': String,       //yyyy-MM-dd hh:mm:ss   未传值时 false需要显示时分秒
                'uid': String,          //mycalendar1
                'ok': Boolean ,         //true,展示传递过来的日期(initial) 默认显示日期              
        },
        data: function() {
            return {
                timestr: '',            //在input框上显示的时间
                showCalendar:false,     //页面加载时是否显示日历，若不这样做，则子组件无法获取父组件传递的值。
                weekday:['一','二','三','四','五','六','日'],
                calendarBefore:[],      //需要显示的上一个月的日期
                calendarAfter:[],       //需要显示的下一个月的日期
                calendarNow:[],         //本月需要显示的日期

                year:[Number,String],
                month:[Number,String],
                day:[Number,String],
                hour:[Number,String],
                minute:[Number,String],
                second:[Number,String],
                week:[Number,String],   //周几
                currentSelectDay:1,     //当前选中的是那一天

                //时分秒选择时的样式
                hourClass:true,
                minuteClass:false,
                secondClass:false,

               
                barSize:0,              //进度条的长度
                currentSelect:'hour',   //时分秒中选中的一个
                rememberPosition:0,     //开始滑动时，鼠标的位置
                barSizeWidth:0,         //进度条的长
                barContainerWidth:0,    //总进度条的长

                //获取父组件传递的值
                getFormat:'',
                getTime:'',             //时间戳
                prevItem:null,          //用于存储当前点击的日期对应的span节点
            };
        },

        methods: {
            //日历的显示与隐藏
            funShowCalendar:function(){
                this.showCalendar=!this.showCalendar;
            },
            timeFormat:function(time,format){
                var date=new Date(time);
                var year=date.getFullYear()+'年';
                var month=date.getMonth()+1;
                var day=date.getDate();
                var hour=date.getHours();
                var minute=date.getMinutes()
                var second=date.getSeconds();
                if(month<10) month='0'+month+'月';
                else         month=month+'月'
                if(day<10) day='0'+day+'日';
                else       day=day+'日';
                if(hour<10) hour=' 0'+hour+':';
                else        hour=hour+':';
                if(minute<10) minute='0'+minute+':';
                else          minute=minute+':';
                if(second<10) second='0'+second;
                else        second=second;
                console.log(format);         
                if(format=="yyyy-MM-dd")
                {
                    return year+month+day;
                }else{
                    return year+month+day+hour+minute+second;
                }
            },
            funPreMonth:function(){
                var date=new Date(this.getTime);
                var month=date.getMonth();//获取的是上一个月的数字
                var year=date.getFullYear();
                if(month==0){
                    month=12;
                    year=year-1;
                }
                this.month=month;
                this.day=1
                this.year=year;
                var str=''+year+'-'+month+'-'+this.day+' '+this.hour+':'+this.minute+':'+this.second;
                this.getTime=(new Date(str)).getTime();
                this.funInitalCalendar();
            },
            funNextMonth:function(){
                var date=new Date(this.getTime);
                var month=date.getMonth()+1;
                var year=date.getFullYear();
                month+=1;
                if(month==13){
                    month=1;
                    year=year+1;
                }
                this.month=month;
                this.year=year;
                this.day=1;
                var str=''+year+'-'+month+'-'+this.day+' '+this.hour+':'+this.minute+':'+this.second;
                this.getTime=(new Date(str)).getTime();
                this.funInitalCalendar();
            },
            clickItem(event){
                let target = event.target;
                if(this.prevItem){
                    this.prevItem.className = this.prevItem.className.replace(" calendar-seleted","");
                }
                if(event.target.className=='calendar-on'){
                    target.className = target.className + " calendar-seleted";
                    this.prevItem = target;
                }
                if(event.target.className=='calendar-pre') this.funPreMonth();
                if(event.target.className=='calendar-next') this.funNextMonth();
                this.day=target.innerText;
                var str=''+this.year+'-'+this.month+'-'+this.day+' '+this.hour+':'+this.minute+':'+this.second;
                this.getTime=(new Date(str)).getTime();
            },
            funSelectHMS(flag){
                switch(flag){
                    case "hour":
                        this.hourClass=true;
                        this.minuteClass=this.secondClass=false;
                        break;
                    case "minute":
                        this.hourClass=this.secondClass=false;
                        this.minuteClass=true;
                        break;
                    case "second":
                        this.hourClass=this.minuteClass=false;
                        this.secondClass=true;
                        break;
                }
                this.initBar(flag);
            },
            documentMove:function(event,barSizeWidth,barContainerWidth){
                var sub=event.pageX-this.rememberPosition;
                var sum=sub+this.barSizeWidth;
                if(0<=sum && sum<this.barContainerWidth){
                    switch(this.currentSelect){
                        case "hour":
                            this.hour=(this.barSizeWidth+sub)/this.barContainerWidth * 24;
                            this.hour=parseInt(this.hour);
                            break;
                        case "minute":
                            this.minute=(this.barSizeWidth+sub)/this.barContainerWidth * 60;
                            this.minute=parseInt(this.minute);
                            break;
                        case "second":
                            this.second=(this.barSizeWidth+sub)/this.barContainerWidth * 60;
                            this.second=parseInt(this.second);
                            break;
                    }
                    var str=''+this.year+'-'+this.month+'-'+this.day+' '+this.hour+':'+this.minute+':'+this.second;
                    this.getTime=(new Date(str)).getTime();

                    this.initBar(this.currentSelect);
                }
            },
            barmousedown:function(event){
                this.barSizeWidth=document.querySelector(".calendar-size").offsetWidth;
                this.barContainerWidth=document.querySelector(".barContainer").offsetWidth;

                //第一次点击时的位置
                this.rememberPosition=event.pageX;
                document.addEventListener('mousemove',this.documentMove,false); 
                document.addEventListener('mouseup',this.barmouseup,false); 
            },
            barmouseup:function(){
               document.removeEventListener('mousemove',this.documentMove);
            },
            funInitalCalendar:function(){
                //初始化年月日，时分秒，周，
                this.calendarAfter=[];
                this.calendarNow=[];
                this.calendarBefore=[];
                var date=new Date(this.getTime);
                this.year = date.getFullYear();
                this.month = date.getMonth() + 1;
                this.day = date.getDate();
                this.hour = date.getHours();
                this.minute = date.getMinutes();
                this.second = date.getSeconds();
                this.week = date.getDay();
                if(this.week == 0) this.week = 7;

                //计算上一个月，本月，下一个月
                var offsetDay = this.week - this.day % 7;
        
                if(offsetDay < 0) offsetDay += 7;
                //设定月中的最后一天
                var max = (new Date(this.year, this.month, 0)).getDate();
                
                //当设定的时间中为第一个月时，开头显示的是上一个月的后面几天
                var previousMax = this.month === 1 ? (new Date(this.year - 1, 12, 0)).getDate() : (new Date(this.year, this.month - 1, 0)).getDate();

                for(let i=0;i<offsetDay;i++){
                    this.calendarBefore.push(previousMax-offsetDay+i);
                }
                for(let i=1;i<=max;i++){
                    this.calendarNow.push(i);
                }
                for(let i=1,len=42-offsetDay-max;i<=len;i++){
                    this.calendarAfter.push(i);
                }
            },
            initBar:function(flag){
                switch(flag){
                    case "hour":
                        this.barSize=this.hour/23*100+'%';//进度条的长度,%
                        break;
                    case "minute":
                        this.barSize=this.minute/59*100+'%';//进度条的长度,%
                        break;
                    case "second":
                        this.barSize=this.second/59*100+'%';//进度条的长度,%
                }
                this.currentSelect=flag;
            },
            funSelectNowTime:function(){
                this.getTime=(new Date()).getTime();
                this.funInitalCalendar();
                this.timestr=this.timeFormat(this.getTime,this.getFormat);
            },
            funSelectTime:function(){
                this.timestr=this.timeFormat(this.getTime,this.getFormat);
                this.showCalendar=false;
                this.$emit('throwTime',this.timestr);
            },
            timeChanged: function() {
             //显示日期
                var initDate;
                if(!this.ok){
                    //显示日期
                	if(this.getTime) {
	                    initDate = new Date(this.getTime);
	                } else {
	                    initDate = new Date();
	                    this.getTime = initDate.getTime();
	                }
                    //显示最终日期
                    this.timestr=this.timeFormat(this.getTime,this.getFormat);
                }else{
                    //不显示日期
                	this.timestr = '请选择日期';
                	this.getTime = ''
                }
            },
        },
        mounted: function() {
            //初始化日期格式
            if(this.format === null || this.format === undefined) {
                if(!this.only) {
                    this.getFormat = 'yyyy-MM-dd hh:mm:ss';
                } else {
                    this.getFormat = 'yyyy-MM-dd';
                }
            }else
            {
                this.getFormat=this.format;
            }
            var initDate;//日期
            this.getTime = this.time ? parseInt(this.time) : 0;
            
            //初始显示的日期与对应的时间戳
            if(this.getTime) {
                initDate = new Date(this.getTime);
            } else {
                initDate = new Date();
                this.getTime = initDate.getTime();
            }
            //初始化input框
            this.timeChanged();
            //初始化日历
            this.funInitalCalendar();
            //初始化进度条的大小
            this.initBar('hour');
            //初始化选中的日期
        },

    }
</script>
<style lang="less">
input {
    padding: 0;
    border: 1px solid #ccc;
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    appearance: none
}

.calendar-input {
    line-height: 40px;
    width: auto;
    height: 40px;
    padding: 0;
    padding-left: 10px;
    border: 0;
    outline: 0;
    cursor:pointer;
}

.calendar-input:focus {
    -webkit-transition: border linear .2s, box-shadow linear .2s;
    -moz-transition: border linear .2s, box-shadow linear .2s;
    -ms-transition: border linear .2s, box-shadow linear .2s;
    -o-transition: border linear .2s, box-shadow linear .2s;
    transition: border linear .2s, box-shadow linear .2s;
    border-color: rgba(82, 168, 236, .8);
    -webkit-box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1), 0 0 8px rgba(82, 168, 236, .6);
    -webkit-box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1);
    -moz-box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1), 0 0 8px rgba(82, 168, 236, .6);
    -moz-box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1), 0 0 8px rgba(82, 168, 236, .6);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, .1), 0 0 8px rgba(82, 168, 236, .6)
}

/*日历*/
.calendar {
    width: 200px;
    height: auto;
    border: 1px #CCCCCC solid;
    font-family: "微软雅黑","宋体",Arial,STHeiti,"WenQuanYi Micro Hei",sans-serif;
    font-size: 14px;
    box-sizing: border-box;
    position: absolute;
    // left: -1000px;
    // top: -1000px;
    // display:none;
    background-color: #fff;
    z-index: 1000;

    .calendar-title {
        width: 100%;
        height: 35px;
        line-height: 35px;
        box-sizing: border-box;

        .calendar-left {
            text-align: left;
            float: left;
            width: 25%;
            cursor: pointer;
            padding-left: 10px;
            box-sizing: border-box;
        }

        .calendar-center {
            text-align: center;
            float: left;
            width: 50%;
            box-sizing: border-box;
        }

        .calendar-right {
            text-align: right;
            float: left;
            width: 25%;
            cursor: pointer;
            padding-right: 10px;
            box-sizing: border-box;
        }

        .calendar-left:hover,.calendar-right:hover{
            background-color: #eee;
        }


    }

    .calendar-week,.calendar-day{
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        padding: 2px;

        span {
            width: 14.2857%;
            float: left;
            height: 24px;
            line-height: 24px;
            color: #898989;
            font-size: 12px;
            box-sizing: border-box;
        }

        span.calendar-on:hover {
            background-color: #eee;
        }

        span.calendar-next {
            color: #ddd;
        }

        span.calendar-pre {
            color: #ddd;
        }

        span.calendar-seleted {
            border: 1px solid #ccc;
            background: url(../res/images/topright.png) no-repeat right -70px;
        }

    }

    .calendar-time {
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        clear: both;

        span {
            float: left;
            height: 40px;
            line-height: 40px;
            font-size: 14px;
            text-align: center;
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            box-sizing: border-box;
        }

        span.calendar-hour {
            border-right: 1px solid #ccc;
            cursor: pointer;
        }

        span.calendar-minute {
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            cursor: pointer;
        }

        span.calendar-second {
            border-left: 1px solid #ccc;
            cursor: pointer;
        }
        span.calendar-hour:hover,span.calendar-second:hover，.calendar-time{
            background-color: #eee;
        }

         span.calendar-seleted {
            background: url(../res/images/topright.png) no-repeat right -62px;
        }

    }

    .calendar-bar {
        width: 100%;
        height: 40px;
        text-align: center;
        clear: both;
        padding-top: 10px;

        .calendar-size {
            position: absolute;
            left: 0;
            top: -9px;
            height: 2px;
            background-color: #727071;
            margin: 9px 0 9px 0;
        }

        .calendar-handle {
            cursor: pointer;
            position: absolute;
            right: 0%;
            top: -10px;
            width: 20px;
            height: 20px;
            border: 2px solid #b3b3b3;
            background-color: #fff;
            margin-left: -10px;
        }
    }

    .calendar-buttons {
        width: 100%;
        height: 40px;
        font-size: 0;
        clear: both;
    }

}


</style>