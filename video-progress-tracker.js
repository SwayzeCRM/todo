// Video Progress Tracking System
// This module handles video progress tracking, saving, and resuming

class VideoProgressTracker {
    constructor(supabaseClient, currentUser) {
        this.supabaseClient = supabaseClient;
        this.currentUser = currentUser;
        this.progressTrackers = {};
        this.saveTimers = {};
        this.videoRequirements = {}; // Store which videos require completion
    }
    
    // Set user for the tracker
    setUser(user) {
        this.currentUser = user;
    }
    
    // Set video completion requirement
    setVideoRequirement(taskId, required) {
        this.videoRequirements[taskId] = required;
    }
    
    // Check if video completion is required for a task
    isVideoCompletionRequired(taskId) {
        return this.videoRequirements[taskId] || false;
    }
    
    // Save video progress to database
    async saveProgress(taskId, currentTime, duration, videoUrl = null) {
        if (!this.currentUser || !this.currentUser.id) return;
        
        try {
            const { data, error } = await this.supabaseClient
                .rpc('update_video_progress', {
                    p_user_id: this.currentUser.id,
                    p_task_id: taskId,
                    p_current_position: currentTime,
                    p_duration: duration,
                    p_video_url: videoUrl
                });
            
            if (error) {
                console.error('Error saving video progress:', error);
                return null;
            }
            
            console.log(`Video progress saved for task ${taskId}: ${Math.round((currentTime/duration)*100)}% complete`);
            return data;
        } catch (error) {
            console.error('Error saving video progress:', error);
            return null;
        }
    }
    
    // Get saved video progress
    async getProgress(taskId) {
        if (!this.currentUser || !this.currentUser.id) return null;
        
        try {
            const { data, error } = await this.supabaseClient
                .from('video_progress')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('task_id', taskId)
                .single();
            
            if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
                console.error('Error fetching video progress:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching video progress:', error);
            return null;
        }
    }
    
    // Check if video is completed
    async isVideoCompleted(taskId) {
        const progress = await this.getProgress(taskId);
        return progress && progress.completed === true;
    }
    
    // Initialize video with saved progress
    async initializeVideo(taskId, videoElement) {
        if (!videoElement || videoElement.tagName !== 'VIDEO') return;
        
        // Get saved progress
        const savedProgress = await this.getProgress(taskId);
        
        // Set up progress tracking
        this.setupTracking(taskId, videoElement);
        
        if (savedProgress && savedProgress.current_position > 0 && savedProgress.watch_percentage < 95) {
            // Wait for video metadata to load
            if (videoElement.readyState >= 1) {
                this.showResumePrompt(taskId, videoElement, savedProgress);
            } else {
                videoElement.addEventListener('loadedmetadata', () => {
                    this.showResumePrompt(taskId, videoElement, savedProgress);
                }, { once: true });
            }
        }
    }
    
