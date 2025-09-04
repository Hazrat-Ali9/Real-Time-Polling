document.addEventListener('DOMContentLoaded', function() {
    // Dom Elements
    const pollContainer = document.getElementById('pollContainer');
    const pollQuestion = document.getElementById('pollQuestion');
    const totalVotes = document.getElementById('totalVotes');
    const pollStatus = document.getElementById('pollStatus');
    const pollOptions = document.getElementById('pollOptions');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsChart = document.getElementById('resultsChart');
    const resultsTable = document.getElementById('resultsTable');
    const timeRemaining = document.getElementById('timeRemaining');
    const shareBtn = document.getElementById('shareBtn');
    const shareModal = document.getElementById('shareModal');
    const closeBtn = document.querySelector('.close-btn');
    const pollLink = document.getElementById('pollLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    // Current poll data
    let currentPoll = null;
    let selectedOption = null;
    let hasVoted = false;
    
    // For demo purposes - in a real app, this would come from a server
    const demoPolls = [
        {
            id: 'poll1',
            question: 'Which JavaScript framework do you prefer in 2023?',
            options: [
                { id: 'opt1', text: 'React', votes: 0 },
                { id: 'opt2', text: 'Vue', votes: 0 },
                { id: 'opt3', text: 'Angular', votes: 0 },
                { id: 'opt4', text: 'Svelte', votes: 0 },
                { id: 'opt5', text: 'None of the above', votes: 0 }
            ],
            totalVotes: 0,
            isActive: true,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
    ];

    // Initialize the app
    function init() {
        loadPoll();
        setupEventListeners();
        startPollTimer();
        
        // Simulate other users voting (for demo purposes)
        if (currentPoll && currentPoll.isActive) {
            simulateVotes();
        }
    }

    // Load poll data
    function loadPoll() {
        // In a real app, you would fetch this from an API
        currentPoll = demoPolls[0];
        
        // Check if user has already voted (from localStorage)
        const votedPoll = localStorage.getItem(`voted_${currentPoll.id}`);
        if (votedPoll) {
            hasVoted = true;
            selectedOption = JSON.parse(votedPoll).optionId;
        }
        
        renderPoll();
        renderResults();
    }

    // Render the poll question and options
    function renderPoll() {
        if (!currentPoll) return;
        
        pollQuestion.textContent = currentPoll.question;
        totalVotes.textContent = `${currentPoll.totalVotes} ${currentPoll.totalVotes === 1 ? 'vote' : 'votes'}`;
        
        // Update status
        if (currentPoll.isActive) {
            pollStatus.innerHTML = '<i class="fas fa-circle"></i> Live';
            pollStatus.className = 'status-active';
        } else {
            pollStatus.innerHTML = '<i class="fas fa-circle"></i> Closed';
            pollStatus.className = 'status-inactive';
        }
        
        // Clear previous options
        pollOptions.innerHTML = '';
        
        // Add loading state if no options
        if (currentPoll.options.length === 0) {
            pollOptions.innerHTML = '<p>No options available for this poll.</p>';
            return;
        }
        
        // Render each option
        currentPoll.options.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.dataset.optionId = option.id;
            
            // Calculate percentage (avoid division by zero)
            const percentage = currentPoll.totalVotes > 0 
                ? Math.round((option.votes / currentPoll.totalVotes) * 100) 
                : 0;
            
            // If user has voted, show results on options
            if (hasVoted) {
                optionEl.innerHTML = `
                    <div class="percentage-bar" style="width: ${percentage}%"></div>
                    <div class="option-content">
                        <span>${option.text}</span>
                        <span>${percentage}%</span>
                    </div>
                `;
                
                // Highlight selected option
                if (option.id === selectedOption) {
                    optionEl.classList.add('selected');
                }
            } else {
                optionEl.innerHTML = `
                    <div class="option-content">
                        <span>${option.text}</span>
                    </div>
                `;
            }
            
            // Only add click event if poll is active and user hasn't voted
            if (currentPoll.isActive && !hasVoted) {
                optionEl.addEventListener('click', () => handleOptionClick(option.id));
            }
            
            pollOptions.appendChild(optionEl);
        });
    }

    // Handle option selection
    function handleOptionClick(optionId) {
        if (hasVoted || !currentPoll.isActive) return;
        
        selectedOption = optionId;
        
        // Update UI to show selection
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.optionId === optionId) {
                opt.classList.add('selected');
            }
        });
        
        // In a real app, you would send this to the server
        setTimeout(() => {
            submitVote(optionId);
        }, 500);
    }

    // Submit vote to server (simulated here)
    function submitVote(optionId) {
        // Find the selected option
        const option = currentPoll.options.find(opt => opt.id === optionId);
        if (!option) return;
        
        // Update votes
        option.votes++;
        currentPoll.totalVotes++;
        
        // Mark as voted
        hasVoted = true;
        localStorage.setItem(`voted_${currentPoll.id}`, JSON.stringify({
            optionId: optionId,
            timestamp: new Date().toISOString()
        }));
        
        // Update UI
        renderPoll();
        renderResults();
        
        // In a real app, you would also send this to the server
        // and potentially connect via WebSockets for real-time updates
    }

    // Render results chart and table
    function renderResults() {
        if (!currentPoll || currentPoll.totalVotes === 0) {
            resultsChart.innerHTML = '<p>No votes yet.</p>';
            resultsTable.innerHTML = '<p>No votes yet.</p>';
            return;
        }
        
        // Clear previous results
        resultsChart.innerHTML = '';
        resultsTable.innerHTML = '';
        
        // Sort options by votes (descending)
        const sortedOptions = [...currentPoll.options].sort((a, b) => b.votes - a.votes);
        
        // Create chart bars
        sortedOptions.forEach(option => {
            const percentage = Math.round((option.votes / currentPoll.totalVotes) * 100);
            
            // Create bar for chart
            const barEl = document.createElement('div');
            barEl.className = 'bar';
            barEl.innerHTML = `
                <div class="bar-fill" style="width: ${percentage}%"></div>
                <span class="bar-label">${option.text}</span>
                <span class="bar-percentage">${percentage}% (${option.votes})</span>
            `;
            resultsChart.appendChild(barEl);
        });
        
        // Create table
        const tableEl = document.createElement('table');
        tableEl.className = 'results-table';
        tableEl.innerHTML = `
            <thead>
                <tr>
                    <th>Option</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${sortedOptions.map(option => {
                    const percentage = Math.round((option.votes / currentPoll.totalVotes) * 100);
                    return `
                        <tr>
                            <td>${option.text}</td>
                            <td>${option.votes}</td>
                            <td>${percentage}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        resultsTable.appendChild(tableEl);
    }

    // Start countdown timer for poll
    function startPollTimer() {
        if (!currentPoll || !currentPoll.endTime) return;
        
        updateTimer();
        
        // Update timer every second
        const timerInterval = setInterval(updateTimer, 1000);
        
        function updateTimer() {
            const now = new Date();
            const endTime = new Date(currentPoll.endTime);
            const diff = endTime - now;
            
            if (diff <= 0) {
                clearInterval(timerInterval);
                timeRemaining.textContent = 'Poll ended';
                currentPoll.isActive = false;
                renderPoll();
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timeRemaining.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Simulate other users voting (for demo purposes)
    function simulateVotes() {
        if (!currentPoll.isActive) return;
        
        const simulateInterval = setInterval(() => {
            if (!currentPoll.isActive) {
                clearInterval(simulateInterval);
                return;
            }
            
            // Randomly select an option to vote for
            const randomIndex = Math.floor(Math.random() * currentPoll.options.length);
            const option = currentPoll.options[randomIndex];
            
            // Update votes
            option.votes++;
            currentPoll.totalVotes++;
            
            // Update UI if user hasn't voted yet
            if (!hasVoted) {
                renderPoll();
                renderResults();
            }
        }, 3000); // Simulate a vote every 3 seconds
    }

    // Setup event listeners
    function setupEventListeners() {
        // Share button
        shareBtn.addEventListener('click', () => {
            shareModal.style.display = 'flex';
            pollLink.value = window.location.href;
        });
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
        
        // Copy link button
        copyLinkBtn.addEventListener('click', () => {
            pollLink.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        });
        
        // Social share buttons (simplified for demo)
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`Sharing to ${btn.classList[1]} (simulated)`);
            });
        });
    }

    // Initialize the app
    init();
});