// DOM Elements
const show = document.getElementById('show');
const searchBtn = document.getElementById('search');
const geoSearchBtn = document.getElementById('geo-search');
const cityInput = document.getElementById('city');
const clearSearchBtn = document.getElementById('clear-search');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const themeToggle = document.getElementById('themeToggle');
const cityChips = document.querySelectorAll('.city-chip');

// API Configuration
const API_KEY = '2f745fa85d563da5adb87b6cd4b81caf';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// State Management
let currentWeather = null;
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Initialize App
const initApp = () => {
    // Event Listeners
    searchBtn.addEventListener('click', getWeatherByCity);
    geoSearchBtn.addEventListener('click', getWeatherByLocation);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeatherByCity();
    });
    clearSearchBtn.addEventListener('click', () => {
        cityInput.value = '';
        cityInput.focus();
    });
    themeToggle.addEventListener('click', toggleTheme);
    
    // City Chips
    cityChips.forEach(chip => {
        chip.addEventListener('click', () => {
            cityInput.value = chip.dataset.city;
            getWeatherByCity();
        });
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    // Initialize particles
    initParticles();
    
    // Show welcome message
    showWelcomeMessage();
    
    // Auto-focus input
    setTimeout(() => cityInput.focus(), 500);
};

// Particle Background
const initParticles = () => {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 100 + 50;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.2 + 0.1;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.opacity = opacity;
        
        particlesContainer.appendChild(particle);
    }
};

// Show Notification
const showNotification = (message, type = 'info') => {
    notificationText.textContent = message;
    
    // Set type-based styling
    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    notification.querySelector('i').className = `fas ${icons[type] || icons.info}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
};

// Theme Toggle
const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    const isLightTheme = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    showNotification(`Switched to ${isLightTheme ? 'light' : 'dark'} theme`);
};

// Welcome Message
const showWelcomeMessage = () => {
    show.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-cloud-sun"></i>
            </div>
            <h2>Welcome to WeatherCast</h2>
            <p style="font-size: 1.8rem; color: var(--text-secondary); margin-bottom: 3rem;">
                Get real-time weather updates for any location worldwide
            </p>
            <div class="features-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 600px; margin: 0 auto;">
                <div class="feature">
                    <i class="fas fa-search" style="color: var(--primary); font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem;">Search Any City</h3>
                    <p style="font-size: 1.4rem; color: var(--text-muted);">Get weather for any city worldwide</p>
                </div>
                <div class="feature">
                    <i class="fas fa-location-dot" style="color: var(--secondary); font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem;">Current Location</h3>
                    <p style="font-size: 1.4rem; color: var(--text-muted);">Instantly get your local weather</p>
                </div>
                <div class="feature">
                    <i class="fas fa-chart-line" style="color: var(--accent-teal); font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem;">Detailed Info</h3>
                    <p style="font-size: 1.4rem; color: var(--text-muted);">Comprehensive weather metrics</p>
                </div>
            </div>
        </div>
    `;
};

// Loading State
const showLoading = () => {
    show.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Fetching weather data...</p>
        </div>
    `;
};

// Error State
const showError = (message) => {
    show.innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 class="error-title">Oops! Something went wrong</h2>
            <p class="error-message">${message}</p>
            <button class="btn-primary" onclick="showWelcomeMessage()">
                <i class="fas fa-home"></i>
                <span>Back to Home</span>
            </button>
        </div>
    `;
};

// Get Weather by City
const getWeatherByCity = async () => {
    const city = cityInput.value.trim();
    
    if (!city) {
        showNotification('Please enter a city name', 'warning');
        cityInput.focus();
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        currentWeather = data;
        
        // Add to recent searches
        addToRecentSearches(city, data.sys.country);
        
        // Display weather
        displayWeather(data);
        
        // Update background
        updateWeatherBackground(data.weather[0].main);
        
        // Show success notification
        showNotification(`Weather for ${data.name} loaded successfully!`, 'success');
        
        // Clear input
        cityInput.value = '';
        
    } catch (error) {
        console.error('Error:', error);
        showError('City not found. Please check the city name and try again.');
        showNotification('Failed to fetch weather data', 'error');
    }
};

