# Typing Speed Test

This is a web-based typing speed test application built with Next.js and Tailwind CSS. It allows users to test their typing speed and accuracy, and race against their previous attempts.

## Features

*   **Typing Test:** Test your typing speed and accuracy with a variety of texts.
*   **Results Screen:** View your words per minute (WPM), accuracy, and other stats after each test.
*   **Ghost Race:** Race against a "ghost" of your previous best performance.
<!-- *   **Theme Selector:** Choose between different themes for the application. -->
*   **Mobile Warning:** A friendly warning for users on mobile devices about the app being optimized for desktop.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [daisyUI](https://daisyui.com/)
*   **Animations:** [Framer Motion](https.framer.com/motion/)
*   **Font:** [Geist](https://vercel.com/font)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/saurabhk79/TypeRush.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Running the Application

```sh
npm run dev
```

This will start the development server at `http://localhost:3000`.

### Building for Production

```sh
npm run build
```

This will create a production-ready build in the `.next` directory.

### Starting the Production Server

```sh
npm run start
```

This will start the production server.

## API Endpoints

The application uses a few API endpoints to fetch data:

*   `/api/text`: Fetches the text for the typing test.
*   `/api/score`: Saves the user's score.
*   `/api/ghost`: Handles the logic for the ghost race feature.

## Project Structure

```
/
├── app/                # Next.js App Router
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
├── public/             # Static assets
└── styles/             # Global styles
```

