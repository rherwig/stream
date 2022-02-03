module.exports = {
    content: [
        './index.html',
        './src/**/*.{html,vue,js,ts}',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
