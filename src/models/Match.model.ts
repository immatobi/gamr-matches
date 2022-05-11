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

    round: string;
    group: string;
    matchType: string;
    matchID: string;
    season: string;
    stage: string;
    dateOfPlay: Date | number | any;
    startTime: string | number | any;
    endTime: string | number | any;
    stadium: string;
    score: Array<{ team: mongoose.Schema.Types.ObjectId | any, count: number, type: string }>
    lineups: Array<{ team: mongoose.Schema.Types.ObjectId | any, players: Array<any>  }>
    stats: Array<{
        team: mongoose.Schema.Types.ObjectId | any,
        details: {
            shots: number;
            passes: number;
            passAccuracy: number;
            shotOnTarget: number;
            fouls: number;
            redCards: number;
            yellowCards: number;
            corner: number;
            cross: number;
            possession: number;
            offsides: number;

        }
    }>
    homeTeam: mongoose.Schema.Types.ObjectId | any;
    country: mongoose.Schema.Types.ObjectId | any;
    teams: Array<mongoose.Schema.Types.ObjectId | any>;
    fixture: mongoose.Schema.Types.ObjectId | any;
    league: mongoose.Schema.Types.ObjectId | any;

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

        round: {
            type: String
        },

        group: {
            type: String
        },

        matchType: {
            type: String,
            required: [true, 'match type is required'],
            enum: ['home', 'away']
        },

        matchID: {
            type: String,
            required: [true, 'match ID is required']
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
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'match start time is required']
        },

        endTime: {
            type: mongoose.Schema.Types.Mixed
        },

        stadium: {
            type: String
        },

        score: [
            {
                team: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Team"
                },

                type: {
                    type: String,
                    enum: ['ht', 'ft']
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
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Team"
                },
                details: {

                    shots: Number,
                    passes: Number,
                    passAccuracy: Number,
                    shotOnTarget: Number,
                    fouls: Number,
                    redCards: Number,
                    yellowCards: Number,
                    corner: Number,
                    cross: Number,
                    possession: Number,
                    offsides: Number,

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

        league: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'League'
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
