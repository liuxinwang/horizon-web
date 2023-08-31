<template>
  <a-modal
    :title="this.model && this.model.instId !== '' ? '修改实例' : '接入实例'"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.instId !== ''" label="实例ID">
          <a-input v-decorator="['instId', {initialValue: ''}]" disabled />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的实例名称！'}]}]" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-decorator="['role', {initialValue: 'Master', rules: [{required: true}]}]">
            <a-select-option value="Master">Master</a-select-option>
            <a-select-option value="Slave">Slave</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Ip地址">
          <a-input v-decorator="['ip', {rules: [{required: true, min: 7, max: 20, message: '请输入7到20个字符的Ip地址！'}]}]" />
        </a-form-item>
        <a-form-item label="端口号">
          <a-input-number style="width: 100%" v-decorator="['port', {rules: [{required: true, type: 'number', min: 1000, max: 65535, message: '请输入1000-65535之间的端口号！'}]}]" />
        </a-form-item>
        <a-form-item label="账号">
          <a-input v-decorator="['user', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的连接账号！'}]}]" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password v-decorator="['password', {rules: [{required: true, min: 1, max: 100, message: '请输入1到100个字符的连接密码！'}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['instId', 'name', 'role', 'ip', 'port', 'user', 'password']

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
