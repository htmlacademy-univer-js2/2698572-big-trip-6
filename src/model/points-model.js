import Observable from '../framework/observable.js';
import {generatePoint, POINTS_COUNT} from '../mock/generate.js';

export default class PointsModel extends Observable {
  #points = Array.from({length: POINTS_COUNT}, generatePoint);

  get points() {
    return this.#points;
  }

  set points(points) {
    this.#points = points;
  }

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existing point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    const newPoint = {...update, id: crypto.randomUUID()};
    this.#points = [newPoint, ...this.#points];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete non-existing point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType);
  }
}
