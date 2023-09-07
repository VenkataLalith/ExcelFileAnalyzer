
# Use the official Node.js image as the base image.

FROM node:14 as build-stage

 

# Set the working directory inside the container.

WORKDIR /app

 

# Copy the package.json and package-lock.json files into the container.

COPY package*.json ./

 

# Install Node.js dependencies.

RUN npm install

 

# Copy the rest of the application source code into the container.

COPY . .

 

# Build the React app for production.

RUN npm run build

 

# Use a smaller and efficient Nginx base image to serve the application.

FROM nginx:alpine as production-stage

 

# Copy the built React app from the previous build-stage.

COPY --from=build-stage /app/build /usr/share/nginx/html

 

# Expose the port that Nginx will use to serve the application.

EXPOSE 80

 

# Start Nginx when the container starts.

CMD ["nginx", "-g", "daemon off;"]
