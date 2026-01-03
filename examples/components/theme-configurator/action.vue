<template>
  <div class="configurator-action">
      <div class="action-group">
        <el-tooltip :content="getActionDisplayName('undo')">
          <img
            src="../../assets/images/icon-undo.svg"
            @click="onUndo"
            :class="{ 'active': userConfigHistory.length > 0 }"
          />
        </el-tooltip>
        <el-tooltip :content="getActionDisplayName('redo')">
          <img
            src="../../assets/images/icon-redo.svg"
            @click="onRedo"
            :class="{ 'active': userConfigRedoHistory.length > 0 }"
          />
        </el-tooltip>
        <div class="button-group">
          <el-button
            class="reset"
            round
            size="mini"
            :disabled="isOfficial"
            @click="onReset"
          >
            {{getActionDisplayName('reset-theme')}}
          </el-button>
          <el-button
            class="download"
            type="primary"
            round
            size="mini"
            :disabled="downloadDisabled"
            @click="onDownload"
          >
            {{getActionDisplayName('download-theme')}}
          </el-button>
        </div>
      </div>
      <el-select v-model="selectedComponent" class="selector">
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <div class="line"></div>
    </div>
</template>

<style lang="scss">
.configurator-action {
  padding: 15px 18px 0;
  .action-group {
    padding: 5px 0;
    img {
      cursor: not-allowed;
      width: 16px;
      height: 16px;
      padding: 7px 0;
      margin-left: 5px;
      opacity: .5;
      &.active {
        opacity: 1;
        cursor: pointer;
      }
      &:last-of-type {
        margin-left: 10px;
      }
    }
    .button-group {
      float: right;
    }
  }
  .selector {
    width: 100%;
  }
  .line {
    width: 100%;
    height: 0;
  }
}
</style>

<script>
import { getActionDisplayName } from './utils/utils';
export default {
  props: {
    selectOptions: Array,
    userConfigHistory: Array,
    userConfigRedoHistory: Array,
    isOfficial: Boolean,
    onUndo: Function,
    onRedo: Function
  },
  data() {
    return {
      selectedComponent: 'color',
      downloadDisabled: false
    };
  },
  watch: {
    selectedComponent: {
      handler(val) {
        this.$emit('select', val);
      }
    }
  },
  methods: {
    getActionDisplayName(key) {
      return getActionDisplayName(key);
    },
    onReset() {
      this.$parent.onReset();
    },
    onDownload() {
      this.downloadDisabled = true;
      this.$parent.onDownload();
      setTimeout(() => {
        this.downloadDisabled = false;
      }, 2500);
    }
  }
};
</script>