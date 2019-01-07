<template>
    <div class="reason-shade" v-if="isShow">
        <div class="reason-content">
            <div class="reason-title">您所选退款原因的真实度将直接影响到商家对退款的处理结果，<em>请您选择真实原因后再提交</em></div>
            <ul>
                <li v-for="(item,index) in list" :key="index" @click="choseReason(item)">{{item.name}}</li>
            </ul>
            <a class="cancel-btn" @click="choseReason">取消</a>
        </div>
    </div>
</template>
<script>
export default {
  props: {
      isShow : false
  },
  data() {
    return {
      list: [
        { name: "配送时间太长" },
        { name: "地址填写错误" },
        { name: "商家无法配送，联系我取消" },
        { name: "商家缺货/打烊，联系我取消" },
        { name: "忘记使用优惠券" },
        { name: "忘记点主食" },
        { name: "骑手联系我取消" },
        { name: "点多了/点错了/点漏了" },
        { name: "临时有事，我不想要了" },
        { name: "其他原因" }
      ]
    };
  },
  methods: {
    choseReason(item) {
        let obj = {
            'name' : item ? item.name : '',
            'isShow' : false
        };
      this.$emit('reason',obj);
    }
  },
  components: {},
  computed: {},
  mounted() {}
};
</script>
<style lang='less' scoped>
@import "../../../res/css/base.less";
.reason-shade {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  bottom: 0;
  .setBox(100%,100%);
  overflow: hidden;
  .reason-content {
    .setBox(100%,auto);
    background-color: #fff;
    position: absolute;
    bottom: 0;
    .reason-title {
      .setBox(100%,1.6rem);
      font-size: 0.3467rem;
      color: #999999;
      padding: 0.2667rem 0.4rem;
      background-color: #f5f6f7;
      em {
        color: #474747;
      }
    }
    ul li {
      .setBox(~"100% - .8rem",1.2rem);
      line-height: 1.2rem;
      color: #3b424c;
      margin: 0 0.4rem;
      border-bottom: 1px solid #d5d5d5;
    }
  }
  .cancel-btn {
    color: #f5a623;
    .setBox(100%,1.2rem);
    line-height: 1.2rem;
    text-align: center;
    display: block;
  }
}
</style>