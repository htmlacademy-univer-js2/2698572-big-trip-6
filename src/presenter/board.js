import {render, RenderPosition} from '../framework/render.js';
import {FilterType, SortType} from '../const.js';
import {generateFilters} from '../mock/filter.js';
import {updateItem, sort} from '../utils.js';
import TripInfoView from '../view/trip-info.js';
import FilterView from '../view/filter.js';
import SortView from '../view/sort.js';
import EventListView from '../view/event-list.js';
import ListEmptyView from '../view/list-empty.js';
import PointPresenter from './point.js';

export default class BoardPresenter {
  #tripMainContainer = null;
  #filterContainer = null;
  #tripEventsContainer = null;
  #pointsModel = null;
  #eventListComponent = new EventListView();
  #sortComponent = null;

  #points = [];
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor({tripMainContainer, filterContainer, tripEventsContainer, pointsModel}) {
    this.#tripMainContainer = tripMainContainer;
    this.#filterContainer = filterContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = sort[SortType.DAY](this.#pointsModel.points);

    render(new TripInfoView(), this.#tripMainContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView({filters: generateFilters(this.#points)}), this.#filterContainer);

    if (this.#points.length === 0) {
      render(new ListEmptyView({filterType: FilterType.EVERYTHING}), this.#tripEventsContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#tripEventsContainer);

    this.#renderPoints();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#tripEventsContainer);
  }

  #renderPoints() {
    this.#points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      offers: this.#pointsModel.offers,
      destinations: this.#pointsModel.destinations,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #sortPoints(sortType) {
    this.#points = sort[sortType](this.#pointsModel.points);
    this.#currentSortType = sortType;
  }

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#clearPoints();
    this.#renderPoints();
  };
}
