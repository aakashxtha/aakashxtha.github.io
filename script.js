// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // DOM Elements
    const loadingScreen = document.getElementById('loading-screen');
    const mainNav = document.getElementById('main-nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const sections = document.querySelectorAll('section');
    const revealElements = document.querySelectorAll('.reveal-element');
    const customCursor = document.getElementById('custom-cursor');
    const particlesCanvas = document.getElementById('particles-canvas');
    const proteinCanvas = document.getElementById('protein-canvas');
    const contactForm = document.getElementById('contact-form');
    
    // Loading animation
    setTimeout(() => {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
            loadingScreen.style.visibility = "hidden";
        }, 1000);
    }, 2000);
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    function scrollToSection(element) {
        const sectionId = element.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        
        if (section) {
            const offset = 70; // Height of fixed navbar
            const sectionTop = section.offsetTop - offset;
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            mobileNav.classList.remove('active');
        }
    }
    
    // Add click events to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            scrollToSection(link);
        });
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            scrollToSection(link);
        });
    });
    
    // Add click events to hero buttons
    const actionButtons = document.querySelectorAll('[data-section]');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            scrollToSection(button);
        });
    });
    
    // Scroll handling
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Navbar background on scroll
        if (scrollY > 20) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
        
        // Hide scroll indicator when scrolled
        if (scrollY > 100) {
            scrollIndicator.style.opacity = "0";
        } else {
            scrollIndicator.style.opacity = "1";
        }
        
        // Check which section is visible and update active nav link
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
                
                mobileNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Reveal elements on scroll
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    });
    
    // Custom cursor
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            requestAnimationFrame(() => {
                customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            });
        }
    });
    
    // Create animated background particles
    if (particlesCanvas) {
        const ctx = particlesCanvas.getContext('2d');
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
        
        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            particlesCanvas.width = window.innerWidth;
            particlesCanvas.height = window.innerHeight;
        });
        
        // Particles array
        const particles = [];
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 40)); // Adjust number based on screen size
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * particlesCanvas.width,
                y: Math.random() * particlesCanvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                direction: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.5 + 0.2,
                color: i % 3 === 0 ? '#4F46E5' : (i % 3 === 1 ? '#818CF8' : '#60A5FA')
            });
        }
        
        // Draw connections between particles
        function drawConnections() {
            particles.forEach((particle, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const other = particles[j];
                    const distance = Math.sqrt(
                        Math.pow(particle.x - other.x, 2) + 
                        Math.pow(particle.y - other.y, 2)
                    );
                    
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(79, 70, 229, ${0.15 * (1 - distance / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }
            });
        }
        
        // Animation loop for particles
        function animateParticles() {
            ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
            
            particles.forEach(particle => {
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();
                
                // Update particle position
                particle.x += Math.cos(particle.direction) * particle.speed;
                particle.y += Math.sin(particle.direction) * particle.speed;
                
                // Change direction slightly
                particle.direction += (Math.random() - 0.5) * 0.02;
                
                // Boundary check
                if (particle.x < 0) particle.x = particlesCanvas.width;
                if (particle.x > particlesCanvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = particlesCanvas.height;
                if (particle.y > particlesCanvas.height) particle.y = 0;
            });
            
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
    }
    
    // Create protein visualization
    if (proteinCanvas) {
        const ctx = proteinCanvas.getContext('2d');
        proteinCanvas.width = 320;
        proteinCanvas.height = 320;
        
        const aminoAcids = [];
        const bonds = [];
        const numAminoAcids = 20;
        const radius = 120;
        const centerX = proteinCanvas.width / 2;
        const centerY = proteinCanvas.height / 2;
        
        // Create a circular protein-like structure
        for (let i = 0; i < numAminoAcids; i++) {
            const angle = (i / numAminoAcids) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            aminoAcids.push({
                x,
                y,
                radius: 6 + Math.random() * 6,
                color: ['#4F46E5', '#818CF8', '#60A5FA', '#34D399'][Math.floor(Math.random() * 4)],
                pulseSpeed: 0.02 + Math.random() * 0.03,
                pulsePhase: Math.random() * Math.PI * 2,
                initialX: x,
                initialY: y
            });
            
            // Create bonds between amino acids
            if (i > 0) {
                bonds.push({
                    a: i - 1,
                    b: i
                });
            }
        }
        
        // Close the loop
        bonds.push({
            a: numAminoAcids - 1,
            b: 0
        });
        
        // Add some cross-links
        for (let i = 0; i < 8; i++) {
            const a = Math.floor(Math.random() * numAminoAcids);
            let b = Math.floor(Math.random() * numAminoAcids);
            while (Math.abs(a - b) < 3 || a === b) {
                b = Math.floor(Math.random() * numAminoAcids);
            }
            
            bonds.push({
                a,
                b
            });
        }
        
        let rotationAngle = 0;
        
        // Animation loop for protein
        function animateProtein() {
            ctx.clearRect(0, 0, proteinCanvas.width, proteinCanvas.height);
            
            // Update rotation
            rotationAngle += 0.005;
            
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
                const angle = (i / numAminoAcids) * Math.PI * 2 + rotationAngle;
                const pulseRadius = radius + Math.sin(Date.now() * aa.pulseSpeed + aa.pulsePhase) * 10;
                
                aa.x = centerX + Math.cos(angle) * pulseRadius;
                aa.y = centerY + Math.sin(angle) * pulseRadius;
                
                ctx.beginPath();
                ctx.arc(aa.x, aa.y, aa.radius, 0, Math.PI * 2);
                ctx.fillStyle = aa.color;
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(aa.x, aa.y, aa.radius + 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            
            requestAnimationFrame(animateProtein);
        }
        
        animateProtein();
    }
    
    // Handle form submission (for demonstration - no actual backend)
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill out all fields');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thanks for your message! This is a demo form, so no actual message was sent.');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Create background patterns for different sections
    function createGridPattern() {
        const gridBg = document.querySelector('.bg-grid');
        if (gridBg) {
            let html = '';
            for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 12; j++) {
                    html += `<div class="grid-cell" style="grid-row: ${i+1}; grid-column: ${j+1};"></div>`;
                }
            }
            gridBg.innerHTML = html;
            gridBg.style.display = 'grid';
            gridBg.style.gridTemplateColumns = 'repeat(12, 1fr)';
            gridBg.style.gridTemplateRows = 'repeat(12, 1fr)';
            gridBg.style.height = '100%';
        }
    }
    
    function createDnaPattern() {
        const dnaBg = document.querySelector('.dna-bg');
        if (dnaBg) {
            let html = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="#4F46E5" stroke-width="0.5" />
                <path d="M0,50 Q25,75 50,50 T100,50" fill="none" stroke="#4F46E5" stroke-width="0.5" />`;
                
            for (let i = 0; i < 20; i++) {
                html += `<g opacity="0.7">
                    <line x1="${i * 5}" y1="0" x2="${i * 5}" y2="100" stroke="#4F46E5" stroke-width="0.2" />
                    <line x1="${i * 5 + 2.5}" y1="0" x2="${i * 5 + 2.5}" y2="100" stroke="#60A5FA" stroke-width="0.2" />
                </g>`;
            }
            
            html += `</svg>`;
            dnaBg.innerHTML = html;
        }
    }
    
    function createHexagonalPattern() {
        const moleculeBg = document.querySelector('.molecule-bg');
        if (moleculeBg) {
            let html = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">`;
            
            for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
                for (let colIndex = 0; colIndex < 6; colIndex++) {
                    const xOffset = (rowIndex % 2) * 7.5;
                    const x = 10 + colIndex * 15 + xOffset;
                    const y = 10 + rowIndex * 13;
                    
                    html += `<polygon 
                        points="
                            ${x},${y}
                            ${x+5},${y-5}
                            ${x+10},${y}
                            ${x+10},${y+10}
                            ${x+5},${y+15}
                            ${x},${y+10}
                        "
                        fill="none"
                        stroke="#4F46E5"
                        stroke-width="0.2"
                    />`;
                }
            }
            
            html += `</svg>`;
            moleculeBg.innerHTML = html;
        }
    }
    
    function createDataFlowPattern() {
        const dataFlowBg = document.querySelector('.data-flow-bg');
        if (dataFlowBg) {
            let html = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">`;
            
            for (let i = 0; i < 20; i++) {
                const y = i * 5;
                const cp1x = 20 + Math.random() * 20;
                const cp1y = y + Math.random() * 5;
                const cp2x = 40 + Math.random() * 20;
                const cp2y = y - Math.random() * 5;
                const cp3x = 60 + Math.random() * 30;
                const cp3y = y + Math.random() * 5;
                const cp4x = 90 + Math.random() * 10;
                const cp4y = y - Math.random() * 5;
                
                html += `<path 
                    d="M${Math.random() * 10},${y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${cp3x},${cp3y} S${cp4x},${cp4y} 100,${y}"
                    fill="none"
                    stroke="#4F46E5"
                    stroke-width="0.2"
                />`;
            }
            
            html += `</svg>`;
            dataFlowBg.innerHTML = html;
        }
    }
    
    function createBinaryPattern() {
        const binaryBg = document.querySelector('.binary-bg');
        if (binaryBg) {
            let html = '';
            
            for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
                let rowHtml = `<div style="display: flex; margin-top: ${rowIndex * 5}vh;">`;
                
                for (let colIndex = 0; colIndex < 40; colIndex++) {
                    const binary = Math.random() > 0.5 ? '1' : '0';
                    rowHtml += `<div style="margin-left: ${colIndex * 3}vw; opacity: ${Math.random()}; font-size: 10px; color: #4F46E5;">${binary}</div>`;
                }
                
                rowHtml += `</div>`;
                html += rowHtml;
            }
            
            binaryBg.innerHTML = html;
        }
    }
    
    function createProteinPattern() {
        const proteinBg = document.querySelector('.protein-bg');
        if (proteinBg) {
            let html = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M10,50 C20,30 30,70 40,50 C50,30 60,70 70,50 C80,30 90,70 95,50" 
                      fill="none" 
                      stroke="#4F46E5" 
                      stroke-width="0.5" />`;
            
            for (let i = 0; i < 9; i++) {
                const x = 10 + i * 10;
                const y = 50;
                const sideY = i % 2 === 0 ? 60 : 40;
                
                html += `<g>
                    <line 
                      x1="${x}" 
                      y1="${y}" 
                      x2="${x}" 
                      y2="${sideY}" 
                      stroke="#60A5FA" 
                      stroke-width="0.3" 
                    />
                    <circle 
                      cx="${x}" 
                      cy="${sideY}" 
                      r="1" 
                      fill="#60A5FA" 
                    />
                </g>`;
            }
            
            html += `</svg>`;
            proteinBg.innerHTML = html;
        }
    }
    
    function createGridBgPattern() {
        const gridBg = document.querySelector('.grid-bg');
        if (gridBg) {
            let html = `<div class="grid-container" style="
                display: grid;
                grid-template-columns: repeat(20, 1fr);
                grid-template-rows: repeat(20, 1fr);
                height: 100%;
                width: 100%;
                opacity: 0.1;
            ">`;
            
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 20; col++) {
                    html += `<div style="border: 1px solid rgba(99, 102, 241, 0.2);"></div>`;
                }
            }
            
            html += `</div>`;
            gridBg.innerHTML = html;
        }
    }
    
    // Initialize background patterns
    createGridPattern();
    createDnaPattern();
    createGridBgPattern();
    createProteinPattern();
    createBinaryPattern();
    createHexagonalPattern();
    createDataFlowPattern();
    
    // Initialize first reveal of elements that are already in viewport
    setTimeout(() => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    }, 100);
});
