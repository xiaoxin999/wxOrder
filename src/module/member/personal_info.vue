<template>
    <div id="personal-info" class="personal-info">
        <div class="personal-info-content">
            <div class="personal-info-explainBox">
                <div class="personal-info-explain">
                    <div class="personal-info-item">
                        <span>手机号:</span>
                        <div class="show-text" v-if="ismobile">
                            <p>{{mobile}}</p>
                            <!-- <i @click="setMobile"></i> -->
                        </div>
                        <!-- <div class="ps-text" v-else="ismobile">
                            <input type="number" placeholder="请输入手机号" class="fl" maxlength="11" v-model="mobiles" />
                            <span class="fl sendCode" @click="sendSMS">
                                <template v-if="isCode">
                                    {{codeTime}}s
                                </template>
                                <template v-else>
                                        发送验证码
                                </template>
                            </span>
                        </div> -->
                    </div>
                    <div class="personal-info-item" v-if="!ismobile">
                        <span>验证码:</span>
                        <div class="ps-text">
                            <input type="number" placeholder="请输入验证码" class="fl" maxlength="4" v-model="codes">
                            <i></i>
                        </div>
                    </div>
                    <div class="personal-info-item">
                        <span>姓名:</span>
                        <div class="show-text" v-if="isname">
                            <p>{{name}}</p>
                            <i @click="setName"></i>
                        </div>
                        <div class="ps-text" v-else>
                            <input type="text" placeholder="请输入姓名" class="fl" v-model="names" />
                        </div>
                    </div>
                    <div class="personal-info-item">
                        <span>性别:</span>
                        <div class="show-text" v-if="isSex">
                            <p>{{sexType}}</p>
                            <i @click="showSetSex"></i>
                        </div>
                        <div class="ps-text selectSex fl" v-else>
                            <template v-for="(item,i) in sexList">
                                <span :key="i" :class="[item.isOn  ? 'sexOn' : '']" @click="setSex(i)">{{item.name}}</span>
                            </template>
                        </div>
                    </div>
                    <div class="personal-info-item">
                        <span>生日:</span>
                        <div class="show-text ps-birthday">
                            <p v-if="isBirthday">{{birthday}}</p>
                            <template v-else>
                                <input type="text" class="selectTime" readonly="readonly" v-model="birthday" />
                                <i id="date-selector-input" @click="setBirthday()"></i>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="targetContainer"></div>
        <a href="javascript:void(0)" class="submit-Information" v-if="isSubmit" @click="registerMember">提交</a>
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
                sexList: [{ name: '男', type: '1', isOn: true }, { name: '女', type: '2', isOn: false }],
                memberInfo: {}, //会员信息
                shopId: '', //shopId
                token: '', //token
                mobile: '', //手机号码
                code: '', //验证码
                name: '', //姓名
                // sex: '', //性别
                sexType: '', //性别
                birthday: '', //生日
                openId: '', //openId
                codeToken: '',
                isCode: false,
                codeTime: 60, //发送验证码后等待时间
                ismobile: true, //修改手机号
                isSubmit: false, //提交按钮状态
                isname: true, //修改名字
                isSex: true, //修改性别
                isBirthday: true, //添加生日
            }
        },
        computed: {
            mobiles: {
                get: function() {
                    return this.mobile;
                },
                set: function(newValue) {
                    this.mobile = newValue.replace(/[^\d]/g, '');
                    if (this.mobile.length > 11) {
                        this.mobile = this.mobile.substring(0, 11);
                    }
                }
            },
            codes: {
                get: function() {
                    return this.code;
                },
                set: function(newValue) {
                    this.code = newValue.replace(/[^\d]/g, '');
                    if (this.code.length > 4) {
                        this.code = this.code.substring(0, 4);
                    }
                }
            },
            names: {
                get: function() {
                    return this.name;
                },
                set: function(newValue) {
                    this.name = newValue.replace(/[^\w\d\u4e00-\u9fa5]/g, '');
                }
            }
        },
        methods: {
            setDate(){
                // var _this = this;
                // var dates = new Date();
                // dates.setFullYear(dates.getFullYear() - 20);
                // var dateTime = [];
                // dateTime.push(dates.getFullYear(), dates.getMonth() + 1, dates.getDate());
                // new DateSelector({
                //     input: 'date-selector-input', //点击触发插件的i的id
                //     container: 'targetContainer', //插件插入的容器id
                //     type: 0,
                //     //0：不需要tab切换，自定义滑动内容，建议小于三个；
                //     //1：需要tab切换，【年月日】【时分】完全展示，固定死，可设置开始年份和结束年份
                //     param: [1, 1, 1, 0, 0],
                //     //设置['year','month','day','hour','minute'],1为需要，0为不需要,需要连续的1
                //     beginTime: [1900, 1, 1], //如空数组默认设置成1970年1月1日0时0分开始，如需要设置开始时间点，数组的值对应param参数的对应值。
                //     endTime: [], //如空数组默认设置成次年12月31日23时59分结束，如需要设置结束时间点，数组的值对应param参数的对应值。
                //     recentTime: dateTime, //如不需要设置当前时间，被为空数组，如需要设置的开始的时间点，数组的值对应param参数的对应值。
                //     success: function(arr) {
                //         var arrs = String(arr);
                //         arrs = arrs.replace(/[,]/g, '-');
                //         personal.birthday = arrs;
                //         _this.isSubmit = true;
                //     } //回调
                // });
            },
            setName(){
                this.isname = false;
                this.isSubmit = true;
            },
            showSetSex() {
                if (this.sexType == "男") {
                    this.sexList[1].isOn = false;
                    this.sexList[0].isOn = true;
                } else {
                    this.sexList[0].isOn = false;
                    this.sexList[1].isOn = true;
                }
                this.isSex = false;
                this.isSubmit = true;
            },
            setSex(i) {
                // 设置性别
                for (var j = 0; j < this.sexList.length; j++) {
                    this.sexList[j].isOn = false;
                    this.sexList[i].isOn = true;
                    this.sexType = this.sexList[i].type;
                }
                console.log(this.sexList)
            },
            setBirthday: function() {
                this.isBirthday = false;
                this.isSubmit = true;
            },
            async registerMember(){
                let res = await http.updateMemberInfo({
                    data: {
                        gender: this.sexType,
                        name: this.name,
                        shopId: this.shopId,
                        birthday: this.isBirthday ? '' : this.birthday
                    }
                })
                var membership = (storage.session('membership') == undefined) ? {} : storage.session('membership');
                membership.member.name = res.name;
                membership.member.gender = res.gender;
                membership.member.birthday = res.birthday;
                storage.session('membership', membership);
                this.$router.push('membershipInfo');
                this.isSubmit = false;
                this.ismobile = true;
                this.isSex = true;
                this.isname = false;
                this.isBirthday = true;
            }
        },
        mounted(){
            this.setDate()
            var sedata = storage.session('membership');
            this.memberInfo = sedata.member; //取出session中的信息
            this.shopId = sedata.member.shopId;
            this.mobile = sedata.member.mobile;
            this.name = sedata.member.name;
            this.birthday = sedata.member.birthday;
            this.openId = sedata.member.openId;
            this.sexType = sedata.member.gender == 2 ? "女" : "男";
            this.isBirthday = this.birthday ? true : false;


            if (this.level != undefined) {
                this.levelImg = this.uploadUrl + '/' + this.level.imgName;
                this.levelName = this.level.name;
            }
            // this.getMemberQrCode();
            this.levelImg = {
                background: 'url(' + this.levelImg + ')'
            }
            utils.setTitle('个人信息修改');
        }
    }
