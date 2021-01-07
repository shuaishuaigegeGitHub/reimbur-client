<template>
  <div class="main">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="我的采购" name="one">
        <MyPurchase></MyPurchase>
      </el-tab-pane>
      <el-tab-pane label="我的审批" name="two">
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

export default {
  components: {
    MyPurchase,
    MyApproval,
    MyCopy
  },
  data() {
    return {
      activeName: 'one'
    };
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 15px;
}
</style>
