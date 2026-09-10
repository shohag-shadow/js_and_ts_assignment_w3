# Eagle Creek Golf Club Stay and Play

A responsive golf-course booking landing page with a Node.js/Express backend that serves property listings and powers the stay & play carousel.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`)
- No other global dependencies — everything is installed via `npm install`

## Setup

```bash
# 1. Install dependencies
npm install
```

```bash
# 2. (Optional) Configure the Google Maps API key
cp .env.example .env
# then edit .env and set:
# GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here" (Should be inside quatations)
```

The app runs without a Maps key — only the map on the stay section will not work.

## Run the project

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

For development with auto-restart on file changes:

```bash
npm run dev
```

## What the server does

The Express server (in `server.js`) runs on port **3000** and:

- Serves the static site (`index.html`, `assets/`, CSS, JS) from the project root
- Loads property data from `data/most_popular.json`, `data/lowest_price.json`, and `data/highest_price.json` into memory at startup
- Serves gallery images from the `images/` directory

### API endpoints

| Endpoint | Description |
| -------- | ----------- |
| `GET /get-property?most-popular=true&limit=4` | Property listings, sorted by popularity, lowest price, or highest price (`limit` optional, defaults to 10) |
| `GET /images` | List of gallery image URLs |
| `GET /config/maps` | Google Maps API key (from `.env`) |

## Project structure

```
.
├── index.html                  # Main page
├── server.js                   # Express server
├── queryController.js          # Stay & play cards: filters, carousel, swipe, map
├── gallaryController.js        # Image gallery + lightbox
├── popupController.js          # Popup/modal handling
├── guestSelectorController.js  # Guest selector widget
├── sidePaymentCardController.js# Booking payment card logic
├── readMoreController.js       # Read-more / course info toggles
├── data/                       # Property listing JSON files
├── images/                     # Gallery images
├── assets/                     # Icons and static images
└── styles_*.css                # Per-section stylesheets
```