</script>

<style lang="less" scoped>
.personal-info {
    background-image: url(../../res/images/join-membership-bg.png);
    background-repeat: no-repeat;
    background-size: cover;
}

.personal-info {
    width: 100%;
    height: 100%;
    position: relative;
}

.personal-info:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.personal-info .personal-info-content {
    width: 7.85333rem;
    z-index: 3;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
}

.personal-info-explainBox {
    width: 100%;
    min-height: 9.68rem;
    padding-bottom: 1.2rem;
    background: rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
}

.personal-info-explainBox .personal-info-explain {
    color: #fff;
    font-size: .4rem;
    padding-top: .26667rem;
}

.personal-info-explain .personal-info-item {
    display: flex;
    align-items: center;
    margin-top: 1.06667rem;
}

.personal-info-explain .personal-info-item input {
    outline: none;
    padding: 0;
    border: none;
    background: transparent;
    border-bottom: 1px solid #FFFFFF;
    color: #FFFFFF;
    width: 3.33333rem;
    height: 1rem;
    box-sizing: border-box;
    font-size: 0.32rem;
    padding-left: 0.13333rem;
}

.personal-info-explain .personal-info-item span {
    width: 1.866667rem;
    text-align: right;
}

.personal-info-explain .personal-info-item>.show-text {
    box-sizing: border-box;
    display: flex;
    width: 5.49333rem;
    margin-left: .506667rem;
    padding-right: .88rem;
}

.personal-info-explain .personal-info-item>.ps-birthday i {
    position: absolute;
    right: .88rem;
}

.personal-info-explain .personal-info-item>.ps-text.selectSex {
    display: block;
    width: 3.33333rem;
    height: 1rem;
    border: 1px solid #FFFFFF;
    text-align: center;
    color: #FFFFFF;
    font-size: 0;
    box-sizing: border-box;
    margin-left: .226667rem;
}

.personal-info-explain .personal-info-item>.ps-text.selectSex span {
    display: inline-block;
    width: 50%;
    height: 1rem;
    font-size: 0.32rem;
    text-align: center;
    border-left: 1px solid #FFFFFF;
    box-sizing: border-box;
}

.personal-info-explain .personal-info-item>.ps-text.selectSex .sexOn {
    background: url(../../res/images/sexon.png) 1.22667rem 0.57333rem no-repeat;
    background-size: 0.42667rem 0.4rem;
}

.personal-info-explain .personal-info-item>.ps-text input {
    margin-left: .213333rem;
    padding-left: .26667rem;
    font-size: .4rem;
}

.personal-info-explain .personal-info-item>.ps-text span {
    font-size: .29333rem;
    display: block;
    width: 1.86667rem;
    height: 1rem;
    border: 1px solid #FFFFFF;
    text-align: center;
    line-height: .933333rem;
    box-sizing: border-box;
}

.personal-info-explain .personal-info-item p {
    width: 4.186667rem;
    text-align: left;
}

.personal-info-explain .personal-info-item i {
    position: relative;
    z-index: 99;
    width: .426667rem;
    height: .426667rem;
    background: url("../../res/index/icon_14.gif") no-repeat center center / cover;
    margin-bottom: .066667rem;
}

.submit-Information {
    position: fixed;
    left: 0;
    bottom: 0;
    display: block;
    width: 100%;
    height: 1.33333rem;
    line-height: 1.33333rem;
    text-align: center;
    color: #FFFFFF;
    background-color: #000000;
    font-size: 0.48rem;
    z-index: 6;
}

.personal-info-explain .personal-info-item .selectTime {
    display: block;
    width: 3.33333rem;
    height: 100%;
    border: none;
    text-align: left;
    color: #FFFFFF;
    font-size: .42rem;
}
</style>

