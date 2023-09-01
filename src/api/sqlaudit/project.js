import request from '@/utils/request'

export function getProjList (parameter) {
  return request({
    url: '/sqlaudit/project',
    method: 'get',
    params: parameter
  })
}

export function getProjInfo (parameter) {
  return request({
    url: '/sqlaudit/project/' + parameter,
    method: 'get',
    params: parameter
  })
}

// ProjId == 0 add     post
// ProjId != 0 update  put
export function saveProj (parameter) {
  return request({
    url: '/sqlaudit/project',
    method: parameter.projId === '' ? 'post' : 'put',
    data: parameter
  })
}

export function deleteProj (parameter) {
  return request({
    url: '/sqlaudit/project/' + parameter,
    method: 'delete',
    data: parameter
  })
}

export function saveProjResourceConfig (parameter) {
  return request({
    url: '/sqlaudit/project/resource/config',
    method: 'post',
    data: parameter
  })
}

export function getProjRoleList (parameter) {
  return request({
    url: '/sqlaudit/project/role',
    method: 'get',
    params: parameter
  })
}

export function getUserProjInfos (parameter) {
  return request({
    url: '/sqlaudit/project/user/' + parameter,
    method: 'get',
    params: parameter
  })
}

export function getProjDatasources (parameter) {
  return request({
    url: '/sqlaudit/project/datasource/' + parameter,
    method: 'get',
    params: parameter
  })
}
