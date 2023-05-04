import request from '@/utils/request'

export function saveRolePermission (parameter) {
  return request({
    url: '/role/permission',
    method: 'post',
    data: parameter
  })
}
