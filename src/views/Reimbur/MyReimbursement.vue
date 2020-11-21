<template>
  <div>
    <el-row>
      <el-col :span="20">
        <el-form :inline="true">
          <el-form-item>
            <el-select
              v-model="filters.status"
              @change="query"
              style="width: 120px"
            >
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
        <el-button size="small" type="primary" @click="handleApply"
          >付款申请</el-button
        >
      </el-col>
    </el-row>
    <el-table :data="list" border>
      <el-table-column
        label="填单人"
        prop="create_by"
        align="center"
      ></el-table-column>
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
      <el-table-column
        label="申请时间"
        prop="createtime"
        align="center"
        min-width="200px"
      ></el-table-column>
      <el-table-column
        label="最近一次操作人"
        prop="update_by"
        align="center"
        min-width="150px"
      ></el-table-column>
      <el-table-column
        label="最近一次操作时间"
        prop="updatetime"
        align="center"
        min-width="200px"
      ></el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" plain @click="handleShow(row)"
            >查看</el-button
          >
          <el-button
            type="danger"
            size="small"
            plain
            @click="handleCancel(row)"
            v-if="row.status !== 2 && row.status !== 3"
            >取消</el-button
          >
          <el-button
            v-if="row.status == 2"
            size="small"
            plain
            @click="handlePrint(row)"
            >打印</el-button
          >
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

    <el-drawer
      title="报销申请单"
      :visible.sync="drawer.visible"
      direction="rtl"
      size="500px"
    >
      <BaoXiaoDetail
        class="bao-xiao-detail"
        :data="drawer.data.flow_params"
        :instance-id="drawer.data.id"
        myself
        @close="handleCloseDetail"
      ></BaoXiaoDetail>
    </el-drawer>

    <el-dialog :visible.sync="print.visible" title="报销单" width="840px">
      <div class="baoxiao-pdf-preview">
        <h2 align="center">报销</h2>
        <div class="pdf-header">
          <span class="company">厦门风领科技有限公司</span>
          <span class="apply-date"
            >申请日期：{{ print.data.flow_params.a_date }}</span
          >
        </div>
        <table border="1">
          <tbody>
            <tr>
              <td class="label">审批编码</td>
              <td colspan="4">{{ print.data.id }}</td>
            </tr>
            <tr>
              <td class="label">申请人</td>
              <td colspan="4">{{ print.data.flow_params.b_user_name }}</td>
            </tr>
            <tr>
              <td class="label">申请人部门</td>
              <td colspan="4">{{ print.data.flow_params.b_dept_name }}</td>
            </tr>
            <tr>
              <td class="label">申请事由</td>
              <td colspan="4">公司内网搭建、网络部署</td>
            </tr>

            <tr>
              <td class="label"></td>
              <td>名称</td>
              <td>数量</td>
              <td>单位</td>
              <td>价格</td>
            </tr>
            <tr
              v-for="(item, index) in print.data.flow_params.detailList"
              :key="index"
            >
              <td class="label">报销明细{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.number }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ calMoney(item) | 1000 }}</td>
            </tr>

            <tr>
              <td class="label">支付方式</td>
              <td colspan="4">{{ print.data.flow_params.pay_type }}</td>
            </tr>
            <tr v-for="(item, index) in print.actList" :key="index">
              <td
                v-if="index == 0"
                class="label"
                :rowspan="print.actList.length + 1"
              >
                审批流程
              </td>
              <td colspan="4">{{ item.act_user }} 已同意</td>
            </tr>
          </tbody>
        </table>
        <div class="stamp">
          <div class="stamp-inside">
            <span>审批通过</span>
          </div>
        </div>
      </div>
      <div slot="footer" style="margin-top: 50px">
        <el-button type="primary" size="small" @click="printOrder"
          >打印报销单</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaoXiaoDetail from './detail';
import pdfjs from '@/utils/pdf';
import { watermarkIt } from 'easy-watermark';
import NP from 'number-precision';

export default {
  components: {
    BaoXiaoDetail
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
      this.$router.push({ path: '/baoxiao/add' });
    },
    handleCancel(row) {
      // 取消报销
      this.$confirm(`确定取消报销流程？`, {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '关闭'
      }).then(() => {
        this.$axios({
          url: '/api/bao-xiao/cancel',
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
        url: '/api/bao-xiao/query-my-baoxiao',
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
      this.$nextTick(() => {
        watermarkIt({
          el: '.baoxiao-pdf-preview',
          text: '李锦新',
          color: 'rgba(0, 0, 0, .2)'
        });
      });
      const res = await this.$axios({
        url: '/api/bao-xiao/query-instance-process-status',
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
    },
    printOrder() {
      pdfjs({ selector: '.baoxiao-pdf-preview', filename: '报销单.pdf' });
    },
    calMoney(data) {
      return NP.round(NP.times(data.money, data.number), 2);
    }
  },
  mounted() {
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

.baoxiao-pdf-preview {
  position: relative;
  padding: 50px 100px 0;
  width: 600px;
  margin: 0 auto;

  .pdf-header {
    margin: 10px 0;
    font-weight: normal;

    .apply-date {
      margin-left: 40px;
    }
  }

  table {
    font-weight: normal;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;

    tbody {
      tr {
        td {
          padding: 10px;
        }

        .label {
          width: 150px;
        }
      }
    }
  }

  .stamp {
    position: absolute;
    top: 50px;
    right: 100px;
    font-weight: normal;
    display: inline-block;
    border-radius: 50%;
    border: 1px solid #78f778;
    font-size: 18px;
    padding: 5px;

    .stamp-inside {
      width: 50px;
      height: 50px;
      padding: 10px;
      border-radius: 50%;
      border: 1px solid #78f778;
      text-align: center;
      color: #7ec13b;
      transform: rotate(-30deg);
      line-height: 1.3rem;

      span {
        display: inline-block;
        margin-top: 5px;
      }
    }
  }
}
</style>
