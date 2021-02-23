<template>
  <div>
    <el-row>
      <el-col :span="20">
        <el-form :inline="true">
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
      <el-table-column label="申请人" prop="applicant_name" align="center"></el-table-column>
      <el-table-column label="付款类型" prop="apply_type" align="center">
        <template slot-scope="{ row }">
          {{ row.apply_type == 1 ? '正常请款' : '预付请款' }}
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createtime" align="center" :formatter="timeFormatter"></el-table-column>
      <el-table-column label="结束时间" prop="updatetime" align="center" :formatter="timeFormatter"></el-table-column>
      <el-table-column label="报销金额" align="center">
        <template slot-scope="{ row }">
          {{ Number(row.total_money) | 1000 }}
        </template>
      </el-table-column>
      <el-table-column label="申请事由" prop="reason" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" @click="handleShow(row)">查看</el-button>
          <el-button size="small" @click="handlePrint(row)">打印</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-page" align="right" v-if="count > filters.size">
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
      <div class="drawer-body">
        <bao-xiao-detail
          class="bao-xiao-detail"
          :data="drawer.data"
          :processList="drawer.processList"
          :detailList="drawer.detailList"
          :copys="drawer.copys"
        ></bao-xiao-detail>
      </div>
    </el-drawer>

    <el-dialog :visible.sync="print.visible" title="报销单" width="800px">
      <div align="center">
        <el-radio-group v-model="print.type">
          <el-radio-button label="1">费用报销单</el-radio-button>
          <el-radio-button label="2">报销单</el-radio-button>
          <!-- <el-radio-button label="3">差旅费用报销单</el-radio-button> -->
        </el-radio-group>
      </div>
      <ReimburForm1 v-show="print.type == 1" :form="print.data"></ReimburForm1>
      <ReimburForm2 v-show="print.type == 2" :form="print.data" :processList="print.processList"></ReimburForm2>
    </el-dialog>
  </div>
</template>

<script>
import BaoXiaoDetail from './detail';
import ReimburForm1 from './ReimburForm1';
import ReimburForm2 from './ReimburForm2';
import dayjs from 'dayjs';

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
        applyTime: null,
        page: 1,
        size: 20
      },
      drawer: {
        visible: false,
        data: {},
        processList: [],
        detailList: [],
        copys: []
      },
      print: {
        visible: false,
        type: '1',
        data: {},
        // 审批记录
        processList: []
      }
    };
  },
  methods: {
    timeFormatter(row, column, cellValue, index) {
      return dayjs.unix(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
    handleApply() {
      this.$router.push({ path: '/reimbur/add' });
    },
    handleShow(row) {
      this.drawer.visible = true;
      this.drawer.data = row;
      this.queryProcessDetail();
    },
    // 查看明细和流程
    async queryProcessDetail() {
      const res = await this.$axios({
        url: '/api/reimbur/query-detail-process',
        params: {
          id: this.drawer.data.id
        }
      });
      if (this.drawer.data.status == 2) {
        res.data.processList.push({
          flag: 2,
          username: '报销流程结束',
          msg: ''
        });
      }
      this.drawer.processList = res.data.processList;
      this.drawer.detailList = res.data.detailList;
      this.drawer.copys = res.data.copys;
    },
    async query() {
      const res = await this.$axios({
        url: '/api/reimbur/query-my-copy',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    },
    // 打印预览
    async handlePrint(row) {
      const res = await this.$axios({
        url: '/api/reimbur/query-detail-process',
        params: {
          id: row.id
        }
      });
      this.print.processList = res.data.processList;
      row.detailList = res.data.detailList;
      this.print.data = row;
      this.print.visible = true;
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
