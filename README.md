# A little world for Naina

A mobile-first interactive birthday gift from Sujal.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in a narrow browser window.

## Personalize

Edit one file: `config/loveStory.ts`

- Names, occasion, and all copy
- Memory photos, captions, and dates
- Love letter, wishes, and the final surprise

Put photos in `public/images/` (`memory1.jpg` … `puzzle.jpg`, `reveal.jpg`, `secret.jpg`).

## Upload to Hostinger (static)

This is a static site. It does **not** use a Node.js app slot.

The ready-to-host files are in the `out` folder on GitHub.

- If Hostinger asks for a directory, choose `out`
- Or upload **everything inside `out`** into `public_html`

`index.html` must be at the website root. Do not use a Node.js app.

