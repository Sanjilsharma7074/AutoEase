// Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-link").forEach((n) =>
    n.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    })
  );
}

// Small UI helpers for new theme
document.addEventListener('DOMContentLoaded', () => {
  // Subtle entrance reveal for elements with .reveal
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.animationDelay = (i * 60) + 'ms';
  });

  // Simple smooth image loading: add .loaded when each card image finishes
  document.querySelectorAll('.card .media, .car-image img').forEach(img=>{
    if(img.complete) img.classList.add('loaded');
    else img.addEventListener('load', ()=> img.classList.add('loaded'));
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Date validation for booking forms
function validateDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return { valid: false, message: "Start date cannot be in the past" };
  }

  if (end <= start) {
    return { valid: false, message: "End date must be after start date" };
  }
}

  document.addEventListener("DOMContentLoaded", function () {
    // Add click handlers for cards with hover effects
    const cards = document.querySelectorAll(
      ".car-card, .booking-card, .feature-card"
    );
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-5px)";
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
      });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll(".success, .error");
    alerts.forEach((alert) => {
      setTimeout(() => {
        alert.style.opacity = "0";
        setTimeout(() => alert.remove(), 300);
      }, 5000);
    });

    // Set minimum date for date inputs to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];
    dateInputs.forEach((input) => {
      input.min = today;
    });

    // Hide skeleton loader when cars are rendered into #carsContainer
    const carsContainer = document.getElementById('carsContainer');
    const loadingEl = document.getElementById('loading');
    if (carsContainer && loadingEl) {
      const obs = new MutationObserver(() => {
        if (carsContainer.children.length > 0) {
          loadingEl.style.display = 'none';
          obs.disconnect();
        }
      });
      obs.observe(carsContainer, { childList: true, subtree: false });
    }

    // Close modals with Escape and restore focus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => {
          if (m.style.display === 'block' || m.style.display === 'inline-block') {
            m.style.display = 'none';
          }
        });
      }
    });
  });

  // Monitor modal visibility and lock body scroll when any modal is open
  (function(){
    const modals = Array.from(document.querySelectorAll('.modal'));
    if(!modals.length) return;
    const check = ()=>{
      const anyOpen = modals.some(m=>{ try{ return window.getComputedStyle(m).display !== 'none' }catch(e){return false} });
      if(anyOpen) document.body.classList.add('modal-open'); else document.body.classList.remove('modal-open');
    };
    // initial check
    check();
    // observe style attribute changes on each modal
    modals.forEach(m=>{
      const obs = new MutationObserver(check);
      obs.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
    });
  })();

// Utility function to make API calls with authentication
async function apiCall(url, options = {}) {
  const token = localStorage.getItem("token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      // Unauthorized - token might be expired
      logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// Setup WebSocket connection (Socket.IO)
;(function () {
  // Guard against pages where the Socket.IO client script wasn't included
  if (typeof io === "undefined") {
    console.warn("Socket.IO client not available: 'io' is undefined");
    return;
  }

  try {
    const socket = io();

    socket.on("connect", () => {
      console.log("Connected to WebSocket server", socket.id);
    });

    socket.on("booking:created", (booking) => {
      console.log("New booking received via socket:", booking);
      // Basic user-visible notification — customize as needed
      if (document) {
        const banner = document.createElement("div");
        banner.className = "socket-notice";
        banner.textContent = `New booking made for car ${booking.carId} (ID: ${booking._id})`;
        banner.style.position = "fixed";
        banner.style.right = "20px";
        banner.style.bottom = "20px";
        banner.style.background = "#2b8a3e";
        banner.style.color = "#fff";
        banner.style.padding = "10px 14px";
        banner.style.borderRadius = "6px";
        banner.style.zIndex = 10000;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 5000);
      }
    });

    socket.on("booking:cancelled", (booking) => {
      console.log("Booking cancelled via socket:", booking);
      if (document) {
        const banner = document.createElement("div");
        banner.className = "socket-notice";
        banner.textContent = `Booking cancelled (ID: ${booking._id})`;
        banner.style.position = "fixed";
        banner.style.right = "20px";
        banner.style.bottom = "20px";
        banner.style.background = "#b02a37";
        banner.style.color = "#fff";
        banner.style.padding = "10px 14px";
        banner.style.borderRadius = "6px";
        banner.style.zIndex = 10000;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 5000);
      }
    });
  } catch (err) {
    console.warn("Socket.IO client initialization failed:", err);
  }
})();
