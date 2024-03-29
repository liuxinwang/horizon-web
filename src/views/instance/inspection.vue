<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="实例ID">
                <a-input v-model="queryParam.instId" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="实例名称">
                <a-input v-model="queryParam.instName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
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
        <span slot="level" slot-scope="level">
          <a-tag
            :color="level | levelColorFilter"
          >
            {{ level | levelFilter }}
          </a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-action:get @click="handleDetail(record)">查看</a>
          </template>
        </span>
      </s-table>

      <inspection-detail-modal
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
import { getInspList } from '@/api/inspection'
import InspectionDetailModal from './modules/InspectionDetailModal'

const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '巡检ID',
    dataIndex: 'inspId'
  },
  {
    title: '实例ID',
    dataIndex: 'instId'
  },
  {
    title: '实例名称',
    dataIndex: 'instName'
  },
  {
    title: '评分',
    dataIndex: 'score'
  },
  {
    title: '等级',
    dataIndex: 'level',
    scopedSlots: { customRender: 'level' }
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
  name: 'InstanceInspection',
  components: {
    STable,
    Ellipsis,
    InspectionDetailModal
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
        return getInspList(requestParameters).then(res => {
            return res.data
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    levelFilter (level) {
      const levelMap = {
        'CRITICAL': '高危',
        'RISKY': '危险',
        'SUBOPTIMAL': '亚健康',
        'HEALTHY': '健康'
      }
      return levelMap[level]
    },
    levelColorFilter (level) {
      const levelColorMap = {
        'CRITICAL': 'red',
        'RISKY': 'orange',
        'SUBOPTIMAL': 'blue',
        'HEALTHY': 'green'
      }
      return levelColorMap[level]
    }
  },
  created () {
  },
  computed: {
  },
  methods: {
    toggleAdvanced () {
      this.advanced = !this.advanced
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
