<template>
  <div name="正" @click.alt="handle('s中handle文f')" @click2.alt="handle('中文')" v-pres:ad="'中'">
    <el-button
      @click="handleAddTagStart"
      size="mini"
      type="primary">
      +{{handle('x')}}选择标签
    </el-button>
    <div class="tag-wrapper" v-for="(tag, index) in value" :key="index">
      <span class="tag-truely" @click="handleClickTruely(index)">{{tag.truely}}</span>
      <el-tag
        type="primary"
        size="medium"
        :disable-transitions="true"
        :closable="true"
        @close="handleRemoveTag(index)">
        {{ tag.tagCnName }}
      </el-tag>
    </div>

    <PanelTagSelector
      v-if="showPanelTagsDialog"
      @select-end="handleAddTagEnd"
      @select-cancel="handleAddTagCancel">
    </PanelTagSelector>
  </div>
</template>

<script>
import PanelTagSelector from '@/components/PanelTagSelector'
export default {
  components: {
    PanelTagSelector
  },
  data () {
    return {
      showPanelTagsDialog: false
    }
  },
  props: {
    value: Array
  },
  methods: {
    emitInput () {
    },
    handleRemoveTag (index) {
      this.value.splice(index, 1)
    },
    handleAddTagStart () {
      this.showPanelTagsDialog = true
    },
    handleAddTagCancel () {
      this.showPanelTagsDialog = false
    },
    handleAddTagEnd (tags) {
      const selectedTags = tags.map(item => {
        this.$set(item, 'truely', 1)
        return item
      })
      this.value.splice(this.value.length - 1, 0, ...selectedTags)
      this.showPanelTagsDialog = false
    },
    handleClickTruely (index) {
      this.value[index].truely = +(!this.value[index].truely)
      let x  = {a:'a直接'}
      console.log(x)
    }
  },
  created () {
  }
}
</script>
<style scoped lang="stylus">
.tag-wrapper
  display inline-block
  margin 0 5px
.tag-truely
  cursor pointer
  display inline-block
  width 15px
  height 28px
  line-height 26px
  text-align center
  border 1px solid #d9ecff
  box-sizing border-box
.el-tag
  border-radius 0
</style>
