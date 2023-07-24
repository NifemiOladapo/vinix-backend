// app.post("/api/register", async (req, res) => {
//   const { username, email, profilePicture } = req.body;

//   if (!username || !email) {
//     return res.json("input all the neccessary fields");
//   }

//   const usernameTaken = await User.findOne({ email });

//   if (usernameTaken) {
//     return res.status(400).json("This username has been taken. please change");
//   }

//   try {
//     const user = await User.create({
//       username,
//       email,
//       profilePicture,
//     });

//     if (user) {
//       res.status(200).json({
//         username: user.username,
//         email: user.email,
//         profilePicture: user.profilePicture,
//         createdOn: user.createdOn,
//         following: user.following,
//         followers: user.followers,
//         _id: user._id,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400).json("User not created");
//     }
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.json("input all the neccessary fields");
//   }

//   try {
//     const user = await User.findOne({ username, password });

//     if (user) {
//       res.status(200).json({
//         username: user.username,
//         email: user.email,
//         profilePicture: user.profilePicture,
//         createdOn: user.createdOn,
//         following: user.following,
//         followers: user.followers,
//         _id: user._id,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400).json("Could not find this account");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// });
