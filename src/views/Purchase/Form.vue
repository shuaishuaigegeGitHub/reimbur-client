<template>
  <div>
    <el-form :model="form" label-width="120px" :rules="rules" ref="applyForm">
      <h3 align="center">基本信息</h3>
      <el-divider></el-divider>
      <el-form-item label="期望交付日期：">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="申请事由：">
        <el-input v-model="form.reasons" type="textarea" placeholder="请输入采购事由"></el-input>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入"></el-input>
      </el-form-item>

      <h3 align="center">采购明细</h3>
      <div v-for="(item, index) in form.detail" :key="index">
        <el-divider></el-divider>
        <el-row class="detail-title">
          <el-col :span="12">
            <h4>采购明细({{ index + 1 }})</h4>
          </el-col>
          <el-col :span="12" align="right">
            <el-button v-if="form.detail.length > 1" type="text" @click="delDetail(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-form-item label="物品名称：">
          <el-input v-model.trim="item.name" style="max-width: 500px" placeholder="例如：纸巾，台式电脑等"></el-input>
        </el-form-item>
        <el-form-item label="规格：">
          <el-input v-model="item.norm" style="max-width: 500px"></el-input>
        </el-form-item>
        <el-form-item label="单价(元)：">
          <el-input v-model="item.money" type="number" style="max-width: 500px"></el-input>
        </el-form-item>
        <el-form-item label="数量：">
          <el-input v-model="item.number" type="number" style="max-width: 500px"></el-input>
        </el-form-item>
        <el-form-item label="单位：">
          <el-select
            style="width: 300px"
            v-model="item.unit"
            filterable
            clearable
            allow-create
            default-first-option
            placeholder="请选择单位或者自己输入单位"
          >
            <el-option v-for="item in unitList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属科目：">
          <el-cascader
            style="width: 300px"
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
          ></el-cascader>
        </el-form-item>
      </div>

      <div>
        <el-button type="primary" icon="el-icon-plus" plain style="margin-left: 120px" @click="addDetail"
          >添加采购明细</el-button
        >
      </div>

      <el-divider></el-divider>

      <div>
        <el-form-item label="总报销金额：">
          <span class="money">{{ totalMoney }}</span> 元
        </el-form-item>
        <el-form-item label="审批人：">
          <div class="approve-wrap">
            <div v-for="(item, index) in form.approvers" :key="'approve-' + item.id" class="approve-item">
              <el-avatar shape="square" size="large" :src="item.avatar">{{ item.user_name.slice(0, 1) }}</el-avatar>
              <span>{{ item.user_name }}</span>
              <i class="el-icon-arrow-right"></i>
              <span class="fl-close" @click="handleDelApprove(index)">x</span>
            </div>
            <el-select v-model="approveUser" @change="handleSelectApprove" placeholder="请选择审批人">
              <el-option
                v-for="item in approveList"
                :key="item.id"
                :label="item.user_name"
                :value="item.id"
              ></el-option>
            </el-select>
          </div>
        </el-form-item>
      </div>

      <div class="footer">
        <el-button type="primary" round style="width: 200px" @click="handleSubmit">提 交</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import NP from 'number-precision';
import { getAllUser, getAllDept } from '@/api/index';

