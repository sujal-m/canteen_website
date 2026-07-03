// Shared helpers for menu item presentation.
// Backend MenuItem.category is one of: 'Veg', 'Non Veg', 'Snacks', 'Drinks'.
// We derive a veg/non-veg indicator from that field so we don't need a backend change.

export const isVegItem = (item) => item?.category !== 'Non Veg'

// UI-facing category chips. Backend data only has Veg/Non Veg/Snacks/Drinks,
// so Breakfast/Lunch are presented as UI groupings; items without a time-of-day
// tag fall back into Snacks/Drinks/Veg/Non Veg as already stored on the backend.
export const uiCategories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks']

export const dietFilters = ['All', 'Veg', 'Non Veg']

// Maps a UI category tab to the backend category value(s) it should request.
// Breakfast/Lunch aren't real backend categories yet, so they currently query
// the closest existing backend category as a best-effort mapping.
export const uiCategoryToBackend = (uiCategory) => {
  switch (uiCategory) {
    case 'Breakfast':
      return 'Veg'
    case 'Lunch':
      return 'Non Veg'
    case 'Snacks':
      return 'Snacks'
    case 'Drinks':
      return 'Drinks'
    default:
      return 'All'
  }
}
