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
          <el-form-item>
            <el-button type="primary" @click="query">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="4" align="right">
        <el-button size="small" type="primary" @click="handleApply">采购申请</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" border>
      <el-table-column label="申请人" prop="applicant_name" align="center"></el-table-column>
      <el-table-column label="期望交付日期" prop="date" align="center"></el-table-column>
      <el-table-column label="审批状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1">待我审批</el-tag>
          <el-tag v-else-if="row.status === 2" type="success">已结束</el-tag>
          <el-tag v-else-if="row.status === 3" type="info">已取消</el-tag>
          <el-tag v-else-if="row.status === 4" type="danger">已驳回</el-tag>
          <el-tag v-else>未知状态</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报销状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag type="success" v-if="row.status === 2 && row.reimbur">已报销</el-tag>
          <el-tag v-else>未报销</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createtime" align="center"></el-table-column>
      <el-table-column label="采购金额" align="center">
        <template slot-scope="{ row }">
          {{ Number(row.total_money) | 1000 }}
        </template>
      </el-table-column>
      <el-table-column label="申请事由" prop="reasons" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button v-if="row.status == 1" type="primary" icon="el-icon-s-check" size="small" @click="handleShow(row)">
            审批
          </el-button>
          <el-button v-else type="primary" icon="el-icon-view" size="small" plain @click="handleShow(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-page" align="right" v-if="count > 10">
      <el-pagination
        @size-change="query"
        @current-change="query"
        :current-page.sync="filters.page"
        :page-sizes="[10, 15, 20, 50]"
        :page-size.sync="filters.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count"
      >
      </el-pagination>
    </div>

    <el-dialog title="采购申请单" :visible.sync="drawer.visible" :close-on-press-escape="false" width="1200px">
      <PurchaseDetail ref="purchaseDetail" :data="drawer.data">
        <div slot="approve">
          <div v-if="drawer.data.status === 1" class="approve-wrapper">
            <div class="comment-wrapper">
              <el-input
                v-model.trim="form.remark"
                type="textarea"
                resize="none"
                placeholder="输入驳回理由或者同意备注，例如：这个东西不用买了！"
                maxlength="255"
                show-word-limit
                rows="4"
              ></el-input>
            </div>
            <div align="right" class="footer-button">
              <el-button
                type="danger"
                size="small"
                icon="el-icon-close"
                @click="handleReject"
                style="margin-right: 15px"
                >驳 回</el-button
              >
              <el-button type="primary" size="small" icon="el-icon-check" @click="handleThen">同 意</el-button>
            </div>
          </div>

          <div v-if="drawer.data.status === 2 && !drawer.data.reimbur" class="approve-wrapper">
            <div class="comment-wrapper">
              <el-input
                v-model.trim="force.remark"
                type="textarea"
                resize="none"
                placeholder="输入强制驳回意见，例如：这个东西不用买了！"
                maxlength="255"
                show-word-limit
                rows="4"
              ></el-input>
            </div>
            <div align="right" class="footer-button">
              <el-button type="danger" size="small" icon="el-icon-close" @click="handleForceReject">强制驳回</el-button>
            </div>
          </div>
        </div>
      </PurchaseDetail>
    </el-dialog>
  </div>
</template>

<script>
import PurchaseDetail from './Detail';
import Bus from '@/utils/bus';

export default {
  components: {
    PurchaseDetail
  },
  data() {
    return {
      // 审批操作
      form: {
        remark: ''
      },
      // 强制驳回
      force: {
        remark: ''
      },
      // 采购列表
      list: [],
      count: 0,
      filters: {
        status: 1,
        applyTime: null,
        page: 1,
        size: 10
      },
      statusList: [
        { label: '全部', value: 0 },
        { label: '待我审批', value: 1 },
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
  computed: {
    purchaseHeight() {
      return this.drawer.data.status === 1 || (this.drawer.data.status === 2 && !this.drawer.data.reimbur)
        ? 'calc(100vh - 260px)'
        : 'calc(100vh - 100px)';
    }
  },
  methods: {
    handleApply() {
      this.$router.push({ path: '/purchase/add' });
    },
    handleShow(row) {
      this.drawer.visible = true;
      this.drawer.data = row;
    },
    async query() {
      const res = await this.$axios({
        url: '/api/purchase/query-my-shenpi',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    },
    // 强制驳回
    async handleForceReject() {
      if (!this.force.remark) {
        return this.$message.warning('请填写备注');
      }
      await this.$confirm('确定强制驳回该采购？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      });
      await this.$axios({
        url: '/api/purchase/force-reject',
        method: 'POST',
        data: {
          id: this.drawer.data.task_id,
          remark: this.force.remark
        }
      });
      this.$refs.purchaseDetail.query();
      this.query();
      this.$message.success('操作成功');
      this.drawer.visible = false;
      this.force.remark = '';
    },
    // 驳回
    handleReject() {
      if (!this.form.remark) {
        return this.$message.warning('请填写备注');
      }
      this.$confirm('确定拒绝该采购？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/purchase/reject',
          method: 'POST',
          data: {
            id: this.drawer.data.task_id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.$refs.purchaseDetail.query();
            this.query();
            this.$message.success('操作成功');
            Bus.$emit('purchaseResetCount');
            this.drawer.visible = false;
          })
          .catch(err => {
            if (err.code === 506) {
              // 流程已被重新编辑过
              this.query();
            }
          });
      });
    },
    // 同意
    handleThen() {
      this.$confirm('确定同意该采购？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/purchase/complete',
          method: 'POST',
          data: {
            id: this.drawer.data.task_id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.$refs.purchaseDetail.query();
            this.query();
            this.$message.success('操作成功');
            Bus.$emit('purchaseResetCount');
            this.drawer.visible = false;
          })
          .catch(err => {
            if (err.code === 506) {
              // 流程已被重新编辑过
              this.query();
            }
          });
      });
    }
  },
  mounted() {
    this.query();
  }
};
</script>

<style lang="scss" scoped>
.drawer-body {
  padding: 0 15px;

  .purchase-detail {
    overflow: scroll;
  }

  .detail-footer {
    .el-col {
      margin-top: 20px;
    }
  }
}

.approve-wrapper {
  margin-top: 20px;
  border-top: 1px solid #d3d3d3;

  .footer-button {
    padding-right: 15px;
  }
}
</style>
