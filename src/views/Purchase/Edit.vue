<template>
  <div class="main">
    <Form ref="purchaseForm" :model="model" @submit="handleSubmit"></Form>
  </div>
</template>

<script>
import Form from './Form';

export default {
  components: {
    Form
  },
  data() {
    return {
      model: null
    };
  },
  methods: {
    async handleSubmit(form) {
      const res = await this.$axios({
        url: '/api/purchase/edit',
        method: 'POST',
        data: form
      });

      this.$message.success('提交成功');
      this.$router.push({ path: '/purchase/index' });
    },
    // 查询旧采购实例
    async queryInstance() {
      if (this.$route.params.id) {
        const res = await this.$axios({
          url: '/api/purchase/instance/' + this.$route.params.id
        });
        this.model = res.data;
      }
    }
  },
  mounted() {
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
