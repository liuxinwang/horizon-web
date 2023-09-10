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
    method: parameter.id === 0 ? 'post' : 'put',
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

export function getWorkflowProgress (parameter) {
  return request({
    url: '/sqlaudit/workflow/progress/' + parameter,
    method: 'get',
    params: parameter
  })
}

export function auditWorkflow (parameter) {
  return request({
    url: '/sqlaudit/workflow/audit',
    method: 'post',
    data: parameter
  })
}

export function cancelWorkflow (parameter) {
  return request({
    url: '/sqlaudit/workflow/cancel',
    method: 'post',
    data: parameter
  })
}

export function executeWorkflow (parameter) {
  return request({
    url: '/sqlaudit/workflow/execute',
    method: 'post',
    data: parameter
  })
}