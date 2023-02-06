const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    log: function(text) {
        const logDate = new Date();
        
        const [day, month, year, hour, minutes, seconds] = [
            logDate.getDate(),
            logDate.getMonth()+1,
            logDate.getFullYear(),
            logDate.getHours(),
            logDate.getMinutes(),
            logDate.getSeconds(),
          ];

        const logText = `[${day}-${month}-${year} ${hour}:${minutes}:${seconds}] ${text}\n`;

        const logFile = path.resolve(__dirname, `../AnimeNiLogs/${day}-${month}-${year}.txt`);
        const writer = fs.createWriteStream(logFile, {flags: 'a'});
        writer.write(logText);
    }
}