// Get Weather by Location
const getWeatherByLocation = () => {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showLoading();
    showNotification('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                
                const data = await response.json();
                currentWeather = data;
                
                // Display weather
                displayWeather(data);
                
                // Update background
                updateWeatherBackground(data.weather[0].main);
                
                // Show success notification
                showNotification(`Weather for ${data.name} loaded successfully!`, 'success');
                
            } catch (error) {
                console.error('Error:', error);
                showError('Unable to fetch weather for your location');
                showNotification('Failed to fetch weather data', 'error');
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            let message = 'Unable to get your location';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location access denied. Please enable location services.';
            } else if (error.code === error.TIMEOUT) {
                message = 'Location request timed out';
            }
            
            showError(message);
            showNotification('Location access failed', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};

// Display Weather Data
const displayWeather = (data) => {
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    const sys = data.sys;
    
    // Get weather icon and class
    const { iconClass, weatherClass } = getWeatherIcon(weather.main);
    
    // Format date
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time
    const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    show.innerHTML = `
        <div class="weather-container">
            <!-- Location Section -->
            <div class="location-section">
                <h2>
                    ${data.name}
                    <span class="country">${sys.country}</span>
                </h2>
                <p class="location-date">
                    <i class="far fa-calendar-alt"></i> ${date} • <i class="far fa-clock"></i> ${time}
                </p>
            </div>
            
            <!-- Main Weather Section -->
            <div class="weather-main">
                <div class="temp-section">
                    <div class="current-temp">
                        ${Math.round(main.temp)}<span class="temp-unit">°C</span>
                    </div>
                    <p class="feels-like">
                        Feels like ${Math.round(main.feels_like)}°C
                    </p>
                </div>
                
                <div class="weather-icon-section">
                    <div class="weather-icon-large ${weatherClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <h3 class="weather-condition">${weather.main}</h3>
                    <p class="weather-description">${weather.description}</p>
                </div>
            </div>
            
            <!-- Weather Details Grid -->
            <div class="weather-details-grid">
                <div class="detail-card" title="Humidity Level">
                    <div class="detail-icon">
                        <i class="fas fa-tint"></i>
                    </div>
                    <h4>Humidity</h4>
                    <div class="value">${main.humidity}<span class="unit">%</span></div>
                </div>
                
                <div class="detail-card" title="Wind Speed">
                    <div class="detail-icon">
                        <i class="fas fa-wind"></i>
                    </div>
                    <h4>Wind Speed</h4>
                    <div class="value">${wind.speed}<span class="unit">m/s</span></div>
                </div>
                
                <div class="detail-card" title="Atmospheric Pressure">
                    <div class="detail-icon">
                        <i class="fas fa-compress-alt"></i>
                    </div>
                    <h4>Pressure</h4>
                    <div class="value">${main.pressure}<span class="unit">hPa</span></div>
                </div>
                
                <div class="detail-card" title="Visibility Distance">
                    <div class="detail-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <h4>Visibility</h4>
                    <div class="value">${(data.visibility / 1000).toFixed(1)}<span class="unit">km</span></div>
                </div>
                
                <div class="detail-card" title="Minimum Temperature">
                    <div class="detail-icon">
                        <i class="fas fa-temperature-low"></i>
                    </div>
                    <h4>Min Temp</h4>
                    <div class="value">${Math.round(main.temp_min)}<span class="unit">°C</span></div>
                </div>
                
                <div class="detail-card" title="Maximum Temperature">
                    <div class="detail-icon">
                        <i class="fas fa-temperature-high"></i>
                    </div>
                    <h4>Max Temp</h4>
                    <div class="value">${Math.round(main.temp_max)}<span class="unit">°C</span></div>
                </div>
            </div>
            
            <!-- Additional Info -->
            <div style="margin-top: 3rem; padding: 2rem; background: rgba(255, 255, 255, 0.05); border-radius: 1.6rem; border: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="font-size: 1.6rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
                            <i class="fas fa-info-circle"></i> Additional Information
                        </h4>
                        <p style="font-size: 1.4rem; color: var(--text-muted);">
                            Sunrise: ${formatTime(sys.sunrise)} • Sunset: ${formatTime(sys.sunset)}
                        </p>
                    </div>
                    <button class="btn-secondary" onclick="refreshWeather()">
                        <i class="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Helper Functions
const getWeatherIcon = (weatherMain) => {
    const icons = {
        'Clear': { icon: 'fas fa-sun', class: 'sunny' },
        'Clouds': { icon: 'fas fa-cloud', class: 'cloudy' },
        'Rain': { icon: 'fas fa-cloud-rain', class: 'rainy' },
        'Drizzle': { icon: 'fas fa-cloud-sun-rain', class: 'rainy' },
        'Thunderstorm': { icon: 'fas fa-bolt', class: 'stormy' },
        'Snow': { icon: 'fas fa-snowflake', class: 'snowy' },
        'Mist': { icon: 'fas fa-smog', class: 'cloudy' },
        'Fog': { icon: 'fas fa-smog', class: 'cloudy' },
        'Haze': { icon: 'fas fa-smog', class: 'cloudy' }
    };
    
    return icons[weatherMain] || { icon: 'fas fa-cloud', class: 'cloudy' };
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const addToRecentSearches = (city, country) => {
    const search = {
        city,
        country,
        timestamp: Date.now()
    };
    
    // Remove if already exists
    recentSearches = recentSearches.filter(s => 
        s.city.toLowerCase() !== city.toLowerCase()
    );
    
    // Add to beginning
    recentSearches.unshift(search);
    
    // Keep only last 5
    recentSearches = recentSearches.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
};

const updateWeatherBackground = (weatherCondition) => {
    // Remove existing weather classes
    const weatherClasses = ['clear-bg', 'clouds-bg', 'rain-bg', 'snow-bg', 'thunderstorm-bg', 'mist-bg'];
    document.body.classList.remove(...weatherClasses);
    
    // Add new weather class
    const bgMap = {
        'Clear': 'clear-bg',
        'Clouds': 'clouds-bg',
        'Rain': 'rain-bg',
        'Drizzle': 'rain-bg',
        'Snow': 'snow-bg',
        'Thunderstorm': 'thunderstorm-bg',
        'Mist': 'mist-bg',
        'Fog': 'mist-bg',
        'Haze': 'mist-bg'
    };
    
    const bgClass = bgMap[weatherCondition] || 'clear-bg';
    document.body.classList.add(bgClass);
};

const refreshWeather = () => {
    if (currentWeather) {
        const city = currentWeather.name;
        cityInput.value = city;
        getWeatherByCity();
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);