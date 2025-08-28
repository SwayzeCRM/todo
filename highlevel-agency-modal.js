// HighLevel Agency-Level Persistent Modal System
// Install this at the agency level to enable floating task modals across all pages

(function() {
    'use strict';
    
    // Check if modal system is already initialized
    if (window.HighLevelTaskModal) return;
    
    // Modal configuration
    const MODAL_CONFIG = {
        minWidth: 400,
        minHeight: 300,
        defaultWidth: 800,
        defaultHeight: 600,
        miniPlayerWidth: 320,
        miniPlayerHeight: 240
    };
    
    // Modal state management
    let modalState = {
        isOpen: false,
        isMinimized: false,
        isMiniPlayer: false,
        position: { x: 50, y: 50 },
        size: { width: MODAL_CONFIG.defaultWidth, height: MODAL_CONFIG.defaultHeight },
        currentTask: null,
        isDragging: false,
        isResizing: false,
        dragOffset: { x: 0, y: 0 }
    };
    
    // Load saved state from localStorage
    function loadModalState() {
        const saved = localStorage.getItem('hlTaskModalState');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                modalState = { ...modalState, ...savedState, isDragging: false, isResizing: false };
            } catch (e) {
                console.error('Failed to load modal state:', e);
            }
        }
    }
    
    // Save state to localStorage
    function saveModalState() {
        const stateToSave = {
            position: modalState.position,
            size: modalState.size,
            isMinimized: modalState.isMinimized,
            isMiniPlayer: modalState.isMiniPlayer,
            currentTask: modalState.currentTask
        };
        localStorage.setItem('hlTaskModalState', JSON.stringify(stateToSave));
    }
    
    // Create the modal HTML structure
    function createModal() {
        // Check if modal already exists
        if (document.getElementById('hl-task-modal')) return;
        
        const modalHTML = `
            <div id="hl-task-modal" class="hl-task-modal" style="display: none;">
                <div class="hl-modal-header">
                    <div class="hl-modal-title">
                        <span class="hl-modal-title-text">Task Instructions</span>
                        <span class="hl-modal-task-name"></span>
                    </div>
                    <div class="hl-modal-controls">
                        <button class="hl-modal-btn hl-modal-mini-player" title="Mini Player">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
                            </svg>
                        </button>
                        <button class="hl-modal-btn hl-modal-minimize" title="Minimize">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h12v2H6z"/>
                            </svg>
                        </button>
                        <button class="hl-modal-btn hl-modal-maximize" title="Maximize">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                        </button>
                        <button class="hl-modal-btn hl-modal-close" title="Close">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="hl-modal-content">
                    <div class="hl-modal-loading">Loading task content...</div>
                    <iframe class="hl-modal-iframe" style="display: none;"></iframe>
                    <div class="hl-modal-task-content" style="display: none;">
                        <div class="hl-modal-video-container"></div>
                        <div class="hl-modal-instructions"></div>
                        <div class="hl-modal-actions">
                            <button class="hl-modal-complete-btn">Mark Task as Complete</button>
                        </div>
                    </div>
                </div>
                <div class="hl-modal-resize-handle"></div>
            </div>
            
            <!-- Minimized bar -->
            <div id="hl-task-modal-minimized" class="hl-modal-minimized" style="display: none;">
                <div class="hl-modal-minimized-content">
                    <span class="hl-modal-minimized-icon">📋</span>
                    <span class="hl-modal-minimized-title">Task: <span class="hl-modal-minimized-task-name"></span></span>
                </div>
                <div class="hl-modal-minimized-controls">
                    <button class="hl-modal-restore" title="Restore">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                    </button>
                    <button class="hl-modal-minimized-close" title="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Attach event listeners
        attachModalEventListeners();
    }
    
    // Attach all event listeners to the modal
    function attachModalEventListeners() {
        const modal = document.getElementById('hl-task-modal');
        const minimizedBar = document.getElementById('hl-task-modal-minimized');
        
        if (!modal || !minimizedBar) return;
        
        // Header drag functionality
        const header = modal.querySelector('.hl-modal-header');
        header.addEventListener('mousedown', startDragging);
        
        // Resize handle
        const resizeHandle = modal.querySelector('.hl-modal-resize-handle');
        resizeHandle.addEventListener('mousedown', startResizing);
        
        // Control buttons
        modal.querySelector('.hl-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.hl-modal-minimize').addEventListener('click', minimizeModal);
        modal.querySelector('.hl-modal-maximize').addEventListener('click', maximizeModal);
        modal.querySelector('.hl-modal-mini-player').addEventListener('click', toggleMiniPlayer);
        modal.querySelector('.hl-modal-complete-btn').addEventListener('click', markTaskComplete);
        
        // Minimized bar controls
        minimizedBar.querySelector('.hl-modal-restore').addEventListener('click', restoreModal);
        minimizedBar.querySelector('.hl-modal-minimized-close').addEventListener('click', closeModal);
        minimizedBar.addEventListener('click', restoreModal);
        
        // Global mouse events for dragging and resizing
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Dragging functionality
    function startDragging(e) {
        if (e.target.closest('.hl-modal-controls')) return;
        
        modalState.isDragging = true;
        const modal = document.getElementById('hl-task-modal');
        const rect = modal.getBoundingClientRect();
        modalState.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        modal.style.cursor = 'move';
        e.preventDefault();
    }
    
    // Resizing functionality
    function startResizing(e) {
        modalState.isResizing = true;
        e.preventDefault();
    }
    
    // Handle mouse movement for dragging and resizing
    function handleMouseMove(e) {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        if (modalState.isDragging) {
            const newX = Math.max(0, Math.min(window.innerWidth - modalState.size.width, 
                                              e.clientX - modalState.dragOffset.x));
            const newY = Math.max(0, Math.min(window.innerHeight - modalState.size.height, 
                                              e.clientY - modalState.dragOffset.y));
            
            modalState.position = { x: newX, y: newY };
            updateModalPosition();
        } else if (modalState.isResizing) {
            const newWidth = Math.max(MODAL_CONFIG.minWidth, 
                                     e.clientX - modalState.position.x);
            const newHeight = Math.max(MODAL_CONFIG.minHeight, 
                                      e.clientY - modalState.position.y);
            
            modalState.size = { width: newWidth, height: newHeight };
            updateModalSize();
        }
    }
    
    // Handle mouse up to stop dragging/resizing
    function handleMouseUp() {
        if (modalState.isDragging || modalState.isResizing) {
            modalState.isDragging = false;
            modalState.isResizing = false;
            const modal = document.getElementById('hl-task-modal');
            if (modal) modal.style.cursor = '';
            saveModalState();
        }
    }
    
    // Update modal position
    function updateModalPosition() {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        modal.style.left = modalState.position.x + 'px';
        modal.style.top = modalState.position.y + 'px';
    }
    
    // Update modal size
    function updateModalSize() {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        modal.style.width = modalState.size.width + 'px';
        modal.style.height = modalState.size.height + 'px';
    }
    
    // Open modal with task data
    function openModal(data) {
        const modal = document.getElementById('hl-task-modal');
        const minimizedBar = document.getElementById('hl-task-modal-minimized');
        
        if (!modal) {
            createModal();
            return openModal(data);
        }
        
        // Store current task
        modalState.currentTask = data;
        modalState.isOpen = true;
        
        // Update modal content
        updateModalContent(data);
        
        // Show modal
        modal.style.display = 'block';
        minimizedBar.style.display = 'none';
        
        // Apply saved or default position/size
        updateModalPosition();
        updateModalSize();
        
        saveModalState();
    }
    
    // Update modal content with task data
    function updateModalContent(data) {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        // Update title
        modal.querySelector('.hl-modal-task-name').textContent = data.taskTitle || 'Task';
        modal.querySelector('.hl-modal-minimized-task-name').textContent = data.taskTitle || 'Task';
        
        // Hide loading, show content
        modal.querySelector('.hl-modal-loading').style.display = 'none';
        modal.querySelector('.hl-modal-task-content').style.display = 'block';
        
        // Add video if present
        const videoContainer = modal.querySelector('.hl-modal-video-container');
        if (data.videoUrl) {
            if (data.videoType === 'upload') {
                videoContainer.innerHTML = `
                    <video controls style="width: 100%; max-height: 400px; border-radius: 8px;">
                        <source src="${data.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else {
                // Handle YouTube/Vimeo URLs
                let embedUrl = data.videoUrl;
                if (embedUrl.includes('youtube.com/watch')) {
                    embedUrl = embedUrl.replace('watch?v=', 'embed/');
                } else if (embedUrl.includes('youtu.be/')) {
                    embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
                } else if (embedUrl.includes('vimeo.com/')) {
                    embedUrl = embedUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
                }
                
                videoContainer.innerHTML = `
                    <iframe src="${embedUrl}" 
                            style="width: 100%; height: 400px; border-radius: 8px; border: none;"
                            allowfullscreen></iframe>
                `;
            }
        } else {
            videoContainer.innerHTML = '';
        }
        
        // Add instructions
        const instructionsDiv = modal.querySelector('.hl-modal-instructions');
        instructionsDiv.innerHTML = data.instructions || '<p>No instructions available.</p>';
        
        // Add any embedded forms/calendars
        if (data.embedCode) {
            instructionsDiv.innerHTML += `<div class="hl-modal-embed" style="margin-top: 20px;">${data.embedCode}</div>`;
            
            // Execute any scripts in the embed code
            const scripts = instructionsDiv.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                script.parentNode.replaceChild(newScript, script);
            });
        }
        
        // Store task data for completion
        modal.querySelector('.hl-modal-complete-btn').dataset.taskId = data.taskId;
    }
    
    // Close modal
    function closeModal() {
        const modal = document.getElementById('hl-task-modal');
        const minimizedBar = document.getElementById('hl-task-modal-minimized');
        
        if (modal) modal.style.display = 'none';
        if (minimizedBar) minimizedBar.style.display = 'none';
        
        modalState.isOpen = false;
        modalState.currentTask = null;
        saveModalState();
        
        // Notify iframe that modal was closed
        notifyIframe({ action: 'modalClosed' });
    }
    
    // Minimize modal
    function minimizeModal() {
        const modal = document.getElementById('hl-task-modal');
        const minimizedBar = document.getElementById('hl-task-modal-minimized');
        
        if (modal) modal.style.display = 'none';
        if (minimizedBar) minimizedBar.style.display = 'block';
        
        modalState.isMinimized = true;
        saveModalState();
    }
    
    // Restore modal from minimized state
    function restoreModal(e) {
        if (e && e.target.closest('.hl-modal-minimized-controls')) {
            if (!e.target.closest('.hl-modal-restore')) return;
        }
        
        const modal = document.getElementById('hl-task-modal');
        const minimizedBar = document.getElementById('hl-task-modal-minimized');
        
        if (modal) modal.style.display = 'block';
        if (minimizedBar) minimizedBar.style.display = 'none';
        
        modalState.isMinimized = false;
        saveModalState();
    }
    
    // Maximize modal
    function maximizeModal() {
        if (modalState.size.width === window.innerWidth && 
            modalState.size.height === window.innerHeight) {
            // Restore to previous size
            modalState.size = {
                width: MODAL_CONFIG.defaultWidth,
                height: MODAL_CONFIG.defaultHeight
            };
            modalState.position = { x: 50, y: 50 };
        } else {
            // Maximize
            modalState.size = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            modalState.position = { x: 0, y: 0 };
        }
        
        updateModalPosition();
        updateModalSize();
        saveModalState();
    }
    
    // Toggle mini player mode
    function toggleMiniPlayer() {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        if (modalState.isMiniPlayer) {
            // Restore to normal size
            modalState.size = {
                width: MODAL_CONFIG.defaultWidth,
                height: MODAL_CONFIG.defaultHeight
            };
            modalState.isMiniPlayer = false;
            modal.classList.remove('mini-player');
            
            // Show instructions again
            modal.querySelector('.hl-modal-instructions').style.display = 'block';
            modal.querySelector('.hl-modal-actions').style.display = 'block';
        } else {
            // Switch to mini player (video only)
            modalState.size = {
                width: MODAL_CONFIG.miniPlayerWidth,
                height: MODAL_CONFIG.miniPlayerHeight
            };
            modalState.isMiniPlayer = true;
            modal.classList.add('mini-player');
            
            // Hide everything except video
            modal.querySelector('.hl-modal-instructions').style.display = 'none';
            modal.querySelector('.hl-modal-actions').style.display = 'none';
        }
        
        updateModalSize();
        saveModalState();
    }
    
    // Mark task as complete
    function markTaskComplete() {
        const modal = document.getElementById('hl-task-modal');
        if (!modal) return;
        
        const taskId = modal.querySelector('.hl-modal-complete-btn').dataset.taskId;
        
        // Send completion message back to iframe
        notifyIframe({
            action: 'taskCompleted',
            taskId: taskId
        });
        
        // Close modal
        closeModal();
        
        // Show success message
        showSuccessMessage('Task marked as complete!');
    }
    
    // Notify iframe of events
    function notifyIframe(data) {
        // Find all iframes that might contain our onboarding app
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow.postMessage(data, '*');
            } catch (e) {
                // Iframe might be cross-origin, skip it
            }
        });
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'hl-success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Listen for messages from iframes
    window.addEventListener('message', function(event) {
        // Verify the message is for us
        if (!event.data || !event.data.source || event.data.source !== 'onboarding-app') return;
        
        switch (event.data.action) {
            case 'openTaskModal':
                openModal({
                    taskId: event.data.taskId,
                    taskTitle: event.data.taskTitle,
                    videoUrl: event.data.videoUrl,
                    videoType: event.data.videoType,
                    instructions: event.data.instructions,
                    embedCode: event.data.embedCode
                });
                break;
                
            case 'closeTaskModal':
                closeModal();
                break;
                
            case 'updateTaskModal':
                if (modalState.isOpen && modalState.currentTask) {
                    updateModalContent(event.data);
                }
                break;
        }
    });
    
    // Initialize on page load
    function initialize() {
        loadModalState();
        createModal();
        
        // If there was an open task, restore it
        if (modalState.isOpen && modalState.currentTask) {
            openModal(modalState.currentTask);
            if (modalState.isMinimized) {
                minimizeModal();
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Export for debugging
    window.HighLevelTaskModal = {
        open: openModal,
        close: closeModal,
        minimize: minimizeModal,
        restore: restoreModal,
        getState: () => modalState
    };
})();