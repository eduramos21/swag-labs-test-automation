# Test Cases: Product Coverage

These are the general test cases for product coverage. They describe what the product should do, for any user. This is an informative file using as an oracle the general implementation of e-commerce sites like Amazon.

### Login

Feature: Login
Users log in to reach the products

Scenario: A user logs in
Given the user is on the login page
When the user logs in with valid credentials
Then the user sees the products page

Scenario: A locked out user can't log in
Given the user's account is locked
When the user logs in with valid credentials
Then a message says the user is locked out
And the products page can't be reached

Scenario: Login is refused with wrong credentials
Given the user is on the login page
When the user logs in with a wrong username or password
Then the login is refused with an error message

Scenario: A username with extra spaces still logs in
Given the user is on the login page
When the user logs in with spaces before or after the username
Then the username is trimmed
And the user logs in successfully

### Product display

Feature: Product display
Users see the product information and details

Scenario: Products show their key information
Given the user is logged in
When the user views the product catalog
Then every product shows an image, title, price, description and an add to cart option

Scenario: A product opens its own detail page
Given the user is logged in
When the user opens the details of a product
Then the detail page shows that same product

### Product sort

Feature: Product sort
Users sort the product list according to selected criteria

Scenario: Products are sorted by the selected option
Given the user is logged in
When the user sorts the products by any option
Then the products are listed in that order

### Cart

Feature: Cart
Users add and remove products, and the cart display matches their selection

Scenario: Products added to the cart show in the cart
Given the user is logged in
When the user adds products to the cart from the catalog or the detail page
Then the cart lists those products
And the cart badge shows how many products were added

Scenario: The user keeps shopping from the cart
Given the user has a product in the cart
When the user continues shopping from the cart
Then the user is back on the products page
And the cart still holds the product

Scenario: Products are removed from the cart
Given the user has products in the cart
When the user removes them from the catalog, the detail page or the cart page
Then the cart is empty

### Checkout

Feature: Checkout
Users enter their information, complete the order and download it as a PDF

Scenario: Checkout information is accepted
Given the user has at least one product in the cart
When the user enters first name, last name and postal code at checkout
Then the checkout overview shows the order
And the overview shows the item total, the tax and the combined total

Scenario: Checkout overview totals are consistent
Given the user is on the checkout overview with products in the cart
Then the item total equals the sum of the prices of the products in the cart
And the combined total equals the item total plus the tax

Scenario: Checkout information requires every field
Given the user is on the checkout information step
When the user continues with an empty field
Then an error says which field is required

Scenario: Checkout is not allowed with an empty cart
Given the user has an empty cart
When the user goes to checkout
Then the checkout can't be started

Scenario: Checkout overview totals are consistent
Given the user is on the checkout overview with products in the cart
Then the item total equals the sum of the prices of the products in the cart
And the combined total equals the item total plus the tax

Scenario: The user completes an order
Given the user is on the checkout overview with products in the cart
When the user finishes the order
Then the order confirmation is shown

Scenario: The PDF order is generated
Given the user has completed an order
When the user generates the PDF order
Then a PDF with the order information is downloaded

### Finish order

Feature: Finish order
Users confirm and complete the order

Scenario: The user completes an order
Given the user is on the checkout overview
When the user finishes the order
Then the order confirmation is shown

### Generate PDF order

Feature: Generate PDF order
Users download the order as a PDF

Scenario: The PDF order is generated
Given the user has completed an order
When the user generates the PDF order
Then a PDF with the order information is downloaded
