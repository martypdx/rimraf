var rimraf = require("../oo-rimraf"),
    path = require("path")

rimraf(path.join(__dirname, "target"), function (er) {
  if (er) throw er
})