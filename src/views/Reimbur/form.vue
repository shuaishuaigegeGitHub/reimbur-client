<template>
  <div>
    <el-form :model="form" label-width="100px" :rules="rules" ref="applyForm">
      <h3 align="center">基本信息</h3>
      <el-divider></el-divider>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="填单人：" prop="create_id">
            <el-select v-model="form.create_id" disabled filterable>
              <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门：" prop="create_dept_id">
            <el-select v-model="form.create_dept_id" disabled placeholder="填单人所在部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.dept_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="申请人：" prop="applicant">
            <el-select v-model="form.applicant" :disabled="edit" filterable @change="handleChange">
              <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门：" prop="applicant_dept">
            <el-select v-model="form.applicant_dept" :disabled="edit" placeholder="申请人所在部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.dept_name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期：" prop="date" label-width="70px">
            <el-date-picker
              style="width: 140px"
              v-model="form.date"
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
              <el-option
                v-for="item in applyTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="付款方式：">
            <el-select v-model="form.pay_type">
              <el-option
                v-for="item in payTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
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
        <el-form-item label="开户银行：" prop="bank_name">
          <el-input
            v-model.trim="form.bank_name"
            style="max-width: 500px"
            placeholder="例如：工商银行，招商银行"
          ></el-input>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="开户地址：" prop="bank_address">
          <el-input
            v-model.trim="form.bank_address"
            style="max-width: 500px"
            placeholder="例如：福建省厦门市"
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
        <el-form-item label="发票号：">
          <el-input v-model.trim="item.receipt_number" style="max-width: 500px"></el-input>
        </el-form-item>
        <el-form-item label="单价(元)：">
          <el-input v-model="item.money" style="max-width: 500px" @change="handleMoneyChange(item)"></el-input>
        </el-form-item>
        <el-form-item label="数量：">
          <el-input v-model="item.number" style="max-width: 500px" @change="handleNumberChange(item)"></el-input>
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

      <div v-if="!form.p_id">
        <el-button type="primary" icon="el-icon-plus" plain style="margin-left: 100px" @click="addDetail"
          >添加报销明细</el-button
        >
      </div>

      <el-divider></el-divider>

      <div>
        <el-form-item label="报销事由：" prop="reason">
          <el-input v-model="form.reason" type="textarea" style="max-width: 500px"></el-input>
        </el-form-item>
        <el-form-item label="总报销金额：">
          <span class="money">{{ totalMoney }}</span> 元
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="审批人：">
          <el-select v-model="form.approve_user" filterable :disabled="edit">
            <el-option v-for="item in userList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抄送人：">
          <div class="approve-wrap">
            <div v-for="(item, index) in form.copys" :key="'copy-' + item.id" class="approve-item">
              <el-avatar shape="square" size="large" :src="item.avatar">{{ item.user_name.slice(0, 1) }}</el-avatar>
              <span>{{ item.user_name }}</span>
              <i class="el-icon-plus"></i>
              <span class="fl-close" @click="handleDelCopy(index)">x</span>
            </div>
            <el-select v-model="copyUser" @change="handleSelectCopy" filterable placeholder="请选择抄送人">
              <el-option v-for="item in copyList" :key="item.id" :label="item.user_name" :value="item.id"></el-option>
            </el-select>
          </div>
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
      // 申请类型
      applyTypeList: [
        {
          label: '正常请款',
          value: 1
        },
        {
          label: '预付请款',
          value: 2
        }
      ],
      // 付款方式
      payTypeList: [
        {
          label: '银行转账',
          value: 1
        }
      ],
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
        create_id: null,
        create_dept_id: null,
        applicant: null,
        applicant_dept: null,
        date: dayjs().format('YYYY-MM-DD'),
        apply_type: 1,
        pay_type: 1,
        approve_user: null,
        payee: '',
        bank_name: '',
        bank_account: '',
        bank_address: '',
        detailList: [
          {
            money: 0,
            number: 1,
            unit: '',
            subject_id: null,
            name: '',
            remark: '',
            receipt_number: ''
          }
        ],
        reason: '',
        copys: []
      },
      rules: {
        create_id: [{ required: true, message: '请选择填单人', trigger: 'blur' }],
        create_dept_id: [{ required: true, message: '请选择部门', trigger: 'blur' }],

        applicant: [{ required: true, message: '请选择申请人', trigger: 'blur' }],
        applicant_dept: [{ required: true, message: '请选择部门', trigger: 'blur' }],
        date: [{ required: true, message: '请选择日期', trigger: 'blur' }],

        payee: [{ required: true, message: '请输入收款单位', trigger: 'blur' }],
        bank_account: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }],
        bank_name: [{ required: true, message: '请输入开户银行', trigger: 'blur' }],
        bank_address: [{ required: true, message: '请输入开户地址', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入报销事由', trigger: 'blur' }]
      },
      // 发票号正则校验
      receipt_number_regex: /[A-Z0-9]{6,8}/,

      // 定时器
      timer: null,

      copyUser: null
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
    },
    // 抄送人列表
    copyList() {
      return this.userList.filter(item => {
        return !this.form.copys.find(approve => approve.id == item.id);
      });
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
        let subjectData = res.data.find(item => item.id.startsWith('20'));
        // 采购，报销只需要 ’管理费用‘ 和 ’固定资产‘ 两个大科目即可
        this.subjectData = subjectData.children
          .filter(item => item.id == '2002' || item.id == '2003' || item.id == '2008')
          .map(treeMap);
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
        receipt_number: '',
        subject_id: null,
        name: '',
        remark: ''
      });
    },
    // 清空报销明细
    resetDetailList() {
      this.form.detailList = [
        {
          money: 0,
          number: 1,
          unit: '',
          receipt_number: '',
          subject_id: null,
          name: '',
          remark: ''
        }
      ];
      this.form.reason = '';
      this.form.p_id = 0;
    },
    delDetail(index) {
      this.form.detailList.splice(index, 1);
    },
    handleMoneyChange(item) {
      let money = NP.round(parseFloat(item.money), 2) || 0;
      item.money = money < 0 ? 0 : money;
    },
    handleNumberChange(item) {
      let number = parseInt(item.number) || 1;
      item.number = number < 1 ? 1 : number;
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
      if (!detail.name) {
        this.$message.warning('请输入报销明细的物品名称');
        return false;
      }
      if (this.form.apply_type === 1) {
        // 正常请款都需要发票号，校验发票号是否有问题
        if (!detail.receipt_number) {
          this.$message.warning('正常请款需要填写发票号');
          return false;
        }
      }
      if (detail.receipt_number) {
        let arr = detail.receipt_number.split('，');
        for (let str of arr) {
          if (!this.receipt_number_regex.test(str)) {
            this.$message.error(`发票号【${str}】格式错误`);
            return false;
          }
        }
      }
      return true;
    },
    // 提交
    handleSubmit() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          if (!this.form.approve_user) {
            return this.$message.warning('请选择您的上级作为审批人');
          }
          for (let detail of this.form.detailList) {
            if (!this.validDetail(detail)) {
              return false;
            }
          }
          let user = this.userList.find(item => item.id === this.form.create_id);
          let dept = this.deptList.find(item => item.id === this.form.create_dept_id);
          // 填单人部门
          this.form.create_dept_name = dept.dept_name;

          user = this.userList.find(item => item.id === this.form.applicant);
          // 申请人名字
          this.form.applicant_name = user.user_name;
          dept = this.deptList.find(item => item.id === this.form.applicant_dept);
          // 申请人部门
          this.form.applicant_dept_name = dept.dept_name;

          user = this.userList.find(item => item.id === this.form.approve_user);
          // 审批人名字
          this.form.approve_user_name = user.user_name;

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
    setForm(form) {
      this.form = form;
      this.fillAUserId();
      // sessionStorage.setItem('reimbur:add', JSON.stringify(this.form));
    },
    // 加载本地缓存数据
    loadLocalData() {
      let temp = sessionStorage.getItem('reimbur:add');
      if (temp) {
        this.form = JSON.parse(temp);
      }
    },
    // 申请人切换
    async handleChange(val) {
      const res = await this.$axios({
        url: '/api/reimbur/base-data',
        params: {
          userid: val
        }
      });
      if (res.data) {
        // 填充报销基本信息
        this.form.applicant_dept = res.data.applicant_dept;
        this.form.payee = res.data.payee;
        this.form.bank_name = res.data.bank_name;
        this.form.bank_account = res.data.bank_account;
        this.form.bank_address = res.data.bank_address;
      }
    },
    fillAUserId() {
      if (this.$store.state.user.user) {
        this.form.create_id = this.$store.state.user.user.uid;
        const user = this.userList.find(item => item.id === this.form.create_id);
        const dept = this.deptList.find(item => user.dept_id_list.includes(item.id + ''));
        this.form.create_dept_id = dept.id;
      }
    },
    // 选择抄送人事件
    handleSelectCopy(val) {
      const user = this.userList.find(item => item.id === val);
      this.form.copys.push(user);
      this.copyUser = null;
    },
    // 删除抄送人
    handleDelCopy(index) {
      this.form.copys.splice(index, 1);
    }
  },
  async mounted() {
    this.userList = await getAllUser();
    this.deptList = await getAllDept();
    this.querySubject();
    setTimeout(() => {
      this.fillAUserId();
    }, 800);
  }
  // activated() {
  //   this.loadLocalData();
  // },
  // deactivated() {
  //   if (this.timer) {
  //     clearInterval(this.timer);
  //     this.timer = null;
  //   }
  // }
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
.approve-wrap {
  display: flex;

  .approve-item {
    width: 50px;
    line-height: 20px;
    margin-right: 20px;
    position: relative;

    .el-icon-arrow-right,
    .el-icon-plus {
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
