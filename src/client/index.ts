import createApp from '@/index';

const { app, router } = createApp();

(async () => {
    await router.isReady();

    app.mount('#vue-root');
})();
