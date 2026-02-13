import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

smsLogSchema.index({ recipient: 1, month: 1 });

const SMSLog = mongoose.models.SMSLog || mongoose.model('SMSLog', smsLogSchema);

export default SMSLog;
