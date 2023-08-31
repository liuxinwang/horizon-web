<template>
  <a-modal
    title="项目资源配置"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item label="项目ID">
          <a-input v-decorator="['projId', {initialValue: ''}]" disabled />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的项目名称！'}]}]" disabled />
        </a-form-item>
        <a-form-item label="数据源">
          <a-select
            mode="multiple"
            v-decorator="[
              'datasources',
              {initialValue: []},
              { rules: [{ required: true, message: '请选择实例' }] },
            ]"
          >
            <a-select-option v-for="i in datasources" :key="i.id" :value="i.instId">
              {{ i.instId }} / {{ i.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-for="(pu, index) in form.getFieldValue('projectUsers')"
          :key="pu.id"
          :label="'用户' + (index + 1)"
          :required="true"
        >
          <a-select
            v-decorator="[
              `projUsers[${index}]`,
              {initialValue: pu.userName},
              { rules: [{ required: true, message: '请选择用户' }] },
            ]"
            style="width: 55%; margin-right: 3%"
          >
            <a-select-option v-for="i in allUsers" :key="i.id" :value="i.userName">
              {{ i.userName }}
            </a-select-option>
          </a-select>
          <a-select
            v-decorator="[
              `projUsersRole[${index}]`,
              {initialValue: pu.roleId},
              {
                validateTrigger: ['change', 'blur'],
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请选择角色',
                  },
                ],
              },
            ]"
            style="width: 35%; margin-right: 3%"
          >
            <a-select-option v-for="role in allRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
          <a-icon
            v-if="form.getFieldValue('projectUsers').length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="form.getFieldValue('projectUsers').length === 1"
            @click="() => remove(pu)"
          />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
          <a-button type="dashed" style="width: 40%" @click="add">
            <a-icon type="plus" /> Add field
          </a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { getUserList } from '@/api/user'
import { getInstList } from '@/api/instance'
import { saveProjResourceConfig, getProjRoleList } from '@/api/sqlaudit/project'

export default {
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
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 8 }
        }
      },
      visible: false,
      confirmLoading: false,
      mdl: {},
      datasources: [],
      allUsers: [],
      allRoles: []
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
    this.form.getFieldDecorator('projId', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('name', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
    this.form.getFieldDecorator('projectUsers', { initialValue: [], preserve: true })
    this.form.getFieldDecorator('datasources', { initialValue: [], preserve: true })
  },
  computed: {
  },
  created () {
  },
  methods: {
    edit (record) {
      this.loadInstance()
      this.loadUser()
      this.loadProjRole()
      this.mdl = Object.assign({}, record)

      this.form.setFieldsValue({
        'projId': this.mdl.projId,
        'name': this.mdl.name,
        'projectUsers': this.mdl.projectUsers,
        'datasources': this.mdl.projectDatasources.map(item => { return item.instId })
      })

      if (this.mdl.projectUsers.length === 0) {
        this.add()
      }
      this.visible = true
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.form.resetFields() // 清理表单数据（可不做）
    },
    handleOk () {
      const _this = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        // 验证表单没错误
        if (!err) {
          _this.confirmLoading = true
          saveProjResourceConfig(values).then(res => {
            if (res.code === 1) {
              _this.$message.success('保存成功')
              _this.$emit('refreshTable')
              _this.confirmLoading = false
              _this.close()
            } else {
              _this.$message.error(res.err)
              _this.confirmLoading = false
            }
          }).catch(() => {
            // Do something
          }).finally(() => {
          })
        }
      })
    },
    handleCancel () {
      this.close()
    },
    loadInstance () {
      getInstList({ pageNo: 1, pageSize: 100000 }).then(res => {
        this.datasources = res.data.data
      })
    },
    loadUser () {
      getUserList({ pageNo: 1, pageSize: 100000 }).then(res => {
        this.allUsers = res.data.data
      })
    },
    loadProjRole () {
      getProjRoleList({ pageNo: 1, pageSize: 100000 }).then(res => {
        this.allRoles = res.data.data
      })
    },
    remove (k) {
      const { form } = this
      // can use data-binding to get
      const projectUsers = form.getFieldValue('projectUsers')
      // We need at least one passenger
      if (projectUsers.length === 1) {
        return
      }

      // can use data-binding to set
      form.setFieldsValue({
        projectUsers: projectUsers.filter(projectUser => projectUser !== k)
      })
    },
    add () {
      const { form } = this
      // can use data-binding to get
      const projectUsers = form.getFieldValue('projectUsers')
      const nextProjectUsers = projectUsers.concat([{ 'id': 0, 'userName': '', 'roleId': '' }])
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        projectUsers: nextProjectUsers
      })
    }
  }
}
</script>

<style scoped>

</style>
