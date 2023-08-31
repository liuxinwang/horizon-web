import request from '@/utils/request'

export function getWorkflowList (parameter) {
  return request({
    url: '/sqlaudit/workflow',
    method: 'get',
    params: parameter
  })
}

export function getWorkflowInfo (parameter) {
  return request({
    url: '/sqlaudit/workflow/' + parameter,
    method: 'get',
    params: parameter
  })
}

// ProjId == 0 add     post
// ProjId != 0 update  put
export function saveWorkflow (parameter) {
  return request({
    url: '/sqlaudit/workflow',
    method: parameter.workflowId === '' ? 'post' : 'put',
    data: parameter
  })
}

export function deleteWorkflow (parameter) {
  return request({
    url: '/sqlaudit/workflow/' + parameter,
    method: 'delete',
    data: parameter
  })
}
