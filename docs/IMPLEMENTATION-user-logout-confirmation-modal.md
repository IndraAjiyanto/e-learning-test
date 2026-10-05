# Implementation Plan - User Logout Confirmation Modal

## 1. Berkas & Lokasi Perubahan

1. **Berkas Komponen Baru**:
   - `src/views/partials/components/ui/user/modal/logout_confirm/index.hbs`
   - Berisi markup modal Alpine.js mandiri dengan fungsi helper global `openLogoutModal(options)`.

2. **Berkas Modifikasi Template**:
   - `src/views/partials/user/shell_frame/index.hbs` (L93–98)
     - Ubah anchor `<a href="/logout">` menjadi `<button type="button" onclick="openLogoutModal()">`.
     - Sisipkan `{{> components/ui/user/modal/logout_confirm/index}}` di bagian bawah shell frame.
   - `src/views/user/user_profile/index.hbs` (L252–260 dan L374–383)
     - Ubah tombol mobile logout (L253) menjadi `<button type="button" onclick="openLogoutModal()">`.
     - Ubah tombol desktop sidebar logout (L375) menjadi `<button type="button" onclick="openLogoutModal()">`.
     - Sisipkan `{{> components/ui/user/modal/logout_confirm/index}}` di luar elemen wrapper interaktif.

---

## 2. Struktur Komponen Baru: `logout_confirm/index.hbs`

```html
{{!--
  Komponen: Logout Confirmation Modal (User)
  Lokasi: src/views/partials/components/ui/user/modal/logout_confirm/index.hbs
  Mengadopsi pola: components/ui/super_admin/modal/delete_confirm/index.hbs
--}}
<div
  x-data='logoutConfirmModal()'
  x-show='open'
  x-cloak
  @logout-confirm:open.window='show($event.detail)'
  @keydown.escape.window='close()'
  class='fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/70 p-4 backdrop-blur-[16px]'
  @click.self='close()'
>
  <div
    role='dialog'
    aria-modal='true'
    aria-labelledby='logout-confirm-modal-title'
    aria-describedby='logout-confirm-modal-description'
    @keydown.tab.prevent='cycleFocus($event)'
    class='flex w-full max-w-[400px] flex-col gap-8 rounded-xl bg-white p-6 shadow-[0px_8px_8px_-4px_rgba(0,0,0,0.03),0px_20px_24px_-4px_rgba(0,0,0,0.08)]'
  >
    <div class='flex flex-col items-center gap-5'>
      <span
        class='flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-8 border-[#FEF2F2] bg-[#FEE2E2] text-[#C0392B]'
      >
        <i class="fa-solid fa-arrow-right-from-bracket text-[20px]"></i>
      </span>

      <div class='flex flex-col items-center gap-2'>
        <h2
          id='logout-confirm-modal-title'
          class='text-center font-inter text-lg font-semibold leading-7 text-[#171717]'
          x-text='title'
        >{{default title 'Log Out'}}</h2>

        <p
          id='logout-confirm-modal-description'
          class='text-center font-inter text-sm font-normal leading-5 text-[#525252]'
          x-text='description'
        >{{default description 'Are you sure you want to log out?'}}</p>
      </div>
    </div>

    <div class='flex items-start gap-3'>
      <button
        type='button'
        x-ref='cancelButton'
        @click='close()'
        :disabled='submitting'
        class='inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-[#d4d4d4] bg-white px-[18px] py-2.5 font-inter text-base font-semibold leading-6 text-[#404040] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:border-[#a3a3a3] hover:bg-[#f5f5f5] active:bg-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#404040]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
        x-text='cancelLabel'
      >{{default cancelLabel 'Cancel'}}</button>

      <button
        type='button'
        x-ref='confirmButton'
        @click='confirm()'
        :disabled='submitting'
        class='inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-[#C0392B] bg-[#C0392B] px-[18px] py-2.5 font-inter text-base font-semibold leading-6 text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:border-[#a5311f] hover:bg-[#a5311f] active:bg-[#8e2a1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80'
        x-text='confirmLabel'
      >{{default confirmLabel 'Log Out'}}</button>
    </div>
  </div>
</div>

<script>
  function openLogoutModal(options = {}) {
    window.dispatchEvent(
      new CustomEvent('logout-confirm:open', { detail: options }),
    );
  }

  function logoutConfirmModal() {
    return {
      open: false,
      title: 'Log Out',
      description: 'Are you sure you want to log out?',
      confirmLabel: 'Log Out',
      cancelLabel: 'Cancel',
      logoutUrl: '/logout',
      lastTrigger: null,
      submitting: false,

      show(options = {}) {
        this.title = options.title || 'Log Out';
        this.description = options.description || 'Are you sure you want to log out?';
        this.confirmLabel = options.confirmLabel || 'Log Out';
        this.cancelLabel = options.cancelLabel || 'Cancel';
        this.logoutUrl = options.url || '/logout';
        this.lastTrigger = document.activeElement;
        this.submitting = false;
        this.open = true;
        document.body.classList.add('overflow-hidden');

        this.$nextTick(() => requestAnimationFrame(() => this.$refs.cancelButton?.focus()));
      },

      close() {
        if (!this.open || this.submitting) return;

        this.open = false;
        document.body.classList.remove('overflow-hidden');
        this.lastTrigger?.focus?.();
        this.lastTrigger = null;
      },

      confirm() {
        if (this.submitting) return;

        this.submitting = true;
        window.location.href = this.logoutUrl;
      },

      cycleFocus(event) {
        const order = [this.$refs.cancelButton, this.$refs.confirmButton];
        const current = order.indexOf(document.activeElement);
        const step = event.shiftKey ? -1 : 1;
        order[(current + step + order.length) % order.length]?.focus();
      },
    };
  }
</script>
```

