const STORAGE_KEY = "shoppingListAppV1";

function cloneInitialState() {
  if (typeof structuredClone === "function") {
    return structuredClone(initialState);
  }

  return JSON.parse(JSON.stringify(initialState));
}

function loadState() {
  const fallbackState = cloneInitialState();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return fallbackState;
    }

    const parsed = JSON.parse(saved);

    return {
      shoppingItems: Array.isArray(parsed.shoppingItems)
        ? parsed.shoppingItems
        : fallbackState.shoppingItems,
      favoriteItems: Array.isArray(parsed.favoriteItems)
        ? parsed.favoriteItems
        : fallbackState.favoriteItems,
      oneTimeHistory: Array.isArray(parsed.oneTimeHistory)
        ? parsed.oneTimeHistory
        : fallbackState.oneTimeHistory,
      ui: {
        ...fallbackState.ui,
        ...(parsed.ui || {}),
        currentScreen: "shopping"
      }
    };
  } catch (error) {
    console.error("Failed to load state:", error);
    return fallbackState;
  }
}

function saveState() {
  try {
    const data = {
      shoppingItems: state.shoppingItems,
      favoriteItems: state.favoriteItems,
      oneTimeHistory: state.oneTimeHistory
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}
