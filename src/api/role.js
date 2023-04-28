import request from '@/utils/request'

export function getRoleList (parameter) {
  return request({
    url: '/role',
    method: 'get',
    params: parameter
  })
}

export function saveRole (parameter) {
  return request({
    url: '/role',
    method: 'post',
    data: parameter
  })
}

export function modifyRole (parameter) {
  return request({
    url: '/role',
    method: 'put',
    data: parameter
  })
}

export function deleteRole (parameter) {
  return request({
    url: '/role/' + parameter,
    method: 'delete',
    data: parameter
  })
}
