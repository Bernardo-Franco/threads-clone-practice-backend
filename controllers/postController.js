import User from '../models/userModel.js';
import Post from '../models/postModel.js';

const createPost = async (req, res) => {
  try {
    const { postedBy, text, img } = req.body;
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: 'posted by and text fields are required' });
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: 'Unauthorized to create a post for another user' });
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'The post does not exist' });
    }
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized to delete the post' });
    }
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send({ error: 'post not found' });
    }

    if (post.postedBy.toString() === userId.toString()) {
      return res.status(400).send({ error: 'You can not like your own posts' });
    }

    const userLikedThePost = post.likes.includes(userId);

    if (userLikedThePost) {
      // unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.status(200).send({ message: 'post unliked successfully' });
    } else {
      // like the post
      post.likes.push(userId);
      post.save();
      return res.status(200).send({ message: 'post liked successfully' });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePicture;
    const username = req.user.username;

    if (!text) {
      return res.status(406).send({ error: 'text field is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ error: 'post not found' });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);

    await post.save();

    return res.status(200).send(reply);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(409).send({ error: 'user not found' });
    }

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    return res.status(200).json(feedPosts);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'user not found' });

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  const postId = req.params.postId;
  const { replyId } = req.body;

  try {
    await Post.updateOne(
      { _id: postId },
      {
        $pull: {
          replies: {
            _id: replyId,
          },
        },
      }
    );
    const updatedPost = await Post.findById(postId);
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  deleteReply,
};
