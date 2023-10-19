import request from '@/utils/request'

export function getUserList (parameter) {
  return request({
    url: '/user/query',
    method: 'get',
    params: parameter
  })
}

// InstId == 0 add     post
// InstId != 0 update  put
export function saveUser (parameter) {
  return request({
    url: parameter.ID === '' ? '/user/add' : '/user/edit',
    method: parameter.ID === '' ? 'post' : 'put',
    data: parameter
  })
}

export function resetPassword (parameter) {
  return request({
    url: '/user/resetPassword',
    method: 'put',
    data: parameter
  })
}

export function deleteUser (parameter) {
  return request({
    url: '/user/' + parameter,
    method: 'delete',
    data: parameter
  })
}
