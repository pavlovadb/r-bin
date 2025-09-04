const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  request_body: {
    type: Object,
    required: true
  }
});

const Request = mongoose.model('Request', requestSchema);

// MongoDB connection configuration
const MONGO_URL = process.env.MONGO_URL


// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    throw error
  }
}

// Add request body to MongoDB
async function addRequestBody(requestBody) {
  try {
    const newRequest = new Request({
      request_body: requestBody
    });
    
    const savedRequest = await newRequest.save();
    return savedRequest; //console.log(savedRequest)
  } catch (error) {
    console.error('Error adding request body to MongoDB:');
    throw error;
  }
}

// Get request body by ID
async function getRequestBody(requestId) {
  try {
    const request = await Request.findById(requestId);
    return request;
  } catch (error) {
    console.error('Error reading request body from MongoDB:');
    throw error;
  }
}

// Delete request body by MongoDB ID
async function deleteRequestBody(requestId) {
  try {
    const deletedRequest = await Request.findByIdAndDelete(requestId);
    return deletedRequest;
  } catch (error) {
    console.error('Error deleting request body from MongoDB:');
    throw error;
  }
}

// Export all functions
module.exports = {
  // Connection functions
  connectToMongoDB,
  
  // CRUD operations
  addRequestBody,
  getRequestBody,
  deleteRequestBody
};
