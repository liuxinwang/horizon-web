<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="用户名">
                <a-input v-model="queryParam.userName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="用户昵称">
                <a-input v-model="queryParam.nickName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-action:edit @click="handleEdit(record)">修改</a>
          </template>
          <template>
            <a-dropdown>
              <a class="ant-dropdown-link">
                操作 <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a v-action:resetPassword @click="handleResetPwd(record)">重置密码</a>
                </a-menu-item>
                <a-menu-item>
                  <a v-action:delete @click="handleDelete(record)">删除</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </span>
      </s-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />

      <reset-pwd-form
        ref="resetPwdModal"
        :visible="resetPwdVisible"
        :loading="resetPwdConfirmLoading"
        :model="resetPwdMdl"
        @cancel="handleResetPwdCancel"
        @ok="handleResetPwdOk"
      />
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getUserList, saveUser, deleteUser, resetPassword } from '@/api/user'
import CreateForm from './modules/CreateForm'
import ResetPwdForm from './modules/ResetPwdForm'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '用户ID',
    dataIndex: 'id',
    colSpan: 0,
    customRender: (value, row, index) => {
                const obj = {
                    children: value,
                    attrs: {}
                }

                obj.attrs.colSpan = 0
                return obj
            }
  },
  {
    title: '用户名',
    dataIndex: 'userName'
  },
  {
    title: '用户昵称',
    dataIndex: 'nickName'
  },
  {
    title: '角色ID',
    dataIndex: 'roleId',
    colSpan: 0,
    customRender: (value, row, index) => {
                const obj = {
                    children: value,
                    attrs: {}
                }

                obj.attrs.colSpan = 0
                return obj
            }
  },
  {
    title: '角色名称',
    dataIndex: 'roleName'
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt'
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'User',
  components: {
    STable,
    Ellipsis,
    CreateForm,
    ResetPwdForm
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // reset pwd model
      resetPwdVisible: false,
      resetPwdConfirmLoading: false,
      resetPwdMdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return getUserList(requestParameters).then(res => {
            return res.data
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    StatusName (status) {
      switch (status) {
        case 'Enabled':
          return '正常'
        case 'Disabled':
          return '禁用'
        default:
          return status
      }
    }
  },
  created () {
  },
  computed: {
  },
  methods: {
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '确认删除用户' + record.UserName + '/' + record.NickName + '?',
        content: '删除后不可恢复',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消 ',
        onOk () {
          return deleteUser(record.id).then(res => {
            if (res.code === 1) {
              that.$refs.table.refresh()
              that.$message.info('删除成功')
            } else {
              that.$message.error(res.err)
            }
          })
        }
      })
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id !== '') {
            // 修改 e.g.
            saveUser(values).then(res => {
              if (res.code === 1) {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()

                this.$message.info('修改成功')
              } else {
                this.$message.error(res.err)
              this.confirmLoading = false
              }
            }).catch((e) => {
              console.log(e)
              this.confirmLoading = false
            })
          } else {
            // 新增
            console.log('insert user')
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false
    },
    handleResetPwd (record) {
      this.resetPwdVisible = true
      this.resetPwdMdl = { ...record }
    },
    handleResetPwdOk () {
      const form = this.$refs.resetPwdModal.form
      this.resetPwdConfirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          // 修改 e.g.
          values.Password = values.newPassword
          resetPassword(values).then(res => {
            if (res.code === 1) {
              this.resetPwdVisible = false
              this.resetPwdConfirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('重置成功')
            } else {
              this.$message.error(res.err)
              this.resetPwdConfirmLoading = false
            }
          }).catch((e) => {
            console.log(e)
            this.resetPwdConfirmLoading = false
          })
        } else {
          this.resetPwdConfirmLoading = false
        }
      })
    },
    handleResetPwdCancel () {
      this.resetPwdVisible = false
    }
  }
}
</script>
