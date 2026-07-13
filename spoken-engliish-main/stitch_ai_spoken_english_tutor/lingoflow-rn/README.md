# LingoFlow React Native

This is an Expo React Native port of the exported LingoFlow HTML screens.

## Run

Start the backend API:

```bash
npm.cmd run backend
```

In another terminal, start Expo:

```bash
npm install
npm run start
```

Then open the app with Expo Go, an Android/iOS simulator, or the web target from the Expo dev tools.

The app checks `http://127.0.0.1:4000/api/health` and sends chat messages to `POST /api/chat`.
