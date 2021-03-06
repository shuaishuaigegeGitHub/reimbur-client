<template>
  <div style="padding-top: 50px">
    <div id="cost-form">
      <div v-for="(main, index) in formList" :key="'main-' + index" class="cost-form">
        <div class="form-header">
          <div class="form-empty"></div>
          <div class="form-title">
            <span>费用报销单</span>
          </div>
          <div class="form-no">
            <span class="label">编号</span>
            <span class="value text--black">{{ formList.length }}（{{ index + 1 }}/{{ formList.length }}）</span>
          </div>
        </div>

        <div class="form-subtitle">
          <div class="dept">
            部门<span class="dept-input text--black" align="center">{{ form.create_dept_name }}</span>
          </div>
          <div class="date">
            报销日期：
            <span class="year-input text--black" align="center">{{ time[0] }}</span>
            <span class="year-label">年</span>
            <span class="month-input text--black" align="center">{{ time[1] }}</span>
            <span class="month-label">月</span>
            <span class="date-input text--black" align="center">{{ time[2] }}</span>
            <span class="date-label">日</span>
          </div>
        </div>

        <div class="form-content">
          <table border="1" cellspacing="0px" bordercolor="#8173ea">
            <thead style="color: #8173ea">
              <tr>
                <th class="summary" rowspan="2">摘要</th>
                <th class="money-label" colspan="8">金额</th>
                <th class="subject" rowspan="2">科目</th>
                <th class="number" rowspan="2">单据张数</th>
              </tr>
              <tr>
                <th class="money">十</th>
                <th class="money">万</th>
                <th class="money">千</th>
                <th class="money">百</th>
                <th class="money">十</th>
                <th class="money">元</th>
                <th class="money">角</th>
                <th class="money">分</th>
              </tr>
            </thead>
            <tbody align="center" class="text--black">
              <tr v-for="(item, index) in main" :key="index" class="content-item">
                <td class="first">{{ item.name }}</td>
                <td v-for="(moneyBit, i) in item.money" :key="i + '-' + index">{{ moneyBit }}</td>
                <td></td>
                <td></td>
              </tr>

              <tr class="content-item">
                <td class="first total">
                  <span class="label" style="font-size: 14px; color: #8173ea">合计人民币（大写）</span>
                  <span style="font-size: 12px">{{ formatMoney(sum(main)) }}</span>
                </td>
                <td v-for="(moneyBit, i) in moneySplit(sum(main), '￥')" :key="i">{{ moneyBit }}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="form-footer">
          <span>财会主管</span>
          <span class="name"></span>

          <span>记账</span>
          <span class="name"></span>

          <span>出纳</span>
          <span class="name"></span>

          <span>部门主管</span>
          <span class="name"></span>

          <span>复核</span>
          <span class="name"></span>

          <span>报销人</span>
          <span class="name"></span>
        </div>
      </div>
    </div>
    <div align="center" style="margin-top: 50px">
      <el-button type="primary" size="small" @click="printOrder">打印费用报销单</el-button>
    </div>
  </div>
</template>

<script>
import Print from '@/utils/print';
import NP from 'number-precision';
import numberUitl from 'num2capital';

