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
        <a-form-item label="流程ID" hidden>
          <a-input v-decorator="['id', {initialValue: 0}]" disabled />
        </a-form-item>
        <a-form-item label="流程编码">
          <a-input v-decorator="['code', {initialValue: 0}]" disabled />
        </a-form-item>
        <a-form-item label="流程名称">
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, max: 50, message: '请输入1到50个字符的项目名称！'}]}]" disabled />
        </a-form-item>
        <a-form-item
          v-for="(td, index) in form.getFieldValue('workflowTemplateDetails')"
          :key="td.serialNumber"
          :label="'流程节点' + td.serialNumber"
          :required="true"
        >
          <a-input
            v-decorator="[
              `nodeNames[${index}]`,
              {initialValue: td.nodeName},
              { rules: [{ required: true, message: '请选择用户' }] },
            ]"
            style="width: 55%; margin-right: 3%"
          >
          </a-input>
          <a-select
            v-decorator="[
              `projectRoleIds[${index}]`,
              {initialValue: td.projectRoleId},
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
            v-if="form.getFieldValue('workflowTemplateDetails').length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="form.getFieldValue('workflowTemplateDetails').length === 1"
            @click="() => remove(td)"
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
import { getProjRoleList } from '@/api/sqlaudit/project'
import { saveWorkflowTemplateConfig } from '@/api/sqlaudit/workflowTemplate'

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
      allRoles: [],
      serialNumber: 0
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
    this.form.getFieldDecorator('id', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('code', { initialValue: 0, preserve: true })
    this.form.getFieldDecorator('name', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('workflowTemplateDetails', { initialValue: [], preserve: true })
  },
  computed: {
  },
  created () {
  },
  methods: {
    edit (record) {
      this.loadProjRole()
      this.mdl = Object.assign({}, record)
      debugger

      this.form.setFieldsValue({
        'id': this.mdl.id,
        'code': this.mdl.code,
        'name': this.mdl.name,
        'workflowTemplateDetails': this.mdl.workflowTemplateDetails
        // 'datasources': this.mdl.projectDatasources.map(item => { return item.instId })
      })

      if (this.mdl.workflowTemplateDetails.length === 0) {
        this.add()
      } else {
        this.serialNumber = this.mdl.workflowTemplateDetails.length
      }
      this.visible = true
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.form.resetFields() // 清理表单数据（可不做）
      this.serialNumber = 0
    },
    handleOk () {
      const _this = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        // 验证表单没错误
        if (!err) {
          _this.confirmLoading = true
          saveWorkflowTemplateConfig(values).then(res => {
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
    loadProjRole () {
      getProjRoleList({ pageNo: 1, pageSize: 100000 }).then(res => {
        this.allRoles = res.data.data
      })
    },
    remove (k) {
      const { form } = this
      // can use data-binding to get
      const workflowTemplateDetails = form.getFieldValue('workflowTemplateDetails')
      // We need at least one passenger
      if (workflowTemplateDetails.length === 1) {
        return
      }

      this.serialNumber--

      // can use data-binding to set
      form.setFieldsValue({
        workflowTemplateDetails: workflowTemplateDetails.filter(workflowTemplateDetails => workflowTemplateDetails !== k)
      })
    },
    add () {
      const { form } = this
      // can use data-binding to get
      const workflowTemplateDetails = form.getFieldValue('workflowTemplateDetails')
      const nextWorkflowTemplateDetails = workflowTemplateDetails.concat([{ serialNumber: ++this.serialNumber, 'nodeName': '', 'projectRoleId': '' }])
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        workflowTemplateDetails: nextWorkflowTemplateDetails
      })
    }
  }
}
</script>

<style scoped>

</style>
