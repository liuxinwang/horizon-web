<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="6" :sm="24">
              <a-form-item label="实例名称">
                <a-select v-model="queryParam.instanceId" :default-value="instanceData[0].instanceId" style="" @change="handleInstanceChange">
                  <a-select-option v-for="instance in instanceData" :key="instance.instanceId">
                    {{ instance.clusterAliasName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="命名空间">
                <a-select v-model="queryParam.namespaceId" @change="handleNamespaceChange">
                  <a-select-option v-for="ns in namespaceData" :key="ns.namespaceId">
                    {{ ns.namespaceId }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="Data ID">
                <a-input v-model="queryParam.dataId" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 6 || 24" :sm="24">
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
        rowKey="dataId"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-action:get @click="handleDetail(record)">查看</a>
          </template>
        </span>
      </s-table>

      <config-detail-modal
        ref="detailModal"
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
import { getInstanceList, getInstanceConfigList } from '@/api/configCenter'
import ConfigDetailModal from './modules/DetailModal'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '实例ID',
    dataIndex: 'instanceId'
  },
  {
    title: '命名空间',
    dataIndex: 'namespaceId'
  },
  {
    title: 'Data ID',
    dataIndex: 'dataId'
  },
  {
    title: 'Group',
    dataIndex: 'group'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'InstanceList',
  components: {
    STable,
    Ellipsis,
    ConfigDetailModal
  },
  data () {
    this.columns = columns
    return {
      // detail model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: { 'instanceId': '', 'namespaceId': '' },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        if (this.queryParam.instanceId === '') {
          return
        }
        return getInstanceConfigList(requestParameters).then(res => {
            return res.data
          })
      },
      instanceData: [{ 'instanceId': '' }],
      namespaceData: [{ 'namespaceId': '' }]
    }
  },
  filters: {
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
  beforeCreate () {
  },
  created () {
    this.handleInstanceData()
  },
  computed: {
  },
  methods: {
    handleInstanceData () {
      const queryData = { 'pageNo': 1, 'pageSize': 1000 }
      getInstanceList(queryData).then(res => {
        this.instanceData = res.data.data
        this.namespaceData = this.instanceData[0].namespaces
        this.queryParam.instanceId = this.instanceData[0].instanceId
        this.queryParam.namespaceId = this.namespaceData[0].namespaceId
        this.$refs.table.refresh()
      })
    },
    handleInstanceChange (value) {
      this.instanceData.forEach((item) => {
        if (item.instanceId === value) {
          this.namespaceData = item.namespaces
          this.queryParam.namespaceId = this.namespaceData[0].namespaceId
          this.$refs.table.refresh()
        }
      })
    },
    handleNamespaceChange (value) {
      this.$refs.table.refresh()
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    handleDetail (val) {
      this.mdl = val
      this.visible = true
    },
    handleOk () {
      this.visible = false
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
