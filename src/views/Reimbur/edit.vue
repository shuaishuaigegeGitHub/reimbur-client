<template>
  <div class="main">
    <bao-xiao-form :model="data" class="bao-xiao-form" @submit="handleSubmit"></bao-xiao-form>
    <div class="descriptor">
      <div class="descriptor-content">
        <b>说明：</b>
        <ul>
          <li>1、已有发票，付款类型为正常请款，否则，付款类型为预付请款</li>
          <li>
            2、发票号最长8个字符，只能由大写字母数字组成；多个发票号请用中文逗号隔开，这里直接复制，格式如下：12345678,A1234567
          </li>
          <li>3、<span style="color: red">如果不知道科目怎么选择，就放空</span></li>
          <li>4、银行卡号，开户银行请正确填写，一经转账，无法修改</li>
          <li>5、银行卡号非招商银行的，必须填写开户银行，开户地址</li>
          <li>6、审批人选择自己的上级进行审批</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import BaoXiaoForm from './form';

export default {
  name: 'BaoXiaoAdd',
  components: { BaoXiaoForm },
  data() {
    return {
      data: {}
    };
  },
  watch: {
    $route(val) {
      this.query();
    }
  },
  methods: {
    async query() {
      let id = this.$route.params.id;
      if (id) {
        try {
          const res = await this.$axios({
            url: '/api/reimbur/query-editable',
            params: {
              id
            }
          });
          this.data = res.data;
        } catch (err) {
          this.$router.go(-1);
        }
      }
    },
    // 提交事件
    async handleSubmit(form) {
      await this.$axios({
        url: '/api/reimbur/edit',
        method: 'POST',
        data: form
      });

      this.$message.success('修改成功');
      this.$router.push({ path: '/reimbur/index' });
    }
  },
  mounted() {
    this.query();
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px;
  display: flex;

  .bao-xiao-form {
    width: 1200px;
  }

  .descriptor {
    flex-grow: 1;
    margin-left: 50px;

    .descriptor-content {
      padding: 20px;
      background-color: #d8f9c6;
      font-weight: 400;

      li {
        line-height: 30px;
      }
    }
  }
}
</style>
