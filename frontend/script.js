// ------- Scroll Reveal (Intersection Observer)
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// ------- Clickable Cards: "Select" + highlight + note
const cards = document.querySelectorAll('.card.clickable');
const selectedNote = document.getElementById('selectedNote');
const selectedPkgSpan = document.getElementById('selectedPackage');

cards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Prevent navigation if clicking the select button
    if (e.target.classList.contains('select-btn')) {
      return;
    }
    
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    const name = card.dataset.package || card.querySelector('h3')?.textContent || 'Selected Package';
    if (selectedPkgSpan) selectedPkgSpan.textContent = name;
    if (selectedNote) selectedNote.hidden = false;

    try {
      localStorage.setItem('buwana_selected_package', name);
    } catch {}
  });
});

// Wire explicit "Select" buttons to navigate to contact page
document.querySelectorAll('.select-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.card');
    if (card) {
      const packageName = card.dataset.package || card.querySelector('h3')?.textContent || '';
      try {
        localStorage.setItem('buwana_selected_package', packageName);
      } catch {}
      // Navigate to contact page
      window.location.href = 'contact.html';
    }
  });
});

// ------- Reviews: load + add (localStorage)
const reviewsWrap = document.getElementById('reviews');
const reviewForm = document.getElementById('reviewForm');

function loadReviews() {
  if (!reviewsWrap) return;
  try {
    const stored = JSON.parse(localStorage.getItem('buwana_reviews') || '[]');
    stored.forEach(addReviewDOM);
  } catch {}
}

function addReviewDOM({ name, rating, text, country }) {
  const div = document.createElement('div');
  div.className = 'review';
  const stars = '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
  div.innerHTML = `
    <div class="stars" aria-label="${rating} stars">${stars}</div>
    <p>${escapeHTML(text)}</p>
    <span class="author">— ${escapeHTML(name)}${country ? `, ${escapeHTML(country)}` : ''}</span>
  `;
  reviewsWrap.appendChild(div);
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[s]));
}

if (reviewForm) {
  loadReviews();

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const rating = parseInt(document.getElementById('rating').value, 10);
    const text = document.getElementById('review').value.trim();
    const country = document.getElementById('country').value;
    if (!name || !text || !rating) return;

    const entry = { name, rating, text, country };
    addReviewDOM(entry);

    try {
      const arr = JSON.parse(localStorage.getItem('buwana_reviews') || '[]');
      arr.push(entry);
      localStorage.setItem('buwana_reviews', JSON.stringify(arr));
    } catch {}

    reviewForm.reset();
  });
}

// ------- Populate country dropdown (Review Form)
const countrySelect = document.getElementById("country");
if (countrySelect) {
  const countries = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
    "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
    "Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
    "Denmark","Djibouti","Dominica","Dominican Republic",
    "East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
    "Fiji","Finland","France",
    "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary",
    "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
    "Jamaica","Japan","Jordan",
    "Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kosovo","Kuwait","Kyrgyzstan",
    "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
    "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
    "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway",
    "Oman",
    "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
    "Qatar",
    "Romania","Russia","Rwanda",
    "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","Spain","Sri Lanka","Sudan","Sudan, South","Suriname","Sweden","Switzerland","Syria",
    "Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
    "Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen",
    "Zambia","Zimbabwe"
  ];

  countrySelect.innerHTML =
    `<option value="">Select your country</option>` +
    countries.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ------- Contact form (with backend)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusEl = document.getElementById('contactStatus');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('con-name').value,
      email: document.getElementById('con-email').value,
      phone: document.getElementById('con-phone').value,
      interest: document.getElementById('con-interest').value,
      message: document.getElementById('con-message').value,
      startDate: document.getElementById('con-startDate').value,
      endDate: document.getElementById('con-endDate').value,
      pickupType: document.getElementById('pickupType')?.value || ''
    };

    try {
      const res = await fetch('http://localhost:5001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      if (statusEl) statusEl.textContent = 'Thanks! Your message has been sent.';
      contactForm.reset();
      document.getElementById('airportOptions').style.display = 'none';
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Error sending message. Try again later.';
      console.error(err);
    }
  });

  // Pre-select package if any (fixed to match exact option text)
  try {
    const sel = localStorage.getItem('buwana_selected_package');
    if (sel) {
      const interestSelect = document.getElementById('con-interest');
      if (interestSelect) {
        // Map package names to dropdown option text
        const packageMap = {
          'Airport Pickups & Drops': 'Airport Pickups & Drops',
          'Sigiriya & Dambulla': 'Sigiriya & Dambulla',
          'Sigiriya (Dambulla) & Minneriya': 'Sigiriya & Dambulla',
          'Yala Safari Adventure': 'Yala Safari Adventure',
          'Mirissa Beach Escape': 'Mirissa Beach Escape',
          'Ella Highlands Retreat': 'Ella Highlands Retreat',
          'Ella Highlands Retreat & Flying Ravana': 'Ella Highlands Retreat'
        };
        
        const mappedValue = packageMap[sel] || sel;
        
        // Find and select the matching option
        Array.from(interestSelect.options).forEach(option => {
          if (option.textContent.trim() === mappedValue || option.value === mappedValue) {
            interestSelect.value = option.value;
          }
        });
        
        // Clear the localStorage after using it
        localStorage.removeItem('buwana_selected_package');
      }
    }
  } catch {}
}

// ------- "Plan Your Trip" button (Services page → index inquiry scroll)
const goBtn = document.getElementById('goToInquiry');
if(goBtn){
  goBtn.addEventListener('click', () => {
    localStorage.setItem('scrollToInquiry', 'true');
    window.location.href = 'index.html';
  });
}

// Scroll to inquiry on index.html if flag is set
window.addEventListener('load', () => {
  if(localStorage.getItem('scrollToInquiry') === 'true'){
    const inquiry = document.getElementById('inquiry');
    if(inquiry){
      inquiry.scrollIntoView({behavior: 'smooth'});
    }
    localStorage.removeItem('scrollToInquiry');
  }
});

// ------- Inquiry form (with backend)
const inquiryForm = document.getElementById("inquiryForm");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById("inq-name").value,
      email: document.getElementById("inq-email").value,
      phone: document.getElementById("inq-phone").value,
      interest: document.getElementById("inq-interest").value,
      message: document.getElementById("inq-message").value,
    };

    try {
      const res = await fetch("http://localhost:5001/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit inquiry");
      alert("Inquiry submitted successfully!");
      inquiryForm.reset();
    } catch (err) {
      alert("Error submitting inquiry. Please try again later.");
      console.error(err);
    }
  });
}

// ------- Airport pickup/drop-off dynamic behavior
const interestSelect = document.getElementById('con-interest');
const airportOptions = document.getElementById('airportOptions');
const pickupType = document.getElementById('pickupType');
const startDate = document.getElementById('con-startDate');
const endDate = document.getElementById('con-endDate');

if(interestSelect){
  interestSelect.addEventListener('change', () => {
    if(interestSelect.value === 'Airport Pickups & Drops'){
      airportOptions.style.display = 'block';
    } else {
      airportOptions.style.display = 'none';
    }
  });
}

// Automatically adjust end date if Pickup Only or Drop-off Only
if(pickupType){
  pickupType.addEventListener('change', () => {
    if(pickupType.value === 'pickup' || pickupType.value === 'dropoff'){
      endDate.value = startDate.value; // same day
      endDate.min = startDate.value;
    } else {
      endDate.min = startDate.value; // allow range
    }
  });
}

// Ensure end date is never before start date
if(startDate && endDate){
  startDate.addEventListener('change', () => {
    if(endDate.value < startDate.value){
      endDate.value = startDate.value;
    }
    endDate.min = startDate.value;
  });
}

// ------- Expandable Cards (Why Sri Lanka page)
const hikingCard = document.getElementById("hikingCard");
const hikesList = document.getElementById("hikesList");

if (hikingCard && hikesList) {
  hikingCard.addEventListener("click", () => {
    hikesList.style.display = hikesList.style.display === "none" ? "grid" : "none";
  });
}

const beachCard = document.getElementById("beachCard");
const beachesList = document.getElementById("beachesList");

if (beachCard && beachesList) {
  beachCard.addEventListener("click", () => {
    beachesList.style.display = beachesList.style.display === "none" ? "grid" : "none";
  });
}