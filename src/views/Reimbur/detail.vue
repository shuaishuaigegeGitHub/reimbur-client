<template>
  <div class="main">
    <el-form label-width="100px">
      <el-form-item label="填单人：">
        {{ data.flow_params.a_user_name }}
        （<i>{{ data.flow_params.a_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="申请人：">
        {{ data.flow_params.b_user_name }}
        （<i>{{ data.flow_params.b_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="发票号：">
        {{ data.flow_params.receipt_number }}
      </el-form-item>
      <el-form-item label="申请类型：">
        {{ data.flow_params.apply_type }}
      </el-form-item>
      <el-form-item label="付款方式：">
        {{ data.flow_params.pay_type }}
      </el-form-item>
      <el-form-item label="总报销金额：">
        <span class="money-color">{{ data.flow_params.total_money | 1000 }}</span>
        元
      </el-form-item>

      <div class="detail-body">
        <div v-for="(item, index) in data.flow_params.detailList" :key="index">
          <h4 class="detail-header">报销明细({{ index + 1 }})</h4>
          <el-form-item label="物品名称：">
            {{ item.name }}
          </el-form-item>
          <el-form-item label="价格：">
            <span class="money-color">{{ calTotalMoney(item.money, item.number) }}</span>
            元
          </el-form-item>
          <el-form-item label="科目：">
            <span>{{ getCascaderLabel(item.subject_id) }}</span>
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

      <div v-if="reEdit || reStart" align="center">
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
        return {};
      }
    },
    // 是否是自己在查看
    myself: Boolean
  },
  watch: {
    'data.id'(val) {
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
    },
    // 已取消，已驳回的报销单可以基于该报销单重新开始报销
    reStart() {
      return this.myself && (this.data.status == 3 || this.data.status == 4);
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      actList: [],
      // 科目数据
      subjectData: []
    };
  },
  methods: {
    async query() {
      if (this.data.id) {
        this.actList = [];
        const res = await this.$axios({
          url: '/api/reimbur/query-instance-process-status',
          method: 'GET',
          params: {
            id: this.data.id
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
      if (this.reEdit) {
        this.$router.push({ path: '/reimbur/edit/' + this.data.id });
      } else if (this.reStart) {
        this.$router.push({ path: '/reimbur/add?oid=' + this.data.id });
      }
    },
    // 获取科目层级
    getCascaderLabel(value) {
      const labels = [];
      const matchCascaderData = function(list) {
        list.forEach(item => {
          if (item.id == value) {
            labels.push(item.name);
          } else if (value.startsWith(item.id)) {
            labels.push(item.name);
            matchCascaderData(item.children);
          }
        });
      };
      matchCascaderData(this.subjectData);
      labels.shift();
      return labels.join(' / ');
    },
    // 查询科目数
    async querySubjectData() {
      const res = await this.$axios({
        url: '/api/reimbur/subject-tree',
        methods: 'get'
      });
      function treeMap(item) {
        let temp = {
          id: item.id,
          name: item.name,
          parent_id: item.parent_id,
          parent_str: item.parent_str,
          children: item.children.length ? item.children.map(treeMap) : null
        };
        return temp;
      }
      this.subjectData = res.data.map(treeMap);
    }
  },
  mounted() {
    this.query();
    this.querySubjectData();
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
