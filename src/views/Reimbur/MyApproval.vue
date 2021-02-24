<template>
  <div>
    <el-row>
      <el-col :span="20">
        <el-form :inline="true">
          <el-form-item>
            <el-select v-model="filters.status" style="width: 120px">
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
      <el-table-column label="审批状态" prop="task_status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.task_status === 1">
            {{ row.refext ? '已转账' : '待我审批' }}
          </el-tag>
          <el-tag v-else-if="row.task_status === 2" type="success">已同意</el-tag>
          <el-tag v-else-if="row.task_status === 3" type="info">已取消</el-tag>
          <el-tag v-else-if="row.task_status === 4" type="danger">已驳回</el-tag>
          <el-tag v-else type="warn">未知状态</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报销流程状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1">审批中 </el-tag>
          <el-tag v-else-if="row.status === 2" type="success">已完成</el-tag>
          <el-tag v-else-if="row.status === 3" type="info">已取消</el-tag>
          <el-tag v-else-if="row.status === 4" type="danger">已驳回</el-tag>
          <el-tag v-else type="warn">未知状态</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createtime" align="center" :formatter="timeFormatter"></el-table-column>
      <el-table-column label="报销金额" align="center">
        <template slot-scope="{ row }">
          {{ Number(row.total_money) | 1000 }}
        </template>
      </el-table-column>
      <el-table-column label="报销事由" prop="reason" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" size="small" @click="handleShow(row)">{{
            row.task_status == 1 && !row.refext ? '审批' : '查看'
          }}</el-button>
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
      <div class="drawer-body">
        <bao-xiao-detail
          ref="reimburDetail"
          class="bao-xiao-detail"
          :style="{ height: baoxiaoHeight }"
          :data="drawer.data"
          :processList="drawer.processList"
          :detailList="drawer.detailList"
          :copys="drawer.copys"
          @refreshProcess="queryProcessDetail"
        ></bao-xiao-detail>
        <el-row v-if="drawer.data.task_status === 1 && drawer.data.refext == ''" class="detail-footer" :gutter="30">
          <el-col :span="24">
            <el-input
              v-model.trim="form.remark"
              type="textarea"
              resize="none"
              rows="4"
              placeholder="输入驳回信息，例如：衣服不能报销"
            ></el-input>
          </el-col>

          <el-col :span="12">
            <el-button style="width: 100%" @click="handleReject">驳 回</el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="drawer.data.stage === 'stage-transfer'"
              style="width: 100%"
              type="primary"
              @click="handleTransferShow"
              >转 账</el-button
            >
            <el-button v-else style="width: 100%" type="primary" @click="handleThen">同 意</el-button>
          </el-col>
        </el-row>
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

    <el-dialog :visible.sync="transfer.visible" title="转账" width="850px" :close-on-click-modal="false">
      <el-form label-width="100px" :model="transfer" ref="transferForm" :rules="transferRules">
        <el-form-item label="打款单位：">{{ drawer.data.payee }}</el-form-item>
        <el-form-item label="银行卡号：">{{ drawer.data.bank_account }}</el-form-item>
        <el-form-item label="开户行：">{{ drawer.data.bank_name }}</el-form-item>
        <el-form-item label="开户地：">{{ drawer.data.bank_address }}</el-form-item>
        <el-form-item label="打款金额："
          ><span style="color: red">￥{{ Number(drawer.data.total_money) | 1000 }}</span></el-form-item
        >
        <el-form-item label="银行摘要：" prop="remark">
          <el-input
            v-model="transfer.remark"
            type="textarea"
            placeholder="使用线上打款时，作为打款的银行摘要，例如：报销款"
          ></el-input>
        </el-form-item>
        <el-form-item label="打款账户：" prop="bank_id">
          <div class="bank-wrap">
            <div
              class="bank-item"
              v-for="item in bankList"
              :key="item.bank_account"
              :class="item.bank_account == transfer.bank_account ? 'active' : ''"
              @click="transfer.bank_account = item.bank_account"
            >
              <p class="bank-name">{{ item.bank_name }}</p>
              <p class="bank-account">{{ item.bank_account }}</p>
              <div align="right">
                <el-tooltip
                  v-if="item.online_pay"
                  class="item"
                  effect="dark"
                  content="使用报销系统打款，这里转账后等待银行到账，自动完成该报销"
                  placement="top"
                >
                  <span class="bank-flag bank-flag-green">线上打款</span>
                </el-tooltip>
                <el-tooltip
                  v-else
                  class="item"
                  effect="dark"
                  content="出纳线下打款，这里转账后直接完成该报销"
                  placement="top"
                >
                  <span class="bank-flag">线下打款</span>
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div align="right" slot="footer">
        <el-button @click="transfer.visible = false">关 闭</el-button>
        <el-button @click="handleTransfer" type="primary">转 账</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaoXiaoDetail from './detail';
