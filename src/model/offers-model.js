import {offers} from '../mock/offers.js';

export default class OffersModel {
  #offers = offers;

  get offers() {
    return this.#offers;
  }

  getByType(type) {
    return this.#offers.find((offer) => offer.type === type)?.offers ?? [];
  }
}
