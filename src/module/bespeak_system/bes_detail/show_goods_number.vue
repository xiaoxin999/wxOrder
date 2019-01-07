<template>
    <div class="pay-list">
        <div class="pay-goods">
            <div class="fl" style="height: 100%;width: 65%;line-height: 1.5;" v-if="goods.attr.length>0">
                <div class="pay-name fl" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    {{goods.goodsName}}
                </div>
                <div class="pay-name fl" style="height: 50%;width: 100%;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;color: #777;">
                    <template v-for="(attr,i) in goods.attr">
                        {{attr.name[i].split(':').join('￥')}}
                    </template>
                </div>
            </div>
            <div class="pay-name fl" v-else>
                {{goods.goodsName}}
            </div>
            <slot name="content"></slot>
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
            goods: {
                type: [Object,Array]
            }
        }
    }
</script>

<style lang="less" scoped>
  
</style>