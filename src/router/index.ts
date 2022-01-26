import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Gallery from '../views/Gallery.vue';
import Home from '../views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    redirect: '/rooms',
    component: Home,
    children: [
      {
        path: '/rooms',
        name: 'chat-list',
        component: async () => import('../views/ChatList.vue')
      },
      {
        path: '/gallery',
        name: 'Gallery',
        component: Gallery
      }
    ]
  },
  {
    path: '/popup/device-verification',
    name: 'verify-device',
    component: async () => import('../views/EmojiVerification.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: async () => import('../views/Login.vue')
  },
  {
    path: '/chat/:roomId',
    name: 'Chat',
    component: async () => import('../views/Chat.vue'),
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
