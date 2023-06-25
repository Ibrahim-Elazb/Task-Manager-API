// Comment Model
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    files: [{
        type: String
    }],
    writtenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment, commentSchema };
