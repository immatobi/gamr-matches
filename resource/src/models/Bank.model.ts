import crypto from 'crypto';
import mongoose, { ObjectId } from 'mongoose';
import slugify from 'slugify';


interface IBankModel{

    findByCode(code: string): IBankDoc;
}

interface IBankDoc extends IBankModel, mongoose.Document {
    name: string;
    code: string;
    isEnabled: boolean;
    bankId: number;
    country: string;
    currency: string;
    type: string;
    slug: string;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // props
    findByCode(code: string): IBankDoc;
}

const BankSchema = new mongoose.Schema(

    {

        name:{
			type: String,
            required: [true, 'bank name is required'],
            unique: [true, 'bank name already exists']
		},

        code:{
			type: String,
            required: [true, 'bank code is required'],
            unique: [true, 'bank code already exists']
		},

        bankId:{
			type: Number,
            required: [true, 'bank id is required'],
            unique: [true, 'bank id already exists']
		},
		
		isEnabled: {
			type: Boolean,
            default: true
		},

        country:{
			type: String,
            required: [true, 'bank country is required'],
            default: 'Nigeria'
		},

        currency:{
			type: String,
            required: [true, 'bank currency is required'],
            default: 'NGN'
		},

        type:{
			type: String,
            required: [true, 'bank type is required'],
            enum: ['nuban'],
            default: 'nuban'
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

BankSchema.set('toJSON', {getters: true, virtuals: true});

// Encrypt password using bcrypt
BankSchema.pre<IBankDoc>('save', async function (next) {
    this.slug = slugify(this.name, { lower: true });
	next()
});

// define the model
const Bank = mongoose.model<IBankDoc>('Bank', BankSchema);

export default Bank;