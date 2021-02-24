<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {}
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import './assets/css/main.css';
@import './assets/css/color-dark.css'; /*深色主题*/
@import './assets/css/common.css'; /*公共样式*/
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 900;
}
.el-table {
  font-size: 15px !important;
  font-weight: 800;
}
.el-table thead {
  color: #676a6c !important;
  font-size: 15px !important;
  font-weight: 800;
}
.el-dialog {
  border-radius: 10px !important;
}

.bill-form-box {
  .el-card__body {
    overflow: auto;
    height: calc(100% - 50px);
    padding: 15px 15px 20px;
    box-sizing: border-box;
  }
}

.el-image-viewer__wrapper {
  .el-image-viewer__close {
    .el-icon-circle-close {
      color: white;
    }
  }
}

// wangEditor编辑器样式
.wang-editor-content {
  table {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
  }
  table td,
  table th {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    padding: 3px 5px;
  }
  table th {
    border-bottom: 2px solid #ccc;
    text-align: center;
  }

  /* blockquote 样式 */
  blockquote {
    display: block;
    border-left: 8px solid #d0e5f2;
    padding: 5px 10px;
    margin: 10px 0;
    line-height: 1.4;
    font-size: 100%;
    background-color: #f1f1f1;
  }

  /* code 样式 */
  code {
    display: inline-block;
    *display: inline;
    *zoom: 1;
    background-color: #f1f1f1;
    border-radius: 3px;
    padding: 3px 5px;
    margin: 0 3px;
  }
  pre code {
    display: block;
  }

  /* ul ol 样式 */
  ul,
  ol {
    margin: 10px 0 10px 20px;
  }
}
</style>
