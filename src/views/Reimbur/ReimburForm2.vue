<template>
  <div>
    <div class="baoxiao-pdf-preview">
      <h2 align="center">报销</h2>
      <div class="pdf-header">
        <span class="company">厦门风领科技有限公司</span>
        <span class="apply-date">申请日期：{{ form.flow_params.a_date }}</span>
      </div>
      <table border="1">
        <tbody>
          <tr>
            <td class="label">审批编码</td>
            <td colspan="4">{{ form.id }}</td>
          </tr>
          <tr>
            <td class="label">申请人</td>
            <td colspan="4">{{ form.flow_params.b_user_name }}</td>
          </tr>
          <tr>
            <td class="label">申请人部门</td>
            <td colspan="4">{{ form.flow_params.b_dept_name }}</td>
          </tr>
          <tr>
            <td class="label">申请事由</td>
            <td colspan="4">公司内网搭建、网络部署</td>
          </tr>
          <tr>
            <td class="label"></td>
            <td>名称</td>
            <td>数量</td>
            <td>单位</td>
            <td>价格</td>
          </tr>
          <tr v-for="(item, index) in form.flow_params.detailList" :key="index + item.name">
            <td class="label">报销明细{{ index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.number }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ calMoney(item) | 1000 }}</td>
          </tr>
          <tr>
            <td class="label">支付方式</td>
            <td colspan="4">{{ form.flow_params.pay_type }}</td>
          </tr>
          <tr v-for="(item, index) in fillActList" :key="index">
            <td v-if="index == 0" class="label" :rowspan="fillActList.length + 1">审批流程</td>
            <td colspan="4" style="height: 24px">{{ item }}</td>
          </tr>
        </tbody>
      </table>
      <div class="stamp">
        <div class="stamp-inside"><span>审批通过</span></div>
      </div>
    </div>
    <div align="center" style="margin-top: 50px">
      <el-button type="primary" size="small" @click="printOrder">下载PDF</el-button>
    </div>
  </div>
</template>

<script>
import pdfjs from '@/utils/pdf';
import NP from 'number-precision';
import { watermarkIt } from 'easy-watermark';

export default {
  props: {
    form: Object,
    actList: Array
  },
  data() {
    return {
      print: {}
    };
  },
  watch: {
    form: function(val) {
      this.drawWatermark();
    }
  },
  computed: {
    fillActList: function() {
      let temp = this.actList || [];
      let result = [];
      for (let act of temp) {
        result.push(act.act_user + ' 已同意');
      }
      while (result.length < 4) {
        result.push('');
      }
      return result;
    }
  },
  methods: {
    printOrder() {
      pdfjs({ selector: '.baoxiao-pdf-preview', filename: '报销单.pdf' });
    },
    calMoney(data) {
      return NP.round(NP.times(data.money, data.number), 2);
    },
    drawWatermark() {
      watermarkIt({
        el: '.baoxiao-pdf-preview',
        text: this.form.flow_params.b_user_name,
        color: 'rgba(0, 0, 0, .2)'
      });
    }
  },
  mounted() {
    this.drawWatermark();
  }
};
</script>

<style lang="scss" scoped>
.baoxiao-pdf-preview {
  position: relative;
  padding: 50px 100px 0;
  width: 600px;
  margin: 0 auto;

  .pdf-header {
    margin: 10px 0;
    font-weight: normal;

    .apply-date {
      margin-left: 40px;
    }
  }

  table {
    font-weight: normal;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;

    tbody {
      tr {
        td {
          padding: 10px;
        }

        .label {
          width: 150px;
        }
      }
    }
  }

  .stamp {
    position: absolute;
    top: 50px;
    right: 100px;
    font-weight: normal;
    display: inline-block;
    border-radius: 50%;
    border: 1px solid #78f778;
    font-size: 18px;
    padding: 5px;

    .stamp-inside {
      width: 50px;
      height: 50px;
      padding: 10px;
      border-radius: 50%;
      border: 1px solid #78f778;
      text-align: center;
      color: #7ec13b;
      transform: rotate(-30deg);
      line-height: 1.3rem;

      span {
        display: inline-block;
        margin-top: 5px;
      }
    }
  }
}
</style>
