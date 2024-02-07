const mongoose = require('mongoose');

const  ticketsCollection = "tickets";

const ticketSchema = new mongoose.Schema(
    {
        code:{ type: String, unique: true, required: true},
        amount: Number,
        purchaser: String
    },
    {
        timestamps:{
            updatedAt:
            'DateUltimateMod',
            createdAt:'DateOn'
        } 
        },
        {
            strict:false
        }
)

const ticketsModel = mongoose.model( ticketsCollection,  ticketSchema);

module.exports = ticketsModel;