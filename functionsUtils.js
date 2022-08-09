function getForm(req) {
    return new Promise((res, rej) => {
      let str = ''
      req.on('data', function (chunk) {
        str += chunk
      })
      req.on('end', function () {
        const obj = JSON.parse(str)
        res(obj)
      })
    })
}

module.exports = {getForm}
  