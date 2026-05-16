import {render, RenderPosition, remove} from '../framework/render.js';
import {FilterType, UserAction, UpdateType} from '../const.js';
import {filter} from '../utils.js';
import TripInfoView from '../view/trip-info.js';
import SortView from '../view/sort.js';
import EventListView from '../view/event-list.js';
import ListEmptyView from '../view/list-empty.js';
import PointPresenter from './point.js';
import NewPointPresenter from './new-point.js';

export default class BoardPresenter {
  #tripMainContainer = null;
  #tripEventsContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #filterModel = null;
  #newPointButton = null;

  #tripInfoComponent = null;
  #sortComponent = null;
  #listEmptyComponent = null;
  #eventListComponent = new EventListView();

  #pointPresenters = new Map();
  #newPointPresenter = null;

  constructor({tripMainContainer, tripEventsContainer, pointsModel, offersModel, destinationsModel, filterModel, newPointButton}) {
    this.#tripMainContainer = tripMainContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;
    this.#newPointButton = newPointButton;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#eventListComponent.element,
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointFormClose,
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    if (this.#newPointButton) {
      this.#newPointButton.addEventListener('click', this.#handleNewPointButtonClick);
    }
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    return filter[filterType](points);
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    if (this.#listEmptyComponent !== null) {
      remove(this.#listEmptyComponent);
      this.#listEmptyComponent = null;
      render(this.#eventListComponent, this.#tripEventsContainer);
    }

    this.#newPointPresenter.init();
    if (this.#newPointButton) {
      this.#newPointButton.disabled = true;
    }
  }

  #handleNewPointButtonClick = () => {
    this.createPoint();
  };

  #handleNewPointFormClose = () => {
    if (this.#newPointButton) {
      this.#newPointButton.disabled = false;
    }

    if (this.points.length === 0) {
      if (this.#eventListComponent.element.parentElement) {
        this.#eventListComponent.element.remove();
      }
      this.#renderEmpty();
    }
  };

  #renderTripInfo() {
    if (this.#tripInfoComponent) {
      return;
    }
    this.#tripInfoComponent = new TripInfoView();
    render(this.#tripInfoComponent, this.#tripMainContainer, RenderPosition.AFTERBEGIN);
  }

  #renderSort() {
    this.#sortComponent = new SortView();
    render(this.#sortComponent, this.#tripEventsContainer);
  }

  #renderEmpty() {
    this.#listEmptyComponent = new ListEmptyView({filterType: this.#filterModel.filter});
    render(this.#listEmptyComponent, this.#tripEventsContainer);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderBoard() {
    this.#renderTripInfo();

    const points = this.points;

    if (points.length === 0) {
      this.#renderEmpty();
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#tripEventsContainer);
    points.forEach((point) => this.#renderPoint(point));
  }

  #clearBoard() {
    this.#newPointPresenter.destroy();

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    this.#sortComponent = null;

    if (this.#listEmptyComponent) {
      remove(this.#listEmptyComponent);
      this.#listEmptyComponent = null;
    }

    if (this.#eventListComponent.element.parentElement) {
      this.#eventListComponent.element.remove();
    }
  }

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id)?.init(data);
        break;
      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
    }
  };
}
