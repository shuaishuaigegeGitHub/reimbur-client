<template>
  <div class="main">
    <div class="main-left">
      <div>
        <h3 class="title">
          <el-row>
            <el-col :span="12">基本信息</el-col>
            <el-col :span="12" align="right">
              <el-button v-if="reEdit" type="text" style="margin-right: 10px" @click="handleEdit">重新编辑</el-button>
            </el-col>
          </el-row>
        </h3>
        <el-form label-width="150px" label-position="left">
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-user"></i> 填单人</span>
            {{ data.create_by }}
            （<i>{{ data.create_dept_name }}</i
            >）
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-user"></i> 申请人</span>
            {{ data.applicant_name }}
            （<i>{{ data.applicant_dept_name }}</i
            >）
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-price-tag"></i> 申请类型</span>
            {{ data.apply_type == 1 ? '正常请款' : '预付请款' }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-bank-card"></i> 付款方式</span>
            {{ data.pay_type == 1 ? '银行转账' : '' }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-edit-outline"></i> 报销事由</span>
            {{ data.reason }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-money"></i> 总报销金额</span>
            <span class="money-color">￥{{ Number(data.total_money) | 1000 }}</span> 元
          </el-form-item>
        </el-form>
      </div>

      <div>
        <h3 class="title">打款信息</h3>

        <el-form label-width="150px" label-position="left">
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-user"></i> 打款单位</span>
            {{ data.payee }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-bank-card"></i> 银行卡号</span>
            {{ data.bank_account }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-office-building"></i> 开户行</span>
            {{ data.bank_name }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-map-location"></i> 开户地</span>
            {{ data.bank_address }}
          </el-form-item>
        </el-form>
      </div>

      <div style="padding-right: 10px">
        <h3 class="title">报销明细</h3>
        <el-table :data="detailList" border size="mini" style="width: 770px">
          <el-table-column label="发票号" prop="receipt_number" align="center" width="150">
            <template slot-scope="{ row }">
              <el-input v-if="receiptWritable" size="mini" v-model="row.receipt_number"></el-input>
              <span v-else>{{ row.receipt_number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="科目" prop="subject_id" align="center" width="250">
            <template slot-scope="{ row }">
              <el-cascader
                v-if="subjectEdit"
                style="width: 100%"
                size="mini"
                v-model="row.subject_id"
                :options="subjectData"
                filterable
                :filter-method="subjectFilterMethod"
                :props="{
                  label: 'name',
                  value: 'id',
                  emitPath: false
                }"
                @change="updateSubject(row)"
              ></el-cascader>
              <span v-else>{{ getCascaderLabel(row.subject_id) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物品名称" prop="name" align="center">
            <template slot-scope="{ row }">
              <el-tooltip v-if="row.remark" effect="dark" :content="row.remark" placement="top-start">
                <span>{{ row.name }}</span>
              </el-tooltip>
              <span v-else>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="money" align="center">
            <template slot-scope="{ row }">
              {{ Number(row.money) | 1000 }}
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="number" align="center" width="80">
            <template slot-scope="{ row }">
              {{ row.number + ' ' + row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="总价" prop="number" align="center">
            <template slot-scope="{ row }">
              {{ calTotalMoney(row.money, row.number) }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="备注" prop="remark" align="center"></el-table-column> -->
        </el-table>
      </div>

      <div v-if="data.p_id && purchase.data" style="line-height: 2rem; margin-top: 20px" align="center">
        <el-button v-show="!purchase.show" type="text" @click="purchase.show = true">
          展开关联的采购单 <i class="el-icon-arrow-down"></i>
        </el-button>
        <el-button v-show="purchase.show" type="text" @click="purchase.show = false">
          收起关联的采购单 <i class="el-icon-arrow-up"></i>
        </el-button>
      </div>

      <div v-if="purchase.show">
        <div>
          <h3 class="title">
            <el-row>
              <el-col :span="12">基本信息</el-col>
              <el-col :span="12" align="right">
                <el-button v-if="reEdit" type="text" style="margin-right: 10px" @click="handleEdit">重新编辑</el-button>
              </el-col>
            </el-row>
          </h3>
          <el-form label-width="150px" label-position="left">
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-user"></i> 申请人</span>
              {{ purchase.data.applicant_name }}
            </el-form-item>
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-date"></i> 期望交付日期</span>
              {{ data.date }}
            </el-form-item>
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-edit-outline"></i> 报销事由</span>
              {{ purchase.data.reasons }}
            </el-form-item>
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-money"></i> 总采购金额</span>
              <span class="money-color">￥{{ Number(purchase.data.total_money) | 1000 }}</span> 元
            </el-form-item>
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-chat-dot-round"></i> 备注</span>
              {{ purchase.data.remark }}
            </el-form-item>
            <el-form-item>
              <span class="label" slot="label"> <i class="el-icon-picture"></i> 图片</span>
              <div class="image-wrap">
                <div class="image-item" v-for="(item, index) in purchase.data.images" :key="index">
                  <el-image
                    style="width: 80px; height: 80px"
                    fit="cover"
                    :src="item"
                    :preview-src-list="purchase.data.images"
                  ></el-image>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div style="padding-right: 10px">
          <h3 class="title">采购明细</h3>
          <el-table :data="purchase.data.detailList" border size="mini">
            <el-table-column label="物品名称" prop="name" align="center"></el-table-column>
            <el-table-column label="单价" prop="money" align="center">
              <template slot-scope="{ row }">
                {{ Number(row.money) | 1000 }}
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="number" align="center">
              <template slot-scope="{ row }">
                {{ row.number + ' ' + row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="总价" prop="number" align="center">
              <template slot-scope="{ row }">
                {{ calTotalMoney(row.money, row.number) }}
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" align="center"></el-table-column>
          </el-table>
        </div>
      </div>

      <slot name="approve"></slot>
    </div>

    <div class="main-right">
      <div v-if="copys && copys.length" class="copy-wrapper">
        <h4 class="title">抄送人</h4>
        <div class="copy-content">
          <div v-for="item in copys" :key="'copy-' + item.id" class="copy-item">
            <el-avatar shape="square" size="large" :src="item.avatar">{{ item.user_name.slice(0, 1) }}</el-avatar>
            <span>{{ item.user_name }}</span>
          </div>
        </div>
      </div>

      <div class="process-wrapper">
        <h4 class="title">流程动态</h4>
        <div v-for="(act, index) in processList" :key="index" class="process-item">
          <span class="process-icon">
            <i :class="getIcon(act)"></i>
          </span>
          <div class="process-content">
            <p>{{ act.username }} {{ act.msg }}</p>
            <p class="process-content-remark">
              {{ act.remark }}
            </p>
          </div>
          <dir class="process-time">{{ act.time }}</dir>
        </div>
        <div style="height: 100px"></div>
      </div>

      <div class="comment-wrapper">
        <el-input
          v-model.trim="commentForm"
          type="textarea"
          resize="none"
          placeholder="输入评论，按Enter发送评论"
          maxlength="255"
          show-word-limit
          rows="4"
          @keyup.enter.native="handleAddComment"
        ></el-input>
      </div>
    </div>
  </div>
</template>

<script>
import NP from 'number-precision';
import filter from '@/utils/filter';

export default {
  name: 'ReimburDetail',
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 是否是自己在查看
    myself: Boolean,
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
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      commentForm: '',
      // 科目数据
      subjectData: [],

      purchase: {
        show: false,
        data: null
      }
    };
  },
  watch: {
    data: function() {
      this.purchase.show = false;
      this.purchase.data = null;
      this.queryPurchase();
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
  methods: {
    getIcon(item) {
      let flag = item.flag;
      if (flag == 1) {
        return 'el-icon-chat-dot-round green-color';
      } else if (flag == 0) {
        return 'el-icon-coordinate';
      } else if (flag == 3 || flag == 4) {
        return 'el-icon-circle-close red-color';
      }
      if (item.msg.includes('编辑')) {
        return 'el-icon-edit-outline blue-color';
      } else if (item.msg.includes('发起')) {
        return 'el-icon-s-promotion blue-color';
      } else if (item.msg.includes('结束')) {
        return 'el-icon-switch-button blue-color';
      }
      return 'el-icon-circle-check blue-color';
    },
    calTotalMoney(money, number) {
      return filter['1000'](NP.times(money, number));
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
    // 科目过滤
    subjectFilterMethod(node, keyword) {
      let label = node.label;
      if (label.includes(keyword)) {
        return true;
      }
      let spell = label.spell('first', 'low');
      return spell.includes(keyword);
    },
    async handleAddComment() {
      if (!this.commentForm) {
        return;
      }
      await this.$axios({
        url: '/api/reimbur/comment',
        method: 'POST',
        data: {
          id: this.data.id,
          remark: this.commentForm
        }
      });
      // 重新查询流程数据
      this.$emit('refresh');
      this.commentForm = '';
    },
    // 前往编辑页面
    handleEdit() {
      this.$emit('close');
      this.$router.push({ path: '/reimbur/edit/' + this.data.id });
    },
    // 更新科目
    async updateSubject(row) {
      await this.$axios({
        url: '/api/reimbur/detail/update',
        method: 'POST',
        data: {
          id: row.id,
          subject_id: row.subject_id
        }
      });
    },
    // 查询关联的采购单
    async queryPurchase() {
      if (this.data.p_id) {
        const res = await this.$axios({
          url: '/api/reimbur/purchase/' + this.data.p_id
        });
        this.purchase.data = res.data;
      }
    }
  },
  mounted() {
    this.querySubjectData();
    this.queryPurchase();
  }
};
</script>

<style lang="scss" scoped>
.main {
  border-top: 1px solid #d3d3d3;
  display: flex;
  margin-top: -20px;

  .label {
    color: #999999;
    margin-left: 10px;
  }
  .title {
    color: #333333;
    line-height: 2rem;
    margin-top: 5px;
  }
  .el-form-item {
    margin-bottom: 0px;
  }

  .main-left {
    flex-basis: 0;
    flex-grow: 1;
    border-right: 1px solid #d3d3d3;

    .el-form {
      margin-left: 20px;
    }

    .image-wrap {
      display: flex;

      .image-item {
        margin-right: 10px;
      }
    }
  }
  .main-right {
    flex-basis: 400px;
    position: relative;

    .copy-wrapper {
      padding: 0 10px;
      border-bottom: 1px solid #d3d3d3;

      .copy-content {
        display: flex;
        flex-wrap: wrap;

        .copy-item {
          width: 50px;
          line-height: 20px;
          margin-right: 20px;
          position: relative;
        }
      }
    }

    .process-wrapper {
      padding: 0px 10px;
      color: #999999;
      font-weight: normal;

      .process-item {
        display: flex;
        line-height: 1.5rem;
        margin-bottom: 10px;

        .process-icon {
          flex-basis: 30px;
          text-align: center;
        }
        .process-content {
          flex-basis: 0;
          flex-grow: 1;
          color: #333333;

          .process-content-remark {
            border-left: 5px solid #999999;
            padding-left: 5px;
          }
        }
        .process-time {
          flex-basis: 140px;
          text-align: right;
        }
      }
    }

    .comment-wrapper {
      border-top: 1px solid #d3d3d3;
      position: absolute;
      height: 100px;
      width: 100%;
      bottom: 0;
    }
  }

  .money-color {
    color: red;
  }
  .green-color {
    color: #6ce270;
  }
  .blue-color {
    color: #409eff;
  }
  .red-color {
    color: red;
  }
}
</style>

<style lang="scss">
.comment-wrapper {
  .el-textarea {
    .el-textarea__inner {
      border: none;
    }
  }
}
.main-left {
  .el-table .cell {
    font-size: 12px;
  }
}
</style>
