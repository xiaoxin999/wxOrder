<template>
    <div class="goodsList" v-bind:class="{agoods: agcWidth, bgoods: bgcWidth}">
        <p class="p_tit" v-if='ptit'>———— 特色饮品(3款中选1款) ————</p>
        <section v-for="(item, index) in goodsList" :key='index'>
            <img src="../res/images/hot.png" alt="" class="hot" v-if="item.hot == 1">
            <div class="img_sq" v-if='item.socket == 0'>
                <img src="../res/images/sq.png" alt="">
            </div>
            <div class="div_wrap">
                <img :src="getUrl(item.imageName)" alt="图" class="img_left" @click="goodsDetail(item,index)">
            </div>

            <div class="se_right" :class="{se_search:aseRightw,se_right:bseRightw}">
                <div class="goodsName">{{item.goodsName}} </div>
                <span class="dashed"></span>
                <div class="kou_w">
                    <span class="kind" v-if="!item.packageName && item.isAttr">口味</span>
                    <span class="kind tc" v-if="item.packageName">套餐</span>
                    <span class="kind jl" v-if="!item.packageName && item.type == 1">斤两</span>
                </div>
                <div class="price">￥{{item.price}}</div>
                <div class="vipPirce" v-if='member'>
                    <span class="bg_span">￥{{item.vipPrice}}
                        <span>会员价</span>
                    </span>
                </div>
                <!-- <div class="kou_wei"> <span>选规格</span></div> -->
                <riskAdd :counter="item.counter" :index="index" class="btn_add" @sendCounter='getCounter'></riskAdd>
            </div>
            <!-- <p class="xian" v-if="xian"></p> -->
        </section>

    </div>
</template>
<script>
    import utils from 'src/verdor/utils';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    export default {
        props: {
            goodsList: {
                type: Array,
                default: []
            },
            goodsName: {
                type: String,
                default: ''
            },
            imageName: {
                type: String,
                default: ''
            },
            memberInfo: {
                type: String,
                default: ''
            },
            index: {
                type: Number,
                default: 0
            },
            packageName: {
                type: String,
                default: ''
            },
            counter: {
                type: Number,
                default: 0
            },
            price: {
                type: Number,
                default: 0
            },
            vipPrice: {
                type: Number,
                default: 0
            },
            isAttr: {
                type: String,
                default: ""
            },
            type: {
                type: Number,
                default: 0
            },
            hot: {
                type: Number,
                default: 1
            },
            member: {
                type: Boolean,
                default: true
            },

            agcWidth: {
                type: Boolean,
                default: true
            },
            bgcWidth: {
                type: Boolean,
                default: false
            },
            aseRightw: {
                type: Boolean,
                default: true
            },
            bseRightw: {
                type: Boolean,
                default: false
            },
            ptit: {
                type: Boolean,
                default: false
            },
            xian: {
                type: Boolean,
                default: false
            }

        },
        data() {
            return {
                data: {},
                isSelectShop: Boolean(storage.session('select-shop')),
            };
        },
        methods: {
            getUrl(imageName) {
                return global.getImgUrl({
                    imageName
                })
            },
            goodsDetail(item, index) {
                this.$emit('toGoodsDetail', item, index);
            },
            getCounter(index, counter) {
                // console.log(index,counter)
            }

        },
        mounted() {
            console.log("mounted")
        },
        computed: {

        },
        components: {
            riskAdd: () =>
                import ( /* webpackChunkName: "risk_add" */ "../components/riskAdd/risk_add.vue"),
        },
    }

