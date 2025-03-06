// =====  Main JavaScript for Interactive Portfolio =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const loader = document.querySelector('.loader-wrapper');
    const body = document.querySelector('body');
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const cursorFollower = document.querySelector('.cursor-follower');
    const backToTop = document.getElementById('back-to-top');
    const revealElements = document.querySelectorAll('.reveal-element');
    const hover3dItems = document.querySelectorAll('.hover3d');
    const magnetElements = document.querySelectorAll('.magnet');
    const contactForm = document.getElementById('contact-form');

    // ===== Loading Animation =====
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            animateHeroElements();
        }, 1500);
    });

    function animateHeroElements() {
        const heroElements = document.querySelectorAll('.fade-in, .fade-in-delayed');
        heroElements.forEach(el => {
            el.style.opacity = '1';
        });
    }

    // ===== Mobile Menu Toggle =====
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
        
        if (mobileNav.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
    });

    // ===== Smooth Scrolling Navigation =====
    function smoothScroll(target, duration) {
        const targetElement = document.querySelector(target);
        const targetPosition = targetElement.offsetTop - 80;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        // Easing function
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Add click event to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target, 800);
        });
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            body.style.overflow = 'auto';
            smoothScroll(target, 800);
        });
    });

    // ===== Scroll Events =====
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Header background effect on scroll
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
            scrollIndicator.style.opacity = '0';
        } else {
            header.classList.remove('scrolled');
            scrollIndicator.style.opacity = '1';
        }
        
        // Back to top button visibility
        if (scrollPosition > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        // Update active navigation link based on scroll position
        updateActiveNavLink();
        
        // Reveal elements on scroll
        revealOnScroll();
    });

    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                
                mobileNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Reveal elements when they enter the viewport
    function revealOnScroll() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }

    // Back to top button click event
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Custom Cursor Effect =====
    if (window.innerWidth > 1024) {
        document.addEventListener('mousemove', function(e) {
            cursorFollower.style.opacity = '1';
            const x = e.clientX;
            const y = e.clientY;
            
            cursorFollower.style.transform = `translate(${x}px, ${y}px)`;
            
            // Check if cursor is over an interactive element
            const target = e.target;
            if (target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.classList.contains('project-card') || 
                target.classList.contains('skill-tag')) {
                cursorFollower.style.width = '60px';
                cursorFollower.style.height = '60px';
                cursorFollower.style.opacity = '0.3';
                cursorFollower.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            } else {
                cursorFollower.style.width = '32px';
                cursorFollower.style.height = '32px';
                cursorFollower.style.opacity = '0.7';
                cursorFollower.style.backgroundColor = 'transparent';
            }
        });
        
        // Hide cursor when leaving the window
        document.addEventListener('mouseleave', function() {
            cursorFollower.style.opacity = '0';
        });
    }

    // ===== 3D Hover Effect for Project Cards =====
    if (window.matchMedia('(hover: hover)').matches) {
        hover3dItems.forEach(item => {
            const inner = item.querySelector('.hover3d-inner');
            
            item.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const angleY = (x - centerX) / centerX * 10;
                const angleX = (centerY - y) / centerY * 10;
                
                inner.style.transform = `rotateY(${angleY}deg) rotateX(${angleX}deg) scale(1.05)`;
            });
            
            item.addEventListener('mouseleave', function() {
                inner.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
            });
        });
    }

    // ===== Magnetic Effect for Skill Tags =====
    if (window.matchMedia('(hover: hover)').matches) {
        magnetElements.forEach(magnet => {
            magnet.addEventListener('mousemove', function(e) {
                const position = this.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                
                this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            magnet.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ===== Form Validation & Submission =====
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            let isValid = true;
            
            if (name.value.trim() === '') {
                showError(name, 'Please enter your name');
                isValid = false;
            } else {
                clearError(name);
            }
            
            if (email.value.trim() === '') {
                showError(email, 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            } else {
                clearError(email);
            }
            
            if (message.value.trim() === '') {
                showError(message, 'Please enter your message');
                isValid = false;
            } else {
                clearError(message);
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = `
                    <span>Sending...</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 12L12 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    // Show success message
                    contactForm.innerHTML = `
                        <div class="success-message">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h3>Message Sent!</h3>
                            <p>Thank you for your message. I'll get back to you as soon as possible.</p>
                        </div>
                    `;
                }, 2000);
            }
        });
        
        function showError(input, message) {
            const formGroup = input.parentElement;
            formGroup.classList.add('error');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = message;
            
            if (!formGroup.querySelector('.error-message')) {
                formGroup.appendChild(errorMessage);
            }
        }
        
        function clearError(input) {
            const formGroup = input.parentElement;
            formGroup.classList.remove('error');
            
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                formGroup.removeChild(errorMessage);
            }
        }
        
        function isValidEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
    }

    // ===== Molecular Background Animation =====
    const molecularBg = document.getElementById('molecular-bg');
    if (molecularBg) {
        const ctx = molecularBg.getContext('2d');
        
        // Set canvas size
        function setCanvasSize() {
            molecularBg.width = window.innerWidth;
            molecularBg.height = window.innerHeight;
        }
        
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);
        
        // Create particles
        const particles = [];
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 30));
        
        class Particle {
            constructor() {
                this.x = Math.random() * molecularBg.width;
                this.y = Math.random() * molecularBg.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.color = ['#4F46E5', '#818CF8', '#60A5FA'][Math.floor(Math.random() * 3)];
                this.connections = [];
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Bounce off walls
                if (this.x < 0 || this.x > molecularBg.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > molecularBg.height) this.vy = -this.vy;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.7;
                ctx.fill();
            }
        }
        
        // Create initial particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Draw connections between nearby particles
        function drawConnections() {
            ctx.strokeStyle = '#4F46E5';
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.globalAlpha = 0.2 * (1 - distance / 120);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, molecularBg.width, molecularBg.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            drawConnections();
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // ===== Protein Visualization =====
    const proteinCanvas = document.getElementById('protein-canvas');
    if (proteinCanvas) {
        const ctx = proteinCanvas.getContext('2d');
        
        // Set canvas size
        proteinCanvas.width = 320;
        proteinCanvas.height = 320;
        
        // Create amino acids
        const aminoAcids = [];
        const bonds = [];
        const numAminoAcids = 20;
        const radius = 120;
        const centerX = proteinCanvas.width / 2;
        const centerY = proteinCanvas.height / 2;
        
        // Create protein structure
        for (let i = 0; i < numAminoAcids; i++) {
            const angle = (i / numAminoAcids) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            aminoAcids.push({
                x: x,
                y: y,
                radius: 5 + Math.random() * 5,
                color: ['#4F46E5', '#818CF8', '#60A5FA', '#34D399'][Math.floor(Math.random() * 4)],
                pulseSpeed: 0.02 + Math.random() * 0.03,
                pulsePhase: Math.random() * Math.PI * 2,
                originalX: x,
                originalY: y
            });
            
            // Create bonds between sequential amino acids
            if (i > 0) {
                bonds.push({
                    a: i - 1,
                    b: i
                });
            }
        }
        
        // Close the protein backbone
        bonds.push({
            a: numAminoAcids - 1,
            b: 0
        });
        
        // Add cross-linking bonds for tertiary structure
        for (let i = 0; i < 8; i++) {
            const a = Math.floor(Math.random() * numAminoAcids);
            let b = Math.floor(Math.random() * numAminoAcids);
            
            // Ensure we don't duplicate bonds or connect adjacent amino acids
            while (b === a || Math.abs(b - a) === 1 || Math.abs(b - a) === numAminoAcids - 1) {
                b = Math.floor(Math.random() * numAminoAcids);
            }
            
            bonds.push({
                a: a,
                b: b
            });
        }
        
        let rotation = 0;
        
        // Animation loop
        function animateProtein() {
            ctx.clearRect(0, 0, proteinCanvas.width, proteinCanvas.height);
            
            // Update rotation
            rotation += 0.005;
            
            // Draw bonds first
            bonds.forEach(bond => {
                const aa1 = aminoAcids[bond.a];
                const aa2 = aminoAcids[bond.b];
                
                ctx.beginPath();
                ctx.strokeStyle = '#A5B4FC';
                ctx.lineWidth = 2;
                ctx.moveTo(aa1.x, aa1.y);
                ctx.lineTo(aa2.x, aa2.y);
                ctx.stroke();
            });
            
            // Draw amino acids
            aminoAcids.forEach((aa, i) => {
                // Update position with rotation and pulsing
                const angle = (i / numAminoAcids) * Math.PI * 2 + rotation;
                const pulseRadius = radius + Math.sin(Date.now() * aa.pulseSpeed + aa.pulsePhase) * 10;
                
                aa.x = centerX + Math.cos(angle) * pulseRadius;
                aa.y = centerY + Math.sin(angle) * pulseRadius;
                
                // Draw amino acid
                ctx.beginPath();
                ctx.arc(aa.x, aa.y, aa.radius, 0, Math.PI * 2);
                ctx.fillStyle = aa.color;
                ctx.fill();
                
                // Draw glow effect
                ctx.beginPath();
                ctx.arc(aa.x, aa.y, aa.radius + 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            
            requestAnimationFrame(animateProtein);
        }
        
        animateProtein();
    }

    // ===== DNA Animation =====
    function createDNAAnimation() {
        const dnaHelix = document.querySelector('.dna-helix');
        if (!dnaHelix) return;

        // Create SVG for DNA helix
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.opacity = '0.1';
        
        // Create two strands
        const strand1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        strand1.setAttribute('d', 'M0,50 Q25,0 50,50 T100,50');
        strand1.setAttribute('stroke', '#4F46E5');
        strand1.setAttribute('stroke-width', '2');
        strand1.setAttribute('fill', 'none');
        strand1.setAttribute('stroke-linecap', 'round');
        strand1.style.transformOrigin = 'center';
        strand1.style.animation = 'rotateDNA 15s linear infinite';
        
        const strand2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        strand2.setAttribute('d', 'M0,50 Q25,100 50,50 T100,50');
        strand2.setAttribute('stroke', '#60A5FA');
        strand2.setAttribute('stroke-width', '2');
        strand2.setAttribute('fill', 'none');
        strand2.setAttribute('stroke-linecap', 'round');
        strand2.style.transformOrigin = 'center';
        strand2.style.animation = 'rotateDNA 15s linear infinite';
        
        svg.appendChild(strand1);
        svg.appendChild(strand2);
        
        // Create rungs
        for (let i = 0; i < 5; i++) {
            const x = 5 + i * 20;
            
            const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            rung.setAttribute('x1', x);
            rung.setAttribute('y1', '30');
            rung.setAttribute('x2', x);
            rung.setAttribute('y2', '70');
            rung.setAttribute('stroke', '#A5B4FC');
            rung.setAttribute('stroke-width', '1.5');
            rung.style.transformOrigin = 'center';
            rung.style.animation = 'rotateDNA 15s linear infinite';
            
            svg.appendChild(rung);
        }
        
        dnaHelix.appendChild(svg);
        
        // Create keyframe for DNA rotation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rotateDNA {
                0% { transform: rotateY(0deg); }
                100% { transform: rotateY(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    createDNAAnimation();

    // Initialize on page load
    function init() {
        revealOnScroll();
        updateActiveNavLink();
    }
    
    init();
});
