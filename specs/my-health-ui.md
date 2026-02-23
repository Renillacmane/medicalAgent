# My Health page UI

## Purpose

The My Health page is the user’s consolidated view of their health data: vitals history, prescriptions, and exams (lab results). The user can see all of this in one place with tabs, and for each document (prescription or exam) they can preview the PDF in-page or download it.

## Scope

- **Route**: `/my-health` (or as defined in nav-config).
- **Layout**: Page title “My Health”, short description; side panel (UserPanel: profile summary and vitals overview); main content with tabbed area (Vitals | Prescription | Exams).
- **Data**: Profile and vitals from `GET /patients/profile` and `GET /patients/vitals`; prescriptions from `GET /patients/documents?documentType=prescription`; exams from `GET /patients/exams`. Loading and error states; empty state message when a tab has no data.
- **Vitals tab**: Table of vitals (date, heart rate, blood pressure, weight, BMI, sleep, SpO₂). Optional: stress, blood glucose if shown elsewhere in the app.
- **Prescription tab**: Table rows per document (e.g. date, doctor, medications summary). Each row has a **PDF column** with two actions:
  - **Preview**: Open the PDF in-page (e.g. in a modal, drawer, or inline viewer) so the user can read it without leaving the page. Shown with a **preview icon** (e.g. eye or document-magnify).
  - **Download**: Download the PDF file. Shown with the **existing download icon** (or download symbol). Both icons sit side by side in the same cell.
- **Exams tab**: Table rows per exam (name, date). Same PDF column behavior: **preview icon** (open PDF in-page) and **download icon** (download file), side by side.
- **PDF preview**: When the user taps the preview icon, the PDF is displayed in-page (e.g. in an overlay or panel), not only via a new tab or download. Implementation can use an iframe, embed, or a PDF viewer component; the same document URL used for download can be used for preview when served with a viewable disposition or in an iframe.

## Acceptance criteria

- When the user opens `/my-health`, they see the title, description, UserPanel, and tabs (Vitals, Prescription, Exams). Data loads; loading indicator is shown until ready.
- When a tab has no data, an empty-state message is shown (e.g. “No data in this section yet…”).
- Vitals tab shows a table with the expected columns and one row per vital.
- Prescription tab shows a table with date, doctor, medications, and a PDF column. In the PDF column, each row with an attachment shows **two icons side by side**: one for **preview** (view PDF in-page) and one for **download** (download the file). Clicking preview opens the PDF in-page (modal/drawer/inline); clicking download triggers download.
- Exams tab shows a table with name, date, and PDF column. Same behavior: **preview icon** and **download icon** side by side; preview opens PDF in-page, download downloads the file.
- PDF preview uses the same document URL as download; the only difference is the interaction (open in viewer vs. download). No requirement to change backend response headers for preview.
- When the user is not authenticated, they are redirected to login with return URL to `/my-health`.

## Out of scope

- Editing or deleting documents from this page (future spec).
- Backend document APIs (see add-vitals-lab-results-api and document endpoints).
