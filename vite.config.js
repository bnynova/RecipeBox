import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'pages/index.html'),
        register: resolve(__dirname, 'pages/register.html'),
        login: resolve(__dirname, 'pages/login.html'),
        recipeDetails: resolve(__dirname, 'pages/recipe-details.html'),
        recipeForm: resolve(__dirname, 'pages/recipe-form.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
      },
    },
  },
  server: {
    open: '/pages/index.html',
  },
});