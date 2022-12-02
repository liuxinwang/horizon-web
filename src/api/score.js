import request from '@/utils/request'

export function getScoreList (parameter) {
  return request({
    url: '/score',
    method: 'get',
    params: parameter
  })
}
