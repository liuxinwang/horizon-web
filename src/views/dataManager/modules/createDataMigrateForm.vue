<template>
  <a-modal
    :title="this.model && this.model.id !== 0 ? '重提迁移' : '新增迁移'"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    :keyboard="false"
    :maskClosable="false"
    ok-text="提交申请"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="false" label="工单ID">
          <a-input v-decorator="['id', {initialValue: 0}]" disabled />
        </a-form-item>
        <a-form-item label="任务名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: $t('form.sqlworkflow-form.name.required') }]}]" />
        </a-form-item>
        <a-form-item label="任务描述">
          <a-input v-decorator="['describe', {rules: [{required: false, min: 1, max: 255, message: $t('form.sqlworkflow-form.describe.required') }]}]" />
        </a-form-item>
        <a-form-item label="项目">
          <a-select v-decorator="['projId', {rules: [{required: true, message: $t('form.sqlworkflow-form.describe.required') }]}]" @change="handleProjectChange">
            <a-select-option v-for="project in projectData" :key="project.projId">
              {{ project.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="源实例">
          <a-select v-decorator="['sourceInstId', {rules: [{required: true, message: '请选择源实例' }]}]" @change="handleSourceDatasourceChange">
            <a-select-option v-for="ds in sourceDatasourceData" :key="ds.instId">
              {{ ds.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="源数据库">
          <a-select ref="sourceDb" v-decorator="['sourceDb', {rules: [{required: true, message: '请选择源数据库' }]}]" @change="handleSourceDatabaseChange">
            <a-select-option v-for="db in sourceDatabaseData" :key="db.name">
              {{ db.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标实例">
          <a-select v-decorator="['targetInstId', {rules: [{required: true, message: '请选择目标实例' }]}]" @change="handleTargetDatasourceChange">
            <a-select-option v-for="ds in targetDatasourceData" :key="ds.instId">
              {{ ds.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标数据库">
          <a-select ref="targetDb" v-decorator="['targetDb', {rules: [{required: true, message: '请选择目标数据库' }]}]">
            <a-select-option v-for="db in targetDatabaseData" :key="db.name">
              {{ db.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="选择源数据库表">
          <a-select mode="multiple" ref="sourceDbTables" v-decorator="['sourceDbTables', {rules: [{required: true, message: '请选择源数据库表' }]}]">
            <a-select-option v-for="table in sourceDatabaseTablesData" :key="table.tableName">
              {{ table.tableName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="迁移模式">
          <a-radio-group v-model="migrateMode">
            <a-radio :value="1">重命名目标对象（警告：并自动创建同源对象一致的结构进行数据迁移）</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getUserProjInfos, getProjDatasources } from '@/api/sqlaudit/project'
import { getInstDbs, getInstDbTables } from '@/api/instance'

// 表单字段
const fields = ['id', 'name', 'describe', 'projId', 'sourceInstId', 'sourceDb', 'targetInstId', 'targetDb', 'sourceDbTables']

export default {
  name: 'CreateDataMigrateForm',
  components: { },
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
      sourceDatasourceData: [],
      sourceDatabaseData: [],
      sourceDatabaseTablesData: [],
      targetDatasourceData: [],
      targetDatabaseData: [],
      migrateMode: 1
    }
  },
  mounted () {
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      if (this.model.id > 0) {
        this.handleProjectChange(this.model.projId)
        this.handleSourceDatasourceChange(this.model.sourceInstId)
        this.handleTargetDatasourceChange(this.model.targetInstId)
      }
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
      this.sourceDatasourceData = []
      this.sourceDatabaseData = []
      this.targetDatasourceData = []
      this.targetDataatabaseData = []
      this.sourceDatabaseTablesData = []
      this.form.setFieldsValue({ 'sourceInstId': '' })
      this.form.setFieldsValue({ 'sourceDb': '' })
      this.form.setFieldsValue({ 'targetInstId': '' })
      this.form.setFieldsValue({ 'targetDb': '' })
      this.form.setFieldsValue({ 'sourceDbTables': undefined })
      getProjDatasources(projId).then(res => {
        this.sourceDatasourceData = res.data
        this.targetDatasourceData = res.data
      })
    },
    handleSourceDatasourceChange (instId) {
      this.sourceDatabaseData = []
      this.sourceDatabaseTablesData = []
      this.form.setFieldsValue({ 'sourceDb': '' })
      this.form.setFieldsValue({ 'sourceDbTables': undefined })
      getInstDbs(instId).then(res => {
        if (res.code === 1) {
          this.sourceDatabaseData = res.data
        } else {
          this.$message.error(res.err)
        }
      })
    },
    handleTargetDatasourceChange (instId) {
      this.targetDatabaseData = []
      this.form.setFieldsValue({ 'targetDb': '' })
      getInstDbs(instId).then(res => {
        if (res.code === 1) {
          this.targetDatabaseData = res.data
        } else {
          this.$message.error(res.err)
        }
      })
    },
    handleSourceDatabaseChange (db) {
      this.sourceDatabaseTablesData = []
      this.form.setFieldsValue({ 'sourceDbTables': undefined })
      const instId = this.form.getFieldValue('sourceInstId')
      getInstDbTables({ 'instId': instId, 'db': db }).then(res => {
        if (res.code === 1) {
          this.sourceDatabaseTablesData = res.data
        } else {
          this.$message.error(res.err)
        }
      })
    },
    resetSelectData () {
      this.sourceDatasourceData = []
      this.sourceDatabaseData = []
      this.targetDatasourceData = []
      this.targetDatabaseData = []
      this.sourceDatabaseTablesData = []
    }
  }
}
</script>

<style scoped>
</style>
