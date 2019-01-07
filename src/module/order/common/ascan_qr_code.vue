<template>
    <div id="">
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    let wx_sdk = null;
    export default {
        data(){
            return {
              
            }
        },
        methods: {
         
        },
        async mounted(){
        wx_sdk = await import(  /*webpackChunkName: "wx_sdk"*/ 'src/manager/platform_sdk')
        wx_sdk = wx_sdk.default;
        await wx_sdk.registerWXSDK();
        await wx_sdk.ascanQRCode();
        }
    }
</script>

<style lang="less" scoped>
</style>
