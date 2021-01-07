<template>
  <div class="main">
    <Form ref="purchaseForm" @submit="handleSubmit"></Form>
  </div>
</template>

<script>
import Form from './Form';

export default {
  components: {
    Form
  },
  data() {
    return {};
  },
  methods: {
    async handleSubmit(form) {
      const res = await this.$axios({
        url: '/api/purchase/submit',
        method: 'POST',
        data: form
      });

      this.$message.success('提交成功');
      this.$refs.purchaseForm.resetForm();
      this.$router.push({ path: '/purchase/index' });
    },
    // 查询旧采购实例，或者获取最近一次的抄送人列表
    async queryInstance() {
      if (this.$route.query.pid) {
        const res = await this.$axios({
          url: '/api/purchase/instance/' + this.$route.query.pid
        });
        if (res.data) {
          // 有数据
          delete res.data.id;
          this.$refs.purchaseForm.setForm(res.data);
        }
      } else {
        const res = await this.$axios({
          url: '/api/purchase/last-copy'
        });
        if (res.data) {
          this.$refs.purchaseForm.setCopyList(res.data);
        }
      }
    }
  },
  activated() {
    this.queryInstance();
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 15px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
