<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="角色ID">
                <a-input v-model="queryParam.id" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="角色名称">
                <a-input v-model="queryParam.name" placeholder=""/>
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

      <div class="table-operator">
        <a-button v-action:add type="primary" icon="plus" @click="handleAdd">新建</a-button>
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
                  <a v-action:funcPerms @click="handleFuncPerms(record)">功能权限</a>
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
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getRoleList, saveRole, modifyRole, deleteRole } from '@/api/role'
import CreateForm from './modules/CreateRoleForm'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '角色ID',
    dataIndex: 'id'
  },
  {
    title: '角色名称',
    dataIndex: 'name'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'RoleList',
  components: {
    STable,
    Ellipsis,
    CreateForm
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return getRoleList(requestParameters).then(res => {
            return res.data
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
  },
  created () {
  },
  computed: {
  },
  methods: {
    handleAdd () {
      this.mdl = { Type: 'ins' }
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      record.Type = 'upd'
      this.mdl = { ...record }
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '确认删除角色' + record.id + '/' + record.name + '?',
        content: '删除后不可恢复',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消 ',
        onOk () {
          return deleteRole(record.id).then(res => {
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
      form.validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          if (values.Type === 'upd') {
            // 修改 e.g.
            modifyRole(values).then(res => {
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
            saveRole(values).then(res => {
              if (res.code === 1) {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()
                this.$message.info('新增成功')
              } else {
                this.$message.error(res.err)
                this.confirmLoading = false
              }
            }).catch((e) => {
              console.log(e)
              this.confirmLoading = false
            })
          }
        }
      })
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  }
}
</script>
