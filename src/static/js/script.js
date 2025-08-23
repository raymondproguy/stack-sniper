async function getSolution() {
    const errorInput = document.getElementById('errorInput');
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const errorMessage = document.getElementById('errorMessage');
    const loader = document.getElementById('loader');
    const snipeBtn = document.getElementById('snipeBtn');
    
    const errorText = errorInput.value.trim();
    
    // Validate input
    if (!errorText) {
        showError('Please enter an error message');
        return;
    }
    
    if (errorText.length < 2) {
        showError('Error message must be at least 2 characters long');
        return;
    }
    
    // Clear previous results and show loading
    hideError();
    resultSection.style.display = 'block';
    resultContent.innerHTML = '';
    loader.style.display = 'block';
    snipeBtn.disabled = true;
    snipeBtn.textContent = 'Sniping...';
    snipeBtn.style.opacity = '0.7';
    
    try {
        const response = await fetch(`/api/snipe?error=${encodeURIComponent(errorText)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to fetch solution');
        }
        
        if (data.success) {
            displaySolution(data.solution);
        } else {
            throw new Error(data.detail || 'No solution found');
        }
        
    } catch (error) {
        showError(error.message || 'An unexpected error occurred');
        resultSection.style.display = 'none';
    } finally {
        loader.style.display = 'none';
        snipeBtn.disabled = false;
        snipeBtn.textContent = 'Snipe Solution';
        snipeBtn.style.opacity = '1';
    }
}

function displaySolution(solution) {
    const resultContent = document.getElementById('resultContent');
    
    // Format the solution text
    let formattedSolution = solution;
    
    // Highlight code blocks
    formattedSolution = formattedSolution.replace(/```([\s\S]*?)```/g, '<div class="code-block">$1</div>');
    
    // Highlight inline code
    formattedSolution = formattedSolution.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    resultContent.innerHTML = formattedSolution;
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// Add event listener for Enter key
document.getElementById('errorInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        getSolution();
    }
});
