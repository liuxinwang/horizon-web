<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="实例名称">
                <a-input v-model="queryParam.clusterAliasName" placeholder=""/>
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
        rowKey="instanceId"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
      </s-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getInstanceList } from '@/api/configCenter'

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
    title: '实例名称',
    dataIndex: 'clusterAliasName'
  },
  {
    title: '版本',
    dataIndex: 'appVersion'
  },
  {
    title: '实例IP',
    dataIndex: 'intranetDomain'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  }
]

export default {
  name: 'InstanceList',
  components: {
    STable,
    Ellipsis
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
        return getInstanceList(requestParameters).then(res => {
            return res.data
          })
      },
      selectedRowKeys: [],
      selectedRows: []
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
  created () {
  },
  computed: {
  },
  methods: {
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  }
}
</script>
