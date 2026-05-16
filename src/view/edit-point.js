import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {EVENT_TYPES} from '../const.js';

import 'flatpickr/dist/flatpickr.min.css';

const DATE_PICKER_FORMAT = 'd/m/y H:i';

function createTypeListTemplate(currentType) {
  return EVENT_TYPES.map((type) => `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${type === currentType ? 'checked' : ''}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
  `).join('');
}

function createDestinationListTemplate(destinations) {
  return destinations.map((dest) => `<option value="${dest.name}"></option>`).join('');
}

function createOffersTemplate(type, selectedOfferIds, allOffers) {
  const typeOffers = allOffers.find((o) => o.type === type)?.offers ?? [];

  if (typeOffers.length === 0) {
    return '';
  }

  return `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${typeOffers.map((offer) => `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" data-offer-id="${offer.id}" ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}>
            <label class="event__offer-label" for="event-offer-${offer.id}">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function createDestinationTemplate(destinationId, destinations) {
  const destination = destinations.find((d) => d.id === destinationId);

  if (!destination || (!destination.description && destination.pictures.length === 0)) {
    return '';
  }

  const picturesTemplate = destination.pictures.length > 0 ? `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${destination.pictures.map((pic) => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('')}
      </div>
    </div>
  ` : '';

  return `
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      ${destination.description ? `<p class="event__destination-description">${destination.description}</p>` : ''}
      ${picturesTemplate}
    </section>
  `;
}

function createEditPointTemplate(state, destinations, offers, isNewPoint) {
  const {type, destination: destinationId, dateFrom, dateTo, basePrice, offers: selectedOfferIds} = state;
  const destination = destinations.find((d) => d.id === destinationId);
  const destinationName = destination?.name ?? '';
  const typeName = type.charAt(0).toUpperCase() + type.slice(1);

  const offersTemplate = createOffersTemplate(type, selectedOfferIds, offers);
  const destinationTemplate = createDestinationTemplate(destinationId, destinations);
  const detailsTemplate = offersTemplate || destinationTemplate
    ? `<section class="event__details">${offersTemplate}${destinationTemplate}</section>`
    : '';

  const resetButtonText = isNewPoint ? 'Cancel' : 'Delete';
  const rollupButton = isNewPoint
    ? ''
    : `<button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>`;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createTypeListTemplate(type)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${typeName}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationListTemplate(destinations)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}" inputmode="numeric" pattern="\\d*">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${resetButtonText}</button>
          ${rollupButton}
        </header>
        ${detailsTemplate}
      </form>
    </li>`
  );
}

export default class EditPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #isNewPoint = false;
  #handleFormSubmit = null;
  #handleRollupClick = null;
  #handleDeleteClick = null;
  #datePickerFrom = null;
  #datePickerTo = null;

  constructor({point, destinations, offers, isNewPoint = false, onFormSubmit, onRollupClick, onDeleteClick}) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;
    this.#handleDeleteClick = onDeleteClick;

    this._setState(EditPointView.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state, this.#destinations, this.#offers, this.#isNewPoint);
  }

  reset(point) {
    this.updateElement(EditPointView.parsePointToState(point));
  }

  removeElement() {
    super.removeElement();
    this.#destroyDatePickers();
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#resetClickHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);

    if (!this.#isNewPoint) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);
    }

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offerChangeHandler);
    }

    this.#setupDatePickers();
  }

  #setupDatePickers() {
    this.#datePickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        dateFormat: DATE_PICKER_FORMAT,
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onClose: this.#dateFromChangeHandler,
      },
    );

    this.#datePickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        dateFormat: DATE_PICKER_FORMAT,
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onClose: this.#dateToChangeHandler,
      },
    );
  }

  #destroyDatePickers() {
    if (this.#datePickerFrom) {
      this.#datePickerFrom.destroy();
      this.#datePickerFrom = null;
    }
    if (this.#datePickerTo) {
      this.#datePickerTo.destroy();
      this.#datePickerTo = null;
    }
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditPointView.parseStateToPoint(this._state));
  };

  #typeChangeHandler = (evt) => {
    if (!evt.target.classList.contains('event__type-input')) {
      return;
    }

    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const destination = this.#destinations.find((d) => d.name === evt.target.value);

    if (!destination) {
      evt.target.value = this.#destinations.find((d) => d.id === this._state.destination)?.name ?? '';
      return;
    }

    this.updateElement({
      destination: destination.id,
    });
  };

  #offerChangeHandler = (evt) => {
    if (!evt.target.classList.contains('event__offer-checkbox')) {
      return;
    }

    const offerId = evt.target.dataset.offerId;
    const selectedOfferIds = evt.target.checked
      ? [...this._state.offers, offerId]
      : this._state.offers.filter((id) => id !== offerId);

    this._setState({offers: selectedOfferIds});
  };

  #priceInputHandler = (evt) => {
    const sanitized = evt.target.value.replace(/\D/g, '');
    evt.target.value = sanitized;
    this._setState({basePrice: Number(sanitized) || 0});
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({dateFrom: userDate.toISOString()});
    this.#datePickerTo.set('minDate', userDate);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({dateTo: userDate.toISOString()});
    this.#datePickerFrom.set('maxDate', userDate);
  };

  static parsePointToState(point) {
    return {...point};
  }

  static parseStateToPoint(state) {
    return {...state};
  }
}
