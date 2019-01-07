<template>
    <div class="attrWin" >
        <div class="attrConten">
            <div class="attr-concent">
                <template v-for="(goods,i) in packagesAttr">
                    <div class="attrHead" :key="goods.id + i">{{goods.goodsName}}<span>({{goods.packageGoodsNum}}份)</span></div>
                    <div class="attrBox" :key="goods.attr + i">
                        <!-- 单选口味 -->
                        <template v-for="(attrs,j) in goods.attr" v-if="attrs.attr == '1'">
                            <div class="attrName" :key="attrs.id + '_' + i*i">{{attrs.name}}</div>
                            <div class="attrOptions" :key="attrs.options + i + j + '____'">
                                <span v-for="(options,k) in attrs.options" :key="options.name + i + j + '_'" v-bind:class="['arrtMultiselect', { 'on': options.attrStatu}]" @click="getAttrDetail(i,j,k,attrs,options)">{{options.name}}</span>
                            </div> 
                        </template>
                        <!-- 多选口味 -->
                        <template v-for="(attrs,j) in goods.attr" v-if="attrs.attr == '0'">
                            <div class="attrName" :key="attrs.name + i + 't'">{{attrs.name}}</div>
                            <div class="attrOptions" :key="i + j + 'sd'">
                                <span v-for="(options,k) in attrs.options" :key="options.name + i + 'mm'" v-bind:class="[options.attrStatu ? 'on' : '']" @click="getAttrDetail(i,j,k,attrs,options)">{{options.name}}</span>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
            <div class="attrClose" @click="confirmAttr"></div>
            <div class="attrFooter">
                <a href="javascript:void(0)" class="del" @click="confirmAttr('del')">删除</a>
                <a href="javascript:void(0)" class="confirm" @click="confirmAttr('confirm')">确定</a>
            </div>
        </div>
    </div>
</template>

