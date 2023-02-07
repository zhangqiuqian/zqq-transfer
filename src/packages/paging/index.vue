<template>
  <div class="zqq-main">
    <zqq-box
      ref="noSelect"
      :group="transferId"
      :drag="drag"
      :title="boxTitle[0]"
      :operateId="0"
      :dataShowList="leftShowList"
      :pageSize="pageSize"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder[0]"
      :pageTexts="pageTexts"
      :async="async"
      :isLastPage="isLastPage"
      :isHighlight="isHighlight"
      :highlightColor="highlightColor"
      :asyncSearchFlag="asyncSearchFlag"
      :showClearBtn="showClearBtn"
      @check-district="noCheckSelect"
      @search-word="searchWord"
      @check-disable="checkDisable"
      @get-data="getData"
      @get-data-by-keyword="getDataByKeyword"
      @clear-input="clearQueryInp('left')"
    ></zqq-box>
    <div class="opera">
      <el-button
        class="el-transfer__button"
        icon="el-icon-arrow-left"
        type="primary"
        circle
        @click="deleteData"
        :disabled="disablePre"
      ></el-button>
      <el-button
        class="el-transfer__button"
        icon="el-icon-arrow-right"
        type="primary"
        circle
        @click="addData"
        :disabled="disableNex"
      ></el-button>
    </div>
    <zqq-box
      ref="hasSelect"
      :group="transferId"
      :drag="drag"
      :title="boxTitle[1]"
      :operateId="1"
      :dataShowList="rightShowList"
      :pageSize="pageSize"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder[1]"
      :pageTexts="pageTexts"
      :isHighlight="isHighlight"
      :highlightColor="highlightColor"
      :showClearBtn="showClearBtn"
      @check-district="hasCheckSelect"
      @search-word="searchWord"
      @check-disable="checkDisable"
      @clear-input="clearQueryInp('right')"
      @on-change="handleChange"
    ></zqq-box>
  </div>
</template>

