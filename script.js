// Word banks for algorithmic generation
const prefixes = [
  'super', 'hyper', 'ultra', 'mega', 'meta', 'neo', 'zen', 'flux',
  'sync', 'snap', 'swift', 'spark', 'stack', 'stream', 'cloud', 'cyber',
  'data', 'deep', 'fast', 'flex', 'flow', 'go', 'high', 'insta',
  'launch', 'leap', 'light', 'link', 'loop', 'next', 'nova', 'omni',
  'open', 'peak', 'pixel', 'prime', 'pulse', 'quantum', 'quick', 'rapid',
  'scale', 'ship', 'signal', 'smart', 'solid', 'source', 'spin', 'sprint'
];

const suffixes = [
  'ly', 'fy', 'io', 'ai', 'co', 'hq', 'lab', 'labs', 'hub', 'box',
  'kit', 'base', 'pad', 'dock', 'deck', 'spot', 'mind', 'wise', 'way',
  'flow', 'path', 'sync', 'shift', 'stack', 'works', 'craft', 'forge',
  'wave', 'pulse', 'cast', 'grid', 'mesh', 'node', 'core', 'zone'
];

const techWords = [
  'byte', 'bit', 'code', 'dev', 'api', 'app', 'web', 'net', 'tech',
  'logic', 'algo', 'pixel', 'vector', 'scalar', 'tensor', 'matrix',
  'cloud', 'server', 'client', 'node', 'edge', 'graph', 'query'
];

const actionWords = [
  'build', 'ship', 'launch', 'deploy', 'scale', 'grow', 'boost', 'amp',
  'push', 'pull', 'fetch', 'send', 'sync', 'link', 'connect', 'merge',
  'split', 'track', 'watch', 'monitor', 'alert', 'notify', 'stream'
];

const abstractWords = [
  'zen', 'nova', 'aura', 'apex', 'axis', 'crux', 'flux', 'nexus',
  'orbit', 'prism', 'helix', 'vertex', 'cipher', 'vector', 'quantum',
  'nimbus', 'stratus', 'cirrus', 'aurora', 'nebula', 'cosmos', 'stellar'
];

// DOM elements
const ideaInput = document.getElementById('ideaInput');
const generateBtn = document.getElementById('generateBtn');
const aiToggle = document.getElementById('aiToggle');
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKeyInput');
const results = document.getElementById('results');
const emptyState = document.getElementById('emptyState');

// Toggle AI mode
aiToggle.addEventListener('change', () => {
  apiKeySection.classList.toggle('hidden', !aiToggle.checked);
});

// Generate on Enter key
ideaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    generateNames();
  }
});

// Generate on button click
generateBtn.addEventListener('click', generateNames);

// Main generation function
async function generateNames() {
  const idea = ideaInput.value.trim();

  if (!idea) {
    ideaInput.focus();
    return;
  }

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  results.innerHTML = '';
  emptyState.classList.add('hidden');

  let names = [];

  if (aiToggle.checked && apiKeyInput.value.trim()) {
    // AI-powered generation
    names = await generateWithAI(idea, apiKeyInput.value.trim());
  } else {
    // Algorithmic generation
    names = generateAlgorithmic(idea);
  }

  // Display results
  displayNames(names);

  // Reset button
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate names';
}

// Algorithmic name generation
function generateAlgorithmic(idea) {
  const words = idea.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const names = new Set();

  // Strategy 1: Prefix + idea word
  words.forEach(word => {
    const prefix = pick(prefixes);
    names.add(capitalize(prefix + word));
  });

  // Strategy 2: Idea word + suffix
  words.forEach(word => {
    const suffix = pick(suffixes);
    names.add(capitalize(word + suffix));
  });

  // Strategy 3: Two word mashups
  for (let i = 0; i < 3; i++) {
    const w1 = pick([...words, ...techWords, ...actionWords]);
    const w2 = pick([...words, ...abstractWords]);
    names.add(capitalize(w1.slice(0, 4) + w2.slice(-4)));
  }

  // Strategy 4: Abstract + suffix
  for (let i = 0; i < 3; i++) {
    names.add(capitalize(pick(abstractWords) + pick(suffixes)));
  }

  // Strategy 5: Prefix + abstract
  for (let i = 0; i < 3; i++) {
    names.add(capitalize(pick(prefixes) + pick(abstractWords)));
  }

  // Strategy 6: Action + tech
  for (let i = 0; i < 2; i++) {
    names.add(capitalize(pick(actionWords) + pick(techWords)));
  }

  // Strategy 7: Creative combinations
  for (let i = 0; i < 3; i++) {
    const patterns = [
      () => pick(prefixes) + pick(suffixes),
      () => pick(techWords) + pick(suffixes),
      () => pick(actionWords) + pick(abstractWords).slice(0, 4),
      () => pick(words) + pick(techWords),
    ];
    names.add(capitalize(pick(patterns)()));
  }

  return shuffleArray([...names]).slice(0, 12);
}

// AI-powered generation using OpenAI
async function generateWithAI(idea, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a startup naming expert. Generate creative, memorable, and brandable startup names. Names should be short (1-2 syllables ideally), easy to spell, and work well as .com domains. Return ONLY a JSON array of 12 name strings, nothing else.'
        }, {
          role: 'user',
          content: `Generate 12 unique startup names for this idea: ${idea}`
        }],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON array from response
    const names = JSON.parse(content);
    return names.map(n => capitalize(n.toLowerCase().replace(/[^a-z]/g, '')));
  } catch (error) {
    console.error('AI generation failed:', error);
    // Fallback to algorithmic
    return generateAlgorithmic(idea);
  }
}

// Display generated names
function displayNames(names) {
  results.innerHTML = names.map((name, i) => `
    <div class="name-card bg-dark-surface border border-dark-border rounded-lg p-4 animate-in" style="animation-delay: ${i * 50}ms">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="font-mono text-lg font-medium">${name}</span>
          <span class="text-dark-muted text-sm">${name.toLowerCase()}.com</span>
        </div>
        <div class="flex items-center gap-2 domain-link">
          <a
            href="https://www.namecheap.com/domains/registration/results/?domain=${name.toLowerCase()}"
            target="_blank"
            rel="noopener"
            class="text-xs bg-dark-hover border border-dark-border px-3 py-1.5 rounded-md hover:border-dark-accent hover:text-dark-accent transition-colors"
          >
            Namecheap
          </a>
          <a
            href="https://www.godaddy.com/domainsearch/find?domainToCheck=${name.toLowerCase()}"
            target="_blank"
            rel="noopener"
            class="text-xs bg-dark-hover border border-dark-border px-3 py-1.5 rounded-md hover:border-dark-accent hover:text-dark-accent transition-colors"
          >
            GoDaddy
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Utility functions
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
