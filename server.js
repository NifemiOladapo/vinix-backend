import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/userModel.js";
import generateToken from "./generateToken.js";
import protect from "./authMiddleware.js";
import Comment from "./models/commentModel.js";
import Post from "./models/postModel.js";

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("App is running");
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
});

app.post("/api/continuetoapp", async (req, res) => {
  const { username, email, profilePicture } = req.body;

  if (!username || !email) {
    return res.status(400).json("Input the neccessary field. Please");
  }

  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(200).json({
      eamil: findUser.email,
      username: findUser.username,
      profilePicture: findUser.profilePicture,
      _token: generateToken(findUser._id),
    });
  }
  const createdUser = await User.create({
    username,
    email,
    profilePicture,
  });
  if (createdUser) {
    return res.status(200).json({
      eamil: createdUser.email,
      username: createdUser.username,
      profilePicture: createdUser.profilePicture,
      _token: generateToken(createdUser._id),
    });
  }
});

app.delete("/api/closeaccount", protect, async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.loggeduser._id);
  if (deleted) {
    res.json(deleted);
  } else {
    res.json("could not delete account");
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author");

    if (posts) {
      res.status(200).json(posts);
    } else {
      res.status(400).json("could not fetch posts");
    }
  } catch (err) {
    console.log(err.messgae);
  }
});

app.post("/api/uploadpost", protect, async (req, res) => {
  const { description, video, isCommentable } = req.body;

  if (!video) {
    return res.json("Input Your video");
  }

  try {
    const post = await Post.create({
      author: req.loggeduser._id,
      description,
      video,
      isCommentable,
    }).then((post) => post.populate("author"));

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json("could not create this post");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/api/likepost", async (req, res) => {
  const post = await Post.findById(req.query.postId);
  if (post) {
    post.likes++;
    post.save();
    res.status(200).json(post);
  } else {
    res.status(400).json("post to like not found");
  }
});

app.put("/api/unlikepost", async (req, res) => {
  const post = await Post.findById(req.query.postId);
  if (post) {
    post.likes--;
    post.save();

    res.status(200).json(post);
  } else {
    res.status(400).json("post to unlike not found");
  }
});

app.put("/api/updatepost", protect, async (req, res) => {
  const { isCommentable, postId } = req.body;
  if (!postId || isCommentable === "" || isCommentable === null) {
    return res.status(400).json("Input the neccessary fields");
  }
  const postToUpdate = await Post.findById(postId).populate("author");
  if (postToUpdate.author._id.toString() !== req.loggeduser._id.toString()) {
    return res.status(400).json("You are not the author of this post");
  }
  const post = await Post.findByIdAndUpdate(
    postId,
    {
      isCommentable,
    },
    { new: true }
  );
  if (post) {
    res.status(200).json("Updated");
  } else {
    res.status(400).json("Not Updated");
  }
});

app.delete("/api/deletepost", protect, async (req, res) => {
  const postToDelete = await (
    await Post.findById(req.query.postId)
  ).populate("author");

  if (postToDelete.author._id.toString() !== req.loggeduser._id.toString()) {
    return res.status(400).json("You cant delete another user's post");
  }
  const deletePost = await Post.findByIdAndDelete(req.query.postId);
  if (deletePost) {
    res.status(200).json(deletePost);
    await Comment.deleteMany({ post: deletePost._id });
  } else {
    res.status(400).json("Could not delete post");
  }
});

app.get("/api/comments", async (req, res) => {
  const comments = await Comment.find({ post: req.query.postId })
    .populate("post")
    .populate("author");
  if (comments) {
    res.status(200).json(comments);
  } else {
    res.status(400).json("COuld not get comments");
  }
});

app.post("/api/uploadcomment", protect, async (req, res) => {
  const { postId, content } = req.body;

  if (!postId || !content) {
    return res.status(400).json("input all the neccessary fields");
  }

  const post = await Post.findById(postId);
  if (!post.isCommentable) {
    return res.json("The poster blocked commenting for this post");
  }

  const comment = await Comment.create({
    post: postId,
    content,
    author: req.loggeduser._id,
  })
    .then((comment) => comment.populate("author"))
    .then((comment) => comment.populate("post"));

  if (comment) {
    res.status(200).json(comment);
  } else {
    res.status(400).json("could not comment to this post");
  }
});

app.put("/api/likecomment", async (req, res) => {
  const comment = await Comment.findById(req.query.commentId);
  if (comment) {
    comment.likes++;
    comment.save();
    res.status(200).json(comment);
  } else {
    res.status(400).json("C0uld not like comment");
  }
});

app.put("/api/unlikecomment", async (req, res) => {
  const comment = await Comment.findById(req.query.commentId);
  if (comment) {
    comment.likes--;
    comment.save();
    res.status(200).json(comment);
  } else {
    res.status(400).json("C0uld not unlike comment");
  }
});

app.get("/api/getauserposts", async (req, res) => {
  const posts = await Post.find({ author: req.query.userId }).populate(
    "author",
    "-password"
  );
  if (posts) {
    res.status(200).json(posts);
  } else {
    res.status(400).json("Could not fetch videos");
  }
});

app.put("/api/followauser", protect, async (req, res) => {
  const { userId } = req.body;
  const usertoFollow = await User.findById(userId)
    .populate("following")
    .populate("followers");
  const checkIfAlreadyAFollower = usertoFollow.followers.find(
    (user) => user._id.toString() === req.loggeduser._id.toString()
  );
  if (checkIfAlreadyAFollower) {
    return res.status(400).json("You are already following this user");
  }
  await User.findByIdAndUpdate(
    userId,
    {
      $push: { followers: req.loggeduser._id },
    },
    { new: true }
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.loggeduser._id,
    {
      $push: { following: usertoFollow },
    },
    { new: true }
  )
    .populate("following")
    .populate("followers");
  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(400).json("COuld not perform request actions");
  }
});

app.put("/api/unfollowauser", protect, async (req, res) => {
  // const user = User.findById(req.body.userId);
  await User.findByIdAndUpdate(
    req.body.userId,
    {
      $pull: { followers: req.loggeduser._id },
    },
    { new: true }
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.loggeduser._id,
    {
      $pull: { following: req.body.userId },
    },
    { new: true }
  )
    .populate("following")
    .populate("followers");
  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(400).json("COuld not perorm requested action");
  }
});

app.listen(3001, () => {
  console.log("app is running");
});
