import { renderToString } from '@vue/server-renderer';

import registerSocket from './socket';
import createApp from '@/index';

const render = async (url: string) => {
    const { app, router } = createApp();
    const context = {};

    await router.push(url);
    await router.isReady();

    const markup = await renderToString(app, context);
    const initialState = {};

    return {
        markup,
        initialState,
    };
};

export {
    render,
    registerSocket,
};
