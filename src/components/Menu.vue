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

export default {
  components: {
    MenuItem
  },
  data() {
    return {
      collapse: false,
      allRoutes: []
    };
  },
  computed: {
    onRoutes() {
      return this.$route.path.replace('/', '');
    }
  },
  methods: {
    async initStyle() {
      let head = document.getElementsByTagName('head')[0];
      let linkTag = document.createElement('link');
      linkTag.id = 'dynamic-style';
      linkTag.href = this.$store.state.permission.iconAddress;
      linkTag.setAttribute('rel', 'stylesheet');
      linkTag.setAttribute('type', 'text/css');
      head.appendChild(linkTag);
    }
  },
  created() {
    this.initStyle();
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on('collapse', msg => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
    this.allRoutes = this.$store.state.permission.routes;
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
