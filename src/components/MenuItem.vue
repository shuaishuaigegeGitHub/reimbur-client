<template>
  <div v-if="item.show">
    <el-menu-item v-if="item.type === 1 && item.first" :index="item.children[0].path">
      <!-- <i :class="item.children[0].meta.icon"></i> -->
      <i
        v-if="item.children[0].meta.icon.startsWith('el-icon')"
        :class="item.children[0].meta.icon"
      ></i>
      <i v-else class="iconfont" :class="item.children[0].meta.icon"></i>
      <span slot="title">{{ item.children[0].meta.title }}</span>
    </el-menu-item>
    <el-submenu v-else-if="item.type === 1" :index="item.path">
      <template slot="title">
        <!-- <i :class="item.meta.icon"></i> -->
        <i v-if="item.meta.icon.startsWith('el-icon')" :class="item.meta.icon"></i>
        <i v-else class="iconfont" :class="item.meta.icon"></i>
        <span slot="title" class="hide-title">{{ item.meta.title }}</span>
      </template>
      <template v-if="item.children && item.children.length > 0">
        <menu-item v-for="child in item.children" :key="child.path" :item="child"></menu-item>
      </template>
    </el-submenu>
    <el-menu-item v-else-if="item.type === 2" :index="item.path">
      <!-- <i :class="item.meta.icon"></i> -->
      <i v-if="item.meta.icon.startsWith('el-icon')" :class="item.meta.icon"></i>
      <i v-else class="iconfont" :class="item.meta.icon"></i>
      <span slot="title">{{ item.meta.title }}</span>
    </el-menu-item>
  </div>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  }
};
</script>

<style>
/* el-menu 的收缩菜单时，标题自动隐藏无效了，这里自行控制一下 */
.sidebar-el-menu.el-menu--collapse .hide-title {
  display: none;
}
</style>

<style lang="scss" scoped>
.iconfont {
  display: inline-block;
  width: 24px;
  line-height: 18px;
  font-size: 18px;
  margin-right: 5px;
  text-align: center;
}
</style>