// Shared helpers for menu item presentation.
// Backend MenuItem.category is one of: 'Veg', 'Non Veg', 'Snacks', 'Drinks'.
// We derive a veg/non-veg indicator from that field so we don't need a backend change.

export const isVegItem = (item) => item?.category !== 'Non Veg'

// Standard message shown when a guest is redirected to /login from a
// protected action (add to cart, checkout, etc.), per product spec.
export const loginRequiredMessage = 'Please login to continue.'

// Shared category chips. These mirror the backend MenuItem.category enum so the
// admin form, menu filters, and Home page all use the same data model.
export const uiCategories = ['All', 'Veg', 'Non Veg', 'Snacks', 'Drinks']

export const dietFilters = ['All', 'Veg', 'Non Veg']
