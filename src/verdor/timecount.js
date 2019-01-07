
    /**
     * @namespace timecount
     */

    let Timecount = {
        created: function () {
            this.getTime();
        },
        methods: {
          getTime:function(second_time){
            var time = parseInt(second_time) + "秒";
            var second = parseInt(second_time) % 60;
            var min = parseInt(second_time / 60) % 60;
            var hour = parseInt( parseInt(second_time / 60) /60 ) % 24;
            var day = parseInt( parseInt( parseInt(second_time / 60) /60 ) / 24 );
            time = ("00" + day).substr(-2) + "天" + ("00" + hour).substr(-2)  + "小时" + ("00" + min).substr(-2)  + "分" + ("00" + second).substr(-2)  + "秒";
            return time;
          },
          getTimeSource:function(second_time){
                var second = parseInt(second_time) % 60;
                var min = parseInt(second_time / 60);
                return ("00" + min).substr(-2)  +":" + ("00" + second).substr(-2);
            }
        }
      }

export default Timecount;