// ===== Main JavaScript for Aakash Shrestha's Portfolio =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initLoader();
    initNavigation();
    initMolecularBackground();
    initProteinVisualization();
    initScrollReveal();
    initHoverEffects();
    initContactForm();
    initBackToTop();
    init3DHover();
    initCursorFollower();
});

// ===== Loader Animation =====
function initLoader() {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    const progressBar = document.querySelector('.loader-progress-bar');
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Fade out loader after a short delay
            setTimeout(() => {
                loaderWrapper.style.opacity = '0';
                loaderWrapper.style.visibility = 'hidden';
                
                // Trigger entrance animations
                document.querySelectorAll('.fade-in, .fade-in-delayed').forEach(el => {
                    el.style.opacity = '1';
                });
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
    }, 150);
    
    // Fallback to ensure loader disappears even if there's an error
    setTimeout(() => {
        if (loaderWrapper.style.opacity !== '0') {
            loaderWrapper.style.opacity = '0';
            loaderWrapper.style.visibility = 'hidden';
        }
    }, 4000);
}

// ===== Navigation Functionality =====
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Handle header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Close mobile menu if open
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Smooth scroll to section
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#') && targetId !== '#') {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = header.offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== Molecular Background Animation =====
function initMolecularBackground() {
    const canvas = document.getElementById('molecular-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(${Math.floor(Math.random() * 50 + 70)}, ${Math.floor(Math.random() * 50 + 70)}, ${Math.floor(Math.random() * 150 + 100)}, ${Math.random() * 0.5 + 0.2})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Bounce off edges
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Connection class for lines between particles
    class Connection {
        static draw(p1, p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
            }
        }
    });
    
    // Data flow background for Contact section
    createBackgroundEffect('.data-flow-bg', (ctx, width, height) => {
        const particleCount = Math.floor(width * height / 15000);
        const particles = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                speedX: -Math.random() * 3 - 1,
                speedY: Math.random() * 1 - 0.5,
                color: `rgba(99, 102, 241, ${Math.random() * 0.2 + 0.1})`
            });
        }
        
        // Draw particles
        for (const particle of particles) {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Helper function to draw a hexagon
function drawHexagon(ctx, x, y, size) {
    const angles = [];
    for (let i = 0; i < 6; i++) {
        angles.push(i * Math.PI / 3);
    }
    
    ctx.beginPath();
    ctx.moveTo(x + size * Math.cos(angles[0]), y + size * Math.sin(angles[0]));
    
    for (let i = 1; i < 6; i++) {
        ctx.lineTo(x + size * Math.cos(angles[i]), y + size * Math.sin(angles[i]));
    }
    
    ctx.closePath();
    ctx.stroke();
}

// Call the section backgrounds initialization
document.addEventListener('DOMContentLoaded', initSectionBackgrounds);

// ===== Form Label Animation =====
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        // Check if input already has content on page load
        if (input.value.trim() !== '') {
            input.classList.add('has-value');
        }
        
        // Add event listeners
        input.addEventListener('focus', () => {
            input.classList.add('has-value');
        });
        
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.classList.remove('has-value');
            }
        });
    });
});

