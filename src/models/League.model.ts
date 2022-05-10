import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface ILeagueModel{

    // functions
    findByName(name: string): ILeagueDoc;
    getLeagueName(id: ObjectId): ILeagueDoc;
    getAllLeagues(): any

}

// interface that describes the properties that the Doc has
interface ILeagueDoc extends ILeagueModel, mongoose.Document{

    name: string;
    description: string;
    slug: string;

    teams: Array<mongoose.Schema.Types.ObjectId | any>;
    matches: Array<mongoose.Schema.Types.ObjectId | any>;
    fixtures: Array<mongoose.Schema.Types.ObjectId | any>;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    findByName(name: string): ILeagueDoc;
    getLeagueName(id: ObjectId): ILeagueDoc;
    getAllLeagues(): any


}

const LeagueSchema = new mongoose.Schema (

    {

        name: {
            type: String,
            required: [true, 'please add a league name']
        },

        description: {
            type: String,
            maxlength: [300, 'description cannot be more than 100 characters']
        },

        slug: String,

        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
            }
        ],

        matches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Match'
            }
        ],

        fixtures: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Fixture'
            }
        ]

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

LeagueSchema.set('toJSON', { getters: true, virtuals: true });

LeagueSchema.pre<ILeagueDoc>('save', async function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
});

LeagueSchema.statics.findByName = (roleName) => {
    return League.findOne({name: roleName});
}

LeagueSchema.statics.getLeagueName = (roleId) => {
    return League.findById(roleId);
}

LeagueSchema.statics.getAllLeagues = () => {
    return League.find({});
}

// define the model constant
const League = mongoose.model<ILeagueDoc>('League', LeagueSchema);

export default League;