export default {
  props: {
    form: Object
  },
  data() {
    return {
      print: {},
      subjectData: [],
      detailList: []
    };
  },
  computed: {
    formList() {
      let result = [];
      const MAX_SIZE = 6;
      let temp = null;
      const detailList = Object.assign([], this.form.detailList);
      while (detailList.length) {
        temp = detailList.splice(0, MAX_SIZE).map(item => {
          return {
            name: item.name,
            money: this.moneySplit(this.calMoney(item)),
            money_value: this.calMoney(item),
            subjectName: this.findSubjectName(item.subject_id)
          };
        });

        while (temp.length < MAX_SIZE) {
          temp.push({
            name: '',
            money: Array(8).fill(''),
            subjectName: ''
          });
        }

        result.push(temp);
      }
      return result;
    },
    time: function() {
      return this.form.date.split('-');
    }
  },
  methods: {
    printOrder() {
      Print('#cost-form');
    },
    moneySplit(money, symbol) {
      let moneyStr = Number(money)
        .toFixed(2)
        .replace('.', '');
      let moneyArr = moneyStr.split('');
      if (symbol && moneyArr.length < 8) {
        moneyArr.unshift(symbol);
      }
      while (moneyArr.length < 8) {
        moneyArr.unshift('');
      }
      return moneyArr;
    },
    calMoney(data) {
      return NP.round(NP.times(data.money, data.number), 2);
    },
    formatMoney(money) {
      let moneyStr = numberUitl.num2Capital(money, 'rmb_capital');
      if (Number.isInteger(money)) {
        // 没有小数点的加整
        moneyStr += '整';
      }
      return moneyStr.replace('圆', '元');
    },
    // 计算合计金额
    sum(list) {
      return list
        .map(item => item.money_value)
        .filter(item => item)
        .reduce((prev, cur) => {
          return NP.round(NP.plus(prev, cur), 2);
        }, 0);
    },
    findSubjectName(subjectId) {
      if (!subjectId) {
        return '';
      }
      function queryName(subjectArr) {
        for (let subject of subjectArr) {
          if (subject.id === subjectId) {
            return subject.name;
          } else if (subjectId.startsWith(subject.id)) {
            if (subject.children && subject.children.length) {
              return queryName(subject.children);
            }
            continue;
          } else {
            continue;
          }
        }
      }
      return queryName(this.subjectData);
    },
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
        this.subjectData = res.data.map(treeMap);
      });
    }
  },
  mounted() {
    this.querySubject();
  }
};
</script>

<style lang="scss" scoped>
.cost-form {
  padding: 0 20px;
  margin-bottom: 50px;
  font-weight: normal;
  font-size: 14px;
  color: #8173ea;

  .form-header {
    display: flex;
    align-items: baseline;

    .form-empty {
      width: 150px;
    }

    .form-title {
      flex-grow: 1;
      text-align: center;
      font-size: 36px;

      span {
        display: inline-block;
        width: 70%;
        border-bottom: 1px solid #8173ea;
      }
    }

    .form-no {
      width: 160px;
      border: 2px solid #8173ea;
      line-height: 32px;
      margin-right: 10px;

      .label {
        padding: 0 5px;
        display: inline-block;
        border-right: 1px solid #8173ea;
      }

      .value {
        padding: 0 5px;
        display: inline-block;
      }
    }
  }

  .form-subtitle {
    margin-top: 30px;
    display: flex;
    font-size: 16px;

    .dept {
      width: 200px;
      margin-left: 40px;

      .dept-input {
        margin-left: 5px;
        display: inline-block;
        width: 100px;
        border-bottom: 1px dashed black;
      }
    }

    .date {
      .year-input {
        display: inline-block;
        width: 50px;
      }
      .month-input {
        display: inline-block;
        width: 30px;
      }
      .date-input {
        display: inline-block;
        width: 30px;
      }
    }
  }

  .form-content {
    margin-top: 5px;
    border: 1px solid #8173ea;
    padding: 5px;

    table {
      border-collapse: collapse;
      width: 100%;
      border-color: #8173ea;

      tr {
        .summary {
          text-align: right;
          letter-spacing: 100px;
        }
        .money {
          width: 20px;
        }
        .money-label {
          text-align: right;
          letter-spacing: 45px;
        }
        .subject {
          text-align: right;
          width: 100px;
          letter-spacing: 22px;
        }
        .number {
          width: 40px;
        }
      }

      .content-item {
        height: 38px;

        .first {
          text-align: left;
          padding-left: 15px;
        }
      }
    }
  }

  .form-footer {
    display: flex;
    line-height: 2rem;

    .name {
      color: black;
      margin-left: 10px;
      width: 60px;
    }
  }
}

.text--black {
  color: black;
}
</style>
