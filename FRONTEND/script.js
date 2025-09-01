// Sample data to demonstrate functionality
let journalEntries = [
    { date: '2024-08-28', text: 'Had a great day at work, feeling accomplished!', emotion: 'Happy', score: 85 },
    { date: '2024-08-27', text: 'Feeling a bit anxious about the upcoming presentation.', emotion: 'Anxious', score: 40 },
    { date: '2024-08-26', text: 'Relaxing weekend with family, very content.', emotion: 'Content', score: 78 },
    { date: '2024-08-25', text: 'Challenging day but learned a lot.', emotion: 'Mixed', score: 65 },
    { date: '2024-08-24', text: 'Excited about new opportunities!', emotion: 'Excited', score: 90 }
];

// Initialize Chart
const ctx = document.getElementById('moodChart').getContext('2d');
let moodChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: journalEntries.map(entry => entry.date),
        datasets: [{
            label: 'Mood Score',
            data: journalEntries.map(entry => entry.score),
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// Mock AI Sentiment Analysis (simulates Hugging Face API)
function analyzeSentiment(text) {
    // This would normally call Hugging Face API
    // For demo, we'll simulate different emotions based on keywords
    const emotions = {
        'happy': { emotion: 'Happy', score: Math.random() * 20 + 75, color: '#10B981' },
        'sad': { emotion: 'Sad', score: Math.random() * 30 + 20, color: '#EF4444' },
        'anxious': { emotion: 'Anxious', score: Math.random() * 25 + 30, color: '#F59E0B' },
        'excited': { emotion: 'Excited', score: Math.random() * 15 + 80, color: '#8B5CF6' },
        'angry': { emotion: 'Angry', score: Math.random() * 25 + 25, color: '#EF4444' },
        'content': { emotion: 'Content', score: Math.random() * 20 + 65, color: '#06B6D4' }
    };

    const lowerText = text.toLowerCase();
    
    for (let key in emotions) {
        if (lowerText.includes(key) || lowerText.includes(key + 'ness') || lowerText.includes(key + 'ing')) {
            return emotions[key];
        }
    }

    // Default positive sentiment
    return { emotion: 'Neutral', score: Math.random() * 30 + 50, color: '#6B7280' };
}

// Handle form submission
document.getElementById('journalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const entryText = document.getElementById('journalEntry').value;
    if (!entryText.trim()) return;

    // Show loading
    document.getElementById('loadingDiv').style.display = 'block';
    document.getElementById('emotionDisplay').style.display = 'none';

    // Simulate API delay
    setTimeout(() => {
        // Analyze sentiment (mock)
        const analysis = analyzeSentiment(entryText);
        
        // Display results
        document.getElementById('emotionScore').textContent = `${analysis.emotion}: ${Math.round(analysis.score)}%`;
        document.getElementById('emotionDetails').textContent = getEmotionMessage(analysis.emotion, analysis.score);
        document.getElementById('emotionDisplay').style.backgroundColor = analysis.color;
        
        // Hide loading and show results
        document.getElementById('loadingDiv').style.display = 'none';
        document.getElementById('emotionDisplay').style.display = 'block';

        // Add to entries
        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            text: entryText,
            emotion: analysis.emotion,
            score: Math.round(analysis.score)
        };
        
        journalEntries.unshift(newEntry);
        updateRecentEntries();
        updateChart();
        updateStats();

        // Clear form
        document.getElementById('journalEntry').value = '';
    }, 2000);
});

function getEmotionMessage(emotion, score) {
    const messages = {
        'Happy': 'Your entry radiates positivity and joy! Keep nurturing these good vibes.',
        'Sad': 'It\'s okay to feel down sometimes. Remember that this feeling will pass.',
        'Anxious': 'Take deep breaths. Consider what specific steps might help ease your worries.',
        'Excited': 'Your enthusiasm is wonderful! Channel this energy into something meaningful.',
        'Angry': 'Strong emotions can be signals. What might this anger be telling you?',
        'Content': 'A beautiful state of peaceful satisfaction. Savor these moments.',
        'Neutral': 'A balanced emotional state. Sometimes neutral is exactly what we need.'
    };
    return messages[emotion] || 'Every emotion is valid and part of your human experience.';
}

function updateRecentEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = journalEntries.slice(0, 3).map(entry => `
        <div class="entry-item">
            <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="entry-text">${entry.text.substring(0, 100)}${entry.text.length > 100 ? '...' : ''}</div>
            <div class="entry-mood">${entry.emotion}: ${entry.score}%</div>
        </div>
    `).join('');
}

function updateChart() {
    moodChart.data.labels = journalEntries.slice(0, 10).reverse().map(entry => entry.date);
    moodChart.data.datasets[0].data = journalEntries.slice(0, 10).reverse().map(entry => entry.score);
    moodChart.update();
}

function updateStats() {
    const scores = journalEntries.map(entry => entry.score);
    const avgMood = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    document.getElementById('avgMood').textContent = avgMood.toFixed(1);
    document.getElementById('totalEntries').textContent = journalEntries.length;
    document.getElementById('streak').textContent = Math.min(journalEntries.length, 7); // Simplified streak calculation
    
    // Find most common emotion
    const emotionCounts = {};
    journalEntries.forEach(entry => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });
    const topEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
    document.getElementById('topEmotion').textContent = topEmotion;
}

function toggleAuth() {
    alert('🔐 Authentication would integrate with your backend!\n\nFor demo: Flask + MySQL setup needed for:\n• User registration/login\n• Secure session management\n• Personal data storage');
}

function initPaystack() {
    alert('💳 Paystack Integration Ready!\n\nThis would initialize Paystack payment:\n• Monthly subscription: $4.99\n• Premium features unlock\n• Secure payment processing\n\nPaystack public key needed in production!');
}

// Initialize on load
updateRecentEntries();
updateStats();