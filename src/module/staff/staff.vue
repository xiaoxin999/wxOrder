<template>
    <div id="staff" v-cloak>
        <div class="affirm-box">
            <img src="../../res/images/affirm.png" alt="确认" style="width: 93px;height: 93px;" />
        </div>
        <div  style="text-align: center; ">
            <h2 style="width: 100%;height: 45px;line-height: 45px;font-size: 24px;">操作提示</h2>
            <p style="width: 100%;height: 45px;line-height: 45px;font-size:14px;margin-bottom: 20px;color: #666;">你确定要绑定该用户，成为管理员吗?</p>
        </div>
        <a href="javascript:void(0)" class="bind-btn" style="background-color: #1aac19;color: #fff;border: 1px solid #1e9f1d;margin-bottom: 15px;" @click="addStaffInfo">绑定</a>
    </div>
</template>

<script>
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';
    import http from 'src/manager/http';

    var userDate = storage.session("login");
    var code = utils.getQueryString('code')||'test';

    export default{
        data(){
            return {
                openId:userDate.openId
            }
        },
        methods : {
            async addStaffInfo(){
                let data = await http.addStaffInfo({data:{
                    shopId: this.shopId,
                    openId: this.openId
                }})

                if(data){
                    this.$store.commit("setWin",{title:"操作提示",content:"绑定成功",callBack:()=>{
                        //关闭微信游览器
                       this.$closeWindow();
					}});
                }

            }
        },
        mounted(){
            utils.setTitle('权限绑定');
        }
    }
</script>

<style scoped>

    .affirm-box {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        height: 150px;
        width: 1920px;
    }
    
    .bind-btn {
        width: 80%;
        height: 45px;
        line-height: 45px;
        border-radius: 10px;
        text-align: center;
        display: block;
        position: relative;
        left: 50%;
        transform: translate(-50%, 0);
        -webkit-transform: translate(-50%, 0);
    }

</style>
