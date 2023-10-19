import request from '@/utils/request'

export function getRoleList (parameter) {
  return request({
    url: '/role/query',
    method: 'get',
    params: parameter
  })
}

export function saveRole (parameter) {
  return request({
    url: '/role/add',
    method: 'post',
    data: parameter
  })
}

export function modifyRole (parameter) {
  return request({
    url: '/role/edit',
    method: 'put',
    data: parameter
  })
}

export function deleteRole (parameter) {
  return request({
    url: '/role/delete/' + parameter,
    method: 'delete',
    data: parameter
  })
}