// ===== Particles Animation for Hero Section =====
function initHeroParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    
    const particleCount = 50;
    const particles = [];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 20 + 10;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Add particle to container
        container.appendChild(particle);
        particles.push(particle);
    }
    
    // Add CSS for particles
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            background-color: rgba(129, 140, 248, 0.7);
            border-radius: 50%;
            pointer-events: none;
            animation: float-particle linear infinite;
        }
        
        @keyframes float-particle {
            0% {
                transform: translate(0, 0);
            }
            100% {
                transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100 + 50}px, ${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100 + 50}px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Call hero particles initialization
document.addEventListener('DOMContentLoaded', initHeroParticles);

// ===== Smooth Scrolling =====
function initSmoothScroll() {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize smooth scrolling
document.addEventListener('DOMContentLoaded', initSmoothScroll);

// ===== Typed.js Animation =====
// This is a fallback implementation if you don't want to load the Typed.js library
function initTypedEffect() {
    const element = document.querySelector('.gradient-text');
    if (!element) return;
    
    const texts = [
        'Biomedical Engineer',
        'Computational Biologist',
        'Protein Engineer',
        'Molecular Modeler'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Deleting text
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Faster when deleting
        } else {
            // Typing text
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal speed when typing
        }
        
        // If completed typing current text
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            // Pause before starting new text
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing effect with a delay
    setTimeout(type, 1000);
}

// Uncomment this line if you want to use the basic typing effect
// document.addEventListener('DOMContentLoaded', initTypedEffect);

// ===== Preload Critical Images =====
function preloadImages() {
    const imagesToPreload = [
        'aakash-profile.jpg', // Profile image
        'favicon.svg' // Favicon
    ];
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Preload images
document.addEventListener('DOMContentLoaded', preloadImages);

// ===== Performance Optimization =====
// Throttle function to limit how often a function can be called
function throttle(func, limit) {
    let inThrottle;
    
    return function() {
        const args = arguments;
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll listeners
window.addEventListener('scroll', throttle(() => {
    // Update active nav link
    updateActiveNavLink();
    
    // Check for reveal elements
    checkReveal();
    
    // Check back-to-top button visibility
    updateBackToTopButton();
}, 100));

// Helper functions used by the throttled scroll handler
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

function checkReveal() {
    const revealElements = document.querySelectorAll('.reveal-element:not(.visible)');
    const triggerBottom = window.innerHeight * 0.85;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < triggerBottom) {
            element.classList.add('visible');
        }
    });
}

function updateBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
}

// ===== Window Load Event =====
window.addEventListener('load', function() {
    // Hide loader when all content is loaded
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        loaderWrapper.style.opacity = '0';
        loaderWrapper.style.visibility = 'hidden';
    }
    
    // Show elements that should be visible after load
    document.querySelectorAll('.fade-in, .fade-in-delayed').forEach(el => {
        el.style.opacity = '1';
    });
    
    // Check for reveal elements on initial load
    checkReveal();
});

// ===== Polyfill for requestAnimationFrame =====
// This ensures compatibility with older browsers
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
                                    window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(Math.floor(width * height / 15000), 100);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                Connection.draw(particles[i], particles[j]);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });
    
    // Start animation
    animate();
}

