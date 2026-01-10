/* ========================================
   ASTRA - Main Application
   Stress Detection + Recommendations
   ======================================== */

// -------------------- 
// DOM Elements
// -------------------- 
const stressForm = document.getElementById('stressForm');
const sleepHoursInput = document.getElementById('sleepHours');
const moodLevelInput = document.getElementById('moodLevel');
const moodValueDisplay = document.getElementById('moodValue');
const heartRateInput = document.getElementById('heartRate');
const activityLevelSelect = document.getElementById('activityLevel');

// Result Elements
const stressCircle = document.getElementById('stressCircle');
const stressPercentage = document.getElementById('stressPercentage');
const stressLevelBadge = document.getElementById('stressLevelBadge');
const stressLevelText = document.getElementById('stressLevelText');
const stressExplanation = document.getElementById('stressExplanation');

// Recommendations
const recommendationsSection = document.getElementById('recommendationsSection');
const recommendationsList = document.getElementById('recommendationsList');

// Stats
const lastCheckTime = document.getElementById('lastCheckTime');
const checksToday = document.getElementById('checksToday');
const avgStress = document.getElementById('avgStress');

// Modal
const highStressModal = document.getElementById('highStressModal');

// -------------------- 
// Event Listeners
// -------------------- 

// Mood slider update
if (moodLevelInput) {
    moodLevelInput.addEventListener('input', (e) => {
        moodValueDisplay.textContent = e.target.value;
    });
}

// Form submission
if (stressForm) {
    stressForm.addEventListener('submit', handleStressCheck);
}

// -------------------- 
// Stress Check Handler
// -------------------- 
async function handleStressCheck(e) {
    e.preventDefault();
    
    // Show loading state
    const analyzeText = document.getElementById('analyzeText');
    const analyzeLoader = document.getElementById('analyzeLoader');
    
    if (analyzeText && analyzeLoader) {
        analyzeText.classList.add('hidden');
        analyzeLoader.classList.remove('hidden');
    }
    
    // Get input values
    const sleepHours = parseFloat(sleepHoursInput.value);
    const moodLevel = parseInt(moodLevelInput.value);
    const heartRate = parseInt(heartRateInput.value);
    const activityLevel = activityLevelSelect.value;
    
    // Calculate stress level
    const stressResult = calculateStressLevel(sleepHours, moodLevel, heartRate, activityLevel);
    
    // Simulate processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Display results
    displayStressResult(stressResult);
    
    // Generate and display recommendations
    const recommendations = generateRecommendations(stressResult, sleepHours, moodLevel, heartRate, activityLevel);
    displayRecommendations(recommendations);
    
    // Save to Firebase
    const stressData = {
        sleepHours,
        moodLevel,
        heartRate,
        activityLevel,
        score: stressResult.score,
        level: stressResult.level,
        explanation: stressResult.explanation
    };
    
    await saveStressCheck(stressData);
    
    // Update local UI stats
    updateLocalStats(stressResult.level);
    
    // Show high stress modal if needed
    if (stressResult.level === 'high') {
        showHighStressModal();
    }
    
    // Reset button state
    if (analyzeText && analyzeLoader) {
        analyzeText.classList.remove('hidden');
        analyzeLoader.classList.add('hidden');
    }
    
    // Show success toast
    showToast('success', 'Analysis Complete', `Stress level: ${capitalizeFirst(stressResult.level)}`);
}

