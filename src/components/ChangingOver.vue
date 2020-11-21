<template>
  <div class="system-menu-content" v-if="systemMenuVisible">
    <div class="bg bg-blur"></div>
    <div class="system-menu" @click.stop="handleClose">
      <div
        v-for="(item, index) in systemMenu"
        :key="index"
        :index="item.path"
        class="system-menus"
        @click.stop="handleSelect(item.path)"
      >
        <el-image style="width: 100px; height: 100px" :src="item.icon" fit="fit"></el-image>
        <span class="title">{{ item.menu_name }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import anime from 'animejs';

export default {
  name: 'ChangingOver',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 系统菜单
      systemMenu: [],
      systemMenuVisible: false
    };
  },

  watch: {
    visible(val) {
      this.systemMenuVisible = val;
      if (val) {
        // 显示
        this.$nextTick(() => {
          this.handleSystemMenu();
        });
      }
    }
  },
  methods: {
    handleSystemMenu() {
      if (this.systemMenuVisible) {
        // 淡入
        anime({
          targets: '.system-menu-content',
          opacity: 1,
          easing: 'spring(1, 80, 10, 0)'
        });

        // 下拉
        // anime({
        //   targets: '.system-menu-content',
        //   height: 'calc(100vh - 20px)',
        //   easing: 'easeInOutCubic'
        // });
      }
    },
    handleSelect(path) {
      if (path) {
        window.open(path);
      }
    },
    // 关闭
    handleClose() {
      // 淡出
      anime({
        targets: '.system-menu-content',
        opacity: 0
      });
      this.$emit('update:visible', false);

      // anime({
      //   targets: '.system-menu-content',
      //   height: 'calc(0vh)',
      //   easing: 'easeInOutQuad',
      //   duration: 800,
      //   complete: anl => {
      //     this.systemMenuVisible = false;
      //   }
      // });
    }
  },
  mounted() {
    this.$axios({
      url: '/api/permission/system',
      method: 'GET'
    }).then(res => {
      this.systemMenu = res.data;
    });
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
.system-menu-content {
  margin-top: 50px;
  position: fixed;
  z-index: 9999 !important;
  width: 100%;
  height: calc(100vh - 20px);
  overflow: hidden;
  opacity: 0;
}
.system-menu {
  color: black;
  font-size: 40px;
  width: 100%;
  position: absolute;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  padding: 5% 1% 5% 18%;
  width: 90%;
  box-sizing: border-box;
}
.bg {
  background: url('../assets/img/beijing.gif');
  height: 100%;
  text-align: center;
  line-height: 600px;
}
.bg-blur {
  float: left;
  width: 102%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(40px);
  transform: scale(1.2);
}

.system-menus {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 8%;
  height: 10%;
  margin: 5%;
  cursor: pointer;

  .title {
    font-size: 16px;
    color: white;
    margin-top: 10px;
    line-height: 28px;
  }
}
</style>
