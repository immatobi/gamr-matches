import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface IFixtureModel{

    // functions
    findByName(name: string): IFixtureDoc;
    getFixtureName(id: ObjectId): IFixtureDoc;
    getAllFixtures(): any

}

// interface that describes the properties that the Doc has
interface IFixtureDoc extends IFixtureModel, mongoose.Document{

    fixtureID: string;
    description: string;
    slug: string;

    matches: Array<mongoose.Schema.Types.ObjectId | any>;
    league: mongoose.Schema.Types.ObjectId | any;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    findByName(name: string): IFixtureDoc;
    getFixtureName(id: ObjectId): IFixtureDoc;
    getAllFixtures(): any


}

const FixtureSchema = new mongoose.Schema (

    {

        fixtureID: {
            type: String
        },

        description: {
            type: String,
            maxlength: [300, 'description cannot be more than 300 characters']
        },

        slug: String,

        matches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Match'
            }
        ],

        league: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'League'
        }

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

FixtureSchema.set('toJSON', { getters: true, virtuals: true });

FixtureSchema.pre<IFixtureDoc>('save', async function(next){
    this.slug = this.fixtureID;
    next();
});

FixtureSchema.statics.findByName = (roleName) => {
    return Fixture.findOne({name: roleName});
}

FixtureSchema.statics.getFixtureName = (roleId) => {
    return Fixture.findById(roleId);
}

FixtureSchema.statics.getAllFixtures = () => {
    return Fixture.find({});
}

// define the model constant
const Fixture = mongoose.model<IFixtureDoc>('Fixture', FixtureSchema);

export default Fixture;
