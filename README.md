FreshLoop — Smart Food Waste Reduction Assistant
Use it before you lose it.

FreshLoop is a lightweight web application that helps users manage food at home, track expiry dates and quantities, and find practical ways to reduce food waste.

The Problem
Food is often wasted because people forget what they have or do not notice that items are approaching their expiry dates. FreshLoop helps users keep track of their food and decide what needs attention first.

The Solution
Users can add food items to their inventory, including the food name, category, quantity, unit, and expiry date. FreshLoop then identifies items that need attention, provides useful suggestions, and helps users track consumed and wasted food.

The application starts with an empty inventory and does not include demo data.

Main Features
1. Food Inventory
Add food items with a name, category, quantity, unit, and expiry date.
Choose from seven food categories.
Automatically suggest a category based on the food name.
Use quick expiry-date shortcuts.
Search and filter inventory items.
2. Smart Rescue Score
FreshLoop calculates a score based on the remaining days until expiry.

Expiry timing	Score	Status
Expires today	90	Use today
Within 1–2 days	75	Use very soon
Within 3–5 days	50	Plan it
More than 5 days	20	Fresh
Expired items are handled separately with a Safety Review status instead of being recommended for consumption.

3. Quantity & Partial Consumption
Users can track the quantity of each food item and its measurement unit. The Use Some action allows them to record a partially consumed amount, and FreshLoop automatically updates the remaining quantity.

An item stays in the inventory until its remaining quantity reaches zero.

4. Smart Expiry Reminders
An in-app reminder section highlights expired items and food approaching its expiry date. Users can select View item to find the corresponding item in their inventory.

5. Food Suggestions
FreshLoop provides food-use suggestions based on recognized food-name keywords and categories. It also displays combination ideas when suitable ingredients are available.

These suggestions use predefined rules rather than a trained AI model.

6. Track Used and Wasted Food
Users can mark an item as fully used or wasted. The dashboard automatically updates:

Items tracked.
Items needing attention.
Food rescued from waste.
Waste-free rate.
7. Copy Rescue Plan
Users can copy a summary of non-expired items that need attention, including their remaining quantities, expiry dates, and suggested uses.

8. Persistent Storage
FreshLoop saves inventory items, quantities, and statistics using browser localStorage, so data remains available after refreshing the page on the same browser and device.

Technologies Used
HTML5 — Application structure.
CSS3 — Styling, animations, and responsive design.
Vanilla JavaScript — Application logic and interactive features.
localStorage — Local data storage.
The project does not require a backend, database, framework, or external AI service.

Project Structure
FreshLoop/
├── index.html
├── style.css
└── script.js
Important Notes
Expiry dates and quantities are entered manually by users.
Data is stored locally in the browser and is not synchronized online.
Expiry reminders appear inside the application
Practical Impact
FreshLoop encourages better household food management by helping users monitor expiry dates, track remaining quantities, and make use of food before it goes to waste.