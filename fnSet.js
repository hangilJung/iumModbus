const schedule = require('node-schedule')
const logger = require('./src/config/logger')
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')

function run(placeList) {
    scheduleCycle(placeList)
    readSensorData(placeList)
    resetOneHourPrecipitation(placeList)
}

// function initialize() {
//     fsWrite('suncheonmanseupji', false)
//     fsWrite('jokokgyo', false)
//     fsWrite('yongdanggyo', false)
//     fsWrite('wonyongdanggyo', false)
// }

function fsWrite(place, param) {
    const status = fsRead()
    status[place] = param
    fs.writeFileSync(__dirname + '/connectionStatus.json', JSON.stringify(status))
}

function fsRead() {
    return JSON.parse(fs.readFileSync(__dirname + '/connectionStatus.json', 'utf8'))
}

function scheduleCycle(placeList) {
    schedule.scheduleJob('50 * * * * *', () => {
        logger.info(`connect 스케줄 실행`)
        detectConnection(placeList)
    })
}

async function detectConnection(placeList) {
    for (let i = 0; i < placeList.length; i++) {
        await placeList[i].objectName.close(() => {})
        placeList[i].objectName
            .connectTCP(placeList[i].host, { port: placeList[i].port })
            .then(() => {
                logger.info(`${placeList[i].placeName} connectTCP SUCCESS`)
                fsWrite(placeList[i].placeName, true)
                connectCount(placeList[i].placeName, 'success')
            })
            .catch(() => {
                logger.info(`${placeList[i].placeName} connectTCP FAILURE`)
                fsWrite(placeList[i].placeName, false)
                connectCount(placeList[i].placeName, 'fail')
            })
    }
}

function readSensorData(placeList) {
    schedule.scheduleJob('00 * * * * *', () => {
        for (let i = 0; i < placeList.length; i++) {
            placeList[i].objectName.readHoldingRegisters(100, 4, async (err, data) => {
                try {
                    logger.info(placeList[i].placeName + ' read connected')

                    if (err) {
                        logger.error(placeList[i].placeName + ' 에러 : ' + err)
                        logger.error(err)
                    }

                    const getSensorData = await data.data

                    logger.info(getSensorData)

                    const dataList = {
                        place_id: placeList[i].placeId,
                        precipitation: Number((getSensorData[0] * 0.1).toFixed(1)),
                        temperature: Number((getSensorData[1] * 0.1).toFixed(1)),
                        humidity: Number((getSensorData[2] * 0.1).toFixed(1)),
                        water_level: Number((getSensorData[3] * 0.001).toFixed(1)),
                    }

                    const apiServerResult = await axios.post(process.env.APISERVER_URL, { dataList })

                    logger.info(apiServerResult.data.header.resultMsg)
                } catch (error) {
                    fsWrite(placeList[i].placeName, false)
                    logger.error(placeList[i].placeName + ' catch 에러' + error)
                }
            })
        }
    })
}

function resetOneHourPrecipitation(placeList) {
    schedule.scheduleJob('00 00 * * * *', async () => {
        for (let i = 0; i < placeList.length; i++) {
            placeList[i].objectName.writeCoil(0, 1, (err, data) => {
                try {
                    logger.info(placeList[i].placeName + ` reset connected`)
                    if (err) {
                        fsWrite(placeList[i].placeName, false)
                        logger.error(`${placeList[i].placeName} reset error : `, err)
                    }
                } catch (error) {
                    fsWrite(placeList[i].placeName, false)
                    logger.error(`${placeList[i].placeName} reset error : `, error)
                }
            })
        }
    })
}

function connectCount(placeName, propKey) {
    const today = moment().format('YYYYMMDD')
    let readData = ReadCountFile()
    if (readData[today] === undefined) {
        writeNewDateCountFile()
        readData = ReadCountFile()
    }
    readData[today][placeName][propKey] += 1
    fs.writeFileSync('./count.json', JSON.stringify(readData))
}

function writeNewDateCountFile() {
    const readData = ReadCountFile()
    readData[moment().format('YYYYMMDD')] = {
        suncheonmanseupji: { success: 0, fail: 0 },
        jokokgyo: { success: 0, fail: 0 },
        yongdanggyo: { success: 0, fail: 0 },
        wonyongdanggyo: { success: 0, fail: 0 },
    }
    fs.writeFileSync('./count.json', JSON.stringify(readData))
}

function ReadCountFile() {
    return JSON.parse(fs.readFileSync('./count.json', 'utf8'))
}

module.exports = run
