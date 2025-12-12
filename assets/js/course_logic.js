document.addEventListener('DOMContentLoaded', function() {
    fetch('course_config.json')
        .then(response => response.json())
        .then(config => {
            applyConfig(config);
        })
        .catch(error => console.error('Error loading course config:', error));
});

function applyConfig(config) {
    // Handle Slides
    if (config.slides) {
        for (const [id, isAvailable] of Object.entries(config.slides)) {
            const element = document.getElementById(`slide-${id}`);
            if (element) {
                if (!isAvailable) {
                    element.classList.add('disabled-item');
                    // Optional: Disable link
                    const link = element.querySelector('a');
                    if (link) {
                        link.removeAttribute('href');
                        link.style.pointerEvents = 'none';
                    }
                }
            }
        }
    }

    // Handle Exercises
    if (config.exercises) {
        for (const [id, isAvailable] of Object.entries(config.exercises)) {
            const element = document.getElementById(`ex-${id}`);
            if (element) {
                if (!isAvailable) {
                    element.classList.add('disabled-item');
                    // Disable link
                    element.removeAttribute('href');
                    element.style.pointerEvents = 'none';
                }
            }
        }
    }

    // Handle Evaluations
    if (config.evaluations) {
        for (const [id, status] of Object.entries(config.evaluations)) {
            const element = document.getElementById(`eval-${id}`);
            if (element) {
                const tag = element.querySelector('.timeline-tag');
                
                // Reset classes
                element.classList.remove('completed', 'pending');
                
                if (status === 'pending') {
                    element.classList.add('pending'); // You might want to define a pending style
                    // Make it look greyed out or just "upcoming"
                    element.style.opacity = '0.6';
                    if (tag) tag.textContent = 'À venir';
                } else if (status === 'completed') {
                    element.classList.add('completed');
                    element.style.opacity = '1';
                    if (tag) tag.textContent = 'Terminé';
                } else if (status === 'active') {
                    element.style.opacity = '1';
                    if (tag) tag.textContent = 'En cours';
                }
            }
        }
    }
}