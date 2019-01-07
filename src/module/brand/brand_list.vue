<template>
    <div class="brand-list" id="brand-list">
        <template v-for="(item,i) in brandList">
            <div class="brand-Box" :key="i"  :style="{backgroundImage: 'url(' + uploadUrl + item.minImage + ')'}" @click="getDetail(item)" >
                <!-- <div class="brand-title">{{item.nickName}}</div> -->
            </div>
        </template>
        <div class="brand-Box" style="background-color: #FFFFFF;" v-if="brandList && brandList.length <= 2">
            <div class="brand-tips">
                没有更多品牌，敬请期待哦～
            </div>
        </div>
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';
    export default {
        data(){
            return {
                brandList: '', // 品牌列表
                uploadUrl: '' //图片路径
            }
        },
        methods: {
            async getUserInfo(){
                let res = await http.getUserInfo({
                    data: {
                        shopId: this.shopId,
                        type: 3,
                        from: 0
                    }
                })
                let loginInfo = storage.session('login');
                Object.assign(res,loginInfo);
                storage.session('userDate',res)
                this.uploadUrl = global.getImgUrl();
                this.getList()
            },
            async getList(){
                let res = await http.get({
                    data: {
                        shopId: this.shopId
                    }
                })
                this.brandList = utils.sortByAll(res,'sort');
            },
            getDetail(item){
                storage.session('brandDetail', item);
                this.$router.push('/brandDetail');
            }
        },
        mounted(){
            let userDate = storage.session('userDate');
            if (userDate == null) {
                this.getUserInfo();
            } else {
                this.uploadUrl = global.getImgUrl();
                this.getList();
            }
            utils.setTitle('我们的品牌');
        }
    }
</script>

<style  lang="less" scoped>
.brand-list {
  width: 100%;
  height: auto;
  min-height: 100%;
  background-color: #FFFFFF;
  overflow: hidden; }
  .brand-list .brand-Box {
    width: 100%;
    height: 5.37333rem;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
    overflow: hidden; }
    .brand-list .brand-Box .brand-title {
      width: 100%;
      height: 1.25333rem;
      line-height: 1.25333rem;
      color: #FFFFFF;
      text-align: center;
      font-size: 0.48rem;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      -webkit-transform: translate(-50%, -50%);
      z-index: 5; }
    .brand-list .brand-Box .brand-tips {
      width: 100%;
      height: 1.6rem;
      font-size: 0.34667rem;
      color: #747474;
      line-height: 2.4rem;
      text-align: center;
      background: url(../../res/images/brand-tip.png) center 0.26667rem no-repeat;
      background-size: 1.2rem 0.53333rem;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      -webkit-transform: translate(-50%, -50%);
      z-index: 5; }
</style>

