<template>
  <div class="sidebar fin-tour-step-3">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#0f1419"
      text-color="#ffffff"
      unique-opened
      router
    >
      <menu-item v-for="item in allRoutes" :key="item.path" :item="item"></menu-item>
    </el-menu>
  </div>
</template>
<script>
import bus from '../utils/bus';
import MenuItem from './MenuItem';
import { constantRoutes } from '../router/index';

export default {
  components: {
    MenuItem
  },
  data() {
    return {
      collapse: false,
      allRoutes: constantRoutes
    };
  },
  computed: {
    onRoutes() {
      return this.$route.path.replace('/', '');
    }
  },
  created() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on('collapse', msg => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 50px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 180px;
}
.sidebar > ul {
  height: 100%;
}
.sidebar > ul.sidebar-el-menu > .el-menu-item,
.sidebar > ul.sidebar-el-menu .el-submenu__title,
.sidebar .el-submenu .el-menu--inline {
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}
</style>
