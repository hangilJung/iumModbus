const app = require('../app')
const PORT = process.env.PORT || 3300
const logger = require('../src/config/logger')

app.listen(PORT, '0.0.0.0', () => {
    logger.info(`MODBUS SERVER 가동 ${PORT}`)
})
