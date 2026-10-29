/**
 * DIVYANSHI PORTFOLIO - CORE ENGINE & INTERACTION LOGIC
 * Includes: Neural Particle Canvas, 3D Card Physics, Scroll Reveals,
 * Dynamic Accent Themes, Filtering, Modals & Toast System.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. ACCENT THEME PICKER & LOCAL STORAGE PERSISTENCE
     ========================================================================== */
  const themePickerBtn = document.getElementById('themePickerBtn');
  const paletteDropdown = document.getElementById('paletteDropdown');
  const paletteOpts = document.querySelectorAll('.palette-opt');
  const currentDot = document.querySelector('.palette-dot.current-dot');

  // Load saved theme if present (default to modern Neon Violet)
  const savedTheme = localStorage.getItem('divyanshi_portfolio_theme') || 'violet';
  applyTheme(savedTheme);

  if (themePickerBtn && paletteDropdown) {
    themePickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      paletteDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!paletteDropdown.contains(e.target) && e.target !== themePickerBtn) {
        paletteDropdown.classList.remove('show');
      }
    });

    paletteOpts.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedColor = btn.getAttribute('data-color');
        applyTheme(selectedColor);
        paletteDropdown.classList.remove('show');
        showToast(`Theme changed to ${btn.textContent.trim()} mode!`, 'success');
      });
    });
  }

  function applyTheme(colorName) {
    document.body.setAttribute('data-theme-color', colorName);
    localStorage.setItem('divyanshi_portfolio_theme', colorName);

    paletteOpts.forEach((opt) => {
      if (opt.getAttribute('data-color') === colorName) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    if (currentDot) {
      const colors = {
        violet: '#a855f7',
        cyan: '#00f0ff',
        emerald: '#10b981',
        amber: '#f59e0b',
      };
      currentDot.style.backgroundColor = colors[colorName] || '#a855f7';
      currentDot.style.boxShadow = `0 0 10px ${colors[colorName] || '#a855f7'}`;
    }
  }

  /* ==========================================================================
     2. NEURAL PARTICLE CANVAS BACKGROUND
     ========================================================================== */
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.baseRadius = this.radius;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from borders
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * 2.5;
            const directionY = forceDirectionY * force * 2.5;

            this.x -= directionX;
            this.y -= directionY;
            this.radius = this.baseRadius * 1.5;
          } else {
            this.radius = this.baseRadius;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent-primary') || '#a855f7';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let particles = [];
    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${getComputedStyle(document.body).getPropertyValue('--accent-rgb') || '168, 85, 247'}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     3. DYNAMIC MOUSE SPOTLIGHT GLOW
     ========================================================================== */
  const mouseGlow = document.getElementById('mouseGlow');
  if (mouseGlow) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let currentX = glowX;
    let currentY = glowY;

    window.addEventListener('mousemove', (e) => {
      glowX = e.clientX;
      glowY = e.clientY;
    });

    function renderGlow() {
      currentX += (glowX - currentX) * 0.1;
      currentY += (glowY - currentY) * 0.1;
      mouseGlow.style.left = `${currentX}px`;
      mouseGlow.style.top = `${currentY}px`;
      requestAnimationFrame(renderGlow);
    }
    renderGlow();
  }

  /* ==========================================================================
     4. HERO CARD 3D TILT EFFECT
     ========================================================================== */
  const heroCardWrapper = document.getElementById('heroCardWrapper');
  if (heroCardWrapper && window.innerWidth > 992) {
    heroCardWrapper.addEventListener('mousemove', (e) => {
      const rect = heroCardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      heroCardWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroCardWrapper.addEventListener('mouseleave', () => {
      heroCardWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  /* ==========================================================================
     5. TYPEWRITER ANIMATION FOR HERO
     ========================================================================== */
  const typewriterElement = document.getElementById('typewriterText');
  if (typewriterElement) {
    const roles = [
      'Software Engineer',
      'DSA & Problem Solving Specialist',
      'C, C++ & Python Developer',
      'Hackathon Winner & Finalist',
      'B.Tech CSE Undergraduate',
      'Competitive Problem Solver'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function typeEffect() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        // Pause at the end of the phrase
        typingSpeed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeEffect, typingSpeed);
    }
    setTimeout(typeEffect, 600);
  }

  /* ==========================================================================
     6. NAVBAR SCROLL EFFECT & SECTION SPY
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Add blurred background on scroll
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active navigation item based on scroll position
    let scrollPosition = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  /* ==========================================================================
     7. MOBILE MENU TOGGLE
     ========================================================================== */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !expanded);
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking nav items
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     8. STATS COUNTER ANIMATION (ON SCROLL)
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-num');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach((stat) => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const isPercent = stat.textContent.includes('%');
          let current = 0;
          const duration = 1600;
          const stepTime = Math.max(Math.floor(duration / target), 25);

          const timer = setInterval(() => {
            current += 1;
            stat.textContent = `${current}${isPercent ? '%' : '+'}`;
            if (current >= target) {
              clearInterval(timer);
            }
          }, stepTime);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) {
    statsObserver.observe(statsStrip);
  }

  /* ==========================================================================
     9. SCROLL REVEAL OBSERVER
     ========================================================================== */
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  scrollElements.forEach((el) => elementObserver.observe(el));

  /* ==========================================================================
     10. SKILLS CATEGORY FILTER
     ========================================================================== */
  const skillTabs = document.querySelectorAll('#skillTabs .filter-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      skillTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          // Re-trigger animation
          const fill = card.querySelector('.skill-bar-fill');
          if (fill) {
            fill.style.animation = 'none';
            void fill.offsetWidth; // Trigger reflow
            fill.style.animation = 'growBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ==========================================================================
     11. PROJECTS FILTER TABS
     ========================================================================== */
  const projFilterBtns = document.querySelectorAll('.proj-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      projFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = card.classList.contains('featured-project') && window.innerWidth > 1024 ? 'grid' : 'flex';
          card.classList.add('visible');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     12. PROJECT DEEP DIVE MODAL SYSTEM
     ========================================================================== */
  const projectModal = document.getElementById('projectModal');
  const closeProjectBtn = document.getElementById('closeProjectBtn');
  const closeProjectBtn2 = document.getElementById('closeProjectBtn2');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectSubtitle = document.getElementById('modalProjectSubtitle');
  const modalProjectBody = document.getElementById('modalProjectBody');
  const openProjModalBtns = document.querySelectorAll('.open-proj-modal');

  const projectData = {
    dsavision: {
      title: 'DSAVision: 3D Interactive Algorithm & Tree Visualizer',
      subtitle: 'Flagship DSA Engine • C++, Python, HTML5 Canvas, Algorithms',
      html: `
        <div class="resume-block">
          <h4><i class="fa-solid fa-diagram-project"></i> Project Overview</h4>
          <p>DSAVision is an interactive computational visualizer built to demystify complex data structure operations in real time. It renders dynamic memory pointer movements, tree balance rotations, and graph traversals frame-by-frame.</p>
        </div>
        <div class="resume-block">
          <h4><i class="fa-solid fa-microchip"></i> Algorithmic Architecture</h4>
          <ul>
            <li><strong>Self-Balancing AVL & Red-Black Trees:</strong> Real-time visualization of LL, RR, LR, and RL rotations with balance factor tracking.</li>
            <li><strong>Graph Shortest Path Traversals:</strong> Step-by-step animations of Dijkstra's algorithm, Breadth-First Search (BFS), and Depth-First Search (DFS) on weighted graphs.</li>
            <li><strong>Complexity Benchmarking:</strong> Displays live time and space complexity gauges (Big-O analysis) for every mutation.</li>
          </ul>
        </div>
        <div class="resume-block">
          <h4><i class="fa-solid fa-trophy"></i> Impact & Recognition</h4>
          <p>Used by university peers and students in DSA study groups to master graph algorithms and recursion visually.</p>
        </div>
      `
    },
    codepulse: {
      title: 'CodePulse: Fast Code Execution Sandbox & Arena',
      subtitle: 'Systems Engineering • C++17, Python, Linux System Calls, Process Isolation',
      html: `
        <div class="resume-block">
          <h4><i class="fa-solid fa-terminal"></i> Purpose & Problem Solved</h4>
          <p>Built a lightweight, isolated code evaluation engine that compiles, executes, and benchmarks user-submitted C++ and Python code against edge-case test suites safely.</p>
        </div>
        <div class="resume-block">
          <h4><i class="fa-solid fa-gear"></i> Technical Highlights</h4>
          <ul>
            <li><strong>Low-Overhead Execution:</strong> Sub-process orchestration using native POSIX system calls with strict execution timeouts (TLE detection) and memory caps.</li>
            <li><strong>Automated Test Evaluator:</strong> Diff checker that validates output streams against accepted solutions, handling whitespace tolerance and runtime error (RTE) capture.</li>
          </ul>
        </div>
      `
    },
    neuropredict: {
      title: 'NeuroPredict: Healthcare Analytics & Risk Classifier',
      subtitle: 'Machine Learning & Python • Scikit-learn, Pandas, Flask, Data Structures',
      html: `
        <div class="resume-block">
          <h4><i class="fa-brands fa-python"></i> Predictive Modeling</h4>
          <p>Engineered during a 36-hour hackathon to analyze multi-parameter patient vital statistics and forecast early risk anomalies using supervised classification models.</p>
        </div>
        <div class="resume-block">
          <h4><i class="fa-solid fa-bolt"></i> Key Features</h4>
          <ul>
            <li><strong>Feature Engineering Pipeline:</strong> Automated data imputation and normalization pipeline using Pandas and NumPy.</li>
            <li><strong>High-Speed Scoring:</strong> REST API service providing inference in under 15ms.</li>
          </ul>
        </div>
      `
    },
    huffman: {
      title: 'Huffman File Compressor & Decompressor in C',
      subtitle: 'Systems Programming & Algorithms • C Language, Min-Heap, Bit Manipulation',
      html: `
        <div class="resume-block">
          <h4><i class="fa-solid fa-file-zipper"></i> Algorithmic Mastery</h4>
          <p>A lossless data compression tool implemented from scratch in pure C, leveraging Huffman Coding, priority queues (min-heaps), and bitwise serialization.</p>
        </div>
        <div class="resume-block">
          <h4><i class="fa-solid fa-code"></i> Implementation Details</h4>
          <ul>
            <li><strong>Dynamic Min-Heap:</strong> Custom array-based priority queue for constructing prefix-free binary Huffman trees.</li>
            <li><strong>Bit-Level Serialization:</strong> Bitwise operators (&lt;&lt;, &gt;&gt;, &amp;, |) to write packed bitstreams directly into output binaries.</li>
            <li><strong>Compression Ratio:</strong> Consistently achieves 40-60% compression on plain-text datasets with 100% reconstruction fidelity.</li>
          </ul>
        </div>
      `
    }
  };

  openProjModalBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-proj');
      const data = projectData[projKey];

      if (data && projectModal) {
        modalProjectTitle.textContent = data.title;
        modalProjectSubtitle.textContent = data.subtitle;
        modalProjectBody.innerHTML = data.html;
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeProjectModalFunc() {
    if (projectModal) {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeProjectBtn) closeProjectBtn.addEventListener('click', closeProjectModalFunc);
  if (closeProjectBtn2) closeProjectBtn2.addEventListener('click', closeProjectModalFunc);

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModalFunc();
      }
    });
  }

  /* ==========================================================================
     13. RESUME MODAL & SIMULATED DOWNLOAD
     ========================================================================= */
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtn = document.getElementById('openResumeBtn');
  const closeResumeBtn = document.getElementById('closeResumeBtn');
  const closeResumeBtn2 = document.getElementById('closeResumeBtn2');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');

  if (openResumeBtn && resumeModal) {
    openResumeBtn.addEventListener('click', () => {
      resumeModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeResumeFunc = () => {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeFunc);
    if (closeResumeBtn2) closeResumeBtn2.addEventListener('click', closeResumeFunc);

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResumeFunc();
      }
    });

    if (downloadResumeBtn) {
      downloadResumeBtn.addEventListener('click', () => {
        downloadResumeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';
        setTimeout(() => {
          downloadResumeBtn.innerHTML = '<i class="fa-solid fa-check"></i> CV Downloaded!';
          showToast('Divyanshi_Resume_2026.pdf prepared and downloaded successfully!', 'success');
          setTimeout(() => {
            downloadResumeBtn.innerHTML = '<i class="fa-solid fa-download"></i> <span>Download CV (PDF)</span>';
          }, 2500);
        }, 1200);
      });
    }
  }

  /* ==========================================================================
     14. QUICK EMAIL COPY UTILITY
     ========================================================================== */
  const emailButtons = [
    document.getElementById('quickCopyEmailBtn'),
    document.getElementById('copyMailBtn')
  ];

  emailButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = 'divyanshi.cse@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied to clipboard: ${email}`, 'success');
        }).catch(() => {
          showToast(`Direct email: ${email}`, 'info');
        });
      });
    }
  });

  /* ==========================================================================
     15. INTERACTIVE CONTACT FORM WITH VALIDATION & TOAST FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const submitFormBtn = document.getElementById('submitFormBtn');

  if (contactForm && submitFormBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const emailInput = document.getElementById('userEmail');
      const subjectInput = document.getElementById('messageSubject');
      const messageInput = document.getElementById('userMessage');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Subject
      if (!subjectInput.value) {
        subjectInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        subjectInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (!isValid) {
        showToast('Please fix the highlighted fields in the form.', 'error');
        return;
      }

      // Simulate sending with nice loading state
      submitFormBtn.classList.add('btn-loading');
      submitFormBtn.disabled = true;

      setTimeout(() => {
        submitFormBtn.classList.remove('btn-loading');
        submitFormBtn.disabled = false;
        contactForm.reset();
        showToast('Thank you, Divyanshi has received your message! Expect a reply within 24 hours.', 'success');
      }, 1400);
    });

    // Remove errors on input
    ['userName', 'userEmail', 'messageSubject', 'userMessage'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.closest('.form-group').classList.remove('has-error');
        });
      }
    });
  }

  /* ==========================================================================
     16. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  /* ==========================================================================
     17. CURRENT YEAR FOOTER
     ========================================================================== */
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     18. ESCAPE KEY MODAL DISMISSAL
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModal && projectModal.classList.contains('active')) {
        closeProjectModalFunc();
      }
      if (resumeModal && resumeModal.classList.contains('active')) {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (paletteDropdown && paletteDropdown.classList.contains('show')) {
        paletteDropdown.classList.remove('show');
      }
    }
  });

  // Welcome console message for recruiters & engineers
  console.log(
    '%c⚡ Divyanshi | Software Engineer & DSA Specialist\n%cB.Tech CSE • C, C++, Python & Data Structures\nEmail: divyanshi.cse@gmail.com',
    'color: #a855f7; font-weight: bold; font-size: 14px;',
    'color: #94a3b8; font-size: 11px;'
  );
});
