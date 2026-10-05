import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';
import * as SessionUnlock from './sessionUnlock';
import { formatWa, waLink } from '../../helpers/wa.helper';

// Isomorphic WA helper — single source of truth (src/common/helpers/wa.helper.ts)
// SSR: Handlebars {{formatWa}}, CSR: $formatWa / window.formatWa
window.formatWa = formatWa;
window.waLink = waLink;

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
// Single source of truth for sequential session unlock logic — see
// PRD-sequential-session-unlock.md. Shared by every page that renders
// session/attendance/start-learning lock state.
Alpine.store('sessionUnlock', SessionUnlock);
Alpine.magic('formatWa', () => formatWa);
Alpine.magic('waLink', () => waLink);
Alpine.start();
