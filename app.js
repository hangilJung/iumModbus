const express = require('express')
const app = express()
const ModbusRTU = require('modbus-serial')
const dotenv = require('dotenv')
const run = require('./fnSet')

dotenv.config()

num1 = new ModbusRTU()
num2 = new ModbusRTU()
num3 = new ModbusRTU()
num4 = new ModbusRTU()

const placeList = [
    {
        objectName: num1,
        host: process.env.NUM1_HOST,
        port: process.env.NUM1_PORT,
        placeId: process.env.NUM1_PLACE_ID,
        placeName: process.env.NUM1_PLACE_NAME,
    },
    {
        objectName: num2,
        host: process.env.NUM2_HOST,
        port: process.env.NUM2_PORT,
        placeId: process.env.NUM2_PLACE_ID,
        placeName: process.env.NUM2_PLACE_NAME,
    },
    {
        objectName: num3,
        host: process.env.NUM3_HOST,
        port: process.env.NUM3_PORT,
        placeId: process.env.NUM3_PLACE_ID,
        placeName: process.env.NUM3_PLACE_NAME,
    },
    {
        objectName: num4,
        host: process.env.NUM4_HOST,
        port: process.env.NUM4_PORT,
        placeId: process.env.NUM4_PLACE_ID,
        placeName: process.env.NUM4_PLACE_NAME,
    },
]

run(placeList)

module.exports = app
