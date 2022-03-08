import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home'
import LogIn from './LogIn'
import SignUp from './SignUp'
import MyAccount from './MyAccount'
import Settings from './Settings'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/login',
      component: LogIn
    },
    {
      path: '/signup',
      component: SignUp
    },
    {
      path:'/myaccount',
      component: MyAccount
    },
    {
      path:'/settings',
      component: Settings
    }
  ]
})
