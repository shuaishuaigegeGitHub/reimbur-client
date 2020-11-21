<template>
  <div class="main">
    <bao-xiao-form class="bao-xiao-form" @submit="handleSubmit"></bao-xiao-form>
    <div class="descriptor">
      <div class="descriptor-content">
        <b>说明：</b>
        <ul>
          <li>1、已有发票，付款类型为正常请款，否则，付款类型为预付请款。</li>
          <li>2、正确填写发票号，发票号必须为纯数字。</li>
          <li>
            3、多个发票号请用中文逗号隔开，如果不知道什么是中文逗号，这里直接复制，格式如下：12345678，12345678。
          </li>
          <li>4、如果不知道科目怎么选择，请直接询问财务。</li>
          <li>5、银行卡号，开户银行请正确填写，一经转账，无法修改。</li>
          <li>6、银行卡号非招商银行的，必须填写开户银行，开户地址。</li>
          <li>7、审批人选择自己的上级进行审批。</li>
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
  methods: {
    // 提交事件
    async handleSubmit(form) {
      this.$axios({
        url: '/api/reimbur/add',
        method: 'POST',
        data: form
      }).then(res => {
        this.$confirm('报销提交成功，是否继续报销？', {
          type: 'warning',
          confirmButtonText: '继续',
          cancelButtonText: '取消'
        })
          .then(() => {
            // 继续报销。
          })
          .catch(err => {
            this.$router.push({ path: '/reimbur/index' });
          });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px;
  display: flex;

  .bao-xiao-form {
    width: 1200px;
    margin-right: 20px;
  }

  .descriptor {
    flex: auto;

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

@media screen and (max-width: 1200px) {
  .main {
    padding: 20px;
    display: block;

    .bao-xiao-form {
      width: 100%;
    }

    .descriptor {
      margin-left: 0px;
    }
  }
}
</style>
