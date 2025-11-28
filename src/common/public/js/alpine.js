import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';

window.Alpine = Alpine;
Alpine.plugin(persist);
// Register a small global store for UI state (sidebar toggle, current page)
Alpine.store('ui', {
  sidebarToggle: false,
  page: '',
  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
  },
});
Alpine.start();