<script>
    
    import utils from 'src/verdor/utils';

    let orderData = null;
    export default {
        data(){
            return {
                parentIndex: 0
            }
        },
        props: {
            packagesAttr: {
                type: Array
            },
            Multiselect : {
                type: null
            },
			packageGoods: {
                type: null
            },
			fixedPackages: {
                type: null

            },
			packageSub: {
                type: null

            },
            isRevise: {
                type: Boolean
            }
        },
        mounted(){

        },
        methods: {
            getAttrDetail(i, j, k, attr, options) {
            // 选择口味
                if (!Number(attr.attr)) {
                    // 单选口味
                    var arr2 = attr.options;
                    var num = 0;
                    options.attrStatu = !options.attrStatu;
                    for (var h = 0; h < arr2.length; h++) {
                        if (arr2[h].attrStatu) {
                            num++;
                            if (num >= 1) {
                                arr2[h].attrStatu = false;
                                arr2[k].attrStatu = true;
                            }
                        }
                    }
                } else {
                    // 多选口味
                    options.attrStatu = !options.attrStatu;
                }
                var arr = utils.deepCopy(this.packagesAttr);
                arr[i].attr[j].options.splice(k,1,options);
                this.$emit('changePackagesAttr',arr)
            },
            confirmAttr: function(type) {
                //保存 or 删除
                if (type == "confirm") {
                    // 保存口味数据
                    var arr;
                    if (this.Multiselect) {
                    // 保存可选套餐口味
                        arr = utils.deepCopy(this.packageGoods);
                    } else {
                    // 保存固定套餐口味
                        arr = utils.deepCopy(this.fixedPackages);
                    }
                     
                    var gid = this.packagesAttr[0].id;
                    var pid = this.packagesAttr[0].packageTagId;
                    var attrKye = "";
                    var attrInfo = "";
                    for (var i = 0; i < arr.length; i++) {
                        for (var j = 0; j < arr[i].goods.length; j++) {
                            arr[i].goods[j].attrInfo = '';
                            if (arr[i].goods[j].id == gid) {
                                // 判断是否超出最大口味数量
                                arr[i].goods[j] = utils.deepCopy(this.packagesAttr[0]);
                                if (arr[i].goods[j].num <= arr[i].goods[j].packageGoodsNum) {
                                    if (!this.isRevise) {
                                        if (orderData.checkGoodsNum(this,arr[i].goods[j])) {
                                            arr[i].goods[j].num++;
                                        } else {
                                            return false;
                                        }
                                    }
                                }
                                // 判断是否选择口味
                                var arrList = [];
                                var attr = arr[i].goods[j].attr;
                                arrList = attr;

                                //显示口味数组
                                if (utils.isEmptyObject(arr[i].goods[j].attrList)) {
                                    var attrs = arrList;
                                    var onAttr = false;
                                    for (var m = 0; m < arrList.length; m++) {
                                        for (let n = 0; n < arrList[m].options.length; n++) {
                                            if (arrList[m].options[n].attrStatu) {
                                                attrKye += arrList[m].id + arrList[m].options[n].name + arrList[m].options[n].price;
                                                onAttr = true;
                                                attrInfo += `(${arrList[m].options[n].name})`;
                                            }
                                        }
                                    }
                                    if (onAttr) {
                                    arr[i].goods[j].attrList.push({
                                        attrs: utils.deepCopy(arrList),
                                        showAttr: false
                                    });
                                    } else {
                                    arr[i].goods[j].attrList.push({
                                        attrs: utils.deepCopy(arrList),
                                        showAttr: true
                                    });
                                    }
                                } else {
                                    // 判断是否为修改口味
                                    var attrs = arrList;
                                    var onAttr = false;
                                        attrKye = "";
                                    for (var m = 0; m < arrList.length; m++) {
                                        for (let n = 0; n < arrList[m].options.length; n++) {
                                            if (arrList[m].options[n].attrStatu) {
                                                attrKye += arrList[m].id + arrList[m].options[n].name + arrList[m].options[n].price;
                                                onAttr = true;
                                                attrInfo += `(${arrList[m].options[n].name}) `;
                                            }
                                        }
                                    }
                                    if (this.isRevise) {
                                        arr[i].goods[j].attrList[
                                            this.parentIndex
                                        ].attrs = utils.deepCopy(arrList);
                                        if (onAttr) {
                                            arr[i].goods[j].attrList[this.parentIndex].showAttr = false;
                                        } else {
                                            arr[i].goods[j].attrList[this.parentIndex].showAttr = true;
                                        }
                                    } else {
                                        if (arr[i].goods[j].num <= arr[i].goods[j].packageGoodsNum) {
                                            if (onAttr) {
                                                arr[i].goods[j].attrList.push({
                                                    attrs: utils.deepCopy(arrList),
                                                    showAttr: false
                                                });
                                            } else {
                                                arr[i].goods[j].attrList.push({
                                                    attrs: utils.deepCopy(arrList),
                                                    showAttr: true
                                                });
                                            }
                                        }
                                    }
                                }

                                if (utils.isEmptyObject(arr[i].goods[j].attrList)) {
                                    arr[i].goods[j].isAttr = false;
                                } else {
                                    arr[i].goods[j].isAttr = true;
                                }
                                var tagGoods = this.packageSub;
                                for (var h = 0; h < tagGoods.length; h++) {
                                    for (var k = 0; k < tagGoods[h].goods.length; k++) {
                                        if (gid == tagGoods[h].goods[k].id && tagGoods[h].id == pid) {
                                            this.packagesAttr[0].num++;
                                            tagGoods[h].goods[k] = utils.deepCopy(arr[i].goods[j]);
                                        }
                                    }
                                }
                            }
                            arr[i].goods[j].attrKye = attrKye;
                            arr[i].goods[j].attrInfo = attrInfo;
                        }
                    }

                    console.log(JSON.stringify(arr))

                    if (this.Multiselect) {
                        this.$emit('isChangeAttr',{
                            type: 'packageGoods',
                            payload: {
                                packageGoods: arr
                            }
                        })
                    } else {
                        this.$emit('isChangeAttr',{
                            type: 'fixedPackages',
                            payload: {
                                fixedPackages: arr
                            }
                        })
                    }
                } else if (type == "del") {
                    // 保存删除口味数据
                    var arr1;
                    if (this.Multiselect) {
                        arr1 = utils.deepCopy(this.packageGoods);
                    } else {
                        arr1 = utils.deepCopy(this.fixedPackages);
                    }
                    var gid = this.packagesAttr[0].id;
                    var tagGoods = this.packageSub;
                    for (var i = 0; i < arr1.length; i++) {
                        for (var j = 0; j < arr1[i].goods.length; j++) {
                            if (arr1[i].goods[j].id == gid) {
                                arr1[i].goods[j].attrList.splice(this.parentIndex, 1);
                                if (arr1[i].goods[j].packageGoodsNum != 0) {
                                    arr1[i].goods[j].num--;
                                }
                                if (arr1[i].goods[j].num == 0) {
                                    arr1[i].goods[j].attrList = [];
                                }
                                if (this.Multiselect) {
                                    if (utils.isEmptyObject(arr1[i].goods[j].attrList)) {
                                    arr1[i].goods[j].onAttr = false;
                                    }
                                    //                                      tagGoods[i].goods[j] = utils.deepCopy(arr1[i].goods[j]);
                                } else {
                                    arr1[i].goods[j].onAttr = false;
                                }

                                for (var k = 0; k < tagGoods.length; k++) {
                                    if (tagGoods[k].id == arr1[i].id) {
                                        tagGoods[k] = utils.deepCopy(arr1[i]);
                                    }
                                }
                            }
                        }
                    }
                    if (this.Multiselect) {
                        let packageGoods = utils.deepCopy(arr1);
                        this.$emit('isChangeAttr',{
                            type: 'packageGoods',
                            payload: {
                                packageGoods
                            }
                        })
                    } else {
                        let fixedPackages = utils.deepCopy(arr1);

                        this.$emit('isChangeAttr',{
                            type: 'fixedPackages',
                            payload: {
                                fixedPackages
                            }
                        })
                    }
                    this.$emit('changePackagesAttr',[])

                } else {
                    // 什么都不做 关闭弹窗
                    this.$emit('isChangeAttr',{
                        type: 'noChangeAndClose',
                        payload: {
                            isRevise: false
                        }
                    })
                }
            },
        },
        async mounted(){
            orderData = await import(/* webpackChunkName:'order_data' */'src/module/order/data/order_data.js');
            orderData = orderData.default;
        }   
    }