// -------------------- 
// Stress Calculation Logic
// -------------------- 
function calculateStressLevel(sleepHours, moodLevel, heartRate, activityLevel) {
    let stressScore = 0;
    let factors = [];
    
    // Sleep Analysis (0-30 points)
    // Optimal sleep: 7-9 hours
    if (sleepHours < 4) {
        stressScore += 30;
        factors.push('severely inadequate sleep');
    } else if (sleepHours < 6) {
        stressScore += 20;
        factors.push('insufficient sleep');
    } else if (sleepHours < 7) {
        stressScore += 10;
        factors.push('slightly low sleep');
    } else if (sleepHours > 10) {
        stressScore += 10;
        factors.push('excessive sleep (possible fatigue indicator)');
    }
    
    // Mood Analysis (0-35 points)
    // Scale: 1-10, lower is worse
    if (moodLevel <= 2) {
        stressScore += 35;
        factors.push('very low mood');
    } else if (moodLevel <= 4) {
        stressScore += 25;
        factors.push('low mood');
    } else if (moodLevel <= 5) {
        stressScore += 15;
        factors.push('neutral mood');
    } else if (moodLevel <= 6) {
        stressScore += 5;
    }
    // 7+ mood adds no stress
    
    // Heart Rate Analysis (0-25 points)
    // Normal resting: 60-100 BPM
    // In space, astronauts may have slightly different baselines
    if (heartRate < 50) {
        stressScore += 15;
        factors.push('unusually low heart rate');
    } else if (heartRate > 100) {
        stressScore += 25;
        factors.push('elevated heart rate');
    } else if (heartRate > 90) {
        stressScore += 15;
        factors.push('slightly elevated heart rate');
    } else if (heartRate > 80) {
        stressScore += 5;
    }
    
    // Activity Level Impact (0-10 points or reduction)
    switch (activityLevel) {
        case 'none':
            stressScore += 10;
            factors.push('no physical activity');
            break;
        case 'light':
            // Light activity is baseline, no change
            break;
        case 'moderate':
            stressScore -= 5; // Exercise reduces stress
            break;
        case 'intense':
            // Intense exercise can increase heart rate temporarily
            // but overall reduces stress
            stressScore -= 5;
            break;
    }
    
    // Ensure score is within bounds
    stressScore = Math.max(0, Math.min(100, stressScore));
    
    // Determine stress level
    let level, explanation;
    
    if (stressScore <= 25) {
        level = 'low';
        explanation = 'Your vitals and well-being indicators are within optimal range. Keep maintaining your healthy routines!';
    } else if (stressScore <= 55) {
        level = 'medium';
        if (factors.length > 0) {
            explanation = `Moderate stress detected. Contributing factors: ${factors.slice(0, 2).join(', ')}. Consider taking short breaks.`;
        } else {
            explanation = 'Moderate stress levels detected. Consider incorporating relaxation activities.';
        }
    } else {
        level = 'high';
        if (factors.length > 0) {
            explanation = `High stress detected! Key concerns: ${factors.slice(0, 3).join(', ')}. Immediate attention recommended.`;
        } else {
            explanation = 'High stress levels detected. Please take immediate steps to relax and consider reaching out for support.';
        }
    }
    
    return {
        score: stressScore,
        level: level,
        factors: factors,
        explanation: explanation
    };
}

// -------------------- 
// Display Stress Result
// -------------------- 
function displayStressResult(result) {
    // Update gauge circle
    const circumference = 2 * Math.PI * 40; // radius = 40
    const offset = circumference - (result.score / 100) * circumference;
    
    if (stressCircle) {
        stressCircle.style.strokeDashoffset = offset;
    }
    
    // Update percentage display
    if (stressPercentage) {
        animateNumber(stressPercentage, 0, result.score, 1000);
    }
    
    // Update gradient colors based on level
    const gradientStart = document.getElementById('gradientStart');
    const gradientEnd = document.getElementById('gradientEnd');
    
    if (gradientStart && gradientEnd) {
        switch (result.level) {
            case 'low':
                gradientStart.setAttribute('stop-color', '#22c55e');
                gradientEnd.setAttribute('stop-color', '#22d3ee');
                break;
            case 'medium':
                gradientStart.setAttribute('stop-color', '#eab308');
                gradientEnd.setAttribute('stop-color', '#f97316');
                break;
            case 'high':
                gradientStart.setAttribute('stop-color', '#ef4444');
                gradientEnd.setAttribute('stop-color', '#ec4899');
                break;
        }
    }
    
    // Update badge
    if (stressLevelBadge) {
        stressLevelBadge.className = `stress-badge stress-badge-${result.level}`;
    }
    
    if (stressLevelText) {
        stressLevelText.textContent = `${capitalizeFirst(result.level)} Stress`;
    }
    
    // Update explanation
    if (stressExplanation) {
        stressExplanation.textContent = result.explanation;
        stressExplanation.classList.add('fade-in');
    }
}

