# DSA Atlas

A pattern-wise DSA practice website based on the **DSA_250_Pattern_Wise_Curated.xlsx** workbook. It brings the workbook's problems, patterns, priorities, and study plan together in one place.

## Open the website

Open `index.html` in a modern web browser. The site is static and does not need a server, build step, package installation, or internet connection to run. Google Fonts are not required; the site uses system fonts.

## Features

- Browse all 250 problems in a searchable, paginated table or card layout.
- Filter by pattern, difficulty, priority, and completion status.
- Open each problem's LeetCode practice link.
- Browse all 29 pattern summaries and their priority breakdowns.
- View the workbook's eight-phase study plan.
- Track completed problems. Progress is saved in the current browser using local storage.
- Use `/` to focus the problem search field.

## Folder contents

```text
.
├── index.html
├── styles.css
├── app.js
├── data.js
└── DSA_250_Pattern_Wise_Curated.xlsx
```

- `index.html` — page structure and navigation.
- `styles.css` — responsive layout and visual styles.
- `app.js` — search, filters, views, and progress tracking.
- `data.js` — workbook data used by the site.
- `DSA_250_Pattern_Wise_Curated.xlsx` — original spreadsheet.

## Progress and privacy

Completion status is stored in the browser on the device where the site is opened. It is not written back to the spreadsheet and will not automatically sync between browsers or devices. Clearing that browser's site data removes the saved progress.

## Workbook note

The study-plan topic names and pattern-number ranges for Phases 3 and 4 do not align in the source workbook. The website preserves the workbook's plan and displays a note with the correct pattern numbers alongside it.
