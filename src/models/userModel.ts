
import {InferSchemaType, Schema, model} from "mongoose"

const userSchema = new Schema({
username: {
    type: String,
    required: true,
},
password: {
    type: String,
    required: true,
},
likedrecipes:{
    type: [String],
    default: []
},
grocerylist:{
    type: [String],
    default: []
},
})

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema)