
import {InferSchemaType, Schema, model} from "mongoose"

const groceryItemSchema = new Schema({
    amount: {
        type: String,
        required: true
    },
    ingredient: {
        type: String,
        required: true,
    },
    
})


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
    type: Array,
    default: [],
},
groceryList:{
    type: [groceryItemSchema],
    default: []
},
})

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema)