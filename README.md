# 🍽️ Build Your Meal – Smart Restaurant WebStore

A modern, interactive restaurant web application where users can **customize their meals** (pizza/burger), select toppings and drinks, and see **real-time price updates**.

Designed with a **Neo-Brutalism UI** and powered by **vanilla JavaScript**, this project demonstrates dynamic frontend development using JSON-based data.

---

## 🚀 Live Demo

👉 Add your deployed link here (GitHub Pages)
Example: https://yourusername.github.io/build-your-meal-webstore

---

## ✨ Key Features

### 🧠 Smart Meal Builder

* Select base item (Pizza / Burger)
* Add/remove toppings dynamically
* Choose drinks
* Real-time price calculation

### 🛒 Cart System

* Add customized meals to cart
* View item breakdown (base + toppings)
* Remove items
* Persistent cart using **LocalStorage**

### 📦 Data-Driven Menu

* All products stored in `menu.json`
* Dynamically loaded using `fetch()`
* Easy to update without changing HTML

### 🔍 Smart Filtering & Search

* Filter by category (Pizza, Burger, Drinks)
* Veg / Non-Veg filtering
* Live search functionality

### 📱 Responsive UI

* Clean and structured layout
* Works on desktop and basic mobile screens

---

## 🎨 UI Design – Neo-Brutalism

This project uses a **Neo-Brutalist design system**, featuring:

* Thick black borders
* Bold flat colors (yellow, pink, green)
* Strong shadows
* Grid-based layout
* Minimalistic yet striking visuals

---

## 🛠️ Tech Stack

* **HTML5** – Structure
* **CSS3** – Styling (Neo-Brutalism)
* **JavaScript (Vanilla)** – Logic & Interactivity
* **JSON** – Data storage
* **LocalStorage** – Cart persistence

---

## 📁 Project Structure

```bash id="proj-struct-001"
restaurant-project/
│
├── index.html          # Home Page
├── menu.html           # Menu (dynamic rendering)
├── builder.html        # Meal Builder (core feature)
├── cart.html           # Cart system
├── about.html          # About page
├── contact.html        # Contact + validation
│
├── css/
│   └── style.css       # Main styling
│
├── js/
│   └── script.js       # Main logic
│
├── data/
│   └── menu.json       # Menu data (dynamic)
│
└── images/             # Assets
```

---

## ⚙️ How It Works

1. Menu data is stored in `menu.json`
2. JavaScript fetches and renders items dynamically
3. User selections are handled using DOM manipulation
4. Price is calculated in real-time using JS functions
5. Cart data is stored in LocalStorage

---

## ▶️ How to Run Locally

1. Clone the repository

```bash id="clone-cmd"
git clone https://github.com/samruddhabelsare/build-your-meal-webstore.git
```

2. Open in **VS Code**

3. Run using **Live Server**

* Right-click `index.html` → *Open with Live Server*

---

## 🧪 Concepts Demonstrated

* DOM Manipulation
* Event Handling
* JSON & Fetch API
* Dynamic UI Rendering
* LocalStorage Usage
* Form Validation
* Modular JavaScript

---

## 📸 Screenshots

👉 Add screenshots here for better presentation
Example:

## Home Page

<img width="2505" height="1325" alt="Screenshot 2026-04-03 183034" src="https://github.com/user-attachments/assets/128a6edf-494d-4203-9374-62e200122112" />

 ## Menu Page
<img width="2513" height="1327" alt="Screenshot 2026-04-03 183143" src="https://github.com/user-attachments/assets/9ab32987-1f44-4ed3-8c32-a1b26a97a949" />

<img width="2501" height="1328" alt="Screenshot 2026-04-03 183156" src="https://github.com/user-attachments/assets/edc919d7-5806-4d96-b560-2c5480b71eba" />

  
 ## Meal Builder
 
<img width="2501" height="1329" alt="Screenshot 2026-04-03 183245" src="https://github.com/user-attachments/assets/624f5ed2-4599-4755-93f3-5abab7928eed" />

<img width="2503" height="1320" alt="Screenshot 2026-04-03 183258" src="https://github.com/user-attachments/assets/f466be9b-8c29-4bfe-b9c1-4ee40829fa1d" />

  
## Cart
  
<img width="2499" height="1329" alt="Screenshot 2026-04-03 183343" src="https://github.com/user-attachments/assets/541d2327-e4cd-444d-9a0f-697b4428e99e" />


---

## 👨‍💻 Author

**Your Name**

* GitHub: [https://github.com/Samruddhabelsare](https://github.com/samruddhabelsare)

---

## 📌 Future Improvements

* User authentication (login/signup)
* Backend integration (Node.js / database)
* Payment gateway simulation
* Advanced animations

---

## ⭐ Acknowledgment

This project was developed as part of an academic practical to demonstrate modern frontend web development concepts.

---

## 💬 Feedback

If you have suggestions or improvements, feel free to open an issue or contribute!
