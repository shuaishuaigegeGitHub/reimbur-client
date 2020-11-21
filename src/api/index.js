import request from '../utils/request';

const ALL_USER_KEY = 'ALL_USER';

const ALL_DEPT_KEY = 'ALL_DEPT';

/**
 * 获取所有用户信息
 */
export const getAllUser = async () => {
  let data = sessionStorage.getItem(ALL_USER_KEY);
  if (data) {
    return JSON.parse(data);
  }
  const res = await request({
    url: '/api/permission/users'
  });
  data = res.data.map(item => {
    return {
      id: item.user_id,
      dept_id: item.dept_id,
      user_name: item.user_name,
      avatar: item.avatar
    };
  });
  sessionStorage.setItem(ALL_USER_KEY, JSON.stringify(data));
  return data;
};

/**
 * 获取所有部门的信息
 */
export const getAllDept = async () => {
  let data = sessionStorage.getItem(ALL_DEPT_KEY);
  if (data) {
    return JSON.parse(data);
  }
  const res = await request({
    url: '/api/permission/depts'
  });
  data = res.data
    .filter(item => {
      // NOTE: 这里不好整，只能怪做OA的咸鱼了。
      return item.dept_name.includes('部');
    })
    .map(item => {
      return {
        id: item.dept_id,
        dept_name: item.dept_name
      };
    });
  sessionStorage.setItem(ALL_DEPT_KEY, JSON.stringify(data));
  return data;
};
