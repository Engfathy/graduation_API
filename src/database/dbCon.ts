import mongoose from "mongoose";

class Db {
    static ConnectDb() {
        mongoose
            .connect(
                "mongodb+srv://iotcompany2:rVeYsy6vrbz7jiVG@iot.zkvyqzo.mongodb.net/?retryWrites=true&w=majority",
            )
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
