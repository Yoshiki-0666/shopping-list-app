function switchScreen(screenName) {
  if (!["shopping", "favorite"].includes(screenName)) {
    return;
  }

  state.ui.currentScreen = screenName;
  state.ui.activeMenu = { itemType: null, itemId: null };
  state.ui.editingItem = { itemType: null, itemId: null };
  render();
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeName(name) {
  return String(name).trim().replace(/\s+/g, " ");
}

function hasDuplicateName(name, collections) {
  const normalizedName = normalizeName(name);

  return collections.some((collection) =>
    collection.some((item) => normalizeName(item.name) === normalizedName)
  );
}

let toastTimer = null;

function showToast(message) {
  const toast = document.querySelector("#toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    toastTimer = null;
  }, 1800);
}

function toggleItemMenu(itemType, itemId) {
  const current = state.ui.activeMenu;
  const isSameMenu =
    current?.itemType === itemType && current?.itemId === itemId;

  state.ui.activeMenu = isSameMenu
    ? { itemType: null, itemId: null }
    : { itemType, itemId };
  state.ui.editingItem = { itemType: null, itemId: null };
  render();
}

function closeItemMenu() {
  state.ui.activeMenu = { itemType: null, itemId: null };
  render();
}

function startItemEdit(itemType, itemId) {
  state.ui.activeMenu = { itemType: null, itemId: null };
  state.ui.editingItem = { itemType, itemId };
  render();
}

function cancelItemEdit() {
  state.ui.editingItem = { itemType: null, itemId: null };
  render();
}

function getItemsByType(itemType) {
  if (itemType === "shopping") {
    return state.shoppingItems;
  }
  if (itemType === "favorite") {
    return state.favoriteItems;
  }
  if (itemType === "history") {
    return state.oneTimeHistory;
  }
  return null;
}

function hasEditNameConflict(itemType, itemId, normalizedName) {
  const collections = [
    { itemType: "shopping", items: state.shoppingItems },
    { itemType: "favorite", items: state.favoriteItems },
    { itemType: "history", items: state.oneTimeHistory }
  ];

  return collections.some(({ itemType: candidateType, items }) =>
    items.some((item) => {
      if (candidateType === itemType && item.id === itemId) {
        return false;
      }

      if (
        itemType === "favorite" &&
        candidateType === "shopping" &&
        item.favoriteItemId === itemId
      ) {
        return false;
      }

      return normalizeName(item.name) === normalizedName;
    })
  );
}

function saveItemName(itemType, itemId, name) {
  const normalizedName = normalizeName(name);
  const items = getItemsByType(itemType);
  const targetItem = items?.find((item) => item.id === itemId);

  if (!normalizedName || !targetItem) {
    return false;
  }

  if (normalizeName(targetItem.name) === normalizedName) {
    state.ui.editingItem = { itemType: null, itemId: null };
    render();
    return true;
  }

  if (hasEditNameConflict(itemType, itemId, normalizedName)) {
    showToast("この商品は追加済みです");
    return false;
  }

  targetItem.name = normalizedName;

  if (itemType === "favorite") {
    state.shoppingItems.forEach((shoppingItem) => {
      if (shoppingItem.favoriteItemId === itemId) {
        shoppingItem.name = normalizedName;
      }
    });
  }

  state.ui.editingItem = { itemType: null, itemId: null };
  saveState();
  render();
  return true;
}

function addOneTimeItem(name) {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return false;
  }

  const alreadyExists = hasDuplicateName(normalizedName, [
    state.favoriteItems,
    state.shoppingItems,
    state.oneTimeHistory
  ]);

  if (alreadyExists) {
    showToast("この商品は追加済みです");
    return false;
  }

  state.shoppingItems.push({
    id: createId("shopping"),
    name: normalizedName,
    checked: false,
    oneTime: true,
    favoriteItemId: null,
    createdAt: Date.now()
  });

  saveState();
  render();
  return true;
}

function addFavoriteItem(name) {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return false;
  }

  const alreadyExists = hasDuplicateName(normalizedName, [
    state.favoriteItems,
    state.shoppingItems,
    state.oneTimeHistory
  ]);

  if (alreadyExists) {
    showToast("この商品は追加済みです");
    return false;
  }

  state.favoriteItems.push({
    id: createId("favorite"),
    name: normalizedName,
    createdAt: Date.now()
  });

  saveState();
  render();
  return true;
}

function addFavoriteToShoppingList(favoriteItem) {
  const alreadySelected = state.shoppingItems.some(
    (item) => item.favoriteItemId === favoriteItem.id
  );

  if (alreadySelected) {
    showToast("この商品は追加済みです");
    return false;
  }

  const sameNameExists = state.shoppingItems.some(
    (item) => normalizeName(item.name) === normalizeName(favoriteItem.name)
  );

  if (sameNameExists) {
    showToast("この商品は追加済みです");
    return false;
  }

  state.shoppingItems.push({
    id: createId("shopping"),
    name: favoriteItem.name,
    checked: false,
    oneTime: false,
    favoriteItemId: favoriteItem.id,
    createdAt: Date.now()
  });

  return true;
}

