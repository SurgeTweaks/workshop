// Nemesis Esport - Main JavaScript

// DOM Elements
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const burger = document.querySelector('.burger');
const navMenu = document.querySelector('.nav-menu');
const heroStats = document.querySelectorAll('.stat-number');
const teamCards = document.querySelectorAll('.team-card');
const timelineItems = document.querySelectorAll('.timeline-item');
const contactForm = document.querySelector('.contact-form form');
const socialLinks = document.querySelectorAll('.social-link');

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initSmoothScrolling();
    initNavbarEffects();
    initMobileMenu();
    initCounterAnimation();
    initScrollAnimations();
    initFormHandling();
    initInteractiveEffects();
    initParallaxEffects();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }

                // Update active link
                updateActiveLink(targetId);
            }
        });
    });
}

function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Ajouter le lazy loading
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        if (!img.classList.contains('hero-image')) {
            img.setAttribute('decoding', 'async');
        }
    });
}

// Appeler cette fonction au chargement
document.addEventListener('DOMContentLoaded', optimizeImages);

// Navbar scroll effects
function initNavbarEffects() {
    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        // Navbar background opacity
        if (scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.borderBottom = '1px solid rgba(0, 255, 255, 0.2)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.borderBottom = '1px solid rgba(0, 255, 255, 0.1)';
        }

        // Update active section based on scroll position
        updateActiveSection();
    });
}

// Mobile menu toggle
function initMobileMenu() {
    burger.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    burger.classList.toggle('active');

    // Animate burger lines
    const spans = burger.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (burger.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translateY(9px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translateY(-9px)';
        } else {
            span.style.transform = '';
            span.style.opacity = '';
        }
    });
}

// Counter animation for hero stats
function initCounterAnimation() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    heroStats.forEach(stat => {
        statsObserver.observe(stat);
    });
}

function animateCounter(element) {
    const finalValue = element.textContent;
    const isNumber = !isNaN(parseInt(finalValue));

    if (isNumber) {
        const target = parseInt(finalValue);
        let current = 0;
        const increment = target / 60; // 60 frames for ~1 second at 60fps

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16); // ~60fps
    } else {
        // For text values like "2024", just animate opacity
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Stagger animation for team cards
                if (entry.target.classList.contains('team-card')) {
                    const cards = document.querySelectorAll('.team-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const elementsToAnimate = [
        ...teamCards,
        ...timelineItems,
        document.querySelector('.contact-form'),
        document.querySelector('.contact-info')
    ];

    elementsToAnimate.forEach(el => {
        if (el) {
            scrollObserver.observe(el);
        }
    });
}

// Form handling
function initFormHandling() {
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;

            // Basic validation
            if (!name || !email || !message) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = this.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Envoi...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Message envoyé ✓';
                submitBtn.style.background = 'linear-gradient(135deg, #00ff00, #00aa00)';

                showNotification('Message envoyé avec succès !', 'success');
                this.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }, 2000);
        });
    }
}

// Interactive effects
function initInteractiveEffects() {
    // Team card hover effects
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            // Add glow effect to other cards
            teamCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', function () {
            teamCards.forEach(otherCard => {
                otherCard.style.opacity = '';
            });
        });
    });

    // Social links hover effects
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });

        link.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

// Parallax effects
function initParallaxEffects() {
    const floatingLogo = document.querySelector('.floating-logo');

    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;

        if (floatingLogo && scrolled < window.innerHeight) {
            floatingLogo.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Utility functions
function updateActiveLink(targetId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            updateActiveLink(sectionId);
        }
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #00aa00, #00ff00);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #aa0000, #ff0000);' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #4B228D, #00FFFF);' : ''}
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .team-card,
    .timeline-item,
    .contact-form,
    .contact-info {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: start;
            padding: 2rem;
            transition: all 0.3s ease;
        }
        
        .nav-menu.active {
            right: 0;
        }
        
        .nav-menu li {
            margin-bottom: 1rem;
        }
        
        .nav-link {
            font-size: 1.5rem;
        }
    }
`;

document.head.appendChild(style);

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce scroll events for better performance
window.addEventListener('scroll', debounce(initNavbarEffects, 10));

// Easter egg - Konami code
let konamiCode = [];
const targetCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

document.addEventListener('keydown', function (e) {
    konamiCode.push(e.keyCode);

    if (konamiCode.length > targetCode.length) {
        konamiCode.shift();
    }

    if (konamiCode.join(',') === targetCode.join(',')) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    const logo = document.querySelector('.nav-logo img');
    if (logo) {
        logo.style.animation = 'spin 2s linear infinite';
        showNotification('🎮 Konami Code activé ! Mode Pro Gaming ON ! 🚀', 'success');

        setTimeout(() => {
            logo.style.animation = '';
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.shop .btn-primary').forEach(button => {
        button.addEventListener('click', () => {
            showNotification('Fonctionnalité d\'achat à venir !', 'info');
        });
    });
});

// Redirection vers la page du joueur au clic
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.team-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            if (link) window.location.href = link;
        });
    });
});

// Add spin animation for easter egg
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);

console.log('🎮 Nemesis Esport website loaded successfully!');
console.log('💡 Try the Konami Code: ↑↑↓↓←→←→BA');