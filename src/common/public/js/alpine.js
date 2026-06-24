import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';

window.Alpine = Alpine;
Alpine.plugin(collapse);
// Register a small global store for UI state (sidebar toggle, current page)
Alpine.store('ui', {
  sidebarToggle: false,
  page: '',
  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
  },
});
Alpine.start();
