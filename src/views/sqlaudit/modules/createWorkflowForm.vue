<template>
  <a-modal
    :title="this.model && this.model.projId !== '' ? '修改工单' : '新增工单'"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id !== ''" label="工单ID">
          <a-input v-decorator="['id', {initialValue: ''}]" disabled />
        </a-form-item>
        <a-form-item :label="$t('form.sqlworkflow-form.name.label')">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: $t('form.sqlworkflow-form.name.required') }]}]" />
        </a-form-item>
        <a-form-item :label="$t('form.sqlworkflow-form.describe.label')">
          <a-input v-decorator="['describe', {rules: [{required: false, min: 1, max: 255, message: $t('form.sqlworkflow-form.describe.required') }]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['id', 'name', 'describe']

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
      form: this.$form.createForm(this)
    }
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  }
}
</script>
