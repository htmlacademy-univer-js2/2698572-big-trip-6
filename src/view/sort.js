import AbstractView from '../framework/view/abstract-view.js';
import {SortType, DISABLED_SORT_TYPES} from '../const.js';

function createSortItemTemplate(type, currentSortType) {
  const isDisabled = DISABLED_SORT_TYPES.includes(type);
  const isChecked = type === currentSortType;

  return `
    <div class="trip-sort__item  trip-sort__item--${type}">
      <input id="sort-${type}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${type}" data-sort-type="${type}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
      <label class="trip-sort__btn" for="sort-${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
  `;
}

function createSortTemplate(currentSortType) {
  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${Object.values(SortType).map((type) => createSortItemTemplate(type, currentSortType)).join('')}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;
    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (!sortType) {
      return;
    }

    this.#handleSortTypeChange(sortType);
  };
}
