function render() {
  renderHeader();

  if (state.ui.currentScreen === "shopping") {
    renderShoppingScreen();
  }

  if (state.ui.currentScreen === "favorite") {
    renderFavoriteScreen();
  }

  renderDialog();
}

function renderHeader() {
  const header = document.querySelector("#header");

  if (state.ui.currentScreen === "shopping") {
    const favoriteNavigation = state.shoppingItems.length
      ? `
          <button class="header__nav header__nav--right" type="button" data-screen="favorite">
            <span class="header__nav-text">よく買う商品</span>
            <span class="header__nav-icon header__nav-icon--right" aria-hidden="true"></span>
          </button>
        `
      : "";

    header.innerHTML = `
      <h1 class="header__title">買うもの</h1>
      ${favoriteNavigation}
    `;
    return;
  }

  header.innerHTML = `
    <button class="header__nav header__nav--left" type="button" data-screen="shopping">
      <span class="header__nav-icon header__nav-icon--left" aria-hidden="true"></span>
      <span class="header__nav-text">買うもの</span>
    </button>
    <h1 class="header__title">よく買う商品</h1>
  `;
}

function renderShoppingScreen() {
  const mainContent = document.querySelector("#mainContent");
  const uncheckedItems = state.shoppingItems.filter((item) => !item.checked);
  const checkedItems = state.shoppingItems.filter((item) => item.checked);

  if (checkedItems.length < 4) {
    state.ui.isCheckedListExpanded = false;
  }

  const shouldCollapseCheckedItems =
    checkedItems.length >= 4 && !state.ui.isCheckedListExpanded;
  const visibleCheckedItems = shouldCollapseCheckedItems
    ? checkedItems.slice(0, 3)
    : checkedItems;

  const uncheckedSection = uncheckedItems.length
    ? renderShoppingSection("uncheckedItemsTitle", "買うもの", uncheckedItems)
    : "";
  const checkedSection = checkedItems.length
    ? renderShoppingSection(
        "checkedItemsTitle",
        "チェック済み商品",
        visibleCheckedItems,
        {
          totalCount: checkedItems.length,
          showToggle: checkedItems.length >= 4,
          isExpanded: state.ui.isCheckedListExpanded
        }
      )
    : "";

  const shoppingContent = state.shoppingItems.length
    ? `
        <div class="shopping-area">
          <div class="section-stack">
            ${uncheckedSection}
            ${checkedSection}
          </div>
          <button class="complete-button" type="button" data-request-complete>買い物完了</button>
        </div>
      `
    : renderEmptyState();

  mainContent.innerHTML = `
    ${shoppingContent}
    ${renderInputForm(
      "今回だけの商品を追加",
      "今回だけ購入する商品を入力",
      "oneTimeItemInput",
      "one-time"
    )}
  `;
}

function renderFavoriteScreen() {
  const mainContent = document.querySelector("#mainContent");
  const favoriteItemsContent = state.favoriteItems.length
    ? `
        <div class="product-list">
          ${state.favoriteItems
            .map((item) =>
              renderProductCard(item, isFavoriteSelected(item.id) ? "selected" : "unselected")
            )
            .join("")}
        </div>
      `
    : `
        <div class="empty-message">
          <p class="empty-message__title">よく買う商品がまだありません</p>
          <p class="section-note">追加すると、次回からタップで買うものリストに入れられます</p>
        </div>
      `;

  const oneTimeHistorySection = state.oneTimeHistory.length
    ? `
        <section class="content-section" aria-labelledby="oneTimeHistoryTitle">
          <div class="section-heading section-heading--stacked">
            <div class="section-heading__row">
              <h2 id="oneTimeHistoryTitle" class="section-title">今回だけ追加した商品</h2>
              <span class="section-count" aria-label="${state.oneTimeHistory.length}件">${state.oneTimeHistory.length}</span>
            </div>
            <p class="section-note">次回も買うものは、よく買うリストに追加できます</p>
          </div>
          <div class="product-list">
            ${state.oneTimeHistory.map((item) => renderProductCard(item, "spot")).join("")}
          </div>
        </section>
      `
    : "";

  mainContent.innerHTML = `
    ${renderInputForm(
      "よく買う商品を追加",
      "よく買う商品を入力",
      "favoriteItemInput",
      "favorite"
    )}
    <div class="shopping-area">
      <div class="section-stack">
        <section class="content-section" aria-labelledby="favoriteItemsTitle">
          <div class="section-heading">
            <h2 id="favoriteItemsTitle" class="section-title">よく買うものリスト</h2>
            <span class="section-count" aria-label="${state.favoriteItems.length}件">${state.favoriteItems.length}</span>
          </div>
          ${favoriteItemsContent}
        </section>
        ${oneTimeHistorySection}
      </div>
    </div>
  `;
}