</script>

<style lang="less" scoped>
.attrWin {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
  overflow: hidden; }
  .attrWin .attrConten {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 9.33333rem;
    height: auto;
    max-height: 70%;
    min-height: 2rem;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%); }
    .attrWin .attrConten .attr-concent {
      padding: 0.6rem 0.4rem;
      padding-bottom: 0;
      width: 9.33333rem;
      height: auto;
      border-radius: 8px 8px 0 0;
      -webkit-border-radius: 8px 8px 0 0;
      background-color: #ffffff;
      overflow: hidden; }
    .attrWin .attrConten .attrClose {
      position: absolute;
      right: 0.33333rem;
      top: -0.41333rem;
      width: 0.82667rem;
      height: 0.82667rem;
      background: url(../../../res/images/pop-btn-del.png) center center no-repeat;
      background-size: 0.82667rem 0.82667rem; }
    .attrWin .attrConten .attrHead {
      width: 100%;
      height: 1.06667rem;
      line-height: 1.06667rem;
      display: block;
      border-bottom: dashed 1px #999999;
      color: #000000;
      font-size: 0.45333rem;
      overflow: hidden; }
      .attrWin .attrConten .attrHead span {
        display: inline-block;
        font-size: 0.34667rem;
        margin-left: 0.2rem; }
    .attrWin .attrConten .attrBox {
      width: 100%;
      max-height: 8rem;
      height: auto;
      overflow-x: scroll; }
      .attrWin .attrConten .attrBox .attrName {
        width: 100%;
        height: 0.8rem;
        line-height: 0.8rem;
        color: #777777;
        font-size: 0.34667rem; }
      .attrWin .attrConten .attrBox .attrOptions {
        width: 100%;
        height: auto;
        line-height: 0.66667rem;
        overflow: hidden; }
        .attrWin .attrConten .attrBox .attrOptions span {
          display: inline-block;
          padding: 0.13333rem 0.33333rem;
          color: #f5a623;
          background-color: #FFFFFF;
          margin-bottom: 0.26667rem;
          margin-right: 0.26667rem;
          border: 1px solid #f5a623;
          font-size: 0.32rem; }
          .attrWin .attrConten .attrBox .attrOptions span.on {
            color: #FFFFFF;
            background-color: #f5a623; }
          .attrWin .attrConten .attrBox .attrOptions span.arrtMultiselect {
            border-radius: 8px;
            -webkit-border-radius: 8px; }
  .attrWin .attrFooter {
    width: 100%;
    height: 1.33333rem;
    line-height: 1.33333rem;
    font-size: 0; }
    .attrWin .attrFooter a {
      display: inline-block;
      width: 50%;
      height: 1.33333rem;
      text-align: center;
      color: #999;
      font-size: 0.42667rem; }
      .attrWin .attrFooter a.del {
        background-color: #fff;
        border-right: 1px solid #e8e4de}
      .attrWin .attrFooter a.confirm {
        background-color: #fff;
        color: #f5a623;}
</style>

