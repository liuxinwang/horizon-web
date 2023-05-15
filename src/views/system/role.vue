<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="6" :sm="6">
              <a-form-item label="角色ID">
                <a-input v-model="queryParam.id" placeholder="请输入"/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="6">
              <a-form-item label="角色名称">
                <a-input v-model="queryParam.name" placeholder="请输入"/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="6">
              <a-form-item label="状态">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">正常</a-select-option>
                  <a-select-option value="2">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="6">
              <span class="table-page-search-submitButtons">
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
      >
        <div
          slot="expandedRowRender"
          slot-scope="record"
          style="margin: 0">
          <a-row
            :gutter="24"
            v-for="parentRole in parentPermissions(record)"
            :key="parentRole.id"
            :style="{ marginBottom: '12px' }">
            <h4>{{ $t(parentRole.menu.meta.title) }}</h4>
            <a-col :span="12" v-for="(role, index) in childPermissions(record, parentRole.menu.id)" :key="index" :style="{ marginBottom: '12px' }">
              <a-col :span="4">
                <span>{{ $t(role.menu.meta.title) }}：</span>
              </a-col>
              <a-col :span="20">
                <a-tag color="cyan" v-for="(action, k) in role.actionData" :key="k">{{ action.describe }}</a-tag>
              </a-col>
            </a-col>
          </a-row>
        </div>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="$refs.modal.edit(record)">角色权限配置</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;">禁用</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleDelete(record)">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </s-table>

      <create-role-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <role-modal ref="modal" @refreshTable="handleRoleModalOk"></role-modal>

    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable } from '@/components'
import CreateRoleForm from './modules/CreateRoleForm'
import RoleModal from './modules/RoleModal'
import { getRoleList, saveRole, modifyRole, deleteRole } from '@/api/role'

export default {
  name: 'TableList',
  components: {
    STable,
    CreateRoleForm,
    RoleModal
  },
  data () {
    return {
      description: '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',

      visible: false,

      form: null,
      mdl: {},
      confirmLoading: false,

      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '唯一识别码',
          dataIndex: 'id'
        },
        {
          title: '角色名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status'
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          sorter: true
        }, {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
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
  computed: {
    parentPermissions () {
      return function (record) {
        return record.rolePermissions.filter(function (permission) {
          return permission.menu.parentId === 0
        })
      }
    },
    childPermissions () {
      return function (record, parentId) {
        return record.rolePermissions.filter(function (permission) {
          return permission.menu.parentId === parentId
        })
      }
    }
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
      this.mdl.type = 'upd'
    },
    /* handleEdit (record) {
      this.mdl = Object.assign({}, record)

      this.mdl.rolePermissions.forEach(permission => {
        permission.actionsOptions = permission.actionData.map(action => {
          return { label: action.describe, value: action.action, defaultCheck: action.defaultCheck }
        })
      })

      // console.log(this.mdl)
      this.visible = true
    }, */
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleOk () {
      // 新增/修改 成功时，重载列表
      // this.$refs.table.refresh()
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.type === 'upd') {
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
        } else {
          this.confirmLoading = false
        }
      })
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
    handleRoleModalOk () {
      this.$refs.table.refresh()
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    }
  },
  watch: {
    /*
      'selectedRows': function (selectedRows) {
        this.needTotalList = this.needTotalList.map(item => {
          return {
            ...item,
            total: selectedRows.reduce( (sum, val) => {
              return sum + val[item.dataIndex]
            }, 0)
          }
        })
      }
      */
  }
}
</script>
