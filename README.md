# One Year of Us

A mobile-first React/Vite anniversary microsite with a letter reveal, memories carousel, GSAP airplane scroll scene, trip galleries, Firestore reactions, and a tiny music player.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site works without Firebase credentials; reactions simply stay local to the session until Firebase is configured.

## Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/), add a Web app, and copy its config values into `.env.local` using the keys in `.env.example`.
2. In Authentication → Sign-in method, enable **Anonymous**.
3. Create a Firestore database. Deploy the included rules with `firebase deploy --only firestore:rules` (install the CLI with `npm i -g firebase-tools` and run `firebase login` first).
4. Set your Firebase project for Hosting: `firebase use --add`, choose the project, then run the deploy command below.

## Replace the content

Edit only `src/content.js` for the anniversary copy, name, dates, letter photo, memories, trips, gallery media, and songs. Every photo/video/song has a stable `id` or media id; keep those ids unique so reactions stay attached to the right item.

For your own media, add files under `public/media/` and use paths like `/media/our-song.mp3`, `/media/trip-video.mp4`, and `/media/photo.jpg`. Replace every placeholder URL. Videos use controls, `playsInline`, metadata preload, and a poster.

## Compress media

Images: export JPEG/WebP at roughly 1600px on the long edge and 75–85% quality. A quick ImageMagick example is `magick input.jpg -resize '1600x1600>' -strip -quality 82 output.webp`.

Videos: use H.264 MP4, 720p or 1080p, and keep each clip short. Example: `ffmpeg -i input.mov -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset medium -c:a aac -b:a 128k output.mp4`.

## Build and deploy

```bash
npm run build
firebase deploy
```

Firebase will print the Hosting URL. Because `noindex` is set, it is intended to stay private-by-link.

## Final replacement checklist

- Replace `hisName`, both date strings, the letter text, and letter photo.
- Replace all memory/trip/song placeholder images and the sample video.
- Add your MP3s under `public/media/` and update each song `src`.
- Keep every media id stable and unique.
- Confirm Anonymous Auth is enabled and the Firestore rules are deployed.
- Test first visit, refresh-after-opening, and the envelope button.
- Test Swiper with touch, trip modal close/back/next, video controls, and each reaction/comment on iPhone Safari.
- Test audio after the first tap, lock-screen/background behavior expectations, safe-area spacing, and reduced-motion mode.
