class ScrollAnimator {
  constructor() {
    this.observers = new Map();
    this.animationTypes = {
      'fade-up': {
        in: (el) => this.fadeUpIn(el),
        out: (el) => this.fadeUpOut(el),
      },
      'fade-in': {
        in: (el) => this.fadeIn(el),
        out: (el) => this.fadeOut(el),
      },
      'slide-left': {
        in: (el) => this.slideLeftIn(el),
        out: (el) => this.slideLeftOut(el),
      },
      'slide-right': {
        in: (el) => this.slideRightIn(el),
        out: (el) => this.slideRightOut(el),
      },
      'scale-up': {
        in: (el) => this.scaleUpIn(el),
        out: (el) => this.scaleUpOut(el),
      },
      'fade-down': {
        in: (el) => this.fadeDownIn(el),
        out: (el) => this.fadeDownOut(el),
      },
      'rotate-in': {
        in: (el) => this.rotateIn(el),
        out: (el) => this.rotateOut(el),
      },
      'flip-x': {
        in: (el) => this.flipXIn(el),
        out: (el) => this.flipXOut(el),
      },
      'flip-y': {
        in: (el) => this.flipYIn(el),
        out: (el) => this.flipYOut(el),
      },
      'zoom-in': {
        in: (el) => this.zoomIn(el),
        out: (el) => this.zoomOut(el),
      },
    };
    this.init();
  }

  init() {
    Object.keys(this.animationTypes).forEach((type) => {
      this.observers.set(
        type,
        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.animationTypes[type].in(entry.target);
              } else {
                this.animationTypes[type].out(entry.target);
              }
            });
          },
          {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px',
          },
        ),
      );
    });
  }

  // Animation methods
  fadeUpIn(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0) scale(1)';
    element.classList.add('animated-in');
  }

  fadeUpOut(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px) scale(0.95)';
    element.classList.remove('animated-in');
  }

  fadeIn(element) {
    element.style.opacity = '1';
    element.classList.add('animated-in');
  }

  fadeOut(element) {
    element.style.opacity = '0';
    element.classList.remove('animated-in');
  }

  slideLeftIn(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateX(0)';
    element.classList.add('animated-in');
  }

  slideLeftOut(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(100px)';
    element.classList.remove('animated-in');
  }

  slideRightIn(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateX(0)';
    element.classList.add('animated-in');
  }

  slideRightOut(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(-100px)';
    element.classList.remove('animated-in');
  }

  scaleUpIn(element) {
    element.style.opacity = '1';
    element.style.transform = 'scale(1)';
    element.classList.add('animated-in');
  }

  scaleUpOut(element) {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.8)';
    element.classList.remove('animated-in');
  }

  fadeDownIn(el) {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }
  fadeDownOut(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-50px)';
  }

  rotateIn(el) {
    el.style.opacity = '1';
    el.style.transform = 'rotate(0deg)';
  }
  rotateOut(el) {
    el.style.opacity = '0';
    el.style.transform = 'rotate(-15deg)';
  }

  flipXIn(el) {
    el.style.opacity = '1';
    el.style.transform = 'rotateX(0deg)';
  }
  flipXOut(el) {
    el.style.opacity = '0';
    el.style.transform = 'rotateX(90deg)';
  }

  flipYIn(el) {
    el.style.opacity = '1';
    el.style.transform = 'rotateY(0deg)';
  }
  flipYOut(el) {
    el.style.opacity = '0';
    el.style.transform = 'rotateY(90deg)';
  }

  zoomIn(el) {
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  }
  zoomOut(el) {
    el.style.opacity = '0';
    el.style.transform = 'scale(0.5)';
  }

  observeElement(element) {
    const animationType = element.dataset.animate || 'fade-up';
    const delay = element.dataset.delay || 0;

    this.setInitialState(element, animationType);

    element.style.transition = `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;

    const observer = this.observers.get(animationType);
    if (observer) {
      observer.observe(element);
    }
  }

  setInitialState(element, type) {
    const initialState = {
      'fade-up': () => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px) scale(0.95)';
      },
      'fade-in': () => {
        element.style.opacity = '0';
      },
      'slide-left': () => {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100px)';
      },
      'slide-right': () => {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-100px)';
      },
      'scale-up': () => {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
      },
      'fade-down': () => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-50px)';
      },
      'rotate-in': () => {
        element.style.opacity = '0';
        element.style.transform = 'rotate(-15deg)';
      },
      'flip-x': () => {
        element.style.opacity = '0';
        element.style.transform = 'rotateX(90deg)';
      },
      'flip-y': () => {
        element.style.opacity = '0';
        element.style.transform = 'rotateY(90deg)';
      },
      'zoom-in': () => {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5)';
      },
    };

    const setState = initialState[type] || initialState['fade-up'];
    setState();
  }

  initAll() {
    document.querySelectorAll('[data-animate]').forEach((element) => {
      this.observeElement(element);
    });
  }

  // Method untuk stagger animations
  initStagger(container) {
    const children = container.querySelectorAll('[data-stagger-item]');
    children.forEach((child, index) => {
      child.setAttribute('data-animate', 'fade-up');
      child.setAttribute('data-delay', (index * 100).toString());
      this.observeElement(child);
    });
  }
}

// Initialize globally
window.ScrollAnimator = ScrollAnimator;