import ReimburForm1 from './ReimburForm1';
import ReimburForm2 from './ReimburForm2';
import Bus from '@/utils/bus';
import dayjs from 'dayjs';

export default {
  components: {
    BaoXiaoDetail,
    ReimburForm1,
    ReimburForm2
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
        size: 20
      },
      statusList: [
        { label: '全部', value: 0 },
        { label: '待我审批', value: 1 },
        { label: '已同意', value: 2 },
        { label: '已取消', value: 3 },
        { label: '已驳回', value: 4 }
      ],
      // 银行列表
      bankList: [],
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
      },

      // 转账弹框
      transfer: {
        visible: false,
        remark: '',
        bank_account: null
      },
      transferRules: {
        remark: [{ required: true, message: '请填写银行摘要', trigger: 'blur' }],
        bank_account: [{ required: true, message: '请选择打款账户', trigger: 'blur' }]
      }
    };
  },
  computed: {
    baoxiaoHeight() {
      if (this.drawer.data.task_status === 1 && this.drawer.data.refext == '') {
        return 'calc(100vh - 260px)';
      }
      return 'calc(100vh - 100px)';
    }
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
    // 查询银行列表
    async queryBankList() {
      const res = await this.$axios({
        url: '/api/reimbur/bank-list'
      });
      this.bankList = res.data;
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
        url: '/api/reimbur/query-approve',
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
      this.$confirm('确定驳回该报销？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/reimbur/reject',
          method: 'POST',
          data: {
            task_id: this.drawer.data.task_id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.$message.success('操作成功');
            this.query();
            this.queryProcessDetail();
            Bus.$emit('resetCount');
            this.drawer.visible = false;
            this.form.remark = '';
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
      this.$confirm('确定同意该报销？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$axios({
          url: '/api/reimbur/agree',
          method: 'POST',
          data: {
            task_id: this.drawer.data.task_id,
            remark: this.form.remark,
            updatetime: this.drawer.data.updatetime
          }
        })
          .then(res => {
            this.$message.success('操作成功');
            this.query();
            this.queryProcessDetail();
            Bus.$emit('resetCount');
            this.drawer.visible = false;
            this.form.remark = '';
          })
          .catch(err => {
            if (err.code === 506) {
              // 流程已被重新编辑过
              this.query();
            }
          });
      });
    },
    handleTransferShow() {
      for (let item of this.drawer.detailList) {
        if (!item.subject_id) {
          return this.$message.warning('打款前报销明细必须指定科目信息');
        }
      }
      // 保存科目
      this.$refs.reimburDetail.saveSubject();
      this.transfer.visible = true;
    },
    // 转账
    handleTransfer() {
      this.$refs.transferForm.validate(valid => {
        if (!valid) {
          return false;
        }

        this.$confirm(
          `使用打款账户【${this.transfer.bank_account}】向【${this.drawer.data.payee}(${this.drawer.data.bank_account})】转账 ￥${this.drawer.data.total_money}`,
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
              task_id: this.drawer.data.task_id,
              remark: this.transfer.remark,
              bank_account: this.transfer.bank_account,
              updatetime: this.drawer.data.updatetime
            }
          }).then(res => {
            this.$message.success('操作成功');
            this.transfer.visible = false;
            this.drawer.visible = false;
            this.query();
            this.queryProcessDetail();
          });
        });
      });
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
    this.queryBankList();
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
    box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
    .el-col {
      margin-top: 20px;
    }
  }
}

.bank-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .bank-item {
    border: 1px solid #d3d3d3;
    border-radius: 5px;
    flex-basis: 220px;
    flex-grow: 0;
    margin-bottom: 10px;
    cursor: pointer;

    .bank-name,
    .bank-account {
      margin-left: 10px;
    }

    .bank-flag {
      margin-right: 10px;
      border-radius: 2px;
      padding: 1px 3px;
    }
    .bank-flag-green {
      background-color: #aaffd8;
      border: 1px solid #08da7a;
    }
  }

  .bank-item:hover {
    background-color: aliceblue;
  }

  .active {
    background-color: aliceblue;
  }
}
</style>
