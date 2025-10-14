// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'State Machine',
  tagline:
    'A lightweight, type-safe state machine library for JavaScript/TypeScript',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://jewel998.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/state-machine/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jewel998', // Usually your GitHub org/user name.
  projectName: 'state-machine', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-live-codeblock', '@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/jewel998/state-machine/tree/main/docs/',
          routeBasePath: '/docs', // Serve docs at /docs
          remarkPlugins: [],
          rehypePlugins: [],
        },
        blog: false, // Disable blog
        pages: {
          path: 'src/pages',
          routeBasePath: '/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        googleTagManager: {
          containerId: 'GTM-TZNKS634',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/logo.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'State Machine',
        logo: {
          alt: 'State Machine Logo',
          src: 'img/logo.png',
        },
        style: 'primary',
        hideOnScroll: false,
        items: [
          {
            to: '/',
            label: 'Home',
            position: 'left',
            activeBaseRegex: '^/$',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/docs/api',
            label: 'API Reference',
            position: 'left',
          },
          {
            type: 'search',
            position: 'right',
          },
          {
            href: 'https://github.com/jewel998/state-machine',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
          {
            href: 'https://www.npmjs.com/package/@jewel998/state-machine',
            position: 'right',
            className: 'header-npm-link',
            'aria-label': 'npm package',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/',
              },
              {
                label: 'API Reference',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/jewel998/state-machine/discussions',
              },
              {
                label: 'Issues',
                href: 'https://github.com/jewel998/state-machine/issues',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/jewel998/state-machine',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/@jewel998/state-machine',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} jewel998. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
          'bash',
          'json',
          'jsx',
          'tsx',
          'typescript',
          'javascript',
        ],
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
        options: {
          maxTextSize: 50000,
        },
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'T1JNYEGY93',
        // Public API key: it is safe to commit it
        apiKey: '0efcd2574db70e492cb6288232206360',
        indexName: 'state-machine-prod',
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push
        // externalUrlRegex: 'jewel998\\.github\\.io',
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },
        // Optional: Algolia search parameters
        searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: false,
      },
    }),
};

module.exports = config;
