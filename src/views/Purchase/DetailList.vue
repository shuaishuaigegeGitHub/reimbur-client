<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-select v-model="filters.status">
          <el-option
            v-for="(item, index) in statusOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" border>
      <el-table-column label="物品名称" prop="name" align="center"></el-table-column>
      <el-table-column label="状态" prop="status" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status" type="success">已报销</el-tag>
          <el-tag v-else>未报销</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="规格" prop="norm" align="center"></el-table-column>
      <el-table-column label="单价" prop="money" align="center"></el-table-column>
      <el-table-column label="数量" prop="number" align="center"></el-table-column>
      <el-table-column label="单位" prop="unit" align="center"></el-table-column>
      <el-table-column label="总价格" align="center">
        <template slot-scope="{ row }">
          {{ Number(row.money * row.number) | 1000 }}
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-page" align="right" v-if="count > filters.size">
      <el-pagination
        @size-change="query"
        @current-change="query"
        :current-page.sync="filters.page"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="filters.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filters: {
        status: null,
        page: 1,
        size: 20
      },
      count: 0,

      statusOptions: [
        { label: '全部', value: null },
        { label: '未报销', value: 0 },
        { label: '已报销', value: 1 }
      ],

      list: []
    };
  },
  methods: {
    async query() {
      const res = await this.$axios({
        url: '/api/purchase/detail-list',
        method: 'POST',
        data: this.filters
      });
      this.list = res.data.rows;
      this.count = res.data.count;
    }
  },
  mounted() {
    this.query();
  }
};
</script>

<style lang="scss" scoped></style>
