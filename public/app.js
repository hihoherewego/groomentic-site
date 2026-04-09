// Supabase configuration
const SUPABASE_URL = 'https://duwwfbohvptdsgrvlskj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d3dmYm9odnB0ZHNncnZsc2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDI2NDEsImV4cCI6MjA4ODkxODY0MX0.j8NWfQbZqnBhxSbvUMc-8_R3sQWLluMF4Gey9eo5ILk';
const TABLE_NAME = 'briefing_feedback';

// Initialize feedback form
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const ratingButtons = document.querySelectorAll('.star-btn');
    let selectedRating = 0;

    // Get the current user from the page attribute
    const currentUser = document.body.getAttribute('data-user');

    // Handle star rating clicks
    ratingButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));

            // Update all buttons
            ratingButtons.forEach(btn => {
                const btnRating = parseInt(btn.getAttribute('data-rating'));
                if (btnRating <= selectedRating) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        });

        // Hover effect
        button.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            ratingButtons.forEach(btn => {
                const btnRating = parseInt(btn.getAttribute('data-rating'));
                if (btnRating <= hoverRating) {
                    btn.style.opacity = '0.7';
                } else {
                    btn.style.opacity = '1';
                }
            });
        });
    });

    // Reset hover effect
    document.querySelector('.rating-group').addEventListener('mouseleave', function() {
        ratingButtons.forEach(btn => {
            btn.style.opacity = '1';
        });
    });

    // Handle form submission
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const section = document.getElementById('section').value;
        const comment = document.getElementById('comment').value;
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = document.getElementById('submitBtn');

        // Clear previous messages
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');

        // Validate rating
        if (selectedRating === 0) {
            errorMessage.textContent = 'Please select a rating.';
            errorMessage.classList.add('show');
            return;
        }

        // Validate section
        if (!section) {
            errorMessage.textContent = 'Please select a section.';
            errorMessage.classList.add('show');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const today = new Date();
            const briefingDate = today.toISOString().split('T')[0];

            const feedbackData = {
                user_name: currentUser,
                briefing_date: briefingDate,
                section: section,
                rating: selectedRating,
                comment: comment || null
            };

            // Send to Supabase via REST API
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(feedbackData)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Show success message
            successMessage.textContent = 'Thanks! Your feedback has been submitted.';
            successMessage.classList.add('show');

            // Reset form
            setTimeout(() => {
                feedbackForm.reset();
                selectedRating = 0;
                ratingButtons.forEach(btn => btn.classList.remove('selected'));
                successMessage.classList.remove('show');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Feedback';
            }, 3000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            errorMessage.textContent = 'Failed to submit feedback. Please try again.';
            errorMessage.classList.add('show');

            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
        }
    });
});

// Format date for display
function formatDate(date = new Date()) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-AU', options);
}
