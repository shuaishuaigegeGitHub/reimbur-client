<template>
  <div>
    <el-form :model="form" label-width="130px" :rules="rules" ref="applyForm">
      <h3 align="center">基本信息</h3>
      <el-divider></el-divider>
      <el-form-item label="期望交付日期：" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="申请事由：" prop="reasons">
        <el-input v-model="form.reasons" type="textarea" placeholder="请输入采购事由"></el-input>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="图片：">
        <div class="image-wrap">
          <div class="image-item" v-for="(item, index) in form.images" :key="index">
            <el-image
              style="width: 80px; height: 80px"
              fit="cover"
              :src="item"
              :preview-src-list="form.images"
            ></el-image>
            <span class="fl-close" @click="handleDelImage(index)">x</span>
          </div>
          <div class="image-item">
            <el-upload
              class="purchase-upload"
              :action="upload.action"
              :headers="upload.headers"
              :show-file-list="false"
              :on-success="handleUplaodSuccess"
              accept="image/*"
            >
              <i class="el-icon-plus purchase-uploader-icon"></i>
            </el-upload>
          </div>
        </div>
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
            <el-select v-model="approveUser" @change="handleSelectApprove" filterable placeholder="请选择审批人">
              <el-option
                v-for="item in approveList"
                :key="item.id"
                :label="item.user_name"
                :value="item.id"
              ></el-option>
            </el-select>
          </div>
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
  </div>
</template>

<script>
import NP from 'number-precision';
import { getAllUser, getAllDept } from '@/api/index';
import config from '@/config';
import { getToken } from '@/utils/auth';
import { v4 as uuidv4 } from 'uuid';

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
            id: uuidv4(),
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
        // 抄送人
        copys: [],
        // 图片列表
        images: [],
        remark: ''
      },
      approveUser: null,
      copyUser: null,
      rules: {
        date: [{ required: true, message: '请选择期望交付日期', trigger: 'blur' }],
        reasons: [{ required: true, message: '请输入申请事由', trigger: 'blur' }]
      },
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
      userList: [],
      upload: {
        action: config.baseUrl + '/api/common/image-upload',
        headers: {
          token: getToken()
        }
      },

      // 定时器
      timer: null
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
    },
    // 抄送人列表
    copyList() {
      return this.userList.filter(item => {
        return !this.form.copys.find(approve => approve.id == item.id);
      });
    }
  },
  methods: {
    // 添加明细
    addDetail() {
      this.form.detail.push({
        id: uuidv4(),
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
      return true;
    },
    // 提交
    handleSubmit() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          if (!this.form.approvers || this.form.approvers.length <= 0) {
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
    // 选择审批人事件
    handleSelectApprove(val) {
      const user = this.userList.find(item => item.id === val);
      this.form.approvers.push(user);
      this.approveUser = null;
    },
    // 选择抄送人事件
    handleSelectCopy(val) {
      const user = this.userList.find(item => item.id === val);
      this.form.copys.push(user);
      this.copyUser = null;
    },
    setForm(form) {
      this.form = form;
      sessionStorage.setItem('purchase:add', JSON.stringify(this.form));
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
        copys: [],
        remark: ''
      };
    },
    // 设置抄送人列表
    setCopyList(copyList) {
      if (copyList) {
        this.form.copys = copyList;
      }
    },
    handleDelApprove(index) {
      this.form.approvers.splice(index, 1);
    },
    handleDelImage(index) {
      this.form.images.splice(index, 1);
    },
    handleDelCopy(index) {
      this.form.copys.splice(index, 1);
    },
    handleUplaodSuccess(res, file) {
      if (res.code == 1000) {
        // 防止images为空的情况
        if (!this.form.images) {
          this.form.images = [res.data];
        } else {
          this.form.images.push(res.data);
        }
      } else {
        this.$message.error(res.message);
      }
    },
    // 加载本地缓存
    loadLocalData() {
      setTimeout(() => {
        if (!this.form.id) {
          let str = sessionStorage.getItem('purchase:add');
          if (str) {
            this.form = JSON.parse(str);
          }

          this.timer = setInterval(() => {
            sessionStorage.setItem('purchase:add', JSON.stringify(this.form));
          }, 3000);
        }
      }, 1000);
    }
  },
  async mounted() {
    this.userList = await getAllUser();
    this.querySubject();
  },
  activated() {
    this.loadLocalData();
  },
  deactivated() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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

.image-wrap {
  display: flex;

  .image-item {
    margin-right: 10px;
    position: relative;

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
      right: -5px;
    }
  }
}
</style>

<style lang="scss">
.purchase-upload {
  .el-upload {
    width: 80px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .el-upload:hover {
    border-color: #409eff;
  }

  .purchase-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
}
</style>
