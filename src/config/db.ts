import mongoose from 'mongoose';

function connect() {
    return mongoose.connect(`${process.env.DATABASE_URL}`)
    .then(() => {
        console.log('DB connected successfully');
    })
    .catch((error) => {
        console.error('DB connection error:', error);
    });
}

export default connect;
