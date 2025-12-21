// // Mobile menu toggle
// const hamburger = document.querySelector(".hamburger");
// const navMenu = document.querySelector(".nav-menu");

// if (hamburger && navMenu) {
//   hamburger.addEventListener("click", () => {
//     hamburger.classList.toggle("active");
//     navMenu.classList.toggle("active");
//   });

//   // Close mobile menu when clicking on a link
//   document.querySelectorAll(".nav-link").forEach((n) =>
//     n.addEventListener("click", () => {
//       hamburger.classList.remove("active");
//       navMenu.classList.remove("active");
//     })
//   );
// }

// // Small UI helpers for new theme
// document.addEventListener('DOMContentLoaded', () => {
//   // Subtle entrance reveal for elements with .reveal
//   document.querySelectorAll('.reveal').forEach((el, i) => {
//     el.style.animationDelay = (i * 60) + 'ms';
//   });

//   // Simple smooth image loading: add .loaded when each card image finishes
//   document.querySelectorAll('.card .media, .car-image img').forEach(img=>{
//     if(img.complete) img.classList.add('loaded');
//     else img.addEventListener('load', ()=> img.classList.add('loaded'));
//   });
// });

// // Smooth scrolling for anchor links
// document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
//   anchor.addEventListener("click", function (e) {
//     e.preventDefault();
//     const target = document.querySelector(this.getAttribute("href"));
//     if (target) {
//       target.scrollIntoView({
//         behavior: "smooth",
//       });
//     }
//   });
// });

// // Form validation helpers
// function validateEmail(email) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(email);
// }

// function validatePassword(password) {
//   return password.length >= 6;
// }

// // Date validation for booking forms
// function validateDates(startDate, endDate) {
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   if (start < today) {
//     return { valid: false, message: "Start date cannot be in the past" };
//   }

//   if (end <= start) {
//     return { valid: false, message: "End date must be after start date" };
//   }
// }

//   document.addEventListener("DOMContentLoaded", function () {
//     // Add click handlers for cards with hover effects
//     const cards = document.querySelectorAll(
//       ".car-card, .booking-card, .feature-card"
//     );
//     cards.forEach((card) => {
//       card.addEventListener("mouseenter", function () {
//         this.style.transform = "translateY(-5px)";
//       });

//       card.addEventListener("mouseleave", function () {
//         this.style.transform = "translateY(0)";
//       });
//     });

//     // Auto-hide alerts after 5 seconds
//     const alerts = document.querySelectorAll(".success, .error");
//     alerts.forEach((alert) => {
//       setTimeout(() => {
//         alert.style.opacity = "0";
//         setTimeout(() => alert.remove(), 300);
//       }, 5000);
//     });

//     // Set minimum date for date inputs to today
//     const dateInputs = document.querySelectorAll('input[type="date"]');
//     const today = new Date().toISOString().split("T")[0];
//     dateInputs.forEach((input) => {
//       input.min = today;
//     });

//     // Hide skeleton loader when cars are rendered into #carsContainer
//     const carsContainer = document.getElementById('carsContainer');
//     const loadingEl = document.getElementById('loading');
//     if (carsContainer && loadingEl) {
//       const obs = new MutationObserver(() => {
//         if (carsContainer.children.length > 0) {
//           loadingEl.style.display = 'none';
//           obs.disconnect();
//         }
//       });
//       obs.observe(carsContainer, { childList: true, subtree: false });
//     }

//     // Close modals with Escape and restore focus
//     document.addEventListener('keydown', (e) => {
//       if (e.key === 'Escape') {
//         document.querySelectorAll('.modal').forEach(m => {
//           if (m.style.display === 'block' || m.style.display === 'inline-block') {
//             m.style.display = 'none';
//           }
//         });
//       }
//     });
//   });

//   // Monitor modal visibility and lock body scroll when any modal is open
//   (function(){
//     const modals = Array.from(document.querySelectorAll('.modal'));
//     if(!modals.length) return;
//     const check = ()=>{
//       const anyOpen = modals.some(m=>{ try{ return window.getComputedStyle(m).display !== 'none' }catch(e){return false} });
//       if(anyOpen) document.body.classList.add('modal-open'); else document.body.classList.remove('modal-open');
//     };
//     // initial check
//     check();
//     // observe style attribute changes on each modal
//     modals.forEach(m=>{
//       const obs = new MutationObserver(check);
//       obs.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
//     });
//   })();

// // Utility function to make API calls with authentication
// async function apiCall(url, options = {}) {
//   const token = localStorage.getItem("token");

//   const defaultOptions = {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };

//   if (token) {
//     defaultOptions.headers.Authorization = `Bearer ${token}`;
//   }

//   const mergedOptions = {
//     ...defaultOptions,
//     ...options,
//     headers: {
//       ...defaultOptions.headers,
//       ...options.headers,
//     },
//   };

//   try {
//     const response = await fetch(url, mergedOptions);

//     if (response.status === 401) {
//       // Unauthorized - token might be expired
//       logout();
//       throw new Error("Session expired. Please login again.");
//     }

//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// // Setup WebSocket connection (Socket.IO)
// ;(function () {
//   // Guard against pages where the Socket.IO client script wasn't included
//   if (typeof io === "undefined") {
//     console.warn("Socket.IO client not available: 'io' is undefined");
//     return;
//   }

//   try {
//     const socket = io();

//     socket.on("connect", () => {
//       console.log("Connected to WebSocket server", socket.id);
//     });

//     socket.on("booking:created", (booking) => {
//       console.log("New booking received via socket:", booking);
//       // Basic user-visible notification — customize as needed
//       if (document) {
//         const banner = document.createElement("div");
//         banner.className = "socket-notice";
//         banner.textContent = `New booking made for car ${booking.carId} (ID: ${booking._id})`;
//         banner.style.position = "fixed";
//         banner.style.right = "20px";
//         banner.style.bottom = "20px";
//         banner.style.background = "#2b8a3e";
//         banner.style.color = "#fff";
//         banner.style.padding = "10px 14px";
//         banner.style.borderRadius = "6px";
//         banner.style.zIndex = 10000;
//         document.body.appendChild(banner);
//         setTimeout(() => banner.remove(), 5000);
//       }
//     });

//     socket.on("booking:cancelled", (booking) => {
//       console.log("Booking cancelled via socket:", booking);
//       if (document) {
//         const banner = document.createElement("div");
//         banner.className = "socket-notice";
//         banner.textContent = `Booking cancelled (ID: ${booking._id})`;
//         banner.style.position = "fixed";
//         banner.style.right = "20px";
//         banner.style.bottom = "20px";
//         banner.style.background = "#b02a37";
//         banner.style.color = "#fff";
//         banner.style.padding = "10px 14px";
//         banner.style.borderRadius = "6px";
//         banner.style.zIndex = 10000;
//         document.body.appendChild(banner);
//         setTimeout(() => banner.remove(), 5000);
//       }
//     });
//   } catch (err) {
//     console.warn("Socket.IO client initialization failed:", err);
//   }
// })();




// ======= Mobile menu toggle =======
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach((link) =>
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    })
  );
}

