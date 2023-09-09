<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-descriptions title="工单信息">
        <a-descriptions-item label="工单ID">{{ workflowInfo.id }}</a-descriptions-item>
        <a-descriptions-item label="工单名称">{{ workflowInfo.name }}</a-descriptions-item>
        <a-descriptions-item label="工单状态">
          <a-tag :color="workflowInfo.status | statusColorFilter">
            {{ workflowInfo.status | statusFilter }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建人">{{ workflowInfo.userName }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ workflowInfo.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="SQL语句">
          <a-tooltip placement="bottom">
            <template slot="title">
              {{ workflowInfo.sqlContent }}
            </template>
            {{ workflowInfo.sqlContentPreview }}...
          </a-tooltip>
        </a-descriptions-item>
      </a-descriptions>
      <a-divider style="margin-bottom: 32px"/>

      <div class="title" hidden>工单详情</div>
      <s-table
        style="margin-bottom: 24px"
        row-key="id"
        :columns="auditDetailColumns"
        :data="loadAuditDetailData"
        hidden>
      </s-table>

      <div class="title">流程进度</div>
      <a-steps :direction="isMobile && 'vertical' || 'horizontal'" :current="currentStep" progressDot>
        <a-step>
          <template v-slot:title>
            <span>创建工单</span>
          </template>
          <template v-slot:description>
            <div class="antd-pro-pages-profile-advanced-style-stepDescription">
              {{ workflowInfo.userName }}<a-icon type="dingding" style="margin-left: 8px;" />
              <div>{{ workflowInfo.createdAt }}</div>
            </div>
          </template>
        </a-step>

        <a-step v-for="record in workflowProgress" :key="record.serialNumber">
          <template v-slot:title>
            <span>{{ record.nodeName }}审核工单</span>
          </template>
          <template v-if="record.auditStatus == 'PendingAudit'" v-slot:description>
            <div class="antd-pro-pages-profile-advanced-style-stepDescription">
              {{ record.assigneeUserName }}
              <a-icon type="dingding" style="color: rgb(0, 160, 233); margin-left: 8px;" />
              <div><a>催一下</a></div>
            </div>
          </template>
          <template v-else-if="record.auditStatus == 'Passed'" v-slot:description>
            <div class="antd-pro-pages-profile-advanced-style-stepDescription">
              {{ record.assigneeUserName }}
              <a-icon type="dingding" style="margin-left: 8px;" />
              <div>审核通过</div>
              <div>{{ record.handledAt.Time }}</div>
            </div>
          </template>
          <template v-else-if="record.auditStatus == 'Rejected'" v-slot:description>
            <div class="antd-pro-pages-profile-advanced-style-stepDescription">
              {{ record.assigneeUserName }}
              <a-icon type="dingding" style="margin-left: 8px;" />
              <div style="color: red">驳回：{{ record.remarks }}</div>
              <div>{{ record.handledAt.Time }}</div>
            </div>
          </template>
        </a-step>
        <a-step title="完成" />
      </a-steps>
      <a-divider style="margin-bottom: 32px"/>

      <div class="title">操作信息</div>
      <!-- actions -->
      <a-form-model :model="auditForm">
        <a-form-model-item label="" hidden>
          <a-input v-model="auditForm.workflowId" disabled />
        </a-form-model-item>
        <a-form-model-item label="">
          <a-textarea v-model="auditForm.remarks" placeholder="请填写审核原因" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-model-item>
        <div style="margin: 24px 0" />
        <a-form-model-item>
          <a-button
            v-if="btnOptPerm.isCanAudit"
            :loading="btnOptPerm.isCanAuditLoading"
            type="primary"
            class="optBtnClass"
            style="background-color: #53C41A; border-color: #53C41A"
            :disabled="btnOptPerm.isCanAuditDisabled"
            @click="handlePassed()">审核通过</a-button>
          <a-button
            v-show="btnOptPerm.isCanRejected"
            :disabled="btnOptPerm.isCanRejectedDisabled"
            :loading="btnOptPerm.isCanRejectedLoading"
            type="primary"
            class="optBtnClass"
            @click="handleRejected()">驳回</a-button>
          <a-button
            v-show="btnOptPerm.isCanExecution"
            :disabled="btnOptPerm.isCanExecutionDisabled"
            :loading="btnOptPerm.isCanExecutionLoading"
            type="danger"
            class="optBtnClass"
            @click="handleExecution()">立即执行</a-button>
          <a-button
            v-show="btnOptPerm.isCanTimesExecution"
            :disabled="btnOptPerm.isCanTimesExecutionDisabled"
            :loading="btnOptPerm.isCanTimesExecutionLoading"
            type="primary"
            ghost
            class="optBtnClass"
            hidden>定时执行</a-button>
          <a-button
            v-show="btnOptPerm.isCanCanceled"
            :disabled="btnOptPerm.isCanCanceledDisabled"
            :loading="btnOptPerm.isCanCanceledLoading"
            class="optBtnClass"
            @click="handleCanceled()">终止</a-button>
          <a-button
            v-show="btnOptPerm.isCanModified"
            :disabled="btnOptPerm.isCanModifiedDisabled"
            :loading="btnOptPerm.isCanModifiedLoading"
            class="optBtnClass"
            @click="handleCanceled()">重新修改</a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import storage from 'store'
import { USER_NAME, NICK_NAME } from '@/store/mutation-types'
import { STable } from '@/components'
import { getWorkflowInfo, getWorkflowProgress, auditWorkflow, cancelWorkflow, executeWorkflow } from '@/api/sqlaudit/workflow'

export default {
  components: {
    STable
  },
  data () {
    return {
      loading: false,
      currentUser: {},
      isMobile: false,
      workflowId: 0,
      workflowInfo: {},
      auditDetailColumns: [
        {
          title: '序号',
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: 'SQL内容',
          dataIndex: 'sqlContent',
          key: 'sqlContent'
        },
        {
          title: '审核结果',
          dataIndex: 'auditResult',
          key: 'auditResult'
        },
        {
          title: '执行状态',
          dataIndex: 'executionStatus',
          key: 'executionStatus',
          align: 'right'
        },
        {
          title: '扫描/影响行数',
          dataIndex: 'affectedRows',
          key: 'affectedRows',
          align: 'right'
        },
        {
          title: '执行耗时',
          dataIndex: 'executionTime',
          key: 'executionTime',
          align: 'right'
        },
        {
          title: '备份耗时',
          dataIndex: 'backupTime',
          key: 'backupTime',
          align: 'right'
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadAuditDetailData: () => {
        return new Promise(resolve => {
          resolve({
            data: [
              {
                id: '1',
                sqlContent: '-',
                auditResult: '-',
                executionStatus: '-',
                affectedRows: '-',
                executionTime: '-',
                backupTime: '-'
              }
            ],
            pageSize: 10,
            pageNo: 1,
            totalPage: 1,
            totalCount: 10
          })
        }).then(res => {
          return res
        })
      },
      workflowProgress: [],
      currentStep: 0,
      btnOptPerm: { // 按钮操作权限
        isCanAudit: false,
        isCanRejected: false,
        isCanExecution: false,
        isCanTimesExecution: false,
        isCanCanceled: false,
        isCanModified: false,
        isCanAuditDisabled: false,
        isCanRejectedDisabled: false,
        isCanExecutionDisabled: false,
        isCanTimesExecutionDisabled: false,
        isCanCanceledDisabled: false,
        isCanModifiedDisabled: false,
        isCanAuditLoading: false,
        isCanRejectedLoading: false,
        isCanExecutionLoading: false,
        isCanTimesExecutionLoading: false,
        isCanCanceledLoading: false,
        isCanModifiedLoading: false
      },
      auditForm: {
        id: '', // recordId
        flowSerialNumber: 0,
        workflowTemplateCode: '',
        workflowId: '',
        remarks: '',
        auditStatus: ''
      }
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = {
        'PendingAudit': '待审核',
        'PendingExecution': '待执行',
        'Rejected': '驳回',
        'Canceled': '取消',
        'Executing': '执行中',
        'ExecutionFailed': '执行失败',
        'Finished': '完成'
      }
      return statusMap[status]
    },
    statusColorFilter (status) {
      const statusColorMap = {
        'PendingAudit': 'blue',
        'PendingExecution': 'cyan',
        'Rejected': 'red',
        'Canceled': 'purple',
        'Executing': 'blue',
        'ExecutionFailed': 'pink',
        'Finished': 'green'
      }
      return statusColorMap[status]
    }
  },
  created () {
    this.currentUser.userName = storage.get(USER_NAME)
    this.currentUser.nickName = storage.get(NICK_NAME)
    this.workflowId = this.$route.params.workflowId
    this.handleInitData()
  },
  mounted () {
  },
  computed: {
  },
  methods: {
    async handleInitData () {
      await this.handleGetWorkflowInfo()
      await this.handleWorkflowProgress()
      await this.handleBtnOptPerm()
    },
    async handleGetWorkflowInfo () {
      await getWorkflowInfo(this.workflowId).then(res => {
        this.workflowInfo = res.data
        this.workflowInfo.sqlContentPreview = this.workflowInfo.sqlContent.substring(0, 50)
        this.auditForm.workflowId = this.workflowInfo.id
      })
    },
    async handleWorkflowProgress () {
      await getWorkflowProgress(this.workflowId).then(res => {
        this.workflowProgress = res.data
        if (this.workflowProgress.length > 0) {
          let lastAuditStatus = ''
          this.workflowProgress.forEach((item) => {
            if (item.recordId > 0) {
              this.currentStep += 1
              this.auditForm.id = item.recordId
              this.auditForm.flowSerialNumber = item.serialNumber
              this.auditForm.workflowTemplateCode = item.workflowTemplateCode
              lastAuditStatus = item.auditStatus
            }
          })
          // done
          if (lastAuditStatus === 'Passed') {
            this.currentStep += 1
          }
        }
      })
    },
    handleBtnOptPerm () {
      // isCanAudit、isCanRejected
      // 1. workflow status = PendingAudit
      // 2. and step assigneeUserName = currentUser
      switch (this.workflowInfo.status) {
        case 'PendingAudit':
          if (this.workflowInfo.userName === this.currentUser.userName) {
            this.btnOptPerm.isCanCanceled = true
          }
          this.workflowProgress.forEach((item) => {
            if (item.auditStatus === this.workflowInfo.status) {
              if (item.assigneeUserName === this.currentUser.userName) {
                this.btnOptPerm.isCanAudit = true
                this.btnOptPerm.isCanRejected = true
              }
            }
          })
          break
        case 'PendingExecution':
          if (this.workflowInfo.userName === this.currentUser.userName) {
            this.btnOptPerm.isCanExecution = true
            this.btnOptPerm.isCanCanceled = true
          }
          break
        case 'ExecutionFailed':
          if (this.workflowInfo.userName === this.currentUser.userName) {
            this.btnOptPerm.isCanModified = true
          }
          break
        default:
          break
      }
    },
    handlePassed () {
      this.btnOptPerm.isCanAuditLoading = true
      this.btnOptPerm.isCanRejectedDisabled = true
      this.auditForm.auditStatus = 'Passed'
      auditWorkflow(this.auditForm).then(res => {
        if (res.code === 1) {
          this.currentStep = 0
          this.handleInitData()
          this.btnOptPerm.isCanAudit = false
          this.btnOptPerm.isCanAuditLoading = false
          this.btnOptPerm.isCanRejectedDisabled = false
          this.btnOptPerm.isCanRejected = false
        } else {
          this.$message.error(res.err)
          this.btnOptPerm.isCanAuditLoading = false
          this.btnOptPerm.isCanRejectedDisabled = false
        }
      }).catch((e) => {
        console.log(e)
        this.btnOptPerm.isCanAuditLoading = false
        this.btnOptPerm.isCanRejectedDisabled = false
      })
    },
    handleRejected () {
      if (this.auditForm.remarks.trim() === '') {
        this.$message.error('请填写驳回原因！')
        return
      }
      this.btnOptPerm.isCanRejectedLoading = true
      this.btnOptPerm.isCanAuditDisabled = true
      this.auditForm.auditStatus = 'Rejected'
      auditWorkflow(this.auditForm).then(res => {
        if (res.code === 1) {
          this.currentStep = 0
          this.handleInitData()
          this.btnOptPerm.isCanRejected = false
          this.btnOptPerm.isCanRejectedLoading = false
          this.btnOptPerm.isCanAuditDisabled = false
          this.btnOptPerm.isCanAudit = false
        } else {
          this.$message.error(res.err)
          this.btnOptPerm.isCanRejectedLoading = false
          this.btnOptPerm.isCanAuditDisabled = false
        }
      }).catch((e) => {
        console.log(e)
        this.btnOptPerm.isCanRejectedLoading = false
        this.btnOptPerm.isCanAuditDisabled = false
      })
    },
    handleCanceled () {
      this.btnOptPerm.isCanCanceledLoading = true
      this.btnOptPerm.isCanExecutionDisabled = true
      cancelWorkflow(this.workflowInfo).then(res => {
        if (res.code === 1) {
          this.currentStep = 0
          this.handleInitData()
          this.btnOptPerm.isCanCanceled = false
          this.btnOptPerm.isCanCanceledLoading = false
          this.btnOptPerm.isCanExecution = false
          this.btnOptPerm.isCanExecutionDisabled = false
        } else {
          this.$message.error(res.err)
          this.btnOptPerm.isCanCanceledLoading = false
          this.btnOptPerm.isCanExecutionDisabled = false
        }
      }).catch((e) => {
        console.log(e)
        this.btnOptPerm.isCanCanceledLoading = false
          this.btnOptPerm.isCanExecutionDisabled = false
      })
    },
    handleExecution () {
      this.btnOptPerm.isCanExecutionLoading = true
      this.btnOptPerm.isCanCanceledDisabled = true
      executeWorkflow(this.workflowInfo).then(res => {
        if (res.code === 1) {
          this.handleGetWorkflowInfo()
          this.btnOptPerm.isCanExecution = false
          this.btnOptPerm.isCanExecutionLoading = false
          this.btnOptPerm.isCanCanceled = false
          this.btnOptPerm.isCanCanceledDisabled = false
        } else {
          this.$message.error(res.err)
          this.btnOptPerm.isCanExecutionLoading = false
          this.btnOptPerm.isCanCanceledDisabled = false
        }
      }).catch((e) => {
        console.log(e)
        this.btnOptPerm.isCanExecutionLoading = false
          this.btnOptPerm.isCanCanceledDisabled = false
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
