<template>
    <section class="order">
        <div class="content">
            <keep-alive>
                <router-view v-if="$route.meta.keepAlive"></router-view>
            </keep-alive>

            <router-view v-if="!$route.meta.keepAlive"></router-view>
        </div>
        <div class="car">
            <order-car></order-car>
        </div>
    </section>
</template>

<script>
/* eslint-disable */
	import store from 'src/module/order/data/details_store';
    export default{
        components:{
            orderCar:()=>import ( /*webpackChunkName: "order_car" */ 'src/module/order/new/order/order_car')
        }
    }
</script>

<style lang="less" scoped>

    .order{
        height:100%;
        .content{
            height:calc(~"100% - 1.4267rem");
            
        }
    }

</style>
