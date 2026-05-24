import {render, RenderPosition, remove} from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import {FilterType, UserAction, UpdateType} from '../const.js';
import {filter} from '../utils.js';
import TripInfoView from '../view/trip-info.js';
import SortView from '../view/sort.js';
import EventListView from '../view/event-list.js';
import ListEmptyView from '../view/list-empty.js';
import LoadingView from '../view/loading.js';
import PointPresenter from './point.js';
import NewPointPresenter from './new-point.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

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
  #loadingComponent = new LoadingView();
  #eventListComponent = new EventListView();

  #pointPresenters = new Map();
  #newPointPresenter = null;

  #isLoading = true;
  #isLoadError = false;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT,
  });

  constructor({tripMainContainer, tripEventsContainer, pointsModel, offersModel, destinationsModel, filterModel, newPointButton}) {
    this.#tripMainContainer = tripMainContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;
    this.#newPointButton = newPointButton;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    if (this.#newPointButton) {
      this.#newPointButton.disabled = true;
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

    this.#newPointPresenter?.init();
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

  #renderLoading() {
    render(this.#loadingComponent, this.#tripEventsContainer);
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
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

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
    this.#newPointPresenter?.destroy();

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
    this.#newPointPresenter?.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT: {
        const pointPresenter = this.#pointPresenters.get(update.id);
        pointPresenter?.setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch {
          pointPresenter?.setAborting();
        }
        break;
      }
      case UserAction.ADD_POINT:
        this.#newPointPresenter?.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch {
          this.#newPointPresenter?.setAborting();
        }
        break;
      case UserAction.DELETE_POINT: {
        const pointPresenter = this.#pointPresenters.get(update.id);
        pointPresenter?.setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch {
          pointPresenter?.setAborting();
        }
        break;
      }
    }

    this.#uiBlocker.unblock();
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
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#isLoadError = Boolean(data?.isError);
        remove(this.#loadingComponent);

        if (this.#isLoadError) {
          this.#renderTripInfo();
          this.#renderEmpty();
          return;
        }

        this.#newPointPresenter = new NewPointPresenter({
          pointListContainer: this.#eventListComponent.element,
          offers: this.#offersModel.offers,
          destinations: this.#destinationsModel.destinations,
          onDataChange: this.#handleViewAction,
          onDestroy: this.#handleNewPointFormClose,
        });

        if (this.#newPointButton) {
          this.#newPointButton.disabled = false;
        }
        this.#renderBoard();
        break;
    }
  };
}