function renderShoppingSection(titleId, title, items, options = {}) {
  const totalCount = options.totalCount ?? items.length;
  const checkedListToggle = options.showToggle
    ? `
        <button class="opening-toggle" type="button" data-toggle-checked-list>
          <span>${options.isExpanded ? "閉じる" : "さらに見る"}</span>
          <span
            class="opening-toggle__icon${options.isExpanded ? " opening-toggle__icon--expanded" : ""}"
            aria-hidden="true"
          ></span>
        </button>
      `
    : "";

  return `
    <section class="content-section" aria-labelledby="${titleId}">
      <div class="section-heading">
        <h2 id="${titleId}" class="section-title">${title}</h2>
        <span class="section-count" aria-label="${totalCount}件">${totalCount}</span>
      </div>
      <div class="product-list">
        ${items.map((item) => renderProductCard(item, "shopping")).join("")}
      </div>
      ${checkedListToggle}
    </section>
  `;
}

function isFavoriteSelected(favoriteItemId) {
  return state.shoppingItems.some((item) => item.favoriteItemId === favoriteItemId);
}

function renderProductCard(item, variant) {
  if (variant === "shopping") {
    const itemType = "shopping";
    const checkedClass = item.checked
      ? " product-card--checked"
      : " product-card--unchecked";

    if (isItemEditing(itemType, item.id)) {
      return `
        <article class="product-card product-card--editing${checkedClass}">
          ${renderItemEditForm(itemType, item)}
        </article>
      `;
    }

    const checkboxClass = item.checked ? " checkbox-icon--checked" : "";
    const checkboxMark = item.checked ? "✓" : "";
    const spotLabel = item.oneTime
      ? '<span class="item-label item-label--spot">今回だけ</span>'
      : "";

    return `
      <article
        class="product-card product-card--shopping${checkedClass}"
        data-shopping-item-id="${escapeHtml(item.id)}"
        role="button"
        tabindex="0"
        aria-pressed="${item.checked}"
      >
        <div class="product-card__content">
          <div class="product-card__main">
            <span class="checkbox-icon${checkboxClass}" aria-hidden="true">${checkboxMark}</span>
            <span class="product-card__name">${escapeHtml(item.name)}</span>
          </div>
          ${spotLabel}
        </div>
        ${renderItemActions(itemType, item)}
      </article>
    `;
  }

  const isSelected = variant === "selected";
  const isSpot = variant === "spot";
  const isFavorite = variant === "selected" || variant === "unselected";
  const itemType = isFavorite ? "favorite" : "history";
  const cardClass = isSpot
    ? ""
    : isSelected
      ? " product-card--selected"
      : " product-card--unselected";

  if (isItemEditing(itemType, item.id)) {
    return `
      <article class="product-card product-card--editing${cardClass}">
        ${renderItemEditForm(itemType, item)}
      </article>
    `;
  }

  const labelClass = isSpot
    ? "item-label--spot"
    : isSelected
      ? "item-label--selected"
      : "item-label--unselected";
  const labelText = isSpot ? "今回だけ" : isSelected ? "選択済" : "未選択";
  const favoriteAttributes = isFavorite
    ? ` data-favorite-id="${escapeHtml(item.id)}" role="button" tabindex="0" aria-pressed="${isSelected}"`
    : "";
  const favoriteClass = isFavorite ? " product-card--favorite" : "";

  return `
    <article class="product-card${favoriteClass}${cardClass}"${favoriteAttributes}>
      <div class="product-card__content">
        <span class="product-card__name">${escapeHtml(item.name)}</span>
        <span class="item-label ${labelClass}">${labelText}</span>
      </div>
      ${renderItemActions(itemType, item, { showPromote: isSpot })}
    </article>
  `;
}

function isItemMenuActive(itemType, itemId) {
  return (
    state.ui.activeMenu?.itemType === itemType &&
    state.ui.activeMenu?.itemId === itemId
  );
}

