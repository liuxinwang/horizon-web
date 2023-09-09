<template>
  <a-modal
    :title="this.model && this.model.id !== '' ? '修改流程' : '新增流程'"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => {
      $emit('ok')
    }"
    @cancel="() => {
      this.datasourceData = []
      this.databaseData =[]
      $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item hidden label="流程ID">
          <a-input v-decorator="['id', {initialValue: 0}]" disabled />
        </a-form-item>
        <a-form-item v-show="model && model.id !== ''" label="流程编码">
          <a-input v-decorator="['code', {initialValue: 0}, {rules: [{required: true, min: 1, max: 50, message: '' }]}]" disabled />
        </a-form-item>
        <a-form-item label="流程名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 255, message: '请输入流程名称' }]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['id', 'code', 'name']

export default {
  name: 'CreateWorkflowTemplateForm',
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
      form: this.$form.createForm(this)
    }
  },
  mounted () {
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  },
  methods: {
  }
}
</script>
