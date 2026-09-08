# Eagle Creek Golf Club Stay and Play

## Project Overview

This project is a static, responsive webpage for **Eagle Creek Golf Club, Stay and Play**. It presents a golf course and travel booking experience using HTML and CSS.

The page includes:

- A header with navigation, search, menu, and booking controls
- Breadcrumb navigation and a golf course hero section
- Course images and a responsive image gallery
- Course details, highlights, reviews, features, and weather information
- Stay and accommodation information with pricing cards
- A booking form-style card and nearby golf course recommendations
- A responsive footer with navigation and destination links

The main page is located in `index.html`. Styling is separated across the CSS files for the header, hero section, main content, payment card, course information, and stay section. Images and icons are stored in the `assets/` directory.

## Responsive Breakpoints

The layout uses CSS media queries to adapt the page for desktop, tablet, and mobile screen sizes.

### Desktop: 1024px and wider

- The main content uses a multi-column layout.
- The image gallery, course information, stay section, and payment card are visible together.
- The full navigation and desktop footer layout are displayed.
- Course highlights, reviews, weather seasons, and nearby courses use multiple columns.

### Tablet: 768px to 1023px

- The main content changes to a single-column layout.
- The side image gallery and desktop payment card are hidden.
- Mobile pricing cards are displayed below the main gallery.
- Content such as course highlights and weather seasons is reduced to two columns.
- The footer changes to a compact grid layout.

### Mobile: 767px and narrower

- Desktop navigation is hidden and a menu icon is shown.
- The header controls become compact icon-style controls.
- Course highlights, reviews, features, and nearby courses stack into smaller layouts.
- Weather seasons are displayed in one column.
- Mobile pricing cards are simplified to fit narrow screens.
- The footer links are arranged in two columns.


## Assumptions

- We assumed that this is a static website.
- We assumed that JavaScript is not required for the project.
- The page is intended to demonstrate the visual layout and responsive behavior of a golf booking website rather than provide a complete booking service.

## Limitations

- Buttons, navigation links, search, filters, pagination, and booking controls are not functional. They are included for visual demonstration only.
- The website does not include a backend, database, authentication, live availability, or real payment processing.
- Some icons and visual assets are publicly available or AI-generated rather than original production assets.
- Since the page is static, its course information, prices, weather details, and recommendations are fixed sample content.
