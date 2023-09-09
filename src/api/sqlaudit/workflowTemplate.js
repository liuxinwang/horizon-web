import request from '@/utils/request'

export function getWorkflowTemplateList (parameter) {
  return request({
    url: '/sqlaudit/workflowTemplate',
    method: 'get',
    params: parameter
  })
}

export function getWorkflowTemplateInfo (parameter) {
  return request({
    url: '/sqlaudit/workflowTemplate/' + parameter,
    method: 'get',
    params: parameter
  })
}

// ProjId == 0 add     post
// ProjId != 0 update  put
export function saveWorkflowTemplate (parameter) {
  return request({
    url: '/sqlaudit/workflowTemplate',
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function deleteWorkflowTemplate (parameter) {
  return request({
    url: '/sqlaudit/workflowTemplate/' + parameter,
    method: 'delete',
    data: parameter
  })
}

export function saveWorkflowTemplateConfig (parameter) {
  return request({
    url: '/sqlaudit/workflowTemplate/config',
    method: 'post',
    data: parameter
  })
}
