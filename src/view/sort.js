import AbstractView from '../framework/view/abstract-view.js';
import {SortType} from '../const.js';

const SORT_ITEMS = [
  {type: SortType.DAY, label: 'Day', enabled: true},
  {type: SortType.EVENT, label: 'Event', enabled: false},
  {type: SortType.TIME, label: 'Time', enabled: true},
  {type: SortType.PRICE, label: 'Price', enabled: true},
  {type: SortType.OFFER, label: 'Offers', enabled: false},
];

function createSortItemTemplate({type, label, enabled}, currentSortType) {
  return (
    `<div class="trip-sort__item  trip-sort__item--${type}">
      <input id="sort-${type}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${type}" data-sort-type="${type}" ${type === currentSortType ? 'checked' : ''} ${enabled ? '' : 'disabled'}>
      <label class="trip-sort__btn" for="sort-${type}">${label}</label>
    </div>`
  );
}

function createSortTemplate(currentSortType) {
  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${SORT_ITEMS.map((item) => createSortItemTemplate(item, currentSortType)).join('')}
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
    if (!evt.target.classList.contains('trip-sort__input')) {
      return;
    }
    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