export default {
  props: {
    model: Object
  },
  watch: {
    model(val) {
      if (val) {
        this.form = val;
        this.edit = true;
      }
    }
  },
  data() {
    return {
      edit: false,
      // 最大采购金额
      maxMoney: 99999999,
      form: {
        detail: [
          {
            money: 0,
            number: 1,
            norm: '',
            unit: '',
            subject_id: null,
            name: ''
          }
        ],
        // 审批人
        approvers: [],
        remark: ''
      },
      approveUser: null,
      rules: {},
      // 单位列表
      unitList: [
        {
          label: '个',
          value: '个'
        },
        {
          label: '袋',
          value: '袋'
        },
        {
          label: '台',
          value: '台'
        },
        {
          label: '包',
          value: '包'
        }
      ],
      // 科目列表
      subjectData: [],
      // 用户列表
      userList: []
    };
  },
  computed: {
    totalMoney() {
      return this.form.detail
        .map(item => {
          return NP.times(item.money, item.number);
        })
        .reduce((prev, cur) => {
          return NP.plus(prev, cur);
        }, 0);
    },
    // 审批人列表
    approveList() {
      return this.userList.filter(item => {
        return !this.form.approvers.find(approve => approve.id == item.id);
      });
    }
  },
  methods: {
    // 添加明细
    addDetail() {
      this.form.detail.push({
        name: '',
        money: 0,
        number: 1,
        norm: '',
        unit: '',
        subject_id: null
      });
    },
    // 删除明细
    delDetail(index) {
      this.form.detail.splice(index, 1);
    },
    // 采购明细校验
    validDetail(detail) {
      if (!detail.name) {
        this.$message.warning('请输入报销明细的物品名称');
        return false;
      }
      if (detail.number < 1) {
        this.$message.warning('报销明细的数量不能小于1');
        return false;
      }
      if (detail.money <= 0) {
        this.$message.warning('报销明细的单价不能小于0元');
        return false;
      }
      if (!detail.unit) {
        this.$message.warning('报销明细的单位必须填写');
        return false;
      }
      if (!detail.subject_id) {
        this.$message.warning('请选择报销明细的科目');
        return false;
      }
      return true;
    },
    // 提交
    handleSubmit() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          if (!this.form.approvers) {
            return this.$message.warning('至少选择一个审批人');
          }
          for (let detail of this.form.detail) {
            if (!this.validDetail(detail)) {
              return false;
            }
          }

          if (this.totalMoney > this.maxMoney) {
            // 报销总金额不能大于 999999.99
            return this.$message.warning(`报销金额不能大于 ￥${this.maxMoney}`);
          }

          // 抛出事件到上级
          this.$emit('submit', this.form);
        } else {
          return false;
        }
      });
    },
    // 查询科目树
    querySubject() {
      this.$axios({
        url: '/api/reimbur/subject-tree',
        methods: 'get'
      }).then(res => {
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
        let subjectData = res.data.find(item => item.id.startsWith('20'));
        // 采购，报销只需要 ’管理费用‘ 和 ’固定资产‘ 两个大科目即可
        this.subjectData = subjectData.children.filter(item => item.id == '2002' || item.id == '2003').map(treeMap);
      });
    },
    subjectFilterMethod(node, keyword) {
      let label = node.label;
      if (label.includes(keyword)) {
        return true;
      }
      let spell = label.spell('first', 'low');
      return spell.includes(keyword);
    },
    // 选择审批人事件
    handleSelectApprove(val) {
      const user = this.userList.find(item => item.id === val);
      this.form.approvers.push(user);
      this.approveUser = null;
    },
    setForm(form) {
      this.form = form;
    },
    resetForm() {
      this.form = {
        detail: [
          {
            money: 0,
            number: 1,
            norm: '',
            unit: '',
            subject_id: null,
            name: ''
          }
        ],
        // 审批人
        approvers: [],
        remark: ''
      };
    },
    handleDelApprove(index) {
      this.form.approvers.splice(index, 1);
    }
  },
  async mounted() {
    this.userList = await getAllUser();
    this.querySubject();
  }
};
</script>

<style lang="scss" scoped>
.detail-title {
  margin-bottom: 10px;
  padding: 0 20px;
}
.money {
  color: red;
}
.footer {
  margin-left: 120px;
}
.approve-wrap {
  display: flex;

  .approve-item {
    width: 50px;
    line-height: 20px;
    margin-right: 20px;
    position: relative;

    .el-icon-arrow-right {
      position: absolute;
      right: -10px;
      top: 16px;
    }

    .fl-close {
      position: absolute;
      cursor: pointer;
      border-radius: 50%;
      text-align: center;
      line-height: 14px;
      width: 14px;
      display: inline-block;
      font-weight: normal;
      background: black;
      color: white;
      top: -5px;
      right: 5px;
    }
  }
}
</style>
