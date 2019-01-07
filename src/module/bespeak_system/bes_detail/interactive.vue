<template>
    
</template>

<script>
    export default {
        name: 'Interactive',
        data(){
            return {
                // reserveTime: this.reserveTime,
                // name: this.names,
                // num: this.nums,
                // phone: this.phones,
                // remark: this.remark,
            }
        },
        props: {
            isEdit: {
                type: Boolean,
                default: true
            },
            reserveTime: null,
            names: {
                type: null
            },
            nums: {
                type: null
            },
            phones: {
                type: null
            },
            remark: {
                type: null
            },
        }
    }
</script>

<style lang="less" scoped>
    .pay-concent{
        width: 100%;
        height: auto;
        background-color: #ffffff;
        margin-bottom: 0.2rem;
        overflow: hidden; 
        .pay-box{
            width: 100%;
            height: 1.25333rem;
            line-height: 1.25333rem;
            position: relative;
            .pay-shouBox{
                width: calc(100%);
                height: 1.25333rem;
                margin-left: 0.4rem;
                font-size: 0;
                border-bottom: 1px solid #dddddd;
                box-sizing: border-box;
                span{
                    width: 30%;
                    height: 1.25333rem;
                    font-size: 0.34667rem;
                    color: #333333;
                }
                span.more-Tbale {
                    position: absolute;
                    right: 0.93333rem;
                    top: 0.45333rem;
                    width: 0.21333rem;
                    height: 0.33333rem;
                    background: url(../../../res/images/moretable.png) no-repeat;
                    background-size: 0.21333rem 0.33333rem; 
                }
                input{
                    outline: none;
                    border: none;
                    padding: 0;
                    width: 70%;
                    height: 1.17333rem;
                    font-size: 0.34667rem !important;
                    color: #999999;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    box-sizing: border-box;
                }
                .inputWidth {
                    width: calc(100% - 3.26667rem);
                    height: 1.17333rem; 
                }
                div {
                    width: calc(50% - 30px);
                    height: 1.13333rem;
                    line-height: 1.13333rem;
                    font-size: 0.32rem !important;
                    color: #999999;
                    float: left;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }
    input[type="text"]:disabled{
        background-color: #fff !important;
    }
</style>

