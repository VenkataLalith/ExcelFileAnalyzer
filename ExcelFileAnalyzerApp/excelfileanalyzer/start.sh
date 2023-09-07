#!/bin/sh

# Function to generate the .env file
generate_env_file() {
  echo "REACT_APP_UPLOAD_FILE_DATA_END_POINT=$API_ENDPOINT_1" > /usr/share/nginx/html/.env
}

# Generate the .env file with updated values
generate_env_file


# Start Nginx
nginx -g "daemon off;"
