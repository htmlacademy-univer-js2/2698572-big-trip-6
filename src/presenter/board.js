import {render, RenderPosition} from '../render.js';
import TripInfoView from '../view/trip-info.js';
import FilterView from '../view/filter.js';
import SortView from '../view/sort.js';
import EventListView from '../view/event-list.js';
import EditPointView from '../view/edit-point.js';
import EventPointView from '../view/event-point.js';

const POINT_COUNT = 3;

export default class BoardPresenter {
  #tripMainContainer = null;
  #filterContainer = null;
  #tripEventsContainer = null;
  #eventListComponent = new EventListView();

  constructor({tripMainContainer, filterContainer, tripEventsContainer}) {
    this.#tripMainContainer = tripMainContainer;
    this.#filterContainer = filterContainer;
    this.#tripEventsContainer = tripEventsContainer;
  }

  init() {
    render(new TripInfoView(), this.#tripMainContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView(), this.#filterContainer);
    render(new SortView(), this.#tripEventsContainer);
    render(this.#eventListComponent, this.#tripEventsContainer);

    render(new EditPointView(), this.#eventListComponent.getElement());

    for (let i = 0; i < POINT_COUNT; i++) {
      render(new EventPointView(), this.#eventListComponent.getElement());
    }
  }
}
