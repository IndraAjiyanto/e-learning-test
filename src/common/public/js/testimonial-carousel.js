/**
 * Testimonial Carousel Component Logic
 * Pure Vanilla JavaScript + Alpine.js integration for NestJS Handlebars (HBS)
 */

// Fallback testimonial data (dipakai testimonialCarousel & alumniGrid)
const defaultTestimonials = [
    {
      id: 1,
      name: "Aqmal Miftahul Husna",
      position: "Quality Assurance (QA)",
      company: "Frontend Developer",
      photo: "/public/image/alumni/aqmal.png",
      testimonial: "Continue to foster a culture of mentorship that is humble yet critical. Mentors who can position themselves as learning partners are this bootcamp's greatest asset."
    },
    {
      id: 2,
      name: "Ikhwan Nur Rizki Fathama",
      position: "Backend Developer",
      company: "Frontend Developer",
      photo: "/public/image/alumni/ikhwan.png",
      testimonial: "I learned a lot about how to communicate effectively within a tech team and how to manage expectations in projects. The soft skills and work ethics covered in the program are highly relevant to today's workplace needs."
    },
    {
      id: 3,
      name: "John Calvin Sukarman",
      position: "Backend Developer at PT. Wiratek Solusi Asia",
      company: "Frontend Developer",
      photo: "/public/image/alumni/john.png",
      testimonial: "This bootcamp gave me more than just knowledge; I built a strong professional network. Collaborating with fellow participants on projects simulated the real-world dynamics of teamwork in the industry."
    },
    {
      id: 4,
      name: "Saeful Haq Faruqi",
      position: "Frontend Developer",
      company: "Frontend Developer",
      photo: "/public/image/orang.png",
      testimonial: "Learning modern frontend frameworks and best practices at Kesatria Academy opened up incredible career opportunities for me in fintech."
    },
    {
      id: 5,
      name: "Jane Doe",
      position: "Data Scientist",
      company: "Frontend Developer",
      photo: "/public/image/orang.png",
      testimonial: "The curriculum is updated to match what companies are actually looking for. The career support team assisted me every step of the way until I got hired."
    }
];

function testimonialCarousel(customData = []) {
  return {
    testimonials: Array.isArray(customData) && customData.length > 0 ? customData : defaultTestimonials,
    active: 0,
    timer: null,

    get total() {
      return this.testimonials.length;
    },

    get maxIndex() {
      return this.total - 1;
    },

    init() {
      this.startAutoSlide();
    },

    startAutoSlide() {
      this.stopAutoSlide();
      this.timer = setInterval(() => {
        // Infinite auto-slide loop
        this.active = (this.active + 1) % this.total;
      }, 5000);
    },

    stopAutoSlide() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    resetAutoSlide() {
      this.startAutoSlide();
    },

    next() {
      if (this.active < this.maxIndex) {
        this.active++;
        this.resetAutoSlide();
      }
    },

    prev() {
      if (this.active > 0) {
        this.active--;
        this.resetAutoSlide();
      }
    },

    goTo(index) {
      if (index >= 0 && index < this.total) {
        this.active = index;
        this.resetAutoSlide();
      }
    },

    isCenter(index) {
      return index === this.active;
    },

    // 2-way physical swipe-swap logic:
    // Blue dot moves right to target slot, target gray dot moves left to vacated slot
    getDotOffset(index) {
      const step = 36; // 20px dot width + 16px gap
      if (index === 0) {
        return this.active * step;
      } else if (index <= this.active) {
        return -step;
      } else {
        return 0;
      }
    },

    getDotClass(index) {
      return index === 0 ? 'bg-[#003060] z-10 shadow-sm' : 'bg-[#D9D9D9] hover:bg-[#CCCCCC] z-0';
    }
  };
}

/**
 * Alumni Grid Component Logic (Figma "testimonials-section")
 * Menampilkan alumni dalam grid 3 kolom (desktop) / 1 kolom (mobile)
 * dengan pagination prev-next + dots.
 */
function alumniGrid(customData = []) {
  return {
    items: Array.isArray(customData) && customData.length > 0 ? customData : defaultTestimonials,
    page: 0,
    perPage: 3,
    timer: null,

    init() {
      this.syncPerPage();
      this._onResize = () => this.syncPerPage();
      window.addEventListener('resize', this._onResize);
      this.startAutoSlide();
    },

    destroy() {
      window.removeEventListener('resize', this._onResize);
      this.stopAutoSlide();
    },

    syncPerPage() {
      const next = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      if (next !== this.perPage) {
        this.perPage = next;
        this.page = Math.min(this.page, this.totalPages - 1);
      }
    },

    get totalPages() {
      return Math.max(1, Math.ceil(this.items.length / this.perPage));
    },

    get visible() {
      return this.items.slice(this.page * this.perPage, this.page * this.perPage + this.perPage);
    },

    startAutoSlide() {
      this.stopAutoSlide();
      if (this.totalPages <= 1) return;
      this.timer = setInterval(() => {
        this.page = (this.page + 1) % this.totalPages;
      }, 6000);
    },

    stopAutoSlide() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    next() {
      this.page = (this.page + 1) % this.totalPages;
      this.startAutoSlide();
    },

    prev() {
      this.page = (this.page - 1 + this.totalPages) % this.totalPages;
      this.startAutoSlide();
    },

    goTo(index) {
      if (index >= 0 && index < this.totalPages) {
        this.page = index;
        this.startAutoSlide();
      }
    }
  };
}

/**
 * Alumni Deck - 1-step carousel with a raised centre card (Figma testimonials-section).
 * Shows  cards (3 lg / 2 sm / 1 mobile); prev/next advance by ONE card.
 */
function alumniDeck(customData = []) {
  return {
    items: Array.isArray(customData) && customData.length > 0 ? customData : defaultTestimonials,
    active: 0,
    per: 3,
    _t: null,
    _onResize: null,
    get maxActive() { return Math.max(0, this.items.length - this.per); },
    get dots() { return this.maxActive + 1; },
    get centerIndex() { return this.active + Math.floor(this.per / 2); },
    init() {
      this._sync();
      this._onResize = () => this._sync();
      window.addEventListener('resize', this._onResize);
      this._auto();
    },
    destroy() {
      window.removeEventListener('resize', this._onResize);
      if (this._t) clearInterval(this._t);
    },
    _sync() {
      const n = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      if (n !== this.per) this.per = n;
      if (this.active > this.maxActive) this.active = this.maxActive;
    },
    _auto() {
      if (this._t) clearInterval(this._t);
      if (this.dots <= 1) return;
      this._t = setInterval(() => this.next(), 6000);
    },
    next() { this.active = this.active >= this.maxActive ? 0 : this.active + 1; this._auto(); },
    prev() { this.active = this.active <= 0 ? this.maxActive : this.active - 1; this._auto(); },
    goTo(i) { this.active = Math.max(0, Math.min(i, this.maxActive)); this._auto(); }
  };
}
