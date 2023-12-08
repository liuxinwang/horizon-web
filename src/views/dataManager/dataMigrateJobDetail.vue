<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-descriptions title="任务信息" size="small">
        <a-descriptions-item label="任务ID">{{ dataMigrateJob.id }}</a-descriptions-item>
        <a-descriptions-item label="任务名称">{{ dataMigrateJob.name }}</a-descriptions-item>
        <a-descriptions-item label="描述">{{ dataMigrateJob.describe }}</a-descriptions-item>
        <a-descriptions-item label="任务状态">
          <a-tag :color="dataMigrateJob.status | statusColorFilter">
            {{ dataMigrateJob.status | statusFilter }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建人">{{ dataMigrateJob.userName }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ dataMigrateJob.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="源实例">{{ dataMigrateJob.sourceInstId }} / {{ sourceInstance.name }}</a-descriptions-item>
        <a-descriptions-item label="源实例环境">
          <a-tag :color="sourceInstance.envType | envTypeColorFilter">
            {{ sourceInstance.envType | envTypeFilter }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label=""></a-descriptions-item>
        <a-descriptions-item label="目标实例">{{ dataMigrateJob.targetInstId }} / {{ targetInstance.name }}</a-descriptions-item>
        <a-descriptions-item label="目标实例环境">
          <a-tag :color="targetInstance.envType | envTypeColorFilter">
            {{ targetInstance.envType | envTypeFilter }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label=""></a-descriptions-item>
      </a-descriptions>
      <a-divider style="margin-bottom: 32px"/>

      <div class="title">迁移进度</div>
      <s-table
        ref="dataMigrateJobDetailTable"
        size="small"
        style="margin-bottom: 24px"
        row-key="id"
        :columns="dataMigrateJobDetailColumns"
        :data="loadDataMigrateJobDetailData"
        bordered
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>

        <span slot="status" slot-scope="status">
          <a-tag :color="status | statusColorFilter">
            {{ status | statusFilter }}
          </a-tag>
        </span>
      </s-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import storage from 'store'
import { USER_NAME, NICK_NAME } from '@/store/mutation-types'
import { STable, Ellipsis } from '@/components'
import { getDataMigrateJobInfo, getDataMigrateJobDetailList } from '@/api/dataManager'
import moment from 'moment'

export default {
  components: {
    STable,
    Ellipsis
  },
  data () {
    return {
      loading: false,
      currentUser: {},
      isMobile: false,
      dataMigrateJob: {},
      sourceInstance: {},
      targetInstance: {},
      dataMigrateJobDetailColumns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '表名',
          dataIndex: 'tableName',
          key: 'tableName'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '源库',
          dataIndex: 'sourceDb',
          customRender: (text, row, index) => {
            return this.dataMigrateJob.sourceDb
          }
        },
        {
          title: '目标库',
          dataIndex: 'targetDb',
          customRender: (text, row, index) => {
            return this.dataMigrateJob.targetDb
          }
        },
        {
          title: '预估行数',
          dataIndex: 'estimateRows'
        },
        {
          title: '已完成行数',
          dataIndex: 'completedRows'
        },
        {
          title: '错误信息',
          dataIndex: 'errorMsg'
        }
      ],
      id: 0,
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadDataMigrateJobDetailData: parameter => {
        this.queryParam.jobId = this.id
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return getDataMigrateJobDetailList(requestParameters).then(res => {
          if (res.code === 1) {
            return res.data
          } else {
            this.$message.error(res.err)
          }
        }).catch((e) => {
          console.log(e)
        })
      }
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
    this.currentUser.userName = storage.get(USER_NAME)
    this.currentUser.nickName = storage.get(NICK_NAME)
    this.id = this.$route.params.id
    this.handleDetail()
  },
  mounted () {
  },
  computed: {
  },
  methods: {
    moment,
    handleDetail () {
      getDataMigrateJobInfo(this.id).then(res => {
        this.dataMigrateJob = res.data
        this.sourceInstance = res.extData.sourceInstance
        this.targetInstance = res.extData.targetInstance
      })
    }
  }
}
</script>

<style lang="less">
  .title {
    color: rgba(0,0,0,.85);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .optBtnClass {
    margin-right: 6px;
  }
</style>
