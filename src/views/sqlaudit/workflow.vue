<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="工单名称">
                <a-input v-model="queryParam.name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="工单状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option v-for="status in workflowStatus" :key="status" :value="status">{{ status | statusName }}</a-select-option>
                </a-select>
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
        <span slot="name" slot-scope="name, record">
          <router-link :to="`./workflowDetail/${record.id}`">
            {{ name }}
          </router-link>
        </span>
        <span slot="status" slot-scope="status">
          <a-tag
            :color="status === 'PendingAudit' ? 'blue' : status === 'PendingExecution' ? 'cyan' : status === 'ScheduledExecution' ? 'cyan' : status === 'Rejected' ? 'red' : status === 'Canceled' ? 'purple' : status === 'Executing' ? 'blue' : status === 'ExecutionFailed' ? 'pink' : status === 'Finished' ? 'green' : 'pink'"
          >
            {{ status | statusName }}
          </a-tag>
        </span>
        <span slot="envType" slot-scope="envType">
          <a-tag :color="envType | envTypeColorFilter">
            {{ envType | envTypeFilter }}
          </a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <template v-if="record.status === 'ExecutionFailed'">
            <a v-action:edit @click="handleEdit(record)">重新修改</a>
          </template>
          <!--
          <template>
            <a-dropdown>
              <a class="ant-dropdown-link">
                操作 <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a v-action:delete @click="handleDelete(record)">删除</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
          -->
        </span>
      </s-table>

      <create-workflow-form
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
import { getWorkflowList, saveWorkflow, deleteWorkflow } from '@/api/sqlaudit/workflow'
import CreateWorkflowForm from './modules/createWorkflowForm'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '工单ID',
    dataIndex: 'id'
  },
  {
    title: '工单名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '工单状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '创建人',
    dataIndex: 'nickName',
    scopedSlots: { customRender: 'nickName' }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt'
  },
  {
    title: '实例名称',
    dataIndex: 'instName'
  },
  {
    title: '环境',
    dataIndex: 'envType',
    scopedSlots: { customRender: 'envType' }
  },
  {
    title: '数据库名称',
    dataIndex: 'dbName'
  },
  {
    title: '待操作人',
    dataIndex: 'waitHandleUser'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'WorkflowList',
  components: {
    STable,
    Ellipsis,
    CreateWorkflowForm
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
        return getWorkflowList(requestParameters).then(res => {
          const newData = res.data.data.map(item => {
            const len = item.workflowRecords.length
            if (len === 0) {
              return item
            }
            switch (item.status) {
              case 'PendingAudit':
                item.waitHandleUser = item.workflowRecords[len - 1].user.nickName
                return item
              default:
                return item
            }
          })
          res.data.data = newData
          return res.data
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
      workflowStatus: ['PendingAudit', 'PendingExecution', 'ScheduledExecution', 'Rejected', 'Canceled', 'Executing', 'ExecutionFailed', 'Finished']
    }
  },
  filters: {
    statusName (status) {
      switch (status) {
        case 'PendingAudit':
          return '待审核'
        case 'PendingExecution':
          return '待执行'
        case 'ScheduledExecution':
          return '定时执行'
        case 'Rejected':
          return '驳回'
        case 'Canceled':
          return '取消'
        case 'Executing':
          return '执行中'
        case 'ExecutionFailed':
          return '执行失败'
        case 'Finished':
          return '完成'
        default:
          return status
      }
    },
    envTypeFilter (envType) {
      const envTypeMap = {
        'dev': '开发',
        'test': '测试',
        'pre': '预发',
        'prod': '生产'
      }
      return envTypeMap[envType]
    },
    envTypeColorFilter (envType) {
      const envTypeColorMap = {
        'dev': 'blue',
        'test': 'blue',
        'pre': 'green',
        'prod': 'orange'
      }
      return envTypeColorMap[envType]
    }
  },
  created () {
    const workflowName = this.$route.params.name
    this.queryParam.name = workflowName
  },
  computed: {
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '确认删除工单' + record.id + '/' + record.name + '?',
        content: '删除后不可恢复',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消 ',
        onOk () {
          return deleteWorkflow(record.id).then(res => {
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
          // 重置id = 0，重新提交走新增
          if (values.id !== 0) {
            values.id = 0
          }
          if (values.id !== 0) {
            // 修改 e.g.
            saveWorkflow(values).then(res => {
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
            saveWorkflow(values).then(res => {
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
