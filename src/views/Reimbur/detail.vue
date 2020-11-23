<template>
  <div class="main">
    <el-form label-width="100px">
      <el-form-item label="填单人：">
        {{ data.a_user_name }}
        （<i>{{ data.a_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="申请人：">
        {{ data.b_user_name }}
        （<i>{{ data.b_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="发票号：">
        {{ data.receipt_number }}
      </el-form-item>
      <el-form-item label="申请类型：">
        {{ data.apply_type }}
      </el-form-item>
      <el-form-item label="付款方式：">
        {{ data.pay_type }}
      </el-form-item>
      <el-form-item label="总报销金额：">
        <span class="money-color">{{ data.total_money | 1000 }}</span>
        元
      </el-form-item>

      <div class="detail-body">
        <div v-for="(item, index) in data.detailList" :key="index">
          <h4 class="detail-header">报销明细({{ index + 1 }})</h4>
          <el-form-item label="物品名称：">
            {{ item.name }}
          </el-form-item>
          <el-form-item label="价格：">
            <span class="money-color">{{ calTotalMoney(item.money, item.number) }}</span>
            元
          </el-form-item>
          <el-form-item label="备注：">
            {{ item.remark }}
          </el-form-item>
        </div>
      </div>

      <div class="workflow">
        <h3 class="workflow-title">审核流程</h3>
        <el-timeline>
          <el-timeline-item v-for="(act, index) in actList" :key="index" :timestamp="act.time" :color="act.color">
            <h3>{{ act.msg }}</h3>
            <div class="desc">
              {{ act.act_user }}
              <span v-if="act.status" :style="{ color: act.status === 2 ? '#359e35' : '' }">
                （{{ getStatus(act) }}）
              </span>
            </div>
            <div v-if="act.remark">备注：{{ act.remark }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="reEdit" align="center">
        <el-button type="primary" round style="width: 200px; margin-top: 20px" @click="handleEdit">重新编辑</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import NP from 'number-precision';
import filter from '@/utils/filter';

export default {
  name: 'BaoXiaoDetail',
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          detailList: []
        };
      }
    },
    // 流程实例ID
    instanceId: Number,
    // 是否是自己在查看
    myself: Boolean
  },
  watch: {
    instanceId(val) {
      this.query();
    }
  },
  computed: {
    // 是否可以编辑，只有还未审批过的流程才可以编辑
    reEdit() {
      let actLength = this.actList.length;
      if (actLength !== 2) {
        return false;
      }
      actLength = this.actList.filter(act => act.status === 1).length;
      return this.myself && actLength === 1;
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      actList: []
    };
  },
  methods: {
    async query() {
      if (this.instanceId) {
        this.actList = [];
        const res = await this.$axios({
          url: '/api/reimbur/query-instance-process-status',
          method: 'GET',
          params: {
            id: this.instanceId
          }
        });
        this.actList = res.data;
      }
    },
    calTotalMoney(money, number) {
      return filter['1000'](NP.times(money, number));
    },
    getStatus(act) {
      if (act.transfer) {
        if (act.status === 1) {
          return '转账中';
        } else if (act.status === 2) {
          return '已到账';
        }
      }
      let status = act.status;
      switch (status) {
        case 1:
          return '审批中';
        case 2:
          return '审批通过';
        case 3:
          return '已取消';
        case 4:
          return '已驳回';
        default:
          return '未知';
      }
    },
    handleEdit() {
      this.$emit('close');
      this.$router.push({ path: '/reimbur/edit/' + this.instanceId });
    }
  },
  mounted() {
    this.query();
  }
};
</script>

<style lang="scss" scoped>
.main {
  .el-form-item {
    margin-bottom: 0px;
  }

  .detail-body {
    .detail-header {
      background-color: #d7d8de;
      line-height: 2rem;
    }
  }

  .detail-footer {
    .el-col {
      margin-top: 20px;
    }
  }

  .workflow {
    .workflow-title {
      margin-top: 10px;
      margin-bottom: 20px;
      background-color: #b3d8ff;
    }

    .el-timeline {
      margin-left: 20px;

      .desc {
        color: #666666;
      }
    }
  }
}

.money-color {
  color: red;
}
</style>
