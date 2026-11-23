# Bug Report: Sauce Demo (Swag Labs)

This is a file of bug reports discovered through manual testing and based on the test scenarios described in `2- Test Cases - Product Coverage`. In the document the test cases are written as an approach to the intended behavior of the system, not as scripted specific steps to follow. That level of scripting is used in the automation scenarios.
#### Legend for IDs: 
- **BUG** = bugs, errors, defects
- **OBS** = observations. Behaviors that may need clarification. 
#### Legend for Severity/Priority:
- **Critical** = blocks a main flow (login, cart, checkout) and I'm unable to find a workaround. This should be the top priority.
- **Major** = an important feature doesn't work as expected or shows wrong data, but the app is still usable. 
- **Minor** = low impact or cosmetic, doesn't affect the main flow or critical paths. 

**Environment:** Chrome on macOS
**Users tested:** `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`

---

## Results standard_user

### BUG-01: Checkout can be completed with an empty cart
**Severity/Priority:** Major
**Description:** The user can go through the whole checkout and finish an order without any product in the cart.

**Steps to reproduce:**
1. Log in as `standard_user`
2. Make sure the cart is empty
3. Click the cart icon
4. Press `Checkout`
5. Fill in the checkout information and press `Continue`
6. Press `Finish`

**Expected:** Checkout is not allowed when the cart is empty.
**Actual:** The order is completed with no products.

---

## Results problem_user
#### Critical

### BUG-02: Last name field can't be filled in checkout
**Severity/Priority:** Critical
**Description:** In checkout step one (Checkout: Your Information), the last name field doesn't receive the typed characters. The text replaces the content of the first name field instead. The user can't go to the next step because of the error `Error: Last Name is required`.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Add products to the cart
3. Press the cart icon on the top right
4. Press `Checkout`
5. Enter the first name
6. Enter the last name
7. Press `Continue`

**Expected:** The last name field accepts text and `Continue` goes to the next step.
**Actual:** The last name field stays empty and the text replaces the first name. After pressing `Continue`, the form shows `Error: Last Name is required`.
#### Major

### BUG-03: Some products can't be added to the cart from the catalog view
**Severity/Priority:** Major
**Description:** For some products, pressing `Add to cart` in the catalog view does nothing.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Try to add these items to the cart: Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Test.allTheThings() T-Shirt (Red)

**Expected:** The items are added to the cart.
**Actual:** The items are not added to the cart.

### BUG-04: Some products can't be removed from the cart in the catalog view
**Severity/Priority:** Major
**Description:** Some products can be added to the cart from the catalog view, but then can't be removed with the `remove` button shown in the catalog. The items are added to the cart and the title in the cart matches the product.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Add these items to the cart: Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Onesie
3. Press the `remove` button under each item

**Expected:** The items are removed from the cart.
**Actual:** The items can't be removed.
### BUG-05: Product links lead to the wrong detail page
**Severity/Priority:** Major
**Description:** When you open a product's details from the catalog view or the cart, the link takes you to the detail page of a different product, not the one in the title.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Press the product name of any product in the catalog
3. Compare the title in the catalog with the product shown in the detail page

**Expected:** The detail page shows the product that was pressed.
**Actual:** The detail page shows a different product.

**Context:**
The links are crossed like this from the catalog view:
- Sauce Labs Bike Light > opens `Sauce Labs Bolt T-Shirt` (`item id=1`)
- Sauce Labs Bolt T-Shirt > opens `Sauce Labs Onesie` (`item id=2`)
- Sauce Labs Onesie > opens `Test.allTheThings() T-Shirt (Red)` (`item id=3`)
- Test.allTheThings() T-Shirt (Red) > opens `Sauce Labs Backpack` (`item id=4`)
- Sauce Labs Backpack > opens `Sauce Labs Fleece Jacket` (`item id=5`)
- Sauce Labs Fleece Jacket > opens `ITEM NOT FOUND` (`item id=6`)

Because of this, adding a product from the detail page shows the `remove` option on a different product in the catalog view (the one with the crossed link).

### BUG-06: Products can't be removed from the cart on the product detail page
**Severity/Priority:** Major
**Description:** A product added to the cart can't be removed by pressing `remove` on its detail page.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Add Sauce Labs Backpack to the cart
3. Press the name Test.allTheThings() T-Shirt (Red). Because of [BUG-05] this opens the Sauce Labs Backpack detail page
4. The button shows `remove`
5. Press `remove`

**Expected:** The product is removed from the cart.
**Actual:** The product stays in the cart.
### BUG-07: ITEM NOT FOUND page for Sauce Labs Fleece Jacket
**Severity/Priority:** Major
**Description:** Pressing the Sauce Labs Fleece Jacket name shows an ITEM NOT FOUND page. The page is for `item id=6` and there is no item in the inventory with that id.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Press the product name of Sauce Labs Fleece Jacket
3. Look at the page that opens

**Expected:** The Sauce Labs Fleece Jacket detail page is shown.
**Actual:** An ITEM NOT FOUND page is shown.

**Context:**
The product ids look somewhat shifted. The detail pages use ids 1 to 6, but the products in the inventory go from 0 to 5. This has two effects:
1. There is no detail page for Sauce Labs Bike Light (`item id=0`). Pressing it opens the page for Sauce Labs Bolt T-Shirt (`item id=1`).
2. The ITEM NOT FOUND page for Sauce Labs Fleece Jacket.

