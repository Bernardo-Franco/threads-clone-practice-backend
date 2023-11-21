import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookies } from '../utils/helpers/generateTokenAndSetCookies.js';
import mongoose from 'mongoose';

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: 'user already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hasshedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      username,
      password: hasshedPassword,
    });
    const savedNewUser = await newUser.save();
    if (savedNewUser) {
      generateTokenAndSetCookies(savedNewUser._id, res);
      return res.status(201).json({
        message: `new user: ${savedNewUser.username} created with the id: ${savedNewUser._id}`,
        id: savedNewUser._id,
        name: savedNewUser.name,
        email: savedNewUser.email,
        username: savedNewUser.username,
        bio: savedNewUser.bio,
        profilePicture: savedNewUser.profilePicture,
      });
    } else {
      return res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in signupUser: ', error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    let isPasswordCorrect;
    if (user) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({ error: 'Invalid login Info' });
    }
    if (!isPasswordCorrect)
      return res.status(400).json({ error: 'Invalid login Info' });

    generateTokenAndSetCookies(user._id, res);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('error in LoginUser: ', error.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: 'userLogged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('error in logoutUser: ', error.message);
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res.status(400).json({ error: 'You cannot follow yourself ' });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: 'User not found' });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // unfollow => Modify current user following array and modify the followers array of userToModify
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: 'user unfollowed successfully' });
    } else {
      // follow
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      res.status(200).json({ message: 'user followed successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('error in followUnfollowUser: ', error.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, profilePicture, bio } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (req.params.id !== userId.toString())
      return res
        .status(404)
        .json({ error: 'You cannot update other users profile' });
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hasshedPassword = await bcrypt.hash(password, salt);
      user.password = hasshedPassword;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    user.bio = bio || user.bio;

    user = await user.save();
    user.password = '';
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('error in updateUser: ', error.message);
  }
};

const getUserProfile = async (req, res) => {
  // it will search for the user profile with username or userId named as query
  const { query } = req.params;
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      // query is userId
      user = await User.findOne({ _id: query })
        .select('-password')
        .select('-updatedAt');
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select('-password')
        .select('-updatedAt');
    }
    if (!user) return res.status(404).json({ error: 'user not found' });
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('error in getUserProfile: ', error.message);
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
};
