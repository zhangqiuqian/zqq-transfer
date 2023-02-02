<template>
  <div class="zqq-main">
    <!-- 地区 -->
    <zqq-container :boxTitle="boxTitle" :boxOperation="boxOperation" :dataObj="dataObj" :selectedData="selectedData" :onChangeSelected="emitChangeSelected" :filterable="filterable" :filter-placeholder="filterPlaceholder"></zqq-container>
  </div>
</template>

<script>
  import zqqContainer from './models/container'
  export default {
    name: 'zqq-cascader',
    props: {
      boxTitle: {
        type: Array,
        default: () => ['省份', '城市', '区县', '选中地域']
      },
      boxOperation: {
        type: Array,
        default: () => ['添加省份', '添加城市', '添加区县', '删除地域']
      },
      dataObj: {
        type: Object,
        default: () => {}
      },
      selectedData: {
        type: Array,
        default: () => []
      },
      filterable: {
        type: Boolean,
        default: () => false
      },
      filterPlaceholder: {
        type: String,
        default: () => '请输入搜索内容'
      }
    },
    components: {
      zqqContainer
    },
    data() {
      return {
        hasSelectData: []
      }
    },
    created() {},
    watch: {},
    methods: {
      // 获取已选数据的监听事件
      emitChangeSelected(val) {
        this.hasSelectData = val
        this.$emit('onChange', val)
      },
      // 提供获取已选数据的钩子
      getSelectedData() {
        return this.hasSelectData
      }
    }
  }
</script>

<style lang="scss" scoped>
  .zqq-main {
    min-width: 906px;
  }
</style>
