// ============================================================
// CONFIGURATION
// ============================================================
// 1. Get your FREE Hugging Face API token from https://huggingface.co/settings/tokens
//    (Sign up, then create a token with "read" permissions)
// 2. Replace "YOUR_HF_TOKEN" below with your actual token.
// 3. Model: using google/flan-t5-large (free, open-source, good for story generation)
//    You can also try: mistralai/Mistral-7B-Instruct-v0.1 (if your token allows)
// ============================================================

const HF_TOKEN = "YOUR_HF_TOKEN";   // <-- PASTE YOUR TOKEN HERE
const MODEL = "google/flan-t5-large";  // free open-source model

// Story themes for variety
const storyThemes = [
    "a friendly dragon who learns to share",
    "a little bunny discovering courage",
    "a magical star that grants wishes",
    "a talking tree that helps animals",
    "a cloud that brings dreams to children",
    "a tiny mouse saving the day",
    "a rainbow bridge to wonderland",
    "a lost puppy finding home",
    "a curious kitten's adventure",
    "a fairy teaching kindness"
];

// Get random theme
function getRandomTheme() {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
}

// Helper function to call Hugging Face API
async function generateStoryWithHuggingFace(prompt) {
    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 600,
                        temperature: 0.85,
                        do_sample: true,
                        top_p: 0.95,
                        repetition_penalty: 1.1
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        
        // Handle different response formats
        if (Array.isArray(result) && result[0] && result[0].generated_text) {
            return result[0].generated_text;
        } else if (result.generated_text) {
            return result.generated_text;
        } else {
            throw new Error("Unexpected API response format");
        }
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Create a detailed prompt for a 5-minute bedtime story
function createPrompt() {
    const theme = getRandomTheme();
    return `Write a beautiful children's bedtime story about ${theme}. 
The story should:
- Take about 5 minutes to read aloud
- Have a happy ending
- Be appropriate for kids aged 3-8
- Include friendly characters
- Teach a gentle lesson about kindness, friendship, or courage
- Have a magical and soothing tone perfect for bedtime

Make it engaging, descriptive, and comforting. Start with "Once upon a time" and end with "Goodnight, sweet dreams."

Story:`;
}

// Fallback stories in case API fails
function getFallbackStory() {
    const fallbacks = [
        "Once upon a time, in a cozy little burrow, lived a brave little bunny named Benjamin. One night, he helped a lost firefly find its family. The firefly's family was so grateful they lit up the entire forest with magical lights. Benjamin learned that even the smallest act of kindness can create the biggest joy. From that night on, Benjamin and the fireflies became best friends, spreading light and happiness to all. Goodnight, sweet dreams! 🌙✨",
        
        "In a land where clouds were made of cotton candy, there lived a friendly dragon named Sparkle. Unlike other dragons, Sparkle didn't breathe fire – she breathed glitter and joy! One day, she helped a sad princess find her missing laughter by showing her all the beautiful things in the world. The princess learned that happiness is everywhere if you just look for it. Sparkle and the princess became friends forever, spreading sparkles and smiles. Goodnight, sweet dreams! 🐉✨",
        
        "Deep in an enchanted forest, a tiny mouse named Milo dreamed of being brave. One moonlit night, he helped a trapped owl escape from a net. The grateful owl taught Milo that true courage isn't about being big – it's about having a big heart. From that day forward, Milo became the hero of the forest, showing everyone that even the smallest creature can make a huge difference. Goodnight, sweet dreams! 🐭🌟"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Clean and format the generated story
function cleanStory(rawStory) {
    let cleaned = rawStory;
    
    // Remove any leftover prompt text
    if (cleaned.includes("Write a children's bedtime story")) {
        cleaned = cleaned.replace(/^Write a children's bedtime story.*?Story:/s, '');
    }
    
    // Remove any markdown formatting
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/###/g, '');
    
    // Ensure proper spacing
    cleaned = cleaned.trim();
    
    // Add bedtime closing if missing
    if (!cleaned.toLowerCase().includes('goodnight') && !cleaned.toLowerCase().includes('sweet dreams')) {
        cleaned += "\n\nGoodnight, sweet dreams! 🌙✨";
    }
    
    return cleaned;
}

// Main function to generate story
async function generateStory() {
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const storyDiv = document.getElementById('storyOutput');

    // Disable button and show loading
    generateBtn.disabled = true;
    loadingDiv.style.display = 'block';
    storyDiv.style.opacity = '0.5';

    try {
        // Check if token is configured
        if (HF_TOKEN === "YOUR_HF_TOKEN") {
            throw new Error("Please configure your Hugging Face API token in script.js");
        }

        const prompt = createPrompt();
        const rawStory = await generateStoryWithHuggingFace(prompt);
        const cleanedStory = cleanStory(rawStory);
        
        // Add some magic sparkle animation
        storyDiv.style.opacity = '0';
        setTimeout(() => {
            storyDiv.innerHTML = cleanedStory.replace(/\n/g, '<br>');
            storyDiv.style.opacity = '1';
        }, 200);
        
    } catch (error) {
        console.error('Generation error:', error);
        
        // Use fallback story if API fails
        const fallbackStory = getFallbackStory();
        storyDiv.innerHTML = `
            ⚠️ <strong>Using offline story mode</strong><br><br>
            ${fallbackStory.replace(/\n/g, '<br>')}
            <br><br>
            <small style="color: #666;">(API error: ${error.message})</small>
        `;
        storyDiv.style.opacity = '1';
    } finally {
        generateBtn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

// Add some interactive effects
function addInteractiveEffects() {
    const generateBtn = document.getElementById('generateBtn');
    
    // Add ripple effect on click
    generateBtn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Check if token is configured on load
function checkTokenOnLoad() {
    if (HF_TOKEN === "YOUR_HF_TOKEN") {
        const storyDiv = document.getElementById('storyOutput');
        storyDiv.innerHTML = `
            ⚠️ <strong>Setup Required</strong><br><br>
            To start generating magical stories:
            <ol style="margin: 15px 0 0 20px; line-height: 1.6;">
                <li>Get your free Hugging Face token from <a href="https://huggingface.co/settings/tokens" target="_blank">huggingface.co/settings/tokens</a></li>
                <li>Open the <code>script.js</code> file</li>
                <li>Replace <code>YOUR_HF_TOKEN</code> with your actual token</li>
                <li>Refresh this page and enjoy! 🎉</li>
            </ol>
            <br>
            <strong>No credit card required • Completely free</strong>
        `;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    addInteractiveEffects();
    checkTokenOnLoad();
    
    // Attach event listener
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', generateStory);
    
    // Optional: Add keyboard shortcut (Enter key)
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !generateBtn.disabled) {
            generateStory();
        }
    });
});

// Add ripple animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .generate-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
