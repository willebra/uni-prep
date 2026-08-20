# Exam Prep Pal
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fwillebra%2Funi-prep.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fwillebra%2Funi-prep?ref=badge_shield)


I want to build a public web app for reviewing material published 2 days before a university entrance exam and practicing for the exam. No login or access control — anyone with the link can use it.

Core features:

Upload or paste the exam prep material (PDF/text) released 2 days before the exam.

Auto-generate a structured study view: summary, key concepts, and section-by-section notes.

Training mode with auto-generated practice questions (multiple choice + short answer), instant feedback, and explanations tied back to the source material.

Progress tracking in the browser (localStorage is fine — no accounts).

Clean, mobile-friendly reading and quiz UI.

Stack: please use Lovable Cloud for storage and Lovable AI Gateway for question generation and explanations. Start with a minimal landing page + "Upload material" flow, and we'll iterate from there.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://uni-prep.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/55721993-73d7-4e8f-b644-c64400003038).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fwillebra%2Funi-prep.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fwillebra%2Funi-prep?ref=badge_large)