//READ THIS FIRST
// https://github.com/tailwindlabs/tailwindcss/issues/2831#issuecomment-731038281 //

const colors = require('tailwindcss/colors');

module.exports = {
    purge: ['./src/**/*.html', './src/**/*.jsx', './src/**/*.js'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            screens: {
                //BEGIN: Keeping in sync with ANTD
                sm: '576px',
                md: '768px',
                lg: '992px',
                xl: '1200px',
                '2xl': '1600px',
                xxl: '1600px',
                //END: Keeping in sync with ANTD

                //BEGIN: sample: more verbose names
                tablet: '640px',
                // => @media (min-width: 640px) { ... }

                laptop: '1024px',
                // => @media (min-width: 1024px) { ... }

                desktop: '1280px',
                // => @media (min-width: 1280px) { ... }
                //END: sample: more verbose names
            },
            colors: {
                primary_body: '#f2f6fa',
                primary_header: '#242934',
                primary_link: '#018ccf',
            },
        },
        colors: {
            coolGray: colors.coolGray,
            blue: colors.blue,
            green: colors.green,
            red: colors.red,
            yellow: colors.yellow,
            white: colors.white,
            black: colors.black,
        },
        fontFamily: {
            sans: [
                'Gilroy',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Roboto',
                'Helvetica Neue',
                'Arial',
                'Noto Sans',
                'sans-serif',
                'Apple Color Emoji',
                'Segoe UI Emoji',
                'Segoe UI Symbol',
                'Noto Color Emoji',
            ],
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
