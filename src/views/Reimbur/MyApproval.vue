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
        <el-button size="small" type="primary" @click="handleApply">付款申请</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" border>
      <el-table-column label="申请人" prop="applicant" align="center"></el-table-column>
      <el-table-column label="付款类型" prop="flow_params.apply_type" align="center"></el-table-column>
      <el-table-column label="状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1">
            {{ row.refext ? '已转账' : '待我审批' }}
          </el-tag>
          <el-tag v-else-if="row.status === 2" type="success">已结束</el-tag>
          <el-tag v-else-if="row.status === 3" type="info">已取消</el-tag>
          <el-tag v-else-if="row.status === 4" type="danger">已驳回</el-tag>
          <el-tag v-else>未知状态</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createtime" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" plain @click="handleShow(row)">{{
            row.status == 1 && !row.refext ? '审批' : '查看'
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-page" align="right" v-if="count > 10">
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

    <el-drawer title="报销申请单" :visible.sync="drawer.visible" direction="rtl" size="500px">
      <div class="drawer-body">
        <bao-xiao-detail
          class="bao-xiao-detail"
          :style="{ height: baoxiaoHeight }"
          :data="drawer.data.flow_params"
          :instance-id="drawer.data.instance_id"
        ></bao-xiao-detail>
        <el-row v-if="drawer.data.status === 1 && this.drawer.data.refext === ''" class="detail-footer" :gutter="30">
          <el-col :span="24">
            <el-input
              v-model.trim="form.remark"
              type="textarea"
              resize="none"
              rows="4"
              placeholder="输入同意或者驳回信息，例如：同意；或者：已转账；或者：发票号不正确。"
            ></el-input>
          </el-col>

          <el-col :span="12">
            <el-button style="width: 100%" @click="handleReject">驳 回</el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="drawer.data.node_id === 'stage-4'"
              style="width: 100%"
              type="primary"
              @click="handleTransfer"
              >转 账</el-button
            >
            <el-button v-else style="width: 100%" type="primary" @click="handleThen">同 意</el-button>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import BaoXiaoDetail from './detail';

export default {
  components: {
    BaoXiaoDetail
  },
  data() {
    return {
      form: {
        remark: ''
      },
      // 报销列表
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
    baoxiaoHeight() {
      return this.drawer.data.status === 1 && this.drawer.data.refext === ''
        ? 'calc(100vh - 300px)'
        : 'calc(100vh - 100px)';
    }
  },
  methods: {
    handleApply() {
      this.$router.push({ path: '/reimbur/add' });
    },
    handleShow(row) {
      this.drawer.visible = true;
      this.drawer.data = row;
    },
    async query() {
      const res = await this.$axios({
        url: '/api/reimbur/query-my-shenpi',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    },
    // 驳回
    handleReject() {
      if (!this.form.remark) {
        return this.$message.warning('请填写备注');
      }
      this.$confirm('确定拒绝该报销？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/reimbur/reject',
          method: 'POST',
          data: {
            id: this.drawer.data.id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.drawer.visible = false;
            this.query();
            this.$message.success('操作成功');
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
      if (!this.form.remark) {
        return this.$message.warning('请填写备注');
      }
      this.$confirm('确定同意该报销？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/reimbur/complete',
          method: 'POST',
          data: {
            id: this.drawer.data.id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.drawer.visible = false;
            this.query();
            this.$message.success('操作成功');
          })
          .catch(err => {
            if (err.code === 506) {
              // 流程已被重新编辑过
              this.query();
            }
          });
      });
    },
    // 转账
    handleTransfer() {
      if (!this.form.remark) {
        return this.$message.warning('请填写备注');
      }
      this.$confirm(
        `向【${this.drawer.data.flow_params.payee}(${this.drawer.data.flow_params.bank_account})】转账 ￥${this.drawer.data.flow_params.total_money}`,
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(() => {
        this.$axios({
          url: '/api/reimbur/transfer',
          method: 'POST',
          data: {
            id: this.drawer.data.id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        }).then(res => {
          this.drawer.visible = false;
          this.query();
          this.$message.success('操作成功');
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

  .bao-xiao-detail {
    overflow: scroll;
  }

  .detail-footer {
    .el-col {
      margin-top: 20px;
    }
  }
}
</style>
