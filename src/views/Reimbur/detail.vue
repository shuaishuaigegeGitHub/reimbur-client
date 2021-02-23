<template>
  <div class="main">
    <el-form label-width="100px">
      <el-form-item label="填单人：">
        {{ data.create_by }}
        （<i>{{ data.create_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="申请人：">
        {{ data.applicant_name }}
        （<i>{{ data.applicant_dept_name }}</i
        >）
      </el-form-item>
      <el-form-item label="申请类型：">
        {{ data.apply_type == 1 ? '正常请款' : '预付请款' }}
      </el-form-item>
      <el-form-item label="付款方式：">
        {{ data.pay_type == 1 ? '银行转账' : '' }}
      </el-form-item>
      <el-form-item label="报销事由：">
        {{ data.reason }}
      </el-form-item>
      <el-form-item label="总报销金额：">
        <span class="money-color">{{ Number(data.total_money) | 1000 }}</span>
        元
      </el-form-item>

      <div class="bank">
        <h3 class="bank-title">打款信息</h3>
        <el-form-item label="打款单位：">{{ data.payee }}</el-form-item>
        <el-form-item label="银行卡号：">{{ data.bank_account }}</el-form-item>
        <el-form-item label="开户行：">{{ data.bank_name }}</el-form-item>
        <el-form-item label="开户地：">{{ data.bank_address }}</el-form-item>
      </div>

      <div class="detail-body">
        <div v-for="(item, index) in detailList" :key="index">
          <h4 class="detail-header">报销明细({{ index + 1 }})</h4>
          <el-form-item label="发票号：">
            <el-input
              v-if="receiptWritable"
              v-model.trim="item.receipt_number"
              placeholder="预付请款发票号补充"
              size="small"
              @change="addEditReceipt(item)"
            ></el-input>
            <span v-else>{{ item.receipt_number }}</span>
          </el-form-item>
          <el-form-item label="物品名称：">
            {{ item.name }}
          </el-form-item>
          <el-form-item label="单价：">
            <span class="money-color">{{ Number(item.money) | 1000 }}</span>
            元
          </el-form-item>
          <el-form-item label="数量：">
            <span>{{ item.number + ' ' + item.unit }}</span>
          </el-form-item>
          <el-form-item label="价格：">
            <span class="money-color">{{ calTotalMoney(item.money, item.number) }}</span>
            元
          </el-form-item>
          <el-form-item label="科目：">
            <el-cascader
              v-if="subjectEdit"
              style="width: 100%"
              v-model="item.subject_id"
              :options="subjectData"
              clearable
              filterable
              :filter-method="subjectFilterMethod"
              :props="{
                label: 'name',
                value: 'id',
                emitPath: false
              }"
              @change="addEditSubject(item)"
            ></el-cascader>
            <span v-else>{{ getCascaderLabel(item.subject_id) }}</span>
          </el-form-item>
          <el-form-item label="备注：">
            {{ item.remark }}
          </el-form-item>
        </div>
        <div>
          <el-form-item v-if="editSubject.length">
            <el-button type="primary" @click="saveSubject">保存科目</el-button>
          </el-form-item>
          <el-form-item v-if="editReceipt.length">
            <el-button type="primary" @click="saveReceipt">保存发票号</el-button>
          </el-form-item>
        </div>
      </div>

      <div class="workflow">
        <h3 class="workflow-title">流程</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(act, index) in processList"
            :key="index"
            :timestamp="act.time"
            :color="getColor(act)"
          >
            <h3 :style="{ color: act.flag === 0 ? '#838483' : '' }">{{ act.username + ' ' + act.msg }}</h3>
            <div v-if="act.remark" class="remark">{{ act.remark }}</div>
          </el-timeline-item>
        </el-timeline>
        <div>
          <div v-if="comment.visible" class="comment-wrap">
            <el-input v-model="comment.form.remark" type="textarea" placeholder="请输入评论"></el-input>
            <el-row style="margin-top: 10px">
              <el-col :span="12" align="center">
                <el-button round @click="comment.visible = false" style="width: 90%">关 闭</el-button>
              </el-col>
              <el-col :span="12" align="center">
                <el-button type="primary" round @click="handleAddComment" style="width: 90%">发 送</el-button>
              </el-col>
            </el-row>
          </div>
          <div v-else align="center">
            <el-button type="success" plain @click="comment.visible = true" icon="el-icon-plus">添加评论</el-button>
          </div>
        </div>
      </div>

      <el-divider></el-divider>

      <div v-if="copys && copys.length" class="copy">
        <h3 class="copy-title">抄送人</h3>
        <div class="approve-wrap">
          <div v-for="item in copys" :key="'copy-' + item.id" class="approve-item" align="center">
            <el-avatar shape="square" size="large" :src="item.avatar">{{ item.user_name.slice(0, 1) }}</el-avatar>
            <span>{{ item.user_name }}</span>
          </div>
        </div>
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
        return {};
      }
    },
    detailList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    processList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    copys: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 是否是自己在查看
    myself: Boolean
  },
  watch: {
    'data.id'(val) {
      this.editSubject = [];
      this.editReceipt = [];
    }
  },
  computed: {
    // 已取消，已驳回的报销单可以基于该报销单重新开始报销
    reEdit() {
      if (this.myself && (this.data.status == 3 || this.data.status == 4)) {
        return true;
      }
      return this.myself && this.data.stage == 'stage-dept';
    },
    // 是否可编辑科目
    subjectEdit() {
      return !this.myself && this.data.task_status == 1 && !this.data.refext;
    },
    // 发票号
    receiptWritable() {
      return this.myself && this.data.status === 2 && this.data.apply_type === 2;
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      // 科目数据
      subjectData: [],

      comment: {
        visible: false,
        form: {
          remark: ''
        }
      },

      // 编辑过的科目
      editSubject: [],

      // 编辑过的发票号
      editReceipt: [],

      // 发票号校验规则
      receipt_number_regex: /[A-Z0-9]{6,8}/
    };
  },
  methods: {
    getColor(row) {
      switch (row.flag) {
        case 1:
          return '#6ce270';
        case 2:
          return '#409eff';
        case 3:
        case 4:
          return 'red';
        default:
          return null;
      }
    },
    async saveSubject() {
      if (this.editSubject.length) {
        await this.$axios({
          url: '/api/reimbur/save-subject',
          method: 'POST',
          data: this.editSubject
        });
        this.$message.success('保存科目成功');
        this.editSubject = [];
      }
    },
    calTotalMoney(money, number) {
      return filter['1000'](NP.times(money, number));
    },
    handleEdit() {
      this.$emit('close');
      this.$router.push({ path: '/reimbur/edit/' + this.data.id });
    },
    // 获取科目层级
    getCascaderLabel(value) {
      if (!value) {
        return '';
      }
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
    // 科目过滤
    subjectFilterMethod(node, keyword) {
      let label = node.label;
      if (label.includes(keyword)) {
        return true;
      }
      let spell = label.spell('first', 'low');
      return spell.includes(keyword);
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
      this.subjectData = res.data.filter(item => item.id.startsWith('20')).map(treeMap);
    },
    async handleAddComment() {
      if (this.comment.form.remark === '') {
        return this.$message.warning('请填写评论');
      }
      await this.$axios({
        url: '/api/reimbur/comment',
        method: 'POST',
        data: {
          id: this.data.id,
          remark: this.comment.form.remark
        }
      });
      // 重新查询流程数据
      this.$emit('refreshProcess');
      this.$message.success('评论成功');
      this.comment.form.remark = '';
      this.comment.visible = false;
    },
    // 修改了科目信息
    addEditSubject(row) {
      let temp = this.editSubject.find(item => item.id == row.id);
      if (temp) {
        temp.subject_id = row.subject_id;
      } else {
        this.editSubject.push({
          id: row.id,
          subject_id: row.subject_id
        });
      }
    },
    // 修改了发票号信息
    addEditReceipt(row) {
      let temp = this.editReceipt.find(item => item.id == row.id);
      if (temp) {
        temp.receipt_number = row.receipt_number;
      } else {
        this.editReceipt.push({
          id: row.id,
          receipt_number: row.receipt_number
        });
      }
    },
    // 保存发票号信息
    async saveReceipt() {
      if (this.editReceipt.length) {
        for (let data of this.editReceipt) {
          let arr = data.receipt_number.replace(/，/g, ',').split(',');
          for (let item of arr) {
            if (!this.receipt_number_regex.test(item.trim())) {
              return this.$message.error(`【${item}】格式不正确`);
            }
          }
        }
        await this.$axios({
          url: '/api/reimbur/save-receipt',
          method: 'POST',
          data: this.editReceipt
        });
        this.$message.success('保存发票号成功');
        this.editReceipt = [];
      }
    }
  },
  mounted() {
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

  .bank {
    .bank-title {
      margin-top: 10px;
      background-color: #f9d075;
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
      .remark {
        background-color: #dadada;
        padding: 10px;
      }
    }
  }

  .copy-title {
    margin-top: 10px;
    margin-bottom: 20px;
    background-color: #9ce0bd;
  }

  .approve-wrap {
    display: flex;

    .approve-item {
      width: 50px;
      line-height: 20px;
      margin-right: 20px;
      position: relative;
    }
  }
}

.money-color {
  color: red;
}
</style>
