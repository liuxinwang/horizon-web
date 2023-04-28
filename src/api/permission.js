import request from '@/utils/request'

const api = {
  permission: '/permission',
  orgTree: '/org/tree'
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}