import mongoose from 'mongoose';

const usersCollection = 'users';

const usersSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    birthDate: { type: Date, required: true },
    password: { type: String, required: true },
})

const UsersModel = mongoose.model(usersCollection, usersSchema);

export default UsersModel;