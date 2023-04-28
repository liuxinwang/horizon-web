import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          storage.set(ACCESS_TOKEN, 'Bearer ' + response.token, new Date(response.expire).getTime())
          commit('SET_TOKEN', 'Bearer ' + response.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const result = response.data
          if (result.user.userName !== '') {
            commit('SET_INFO', result.user)
          } else {
            reject(new Error('getInfo: User doesn\'t exist !'))
          }
          /**
          const role = {
            'id': 'admin',
            'name': '管理员',
            'describe': '拥有所有权限',
            'status': 1,
            'creatorId': 'system',
            'createTime': 1497160610259,
            'deleted': 0,
            'permissions': [{
              'roleId': 'admin',
              'permissionId': 'instance',
              'permissionName': '实例管理',
              'actions': '[]',
              'actionEntitySet': [],
              'actionList': null,
              'dataAccess': null
            },
            {
              'roleId': 'admin',
              'permissionId': 'instanceList',
              'permissionName': '实例管理-列表',
              'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"edit","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
              'actionEntitySet': [{
                'action': 'add',
                'describe': '新增',
                'defaultCheck': false
              },
              {
                'action': 'query',
                'describe': '查询',
                'defaultCheck': false
              },
              {
                'action': 'get',
                'describe': '详情',
                'defaultCheck': false
              },
              {
                'action': 'edit',
                'describe': '修改',
                'defaultCheck': false
              },
              {
                'action': 'delete',
                'describe': '删除',
                'defaultCheck': false
              }],
              'actionList': ['add', 'delete', 'edit'],
              'dataAccess': null
            },
            {
              'roleId': 'admin',
              'permissionId': 'InstanceInspection',
              'permissionName': '实例管理-巡检',
              'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"edit","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
              'actionEntitySet': [{
                'action': 'add',
                'describe': '新增',
                'defaultCheck': false
              },
              {
                'action': 'query',
                'describe': '查询',
                'defaultCheck': false
              },
              {
                'action': 'get',
                'describe': '详情',
                'defaultCheck': false
              },
              {
                'action': 'edit',
                'describe': '修改',
                'defaultCheck': false
              },
              {
                'action': 'delete',
                'describe': '删除',
                'defaultCheck': false
              }
              ],
              'actionList': ['query', 'get', 'edit', 'delete'],
              'dataAccess': null
            },
            {
              'roleId': 'admin',
              'permissionId': 'system',
              'permissionName': '系统管理',
              'actions': '[]',
              'actionEntitySet': [],
              'actionList': null,
              'dataAccess': null
            },
            {
              'roleId': 'admin',
              'permissionId': 'SystemUser',
              'permissionName': '用户管理',
              'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"edit","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
              'actionEntitySet': [{
                'action': 'add',
                'describe': '新增',
                'defaultCheck': false
              },
              {
                'action': 'get',
                'describe': '详情',
                'defaultCheck': false
              },
              {
                'action': 'edit',
                'describe': '修改',
                'defaultCheck': false
              },
              {
                'action': 'delete',
                'describe': '删除',
                'defaultCheck': false
              }
              ],
              'actionList': ['add', 'get', 'edit', 'delete'],
              'dataAccess': null
            },
            {
              'roleId': 'admin',
              'permissionId': 'SystemRole',
              'permissionName': '角色管理',
              'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"edit","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
              'actionEntitySet': [{
                'action': 'add',
                'describe': '新增',
                'defaultCheck': false
              },
              {
                'action': 'get',
                'describe': '详情',
                'defaultCheck': false
              },
              {
                'action': 'edit',
                'describe': '修改',
                'defaultCheck': false
              },
              {
                'action': 'delete',
                'describe': '删除',
                'defaultCheck': false
              }
              ],
              'actionList': ['add', 'get', 'edit', 'delete'],
              'dataAccess': null
            }
            ]
          } */
          commit('SET_ROLES', result.role)
          commit('SET_NAME', { name: result.user.userName, welcome: welcome() })
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user
