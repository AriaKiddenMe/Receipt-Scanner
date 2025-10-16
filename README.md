# Receipt-Scanner
## Objective Goal
The goal of this application is to help customers save money by scanning receipts and comparing weight and unit prices of food items across nearby grocery stores. This thereby gives customers awareness of which store has the better deals for a set of specific items and, as a result, gives them the ability to plan and save for future purchases

## Features:
The purpose of this project is to identify the cheapest options available for items and which store has these items, so customers are made aware and can make informed purchases. Features to help acquire this comprehensive data will include a csv file or excel spreadsheet that users can upload in the application which contains food items and their prices from a few grocery stores. This data will then be utilized by the application to do a price-by-price comparison and output a summary that shows which store has the better deals and helps enable the user to save money on future purchases. Another feature will be an option for the user to be able to scan the receipt which includes the items and their associated price, this will implement the use of OCR (optical character recognition) to capture the image of the receipt. Furthermore, another feature that can be integrated is some form of mapping location that provides location-based services so users can see a visual of nearby stores that have the current deals and the distance of the stores. Other features to be included can be giving users notification alerts on recent deals from specific stores, providing some basic data analytics such as price history of items over a specific period, nutritional facts, and a favorites category to cache frequently bought and favored items. User’s can also use this app to store and write shopping lists. They can then use the app to suggest which stores have the best prices for their list using filters, such as number of stores [how many they are willing to go to], distance to (1st) store [in drive time and miles via google maps API], and distance between stores [for multi-store trips].
## Technologies/Frameworks:
For the front-end UI such as login and signup, we plan to use and build a React web application. For some basic backend we also plan to implement Express (Node.js), which can interact with any database such as MongoDB which may contain user records and attributes attached to the user. Python (FastAPI) can also be utilized for the backend. Python provides the use of pandas to extract information from uploaded user files such as spreadsheets or csv files. Python also has a module (pytesseract) from the Tesseract OCR engine or tesseract.js for React, both of which can be used to read text from scanned receipts. Finally, the implementation of location-based services can be utilized with react-leaflet (Leaflet), react-map-gl (MapLibre GL), or @react-google-maps/api (Google Maps). 

## Non-Functional Requirements:
### Performance
<ul type="*">
  <li> Notifications should be delivered in real-time.</li>
</ul>

### Security
<ul type="*">
  <li> User data should be securely stored and protected.</li>
  <li> Passwords must be encrypted.</li>
  <li> Utilization of techniques such as hashing and salting to enhance password storage security.</li>
</ul>

### Scalability
<ul type="*">
  <li> The app should handle possible expansion without performance degradation. </li> 
  <li> The app should be able to scale to include more stores over time. </li>
</ul>

### Availability
<ul type="*">
  <li> The app should be available 98% of the time. </li>
</ul>

### Usability
<ul type="*">
  <li> The user interface should be intuitive, allowing users to input their receipts. </li>
  <li> The app should be accessible on all web browsers. Users could use the application through their mobile device or desktop without any inherent issues. </li>
</ul>

### Maintainability
<ul type="*">
  <li> Code should be well-documented to allow easy updates and maintenance. </li>
</ul>
