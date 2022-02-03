const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { resolve } = require('path');
const { readFileSync } = require('fs');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const root = resolve(__dirname);

/**
 * Configures the environment for development, using vite as a middleware for bundling and hot-reloading.
 *
 * @param app
 * @return {Promise<{handler: ((function(*, *): Promise<*|undefined>)|*), vite: ViteDevServer}>}
 */
const configureDevelopment = async (app) => {
    const vite = await require('vite').createServer({
        root,
        logLevel: 'info',
        server: {
            middlewareMode: true,
            watch: {
                usePolling: true,
                interval: 100,
            },
        },
    });

    const { render, registerSocket } = await vite.ssrLoadModule('/src/server/index');

    const handler = async (req, res) => {
        const url = req.originalUrl;
        const manifest = {};

        try {
            const template = await vite.transformIndexHtml(url, readFileSync(resolve(root, 'index.html'), 'utf-8'));
            const { markup, initialState } = await render(url, manifest);
            const document = template
                .replace('<!--ssr-root-->', markup)
                .replace('<!--initial-state-->', JSON.stringify(initialState));

            return res.status(200).set({ 'Content-Type': 'text/html' }).end(document);
        } catch (error) {
            vite.ssrFixStacktrace(error);
            console.error(error.stack);

            return res.status(500).end(error.stack);
        }
    };

    app.use(vite.middlewares);

    return {
        handler,
        registerSocket,
        vite,
    };
};

/**
 * Configures the environment for use in production.
 *
 * @param app
 * @return {Promise<{handler: ((function(*, *): Promise<*|undefined>)|*)}>}
 */
const configureProduction = async (app) => {
    app.use(require('serve-static')(resolve(__dirname, 'dist/client'), {
        index: false,
    }));

    const { render, registerSocket } = require('./dist/server/index');

    const handler = async (req, res) => {
        const url = req.originalUrl;

        try {
            const template = readFileSync(resolve(__dirname, 'dist/client/index.html'), 'utf-8');
            const { markup, initialState } = await render(url);
            const document = template
                .replace('<!--ssr-root-->', markup)
                .replace('<!--initial-state-->', JSON.stringify(initialState));

            return res.status(200).set({ 'Content-Type': 'text/html' }).end(document);
        } catch (error) {
            return res.status(500).end(error.message);
        }
    };

    return {
        handler,
        registerSocket,
    };
};

(async () => {
    const app = express();
    const server = http.createServer(app);
    const io = new socketIo.Server(server, {
        serveClient: false,
    });

    const { handler, registerSocket } = isProduction
        ? await configureProduction(app)
        : await configureDevelopment(app);

    app.set('port', process.env.PORT || 3000);
    app.use('*', handler);

    registerSocket(io);

    server.listen(app.get('port'), () => {
        console.info(`Server listening on port ${app.get('port')}...`);
    });

    process.on('SIGTERM', () => {
        server.close(() => {
            console.info('Server closed.');
        });
    });
})();
