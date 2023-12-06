import request from '@/utils/request'

export function getInstanceList (parameter) {
  return request({
    url: '/configCenter/instance/query',
    method: 'get',
    params: parameter
  })
}

export function getInstanceConfigList (parameter) {
  return request({
    url: '/configCenter/config/query',
    method: 'get',
    params: parameter
  })
}

export function getInstanceConfigInfo (parameter) {
  return request({
    url: '/configCenter/config/detail',
    method: 'get',
    params: parameter
  })
}
