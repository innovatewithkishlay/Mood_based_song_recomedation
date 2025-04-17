# Mood-Based Music Recommendation System

This project is a web-based application that recommends songs based on the user's mood. It uses the YouTube API to fetch songs dynamically and provides an interactive interface for users to explore music.

## Features

- **Mood-Based Song Recommendations**: Select a mood (e.g., Romantic, Party, Chill) to get a curated list of songs.
- **Search Functionality**: Search for songs, artists, or moods directly.
- **Dynamic Latest Hits**: Displays the latest trending songs fetched from YouTube.
- **Interactive Music Player**: Play, pause, and navigate through songs with a built-in player.
- **Responsive Design**: Works seamlessly across devices.

## Project Structure

- **ai_music.html**: The main HTML file for the application.
- **script.js**: Contains the JavaScript logic for fetching songs, handling user interactions, and managing the YouTube player.
- **styles.css**: Defines the styling and animations for the application.

## Technologies Used

- **HTML5**: For structuring the web page.
- **CSS3**: For styling and animations.
- **JavaScript**: For dynamic functionality and API integration.
- **YouTube Data API**: To fetch song data dynamically.

## Setup Instructions

1. Clone the repository or download the project files.
2. Open the `ai_music.html` file in a web browser.
3. Ensure you have an active internet connection to load external resources (e.g., YouTube API, FontAwesome).

## How to Use

1. Open the application in your browser.
2. Use the search bar to find songs or select a mood from the mood cards.
3. Click on a song to play it in the music player.
4. Use the player controls to play, pause, or navigate between songs.

## API Key Configuration

The project uses the YouTube Data API. Replace the placeholder API key in `script.js` with your own API key:

```javascript
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";
```