function isItemEditing(itemType, itemId) {
  return (
    state.ui.editingItem?.itemType === itemType &&
    state.ui.editingItem?.itemId === itemId
  );
}

function renderItemActions(itemType, item, options = {}) {
  const isMenuOpen = isItemMenuActive(itemType, item.id);
  const promoteButton = options.showPromote
    ? `
        <button
          class="history-promote-button"
          type="button"
          data-promote-history-id="${escapeHtml(item.id)}"
        >
          よく買うへ追加
        </button>
      `
    : "";

  return `
    <div class="product-card__actions">
      ${promoteButton}
      <button
        class="product-card__action product-card__action--more"
        type="button"
        aria-label="${escapeHtml(item.name)}のメニュー"
        aria-haspopup="menu"
        aria-expanded="${isMenuOpen}"
        data-menu-toggle-type="${itemType}"
        data-menu-toggle-id="${escapeHtml(item.id)}"
      >
        <span aria-hidden="true">…</span>
      </button>
      ${isMenuOpen ? renderItemMenu(itemType, item.id) : ""}
    </div>
  `;
}

function renderItemMenu(itemType, itemId) {
  return `
    <div class="item-menu" role="menu" data-item-menu>
      <button
        class="item-menu__button"
        type="button"
        role="menuitem"
        data-start-edit-type="${itemType}"
        data-start-edit-id="${escapeHtml(itemId)}"
      >
        商品名編集
      </button>
      <span class="item-menu__divider" aria-hidden="true"></span>
      <button
        class="item-menu__button"
        type="button"
        role="menuitem"
        data-menu-delete-type="${itemType}"
        data-menu-delete-id="${escapeHtml(itemId)}"
      >
        削除
      </button>
    </div>
  `;
}

function renderItemEditForm(itemType, item) {
  return `
    <form
      class="item-edit-form"
      data-edit-form
      data-edit-type="${itemType}"
      data-edit-id="${escapeHtml(item.id)}"
    >
      <input
        class="item-edit-form__input"
        type="text"
        value="${escapeHtml(item.name)}"
        aria-label="${escapeHtml(item.name)}の商品名を編集"
        autocomplete="off"
      />
      <button class="item-edit-form__button item-edit-form__button--save" type="submit">
        保存
      </button>
      <button class="item-edit-form__button" type="button" data-cancel-edit>
        キャンセル
      </button>
    </form>
  `;
}

function renderEmptyState() {
  return `
    <section class="empty-card" aria-labelledby="emptyStateTitle">
      <div class="empty-card__content">
        <img
          class="empty-card__icon"
          src="./assets/images/empty-list-icon.svg"
          alt=""
          width="120"
          height="120"
        />
        <div class="empty-card__text">
          <h2 id="emptyStateTitle" class="empty-card__title">買うものを追加しましょう</h2>
          <p class="empty-card__description">よく買う商品から選ぶか今回だけの商品を入力できます</p>
        </div>
      </div>
      <button class="empty-card__button" type="button" data-screen="favorite">よく買う商品一覧から選ぶ</button>
    </section>
  `;
}

function renderInputForm(title, placeholder, inputId, formType) {
  return `
    <form class="form-section" data-add-form="${formType}" aria-labelledby="${inputId}Title">
      <h2 id="${inputId}Title" class="section-title">${title}</h2>
      <div class="input-row">
        <input
          id="${inputId}"
          class="input-row__input"
          type="text"
          placeholder="${placeholder}"
          autocomplete="off"
        />
        <button class="input-row__button" type="submit" aria-label="${title}">＋</button>
      </div>
    </form>
  `;
}

function renderDialog() {
  const dialogRoot = document.querySelector("#dialogRoot");

  if (!state.ui.isCompleteDialogOpen) {
    dialogRoot.innerHTML = "";
    return;
  }

  dialogRoot.innerHTML = `
    <div class="dialog-overlay">
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completeDialogMessage"
      >
        <p id="completeDialogMessage" class="dialog__message">
          未チェック商品があります。<br />
          このまま買い物を完了させますか？
        </p>
        <div class="dialog__actions">
          <button class="dialog__button" type="button" data-cancel-complete>キャンセル</button>
          <button class="dialog__button dialog__button--complete" type="button" data-confirm-complete>完了する</button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
