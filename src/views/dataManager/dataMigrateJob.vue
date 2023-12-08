<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="任务名称">
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

        <span slot="name" slot-scope="name, record">
          <router-link :to="`./dataMigrateJobDetail/${record.id}`">
            {{ name }}
          </router-link>
        </span>
        <span slot="status" slot-scope="status">
          <a-tag :color="status | statusColorFilter">
            {{ status | statusFilter }}
          </a-tag>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a v-action:execute @click="handleExecute(record)">执行</a>
          </template>
        </span>
      </s-table>

      <create-data-migrate-form
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
import { getDataMigrateJobList, saveDataMigrateJob, executeDataMigrateJob } from '@/api/dataManager'
import CreateDataMigrateForm from './modules/createDataMigrateForm'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '任务ID',
    dataIndex: 'id'
  },
  {
    title: '任务名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '源数据库',
    dataIndex: 'sourceDb'
  },
  {
    title: '目的数据库',
    dataIndex: 'targetDb'
  },
  {
    title: '运行状态',
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
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'DataMigrateJobList',
  components: {
    STable,
    Ellipsis,
    CreateDataMigrateForm
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
        return getDataMigrateJobList(requestParameters).then(res => {
            return res.data
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = {
        'NotStart': '未开始',
        'Running': '执行中',
        'Error': '异常',
        'Finished': '完成'
      }
      return statusMap[status]
    },
    statusColorFilter (status) {
      const statusColorMap = {
        'NotStart': 'cyan',
        'Error': 'red',
        'Running': 'blue',
        'Finished': 'green'
      }
      return statusColorMap[status]
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
  },
  computed: {
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleDetail () {

    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id !== 0) {
            // 修改 e.g.
            saveDataMigrateJob(values).then(res => {
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
            saveDataMigrateJob(values).then(res => {
              if (res.code === 1) {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 重置表单中下拉选数据
                this.$refs.createModal.resetSelectData()
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
      this.$refs.createModal.resetSelectData() // 重置表单中下拉选数据
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    handleExecute (record) {
      executeDataMigrateJob(record).then(res => {
        if (res.code === 1) {
          this.$refs.table.refresh()
          this.$message.info('执行成功')
        } else {
          this.$message.error(res.err)
        }
      })
    }
  }
}
</script>
