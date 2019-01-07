<template>
    <div id=""></div>
</template>

<script>
	import utils from "src/verdor/utils";
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    var oid = utils.getQueryString('oid');
    var staffId = utils.getQueryString('staffId');
    var type = utils.getQueryString('type');
    let wx_sdk = null;
    export default {
        data(){
            return {
              oid:oid,
              staffId:staffId,
            }
        },
        methods: {
         async paySwOrder(){
            let data = await http.paySwOrder({
                data:{
                    shopId:this.shopId,
                    oid:oid,
					staffId:staffId,
					type:type
                }
            })
            wx_sdk.pay(data.payParam).then(()=>{
               this.$store.commit("setWin",{content:"成功",callBack:()=>{
						wx_sdk.closeWindow();
					}});
            },()=>{
                 this.$store.commit("setWin",{content:"失败",callBack:()=>{
						wx_sdk.closeWindow();
					}});
            });
         }
        },
        async mounted(){
        wx_sdk = await import(  /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
        wx_sdk = wx_sdk.default;
        await wx_sdk.registerWXSDK();
        await this.paySwOrder();
       
        }
    }
</script>

<style lang="less" scoped>
</style>
