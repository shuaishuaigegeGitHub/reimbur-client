<template>
  <div class="main">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="我的采购" name="one">
        <MyPurchase></MyPurchase>
      </el-tab-pane>
      <el-tab-pane label="我的审批" name="two">
        <div slot="label">我的审批<el-badge class="mark" :value="count" type="primary" /></div>
        <MyApproval></MyApproval>
      </el-tab-pane>
      <el-tab-pane label="抄送给我" name="three">
        <MyCopy></MyCopy>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MyPurchase from './MyPurchase';
import MyApproval from './MyApproval';
import MyCopy from './MyCopy';
import Bus from '@/utils/bus';

export default {
  components: {
    MyPurchase,
    MyApproval,
    MyCopy
  },
  data() {
    return {
      activeName: 'one',
      count: 0
    };
  },
  methods: {
    async queryCount() {
      const res = await this.$axios({
        url: '/api/purchase/query-my-shenpi-count',
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
    Bus.$on('purchaseResetCount', () => this.queryCount);
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 15px;
}
</style>
