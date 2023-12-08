import request from '@/utils/request'

export function getDataMigrateJobList (parameter) {
  return request({
    url: '/dataManger/dataMigrateJob/query',
    method: 'get',
    params: parameter
  })
}

export function getDataMigrateJobInfo (parameter) {
  return request({
    url: '/dataManger/dataMigrateJob/' + parameter,
    method: 'get',
    params: parameter
  })
}

export function saveDataMigrateJob (parameter) {
  return request({
    url: parameter.id === 0 ? '/dataManger/dataMigrateJob/add' : '/dataManger/dataMigrateJob/edit',
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function executeDataMigrateJob (parameter) {
  return request({
    url: '/dataManger/dataMigrateJob/execute',
    method: 'post',
    data: parameter
  })
}

export function getDataMigrateJobDetailList (parameter) {
  return request({
    url: '/dataManger/dataMigrateJobDetail/query',
    method: 'get',
    params: parameter
  })
}
