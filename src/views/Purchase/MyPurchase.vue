<template>
  <div>
    <el-row>
      <el-col :span="20">
        <el-form :inline="true">
          <el-form-item>
            <el-select v-model="filters.status" @change="query" style="width: 120px">
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              style="width: 300px"
              v-model="filters.applyTime"
              type="daterange"
              range-separator="至"
              start-placeholder="申请开始时间"
              end-placeholder="申请结束时间"
              value-format="yyyy-MM-dd"
              @change="query"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="4" align="right">
        <el-button size="small" type="primary" @click="handleApply">采购申请</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" border>
      <el-table-column label="申请人" prop="applicant_name" align="center"></el-table-column>
      <el-table-column label="状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1">审批中</el-tag>
          <el-tag v-else-if="row.status === 2" type="success">已结束</el-tag>
          <el-tag v-else-if="row.status === 3" type="info">已取消</el-tag>
          <el-tag v-else-if="row.status === 4" type="danger">已驳回</el-tag>
          <el-tag v-else>未知状态</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createtime" align="center" min-width="200px"></el-table-column>
      <el-table-column label="最近一次操作人" prop="update_by" align="center" min-width="150px"></el-table-column>
      <el-table-column label="最近一次操作时间" prop="updatetime" align="center" min-width="200px"></el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" @click="handleShow(row)">查看</el-button>
          <el-button type="danger" size="small" @click="handleCancel(row)" v-if="row.status == 1">取消</el-button>
          <el-button type="success" size="small" @click="handleReimbur(row)" v-if="row.status == 2">报销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-page" align="right" v-if="count > filters.size">
      <el-pagination
        @size-change="query"
        @current-change="query"
        :current-page="filters.page"
        :page-sizes="[10, 15, 20, 50]"
        :page-size.sync="filters.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count"
      >
      </el-pagination>
    </div>

    <el-drawer title="采购申请单" :visible.sync="drawer.visible" direction="rtl" size="500px">
      <PurchaseDetail class="purchase-detail" :data="drawer.data" myself @close="handleCloseDetail"></PurchaseDetail>
    </el-drawer>
  </div>
</template>

<script>
import PurchaseDetail from './Detail';

export default {
  components: {
    PurchaseDetail
  },
  data() {
    return {
      // 采购列表
      list: [],
      count: 0,
      filters: {
        status: 0,
        applyTime: null,
        page: 1,
        size: 10
      },
      statusList: [
        { label: '全部状态', value: 0 },
        { label: '审批中', value: 1 },
        { label: '已完成', value: 2 },
        { label: '已取消', value: 3 },
        { label: '已驳回', value: 4 }
      ],
      drawer: {
        visible: false,
        data: {}
      }
    };
  },
  methods: {
    // 采购申请
    handleApply() {
      this.$router.push({ path: '/purchase/add' });
    },
    async query() {
      const res = await this.$axios({
        url: '/api/purchase/query-my-purchase',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    },
    // 取消
    async handleCancel(row) {
      await this.$confirm('确定取消当前采购申请？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '关闭'
      });
      const res = await this.$axios({
        url: '/api/purchase/cancel',
        method: 'POST',
        data: {
          id: row.id
        }
      });
      this.$message.success('操作成功');
      this.query();
    },
    // 查看采购明细
    handleShow(row) {
      this.drawer.visible = true;
      this.drawer.data = row;
    },
    handleCloseDetail() {
      this.drawer.visible = false;
    },
    // 一键报销
    handleReimbur(row) {
      this.$router.push({ path: '/reimbur/add?pid=' + row.id });
    }
  },
  activated() {
    this.query();
  }
};
</script>

<style lang="scss" scoped>
.purchase-detail {
  padding: 0 15px;
  height: calc(100vh - 100px);
  overflow: scroll;
}

.footer-page {
  padding: 10px 15px;
}
</style>