</script>
<style lang='less' scoped>
    @import '../res/css/base.less';
    .goodsList {
        width: 78%;
        overflow: auto;
        position: relative;
        left: 2%;
        height: 100%;
        section {
            position: relative;
            width: 100%;
            display: flex;
            height: 3.8667rem;
            clear: both;
            margin-top: 0.28rem;
            background: #fff;
            .div_wrap {
                position: relative;
                width: 5.1333rem;
                height: 3.8667rem;
                /* margin-top: -2px; */
                /* margin-right: 18px; */
                /* margin-bottom: 4px; */
                float: left;
                overflow: hidden;
                background-position: 50%;
                background-size: cover;
                border-radius: 4px;
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
                z-index: 0;
                .img_left {
                    // float: left;
                    // height: 3.8667rem;
                    padding: 0 0.2rem 0 0rem; // width: 5.3333rem;
                    position: absolute;
                    top: 50%;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    -webkit-transform: translateY(-50%);
                    transform: translateY(-50%);
                    overflow: hidden;

                }
            }

            .img_sq {
                float: left;
                height: 100%;
                padding: 0 0.2rem 0 0rem;
                position: absolute;
                display: flex;
                align-items: center;
                background: rgba(0, 0, 0, .5);
                width: 4.88rem;
                z-index: 199;
                img {
                    width: 100%;
                }
            }
            .se_right {
                width: 2.5333rem;
                margin: 0.2rem 0.2rem 0 0;
                text-align: justify;
                .goodsName {
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .dashed {
                    display: block;
                    width: 100%;
                    background: url(../res/images/dashed.png) center no-repeat;
                    height: 4px;
                    margin-top: 0.2rem;
                    margin-bottom: 0.2rem;
                }
                .kou_w {
                    width: 100%;
                    clear: both;
                    height: 0.6rem;
                    .kind {
                        width: 1.02rem;
                        height: 0.4rem;
                        border: 1px solid #FCAE02;
                        color: #FCAE02;
                        font-size: 0.2933rem;
                        line-height: 0.4rem;
                        text-align: center;
                        border-radius: 0.4rem;
                        float: left;
                        margin: 0 0.1rem 0 0;
                        padding: 0 0.1rem;
                    }
                    .tc {
                        border: 1px solid #FC5B02;
                        color: #FC5B02;
                    }
                    .jl {
                        border: 1px solid #C68850;
                        color: #C68850;
                    }
                }

                .price {
                    text-align: left;
                    padding: 0.01rem;
                    color: #FF2035;
                    margin: 0rem 0 0.1rem 0;
                    font-size: 0.32rem;
                    float: none;
                }
                .vipPirce {
                    // clear: both;
                    display: inline-block;
                    margin-bottom: 0.04rem;
                }
                .bg_span {
                    background: pink;
                    color: #FF2035;
                    display: inline;
                    span {
                        font-size: 0.2133rem;
                    }

                }
                .kou_wei {
                    width: 100%;
                    text-align: right;
                    margin: 0.1rem 0 0.1rem 0;

                    span {
                        display: inline-block;
                        width: 1.2333rem;
                        height: 0.5667rem;
                        background: #FCAE02;
                        color: #fff;
                        text-align: center;
                        line-height: 0.5667rem;
                        border-radius: 100px;
                        margin-bottom: 0.02rem;
                        font-size: 0.24rem;
                    }
                }

            }
        }
    }

    .goodsList section .bWidth {
        width: 5.3333rem;
    }

    .goodsList section .aWidth {
        width: 2.7467rem;
        height: 2rem;
    }

    .goodsList section .hot {
        position: absolute;
        widows: 0.9333rem;
        height: 1.0667rem;
        left: 0.5rem;
    }

    .goodsList section:last-child {
        margin-bottom: 1rem;
    }

    .agoods {
        width: 96%;
        background: #fff;
        .p_tit {
            text-align: center;
            background: #fff;
            color: #8e8e8e;
            padding: 0.4rem 0;
            border-bottom: 1px solid #eaeaea;
        }
        section {
            .se_search {
                width: 6.9333rem;
                margin: 0.2rem 0.2rem 0 0;
                text-align: justify;
                position: relative;
                .goodsName {
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                }
                .dashed {
                    display: block;
                    background: url('../res/images/dashed.png') center no-repeat;
                    height: 4px;
                    margin-top: 0.1rem;
                    background-size: 100%;
                    width: 80%;
                    margin-bottom: 0.1rem;
                }
                .price {
                    float: left;
                    margin-right: 0.1rem;
                }
                .vipPirce {
                    clear: none;

                }

            }
        }
    }

    .bgoods {
        width: 78%;

    }

    .agoods section .se_right {
        margin: 0.1rem 0.2rem 0 0;
    }
    .agoods section {
        position: relative;
        width: 100%;
        display: -webkit-box;
        display: -webkit-flex;
        display: flex;
        height: 2.4rem;
        clear: both;
        margin-top: 0.28rem;
        background: #fff;
    }

    .agoods section .div_wrap {
        position: relative;
        width: 2.76rem;
        height: 2rem;
        float: left;
        overflow: hidden;
        background-position: 50%;
        background-size: cover;
        border-radius: 4px;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        z-index: 0;
        .img_left {
            width: 2.76rem;
            height: 2rem;

            padding: 0 0.2rem 0 0rem;

            position: absolute;
            top: 50%;
            left: 0;
            height: 100%;
            width: 100%;
            -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
            overflow: hidden;
        }

    }

    .btn_add {
        display: inline-block;
        float: right;
    }

    .xian {
        width: 100%;
        height: 0.2rem;
        border-bottom: 1px solid #eaeaea;
    }

</style>
