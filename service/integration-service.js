import IntegrationModel from '../models/integration-model.js';

class IntegrationService {
  async findById(id) {
    return await IntegrationModel.findById(id);
  }

  async create(data) {
    return await IntegrationModel.create(data);
  }

  async update(id, data) {
    await IntegrationModel.updateOne({ _id: id }, data);
  }

  async delete(id) {
    await IntegrationModel.deleteOne({ _id: id });
  }

  async getAll() {
    return await IntegrationModel.find();
  }
}

export default new IntegrationService();
