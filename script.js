// ReferVo Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // Navigation scroll effect
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        item.classList.toggle('active');
      });
    }
  });

  // Scroll animations
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => observer.observe(el));

  // Staggered animation for grid items
  const staggeredGrids = document.querySelectorAll('.features-grid, .steps, .trust-stats');
  
  staggeredGrids.forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
      item.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // Contact form handling
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      // Simple validation
      const requiredFields = ['name', 'email', 'message'];
      let isValid = true;
      
      requiredFields.forEach(field => {
        const input = contactForm.querySelector(`[name="${field}"]`);
        if (!data[field] || data[field].trim() === '') {
          input.style.borderColor = '#ef4444';
          isValid = false;
        } else {
          input.style.borderColor = '';
        }
      });
      
      if (isValid) {
        // Show success message (in production, send to server)
        const btn = contactForm.querySelector('.btn');
        const originalText = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = '#22c55e';
        btn.disabled = true;
        
        // Reset form
        setTimeout(() => {
          contactForm.reset();
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const offset = 100;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Number counter animation for stats
  const animateCounters = () => {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
      if (stat.dataset.animated) return;
      
      const target = stat.textContent;
      const number = parseInt(target.replace(/[^0-9]/g, ''));
      const suffix = target.replace(/[0-9]/g, '');
      const duration = 2000;
      const step = number / (duration / 16);
      let current = 0;
      
      stat.dataset.animated = 'true';
      
      const updateNumber = () => {
        current += step;
        if (current < number) {
          stat.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(updateNumber);
        } else {
          stat.textContent = target;
        }
      };
      
      updateNumber();
    });
  };

  // Trigger counter animation when stats section is visible
  const statsSection = document.querySelector('.trust-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
  }
});