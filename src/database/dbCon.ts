import mongoose from "mongoose";


class Db {
    static ConnectDb() {
        mongoose
            .connect("mongodb://127.0.0.1:27017/IOT")
            .then((res) => {
                console.log(
                    "Database connected successfully..................",
                );
            })
            .catch((error) => {
                console.error(error);
            });
    }

}

export default Db;