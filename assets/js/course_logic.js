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
            if (id === '_comment') continue; // Skip comment key

            const element = document.getElementById(`eval-${id}`);
            if (element) {
                const tag = element.querySelector('.timeline-tag');
                
                // Reset classes
                element.classList.remove('completed', 'pending', 'active');
                if (tag) tag.className = 'timeline-tag'; // Reset tag classes
                
                if (status === 'pending') {
                    element.classList.add('pending');
                    element.style.opacity = '0.8'; 
                    if (tag) {
                        tag.textContent = 'À venir';
                        tag.classList.add('status-pending');
                    }
                } else if (status === 'completed') {
                    element.classList.add('completed');
                    element.style.opacity = '1';
                    if (tag) {
                        tag.textContent = 'Terminé';
                        tag.classList.add('status-completed');
                    }
                } else if (status === 'active') {
                    element.classList.add('active');
                    element.style.opacity = '1';
                    if (tag) {
                        tag.textContent = 'En cours';
                        tag.classList.add('status-active');
                    }
                }
            }
        }
    }

    // Handle Rencontres
    if (config.rencontres) {
        const iframeContainer = document.getElementById('rencontres-iframe-container');
        const placeholderContainer = document.getElementById('rencontres-placeholder');
        const iframe = document.getElementById('rencontres-iframe');

        if (config.rencontres.link) {
            // Show iframe, hide placeholder
            if (iframeContainer) iframeContainer.style.display = 'block';
            if (placeholderContainer) placeholderContainer.style.display = 'none';
            if (iframe) iframe.src = config.rencontres.link;
        } else {
            // Show placeholder, hide iframe
            if (iframeContainer) iframeContainer.style.display = 'none';
            if (placeholderContainer) placeholderContainer.style.display = 'flex'; // Use flex for centering
        }
    }
}
