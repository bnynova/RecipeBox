import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
          recipes: resolve(__dirname, 'recipes.html'),
          contacts: resolve(__dirname, 'contacts.html'),
          profile: resolve(__dirname, 'profile.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        myRecipes: resolve(__dirname, 'my-recipes/index.html'),
        recipeAdd: resolve(__dirname, 'recipe-add.html'),
        recipeEdit: resolve(__dirname, 'recipe-edit.html'),
        recipeDetails: resolve(__dirname, 'pages/recipe-details.html'),
        recipeForm: resolve(__dirname, 'pages/recipe-form.html'),
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
          } else if (req.url === '/admin') {
            req.url = '/pages/admin.html';
          } else if (req.url === '/recipes') {
            req.url = '/recipes.html';
          } else if (req.url === '/contacts') {
            req.url = '/contacts.html';
          } else if (req.url === '/profile') {
            req.url = '/profile.html';
          } else if (req.url === '/my-recipes') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/my-recipes/') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/recipe/add') {
            req.url = '/recipe-add.html';
          } else if (req.url === '/recipe/add/') {
            req.url = '/recipe-add.html';
          } else if (/^\/recipe\/([^/]+)\/edit$/.test(req.url ?? '')) {
            const match = req.url?.match(/^\/recipe\/([^/]+)\/edit$/);
            req.url = `/recipe-edit.html?id=${match?.[1] ?? ''}`;
          } else if (/^\/recipe\/([^/]+)\/edit\/$/.test(req.url ?? '')) {
            const match = req.url?.match(/^\/recipe\/([^/]+)\/edit\/$/);
            req.url = `/recipe-edit.html?id=${match?.[1] ?? ''}`;
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
          } else if (req.url === '/admin') {
            req.url = '/pages/admin.html';
          } else if (req.url === '/recipes') {
            req.url = '/recipes.html';
          } else if (req.url === '/contacts') {
            req.url = '/contacts.html';
          } else if (req.url === '/profile') {
            req.url = '/profile.html';
          } else if (req.url === '/my-recipes') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/my-recipes/') {
            req.url = '/my-recipes/index.html';
          } else if (req.url === '/recipe/add') {
            req.url = '/recipe-add.html';
          } else if (req.url === '/recipe/add/') {
            req.url = '/recipe-add.html';
          } else if (/^\/recipe\/([^/]+)\/edit$/.test(req.url ?? '')) {
            const match = req.url?.match(/^\/recipe\/([^/]+)\/edit$/);
            req.url = `/recipe-edit.html?id=${match?.[1] ?? ''}`;
          } else if (/^\/recipe\/([^/]+)\/edit\/$/.test(req.url ?? '')) {
            const match = req.url?.match(/^\/recipe\/([^/]+)\/edit\/$/);
            req.url = `/recipe-edit.html?id=${match?.[1] ?? ''}`;
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