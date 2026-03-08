# LinkoApp

Simple React-based frontend for a tutoring/meeting application.

## Setup

1. **Install dependencies**
   ```bash
   cd c:\NodeApp
   npm install
   ```

3. **Run the frontend development server**
   ```bash
   npm start
   ```

   Parcel will start a local web server (default port 3000) and open the app.

4. **Start the AI backend**
   ```bash
   npm run server
   ```

   This launches an Express server on port 5000; it proxies requests to a local Ollama instance.

5. **Build for production**
   ```bash
   npm run build
   ```

## Notes

- This repository uses [Parcel](https://parceljs.org/) for zero-configuration bundling.
- The main application file is `LinkoApp.jsx` which exports the root component and handles its own mounting.
- A backend server listening on `http://localhost:5000/ask` is expected for the AI question feature; it is not included here.

Feel free to add a Node/Express backend or adapt the tooling as needed.