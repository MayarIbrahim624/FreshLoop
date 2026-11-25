# FreshLoop — Problem and Solution Alignment

## 1. Problem statement

Household food waste can happen when people lose track of food stored at home, forget expiry dates, overlook partially used items, or do not know which items should be used first. Food that could have been consumed may consequently be discarded.

FreshLoop addresses this everyday problem with a lightweight food inventory and expiry-awareness website. It helps users record food items, quantities, and expiry dates; highlights items that need attention; and provides practical ideas for using suitable, non-expired food.

## 2. Intended users

People and households who want a simple way to organize food stored at home and reduce avoidable waste.

## 3. Problem-to-feature mapping

| User problem | FreshLoop feature | How the feature responds |
|---|---|---|
| People forget what food they have | Food inventory | Stores food names, categories, quantities, and expiry dates in the browser |
| People overlook expiry dates | Expiry tracking and reminders | Highlights items that are expired or approaching their expiry date |
| People do not know what to use first | Smart Rescue Score | Applies transparent date-based rules to prioritize non-expired items |
| People use only part of an item | Partial consumption | Updates the remaining quantity instead of removing the item immediately |
| People need ideas for using available food | Food-use ideas and combinations | Suggests ideas based on food names and categories |
| Expired food should not be treated as a normal rescue opportunity | Safety Review | Separates expired items from normal consumption recommendations |

## 4. Example user journey

1. A user adds bananas, records the quantity, and selects an expiry date.
2. FreshLoop stores the item in the browser and displays it in the inventory.
3. As the expiry date approaches, the item appears in the reminder area and receives a higher date-based priority score.
4. FreshLoop suggests relevant ways to use the bananas.
5. If the user consumes only some bananas, they record the amount used and FreshLoop updates the remaining quantity.
6. If an item is past its expiry date, FreshLoop places it in Safety Review instead of recommending it as food to consume.

## 5. Expected practical value

FreshLoop is intended to support better household food awareness and planning. By making inventory, quantities, and expiry dates easier to track, it may help users identify food that should be considered sooner and avoid forgetting items.

The project does not claim to measure or guarantee a reduction in food waste. Its current version is a client-side prototype: inventory data is stored in the browser using localStorage and is not synchronized across devices or users.

## 6. Technical approach

The current application uses HTML, CSS, and vanilla JavaScript. Its Smart Rescue Score is a transparent rule-based calculation based on the number of days remaining before expiry. Food-use ideas are selected using category and keyword rules. The project does not currently use a machine-learning model or a backend database.

## 7. Evaluation evidence

The Playwright browser tests in `tests/freshloop.spec.js` cover key user flows including adding food, partial and full consumption, expiry reminders, expired-food safety handling, rescue-plan exclusion, and persistence after page reload.

Run the tests and retain the actual test output as evidence. Do not report a passing test count until the suite has been executed successfully.
