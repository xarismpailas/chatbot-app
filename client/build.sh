     #!/bin/bash
     echo "Installing dependencies..."
     npm install
     
     echo "Installing @tailwindcss/forms..."
     npm install @tailwindcss/forms --no-save
     
     echo "Building the application..."
     npm run build