function toggleFavoriteSelection(favoriteItemId) {
  const favoriteItem = state.favoriteItems.find(
    (item) => item.id === favoriteItemId
  );

  if (!favoriteItem) {
    return;
  }

  const existingShoppingItem = state.shoppingItems.find(
    (item) => item.favoriteItemId === favoriteItemId
  );

  if (existingShoppingItem) {
    state.shoppingItems = state.shoppingItems.filter(
      (item) => item.favoriteItemId !== favoriteItemId
    );
    saveState();
    render();
    return;
  } else {
    if (!addFavoriteToShoppingList(favoriteItem)) {
      return;
    }
  }

  saveState();
  render();
  showToast(`${favoriteItem.name}が買うものに追加されました`);
}

function toggleShoppingItemChecked(shoppingItemId) {
  const targetItem = state.shoppingItems.find(
    (item) => item.id === shoppingItemId
  );

  if (!targetItem) {
    return;
  }

  targetItem.checked = !targetItem.checked;
  saveState();
  render();
}

function deleteShoppingItem(shoppingItemId) {
  const nextItems = state.shoppingItems.filter(
    (item) => item.id !== shoppingItemId
  );

  if (nextItems.length === state.shoppingItems.length) {
    return;
  }

  state.shoppingItems = nextItems;
  saveState();
  render();
}

function deleteFavoriteItem(favoriteItemId) {
  const favoriteExists = state.favoriteItems.some(
    (item) => item.id === favoriteItemId
  );

  if (!favoriteExists) {
    return;
  }

  state.favoriteItems = state.favoriteItems.filter(
    (item) => item.id !== favoriteItemId
  );
  state.shoppingItems = state.shoppingItems.filter(
    (item) => item.favoriteItemId !== favoriteItemId
  );

  saveState();
  render();
}

function deleteOneTimeHistoryItem(historyItemId) {
  const nextItems = state.oneTimeHistory.filter(
    (item) => item.id !== historyItemId
  );

  if (nextItems.length === state.oneTimeHistory.length) {
    return;
  }

  state.oneTimeHistory = nextItems;
  saveState();
  render();
}

function requestCompleteShopping() {
  const hasUncheckedItems = state.shoppingItems.some((item) => !item.checked);

  if (hasUncheckedItems) {
    state.ui.isCompleteDialogOpen = true;
    render();
    return;
  }

  completeShopping();
}

function completeShopping() {
  const oneTimeItems = state.shoppingItems.filter((item) => item.oneTime);

  oneTimeItems.forEach((item) => {
    const normalizedName = normalizeName(item.name);
    const existsInFavorites = state.favoriteItems.some(
      (favoriteItem) => normalizeName(favoriteItem.name) === normalizedName
    );
    const existsInHistory = state.oneTimeHistory.some(
      (historyItem) => normalizeName(historyItem.name) === normalizedName
    );

    if (!normalizedName || existsInFavorites || existsInHistory) {
      return;
    }

    state.oneTimeHistory.push({
      id: createId("history"),
      name: normalizedName,
      createdAt: Date.now()
    });
  });

  state.shoppingItems = [];
  state.ui.currentScreen = "shopping";
  state.ui.isCompleteDialogOpen = false;
  state.ui.isCheckedListExpanded = false;
  state.ui.activeMenu = { itemType: null, itemId: null };
  state.ui.editingItem = { itemType: null, itemId: null };

  saveState();
  render();
}

function addOneTimeHistoryToFavorite(historyItemId) {
  const historyItem = state.oneTimeHistory.find(
    (item) => item.id === historyItemId
  );

  if (!historyItem) {
    return;
  }

  const normalizedName = normalizeName(historyItem.name);
  const alreadyExists = state.favoriteItems.some(
    (item) => normalizeName(item.name) === normalizedName
  );

  if (normalizedName && !alreadyExists) {
    state.favoriteItems.push({
      id: createId("favorite"),
      name: normalizedName,
      createdAt: Date.now()
    });
  }

  state.oneTimeHistory = state.oneTimeHistory.filter(
    (item) => item.id !== historyItemId
  );

  saveState();
  render();

  if (alreadyExists) {
    showToast("この商品は追加済みです");
  }
}

function toggleCheckedListExpanded() {
  state.ui.isCheckedListExpanded = !state.ui.isCheckedListExpanded;
  render();
}

