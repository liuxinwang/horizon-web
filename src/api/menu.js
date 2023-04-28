import request from '@/utils/request'

export function getMenuList (parameter) {
  return request({
    url: '/menu',
    method: 'get',
    params: parameter
  })
}

export function saveMenu (parameter) {
  return request({
    url: '/menu',
    method: 'post',
    data: parameter
  })
}

export function modifyMenu (parameter) {
  return request({
    url: '/menu',
    method: 'put',
    data: parameter
  })
}

export function deleteMenu (parameter) {
  return request({
    url: '/menu/' + parameter,
    method: 'delete',
    data: parameter
  })
}
