import { InferSchemaType, Schema, model } from "mongoose";

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    instructions:{
type: String,
required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    ingredients: {
      type: [{amount:String, ingredient: String}],
      required: true
    }
  },
  { timestamps: true }
);

type Recipe = InferSchemaType<typeof recipeSchema>;

export default model<Recipe>("Recipe", recipeSchema);
