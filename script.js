// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');

// Keeps the menu, the button's state, and its screen reader label in sync
function setMenu(open) {
  links.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));

links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// Escape closes the menu and puts focus back on the button
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && links.classList.contains('open')) {
    setMenu(false);
    toggle.focus();
  }
});

// Events: hide any event whose date has passed (it disappears the day after)
const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
document.querySelectorAll('.event[data-date]').forEach((event) => {
  if (event.dataset.date < today) event.hidden = true;
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Forms
// Each form's `action` attribute holds its Formspree endpoint, so the form
// still sends without JavaScript. This script just sends it in the background
// and shows a message on the page instead of leaving the site.
const SUCCESS = {
  contact: 'Thank you for your message! ✨',
  newsletter: "You're on the list! ✨",
  help: "Thank you for reaching out, mama. We'll be in touch privately. ✨",
};

const FALLBACK = 'Please try again, or email us at contact@melanatedmamasgc.org.';

// Formspree sends errors as a list ([{ message }]); MailerLite sends them
// grouped by field ({ fields: { email: ['...'] } }). Turn either into text.
function errorText(errors) {
  if (!errors) return '';
  if (Array.isArray(errors)) return errors.map((err) => err.message).join(' ');
  return Object.values(errors.fields || {}).flat().join(' ');
}

document.querySelectorAll('form[data-form]').forEach((form) => {
  const type = form.dataset.form;
  const statusEl = form.querySelector('.form-status');
  const button = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.getAttribute('action');

    if (!endpoint) {
      statusEl.textContent = 'This form isn’t connected yet. ' + FALLBACK;
      return;
    }

    statusEl.textContent = 'Sending…';
    button.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      // MailerLite replies "200 OK" even on failure, with { success: false }
      // in the body, so check the body as well as the status.
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        statusEl.textContent = SUCCESS[type];
        form.reset();
      } else {
        statusEl.textContent = (errorText(data.errors) || 'Something went wrong.') + ' ' + FALLBACK;
      }
    } catch {
      statusEl.textContent = 'We couldn’t reach the server. Check your connection. ' + FALLBACK;
    } finally {
      button.disabled = false;
    }
  });
});
