<template>
    <div class="addAndSubtract">
        <div class="subtractBtn fl" @click="addAndSubtract"></div>
        <div class="addSubContentTable fl" v-if="!isSelectShop">{{item.num}}</div>
        <input type="Number" class="addSubContent fl" v-model="item.num" @change="goodsChange" v-if="isSelectShop" :disabled="!isSelectShop || item.type == '1' || !item.goodsName">
        <div class="fl" v-if="item.goodsName && item.type == '1'">{{item.unit}}</div>
        <div class="addBtn fl" @click="addAndSubtract('add')" v-else></div>
    </div>
</template>

<script>
import utils from "src/verdor/utils";
import storage from 'src/verdor/storage';
    export default{
        props : {
            "minnum" : {default:0}, // 最小数量,默认为0.
            "maxnum" : {default:99}, // 最大数量,默认为99.
            "item" : {default:{}}, // 操作的对象
            "index" : ''// 该对象下标
            // "type" : {default:1} // 操作对象类型，1商品，2套餐，默认为商品
        },
        data : function(){
            return {
                data : {},
                isSelectShop : Boolean(storage.session('select-shop'))
            };
        },
        // computed:{
        //   nums : {
        //     get: function() {
        //         return this.item.num;
        //     },
        //     set: function(newValue) {
        //        this.item.num = 2;
        //        console.log(1);
        //     }
        //   } 
        // },
        methods : {
            addAndSubtract : function(type){
                this.data = utils.deepCopy(this.item);
                if(type === 'add'){
                    // if(this.data.num >= this.maxnum) return false;
                    if(this.data.num >= this.data.goodsNum){
                        var content = this.data.goodsName || this.data.packageName;
                            content += '数量仅剩' + this.data.goodsNum + '份';
                        this.$store.commit("setWin",{content: content});
                        return false;
                    }
                    this.data.num++;
                    this.data.operate = 'add';
                }else{
                    if(this.data.num <= this.minnum) return false;
                    this.data.num = (this.data.goodsName && this.data.type == '1') ? 0 : --this.data.num;
                    this.data.operate = 'subtract';
                }
                this.data.index = this.index;
                this.data.isGoods = this.data.goodsName ? true : false;
                this.$emit('goodsChange',this.data);
            },
            goodsChange(){      
                this.item.num = String(isNaN(parseInt(this.item.num)) ? 0 : parseInt(this.item.num)).substring(0,4);       
                this.data = utils.deepCopy(this.item);
                this.data.index = this.index;
                this.data.isGoods = this.data.goodsName ? true : false;
                this.$emit('goodsChange',this.data);
            }
        },
        mounted : function(){
            
        },
        destroyed : function(){

        }
    };  
</script>

<style lang="less" scoped>

@import '../../src/res/css/base.less';
.addAndSubtract{
   width:100%;
   height:100%;
   overflow : hidden;
   .subtractBtn{
       background : url(../../src/res/images/btn-jian.png) center center no-repeat transparent;
       background-size : 0.66rem 0.66rem;
   }
   .addBtn{
       background : url(../../src/res/images/btn-jia.png) center center no-repeat transparent;
       background-size : 0.66rem 0.66rem;
   }
   .addBtn,.subtractBtn{
       width:0.66rem;
       height:100%;
   }
   .addSubContent{
       width:.8rem;
       margin: 0 .1333rem;
       height:.8rem;
       border: 0;
       text-align: center;
       background-color: #efefef;
       margin-top: .28rem;
       border-radius: .1333rem;
       .text-overflow();
   }
   .addSubContentTable{
       width:0.933rem;
       height:100%;
       .text-overflow();
   }
}
</style>