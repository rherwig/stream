import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';

const routes = [
    {
        name: 'home',
        path: '/',
        component: () => import('../pages/Home.vue'),
    },
    {
        name: 'broadcast',
        path: '/broadcast',
        component: () => import('../pages/Broadcast.vue'),
    },
    {
        name: 'watch',
        path: '/watch',
        component: () => import('../pages/Watch.vue'),
    },
];

const history = import.meta.env.SSR
    ? createMemoryHistory()
    : createWebHistory();

export default () => createRouter({
    history,
    routes,
});
