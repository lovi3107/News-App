const router = require('express').Router();
const User = require('../db/models/User');
const upload = require('../middlewares/multer');
const { isValidObjectId } = require('mongoose');
const { editUserValidator, validate } = require('../middlewares/validators');

// create a new user : Neil
router.post('/new', async (req, res) => {
	try {
		const { userId, username } = req.body;

		if (!userId) return res.status(404).json('User id is required');
		if (!username) return res.status(404).json('Username is required');

		const user = {
			userId,
			username,
		};

		const newUser = new User(user);

		await newUser.save();

		res.status(200).json({ user: newUser });
	} catch (error) {
		res.status(500).json(error);
	}
});

// fetch a single user : Sakshi
router.get("/:id", async (req, res) => {
	try {
	  const user = await User.findById(req.params.id);
	  res.status(200).json(user);
	}catch (err) {
	  res.status(500).json(err);
	}
});

// fetch a list of users : Sakshi
router.get("/", async (req, res) => {
	try {
	  let { limit = 10, search_q = "", page = 1, names = "" } = req.query;
	  page--;  
	  let nameArray = names.split(",").map((item)=>{
		  return new RegExp(item,"i")
	  });
  
	  let users;
	  let query = names?{
		username : {$in : nameArray}
	  }:{}
	  users = await User.find(query)
	  	.sort({ createdAt: -1 })
		.skip(parseInt(page) * parseInt(limit))
		.limit(parseInt(limit));	  
	  res.status(200).json({users});
	} catch (err) {
	  console.error(err);
	  res.status(500).json({error : err?.message});
	}
  });

// update user settings : Sakshi
router.put('/edit/:id', async (req, res) => {
	const id = req.params.id;

	if (!isValidObjectId(id))
		return res.status(401).json({ error: 'Invalid request!' });

	const user = await User.findById(id);

	if (!user) 
		return res.status(404).json({ error: 'User not found!' });

	try {
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{
				$set: req.body,
				updated: { at: Date.now(), by: id },
			},
			{ new: true }
		);
		editUserValidator,
		validate,
		res.status(200).json({ user : updatedUser });

	} catch (err) {
		console.error(err);
		res.status(500).json({ error : err?.message });
	}
});

module.exports = router;
