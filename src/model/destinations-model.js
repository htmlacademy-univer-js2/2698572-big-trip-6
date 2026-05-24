export default class DestinationsModel {
  #pointsApiService = null;
  #destinations = [];

  constructor({pointsApiService}) {
    this.#pointsApiService = pointsApiService;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      this.#destinations = await this.#pointsApiService.destinations;
    } catch {
      this.#destinations = [];
    }
  }

  getById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }
}
