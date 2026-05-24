import {render, RenderPosition} from '../framework/render.js';
import {FilterType, SortType} from '../const.js';
import {generateFilters} from '../mock/filter.js';
import {updateItem, sort} from '../utils.js';
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
  #sortComponent = null;

  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

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
    this.#points = sort[SortType.DAY](this.#pointsModel.points);

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
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      onDataChange: this.#handleViewAction,
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
    this.#newPointPresenter.destroy();
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