// ======= DOMContentLoaded helpers =======
document.addEventListener("DOMContentLoaded", () => {
  // Animate .reveal elements
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.animationDelay = i * 60 + "ms";
  });

  // Smooth image loading
  document.querySelectorAll(".card .media, .car-image img").forEach((img) => {
    if (img.complete) img.classList.add("loaded");
    else img.addEventListener("load", () => img.classList.add("loaded"));
  });

  // Auto-hide alerts
  document.querySelectorAll(".success, .error").forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });

  // Date inputs min today
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = today;
  });

  // Card hover effects
  document.querySelectorAll(".car-card, .booking-card, .feature-card").forEach((card) => {
    card.addEventListener("mouseenter", () => (card.style.transform = "translateY(-5px)"));
    card.addEventListener("mouseleave", () => (card.style.transform = "translateY(0)"));
  });

  // Hide loader when cars rendered
  const carsContainer = document.getElementById("carsContainer");
  const loadingEl = document.getElementById("loading");
  if (carsContainer && loadingEl) {
    const obs = new MutationObserver(() => {
      if (carsContainer.children.length > 0) {
        loadingEl.style.display = "none";
        obs.disconnect();
      }
    });
    obs.observe(carsContainer, { childList: true });
  }

  // Admin navbar toggle based on token and role
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // e.g., "admin" or "superadmin"
    if (token) {
    document.getElementById("login-link")?.style.setProperty("display", "none");
    document.getElementById("signup-link")?.style.setProperty("display", "none");
    document.getElementById("logout-link")?.style.setProperty("display", "block");
    // show admin link for both admin and superadmin
    if (role === "admin" || role === "superadmin") document.getElementById("admin-link")?.style.setProperty("display", "block");
    // show superadmin link only for superadmin
    if (role === "superadmin") document.getElementById("superadmin-link")?.style.setProperty("display", "block");
  }

  // Close modals with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach((m) => {
        if (window.getComputedStyle(m).display !== "none") m.style.display = "none";
      });
    }
  });
});

// ======= Modal scroll lock =======
(function () {
  const modals = Array.from(document.querySelectorAll(".modal"));
  if (!modals.length) return;

  const check = () => {
    const anyOpen = modals.some(
      (m) => window.getComputedStyle(m).display !== "none"
    );
    document.body.classList.toggle("modal-open", anyOpen);
  };
  check();

  modals.forEach((m) => {
    const obs = new MutationObserver(check);
    obs.observe(m, { attributes: true, attributeFilter: ["style", "class"] });
  });
})();

// ======= Validation helpers =======
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password) {
  return password.length >= 6;
}
function validateDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) return { valid: false, message: "Start date cannot be in the past" };
  if (end <= start) return { valid: false, message: "End date must be after start date" };
  return { valid: true };
}

// ======= API utility =======
async function apiCall(url, options = {}) {
  const token = localStorage.getItem("token");
  const defaultOptions = { headers: { "Content-Type": "application/json" } };
  if (token) defaultOptions.headers.Authorization = `Bearer ${token}`;
  const merged = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };

  try {
    const response = await fetch(url, merged);
    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }
    return response;
  } catch (err) {
    throw err;
  }
}

