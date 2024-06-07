# Use the official Ubuntu base image
FROM ubuntu:latest

# Install required packages
RUN apt-get update && \
    apt-get install -y software-properties-common curl && \
    apt-get clean

# Add TeX Live repository
RUN apt-get install -y perl-openssl-defaults && \
    apt-get install -y texlive-base texlive-latex-base texlive-fonts-recommended texlive-fonts-extra

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set the working directory
WORKDIR /app

# Copy the server code and package.json
COPY package*.json ./
COPY pdf.js ./

# Install Node.js dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3001

# Start the server
CMD ["node", "pdf.js"]