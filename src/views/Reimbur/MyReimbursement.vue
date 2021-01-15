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
        <el-button size="small" type="primary" @click="handleApply">报销申请</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" border>
      <el-table-column label="填单人" prop="create_by" align="center"></el-table-column>
      <el-table-column
        label="付款类型"
        prop="flow_params.apply_type"
        align="center"
        min-width="100px"
      ></el-table-column>
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
      <el-table-column label="报销金额" align="center" min-width="200px">
        <template slot-scope="{ row }">
          {{ Number(row.flow_params.total_money) | 1000 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" @click="handleShow(row)">查看</el-button>
          <el-button type="danger" size="small" @click="handleCancel(row)" v-if="row.status !== 2 && row.status !== 3"
            >取消</el-button
          >
          <el-button size="small" @click="handlePrint(row)">打印</el-button>
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

    <el-drawer title="报销申请单" :visible.sync="drawer.visible" direction="rtl" size="500px">
      <BaoXiaoDetail class="bao-xiao-detail" :data="drawer.data" myself @close="handleCloseDetail"></BaoXiaoDetail>
    </el-drawer>

    <el-dialog :visible.sync="print.visible" title="报销单" width="800px">
      <div align="center">
        <el-radio-group v-model="print.type">
          <el-radio-button label="1">费用报销单</el-radio-button>
          <!-- <el-radio-button label="2">差旅费用报销单</el-radio-button> -->
          <el-radio-button label="3">报销单</el-radio-button>
        </el-radio-group>
      </div>
      <ReimburForm1 v-show="print.type == 1" :form="print.data" :actList="print.actList"></ReimburForm1>
      <ReimburForm2 v-show="print.type == 3" :form="print.data" :actList="print.actList"></ReimburForm2>
    </el-dialog>
  </div>
</template>

<script>
import BaoXiaoDetail from './detail';
import pdfjs from '@/utils/pdf';
import NP from 'number-precision';
import ReimburForm1 from './ReimburForm1';
import ReimburForm2 from './ReimburForm2';

export default {
  components: {
    BaoXiaoDetail,
    ReimburForm1,
    ReimburForm2
  },
  data() {
    return {
      // 报销列表
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
      },
      print: {
        visible: false,
        type: '3',
        data: {
          flow_params: {}
        },
        // 审批记录
        actList: []
      }
    };
  },
  methods: {
    handleApply() {
      this.$router.push({ path: '/reimbur/add' });
    },
    handleCancel(row) {
      // 取消报销
      this.$confirm(`确定取消报销流程？`, {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '关闭'
      }).then(() => {
        this.$axios({
          url: '/api/reimbur/cancel',
          method: 'POST',
          data: {
            id: row.id
          }
        }).then(res => {
          this.$message.success('操作成功');
          this.query();
        });
      });
    },
    handleShow(row) {
      this.drawer.visible = true;
      this.drawer.data = row;
    },
    async query() {
      const res = await this.$axios({
        url: '/api/reimbur/query-my-baoxiao',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    },
    handleCloseDetail() {
      this.drawer.visible = false;
    },
    // 打印预览
    async handlePrint(row) {
      this.print.visible = true;
      this.print.data = row;
      const res = await this.$axios({
        url: '/api/reimbur/query-instance-process-status',
        method: 'GET',
        params: {
          id: row.id
        }
      });
      // 去掉第一个
      res.data.shift();
      // 去掉最后一个
      res.data.pop();
      this.print.actList = res.data;
    }
  },
  activated() {
    this.query();
  }
};
</script>

<style lang="scss" scoped>
.bao-xiao-detail {
  padding: 0 15px;
  height: calc(100vh - 100px);
  overflow: scroll;
}

.footer-page {
  padding: 10px 15px;
}
</style>