// ===== 3D Protein Visualization =====
function initProteinVisualization() {
    const canvas = document.getElementById('protein-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 320;
    const height = canvas.height = 320;
    
    // Create a simple 3D protein structure representation
    class AminoAcid {
        constructor(x, y, z, size, color) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.size = size;
            this.color = color;
            this.angle = 0;
            this.distance = Math.sqrt(x * x + z * z);
            this.initialY = y;
        }
        
        update(rotation) {
            this.angle += rotation;
            this.x = Math.cos(this.angle) * this.distance;
            this.z = Math.sin(this.angle) * this.distance;
            this.y = this.initialY + Math.sin(this.angle * 2) * 10;
        }
        
        draw() {
            const scale = 200 / (200 + this.z);
            const x = width / 2 + this.x * scale;
            const y = height / 2 + this.y * scale;
            const adjustedSize = this.size * scale;
            
            // Draw amino acid node
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x, y, adjustedSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add lighting effect
            const gradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, adjustedSize
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, adjustedSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    class Bond {
        constructor(aa1, aa2, thickness, color) {
            this.aa1 = aa1;
            this.aa2 = aa2;
            this.thickness = thickness;
            this.color = color;
        }
        
        draw() {
            const scale1 = 200 / (200 + this.aa1.z);
            const scale2 = 200 / (200 + this.aa2.z);
            
            const x1 = width / 2 + this.aa1.x * scale1;
            const y1 = height / 2 + this.aa1.y * scale1;
            const x2 = width / 2 + this.aa2.x * scale2;
            const y2 = height / 2 + this.aa2.y * scale2;
            
            const avgScale = (scale1 + scale2) / 2;
            const adjustedThickness = this.thickness * avgScale;
            
            // Draw bond
            ctx.strokeStyle = this.color;
            ctx.lineWidth = adjustedThickness;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
    
    // Create protein structure
    const aminoAcids = [];
    const bonds = [];
    const colors = ['#4f46e5', '#818cf8', '#60a5fa', '#34d399'];
    
    // Generate alpha helix structure
    for (let i = 0; i < 20; i++) {
        const angle = i * 0.3;
        const radius = 40;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = i * 7 - 70;
        
        aminoAcids.push(new AminoAcid(
            x, y, z,
            Math.random() * 3 + 3,
            colors[Math.floor(Math.random() * colors.length)]
        ));
        
        // Create bonds between adjacent amino acids
        if (i > 0) {
            bonds.push(new Bond(
                aminoAcids[i - 1],
                aminoAcids[i],
                1,
                'rgba(129, 140, 248, 0.6)'
            ));
        }
    }
    
    // Create some beta sheet-like structures
    for (let i = 0; i < 10; i++) {
        const x = 60 - i * 6;
        const y = -30 + Math.sin(i * 0.5) * 5;
        const z = 20;
        
        aminoAcids.push(new AminoAcid(
            x, y, z,
            Math.random() * 3 + 3,
            colors[Math.floor(Math.random() * colors.length)]
        ));
        
        if (i > 0) {
            bonds.push(new Bond(
                aminoAcids[20 + i - 1],
                aminoAcids[20 + i],
                1,
                'rgba(129, 140, 248, 0.6)'
            ));
        }
    }
    
    // Add a few cross-structure bonds
    bonds.push(new Bond(aminoAcids[5], aminoAcids[22], 1, 'rgba(96, 165, 250, 0.4)'));
    bonds.push(new Bond(aminoAcids[10], aminoAcids[25], 1, 'rgba(96, 165, 250, 0.4)'));
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and sort amino acids by z-index for proper rendering
        aminoAcids.forEach(aa => aa.update(0.01));
        aminoAcids.sort((a, b) => b.z - a.z);
        
        // Draw bonds first
        bonds.forEach(bond => bond.draw());
        
        // Then draw amino acids
        aminoAcids.forEach(aa => aa.draw());
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-element');
    
    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('resize', checkReveal);
    
    // Initial check
    checkReveal();
}

// ===== Hover Effects =====
function initHoverEffects() {
    // Magnetic effect for skill tags
    const magnetElements = document.querySelectorAll('.magnet');
    
    magnetElements.forEach(magnet => {
        magnet.addEventListener('mousemove', e => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            magnet.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        magnet.addEventListener('mouseleave', () => {
            magnet.style.transform = 'translate(0, 0)';
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
    });
}

// ===== 3D Hover Effect =====
function init3DHover() {
    const cards = document.querySelectorAll('.hover3d');
    
    cards.forEach(card => {
        const inner = card.querySelector('.hover3d-inner');
        
        card.addEventListener('mousemove', e => {
            if (window.matchMedia('(hover: hover)').matches) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const xPercent = x / rect.width - 0.5;
                const yPercent = y / rect.height - 0.5;
                
                inner.style.transform = `
                    rotateX(${yPercent * -8}deg) 
                    rotateY(${xPercent * 8}deg) 
                    translateZ(10px)
                `;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// ===== Cursor Follower =====
function initCursorFollower() {
    const cursor = document.querySelector('.cursor-follower');
    
    // Only enable custom cursor on non-touch devices
    if (window.matchMedia('(hover: hover)').matches && cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
        
        // Hover effect for interactive elements
        const interactives = document.querySelectorAll('a, button, .skill-tag, .btn');
        
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '50px';
                cursor.style.height = '50px';
                cursor.style.opacity = '0.4';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '32px';
                cursor.style.height = '32px';
                cursor.style.opacity = '0.7';
            });
        });
        
        // Show cursor when it enters the viewport
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '0.7';
        });
        
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    }
}

// ===== Contact Form Handling =====
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            let valid = true;
            
            if (!name.trim()) {
                highlightError('name', 'Name is required');
                valid = false;
            } else {
                removeError('name');
            }
            
            if (!email.trim()) {
                highlightError('email', 'Email is required');
                valid = false;
            } else if (!isValidEmail(email)) {
                highlightError('email', 'Please enter a valid email');
                valid = false;
            } else {
                removeError('email');
            }
            
            if (!message.trim()) {
                highlightError('message', 'Message is required');
                valid = false;
            } else {
                removeError('message');
            }
            
            // If form is valid, simulate submission
            if (valid) {
                // Disable form temporarily
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span>Sending...</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" stroke-dashoffset="60">
                            <animate attributeName="stroke-dashoffset" values="60;0" dur="1s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                `;
                
                // Simulate sending (replace with actual AJAX in production)
                setTimeout(() => {
                    // Replace form with success message
                    contactForm.innerHTML = `
                        <div class="success-message">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18456 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h3>Message Sent!</h3>
                            <p>Thank you for reaching out! I'll get back to you as soon as possible.</p>
                        </div>
                    `;
                }, 2000);
            }
        });
    }
    
    // Helper function for email validation
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Helper function to highlight errors
    function highlightError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.add('error');
        
        // Add error message if not already present
        if (!formGroup.querySelector('.error-message')) {
            const errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            errorMessage.textContent = message;
            formGroup.appendChild(errorMessage);
        } else {
            formGroup.querySelector('.error-message').textContent = message;
        }
    }
    
    // Helper function to remove errors
    function removeError(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// ===== Back to Top Button =====
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===== Section Background Effects =====
// This function is called by initHexagonBackground, initGridBackground, etc.
function createBackgroundEffect(selector, drawFunction) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        drawFunction(ctx, canvas.width, canvas.height);
    }
    
    window.addEventListener('resize', resize);
    resize();
}

// Initialize all section background effects
function initSectionBackgrounds() {
    // Hexagon background for About section
    createBackgroundEffect('.hexagon-bg', (ctx, width, height) => {
        const hexSize = 30;
        const hexHeight = hexSize * Math.sqrt(3);
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 1;
        
        for (let y = -hexHeight; y < height + hexHeight; y += hexHeight) {
            for (let x = -hexSize * 1.5; x < width + hexSize * 1.5; x += hexSize * 3) {
                drawHexagon(ctx, x, y, hexSize);
                drawHexagon(ctx, x + hexSize * 1.5, y + hexHeight / 2, hexSize);
            }
        }
    });
    
    // Grid background for Experience section
    createBackgroundEffect('.grid-bg', (ctx, width, height) => {
        const gridSize = 40;
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    });
    
    // Molecule background for Projects section
    createBackgroundEffect('.molecule-bg', (ctx, width, height) => {
        const nodes = [];
        const connections = [];
        
        // Create random nodes
        for (let i = 0; i < 20; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 5 + 2
            });
        }
        
        // Create connections
        for (let i = 0; i < nodes.length; i++) {
            const connectionCount = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < connectionCount; j++) {
                const targetIndex = (i + j + 1) % nodes.length;
                
                connections.push({
                    source: i,
                    target: targetIndex
                });
            }
        }
        
        // Draw connections
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 1;
        
        for (const connection of connections) {
            const source = nodes[connection.source];
            const target = nodes[connection.target];
            
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        }
        
        // Draw nodes
        for (const node of nodes) {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Binary background for Skills section
    createBackgroundEffect('.binary-bg', (ctx, width, height) => {
        const fontSize = 10;
        const cols = Math.floor(width / fontSize);
        const rows = Math.floor(height / fontSize);
        
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const binary = Math.random() > 0.5 ? '1' : '0';
                ctx.fillText(binary, i * fontSize, j * fontSize);
            }
        }
    });
    
    // DNA strand background for Education section
    createBackgroundEffect('.dna-strand-bg', (ctx, width, height) => {
        const amplitude = 50;
        const frequency = 0.02;
        const spacing = 15;
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 2;
        
        // Draw the DNA backbones
        for (let y = -amplitude; y < height + amplitude; y += 200) {
            // First backbone
            ctx.beginPath();
            ctx.moveTo(0, y);
            
            for (let x = 0; x < width; x += 5) {
                ctx.lineTo(x, y + Math.sin(x * frequency) * amplitude);
            }
            
            ctx.stroke();
            
            // Second backbone
            ctx.beginPath();
            ctx.moveTo(0, y + amplitude * 2);
            
            for (let x = 0; x < width; x += 5) {
                ctx.lineTo(x, y + amplitude * 2 + Math.sin((x * frequency) + Math.PI) * amplitude);
            }
            
            ctx.stroke();
            
            // Draw the base pairs
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.05)';
            
            for (let x = 0; x < width; x += spacing) {
                const y1 = y + Math.sin(x * frequency) * amplitude;
                const y2 = y + amplitude * 2 + Math.sin((x * frequency) + Math.PI) * amplitude;
                
                ctx.beginPath();
