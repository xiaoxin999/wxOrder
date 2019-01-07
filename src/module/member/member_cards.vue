<template>
    <div id="member-cards" class="member-cards">
        <div class="member-cards-title">
            <div class="member-title-lf">优惠券</div>
            <div class="member-title-rg" @click="openCoupon"><span>{{couponTotal}}张可用</span><i></i></div>
        </div>
        <div class="member-cards-content">
            <div class="member-cards-listBox">
                <div class="member-listBox-title">卡包</div>
                <ul class="member-cards-list">
                    <li class="member-cards-item" v-for="(item,index) in list" :key="index">
                        <div class="member-item-content">
                            <span>{{item.levelName||item.cardTypeName}}</span>
                            <p @click='openIntegralAndBalance(2,item)'><b>{{item.balance}}</b><span>余额</span><i></i></p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import utils from 'src/verdor/utils';
    import http from 'src/manager/http';
    import storage from 'src/verdor/storage';
    import global from 'src/manager/global';

    export default {
        data() {
            return {
                list: [], //会员信息
                couponTotal: "", //优惠券数量
            }
           
        },
        methods: {
            getCardsAndList(){
                let cardObj = storage.session("memberCard");
                this.couponTotal = cardObj.num;
                this.list = cardObj.card;
            },
            openIntegralAndBalance(type, item) {
                // 跳转至积分 and 余额页面 根据type判断 1为积分 2为余额

                storage.session('type', type);
                storage.session("card", item);
                this.$router.push('/memberIntegral');
            },
            openCoupon(){
                this.$router.push('/coupon');
            },
        },
        mounted(){

            this.getCardsAndList();
            if (this.level != undefined) {
                this.levelImg = this.uploadUrl + '/' + this.level.imgName;
                this.levelName = this.level.name;
            }
            // var sedata = storage.session('cardList')
            // this.list = sedata.data;
            this.levelImg = {
                background: 'url(' + this.levelImg + ')'
            }
            utils.setTitle('我的卡包');
        }
    }
</script>

<style lang="less" scoped>
.member-cards {
    /* padding: 0 .8rem; */
    background-color: rgba(0, 0, 0, .5);
}
.member-cards-title {
    box-sizing: border-box;
    display:-webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content:space-between;
    justify-content:space-between;
    -moz-box-pack:space-between;
    -webkit--moz-box-pack:space-between;
    box-pack:space-between;
    align-items:center;
    -webkit-align-items:center;
    box-align:center;
    -moz-box-align:center;
    -webkit-box-align:center;
    width: 100%;
    height: 1.53333rem;
    padding: 0 .8rem;
    font-size: .32rem;
    color: #191919;
    background-color: #fff;
    position: fixed;
    z-index: 2;
}

.member-cards-title .member-title-rg {
   display:-webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
   align-items:center;
   -webkit-align-items:center;
   box-align:center;
   -moz-box-align:center;
   -webkit-box-align:center;
}

.member-cards-title .member-title-rg>i {
    width: .1866667rem;
    height: .373333rem;
    margin: 0 0 -.04rem .13333rem;
    background: url("../../res/index/icon_16.gif") no-repeat center center / cover;
}

.member-cards-content {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    position: fixed;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 .8rem;
    margin-top: 1.5333rem;
    color: #fff;
    background-image: url(../../res/images/join-membership-bg.png);
    background-repeat: no-repeat;
    background-size: cover;
    overflow-y: scroll
}

.member-cards-content::after {
    content: '';
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.member-listBox-title,
.member-cards-list {
    position: relative;
    z-index: 2;
}

.member-cards-listBox {
    padding-bottom: 1.6rem;
}

.member-cards-content .member-cards-listBox .member-listBox-title {
    height: 0.6rem;
    line-height: .6rem;
    margin-top: .36rem;
}

.member-cards-item {
    box-sizing: border-box;
    width: 8.4266667rem;
    height: 2.76rem;
    margin-top: .26667rem;
    border: 2px solid #bbb5a2;
    padding: .1066667rem .093333rem;
}

.member-cards-item .member-item-content {
    text-align: center;
    box-sizing: border-box;
    width: 8.173333rem;
    height: 2.49333rem;
    border: 4px solid #fff;
    border-radius: 9px;
    padding: .32rem .266667rem;
}

.member-cards-item .member-item-content>span {
    font-size: .453333rem;
    line-height: 1.12rem;
}

.member-cards-item .member-item-content>p {
    display:-webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content:flex-end;
    justify-content:flex-end;
    -moz-box-pack:flex-end;
    -webkit--moz-box-pack:flex-end;
    box-pack:flex-end;
    align-items:flex-end;
    -webkit-align-items:flex-end;
    box-align:flex-end;
    -moz-box-align:flex-end;
    -webkit-box-align:flex-end;
}

.member-cards-item .member-item-content>p>b {
    font-size: .56rem;
    line-height: 1em;
}

.member-cards-item .member-item-content>p>span {
    font-size: 0.266667rem;
    margin-left: .093333rem;
}

.member-cards-item .member-item-content>p>i {
    width: 0.266667rem;
    height: 0.24rem;
    margin-left: .133333rem;
    margin-bottom: .04rem;
    background: url("../../res/icon/youjiantou.gif") no-repeat center center / cover;
}

.member-list-more {
    width: 100%;
    position: fixed;
    text-align: center;
    bottom: .33333rem;
    z-index: 3;
    left: 50%;
    transform: translate(-50%, 0);
}

.member-list-more>div {
    display:-webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient:vertical;
    -webkit-box-direction:normal;
    -moz-box-orient:vertical;
    -moz-box-direction:normal;
    flex-direction:column;
    -webkit-flex-direction:column;
    -webkit-justify-content:center;
    justify-content:center;
    -moz-box-pack:center;
    -webkit--moz-box-pack:center;
    box-pack:center;
    align-items:center;
    -webkit-align-items:center;
    box-align:center;
    -moz-box-align:center;
    -webkit-box-align:center;
}

.member-list-more>div>i {
    background: #fff;
    border-radius: 50%;
    margin-bottom: .06667rem;
}

.member-list-more>div>i:nth-child(1) {
    width: 0.12rem;
    height: 0.12rem;
}

.member-list-more>div>i:nth-child(2) {
    width: .093333rem;
    height: .093333rem;
}

.member-list-more>div>i:nth-child(3) {
    width: .066667rem;
    height: .06667rem;
}

.member-list-more>p {
    font-size: .3384rem;
    margin-top: .13333rem;
}
</style>

