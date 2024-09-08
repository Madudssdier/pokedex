console.log("Script loaded");

let allPokemon = [];
let displayedPokemon = [];

const pokemonTypes = [
    { name: 'Normal', icon: '⚪', color: '#A8A878' },
    { name: 'Fire', icon: '🔥', color: '#F08030' },
    { name: 'Water', icon: '💧', color: '#6890F0' },
    { name: 'Grass', icon: '🌿', color: '#78C850' },
    { name: 'Electric', icon: '⚡', color: '#F8D030' },
    { name: 'Ice', icon: '❄️', color: '#98D8D8' },
    { name: 'Fighting', icon: '🥊', color: '#C03028' },
    { name: 'Poison', icon: '☠️', color: '#A040A0' },
    { name: 'Ground', icon: '🌍', color: '#E0C068' },
    { name: 'Flying', icon: '🦅', color: '#A890F0' },
    { name: 'Psychic', icon: '🔮', color: '#F85888' },
    { name: 'Bug', icon: '🐛', color: '#A8B820' },
    { name: 'Rock', icon: '🪨', color: '#B8A038' },
    { name: 'Ghost', icon: '👻', color: '#705898' },
    { name: 'Dragon', icon: '🐉', color: '#7038F8' },
    { name: 'Dark', icon: '🌑', color: '#705848' },
    { name: 'Steel', icon: '⚙️', color: '#B8B8D0' },
    { name: 'Fairy', icon: '🧚', color: '#EE99AC' }
];

async function loadAllPokemon() {
    try {
        console.log('Starting to load Pokemon...');
        const loadingAnimation = document.getElementById('loading-animation');
        loadingAnimation.style.display = 'flex';

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched initial Pokemon data:', data);
        
        allPokemon = await Promise.all(data.results.map(async (pokemon) => {
            try {
                console.log('Fetching details for:', pokemon.name);
                const detailResponse = await fetch(pokemon.url);
                if (!detailResponse.ok) {
                    throw new Error(`HTTP error! status: ${detailResponse.status}`);
                }
                const pokemonData = await detailResponse.json();
                return {
                    name: pokemonData.name,
                    type: {
                        name: pokemonData.types[0].type.name,
                        icon: pokemonTypes.find(t => t.name.toLowerCase() === pokemonData.types[0].type.name)?.icon || '❓',
                        color: pokemonTypes.find(t => t.name.toLowerCase() === pokemonData.types[0].type.name)?.color || '#CCCCCC'
                    },
                    imageUrl: pokemonData.sprites.front_default,
                    height: pokemonData.height,
                    weight: pokemonData.weight
                };
            } catch (error) {
                console.error(`Error fetching details for ${pokemon.name}:`, error);
                return null;
            }
        })).then(results => results.filter(pokemon => pokemon !== null));
        
        console.log('All Pokemon loaded:', allPokemon);
        displayedPokemon = allPokemon;
        updatePokemonList();
        loadingAnimation.style.display = 'none';
    } catch (error) {
        console.error('Error in loadAllPokemon:', error);
        alert('An error occurred while loading Pokemon. Please check the console and refresh the page.');
        const loadingAnimation = document.getElementById('loading-animation');
        loadingAnimation.style.display = 'none';
    }
}

function filterPokemon() {
    const searchInput = document.getElementById('pokemon-search');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm) {
        displayedPokemon = allPokemon.filter(pokemon => 
            pokemon.name.includes(searchTerm) || 
            pokemon.type.name.toLowerCase().includes(searchTerm)
        );
    } else {
        displayedPokemon = allPokemon;
    }
    
    updatePokemonList();
    if (displayedPokemon.length > 0) {
        updateBackgroundColor(displayedPokemon[0].type.color);
    }
}

function updatePokemonList() {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';
    
    displayedPokemon.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'card-image';
        const img = document.createElement('img');
        img.src = pokemon.imageUrl;
        img.alt = pokemon.name;
        imageDiv.appendChild(img);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        const nameP = document.createElement('p');
        nameP.className = 'card-name';
        nameP.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const typeP = document.createElement('p');
        typeP.className = 'card-type';
        typeP.textContent = `${pokemon.type.icon} ${pokemon.type.name}`;
        
        infoDiv.appendChild(nameP);
        infoDiv.appendChild(typeP);
        
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        
        card.addEventListener('click', () => createPopup(pokemon));
        
        pokemonList.appendChild(card);
    });
}

async function createPopup(pokemon) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.backgroundColor = `${pokemon.type.color}CC`; // Add some transparency

    const content = document.createElement('div');
    content.className = 'popup-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    const img = document.createElement('img');
    img.src = pokemon.imageUrl;
    img.alt = pokemon.name;
    img.className = 'popup-image';

    const info = document.createElement('div');
    info.className = 'popup-info';

    // Fetch additional data from PokeAPI
    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
        const speciesData = await speciesResponse.json();

        const flavorText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
        const habitat = speciesData.habitat ? speciesData.habitat.name : 'Unknown';
        const generation = speciesData.generation.name.split('-')[1].toUpperCase();
        const legendaryStatus = speciesData.is_legendary ? 'Legendary' : (speciesData.is_mythical ? 'Mythical' : 'Regular');

        // Fetch evolution chain
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        const evolutionChain = await getEvolutionChain(evolutionData.chain);

        info.innerHTML = `
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <p><strong>Type:</strong> ${pokemon.type.icon} ${pokemon.type.name}</p>
            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
            <p><strong>Habitat:</strong> ${habitat}</p>
            <p><strong>Generation:</strong> ${generation}</p>
            <p><strong>Status:</strong> ${legendaryStatus}</p>
            <p><strong>Pokédex Entry:</strong> "${flavorText.replace(/\f/g, ' ')}"</p>
            <h3>Evolution Chain:</h3>
            <div class="evolution-chain">${evolutionChain}</div>
        `;
    } catch (error) {
        console.error('Error fetching additional data:', error);
        info.innerHTML = `
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <p><strong>Type:</strong> ${pokemon.type.icon} ${pokemon.type.name}</p>
            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
            <p>Additional data unavailable</p>
        `;
    }

    content.appendChild(closeBtn);
    content.appendChild(img);
    content.appendChild(info);
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    
    // Trigger reflow to ensure the transition works
    overlay.offsetWidth;
    
    // Add the active class to start the animation
    overlay.classList.add('active');
}

async function getEvolutionChain(chain) {
    let evolutionHTML = '';
    let currentPokemon = chain;

    while (currentPokemon) {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon.species.name}`);
        const pokemonData = await pokemonResponse.json();
        const imageUrl = pokemonData.sprites.front_default;

        evolutionHTML += `
            <div class="evolution-stage">
                <img src="${imageUrl}" alt="${currentPokemon.species.name}">
                <p>${currentPokemon.species.name.charAt(0).toUpperCase() + currentPokemon.species.name.slice(1)}</p>
            </div>
        `;

        if (currentPokemon.evolves_to.length > 0) {
            evolutionHTML += '<div class="evolution-arrow">→</div>';
            currentPokemon = currentPokemon.evolves_to[0];
        } else {
            break;
        }
    }

    return evolutionHTML;
}

function updateBackgroundColor(color) {
    document.body.style.backgroundColor = color;
    document.body.style.transition = 'background-color 0.5s ease';
}

function setupEventListeners() {
    const searchInput = document.getElementById('pokemon-search');
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it's in a form
            filterPokemon();
        }
    });
}

// Modify the window.onload function
window.onload = () => {
    loadAllPokemon();
    setupEventListeners();
};