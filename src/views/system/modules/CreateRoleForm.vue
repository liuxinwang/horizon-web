<template>
  <a-modal
    :title="this.model && this.model.ID !== '' ? '修改角色' : '新增角色'"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item label="角色ID">
          <a-input v-if="model && model.type === 'upd'" v-decorator="['id']" disabled />
          <a-input v-else v-decorator="['id', {rules: [{required: true, min: 1, max: 50, pattern: '^[a-z][a-z0-9_]+$', message: '请输入2到50个字符的名称，以字母开头，仅支持字母数字和下划线！'}]}]" />
        </a-form-item>
        <a-form-item label="角色名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的名称！'}]}]" />
        </a-form-item>
        <a-form-item label="操作类型" hidden>
          <a-input v-decorator="['type', { initialValue: 'ins' }, {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的名称！'}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['id', 'name', 'type']

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
