# 3D Terrain Visualization

## Overview
Renders geographic elevation data as a 3D terrain mesh using Three.js, visualizing topographical landscapes from JSON data.

## Features
- Loads terrain data from JSON 
- Smooths elevation using moving average
- Dynamically scales terrain height
- Interactive camera controls
- Responsive WebGL rendering

## Requirements
- Node.js
- Three.js library
- Web browser with WebGL support

## Setup
1. Install dependencies:
```bash
npm install three
```

2. Prepare elevation data in `./data/data5.json`
3. Open `index.html` in a browser

## Data Format
JSON should contain:
```json
{
  "points": [
    {"elevation": number},
    ...
  ]
}
```

## Key Technologies
- Three.js
- WebGL
- OrbitControls

## Sample Output
![image](https://github.com/user-attachments/assets/c99ea9ce-c3b9-4a6f-9bc8-ef41a71fac33)