// ======= Logout =======
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
}

// ======= Add Car Form =======
const addCarForm = document.getElementById("addCarForm");
if (addCarForm) {
  addCarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      model: addCarForm.model.value,
      type: addCarForm.type.value,
      pricePerDay: parseFloat(addCarForm.pricePerDay.value),
      imageUrl: addCarForm.imageUrl.value,
    };
    try {
      const res = await apiCall("/api/cars", { method: "POST", body: JSON.stringify(data) });
      if (res.ok) {
        document.getElementById("addCarMessage").textContent = "Car added successfully!";
        addCarForm.reset();
        document.getElementById("addCarModal").style.display = "none";
        loadAdminCars(); // refresh car list
      } else {
        const err = await res.json();
        document.getElementById("addCarMessage").textContent = err.message || "Failed to add car";
      }
    } catch (err) {
      document.getElementById("addCarMessage").textContent = err.message;
    }
  });
}

// ======= Admin Car/Booking Loading =======
async function loadAdminCars() {
  try {
    const res = await apiCall("/api/admin/cars");
    const cars = await res.json();
    const container = document.getElementById("adminCarsContainer");
    container.innerHTML = cars.map(car => `
      <div class="admin-car-card">
        <div class="car-media" style="background-image:url('${car.imageUrl || ''}')"></div>
        <div class="car-meta">
          <h3>${car.model}</h3>
          <div class="car-type">${car.type || '—'}</div>
          <div class="car-price">$${(car.pricePerDay||0).toFixed(2)}/day</div>
          <div class="car-actions">
            <button class="btn btn-primary btn-small edit-car" data-id="${car._id}">Edit</button>
            <button class="btn btn-danger btn-small delete-car" data-id="${car._id}">Delete</button>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load admin cars", err);
  }
}

async function loadAdminBookings() {
  try {
    const res = await apiCall("/api/admin/bookings");
    const bookings = await res.json();
    const container = document.getElementById("adminBookingsContainer");
    container.innerHTML = bookings.map(b => {
      const started = b.startDate ? (new Date(b.startDate) <= new Date()) : false;
      const cancelDisabled = b.status !== 'booked' || started;
      return `
      <div class="admin-booking-card">
        <div class="booking-info">
          <h3>Booking #${b._id}</h3>
          <p><strong>Car:</strong> ${b.carModel}</p>
          <p><strong>User:</strong> ${b.userName}</p>
          <p><strong>From:</strong> ${b.startDate} <strong>To:</strong> ${b.endDate}</p>
          <p><strong>Status:</strong> ${b.status}</p>
        </div>
        <div class="booking-actions">
          <button class="btn btn-danger btn-small cancel-booking" data-id="${b._id}" ${cancelDisabled? 'disabled': ''}>Cancel</button>
        </div>
      </div>`;
    }).join("");
  } catch (err) {
    console.error("Failed to load admin bookings", err);
  }
}

// Auto-load admin dashboard data if on admin page
if (document.getElementById("adminCarsContainer")) loadAdminCars();
if (document.getElementById("adminBookingsContainer")) loadAdminBookings();

// Delegate admin actions: delete car, cancel booking, edit redirect
document.addEventListener('click', async (e) => {
  const del = e.target.closest('.delete-car');
  if (del) {
    const id = del.getAttribute('data-id');
    if (!id) return;
    if (!confirm('Delete this car? This action cannot be undone.')) return;
    try {
      const res = await apiCall(`/api/cars/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAdminCars();
      } else {
        const err = await res.json();
        alert(err.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Network error');
    }
    return;
  }

  const cancelBtn = e.target.closest('.cancel-booking');
  if (cancelBtn) {
    const id = cancelBtn.getAttribute('data-id');
    if (!id) return;
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await apiCall(`/api/bookings/cancel/${id}`, { method: 'PUT' });
      if (res.ok) {
        loadAdminBookings();
      } else {
        const err = await res.json();
        alert(err.message || 'Cancel failed');
      }
    } catch (err) {
      console.error('Cancel failed', err);
      alert('Network error');
    }
    return;
  }

  const edit = e.target.closest('.edit-car');
  if (edit) {
    const id = edit.getAttribute('data-id');
    if (id) window.location.href = `/edit-car?carId=${id}`;
  }
});

// ======= WebSocket notifications =======
(function () {
  if (typeof io === "undefined") return;
  try {
    const socket = io();
    socket.on("booking:created", showBookingNotification);
    socket.on("booking:cancelled", showBookingNotification);

    function showBookingNotification(booking) {
      const banner = document.createElement("div");
      banner.className = "socket-notice";
      banner.textContent = booking._id ? `Booking updated (ID: ${booking._id})` : "New booking received";
      Object.assign(banner.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        background: booking.status === "cancelled" ? "#b02a37" : "#2b8a3e",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "6px",
        zIndex: 10000,
      });
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 5000);
    }
  } catch (err) {
    console.warn("Socket.IO init failed:", err);
  }
})();
