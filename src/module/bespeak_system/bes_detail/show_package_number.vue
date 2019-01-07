<template>
     <div class="pay-list" style="height: auto;">
        <slot name="paygoods"></slot>
        <div class="pay-package" v-for="(goods,index) in packages.goods" :key="index">
            <div class="package-goods">
                <div class="pay-goodsName fl">
                    {{goods.name}}
                    <template v-for="attr in goods.attr">
                        <!--({{attr.attrName}})-->
                        <template v-for="names in attr.arrName">
                            ({{names}} )
                        </template>
                    </template>
                </div>
                <div class="pay-goodsNum fl">×{{goods.num}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return {

            }
        },
        props: {
            packages: null
        }
    }
</script>

<style lang="less" scoped>
  
</style>