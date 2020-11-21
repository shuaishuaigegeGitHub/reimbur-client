<template>
  <div class="main">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="我的报销" name="one">
        <MyReimbursement></MyReimbursement>
      </el-tab-pane>
      <el-tab-pane label="我的审批" name="two">
        <div slot="label">我的审批<el-badge class="mark" :value="count" type="primary" /></div>
        <MyApproval></MyApproval>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MyReimbursement from './MyReimbursement';
import MyApproval from './MyApproval';

export default {
  name: 'Reimbur',
  components: {
    MyReimbursement,
    MyApproval
  },
  data() {
    return {
      activeName: 'one',
      // 我的待审批个数
      count: 0
    };
  },
  methods: {
    async queryCount() {
      const res = await this.$axios({
        url: '/api/reimbur/query-my-shenpi-count',
        method: 'GET'
      });
      this.count = res.data;
    }
  },
  mounted() {
    this.queryCount();
    if (this.$route.query.active) {
      this.activeName = this.$route.query.active;
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 15px;
}
</style>
