document.addEventListener('DOMContentLoaded', function() {
    // Step list counter
    const stepList = document.querySelector('.step-list');
    if (stepList) {
        stepList.style.counterReset = 'step';
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});