# AKAPBKS Digital Sakthi

Prompt:

Build a bilingual (Kannada + English) registration and digital ID card portal for the All Karnataka Unorganized Priest and Chef Workers' Union (AKAPBKS).

Design & Theme:

I will give you website Logo add logo matching yellow and orange mix theme for this website  color pallet(no blue).
Rangoli / Hindu mandala background textures on registration and admin pages.
Respectful, formal, community-focused tone throughout.
Bilingual labels everywhere — Kannada primary, English secondary.
A persistent, auto-advancing coverflow carousel of state office-bearers on all pages (cycles through coverflow, fade-zoom, and slide animations without labels).
Public-facing pages:

Home — Union intro, office-bearers carousel, and the registration form.
Registration Form — 
Admin Dashboard / ಆಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್
ಪುರೋಹಿತರ ನೋಂದಣಿ ನಮೂನೆ

Purohit Registration Form

ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ. ಈ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ರಚಿಸಲಾಗುತ್ತದೆ.

Please fill all details correctly. Your digital ID card will be created based on this information.
ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ / Personal Information

ಪೂರ್ಣ ಹೆಸರು / Full Name

ಜನ್ಮ ದಿನಾಂಕ / Date of Birth

ದೂರವಾಣಿ ಸಂಖ್ಯೆ / Phone Number

ರಕ್ತದ ಗುಂಪು / Blood GroupSelectA+A-B+B-AB+AB-O+O-

District/ಜಿಲ್ಲೆSelect

ತಾಲೂಕು / Taluk

ತುರ್ತು ಸಂಪರ್ಕ / Emergency Contact (Optional)

ವಿಳಾಸ / Address

ಹುದ್ದೆ / Designation : Member(Fix not changable or not rewrite)
Collects: full name, date of birth, phone,  blood group, district, taluk, address, designation, Aadhar, temple name & address, emergency contact, photo upload, . Consent checkbox required.
On submit — Generates a digital ID card (front: top middle organization logo , organization name, Highlight color with text "Approved By Karnataka Govt", Rg No: (ಕಾಅಬೆಂ -1/ಡಿಆರ್ ಟಿ/ಟಿಯುಎ/ಸಿಆರ್-04/2026-27 )  Don't  change anything add as it is photo, name, designation, DOB, age, blood group,Phone No,  membership ID(generate ranndom six number starting letter AKAPBKS), ; back: 
ವಿಶೇಷ ಸೂಚನೆ :
1. ಈ ಸಂಸ್ಥೆಗೆ ನೀಡಿರುವಂತಹ ದೇಣಿಗೆ ಹಣವನ್ನು ಸಂಘದ ಉನ್ನತ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಸಂಘದ  ದೈಯುದೇಶಕ್ಕಾಗಿ ಬಳಸಬೇಕೆಂದು ಈ ಮೂಲಕ ದೃಢೀಕರಿಸುತ್ತೇವೆ .
2. ಈ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸಾಮಾನ್ಯ ಸದಸ್ಯತ್ವ ಹೊಂದಿರುವ ನಾನು ಸ್ವಯಂಸೇವಕನಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇನೆ ಎಂದು ದೃಢೀಕರಿಸಿರುತ್ತೇನೆ .

ಪ್ರಧಾನ ಕಚೇರಿ 
ಬೆಂಗಳೂರು-560058 
ಕರ್ನಾಟಕ ರಾಜ್ಯ 
Email akapbks.office@gmail.com
Mobile No :9880421306
Instructions :
1. This card is non-transferable and must be surrendered to administration upon registration. 
2. If found please return to above address.
QR code scanned who is in that member Id that person details will show to admin.) and auto-downloads it as a PDF. Manual download as image/PDF also available.

Super Admin (secure):

Custom login page (username AKAPBKSPRESIDENT, password PRESIDENT@2389) — no Google/OAuth.
Admin Dashboard — Lists all registered members in a searchable table; click a row to view full details in a dialog; download an individual member's full details as a table-format PDF; download all registrations as a CSV spreadsheet with every field; delete a member.
Server-side verification of admin credentials via a backend function; member data protected by row-level security (admin-only read/update/delete).
Technical:

React + Tailwind + shadcn/ui; jsPDF + html2canvas for ID card and member-detail PDFs.
Backend functions: registerMember (creates member + membership ID + validity) and adminMembers (login, list, delete).
Member entity stores all registration fields; sensitive fields (Aadhar, banking) restricted to admins via RLS.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec561021-d1cc-43fa-9f9a-d145d1aa2fd3).

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
