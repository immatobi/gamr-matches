import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface IMatchModel{

    // functions
    findByName(name: string): IMatchDoc;
    getMatchName(id: ObjectId): IMatchDoc;
    getAllMatches(): any

}

// interface that describes the properties that the Doc has
interface IMatchDoc extends IMatchModel, mongoose.Document{

    matchType: string;
    season: string;
    stage: string;
    dateOfPlay: Date | number | any;
    startTime: string;
    endTime: string;
    stadium: string;
    score: Array<{ team: mongoose.Schema.Types.ObjectId | any, count: number }>
    lineups: Array<{ team: mongoose.Schema.Types.ObjectId | any, players: Array<any>  }>
    stats: Array<{
        team: mongoose.Schema.Types.ObjectId | any,
        details: {

            shots: string;
            passes: string;
            passAccuracy: string;
            shotOnTarget: string;
            fouls: string;
            redCards: string;
            yellowCards: string;
            corner: string;
            cross: string;
            possession: string;
            offsides: string;

        }
    }>
    homeTeam: mongoose.Schema.Types.ObjectId | any;
    country: mongoose.Schema.Types.ObjectId | any;
    teams: Array<mongoose.Schema.Types.ObjectId | any>;
    fixture: mongoose.Schema.Types.ObjectId | any;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    findByName(name: string): IMatchDoc;
    getMatchName(id: ObjectId): IMatchDoc;
    getAllMatchs(): any


}

const MatchSchema = new mongoose.Schema (

    {

        matchType: {
            type: String,
            required: [true, 'match type is required'],
            enum: ['home', 'away']
        },

        season: {
            type: String
        },

        stage: {
            type: String
        },

        dateOfPlay: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'match date of play is required']
        },

        startTime: {
            type: String,
            required: [true, 'match start time is required']
        },

        endTime: {
            type: String
        },

        stadium: {
            type: String
        },

        score: [
            {
                team: {
                    type: mongoose.Schema.Types.ObjectId
                },
                count: {
                    type: Number
                }
            }
        ],

        lineups: [
            {
                team: {
                    type: mongoose.Schema.Types.ObjectId
                },
                players: [
                    {
                        type: String
                    }
                ]
            }
        ],

        stats: [
            {
                team: {
                    type: mongoose.Schema.Types.ObjectId
                },
                details: {

                    shots: String,
                    passes: String,
                    passAccuracy: String,
                    shotOnTarget: String,
                    fouls: String,
                    redCards: String,
                    yellowCards: String,
                    corner: String,
                    cross: String,
                    possession: String,
                    offsides: String,

                }
            }
        ],

        homeTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },

        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country'
        },

        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
            }
        ],

        fixture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fixture'
        },
       

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

MatchSchema.set('toJSON', { getters: true, virtuals: true });

MatchSchema.pre<IMatchDoc>('save', async function(next){
    next();
});

MatchSchema.statics.findByName = (roleName) => {
    return Match.findOne({name: roleName});
}

MatchSchema.statics.getMatchName = (roleId) => {
    return Match.findById(roleId);
}

MatchSchema.statics.getAllMatches = () => {
    return Match.find({});
}

// define the model constant
const Match = mongoose.model<IMatchDoc>('Match', MatchSchema);

export default Match;
