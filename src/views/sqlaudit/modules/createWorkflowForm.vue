<template>
  <a-modal
    :title="this.model && this.model.id !== '' ? '修改工单' : '新增工单'"
    :width="1000"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => {
      this.datasourceData = []
      this.databaseData =[]
      $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id !== ''" label="工单ID">
          <a-input v-decorator="['id', {initialValue: 0}]" disabled />
        </a-form-item>
        <a-form-item :label="$t('form.sqlworkflow-form.name.label')">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: $t('form.sqlworkflow-form.name.required') }]}]" />
        </a-form-item>
        <a-form-item :label="$t('form.sqlworkflow-form.describe.label')">
          <a-input v-decorator="['describe', {rules: [{required: false, min: 1, max: 255, message: $t('form.sqlworkflow-form.describe.required') }]}]" />
        </a-form-item>
        <a-form-item label="项目">
          <a-select v-decorator="['projId', {rules: [{required: true, message: $t('form.sqlworkflow-form.describe.required') }]}]" @change="handleProjectChange">
            <a-select-option v-for="project in projectData" :key="project.projId">
              {{ project.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据源">
          <a-select v-decorator="['instId', {rules: [{required: true, message: $t('form.sqlworkflow-form.describe.required') }]}]" @change="handleDatasourceChange">
            <a-select-option v-for="ds in datasourceData" :key="ds.instId">
              {{ ds.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据库">
          <a-select v-decorator="['dbName', {rules: [{required: true, message: $t('form.sqlworkflow-form.describe.required') }]}]" @change="handleDatabaseChange">
            <a-select-option v-for="db in databaseData" :key="db.name">
              {{ db.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="SQL语句">
          <a-textarea v-decorator="['sqlContent', {rules: [{required: true, min: 1, max: 255, message: $t('form.sqlworkflow-form.describe.required') }]}]" :rows="10" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getUserProjInfos, getProjDatasources } from '@/api/sqlaudit/project'
import { getInstDbs } from '@/api/instance'

// 表单字段
const fields = ['id', 'name', 'describe', 'projId', 'instId', 'dbName', 'sqlContent']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      form: this.$form.createForm(this),
      projectData: [],
      datasourceData: [],
      databaseData: []
    }
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })

    this.loadProjectData()
  },
  methods: {
    loadProjectData () {
      getUserProjInfos(this.$store.getters.userInfo.userName).then(res => {
        this.projectData = res.data
      })
    },
    handleProjectChange (projId) {
      this.datasourceData = []
      this.databaseData = []
      this.form.setFieldsValue({ 'instId': '' })
      this.form.setFieldsValue({ 'dbName': '' })
      getProjDatasources(projId).then(res => {
        this.datasourceData = res.data
      })
    },
    handleDatasourceChange (instId) {
      this.databaseData = []
      this.form.setFieldsValue({ 'dbName': '' })
      getInstDbs(instId).then(res => {
        this.databaseData = res.data
      })
    },
    handleDatabaseChange () {

    }
  }
}
</script>
