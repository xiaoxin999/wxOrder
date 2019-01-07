<template>
    <div id="chose-address">
        <div class="chose-list" v-for="(item,index) in addressList" :key="index">
            <div  class="chose-detail" @click="toPagePays(item)">
                <template v-if="item.tag == 1">
                    <p class="chose-title fl" :class="item.tag==1 ? 'home' : ''">
                        家
                    </p>
                </template>
                <template v-if="item.tag == 2">
                    <p class="chose-title fl" :class="item.tag==2 ? 'company' : ''">
                        公司
                    </p>
                </template>
                <template v-if="item.tag == 3">
                    <p class="chose-title fl" :class="item.tag==3 ? 'school' : ''">
                        学校
                    </p>
                </template>
                <p class="fl person-detail">
                    <span>{{item.area}}{{item.address}}</span>				
                    <span>{{item.name}}
                        <template v-if="item.sex == 1">
                            先生	
                        </template>
                        <template v-else>
                            女士
                        </template>
                        &nbsp;&nbsp;{{item.mobile}}</span>								
                </p>
            </div>
            <div class="chose">
                <div class="fl chose-left" @click="defAddress(index)">
                    <span class="integral-off" :class="(item.status == '1') ? 'integral-on' : 'integral-off'">
                    </span>
                    <template v-if="item.status == '1'">
                        <span class="chose-add-on">默认地址</span>
                    </template>
                    <template v-else>
                        <span class="chose-add-off">设为默认</span>
                    </template>
                </div>
                <div class="write" @click="writeAddress(item,index)">
                    <p>编辑</p>
                </div>
                <div class="delete" @click="delAddress(item,index)">
                    <p>删除</p>
                </div>
            </div>
        </div>
        <div v-if="addressList == null || addressList.length < 1" class="hint">
            <p>当前没有任何地址，去添加吧！</p>
        </div>
        <div style="padding-top:1.3rem;">
            <div class="address-bottom" @click="toPageAddress" >
                <p>新增地址</p>
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
        data() {
            return {
                addressList : [],
                lists : [],
                status : false,
                token : storage.session('token'),
                district:"",
                getCityName:'' //当前省名字
            }
        },
        methods: {
            async getMoveFees(){
                let data = await http.getMoveFee({
                    data:{
                        shopId:this.shopId,
                        addressId:storage.session('addressDetail').id,
                        id:storage.session('selectPayWay') ? storage.session('selectPayWay').id : ''
                    }
                });
                // this.moveFees = Number(data);
                storage.seesion('moveFees',Number(data));
                
            },
            async defAddress(index){
                
                if(this.addressList[index].status=='1') return;

                let res = await http.setAddressDefault({
                    data:{
                        id : this.addressList[index].id,
                        shopId : this.shopId
                    }
                })
                for(let i = 0; i < this.addressList.length; i++){
                    this.addressList[i].status = '0';
                }
                this.addressList[index].status = 1;

                storage.session("addressList",this.addressList);
                
            },
            writeAddress(item,index){
                console.log(item,'item');
                storage.session('edit_address_detail',item);
                global.addAddress = null;

                this.district = item.area;
                console.log()
				let re =/(?:.*省)?(.*?市)/g;
				if(re.test(this.district)){
					this.district = RegExp.$1
				}
                let oo = storage.session("addressForsearch");
                let getCityData = storage.session("getCityData");
                this.getCityName = getCityData;
                console.log(oo,'oo')
                this.$router.push({path:"/addAddress",query:{index,cityName:this.district?this.district:getCityName}})
            },
            delAddress(item,index){
                this.$store.commit('setWin',{
                    type: 'confirm',
                    content: "确认删除此收货地址?",
                    callBack:(str)=>{
                        if(str==='ok'){
                            this.deleteAddress(item,index)
                        }
                    }
                })
            },
            async deleteAddress(item,index){
                let res = await http.deleteAddress({
                    data: {
                        id: item.id,
                        shopId: this.shopId,
                    }
                })
                this.addressList.splice(index, 1);
                storage.session('addressList',this.addressList);
            },
            toPageAddress(){
                global.addAddress = null;

                storage.session("edit_address_detail",null);
                this.$router.push('/addAddress');


            },
            getAddress(){
                this.addressList = storage.session('addressList');
            },
            toPagePays(item){
             
                 storage.session('addressDetail',item);
                let id = item.id;           
                this.$router.push({path:'/pay',query:{selectId:id}}); // 跳转本地链接
            },
          
        },
        mounted(){
            this.getAddress();
            utils.setTitle("选择地址");
        }
    }
