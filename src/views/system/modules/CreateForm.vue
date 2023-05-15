<template>
  <a-modal
    :title="this.model && this.model.id !== '' ? '修改用户' : '新增用户'"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.ID !== ''" label="用户ID" hidden>
          <a-input v-decorator="['id', {initialValue: ''}]" disabled />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-decorator="['userName', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的实例名称！'}]}]" disabled />
        </a-form-item>
        <a-form-item label="用户昵称">
          <a-input v-decorator="['nickName', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的实例名称！'}]}]" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-decorator="['roleId', {rules: [{required: true}]}]">
            <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item v-show="model && model.id == ''" label="密码">
          <a-input-password v-decorator="['password', {rules: [{required: true, min: 1, max: 100, message: '请输入1到100个字符的连接密码！'}]}]" />
        </a-form-item> -->
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getRoleList } from '@/api/role'

// 表单字段
const fields = ['id', 'userName', 'nickName', 'roleId']

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
      // [{ id: 'admin', name: '系统管理员' }, { id: 'dba', name: 'DBA' }]
      roleList: parameter => {
        return getRoleList().then(res => {
          return res.data
        })
      }
    }
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // this.form.setFieldsValue({ roleId: this.model.roleName })

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })

    this.roleListHandle()
  },
  methods: {
    roleListHandle () {
      getRoleList({ pageNo: 1, pageSize: 100000 }).then(res => {
        this.roleList = res.data.data
      })
    }
  }
}
</script>
