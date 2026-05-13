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

        res.status(200).json({ jobs: allJobs });
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

// DELETE A JOB
router.delete('/:id', verifyToken, async(req, res)=>{
    try{
        const getJob = await Job.findById(req.params.id)
        if (!getJob) return res.status(404).json({ err:'Unauthorized to delete this job'})
        if (!foundJob.postedBy.equals(req.user._id)) {
      return res.status(403).json({ err: 'Unauthorized to delete this job' })
    }

    await Application.deleteMany({ job: req.params.id })
    await Job.findByIdAndDelete(req.params.id)
    res.json({ message: 'Job deleted' })
  
    }
    catch{}
})


module.exports = router;