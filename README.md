# Project Usaari Evening School PWA
### Initiators of Change (IOC) — Student Attendance & Registration Platform

A secure, offline-first Progressive Web Application (PWA) built for **Project Usaari Evening School** (an initiative by NGO **Initiators of Change**) to streamline student registration, roll call tracking, printable admission dossiers, and student ID cards, backed by **Google Sheets** and secured by **Firebase Authentication & RBAC** using a 100% free-tier architecture.

---

## ✨ Features

- **Pre-Login Welcome Gate & RBAC**: One-tap demo role switching (`Super Admin`, `Teacher / Educator`, `Observer`) + single-click Google Authentication.
- **Offline-First & Sub-5ms Search**: Powered by browser `IndexedDB` (`idb`) and in-memory multi-token indexing for instant search across student name, roll number, guardian, phone, and grade without network lag.
- **Dynamic Age Engine**: Derived in real-time from `Date of Birth` with strict boundary validation ($6 \le \text{age} \le 20$).
- **Unique Student ID Generator**: Automated sequential numbering in `UES-YYYY-XXXX` format.
- **Binary Attendance Marking**: Streamlined `Present` / `Absent` roll call with bulk *"Mark All Present"* action and bottom sheet drawer for custom remarks and tagged reasons (Sick, Traffic, Weather, Family).
- **Printable Documents**:
  - Official **A4 Student Admission Dossier** with photo box, guardian declaration, and school sign-offs.
  - Pocket **CR80 Student ID Card** with QR code and emergency contact.
  - Client-side 1-click PDF download via `jspdf` and `html2canvas`.
- **Google Sheets Master Mirror**: Copy-paste Google Apps Script (`google-apps-script/Code.gs`) that automatically synchronizes 4 formatted tabs: `Students`, `Attendance_Logs`, `Monthly_Register`, and `Config_Roles`.
- **Luxury Glassmorphism UI**: Translucent porcelain light mode ☀️ and obsidian velvet dark mode 🌙 with 3D specular edge highlights.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack (100% Free Tier)

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **PWA & Offline**: `vite-plugin-pwa`, `workbox-window`, `idb` (IndexedDB)
- **Authentication & Database**: Firebase Auth, Cloud Firestore (Spark Free Tier)
- **Cloud Master Mirror**: Google Sheets + Google Apps Script Web App
- **PDF Generation**: `jspdf`, `html2canvas`

---

## 📄 License

Proprietary to **Initiators of Change (IOC)**. Built for child welfare and free evening education.
