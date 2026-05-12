function calculateMatch(user, job) {
  if (!user.skills?.length || !job.skillsRequired?.length) {
    return { matchScore: 0, matchedSkills: [], missingSkills: job.skillsRequired || [] }
  }
 
  const matchedSkills = user.skills.filter(s => job.skillsRequired.includes(s))
  const missingSkills = job.skillsRequired.filter(s => !user.skills.includes(s))
  const matchScore = Math.round((matchedSkills.length / job.skillsRequired.length) * 100)
 
  return { matchScore, matchedSkills, missingSkills }
}
 
module.exports = calculateMatch