<template>
    <section class='choose_shop'>
        <div id="l-map"></div>
	    <div id="r-result"></div>
    </section>
</template>
<script>

export default{
    props:["address","position"],
    data(){
        return{
           
        }
    },
    created(){
        
    },
    methods:{
        getMapDetail(){
           
            var map = new BMap.Map("l-map");
            var geolocation = new BMap.Geolocation();
            map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
            geolocation.getCurrentPosition(function(r){
                if(this.getStatus() == BMAP_STATUS_SUCCESS){
                    var mk = new BMap.Marker(r.point);
                    map.addOverlay(mk);
                    map.panTo(r.point);
                    alert('您的位置：'+r.point.lng+','+r.point.lat);
                }
                else {
                    alert('failed'+this.getStatus());
                }        
            });

            var walking = new BMap.WalkingRoute(map, {renderOptions: {map: map, panel: "r-result", autoViewport: true}});
            walking.search("普陀区真北路", "军工路100号");    
        }
    },
    async mounted(){
            this.getMapDetail();      

    }
}
</script>

<style lang='less' scoped>
    .choose_shop{
        height: 100%;
        background: #fff;
        position: relative;
        top: -0.22rem;
       #l-map{height:300px;width:100%;}
		#r-result,#r-result table{width:100%;}
    }

</style>


