<template>
   <div id="chose-bill">
        <div class="bill-message" v-for="(item,index) in list" :key="index">
            <div class="bill-title"  @click="toPagePays(item)">
                <p>{{item.invoiceHeader}}</p>
            </div>
            <div class="bill-rede">
                <div class="bill-del fr">
                    <div class="write" @click="writeBill(item)">
                        <p>编辑</p>
                    </div>
                    <div class="delete" @click="delBill(item,index)">
                        <p>删除</p>
                    </div>
                </div>			
            </div>
        </div>	
        <div v-if="list == null || list.length < 1" class="hint">
            <p>当前没有任何发票，去添加吧！</p>
        </div>
        <button v-on:click="toPageBill">新增</button>
    </div>
</template>

<script>
    import http from 'src/manager/http';
    import global from 'src/manager/global';
    import storage from 'src/verdor/storage';
    import utils from 'src/verdor/utils';

    export default {
        name: 'choseBill',
        data() {
            return {
                list : [],
                fid : ''
            }
        },
        methods: {
            toPagePays(item){
                storage.session('billDetail',item);
                this.$router.push('/pay'); // 跳转本地链接
            },
            writeBill(item){
                this.$router.push('/addBill');
                storage.session('lists',item)
            },
            delBill(item,index){
                this.$store.commit('setWin',{
                    type: 'confirm',
                    content: '确认删除发票?',
                    callBack: (str)=>{
                        if(str == 'ok'){
                            this.deleteInvoice(item,index)
                        }
                    }
                })
            },
            async deleteInvoice(item,index){
                let res = await http.deleteInvoice({
                    data: {
                        id: item.id,
                        shopId: this.shopId
                    }
                })
                this.list.splice(index, 1);
                storage.session('billList',this.list);
            },
            toPageBill(){
                this.$router.push('/addBill')
            },
            getBillList(){
                this.list = storage.session('billList');
            },
        
        },
        mounted(){
            this.getBillList();
          
            utils.setTitle("发票信息");
        }
    }
</script>

<style lang="less" scoped>

#chose-bill {
	width: 100%;
	height: 100%;
    color: #333;
    .bill-message {
        width: 100%;
        height: 2.53333rem;
        background: #fff;
        margin-bottom: 0.26667rem;
        .bill-title {
            width: 100%;
            height: 1.69333rem;
            padding: 0rem 0.66667rem;
            box-sizing: border-box;
            display: -webkit-box;
            display: -webkit-flex;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-align-items: center;
            border-bottom: 2px #E1E1E1 solid;
            background: url(../../../res/images/more.png) no-repeat 90% center;
            background-size: 0.21333rem 0.34667rem;
            font-size: 0.34667rem;
            color: #333
        }
    }
    .bill-rede {
        width: 100%;
        height: 0.8rem;
        padding: 0rem 0.66667rem;
        box-sizing: border-box;
        color: #A8A7A7;
        .bill-del {
            width: 3.33333rem;
            height: 0.8rem;
            display: -webkit-box;
            display: -ms-flexbox;
            display: -webkit-flex;
            display: flex;
            .write {
                width: 1.33333rem;
                height: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                -webkit-justify-content: space-between;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: space-between;
                background: url(../../../res/images/icon-redact.png) no-repeat center left;
                background-size: 0.36rem 0.4rem;
                p {
                    margin-left: 0.53333rem
                }
            }
            .delete {
                width: 1.33333rem;
                height: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                -webkit-justify-content: space-between;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: space-between;
                margin-left: 0.74667rem;
                background: url(../../../res/images/icon-delect.png) no-repeat center left;
                background-size: 0.38667rem 0.41333rem;
                p {
                    margin-left: 0.53333rem
                }
            }
        }
    }
    .hint {
        width: 100%;
        height: 2.66667rem;
        padding-top: 1.86667rem;
        color: #cdcdcd;
        font-size: 0.37333rem;
        background: url(../../../res/images/hint.png) no-repeat;
        background-position: center 40%;
        background-size: 1.44rem 1.41333rem;
        display: block;
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-align-items: center;
        -webkit-justify-content: center;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
    }
    button {
        border: none;
        display: block;
        width: 8.58667rem;
        height: 1.26667rem;
        background: #EAA944;
        color: #fff;
        font-size: 0.48rem;
        margin: 0.53333rem auto;
        border-radius: 0.10667rem
    }
}
</style>