### BUG-08: Adding the "not found" item increases the cart count but nothing shows in the cart
**Severity/Priority:** Major
**Description:** If the `item id=6` (Sauce Labs Fleece Jacket) is added to the cart, the cart count goes up but no product is shown in the cart. The item can't be removed, so the count stays one higher than the real number of products. Related to [BUG-07].

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Press the product name of Sauce Labs Fleece Jacket
3. Press `Add to cart`
4. Check the cart count (it goes up)
5. Open the cart

**Expected:** The cart shows the added product and the count matches.
**Actual:**
- If there were products in the cart already: the cart shows the previous products but nothing for the new item (no product and no placeholder). The count is the number of products +1.
- If the cart was empty: the count shows 1 but the list is empty.

### BUG-09: Product sorting doesn't work
**Severity/Priority:** Major
**Description:** The product sort dropdown has no effect on the order of the products.

**Steps to reproduce:**
1. Log in as `problem_user` and go to the catalog view
2. Select one of the sort options: Name (A to Z), Name (Z to A), Price (low to high), Price (high to low)

**Expected:** The products are sorted by the selected option.
**Actual:** The products stay in the same order.
#### Minor

### BUG-10: All products show the same image
**Severity/Priority:** Minor
**Description:** On the products page, every product displays the same image.

**Steps to reproduce:**
1. Log in as `problem_user`
2. Look at the product images in the catalog

**Expected:** Each product shows its own image.
**Actual:** All products show the same image.

---

## Results performance_glitch_user

### BUG-11: Product catalog takes about 5 seconds to load
**Severity/Priority:** Major
**Description:** With `performance_glitch_user`, the load for the products page is slow every time it opens. The product images are also the last thing to show. I checked the performance tab in Chrome DevTools and it measures a Largest Contentful Paint (LCP) of about 5 s, which DevTools also rates as poor (good is under 2.5 s). The slowest element is the product image (`img.inventory_item_img`). The site shows no console errors.

**Steps to reproduce:**
1. Log in as `performance_glitch_user`
2. Wait for the products page to load
3. Check the LCP in Chrome DevTools > Performance

**Expected:** The products page loads according to selected benchmark (LCP suggested is under 2.5 s).
**Actual:** The catalog is visibly slow to load. LCP is 5.05 s.

**Context:**
The same delay (LCP about 5.03 s) happens every time the user goes back to the products page:
- From a product detail page, with `Back to products`
- From the order confirmation, with `Back Home`
- From the cart, with `Continue Shopping`

There is no layout shift while loading (CLS 0).

---

## Results error_user
There is another user in the list that is not in the document: `error_user`. Its errors overlap a bit with `problem_user`, but the display is more informative because errors show in the console.

To keep focus on the exercise and keep this short, I won't go through every error shown for this user. These are the areas where console errors showed up:
- When the checkout can't be completed
- When adding or removing items to the cart
- When the product description fails to render in the product detail page
- When the last name can't be entered in the checkout information form

I only report the main errors I consider blocking, critical and high risk for the product:
### BUG-12: Finish button on checkout does nothing
**Severity/Priority:** Critical
**Description:** Pressing `Finish` on the checkout overview does nothing and the user gets no message or warning.

**Steps to reproduce:**
1. Log in as `error_user` and go to the catalog view
2. Add an item to the cart
3. Go to checkout
4. Fill in the customer info
5. Press `Continue`
6. Press `Finish` on the overview page

**Expected:** The order is completed and the confirmation page is shown.
**Actual:** Nothing happens. The page stays on the overview step, the user is not informed or warned. The console shows:
`Uncaught TypeError: wa.cesetRart is not a function`
### BUG-13: Add to cart fails with an uncaught error
**Severity/Priority:** Critical
**Description:** Pressing `Add to cart` on some products doesn't add the item and an error shows in the console.

**Steps to reproduce:**
1. Log in as `error_user` and go to the catalog view
2. Press `Add to cart` on Sauce Labs Bolt T-Shirt

**Expected:** The item is added and the cart badge updates.
**Actual:** The cart count doesn't increase and the item is not added. The console shows:
`Uncaught Error: Failed to add item to the cart.`
### BUG-14: Remove from cart fails with an uncaught error
**Severity/Priority:** Critical
**Description:** Pressing `Remove` doesn't remove the item and an error shows in the console.

**Steps to reproduce:**
1. Log in as `error_user` and go to the catalog view
2. Press `Add to cart` on Sauce Labs Backpack
3. Press `Remove` on the same product

**Expected:** The item is removed and the cart badge updates.
**Actual:** The cart count doesn't decrease and the item is not removed. The console shows:
`Uncaught Error: Failed to remove item from cart.`

---

## Results shared by all users

### BUG-15: Login fails when the username has spaces
**Severity/Priority:** Minor
**Description:** A valid username is rejected as invalid if  leading or trailing spaces are added.

**Steps to reproduce:**
1. Go to the login page
2. Type a valid username and add a space to it
3. Type the password
4. Press `Login`

**Expected:** The username is accepted (or the extra spaces are ignored) and the user logs in.
**Actual:** The username is treated as invalid and the user can't log in.

---

## Results locked_out_user

### OBS-01: locked_out_user can't log in
**Severity/Priority:** Minor (observation, no defect confirmed)
**Description:** The user can't log in and sees the message below. The message and the block are consistent with the behavior for a locked user. I'm noting it only in case that locking this user is what's wrong or if it shouldn't be locked.

**Steps to reproduce:**
1. Go to the login page
2. Log in as `locked_out_user`

**Expected:** The user can't log in and a clear message is shown.
**Actual:** The user can't log in and sees:
```md
Epic sadface: Sorry, this user has been locked out.
```