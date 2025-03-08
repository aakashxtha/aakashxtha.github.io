document.addEventListener('DOMContentLoaded', function() {
    // Project data
    const projectsData = [
        {
            title: "Integration of Protein Dynamics in Enzyme Design",
            image: "images/project1.jpg",
            tags: ["PyRosetta", "MARTINI", "Protein Design"],
            description: "Developed a groundbreaking computational framework that seamlessly integrates protein dynamics into enzyme design algorithms. Created a custom Python interface combining PyRosetta with MARTINI coarse-grained simulations, enabling rapid analysis of hundreds of protein variants. This novel approach revealed crucial insights into how mutations around rigid residues affect enzyme function, establishing a new paradigm in computational enzyme engineering.",
            link: "#"
        },
        {
            title: "Advanced 3D Structure Prediction of Circular RNAs",
            image: "images/project2.jpg",
            tags: ["RNA Structure", "MXFold2", "Rosetta"],
            description: "Pioneered a computational pipeline for accurate prediction of circular RNA tertiary structures, leveraging MXFold2 for secondary structure prediction and Rosetta's FarFar2 module for 3D modeling. Implemented molecular dynamics protocols using NAMD for structure refinement, providing unprecedented insights into circular RNA conformational dynamics. This research has significant implications for understanding RNA-protein interactions and developing RNA-based therapeutics.",
            link: "#"
        },
        {
            title: "Nylon Degradation Molecular Models",
            image: "images/project3.jpg",
            tags: ["Molecular Dynamics", "NAMD", "Polymer Science"],
            description: "Engineered sophisticated molecular models for nylon 6,6 and nylon 6,10 using the Cambridge Structural Database and developed custom CGenFF force field parameterizations. Conducted extensive molecular dynamics simulations revealing critical insights into polymer behavior under various conditions. This research contributes fundamental knowledge to sustainable polymer recycling technologies and the development of biodegradable alternatives to conventional nylons.",
            link: "#"
        },
        {
            title: "Automated Therapeutic Bra for Post-Operative Care",
            image: "images/project4.jpg",
            tags: ["Medical Device", "Arduino", "Biomedical"],
            description: "Leading the development of an innovative Class II medical device designed to prevent capsular contracture following breast reconstruction surgery. Engineered a sophisticated dual-pump mechanism with integrated pressure sensors and comprehensive Arduino-based control software featuring real-time monitoring and automated safety systems. This project establishes new standards for personalized therapeutic devices while addressing critical needs in post-operative care.",
            link: "#"
        }
    ];

    // ===============================
    // Custom Cursor Implementation
    // ===============================
    const cursor = {
        dot: document.getElementById("cursor-dot"),
        circle: document.getElementById("cursor-circle"),
        links: document.querySelectorAll("a, button, .project-card, input, textarea, .deck-dot"),
        cursorVisible: true,
        cursorEnlarged: false,
    
        init: function() {
            // Hide cursor when not on screen
            document.addEventListener('mouseenter', () => this.cursorVisible = true);
            document.addEventListener('mouseleave', () => this.cursorVisible = false);
            document.addEventListener('mousedown', () => this.cursorEnlarged = true);
            document.addEventListener('mouseup', () => this.cursorEnlarged = false);
    
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            document.addEventListener('mouseenter', () => this.handleMouseEnter());
            document.addEventListener('mouseleave', () => this.handleMouseLeave());
    
            // Link hover effect
            this.links.forEach(link => {
                link.addEventListener('mouseenter', () => this.handleLinkHover());
                link.addEventListener('mouseleave', () => this.handleLinkUnhover());
            });
        },
    
        handleMouseMove: function(e) {
            if (this.cursorVisible) {
                this.dot.style.opacity = 1;
                this.circle.style.opacity = 1;
                
                this.dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
                
                // Add slight delay to the outer circle for effect
                setTimeout(() => {
                    this.circle.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
                }, 50);
            }
        },
    
        handleMouseEnter: function() {
            this.cursorVisible = true;
            this.updateCursorVisibility();
        },
    
        handleMouseLeave: function() {
            this.cursorVisible = false;
            this.updateCursorVisibility();
        },
    
        handleLinkHover: function() {
            this.cursorEnlarged = true;
            this.updateCursorSize();
        },
    
        handleLinkUnhover: function() {
            this.cursorEnlarged = false;
            this.updateCursorSize();
        },
    
        updateCursorVisibility: function() {
            if (this.cursorVisible) {
                this.dot.style.opacity = 1;
                this.circle.style.opacity = 1;
            } else {
                this.dot.style.opacity = 0;
                this.circle.style.opacity = 0;
            }
        },
    
        updateCursorSize: function() {
            if (this.cursorEnlarged) {
                this.circle.classList.add("cursor-hover");
                this.dot.classList.add("cursor-hover");
            } else {
                this.circle.classList.remove("cursor-hover");
                this.dot.classList.remove("cursor-hover");
            }
        }
    };
    
    cursor.init();

    // ===============================
    // Mouse Trail Effect
    // ===============================
    function setupMouseTrail() {
        const trailCount = 20;
        const trails = [];
        
        // Create trails
        for (let i = 0; i < trailCount; i++) {
            const trail = document.createElement("div");
            trail.className = "trail";
            document.body.appendChild(trail);
            trails.push({
                element: trail,
                x: 0,
                y: 0,
                alpha: 0
            });
        }
        
        // Trail effect on mouse move
        window.addEventListener("mousemove", (e) => {
            // Update each trail's position with delay
            for (let i = 0; i < trails.length; i++) {
                setTimeout(() => {
                    const trail = trails[i];
                    trail.x = e.clientX;
                    trail.y = e.clientY;
                    trail.alpha = 0.7;
                    
                    // Position and show the trail
                    trail.element.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
                    trail.element.style.opacity = trail.alpha;
                    
                    // Fade out
                    gsap.to(trail, {
                        alpha: 0,
                        duration: 1.5,
                        onUpdate: () => {
                            trail.element.style.opacity = trail.alpha;
                            const scale = 1 - trail.alpha;
                            trail.element.style.width = `${6 * (1 + scale)}px`;
                            trail.element.style.height = `${6 * (1 + scale)}px`;
                            // Colorize based on position
                            const hue = (trail.x / window.innerWidth) * 180 + 200; // Blue-cyan range
                            trail.element.style.backgroundColor = `hsla(${hue}, 80%, 60%, ${trail.alpha})`;
                        }
                    });
                }, i * 40); // Staggered delay
            }
        });
    }
    
    setupMouseTrail();

    // ===============================
    // WebGL Background Effect
    // ===============================
    function initWebGLBackground() {
        // Set up THREE.js scene
        const canvas = document.getElementById('webgl-background');
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Create wave geometry
        const waveGeometry = new THREE.PlaneGeometry(25, 25, 50, 50);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0x0066cc,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.rotation.x = -Math.PI / 2 - 0.2;
        wave.position.y = -5;
        scene.add(wave);
        
        // Second wave with different parameters
        const waveGeometry2 = new THREE.PlaneGeometry(30, 30, 60, 60);
        const waveMaterial2 = new THREE.MeshBasicMaterial({
            color: 0x00ccff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        
        const wave2 = new THREE.Mesh(waveGeometry2, waveMaterial2);
        wave2.rotation.x = -Math.PI / 2;
        wave2.position.y = -5.5;
        scene.add(wave2);
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            
            // Wave animation
            const positions = waveGeometry.attributes.position.array;
            const positions2 = waveGeometry2.attributes.position.array;
            const time = Date.now() * 0.0005;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];
                positions[i + 1] = Math.sin(x * 0.3 + time) * Math.sin(z * 0.2 + time) * 1.5;
            }
            
            for (let i = 0; i < positions2.length; i += 3) {
                const x = positions2[i];
                const z = positions2[i + 2];
                positions2[i + 1] = Math.sin(x * 0.2 - time) * Math.sin(z * 0.3 - time) * 1;
            }
            
            waveGeometry.attributes.position.needsUpdate = true;
            waveGeometry2.attributes.position.needsUpdate = true;
            
            renderer.render(scene, camera);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        animate();
    }
    
    initWebGLBackground();

    // ===============================
    // Loading Screen Animation
    // ===============================
    const loadingScreen = document.querySelector('.loading-screen');
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
                // Trigger entrance animations after loading screen
                triggerEntranceAnimations();
            }, 500);
        }, 1500);
    });

    // ===============================
    // 3D Project Deck Implementation
    // ===============================
    const deckContainer = document.getElementById("project-deck");
    const pagination = document.getElementById("deck-pagination");
    const prevButton = document.querySelector(".prev-deck-button");
    const nextButton = document.querySelector(".next-deck-button");
    
    let currentIndex = 0;
    let startX, currentX, isDragging = false;
    let cards = [];
    
    // Create project cards
    function generateProjectCards() {
        projectsData.forEach((project, index) => {
            // Create card element
            const card = document.createElement("div");
            card.className = "project-card";
            card.setAttribute("data-index", index);
            
            // Add glass effect overlay
            const glassEffect = document.createElement("div");
            glassEffect.className = "glass-effect";
            card.appendChild(glassEffect);
            
            // Add image
            const imgContainer = document.createElement("div");
            imgContainer.className = "project-img";
            const img = document.createElement("img");
            img.src = project.image;
            img.alt = project.title;
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
            
            // Add content
            const content = document.createElement("div");
            content.className = "project-content";
            
            // Tags
            const tags = document.createElement("div");
            tags.className = "project-tags";
            project.tags.forEach(tag => {
                const tagSpan = document.createElement("span");
                tagSpan.className = "project-tag";
                tagSpan.textContent = tag;
                tags.appendChild(tagSpan);
            });
            content.appendChild(tags);
            
            // Title
            const title = document.createElement("h3");
            title.className = "project-title";
            title.textContent = project.title;
            content.appendChild(title);
            
            // Description
            const desc = document.createElement("p");
            desc.className = "project-desc";
            desc.textContent = project.description;
            content.appendChild(desc);
            
            // Link
            const links = document.createElement("div");
            links.className = "project-links";
            const link = document.createElement("a");
            link.className = "project-link";
            link.href = project.link;
            link.innerHTML = `<i class="fas fa-external-link-alt"></i> View Project`;
            links.appendChild(link);
            content.appendChild(links);
            
            card.appendChild(content);
            deckContainer.appendChild(card);
            cards.push(card);
            
            // Add pagination dot
            const dot = document.createElement("div");
            dot.className = "deck-dot";
            dot.setAttribute("data-index", index);
            pagination.appendChild(dot);
            
            // Add click event to dot
            dot.addEventListener("click", () => {
                goToCard(index);
            });
        });
        
        // Set initial positions
        updateCardPositions();
        
        // Mark active pagination dot
        updateActiveDot();
    }
    
    // Position cards in 3D space
    function updateCardPositions() {
        cards.forEach((card, index) => {
            const offset = index - currentIndex;
            const zIndex = 10 - Math.abs(offset);
            let translateX, translateZ, rotateY, opacity;
            
            if (offset === 0) {
                // Current card
                translateX = 0;
                translateZ = 0;
                rotateY = 0;
                opacity = 1;
                scale = 1;
            } else if (offset < 0) {
                // Cards to the left
                translateX = -120 * Math.abs(offset);
                translateZ = -150 * Math.abs(offset);
                rotateY = 10 * offset;
                opacity = 1 - Math.min(0.75, 0.25 * Math.abs(offset));
                scale = 1 - 0.05 * Math.abs(offset);
            } else {
                // Cards to the right
                translateX = 120 * offset;
                translateZ = -150 * offset;
                rotateY = 10 * offset;
                opacity = 1 - Math.min(0.75, 0.25 * Math.abs(offset));
                scale = 1 - 0.05 * Math.abs(offset);
            }
            
            // Apply transforms
            card.style.zIndex = zIndex;
            card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.transitionDelay = `${Math.abs(offset) * 0.05}s`;
            
            // Center the active card
            card.style.left = offset === 0 ? "50%" : `${50 + (offset * 5)}%`;
            card.style.marginLeft = offset === 0 ? "-40%" : offset < 0 ? "-45%" : "-35%";
        });
    }
    
    // Highlight active pagination dot
    function updateActiveDot() {
        const dots = document.querySelectorAll(".deck-dot");
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }
    
    // Go to specific card
    function goToCard(index) {
        if (index < 0) index = 0;
        if (index >= cards.length) index = cards.length - 1;
        
        currentIndex = index;
        updateCardPositions();
        updateActiveDot();
    }
    
    // Previous card
    prevButton.addEventListener("click", () => {
        goToCard(currentIndex - 1);
    });
    
    // Next card
    nextButton.addEventListener("click", () => {
        goToCard(currentIndex + 1);
    });
    
    // Keyboard navigation
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") {
            goToCard(currentIndex - 1);
        } else if (e.key === "ArrowRight") {
            goToCard(currentIndex + 1);
        }
    });
    
    // Mouse/touch interaction with cards
    function setupDragInteraction() {
        deckContainer.addEventListener("mousedown", startDrag);
        deckContainer.addEventListener("touchstart", e => {
            startDrag(e.touches[0]);
        }, { passive: true });
        
        window.addEventListener("mousemove", drag);
        window.addEventListener("touchmove", e => {
            drag(e.touches[0]);
        }, { passive: true });
        
        window.addEventListener("mouseup", endDrag);
        window.addEventListener("touchend", endDrag);
        
        // Handle card hover 3D effect
        cards.forEach(card => {
            card.addEventListener("mousemove", cardHover);
            card.addEventListener("mouseleave", cardLeave);
        });
    }
    
    function startDrag(e) {
        if (e.target.closest(".project-card")) {
            isDragging = true;
            startX = e.clientX || e.pageX;
            currentX = startX;
            
            // Add active class to card
            document.querySelectorAll(".project-card").forEach(card => {
                card.classList.add("active");
            });
        }
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.clientX || e.pageX;
        
        // Calculate drag percentage
        const deltaX = currentX - startX;
        const containerWidth = deckContainer.offsetWidth;
        const dragProgress = deltaX / containerWidth;
        
        // Apply temporary drag translation
        cards.forEach((card, index) => {
            const offset = index - currentIndex;
            const baseTransform = card.style.transform.replace(/translateX\([^)]+\)/, '');
            const translateX = (offset * 120) + (dragProgress * containerWidth * 0.5);
            
            card.style.transform = `translateX(${translateX}px) ${baseTransform}`;
        });
    }
    
    function endDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Remove active class
        document.querySelectorAll(".project-card").forEach(card => {
            card.classList.remove("active");
        });
        
        // Determine if we should navigate
        const deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                // Swipe right - previous card
                goToCard(currentIndex - 1);
            } else {
                // Swipe left - next card
                goToCard(currentIndex + 1);
            }
        } else {
            // Not enough movement, snap back
            updateCardPositions();
        }
    }
    
    function cardHover(e) {
        if (isDragging) return;
        
        const card = e.currentTarget;
        const cardIndex = parseInt(card.getAttribute("data-index"));
        
        if (cardIndex !== currentIndex) return;
        
        const cardRect = card.getBoundingClientRect();
        
        // Calculate center point of card
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        
        // Calculate distance from center
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const deltaX = (mouseX - centerX) / (cardRect.width / 2);
        const deltaY = (mouseY - centerY) / (cardRect.height / 2);
        
        // Apply tilt effect
        card.style.transform = `translateX(0) translateZ(0) rotateY(${deltaX * 5}deg) rotateX(${-deltaY * 5}deg) scale(1)`;
    }
    
    function cardLeave(e) {
        if (isDragging) return;
        
        const card = e.currentTarget;
        updateCardPositions();
    }

    // ===============================
    // Navigation & General UI
    // ===============================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Sticky Header
    const header = document.querySelector('header');
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('sticky');
            backToTop.classList.add('active');
        } else {
            header.classList.remove('sticky');
            backToTop.classList.remove('active');
        }
    });

    // Back to top
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Scroll down button
    const scrollDown = document.querySelector('.scroll-down');
    scrollDown.addEventListener('click', function(e) {
        e.preventDefault();
        const aboutSection = document.querySelector('#about');
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    });

    // ===============================
    // Animated Text Effect
    // ===============================
    function setupTextScramble() {
        // Class for text scramble effect
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = '!<>-_\\/[]{}—=+*^?#________';
                this.update = this.update.bind(this);
            }
            
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise(resolve => this.resolve = resolve);
                this.queue = [];
                
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end });
                }
                
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            
            update() {
                let output = '';
                let complete = 0;
                
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += `<span class="text-scramble-char">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                
                this.el.innerHTML = output;
                
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        
        // Apply to elements with data-scramble attribute
        document.querySelectorAll('[data-scramble]').forEach(el => {
            const originalText = el.textContent;
            const fx = new TextScramble(el);
            
            // Create intersection observer to trigger effect when visible
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fx.setText(originalText);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(el);
        });

        // Apply to hero heading for initial effect
        const heroHeading = document.querySelector('.hero h1');
        const heroFx = new TextScramble(heroHeading);
        setTimeout(() => {
            heroFx.setText(heroHeading.textContent);
        }, 2000);
    }
    
    // ===============================
    // Magnetic Elements
    // ===============================
    function initMagneticElements() {
        const magneticElements = document.querySelectorAll('.deck-button, .social-link, .project-link');
        
        magneticElements.forEach((el) => {
            el.classList.add('magnetic-element');
            
            el.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const distanceX = e.clientX - centerX;
                const distanceY = e.clientY - centerY;
                
                // Maximum movement in pixels
                const maxMovement = 15;
                
                // Calculate movement based on distance from center
                const moveX = (distanceX / rect.width) * maxMovement;
                const moveY = (distanceY / rect.height) * maxMovement;
                
                // Apply transform
                this.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            el.addEventListener('mouseleave', function() {
                // Reset position
                this.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ===============================
    // GSAP Animations
    // ===============================
    function triggerEntranceAnimations() {
        gsap.registerPlugin(ScrollTrigger);
        
        // Hero Animations
        gsap.to('.hero h1', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5
        });
        
        gsap.to('.hero p', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.8
        });
        
        gsap.to('.hero-btns .btn', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 1.1,
            stagger: 0.2
        });

        // About Section Animations
        gsap.to('.about-img img', {
            scrollTrigger: {
                trigger: '.about-img',
                start: 'top 80%'
            },
            opacity: 1,
            x: 0,
            duration: 1
        });
        
        gsap.to('.about-info', {
            scrollTrigger: {
                trigger: '.about-info',
                start: 'top 80%'
            },
            opacity: 1,
            x: 0,
            duration: 1
        });
        
        gsap.to('.stat-card', {
            scrollTrigger: {
                trigger: '.stats',
                start: 'top 80%'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2
        });

        // Skills Animation
        gsap.to('.skill-category', {
            scrollTrigger: {
                trigger: '.skills-container',
                start: 'top 80%'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2
        });
        
        // Animate skill bars
        document.querySelectorAll('.skill-progress').forEach(progress => {
            const width = progress.getAttribute('data-width');
            gsap.to(progress, {
                scrollTrigger: {
                    trigger: progress,
                    start: 'top 90%'
                },
                width: `${width}%`,
                duration: 1.5,
                ease: 'power2.out'
            });
        });

        // Timeline Animation
        gsap.to('.timeline-item', {
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top 80%'
            },
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2
        });

        // Project Deck Animation
        gsap.to('.slider-container', {
            scrollTrigger: {
                trigger: '.slider-container',
                start: 'top 80%'
            },
            opacity: 1,
            y: 0,
            duration: 1
        });

        // Publications Animation
        gsap.to('.publication-card', {
            scrollTrigger: {
                trigger: '.publications-list',
                start: 'top 80%'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2
        });

        // Contact Animation
        gsap.to('.contact-info', {
            scrollTrigger: {
                trigger: '.contact-content',
                start: 'top 80%'
            },
            opacity: 1,
            x: 0,
            duration: 0.8
        });
        
        gsap.to('.contact-form', {
            scrollTrigger: {
                trigger: '.contact-content',
                start: 'top 80%'
            },
            opacity: 1,
            x: 0,
            duration: 0.8
        });
    }

    // ===============================
    // DNA Animation
    // ===============================
    function createDNAAnimation() {
        const dnaContainer = document.createElement('div');
        dnaContainer.classList.add('dna-container');
        document.querySelector('.hero').appendChild(dnaContainer);
        
        const dnaStrand = document.createElement('div');
        dnaStrand.classList.add('dna-strand');
        dnaContainer.appendChild(dnaStrand);
        
        const baseCount = 20;
        
        for (let i = 0; i < baseCount; i++) {
            const leftBase = document.createElement('div');
            leftBase.classList.add('dna-base');
            leftBase.style.top = `${(i * 40) + 100}px`;
            leftBase.style.left = 0;
            leftBase.style.animationDelay = `${i * 0.2}s`;
            dnaContainer.appendChild(leftBase);
            
            const rightBase = document.createElement('div');
            rightBase.classList.add('dna-base');
            rightBase.style.top = `${(i * 40) + 100}px`;
            rightBase.style.left = 0;
            rightBase.style.animationDelay = `${i * 0.2 + 0.5}s`;
            dnaContainer.appendChild(rightBase);
        }
    }
    
    // 3D Protein Animation with Three.js
    function initProteinAnimation() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        document.querySelector('.molecule-animation').appendChild(renderer.domElement);
        
        // Create a protein-like structure using spheres and cylinders
        const proteinGroup = new THREE.Group();
        
        // Random amino acid positions
        const aminoAcids = [];
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            
            aminoAcids.push(new THREE.Vector3(x, y, z));
        }
        
        // Create spheres for amino acids
        const aminoGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        
        for (let i = 0; i < aminoAcids.length; i++) {
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.5); // More blue hues
            
            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(aminoGeometry, material);
            
            sphere.position.copy(aminoAcids[i]);
            proteinGroup.add(sphere);
            
            // Connect nearby amino acids with bonds
            for (let j = 0; j < i; j++) {
                const distance = aminoAcids[i].distanceTo(aminoAcids[j]);
                
                if (distance < 2) {
                    const bondGeometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
                    const bondMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
                    const bond = new THREE.Mesh(bondGeometry, bondMaterial);
                    
                    // Position and rotate the bond to connect the spheres
                    const midpoint = new THREE.Vector3().addVectors(aminoAcids[i], aminoAcids[j]).multiplyScalar(0.5);
                    bond.position.copy(midpoint);
                    
                    // Align the cylinder with the direction between spheres
                    bond.lookAt(aminoAcids[j]);
                    bond.rotateX(Math.PI / 2);
                    
                    proteinGroup.add(bond);
                }
            }
        }
        
        scene.add(proteinGroup);
        camera.position.z = 15;
        
        // Mouse interaction with the protein
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Smoother rotation
            targetRotationX = mouseY * 0.5;
            targetRotationY = mouseX * 0.5;
        });
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            
            // Smooth rotation
            proteinGroup.rotation.x += (targetRotationX - proteinGroup.rotation.x) * 0.05;
            proteinGroup.rotation.y += (targetRotationY - proteinGroup.rotation.y) * 0.05;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ===============================
    // Contact Form Handling
    // ===============================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const submitButton = contactForm.querySelector('.form-submit');
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            setTimeout(() => {
                submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                contactForm.reset();
                
                setTimeout(() => {
                    submitButton.innerHTML = 'Send Message';
                }, 3000);
            }, 2000);
        });
    }

    // Initialize components
    createDNAAnimation();
    initProteinAnimation();
    generateProjectCards();
    setupDragInteraction();
    setupTextScramble();
    initMagneticElements();
    
    // Setup interactive particle background
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas when window is resized
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Enhanced Particle class with mouse interaction
    class Particle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.size = Math.random() * 3 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = this.getRandomColor();
            this.baseSize = this.size;
            this.density = Math.random() * 30 + 10; // Used for mouse repulsion
        }
        
        getRandomColor() {
            const colors = ['rgba(14, 165, 233, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(30, 58, 138, 0.7)'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update(mousePosition) {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Boundary check
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
            
            // Mouse interaction
            if (mousePosition && mousePosition.x && mousePosition.y) {
                // Distance from mouse
                const dx = this.x - mousePosition.x;
                const dy = this.y - mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;
                
                if (distance < maxDistance) {
                    // Create force direction away from mouse
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    
                    // The closer to the mouse, the stronger the repulsion
                    const force = (maxDistance - distance) / maxDistance;
                    
                    // Apply force based on particle density
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;
                    
                    // Move particle away from mouse
                    this.x += directionX;
                    this.y += directionY;
                    
                    // Grow particle based on proximity
                    this.size = this.baseSize + (this.baseSize * force * 2);
                } else {
                    // Return to base size
                    if (this.size > this.baseSize) {
                        this.size -= 0.1;
                    }
                }
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Create particles
    const particles = [];
    const particleCount = 150;
    let mousePosition = { x: null, y: null };
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Mouse move handler
    document.addEventListener('mousemove', function(e) {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    });
    
    // Mouse out handler
    document.addEventListener('mouseout', function() {
        mousePosition.x = null;
        mousePosition.y = null;
    });
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(mousePosition);
            particles[i].draw();
            
            // Connect particles with lines if they are close enough
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 - distance/500})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
});