</script>

<style lang="less" scoped>

#chose-address {
	width: 100%;
	height: 100%;
	position: relative;
	color: #333;
    font-size: 0.37333rem;
    .chose-list {
        width: 100%;
        height: auto;
        background: #fff;
        padding: 0.42667rem 0.42667rem 0;
        margin-bottom: 0.2rem;
        box-sizing: border-box;
        .chose-detail {
            width: 100%;
            height: auto;
            max-height: 1.86667rem;
            border-bottom: 1px #E5E5E5 solid;
            overflow: hidden;
            position: relative;
            .chose-title {
                display: inline-block;
                width: 0.8rem;
                height: 0.4rem;
                font-size: 0.29333rem;
                border-radius: 0.05333rem;
                text-align: center;
                line-height: 0.4rem;
                box-sizing: border-box;
                margin-top: 0.13333rem;
            }
        }
        .home {
            color: #F5A623;
            border: 1px solid #F5BF4F
        }
        .company {
            color: #6588d0;
            border: 1px solid #6588d0
        }
        .school {
            color: #14b9ae;
            border: 1px solid #14b9ae
        }
        .person-detail {
            display: -webkit-box;
            display: -ms-flexbox;
            display: -webkit-flex;
            display: flex;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-flex-direction: column;
            margin-left: 0.13333rem;
            font-size: 0.34667rem;
            width: calc(88.8%);
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            span:nth-of-type(1) {
                width: 100%;
                height: auto;
                max-height: 1.06667rem;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                line-height: 0.50667rem
            }
            span {
                margin-bottom: 0.26667rem
            }
        }
        .chose {
            width: 100%;
            height: 0.73333rem;
            display: -webkit-box;
            display: -ms-flexbox;
            display: -webkit-flex;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-align-items: center;
            .chose-left {
                width: 2.4rem;
                height: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                .integral-off {
                    display: block;
                    width: 0.42667rem;
                    height: 0.42667rem;
                    cursor: pointer;
                    background: url(../../../../res/images/chose-off.png) no-repeat;
                    background-position: 0 0;
                    background-size: 0.42667rem 0.42667rem
                }
            }
            .chose-left{
                .integral-on {
                    display: block;
                    width: 0.42667rem;
                    height: 0.42667rem;
                    cursor: pointer;
                    background: url(../../../../res/images/chose-on.png) no-repeat;
                    background-position: 0 0;
                    background-size: 0.42667rem 0.42667rem
                }
                .chose-add-off {
                    display: block;
                    font-size: 0.32rem;
                    color: #333;
                    margin-left: 0.16rem
                }
                .chose-add-on {
                    display: block;
                    font-size: 0.32rem;
                    color: #F5A623;
                    margin-left: 0.16rem
                }
            } 
            .chose-add {
                color: #333;
                font-size: 0.32rem;
                margin-left: 0.16rem
            }
            .write {
                width: 1.33333rem;
                height: 100%;
                margin-left: 3.73333rem;
                font-size: 0.32rem;
                color: #333;
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                background: url(../../../../res/images/redact.png) no-repeat center left;
                background-size: 0.34667rem 0.33333rem;
                p {
                    margin-left: 0.37333rem
                }
            }
            .delete {
                width: 1.33333rem;
                height: 100%;
                font-size: 0.32rem;
                color: #333;
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-align-items: center;
                margin-left: 0.74667rem;
                background: url(../../../../res/images/icon-delect.png) no-repeat center left;
                background-size: 0.32rem 0.37333rem;
                p {
                    margin-left: 0.34667rem
                }
            }

        }
    
    }
    .hint {
        width: 100%;
        height: 2.66667rem;
        color: #cdcdcd;
        font-size: 0.37333rem;
        padding-top: 6.66667rem;
        background: url(../../../../res/images/hint.png) no-repeat;
        background-position: center 80%;
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
        justify-content: center
    }
    .address-bottom {
        width: 100%;
        height: 1.33333rem;
        border-top: 1px #ddd solid;
        position: fixed;
        bottom: 0;
        left: 0;
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
        color: #F5A623;
        font-size: 0.42667rem;
        background: url(../../../../res/images/increased.png) #fff no-repeat 38% center;
        background-size: 0.37333rem 0.37333rem
    }
}
</style>
