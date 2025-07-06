import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  hours: {
    type: Number,
    required: [true, 'Hours is required'],
    min: [0.1, 'Minimum time log is 0.1 hours'],
    max: [24, 'Maximum time log is 24 hours per entry']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  billable: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
timeLogSchema.index({ user: 1, date: -1 });
timeLogSchema.index({ task: 1, date: -1 });
timeLogSchema.index({ project: 1, date: -1 });

export default mongoose.model('TimeLog', timeLogSchema);