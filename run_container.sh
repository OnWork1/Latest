#!/bin/bash

# Build the Docker image
 sudo docker build -t getting-started .

# Run the Docker container
 sudo docker run -dp 5000:5000 getting-started

# Check if xdg-open is available (Linux)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5000
# Check if open is available (macOS)
elif command -v open > /dev/null; then
    open http://localhost:5000
else
    echo "Could not open the browser. Please navigate to http://localhost:5000 manually."
fi