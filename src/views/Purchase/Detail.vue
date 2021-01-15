<template>
  <div class="main">
    <el-form label-width="120px">
      <el-form-item label="申请人：">
        {{ data.applicant_name }}
      </el-form-item>
      <el-form-item label="期望交付日期：">
        {{ data.date }}
      </el-form-item>
      <el-form-item label="申请事由：">
        {{ data.reasons }}
      </el-form-item>
      <el-form-item label="备注：">
        {{ data.remark }}
      </el-form-item>
      <el-form-item label="图片：">
        <div class="image-wrap">
          <div class="image-item" v-for="(item, index) in data.images" :key="index">
            <el-image
              style="width: 80px; height: 80px"
              fit="cover"
              :src="item"
              :preview-src-list="data.images"
            ></el-image>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="总采购金额：">
        <span class="money-color">{{ totalMoney | 1000 }}</span>
        元
      </el-form-item>

      <div class="detail-body">
        <div v-for="(item, index) in data.detail" :key="index">
          <h4 class="detail-header">采购明细({{ index + 1 }})</h4>
          <el-form-item label="物品名称：">
            {{ item.name }}
          </el-form-item>
          <el-form-item label="规格：">
            {{ item.norm }}
          </el-form-item>
          <el-form-item label="单价：">
            <span class="money-color">{{ Number(item.money) | 1000 }}</span>
            元
          </el-form-item>
          <el-form-item label="数量：">
            <span>{{ item.number + ' ' + item.unit }}</span>
          </el-form-item>
          <el-form-item label="总价格：">
            <span class="money-color">{{ calTotalMoney(item.money, item.number) }}</span>
            元
          </el-form-item>
          <el-form-item label="科目：">
            <span>{{ getCascaderLabel(item.subject_id) }}</span>
          </el-form-item>
        </div>
      </div>

      <div class="workflow">
        <h3 class="workflow-title">流程</h3>
        <el-timeline>
          <el-timeline-item v-for="(act, index) in actList" :key="index" :timestamp="act.time" :color="getColor(act)">
            <h3 :style="{ color: act.flag === 2 ? '#838483' : '' }">{{ act.username + ' ' + act.msg }}</h3>
            <div class="desc">
              <span v-if="act.status"> （{{ getStatus(act) }}） </span>
            </div>
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

      <div v-if="data.copys && data.copys.length" class="copy">
        <h3 class="copy-title">抄送人</h3>
        <div class="approve-wrap">
          <div v-for="item in data.copys" :key="'copy-' + item.id" class="approve-item" align="center">
            <el-avatar shape="square" size="large" :src="item.copys">{{ item.user_name.slice(0, 1) }}</el-avatar>
            <span>{{ item.user_name }}</span>
          </div>
        </div>
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
      console.log(this.data);
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
    // 已取消，已驳回的采购单可以基于该采购单重新开始采购
    reStart() {
      return this.myself && (this.data.status == 3 || this.data.status == 4);
    },
    totalMoney() {
      return this.data.detail
        .map(item => NP.round(NP.times(item.number, item.money), 2))
        .reduce((prev, cur) => {
          return NP.plus(prev, cur);
        }, 0);
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      actList: [],
      // 科目数据
      subjectData: [],

      comment: {
        visible: false,
        form: {
          remark: ''
        }
      }
    };
  },
  methods: {
    getColor(row) {
      switch (row.flag) {
        case 1:
          return '#409eff';
        case 3:
          return 'red';
        case 4:
          return 'red';
        default:
          return null;
      }
    },
    async query() {
      if (this.data.id) {
        this.actList = [];
        const res = await this.$axios({
          url: '/api/purchase/query-instance-process-status',
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
        this.$router.push({ path: '/purchase/edit/' + this.data.id });
      } else if (this.reStart) {
        this.$router.push({ path: '/purchase/add?pid=' + this.data.id });
      }
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
      this.subjectData = res.data.map(treeMap);
    },
    async handleAddComment() {
      if (this.comment.form.remark === '') {
        return this.$message.warning('请填写评论');
      }
      await this.$axios({
        url: '/api/purchase/comment',
        method: 'POST',
        data: {
          id: this.data.id,
          remark: this.comment.form.remark
        }
      });
      this.query();
      this.$message.success('操作成功');
      this.comment.form.remark = '';
      this.comment.visible = false;
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

  .image-wrap {
    display: flex;

    .image-item {
      margin-right: 10px;
    }
  }
}

.money-color {
  color: red;
}
</style>
