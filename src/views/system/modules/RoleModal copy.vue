<template>
  <a-modal
    title="角色权限配置"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :form="form">
      <a-form-item v-for="parentPermission in parentPermissions" :key="parentPermission.id" :label="$t(parentPermission.meta.title)">
        <div v-for="childPermission in childPermissions(parentPermission.id)" :key="childPermission.id">
          <a-checkbox
            :v-decorator="[childPermission.name]"
            :indeterminate="childPermission.indeterminate"
            :checked="childPermission.checkedAll"
            @change="(e)=>onChangeCheckAll(e, childPermission)"
            style="margin-right: 30px"
          >
            {{ $t(childPermission.meta.title) }}
          </a-checkbox>
          <a-checkbox-group
            v-model="childPermission.selected"
            :v-decorator="[childPermission.name]"
            :options="childPermission.actionsOptions"
            @change="onChangeCheck(childPermission)"
          />
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { getMenuList } from '@/api/menu'
import pick from 'lodash.pick'

// 表单字段
const fields = ['permissions']

export default {
  name: 'RoleModal',
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      visible: false,
      confirmLoading: false,
      mdl: {},

      form: this.$form.createForm(this),
      permissions: []
    }
  },
  computed: {
    parentPermissions: function () {
      return this.permissions.filter(function (permission) {
        return permission.parentId === 0
      })
    },
    childPermissions () {
      return function (parentId) {
        return this.permissions.filter(function (permission) {
          return permission.parentId === parentId
        })
      }
    }
  },
  created () {
    this.loadPermissions()
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))
    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  },
  mounted () {
    this.form.setFieldsValue(pick(this.permissions, fields))
  },
  methods: {
    add () {
      this.edit({ id: 0 })
    },
    edit (record) {
      this.mdl = Object.assign({}, record)
      this.visible = true

      // 有权限表，处理勾选
      if (this.mdl.rolePermissions && this.permissions) {
        // 先处理要勾选的权限结构
        const permissionsAction = {}
        this.mdl.rolePermissions.forEach(permission => {
          permissionsAction[permission.menu.name] = permission.actionData.map(entity => entity.action)
        })
        // 把权限表遍历一遍，设定要勾选的权限 action
        this.permissions.forEach(permission => {
          permission.selected = permissionsAction[permission.name] || []
          permission.checkedAll = permission.selected.length > 0 && permission.selected.length === permission.actionList.length && permission.selected.sort().toString() === permission.actionList.sort().toString()
        })
      }

      this.$nextTick(() => {
        // this.form.setFieldsValue(pick(this.permissions, 'permissions'))
        // this.form.setFieldsValue({ permission: this.permissions })
        this.form.setFieldsValue({ permissions: this.permissions })
      })
      console.log('this.mdl', this.mdl)
      console.log(this.permissions)
      this.form.setFieldsValue({ permissions: this.permissions })
      console.log(this.form.getFieldsValue())
    },
    close () {
      this.$emit('close')
      this.visible = false
    },
    handleOk () {
      const _this = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        // 验证表单没错误
        if (!err) {
          console.log('form values', values)

          _this.confirmLoading = true
          // 模拟后端请求 2000 毫秒延迟
          new Promise((resolve) => {
            setTimeout(() => resolve(), 2000)
          }).then(() => {
            // Do something
            _this.$message.success('保存成功')
            _this.$emit('ok')
          }).catch(() => {
            // Do something
          }).finally(() => {
            _this.confirmLoading = false
            _this.close()
          })
        }
      })
    },
    handleCancel () {
      this.close()
    },
    onChangeCheck (permission) {
      permission.indeterminate = !!permission.selected.length && (permission.selected.length < permission.actionsOptions.length)
      permission.checkedAll = permission.selected.length === permission.actionsOptions.length
    },
    onChangeCheckAll (e, permission) {
      Object.assign(permission, {
        selected: e.target.checked ? permission.actionsOptions.map(obj => obj.value) : [],
        indeterminate: false,
        checkedAll: e.target.checked
      })
    },
    loadPermissions () {
      const that = this
      getMenuList({ pageNo: 1, pageSize: 100000 }).then(res => {
        const result = res.data.data
        // console.log(result)
        that.permissions = result.map(permission => {
          const options = permission.actionData || []
          permission.checkedAll = false
          permission.selected = []
          permission.indeterminate = false
          permission.actionsOptions = options.map(option => {
            return {
              label: option.describe,
              value: option.action
            }
          })
          permission.actionList = options.map(option => {
            return option.action
          })
          return permission
        })
        that.form.setFieldsValue({ permissions: that.permissions })
      })
    }

  }
}
</script>

<style scoped>

</style>
