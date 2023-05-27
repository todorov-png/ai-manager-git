import { Schema, model } from 'mongoose';

const RoleSchema = new Schema({
  name: { type: String, unique: true, required: true },
  permissions: {
    createRole: { type: Boolean },
    assignRole: { type: Boolean },
    deleteRole: { type: Boolean },
    createUser: { type: Boolean },
    deleteUser: { type: Boolean },
  },
});

export default model('Role', RoleSchema);
