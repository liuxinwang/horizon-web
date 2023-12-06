<template>
  <a-modal
    :title="title"
    :width="900"
    :visible="visible"
    :footer="null"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-card title="基本信息" :bordered="false" :size="size" :headStyle="{ border: '1px solid #e8e8e8' }" :bodyStyle="{ padding: '0px' }">
        <a-descriptions bordered :size="size" :column="1">
          <a-descriptions-item label="Data ID">{{ configData.dataId }}</a-descriptions-item>
          <a-descriptions-item label="Group">{{ configData.group }}</a-descriptions-item>
          <a-descriptions-item label="命名空间">{{ configData.namespaceId }}</a-descriptions-item>
          <a-descriptions-item label="配置描述">{{ configData.desc }}</a-descriptions-item>
          <a-descriptions-item label="MD5">{{ configData.md5 }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
      <a-card title="配置内容" :size="size" style="margin-top: 20px">
        <div>
          <codemirror
            v-model="configData.content"
            :options="options"
            :style="{height: '400px', textAlign: 'left', lineHeight: '24px'}" />
        </div>
      </a-card>
    </a-spin>
  </a-modal>
</template>

<script>
import { getInstanceConfigInfo } from '@/api/configCenter'

import { codemirror } from 'vue-codemirror'
import 'codemirror/theme/ambiance.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/mode/yaml/yaml'
require('codemirror/lib/codemirror')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/selection/active-line')

require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/sql-hint')

export default {
  components: {
    codemirror
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      loading: false,
      title: '配置详情',
      size: 'small',
      configData: {},
      options: {
        mode: 'text/x-yaml', // 选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
        tabSize: 2,
        readOnly: true,
        theme: 'base16-dark',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        styleActiveLine: true, // 设置光标所在行高亮true/false
        // theme: 'base16-light',
        cursorHeight: 1,
        autofocus: true,
        extraKeys: { 'Ctrl': 'autocomplete' }, // 自定义快捷键
        hintOptions: { // 自定义提示选项
          completeSingle: false, // 当匹配只有一项的时候是否自动补全
          tables: {
            users: ['name']
          }
        }
      }
    }
  },
  watch: {
    model: function (val) {
      this.resetInitData()
      this.configData = val
      this.loading = true
      this.instInfoHandle()
    }
  },
  created () {
  },
  methods: {
    instInfoHandle () {
      getInstanceConfigInfo(this.configData).then(res => {
        this.configData = res.data
        this.loading = false
      })
    },
    resetInitData () {
      this.configData = {}
    }
  }
}
</script>
<style>
  .CodeMirror {
    border: 1px solid #eee;
    height: 400px;
  }
</style>
