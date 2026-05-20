const router = require('express').Router()
const Job = require('../models/Job');
const User = require('../models/User');
const verifyToken = require('../middleware/verify-token');
const Application = require('../models/Application');
const calculateMatch = require('../utils/matchScore');


// Get all jobs
router.get('/', verifyToken, async (req, res) => {
    try {
        const allJobs = await Job.find()
            .populate({
                path: 'postedBy',
                select: 'title company'
            });

    // calculate match score and related metadata per job for the requesting user
    const user = await User.findById(req.user._id)

    const jobsWithMatch = []
    for (const job of allJobs) {
      const { matchScore, matchedSkills, missingSkills } = calculateMatch(user, job)
      const applyAlready = await Application.findOne({ job: job._id, applicant: req.user._id })
      jobsWithMatch.push({ ...job.toObject(), matchScore, matchedSkills, missingSkills, applyAlready: !!applyAlready })
    }

    res.status(200).json({ jobs: jobsWithMatch });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
    }
})

//CREATE A NEW JOB 
router.post('/', verifyToken, async (req, res) => {
  try {

    if (req.user.role !== 'employer') {
      return res.status(403).json({
        err: 'Job posting is only allowed for employers !'
      })
    }

     req.body.postedBy = req.user._id
     const employer = await User.findById(req.user._id)
     req.body.company = employer.company

    const createJob = await Job.create(req.body)
    res.status(201).json(createJob)
  } 

  catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

//GET A JOB BY ID
router.get('/:id', verifyToken, async(req, res)=>{
    try{
        const getJob = await Job.findById(req.params.id).populate('postedBy','username')
        if (!getJob) return res.status(404).json({ err: 'Job not found'})
         
        const user = await User.findById(req.user._id)
        const { matchScore, matchedSkills, missingSkills} = calculateMatch(user, getJob)
        
        const applyAlready = await Application.findOne({
            job: req.params.id,
            applicant: req.user._id
        })
        res.json({...getJob.toObject(),matchScore,matchedSkills, missingSkills, applyAlready: !!applyAlready
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})
// PUT edit a job — only the employer who posted it
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const foundJob = await Job.findById(req.params.id)
    if (!foundJob) return res.status(404).json({ err: 'Job not found' })

    if (!foundJob.postedBy.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized to edit this job' })
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedJob)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

// DELETE A JOB
router.delete('/:id', verifyToken, async(req, res)=>{
    try{
        const getJob = await Job.findById(req.params.id)
        if (!getJob) return res.status(404).json({ err:'Unauthorized to delete this job'})
        if (!getJob.postedBy.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized to delete this job' })
    }

    await Application.deleteMany({ job: req.params.id })
    await Job.findByIdAndDelete(req.params.id)
    res.json({ message: 'Job deleted' })
  
    }
     catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

// GET applicants for a job — employer only, ranked by match score
router.get('/:id/applicants', verifyToken, async (req, res) => {
  try {
    const foundJob = await Job.findById(req.params.id)
    if (!foundJob) return res.status(404).json({ err: 'Job not found' })

    if (!foundJob.postedBy.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized' })
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('applicant', 'username bio skills location')
      .sort({ matchScore: -1 })

    res.json(applications)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})


module.exports = router;