module.exports = {
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard
}

function allAccess(req, res) {
  res.status(200).send("Public Content.");
}

function userBoard(req, res) {
  res.status(200).send("User Content.");
}

function adminBoard(req, res) {
  res.status(200).send("Admin Content.");
}

function moderatorBoard(req, res) {
  res.status(200).send("Moderator Content.");
}
