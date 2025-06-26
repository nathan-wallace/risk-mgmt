# Risk Manager

Risk Manager is a lightweight web application for maintaining project risk registers. It stores data directly in your browser using local storage, so no database setup is required.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

For a production build run:
```bash
npm run build
npm start
```

## Usage

- Open the **Projects** page to create a new project or manage existing ones.
- Each project can store details such as manager, sponsor, dates and a risk management plan under **Settings**.
- Add risks from the project screen using the **Add** menu and fill in probability, impact, owner and mitigation information.
- Click cells in the risk matrix to filter the register by probability and impact.
- Review the aggregated risk score and the history timeline to monitor changes over the life of the project.
- Set or update a risk's **Status** when managing a risk. You can include an optional note and every change is saved to the risk's history.
- Use the **Risk History Timeline** to visualise how many risks of each status are active between the project start and end dates.
- Export the register to Excel or CSV, or import risks from these formats.

All information is saved locally so it remains available the next time you open the app in the same browser.

## Features

- Manage multiple projects, each with its own risk register and categories.
- Collapsible project details panel with quick access to edit settings.
- Aggregated risk indicator with colour coding for quick assessment.
- Interactive 5×5 matrix showing the count of risks for each probability and impact level.
- Timeline chart displaying how many risks of each status are active over time.
- Import and export data as CSV or XLSX files.

Example API routes are provided in `pages/api` but the default UI operates entirely from local storage.
