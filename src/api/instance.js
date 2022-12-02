import request from '@/utils/request'

export function getInstList (parameter) {
  return request({
    url: '/instance',
    method: 'get',
    params: parameter
  })
}

export function getInstInfo (parameter) {
  return request({
    url: '/instance/' + parameter,
    method: 'get',
    params: parameter
  })
}

// InstId == 0 add     post
// InstId != 0 update  put
export function saveInst (parameter) {
  return request({
    url: '/instance',
    method: parameter.InstId === '' ? 'post' : 'put',
    data: parameter
  })
}

export function deleteInst (parameter) {
  return request({
    url: '/instance/' + parameter,
    method: 'delete',
    data: parameter
  })
}