// -------------------- 
// Animate Number
// -------------------- 
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// -------------------- 
// Generate Recommendations
// -------------------- 
function generateRecommendations(stressResult, sleepHours, moodLevel, heartRate, activityLevel) {
    const recommendations = [];
    
    // Base recommendations on stress level
    if (stressResult.level === 'high') {
        recommendations.push({
            icon: '🫁',
            iconBg: 'bg-cyan-500/20',
            title: 'Breathing Exercise',
            description: 'Take 5 minutes for deep breathing. Inhale for 4 seconds, hold for 4, exhale for 6.',
            action: 'Start Now',
            link: 'games.html#breathing'
        });
        
        recommendations.push({
            icon: '💬',
            iconBg: 'bg-purple-500/20',
            title: 'Talk to ASTRA',
            description: 'Share what\'s on your mind. I\'m here to listen and provide support.',
            action: 'Open Chat',
            onclick: 'openChatbot()'
        });
    }
    
    // Sleep-based recommendations
    if (sleepHours < 6) {
        recommendations.push({
            icon: '😴',
            iconBg: 'bg-indigo-500/20',
            title: 'Rest Reminder',
            description: `You've had only ${sleepHours} hours of sleep. Consider scheduling a 20-minute power nap.`,
            action: 'Set Reminder'
        });
    }
    
    // Mood-based recommendations
    if (moodLevel <= 4) {
        recommendations.push({
            icon: '🎮',
            iconBg: 'bg-pink-500/20',
            title: 'Stress-Relief Game',
            description: 'Play a calming space game to shift your focus and improve your mood.',
            action: 'Play Now',
            link: 'games.html'
        });
    }
    
    // Heart rate recommendations
    if (heartRate > 90) {
        recommendations.push({
            icon: '🧘',
            iconBg: 'bg-green-500/20',
            title: 'Relaxation Exercise',
            description: 'Your heart rate is elevated. Try progressive muscle relaxation to calm down.',
            action: 'Learn More'
        });
    }
    
    // Activity-based recommendations
    if (activityLevel === 'none') {
        recommendations.push({
            icon: '🏃',
            iconBg: 'bg-orange-500/20',
            title: 'Physical Activity',
            description: 'Light exercise can significantly reduce stress. Try 15 minutes of stretching.',
            action: 'View Exercises'
        });
    }
    
    // General recommendations for low stress
    if (stressResult.level === 'low') {
        recommendations.push({
            icon: '⭐',
            iconBg: 'bg-yellow-500/20',
            title: 'Great Work!',
            description: 'Your stress levels are optimal. Keep up your healthy habits!',
            action: null
        });
    }
    
    // Always add crew check recommendation for medium/high
    if (stressResult.level !== 'low') {
        recommendations.push({
            icon: '👥',
            iconBg: 'bg-blue-500/20',
            title: 'Connect with Crew',
            description: 'Social connection can help reduce stress. Check in with your crewmates.',
            action: 'View Crew',
            link: 'crew.html'
        });
    }
    
    return recommendations.slice(0, 4); // Max 4 recommendations
}

// -------------------- 
// Display Recommendations
// -------------------- 
function displayRecommendations(recommendations) {
    if (!recommendationsSection || !recommendationsList) return;
    
    // Show section
    recommendationsSection.classList.remove('hidden');
    
    // Clear existing
    recommendationsList.innerHTML = '';
    
    // Add each recommendation
    recommendations.forEach((rec, index) => {
        const item = document.createElement('div');
        item.className = 'recommendation-item fade-in';
        item.style.animationDelay = `${index * 0.1}s`;
        
        item.innerHTML = `
            <div class="recommendation-icon ${rec.iconBg}">
                ${rec.icon}
            </div>
            <div class="recommendation-content flex-1">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
            ${rec.action ? `
                <${rec.link ? 'a href="' + rec.link + '"' : 'button' + (rec.onclick ? ' onclick="' + rec.onclick + '"' : '')} 
                    class="btn-secondary text-sm px-3 py-1">
                    ${rec.action}
                </${rec.link ? 'a' : 'button'}>
            ` : ''}
        `;
        
        recommendationsList.appendChild(item);
    });
    
    // Save recommendations to Firebase
    recommendations.forEach(rec => {
        saveRecommendation({
            title: rec.title,
            description: rec.description
        });
    });
}

// -------------------- 
// Update Local Stats
// -------------------- 
function updateLocalStats(level) {
    // Update last check time
    if (lastCheckTime) {
        const now = new Date();
        lastCheckTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Update checks today (increment)
    if (checksToday) {
        const current = parseInt(checksToday.textContent) || 0;
        checksToday.textContent = current + 1;
    }
    
    // Update average stress display
    if (avgStress) {
        avgStress.textContent = capitalizeFirst(level);
    }
}

// -------------------- 
// Simulate Heart Rate
// -------------------- 
function simulateHeartRate() {
    // Simulate realistic heart rate with slight variation
    const baseRate = 72;
    const variation = Math.floor(Math.random() * 30) - 10; // -10 to +20
    const simulatedRate = baseRate + variation;
    
    if (heartRateInput) {
        heartRateInput.value = simulatedRate;
        
        // Add visual feedback
        heartRateInput.classList.add('border-cyan-500');
        setTimeout(() => {
            heartRateInput.classList.remove('border-cyan-500');
        }, 500);
    }
    
    showToast('info', 'Heart Rate Simulated', `${simulatedRate} BPM detected`);
}

// -------------------- 
// High Stress Modal
// -------------------- 
function showHighStressModal() {
    if (highStressModal) {
        highStressModal.classList.remove('hidden');
    }
}

function closeHighStressModal() {
    if (highStressModal) {
        highStressModal.classList.add('hidden');
    }
}

// -------------------- 
// Utility Functions
// -------------------- 
function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// -------------------- 
// Initialize Page
// -------------------- 
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ASTRA App initialized');
    
    // Set current time for last check placeholder
    if (lastCheckTime) {
        lastCheckTime.textContent = '--:--';
    }
});

// -------------------- 
// Keyboard Shortcuts
// -------------------- 
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (stressForm) {
            stressForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeHighStressModal();
    }
});

// -------------------- 
// Export functions for global access
// -------------------- 
window.simulateHeartRate = simulateHeartRate;
window.closeHighStressModal = closeHighStressModal;
window.capitalizeFirst = capitalizeFirst;