<script>
import zqqBox from './models/box'
export default {
  name: 'zqq-transfer',
  props: {
    drag: {
      // 是否开启列表拖拽功能
      type: Boolean,
      default: true
    },
    boxTitle: {
      type: Array,
      default: () => ['待选区', '已选中']
    },
    pageSize: {
      type: Number,
      default: 160
    },
    dataList: {
      type: Array,
      default: () => []
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
      type: Array,
      default: () => ['请输入搜索内容', '请输入搜索内容']
    },
    pageTexts: {
      type: Array,
      default: () => ['上一页', '下一页']
    },
    sort: {
      type: Boolean,
      default: () => false
    },
    async: {
      type: Boolean,
      default: () => false
    },
    getPageData: {
      type: Function,
      default: () => []
    },
    getSearchData: {
      type: Function
    },
    isHighlight: {
      type: Boolean,
      default: () => false
    },
    highlightColor: {
      type: String,
      default: () => '#ff2b2b'
    },
    showClearBtn: {
      type: Boolean,
      default: () => false
    }
  },
  components: {
    zqqBox
  },
  data() {
    return {
      transferId: new Date().getTime(), // 避免多个穿梭框可相互拖拽
      leftShowList: [], // 未选中（已过滤出已选)的数据
      rightShowList: [], // 已选中的数据

      leftDataList: [], // 未搜索的数据
      rightDataList: [], // 未搜索的数据

      leftCheckedData: [], // 未选中区域的已勾选的数据（待添加到已选区域)
      rightCheckedData: [], // 已选中区域的已勾选的数据（从未选区域中待删除)

      leftKeyword: '',
      rightKeyword: '',

      disablePre: true,
      disableNex: true,

      manualEmpty: false, // 是否手动将已选区数据置为空

      asyncDataList: [], // 异步请求的数据源
      isLastPage: false // 异步请求是否是最后一页
    }
  },
  created() {
    this.async ? this.getData(1) : this.initData()
  },
  computed: {
    // 传递到后台保存的数据（已选中的数据的 id 数组）
    selectIdList() {
      return this.rightDataList.map(item => item.id)
    },
    originList() {
      return this.async ? this.asyncDataList : this.dataList
    },
    asyncSearchFlag() {
      // 是否设置了异步搜索方法
      return this.async && this.getSearchData !== undefined
    }
  },
  watch: {
    selectIdList(newVal) {
      // 获取已选数据的监听事件
      const moveKeys = [
        ...this.leftCheckedData.map(item => item.id),
        ...this.rightCheckedData.map(item => item.id)
      ]
      this.rightCheckedData = []
      this.leftCheckedData = []
      this.$emit('onChange', newVal, moveKeys)
    },
    dataList: {
      handler() {
        !this.async && this.initData()
      },
      deep: true
    },
    selectedData: {
      handler() {
        this.initData(true)
      },
      deep: true
    }
  },
  methods: {
    // 分页数据，初始化数据，过滤已选数据
    initData(selectedChange) {
      // this.rightShowList 为空 且 从来没有将已选区置为空，则从 selectedData 获取
      if ((!this.rightShowList.length && !this.manualEmpty) || selectedChange) {
        this.rightShowList = JSON.parse(JSON.stringify(this.selectedData))
        const keywords = this.$refs.hasSelect
          ? this.$refs.hasSelect.searchWord
          : ''
        keywords && this.searchWord(keywords, 1)
      }
      if (!this.async) {
        this.rightDataList = JSON.parse(JSON.stringify(this.rightShowList))
        const rightDataIds = this.rightDataList.map(ele => ele.id)
        this.leftShowList = this.originList.filter(
          ele => !rightDataIds.includes(ele.id)
        )
        this.leftDataList = JSON.parse(
          JSON.stringify(this.leftShowList)
        )
      } else {
        if (selectedChange) {
          this.rightDataList = JSON.parse(JSON.stringify(this.rightShowList))
        }
        const checkDataId = this.rightDataList.map(ele => ele.id)
        this.leftShowList = this.originList.filter(
          ele =>
            !checkDataId.includes(ele.id) &&
            (ele.label.includes(this.leftKeyword) || this.asyncSearchFlag)
        )
        this.leftDataList = this.originList.filter(
          ele => !checkDataId.includes(ele.id)
        )
      }
    },
    searchWord(keyword, titleId) {
      // 过滤掉数据，保留搜索的数据
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      if (titleId === 0) {
        this.leftKeyword = keyword
        if (!this.asyncSearchFlag) {
          this.leftShowList = this.leftDataList.filter(val =>
            val.label.includes(keyword)
          )
        }
      } else {
        this.rightKeyword = keyword
      }
      let refsName = titleId === 0 ? 'noSelect' : 'hasSelect'
      // 延迟执行
      setTimeout(() => {
        !this.async && this.$refs[refsName].initData()
      }, 0)
    },
    // 检查左右按钮可用性
    checkDisable(data, operateId) {
      if (operateId === 0) {
        this.disableNex = !(data.length > 0)
      } else {
        this.disablePre = !(data.length > 0)
      }
    },
    // 未选中区域的选泽
    noCheckSelect(val) {
      this.leftCheckedData = val
    },
    // 已选中区域的选泽
    hasCheckSelect(val) {
      this.rightCheckedData = val
    },
    // 关键：把未选择的数据当做已选择的过滤数组，把已选择的数据当做未选择的过滤数组，在全局data进行过滤，最后进行一次搜索
    // 添加至已选
    addData() {
      const leftCheckedDataId = this.leftCheckedData.map(ele => ele.id)
      // 待选区数据过滤
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      this.leftShowList = this.leftShowList.filter(
        ele =>
          !leftCheckedDataId.includes(ele.id) &&
          (ele.label.includes(this.leftKeyword) || this.asyncSearchFlag)
      )
      this.leftDataList = this.leftDataList.filter(
        ele => !leftCheckedDataId.includes(ele.id)
      )
      // 已选区数据增加
      if (!this.async && this.sort) {
        // 排序，从固定不变的所有数据中过滤，顺序就不会乱。但若数据量大就会比较卡
        // 异步分页不支持排序
        const dataListNoCheckId = this.leftDataList.map(ele => ele.id)
        this.rightDataList = this.originList.filter(
          ele => !dataListNoCheckId.includes(ele.id)
        )
        this.rightShowList = [...this.rightDataList]
      } else {
        // 这种效率更高的方法，但不能排序
        this.rightDataList.push(...this.leftCheckedData)
        this.rightShowList = [...this.rightDataList]
      }
    },
    // 从已选中删除
    deleteData() {
      // 已选区数据过滤
      const hasCheckDataId = this.rightCheckedData.map(ele => ele.id)
      this.rightDataList = this.rightDataList.filter(
        ele => !hasCheckDataId.includes(ele.id)
      )
      this.rightShowList = [...this.rightDataList]

      this.manualEmpty = !this.rightShowList.length

      // 待选区数据增加
      const selectListCheckId = this.rightDataList.map(ele => ele.id)
      // const checkedDataId = this.rightShowList.map(ele => ele.id)
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      this.leftShowList = this.originList.filter(
        ele =>
          !selectListCheckId.includes(ele.id) &&
          (ele.label.includes(this.leftKeyword) || this.asyncSearchFlag)
      )
      this.leftDataList = this.originList.filter(
        ele => !selectListCheckId.includes(ele.id)
      )
    },
    // 提供获取已选数据的钩子
    getSelectedData() {
      return this.selectIdList
    },
    clearQueryInp(position) {
      switch (position) {
        case 'left':
          this.$refs.noSelect.searchWord = ''
          this.asyncSearchFlag && this.getDataByKeyword('')
          break
        case 'right':
          this.$refs.hasSelect.searchWord = ''
          break
        default:
          break
      }
    },
    async getDataByKeyword(keyword, pageIndex) {
      keyword = keyword.trim()
      if (keyword) {
        this.$nextTick(() => {
          this.$refs.noSelect.asyncSearch = true
        })
        const resData = await this.getSearchData(
          keyword,
          pageIndex,
          this.pageSize
        )
        if (Array.isArray(resData) && resData.length) {
          this.asyncDataList = resData
          this.leftShowList = resData
          this.initData()
          this.isLastPage = resData.length < this.pageSize
        } else {
          this.leftShowList = []
          this.isLastPage = true
        }
      } else {
        this.$refs.noSelect.asyncSearch = false
        this.getData(1)
      }
    },
    async getData(pageIndex) {
      this.$nextTick(() => {
        // 设置异步分页的 pageIndex
        this.$refs.noSelect.asyncPageIndex = pageIndex
        // 清空左侧输入框
        this.$refs.noSelect.searchWord = ''
        // asyncSearch 设置为 true
        this.$refs.noSelect.asyncSearch = false
      })
      const resData = await this.getPageData(pageIndex, this.pageSize)
      if (Array.isArray(resData) && resData.length) {
        this.asyncDataList = resData
        this.leftShowList = resData
        this.initData()
        this.isLastPage = resData.length < this.pageSize
      } else {
        this.leftShowList = []
        this.isLastPage = true
      }
    },
    handleChange(v) {
      this.rightDataList = v
    }
  }
}
</script>

<style lang="scss" scoped>
.zqq-main {
  min-width: 600px;
}
.inner-center {
  margin: 0 5px;
}
.opera {
  position: relative;
  width: 100px;
  display: inline-block;
  vertical-align: middle;

  .el-button.is-circle {
    border-radius: 50%;
    padding: 12px;
    display: block;
    margin: 25px auto;
  }
}
</style>
