const router = require('express').Router()
const User = require('../models/User')
const verifyToken = require('../middleware/verify-token')

// GET /users/profile — get your own profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ err: 'User not found' })
    res.json(user) 
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

// PUT /users/profile — update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'seeker' && req.body.skills?.length > 0) {
      req.body.profileComplete = true
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      req.body,
      { new: true }
    )
    res.json(updatedUser)
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

module.exports = router
