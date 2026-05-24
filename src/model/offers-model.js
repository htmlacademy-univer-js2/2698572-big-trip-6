export default class OffersModel {
  #pointsApiService = null;
  #offers = [];

  constructor({pointsApiService}) {
    this.#pointsApiService = pointsApiService;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      this.#offers = await this.#pointsApiService.offers;
    } catch {
      this.#offers = [];
    }
  }

  getByType(type) {
    return this.#offers.find((offer) => offer.type === type)?.offers ?? [];
  }
}
