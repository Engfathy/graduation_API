import mongoose, { Document, Schema } from "mongoose";

export interface Picture {
    projectID: string;
    fileName: string;
    fileData: Buffer;
}

// Define interface for picture document
export interface PictureDocument extends Picture, Document {}

// Define schema for picture
const pictureSchema = new Schema<PictureDocument>({
    projectID: { type: String, required: true },
    fileName: { type: String, required: true },
    fileData: { type: Buffer, required: true },
});

// Create Mongoose model for picture
const PictureModel = mongoose.model<PictureDocument>("Picture", pictureSchema);
export default PictureModel;
