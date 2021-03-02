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
            {{ data.applicant_name }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-price-tag"></i> 期望交付日期</span>
            {{ data.date }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-edit-outline"></i> 申请事由</span>
            {{ data.reasons }}
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-money"></i> 总采购金额</span>
            <span class="money-color">￥{{ Number(data.total_money) | 1000 }}</span> 元
          </el-form-item>
          <el-form-item>
            <span class="label" slot="label"> <i class="el-icon-money"></i> 备注</span>
            <div v-html="data.remark"></div>
          </el-form-item>
        </el-form>
      </div>

      <div style="padding-right: 10px">
        <h3 class="title">采购明细</h3>
        <el-table :data="details" border size="mini" style="width: 770px">
          <el-table-column label="物品名称" prop="name" align="center">
            <template slot-scope="{ row }">
              <el-tooltip v-if="row.remark" effect="dark" :content="row.remark" placement="top">
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
        </el-table>
      </div>

      <slot name="approve"></slot>
    </div>

    <div class="main-right">
      <div v-if="data.copys && data.copys.length" class="copy-wrapper">
        <h4 class="title">抄送人</h4>
        <div class="copy-content">
          <div v-for="item in data.copys" :key="'copy-' + item.id" class="copy-item">
            <el-avatar shape="square" size="large" :src="item.avatar">{{ item.user_name.slice(0, 1) }}</el-avatar>
            <span>{{ item.user_name }}</span>
          </div>
        </div>
      </div>

      <div class="process-wrapper">
        <h4 class="title">流程动态</h4>
        <div v-for="(act, index) in actList" :key="index" class="process-item">
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
      if (!this.myself || this.data.status === 2) {
        return false;
      }
      if (this.data.status == 3 || this.data.status == 4) {
        return true;
      }
      let last = this.actList[this.actList.length - 1];
      return last && last.stage === 1;
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      // 流程记录
      actList: [],
      // 明细数据
      details: [],

      commentForm: ''
    };
  },
  methods: {
    async query() {
      if (this.data.id) {
        this.actList = [];
        const res = await this.$axios({
          url: '/api/purchase/query-process-detail',
          method: 'GET',
          params: {
            id: this.data.id
          }
        });
        this.actList = res.data.actList;
        this.details = res.data.details;
      }
    },
    calTotalMoney(money, number) {
      return filter['1000'](NP.times(money, number));
    },
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
    handleEdit() {
      this.$emit('close');
      this.$router.push({ path: '/purchase/edit/' + this.data.id });
    },
    async handleAddComment() {
      if (this.commentForm === '') {
        return this.$message.warning('请填写评论');
      }
      await this.$axios({
        url: '/api/purchase/comment',
        method: 'POST',
        data: {
          id: this.data.id,
          remark: this.commentForm
        }
      });
      this.query();
      this.commentForm = '';
    }
  },
  mounted() {
    this.query();
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
