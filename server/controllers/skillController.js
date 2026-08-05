const SkillVerification = require('../models/SkillVerification');

// ── Call Groq API ────────────────────────────────────────────────
const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log('Groq raw response:', JSON.stringify(data).slice(0, 300));

  if (data.error) throw new Error('Groq error: ' + data.error.message);
  if (!data.choices || !data.choices[0]) throw new Error('No response from Groq: ' + JSON.stringify(data));

  return data.choices[0].message.content.trim();
};

// ── Parse JSON safely ────────────────────────────────────────────
const parseJSON = (text) => {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
};

// ── Generate challenge ───────────────────────────────────────────
const generateChallenge = async (skill) => {
  const prompt = `Generate a short coding challenge for a ${skill} developer. Return ONLY this JSON with no other text:
{"question":"write the challenge here","hint":"a small hint","exampleInput":"example or empty","exampleOutput":"expected output or empty"}`;

  const text = await callGroq(prompt);
  const parsed = parseJSON(text);
  if (parsed) return parsed;
  // Fallback if AI doesn't return JSON
  return { question: text, hint: 'Think carefully about the core concept', exampleInput: '', exampleOutput: '' };
};

// ── Evaluate answer ──────────────────────────────────────────────
const evaluateAnswer = async (skill, question, answer) => {
  const prompt = `You are evaluating a ${skill} coding challenge.
Question: ${question}
Answer submitted: ${answer}
Return ONLY this JSON with no other text:
{"passed":true,"score":85,"feedback":"Your evaluation here","correct_approach":"Ideal solution here"}
Set passed to true if the answer shows understanding, false if completely wrong or blank.`;

  const text = await callGroq(prompt);
  const parsed = parseJSON(text);
  if (parsed) return parsed;
  return { passed: false, score: 0, feedback: 'Could not evaluate. Please try again.', correct_approach: '' };
};

// ── POST /api/skills/challenge ────────────────────────────────────
const requestChallenge = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: 'Skill required' });

    const existing = await SkillVerification.findOne({
      freelancer: req.user.userId, skill, status: 'passed'
    });
    if (existing) return res.status(400).json({ error: `${skill} is already verified!` });

    console.log(`Generating ${skill} challenge for user ${req.user.userId}`);
    const challenge = await generateChallenge(skill);
    console.log('Challenge generated:', challenge.question?.slice(0, 50));

    await SkillVerification.findOneAndUpdate(
      { freelancer: req.user.userId, skill },
      { freelancer: req.user.userId, skill, status: 'pending', challenge: challenge.question, attemptCount: 0 },
      { upsert: true, new: true }
    );

    res.json({ challenge });
  } catch (e) {
    console.error('Challenge error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ── POST /api/skills/submit ───────────────────────────────────────
const submitAnswer = async (req, res) => {
  try {
    const { skill, answer } = req.body;
    if (!skill || !answer) return res.status(400).json({ error: 'Skill and answer required' });

    const verification = await SkillVerification.findOne({ freelancer: req.user.userId, skill });
    if (!verification) return res.status(404).json({ error: 'No active challenge. Request one first.' });
    if (verification.status === 'passed') return res.status(400).json({ error: 'Already verified!' });
    if (verification.attemptCount >= 3) return res.status(400).json({ error: 'Maximum 3 attempts reached.' });

    const evaluation = await evaluateAnswer(skill, verification.challenge, answer);

    verification.submittedAnswer = answer;
    verification.aiFeedback = evaluation.feedback;
    verification.attemptCount += 1;
    verification.status = evaluation.passed ? 'passed' : 'failed';
    if (evaluation.passed) verification.verifiedAt = new Date();
    await verification.save();

    res.json({
      passed: evaluation.passed,
      score: evaluation.score,
      feedback: evaluation.feedback,
      correctApproach: evaluation.correct_approach,
      attemptsLeft: 3 - verification.attemptCount,
      skill,
    });
  } catch (e) {
    console.error('Submit error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// ── GET /api/skills/verified/:freelancerId ────────────────────────
const getVerifiedSkills = async (req, res) => {
  try {
    const skills = await SkillVerification.find({ freelancer: req.params.freelancerId, status: 'passed' }).select('skill verifiedAt');
    res.json(skills);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── GET /api/skills/my ────────────────────────────────────────────
const getMySkills = async (req, res) => {
  try {
    const skills = await SkillVerification.find({ freelancer: req.user.userId }).select('skill status attemptCount verifiedAt aiFeedback');
    res.json(skills);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { requestChallenge, submitAnswer, getVerifiedSkills, getMySkills };
