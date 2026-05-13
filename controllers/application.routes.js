const router = require('express').Router()
const Application = require('../models/Application')
const Job = require('../models/Job')
const User = require('../models/User')
const verifyToken = require('../middleware/verify-token')
const calculateMatch = require('../utils/matchScore')


// POST /applications/:id/apply — seeker applies to a job - it creates a application

router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ err: 'Only seekers can apply' })
    }
 
    const foundJob = await Job.findById(req.params.id)
    if (!foundJob) {
        return res.status(404).json({ err: 'Job not found' })
    }
    if (!foundJob.isOpen) {
        return res.status(400).json({ err: 'This job is no longer open' })
    }
 
    const alreadyApplied = await Application.findOne({
      job: req.params.id,
      applicant: req.user._id
    })
    if (alreadyApplied) return res.status(409).json({ err: 'You already applied to this job' })
 
    const foundUser = await User.findById(req.user._id)
    const { matchScore } = calculateMatch(foundUser, foundJob)
 
    req.body.job = req.params.id
    req.body.applicant = req.user._id
    req.body.matchScore = matchScore
 
    const createdApplication = await Application.create(req.body)
    res.status(201).json(createdApplication)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})


// GET /applications/mine — seeker sees all their own applications

router.get('/mine', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ err: 'Only seekers have applications' })
    }
 
    const foundApplications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location jobType isOpen')
      .sort({ appliedAt: -1 })
 
    res.json(foundApplications)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})


// PUT /applications/:id/status — employer updates an applicant's status

 router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ err: 'Only employers can update status' })
    }
 
    const foundApplication = await Application.findById(req.params.id).populate('job')
    
    if (!foundApplication) {
        return res.status(404).json({ err: 'Application not found' })
    }
 
    if (!foundApplication.job.postedBy.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized' })
    }
 
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(updatedApplication)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})


// DELETE /applications/:id — seeker withdraws their own application

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const foundApplication = await Application.findById(req.params.id)
    if (!foundApplication) {
        return res.status(404).json({ err: 'Application not found' })
    }
 
    if (!foundApplication.applicant.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized to withdraw this application' })
    }
 
    await Application.findByIdAndDelete(req.params.id)
    res.json({ message: 'Application withdrawn' })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})



module.exports = router;