document.addEventListener("click", (event) => {
  const menuToggleButton = event.target.closest("[data-menu-toggle-type]");

  if (menuToggleButton) {
    event.stopPropagation();
    toggleItemMenu(
      menuToggleButton.dataset.menuToggleType,
      menuToggleButton.dataset.menuToggleId
    );
    return;
  }

  const startEditButton = event.target.closest("[data-start-edit-type]");

  if (startEditButton) {
    event.stopPropagation();
    startItemEdit(
      startEditButton.dataset.startEditType,
      startEditButton.dataset.startEditId
    );
    return;
  }

  const menuDeleteButton = event.target.closest("[data-menu-delete-type]");

  if (menuDeleteButton) {
    event.stopPropagation();
    const itemType = menuDeleteButton.dataset.menuDeleteType;
    const itemId = menuDeleteButton.dataset.menuDeleteId;
    state.ui.activeMenu = { itemType: null, itemId: null };

    if (itemType === "shopping") {
      deleteShoppingItem(itemId);
    } else if (itemType === "favorite") {
      deleteFavoriteItem(itemId);
    } else if (itemType === "history") {
      deleteOneTimeHistoryItem(itemId);
    }
    return;
  }

  if (event.target.closest("[data-cancel-edit]")) {
    event.stopPropagation();
    cancelItemEdit();
    return;
  }

  if (event.target.closest("[data-edit-form]")) {
    event.stopPropagation();
    return;
  }

  if (event.target.closest("[data-item-menu]")) {
    event.stopPropagation();
    return;
  }

  const shoppingDeleteButton = event.target.closest("[data-delete-shopping-id]");

  if (shoppingDeleteButton) {
    event.stopPropagation();
    deleteShoppingItem(shoppingDeleteButton.dataset.deleteShoppingId);
    return;
  }

  const favoriteDeleteButton = event.target.closest("[data-delete-favorite-id]");

  if (favoriteDeleteButton) {
    event.stopPropagation();
    deleteFavoriteItem(favoriteDeleteButton.dataset.deleteFavoriteId);
    return;
  }

  const historyDeleteButton = event.target.closest("[data-delete-history-id]");

  if (historyDeleteButton) {
    event.stopPropagation();
    deleteOneTimeHistoryItem(historyDeleteButton.dataset.deleteHistoryId);
    return;
  }

  const historyPromoteButton = event.target.closest("[data-promote-history-id]");

  if (historyPromoteButton) {
    event.stopPropagation();
    addOneTimeHistoryToFavorite(historyPromoteButton.dataset.promoteHistoryId);
    return;
  }

  if (event.target.closest("[data-request-complete]")) {
    requestCompleteShopping();
    return;
  }

  if (event.target.closest("[data-cancel-complete]")) {
    state.ui.isCompleteDialogOpen = false;
    render();
    return;
  }

  if (event.target.closest("[data-confirm-complete]")) {
    completeShopping();
    return;
  }

  if (event.target.closest("[data-toggle-checked-list]")) {
    toggleCheckedListExpanded();
    return;
  }

  if (state.ui.activeMenu?.itemType) {
    closeItemMenu();
    return;
  }

  const pendingActionButton = event.target.closest("[data-todo]");

  if (pendingActionButton) {
    event.stopPropagation();
    return;
  }

  const screenButton = event.target.closest("[data-screen]");

  if (screenButton) {
    switchScreen(screenButton.dataset.screen);
    return;
  }

  const favoriteCard = event.target.closest("[data-favorite-id]");

  if (favoriteCard) {
    toggleFavoriteSelection(favoriteCard.dataset.favoriteId);
    return;
  }

  const shoppingCard = event.target.closest("[data-shopping-item-id]");

  if (shoppingCard) {
    toggleShoppingItemChecked(shoppingCard.dataset.shoppingItemId);
  }

  // TODO: 商品名編集など、今後の高度なメニュー操作を実装する。
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.ui.editingItem?.itemType) {
    event.preventDefault();
    cancelItemEdit();
    return;
  }

  const favoriteCard = event.target.closest("[data-favorite-id]");
  const shoppingCard = event.target.closest("[data-shopping-item-id]");

  if (event.target.closest("[data-todo]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (favoriteCard) {
    event.preventDefault();
    toggleFavoriteSelection(favoriteCard.dataset.favoriteId);
    return;
  }

  if (shoppingCard) {
    event.preventDefault();
    toggleShoppingItemChecked(shoppingCard.dataset.shoppingItemId);
  }
});

document.addEventListener("submit", (event) => {
  const editForm = event.target.closest("[data-edit-form]");

  if (editForm) {
    event.preventDefault();
    event.stopPropagation();
    const input = editForm.querySelector("input");
    saveItemName(
      editForm.dataset.editType,
      editForm.dataset.editId,
      input.value
    );
    return;
  }

  const form = event.target.closest("[data-add-form]");

  if (!form) {
    return;
  }

  event.preventDefault();

  const input = form.querySelector("input");
  const inputValue = input.value;

  if (form.dataset.addForm === "one-time") {
    if (addOneTimeItem(inputValue)) {
      input.value = "";
    }
    return;
  }

  if (form.dataset.addForm === "favorite") {
    if (addFavoriteItem(inputValue)) {
      input.value = "";
      return;
    }

    if (normalizeName(inputValue)) {
      input.value = "";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loadedState = loadState();

  state.shoppingItems = loadedState.shoppingItems;
  state.favoriteItems = loadedState.favoriteItems;
  state.oneTimeHistory = loadedState.oneTimeHistory;
  state.ui = loadedState.ui;

  render();
});
