<template>
  <div class="wrapper">
    <v-head></v-head>
    <v-menu></v-menu>
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <v-tags></v-tags>
      <div class="content">
        <transition name="move" mode="out-in">
          <keep-alive>
            <router-view class="content-innner"></router-view>
          </keep-alive>
        </transition>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>
<script>
import vHead from '@/components/Header.vue';
import vMenu from '@/components/Menu.vue';
import vTags from '@/components/Tag.vue';
import Bus from '@/utils/bus';

export default {
  data() {
    return {
      tagsList: [],
      collapse: false
    };
  },
  components: {
    vHead,
    vMenu,
    vTags
  },
  created() {
    Bus.$on('collapse-content', msg => {
      this.collapse = msg;
    });

    // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
    Bus.$on('tags', msg => {
      let arr = [];
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name);
      }
      this.tagsList = arr;
    });
  }
};
</script>

<style lang="scss"></style>
