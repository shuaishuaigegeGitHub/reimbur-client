<template>
  <div>
    <el-form :model="form" label-width="100px" :rules="rules" ref="applyForm">
      <h3 align="center">基本信息</h3>
      <el-divider></el-divider>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="填单人：" prop="a_user_id">
            <el-select v-model="form.a_user_id" :disabled="edit" filterable>
              <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门：" prop="a_dept_id">
            <el-select v-model="form.a_dept_id" placeholder="填单人所在部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.dept_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期：" prop="a_date" label-width="70px">
            <el-date-picker
              style="width: 140px"
              v-model="form.a_date"
              type="date"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="申请人：" prop="b_user_id">
            <el-select v-model="form.b_user_id" :disabled="edit" filterable>
              <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门：" prop="b_dept_id">
            <el-select v-model="form.b_dept_id" placeholder="申请人所在部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.dept_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期：" prop="b_date" label-width="70px">
            <el-date-picker
              style="width: 140px"
              v-model="form.b_date"
              type="date"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="申请类型：">
            <el-select v-model="form.apply_type">
              <el-option v-for="item in applyTypeList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="付款方式：">
            <el-select v-model="form.pay_type">
              <el-option v-for="item in payTypeList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-form-item label="发票号：" prop="receipt_number">
          <el-input
            v-model.trim="form.receipt_number"
            type="textarea"
            placeholder="多个发票号中间用中文逗号分隔，例如：111，333，456"
            style="max-width: 500px"
          ></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="收款单位：" prop="payee">
          <el-input
            v-model.trim="form.payee"
            style="max-width: 500px"
            placeholder="收款单位为个人时直接写名字"
          ></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="银行卡号：" prop="bank_account">
          <el-input v-model.trim="form.bank_account" style="max-width: 500px"></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="开户银行：">
          <el-input
            v-model.trim="form.bank_name"
            style="max-width: 500px"
            placeholder="银行卡号不是招商银行的需要提供开户银行，例如：工商银行"
          ></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="开户地址：">
          <el-input
            v-model.trim="form.bank_address"
            style="max-width: 500px"
            placeholder="银行卡号不是招商银行的需要提供开户地址，例如：福建省厦门市"
          ></el-input>
        </el-form-item>
      </el-row>

      <h3 align="center">报销明细</h3>
      <div v-for="(item, index) in form.detailList" :key="index">
        <el-divider></el-divider>
        <el-row class="detail-title">
          <el-col :span="12">
            <h4>报销明细({{ index + 1 }})</h4>
          </el-col>
          <el-col :span="12" align="right">
            <el-button v-if="form.detailList.length > 1" type="text" @click="delDetail(index)">删除</el-button>
          </el-col>
        </el-row>
        <el-form-item label="单价(元)：">
          <el-input
            v-model="item.money"
            type="number"
            style="max-width: 500px"
            @change="handleMoneyChange(item)"
          ></el-input>
        </el-form-item>
        <el-form-item label="数量：">
          <el-input
            v-model="item.number"
            type="number"
            style="max-width: 500px"
            @change="handleNumberChange(item)"
          ></el-input>
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
        <el-form-item label="物品名称：">
          <el-input v-model.trim="item.name" style="max-width: 500px" placeholder="例如：纸巾，台式电脑等"></el-input>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input v-model.trim="item.remark" style="max-width: 500px"></el-input>
        </el-form-item>
      </div>

      <div>
        <el-button type="primary" icon="el-icon-plus" plain style="margin-left: 100px" @click="addDetail"
          >添加报销明细</el-button
        >
      </div>

      <el-divider></el-divider>

      <div>
        <el-form-item label="总报销金额：">
          <span class="money">{{ totalMoney }}</span> 元
        </el-form-item>
        <el-form-item label="审批人：">
          <el-select v-model="form.approve_user">
            <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div class="footer">
        <el-button type="primary" round style="width: 200px" @click="handleSubmit">提 交</el-button>
      </div>
    </el-form>
    <div style="height: 200px"></div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import NP from 'number-precision';
import { getAllUser, getAllDept } from '@/api/index';

