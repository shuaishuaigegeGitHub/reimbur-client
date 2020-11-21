import Vue from 'vue';
import Router from 'vue-router';
import Layout from '@/views/index';

Vue.use(Router);

let constantRoutesTemp = [
  {
    path: '/dynamic',
    show: false,
    type: 1,
    component: Layout,
    meta: {
      title: '',
      icon: ''
    },
    children: [
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
    path: '/dynamic',
    show: false,
    type: 1,
    component: Layout,
    meta: {
      title: '',
      icon: ''
    },
    redirect: '',
    children: [
      {
        path: '/reimbur/index',
        type: 2,
        show: false,
        meta: {
          title: '我的报销',
          icon: ''
        },
        component: () => import('@/views/Reimbur/Index')
      },
      {
        path: '/reimbur/add',
        type: 2,
        show: false,
        meta: {
          title: '报销申请',
          icon: ''
        },
        component: () => import('@/views/Reimbur/add')
      }
    ]
  }
];

export const constantRoutes = constantRoutesTemp;

export default new Router({
  routes: constantRoutes,
  mode: 'hash'
});
