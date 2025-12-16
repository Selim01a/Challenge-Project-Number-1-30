# 📊 Shop Accounting App

A comprehensive, browser-based dashboard for managing daily shop income and expenses. This application allows users to track financial records, visualize spending habits, and analyze data through time-based filtering.

## 🚀 Live Demo
**[View Live App Here](https://Selim01a.github.io/Challenge-Project-Number-1-30/)**

## 🛠️ Tech Stack
* **Structure:** HTML5
* **Styling:** CSS3 (Vanilla, Responsive, CSS Variables)
* **Logic:** JavaScript (ES6+, DOM Manipulation)
* **Persistence:** LocalStorage API
* **Visualization:** Chart.js
* **Icons:** FontAwesome
* **Fonts:** Google Fonts (Poppins)

## ✨ Key Features

### 1. Transaction Management (CRUD)
* **Create:** Add new income or expense records with categories (Food, Rent, Salary, etc.).
* **Read:** View transactions in a summary list or a detailed history table.
* **Update:** Edit existing transactions with a pre-filled form.
* **Delete:** Remove transactions (with a "soft delete" animation and confirmation).

### 2. Analytics & Visualization
* **Real-time Dashboard:** Automatically calculates Total Balance, Total Income, and Total Expense.
* **Doughnut Chart:** Visualizes expense breakdown by category using Chart.js.
* **Currency Formatting:** Professional number formatting (e.g., `$1,200.00`).

### 3. Advanced Filtering & Search
* **Search Bar:** Filter history by customer name, description, or category.
* **Date Range Picker:** Custom filter to view transactions between specific start and end dates.

### 4. User Experience (UX)
* **🌙 Dark Mode:** Fully functional theme toggle using CSS variables.
* **📱 Responsive Design:** Adapts layout for Desktops, Tablets, and Mobile phones.
* **Animations:** Smooth entry animations for lists and modals.

## 📂 Project Structure

```bash
├── index.html      # The skeleton and markup
├── style.css       # All styling, animations, and responsive media queries
├── script.js       # The brain: Logic, Event Listeners, and LocalStorage
└── README.md       # Documentation