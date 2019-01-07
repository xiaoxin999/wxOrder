<template>
  <div @mouseover="over" @click="click">
      <!-- <img ref = 'star' src="../res/images/sell_assis/star.png" :data-index = 'i' :style='{width:size,height:size,marginLeft:offsetX}' class='filter_grays' alt="" v-for='i in 5' :key='i'> -->
      <span ref = 'star' src="../res/images/sell_assis/star.png" :data-index = 'i' :style='{width:size,height:size,marginLeft:offsetX}' class='filter_grays' alt="" v-for='i in 5' :key='i'></span>
  </div>
</template>


<script>
    
    import utils from "src/verdor/utils";

    export default{
        props:{
            levelList:[Array],//等级列表
            levelKey:String,//等级列表排序的key
            backKet:String,//排完序后 等级为对应的key值
            total:[Number,String],//自己的分数
            size:{
                type:String,
                default:"0.32rem"
            },
            offsetX:{
                type:String,
                default:"0.05rem"
            },
            interactive:false,//是否是可交互的
            name:""
        },
        data(){
            return {
                index:-1
            }
        },
        watch:{
            total(){
                this.updateStar();
            },
            
        },
        methods:{
            refresh(e,type){
                if(!this.interactive) return;
                let tar = e.target;
                if(tar.tagName.toLowerCase() == 'span'){
                    let i = tar.getAttribute("data-index")-1;
                    this.$refs.star.forEach((item,index)=>{
                        if(index<=i){
                            item.className = "no_filters";
                        }
                        else{
                            item.className = "filter_grays"
                        }
                    })
                    if(type == 'click'){
                        this.$emit("index",this.name,i);
                    }
                }
            },
            over(e){
                this.refresh(e);
            },
            click(e){
                this.refresh(e,'click');
            },
            updateStar(){

                if(this.levelList==undefined) return  ;
                
               
                let levelList = utils.sortByAll(this.levelList,this.levelKey,true);
                this.level = 0;
                for(var i=0;i<levelList.length;i++){
                    if(Number(this.total) >= Number(levelList[i][this.levelKey])){
                        this.level = levelList[i][this.backKet];
                    }
                }
                
                this.$nextTick(()=>{
                    if(this.$refs.star){
                        this.$refs.star.forEach((item,index)=>{
                            item.className = "filter_grays"
                            index<this.level&&(item.className = "no_filters");
                        })
                    }
                }) 
                
            }
        },
        beforeUpdate(){
            this.updateStar()
        },
        mounted(){
            this.updateStar();
            if(this.interactive){

            }
        }
    }

</script>


<style scoped>

span{
    width: 0.32rem;
    height:0.32rem;
    margin-left: 0.05rem;
    display: inline-block;
}
div>span:first-child{
    margin-left: 0;
}
.filter_grays{
     background: url(../res/images/sell_assis/xxx.png) center center no-repeat;
     background-size:100%;
}
.no_filters{
     background: url(../res/images/sell_assis/star.png) center center no-repeat;
     background-size:100%;

}

</style>