export default {
  name: 'BaoXiaoForm',
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
      // 最大报销金额
      maxMoney: 99999999,
      edit: false,
      // 用户列表
      userList: [],
      // 部门列表
      deptList: [],
      applyTypeList: ['正常请款', '预付请款'],
      payTypeList: ['银行转账'],
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
      form: {
        a_user_id: null,
        a_dept_id: null,
        a_date: dayjs().format('YYYY-MM-DD'),
        b_user_id: null,
        b_dept_id: null,
        b_date: dayjs().format('YYYY-MM-DD'),
        apply_type: '正常请款',
        pay_type: '银行转账',
        approve_user: null,
        receipt_number: '',
        payee: '',
        bank_name: '招商银行',
        bank_account: '',
        detailList: [
          {
            money: 0,
            number: 1,
            unit: '',
            subject_id: null,
            name: '',
            remark: ''
          }
        ]
      },
      rules: {
        a_user_id: [{ required: true, message: '请选择填单人', trigger: 'blur' }],
        a_dept_id: [{ required: true, message: '请选择部门', trigger: 'blur' }],
        a_date: [{ required: true, message: '请选择日期', trigger: 'blur' }],

        b_user_id: [{ required: true, message: '请选择申请人', trigger: 'blur' }],
        b_dept_id: [{ required: true, message: '请选择部门', trigger: 'blur' }],
        b_date: [{ required: true, message: '请选择日期', trigger: 'blur' }],

        payee: [{ required: true, message: '请输入收款单位', trigger: 'blur' }],
        bank_account: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }]
      }
    };
  },
  computed: {
    totalMoney() {
      return this.form.detailList
        .map(item => {
          return NP.times(item.money, item.number);
        })
        .reduce((prev, cur) => {
          return NP.plus(prev, cur);
        }, 0);
    }
  },
  methods: {
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
        this.subjectData = res.data.filter(item => item.id.startsWith('20')).map(treeMap);
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
    addDetail() {
      this.form.detailList.push({
        money: 0,
        number: 1,
        unit: '',
        subject_id: null,
        name: '',
        remark: ''
      });
    },
    delDetail(index) {
      this.form.detailList.splice(index, 1);
    },
    handleMoneyChange(item) {
      item.money = NP.round(item.money, 2);
    },
    handleNumberChange(item) {
      item.number = NP.round(item.number, 0);
    },
    validDetail(detail) {
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
      if (!detail.name) {
        this.$message.warning('请输入报销明细的物品名称');
        return false;
      }
      return true;
    },
    // 提交
    handleSubmit() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          // 校验成功
          if (this.apply_type === '正常请款' && this.receipt_number.length === '') {
            return this.$message.warning('正常请款时，需要填写发票号！');
          }
          if (!this.form.approve_user) {
            return this.$message.warning('请选择您的上级作为审批人');
          }
          for (let detail of this.form.detailList) {
            if (!this.validDetail(detail)) {
              return false;
            }
          }
          let user = this.userList.find(item => item.id === this.form.a_user_id);
          // 填单人名字
          this.form.a_user_name = user.user_name;
          let dept = this.deptList.find(item => item.id === this.form.a_dept_id);
          // 填单人部门
          this.form.a_dept_name = dept.dept_name;

          user = this.userList.find(item => item.id === this.form.b_user_id);
          // 申请人名字
          this.form.b_user_name = user.user_name;
          dept = this.deptList.find(item => item.id === this.form.b_dept_id);
          // 申请人部门
          this.form.b_dept_name = dept.dept_name;

          user = this.userList.find(item => item.id === this.form.approve_user);
          // 审批人名字
          this.form.approve_user_name = user.user_name;

          // 报销总金额
          this.form.total_money = this.totalMoney;

          if (this.form.total_money > this.maxMoney) {
            // 报销总金额不能大于 999999.99
            return this.$message.warning(`报销金额不能大于 ￥${this.maxMoney}`);
          }

          // 抛出事件到上级
          this.$emit('submit', this.form);
        } else {
          return false;
        }
      });
    }
  },
  async mounted() {
    this.userList = await getAllUser();
    this.deptList = await getAllDept();
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
  margin-left: 100px;
}
</style>
