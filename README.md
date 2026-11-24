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
3. Create a Firestore database. In Authentication → Sign-in method, enable **Anonymous**.
4. Deploy the included Firestore rules with `firebase deploy --only firestore:rules` (install the CLI with `npm i -g firebase-tools` and run `firebase login` first).
5. Set your Firebase project for Hosting: `firebase use --add`, choose the project, then run the deploy command below.

## Replace the content

Edit only `src/content.js` for the anniversary copy, name, dates, letter photo, memories, trips, gallery media, and songs. Every photo/video/song has a stable `id` or media id; keep those ids unique so reactions stay attached to the right item.

For personal media without upgrading Firebase, keep files locally under `public/media/` and use paths like `/media/memories/memory-01.jpg` in `src/content.js`. Those personal folders are ignored by Git, so they stay out of GitHub while still being included in your local Firebase Hosting build. Keep a backup of the media files because another computer will not have them automatically.

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
- Replace all memory/trip/song placeholder images and the sample video with local paths under `public/media/`.
- Keep personal photos, videos, and MP3s out of the GitHub repository; `.gitignore` already excludes them.
- Keep every media id stable and unique.
- Confirm Anonymous Auth is enabled and the Firestore rules are deployed.
- Test first visit, refresh-after-opening, and the envelope button.
- Test Swiper with touch, trip modal close/back/next, video controls, and each reaction/comment on iPhone Safari.
- Test audio after the first tap, lock-screen/background behavior expectations, safe-area spacing, and reduced-motion mode.