    // Show resume prompt
    showResumePrompt(taskId, videoElement, savedProgress) {
        const resumePosition = savedProgress.current_position;
        const percentage = savedProgress.watch_percentage || 0;
        
        // Format time for display
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        const container = videoElement.closest('.video-container') || videoElement.parentElement;
        if (!container) return;
        
        // Make container relative for absolute positioning
        const originalPosition = container.style.position;
        container.style.position = 'relative';
        
        // Create resume notification
        const notification = document.createElement('div');
        notification.className = 'video-resume-prompt';
        notification.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            z-index: 1000;
            display: flex;
            gap: 12px;
            align-items: center;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        `;
        
        notification.innerHTML = `
            <span>Resume from ${formatTime(resumePosition)} (${Math.round(percentage)}% watched)?</span>
            <button class="resume-yes" style="
                background: #10B981;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            ">Resume</button>
            <button class="resume-no" style="
                background: #6B7280;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            ">Start Over</button>
        `;
        
        container.appendChild(notification);
        
        // Handle resume button
        notification.querySelector('.resume-yes').addEventListener('click', () => {
            videoElement.currentTime = resumePosition;
            videoElement.play();
            notification.remove();
            container.style.position = originalPosition;
        });
        
        // Handle start over button
        notification.querySelector('.resume-no').addEventListener('click', () => {
            videoElement.currentTime = 0;
            videoElement.play();
            notification.remove();
            container.style.position = originalPosition;
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                container.style.position = originalPosition;
            }
        }, 10000);
    }
    
    // Set up progress tracking for a video
    setupTracking(taskId, videoElement) {
        if (!videoElement || videoElement.tagName !== 'VIDEO') return;
        
        // Clear existing tracker if any
        if (this.progressTrackers[taskId]) {
            clearTimeout(this.saveTimers[taskId]);
        }
        
        // Store reference
        this.progressTrackers[taskId] = videoElement;
        
        // Track progress on time update (debounced to every 5 seconds)
        videoElement.addEventListener('timeupdate', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                clearTimeout(this.saveTimers[taskId]);
                this.saveTimers[taskId] = setTimeout(() => {
                    this.saveProgress(taskId, videoElement.currentTime, videoElement.duration, videoElement.src);
                }, 5000); // Save every 5 seconds
            }
        });
        
        // Save progress when video pauses
        videoElement.addEventListener('pause', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                clearTimeout(this.saveTimers[taskId]);
                this.saveProgress(taskId, videoElement.currentTime, videoElement.duration, videoElement.src);
            }
        });
        
        // Save progress when video ends
        videoElement.addEventListener('ended', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                clearTimeout(this.saveTimers[taskId]);
                this.saveProgress(taskId, videoElement.duration, videoElement.duration, videoElement.src);
                
                // Check if this completes a required video
                if (this.isVideoCompletionRequired(taskId)) {
                    this.onVideoCompleted(taskId);
                }
            }
        });
        
        // Save progress before page unload
        window.addEventListener('beforeunload', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                clearTimeout(this.saveTimers[taskId]);
                // Use sendBeacon for reliable unload saving
                const data = {
                    user_id: this.currentUser?.id,
                    task_id: taskId,
                    current_position: videoElement.currentTime,
                    duration: videoElement.duration
                };
                navigator.sendBeacon('/api/video-progress', JSON.stringify(data));
            }
        });
        
        // Handle seeking
        let wasPlaying = false;
        videoElement.addEventListener('seeking', () => {
            wasPlaying = !videoElement.paused;
        });
        
        videoElement.addEventListener('seeked', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                // Save new position after seek
                clearTimeout(this.saveTimers[taskId]);
                this.saveProgress(taskId, videoElement.currentTime, videoElement.duration, videoElement.src);
            }
        });
    }
    
    // Handle video completion
    onVideoCompleted(taskId) {
        console.log(`Video completed for task ${taskId}`);
        
        // Enable the complete button if it was disabled
        const completeButtons = document.querySelectorAll('.header-complete-btn, .complete-task-btn');
        completeButtons.forEach(btn => {
            if (btn.dataset.taskId === taskId) {
                btn.disabled = false;
                btn.title = 'Mark task as complete';
                
                // Update button text if it was showing requirement
                if (btn.textContent.includes('Watch')) {
                    btn.textContent = btn.textContent.includes('Complete Task') ? '✓ Complete Task' : '✓ Complete';
                }
            }
        });
        
        // Show completion notification
        this.showCompletionNotification(taskId);
    }
    
    // Show video completion notification
    showCompletionNotification(taskId) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        notification.innerHTML = `
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
                <div style="font-weight: 600;">Video Completed!</div>
                <div style="font-size: 14px; opacity: 0.9;">You can now mark this task as complete.</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Clean up tracker for a task
    cleanup(taskId) {
        clearTimeout(this.saveTimers[taskId]);
        delete this.progressTrackers[taskId];
        delete this.saveTimers[taskId];
    }
    
    // Clean up all trackers
    cleanupAll() {
        Object.keys(this.saveTimers).forEach(taskId => {
            clearTimeout(this.saveTimers[taskId]);
        });
        this.progressTrackers = {};
        this.saveTimers = {};
    }
}

// Add slide animations
if (!document.getElementById('video-progress-styles')) {
    const style = document.createElement('style');
    style.id = 'video-progress-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .video-progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: rgba(0, 0, 0, 0.2);
            z-index: 100;
        }
        
        .video-progress-bar-fill {
            height: 100%;
            background: #10B981;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoProgressTracker;
}