import { Schema, model } from 'mongoose';

const IntegrationSchema = new Schema({
  notionToken: { type: String, required: true },
  taskTypeTable: { type: String, required: true },
  rulesTable: { type: String, required: true },
  taskTable: { type: String, required: true },
  calendar: { type: String },
});

export default model('Integration', IntegrationSchema);
