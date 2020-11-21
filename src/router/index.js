import Vue from 'vue';
import Router from 'vue-router';
import Layout from '@/views/index';

Vue.use(Router);

let constantRoutesTemp = [
  {
    path: '/reimbur',
    show: true,
    type: 1,
    component: Layout,
    meta: {
      title: '报销管理',
      icon: ''
    },
    redirect: '/reimbur/index',
    children: [
      {
        path: '/reimbur/index',
        type: 2,
        show: true,
        meta: {
          title: '我的报销',
          icon: ''
        },
        component: () => import('@/views/Reimbur/Index')
      },
      {
        path: '/reimbur/add',
        type: 2,
        show: true,
        meta: {
          title: '报销申请',
          icon: ''
        },
        component: () => import('@/views/Reimbur/add')
      },
      {
        path: '/reimbur/edit/:id',
        type: 2,
        show: false,
        meta: {
          title: '报销编辑',
          icon: ''
        },
        component: () => import('@/views/Reimbur/edit')
      }
    ]
  },
  {
    path: '*',
    redirect: '/reimbur/index'
  }
];

export const constantRoutes = constantRoutesTemp;

export default new Router({
  routes: constantRoutes,
  mode: 'hash'
});
