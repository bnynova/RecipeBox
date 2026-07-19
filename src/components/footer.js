/**
 * Create the shared page footer.
 */
export function createFooter() {
  return `
    <footer class="app-footer border-top mt-5 py-4">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <p class="mb-0 text-secondary">RecipeBox</p>
        <p class="mb-0 text-secondary">Built with Bootstrap 5 and Vite.</p>
      </div>
    </footer>
  `;
}