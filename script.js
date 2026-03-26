// ============================================================
// CONFIGURATION – GROQ API
// ============================================================
const GROQ_API_KEY = "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";   // <-- PASTE YOUR KEY HERE
const MODEL = "llama-3.3-70b-versatile";     // active free model

// Story themes
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

function getRandomTheme() {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
}

async function generateStoryWithGroq(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a friendly children's storyteller. You create magical, soothing bedtime stories for young children (ages 3-8). Always end with a happy ending and include a gentle lesson."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 600,
            top_p: 0.95
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

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

Make it engaging, descriptive, and comforting. Start with "Once upon a time" and end with "Goodnight, sweet dreams."`;
}

function getFallbackStory() {
    const fallbacks = [
        "Once upon a time, in a cozy little burrow, lived a brave little bunny named Benjamin. One night, he helped a lost firefly find its family. The firefly's family was so grateful they lit up the entire forest with magical lights. Benjamin learned that even the smallest act of kindness can create the biggest joy. From that night on, Benjamin and the fireflies became best friends, spreading light and happiness to all. Goodnight, sweet dreams! 🌙✨",
        "In a land where clouds were made of cotton candy, there lived a friendly dragon named Sparkle. Unlike other dragons, Sparkle didn't breathe fire – she breathed glitter and joy! One day, she helped a sad princess find her missing laughter by showing her all the beautiful things in the world. The princess learned that happiness is everywhere if you just look for it. Sparkle and the princess became friends forever, spreading sparkles and smiles. Goodnight, sweet dreams! 🐉✨",
        "Deep in an enchanted forest, a tiny mouse named Milo dreamed of being brave. One moonlit night, he helped a trapped owl escape from a net. The grateful owl taught Milo that true courage isn't about being big – it's about having a big heart. From that day forward, Milo became the hero of the forest, showing everyone that even the smallest creature can make a huge difference. Goodnight, sweet dreams! 🐭🌟"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function cleanStory(rawStory) {
    let cleaned = rawStory;
    if (cleaned.includes("Write a children's bedtime story")) {
        cleaned = cleaned.replace(/^Write a children's bedtime story.*?Story:/s, '');
    }
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/###/g, '');
    cleaned = cleaned.trim();
    if (!cleaned.toLowerCase().includes('goodnight') && !cleaned.toLowerCase().includes('sweet dreams')) {
        cleaned += "\n\nGoodnight, sweet dreams! 🌙✨";
    }
    return cleaned;
}

async function generateStory() {
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const storyDiv = document.getElementById('storyOutput');

    generateBtn.disabled = true;
    loadingDiv.style.display = 'block';
    storyDiv.style.opacity = '0.5';

    try {
        if (GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
            throw new Error("Please configure your Groq API key in script.js");
        }

        const prompt = createPrompt();
        const rawStory = await generateStoryWithGroq(prompt);
        const cleanedStory = cleanStory(rawStory);
        
        storyDiv.style.opacity = '0';
        setTimeout(() => {
            storyDiv.innerHTML = cleanedStory.replace(/\n/g, '<br>');
            storyDiv.style.opacity = '1';
        }, 200);
        
    } catch (error) {
        console.error('Generation error:', error);
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

function addInteractiveEffects() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        setTimeout(() => ripple.remove(), 600);
    });
}

function checkTokenOnLoad() {
    if (GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
        const storyDiv = document.getElementById('storyOutput');
        storyDiv.innerHTML = `
            ⚠️ <strong>Setup Required</strong><br><br>
            To start generating magical stories:
            <ol style="margin: 15px 0 0 20px; line-height: 1.6;">
                <li>Get your free Groq API key from <a href="https://console.groq.com" target="_blank">console.groq.com</a> (free tier)</li>
                <li>Open the <code>script.js</code> file</li>
                <li>Replace <code>YOUR_GROQ_API_KEY</code> with your actual key</li>
                <li>Refresh this page and enjoy! 🎉</li>
            </ol>
            <br>
            <strong>No credit card required • Completely free</strong>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addInteractiveEffects();
    checkTokenOnLoad();
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', generateStory);
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !generateBtn.disabled) {
            generateStory();
        }
    });
});

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
