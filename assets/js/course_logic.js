document.addEventListener('DOMContentLoaded', function() {
    fetch('course_config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(config => {
            applyConfig(config);
        })
        .catch(error => {
            console.error('Error loading course config:', error);
            const container = document.getElementById('dynamic-calendar-container');
            if (container) {
                container.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #f59e0b;"></i>
                        <p>Impossible de charger la configuration.</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                            Si vous testez en local (file://), les navigateurs bloquent souvent les fichiers JSON externes.<br>
                            Utilisez un serveur local (ex: <code>python3 -m http.server</code>) ou visualisez via GitHub Pages.
                        </p>
                    </div>
                `;
            }
        });
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
        for (const [id, value] of Object.entries(config.evaluations)) {
            if (id === '_comment') continue; // Skip comment key

            const element = document.getElementById(`eval-${id}`);
            if (element) {
                const tag = element.querySelector('.timeline-tag');
                
                // Determine status and url
                let status = value;
                let url = null;
                
                if (typeof value === 'object' && value !== null) {
                    status = value.status;
                    url = value.url;
                }

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
                    element.style.opacity = '0.8';
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

                // Handle Link Button
                const content = element.querySelector('.timeline-content');
                let linkBtn = element.querySelector('.eval-link');

                if (url && content && status === 'active') {
                    if (!linkBtn) {
                        linkBtn = document.createElement('a');
                        linkBtn.className = 'btn btn-primary eval-link';
                        linkBtn.target = '_blank';
                        linkBtn.innerHTML = '<i class="fab fa-github"></i> Accéder'; // Add icon
                        linkBtn.style.marginTop = '1rem';
                        linkBtn.style.width = '100%'; // Full width on mobile looks good, or auto
                        linkBtn.style.justifyContent = 'center';
                        content.appendChild(linkBtn);
                    }
                    linkBtn.href = url;
                    linkBtn.style.display = 'inline-flex';
                } else if (linkBtn) {
                    // Remove button if no url provided, or if status is not active
                    linkBtn.remove();
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

    // Handle Schedule (Dynamic Calendar)
    if (config.schedule) {
        renderCalendar(config.schedule);
    }
}

function renderCalendar(schedule) {
    const container = document.getElementById('dynamic-calendar-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading text
    
    // Create wrapper for the roadmap style
    const roadmap = document.createElement('div');
    roadmap.className = 'roadmap-container';
    container.appendChild(roadmap);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort schedule by date
    schedule.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Find current week index
    let currentIndex = -1;
    for (let i = 0; i < schedule.length; i++) {
        const itemDate = new Date(schedule[i].date);
        if (today >= itemDate) {
            currentIndex = i;
        }
    }

    schedule.forEach((item, index) => {
        const itemDate = new Date(item.date);
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        // Format date: "7 Janv"
        const dateStr = itemDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

        const card = document.createElement('div');
        card.className = `roadmap-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${item.type === 'break' ? 'is-break' : ''}`;
        
        // HTML Structure
        let tagsHtml = '';
        if (item.tags) {
            tagsHtml = `<div class="roadmap-tags">` + 
                item.tags.map(t => `<span class="roadmap-tag tag-${t.type}">${t.text}</span>`).join('') + 
                `</div>`;
        }

        // Arrow/Label for current
        const arrowHtml = isCurrent ? 
            `<div class="current-indicator">
                <i class="fas fa-arrow-right"></i> <span>Cette semaine</span>
             </div>` : '';

        card.innerHTML = `
            <div class="roadmap-marker"></div>
            <div class="roadmap-content-wrapper">
                ${arrowHtml}
                <div class="roadmap-card">
                    <div class="roadmap-header">
                        <span class="roadmap-week">${typeof item.week === 'number' ? 'Semaine ' + item.week : item.week}</span>
                        <span class="roadmap-date">${dateStr}</span>
                    </div>
                    <div class="roadmap-body">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;

        roadmap.appendChild(card);
    });
}
