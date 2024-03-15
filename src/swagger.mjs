import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your Project API",
      version: "1.0.0",
      description: "API documentation for Your Project",
    },
  },
  apis: ["./router/projectRouter.ts"], // Adjust the path to your router file
};

const specs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
