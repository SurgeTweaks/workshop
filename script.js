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

// Variables globales pour le panier
let cart = [];
let cartSidebar, cartItems, cartCount, cartTotal, cartButton, closeCart, checkoutButton, cartOverlay;

document.addEventListener('DOMContentLoaded', function () {
    initSmoothScrolling();
    initNavbarEffects();
    initMobileMenu();
    initCounterAnimation();
    initScrollAnimations();
    initFormHandling();
    initInteractiveEffects();
    initParallaxEffects();
    initCart(); // Ajouter l'initialisation du panier
});

// Initialiser le panier
function initCart() {
    // Initialiser les éléments du DOM
    cartSidebar = document.getElementById('cartSidebar');
    cartItems = document.getElementById('cartItems');
    cartCount = document.getElementById('cartCount');
    cartTotal = document.getElementById('cartTotal');
    cartButton = document.getElementById('cartButton');
    closeCart = document.getElementById('closeCart');
    checkoutButton = document.getElementById('checkoutButton');

    // Créer l'overlay
    cartOverlay = document.createElement('div');
    cartOverlay.className = 'cart-overlay';
    document.body.appendChild(cartOverlay);

    // Charger le panier depuis le localStorage
    const savedCart = localStorage.getItem('nemesisCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Événements pour le panier
    if (cartButton) {
        cartButton.addEventListener('click', function (e) {
            e.preventDefault();
            openCart();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', closeCartHandler);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartHandler);
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }

    // Événements pour les boutons d'achat
    document.querySelectorAll('.shop-item .btn-primary').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const shopItem = this.closest('.shop-item');
            addToCart(shopItem);
        });
    });
}

// Ajouter un produit au panier
function addToCart(shopItem) {
    const productName = shopItem.querySelector('h3').textContent;
    const productPrice = parseFloat(shopItem.querySelector('.price').textContent.replace('€', '').replace(',', '.').trim());
    const productImage = shopItem.querySelector('img').src;

    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.name === productName);

    if (existingItemIndex !== -1) {
        // Produit déjà dans le panier, augmenter la quantité
        cart[existingItemIndex].quantity += 1;
    } else {
        // Nouveau produit
        cart.push({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    // Sauvegarder le panier et mettre à jour l'UI
    saveCart();
    updateCartUI();
    showNotification(`${productName} ajouté au panier!`, 'success');

    // Ouvrir le panier automatiquement
    openCart();
}

// Ouvrir le panier
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermer le panier
function closeCartHandler() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Mettre à jour l'interface du panier
function updateCartUI() {
    // Mettre à jour le compteur
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Vider le contenu actuel du panier
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;

        // Ajouter chaque article du panier
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                        <button class="remove-item" data-index="${index}">&times;</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        // Ajouter les événements pour les boutons de quantité
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    // Mettre à jour le total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)} €`;
}

// Mettre à jour la quantité d'un article
function updateQuantity(index, change) {
    cart[index].quantity += change;

    // Supprimer l'article si la quantité est 0
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    // Sauvegarder et mettre à jour
    saveCart();
    updateCartUI();
}

// Supprimer un article du panier
function removeFromCart(index) {
    const removedItem = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification(`${removedItem} retiré du panier`, 'info');
}

// Sauvegarder le panier dans le localStorage
function saveCart() {
    localStorage.setItem('nemesisCart', JSON.stringify(cart));
}

// Commander
function checkout() {
    if (cart.length === 0) return;

    showNotification('Fonctionnalité de commande à venir!', 'info');

    // Simuler un processus de commande
    checkoutButton.textContent = 'Traitement...';
    checkoutButton.disabled = true;

    setTimeout(() => {
        // Réinitialiser le panier après la commande
        cart = [];
        saveCart();
        updateCartUI();
        closeCartHandler();

        checkoutButton.textContent = 'Commander';
        checkoutButton.disabled = false;

        showNotification('Commande passée avec succès! (simulation)', 'success');
    }, 2000);
}

// Variables pour le processus de paiement
let checkoutModal, closeCheckout, checkoutForm, checkoutSteps;
let currentStep = 1;

// Initialiser le processus de paiement
function initCheckout() {
    checkoutModal = document.getElementById('checkoutModal');
    closeCheckout = document.getElementById('closeCheckout');
    checkoutForm = document.getElementById('checkoutForm');
    checkoutSteps = document.querySelectorAll('.checkout-step');

    // Événements pour la modale de paiement
    if (closeCheckout) {
        closeCheckout.addEventListener('click', closeCheckoutModal);
    }

    // Événements pour les étapes
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function () {
            const nextStep = parseInt(this.getAttribute('data-next'));
            goToStep(nextStep);
        });
    });

    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function () {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });

    // Changer l'affichage selon la méthode de paiement
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });

            if (this.value === 'card') {
                document.getElementById('card-details').style.display = 'block';
            } else if (this.value === 'paypal') {
                document.getElementById('paypal-details').style.display = 'block';
            }
        });
    });

    // Soumission du formulaire
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', processPayment);
    }

    // Fermeture après confirmation
    const confirmationClose = document.getElementById('confirmation-close');
    if (confirmationClose) {
        confirmationClose.addEventListener('click', function () {
            closeCheckoutModal();
            // Réinitialiser le formulaire
            checkoutForm.reset();
            goToStep(1);
        });
    }
}

// Ouvrir la modale de paiement
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'error');
        return;
    }

    // Mettre à jour le récapitulatif
    updateCheckoutSummary();

    // Réinitialiser les étapes
    goToStep(1);

    // Afficher la modale
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermer la modale de paiement
function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Aller à une étape spécifique
function goToStep(step) {
    // Cacher toutes les étapes
    checkoutSteps.forEach(s => {
        s.style.display = 'none';
    });

    // Afficher l'étape demandée
    document.getElementById(`step${step}`).style.display = 'block';

    // Mettre à jour les indicateurs d'étape
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');

    currentStep = step;
}

// Mettre à jour le récapitulatif de commande
function updateCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary-items');
    const totalElement = document.getElementById('checkout-total-amount');

    if (!summaryContainer || !totalElement) return;

    // Vider le contenu existant
    summaryContainer.innerHTML = '';

    // Ajouter les articles
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} €</span>
        `;
        summaryContainer.appendChild(itemElement);
    });

    // Calculer et afficher le total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `${total.toFixed(2)} €`;
}

// Traiter le paiement
function processPayment(e) {
    e.preventDefault();

    // Simuler le traitement du paiement
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Traitement en cours...';
    submitBtn.disabled = true;

    // Simuler un délai de traitement
    setTimeout(() => {
        // Générer un numéro de commande aléatoire
        const orderNumber = 'NEM-' + Math.floor(100000 + Math.random() * 900000);

        // Afficher l'étape de confirmation
        goToStep(3);

        // Remplir les informations de confirmation
        document.getElementById('confirmation-email').textContent =
            document.getElementById('checkout-email').value;
        document.getElementById('order-number').textContent = orderNumber;

        // Vider le panier
        cart = [];
        saveCart();
        updateCartUI();

        // Réactiver le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Modifier la fonction checkout existante
function checkout() {
    if (cart.length === 0) return;
    openCheckoutModal();
}

// Initialiser le processus de paiement au chargement
document.addEventListener('DOMContentLoaded', function () {
    initCheckout();
});

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Gérer le cas spécial du panier
            if (targetId === '#cart') {
                openCart();
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Fermer le menu mobile si ouvert
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }

                // Mettre à jour le lien actif
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