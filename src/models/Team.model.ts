import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface ITeamModel{

    // functions
    findByName(name: string): ITeamDoc;
    getTeamName(id: ObjectId): ITeamDoc;
    getAllTeams(): any

}

// interface that describes the properties that the Doc has
interface ITeamDoc extends ITeamModel, mongoose.Document{

    name: string;
    description: string;
    code: string;

    slug: string;
    matches: Array<{ 
        league: mongoose.Schema.Types.ObjectId | any,
        playedAt: Date | number | any
    }>;
    leagues: Array<mongoose.Schema.Types.ObjectId | any>;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    findByName(name: string): ITeamDoc;
    getTeamName(id: ObjectId): ITeamDoc;
    getAllTeams(): any


}

const TeamSchema = new mongoose.Schema (

    {

        name: {
            type: String,
            required: [true, 'team name is required']
        },

        description: {
            type: String,
            maxlength: [300, 'description cannot be more than 100 characters']
        },

        code: {
            type: String,
        },

        slug: String,

        matches: [
            {
                league: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'League'
                },

                playedAt: {
                    type: mongoose.Schema.Types.Mixed
                }
            }
        ],

        leagues: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'League'
            }
        ],

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

TeamSchema.set('toJSON', { getters: true, virtuals: true });

TeamSchema.pre<ITeamDoc>('save', async function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
});

TeamSchema.statics.findByName = (roleName) => {
    return Team.findOne({name: roleName});
}

TeamSchema.statics.getTeamName = (roleId) => {
    return Team.findById(roleId);
}

TeamSchema.statics.getAllTeams = () => {
    return Team.find({});
}

// define the model constant
const Team = mongoose.model<ITeamDoc>('Team', TeamSchema);

export default Team;
