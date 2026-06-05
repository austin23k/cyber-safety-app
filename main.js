const reportForm = document.getElementById('reportForm');
const contactForm = document.getElementById('contactForm');
const resourcesContainer = document.getElementById('resources');
const reportMessage = document.getElementById('reportMessage');
const contactMessage = document.getElementById('contactMessage');

function showFeedback(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? '#d8000c' : '#0f5132';
}

async function renderResources() {
  if (!resourcesContainer) return;

  const result = await getSupportResources();
  if (!result.success) {
    resourcesContainer.innerHTML = '<p>Unable to load resources at this time.</p>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    resourcesContainer.innerHTML = '<p>No support resources are available right now.</p>';
    return;
  }

  resourcesContainer.innerHTML = result.data
    .map((resource) => {
      const url = resource.url ? `<a href="${resource.url}" target="_blank" rel="noopener noreferrer">Visit resource</a>` : '';
      return `
        <div class="resource-item">
          <h4>${resource.title}</h4>
          <p>${resource.description}</p>
          ${url}
        </div>
      `;
    })
    .join('');
}

async function handleReportSubmit(event) {
  event.preventDefault();

  const payload = {
    type: document.getElementById('type').value,
    description: document.getElementById('description').value.trim(),
    email: document.getElementById('email').value.trim() || null,
    severity: document.getElementById('severity').value
  };

  const result = await submitHarassmentReport(payload);
  if (result.success) {
    showFeedback(reportMessage, 'Report submitted successfully. Thank you for sharing.', false);
    reportForm.reset();
  } else {
    showFeedback(reportMessage, `Error submitting report: ${result.error}`, true);
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('contactMessageInput').value.trim()
  };

  const result = await submitContactMessage(payload);
  if (result.success) {
    showFeedback(contactMessage, 'Your message has been sent. Thank you!', false);
    contactForm.reset();
  } else {
    showFeedback(contactMessage, `Error sending message: ${result.error}`, true);
  }
}

if (reportForm) {
  reportForm.addEventListener('submit', handleReportSubmit);
}

if (contactForm) {
  contactForm.addEventListener('submit', handleContactSubmit);
}

window.addEventListener('load', renderResources);
