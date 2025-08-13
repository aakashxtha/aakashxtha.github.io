// Year in footer
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize particle system
  initParticleSystem();
  
  // Initialize kinetic typography
  initKineticText();



  // Smooth scroll (native behavior via CSS, but ensure offset behavior on Safari)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Advanced reveal-on-scroll animations using IntersectionObserver
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Calculate stagger delay based on element position (no special delay for project cards)
        const delay = entry.target.dataset.delay || 
                     (entry.target.closest('.skills-grid') ? index * 100 : 0);
        
        setTimeout(() => {
          entry.target.classList.add('visible');
          
          // Add special entrance animations (projects use default)
          if (entry.target.classList.contains('timeline-item')) {
            entry.target.style.transform = 'translateX(0) scale(1)';
          }
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
  
  // Set initial animation states
  revealEls.forEach((el, index) => {
    if (el.classList.contains('timeline-item')) {
      el.style.transform = 'translateX(-30px) scale(0.95)';
    }
    
    // Add stagger delays for grid items
    if (el.closest('.skills-grid')) {
      el.dataset.delay = (index % 4) * 100; // 4-column grid stagger
    }
    
    observer.observe(el);
  });

  // Ensure hero content is visible on load (fallback)
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('visible'));
  }, 150);

  // Animate skill meters when they enter view
  const meters = document.querySelectorAll('.meter');
  const meterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const span = e.target.querySelector('span');
        const pct = e.target.getAttribute('data-progress') || '0';
        if (span) span.style.width = pct + '%';
        meterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  meters.forEach(m => meterObserver.observe(m));

  // Scroll progress bar
  const progress = document.querySelector('.scroll-progress span');
  if (progress) {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Elevate header when scrolled
  const header = document.querySelector('.site-header');
  const toggleHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', toggleHeader, { passive: true });
  toggleHeader();

  // Parallax for hero floating shapes
  document.querySelectorAll('.shape[data-parallax]').forEach(el => {
    const strength = parseFloat(el.getAttribute('data-parallax') || '0.1');
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * strength;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    }, { passive: true });
  });

  // Scrollspy for nav
  const navLinks = Array.from(document.querySelectorAll('a[data-nav]'));
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = () => {
    let current = sections[0];
    const midpoint = window.scrollY + window.innerHeight / 3;
    sections.forEach(sec => {
      if (sec.offsetTop <= midpoint) current = sec;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  // Cursor dot follow
  const dot = document.getElementById('cursor-dot');
  if (dot) {
    // Disabled for now to avoid visual interference; keep code for optional re-enable
  }

  // Minimal, performant canvas background (few moving points and lines)
  // Remove dark canvas network for light theme

  // Enhanced form validation and submission
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');

  if (form) {
    // Real-time validation
    const fields = ['name', 'email', 'message'];
    fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      const error = document.getElementById(`${fieldName}-error`);
      
      if (field && error) {
        field.addEventListener('blur', () => validateField(fieldName, field, error));
        field.addEventListener('input', () => {
          if (field.classList.contains('error')) {
            validateField(fieldName, field, error);
          }
        });
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate all fields
      let isValid = true;
      fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const error = document.getElementById(`${fieldName}-error`);
        if (field && error) {
          if (!validateField(fieldName, field, error)) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        showStatus('Please fix the errors above.', 'error');
        return;
      }

      // Show loading state
      setButtonLoading(true);
      showStatus('Sending your message...', 'info');

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
          form.reset();
          // Clear validation states
          fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
              field.classList.remove('success', 'error');
            }
          });
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        showStatus('Sorry, there was an error sending your message. Please try again or email me directly.', 'error');
      } finally {
        setButtonLoading(false);
      }
    });
  }

  function validateField(fieldName, field, errorEl) {
    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';

    // Clear previous states
    field.classList.remove('error', 'success');
    errorEl.classList.remove('show');

    if (!value) {
      errorMsg = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
      isValid = false;
    } else if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMsg = 'Please enter a valid email address.';
        isValid = false;
      }
    } else if (fieldName === 'message' && value.length < 10) {
      errorMsg = 'Message must be at least 10 characters long.';
      isValid = false;
    }

    if (isValid) {
      field.classList.add('success');
    } else {
      field.classList.add('error');
      errorEl.textContent = errorMsg;
      errorEl.classList.add('show');
    }

    return isValid;
  }

  function setButtonLoading(loading) {
    if (submitBtn && btnText && btnLoading) {
      if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
      } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
      }
    }
  }

  function showStatus(message, type) {
    if (status) {
      status.textContent = message;
      status.className = `show ${type}`;
      
      // Auto-hide info messages after 5 seconds
      if (type === 'info') {
        setTimeout(() => {
          status.classList.remove('show');
        }, 5000);
      }
    }
  }
});

// Particle System Implementation
function initParticleSystem() {
  const particleSystem = document.getElementById('particle-system');
  if (!particleSystem) return;

  const particleCount = 15;
  
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random horizontal position
    const startX = Math.random() * window.innerWidth;
    particle.style.left = startX + 'px';
    
    // Random size variations
    const size = Math.random() * 3 + 2; // 2-5px
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random animation delay
    const delay = Math.random() * 15;
    particle.style.animationDelay = `-${delay}s`;
    
    particleSystem.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 25000);
  }
  
  // Create initial particles
  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => createParticle(), i * 1000);
  }
  
  // Continuously create new particles
  setInterval(createParticle, 2000);
}

// Kinetic Typography Implementation
function initKineticText() {
  const kineticElements = document.querySelectorAll('.kinetic-text');
  
  kineticElements.forEach(element => {
    const text = element.getAttribute('data-text') || element.textContent;
    element.innerHTML = '';
    
    // Split text into individual letters and spaces
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      element.appendChild(span);
    });
    
    // Trigger animation after a delay
    setTimeout(() => {
      element.classList.add('animate');
    }, 500);
  });
}




