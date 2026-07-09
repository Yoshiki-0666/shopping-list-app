const initialState = {
  shoppingItems: [],
  favoriteItems: [],
  oneTimeHistory: [],
  ui: {
    currentScreen: "shopping",
    isCompleteDialogOpen: false,
    isCheckedListExpanded: false,
    activeMenu: {
      itemType: null,
      itemId: null
    },
    editingItem: {
      itemType: null,
      itemId: null
    }
  }
};

// UI確認用サンプルデータ。通常起動時のloadState()では使用しない。
const demoState = {
  shoppingItems: [
    {
      id: "shopping_001",
      name: "牛乳",
      checked: false,
      oneTime: true,
      favoriteItemId: null,
      createdAt: Date.now()
    },
    {
      id: "shopping_002",
      name: "卵",
      checked: false,
      oneTime: false,
      favoriteItemId: "favorite_002",
      createdAt: Date.now()
    },
    {
      id: "shopping_003",
      name: "チーズ",
      checked: false,
      oneTime: false,
      favoriteItemId: "favorite_003",
      createdAt: Date.now()
    },
    {
      id: "shopping_004",
      name: "食パン",
      checked: false,
      oneTime: false,
      favoriteItemId: "favorite_004",
      createdAt: Date.now()
    },
    {
      id: "shopping_005",
      name: "洗剤",
      checked: true,
      oneTime: false,
      favoriteItemId: "favorite_005",
      createdAt: Date.now()
    },
    {
      id: "shopping_006",
      name: "豆腐",
      checked: true,
      oneTime: false,
      favoriteItemId: "favorite_006",
      createdAt: Date.now()
    }
  ],
  favoriteItems: [
    {
      id: "favorite_001",
      name: "牛乳",
      createdAt: Date.now()
    },
    {
      id: "favorite_002",
      name: "人参",
      createdAt: Date.now()
    },
    {
      id: "favorite_003",
      name: "コーヒー",
      createdAt: Date.now()
    },
    {
      id: "favorite_004",
      name: "卵",
      createdAt: Date.now()
    }
  ],
  oneTimeHistory: [
    {
      id: "history_001",
      name: "洗剤",
      createdAt: Date.now()
    },
    {
      id: "history_002",
      name: "豆腐",
      createdAt: Date.now()
    }
  ],
  ui: {
    currentScreen: "shopping",
    isCompleteDialogOpen: false,
    isCheckedListExpanded: false,
    activeMenu: {
      itemType: null,
      itemId: null
    },
    editingItem: {
      itemType: null,
      itemId: null
    }
  }
};

const state = {
  shoppingItems: [],
  favoriteItems: [],
  oneTimeHistory: [],
  ui: {
    currentScreen: "shopping",
    isCompleteDialogOpen: false,
    isCheckedListExpanded: false,
    activeMenu: {
      itemType: null,
      itemId: null
    },
    editingItem: {
      itemType: null,
      itemId: null
    }
  }
};
