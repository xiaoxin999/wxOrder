<template>
    <div class="car-mesking" @click="closeWin">
        <div class="car-mesking">
			<div class="ways">
				<div class="w-title">
					<div class="w-text">
						<div class="w-img" style="left: 0.5rem;">
							<img src="../../src/res/icon/left-return.png">
						</div>
						选择方式
					</div>

				</div>
                <div  :class="[item.minFee - 0 > $store.state.shopCarPrice - 0 ? 'font-gray' : '', 'way']"  v-for="(item,index) in list" v-bind:key ="index" @click.stop="choicePay(item)">
                    {{item.name}}<template v-if="item.type == '2'">(满{{item.minFee}}起送)</template>
                    <div class="w-img" style="position: absolute;right: 0.5rem;top: 0.625rem;">
                        <img src="../../src/res/images/more.png">
                    </div>
                </div>
			</div>
		</div>
    </div>
</template>
<script>
import store from "src/module/order/data/details_store";
export default{
    props : {
        "list" : {default : []} // 支付方式
    },
    data : function(){
        return {
            
        };
    },
    methods : {
        choicePay (item){
            // 选择支付方式
            this.$emit("choicePay",item);
        },
        closeWin(){
            this.$emit('close')
        }
    },
    mounted : function(){
        
    },
    destroyed : function(){

    },
    store
};  
</script>
<style lang="less" scoped>
.car-mesking{
    width: 10rem;
    height: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 66;
    .ways{
        width: 7.6rem;
        height: auto;
        text-align : left;
        background-color: #fff;
        position: absolute;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        .w-title{
            width: 100%;
            height: 1.3rem;
            line-height: 1.3rem;
            background-color: #efb33f;
        }
        .w-text{
            width: 100%;
            height: 100%;
            position: relative;
            text-align: center;
            font-size: 0.45rem;
            color: #fff;
        }
        .w-img{
            width: 0.21rem;
            height: 0.35rem;
            position: absolute;
            top: 0.475rem;
            line-height: 0.35rem;
            img{
                width: 100%;
                 height: 100%;
            }
        }
        .way{
            float: left;
            margin-left: 0.7rem;
            border-bottom: 1px solid #D4D5D6;
            width: 6.9rem;
            height: 1.6rem;
            font-size: 0.4rem;
            color: #666;
            line-height: 1.6rem;
            position: relative;
            &:last-child{
                border-bottom : none;
            }
        }
        .font-gray{
            color : #d0afaf;
        }
    }
}
</style>


