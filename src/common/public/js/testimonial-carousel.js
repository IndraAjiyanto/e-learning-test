/**
 * Testimonial Carousel Component Logic
 * Pure Vanilla JavaScript + Alpine.js integration for NestJS Handlebars (HBS)
 */

function testimonialCarousel(customData = []) {
  // Fallback testimonial data array
  const defaultTestimonials = [
    {
      id: 1,
      name: "John Calvin Sukarman",
      position: "Backend Developer",
      company: "PT. Wiratek Solusi Asia",
      photo: "https://ui-avatars.com/api/?name=John+Calvin&background=CBE8FA&color=003060",
      testimonial: "This bootcamp gave me more than just knowledge; I built a strong professional network. Collaborating with fellow participants on projects simulated the real-world dynamics of teamwork in the industry."
    },
    {
      id: 2,
      name: "Aqmal Miftahul Husna",
      position: "Quality Assurance (QA)",
      company: "Tech Corp Indonesia",
      photo: "https://ui-avatars.com/api/?name=Aqmal+Husna&background=CBE8FA&color=003060",
      testimonial: "The intensive guidance from industry mentors helped me transition smoothly into a QA career. The practical real-world case studies were invaluable."
    },
    {
      id: 3,
      name: "Saeful Haq Faruqi",
      position: "Frontend Developer",
      company: "PT. Bank SMBC",
      photo: "https://ui-avatars.com/api/?name=Saeful+Haq&background=CBE8FA&color=003060",
      testimonial: "Learning modern frontend frameworks and best practices at Kesatria Academy opened up incredible career opportunities for me in fintech."
    },
    {
      id: 4,
      name: "Jane Doe",
      position: "Data Scientist",
      company: "Global Tech Solutions",
      photo: "https://ui-avatars.com/api/?name=Jane+Doe&background=CBE8FA&color=003060",
      testimonial: "The curriculum is updated to match what companies are actually looking for. The career support team assisted me every step of the way until I got hired."
    },
    {
      id: 5,
      name: "Budi Santoso",
      position: "UI/UX Designer",
      company: "Creative Digital Studio",
      photo: "https://ui-avatars.com/api/?name=Budi+Santoso&background=CBE8FA&color=003060",
      testimonial: "Creating user-centered products through hands-on portfolio projects allowed me to showcase my skills to top employers with confidence."
    }
  ];

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
