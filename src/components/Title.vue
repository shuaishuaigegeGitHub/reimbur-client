<template>
  <div class="title">
    <h3>
      {{name}}
    </h3>
  </div>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scope>
.title{
  width:100%;
  border-bottom:1px solid #ddd;
  padding:10px 0;
  h3{
    color:#333;
    font-weight: normal;
    position: relative;
    padding-left:10px;
    line-height: 1;
    &:before{
      content:"";
      position: absolute;
      top:0;
      left:0;
      width:3px;
      height:100%;
      background: #488cee;
      border-radius: 3px;
    }
  }
}
</style>