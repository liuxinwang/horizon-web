import request from '@/utils/request'

export function getInspList (parameter) {
  return request({
    url: '/inspection',
    method: 'get',
    params: parameter
  })
}

export function getInspDetail (parameter) {
  return request({
    url: '/inspection' + parameter,
    method: 'get',
    params: parameter
  })
}
