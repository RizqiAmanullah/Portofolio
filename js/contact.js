// Contact form functionality

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Get form data
    const formData = new FormData(form);
    const contactData = {
        full_name: form.querySelector('input[placeholder="Full Name"]').value.trim(),
        email: form.querySelector('input[placeholder="Email"]').value.trim(),
        message: form.querySelector('textarea[placeholder="Pesan"]').value.trim()
    };
    
    // Basic validation
    if (!contactData.full_name || !contactData.email || !contactData.message) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    try {
        const response = await fetch('api/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage(result.message, 'success');
            form.reset(); // Clear the form
        } else {
            showMessage(result.error || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showMessage('Connection error. Please try again later.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.contact-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message ${type}`;
    messageDiv.textContent = message;
    
    // Insert message after the contact form
    const contactForm = document.querySelector('.contact-form');
    contactForm.parentNode.insertBefore(messageDiv, contactForm.nextSibling);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}
