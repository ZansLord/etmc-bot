# Railway expects the port to be set via the PORT environment variable
ARG PORT=3000
ENV PORT=$PORT

# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Install dependencies required to run Chrome
RUN apt-get update && apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils

# Install Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb

# Expose the specified port (Railway expects the app to listen on this port)
EXPOSE $PORT

# Set environment variable to run in headless mode
ENV DISPLAY=:0

# Command to start your WhatsApp Web bot (modify this based on your project's entry point)
CMD ["npm", "start"]
 
