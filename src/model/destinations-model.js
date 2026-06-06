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
    } catch (err) {
      this.#destinations = [];
      throw err;
    }
  }

  getById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }
}
