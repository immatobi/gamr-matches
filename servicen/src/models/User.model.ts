import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface IUserModel{

    // functions
    getAllUsers(): IUserDoc

}

// interface that describes the properties that the Doc has
interface IUserDoc extends IUserModel, mongoose.Document{

    firstName: string;
    lastName: string;
    userId: mongoose.Schema.Types.ObjectId;
    email: string;
    phoneNumber: string;
    userType: string;
    slug: string;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    getAllUsers(): IUserDoc


}

const UserSchema = new mongoose.Schema (

    {

        firstName: {
            type: String
        },

        lastName: {
            type: String
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'user id is required']
        },

        email: {
            type: String,
            required: [true, 'email is required']
        },

        phoneNumber: {
            type: String
        },

        userType: {
            type: String,
            required: [true, 'user type is required']
        },

        slug: String

    },

    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
            }
        }
    }

)

UserSchema.set('toJSON', { getters: true, virtuals: true });

UserSchema.pre<IUserDoc>('save', async function(next){
    this.slug = slugify(this.firstName, { lower: true });
    next();
});

UserSchema.statics.getAllUsers = () => {
    return User.find({});
}

// define the model constant
const User = mongoose.model<IUserDoc>('User', UserSchema);

export default User;
