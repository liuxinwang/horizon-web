<template>
  <a-modal
    :title="title"
    :width="760"
    :visible="visible"
    :footer="null"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-card title="基本信息" :bordered="false" :size="size" :headStyle="{ border: '1px solid #e8e8e8' }" :bodyStyle="{ padding: '0px' }">
        <a-descriptions bordered :size="size" :column="1">
          <a-descriptions-item label="巡检ID">{{ inspData.InspId }}</a-descriptions-item>
          <a-descriptions-item label="实例名称">{{ instData.Name }}</a-descriptions-item>
          <a-descriptions-item label="实例角色">{{ instData.Role }}</a-descriptions-item>
          <a-descriptions-item label="实例IP">{{ instData.Ip }}</a-descriptions-item>
          <a-descriptions-item label="实例端口">{{ instData.Port }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
      <a-card title="扣分详情" :size="size" style="margin-top: 20px">
        <div>
          <a-table :columns="deductionColumns" :data-source="deductionData" bordered size="small"></a-table>
        </div>
      </a-card>
      <a-card :title="$t('instance.inspection.server')" :size="size" style="margin-top: 20px">
        <div>
          <smooth-line :height="300" :data="serverMetricLineData" :title="$t('instance.inspection.resource-utilization')" :scale="serverMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="serverIOPSMetricLineData" :title="$t('instance.inspection.iops')" :scale="serverMetricScale" />
        </div>
      </a-card>
      <a-card title="实例指标" :size="size" style="margin-top: 20px">
        <div>
          <smooth-line :height="300" :data="instLockMetricLineData" :title="$t('instance.inspection.lock')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instNetworkMetricLineData" :title="$t('instance.inspection.network')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instSlowSQLNumMetricLineData" :title="$t('instance.inspection.slow-sql-num')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instThreadsRunningMetricLineData" :title="$t('instance.inspection.threads-running-num')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instThreadsConnectedMetricLineData" :title="$t('instance.inspection.threads-connected')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instIbpCacheMetricLineData" :title="$t('instance.inspection.ibp-cache-hits-rate')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instQTpsMetricLineData" :title="$t('instance.inspection.qtps')" :scale="instMetricScale" />
        </div>
        <div>
          <smooth-line :height="300" :data="instReplDelayMetricLineData" :title="$t('instance.inspection.replication-delay')" :scale="instMetricScale" />
        </div>
        <div>
          <h4 style="margin-top: 10px; margin-bottom: 10px;">{{ $t('instance.inspection.bigtable-num') }}</h4>
          <a-table :columns="bigtableColumns" :data-source="bigtableData" bordered size="small"></a-table>
        </div>
        <div>
          <h4 style="margin-top: 10px; margin-bottom: 10px;">{{ $t('instance.inspection.high-risk-account') }}</h4>
          <a-table :columns="highRiskAccountColumns" :data-source="highRiskAccountData" bordered size="small"></a-table>
        </div>
        <div>
          <!--
          <h4 style="margin-top: 10px; margin-bottom: 10px;">其它</h4>
          <a-descriptions bordered :size="size" :column="1">
            <a-descriptions-item :label="$t('instance.inspection.replication-status')"></a-descriptions-item>
            <a-descriptions-item :label="$t('instance.inspection.ha-status')">-</a-descriptions-item>
            <a-descriptions-item :label="$t('instance.inspection.backup-status')">-</a-descriptions-item>
          </a-descriptions> -->
        </div>
      </a-card>
    </a-spin>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { SmoothLine } from '@/components'
import { getInstInfo } from '@/api/instance'
import { getInspDetail } from '@/api/inspection'
import { getScoreList } from '@/api/score'

const DataSet = require('@antv/data-set')

export default {
  components: {
    SmoothLine
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      loading: false,
      title: '巡检报告',
      size: 'small',
      serverMetricLineData: [ { time: '-', cpu: 0, memory: 0, disk: 0 } ],
      serverMetricScale: [ { dataKey: 'time', tickCount: 12 } ],
      serverIOPSMetricLineData: [ { time: '-', iops: 0 } ],
      instMetricScale: [ { dataKey: 'time', tickCount: 12 } ],
      instLockMetricLineData: [ { time: '-', deadlock: 0, lockWait: 0 } ],
      instNetworkMetricLineData: [ { time: '-', in: 0, out: 0 } ],
      instSlowSQLNumMetricLineData: [ { time: '-', slowSQLNum: 0 } ],
      instThreadsRunningMetricLineData: [ { time: '-', threadsRunning: 0 } ],
      instThreadsConnectedMetricLineData: [ { time: '-', threadsConnected: 0 } ],
      instIbpCacheMetricLineData: [ { time: '-', ibpCacheHitsRate: 0 } ],
      instQTpsMetricLineData: [ { time: '-', qps: 0, tps: 0 } ],
      instReplStatusMetricLineData: [ ],
      instReplDelayMetricLineData: [ { time: '-', replDelay: 0 } ],
      inspData: { InspId: null },
      instData: { InstId: null, Name: null },
      serverMetricValue: { cpu: [], memory: [], disk: [] },
      serverIOPSMetricValue: [],
      instLockMetricValue: { deadlock: [], lockWait: [] },
      instNetworkMetricValue: { in: [], out: [] },
      instSlowSQLNumMetricValue: [],
      instThreadsRunningMetricValue: [],
      instThreadsConnectedMetricValue: [],
      instIbpCacheMetricValue: [],
      instQTpsMetricValue: { qps: [], tps: [] },
      instReplStatusMetricValue: [],
      instReplDelayMetricValue: [],
      bigtableData: [ { TableSchema: '-', TableName: '-', TableRows: 0, TableSize: 0 } ],
      deductionData: [ { Metric: '-', Deduction: '-', Message: '-' } ],
      highRiskAccountData: [ { user: '-', host: '-' } ],
      bigtableColumns: [
        {
          title: '库名',
          dataIndex: 'TableSchema',
          key: 'TableSchema'
        },
        {
          title: '表名',
          dataIndex: 'TableName',
          key: 'TableName'
        },
        {
          title: '行数',
          dataIndex: 'TableRows',
          key: 'TableRows'
        },
        {
          title: '大小',
          customRender: (text, record, index) => (
                   <span>{ record.DataLength + record.IndexLength }</span>
                )
        }
      ],
      highRiskAccountColumns: [
        {
          title: '用户',
          dataIndex: 'User',
          key: 'User'
        },
        {
          title: '主机',
          dataIndex: 'Host',
          key: 'Host'
        }
      ],
      deductionColumns: [
        {
          title: '指标',
          dataIndex: 'Metric',
          key: 'Metric'
        },
        {
          title: '扣分',
          dataIndex: 'Deduction',
          key: 'Deduction'
        },
        {
          title: '说明',
          dataIndex: 'Message',
          key: 'Message'
        }
      ]
    }
  },
  watch: {
    model: function (val) {
      this.resetInitData()
      this.inspData = val
      this.loading = true
      this.instInfoHandle()
      this.deductionHandle()
      this.inspDetailHandle()
    }
  },
  created () {
  },
  methods: {
    instInfoHandle () {
      getInstInfo(this.inspData.InstId).then(res => {
        this.instData = res.data
      })
    },
    deductionHandle () {
      getScoreList({ 'InspId': this.inspData.InspId }).then(res => {
        this.deductionData = res.data
      })
    },
    inspDetailHandle () {
      getInspDetail(this.inspData.InspId).then(res => {
        const resData = res.data
        for (const i in resData) {
          if (resData[i].Result === null || resData[i].Result.length === 0) continue
          switch (resData[i].Metric) {
            case 'CPU_UTILIZATION':
              this.serverMetricValue.cpu = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'cpu': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'MEMORY_UTILIZATION':
              this.serverMetricValue.memory = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'memory': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'DISK_UTILIZATION':
              this.serverMetricValue.disk = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'disk': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'IOPS_UTILIZATION':
              this.serverIOPSMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'iops': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'DEADLOCK':
              this.instLockMetricValue.deadlock = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'deadlock': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'LOCK_WAIT':
              this.instLockMetricValue.lockWait = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'lockWait': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'BIGTABLE_NUM':
              this.bigtableData = resData[i].Result
              break
            case 'NETWORK_TRAFFIC_IN':
              this.instNetworkMetricValue.in = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'in': Number.parseFloat((Number.parseFloat(v[1]) / 1024).toFixed(2)) }
                return v
              })
              break
            case 'NETWORK_TRAFFIC_OUT':
              this.instNetworkMetricValue.out = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'out': Number.parseFloat((Number.parseFloat(v[1]) / 1024).toFixed(2)) }
                return v
              })
              break
            case 'SLOW_SQL_NUM':
              this.instSlowSQLNumMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'slowSQLNum': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'THREADS_RUNNING_NUM':
              this.instThreadsRunningMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'threadsRunning': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'THREADS_CONNECTED':
              this.instThreadsConnectedMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'threadsConnected': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'IBP_CACHE_HITS_RATE':
              this.instIbpCacheMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'ibpCacheHitsRate': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'QPS':
              this.instQTpsMetricValue.qps = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'qps': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'TPS':
              this.instQTpsMetricValue.tps = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'tps': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            case 'HIGH_RISK_ACCOUNT':
              this.highRiskAccountData = resData[i].Result
              break
            case 'REPLICATION_STATUS':
              this.instReplStatusMetricValue = resData[i].Result
              break
            case 'REPLICATION_DELAY':
              this.instReplDelayMetricValue = resData[i].Result[0].values.map(v => {
                v = { 'time': moment.unix(v[0]).format('HH:mm:ss'), 'replDelay': Number.parseFloat(Number.parseFloat(v[1]).toFixed(2)) }
                return v
              })
              break
            default:
              break
          }
        }

        // server cpu mem disk 利用率
        const merged = [...this.serverMetricValue.cpu.concat(this.serverMetricValue.memory).reduce((m, o) =>
          m.set(o.time, Object.assign(m.get(o.time) || {}, o))
        , new Map()).values()]
        const merged2 = [...merged.concat(this.serverMetricValue.disk).reduce((m, o) =>
          m.set(o.time, Object.assign(m.get(o.time) || {}, o))
        , new Map()).values()]
        this.serverMetricDv = new DataSet.View().source(merged2)
        this.serverMetricDv.transform({ type: 'fold', fields: ['cpu', 'memory', 'disk'], key: 'metric', value: 'utilization' })
        this.serverMetricLineData = this.serverMetricDv.rows

        // server iops
        this.serverIOPSMetricDv = new DataSet.View().source(this.serverIOPSMetricValue)
        this.serverIOPSMetricDv.transform({ type: 'fold', fields: ['iops'], key: 'metric', value: 'utilization' })
        this.serverIOPSMetricLineData = this.serverIOPSMetricDv.rows

        // instance 死锁 / 锁等待
        const lockMerged = [...this.instLockMetricValue.deadlock.concat(this.instLockMetricValue.lockWait).reduce((m, o) =>
          m.set(o.time, Object.assign(m.get(o.time) || {}, o))
        , new Map()).values()]
        this.instLockMetricDv = new DataSet.View().source(lockMerged)
        this.instLockMetricDv.transform({ type: 'fold', fields: ['deadlock', 'lockWait'], key: 'metric', value: 'utilization' })
        this.instLockMetricLineData = this.instLockMetricDv.rows

        // instance 网络流量
        const networkMerged = [...this.instNetworkMetricValue.in.concat(this.instNetworkMetricValue.out).reduce((m, o) =>
          m.set(o.time, Object.assign(m.get(o.time) || {}, o))
        , new Map()).values()]
        this.instNetworkMetricDv = new DataSet.View().source(networkMerged)
        this.instNetworkMetricDv.transform({ type: 'fold', fields: ['in', 'out'], key: 'metric', value: 'utilization' })
        this.instNetworkMetricLineData = this.instNetworkMetricDv.rows

        // instance 慢SQL
        this.instSlowSQLNumMetricDv = new DataSet.View().source(this.instSlowSQLNumMetricValue)
        this.instSlowSQLNumMetricDv.transform({ type: 'fold', fields: ['slowSQLNum'], key: 'metric', value: 'utilization' })
        this.instSlowSQLNumMetricLineData = this.instSlowSQLNumMetricDv.rows

        // instance 并发线程数
        this.instThreadsRunningMetricDv = new DataSet.View().source(this.instThreadsRunningMetricValue)
        this.instThreadsRunningMetricDv.transform({ type: 'fold', fields: ['threadsRunning'], key: 'metric', value: 'utilization' })
        this.instThreadsRunningMetricLineData = this.instThreadsRunningMetricDv.rows

        // instance 连接线程数
        this.instThreadsConnectedMetricDv = new DataSet.View().source(this.instThreadsConnectedMetricValue)
        this.instThreadsConnectedMetricDv.transform({ type: 'fold', fields: ['threadsConnected'], key: 'metric', value: 'utilization' })
        this.instThreadsConnectedMetricLineData = this.instThreadsConnectedMetricDv.rows

        // instance 缓存命中率
        this.instIbpCacheMetricDv = new DataSet.View().source(this.instIbpCacheMetricValue)
        this.instIbpCacheMetricDv.transform({ type: 'fold', fields: ['ibpCacheHitsRate'], key: 'metric', value: 'utilization' })
        this.instIbpCacheMetricLineData = this.instIbpCacheMetricDv.rows

        // instance qps / tps
        const qtpsMerged = [...this.instQTpsMetricValue.qps.concat(this.instQTpsMetricValue.tps).reduce((m, o) =>
          m.set(o.time, Object.assign(m.get(o.time) || {}, o))
        , new Map()).values()]
        this.instQTpsMetricDv = new DataSet.View().source(qtpsMerged)
        this.instQTpsMetricDv.transform({ type: 'fold', fields: ['qps', 'tps'], key: 'metric', value: 'utilization' })
        this.instQTpsMetricLineData = this.instQTpsMetricDv.rows

        // instance 复制延迟
        this.instReplDelayMetricDv = new DataSet.View().source(this.instReplDelayMetricValue)
        this.instReplDelayMetricDv.transform({ type: 'fold', fields: ['replDelay'], key: 'metric', value: 'utilization' })
        this.instReplDelayMetricLineData = this.instReplDelayMetricDv.rows

        this.loading = false
      }).catch(err => {
        console.log(err)
        this.$message.error('数据处理异常！')
        this.loading = false
      })
    },
    resetInitData () {
      this.inspData = { InspId: null }
      this.instData = { InstId: null, Name: null }
      this.serverMetricLineData = [ { time: '-', cpu: 0, memory: 0, disk: 0 } ]
      this.serverMetricScale = [ { dataKey: 'time', tickCount: 12 } ]
      this.serverIOPSMetricLineData = [ { time: '-', iops: 0 } ]
      this.instMetricScale = [ { dataKey: 'time', tickCount: 12 } ]
      this.instLockMetricLineData = [ { time: '-', deadlock: 0, lockWait: 0 } ]
      this.instNetworkMetricLineData = [ { time: '-', in: 0, out: 0 } ]
      this.instSlowSQLNumMetricLineData = [ { time: '-', slowSQLNum: 0 } ]
      this.instThreadsRunningMetricLineData = [ { time: '-', threadsRunning: 0 } ]
      this.instThreadsConnectedMetricLineData = [ { time: '-', threadsConnected: 0 } ]
      this.instIbpCacheMetricLineData = [ { time: '-', ibpCacheHitsRate: 0 } ]
      this.instQTpsMetricLineData = [ { time: '-', qps: 0, tps: 0 } ]
      this.instReplDelayMetricLineData = [ { time: '-', replDelay: 0 } ]
    }
  }
}
</script>