---

## 3. Langkah Rinci Penerapan di Titik Pemanggil

1. **`src/views/partials/user/shell_frame/index.hbs`**:
   - Ganti elemen baris 94–97:
     ```html
     <button
       type="button"
       onclick="openLogoutModal()"
       aria-label="Log Out"
       title="Log Out"
       class="js-user-sidebar-item js-user-sidebar-logout-link rounded-lg flex items-center font-montserrat text-sm font-semibold leading-5 transition-colors cursor-pointer"
     >
       <span class="flex w-5 shrink-0 justify-center"><i class="fa-solid fa-arrow-right-from-bracket text-[18px]"></i></span>
       <span class="js-user-sidebar-label whitespace-nowrap">Log Out</span>
     </button>
     ```
   - Tambahkan include partial di baris penutup `shell_frame`:
     ```html
     {{> components/ui/user/modal/logout_confirm/index }}
     ```

2. **`src/views/user/user_profile/index.hbs`**:
   - Ganti elemen mobile nav baris 253–259:
     ```html
     <!-- Logout Button -->
     <button
       type="button"
       onclick="openLogoutModal()"
       class="shrink-0 rounded-lg border border-[#C0392B] px-5 py-2 text-sm font-semibold text-[#C0392B] transition hover:bg-[#fef2f2] cursor-pointer flex items-center gap-2.5 bg-white whitespace-nowrap font-montserrat"
     >
       <i class="fa-solid fa-arrow-right-from-bracket text-[18px] w-[18px] text-center"></i>
       <span>Log Out</span>
     </button>
     ```
   - Ganti elemen desktop sidebar baris 374–383:
     ```html
     <button
       type="button"
       onclick="openLogoutModal()"
       class="js-user-sidebar-item js-user-sidebar-logout-link rounded-lg transition-colors duration-150 flex items-center font-montserrat font-semibold leading-5 cursor-pointer"
     >
       <div class="w-5 flex justify-center items-center flex-shrink-0">
         <i class="fa-solid fa-arrow-right-from-bracket text-[18px]"></i>
       </div>
       <span class="js-user-sidebar-label whitespace-nowrap text-sm">Log Out</span>
     </button>
     ```
   - Tambahkan include partial di bagian bawah berkas:
     ```html
     {{> components/ui/user/modal/logout_confirm/index }}
     ```
