import UserModel from '../models/user-model.js';

class UserService {
  async findById(id) {
    return await UserModel.findById(id);
  }

  async findByEmail(email) {
    return await UserModel.findOne({
      email: new RegExp('^' + email + '$', 'i'),
    });
  }

  async findByUsername(username) {
    return await UserModel.findOne({
      username: new RegExp('^' + username + '$', 'i'),
    });
  }

  async getAll() {
    return await UserModel.find(
      {},
      {
        _id: true,
        username: true,
        email: true,
        registrationDate: true,
        activationDate: true,
        role: true,
      }
    )
      .populate('role', ['name']);
  }

  async create(data, date) {
    const user = await UserModel.create(data);
    return { _id: user._id, date };
  }

  async update(id, data) {
    await UserModel.updateOne({ _id: id }, data);
  }

  async delete(_id) {
    await UserModel.deleteOne({ _id });
  }

  async clearRole(_id) {
    await UserModel.updateMany({ role: _id }, { role: null });
  }
}

export default new UserService();
