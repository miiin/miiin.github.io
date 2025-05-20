// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Variables
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.header');
  const contactForm = document.getElementById('contact-form');
  
  // Toggle mobile navigation
  navToggle.addEventListener('click', function() {
      navList.classList.toggle('active');
      
      // Toggle hamburger menu animation
      const hamburger = this.querySelector('.hamburger');
      hamburger.classList.toggle('active');
      
      if (hamburger.classList.contains('active')) {
          hamburger.style.transform = 'rotate(45deg)';
          hamburger.style.backgroundColor = 'transparent';
          
          // Adjust pseudo-elements for X shape
          document.documentElement.style.setProperty('--hamburger-before', 'rotate(45deg) translate(5px, 5px)');
          document.documentElement.style.setProperty('--hamburger-after', 'rotate(-45deg) translate(5px, -5px)');
      } else {
          hamburger.style.transform = 'rotate(0)';
          hamburger.style.backgroundColor = 'var(--dark-color)';
          
          // Reset pseudo-elements
          document.documentElement.style.setProperty('--hamburger-before', 'none');
          document.documentElement.style.setProperty('--hamburger-after', 'none');
      }
  });
  
  // Close mobile navigation when clicking on a link
  navLinks.forEach(link => {
      link.addEventListener('click', function() {
          navList.classList.remove('active');
          
          // Reset hamburger icon
          const hamburger = navToggle.querySelector('.hamburger');
          hamburger.classList.remove('active');
          hamburger.style.transform = 'rotate(0)';
          hamburger.style.backgroundColor = 'var(--dark-color)';
          
          // Reset pseudo-elements
          document.documentElement.style.setProperty('--hamburger-before', 'none');
          document.documentElement.style.setProperty('--hamburger-after', 'none');
      });
  });
  
  // Add header shadow on scroll
  window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
          header.classList.add('scrolled');
      } else {
          header.classList.remove('scrolled');
      }
  });
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
              const headerHeight = header.offsetHeight;
              const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              
              window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
              });
          }
      });
  });
  
  // Animate elements on scroll
  const animateElements = document.querySelectorAll('.timeline-item, .skill-item, .project-card, .education-item, .opensource-card, .blog-post');
  
  function checkScroll() {
      animateElements.forEach(element => {
          const elementTop = element.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;
          
          if (elementTop < windowHeight - 100) {
              element.classList.add('animate');
          }
      });
  }
  
  // Check elements on initial load
  checkScroll();
  
  // Check elements on scroll
  window.addEventListener('scroll', checkScroll);
  
  // Form submission handling
  if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Get form data
          const formData = new FormData(this);
          const formObject = {};
          
          formData.forEach((value, key) => {
              formObject[key] = value;
          });
          
          // Here you would typically send the form data to a server
          // For this example, we'll simulate a successful submission
          console.log('Form data:', formObject);
          
          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'form-success';
          successMessage.textContent = 'Thank you! Your message has been sent successfully.';
          
          // Replace form with success message
          this.style.display = 'none';
          this.parentNode.appendChild(successMessage);
          
          // Reset form for future submissions
          this.reset();
      });
  }
  
  // Typed.js implementation for dynamic text in hero section
  const heroTitle = document.querySelector('.hero-title');
  
  if (heroTitle && typeof Typed !== 'undefined') {
      new Typed(heroTitle, {
          strings: ['Backend Developer', 'Technical Architect', 'System Designer', 'Problem Solver'],
          typeSpeed: 50,
          backSpeed: 30,
          loop: true,
          backDelay: 2000,
          startDelay: 1000
      });
  }
  
  // Add skill bar animation
  const skillBars = document.querySelectorAll('.skill-level');
  
  function animateSkillBars() {
      skillBars.forEach(bar => {
          const barSection = bar.closest('.skills');
          const barPosition = barSection.getBoundingClientRect().top;
          const screenPosition = window.innerHeight / 1.3;
          
          if (barPosition < screenPosition) {
              bar.style.width = bar.style.width || '0%';
              const targetWidth = bar.getAttribute('data-width') || bar.style.width;
              
              // Animate from 0 to target width
              let width = 0;
              const interval = setInterval(() => {
                  if (width >= parseInt(targetWidth)) {
                      clearInterval(interval);
                  } else {
                      width += 1;
                      bar.style.width = width + '%';
                  }
              }, 10);
          }
      });
  }
  
  // Trigger skill bar animation on scroll
  window.addEventListener('scroll', animateSkillBars);
  
  // Initialize counters for open source stats
  const counterElements = document.querySelectorAll('.opensource-stat span');
  
  function animateCounters() {
      counterElements.forEach(counter => {
          const counterSection = counter.closest('.opensource');
          const counterPosition = counterSection.getBoundingClientRect().top;
          const screenPosition = window.innerHeight / 1.3;
          
          if (counterPosition < screenPosition) {
              const target = parseInt(counter.textContent);
              let count = 0;
              const interval = setInterval(() => {
                  if (count >= target) {
                      clearInterval(interval);
                  } else {
                      count += Math.ceil(target / 100);
                      if (count > target) count = target;
                      counter.textContent = count;
                  }
              }, 20);
          }
      });
  }
  
  // Trigger counter animation on scroll
  window.addEventListener('scroll', animateCounters);
});