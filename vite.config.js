import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        myRecipes: resolve(__dirname, 'my-recipes/index.html'),
        recipeAdd: resolve(__dirname, 'recipe-add.html'),
        recipeEdit: resolve(__dirname, 'recipe-edit.html'),
        register: resolve(__dirname, 'pages/register.html'),
        recipeDetails: resolve(__dirname, 'pages/recipe-details.html'),
        recipeForm: resolve(__dirname, 'pages/recipe-form.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
      },
    },
  },
  plugins: [
    {
      name: 'pretty-login-route',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/login') {
            req.url = '/login.html';
          } else if (req.url === '/dashboard') {
            req.url = '/dashboard.html';
          } else if (req.url === '/my-recipes') {
            req.url = '/my-recipes/';
          } else if (req.url === '/my-recipes/') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/recipe/add') {
            req.url = '/recipe-add.html';
          } else if (/^\/recipe\/[^/]+\/edit$/.test(req.url ?? '')) {
            req.url = '/recipe-edit.html';
          }

          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/login') {
            req.url = '/login.html';
          } else if (req.url === '/dashboard') {
            req.url = '/dashboard.html';
          } else if (req.url === '/my-recipes') {
            req.url = '/my-recipes/';
          } else if (req.url === '/my-recipes/') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/recipe/add') {
            req.url = '/recipe-add.html';
          } else if (/^\/recipe\/[^/]+\/edit$/.test(req.url ?? '')) {
            req.url = '/recipe-edit.html';
          }

          next();
        });
      },
    },
  ],
  server: {
    open: '/',
  },
});