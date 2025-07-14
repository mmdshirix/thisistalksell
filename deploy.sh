#!/bin/bash

echo "🚀 Starting deployment to Liara..."

# Build and deploy
echo "📦 Building and deploying application..."
liara deploy --app thisistalksell --platform docker

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://thisistalksell.liara.run"
